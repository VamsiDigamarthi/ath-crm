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

export interface BulkImportResult {
  totalReceived: number;
  validProcessed: number;
  newProfilesCreated: number;
  existingProfilesLinked: number;
  duplicatesSkipped: number;
  taxYear: number;
  processingTimeMs: number;
}

const BATCH_SIZE = 500;

export class LeadIngestionService {
  /**
   * High-Performance Bulk Lead Ingestion Engine
   * Processes large batches (10k+ rows) in transactional chunks with automatic
   * master customer deduplication and multi-year tax application linking.
   */
  public static async processBulkImport(options: BulkImportOptions): Promise<BulkImportResult> {
    const startTime = Date.now();
    const { taxYear, leads, adminUserId } = options;

    let newProfilesCreated = 0;
    let existingProfilesLinked = 0;
    let duplicatesSkipped = 0;
    let validProcessed = 0;

    const adminUser = adminUserId ? await prisma.user.findUnique({
      where: { id: adminUserId },
      select: { id: true, email: true, firstName: true, lastName: true, role: true }
    }) : null;
    const adminName = adminUser?.firstName 
      ? `${adminUser.firstName} ${adminUser.lastName || ''}`.trim() 
      : adminUser?.email || 'Operations Admin';

    // Filter out invalid/empty rows (min 2 chars name, min 7 digits phone)
    const cleanedLeads = leads.filter(
      (l) => l && (l.firstName?.trim() && l.firstName.trim().length >= 2) &&
                  (l.lastName?.trim() && l.lastName.trim().length >= 2) &&
                  (l.phone?.trim() && l.phone.trim().length >= 7)
    );

    // Process in chunks to prevent database memory spikes and locking
    for (let i = 0; i < cleanedLeads.length; i += BATCH_SIZE) {
      const chunk = cleanedLeads.slice(i, i + BATCH_SIZE);

      await prisma.$transaction(
        async (tx) => {
          // 1. Gather all SSNs and emails in this chunk
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

          // 2. Fetch existing customer profiles matching SSN or Email in single query
          const existingProfiles = await tx.customerProfile.findMany({
            where: {
              OR: [
                ...(ssns.length > 0 ? [{ ssnTin: { in: ssns } }] : []),
                ...(emails.length > 0 ? [{ email: { in: emails } }] : []),
              ],
            },
            include: {
              applications: {
                where: { taxYear },
                select: { id: true, taxYear: true },
              },
            },
          });

          // Build quick lookup maps
          const profileBySsn = new Map<string, typeof existingProfiles[0]>();
          const profileByEmail = new Map<string, typeof existingProfiles[0]>();

          for (const profile of existingProfiles) {
            if (profile.ssnTin) profileBySsn.set(profile.ssnTin, profile);
            if (profile.email) profileByEmail.set(profile.email.toLowerCase(), profile);
          }

          // Track in-memory duplicates inside current chunk
          const seenSsnsInChunk = new Set<string>();
          const seenEmailsInChunk = new Set<string>();

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
              continue;
            }
            if (email && seenEmailsInChunk.has(email)) {
              duplicatesSkipped++;
              continue;
            }

            if (ssn) seenSsnsInChunk.add(ssn);
            if (email) seenEmailsInChunk.add(email);

            // Check if profile exists in database
            const matchedProfile = (ssn ? profileBySsn.get(ssn) : null) || (email ? profileByEmail.get(email) : null);

            if (matchedProfile) {
              // Existing master customer profile found!
              const hasExistingAppForTaxYear = matchedProfile.applications.some(
                (app) => app.taxYear === taxYear
              );

              if (hasExistingAppForTaxYear) {
                // Application already exists for this tax year -> Skip duplicate
                duplicatesSkipped++;
              } else {
                // Multi-Year retention! Link new TaxApplication for target tax year to existing profile
                const newApp = await tx.taxApplication.create({
                  data: {
                    customerId: matchedProfile.id,
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
                      remarks: `Ingested via Admin Bulk Excel/CSV Upload for Tax Year ${taxYear}. Linked to existing multi-year record (${matchedProfile.firstName} ${matchedProfile.lastName}). Queued in Documenter Intake Pool at RAW_PROSPECT stage.`,
                    },
                  });
                }

                existingProfilesLinked++;
                validProcessed++;
              }
            } else {
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
              if (ssn) profileBySsn.set(ssn, { ...newProfile, applications: [] } as any);
              if (email) profileByEmail.set(email, { ...newProfile, applications: [] } as any);

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
          message: `Admin successfully uploaded ${validProcessed} new tax prospect leads (${newProfilesCreated} new profiles, ${existingProfilesLinked} multi-year linked). Intake queue ready for agent assignment.`,
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
      taxYear,
      processingTimeMs,
    };
  }
}
