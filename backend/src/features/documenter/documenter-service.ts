import { prisma } from '../../config/db.js';
import { ApplicationStage, Role } from '@prisma/client';

export interface DocumenterLeadQuery {
  page?: number;
  limit?: number;
  tab?: 'UNASSIGNED' | 'OUTREACH' | 'PREP' | 'MY_LEADS' | 'CALLBACKS' | 'ALL';
  search?: string;
  agentId?: string;
  visaType?: string;
  taxYear?: number;
  currentUserId?: string;
  currentUserRole?: string;
}

export class DocumenterService {
  /**
   * List paginated leads in Documenter Department with real-time metric stats
   */
  public static async listLeads(query: DocumenterLeadQuery) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const { tab = 'ALL', search, agentId, visaType, taxYear, currentUserId, currentUserRole } = query;

    // 1. Build where clause
    const where: any = {};

    if (taxYear) {
      where.taxYear = Number(taxYear);
    }

    // Role-based restrictions: If regular DOC_AGENT, default to their leads unless searching ALL
    if (currentUserRole === Role.DOC_AGENT && tab === 'MY_LEADS') {
      where.assignedDocAgentId = currentUserId;
    } else if (agentId) {
      where.assignedDocAgentId = agentId;
    }

    // Tab-based state filtering
    switch (tab) {
      case 'UNASSIGNED':
        where.assignedDocAgentId = null;
        where.currentStage = { in: [ApplicationStage.RAW_PROSPECT, ApplicationStage.DOC_OUTREACH] };
        break;
      case 'OUTREACH':
        where.currentStage = ApplicationStage.DOC_OUTREACH;
        break;
      case 'PREP':
        where.currentStage = ApplicationStage.DOC_PREP;
        break;
      case 'MY_LEADS':
        if (currentUserId) {
          where.assignedDocAgentId = currentUserId;
        }
        break;
      case 'CALLBACKS':
        where.callLogs = {
          some: {
            callbackScheduledAt: { not: null },
          },
        };
        break;
      case 'ALL':
      default:
        where.currentStage = {
          in: [
            ApplicationStage.RAW_PROSPECT,
            ApplicationStage.DOC_OUTREACH,
            ApplicationStage.DOC_PREP,
            ApplicationStage.CORRECTION_NEEDED,
          ],
        };
        break;
    }

    // Search filter across customer name, email, phone, and ssn
    if (search && search.trim()) {
      const s = search.trim();
      where.customer = {
        OR: [
          { firstName: { contains: s, mode: 'insensitive' } },
          { lastName: { contains: s, mode: 'insensitive' } },
          { email: { contains: s, mode: 'insensitive' } },
          { phone: { contains: s } },
          { ssnTin: { contains: s } },
          { occupation: { contains: s, mode: 'insensitive' } },
        ],
      };
    }

    if (visaType && visaType.trim()) {
      where.customer = {
        ...(where.customer || {}),
        visaType: { equals: visaType.trim() },
      };
    }

