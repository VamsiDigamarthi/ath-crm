import { prisma } from "../../config/db.js";
import { ApplicationStage, Role } from "@prisma/client";
import { normalizeVisaType } from "./admin-validator.js";

export interface LeadImportItem {
  firstName: string;
  middleName?: string | null;
  lastName: string;
  email?: string | null;
  phone: string;
  ssnTin?: string | null;
  dob?: string | null;
  occupation?: string | null;
  visaType?: string | null;
  maritalStatus?: string | null;
  filingType?: string;
  addressLine1?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
}

export interface BulkImportOptions {
  taxYear: number;
  leads: LeadImportItem[];
  adminUserId?: string;
}

export interface SkippedLeadItem {
  rowNumber: number;
  taxpayerName: string;
  email?: string | null;
  phone: string;
  ssnTin?: string | null;
  reason: string;
  reasonCategory: 'EXISTING_CONVERTED_CUSTOMER' | 'EXISTING_CUSTOMER_PROFILE' | 'EXISTING_USER_ACCOUNT' | 'DUPLICATE_APPLICATION' | 'IN_SHEET_DUPLICATE' | 'INVALID_DATA';
}

export interface BulkImportResult {
  totalReceived: number;
  validProcessed: number;
  newProfilesCreated: number;
  existingProfilesLinked: number;
  duplicatesSkipped: number;
  skippedLeads: SkippedLeadItem[];
  taxYear: number;
  processingTimeMs: number;
}

const BATCH_SIZE = 500;

