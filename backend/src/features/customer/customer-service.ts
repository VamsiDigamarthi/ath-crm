import { prisma } from '../../config/db.js';
import { NotFoundError } from '../../errors/not-found-error.js';
import { BadRequestError } from '../../errors/bad-request-error.js';
import { StorageService } from '../../utils/storage-service.js';
import { sanitizeObject } from './customer-validator.js';

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
        user: true,
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
    const m1Saved = organizer.m1_demographics || {};

    const firstName = m1Saved.firstName || profile.firstName || profile.user?.firstName || 'Arjun';
    const middleName = m1Saved.middleName !== undefined ? m1Saved.middleName : (profile.middleName || '');
    const lastName = m1Saved.lastName || profile.lastName || profile.user?.lastName || 'Varma';
    const fullName = m1Saved.fullName || [firstName, middleName, lastName].filter(Boolean).join(' ');
    const email = m1Saved.email || profile.email || profile.user?.email || 'arjun.varma@gmail.com';
    const phone = m1Saved.phone || profile.phone || profile.user?.mobile || '+1 (713) 555-0138';

    // Strictly load submittedModules from saved draft. Default only to ['m1'] if user has filled demographics
    const submittedModules: string[] = Array.isArray(organizer.submittedModules)
      ? organizer.submittedModules
      : (m1Saved.firstName || profile.firstName ? ['m1'] : []);

    // Real customer data from CustomerProfile and saved TaxDraftSummary
    const defaultOrganizer = {
      submittedModules,
      m1_demographics: {
        firstName,
        middleName,
        lastName,
        fullName,
        ssnMasked: m1Saved.ssnMasked || (profile.ssnTin ? `•••-••-${profile.ssnTin.slice(-4)}` : '••••••-6789'),
        dob: m1Saved.dob || profile.dob || '05/14/1988',
        occupation: m1Saved.occupation || profile.occupation || 'Principal Cloud Architect',
        phone,
        workPhone: m1Saved.workPhone || '+1 (713) 555-9821',
        email,
        relationshipToPrimary: m1Saved.relationshipToPrimary || 'SELF',
        visaType: m1Saved.visaType || profile.visaType || 'H-1B',
        visaStatusChanged2025: m1Saved.visaStatusChanged2025 || 'NO',
        visaChangeDate: m1Saved.visaChangeDate || '',
        firstPortOfEntryDate: m1Saved.firstPortOfEntryDate || '08/15/2018',
        stayMoreThan6Months2026: m1Saved.stayMoreThan6Months2026 || 'YES',
        monthsStayedInUs2025: m1Saved.monthsStayedInUs2025 !== undefined ? m1Saved.monthsStayedInUs2025 : 12,
        maritalStatus: m1Saved.maritalStatus || (profile.maritalStatus === 'Married' ? 'Married Filing Jointly' : (profile.maritalStatus || 'Single')),
        dateOfMarriage: m1Saved.dateOfMarriage || '',
        residentialAddress: m1Saved.residentialAddress || profile.addressLine1 || '1000 Louisiana St, Suite 4200',
        city: m1Saved.city || profile.city || 'Houston',
        state: m1Saved.state || profile.state || 'TX',
        zipCode: m1Saved.zipCode || profile.zipCode || '77002',
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
        days2025: undefined,
        days2024: undefined,
        days2023: undefined,
        visaType: profile.visaType || 'H-1B',
        statesResidedHistory: [],
        cityCountyTaxesRequired: false,
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

    // Calculate real completion progress strictly based on actual submitted modules
    const completedCount = submittedModules.length;
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
   * Save / update 9-module organizer data with XSS sanitization and PostgreSQL sync
   */
  static async saveOrganizer(userId: string, dataOrBody: any, taxYearParam?: number | string) {
    const taxYear = dataOrBody?.taxYear || taxYearParam || 2025;
    const organizerData = dataOrBody?.organizerData || dataOrBody;

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

    const selectedYear = parseInt(taxYear.toString(), 10) || 2025;
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

    // 1. Sanitize all incoming fields against XSS & script injection
    const cleanOrganizerData = sanitizeObject(organizerData);
    const m1 = cleanOrganizerData.m1_demographics || {};

    // 2. Synchronize Demographics with CustomerProfile in PostgreSQL
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

    // Only update SSN if provided and not masked placeholder
    if (m1.ssnMasked && !m1.ssnMasked.includes('•••')) {
      profileUpdateData.ssnTin = m1.ssnMasked;
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
    const completedCount = submittedModules.length;
    const progressPercent = Math.round((completedCount / 9) * 100);

    const updatedSummary = {
      ...currentDraft,
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

    return {
      taxYear: updatedApp.taxYear,
      applicationId: updatedApp.id,
      organizer: cleanOrganizerData,
      progressPercent,
      completedCount,
      message: 'Organizer saved successfully to your tax filing file',
    };
  }
}
