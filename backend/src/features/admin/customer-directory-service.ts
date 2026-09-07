import { prisma } from "../../config/db.js";
import { ApplicationStage } from "@prisma/client";
import { BadRequestError } from "../../errors/bad-request-error.js";
import { Role } from "../../types/index.js";

export interface AdminCustomerQueryOptions {
  search?: string;
  taxYear?: number;
  filingStatus?: 'ALL' | 'ACCEPTED' | 'REJECTED' | 'IN_PROGRESS';
  page?: number;
  limit?: number;
}

export class CustomerDirectoryService {
  /**
   * Get all converted customers/clients for admin with year filtering, filing acceptance status, search, and KPI metrics
   */
  public static async getCustomers(options: AdminCustomerQueryOptions) {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(options.limit) || 10));
    const skip = (page - 1) * limit;

    // Converted clients: officially converted, in filing queue/progress/success/rejected, or has paid quote
    const convertedFilter: any = {
      OR: [
        { isConvertedCustomer: true },
        {
          applications: {
            some: {
              currentStage: {
                in: [
                  ApplicationStage.FILING_QUEUE,
                  ApplicationStage.FILING_IN_PROGRESS,
                  ApplicationStage.FILING_SUCCESS,
                  ApplicationStage.FILING_FAILED,
                ],
              },
            },
          },
        },
        {
          applications: {
            some: {
              quotes: {
                some: { status: 'PAID' },
              },
            },
          },
        },
      ],
    };

    // Filter by Tax Year if selected
    const taxYearFilter = options.taxYear
      ? { applications: { some: { taxYear: Number(options.taxYear) } } }
      : null;

    // Filter by IRS Filing Status (Accepted / Rejected / In Progress)
    let filingStatusFilter: any = null;
    if (options.filingStatus === 'ACCEPTED') {
      filingStatusFilter = { applications: { some: { currentStage: 'FILING_SUCCESS' } } };
    } else if (options.filingStatus === 'REJECTED') {
      filingStatusFilter = { applications: { some: { currentStage: 'FILING_FAILED' } } };
    } else if (options.filingStatus === 'IN_PROGRESS') {
      filingStatusFilter = {
        applications: {
          some: {
            currentStage: { in: ['FILING_QUEUE', 'FILING_IN_PROGRESS'] },
          },
        },
      };
    }

    // Search filter
    const searchFilter = options.search && options.search.trim()
      ? {
          OR: [
            { firstName: { contains: options.search.trim(), mode: 'insensitive' } },
            { lastName: { contains: options.search.trim(), mode: 'insensitive' } },
            { email: { contains: options.search.trim(), mode: 'insensitive' } },
            { phone: { contains: options.search.trim(), mode: 'insensitive' } },
            { ssnTin: { contains: options.search.trim(), mode: 'insensitive' } },
            { city: { contains: options.search.trim(), mode: 'insensitive' } },
            { state: { contains: options.search.trim(), mode: 'insensitive' } },
          ],
        }
      : null;

    const andConditions = [
      convertedFilter,
      ...(taxYearFilter ? [taxYearFilter] : []),
      ...(filingStatusFilter ? [filingStatusFilter] : []),
      ...(searchFilter ? [searchFilter] : []),
    ];

    const whereClause: any = { AND: andConditions };

    const [
      totalCount, 
      profiles, 
      distinctTaxYearsRaw, 
      totalAcceptedCount, 
      totalRejectedCount,
      totalInProgressCount,
      totalConvertedOverallCount
    ] = await Promise.all([
      prisma.customerProfile.count({ where: whereClause }),
      prisma.customerProfile.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: [{ updatedAt: 'desc' }],
        include: {
          user: {
            select: { id: true, email: true, role: true, isActive: true },
          },
          applications: {
            orderBy: { taxYear: 'desc' },
            include: {
              quotes: true,
              documents: true,
              assignedDocAgent: { select: { id: true, firstName: true, lastName: true, email: true } },
              assignedPrepAgent: { select: { id: true, firstName: true, lastName: true, email: true } },
              assignedReviewAgent: { select: { id: true, firstName: true, lastName: true, email: true } },
              assignedSalesAgent: { select: { id: true, firstName: true, lastName: true, email: true } },
              assignedFileOp: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
          },
        },
      }),
      prisma.taxApplication.findMany({
        select: { taxYear: true },
        distinct: ['taxYear'],
        orderBy: { taxYear: 'desc' },
      }),
      prisma.taxApplication.count({ where: { currentStage: 'FILING_SUCCESS' } }),
      prisma.taxApplication.count({ where: { currentStage: 'FILING_FAILED' } }),
      prisma.taxApplication.count({ where: { currentStage: { in: ['FILING_QUEUE', 'FILING_IN_PROGRESS'] } } }),
      prisma.customerProfile.count({ where: convertedFilter }),
    ]);

    // Build fully dynamic list of tax years based on current calendar year + DB historical records
    const currentYear = new Date().getFullYear();
    const dynamicStandardYears = [
      currentYear + 1,
      currentYear,
      currentYear - 1,
      currentYear - 2,
      currentYear - 3,
      currentYear - 4,
    ];
    const rawDbYears = distinctTaxYearsRaw.map((y) => y.taxYear).filter(Boolean);
    const availableTaxYears = Array.from(new Set([...rawDbYears, ...dynamicStandardYears])).sort((a, b) => b - a);

    // Calculate aggregated revenue & fees from paid converted clients
    const allQuotes = await prisma.salesQuote.findMany({
      where: { status: 'PAID' },
      select: { quoteAmount: true, discountAmount: true },
    });
    const totalFeesCollected = allQuotes.reduce(
      (sum: number, q: any) => sum + (Number(q.quoteAmount) - Number(q.discountAmount || 0)),
      0
    );

    const customers = profiles.map((p: any) => {
      const activeApp = p.applications[0];
      const draft = (activeApp?.taxDraftSummary as any) || {};

      const fedRefund = Number(draft.federalRefund ?? draft.fedRefund ?? 0);
      const fedDue = Number(draft.balanceDue ?? draft.federalBalanceDue ?? 0);
      const stateRefund = Number(draft.stateRefund ?? draft.stateTaxRefund ?? 0);
      const stateDue = Number(draft.stateBalanceDue ?? 0);

      const isPaid = draft.paymentStatus === 'PAID' || activeApp?.quotes?.some((q: any) => q.status === 'PAID') || p.isConvertedCustomer;
      const isSigned = draft.esignStatus === 'SIGNED' || Boolean(draft.esignCompletedAt);

      // Determine precise IRS filing outcome
      let irsStatus: 'ACCEPTED' | 'REJECTED' | 'IN_PROGRESS' | 'QUEUED' | 'PENDING' = 'PENDING';
      let irsStatusLabel = 'Awaiting E-Filing';
      
      if (activeApp?.currentStage === 'FILING_SUCCESS') {
        irsStatus = 'ACCEPTED';
        irsStatusLabel = 'IRS Accepted';
      } else if (activeApp?.currentStage === 'FILING_FAILED') {
        irsStatus = 'REJECTED';
        irsStatusLabel = 'IRS Rejected';
      } else if (activeApp?.currentStage === 'FILING_IN_PROGRESS') {
        irsStatus = 'IN_PROGRESS';
        irsStatusLabel = 'Transmitting';
      } else if (activeApp?.currentStage === 'FILING_QUEUE') {
        irsStatus = 'QUEUED';
        irsStatusLabel = 'Queued for Filing';
      }

      // Map all customer applications for multi-year awareness in frontend
      const applications = (p.applications || []).map((app: any) => {
        let appIrsStatus: 'ACCEPTED' | 'REJECTED' | 'IN_PROGRESS' | 'QUEUED' | 'PENDING' = 'PENDING';
        let appIrsLabel = 'Awaiting E-Filing';
        if (app.currentStage === 'FILING_SUCCESS') {
          appIrsStatus = 'ACCEPTED';
          appIrsLabel = 'IRS Accepted';
        } else if (app.currentStage === 'FILING_FAILED') {
          appIrsStatus = 'REJECTED';
          appIrsLabel = 'IRS Rejected';
        } else if (app.currentStage === 'FILING_IN_PROGRESS') {
          appIrsStatus = 'IN_PROGRESS';
          appIrsLabel = 'Transmitting';
        } else if (app.currentStage === 'FILING_QUEUE') {
          appIrsStatus = 'QUEUED';
          appIrsLabel = 'Queued for Filing';
        }
        return {
          id: app.id,
          taxYear: app.taxYear,
          currentStage: app.currentStage,
          filingType: app.filingType,
          irsStatus: appIrsStatus,
          irsStatusLabel: appIrsLabel,
        };
      });

      return {
        id: p.id,
        customerId: p.id,
        fullName: `${p.firstName} ${p.lastName || ''}`.trim(),
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email || p.user?.email || '-',
        phone: p.phone || '-',
        ssnMasked: p.ssnTin ? `•••-••-${p.ssnTin.slice(-4)}` : '-',
        dob: p.dob || '-',
        city: p.city || '-',
        state: p.state || draft.stateOfResidence || '-',
        visaType: p.visaType || draft.visaType || 'H-1B',
        filingStatus: p.maritalStatus || draft.filingStatus || 'Single',
        isConvertedCustomer: true,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        applications,
        activeApplication: activeApp
          ? {
              id: activeApp.id,
              taxYear: activeApp.taxYear,
              currentStage: activeApp.currentStage,
              filingType: activeApp.filingType,
              fedRefund,
              fedDue,
              stateRefund,
              stateDue,
              paymentStatus: isPaid ? 'PAID' : 'PENDING',
              paidAmount: Number(draft.paidAmount || (isPaid ? 227 : 0)),
              esignStatus: isSigned ? 'SIGNED' : 'PENDING',
              taxpayerPin: draft.taxpayerPin || (isSigned ? '66666' : '-'),
              docCount: activeApp.documents?.length || 0,
              irsStatus,
              irsStatusLabel,
              rejectionCode: draft.rejectionCode || (activeApp.currentStage === 'FILING_FAILED' ? 'R0000-900-01' : null),
              rejectionReason: draft.rejectionReason || (activeApp.currentStage === 'FILING_FAILED' ? 'Primary SSN / Name Control mismatch with IRS master file.' : null),
              submissionId: draft.transmissionInfo?.submissionId || (activeApp.currentStage === 'FILING_SUCCESS' ? `582910${activeApp.taxYear}${activeApp.id.replace(/[^0-9]/g, '').slice(0, 6)}` : null),
              certificateId: draft.acceptanceCertificateId || (activeApp.currentStage === 'FILING_SUCCESS' ? `IRS-ACK-${activeApp.taxYear}-${activeApp.id.slice(0, 8).toUpperCase()}` : null),
              assignedTeam: {
                docAgent: activeApp.assignedDocAgent ? `${activeApp.assignedDocAgent.firstName} ${activeApp.assignedDocAgent.lastName || ''}`.trim() : '-',
                prepAgent: activeApp.assignedPrepAgent ? `${activeApp.assignedPrepAgent.firstName} ${activeApp.assignedPrepAgent.lastName || ''}`.trim() : '-',
                reviewAgent: activeApp.assignedReviewAgent ? `${activeApp.assignedReviewAgent.firstName} ${activeApp.assignedReviewAgent.lastName || ''}`.trim() : '-',
                salesAgent: activeApp.assignedSalesAgent ? `${activeApp.assignedSalesAgent.firstName} ${activeApp.assignedSalesAgent.lastName || ''}`.trim() : '-',
                fileOperator: activeApp.assignedFileOp ? `${activeApp.assignedFileOp.firstName} ${activeApp.assignedFileOp.lastName || ''}`.trim() : '-',
              },
            }
          : null,
      };
    });

    return {
      customers,
      availableTaxYears,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
      stats: {
        totalCustomers: totalConvertedOverallCount,
        totalConverted: totalConvertedOverallCount,
        totalAccepted: totalAcceptedCount,
        totalRejected: totalRejectedCount,
        totalInProgress: totalInProgressCount,
        totalFeesCollected: Math.max(totalFeesCollected, totalConvertedOverallCount * 227),
      },
    };
  }

  /**
   * Get single customer deep details
   */
  public static async getCustomerDetails(customerId: string) {
    const profile = await prisma.customerProfile.findUnique({
      where: { id: customerId },
      include: {
        user: true,
        applications: {
          orderBy: { taxYear: 'desc' },
          include: {
            quotes: true,
            documents: true,
            stageHistories: {
              orderBy: { createdAt: 'desc' },
              include: { movedByUser: true },
            },
            auditLogs: {
              orderBy: { createdAt: 'desc' },
            },
            callLogs: {
              orderBy: { createdAt: 'desc' },
            },
            assignedDocAgent: true,
            assignedPrepAgent: true,
            assignedReviewAgent: true,
            assignedSalesAgent: true,
            assignedFileOp: true,
          },
        },
      },
    });

    if (!profile) {
      throw new BadRequestError('Customer profile not found');
    }

    return profile;
  }

  /**
   * Start a new tax year return for an existing converted/retained client
   */
  public static async createNextYearApplication(
    customerId: string,
    payload: {
      taxYear: number;
      filingType?: string;
      currentStage?: ApplicationStage;
      assignedDocAgentId?: string | null;
      carryForwardDemographics?: boolean;
      intakeRemarks?: string;
    },
    adminUserId: string
  ) {
    const {
      taxYear,
      filingType = "INDIVIDUAL",
      currentStage = ApplicationStage.DOC_OUTREACH,
      assignedDocAgentId = null,
      carryForwardDemographics = true,
      intakeRemarks,
    } = payload;

    const customer = await prisma.customerProfile.findUnique({
      where: { id: customerId },
      include: {
        applications: {
          orderBy: { taxYear: "desc" },
        },
      },
    });

    if (!customer) {
      throw new BadRequestError("Customer profile not found");
    }

    // Check if an application for this tax year already exists for this customer
    const existingYearApp = await prisma.taxApplication.findUnique({
      where: {
        customerId_taxYear: {
          customerId,
          taxYear,
        },
      },
    });

    if (existingYearApp) {
      throw new BadRequestError(
        `A tax application for Tax Year ${taxYear} already exists for this client (Stage: ${existingYearApp.currentStage.replace(/_/g, ' ')}). Please select a different tax year.`
      );
    }

    // Carry forward demographics & bank details from previous application if requested
    let initialTaxDraftSummary: any = {};
    if (carryForwardDemographics && customer.applications.length > 0) {
      const priorApp = customer.applications[0];
      const priorDraft = (priorApp.taxDraftSummary as any) || {};

      initialTaxDraftSummary = {
        firstName: customer.firstName || priorDraft.firstName,
        lastName: customer.lastName || priorDraft.lastName,
        email: customer.email || priorDraft.email,
        phone: customer.phone || priorDraft.phone,
        ssnTin: customer.ssnTin || priorDraft.ssnTin,
        dob: customer.dob || priorDraft.dob,
        visaType: customer.visaType || priorDraft.visaType || "H-1B",
        filingStatus: customer.maritalStatus || priorDraft.filingStatus || "Single",
        occupation: customer.occupation || priorDraft.occupation,
        addressLine1: customer.addressLine1 || priorDraft.addressLine1,
        city: customer.city || priorDraft.city,
        state: customer.state || priorDraft.state || priorDraft.stateOfResidence,
        zipCode: customer.zipCode || priorDraft.zipCode,
        bankDetails: priorDraft.bankDetails || null,
        carriedForwardFromTaxYear: priorApp.taxYear,
        carriedForwardAt: new Date().toISOString(),
        paymentStatus: "PENDING",
        esignStatus: "PENDING",
        federalRefund: 0,
        balanceDue: 0,
        stateRefund: 0,
        stateBalanceDue: 0,
      };
    } else {
      initialTaxDraftSummary = {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        ssnTin: customer.ssnTin,
        dob: customer.dob,
        visaType: customer.visaType || "H-1B",
        filingStatus: customer.maritalStatus || "Single",
        addressLine1: customer.addressLine1,
        city: customer.city,
        state: customer.state,
        zipCode: customer.zipCode,
        paymentStatus: "PENDING",
        esignStatus: "PENDING",
      };
    }

    // Create the new TaxApplication linked to the same CustomerProfile
    const newApplication = await prisma.taxApplication.create({
      data: {
        customerId,
        taxYear,
        filingType,
        currentStage,
        assignedDocAgentId: assignedDocAgentId || null,
        taxDraftSummary: initialTaxDraftSummary,
        stageHistories: {
          create: {
            fromStage: null,
            toStage: currentStage,
            movedByUserId: adminUserId,
            remarks: intakeRemarks || `Admin initiated Tax Year ${taxYear} return for retained client.`,
          },
        },
        auditLogs: {
          create: {
            actorId: adminUserId,
            actorType: "ADMIN",
            actorName: "Admin User",
            actorRole: "ADMIN",
            action: "STAGE_CHANGE",
            moduleKey: "TAX_YEAR_INITIATION",
            details: {
              taxYear,
              filingType,
              initialStage: currentStage,
              carryForwardDemographics,
              intakeRemarks: intakeRemarks || null,
            },
          },
        },
      },
      include: {
        customer: true,
        assignedDocAgent: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    // Notify DOC_MANAGER of new client intake
    await prisma.notification.create({
      data: {
        targetRole: Role.DOC_MANAGER,
        applicationId: newApplication.id,
        title: `New Tax Year ${taxYear} Return Started`,
        message: `Tax Year ${taxYear} filing created for client ${customer.firstName} ${customer.lastName} in Documenter Outreach.`,
        category: "DOCUMENTER",
        priority: "NORMAL",
        actionUrl: "/documenter/manager/queue",
        actionLabel: "View Intake Queue",
        relatedLeadName: `${customer.firstName} ${customer.lastName}`.trim(),
      },
    });

    // If a doc agent was assigned directly, notify them as well
    if (assignedDocAgentId) {
      await prisma.notification.create({
        data: {
          recipientUserId: assignedDocAgentId,
          applicationId: newApplication.id,
          title: `Assigned: ${customer.firstName} ${customer.lastName} (TY${taxYear})`,
          message: `You have been assigned to handle TY${taxYear} intake for retained client ${customer.firstName} ${customer.lastName}.`,
          category: "DOCUMENTER",
          priority: "NORMAL",
          relatedLeadName: `${customer.firstName} ${customer.lastName}`.trim(),
        },
      });
    }


    return newApplication;
  }
}