    // 2. Query data and counts in parallel
    const [leads, totalItems, unassignedCount, outreachCount, prepCount, myLeadsCount] = await Promise.all([
      prisma.taxApplication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          assignedDocAgent: {
            select: {
              id: true,
              email: true,
              mobile: true,
              role: true,
            },
          },
          callLogs: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          stageHistories: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.taxApplication.count({ where }),
      prisma.taxApplication.count({
        where: {
          assignedDocAgentId: null,
          currentStage: { in: [ApplicationStage.RAW_PROSPECT, ApplicationStage.DOC_OUTREACH] },
        },
      }),
      prisma.taxApplication.count({
        where: { currentStage: ApplicationStage.DOC_OUTREACH },
      }),
      prisma.taxApplication.count({
        where: { currentStage: ApplicationStage.DOC_PREP },
      }),
      currentUserId
        ? prisma.taxApplication.count({
            where: { assignedDocAgentId: currentUserId },
          })
        : 0,
    ]);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    return {
      leads,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
      },
      stats: {
        unassigned: unassignedCount,
        activeOutreach: outreachCount,
        inPrep: prepCount,
        myLeads: myLeadsCount,
        totalDepartment: unassignedCount + outreachCount + prepCount,
      },
    };
  }

  /**
   * Get all active Documenter department staff with live workload stats
   */
  public static async listDocumenterAgents() {
    const agents = await prisma.user.findMany({
      where: {
        isActive: true,
        role: {
          in: [Role.DOC_AGENT, Role.DOC_TEAM_LEAD, Role.DOC_MANAGER],
        },
      },
      select: {
        id: true,
        email: true,
        mobile: true,
        role: true,
        _count: {
          select: {
            assignedDocApps: {
              where: {
                currentStage: {
                  in: [ApplicationStage.DOC_OUTREACH, ApplicationStage.DOC_PREP],
                },
              },
            },
          },
        },
      },
      orderBy: [
        { role: 'asc' },
        { email: 'asc' },
      ],
    });

    return agents.map((agent) => ({
      id: agent.id,
      email: agent.email,
      mobile: agent.mobile,
      role: agent.role,
      activeLoad: agent._count.assignedDocApps,
    }));
  }

  /**
   * Bulk assign leads to a specific agent/staff member
   */
  public static async assignLeadsBulk(options: {
    applicationIds: string[];
    targetAgentId: string;
    assignedByUserId: string;
  }) {
    const { applicationIds, targetAgentId, assignedByUserId } = options;

    if (!applicationIds || applicationIds.length === 0) {
      throw new Error('No leads selected for assignment');
    }

    const targetAgent = await prisma.user.findUnique({
      where: { id: targetAgentId, isActive: true },
      select: { id: true, email: true, role: true },
    });

    if (!targetAgent) {
      throw new Error('Target staff member not found or inactive');
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Fetch current applications
      const apps = await tx.taxApplication.findMany({
        where: { id: { in: applicationIds } },
        select: { id: true, currentStage: true, assignedDocAgentId: true },
      });

      // 2. Update all selected applications
      await tx.taxApplication.updateMany({
        where: { id: { in: applicationIds } },
        data: {
          assignedDocAgentId: targetAgentId,
          currentStage: ApplicationStage.DOC_OUTREACH,
        },
      });

      // 3. Write audit trails
      for (const app of apps) {
        await tx.stageHistory.create({
          data: {
            applicationId: app.id,
            fromStage: app.currentStage,
            toStage: ApplicationStage.DOC_OUTREACH,
            movedByUserId: assignedByUserId,
            remarks: `Assigned to ${targetAgent.email} (${targetAgent.role})`,
          },
        });
      }

      return {
        assignedCount: apps.length,
        targetAgent: {
          id: targetAgent.id,
          email: targetAgent.email,
          role: targetAgent.role,
        },
      };
    });
  }

  /**
   * 1-Click Auto Round-Robin Lead Distribution Engine
   * Sequentially and evenly distributes leads across active Documenter Agents.
   */
  public static async autoRoundRobinAssign(options: {
    applicationIds?: string[];
    assignedByUserId: string;
  }) {
    const { applicationIds, assignedByUserId } = options;

    // 1. Fetch active DOC_AGENT staff
    const activeAgents = await prisma.user.findMany({
      where: {
        isActive: true,
        role: Role.DOC_AGENT,
      },
      select: { id: true, email: true, role: true },
      orderBy: { createdAt: 'asc' },
    });

    if (activeAgents.length === 0) {
      throw new Error('No active Documenter Agents available for round-robin assignment');
    }

    // 2. Fetch target leads (either specified IDs or all unassigned leads)
    const targetApps = await prisma.taxApplication.findMany({
      where: applicationIds && applicationIds.length > 0
        ? { id: { in: applicationIds } }
        : {
            assignedDocAgentId: null,
            currentStage: { in: [ApplicationStage.RAW_PROSPECT, ApplicationStage.DOC_OUTREACH] },
          },
      select: { id: true, currentStage: true },
      orderBy: { createdAt: 'asc' },
    });

    if (targetApps.length === 0) {
      throw new Error('No eligible unassigned leads found for round-robin distribution');
    }

    // 3. Distribute in atomic transaction
    return await prisma.$transaction(async (tx) => {
      const distributionMap: Record<string, number> = {};
      activeAgents.forEach((a) => (distributionMap[a.email || a.id] = 0));

      for (let i = 0; i < targetApps.length; i++) {
        const app = targetApps[i];
        const assignedAgent = activeAgents[i % activeAgents.length];

        await tx.taxApplication.update({
          where: { id: app.id },
          data: {
            assignedDocAgentId: assignedAgent.id,
            currentStage: ApplicationStage.DOC_OUTREACH,
          },
        });

        await tx.stageHistory.create({
          data: {
            applicationId: app.id,
            fromStage: app.currentStage,
            toStage: ApplicationStage.DOC_OUTREACH,
            movedByUserId: assignedByUserId,
            remarks: `Auto Round-Robin assigned to ${assignedAgent.email}`,
          },
        });

        distributionMap[assignedAgent.email || assignedAgent.id]++;
      }

      return {
        totalDistributed: targetApps.length,
        agentsCount: activeAgents.length,
        distribution: distributionMap,
      };
    });
  }
}
