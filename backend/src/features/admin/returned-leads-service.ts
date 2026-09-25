import { prisma } from '../../config/db.js';
import { ApplicationStage, Role, AuditActorType, AuditActionType } from '@prisma/client';
import { BadRequestError } from '../../errors/bad-request-error.js';
import { DocumenterService } from '../documenter/documenter-service.js';

export interface ReturnedLeadsQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  visaType?: string;
  taxYear?: number;
  priority?: string;
  department?: string;
}

export class ReturnedLeadsService {
  /**
   * Fetch all returned prospect / tax applications waiting in the Admin pool (from Documenter Calling Agents & Sales Closers)
   */
  public static async getReturnedLeads(options: ReturnedLeadsQueryOptions) {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(options.limit) || 10));
    const skip = (page - 1) * limit;

    const { search, visaType, taxYear, priority, department } = options;

    // A lead is returned to Admin if unassigned and marked as returned to pool or has return history
    const returnedCondition: any = {
      OR: [
        {
          assignedDocAgentId: null,
          taxDraftSummary: {
            path: ['isReturnedToPool'],
            equals: true,
          },
        },
        {
          assignedSalesAgentId: null,
          taxDraftSummary: {
            path: ['isReturnedToPool'],
            equals: true,
          },
        },
        {
          assignedDocAgentId: null,
          assignedSalesAgentId: null,
          stageHistories: {
            some: {
              remarks: {
                contains: 'Admin Unassigned Pool',
                mode: 'insensitive',
              },
            },
          },
        },
      ],
    };

    const andConditions: any[] = [returnedCondition];

    if (taxYear) {
      andConditions.push({ taxYear: Number(taxYear) });
    }

    if (priority && priority !== 'ALL') {
      andConditions.push({ priority: priority as any });
    }

    if (visaType && visaType !== 'ALL') {
      andConditions.push({
        customer: {
          visaType: { equals: visaType.trim() },
        },
      });
    }

    if (department && department !== 'ALL') {
      if (department === 'SALES') {
        andConditions.push({
          OR: [
            { taxDraftSummary: { path: ['returnedDepartment'], equals: 'SALES' } },
            { currentStage: { in: [ApplicationStage.SALES_PITCH_QUEUE, ApplicationStage.SALES_PITCHING] } },
          ],
        });
      } else if (department === 'DOCUMENTER') {
        andConditions.push({
          OR: [
            { taxDraftSummary: { path: ['returnedDepartment'], equals: 'DOCUMENTER' } },
            { currentStage: { in: [ApplicationStage.RAW_PROSPECT, ApplicationStage.DOC_OUTREACH, ApplicationStage.DOC_PREP] } },
          ],
        });
      }
    }

    if (search && search.trim()) {
      const s = search.trim();
      andConditions.push({
        customer: {
          OR: [
            { firstName: { contains: s, mode: 'insensitive' } },
            { lastName: { contains: s, mode: 'insensitive' } },
            { email: { contains: s, mode: 'insensitive' } },
            { phone: { contains: s } },
            { ssnTin: { contains: s } },
            { occupation: { contains: s, mode: 'insensitive' } },
          ],
        },
      });
    }

    const where: any = { AND: andConditions };

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const [
      totalItems,
      apps,
      availableAgentsCount,
      activeAgents,
      todayReassignedCount,
    ] = await Promise.all([
      prisma.taxApplication.count({ where }),
      prisma.taxApplication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          customer: true,
          assignedDocAgent: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
          assignedSalesAgent: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
          callLogs: {
            orderBy: { createdAt: 'desc' },
            include: {
              agent: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  role: true,
                },
              },
            },
          },
          stageHistories: {
            orderBy: { createdAt: 'desc' },
            include: {
              movedByUser: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  role: true,
                },
              },
            },
          },
          auditLogs: {
            orderBy: { createdAt: 'desc' },
            include: {
              actorUser: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  role: true,
                },
              },
            },
          },
          documents: true,
        },
      }),
      prisma.user.count({
        where: {
          role: { in: [Role.DOC_AGENT, Role.SALES_AGENT] },
          isActive: true,
        },
      }),
      prisma.user.findMany({
        where: {
          role: { in: [Role.DOC_AGENT, Role.SALES_AGENT] },
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          mobile: true,
          firstName: true,
          lastName: true,
          role: true,
          _count: {
            select: {
              assignedDocApps: {
                where: {
                  currentStage: {
                    in: [
                      ApplicationStage.DOC_OUTREACH,
                      ApplicationStage.DOC_PREP,
                      ApplicationStage.CORRECTION_NEEDED,
                    ],
                  },
                },
              },
              assignedSalesApps: {
                where: {
                  currentStage: {
                    in: [
                      ApplicationStage.SALES_PITCH_QUEUE,
                      ApplicationStage.SALES_PITCHING,
                    ],
                  },
                },
              },
            },
          },
        },
        orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
      }),
      prisma.stageHistory.count({
        where: {
          createdAt: { gte: startOfToday },
          remarks: {
            contains: 'assigned this lead',
            mode: 'insensitive',
          },
        },
      }),
    ]);

    const formattedAgents = activeAgents.map((a) => {
      const activeLoad = a.role === Role.SALES_AGENT
        ? (a._count?.assignedSalesApps || 0)
        : (a._count?.assignedDocApps || 0);

      const defaultRoleTitle = a.role === Role.SALES_AGENT ? 'Sales Closer' : 'Calling Agent';

      return {
        id: a.id,
        email: a.email || '',
        mobile: a.mobile || '',
        fullName: a.firstName ? `${a.firstName} ${a.lastName || ''}`.trim() : (a.email?.split('@')[0] || defaultRoleTitle),
        role: a.role,
        department: a.role === Role.SALES_AGENT ? 'SALES' : 'DOCUMENTER',
        activeLoad,
      };
    });

    const formattedLeads = apps.map((app) => {
      const summary = (app.taxDraftSummary as Record<string, any>) || {};
      const history: any[] = Array.isArray(summary.assignmentHistory) ? summary.assignmentHistory : [];
      const lastReturnEntry = [...history].reverse().find((h) => h.action === 'RETURNED_TO_POOL') || null;

      // Extract last return stage history entry if available
      const returnStageHistory = app.stageHistories.find(
        (s) => s.remarks && s.remarks.toLowerCase().includes('admin unassigned pool')
      );

      const isSalesReturn =
        summary.returnedDepartment === 'SALES' ||
        lastReturnEntry?.department === 'SALES' ||
        lastReturnEntry?.role === 'SALES_AGENT' ||
        ['SALES_PITCH_QUEUE', 'SALES_PITCHING', 'SALES_PAYMENT_PENDING', 'SALES_ESIGN_PENDING'].includes(app.currentStage as string);

      const department = isSalesReturn ? 'SALES' : 'DOCUMENTER';
      const defaultReturner = isSalesReturn ? 'Sales Closer' : 'Calling Agent';

      const returnedBy = summary.returnedBy ||
        lastReturnEntry?.returnedByUserName ||
        (returnStageHistory?.movedByUser?.firstName
          ? `${returnStageHistory.movedByUser.firstName} ${returnStageHistory.movedByUser.lastName || ''}`.trim()
          : returnStageHistory?.movedByUser?.email?.split('@')[0]) ||
        defaultReturner;

      const returnedReason = summary.returnedReason ||
        lastReturnEntry?.reason ||
        (isSalesReturn ? 'Customer not converting / rejected fee quote' : 'Not Interested');

      const returnedAt = summary.returnedAt ||
        lastReturnEntry?.returnedAt ||
        returnStageHistory?.createdAt?.toISOString() ||
        app.updatedAt.toISOString();

      // Resolve previous agent name
      let previousAgentName = lastReturnEntry?.agentName;
      if (!previousAgentName) {
        if (isSalesReturn && app.assignedSalesAgent) {
          previousAgentName = app.assignedSalesAgent.firstName
            ? `${app.assignedSalesAgent.firstName} ${app.assignedSalesAgent.lastName || ''}`.trim()
            : app.assignedSalesAgent.email;
        } else if (!isSalesReturn && app.assignedDocAgent) {
          previousAgentName = app.assignedDocAgent.firstName
            ? `${app.assignedDocAgent.firstName} ${app.assignedDocAgent.lastName || ''}`.trim()
            : app.assignedDocAgent.email;
        } else if (summary.assignmentHistory && summary.assignmentHistory.length > 0) {
          previousAgentName = summary.assignmentHistory[0].agentName;
        } else {
          previousAgentName = isSalesReturn ? 'Previous Sales Closer' : 'Previous Calling Agent';
        }
      }

      return {
        id: app.id,
        customerId: app.customerId,
        taxYear: app.taxYear,
        filingType: app.filingType,
        currentStage: app.currentStage,
        priority: app.priority,
        department,
        assignedDocAgentId: app.assignedDocAgentId,
        assignedDocAgent: app.assignedDocAgent,
        assignedSalesAgentId: app.assignedSalesAgentId,
        assignedSalesAgent: app.assignedSalesAgent,
        taxDraftSummary: summary,
        createdAt: app.createdAt.toISOString(),
        updatedAt: app.updatedAt.toISOString(),
        customer: app.customer,
        returnedBy,
        returnedReason,
        returnedAt,
        previousAgentName,
        totalCalls: app.callLogs.length,
        lastCallLog: app.callLogs[0] ? {
          id: app.callLogs[0].id,
          disposition: app.callLogs[0].disposition,
          callSummary: app.callLogs[0].callSummary,
          agentName: app.callLogs[0].agent?.firstName
            ? `${app.callLogs[0].agent.firstName} ${app.callLogs[0].agent.lastName || ''}`.trim()
            : app.callLogs[0].agent?.email,
          createdAt: app.callLogs[0].createdAt.toISOString(),
        } : null,
        callLogs: app.callLogs.map((c) => ({
          id: c.id,
          applicationId: c.applicationId,
          agentId: c.agentId,
          agentName: c.agent?.firstName ? `${c.agent.firstName} ${c.agent.lastName || ''}`.trim() : (c.agent?.email?.split('@')[0] || 'Agent'),
          agentEmail: c.agent?.email || '',
          agentRole: c.agent?.role || (isSalesReturn ? 'SALES_AGENT' : 'DOC_AGENT'),
          disposition: c.disposition,
          callSummary: c.callSummary,
          callbackScheduledAt: c.callbackScheduledAt?.toISOString() || null,
          createdAt: c.createdAt.toISOString(),
        })),
        stageHistories: app.stageHistories.map((s) => ({
          id: s.id,
          applicationId: s.applicationId,
          fromStage: s.fromStage,
          toStage: s.toStage,
          movedByUserId: s.movedByUserId,
          movedByName: s.movedByUser?.firstName ? `${s.movedByUser.firstName} ${s.movedByUser.lastName || ''}`.trim() : (s.movedByUser?.email?.split('@')[0] || 'System'),
          movedByEmail: s.movedByUser?.email || '',
          movedByRole: s.movedByUser?.role || 'SYSTEM',
          remarks: s.remarks,
          createdAt: s.createdAt.toISOString(),
        })),
        auditLogs: app.auditLogs.map((a) => ({
          id: a.id,
          applicationId: a.applicationId,
          actorId: a.actorId,
          actorType: a.actorType,
          actorName: a.actorName || (a.actorUser?.firstName ? `${a.actorUser?.firstName} ${a.actorUser?.lastName || ''}`.trim() : (a.actorUser?.email?.split('@')[0] || 'System User')),
          actorEmail: a.actorUser?.email || '',
          actorRole: a.actorRole || a.actorUser?.role || 'SYSTEM',
          action: a.action,
          moduleKey: a.moduleKey,
          details: a.details,
          createdAt: a.createdAt.toISOString(),
        })),
        documents: app.documents,
      };
    });

    const totalPages = Math.ceil(totalItems / limit) || 1;

    return {
      leads: formattedLeads,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
      },
      stats: {
        totalReturned: totalItems,
        availableAgents: availableAgentsCount,
        todayReassigned: todayReassignedCount,
      },
      agents: formattedAgents,
    };
  }

  /**
   * Super Admin directly assigns selected returned leads to a Documenter Calling Agent or Sales Closer
   */
  public static async assignReturnedLeadsBulk(options: {
    applicationIds: string[];
    targetAgentId: string;
    adminUserId: string;
  }) {
    const { applicationIds, targetAgentId, adminUserId } = options;

    const targetUser = await prisma.user.findUnique({
      where: { id: targetAgentId },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });

    if (!targetUser) {
      throw new BadRequestError('Target agent not found');
    }

    let result: any;
    if (targetUser.role === Role.SALES_AGENT) {
      const { SalesService } = await import('../sales/sales-service.js');
      result = await SalesService.assignLead(applicationIds, targetAgentId, adminUserId);
    } else {
      result = await DocumenterService.assignLeadsBulk({
        applicationIds,
        targetAgentId,
        assignedByUserId: adminUserId,
      });
    }

    const assignedCount = result.assignedCount || result.count || applicationIds.length;

    return {
      success: true,
      assignedCount,
      targetAgent: targetUser,
      result,
    };
  }

  /**
   * Super Admin triggers 1-Click Auto Round-Robin distribution across active Calling Agents and Sales Closers
   */
  public static async autoRoundRobinReturnedLeads(options: {
    applicationIds?: string[];
    adminUserId: string;
  }) {
    const { applicationIds, adminUserId } = options;

    const appsToDistribute = await prisma.taxApplication.findMany({
      where: applicationIds && applicationIds.length > 0
        ? { id: { in: applicationIds } }
        : {
            OR: [
              { assignedDocAgentId: null, taxDraftSummary: { path: ['isReturnedToPool'], equals: true } },
              { assignedSalesAgentId: null, taxDraftSummary: { path: ['isReturnedToPool'], equals: true } },
              { assignedDocAgentId: null, assignedSalesAgentId: null },
            ],
          },
      select: { id: true, currentStage: true, taxDraftSummary: true },
    });

    if (appsToDistribute.length === 0) {
      return {
        success: true,
        totalDistributed: 0,
        docAssignedCount: 0,
        salesAssignedCount: 0,
        message: 'No returned leads waiting for round-robin assignment',
      };
    }

    const docAppIds: string[] = [];
    const salesAppIds: string[] = [];

    for (const app of appsToDistribute) {
      const summary = (app.taxDraftSummary as Record<string, any>) || {};
      if (
        summary.returnedDepartment === 'SALES' ||
        ['SALES_PITCH_QUEUE', 'SALES_PITCHING', 'SALES_PAYMENT_PENDING', 'SALES_ESIGN_PENDING'].includes(app.currentStage as string)
      ) {
        salesAppIds.push(app.id);
      } else {
        docAppIds.push(app.id);
      }
    }

    let docAssignedCount = 0;
    let salesAssignedCount = 0;

    if (docAppIds.length > 0) {
      const docRes = await DocumenterService.autoRoundRobinAssign({
        applicationIds: docAppIds,
        assignedByUserId: adminUserId,
      });
      docAssignedCount = docRes.totalDistributed || docAppIds.length;
    }

    if (salesAppIds.length > 0) {
      const { SalesService } = await import('../sales/sales-service.js');
      const salesClosers = await prisma.user.findMany({
        where: { role: Role.SALES_AGENT, isActive: true },
        orderBy: { createdAt: 'asc' },
      });

      if (salesClosers.length > 0) {
        let closerIdx = 0;
        for (const sId of salesAppIds) {
          const targetCloser = salesClosers[closerIdx % salesClosers.length];
          closerIdx++;
          await SalesService.assignLead([sId], targetCloser.id, adminUserId);
          salesAssignedCount++;
        }
      }
    }

    return {
      success: true,
      totalDistributed: docAssignedCount + salesAssignedCount,
      docAssignedCount,
      salesAssignedCount,
      message: `Auto round-robin successfully assigned ${docAssignedCount} documenter lead(s) and ${salesAssignedCount} sales lead(s)!`,
    };
  }
}
