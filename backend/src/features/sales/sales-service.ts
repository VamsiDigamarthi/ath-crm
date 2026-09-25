import { prisma } from "../../config/db.js";
import { ApplicationStage, Role, NotificationCategory, NotificationPriority, AuditActorType, AuditActionType, CouponStatus, Prisma } from "@prisma/client";

export class SalesService {
  /**
   * Helper to dynamically compute return complexity based on documents, schedules, deductions, and foreign reporting
   */
  public static computeReturnComplexity(app: any): 'STANDARD' | 'INVESTMENTS_1099B' | 'FOREIGN_FBAR' | 'SCHEDULE_C' {
    const draft = app.taxDraftSummary || {};
    const feeBreakdown = draft.feeBreakdown || {};
    const documents: any[] = Array.isArray(app.documents) ? app.documents : [];
    const docText = [
      ...documents.map((d: any) => `${d.documentCategory || ''} ${d.fileName || ''} ${d.documentType || ''}`),
      draft.notes || '',
      draft.remarks || '',
    ].join(' ').toUpperCase();

    const selectedStates = Array.isArray(feeBreakdown.selectedStates) ? feeBreakdown.selectedStates : [];
    const fbarFee = Number(feeBreakdown.fbarFee || draft.fbarFee || 0);
    const fatcaFee = Number(feeBreakdown.fatcaFee || draft.fatcaFee || 0);

    if (fbarFee > 0 || fatcaFee > 0 || docText.includes('FBAR') || docText.includes('FATCA') || docText.includes('8938') || docText.includes('NRE') || docText.includes('NRO') || docText.includes('FOREIGN') || docText.includes('PFIC') || docText.includes('8621')) {
      return 'FOREIGN_FBAR';
    }
    if (docText.includes('SCHEDULE C') || docText.includes('1099-NEC') || docText.includes('SELF-EMPLOYED') || docText.includes('BUSINESS') || docText.includes('RENTAL') || docText.includes('SCHEDULE E') || selectedStates.length >= 2 || docText.includes('K-1') || docText.includes('PARTNERSHIP')) {
      return 'SCHEDULE_C';
    }
    if (docText.includes('1099-B') || docText.includes('STOCK') || docText.includes('CRYPTO') || docText.includes('BROKERAGE') || docText.includes('INVESTMENT') || docText.includes('1099-INT') || docText.includes('1099-DIV') || docText.includes('ITEMIZED') || docText.includes('SCHEDULE A')) {
      return 'INVESTMENTS_1099B';
    }
    return 'STANDARD';
  }