export class LeadIngestionService {
  /**
   * High-Performance Bulk Lead Ingestion Engine
   * Processes large batches in transactional chunks with automatic
   * master customer deduplication and converted client protection.
   */
  public static async processBulkImport(options: BulkImportOptions): Promise<BulkImportResult> {
    const startTime = Date.now();
    const { taxYear, leads, adminUserId } = options;

    let newProfilesCreated = 0;
    let existingProfilesLinked = 0;
    let duplicatesSkipped = 0;
    let validProcessed = 0;
    const skippedLeads: SkippedLeadItem[] = [];

    const adminUser = adminUserId ? await prisma.user.findUnique({
      where: { id: adminUserId },
      select: { id: true, email: true, firstName: true, lastName: true, role: true }
    }) : null;
    const adminName = adminUser?.firstName 
      ? `${adminUser.firstName} ${adminUser.lastName || ''}`.trim() 
      : adminUser?.email || 'Operations Admin';

    // Map each lead with original row index for accurate tracking
    const rawIndexedLeads = leads.map((l, idx) => ({
      ...l,
      originalRowNumber: idx + 1,
    }));

    // Filter valid rows vs invalid format rows
    const cleanedLeads: typeof rawIndexedLeads = [];
    for (const l of rawIndexedLeads) {
      const isValid = Boolean(
        l &&
        l.firstName?.trim() && l.firstName.trim().length >= 2 &&
        l.lastName?.trim() && l.lastName.trim().length >= 2 &&
        l.phone?.trim() && l.phone.trim().length >= 7
      );

      if (!isValid) {
        duplicatesSkipped++;
        skippedLeads.push({
          rowNumber: l.originalRowNumber,
          taxpayerName: `${l.firstName || ''} ${l.lastName || ''}`.trim() || 'Incomplete Lead',
          email: l.email || null,
          phone: l.phone || '-',
          ssnTin: l.ssnTin || null,
          reason: 'Invalid Lead Record: First name, last name (min 2 chars), and phone number (min 7 digits) are strictly required.',
          reasonCategory: 'INVALID_DATA',
        });
      } else {
        cleanedLeads.push(l);
      }
    }

    // Process in chunks to prevent database memory spikes and locking
    for (let i = 0; i < cleanedLeads.length; i += BATCH_SIZE) {
      const chunk = cleanedLeads.slice(i, i + BATCH_SIZE);

      await prisma.$transaction(
        async (tx) => {
          // 1. Gather all SSNs, emails, and phones in this chunk
          const ssns = Array.from(
            new Set(
              chunk
                .map((l) => l.ssnTin?.trim())
                .filter((s): s is string => Boolean(s && s.length > 0))
            )
          );

          const emails = Array.from(
            new Set(
              chunk
                .map((l) => l.email?.trim().toLowerCase())
                .filter((e): e is string => Boolean(e && e.length > 0))
            )
          );

          const phones = Array.from(
            new Set(
              chunk
                .map((l) => l.phone.trim())
                .filter((p): p is string => Boolean(p && p.length > 0))
            )
          );

          // 2. Fetch existing customer profiles matching SSN, Email, or Phone
          const existingProfiles = await tx.customerProfile.findMany({
            where: {
              OR: [
                ...(ssns.length > 0 ? [{ ssnTin: { in: ssns } }] : []),
                ...(emails.length > 0 ? [{ email: { in: emails } }] : []),
                ...(phones.length > 0 ? [{ phone: { in: phones } }] : []),
              ],
            },
            include: {
              applications: {
                select: { id: true, taxYear: true, currentStage: true },
              },
              user: {
                select: { id: true, email: true, mobile: true, role: true },
              },
            },
          });

          // 3. Fetch existing User accounts matching email or mobile
          const existingUsers = await tx.user.findMany({
            where: {
              OR: [
                ...(emails.length > 0 ? [{ email: { in: emails } }] : []),
                ...(phones.length > 0 ? [{ mobile: { in: phones } }] : []),
              ],
            },
            select: { id: true, email: true, mobile: true, role: true, firstName: true, lastName: true },
          });

          // Build quick lookup maps
          const profileBySsn = new Map<string, typeof existingProfiles[0]>();
          const profileByEmail = new Map<string, typeof existingProfiles[0]>();
          const profileByPhone = new Map<string, typeof existingProfiles[0]>();

          for (const profile of existingProfiles) {
            if (profile.ssnTin) profileBySsn.set(profile.ssnTin, profile);
            if (profile.email) profileByEmail.set(profile.email.toLowerCase(), profile);
            if (profile.phone) profileByPhone.set(profile.phone, profile);
          }

          const userByEmail = new Map<string, typeof existingUsers[0]>();
          const userByPhone = new Map<string, typeof existingUsers[0]>();
          for (const u of existingUsers) {
            if (u.email) userByEmail.set(u.email.toLowerCase(), u);
            if (u.mobile) userByPhone.set(u.mobile, u);
          }

          // Track in-memory duplicates inside current chunk
          const seenSsnsInChunk = new Set<string>();
          const seenEmailsInChunk = new Set<string>();
          const seenPhonesInChunk = new Set<string>();

          for (const lead of chunk) {
            const ssn = lead.ssnTin?.trim() || null;
            const email = lead.email?.trim().toLowerCase() || null;
            const phone = lead.phone.trim();
            const firstName = lead.firstName.trim();
            const middleName = lead.middleName?.trim() || null;
            const lastName = lead.lastName.trim();
            const dob = lead.dob?.trim() || null;
            const occupation = lead.occupation?.trim() || null;
            const visaType = normalizeVisaType(lead.visaType) || lead.visaType?.trim() || null;
            const maritalStatus = lead.maritalStatus?.trim() || null;
            const filingType = lead.filingType?.trim() || "INDIVIDUAL";

            // In-chunk deduplication
            if (ssn && seenSsnsInChunk.has(ssn)) {
              duplicatesSkipped++;
              skippedLeads.push({
                rowNumber: lead.originalRowNumber,
                taxpayerName: `${firstName} ${lastName}`,
                email,
                phone,
                ssnTin: ssn,
                reason: `In-Sheet Duplicate: Another row in this upload sheet already has SSN/TIN (${ssn}).`,
                reasonCategory: 'IN_SHEET_DUPLICATE',
              });
              continue;
            }
            if (email && seenEmailsInChunk.has(email)) {
              duplicatesSkipped++;
              skippedLeads.push({
                rowNumber: lead.originalRowNumber,
                taxpayerName: `${firstName} ${lastName}`,
                email,
                phone,
                ssnTin: ssn,
                reason: `In-Sheet Duplicate: Another row in this upload sheet already has email (${email}).`,
                reasonCategory: 'IN_SHEET_DUPLICATE',
              });
              continue;
            }
            if (phone && seenPhonesInChunk.has(phone)) {
              duplicatesSkipped++;
              skippedLeads.push({
                rowNumber: lead.originalRowNumber,
                taxpayerName: `${firstName} ${lastName}`,
                email,
                phone,
                ssnTin: ssn,
                reason: `In-Sheet Duplicate: Another row in this upload sheet already has phone number (${phone}).`,
                reasonCategory: 'IN_SHEET_DUPLICATE',
              });
              continue;
            }

            if (ssn) seenSsnsInChunk.add(ssn);
            if (email) seenEmailsInChunk.add(email);
            if (phone) seenPhonesInChunk.add(phone);

            // Check if profile or user exists in database
            const matchedProfile = (ssn ? profileBySsn.get(ssn) : null) || (email ? profileByEmail.get(email) : null) || (phone ? profileByPhone.get(phone) : null);
            const matchedUser = (email ? userByEmail.get(email) : null) || (phone ? userByPhone.get(phone) : null);

            if (matchedProfile) {
              const convertedStages: ApplicationStage[] = [
                ApplicationStage.FILING_QUEUE,
                ApplicationStage.FILING_IN_PROGRESS,
                ApplicationStage.FILING_SUCCESS,
                ApplicationStage.FILING_FAILED,
              ];
              const isConverted =
                matchedProfile.isConvertedCustomer ||
                matchedProfile.applications.some((a) => convertedStages.includes(a.currentStage));

              const hasExistingAppForTaxYear = matchedProfile.applications.some(
                (app) => app.taxYear === taxYear
              );

              duplicatesSkipped++;

              if (isConverted) {
                skippedLeads.push({
                  rowNumber: lead.originalRowNumber,
                  taxpayerName: `${firstName} ${lastName}`,
                  email,
                  phone,
                  ssnTin: ssn,
                  reason: `Already Converted Customer: Taxpayer (${matchedProfile.firstName} ${matchedProfile.lastName}) is already a retained/paid client in the Converted Client Directory (${matchedProfile.email || matchedProfile.phone}). New account and lead creation blocked.`,
                  reasonCategory: 'EXISTING_CONVERTED_CUSTOMER',
                });
              } else if (hasExistingAppForTaxYear) {
                skippedLeads.push({
                  rowNumber: lead.originalRowNumber,
                  taxpayerName: `${firstName} ${lastName}`,
                  email,
                  phone,
                  ssnTin: ssn,
                  reason: `Duplicate Filing: Customer (${matchedProfile.firstName} ${matchedProfile.lastName}) already has an active Tax Year ${taxYear} return in the pipeline.`,
                  reasonCategory: 'DUPLICATE_APPLICATION',
                });
              } else {
                skippedLeads.push({
                  rowNumber: lead.originalRowNumber,
                  taxpayerName: `${firstName} ${lastName}`,
                  email,
                  phone,
                  ssnTin: ssn,
                  reason: `Existing Customer Profile: Master customer profile already on record for (${matchedProfile.firstName} ${matchedProfile.lastName}) with email/phone (${matchedProfile.email || matchedProfile.phone}). Duplicate raw prospect creation blocked.`,
                  reasonCategory: 'EXISTING_CUSTOMER_PROFILE',
                });
              }
              continue;
            }

            if (matchedUser) {
              duplicatesSkipped++;
              skippedLeads.push({
                rowNumber: lead.originalRowNumber,
                taxpayerName: `${firstName} ${lastName}`,
                email,
                phone,
                ssnTin: ssn,
                reason: `Existing User Account: A registered portal user account already exists for ${matchedUser.email || matchedUser.mobile} (${matchedUser.role}). Ingestion blocked.`,
                reasonCategory: 'EXISTING_USER_ACCOUNT',
              });
              continue;
            }

            // Net-new prospect -> Create CustomerProfile + TaxApplication
            const newProfile = await tx.customerProfile.create({
              data: {
                ssnTin: ssn,
                email,
                phone,
                firstName,
                middleName,
                lastName,
                dob,
                occupation,
                visaType,
                maritalStatus,
                addressLine1: lead.addressLine1?.trim() || null,
                city: lead.city?.trim() || null,
                state: lead.state?.trim() || null,
                zipCode: lead.zipCode?.trim() || null,
                isConvertedCustomer: false,
              },
            });

            // Add to lookup maps in case subsequent leads in same batch share identifiers
            if (ssn) profileBySsn.set(ssn, { ...newProfile, applications: [], user: null } as any);
            if (email) profileByEmail.set(email, { ...newProfile, applications: [], user: null } as any);
            if (phone) profileByPhone.set(phone, { ...newProfile, applications: [], user: null } as any);

            const newApp = await tx.taxApplication.create({
              data: {
                customerId: newProfile.id,
                taxYear,
                filingType,
                currentStage: ApplicationStage.RAW_PROSPECT,
              },
            });

            if (adminUserId) {
              await tx.stageHistory.create({
                data: {
                  applicationId: newApp.id,
                  fromStage: ApplicationStage.RAW_PROSPECT,
                  toStage: ApplicationStage.RAW_PROSPECT,
                  movedByUserId: adminUserId,
                  remarks: `Admin ${adminName} ingested raw prospect lead into TaxCRM Intake Pipeline for TY${taxYear} via Excel/CSV upload. Queued in Documenter Intake Pool at RAW_PROSPECT stage.`,
                },
              });
            }

            newProfilesCreated++;
            validProcessed++;
          }
        },
        {
          timeout: 30000, // 30s transaction timeout for heavy batches
        }
      );
    }

    const processingTimeMs = Date.now() - startTime;

    // Create persistent Notification in database targeted for Document Manager
    if (validProcessed > 0) {
      await prisma.notification.create({
        data: {
          targetRole: Role.DOC_MANAGER,
          title: `Admin Ingested ${validProcessed} New Leads (TY${taxYear})`,
          message: `Admin successfully uploaded ${validProcessed} new tax prospect leads (${newProfilesCreated} new profiles created, ${duplicatesSkipped} existing customer duplicates blocked). Intake queue ready for agent assignment.`,
          category: 'DOCUMENTER',
          priority: 'HIGH',
          actionUrl: '/documenter/manager/queue',
          actionLabel: 'View & Assign Queue',
        },
      });
    }

    return {
      totalReceived: leads.length,
      validProcessed,
      newProfilesCreated,
      existingProfilesLinked,
      duplicatesSkipped,
      skippedLeads,
      taxYear,
      processingTimeMs,
    };
  }
}
