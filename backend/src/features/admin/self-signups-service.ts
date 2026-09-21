import { prisma } from '../../config/db.js';
import { ApplicationStage, Role, AuditActorType, AuditActionType, NotificationCategory, NotificationPriority } from '@prisma/client';
import { BadRequestError } from '../../errors/bad-request-error.js';

export interface SelfSignupsQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  visaType?: string;
  taxYear?: number;
  stage?: string;
  priority?: string;
}

export class SelfSignupsService {
  /**
   * Fetch all self-registered / direct online signups with full filtering and KPIs
   */
  public static async getSelfSignups(options: SelfSignupsQueryOptions) {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(options.limit) || 10));
    const skip = (page - 1) * limit;

    const { search, visaType, taxYear, stage, priority } = options;

    // Strict Self-Signup Identification Condition (Only leads with explicit online registration flags)
    const selfSignupCondition: any = {
      OR: [
        {
          taxDraftSummary: {
            path: ['leadSource'],
            equals: 'SELF_SIGNUP',
          },
        },
        {
          taxDraftSummary: {
            path: ['source'],
            equals: 'SELF_SIGNUP',
          },
        },
        {
          taxDraftSummary: {
            path: ['isSelfRegistered'],
            equals: true,
          },
        },
        {
          taxDraftSummary: {
            path: ['signupMethod'],
            equals: 'ONLINE_PORTAL',
          },
        },
        {
          taxDraftSummary: {
            path: ['signupMethod'],
            equals: 'PUBLIC_PORTAL',
          },
        },
      ],
    };

    const andConditions: any[] = [selfSignupCondition];

    if (taxYear) {
      andConditions.push({ taxYear: Number(taxYear) });
    }

    if (stage && stage !== 'ALL') {
      andConditions.push({ currentStage: stage as ApplicationStage });
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

    const [
      totalItems,
      leads,
      totalSelfSignups,
      rawProspectsCount,
      docOutreachCount,
      inProgressCount,
      completedFilingsCount,
      availableDocAgents,
    ] = await Promise.all([
      prisma.taxApplication.count({ where }),
      prisma.taxApplication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  mobile: true,
                  createdAt: true,
                  isActive: true,
                },
              },
            },
          },
          assignedDocAgent: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
          assignedPrepAgent: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
          assignedSalesAgent: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
          assignedFileOp: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
          stageHistories: {
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: {
              movedByUser: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          auditLogs: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      }),
      // KPI Stats
      prisma.taxApplication.count({ where: selfSignupCondition }),
      prisma.taxApplication.count({
        where: {
          AND: [selfSignupCondition, { currentStage: ApplicationStage.RAW_PROSPECT }],
        },
      }),
      prisma.taxApplication.count({
        where: {
          AND: [selfSignupCondition, { currentStage: ApplicationStage.DOC_OUTREACH }],
        },
      }),
      prisma.taxApplication.count({
        where: {
          AND: [
            selfSignupCondition,
            {
              currentStage: {
                in: [
                  ApplicationStage.DOC_OUTREACH,
                  ApplicationStage.DOC_PREP,
                  ApplicationStage.SALES_PITCH_QUEUE,
                  ApplicationStage.SALES_PITCHING,
                  ApplicationStage.FILING_QUEUE,
                  ApplicationStage.FILING_IN_PROGRESS,
                ],
              },
            },
          ],
        },
      }),
      prisma.taxApplication.count({
        where: {
          AND: [selfSignupCondition, { currentStage: ApplicationStage.FILING_SUCCESS }],
        },
      }),
      // Active Documenter staff for assignment
      prisma.user.findMany({
        where: {
          role: { in: [Role.DOC_AGENT, Role.DOC_MANAGER, Role.DOC_TEAM_LEAD] },
          isActive: true,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
        orderBy: { email: 'asc' },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    return {
      leads,
      stats: {
        totalSelfSignups,
        rawProspectsCount,
        docOutreachCount,
        inProgressCount,
        completedFilingsCount,
      },
      availableDocAgents,
      pagination: {
        page,
        limit,
        totalPages,
        totalItems,
      },
    };
  }

  /**
   * Bulk assign self-signup leads directly to a Documenter agent
   */
  public static async assignSelfSignupsBulk(params: {
    applicationIds: string[];
    targetAgentId: string;
    adminUserId: string;
  }) {
    const { applicationIds, targetAgentId, adminUserId } = params;

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      throw new BadRequestError('At least one application ID is required for assignment');
    }

    const targetAgent = await prisma.user.findUnique({
      where: { id: targetAgentId },
      select: { id: true, firstName: true, lastName: true, email: true, role: true, isActive: true },
    });

    if (!targetAgent || !targetAgent.isActive) {
      throw new BadRequestError('Selected Documenter Agent does not exist or is inactive');
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: adminUserId },
      select: { id: true, firstName: true, lastName: true, email: true },
    });

    const adminName = adminUser?.firstName
      ? `${adminUser.firstName} ${adminUser.lastName || ''}`.trim()
      : adminUser?.email || 'Super Admin';

    let assignedCount = 0;

    for (const appId of applicationIds) {
      const app = await prisma.taxApplication.findUnique({
        where: { id: appId },
        include: { customer: true },
      });

      if (!app) continue;

      const updatedSummary = {
        ...((app.taxDraftSummary as any) || {}),
        assignedByAdminAt: new Date().toISOString(),
        assignedByAdminId: adminUserId,
      };

      // If lead is in RAW_PROSPECT, transition to DOC_OUTREACH upon agent assignment
      const nextStage =
        app.currentStage === ApplicationStage.RAW_PROSPECT
          ? ApplicationStage.DOC_OUTREACH
          : app.currentStage;

      await prisma.taxApplication.update({
        where: { id: appId },
        data: {
          assignedDocAgentId: targetAgentId,
          currentStage: nextStage,
          taxDraftSummary: updatedSummary,
        },
      });

      // Stage History
      await prisma.stageHistory.create({
        data: {
          applicationId: appId,
          fromStage: app.currentStage,
          toStage: nextStage,
          movedByUserId: adminUserId,
          remarks: `Admin assigned direct online signup lead to Calling Agent: ${targetAgent.email} (${targetAgent.firstName || ''} ${targetAgent.lastName || ''}). Stage moved to ${nextStage}`,
        },
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          applicationId: appId,
          actorId: adminUserId,
          actorType: AuditActorType.ADMIN,
          actorName: adminName,
          actorRole: 'ADMIN',
          action: AuditActionType.STAGE_CHANGE,
          moduleKey: 'ADMIN_SELF_SIGNUP_ASSIGN',
          details: {
            previousStage: app.currentStage,
            newStage: nextStage,
            assignedDocAgentId: targetAgentId,
            assignedDocAgentEmail: targetAgent.email,
            assignedAt: new Date().toISOString(),
          },
        },
      });

      // In-App Notification for Documenter
      try {
        await prisma.notification.create({
          data: {
            recipientUserId: targetAgent.id,
            targetRole: targetAgent.role,
            applicationId: appId,
            category: NotificationCategory.DOCUMENTER,
            priority: NotificationPriority.HIGH,
            title: `New Online Lead Assigned: ${app.customer.firstName} ${app.customer.lastName}`,
            message: `${app.customer.firstName} ${app.customer.lastName} (${app.customer.phone}) has been assigned to you by Admin for initial document outreach.`,
            actionUrl: `/documenter/agent/queue`,
            actionLabel: 'Open Calling Workspace',
            relatedLeadName: `${app.customer.firstName} ${app.customer.lastName}`,
          },
        });
      } catch {
        // ignore notification write error
      }

      assignedCount++;
    }

    return {
      assignedCount,
      targetAgent,
    };
  }

  /**
   * Distribute self-signup leads evenly across active Documenter Agents via Round-Robin
   */
  public static async autoRoundRobinSelfSignups(params: {
    applicationIds: string[];
    adminUserId: string;
  }) {
    const { applicationIds, adminUserId } = params;

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      throw new BadRequestError('At least one application ID is required for round-robin assignment');
    }

    const docAgents = await prisma.user.findMany({
      where: {
        role: { in: [Role.DOC_AGENT, Role.DOC_TEAM_LEAD] },
        isActive: true,
      },
      select: { id: true, firstName: true, lastName: true, email: true, role: true },
      orderBy: { createdAt: 'asc' },
    });

    if (docAgents.length === 0) {
      throw new BadRequestError('No active Documenter / Calling Agents available for distribution');
    }

    let agentIndex = 0;
    let distributedCount = 0;

    for (const appId of applicationIds) {
      const selectedAgent = docAgents[agentIndex % docAgents.length];

      await this.assignSelfSignupsBulk({
        applicationIds: [appId],
        targetAgentId: selectedAgent.id,
        adminUserId,
      });

      distributedCount++;
      agentIndex++;
    }

    return {
      totalDistributed: distributedCount,
      agentsCount: docAgents.length,
    };
  }
}
