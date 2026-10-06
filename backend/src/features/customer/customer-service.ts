import { prisma } from '../../config/db.js';
import { ApplicationStage, ApplicationPriority, AuditActorType, AuditActionType, Role, NotificationCategory, NotificationPriority } from '@prisma/client';
import { NotFoundError } from '../../errors/not-found-error.js';
import { BadRequestError } from '../../errors/bad-request-error.js';
import { StorageService } from '../../utils/storage-service.js';
import { generateUniqueReferralCode } from '../../utils/referral.js';
import { sanitizeObject } from './customer-validator.js';

export class CustomerService {
  /**
   * Robust helper to reliably resolve a customer profile and active tax application.
   * Handles:
   * 1) Explicit leadId / applicationId / customerId (e.g. from staff workspace)
   * 2) userId lookup
   * 3) email fallback lookup & linking
   * 4) Staff fallback to recent application
   * 5) Taxpayer auto-profile creation
   * 6) Auto-creating tax application for requested taxYear if missing
   */
  static async resolveCustomerAndApp(
    userId: string,
    taxYearQuery?: string | number,
    leadId?: string,
    currentUser?: any,
    filingTypeQuery?: string
  ) {
    const selectedYear = taxYearQuery ? parseInt(String(taxYearQuery), 10) : 2025;
    const requestedFilingType = filingTypeQuery?.toUpperCase();

    // 1. If leadId is explicitly provided (e.g. from Staff workspace or query param)
    if (leadId) {
      // Check if leadId is a TaxApplication ID
      const app = await prisma.taxApplication.findUnique({
        where: { id: leadId },
        include: {
          customer: true,
          documents: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (app) {
        return { profile: app.customer, activeApp: app, selectedYear: app.taxYear };
      }

      // Check if leadId is a CustomerProfile ID
      const cust = await prisma.customerProfile.findUnique({
        where: { id: leadId },
        include: {
          applications: {
            include: {
              documents: {
                orderBy: { createdAt: 'desc' },
              },
            },
            orderBy: { taxYear: 'desc' },
          },
        },
      });

      if (cust) {
        let matchedApp = cust.applications.find(
          (a) => a.taxYear === selectedYear && (!requestedFilingType || a.filingType === requestedFilingType)
        ) || cust.applications.find((a) => a.taxYear === selectedYear) || cust.applications[0];

        if (!matchedApp) {
          matchedApp = await prisma.taxApplication.create({
            data: {
              customerId: cust.id,
              taxYear: selectedYear,
              currentStage: 'DOC_OUTREACH',
              filingType: requestedFilingType === 'BUSINESS' ? 'BUSINESS' : 'INDIVIDUAL',
            },
            include: {
              customer: true,
              documents: true,
            },
          });
        }
        return { profile: cust, activeApp: matchedApp, selectedYear };
      }
    }

    // 2. Lookup customer profile by userId
    let profile = await prisma.customerProfile.findFirst({
      where: { userId },
      include: {
        applications: {
          include: {
            documents: {
              orderBy: { createdAt: 'desc' },
            },
          },
          orderBy: { taxYear: 'desc' },
        },
      },
    });

    // 3. Fallback: Lookup by email if available
    if (!profile && currentUser?.email) {
      profile = await prisma.customerProfile.findFirst({
        where: { email: currentUser.email },
        include: {
          applications: {
            include: {
              documents: {
                orderBy: { createdAt: 'desc' },
              },
            },
            orderBy: { taxYear: 'desc' },
          },
        },
      });

      if (profile && !profile.userId) {
        await prisma.customerProfile.update({
          where: { id: profile.id },
          data: { userId },
        });
      }
    }

    // 4. Fallback for staff users who didn't pass leadId: find the most recent active application or lead
    const isStaff = currentUser?.role && currentUser.role !== 'TAXPAYER_USER' && currentUser.role !== 'CLIENT';
    if (!profile && isStaff) {
      const recentApp = await prisma.taxApplication.findFirst({
        orderBy: { updatedAt: 'desc' },
        include: {
          customer: true,
          documents: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (recentApp) {
        return { profile: recentApp.customer, activeApp: recentApp, selectedYear: recentApp.taxYear };
      }
    }

    // 5. If still no profile and user is a customer, auto-create customerProfile
    if (!profile) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      profile = await prisma.customerProfile.create({
        data: {
          userId,
          email: user?.email || currentUser?.email || `user_${userId}@athcrm.com`,
          firstName: user?.firstName || 'Taxpayer',
          lastName: user?.lastName || 'Client',
          phone: user?.mobile || '',
          visaType: 'OTHER',
          maritalStatus: 'SINGLE',
        },
        include: {
          applications: {
            include: {
              documents: {
                orderBy: { createdAt: 'desc' },
              },
            },
            orderBy: { taxYear: 'desc' },
          },
        },
      });
    }

    let activeApp = profile.applications.find(
      (a) => a.taxYear === selectedYear && (!requestedFilingType || a.filingType === requestedFilingType)
    ) || profile.applications.find((a) => a.taxYear === selectedYear);

    if (!activeApp) {
      activeApp = await prisma.taxApplication.create({
        data: {
          customerId: profile.id,
          taxYear: selectedYear,
          currentStage: 'DOC_OUTREACH',
          filingType: requestedFilingType === 'BUSINESS' ? 'BUSINESS' : 'INDIVIDUAL',
        },
        include: {
          customer: true,
          documents: true,
        },
      });
    }

    return { profile, activeApp, selectedYear };
  }

  /**
   * Get complete real-time dashboard data for logged in taxpayer user
   */
  static async getDashboard(userId: string, taxYearQuery?: string, leadId?: string, currentUser?: any) {
    // 1. Find customer profile linked to this user
    let profile = await prisma.customerProfile.findFirst({
      where: { userId },
      include: {
        applications: {
          include: {
            assignedDocAgent: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
            assignedPrepAgent: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
            assignedReviewAgent: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
            assignedSalesAgent: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
            assignedFileOp: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
            documents: {
              select: { id: true, fileName: true, documentCategory: true, verificationStatus: true, createdAt: true },
            },
            quotes: {
              select: { id: true, quoteAmount: true, discountAmount: true, status: true },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
          orderBy: { taxYear: 'desc' },
        },
      },
    });

    if (!profile && currentUser?.email) {
      profile = await prisma.customerProfile.findFirst({
        where: { email: currentUser.email },
        include: {
          applications: {
            include: {
              assignedDocAgent: { select: { id: true, firstName: true, lastName: true, email: true } },
              assignedPrepAgent: { select: { id: true, firstName: true, lastName: true, email: true } },
              assignedReviewAgent: { select: { id: true, firstName: true, lastName: true, email: true } },
              assignedSalesAgent: { select: { id: true, firstName: true, lastName: true, email: true } },
              assignedFileOp: { select: { id: true, firstName: true, lastName: true, email: true } },
              documents: { select: { id: true, fileName: true, documentCategory: true, verificationStatus: true, createdAt: true } },
              quotes: { select: { id: true, quoteAmount: true, discountAmount: true, status: true }, orderBy: { createdAt: 'desc' }, take: 1 },
            },
            orderBy: { taxYear: 'desc' },
          },
        },
      });
      if (profile && !profile.userId) {
        await prisma.customerProfile.update({
          where: { id: profile.id },
          data: { userId },
        });
      }
    }

    if (!profile) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      profile = await prisma.customerProfile.create({
        data: {
          userId,
          email: user?.email || currentUser?.email || `user_${userId}@athcrm.com`,
          firstName: user?.firstName || 'Taxpayer',
          lastName: user?.lastName || 'Client',
          phone: user?.mobile || '',
          visaType: 'OTHER',
          maritalStatus: 'SINGLE',
        },
        include: {
          applications: {
            include: {
              assignedDocAgent: { select: { id: true, firstName: true, lastName: true, email: true } },
              assignedPrepAgent: { select: { id: true, firstName: true, lastName: true, email: true } },
              assignedReviewAgent: { select: { id: true, firstName: true, lastName: true, email: true } },
              assignedSalesAgent: { select: { id: true, firstName: true, lastName: true, email: true } },
              assignedFileOp: { select: { id: true, firstName: true, lastName: true, email: true } },
              documents: { select: { id: true, fileName: true, documentCategory: true, verificationStatus: true, createdAt: true } },
              quotes: { select: { id: true, quoteAmount: true, discountAmount: true, status: true }, orderBy: { createdAt: 'desc' }, take: 1 },
            },
            orderBy: { taxYear: 'desc' },
          },
        },
      });
    }

    // Older profiles (created before referral codes existed) get one on first dashboard visit
    if (!profile.referralCode) {
      const referralCode = await generateUniqueReferralCode(profile.firstName);
      await prisma.customerProfile.update({ where: { id: profile.id }, data: { referralCode } });
      profile.referralCode = referralCode;
    }

    const selectedYear = taxYearQuery ? parseInt(taxYearQuery, 10) : 2025;
    let activeApp = profile.applications.find((a) => a.taxYear === selectedYear) || profile.applications[0];

    if (!activeApp) {
      return {
        taxpayer: {
          id: profile.id,
          name: `${profile.firstName} ${profile.lastName || ''}`.trim(),
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phone: profile.phone,
          ssnMasked: profile.ssnTin ? `•••-••-${profile.ssnTin.slice(-4)}` : '-',
          visaType: profile.visaType || '-',
          maritalStatus: profile.maritalStatus || '-',
          city: profile.city || '-',
          state: profile.state || '-',
          isConvertedCustomer: profile.isConvertedCustomer,
          referralCode: profile.referralCode,
        },
        application: null,
        refund: {
          fedRefund: 0,
          fedDue: 0,
          stateRefund: 0,
          stateDue: 0,
          totalRefund: 0,
          totalBalanceDue: 0,
          stateName: 'State Return',
          bankMasked: 'Direct Deposit',
          isDraft: true,
        },
        assignedTeam: {
          docAgent: { name: 'Assigned Documenter', email: 'support@taxcrm.com' },
          prepAgent: null,
          cpaReviewer: {
            name: 'Assigned Senior CPA Reviewer',
            credentials: 'IRS Enrolled Agent & Circular 230 Certified',
          },
        },
        stats: {
          docCount: 0,
          organizerPercent: 0,
          organizerVerifiedCount: 0,
          quoteAmount: 0,
          quoteStatus: profile.isConvertedCustomer ? 'PAID' : 'PENDING',
          activeFilingsCount: 0,
          completedFilingsCount: 0,
        },
        filings: [],
        availableTaxYears: [],
      };
    }

    // Parse draft summary
    const draft = (activeApp.taxDraftSummary as any) || {};

    // Calculate real numbers (refunds vs balance dues)
    const fedRefund = Number(draft.fedRefund ?? draft.federalRefund ?? draft.federalTaxRefund ?? 0);
    const fedDue = Number(draft.balanceDue ?? draft.federalBalanceDue ?? 0);
    const stateRefund = Number(draft.stateRefund ?? draft.stateTaxRefund ?? 0);
    const stateDue = Number(draft.stateBalanceDue ?? 0);
    const totalRefund = fedRefund + stateRefund;
    const totalBalanceDue = fedDue + stateDue;
    
    // Dynamic bank info
    const bankDetails = draft.organizer?.m9_directDeposit || {};
    const bankName = bankDetails.bankName || draft.bankName || 'Direct Deposit';
    const rawAccount = bankDetails.accountNumber || draft.accountNumber || '';
    const bankMasked = rawAccount
      ? `${bankName} (•••• ${rawAccount.slice(-4)})`
      : bankName;

    // Dynamic state label
    let stateName = 'State Return';
    const noStateTax = ['TX', 'WA', 'FL', 'NV', 'SD', 'WY', 'AK', 'TN', 'NH'];
    if (profile.state && noStateTax.includes(profile.state.toUpperCase())) {
      stateName = `${profile.state.toUpperCase()} (0% State Income Tax)`;
    } else if (profile.state) {
      stateName = `${profile.state.toUpperCase()} State Tax`;
    }

    // Dynamic organizer progress
    const submittedList = Array.isArray(draft.organizer?.submittedModules)
      ? draft.organizer.submittedModules
      : (draft.organizer?.m1_demographics?.firstName ? ['m1'] : (draft.organizerVerifiedCount ? ['m1'] : []));
    const organizerVerifiedCount = Math.max(submittedList.length, draft.organizerVerifiedCount || 0);
    const organizerPercent = Math.min(100, Math.round((organizerVerifiedCount / 9) * 100));

    const docCount = activeApp.documents?.length || 0;
    const latestQuote = activeApp.quotes?.[0];
    const quoteAmount = latestQuote ? Number(latestQuote.quoteAmount) - Number(latestQuote.discountAmount) : 0;
    const quoteStatus = latestQuote ? latestQuote.status : (profile.isConvertedCustomer ? 'PAID' : 'PENDING');

    const filings = profile.applications.map((app) => {
      const appDraft = (app.taxDraftSummary as any) || {};
      const aFedRefund = Number(appDraft.fedRefund ?? appDraft.federalRefund ?? appDraft.federalTaxRefund ?? 0);
      const aFedDue = Number(appDraft.balanceDue ?? appDraft.federalBalanceDue ?? 0);
      const aStateRefund = Number(appDraft.stateRefund ?? appDraft.stateTaxRefund ?? 0);
      const aStateDue = Number(appDraft.stateBalanceDue ?? 0);
      const aTotalRefund = aFedRefund + aStateRefund;
      const aTotalBalanceDue = aFedDue + aStateDue;
      
      const aSubmittedList = Array.isArray(appDraft.organizer?.submittedModules)
        ? appDraft.organizer.submittedModules
        : (appDraft.organizer?.m1_demographics?.firstName ? ['m1'] : (appDraft.organizerVerifiedCount ? ['m1'] : []));
      const aOrganizerPercent = Math.min(100, Math.round((Math.max(aSubmittedList.length, appDraft.organizerVerifiedCount || 0) / 9) * 100));

      const isCompleted = app.currentStage === 'FILING_SUCCESS';
      const isActive = !isCompleted && app.currentStage !== 'DROPPED_CANCELLED';

      const assignedDoc = app.assignedDocAgent ? `${app.assignedDocAgent.firstName} ${app.assignedDocAgent.lastName || ''}`.trim() : null;
      const assignedPrep = app.assignedPrepAgent ? `${app.assignedPrepAgent.firstName} ${app.assignedPrepAgent.lastName || ''}`.trim() : null;
      const assignedReview = app.assignedReviewAgent ? `${app.assignedReviewAgent.firstName} ${app.assignedReviewAgent.lastName || ''}`.trim() : null;
      const assignedSpecialist = assignedReview || assignedPrep || assignedDoc || 'Assigned Specialist';

      return {
        id: app.id,
        taxYear: app.taxYear,
        filingType: app.filingType,
        currentStage: app.currentStage,
        isCompleted,
        isActive,
        totalRefund: aTotalRefund,
        totalBalanceDue: aTotalBalanceDue,
        fedRefund: aFedRefund,
        fedDue: aFedDue,
        stateRefund: aStateRefund,
        stateDue: aStateDue,
        documentsCount: app.documents?.length || 0,
        organizerPercent: aOrganizerPercent,
        assignedSpecialist,
        updatedAt: app.updatedAt,
        createdAt: app.createdAt,
      };
    });

    const activeFilingsCount = filings.filter((f) => f.isActive).length;
    const completedFilingsCount = filings.filter((f) => f.isCompleted).length;

    return {
      taxpayer: {
        id: profile.id,
        name: `${profile.firstName} ${profile.lastName || ''}`.trim(),
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        ssnMasked: profile.ssnTin ? `•••-••-${profile.ssnTin.slice(-4)}` : '-',
        visaType: profile.visaType || '-',
        maritalStatus: profile.maritalStatus || '-',
        city: profile.city || '-',
        state: profile.state || '-',
        isConvertedCustomer: profile.isConvertedCustomer,
          referralCode: profile.referralCode,
      },
      application: {
        id: activeApp.id,
        taxYear: activeApp.taxYear,
        currentStage: activeApp.currentStage,
        filingType: activeApp.filingType,
      },
      refund: {
        fedRefund,
        fedDue,
        stateRefund,
        stateDue,
        totalRefund,
        totalBalanceDue,
        stateName,
        bankMasked,
        isDraft: activeApp.currentStage !== 'FILING_SUCCESS',
      },
      assignedTeam: {
        docAgent: activeApp.assignedDocAgent
          ? {
            name: `${activeApp.assignedDocAgent.firstName} ${activeApp.assignedDocAgent.lastName || ''}`.trim(),
            email: activeApp.assignedDocAgent.email,
          }
          : { name: 'Assigned Documenter', email: 'support@taxcrm.com' },
        prepAgent: activeApp.assignedPrepAgent
          ? {
            name: `${activeApp.assignedPrepAgent.firstName} ${activeApp.assignedPrepAgent.lastName || ''}`.trim(),
            email: activeApp.assignedPrepAgent.email,
          }
          : null,
        cpaReviewer: activeApp.assignedReviewAgent
          ? {
            name: `${activeApp.assignedReviewAgent.firstName} ${activeApp.assignedReviewAgent.lastName || ''}`.trim(),
            credentials: 'IRS Enrolled Agent & Circular 230 Certified',
          }
          : {
            name: 'Assigned Senior CPA Reviewer',
            credentials: 'IRS Enrolled Agent & Circular 230 Certified',
          },
      },
      stats: {
        docCount,
        organizerPercent,
        organizerVerifiedCount,
        quoteAmount,
        quoteStatus,
        activeFilingsCount,
        completedFilingsCount,
      },
      filings,
      availableTaxYears: profile.applications.map((a) => a.taxYear),
    };
  }

  /**
   * Get all uploaded documents for a taxpayer's specific tax year application
   */
  static async getDocuments(userId: string, taxYearQuery?: string, leadId?: string, currentUser?: any) {
    const { profile, activeApp, selectedYear } = await this.resolveCustomerAndApp(userId, taxYearQuery, leadId, currentUser);

    const docs = (activeApp.documents || []).map((doc: any) => ({
      id: doc.id,
      applicationId: doc.applicationId,
      fileName: doc.fileName,
      filePath: doc.filePath,
      documentCategory: doc.documentCategory,
      verificationStatus: doc.verificationStatus,
      createdAt: doc.createdAt,
      isUnlocked: true,
    }));

    return {
      taxYear: selectedYear,
      applicationId: activeApp.id,
      currentStage: activeApp.currentStage,
      isConvertedCustomer: profile.isConvertedCustomer,
          referralCode: profile.referralCode,
      documents: docs,
    };
  }

  /**
   * Upload a new tax document for the taxpayer's active application
   */
  static async uploadDocument(
    userId: string,
    file: Express.Multer.File,
    documentCategory: string,
    taxYearQuery?: string,
    leadId?: string,
    currentUser?: any
  ) {
    const { profile, activeApp, selectedYear } = await this.resolveCustomerAndApp(userId, taxYearQuery, leadId, currentUser);

    // Save file via Abstract Storage Service
    const storageResult = await StorageService.saveFile(file, `taxpayer_${profile.id}_ty${selectedYear}`);

    const isStaff = currentUser?.role && currentUser.role !== 'TAXPAYER_USER' && currentUser.role !== 'CLIENT';

    // Insert TaxDocument record
    const newDoc = await prisma.taxDocument.create({
      data: {
        applicationId: activeApp.id,
        uploadedByUserId: userId,
        fileName: file.originalname,
        filePath: storageResult.filePath,
        documentCategory: documentCategory || 'W2_WAGES',
        verificationStatus: isStaff ? 'VERIFIED' : 'PENDING',
      },
    });

    const categoryLabels: Record<string, string> = {
      W2_WAGES: 'W-2 Wages',
      FORM_1099: '1099 Interest/Div/Misc',
      FORM_1099_B: '1099-B Stock Trading',
      PASSPORT_VISA: 'Passport / Visa ID',
      FORM_1098_MORTGAGE: '1098 Mortgage Interest',
      FORM_1095_HEALTH: '1095 Health Coverage',
      OTHER_EXPENSES: 'Tax Deduction Receipts',
    };
    const catLabel = categoryLabels[newDoc.documentCategory] || newDoc.documentCategory;

    // Record AuditLog for Document Upload
    await prisma.auditLog.create({
      data: {
        applicationId: activeApp.id,
        actorId: userId,
        actorType: isStaff ? 'AGENT' : 'CLIENT',
        actorName: `${currentUser?.firstName || profile.firstName || ''} ${currentUser?.lastName || profile.lastName || ''}`.trim() || profile.email || 'Taxpayer Client',
        actorRole: currentUser?.role || 'TAXPAYER_USER',
        action: 'DOCUMENT_UPLOAD',
        moduleKey: 'DOCUMENT_VAULT',
        details: {
          documentId: newDoc.id,
          fileName: file.originalname,
          documentCategory: newDoc.documentCategory,
          categoryLabel: catLabel,
          fileSize: storageResult.fileSize,
          source: isStaff ? 'STAFF_WORKSPACE' : 'TAXPAYER_CLIENT_PORTAL',
          remarks: `${isStaff ? 'Staff' : 'Taxpayer'} uploaded document "${file.originalname}" (${catLabel}) to Document Vault.`,
          clientEmail: profile.email,
          clientName: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.email,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return {
      id: newDoc.id,
      fileName: newDoc.fileName,
      documentCategory: newDoc.documentCategory,
      verificationStatus: newDoc.verificationStatus,
      createdAt: newDoc.createdAt,
      fileSize: storageResult.fileSize,
      mimeType: storageResult.mimeType,
    };
  }

  /**
   * Delete an uploaded document (if pending review or staff action)
   */
  static async deleteDocument(userId: string, documentId: string, currentUser?: any) {
    const doc = await prisma.taxDocument.findUnique({
      where: { id: documentId },
      include: {
        application: {
          include: { customer: true },
        },
      },
    });

    if (!doc) {
      throw new NotFoundError('Document not found');
    }

    const isStaff = currentUser?.role && currentUser.role !== 'TAXPAYER_USER' && currentUser.role !== 'CLIENT';

    // Verify ownership or staff role
    if (!isStaff && doc.application.customer.userId !== userId && doc.uploadedByUserId !== userId) {
      throw new BadRequestError('You do not have permission to delete this document');
    }

    // Delete from storage if physical file
    if (!doc.filePath.startsWith('http://') && !doc.filePath.startsWith('https://')) {
      await StorageService.deleteFile(doc.filePath);
    }

    // Delete from DB
    await prisma.taxDocument.delete({
      where: { id: documentId },
    });

    // Record AuditLog for Document Deletion
    await prisma.auditLog.create({
      data: {
        applicationId: doc.applicationId,
        actorId: userId,
        actorType: isStaff ? 'AGENT' : 'CLIENT',
        actorName: `${currentUser?.firstName || doc.application.customer.firstName || ''} ${currentUser?.lastName || doc.application.customer.lastName || ''}`.trim() || doc.application.customer.email,
        actorRole: currentUser?.role || 'TAXPAYER_USER',
        action: 'DOCUMENT_DELETE',
        moduleKey: 'DOCUMENT_VAULT',
        details: {
          deletedFileName: doc.fileName,
          documentCategory: doc.documentCategory,
          source: isStaff ? 'STAFF_WORKSPACE' : 'TAXPAYER_CLIENT_PORTAL',
          remarks: `${isStaff ? 'Staff' : 'Taxpayer'} deleted document "${doc.fileName}" from Document Vault.`,
          clientEmail: doc.application.customer.email,
          clientName: `${doc.application.customer.firstName || ''} ${doc.application.customer.lastName || ''}`.trim() || doc.application.customer.email,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return { success: true, message: 'Document deleted successfully' };
  }

  /**
   * Upload an external Drive / Cloud link
   */
  static async uploadDriveLink(
    userId: string,
    payload: {
      linkUrl: string;
      title?: string;
      documentCategory?: string;
      remarks?: string;
      taxYear?: string | number;
      leadId?: string;
    },
    currentUser?: any
  ) {
    const { linkUrl, title, documentCategory, remarks, taxYear: taxYearQuery, leadId } = payload;
    if (!linkUrl || !linkUrl.trim()) {
      throw new BadRequestError('Drive link URL is required');
    }

    const trimmedUrl = linkUrl.trim();
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      throw new BadRequestError('Invalid URL. Drive link must begin with http:// or https://');
    }

    const { profile, activeApp } = await this.resolveCustomerAndApp(userId, taxYearQuery, leadId, currentUser);
    const isStaff = currentUser?.role && currentUser.role !== 'TAXPAYER_USER' && currentUser.role !== 'CLIENT';

    const categoryLabels: Record<string, string> = {
      W2_WAGES: 'W-2 Wages',
      FORM_1099: '1099 Interest/Div/Misc',
      '1099_INT': '1099-INT Interest',
      '1099_DIV': '1099-DIV Dividends',
      '1099_B': '1099-B Stocks',
      FORM_1099_B: '1099-B Stock Trading',
      '1098_MORTGAGE': '1098 Mortgage Interest',
      MORTGAGE_1098: '1098 Mortgage Interest',
      FBAR_FOREIGN: 'FBAR Indian Accounts',
      ID_PASSPORT_VISA: 'ID / Passport / Visa',
      PASSPORT_VISA: 'Passport / Visa ID',
      PREVIOUS_1040: 'Prior Year 1040',
      PRIOR_YEAR_RETURN: 'Prior Year 1040',
      FORM_1095_HEALTH: '1095 Health Coverage',
      OTHER_EXPENSES: 'Tax Deduction Receipts',
      GOOGLE_DRIVE_LINK: 'Google Drive / Cloud Folder',
      OTHER_DOCUMENT: 'Other Tax Form / Drive Link',
    };

    const cat = documentCategory || 'GOOGLE_DRIVE_LINK';
    const catLabel = categoryLabels[cat] || cat;
    let docTitle = (title && title.trim()) ? title.trim() : '';
    if (!docTitle) {
      if (cat === 'GOOGLE_DRIVE_LINK') {
        if (trimmedUrl.includes('onedrive') || trimmedUrl.includes('1drv.ms') || trimmedUrl.includes('sharepoint')) {
          docTitle = 'OneDrive Cloud Folder';
        } else if (trimmedUrl.includes('dropbox')) {
          docTitle = 'Dropbox Cloud Folder';
        } else if (trimmedUrl.includes('box.com')) {
          docTitle = 'Box Cloud Folder';
        } else {
          docTitle = 'Google Drive Folder';
        }
      } else {
        docTitle = `${catLabel} Link`;
      }
    }

    const newDoc = await prisma.taxDocument.create({
      data: {
        applicationId: activeApp.id,
        uploadedByUserId: userId,
        fileName: docTitle,
        filePath: trimmedUrl,
        documentCategory: cat,
        verificationStatus: isStaff ? 'VERIFIED' : 'PENDING',
      },
    });

    const actorName = `${currentUser?.firstName || profile.firstName || ''} ${currentUser?.lastName || profile.lastName || ''}`.trim() || profile.email || 'Taxpayer Client';

    // Record AuditLog
    await prisma.auditLog.create({
      data: {
        applicationId: activeApp.id,
        actorId: userId,
        actorType: isStaff ? 'AGENT' : 'CLIENT',
        actorName,
        actorRole: currentUser?.role || 'TAXPAYER_USER',
        action: 'DOCUMENT_UPLOAD',
        moduleKey: 'DOCUMENT_VAULT',
        details: {
          documentId: newDoc.id,
          fileName: newDoc.fileName,
          documentCategory: newDoc.documentCategory,
          categoryLabel: catLabel,
          linkUrl: trimmedUrl,
          isDriveLink: true,
          source: isStaff ? 'STAFF_WORKSPACE' : 'TAXPAYER_CLIENT_PORTAL',
          remarks: remarks?.trim() || `${isStaff ? 'Staff' : 'Taxpayer'} ${actorName} attached Drive Link "${newDoc.fileName}" to Document Vault.`,
          clientEmail: profile.email,
          clientName: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.email,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return {
      id: newDoc.id,
      fileName: newDoc.fileName,
      filePath: newDoc.filePath,
      documentCategory: newDoc.documentCategory,
      verificationStatus: newDoc.verificationStatus,
      createdAt: newDoc.createdAt.toISOString(),
      isDriveLink: true,
    };
  }

  /**
   * Upload multiple tax documents simultaneously
   */
  static async uploadMultipleDocuments(
    userId: string,
    files: Express.Multer.File[],
    categoriesMap: Record<string, string> | string,
    taxYearQuery?: string,
    leadId?: string,
    currentUser?: any
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestError('No files were uploaded');
    }

    const { profile, activeApp, selectedYear } = await this.resolveCustomerAndApp(userId, taxYearQuery, leadId, currentUser);

    let parsedCategories: Record<string, string> = {};
    if (typeof categoriesMap === 'string') {
      try {
        parsedCategories = JSON.parse(categoriesMap);
      } catch {
        parsedCategories = {};
      }
    } else if (categoriesMap && typeof categoriesMap === 'object') {
      parsedCategories = categoriesMap;
    }

    const isStaff = currentUser?.role && currentUser.role !== 'TAXPAYER_USER' && currentUser.role !== 'CLIENT';
    const clientName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.email || 'Taxpayer Client';
    const uploadedDocs = [];

    for (const file of files) {
      const storageResult = await StorageService.saveFile(file, `taxpayer_${profile.id}_ty${selectedYear}`);
      const category = parsedCategories[file.originalname] || 'W2_WAGES';

      const newDoc = await prisma.taxDocument.create({
        data: {
          applicationId: activeApp.id,
          uploadedByUserId: userId,
          fileName: file.originalname,
          filePath: storageResult.filePath,
          documentCategory: category,
          verificationStatus: isStaff ? 'VERIFIED' : 'PENDING',
        },
      });

      await prisma.auditLog.create({
        data: {
          applicationId: activeApp.id,
          actorId: userId,
          actorType: isStaff ? 'AGENT' : 'CLIENT',
          actorName: `${currentUser?.firstName || profile.firstName || ''} ${currentUser?.lastName || profile.lastName || ''}`.trim() || clientName,
          actorRole: currentUser?.role || 'TAXPAYER_USER',
          action: 'DOCUMENT_UPLOAD',
          moduleKey: 'DOCUMENT_VAULT',
          details: {
            documentId: newDoc.id,
            fileName: file.originalname,
            documentCategory: category,
            fileSize: storageResult.fileSize,
            source: isStaff ? 'STAFF_WORKSPACE' : 'TAXPAYER_CLIENT_PORTAL',
            remarks: `${isStaff ? 'Staff' : 'Taxpayer'} uploaded document "${file.originalname}" (${category}) via batch upload.`,
            clientEmail: profile.email,
            clientName,
            timestamp: new Date().toISOString(),
          },
        },
      });

      uploadedDocs.push({
        id: newDoc.id,
        fileName: newDoc.fileName,
        filePath: newDoc.filePath,
        documentCategory: newDoc.documentCategory,
        verificationStatus: newDoc.verificationStatus,
        createdAt: newDoc.createdAt.toISOString(),
        fileSize: storageResult.fileSize,
        mimeType: storageResult.mimeType,
      });
    }

    return uploadedDocs;
  }

  /**
   * Get document file path for download
   */
  static async getDocumentDownloadInfo(userId: string, documentId: string, currentUser?: any) {
    const doc = await prisma.taxDocument.findUnique({
      where: { id: documentId },
      include: {
        application: {
          include: { customer: true },
        },
      },
    });

    if (!doc) {
      throw new NotFoundError('Document not found');
    }

    const isStaff = currentUser?.role && currentUser.role !== 'TAXPAYER_USER' && currentUser.role !== 'CLIENT';

    if (!isStaff && doc.application.customer.userId !== userId && doc.uploadedByUserId !== userId) {
      throw new BadRequestError('Unauthorized document access');
    }

    // Check if external cloud / drive link
    if (doc.filePath?.startsWith('http://') || doc.filePath?.startsWith('https://')) {
      return {
        isExternalLink: true,
        url: doc.filePath,
        fileName: doc.fileName,
      };
    }

    const absolutePath = StorageService.getAbsoluteFilePath(doc.filePath);
    if (!StorageService.fileExists(doc.filePath)) {
      throw new NotFoundError('Physical file not found on storage server');
    }

    return {
      isExternalLink: false,
      absolutePath,
      fileName: doc.fileName,
    };
  }

  /**
   * Get 9-Module Organizer data for active tax return
   */
  static async getOrganizer(userId: string, taxYearQuery?: string, leadId?: string, currentUser?: any, filingTypeQuery?: string) {
    const { profile, activeApp } = await this.resolveCustomerAndApp(userId, taxYearQuery, leadId, currentUser, filingTypeQuery);

    const user = profile.userId ? await prisma.user.findUnique({ where: { id: profile.userId } }) : null;
    const draft = (activeApp.taxDraftSummary as any) || {};
    const organizer = draft.organizer || {};
    const m1Saved = organizer.m1_demographics || {};
    const isBusiness = activeApp.filingType === 'BUSINESS' || filingTypeQuery?.toUpperCase() === 'BUSINESS';

    const firstName = m1Saved.firstName || profile.firstName || user?.firstName || '';
    const middleName = m1Saved.middleName !== undefined ? m1Saved.middleName : (profile.middleName || '');
    const lastName = m1Saved.lastName || profile.lastName || user?.lastName || '';
    const fullName = m1Saved.fullName || [firstName, middleName, lastName].filter(Boolean).join(' ');
    const email = m1Saved.email || profile.email || user?.email || '';
    const phone = m1Saved.phone || profile.phone || user?.mobile || '';

    // Strictly load submittedModules from saved draft
    const submittedModules: string[] = Array.isArray(organizer.submittedModules)
      ? organizer.submittedModules
      : (isBusiness ? ['b1_companyInfo'] : (m1Saved.firstName || profile.firstName ? ['m1'] : []));

    // Real customer data from CustomerProfile and saved TaxDraftSummary
    const defaultOrganizer = {
      submittedModules,
      b1_companyInfo: organizer.b1_companyInfo || {
        companyName: '',
        ein: '',
        formationDate: '',
        businessStructure: 'LLC',
        businessActivity: '',
        naicsCode: '',
        addressLine1: profile.addressLine1 || '',
        city: profile.city || '',
        state: profile.state || '',
        zipCode: profile.zipCode || '',
        hasPartners: false,
        partners: [],
      },
      b2_businessIncome: organizer.b2_businessIncome || {
        grossReceipts: 0,
        returnsAllowances: 0,
        otherIncome: 0,
        incomeSourcesList: [],
      },
      b3_businessExpenses: organizer.b3_businessExpenses || {
        advertising: 0,
        carAndTruck: 0,
        commissions: 0,
        contractLabor: 0,
        depletion: 0,
        employeeBenefits: 0,
        insurance: 0,
        legalAndProfessional: 0,
        officeExpense: 0,
        rentLease: 0,
        repairsMaintenance: 0,
        supplies: 0,
        taxesLicenses: 0,
        travel: 0,
        meals: 0,
        utilities: 0,
        wages: 0,
        otherExpenses: 0,
        cogsBeginningInventory: 0,
        cogsPurchases: 0,
        cogsCostOfLabor: 0,
        cogsMaterialsSupplies: 0,
        cogsOtherCosts: 0,
        cogsEndingInventory: 0,
      },
      m1_demographics: {
        firstName,
        middleName,
        lastName,
        fullName,
        ssnMasked: m1Saved.ssnMasked || profile.ssnTin || '',
        dob: m1Saved.dob || profile.dob || '',
        occupation: m1Saved.occupation || profile.occupation || '',
        phone,
        workPhone: m1Saved.workPhone || '',
        email,
        relationshipToPrimary: m1Saved.relationshipToPrimary || 'SELF',
        visaType: m1Saved.visaType || profile.visaType || '',
        visaStatusChanged2025: m1Saved.visaStatusChanged2025 || 'NO',
        previousVisaType: m1Saved.previousVisaType || '',
        newVisaType: m1Saved.newVisaType || '',
        visaChangeDate: m1Saved.visaChangeDate || '',
        visaStatusChangeReason: m1Saved.visaStatusChangeReason || '',
        firstPortOfEntryDate: m1Saved.firstPortOfEntryDate || '',
        stayMoreThan6Months2026: m1Saved.stayMoreThan6Months2026 || '',
        monthsStayedInUs2025: m1Saved.monthsStayedInUs2025 !== undefined ? m1Saved.monthsStayedInUs2025 : undefined,
        maritalStatus: m1Saved.maritalStatus || (profile.maritalStatus === 'Married' ? 'Married Filing Jointly' : (profile.maritalStatus || '')),
        dateOfMarriage: m1Saved.dateOfMarriage || '',
        spouseDateOfDeath: m1Saved.spouseDateOfDeath || '',
        residentialAddress: m1Saved.residentialAddress || profile.addressLine1 || '',
        city: m1Saved.city || profile.city || '',
        state: m1Saved.state || profile.state || '',
        zipCode: m1Saved.zipCode || profile.zipCode || '',
      },
      m2_dependents: organizer.m2_dependents || {
        hasDependents: false,
        spouseName: '',
        spouseSsn: '',
        childCount: 0,
        daycareExpensesClaimed: false,
        daycareProviderName: '',
        daycareProviderEin: '',
        daycareAmount: 0,
        employerReimbursedAmount: 0,
      },
      m3_presence: {
        days2025: undefined,
        days2024: undefined,
        days2023: undefined,
        visaType: profile.visaType || '',
        cityCountyTaxesRequired: false,
        ...(organizer.m3_presence || {}),
        statesResidedHistory: (organizer.m3_presence?.statesResidedHistory && organizer.m3_presence.statesResidedHistory.length > 0)
          ? organizer.m3_presence.statesResidedHistory
          : [
              {
                taxYear: activeApp.taxYear ? parseInt(String(activeApp.taxYear), 10) : 2026,
                state: m1Saved.state || profile.state || '',
                fromDate: '',
                toDate: '',
                spouseState: m1Saved.state || profile.state || '',
                spouseFromDate: '',
                spouseToDate: '',
              },
            ],
      },
      m4_wages: organizer.m4_wages || {
        hasW2: true,
        employerName: '',
        estimatedWages: undefined,
        federalTaxWithheld: undefined,
        w2List: [],
        hasRentalProperty: false,
        rentalProperties: [],
      },
      m5_interest: organizer.m5_interest || {
        hasInterestDividends: false,
        bankName: '',
        interestAmount: 0,
        interestFedTaxWithheld: 0,
        dividendAmount: 0,
        dividendFedTaxWithheld: 0,
        form1099OidAmount: 0,
        form1099OidFedTaxWithheld: 0,
      },
      m10_retirement: organizer.m10_retirement || {
        hasRetirementDistribution: false,
        payerName: '',
        distributionType: 'NORMAL',
        grossDistribution: 0,
        taxableAmount: 0,
        fedTaxWithheld: 0,
        stateTaxWithheld: 0,
        earlyWithdrawalReason: 'NO_EXCEPTION',
        reasonExplanation: '',
        isRothIra: false,
      },
      m6_stocks: organizer.m6_stocks || {
        tradedStocks: false,
        brokerName: '',
        totalCapitalGain: 0,
        esppRsuReported: false,
        lossCarryforward: 0,
      },
      m7_foreign: {
        hasFbar: false,
        hasFbarOver10k: 'NO',
        spouseFbarOver10k: 'NO',
        hasFatcaOver50k: 'NO',
        needsFatcaFiling: 'NO',
        spouseFatcaOver50k: 'NO',
        indianBankName: '',
        peakBalanceInr: 0,
        foreignInterestInr: 0,
        foreignSalaryInr: 0,
        foreignDividendInr: 0,
        foreignRentalInr: 0,
        otherForeignIncomeSource: '',
        otherForeignIncomeInr: 0,
        foreignTaxesPaidInr: 0,
        notesToPreparer: '',
        referrals: [],
        foreignAccountsList: [],
        ...(organizer.m7_foreign || {}),
      },
      m8_deductions: organizer.m8_deductions || {
        hsaContribution: 0,
        mortgageInterest1098: 0,
        propertyTaxesUs: 0,
        propertyTaxesIndia: 0,
        studentLoanInterest: 0,
        cleanEnergyEquipment: '',
        cleanEnergyCost: 0,
        charitableDonations: 0,
      },
      m9_directDeposit: organizer.m9_directDeposit || {
        bankName: '',
        accountType: 'CHECKING',
        routingNumber: '',
        accountNumber: '',
        accountOwnerName: `${profile.firstName} ${profile.lastName || ''}`.trim(),
      },
    };

    // Calculate real completion strictly based on modules
    const effectiveCompletedSet = new Set<string>();
    if (isBusiness) {
      ['b1_companyInfo', 'b2_businessIncome', 'b3_businessExpenses', 'm7'].forEach((m) => {
        if (submittedModules.includes(m)) {
          effectiveCompletedSet.add(m);
        }
      });
    } else {
      submittedModules.forEach((m) => {
        if (m === 'm1' || m === 'm2' || m === 'm3' || m === 'm7' || m === 'm9') {
          effectiveCompletedSet.add(m);
        }
        if (m === 'm_income_expenses' || m === 'm4' || m === 'm5' || m === 'm6' || m === 'm8') {
          effectiveCompletedSet.add('m_income_expenses');
        }
      });
    }
    const completedCount = effectiveCompletedSet.size;
    const totalModules = isBusiness ? 4 : 6;
    const progressPercent = Math.min(100, Math.round((completedCount / totalModules) * 100));

    return {
      taxYear: activeApp.taxYear,
      applicationId: activeApp.id,
      filingType: activeApp.filingType || (isBusiness ? 'BUSINESS' : 'INDIVIDUAL'),
      organizer: defaultOrganizer,
      progressPercent,
      completedCount,
      totalModules,
    };
  }

  /**
   * Save / update 9-module organizer data with XSS sanitization and PostgreSQL sync
   */
  static async saveOrganizer(
    userId: string,
    dataOrBody: any,
    taxYearParam?: number | string,
    leadId?: string,
    currentUser?: any,
    filingTypeParam?: string
  ) {
    const taxYear = dataOrBody?.taxYear || taxYearParam || 2025;
    const filingTypeQuery = dataOrBody?.filingType || dataOrBody?.type || filingTypeParam;
    const organizerData = dataOrBody?.organizerData || dataOrBody;

    const { profile, activeApp } = await this.resolveCustomerAndApp(userId, taxYear, leadId, currentUser, filingTypeQuery);

    // 1. Sanitize all incoming fields against XSS & script injection
    const cleanOrganizerData = sanitizeObject(organizerData);
    const m1 = cleanOrganizerData.m1_demographics || {};

    // 2. Synchronize Demographics directly with CustomerProfile in PostgreSQL
    const profileUpdateData: Record<string, any> = {};
    if (m1.firstName) profileUpdateData.firstName = m1.firstName;
    if (m1.middleName !== undefined) profileUpdateData.middleName = m1.middleName;
    if (m1.lastName) profileUpdateData.lastName = m1.lastName;
    if (m1.dob) profileUpdateData.dob = m1.dob;
    if (m1.phone) profileUpdateData.phone = m1.phone;
    if (m1.email) profileUpdateData.email = m1.email;
    if (m1.occupation) profileUpdateData.occupation = m1.occupation;
    if (m1.visaType) profileUpdateData.visaType = m1.visaType;
    if (m1.maritalStatus) profileUpdateData.maritalStatus = m1.maritalStatus;
    if (m1.residentialAddress) profileUpdateData.addressLine1 = m1.residentialAddress;
    if (m1.city) profileUpdateData.city = m1.city;
    if (m1.state) profileUpdateData.state = m1.state;
    if (m1.zipCode) profileUpdateData.zipCode = m1.zipCode;

    // Store customer's exact raw SSN/TIN into database without modification or masking
    if (m1.ssnMasked !== undefined && m1.ssnMasked !== null) {
      profileUpdateData.ssnTin = String(m1.ssnMasked).trim();
    }

    if (Object.keys(profileUpdateData).length > 0) {
      await prisma.customerProfile.update({
        where: { id: profile.id },
        data: profileUpdateData,
      });
    }

    const currentDraft = (activeApp.taxDraftSummary as any) || {};

    // Calculate real completion strictly from submitted modules list
    const existingSubmitted: string[] = currentDraft.organizer?.submittedModules || ['m1'];
    const newSubmitted: string[] = cleanOrganizerData.submittedModules || existingSubmitted;
    const submittedModules = Array.from(new Set(newSubmitted));

    cleanOrganizerData.submittedModules = submittedModules;
    const isBusiness = activeApp.filingType === 'BUSINESS' || filingTypeQuery?.toUpperCase() === 'BUSINESS';
    const effectiveSavedSet = new Set<string>();

    if (isBusiness) {
      ['b1_companyInfo', 'b2_businessIncome', 'b3_businessExpenses', 'm7'].forEach((m) => {
        if (submittedModules.includes(m)) {
          effectiveSavedSet.add(m);
        }
      });
    } else {
      submittedModules.forEach((m) => {
        if (m === 'm1' || m === 'm2' || m === 'm3' || m === 'm7' || m === 'm9') {
          effectiveSavedSet.add(m);
        }
        if (m === 'm_income_expenses' || m === 'm4' || m === 'm5' || m === 'm6' || m === 'm8') {
          effectiveSavedSet.add('m_income_expenses');
        }
      });
    }
    const completedCount = effectiveSavedSet.size;
    const totalModules = isBusiness ? 4 : 6;
    const progressPercent = Math.min(100, Math.round((completedCount / totalModules) * 100));

    const updatedSummary = {
      ...currentDraft,
      filingType: activeApp.filingType,
      organizer: cleanOrganizerData,
      organizerPercent: progressPercent,
      organizerVerifiedCount: completedCount,
      lastSavedAt: new Date().toISOString(),
    };

    const updatedApp = await prisma.taxApplication.update({
      where: { id: activeApp.id },
      data: {
        taxDraftSummary: updatedSummary,
      },
    });

    const moduleNamesMap: Record<string, string> = {
      m1: 'Section 01 (Personal Info & Demographics)',
      m2: 'Section 02 (Spouse & Dependents)',
      m3: 'Section 03 (Substantial Presence & Multi-State)',
      m7: 'Section 04 (Foreign Assets & FBAR)',
      m9: 'Section 05 (Direct Deposit Bank Details)',
      m_income_expenses: 'Section 06 (Income and Expenses)',
      m4: 'Section 06 (W-2 Wages & Rental Income)',
      m5: 'Section 06 (1099 Interest & Dividends)',
      m6: 'Section 06 (1099-B Stock & Crypto Gains)',
      m8: 'Section 06 (Itemized Deductions & Expenses)',
      b1_companyInfo: 'Section 01 (Company Information)',
      b2_businessIncome: 'Section 02 (Business Income)',
      b3_businessExpenses: 'Section 03 (Business Expenses)',
    };
    const latestModuleKey = submittedModules[submittedModules.length - 1] || 'm1';
    const latestModuleName = moduleNamesMap[latestModuleKey] || `Section ${latestModuleKey.toUpperCase()}`;

    // Record AuditLog for Client Organizer Update
    await prisma.auditLog.create({
      data: {
        applicationId: activeApp.id,
        actorId: userId,
        actorType: 'CLIENT',
        actorName: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.email || 'Taxpayer Client',
        actorRole: 'TAXPAYER_USER',
        action: 'ORGANIZER_UPDATE',
        moduleKey: `ORGANIZER_${latestModuleKey.toUpperCase()}`,
        details: {
          activeModule: latestModuleName,
          submittedModules,
          progressPercent,
          completedCount,
          source: 'TAXPAYER_CLIENT_PORTAL',
          remarks: `Taxpayer saved ${latestModuleName} in Tax Organizer (${completedCount}/6 verified, ${progressPercent}% complete).`,
          clientEmail: profile.email,
          clientName: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.email,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return {
      taxYear: updatedApp.taxYear,
      applicationId: updatedApp.id,
      organizer: cleanOrganizerData,
      progressPercent,
      completedCount,
      message: 'Organizer saved successfully to your tax filing file',
    };
  }

  /**
   * Client-initiated: Start a new Tax Year return directly from client portal
   */
  static async startTaxYearReturn(userId: string, taxYearInput: number | string, filingTypeInput?: string) {
    const taxYear = parseInt(taxYearInput.toString(), 10);
    if (isNaN(taxYear) || taxYear < 2000 || taxYear > 2100) {
      throw new BadRequestError('Please provide a valid 4-digit Tax Year (between 2000 and 2100)');
    }

    const filingType = filingTypeInput === 'BUSINESS' ? 'BUSINESS' : 'INDIVIDUAL';

    const profile = await prisma.customerProfile.findFirst({
      where: { userId },
      include: {
        applications: {
          orderBy: { taxYear: 'desc' },
        },
      },
    });

    if (!profile) {
      throw new NotFoundError('Taxpayer customer profile not found');
    }

    // Check if an application for this tax year and filing type already exists
    const existing = profile.applications.find(
      (a) => a.taxYear === taxYear && (a.filingType === filingType || (!a.filingType && filingType === 'INDIVIDUAL'))
    );
    if (existing) {
      throw new BadRequestError(`A ${filingType === 'BUSINESS' ? 'Business' : 'Individual'} filing application for Tax Year ${taxYear} already exists in your account.`);
    }

    // Carry forward basic demographics from prior application or profile
    const priorApp = profile.applications[0];
    const priorDraft = (priorApp?.taxDraftSummary as any) || {};

    const initialTaxDraftSummary = {
      filingType,
      leadSource: 'SELF_SIGNUP',
      source: 'SELF_SIGNUP',
      signupMethod: 'ONLINE_PORTAL',
      isSelfRegistered: true,
      isRetainedClient: true,
      registrationChannel: 'SELF_SERVICE_PORTAL_ADD_YEAR',
      registeredAt: new Date().toISOString(),
      firstName: profile.firstName || priorDraft.firstName,
      lastName: profile.lastName || priorDraft.lastName,
      email: profile.email || priorDraft.email,
      phone: profile.phone || priorDraft.phone,
      ssnTin: profile.ssnTin || priorDraft.ssnTin,
      dob: profile.dob || priorDraft.dob,
      visaType: profile.visaType || priorDraft.visaType || 'Standard',
      maritalStatus: profile.maritalStatus || priorDraft.maritalStatus || 'Single',
      bankDetails: priorDraft.bankDetails || null,
      notes: `Taxpayer client self-initiated new ${filingType === 'BUSINESS' ? 'Business' : 'Individual'} Tax Year ${taxYear} filing via client portal. Awaiting Admin assignment.`,
    };

    const newApplication = await prisma.taxApplication.create({
      data: {
        customerId: profile.id,
        taxYear,
        filingType,
        currentStage: ApplicationStage.RAW_PROSPECT,
        priority: ApplicationPriority.HIGH,
        assignedDocAgentId: null,
        taxDraftSummary: initialTaxDraftSummary,
        stageHistories: {
          create: {
            fromStage: null,
            toStage: ApplicationStage.RAW_PROSPECT,
            movedByUserId: userId,
            remarks: `Client self-initiated ${filingType === 'BUSINESS' ? 'Business' : 'Individual'} Tax Year ${taxYear} filing via Client Portal. Inbound lead in Direct Sign-ups queue.`,
          },
        },
        auditLogs: {
          create: {
            actorId: userId,
            actorType: AuditActorType.CLIENT,
            actorName: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.email || 'Taxpayer Client',
            actorRole: 'TAXPAYER_USER',
            action: AuditActionType.ORGANIZER_UPDATE,
            moduleKey: 'CLIENT_NEW_TAX_YEAR',
            details: {
              taxYear,
              filingType,
              channel: 'SELF_SERVICE_PORTAL',
              source: 'SELF_SIGNUP',
              isRetainedClient: true,
            },
          },
        },
      },
    });

    // Notify DOC_MANAGER & ADMIN of client's new year return
    try {
      await prisma.notification.create({
        data: {
          targetRole: Role.ADMIN,
          applicationId: newApplication.id,
          title: `Client Self-Added ${filingType === 'BUSINESS' ? 'Business' : 'Individual'} Tax Year ${taxYear}`,
          message: `${profile.firstName} ${profile.lastName} (${profile.phone}) started a new ${filingType === 'BUSINESS' ? 'Business' : 'Individual'} Tax Year ${taxYear} filing. Ready in Direct Sign-ups queue for agent assignment.`,
          category: NotificationCategory.DOCUMENTER,
          priority: NotificationPriority.HIGH,
          actionUrl: '/admin/self-signups',
          actionLabel: 'Assign Lead in Direct Sign-ups',
          relatedLeadName: `${profile.firstName} ${profile.lastName}`.trim(),
        },
      });

      await prisma.notification.create({
        data: {
          targetRole: Role.DOC_MANAGER,
          applicationId: newApplication.id,
          title: `New Return: ${profile.firstName} ${profile.lastName} (${filingType === 'BUSINESS' ? 'Business' : 'Individual'} TY ${taxYear})`,
          message: `Taxpayer initiated ${filingType === 'BUSINESS' ? 'Business' : 'Individual'} Tax Year ${taxYear} return. Waiting for Admin lead assignment in Direct Sign-ups.`,
          category: NotificationCategory.DOCUMENTER,
          priority: NotificationPriority.NORMAL,
          actionUrl: '/admin/self-signups',
          actionLabel: 'Direct Sign-ups',
          relatedLeadName: `${profile.firstName} ${profile.lastName}`.trim(),
        },
      });
    } catch (notifErr) {
      console.error('Failed to create notification for self-added tax year:', notifErr);
    }

    // Fetch updated applications list for this customer
    const updatedApplications = await prisma.taxApplication.findMany({
      where: { customerId: profile.id },
      select: {
        id: true,
        taxYear: true,
        currentStage: true,
        filingType: true,
      },
      orderBy: { taxYear: 'desc' },
    });

    return {
      application: newApplication,
      applications: updatedApplications,
      taxYear: newApplication.taxYear,
      message: `${filingType === 'BUSINESS' ? 'Business' : 'Individual'} Tax Year ${taxYear} return initiated! Admin has been notified to assign your Documenter agent.`,
    };
  }

  /**
   * Get Tax Draft Review Details for Client Portal
   */
  public static async getDraftReview(
    userId: string,
    taxYearQuery?: string | number,
    leadId?: string,
    currentUser?: any,
    filingTypeQuery?: string
  ) {
    const { profile, activeApp } = await this.resolveCustomerAndApp(
      userId,
      taxYearQuery,
      leadId,
      currentUser,
      filingTypeQuery
    );

    if (!activeApp) {
      throw new NotFoundError('Active tax application not found');
    }

    const appWithDetails = await prisma.taxApplication.findUnique({
      where: { id: activeApp.id },
      include: {
        customer: true,
        assignedSalesAgent: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        assignedPrepAgent: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        quotes: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    const draft = (appWithDetails?.taxDraftSummary as any) || {};

    return {
      applicationId: activeApp.id,
      taxYear: activeApp.taxYear,
      filingType: activeApp.filingType,
      currentStage: activeApp.currentStage,
      taxDraftSummary: draft,
      drakeTaxFile: draft.drakeTaxFile || null,
      deliverableDocuments: Array.isArray(draft.deliverableDocuments) ? draft.deliverableDocuments : [],
      draftVersion: draft.draftVersion || 1,
      clientReviewStatus: draft.clientReviewStatus || 'NOT_SENT',
      clientReviewSentAt: draft.clientReviewSentAt || null,
      clientRevisionNotes: draft.clientRevisionNotes || null,
      assignedSalesAgent: appWithDetails?.assignedSalesAgent || null,
      customer: profile,
    };
  }

  /**
   * Client Approves Draft and E-Sign Documents
   */
  public static async approveDraft(userId: string, applicationId?: string, notes?: string, taxYear?: string | number) {
    let app: any = null;

    if (applicationId && applicationId !== 'undefined' && applicationId !== 'null') {
      app = await prisma.taxApplication.findUnique({
        where: { id: applicationId },
        include: { customer: true, assignedSalesAgent: true },
      });
    }

    if (!app) {
      const customer = await prisma.customerProfile.findFirst({
        where: { userId },
        include: {
          applications: {
            where: taxYear ? { taxYear: Number(taxYear) } : undefined,
            include: { customer: true, assignedSalesAgent: true },
            orderBy: { updatedAt: 'desc' },
            take: 1,
          },
        },
      });
      if (customer?.applications?.[0]) {
        app = customer.applications[0];
      }
    }

    if (!app) {
      throw new NotFoundError('Tax application not found');
    }

    const currentDraft: any = app.taxDraftSummary || {};
    const deliverables: any[] = Array.isArray(currentDraft.deliverableDocuments)
      ? currentDraft.deliverableDocuments
      : [];

    // Check if any required signing documents are still missing signed copies
    const missingSignatures = deliverables.filter(
      (d) => d.requiresEsign && !d.signedDocument
    );

    if (missingSignatures.length > 0) {
      const docNames = missingSignatures.map((d) => d.fileName).join(', ');
      throw new BadRequestError(
        `Please sign and upload the required document(s) before approving: ${docNames}`
      );
    }

    const updatedSummary = {
      ...currentDraft,
      clientReviewStatus: 'CLIENT_APPROVED',
      clientApprovedAt: new Date().toISOString(),
      clientApprovalNotes: notes || '',
      updatedAt: new Date().toISOString(),
    };

    const updatedApp = await prisma.taxApplication.update({
      where: { id: app.id },
      data: {
        taxDraftSummary: updatedSummary,
      },
    });

    const clientName = `${app.customer?.firstName || ''} ${app.customer?.lastName || ''}`.trim() || 'Taxpayer';

    // Notify assigned sales agent
    if (app.assignedSalesAgentId) {
      try {
        await prisma.notification.create({
          data: {
            recipientUserId: app.assignedSalesAgentId,
            targetRole: Role.SALES_AGENT,
            applicationId: app.id,
            category: NotificationCategory.SALES,
            priority: NotificationPriority.HIGH,
            title: `Tax Draft Approved: ${clientName} (TY ${app.taxYear})`,
            message: `${clientName} has approved Form 1040 draft (v${currentDraft.draftVersion || 1}) and uploaded all signed documents. Ready for invoice & filing authorization!`,
            actionUrl: `/sales/agent/pitch/${app.id}`,
            actionLabel: 'Open Pitch Workspace',
            relatedLeadName: clientName,
          },
        });
      } catch (err) {
        console.error('Failed to notify sales closer of draft approval:', err);
      }
    }

    return {
      success: true,
      clientReviewStatus: 'CLIENT_APPROVED',
      taxDraftSummary: updatedSummary,
      application: updatedApp,
    };
  }

  /**
   * Client Requests Changes / Rejects Draft
   */
  public static async rejectDraft(userId: string, applicationId?: string, revisionNotes?: string, taxYear?: string | number) {
    if (!revisionNotes || !revisionNotes.trim()) {
      throw new BadRequestError('Please provide details on what you would like adjusted or corrected.');
    }

    let app: any = null;

    if (applicationId && applicationId !== 'undefined' && applicationId !== 'null') {
      app = await prisma.taxApplication.findUnique({
        where: { id: applicationId },
        include: { customer: true, assignedSalesAgent: true },
      });
    }

    if (!app) {
      const customer = await prisma.customerProfile.findFirst({
        where: { userId },
        include: {
          applications: {
            where: taxYear ? { taxYear: Number(taxYear) } : undefined,
            include: { customer: true, assignedSalesAgent: true },
            orderBy: { updatedAt: 'desc' },
            take: 1,
          },
        },
      });
      if (customer?.applications?.[0]) {
        app = customer.applications[0];
      }
    }

    if (!app) {
      throw new NotFoundError('Tax application not found');
    }

    const currentDraft: any = app.taxDraftSummary || {};

    const updatedSummary = {
      ...currentDraft,
      clientReviewStatus: 'CLIENT_REVISION_REQUESTED',
      clientRevisionNotes: revisionNotes.trim(),
      clientRevisionRequestedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedApp = await prisma.taxApplication.update({
      where: { id: app.id },
      data: {
        taxDraftSummary: updatedSummary,
      },
    });

    const clientName = `${app.customer?.firstName || ''} ${app.customer?.lastName || ''}`.trim() || 'Taxpayer';

    // Notify assigned sales agent
    if (app.assignedSalesAgentId) {
      try {
        await prisma.notification.create({
          data: {
            recipientUserId: app.assignedSalesAgentId,
            targetRole: Role.SALES_AGENT,
            applicationId: app.id,
            category: NotificationCategory.SALES,
            priority: NotificationPriority.CRITICAL,
            title: `Client Requested Changes: ${clientName} (TY ${app.taxYear})`,
            message: `${clientName} requested adjustments on return draft: "${revisionNotes.trim()}". Open workspace to modify or send back.`,
            actionUrl: `/sales/agent/pitch/${app.id}`,
            actionLabel: 'Revise in Pitch Workspace',
            relatedLeadName: clientName,
          },
        });
      } catch (err) {
        console.error('Failed to notify sales closer of draft revision request:', err);
      }
    }

    return {
      success: true,
      clientReviewStatus: 'CLIENT_REVISION_REQUESTED',
      taxDraftSummary: updatedSummary,
      application: updatedApp,
    };
  }

  /**
   * Client Uploads Signed Deliverable Document
   */
  public static async uploadSignedDeliverable(
    userId: string,
    applicationId?: string,
    docId?: string,
    file?: Express.Multer.File,
    taxYear?: string | number
  ) {
    if (!file) {
      throw new BadRequestError('No file was uploaded');
    }

    let app: any = null;

    // 1. Try finding application by direct applicationId
    if (applicationId && applicationId !== 'undefined' && applicationId !== 'null') {
      app = await prisma.taxApplication.findUnique({
        where: { id: applicationId },
        include: { customer: true },
      });
    }

    // 2. Fallback: resolve application from the deliverable docId in TaxDocument table
    if (!app && docId) {
      const doc = await prisma.taxDocument.findUnique({
        where: { id: docId },
        include: {
          application: {
            include: { customer: true },
          },
        },
      });
      if (doc?.application) {
        app = doc.application;
      }
    }

    // 3. Fallback: resolve application by customer profile & taxYear
    if (!app) {
      const customer = await prisma.customerProfile.findFirst({
        where: { userId },
        include: {
          applications: {
            where: taxYear ? { taxYear: Number(taxYear) } : undefined,
            orderBy: { updatedAt: 'desc' },
            take: 1,
          },
        },
      });
      if (customer?.applications?.[0]) {
        app = {
          ...customer.applications[0],
          customer,
        };
      }
    }

    if (!app) {
      throw new NotFoundError('Tax application not found');
    }

    const storageResult = await StorageService.saveFile(
      file,
      `taxpayer_${app.customerId}_ty${app.taxYear || 2025}/signed_deliverables`
    );

    const signedDoc = await prisma.taxDocument.create({
      data: {
        applicationId: app.id,
        uploadedByUserId: userId,
        fileName: file.originalname,
        filePath: storageResult.filePath,
        documentCategory: 'SIGNED_CLIENT_DELIVERABLE',
        verificationStatus: 'VERIFIED',
      },
    });

    const currentDraft: any = app.taxDraftSummary || {};
    const deliverables: any[] = Array.isArray(currentDraft.deliverableDocuments)
      ? currentDraft.deliverableDocuments
      : [];

    const updatedDeliverables = deliverables.map((d) => {
      if (d.id === docId) {
        return {
          ...d,
          signedDocument: {
            id: signedDoc.id,
            fileName: file.originalname,
            fileUrl: storageResult.fileUrl,
            filePath: storageResult.filePath,
            fileSize: storageResult.fileSize || file.size,
            uploadedAt: new Date().toISOString(),
          },
        };
      }
      return d;
    });

    // Once every document that needs a signature is signed, the Form 8879 sent by sales counts as signed
    const needsSignature = updatedDeliverables.filter((d) => d.requiresEsign !== false);
    const allSigned = needsSignature.length > 0 && needsSignature.every((d) => Boolean(d.signedDocument));
    const markSigned = allSigned && currentDraft.esignStatus !== 'SIGNED';

    const updatedSummary = {
      ...currentDraft,
      deliverableDocuments: updatedDeliverables,
      ...(markSigned
        ? { esignStatus: 'SIGNED', esignMethod: 'CLIENT_PORTAL', esignCompletedAt: new Date().toISOString() }
        : {}),
      updatedAt: new Date().toISOString(),
    };

    await prisma.taxApplication.update({
      where: { id: app.id },
      data: {
        taxDraftSummary: updatedSummary,
      },
    });

    return {
      success: true,
      signedDocument: {
        id: signedDoc.id,
        fileName: file.originalname,
        fileUrl: storageResult.fileUrl,
      },
      deliverableDocuments: updatedDeliverables,
      taxDraftSummary: updatedSummary,
    };
  }
}

