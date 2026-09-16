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
}

export class ReturnedLeadsService {
  /**
   * Fetch all returned prospect / tax applications waiting in the Admin pool
   */
  public static async getReturnedLeads(options: ReturnedLeadsQueryOptions) {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(options.limit) || 10));
    const skip = (page - 1) * limit;

    const { search, visaType, taxYear } = options;

    // A lead is returned to Admin if unassigned and marked as returned to pool or has return history
    const returnedCondition: any = {
      assignedDocAgentId: null,
      OR: [
        {
          taxDraftSummary: {
            path: ['isReturnedToPool'],
            equals: true,
          },
        },
        {
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

    if (visaType && visaType !== 'ALL') {
      andConditions.push({
        customer: {
          visaType: { equals: visaType.trim() },
        },
      });
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
          role: Role.DOC_AGENT,
          isActive: true,
        },
      }),
      prisma.user.findMany({
        where: {
          role: Role.DOC_AGENT,
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
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.stageHistory.count({
        where: {
          createdAt: { gte: startOfToday },
          remarks: {
            contains: 'directly assigned this lead to Calling Agent',
            mode: 'insensitive',
          },
        },
      }),
    ]);

    const formattedAgents = activeAgents.map((a) => ({
      id: a.id,
      email: a.email || '',
      mobile: a.mobile || '',
      fullName: a.firstName ? `${a.firstName} ${a.lastName || ''}`.trim() : (a.email?.split('@')[0] || 'Calling Agent'),
      role: a.role,
      activeLoad: a._count?.assignedDocApps || 0,
    }));

    const formattedLeads = apps.map((app) => {
      const summary = (app.taxDraftSummary as Record<string, any>) || {};
      const history: any[] = Array.isArray(summary.assignmentHistory) ? summary.assignmentHistory : [];
      const lastReturnEntry = [...history].reverse().find((h) => h.action === 'RETURNED_TO_POOL') || null;

      // Extract last return stage history entry if available
      const returnStageHistory = app.stageHistories.find(
        (s) => s.remarks && s.remarks.toLowerCase().includes('admin unassigned pool')
      );

      const returnedBy = summary.returnedBy || lastReturnEntry?.returnedByUserName || returnStageHistory?.movedByUser?.email?.split('@')[0] || 'Calling Agent';
      const returnedReason = summary.returnedReason || lastReturnEntry?.reason || 'Not Interested';
      const returnedAt = summary.returnedAt || lastReturnEntry?.returnedAt || returnStageHistory?.createdAt?.toISOString() || app.updatedAt.toISOString();
      const previousAgentName = lastReturnEntry?.agentName || (summary.assignmentHistory && summary.assignmentHistory[0]?.agentName) || 'Previous Agent';

      return {
        id: app.id,
        customerId: app.customerId,
        taxYear: app.taxYear,
        filingType: app.filingType,
        currentStage: app.currentStage,
        assignedDocAgentId: app.assignedDocAgentId,
        assignedDocAgent: app.assignedDocAgent,
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
          agentName: app.callLogs[0].agent?.firstName ? `${app.callLogs[0].agent.firstName} ${app.callLogs[0].agent.lastName || ''}`.trim() : app.callLogs[0].agent?.email,
          createdAt: app.callLogs[0].createdAt.toISOString(),
        } : null,
        callLogs: app.callLogs.map((c) => ({
          id: c.id,
          applicationId: c.applicationId,
          agentId: c.agentId,
          agentName: c.agent?.firstName ? `${c.agent.firstName} ${c.agent.lastName || ''}`.trim() : (c.agent?.email?.split('@')[0] || 'Calling Agent'),
          agentEmail: c.agent?.email || '',
          agentRole: c.agent?.role || 'DOC_AGENT',
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
          actorName: a.actorName || a.actorUser?.firstName ? `${a.actorUser?.firstName} ${a.actorUser?.lastName || ''}`.trim() : (a.actorUser?.email?.split('@')[0] || 'System User'),
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
   * Super Admin directly assigns selected returned leads to a Documenter Calling Agent
   */
  public static async assignReturnedLeadsBulk(options: {
    applicationIds: string[];
    targetAgentId: string;
    adminUserId: string;
  }) {
    const { applicationIds, targetAgentId, adminUserId } = options;
    return await DocumenterService.assignLeadsBulk({
      applicationIds,
      targetAgentId,
      assignedByUserId: adminUserId,
    });
  }

  /**
   * Super Admin triggers 1-Click Auto Round-Robin distribution across active Calling Agents
   */
  public static async autoRoundRobinReturnedLeads(options: {
    applicationIds?: string[];
    adminUserId: string;
  }) {
    const { applicationIds, adminUserId } = options;
    return await DocumenterService.autoRoundRobinAssign({
      applicationIds,
      assignedByUserId: adminUserId,
    });
  }
}
