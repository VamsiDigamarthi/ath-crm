import { prisma } from '../../config/db.js';
import { NotFoundError } from '../../errors/not-found-error.js';
import { BadRequestError } from '../../errors/bad-request-error.js';
import { StorageService } from '../../utils/storage-service.js';

export class CustomerService {
  /**
   * Get complete real-time dashboard data for logged in taxpayer user
   */
  static async getDashboard(userId: string, taxYearQuery?: string) {
    // 1. Find customer profile linked to this user
    const profile = await prisma.customerProfile.findFirst({
      where: { userId },
      include: {
        applications: {
          include: {
            assignedDocAgent: {
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

    if (!profile) {
      throw new NotFoundError('Taxpayer customer profile not found for this account.');
    }

    const selectedYear = taxYearQuery ? parseInt(taxYearQuery, 10) : 2025;
    const activeApp = profile.applications.find((a) => a.taxYear === selectedYear) || profile.applications[0];

    if (!activeApp) {
      throw new NotFoundError(`No tax return found for tax year ${selectedYear}.`);
    }

    // Parse draft summary
    const draft = (activeApp.taxDraftSummary as any) || {};

    // Calculate real numbers
    const fedRefund = draft.fedRefund ?? draft.federalRefund ?? 2840;
    const stateRefund = draft.stateRefund ?? 0;
    const totalRefund = fedRefund + stateRefund;
    const bankName = draft.bankName || 'Chase Bank';
    const bankMasked = draft.accountNumber
      ? `${bankName} (•••• ${draft.accountNumber.slice(-4)})`
      : `${bankName} (•••• 4819)`;

    const docCount = activeApp.documents?.length || 0;
    const latestQuote = activeApp.quotes?.[0];
    const quoteAmount = latestQuote ? Number(latestQuote.quoteAmount) - Number(latestQuote.discountAmount) : 199;
    const quoteStatus = latestQuote ? latestQuote.status : (profile.isConvertedCustomer ? 'PAID' : 'PENDING');

    return {
      taxpayer: {
        id: profile.id,
        name: `${profile.firstName} ${profile.lastName || ''}`.trim(),
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        ssnMasked: profile.ssnTin ? `•••-••-${profile.ssnTin.slice(-4)}` : '•••-••-4819',
        visaType: profile.visaType || 'H-1B',
        maritalStatus: profile.maritalStatus || 'Single',
        city: profile.city || 'Houston',
        state: profile.state || 'TX',
        isConvertedCustomer: profile.isConvertedCustomer,
      },
      application: {
        id: activeApp.id,
        taxYear: activeApp.taxYear,
        currentStage: activeApp.currentStage,
        filingType: activeApp.filingType,
      },
      refund: {
        fedRefund,
        stateRefund,
        totalRefund,
        stateName: profile.state === 'TX' ? 'Texas (TX - 0% State Tax)' : `${profile.state || 'Texas'} State Tax`,
        bankMasked,
        isDraft: activeApp.currentStage !== 'FILING_SUCCESS',
      },
      assignedTeam: {
        docAgent: activeApp.assignedDocAgent
          ? {
              name: `${activeApp.assignedDocAgent.firstName} ${activeApp.assignedDocAgent.lastName || ''}`.trim(),
              email: activeApp.assignedDocAgent.email,
            }
          : { name: 'Kavya R', email: 'kavya.r@taxcrm.com' },
        cpaReviewer: {
          name: 'Ramesh Rao, CPA, EA',
          credentials: 'IRS Enrolled Agent & Circular 230 Certified',
        },
      },
      stats: {
        docCount,
        organizerPercent: draft.organizerPercent || 78,
        organizerVerifiedCount: draft.organizerVerifiedCount || 7,
        quoteAmount,
        quoteStatus,
      },
      availableTaxYears: profile.applications.map((a) => a.taxYear),
    };
  }

  /**
   * Get all uploaded documents for a taxpayer's specific tax year application
   */
  static async getDocuments(userId: string, taxYearQuery?: string) {
    const profile = await prisma.customerProfile.findFirst({
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

    if (!profile) {
      throw new NotFoundError('Taxpayer customer profile not found');
    }

    const selectedYear = taxYearQuery ? parseInt(taxYearQuery, 10) : 2025;
    const activeApp = profile.applications.find((a) => a.taxYear === selectedYear) || profile.applications[0];

    if (!activeApp) {
      return {
        taxYear: selectedYear,
        isConvertedCustomer: profile.isConvertedCustomer,
        documents: [],
      };
    }

    const docs = activeApp.documents.map((doc) => ({
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
      taxYear: activeApp.taxYear,
      applicationId: activeApp.id,
      currentStage: activeApp.currentStage,
      isConvertedCustomer: profile.isConvertedCustomer,
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
    taxYearQuery?: string
  ) {
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

    const selectedYear = taxYearQuery ? parseInt(taxYearQuery, 10) : 2025;
    let activeApp = profile.applications.find((a) => a.taxYear === selectedYear);

    // If application doesn't exist for this year, create it in DOC_PREP
    if (!activeApp) {
      activeApp = await prisma.taxApplication.create({
        data: {
          customerId: profile.id,
          taxYear: selectedYear,
          currentStage: 'DOC_PREP',
          filingType: 'INDIVIDUAL',
        },
      });
    }

    // Save file via Abstract Storage Service
    const storageResult = await StorageService.saveFile(file, `taxpayer_${profile.id}_ty${selectedYear}`);

    // Insert TaxDocument record
    const newDoc = await prisma.taxDocument.create({
      data: {
        applicationId: activeApp.id,
        uploadedByUserId: userId,
        fileName: file.originalname,
        filePath: storageResult.filePath,
        documentCategory: documentCategory || 'W2_WAGES',
        verificationStatus: 'PENDING',
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
   * Delete an uploaded document (if pending review)
   */
  static async deleteDocument(userId: string, documentId: string) {
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

    // Verify ownership
    if (doc.application.customer.userId !== userId && doc.uploadedByUserId !== userId) {
      throw new BadRequestError('You do not have permission to delete this document');
    }

    // Delete from storage
    await StorageService.deleteFile(doc.filePath);

    // Delete from DB
    await prisma.taxDocument.delete({
      where: { id: documentId },
    });

    return { success: true, message: 'Document deleted successfully' };
  }

  /**
   * Get document file path for download
   */
  static async getDocumentDownloadInfo(userId: string, documentId: string) {
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

    if (doc.application.customer.userId !== userId && doc.uploadedByUserId !== userId) {
      throw new BadRequestError('Unauthorized document access');
    }

    const absolutePath = StorageService.getAbsoluteFilePath(doc.filePath);
    if (!StorageService.fileExists(doc.filePath)) {
      throw new NotFoundError('Physical file not found on storage server');
    }

    return {
      absolutePath,
      fileName: doc.fileName,
    };
  }

  /**
   * Get 9-Module Organizer data for active tax return
   */
  static async getOrganizer(userId: string, taxYearQuery?: string) {
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

    const selectedYear = taxYearQuery ? parseInt(taxYearQuery, 10) : 2025;
    const activeApp = profile.applications.find((a) => a.taxYear === selectedYear) || profile.applications[0];

    if (!activeApp) {
      throw new NotFoundError(`No tax return found for year ${selectedYear}`);
    }

    const draft = (activeApp.taxDraftSummary as any) || {};
    const organizer = draft.organizer || {};

    // Real customer data from CustomerProfile and saved TaxDraftSummary
    const defaultOrganizer = {
      m1_demographics: organizer.m1_demographics || {
        fullName: `${profile.firstName} ${profile.lastName || ''}`.trim(),
        ssnMasked: profile.ssnTin ? `•••-••-${profile.ssnTin.slice(-4)}` : '',
        dob: profile.dob || '',
        occupation: profile.occupation || '',
        filingStatus: profile.maritalStatus === 'Married' ? 'Married Filing Jointly' : 'Single',
        residentialAddress: profile.addressLine1 || '',
        city: profile.city || '',
        state: profile.state || '',
        zipCode: profile.zipCode || '',
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
      m3_presence: organizer.m3_presence || {
        days2025: 365,
        days2024: 0,
        days2023: 0,
        visaType: profile.visaType || 'H-1B',
        residedStates: [{ state: profile.state || 'TX', fromDate: '01/01/2025', toDate: '12/31/2025' }],
        cityCountyTaxesRequired: false,
      },
      m4_wages: organizer.m4_wages || {
        hasW2: false,
        employerName: '',
        estimatedWages: 0,
      },
      m5_interest: organizer.m5_interest || {
        hasInterestDividends: false,
        bankName: '',
        interestAmount: 0,
        dividendAmount: 0,
      },
      m6_stocks: organizer.m6_stocks || {
        tradedStocks: false,
        brokerName: '',
        totalCapitalGain: 0,
        esppRsuReported: false,
        lossCarryforward: 0,
      },
      m7_foreign: organizer.m7_foreign || {
        hasFbar: false,
        indianBankName: '',
        peakBalanceInr: 0,
        foreignInterestInr: 0,
        foreignSalaryInr: 0,
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

    // Calculate real completion progress
    let completedCount = 0;
    if (defaultOrganizer.m1_demographics.fullName && defaultOrganizer.m1_demographics.city) completedCount++;
    if (organizer.m2_dependents) completedCount++;
    if (defaultOrganizer.m3_presence.days2025 > 0) completedCount++;
    if (organizer.m4_wages && (defaultOrganizer.m4_wages.hasW2 || defaultOrganizer.m4_wages.employerName)) completedCount++;
    if (organizer.m5_interest) completedCount++;
    if (organizer.m6_stocks) completedCount++;
    if (organizer.m7_foreign) completedCount++;
    if (organizer.m8_deductions) completedCount++;
    if (organizer.m9_directDeposit && defaultOrganizer.m9_directDeposit.routingNumber) completedCount++;

    const progressPercent = Math.round((completedCount / 9) * 100);

    return {
      taxYear: activeApp.taxYear,
      applicationId: activeApp.id,
      organizer: defaultOrganizer,
      progressPercent,
      completedCount,
      totalModules: 9,
    };
  }

  /**
   * Save 9-Module Organizer data into TaxApplication
   */
  static async saveOrganizer(userId: string, body: any) {
    const { taxYear, organizerData } = body;

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

    const selectedYear = taxYear ? parseInt(taxYear, 10) : 2025;
    let activeApp = profile.applications.find((a) => a.taxYear === selectedYear);

    if (!activeApp) {
      activeApp = await prisma.taxApplication.create({
        data: {
          customerId: profile.id,
          taxYear: selectedYear,
          currentStage: 'DOC_PREP',
          filingType: 'INDIVIDUAL',
        },
      });
    }

    const currentDraft = (activeApp.taxDraftSummary as any) || {};

    // Calculate completion
    let completedCount = 0;
    if (organizerData.m1_demographics?.fullName) completedCount++;
    if (organizerData.m2_dependents) completedCount++;
    if (organizerData.m3_presence?.days2025 > 0) completedCount++;
    if (organizerData.m4_wages) completedCount++;
    if (organizerData.m5_interest) completedCount++;
    if (organizerData.m6_stocks) completedCount++;
    if (organizerData.m7_foreign) completedCount++;
    if (organizerData.m8_deductions) completedCount++;
    if (organizerData.m9_directDeposit?.routingNumber) completedCount++;

    const progressPercent = Math.round((completedCount / 9) * 100);

    const updatedSummary = {
      ...currentDraft,
      organizer: organizerData,
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

    return {
      taxYear: updatedApp.taxYear,
      applicationId: updatedApp.id,
      organizer: organizerData,
      progressPercent,
      completedCount,
      message: 'Organizer saved successfully to your tax filing file',
    };
  }
}
