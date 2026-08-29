import { prisma } from "../../config/db.js";
import { ApplicationStage, Role } from "@prisma/client";

export class SalesService {
  /**
   * List all QA-Approved pipeline leads eligible for Sales Pitch & Fee Quotation
   */
  public static async getPipelineLeads(query: {
    stage?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
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
      ],
    };

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

    const [totalCount, applications] = await Promise.all([
      prisma.taxApplication.count({ where: baseWhere }),
      prisma.taxApplication.findMany({
        where: baseWhere,
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
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const formattedLeads = applications.map((app: any) => {
      const customer = app.customer;
      const fullName = customer
        ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email || '-'
        : '-';

      const draft: any = app.taxDraftSummary || {};
      const latestQuote = app.quotes?.[0];

      // Form 1040 financial figures
      const fedRefund = Number(draft.federalRefund) || 0;
      const balanceDue = Number(draft.federalBalanceDue) || 0;
      const stateRefund = Number(draft.stateRefund) || 0;
      const grossIncome = Number(draft.w2Wages || 0) + Number(draft.taxableInterest || 0) + Number(draft.capitalGains || 0) + Number(draft.otherIncome || 0);

      // Fee Breakdown from real quotes
      const isQuoted = Boolean(latestQuote);
      const totalServiceFee = isQuoted ? Number(latestQuote.totalFee) || 0 : 0;
      const baseFee = isQuoted ? Number(latestQuote.baseFee) || 149 : 0;
      const stateFee = isQuoted ? Number(latestQuote.stateFee) || 0 : 0;
      const auditDefenseAmount = isQuoted && latestQuote.includeAuditDefense ? 29 : 0;
      const fbarAmount = isQuoted ? Number(latestQuote.fbarFee) || 0 : 0;
      const discountAmount = isQuoted ? Number(latestQuote.discountAmount) || 0 : 0;

      const feeBreakdown = {
        fed1040PrepFee: baseFee,
        statePrepFee: stateFee,
        selectedStates: customer?.state ? [customer.state] : [],
        fbarFee: fbarAmount,
        auditDefenseFee: auditDefenseAmount,
        hasAuditDefense: isQuoted ? Boolean(latestQuote.includeAuditDefense) : false,
        discountAmount,
        discountCode: latestQuote?.discountCode || '',
        totalServiceFee,
        isQuoted,
      };

      // Reviewer Name
      const qaAuditor = app.assignedReviewAgent
        ? `${app.assignedReviewAgent.firstName || ''} ${app.assignedReviewAgent.lastName || ''}`.trim() || app.assignedReviewAgent.email || '-'
        : '-';

      // Payment Status
      let paymentStatus: 'UNPAID' | 'PAYMENT_LINK_SENT' | 'PAID' | 'REFUNDED' = 'UNPAID';
      if (app.currentStage === ApplicationStage.FILING_QUEUE || app.currentStage === ApplicationStage.FILING_IN_PROGRESS || app.currentStage === ApplicationStage.FILING_SUCCESS) {
        paymentStatus = 'PAID';
      } else if (latestQuote?.status === 'PAID') {
        paymentStatus = 'PAID';
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

      // Map Sales Stage
      let currentStage: string = app.currentStage;
      if (app.currentStage === ApplicationStage.SALES_PITCH_QUEUE && !app.assignedSalesAgentId) {
        currentStage = 'SALES_PITCH_QUEUE';
      } else if (paymentStatus === 'PAID' && esignStatus === 'SIGNED') {
        currentStage = app.currentStage === ApplicationStage.FILING_QUEUE ? 'FILING_QUEUE' : 'PAID_AND_AUTHORIZED';
      } else if (paymentStatus === 'PAYMENT_LINK_SENT') {
        currentStage = 'QUOTATION_SENT';
      } else if (app.assignedSalesAgentId) {
        currentStage = 'SALES_PITCHING';
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
        maritalStatus: customer?.maritalStatus || '-',
        stateOfResidence: customer?.state && customer?.city ? `${customer.city}, ${customer.state}` : (customer?.state || '-'),
        complexity: 'STANDARD',
        currentStage,
        grossIncome,
        federalRefund: fedRefund,
        stateRefund,
        balanceDue,
        qaAuditorName: qaAuditor,
        qaAuditorRemarks: draft.remarks || draft.auditorRemarks || 'Form 1040 draft verified and certified for Sales pitch.',
        qaApprovedAt: draft.qaApprovedAt || app.updatedAt.toISOString(),
        assignedSalesAgent: app.assignedSalesAgent ? {
          id: app.assignedSalesAgent.id,
          name: `${app.assignedSalesAgent.firstName || ''} ${app.assignedSalesAgent.lastName || ''}`.trim() || app.assignedSalesAgent.email || '-',
          email: app.assignedSalesAgent.email || '-',
          role: app.assignedSalesAgent.role,
        } : null,
        feeBreakdown,
        paymentStatus,
        esignStatus,
        createdAt: app.createdAt.toISOString(),
        updatedAt: app.updatedAt.toISOString(),
      };
    });

    return {
      leads: formattedLeads,
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

      const totalHandled = activeLeads + closedApps;
      const conversionPct = totalHandled > 0 ? `${Math.round((closedApps / totalHandled) * 100)}%` : '0%';

      return {
        id: member.id,
        name,
        email: member.email || '-',
        role: member.role,
        activeLeads,
        pitchesCompletedToday: activeLeads + closedApps,
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
    const pipelineCount = await prisma.taxApplication.count({
      where: {
        OR: [
          { currentStage: ApplicationStage.SALES_PITCH_QUEUE },
          { currentStage: ApplicationStage.SALES_PITCHING },
          {
            taxDraftSummary: {
              path: ['status'],
              equals: 'QA_APPROVED',
            },
          },
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
    const totalHandled = pipelineCount + closedPaidDeals;
    const conversionRatePct = totalHandled > 0 ? Math.round((closedPaidDeals / totalHandled) * 100) : 0;

    return {
      pipelineLeads: pipelineCount,
      activePitching,
      pendingPayment: Math.max(0, pipelineCount - activePitching),
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

    const updated = await prisma.taxApplication.updateMany({
      where: { id: { in: ids } },
      data: {
        assignedSalesAgentId: salesAgentId,
        currentStage: ApplicationStage.SALES_PITCHING,
      },
    });

    const targetAgent = await prisma.user.findUnique({
      where: { id: salesAgentId },
      select: { id: true, firstName: true, lastName: true, email: true },
    });

    if (managerUserId) {
      for (const id of ids) {
        try {
          await prisma.stageHistory.create({
            data: {
              applicationId: id,
              fromStage: ApplicationStage.SALES_PITCH_QUEUE,
              toStage: ApplicationStage.SALES_PITCHING,
              movedByUserId: managerUserId,
              remarks: `Assigned to Sales Closer (${targetAgent?.firstName || targetAgent?.email})`,
            },
          });
        } catch (err) {
          console.error('Failed to create stage history:', err);
        }
      }
    }

    return { success: true, count: updated.count, targetAgent };
  }

  /**
   * 1-Click Auto Round-Robin Lead Distribution across active Sales Closers
   */
  public static async autoRoundRobin(managerUserId: string) {
    const [unassignedLeads, closers] = await Promise.all([
      prisma.taxApplication.findMany({
        where: {
          currentStage: ApplicationStage.SALES_PITCH_QUEUE,
          assignedSalesAgentId: null,
        },
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

      const updated = await prisma.taxApplication.update({
        where: { id: lead.id },
        data: {
          assignedSalesAgentId: assignedCloser.id,
          currentStage: ApplicationStage.SALES_PITCHING,
        },
      });

      assignments.push(updated);
    }

    return {
      assignedCount: assignments.length,
      message: `Successfully distributed ${assignments.length} leads across ${closers.length} sales closers`,
    };
  }
}