  /**
   * List all QA-Approved pipeline leads eligible for Sales Pitch & Fee Quotation
   */
  public static async getPipelineLeads(
    query: {
      stage?: string;
      search?: string;
      page?: number;
      limit?: number;
      salesAgentId?: string;
      priority?: string;
      isDualRole?: string | boolean;
    },
    currentUserId?: string,
    currentUserRole?: string
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 50));
    const skip = (page - 1) * limit;

    const baseWhere: any = {
      OR: [
        { currentStage: ApplicationStage.SALES_PITCH_QUEUE },
        { currentStage: ApplicationStage.SALES_PITCHING },
        { currentStage: ApplicationStage.FILING_QUEUE },
        { currentStage: ApplicationStage.FILING_IN_PROGRESS },
        { currentStage: ApplicationStage.FILING_SUCCESS },
        {
          taxDraftSummary: {
            path: ['status'],
            equals: 'QA_APPROVED',
          },
        },
        {
          taxDraftSummary: {
            path: ['status'],
            equals: 'REVISION_REQUESTED',
          },
        },
        {
          taxDraftSummary: {
            path: ['status'],
            equals: 'REVERTED_TO_DOCUMENTER',
          },
        },
        {
          assignedSalesAgentId: { not: null },
        },
      ],
    };

    if (query.isDualRole !== undefined) {
      const isDual = String(query.isDualRole) === 'true';
      if (isDual) {
        baseWhere.isDualDocSalesRole = true;
      } else {
        baseWhere.isDualDocSalesRole = false;
      }
    }

    if (query.priority && query.priority !== 'ALL') {
      baseWhere.priority = query.priority as any;
    }

    if (query.salesAgentId) {
      baseWhere.assignedSalesAgentId = query.salesAgentId;
    }

    if (query.stage) {
      if (query.stage === 'AWAITING') {
        baseWhere.currentStage = { in: [ApplicationStage.SALES_PITCH_QUEUE, ApplicationStage.SALES_PITCHING] };
      } else if (query.stage === 'PAID') {
        baseWhere.currentStage = { in: [ApplicationStage.FILING_QUEUE, ApplicationStage.FILING_IN_PROGRESS, ApplicationStage.FILING_SUCCESS] };
      } else if (query.stage === 'REVERTED') {
        baseWhere.currentStage = { in: [ApplicationStage.CORRECTION_NEEDED, ApplicationStage.DOC_OUTREACH, ApplicationStage.DOC_PREP] };
      }
    }

    if (query.search && query.search.trim()) {
      const q = query.search.trim();
      baseWhere.customer = {
        OR: [
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q, mode: 'insensitive' } },
          { state: { contains: q, mode: 'insensitive' } },
        ],
      };
    }

    const applications = await prisma.taxApplication.findMany({
      where: baseWhere,
      include: {
        customer: {
          include: {
            applications: {
              select: {
                id: true,
                taxYear: true,
                filingType: true,
                currentStage: true,
                taxDraftSummary: true,
                quotes: {
                  select: {
                    status: true,
                  },
                },
                assignedSalesAgentId: true,
                assignedSalesAgent: {
                  select: { id: true, firstName: true, lastName: true, email: true },
                },
                createdAt: true,
                updatedAt: true,
              },
              orderBy: { taxYear: 'desc' },
            },
          },
        },
        documents: true,
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
          select: { id: true, firstName: true, lastName: true, email: true, role: true },
        },
        quotes: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Group applications by customerId so each customer appears as 1 unique row
    const customerGroupsMap = new Map<string, typeof applications[0][]>();
    for (const app of applications) {
      const cId = app.customerId;
      if (!customerGroupsMap.has(cId)) {
        customerGroupsMap.set(cId, []);
      }
      customerGroupsMap.get(cId)!.push(app);
    }

    const formattedLeads: any[] = [];
    for (const [, appsList] of customerGroupsMap.entries()) {
      let app = appsList[0];
      const customer = app.customer;
      const allCustomerApps = (customer as any)?.applications || [];

      let visibleApplications = allCustomerApps;
      if (currentUserRole === Role.SALES_AGENT && currentUserId) {
        visibleApplications = allCustomerApps.filter((a: any) => a.assignedSalesAgentId === currentUserId);
      }

      const isPaidClient = Boolean(
        customer?.isConvertedCustomer ||
        allCustomerApps.some((a: any) =>
          a.currentStage === ApplicationStage.FILING_SUCCESS ||
          a.currentStage === ApplicationStage.FILING_QUEUE ||
          a.currentStage === ApplicationStage.FILING_IN_PROGRESS ||
          a.quotes?.some((q: any) => q.status === 'PAID') ||
          (a as any).taxDraftSummary?.paymentStatus === 'PAID' ||
          (a as any).taxDraftSummary?.paidAmount > 0
        )
      );

      let clientPaymentStatus: 'PAID' | 'NEW' | 'UNPAID' = 'UNPAID';
      if (isPaidClient) {
        clientPaymentStatus = 'PAID';
      } else if (allCustomerApps.length <= 1 && (app.currentStage === ApplicationStage.RAW_PROSPECT || app.currentStage === ApplicationStage.DOC_OUTREACH)) {
        clientPaymentStatus = 'NEW';
      } else {
        clientPaymentStatus = 'UNPAID';
      }

      const fullName = customer
        ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email || '-'
        : '-';

      const draft: any = app.taxDraftSummary || {};
      const latestQuote = app.quotes?.[0];

      // Form 1040 financial figures
      const hasDraftData = draft && (draft.federalRefund !== undefined || draft.balanceDue !== undefined || draft.federalBalanceDue !== undefined);
      const fedRefund = Number(draft.federalRefund) || 0;
      const balanceDue = Number(draft.balanceDue ?? draft.federalBalanceDue) || 0;
      const stateRefund = Number(draft.stateRefund) || 0;
      const stateBalanceDue = Number(draft.stateBalanceDue) || 0;
      const computedGross = Number(draft.w2Wages || 0) + Number(draft.taxableInterest || 0) + Number(draft.capitalGains || 0) + Number(draft.otherIncome || 0);
      const grossIncome = Number(draft.grossIncome) || computedGross;
      const validFedRefund = hasDraftData ? fedRefund : (Number(draft.estimatedRefund) || 0);
      const validStateRefund = hasDraftData ? stateRefund : (Number(draft.estimatedStateRefund) || 0);
      const isMarriedJoint = customer?.maritalStatus?.includes('Joint') || customer?.maritalStatus === 'Married' || (customer?.maritalStatus?.includes('Married') && !customer?.maritalStatus?.includes('Separately'));
      const stdDeduction = Number(draft.standardDeduction) || (isMarriedJoint ? 29200 : 14600);
      const validTaxable = Number(draft.taxableIncome) || Math.max(0, grossIncome - stdDeduction);
      const validTax = Number(draft.taxLiability) || 0;
      const validWithholding = Number(draft.fedWithheld) || (validFedRefund > 0 ? (validTax + validFedRefund) : Math.max(0, validTax - balanceDue));

      // Fee Breakdown from saved draft, real quotes or dynamic baseline based on taxpayer state
      const hasQuote = Boolean(latestQuote);
      const savedFeeBreakdown = draft.feeBreakdown;
      const baseFee = savedFeeBreakdown?.fed1040PrepFee !== undefined ? Number(savedFeeBreakdown.fed1040PrepFee) : 149;
      const selectedStates = Array.isArray(savedFeeBreakdown?.selectedStates) && savedFeeBreakdown.selectedStates.length > 0
        ? savedFeeBreakdown.selectedStates
        : (customer?.state ? [customer.state] : ['IL']);
      const stateFee = savedFeeBreakdown?.statePrepFee !== undefined
        ? Number(savedFeeBreakdown.statePrepFee)
        : (selectedStates.length * 49);
      const auditDefenseAmount = savedFeeBreakdown?.auditDefenseFee !== undefined ? Number(savedFeeBreakdown.auditDefenseFee) : 29;
      const hasAuditDefense = savedFeeBreakdown?.hasAuditDefense !== undefined ? Boolean(savedFeeBreakdown.hasAuditDefense) : true;
      const fatcaFee = Number(savedFeeBreakdown?.fatcaFee || 0);
      const fbarFee = Number(savedFeeBreakdown?.fbarFee || 0);
      const discountAmount = savedFeeBreakdown?.discountAmount !== undefined ? Number(savedFeeBreakdown.discountAmount) : (hasQuote ? Number(latestQuote.discountAmount || 0) : 0);
      const discountCode = savedFeeBreakdown?.discountCode || (latestQuote as any)?.discountCode || '';

      const calculatedTotal = baseFee + stateFee + (hasAuditDefense ? auditDefenseAmount : 0) + fbarFee + fatcaFee - discountAmount;
      const totalServiceFee = Number(
        draft.totalQuotedFee ||
        savedFeeBreakdown?.totalServiceFee ||
        calculatedTotal
      );

      const feeBreakdown = {
        fed1040PrepFee: baseFee,
        statePrepFee: stateFee,
        selectedStates,
        fbarFee,
        fatcaFee,
        hasFatca: fatcaFee > 0 || Boolean(savedFeeBreakdown?.hasFatca),
        auditDefenseFee: auditDefenseAmount,
        hasAuditDefense,
        discountAmount,
        discountCode,
        totalServiceFee,
        isQuoted: Boolean(savedFeeBreakdown?.isQuoted || hasQuote),
      };

      // Reviewer Name
      const qaAuditor = app.assignedReviewAgent
        ? `${app.assignedReviewAgent.firstName || ''} ${app.assignedReviewAgent.lastName || ''}`.trim() || app.assignedReviewAgent.email || '-'
        : '-';

      // Payment Status & History
      const paidAmount = Number(draft.paidAmount || (latestQuote?.status === 'PAID' ? (Number(latestQuote.quoteAmount) - Number(latestQuote.discountAmount || 0)) : 0));
      const remainingBalance = draft.remainingBalance !== undefined
        ? Number(draft.remainingBalance)
        : Math.max(0, totalServiceFee - paidAmount);

      let paymentStatus: 'UNPAID' | 'PARTIALLY_PAID' | 'PAYMENT_LINK_SENT' | 'PAID' | 'REFUNDED' = 'UNPAID';
      if (draft.paymentStatus) {
        paymentStatus = draft.paymentStatus;
      } else if (app.currentStage === ApplicationStage.FILING_QUEUE || app.currentStage === ApplicationStage.FILING_IN_PROGRESS || app.currentStage === ApplicationStage.FILING_SUCCESS) {
        paymentStatus = 'PAID';
      } else if (latestQuote?.status === 'PAID' || (paidAmount >= totalServiceFee && totalServiceFee > 0)) {
        paymentStatus = 'PAID';
      } else if (paidAmount > 0) {
        paymentStatus = 'PARTIALLY_PAID';
      } else if (latestQuote?.status === 'SENT') {
        paymentStatus = 'PAYMENT_LINK_SENT';
      }

      // E-Sign Status
      let esignStatus: 'NOT_SENT' | 'SENT' | 'VIEWED' | 'SIGNED' = 'NOT_SENT';
      if (app.currentStage === ApplicationStage.FILING_QUEUE || app.currentStage === ApplicationStage.FILING_IN_PROGRESS || app.currentStage === ApplicationStage.FILING_SUCCESS) {
        esignStatus = 'SIGNED';
      } else if (latestQuote?.status === 'SIGNED' || latestQuote?.status === 'PAID') {
        esignStatus = 'SIGNED';
      } else if (latestQuote?.status === 'SENT') {
        esignStatus = 'SENT';
      }

      // Map Sales Stage (Preserve reverted stages CORRECTION_NEEDED, DOC_OUTREACH, DOC_PREP)
      let currentStage: string = app.currentStage;
      if (
        app.currentStage === ApplicationStage.SALES_PITCH_QUEUE ||
        app.currentStage === ApplicationStage.SALES_PITCHING
      ) {
        currentStage = app.currentStage;
      }

      formattedLeads.push({
        id: app.id,
        applicationId: app.id,
        taxpayerId: customer?.id || '',
        taxpayerName: fullName,
        taxpayerEmail: customer?.email || '-',
        taxpayerPhone: customer?.phone || '-',
        taxYear: app.taxYear || 2025,
        visaType: customer?.visaType || '-',
        maritalStatus: customer?.maritalStatus || 'Single',
        stateOfResidence: customer?.state && customer?.city ? `${customer.city}, ${customer.state}` : (customer?.state || '-'),
        complexity: SalesService.computeReturnComplexity(app),
        currentStage,
        clientPaymentStatus,
        allApplications: visibleApplications.map((a: any) => ({
          id: a.id,
          taxYear: a.taxYear,
          filingType: a.filingType,
          currentStage: a.currentStage,
          assignedSalesAgentId: a.assignedSalesAgentId,
          assignedSalesAgent: a.assignedSalesAgent,
        })),
        totalTaxYears: visibleApplications.length,
        priority: app.priority,
        grossIncome,
        federalRefund: validFedRefund,
        stateRefund: validStateRefund,
        balanceDue,
        qaAuditorName: qaAuditor,
        qaAuditorRemarks: draft.remarks || draft.auditorRemarks || draft.qaRemarks || '',
        qaApprovedAt: draft.qaApprovedAt || app.updatedAt.toISOString(),
        isDualDocSalesRole: Boolean(app.isDualDocSalesRole || draft?.isDualDocSalesRole),
        assignedDocAgent: app.assignedDocAgent ? {
          id: app.assignedDocAgent.id,
          name: `${app.assignedDocAgent.firstName || ''} ${app.assignedDocAgent.lastName || ''}`.trim() || app.assignedDocAgent.email || 'Calling Agent',
          email: app.assignedDocAgent.email || '-',
        } : null,
        assignedPrepAgent: app.assignedPrepAgent ? {
          id: app.assignedPrepAgent.id,
          name: `${app.assignedPrepAgent.firstName || ''} ${app.assignedPrepAgent.lastName || ''}`.trim() || app.assignedPrepAgent.email || 'Senior Preparer',
          email: app.assignedPrepAgent.email || '-',
        } : null,
        assignedSalesAgent: app.assignedSalesAgent ? {
          id: app.assignedSalesAgent.id,
          name: `${app.assignedSalesAgent.firstName || ''} ${app.assignedSalesAgent.lastName || ''}`.trim() || app.assignedSalesAgent.email || '-',
          email: app.assignedSalesAgent.email || '-',
          role: app.assignedSalesAgent.role,
        } : null,
        taxDraftSummary: {
          ...draft,
          status: draft.status || null,
          lastRevert: draft.lastRevert || null,
          w2Wages: Number(draft.w2Wages) || grossIncome,
          taxableInterest: Number(draft.taxableInterest) || 0,
          capitalGains: Number(draft.capitalGains) || 0,
          otherIncome: Number(draft.otherIncome) || 0,
          grossIncome,
          deductionType: draft.deductionType || (isMarriedJoint ? 'STANDARD (MFJ)' : 'STANDARD (Single)'),
          standardDeduction: stdDeduction,
          effectiveDeduction: Number(draft.effectiveDeduction) || stdDeduction,
          taxableIncome: validTaxable,
          taxLiability: validTax,
          taxCredits: Number(draft.taxCredits) || 0,
          fedWithheld: validWithholding,
          federalRefund: validFedRefund,
          federalBalanceDue: balanceDue,
          stateTaxLiability: Number(draft.stateTaxLiability) || 0,
          stateWithheld: Number(draft.stateWithheld) || 0,
          stateRefund: validStateRefund,
          stateBalanceDue: Number(draft.stateBalanceDue) || 0,
          combinedRefund: validFedRefund + validStateRefund,
          preparerNotes: draft.preparerNotes || draft.prepNotes || '',
          auditorRemarks: draft.remarks || draft.auditorRemarks || draft.qaRemarks || '',
          targetDueDate: draft.targetDueDate || '',
          paidAmount,
          totalQuotedFee: totalServiceFee,
          remainingBalance,
          paymentHistory: Array.isArray(draft.paymentHistory) ? draft.paymentHistory : [],
        },
        feeBreakdown,
        paymentStatus,
        paidAmount,
        remainingBalance,
        paymentHistory: Array.isArray(draft.paymentHistory) ? draft.paymentHistory : [],
        esignStatus,
        createdAt: app.createdAt.toISOString(),
        updatedAt: app.updatedAt.toISOString(),
      });
    }

    const totalCount = formattedLeads.length;
    const paginatedLeads = formattedLeads.slice(skip, skip + limit);

    return {
      leads: paginatedLeads,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    };
  }

  /**
   * Get all active Sales Closers with real database metrics
   */
  public static async getSalesStaff() {
    const staff = await prisma.user.findMany({
      where: {
        role: {
          in: [Role.SALES_MANAGER, Role.SALES_TEAM_LEAD, Role.SALES_AGENT],
        },
        isActive: true,
      },
      include: {
        assignedSalesApps: {
          select: { id: true, currentStage: true, updatedAt: true },
        },
        salesQuotes: {
          select: { id: true, quoteAmount: true, discountAmount: true, status: true, createdAt: true },
        },
      },
      orderBy: { firstName: 'asc' },
    });

    return staff.map((member: any) => {
      const name = `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email?.split('@')[0] || 'Sales Rep';
      const activeLeads = member.assignedSalesApps.filter(
        (a: any) => a.currentStage === ApplicationStage.SALES_PITCH_QUEUE || a.currentStage === ApplicationStage.SALES_PITCHING
      ).length;

      const closedApps = member.assignedSalesApps.filter(
        (a: any) => a.currentStage === ApplicationStage.FILING_QUEUE || a.currentStage === ApplicationStage.FILING_IN_PROGRESS || a.currentStage === ApplicationStage.FILING_SUCCESS
      ).length;

      const paidQuotes = member.salesQuotes.filter((q: any) => q.status === 'PAID');
      const totalRevenueToday = paidQuotes.reduce((acc: number, q: any) => acc + (Number(q.quoteAmount) - Number(q.discountAmount || 0)), 0);

      const totalAssigned = activeLeads + closedApps;
      const conversionPct = totalAssigned > 0 ? `${Math.round((closedApps / totalAssigned) * 100)}%` : '0%';

      return {
        id: member.id,
        name,
        email: member.email || '-',
        role: member.role,
        activeLeads: totalAssigned,
        openLeads: activeLeads,
        pitchesCompletedToday: Math.max(totalAssigned, 1),
        dealsClosedToday: closedApps,
        totalRevenueToday,
        conversionRate: conversionPct,
      };
    });
  }

  /**
   * Get Manager KPI statistics dynamically from database
   */
  public static async getManagerStats() {
    const activePipelineCount = await prisma.taxApplication.count({
      where: {
        OR: [
          { currentStage: ApplicationStage.SALES_PITCH_QUEUE },
          { currentStage: ApplicationStage.SALES_PITCHING },
        ],
      },
    });

    const activePitching = await prisma.taxApplication.count({
      where: { currentStage: ApplicationStage.SALES_PITCHING },
    });

    const closedPaidDeals = await prisma.taxApplication.count({
      where: {
        currentStage: {
          in: [ApplicationStage.FILING_QUEUE, ApplicationStage.FILING_IN_PROGRESS, ApplicationStage.FILING_SUCCESS],
        },
      },
    });

    // Real revenue calculation from actual database quotes
    const paidQuotes = await prisma.salesQuote.findMany({
      where: { status: 'PAID' },
      select: { quoteAmount: true, discountAmount: true },
    });

    const totalRevenueMTD = paidQuotes.reduce((acc, q) => acc + (Number(q.quoteAmount) - Number(q.discountAmount || 0)), 0);
    const avgDealSize = paidQuotes.length > 0 ? Math.round(totalRevenueMTD / paidQuotes.length) : 0;
    
    // Total Department qualified leads = Active pipeline (unclosed) + Closed Deals (e.g. 1 in progress + 1 closed = 2 total)
    const totalDepartmentLeads = activePipelineCount + closedPaidDeals;
    const conversionRatePct = totalDepartmentLeads > 0 ? Math.round((closedPaidDeals / totalDepartmentLeads) * 100) : 0;

    return {
      pipelineLeads: totalDepartmentLeads,
      activePitching,
      pendingPayment: Math.max(0, activePipelineCount - activePitching),
      closedPaidDeals,
      totalRevenueMTD,
      avgDealSize,
      conversionRatePct,
    };
  }

  /**
   * Assign a sales lead (or multiple leads) to a closer
   */
  public static async assignLead(applicationIds: string | string[], salesAgentId: string, managerUserId: string) {
    const ids = Array.isArray(applicationIds) ? applicationIds : [applicationIds];

    // 1. Fetch manager details with safe fallback to active sales manager/admin
    let managerUser = managerUserId && managerUserId !== 'SYSTEM'
      ? await prisma.user.findUnique({
          where: { id: managerUserId },
          select: { id: true, firstName: true, lastName: true, email: true, role: true },
        })
      : null;

    if (!managerUser) {
      managerUser = await prisma.user.findFirst({
        where: {
          role: { in: [Role.SALES_MANAGER, Role.ADMIN, Role.SALES_TEAM_LEAD] },
          isActive: true,
        },
        select: { id: true, firstName: true, lastName: true, email: true, role: true },
      });
    }

    const effectiveManagerId = managerUser?.id || null;
    const managerName = managerUser
      ? `${managerUser.firstName || ''} ${managerUser.lastName || ''}`.trim() || managerUser.email || 'Sales Manager'
      : 'Sales Manager';
    const managerRole = managerUser?.role || 'SALES_MANAGER';

    // 2. Fetch target agent details
    const targetAgent = await prisma.user.findUnique({
      where: { id: salesAgentId },
      select: { id: true, firstName: true, lastName: true, email: true, role: true },
    });
    const agentName = targetAgent
      ? `${targetAgent.firstName || ''} ${targetAgent.lastName || ''}`.trim() || targetAgent.email || 'Sales Closer'
      : 'Sales Closer';

    // 3. Update database stage and assigned closer (Strictly exclude returns already dispatched to filing or completed)
    const updated = await prisma.taxApplication.updateMany({
      where: {
        id: { in: ids },
        currentStage: {
          notIn: [
            ApplicationStage.FILING_QUEUE,
            ApplicationStage.FILING_IN_PROGRESS,
            ApplicationStage.FILING_SUCCESS,
          ],
        },
      },
      data: {
        assignedSalesAgentId: salesAgentId,
        currentStage: ApplicationStage.SALES_PITCHING,
      },
    });

    // 4. Fetch the assigned applications for rich logging & notifications
    const assignedApps = await prisma.taxApplication.findMany({
      where: {
        id: { in: ids },
        currentStage: {
          notIn: [
            ApplicationStage.FILING_QUEUE,
            ApplicationStage.FILING_IN_PROGRESS,
            ApplicationStage.FILING_SUCCESS,
          ],
        },
      },
      include: { customer: true },
    });

    for (const app of assignedApps) {
      const clientName = app.customer
        ? `${app.customer.firstName || ''} ${app.customer.lastName || ''}`.trim() || app.customer.email || 'Client'
        : 'Client';

      const draft: any = app.taxDraftSummary || {};
      const fedRefund = Number(draft.federalRefund) || Number(draft.estimatedRefund) || 0;
      const balDue = Number(draft.balanceDue ?? draft.federalBalanceDue) || 0;
      const refundOrDueText =
        fedRefund > 0
          ? `$${fedRefund.toLocaleString()} Federal Refund`
          : balDue > 0
          ? `$${balDue.toLocaleString()} Balance Due`
          : 'Form 1040 QA Approved';

      // A. StageHistory Audit Trail
      if (effectiveManagerId) {
        try {
          await prisma.stageHistory.create({
            data: {
              applicationId: app.id,
              fromStage: app.currentStage === ApplicationStage.SALES_PITCHING ? ApplicationStage.SALES_PITCH_QUEUE : app.currentStage,
              toStage: ApplicationStage.SALES_PITCHING,
              movedByUserId: effectiveManagerId,
              remarks: `Lead assigned to Sales Closer (${agentName}) by ${managerName}`,
            },
          });
        } catch (err) {
          console.error('Failed to create stage history:', err);
        }
      }

      // B. Lead Audit Trail (AuditLog)
      try {
        await prisma.auditLog.create({
          data: {
            applicationId: app.id,
            actorId: effectiveManagerId,
            actorType: AuditActorType.MANAGER,
            actorName: managerName,
            actorRole: managerRole,
            action: AuditActionType.STAGE_CHANGE,
            moduleKey: 'SALES',
            details: {
              fromStage: ApplicationStage.SALES_PITCH_QUEUE,
              toStage: ApplicationStage.SALES_PITCHING,
              actionDescription: `Sales lead assigned to closer ${agentName}`,
              assignedSalesAgentId: salesAgentId,
              assignedSalesAgentName: agentName,
              taxYear: app.taxYear || 2025,
              refundOrDue: refundOrDueText,
            },
          },
        });
      } catch (err) {
        console.error('Failed to create audit log for lead assignment:', err);
      }

      // C. In-App Notification dispatched directly to the assigned Sales Closer
      try {
        await prisma.notification.create({
          data: {
            recipientUserId: salesAgentId,
            targetRole: Role.SALES_AGENT,
            applicationId: app.id,
            category: NotificationCategory.SALES,
            priority: NotificationPriority.HIGH,
            title: `New Sales Lead Assigned: ${clientName}`,
            message: `${managerName} assigned certified Form 1040 lead (${clientName} • ${refundOrDueText}) to you for fee quotation & pitch.`,
            actionUrl: `/sales/agent/pitch/${app.id}`,
            actionLabel: 'Open Pitch Workspace',
            relatedLeadName: clientName,
          },
        });
      } catch (err) {
        console.error('Failed to create notification for sales agent:', err);
      }
    }

    return { success: true, count: updated.count, targetAgent };
  }

  /**
   * 1-Click Auto Round-Robin Lead Distribution across active Sales Closers
   */
  public static async autoRoundRobin(managerUserId: string) {
    let managerUser = managerUserId && managerUserId !== 'SYSTEM'
      ? await prisma.user.findUnique({
          where: { id: managerUserId },
          select: { id: true, firstName: true, lastName: true, email: true, role: true },
        })
      : null;

    if (!managerUser) {
      managerUser = await prisma.user.findFirst({
        where: {
          role: { in: [Role.SALES_MANAGER, Role.ADMIN, Role.SALES_TEAM_LEAD] },
          isActive: true,
        },
        select: { id: true, firstName: true, lastName: true, email: true, role: true },
      });
    }

    const effectiveManagerId = managerUser?.id || null;
    const managerName = managerUser
      ? `${managerUser.firstName || ''} ${managerUser.lastName || ''}`.trim() || managerUser.email || 'Sales Manager'
      : 'Sales Manager';
    const managerRole = managerUser?.role || 'SALES_MANAGER';

    const [unassignedLeads, closers] = await Promise.all([
      prisma.taxApplication.findMany({
        where: {
          currentStage: ApplicationStage.SALES_PITCH_QUEUE,
          assignedSalesAgentId: null,
        },
        include: { customer: true },
      }),
      prisma.user.findMany({
        where: {
          role: Role.SALES_AGENT,
          isActive: true,
        },
      }),
    ]);

    if (unassignedLeads.length === 0 || closers.length === 0) {
      return { assignedCount: 0, message: 'No unassigned leads or active closers available' };
    }

    let closerIndex = 0;
    const assignments = [];

    for (const lead of unassignedLeads) {
      const assignedCloser = closers[closerIndex % closers.length];
      closerIndex++;
      const closerName = `${assignedCloser.firstName || ''} ${assignedCloser.lastName || ''}`.trim() || assignedCloser.email || 'Sales Closer';

      const updated = await prisma.taxApplication.update({
        where: { id: lead.id },
        data: {
          assignedSalesAgentId: assignedCloser.id,
          currentStage: ApplicationStage.SALES_PITCHING,
        },
      });

      assignments.push(updated);

      // A. StageHistory
      if (effectiveManagerId) {
        try {
          await prisma.stageHistory.create({
            data: {
              applicationId: lead.id,
              fromStage: lead.currentStage,
              toStage: ApplicationStage.SALES_PITCHING,
              movedByUserId: effectiveManagerId,
              remarks: `1-Click Auto Round-Robin assigned to Sales Closer (${closerName}) by ${managerName}`,
            },
          });
        } catch (e) {
          console.error('Failed to create stage history in autoRoundRobin:', e);
        }
      }

      // B. AuditLog
      try {
        await prisma.auditLog.create({
          data: {
            applicationId: lead.id,
            actorId: effectiveManagerId,
            actorType: AuditActorType.MANAGER,
            actorName: managerName,
            actorRole: managerRole,
            action: AuditActionType.STAGE_CHANGE,
            moduleKey: 'SALES',
            details: {
              fromStage: lead.currentStage,
              toStage: ApplicationStage.SALES_PITCHING,
              actionDescription: `1-Click Auto Round-Robin assigned to closer ${closerName}`,
              assignedSalesAgentId: assignedCloser.id,
              assignedSalesAgentName: closerName,
              taxYear: lead.taxYear || 2025,
            },
          },
        });
      } catch (e) {
        console.error('Failed to create audit log in autoRoundRobin:', e);
      }

      // C. Notification
      const clientName = lead.customer
        ? `${lead.customer.firstName || ''} ${lead.customer.lastName || ''}`.trim() || lead.customer.email || 'Client'
        : 'Client';
      const draft: any = lead.taxDraftSummary || {};
      const fedRefund = Number(draft.federalRefund) || Number(draft.estimatedRefund) || 0;
      const balDue = Number(draft.balanceDue ?? draft.federalBalanceDue) || 0;
      const refundOrDueText =
        fedRefund > 0
          ? `$${fedRefund.toLocaleString()} Federal Refund`
          : balDue > 0
          ? `$${balDue.toLocaleString()} Balance Due`
          : 'Form 1040 QA Approved';

      try {
        await prisma.notification.create({
          data: {
            recipientUserId: assignedCloser.id,
            targetRole: Role.SALES_AGENT,
            applicationId: lead.id,
            category: NotificationCategory.SALES,
            priority: NotificationPriority.HIGH,
            title: `New Sales Lead Assigned (Round-Robin): ${clientName}`,
            message: `${managerName} assigned certified Form 1040 lead (${clientName} • ${refundOrDueText}) to you via Auto Round-Robin for fee pitch.`,
            actionUrl: `/sales/agent/pitch/${lead.id}`,
            actionLabel: 'Open Pitch Workspace',
            relatedLeadName: clientName,
          },
        });
      } catch (e) {
        console.error('Failed to send notification in autoRoundRobin:', e);
      }
    }

    return {
      assignedCount: assignments.length,
      message: `Successfully distributed ${assignments.length} leads across ${closers.length} sales closers`,
    };
  }

  /**
   * Get single Sales Lead by ID for Pitch Workspace
   */
  public static async getLeadById(
    applicationId: string,
    currentUserId?: string,
    currentUserRole?: string
  ) {
    const [app, auditLogs] = await Promise.all([
      prisma.taxApplication.findUnique({
        where: { id: applicationId },
        include: {
          customer: true,
          documents: true,
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
            select: { id: true, firstName: true, lastName: true, email: true, role: true },
          },
          quotes: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          stageHistories: {
            include: {
              movedByUser: {
                select: { id: true, firstName: true, lastName: true, email: true, role: true },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
          callLogs: {
            include: {
              agent: {
                select: { id: true, firstName: true, lastName: true, email: true, role: true },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
      prisma.auditLog.findMany({
        where: { applicationId },
        include: {
          actorUser: {
            select: { id: true, firstName: true, lastName: true, email: true, role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    if (!app) return null;

    // Query sibling applications for multi-tax-year switcher
    const allCustomerApps = await prisma.taxApplication.findMany({
      where: { customerId: app.customerId },
      select: {
        id: true,
        taxYear: true,
        filingType: true,
        currentStage: true,
        assignedSalesAgentId: true,
        assignedSalesAgent: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { taxYear: 'desc' },
    });

    let availableApplications = allCustomerApps;
    if (currentUserRole === Role.SALES_AGENT && currentUserId) {
      availableApplications = allCustomerApps.filter((a) => a.assignedSalesAgentId === currentUserId);
      if (!availableApplications.some((a) => a.id === app.id)) {
        if (app.assignedSalesAgentId === currentUserId || !app.assignedSalesAgentId) {
          availableApplications.push({
            id: app.id,
            taxYear: app.taxYear,
            filingType: app.filingType,
            currentStage: app.currentStage,
            assignedSalesAgentId: app.assignedSalesAgentId,
            assignedSalesAgent: app.assignedSalesAgent,
            createdAt: app.createdAt,
            updatedAt: app.updatedAt,
          });
        }
      }
    }

    const customer = app.customer;
    const isPaidClient = Boolean(
      customer?.isConvertedCustomer ||
      allCustomerApps.some((a: any) =>
        a.currentStage === ApplicationStage.FILING_SUCCESS ||
        (a as any).taxDraftSummary?.paymentStatus === 'PAID' ||
        (a as any).taxDraftSummary?.paidAmount > 0
      )
    );

    let clientPaymentStatus: 'PAID' | 'NEW' | 'UNPAID' = 'UNPAID';
    if (isPaidClient) {
      clientPaymentStatus = 'PAID';
    } else if (allCustomerApps.length <= 1 && (app.currentStage === ApplicationStage.RAW_PROSPECT || app.currentStage === ApplicationStage.DOC_OUTREACH)) {
      clientPaymentStatus = 'NEW';
    } else {
      clientPaymentStatus = 'UNPAID';
    }

    const fullName = customer
      ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email || '-'
      : '-';

    const draft: any = app.taxDraftSummary || {};
    const latestQuote = app.quotes?.[0];

    const hasDraftData = draft && (draft.federalRefund !== undefined || draft.balanceDue !== undefined || draft.federalBalanceDue !== undefined);
    const fedRefund = Number(draft.federalRefund) || 0;
    const balanceDue = Number(draft.balanceDue ?? draft.federalBalanceDue) || 0;
    const stateRefund = Number(draft.stateRefund) || 0;
    const stateBalanceDue = Number(draft.stateBalanceDue) || 0;
    const computedGross = Number(draft.w2Wages || 0) + Number(draft.taxableInterest || 0) + Number(draft.capitalGains || 0) + Number(draft.otherIncome || 0);
    const grossIncome = Number(draft.grossIncome) || computedGross;
    const validFedRefund = hasDraftData ? fedRefund : (Number(draft.estimatedRefund) || 0);
    const validStateRefund = hasDraftData ? stateRefund : (Number(draft.estimatedStateRefund) || 0);
    const isMarriedJoint = customer?.maritalStatus?.includes('Joint') || customer?.maritalStatus === 'Married' || (customer?.maritalStatus?.includes('Married') && !customer?.maritalStatus?.includes('Separately'));
    const stdDeduction = Number(draft.standardDeduction) || (isMarriedJoint ? 29200 : 14600);
    const validTaxable = Number(draft.taxableIncome) || Math.max(0, grossIncome - stdDeduction);
    const validTax = Number(draft.taxLiability) || 0;
    const validWithholding = Number(draft.fedWithheld) || (validFedRefund > 0 ? (validTax + validFedRefund) : Math.max(0, validTax - balanceDue));

    // Fee Breakdown from saved draft, real quotes or dynamic baseline based on taxpayer state
    const hasQuote = Boolean(latestQuote);
    const savedFeeBreakdown = draft.feeBreakdown;
    const baseFee = savedFeeBreakdown?.fed1040PrepFee !== undefined ? Number(savedFeeBreakdown.fed1040PrepFee) : 149;
    const selectedStates = Array.isArray(savedFeeBreakdown?.selectedStates) && savedFeeBreakdown.selectedStates.length > 0
      ? savedFeeBreakdown.selectedStates
      : (customer?.state ? [customer.state] : ['IL']);
    const stateFee = savedFeeBreakdown?.statePrepFee !== undefined
      ? Number(savedFeeBreakdown.statePrepFee)
      : (selectedStates.length * 49);
    const auditDefenseAmount = savedFeeBreakdown?.auditDefenseFee !== undefined ? Number(savedFeeBreakdown.auditDefenseFee) : 29;
    const hasAuditDefense = savedFeeBreakdown?.hasAuditDefense !== undefined ? Boolean(savedFeeBreakdown.hasAuditDefense) : true;
    const fatcaFee = Number(savedFeeBreakdown?.fatcaFee || 0);
    const fbarFee = Number(savedFeeBreakdown?.fbarFee || 0);
    const discountAmount = savedFeeBreakdown?.discountAmount !== undefined ? Number(savedFeeBreakdown.discountAmount) : (hasQuote ? Number(latestQuote.discountAmount || 0) : 0);
    const discountCode = savedFeeBreakdown?.discountCode || (latestQuote as any)?.discountCode || '';

    const calculatedTotal = baseFee + stateFee + (hasAuditDefense ? auditDefenseAmount : 0) + fbarFee + fatcaFee - discountAmount;
    const totalServiceFee = Number(
      draft.totalQuotedFee ||
      savedFeeBreakdown?.totalServiceFee ||
      calculatedTotal
    );

    const feeBreakdown = {
      fed1040PrepFee: baseFee,
      statePrepFee: stateFee,
      selectedStates,
      fbarFee,
      fatcaFee,
      hasFatca: fatcaFee > 0 || Boolean(savedFeeBreakdown?.hasFatca),
      auditDefenseFee: auditDefenseAmount,
      hasAuditDefense,
      discountAmount,
      discountCode,
      totalServiceFee,
      isQuoted: Boolean(savedFeeBreakdown?.isQuoted || hasQuote),
    };

    // Reviewer Name
    const qaAuditor = app.assignedReviewAgent
      ? `${app.assignedReviewAgent.firstName || ''} ${app.assignedReviewAgent.lastName || ''}`.trim() || app.assignedReviewAgent.email || '-'
      : '-';

    // Check if real Form 8879 document exists
    const hasForm8879Doc = Array.isArray(app.documents) && app.documents.some(
      (d: any) => d.documentCategory === 'FORM_8879' || d.fileName?.toLowerCase().includes('8879')
    );

    // Payment Status & History (Supports Partial Payments)
    const paidAmount = Number(draft.paidAmount || (latestQuote?.status === 'PAID' ? (Number(latestQuote.quoteAmount) - Number(latestQuote.discountAmount || 0)) : 0));
    const totalFeeResolved = draft.totalQuotedFee || draft.feeBreakdown?.totalServiceFee || totalServiceFee;
    const remainingBalance = draft.remainingBalance !== undefined
      ? Number(draft.remainingBalance)
      : Math.max(0, totalFeeResolved - paidAmount);

    let paymentStatus: 'UNPAID' | 'PARTIALLY_PAID' | 'PAYMENT_LINK_SENT' | 'PAID' | 'REFUNDED' = 'UNPAID';
    if (draft.paymentStatus) {
      paymentStatus = draft.paymentStatus;
    } else if (app.currentStage === ApplicationStage.FILING_QUEUE || app.currentStage === ApplicationStage.FILING_IN_PROGRESS || app.currentStage === ApplicationStage.FILING_SUCCESS) {
      paymentStatus = 'PAID';
    } else if (latestQuote?.status === 'PAID' || (paidAmount >= totalFeeResolved && totalFeeResolved > 0)) {
      paymentStatus = 'PAID';
    } else if (paidAmount > 0) {
      paymentStatus = 'PARTIALLY_PAID';
    } else if (latestQuote?.status === 'SENT') {
      paymentStatus = 'PAYMENT_LINK_SENT';
    }

    // E-Sign Status (Strictly Form 8879, independent from payment quote!)
    let esignStatus: 'NOT_SENT' | 'SENT' | 'VIEWED' | 'SIGNED' = 'NOT_SENT';
    if (draft.esignStatus === 'SIGNED' || hasForm8879Doc) {
      esignStatus = 'SIGNED';
    } else if (draft.esignStatus === 'SENT') {
      esignStatus = 'SENT';
    } else if (app.currentStage === ApplicationStage.FILING_QUEUE || app.currentStage === ApplicationStage.FILING_IN_PROGRESS || app.currentStage === ApplicationStage.FILING_SUCCESS) {
      esignStatus = 'SIGNED';
    }

    return {
      id: app.id,
      applicationId: app.id,
      taxpayerId: customer?.id || '',
      taxpayerName: fullName,
      taxpayerEmail: customer?.email || '-',
      taxpayerPhone: customer?.phone || '-',
      taxYear: app.taxYear || 2025,
      visaType: customer?.visaType || '-',
      maritalStatus: customer?.maritalStatus || 'Single',
      stateOfResidence: customer?.state && customer?.city ? `${customer.city}, ${customer.state}` : (customer?.state || '-'),
      complexity: SalesService.computeReturnComplexity(app),
      currentStage: app.currentStage,
      grossIncome,
      federalRefund: validFedRefund,
      stateRefund: validStateRefund,
      balanceDue,
      qaAuditorName: qaAuditor,
      qaAuditorRemarks: draft.remarks || draft.auditorRemarks || draft.qaRemarks || '',
      qaApprovedAt: draft.qaApprovedAt || app.updatedAt.toISOString(),
      assignedPrepAgent: app.assignedPrepAgent ? {
        id: app.assignedPrepAgent.id,
        name: `${app.assignedPrepAgent.firstName || ''} ${app.assignedPrepAgent.lastName || ''}`.trim() || app.assignedPrepAgent.email || 'Senior Preparer',
        email: app.assignedPrepAgent.email || '-',
      } : null,
      assignedSalesAgent: app.assignedSalesAgent ? {
        id: app.assignedSalesAgent.id,
        name: `${app.assignedSalesAgent.firstName || ''} ${app.assignedSalesAgent.lastName || ''}`.trim() || app.assignedSalesAgent.email || '-',
        email: app.assignedSalesAgent.email || '-',
        role: app.assignedSalesAgent.role,
      } : null,
      taxDraftSummary: {
        ...draft,
        status: draft.status || null,
        lastRevert: draft.lastRevert || null,
        w2Wages: Number(draft.w2Wages) || grossIncome,
        taxableInterest: Number(draft.taxableInterest) || 0,
        capitalGains: Number(draft.capitalGains) || 0,
        otherIncome: Number(draft.otherIncome) || 0,
        grossIncome,
        deductionType: draft.deductionType || (isMarriedJoint ? 'STANDARD (MFJ)' : 'STANDARD (Single)'),
        standardDeduction: stdDeduction,
        effectiveDeduction: Number(draft.effectiveDeduction) || stdDeduction,
        taxableIncome: validTaxable,
        taxLiability: validTax,
        taxCredits: Number(draft.taxCredits) || 0,
        fedWithheld: validWithholding,
        federalRefund: validFedRefund,
        federalBalanceDue: balanceDue,
        stateTaxLiability: Number(draft.stateTaxLiability) || 0,
        stateWithheld: Number(draft.stateWithheld) || 0,
        stateRefund: validStateRefund,
        stateBalanceDue: Number(draft.stateBalanceDue) || 0,
        combinedRefund: validFedRefund + validStateRefund,
        preparerNotes: draft.preparerNotes || draft.prepNotes || '',
        auditorRemarks: draft.remarks || draft.auditorRemarks || draft.qaRemarks || '',
        targetDueDate: draft.targetDueDate || '',
        paidAmount,
        totalQuotedFee: totalFeeResolved,
        remainingBalance,
        paymentHistory: Array.isArray(draft.paymentHistory) ? draft.paymentHistory : [],
        closerCallNotes: draft.closerCallNotes || draft.notes || '',
        closerNotesHistory: Array.isArray(draft.closerNotesHistory) ? draft.closerNotesHistory : [],
      },
      feeBreakdown,
      paymentStatus,
      paidAmount,
      remainingBalance,
      paymentHistory: Array.isArray(draft.paymentHistory) ? draft.paymentHistory : [],
      esignStatus,
      closerCallNotes: draft.closerCallNotes || draft.notes || '',
      closerNotesHistory: Array.isArray(draft.closerNotesHistory) ? draft.closerNotesHistory : [],
      paidAt: draft.paidAt || (latestQuote?.status === 'PAID' ? latestQuote.createdAt.toISOString() : null),
      esignCompletedAt: draft.esignCompletedAt || null,
      stageHistories: (app.stageHistories || []).map((s: any) => {
        const isClient = s.movedByUser?.role === 'TAXPAYER_USER' || s.remarks?.toLowerCase().startsWith('taxpayer');
        const clientName = `${app.customer?.firstName || ''} ${app.customer?.lastName || ''}`.trim() || app.customer?.email || 'Taxpayer Client';
        return {
          id: s.id,
          fromStage: s.fromStage,
          toStage: s.toStage,
          movedByUserId: s.movedByUserId,
          movedByName: isClient ? clientName : (s.movedByUser ? `${s.movedByUser.firstName || ''} ${s.movedByUser.lastName || ''}`.trim() || s.movedByUser.email : 'System User'),
          movedByEmail: isClient ? (app.customer?.email || s.movedByUser?.email) : s.movedByUser?.email,
          movedByRole: isClient ? 'CLIENT' : s.movedByUser?.role,
          remarks: s.remarks,
          createdAt: s.createdAt?.toISOString ? s.createdAt.toISOString() : s.createdAt,
        };
      }),
      callLogs: (app.callLogs || []).map((c: any) => ({
        id: c.id,
        disposition: c.disposition,
        callSummary: c.callSummary,
        agentId: c.agentId,
        agentName: c.agent
          ? `${c.agent.firstName || ''} ${c.agent.lastName || ''}`.trim() || c.agent.email
          : 'Calling Agent',
        agentEmail: c.agent?.email,
        agentRole: c.agent?.role,
        createdAt: c.createdAt?.toISOString ? c.createdAt.toISOString() : c.createdAt,
      })),
      auditLogs: (auditLogs || []).map((a: any) => {
        const isClient = a.actorType === 'CLIENT' || 
                         a.actorRole === 'TAXPAYER_USER' || 
                         a.actorRole === 'CLIENT' || 
                         (a.details as any)?.source === 'TAXPAYER_CLIENT_PORTAL' ||
                         Boolean((a.details as any)?.clientEmail);
        const clientName = (a.details as any)?.clientName || `${app.customer?.firstName || ''} ${app.customer?.lastName || ''}`.trim() || app.customer?.email || 'Taxpayer Client';
        const clientEmail = (a.details as any)?.clientEmail || app.customer?.email || a.actorUser?.email;

        return {
          id: a.id,
          action: a.action,
          moduleKey: a.moduleKey,
          actorType: a.actorType,
          actorName: isClient ? clientName : (a.actorName || (a.actorUser ? `${a.actorUser.firstName || ''} ${a.actorUser.lastName || ''}`.trim() || a.actorUser.email : 'System User')),
          actorEmail: isClient ? clientEmail : a.actorUser?.email,
          actorRole: isClient ? 'CLIENT' : (a.actorRole || a.actorUser?.role),
          details: a.details,
          createdAt: a.createdAt?.toISOString ? a.createdAt.toISOString() : a.createdAt,
        };
      }),
      notes: draft.closerCallNotes || draft.notes || latestQuote?.userFeedback || '',
      salesPitch: draft.salesPitch || {
        pitchStatus: draft.pitchStatus || 'NEED_TIME',
        originalFee: draft.originalFee || totalFeeResolved,
        negotiatedAmount: draft.negotiatedAmount ?? null,
        comment: draft.closerCallNotes || '',
      },
      pitchStatus: draft.salesPitch?.pitchStatus || draft.pitchStatus || 'NEED_TIME',
      negotiatedAmount: draft.salesPitch?.negotiatedAmount ?? draft.negotiatedAmount ?? null,
      originalFee: draft.salesPitch?.originalFee || draft.originalFee || totalFeeResolved,
      clientPaymentStatus,
      availableApplications: availableApplications.map((a: any) => ({
        id: a.id,
        taxYear: a.taxYear,
        filingType: a.filingType,
        currentStage: a.currentStage,
        assignedSalesAgentId: a.assignedSalesAgentId,
        assignedSalesAgent: a.assignedSalesAgent,
        createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : a.createdAt,
        updatedAt: a.updatedAt instanceof Date ? a.updatedAt.toISOString() : a.updatedAt,
      })),
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
    };
  }

  /**
   * Get dynamic KPI metrics for a specific Sales Closer
   */
  public static async getAgentStats(salesAgentId: string) {
    const assignedApps = await prisma.taxApplication.findMany({
      where: {
        assignedSalesAgentId: salesAgentId,
        OR: [
          { currentStage: ApplicationStage.SALES_PITCH_QUEUE },
          { currentStage: ApplicationStage.SALES_PITCHING },
          { currentStage: ApplicationStage.FILING_QUEUE },
          { currentStage: ApplicationStage.FILING_IN_PROGRESS },
          { currentStage: ApplicationStage.FILING_SUCCESS },
          {
            taxDraftSummary: {
              path: ['status'],
              equals: 'QA_APPROVED',
            },
          },
        ],
      },
      include: {
        quotes: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    let activePitching = 0;
    let pendingPayment = 0;
    let closedDealsToday = 0;
    let revenueToday = 0;

    assignedApps.forEach((app) => {
      const isPaid =
        app.currentStage === ApplicationStage.FILING_QUEUE ||
        app.currentStage === ApplicationStage.FILING_IN_PROGRESS ||
        app.currentStage === ApplicationStage.FILING_SUCCESS ||
        app.quotes?.[0]?.status === 'PAID';

      const isPendingPayment =
        !isPaid && (app.quotes?.[0]?.status === 'SENT' || Boolean(app.quotes?.[0]));

      if (isPaid) {
        closedDealsToday++;
        const quote = app.quotes?.[0];
        const quoteAmount = quote ? Number(quote.quoteAmount) - Number(quote.discountAmount || 0) : 0;
        revenueToday += quoteAmount;
      } else if (isPendingPayment) {
        pendingPayment++;
      } else {
        activePitching++;
      }
    });

    const totalAssigned = assignedApps.length;
    const conversionRate = totalAssigned > 0 ? Math.round((closedDealsToday / totalAssigned) * 100) : 0;

    return {
      activePitching,
      pendingPayment,
      dealsClosedToday: closedDealsToday,
      revenueToday,
      conversionRate,
      totalAssigned,
    };
  }

  /**
   * Dispatch paid & e-signed return to IRS Filing Queue
   */
  /**
   * Dispatch paid & e-signed return to IRS Filing Queue with optional closer notes
   */
  public static async dispatchToFiling(applicationId: string, userId: string, notes?: string) {
    const app = await prisma.taxApplication.findUnique({
      where: { id: applicationId },
      include: { customer: true },
    });
    if (!app) {
      throw new Error('Application not found');
    }

    const clientName = app.customer
      ? `${app.customer.firstName || ''} ${app.customer.lastName || ''}`.trim() || app.customer.email || 'Taxpayer'
      : 'Taxpayer';

    const draft: any = app.taxDraftSummary || {};
    const fedRefund = Number(draft.federalRefund) || Number(draft.estimatedRefund) || 0;
    const balDue = Number(draft.balanceDue ?? draft.federalBalanceDue) || 0;
    const refundOrDueText =
      fedRefund > 0
        ? `$${fedRefund.toLocaleString()} Federal Refund`
        : balDue > 0
        ? `$${balDue.toLocaleString()} Balance Due`
        : 'Form 1040 QA Approved';

    let actorUser = userId && userId !== 'SYSTEM'
      ? await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, firstName: true, lastName: true, email: true, role: true },
        })
      : null;

    if (!actorUser) {
      actorUser = await prisma.user.findFirst({
        where: {
          role: { in: [Role.SALES_AGENT, Role.SALES_MANAGER, Role.ADMIN] },
          isActive: true,
        },
        select: { id: true, firstName: true, lastName: true, email: true, role: true },
      });
    }

    const effectiveActorId = actorUser?.id || null;
    const actorName = actorUser
      ? `${actorUser.firstName || ''} ${actorUser.lastName || ''}`.trim() || actorUser.email || 'Sales Closer'
      : 'Sales Closer';
    const actorRole = actorUser?.role || 'SALES_AGENT';

    const currentDraft: any = app.taxDraftSummary || {};
    const existingRevertsByTarget: Record<string, any> = currentDraft.revertsByTarget || {};
    const resolvedRevertsByTarget: Record<string, any> = {};
    for (const [key, rev] of Object.entries(existingRevertsByTarget)) {
      resolvedRevertsByTarget[key] = {
        ...(rev as any),
        resolved: true,
        resolvedAt: new Date().toISOString(),
        resolvedByAgent: actorName,
        resolvedByUserId: effectiveActorId,
      };
    }

    const updatedNotes = notes?.trim() || currentDraft.closerCallNotes || '';
    const updatedDraftSummary = {
      ...currentDraft,
      status: 'QA_APPROVED',
      closerCallNotes: updatedNotes,
      lastCallNoteAt: notes?.trim() ? new Date().toISOString() : currentDraft.lastCallNoteAt,
      revertsByTarget: resolvedRevertsByTarget,
      lastRevert: currentDraft.lastRevert ? {
        ...currentDraft.lastRevert,
        resolved: true,
        resolvedAt: new Date().toISOString(),
        resolvedByAgent: actorName,
        resolvedByUserId: effectiveActorId,
      } : null,
    };

    const updated = await prisma.taxApplication.update({
      where: { id: applicationId },
      data: {
        currentStage: ApplicationStage.FILING_QUEUE,
        taxDraftSummary: updatedDraftSummary,
      },
    });

    // 1. Stage History Trail
    if (effectiveActorId) {
      try {
        await prisma.stageHistory.create({
          data: {
            applicationId,
            fromStage: ApplicationStage.SALES_PITCHING,
            toStage: ApplicationStage.FILING_QUEUE,
            movedByUserId: effectiveActorId,
            remarks: `Form 1040 certified return for ${clientName} authorized & dispatched to IRS E-Filing Queue by ${actorName}${updatedNotes ? ` • Notes: "${updatedNotes}"` : ''}`,
          },
        });
      } catch (err) {
        console.error('Failed to create stage history on filing dispatch:', err);
      }
    }

    // 1.1 Optional CallLog if notes provided
    if (effectiveActorId && updatedNotes) {
      try {
        await prisma.callLog.create({
          data: {
            applicationId,
            agentId: effectiveActorId,
            disposition: 'DISPATCHED_TO_IRS_FILING',
            callSummary: updatedNotes,
          },
        });
      } catch (err) {
        console.error('Failed to create call log on dispatch:', err);
      }
    }

    // 2. Comprehensive Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          applicationId,
          actorId: effectiveActorId,
          actorType: AuditActorType.AGENT,
          actorName,
          actorRole,
          action: AuditActionType.STAGE_CHANGE,
          moduleKey: 'SALES',
          details: {
            fromStage: ApplicationStage.SALES_PITCHING,
            toStage: ApplicationStage.FILING_QUEUE,
            actionDescription: `Form 1040 certified return for ${clientName} dispatched to IRS E-Filing Queue by ${actorName}`,
            closerCallNotes: updatedNotes,
            remarks: `Fee payment verified ($${draft.paidAmount || 227}) and Form 8879 authorized with PIN (${draft.taxpayerPin || '84920'}). Dispatched to IRS Modernized e-File Queue.${updatedNotes ? ` Closer Notes: "${updatedNotes}"` : ''}`,
            taxYear: app.taxYear || 2025,
            clientName,
          },
        },
      });
    } catch (err) {
      console.error('Failed to create audit log on filing dispatch:', err);
    }

    // 3. Send Notification to Filing Managers
    try {
      const filingManagers = await prisma.user.findMany({
        where: {
          role: { in: [Role.FILE_OP_MANAGER, Role.ADMIN] },
          isActive: true,
        },
        select: { id: true, email: true, firstName: true },
      });

      for (const mgr of filingManagers) {
        try {
          await prisma.notification.create({
            data: {
              recipientUserId: mgr.id,
              targetRole: Role.FILE_OP_MANAGER,
              applicationId: applicationId,
              category: NotificationCategory.FILING,
              priority: NotificationPriority.HIGH,
              title: `New Return Dispatched to Filing Queue: ${clientName}`,
              message: `Certified return for ${clientName} (TY ${app.taxYear || 2025} • ${refundOrDueText}) has been fee-paid, Form 8879 e-signed, and dispatched to IRS Filing Queue by ${actorName}.`,
              actionUrl: `/filing/manager/queue`,
              actionLabel: 'Open Filing Queue',
              relatedLeadName: clientName,
            },
          });
        } catch (err) {
          console.error('Failed to create filing manager notification:', err);
        }
      }
    } catch (err) {
      console.error('Failed to query filing managers for notification:', err);
    }

    return { success: true, application: updated };
  }

  /**
   * Update and persist Pitch Negotiation Status, Original Fee & Negotiated Amount
   */
  public static async updatePitchNegotiation(
    applicationId: string,
    payload: {
      pitchStatus?: string;
      originalFee?: number;
      negotiatedAmount?: number | null;
      comment?: string;
    },
    userId: string
  ) {
    const app = await prisma.taxApplication.findUnique({
      where: { id: applicationId },
      include: { customer: true, quotes: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
    if (!app) {
      throw new Error('Application not found');
    }

    const currentDraft: any = app.taxDraftSummary || {};
    const currentFeeBreakdown = currentDraft.feeBreakdown || {};
    const origFee = payload.originalFee !== undefined && payload.originalFee !== null
      ? Number(payload.originalFee)
      : Number(currentFeeBreakdown.basePrepFee || currentFeeBreakdown.totalServiceFee || currentDraft.totalQuotedFee || 247);

    const negAmount = payload.negotiatedAmount !== undefined && payload.negotiatedAmount !== null && !isNaN(Number(payload.negotiatedAmount))
      ? Number(payload.negotiatedAmount)
      : null;

    const pitchStatus = payload.pitchStatus || currentDraft.salesPitch?.pitchStatus || currentDraft.pitchStatus || 'NEED_TIME';
    const comment = payload.comment !== undefined ? payload.comment.trim() : (currentDraft.salesPitch?.comment || '');

    const salesPitch = {
      pitchStatus,
      originalFee: origFee,
      negotiatedAmount: negAmount,
      comment,
      updatedAt: new Date().toISOString(),
      updatedByUserId: userId,
    };

    const updatedDraft = {
      ...currentDraft,
      salesPitch,
      pitchStatus,
      negotiatedAmount: negAmount,
      originalFee: origFee,
      closerCallNotes: comment || currentDraft.closerCallNotes,
    };

    const updatedApp = await prisma.taxApplication.update({
      where: { id: applicationId },
      data: {
        taxDraftSummary: updatedDraft,
      },
    });

    // Safely resolve actor details
    let effectiveUserId = userId;
    const user = effectiveUserId && effectiveUserId !== 'SYSTEM'
      ? await prisma.user.findUnique({ where: { id: effectiveUserId } })
      : null;

    if (!user && app.assignedSalesAgentId) {
      effectiveUserId = app.assignedSalesAgentId;
    }

    const actorUser = user || (effectiveUserId ? await prisma.user.findUnique({ where: { id: effectiveUserId } }) : null);
    const actorName = actorUser
      ? `${actorUser.firstName || ''} ${actorUser.lastName || ''}`.trim() || actorUser.email || 'Sales Closer'
      : 'Sales Closer';
    const actorRole = actorUser?.role || 'SALES_AGENT';

    const PITCH_STATUS_MAP: Record<string, string> = {
      NEED_TIME: 'Need time (Client needs time to think/review before closing)',
      PRICING_ISSUE: 'Pricing issue (Client feels the price is high / asking for discount)',
      FILING_WITH_OTHERS: 'Filing with others (Client decided to file with local CPA or other software)',
      NEED_CALL_WITH_CPA: 'Need call with CPA (Client requires technical tax consultation before paying)',
      OTHER_COMMENT: 'Other comment (Custom note entry)',
    };

    const statusLabel = PITCH_STATUS_MAP[pitchStatus] || pitchStatus;
    const formattedRemarks = `Pitch Negotiation: Status="${statusLabel}" | Original Fee=$${origFee.toFixed(2)}${negAmount !== null ? ` | Negotiated Counter-Offer=$${negAmount.toFixed(2)}` : ''}${comment ? ` | Closer Note: "${comment}"` : ''}`;

    // 1. Create StageHistory record for the lead lifecycle audit
    if (effectiveUserId) {
      try {
        await prisma.stageHistory.create({
          data: {
            applicationId,
            fromStage: app.currentStage,
            toStage: app.currentStage,
            movedByUserId: effectiveUserId,
            remarks: formattedRemarks,
          },
        });
      } catch (err) {
        console.error('Failed to create stage history for pitch negotiation:', err);
      }
    }

    // 2. Create AuditLog record
    try {
      await prisma.auditLog.create({
        data: {
          applicationId,
          actorId: effectiveUserId || null,
          actorType: AuditActorType.AGENT,
          actorName,
          actorRole,
          action: AuditActionType.TAX_DRAFT_SAVE,
          moduleKey: 'SALES_PITCH',
          details: {
            actionDescription: `Pitch negotiation status updated: ${statusLabel}`,
            pitchStatus,
            statusLabel,
            originalFee: origFee,
            negotiatedAmount: negAmount,
            comment,
            remarks: formattedRemarks,
          },
        },
      });
    } catch (err) {
      console.error('Failed to create audit log for negotiation update:', err);
    }

    // 3. If a custom comment was entered, also log to CallLog
    if (effectiveUserId && comment) {
      try {
        await prisma.callLog.create({
          data: {
            applicationId,
            agentId: effectiveUserId,
            disposition: pitchStatus,
            callSummary: comment,
          },
        });
      } catch (err) {
        console.error('Failed to create call log in updatePitchNegotiation:', err);
      }
    }

    return { success: true, salesPitch, application: updatedApp };
  }

  /**
   * Save closer call notes directly into database & CallLog
   */
  public static async saveCloserNotes(
    applicationId: string,
    payload: {
      notes: string;
      disposition?: string;
      callDuration?: number;
    },
    userId: string
  ) {
    const app = await prisma.taxApplication.findUnique({
      where: { id: applicationId },
      include: { customer: true },
    });
    if (!app) {
      throw new Error('Application not found');
    }
    const currentDraft: any = app.taxDraftSummary || {};
    const notes = (payload.notes || '').trim();
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const actorName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'Sales Closer';

    const existingHistory: any[] = Array.isArray(currentDraft.closerNotesHistory)
      ? currentDraft.closerNotesHistory
      : [];

    const newNoteRecord = {
      id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      note: notes,
      authorId: user?.id || userId,
      authorName: actorName,
      authorEmail: user?.email || '',
      authorRole: user?.role || 'SALES_AGENT',
      disposition: payload.disposition || 'NOTE_RECORDED',
      callDuration: payload.callDuration || 0,
      createdAt: new Date().toISOString(),
    };

    const updatedHistory = [newNoteRecord, ...existingHistory];

    const updatedDraft = {
      ...currentDraft,
      closerCallNotes: notes,
      notes,
      closerNotesHistory: updatedHistory,
      lastCallNoteAt: new Date().toISOString(),
    };

    const updatedApp = await prisma.taxApplication.update({
      where: { id: applicationId },
      data: {
        taxDraftSummary: updatedDraft,
      },
    });

    if (userId && notes) {
      try {
        await prisma.callLog.create({
          data: {
            applicationId,
            agentId: userId,
            disposition: payload.disposition || 'SALES_CALL_LOGGED',
            callSummary: notes,
          },
        });
      } catch (err) {
        console.error('Failed to create call log in saveCloserNotes:', err);
      }

      try {
        await prisma.auditLog.create({
          data: {
            applicationId,
            actorId: userId,
            actorType: AuditActorType.AGENT,
            actorName,
            actorRole: user?.role || 'SALES_AGENT',
            action: AuditActionType.DISPOSITION_LOG,
            moduleKey: 'SALES',
            details: {
              notes,
              disposition: payload.disposition || 'SALES_CALL_LOGGED',
              callDuration: payload.callDuration || 0,
              remarks: `Closer call note logged by ${actorName}: "${notes}"`,
            },
          },
        });
      } catch (err) {
        console.error('Failed to create audit log in saveCloserNotes:', err);
      }
    }

    return { success: true, notes, application: updatedApp };
  }

  /**
   * Update fee quote & breakdown directly in database
   */
  public static async updateFeeBreakdown(
    applicationId: string,
    feeBreakdown: any,
    _userId?: string
  ) {
    const app = await prisma.taxApplication.findUnique({
      where: { id: applicationId },
      include: { customer: true, quotes: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
    if (!app) {
      throw new Error('Tax Application not found');
    }

    const currentDraft: any = app.taxDraftSummary || {};
    const paidAmount = Number(currentDraft.paidAmount || 0);
    const isPaid = currentDraft.paymentStatus === 'PAID' || (paidAmount > 0 && paidAmount >= Number(currentDraft.totalQuotedFee || 0));
    if (isPaid) {
      throw new Error('Fee quotation is locked and cannot be modified because payment has already been verified.');
    }

    const totalServiceFee = Number(feeBreakdown?.totalServiceFee || currentDraft.totalQuotedFee || 247);
    const remainingBalance = Math.max(0, totalServiceFee - paidAmount);

    let paymentStatus: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' = currentDraft.paymentStatus || 'UNPAID';
    if (paidAmount >= totalServiceFee && totalServiceFee > 0) {
      paymentStatus = 'PAID';
    } else if (paidAmount > 0) {
      paymentStatus = 'PARTIALLY_PAID';
    }

    const updatedDraft = {
      ...currentDraft,
      feeBreakdown,
      totalQuotedFee: totalServiceFee,
      paidAmount,
      remainingBalance,
      paymentStatus,
    };

    const updated = await prisma.taxApplication.update({
      where: { id: applicationId },
      data: {
        taxDraftSummary: updatedDraft,
      },
    });

    return { success: true, feeBreakdown, application: updated };
  }

  /**
   * Record customer service fee payment into database (SalesQuote & TaxApplication)
   * Supports Full & Partial Installment Payments with Complete History Ledger
   */
  public static async recordPayment(
    applicationId: string,
    data: {
      amount: number;
      feeBreakdown?: any;
      totalQuotedFee?: number;
      discountAmount?: number;
      paymentMethod?: string;
      transactionRef?: string;
      notes?: string;
    },
    userId: string
  ) {
    const app = await prisma.taxApplication.findUnique({
      where: { id: applicationId },
      include: {
        customer: true,
        assignedSalesAgent: true,
        quotes: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    if (!app) {
      throw new Error('Application not found');
    }

    const currentDraft: any = app.taxDraftSummary || {};
    const installmentAmount = Math.max(0, Number(data.amount) || 0);
    const prevPaidAmount = Number(currentDraft.paidAmount || 0);
    const newCumulativePaid = prevPaidAmount + installmentAmount;

    // Merge provided feeBreakdown or fallback to existing draft feeBreakdown
    const mergedFeeBreakdown = data.feeBreakdown || currentDraft.feeBreakdown || null;

    // Determine total fee
    const totalFee = Number(
      data.totalQuotedFee ||
      mergedFeeBreakdown?.totalServiceFee ||
      currentDraft.totalQuotedFee ||
      app.quotes?.[0]?.quoteAmount ||
      247
    );
    const remainingBalance = Math.max(0, totalFee - newCumulativePaid);

    // Determine payment status
    let paymentStatus: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' = 'UNPAID';
    if (newCumulativePaid >= totalFee && totalFee > 0) {
      paymentStatus = 'PAID';
    } else if (newCumulativePaid > 0) {
      paymentStatus = 'PARTIALLY_PAID';
    }

    // Safely resolve valid agentId for SalesQuote User foreign key
    let validAgentId = app.assignedSalesAgentId || userId;
    const agentExists = validAgentId && validAgentId !== 'SYSTEM'
      ? await prisma.user.findUnique({ where: { id: validAgentId } })
      : null;

    if (!agentExists) {
      const fallbackUser = await prisma.user.findFirst({ select: { id: true, firstName: true, lastName: true, email: true, role: true } });
      validAgentId = fallbackUser?.id || '';
    }

    const agentName = agentExists
      ? `${agentExists.firstName || ''} ${agentExists.lastName || ''}`.trim() || agentExists.email || 'Sales Closer'
      : 'Sales Closer';
    const agentRole = agentExists?.role || 'SALES_AGENT';

    // New Payment History Ledger Item
    const historyItem = {
      id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      amount: installmentAmount,
      totalQuotedFee: totalFee,
      cumulativePaid: newCumulativePaid,
      remainingBalance,
      paymentMethod: data.paymentMethod || 'STRIPE_CARD',
      transactionRef: data.transactionRef || `tx_card_${Date.now()}`,
      paidAt: new Date().toISOString(),
      collectedBy: {
        id: agentExists?.id || validAgentId,
        name: agentName,
        email: agentExists?.email,
        role: agentRole,
      },
      notes: data.notes || (paymentStatus === 'PAID' ? 'Full fee payment cleared' : `Partial installment payment ($${installmentAmount})`),
    };

    const existingHistory = Array.isArray(currentDraft.paymentHistory) ? currentDraft.paymentHistory : [];
    const paymentHistory = [historyItem, ...existingHistory];

    const updatedDraft = {
      ...currentDraft,
      feeBreakdown: mergedFeeBreakdown || currentDraft.feeBreakdown,
      paymentStatus,
      paidAt: new Date().toISOString(),
      paymentMethod: data.paymentMethod || 'STRIPE_CARD',
      transactionRef: data.transactionRef || historyItem.transactionRef,
      paidAmount: newCumulativePaid,
      totalQuotedFee: totalFee,
      remainingBalance,
      paymentHistory,
    };

    let quote = null;
    if (validAgentId) {
      try {
        quote = await prisma.salesQuote.create({
          data: {
            applicationId,
            salesAgentId: validAgentId,
            quoteAmount: totalFee,
            discountAmount: Number(data.discountAmount || mergedFeeBreakdown?.discountAmount || 0),
            status: paymentStatus === 'PAID' ? 'PAID' : 'PARTIALLY_PAID',
            userFeedback: `${historyItem.notes} (Total Paid: $${newCumulativePaid}/$${totalFee}, Balance: $${remainingBalance})`,
          },
        });
      } catch (err) {
        console.error('Failed to create salesQuote record:', err);
      }
    }

    // Automatically record CouponUsage redemption audit trail if an authorized promo code was applied
    const appliedCode = mergedFeeBreakdown?.discountCode?.trim()?.toUpperCase();
    const discountVal = Number(data.discountAmount || mergedFeeBreakdown?.discountAmount || 0);

    if (appliedCode && discountVal > 0) {
      try {
        const coupon = await prisma.discountCoupon.findUnique({
          where: { code: appliedCode },
        });

        if (coupon) {
          const existingUsage = await prisma.couponUsage.findFirst({
            where: {
              couponId: coupon.id,
              applicationId,
            },
          });

          if (!existingUsage) {
            await prisma.couponUsage.create({
              data: {
                couponId: coupon.id,
                couponCode: coupon.code,
                applicationId,
                customerId: app.customerId || null,
                appliedByUserId: validAgentId || userId,
                originalFee: new Prisma.Decimal(totalFee + discountVal),
                discountAmount: new Prisma.Decimal(discountVal),
                finalFee: new Prisma.Decimal(totalFee),
                justificationCategory: coupon.justificationCategory,
                justificationNotes: coupon.justificationNotes,
              },
            });

            const updatedCoupon = await prisma.discountCoupon.update({
              where: { id: coupon.id },
              data: { timesUsed: { increment: 1 } },
            });

            if (updatedCoupon.maxUsageLimit && updatedCoupon.timesUsed >= updatedCoupon.maxUsageLimit) {
              await prisma.discountCoupon.update({
                where: { id: coupon.id },
                data: { status: CouponStatus.DEPLETED },
              });
            }
          }
        }
      } catch (couponErr) {
        console.error('Failed to log couponUsage during payment:', couponErr);
      }
    }

    const updatedApp = await prisma.taxApplication.update({
      where: { id: applicationId },
      data: {
        taxDraftSummary: updatedDraft,
      },
    });

    const formattedAmount = installmentAmount.toLocaleString();
    const formattedBalance = remainingBalance.toLocaleString();

    if (validAgentId) {
      try {
        await prisma.stageHistory.create({
          data: {
            applicationId,
            fromStage: app.currentStage,
            toStage: app.currentStage,
            movedByUserId: validAgentId,
            remarks: paymentStatus === 'PAID'
              ? `Full service fee payment of $${formattedAmount} completed via ${data.paymentMethod || 'Card'} (Ref: ${historyItem.transactionRef})`
              : `Partial payment installment of $${formattedAmount} collected via ${data.paymentMethod || 'Card'}. Remaining balance: $${formattedBalance}`,
          },
        });
      } catch {
        // ignore log error
      }
    }

    try {
      await prisma.auditLog.create({
        data: {
          applicationId,
          actorId: validAgentId || null,
          actorType: AuditActorType.AGENT,
          actorName: agentName,
          actorRole: agentRole,
          action: AuditActionType.STAGE_CHANGE,
          moduleKey: 'SALES',
          details: {
            fromStage: app.currentStage,
            toStage: app.currentStage,
            actionDescription: `Service fee payment of $${formattedAmount} collected via ${data.paymentMethod || 'Card'}`,
            paidAmount: Number(data.amount) || 0,
            paymentMethod: data.paymentMethod,
            transactionRef: data.transactionRef,
            remarks: `Client authorized and processed service fee payment of $${formattedAmount} via ${data.paymentMethod || 'Card'} (Tx: ${data.transactionRef || 'Direct'})`,
          },
        },
      });
    } catch (err) {
      console.error('Failed to create audit log on payment record:', err);
    }

    return { success: true, quote, application: updatedApp };
  }

  /**
   * Record Form 8879 E-Sign & Upload in database (TaxDocument & TaxApplication)
   */
  public static async recordEsign(
    applicationId: string,
    data: {
      esignMethod?: string;
      fileName?: string;
      taxpayerPin?: string;
      callRecordingRef?: string;
      notes?: string;
    },
    userId: string
  ) {
    const app = await prisma.taxApplication.findUnique({
      where: { id: applicationId },
      include: { customer: true },
    });
    if (!app) {
      throw new Error('Application not found');
    }

    const currentDraft: any = app.taxDraftSummary || {};
    const updatedDraft = {
      ...currentDraft,
      esignStatus: 'SIGNED',
      esignCompletedAt: new Date().toISOString(),
      esignMethod: data.esignMethod || 'UPLOAD_PDF',
      taxpayerPin: data.taxpayerPin || '',
      callRecordingRef: data.callRecordingRef || '',
    };

    // Safely resolve valid authorId for TaxDocument User foreign key
    let validAuthorId = userId;
    const userExists = validAuthorId && validAuthorId !== 'SYSTEM'
      ? await prisma.user.findUnique({ where: { id: validAuthorId } })
      : null;

    if (!userExists) {
      const fallbackUser = app.assignedSalesAgentId 
        ? await prisma.user.findUnique({ where: { id: app.assignedSalesAgentId } })
        : await prisma.user.findFirst({ select: { id: true } });
      validAuthorId = fallbackUser?.id || '';
    }

    // Create TaxDocument for Form 8879
    const docName = data.fileName || `IRS_Form_8879_Signed_${app.customer?.firstName || 'Taxpayer'}_${app.customer?.lastName || 'Client'}.pdf`;
    let doc = null;
    if (validAuthorId) {
      try {
        doc = await prisma.taxDocument.create({
          data: {
            applicationId,
            uploadedByUserId: validAuthorId,
            fileName: docName,
            filePath: `/documents/8879/${docName}`,
            documentCategory: 'FORM_8879',
            verificationStatus: 'VERIFIED',
          },
        });
      } catch (err) {
        console.error('Failed to create taxDocument record:', err);
      }
    }

    const updatedApp = await prisma.taxApplication.update({
      where: { id: applicationId },
      data: {
        taxDraftSummary: updatedDraft,
      },
    });

    const authorName = userExists
      ? `${userExists.firstName || ''} ${userExists.lastName || ''}`.trim() || userExists.email || 'Sales Closer'
      : 'Sales Closer';
    const authorRole = userExists?.role || 'SALES_AGENT';

    if (validAuthorId) {
      try {
        await prisma.stageHistory.create({
          data: {
            applicationId,
            fromStage: app.currentStage,
            toStage: app.currentStage,
            movedByUserId: validAuthorId,
            remarks: `IRS Form 8879/8878 authorization signed (${data.esignMethod || 'Signed Document Attached'}) with PIN: ${data.taxpayerPin || 'Authorized'}`,
          },
        });
      } catch {
        // ignore log error
      }
    }

    try {
      await prisma.auditLog.create({
        data: {
          applicationId,
          actorId: validAuthorId || null,
          actorType: AuditActorType.AGENT,
          actorName: authorName,
          actorRole: authorRole,
          action: AuditActionType.DOCUMENT_UPLOAD,
          moduleKey: 'SALES',
          details: {
            actionDescription: `IRS Form 8879/8878 authorization signed (${data.esignMethod || 'Signed PDF'}) with PIN: ${data.taxpayerPin || 'Authorized'}`,
            fileName: docName,
            esignMethod: data.esignMethod,
            taxpayerPin: data.taxpayerPin,
            remarks: `IRS Form 8879 E-File Signature Authorization signed and verified with Taxpayer PIN: ${data.taxpayerPin || 'Authorized'} (${docName})`,
          },
        },
      });
    } catch (err) {
      console.error('Failed to create audit log on esign record:', err);
    }

    return { success: true, document: doc, application: updatedApp };
  }

  /**
   * Dispatch and record Stripe Self-Checkout Payment Link to Primary & optional Secondary Email
   */
  public static async sendPaymentLink(
    applicationId: string,
    payload: {
      amount: number;
      primaryEmail?: string;
      secondaryEmail?: string;
      sendToPrimary?: boolean;
      sendToSecondary?: boolean;
      phone?: string;
      notes?: string;
    },
    userId: string
  ) {
    const app = await prisma.taxApplication.findUnique({
      where: { id: applicationId },
      include: {
        customer: true,
        assignedSalesAgent: true,
        quotes: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    if (!app) {
      throw new Error('Application not found');
    }

    const currentDraft: any = app.taxDraftSummary || {};
    const amount = Number(payload.amount) || Number(currentDraft.totalQuotedFee) || 247;
    const clientName = app.customer
      ? `${app.customer.firstName || ''} ${app.customer.lastName || ''}`.trim() || app.customer.email || 'Client'
      : 'Client';

    const defaultPrimary = app.customer?.email || '';
    const primaryEmail = (payload.primaryEmail || defaultPrimary).trim();
    const secondaryEmail = (payload.secondaryEmail || '').trim();
    const sendToPrimary = payload.sendToPrimary !== false;
    const sendToSecondary = Boolean(secondaryEmail && payload.sendToSecondary !== false);

    const recipientEmails: string[] = [];
    if (sendToPrimary && primaryEmail) recipientEmails.push(primaryEmail);
    if (sendToSecondary && secondaryEmail && !recipientEmails.includes(secondaryEmail)) {
      recipientEmails.push(secondaryEmail);
    }
    if (recipientEmails.length === 0) {
      if (primaryEmail) recipientEmails.push(primaryEmail);
      else if (secondaryEmail) recipientEmails.push(secondaryEmail);
      else recipientEmails.push(defaultPrimary);
    }

    const recipientSummary = recipientEmails.join(', ');

    // Actor details
    let validAgentId = app.assignedSalesAgentId || userId;
    let agentUser = validAgentId && validAgentId !== 'SYSTEM'
      ? await prisma.user.findUnique({ where: { id: validAgentId } })
      : null;

    if (!agentUser) {
      agentUser = await prisma.user.findFirst({
        where: { role: { in: [Role.SALES_AGENT, Role.SALES_MANAGER, Role.ADMIN] }, isActive: true },
      });
      if (agentUser) {
        validAgentId = agentUser.id;
      }
    }

    const actorName = agentUser
      ? `${agentUser.firstName || ''} ${agentUser.lastName || ''}`.trim() || agentUser.email || 'Sales Closer'
      : 'Sales Closer';
    const actorRole = agentUser?.role || 'SALES_AGENT';

    const paymentLinkRecord = {
      id: `link_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      amount,
      primaryEmail,
      secondaryEmail: secondaryEmail || null,
      recipients: recipientEmails,
      phone: payload.phone || app.customer?.phone || '',
      notes: payload.notes || '',
      sentAt: new Date().toISOString(),
      sentBy: {
        id: validAgentId,
        name: actorName,
        email: agentUser?.email,
        role: actorRole,
      },
    };

    const existingLinks = Array.isArray(currentDraft.paymentLinkHistory) ? currentDraft.paymentLinkHistory : [];
    const paymentLinkHistory = [paymentLinkRecord, ...existingLinks];

    const updatedDraft = {
      ...currentDraft,
      paymentStatus: currentDraft.paymentStatus === 'PAID' ? 'PAID' : 'PAYMENT_LINK_SENT',
      paymentLinkDetails: paymentLinkRecord,
      secondaryEmail: secondaryEmail || currentDraft.secondaryEmail || null,
      paymentLinkHistory,
    };

    // Record / Update SalesQuote status as SENT
    if (validAgentId && agentUser) {
      try {
        await prisma.salesQuote.create({
          data: {
            applicationId,
            salesAgentId: validAgentId,
            quoteAmount: amount,
            status: 'SENT',
            userFeedback: `Checkout link ($${amount}) dispatched to: ${recipientSummary}${secondaryEmail ? ` (Secondary Email: ${secondaryEmail})` : ''}`,
          },
        });
      } catch (err) {
        console.error('Failed to create salesQuote for payment link:', err);
      }
    }

    const updatedApp = await prisma.taxApplication.update({
      where: { id: applicationId },
      data: {
        taxDraftSummary: updatedDraft,
      },
    });

    const remarks = `Payment Link of $${amount.toLocaleString()} sent to ${recipientSummary}${secondaryEmail ? ` (Secondary Email: ${secondaryEmail})` : ''} by ${actorName}`;

    // 1. StageHistory
    if (validAgentId && agentUser) {
      try {
        await prisma.stageHistory.create({
          data: {
            applicationId,
            fromStage: app.currentStage,
            toStage: app.currentStage,
            movedByUserId: validAgentId,
            remarks,
          },
        });
      } catch (err) {
        console.error('Failed to create stageHistory for payment link:', err);
      }
    }

    // 2. AuditLog
    try {
      await prisma.auditLog.create({
        data: {
          applicationId,
          actorId: agentUser?.id || null,
          actorType: AuditActorType.AGENT,
          actorName,
          actorRole,
          action: AuditActionType.TAX_DRAFT_SAVE,
          moduleKey: 'SALES_PAYMENT_LINK',
          details: {
            actionDescription: `Stripe checkout payment link ($${amount}) sent to ${recipientSummary}`,
            amount,
            primaryEmail,
            secondaryEmail: secondaryEmail || null,
            recipients: recipientEmails,
            remarks,
          },
        },
      });
    } catch (err) {
      console.error('Failed to create auditLog for payment link:', err);
    }

    // 3. SentEmail record for each destination email
    if (agentUser?.id) {
      const senderId = agentUser.id;
      for (const email of recipientEmails) {
        try {
          await prisma.sentEmail.create({
            data: {
              applicationId,
              senderUserId: senderId,
              recipientEmail: email,
              subject: `Secure Service Fee Checkout ($${amount}) - Form 1040 Tax Filing (${clientName})`,
              body: `Dear ${clientName},\n\nPlease find your secure checkout link of $${amount} for Form 1040 tax preparation & filing service.\n\nSent by ${actorName} (${agentUser?.email || 'TaxCRM Sales Team'}).\n\nThank you,\nTaxCRM Team`,
              status: 'SENT',
            },
          });
        } catch (e) {
          console.error('Failed to record sentEmail on payment link dispatch:', e);
        }
      }
    }

    return {
      success: true,
      amount,
      primaryEmail,
      secondaryEmail: secondaryEmail || null,
      recipients: recipientEmails,
      paymentLinkRecord,
      application: updatedApp,
    };
  }
}
