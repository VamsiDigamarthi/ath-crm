import { prisma } from '../../config/db.js';
import { ApplicationStage, Role } from '@prisma/client';
import { NotFoundError } from '../../errors/not-found-error.js';
import { StorageService } from '../../utils/storage-service.js';

export interface DocumenterLeadQuery {
  page?: number;
  limit?: number;
  tab?: 'UNASSIGNED' | 'NOT_CALLED' | 'UNCONTACTED' | 'OUTREACH' | 'PREP' | 'MY_LEADS' | 'CALLBACKS' | 'DROPPED' | 'ALL';
  search?: string;
  agentId?: string;
  visaType?: string;
  taxYear?: number;
  timeRange?: 'TODAY' | 'WEEK' | 'SEASON';
  currentUserId?: string;
  currentUserRole?: string;
}

export class DocumenterService {
  /**
   * Fetch full 360 case details for a single application including ALL historical call logs,
   * stage history, and uploaded documents
   */
  public static async getLeadDetails(applicationId: string) {
    const app = await prisma.taxApplication.findUnique({
      where: { id: applicationId },
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
        assignedSalesAgent: {
          select: {
            id: true,
            email: true,
            mobile: true,
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
                mobile: true,
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
                role: true,
              },
            },
          },
        },
        documents: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!app) {
      throw new NotFoundError('Tax Application not found');
    }

    const formattedCallLogs = app.callLogs.map((c) => ({
      id: c.id,
      applicationId: c.applicationId,
      agentId: c.agentId,
      agentName: c.agent?.email?.split('@')[0] || 'Staff',
      agentRole: c.agent?.role || 'DOC_AGENT',
      agentEmail: c.agent?.email || '',
      disposition: c.disposition,
      callSummary: c.callSummary,
      callbackScheduledAt: c.callbackScheduledAt?.toISOString() || null,
      createdAt: c.createdAt.toISOString(),
    }));

    return {
      ...app,
      callLogs: formattedCallLogs,
    };
  }

  /**
   * List paginated leads in Documenter Department with real-time metric stats
   */
  public static async listLeads(query: DocumenterLeadQuery) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const { tab = 'ALL', search, agentId, visaType, taxYear, timeRange = 'TODAY', currentUserId, currentUserRole } = query;

    // 1. Build where clause
    const where: any = {};

    if (taxYear) {
      where.taxYear = Number(taxYear);
    }

    // Role-based restrictions: If regular DOC_AGENT, strictly scope to their assigned leads
    if (currentUserRole === Role.DOC_AGENT) {
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
      case 'NOT_CALLED':
      case 'UNCONTACTED':
        where.callLogs = { none: {} };
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
      case 'DROPPED':
        where.currentStage = ApplicationStage.DROPPED_CANCELLED;
        break;
      case 'ALL':
      default:
        where.currentStage = {
          in: [
            ApplicationStage.RAW_PROSPECT,
            ApplicationStage.DOC_OUTREACH,
            ApplicationStage.DOC_PREP,
            ApplicationStage.CORRECTION_NEEDED,
            ApplicationStage.DROPPED_CANCELLED,
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

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(startOfWeek.getDate() - 6);
    startOfWeek.setHours(0, 0, 0, 0);

    let dateFilter: { gte?: Date } | undefined;
    if (timeRange === 'WEEK') {
      dateFilter = { gte: startOfWeek };
    } else if (timeRange === 'SEASON') {
      dateFilter = undefined;
    } else {
      dateFilter = { gte: startOfToday };
    }

    const agentCallLogsWhere: any = {};
    if (dateFilter) {
      agentCallLogsWhere.createdAt = dateFilter;
    }
    if (currentUserRole === Role.DOC_AGENT && currentUserId) {
      agentCallLogsWhere.agentId = currentUserId;
    }

    // 2. Query data and counts in parallel
    const [
      leads, 
      totalItems, 
      unassignedCount, 
      uncontactedCount,
      outreachCount, 
      prepCount, 
      myLeadsCount, 
      callbacksCount,
      todayDialsCount,
      todayConnectedCount,
      upcomingCallback
    ] = await Promise.all([
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
          documents: true,
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
        where: {
          ...(currentUserRole === Role.DOC_AGENT && currentUserId ? { assignedDocAgentId: currentUserId } : {}),
          callLogs: { none: {} },
          currentStage: { in: [ApplicationStage.RAW_PROSPECT, ApplicationStage.DOC_OUTREACH] },
        },
      }),
      prisma.taxApplication.count({
        where: {
          currentStage: ApplicationStage.DOC_OUTREACH,
          ...(currentUserRole === Role.DOC_AGENT && currentUserId ? { assignedDocAgentId: currentUserId } : {}),
        },
      }),
      prisma.taxApplication.count({
        where: {
          currentStage: ApplicationStage.DOC_PREP,
          ...(currentUserRole === Role.DOC_AGENT && currentUserId ? { assignedDocAgentId: currentUserId } : {}),
        },
      }),
      currentUserId
        ? prisma.taxApplication.count({
            where: { assignedDocAgentId: currentUserId },
          })
        : 0,
      prisma.taxApplication.count({
        where: {
          ...(currentUserRole === Role.DOC_AGENT && currentUserId ? { assignedDocAgentId: currentUserId } : {}),
          callLogs: {
            some: {
              callbackScheduledAt: { not: null },
            },
          },
        },
      }),
      prisma.callLog.count({
        where: agentCallLogsWhere,
      }),
      prisma.callLog.count({
        where: {
          ...agentCallLogsWhere,
          disposition: {
            in: ['CONNECTED_INTERESTED', 'CONNECTED_CALLBACK', 'CONNECTED_NOT_INTERESTED'],
          },
        },
      }),
      prisma.callLog.findFirst({
        where: {
          ...(currentUserRole === Role.DOC_AGENT && currentUserId ? { agentId: currentUserId } : {}),
          callbackScheduledAt: { gte: new Date() },
        },
        orderBy: { callbackScheduledAt: 'asc' },
        select: { callbackScheduledAt: true },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit) || 1;
    const contactRatePct = todayDialsCount > 0 
      ? Number(((todayConnectedCount / todayDialsCount) * 100).toFixed(1)) 
      : 0;

    // Query actual call logs created this week for real charts
    const recentCallLogs = await prisma.callLog.findMany({
      where: {
        ...(currentUserRole === Role.DOC_AGENT && currentUserId ? { agentId: currentUserId } : {}),
        createdAt: { gte: startOfWeek },
      },
      select: {
        id: true,
        disposition: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Generate active hourly timeline dynamically:
    // 1. Always include hours where calls actually happened today
    // 2. Plus standard workday hours (9 AM - 5 PM)
    const activeHoursSet = new Set<number>([9, 10, 11, 12, 13, 14, 15, 16, 17]);
    
    recentCallLogs.forEach((log) => {
      const logDate = new Date(log.createdAt);
      if (logDate >= startOfToday) {
        activeHoursSet.add(logDate.getHours());
      }
    });

    const activeHours = Array.from(activeHoursSet).sort((a, b) => a - b);
    const hourlyBreakdown = activeHours.map((h) => {
      const hourStr = `${h.toString().padStart(2, '0')}:00`;
      const hourLogs = recentCallLogs.filter((l) => {
        const d = new Date(l.createdAt);
        return d >= startOfToday && d.getHours() === h;
      });
      const connectedCount = hourLogs.filter((l) =>
        ['CONNECTED_INTERESTED', 'CONNECTED_CALLBACK', 'CONNECTED_NOT_INTERESTED'].includes(l.disposition)
      ).length;

      return {
        hour: hourStr,
        dials: hourLogs.length,
        connected: connectedCount,
      };
    });

    // Compute real daily buckets for last 5 days
    const daysMap: Record<string, { day: string; dials: number; connected: number; prep: number }> = {};
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 4; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayKey = i === 0 ? 'Today' : dayNames[d.getDay()];
      const dateStr = d.toISOString().slice(0, 10);
      daysMap[dateStr] = { day: dayKey, dials: 0, connected: 0, prep: 0 };
    }

    recentCallLogs.forEach((log) => {
      const dateStr = new Date(log.createdAt).toISOString().slice(0, 10);
      if (daysMap[dateStr]) {
        daysMap[dateStr].dials += 1;
        if (['CONNECTED_INTERESTED', 'CONNECTED_CALLBACK', 'CONNECTED_NOT_INTERESTED'].includes(log.disposition)) {
          daysMap[dateStr].connected += 1;
        }
        if (log.disposition === 'CONNECTED_INTERESTED') {
          daysMap[dateStr].prep += 1;
        }
      }
    });

    const weeklyBreakdown = Object.values(daysMap);

    // Query real Visa distribution from database
    const visaGroups = await prisma.customerProfile.groupBy({
      by: ['visaType'],
      _count: { id: true },
    });

    const totalProfiles = visaGroups.reduce((acc, curr) => acc + curr._count.id, 0) || 1;
    const visaColorMap: Record<string, string> = {
      'H-1B': '#16A34A',
      'F-1 OPT': '#3B82F6',
      'L-1': '#8B5CF6',
      'GREEN_CARD': '#F59E0B',
      'US_CITIZEN': '#10B981',
    };

    const visaDistribution = visaGroups.map((v) => {
      const type = v.visaType || 'Standard US';
      const count = v._count.id;
      return {
        name: type.replace('_', ' '),
        value: count,
        color: visaColorMap[type] || '#64748B',
        pct: Math.round((count / totalProfiles) * 100),
      };
    });

    const mappedLeads = leads.map((app) => ({
      ...app,
      lastCallLog: app.callLogs?.[0] || null,
    }));

    return {
      leads: mappedLeads,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
      },
      stats: {
        unassigned: unassignedCount,
        uncontacted: uncontactedCount,
        activeOutreach: outreachCount,
        inPrep: prepCount,
        callbacks: callbacksCount,
        myLeads: myLeadsCount,
        totalDepartment: unassignedCount + outreachCount + prepCount,
        todayDials: todayDialsCount,
        todayConnected: todayConnectedCount,
        contactRatePct,
        nextCallbackAt: upcomingCallback?.callbackScheduledAt ? upcomingCallback.callbackScheduledAt.toISOString() : null,
        hourlyBreakdown,
        weeklyBreakdown,
        visaDistribution,
      },
    };
  }

  /**
   * Get all active Documenter department staff with live workload stats and calling performance
   */
  public static async listDocumenterAgents(timeRange?: 'TODAY' | 'WEEK' | 'SEASON') {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(startOfWeek.getDate() - 6);
    startOfWeek.setHours(0, 0, 0, 0);

    let dateFilter: { gte?: Date } | undefined;
    if (timeRange === 'WEEK') {
      dateFilter = { gte: startOfWeek };
    } else if (timeRange === 'SEASON') {
      dateFilter = undefined;
    } else {
      dateFilter = { gte: startOfToday };
    }

    const callLogsFilter = dateFilter ? { createdAt: dateFilter } : {};

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
        assignedDocApps: {
          select: {
            currentStage: true,
          },
        },
        _count: {
          select: {
            callLogs: {
              where: callLogsFilter,
            },
          },
        },
        callLogs: {
          where: callLogsFilter,
          select: {
            disposition: true,
          },
        },
      },
      orderBy: [
        { role: 'asc' },
        { email: 'asc' },
      ],
    });

    return agents.map((agent) => {
      const activeLoad = agent.assignedDocApps.length;
      const prepCount = agent.assignedDocApps.filter(
        (a) => a.currentStage === ApplicationStage.DOC_PREP
      ).length;

      const dials = agent._count.callLogs;
      const connected = agent.callLogs.filter((l) =>
        ['CONNECTED_INTERESTED', 'CONNECTED_CALLBACK', 'CONNECTED_NOT_INTERESTED'].includes(l.disposition)
      ).length;
      const rate = dials > 0 ? `${((connected / dials) * 100).toFixed(1)}%` : '0.0%';

      const email = agent.email || `agent-${agent.id.slice(0, 4)}@taxcrm.com`;
      const rawName = email.split('@')[0].replace('.', ' ');
      const name = rawName.split(' ').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');

      return {
        id: agent.id,
        name,
        email,
        mobile: agent.mobile || '',
        role: agent.role,
        activeLoad,
        dials,
        connected,
        conv: prepCount,
        rate,
        avatar: name.charAt(0).toUpperCase(),
      };
    });
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

  /**
   * Log outreach call disposition, schedule callbacks, or advance to DOC_PREP with lazy taxpayer user provisioning
   */
  public static async logCallDisposition(options: {
    applicationIds: string[];
    disposition: string;
    callSummary?: string;
    callbackDate?: string;
    agentUserId: string;
  }) {
    const { applicationIds, disposition, callSummary, callbackDate, agentUserId } = options;

    if (!applicationIds || applicationIds.length === 0) {
      throw new Error('No applications provided');
    }

    return await prisma.$transaction(async (tx) => {
      const results = [];

      for (const appId of applicationIds) {
        const app = await tx.taxApplication.findUnique({
          where: { id: appId },
          include: { customer: true },
        });

        if (!app) continue;

        let targetStage: ApplicationStage = app.currentStage;
        let auditRemark = `Call outcome logged: ${disposition}`;

        // 1. Handle disposition transitions
        if (disposition === 'CONNECTED_INTERESTED') {
          targetStage = ApplicationStage.DOC_PREP;
          auditRemark = `Lead connected & interested. Moved to Tax Prep & provisioned Client Portal access.`;

          // Lazy Taxpayer User Provisioning
          if (!app.customer.userId && (app.customer.email || app.customer.phone)) {
            const existingUser = await tx.user.findFirst({
              where: {
                isActive: true,
                ...(app.customer.email ? { email: app.customer.email.toLowerCase() } : { mobile: app.customer.phone }),
              },
            });

            if (existingUser) {
              await tx.customerProfile.update({
                where: { id: app.customer.id },
                data: { userId: existingUser.id, isConvertedCustomer: false },
              });
            } else {
              const newUser = await tx.user.create({
                data: {
                  email: app.customer.email ? app.customer.email.toLowerCase() : null,
                  mobile: app.customer.phone,
                  role: Role.TAXPAYER_USER,
                  isActive: true,
                },
              });
              await tx.customerProfile.update({
                where: { id: app.customer.id },
                data: { userId: newUser.id, isConvertedCustomer: false },
              });
            }
          }
        } else if (disposition === 'CONNECTED_CALLBACK') {
          targetStage = ApplicationStage.DOC_OUTREACH;
          auditRemark = `Callback scheduled for ${callbackDate ? new Date(callbackDate).toLocaleString() : 'later'}.`;
        } else if (disposition === 'CONNECTED_NOT_INTERESTED') {
          targetStage = ApplicationStage.DROPPED_CANCELLED;
          auditRemark = `Lead not interested. Stage marked as DROPPED_CANCELLED.`;
        } else if (disposition === 'INVALID_DISCONNECTED') {
          targetStage = ApplicationStage.CORRECTION_NEEDED;
          auditRemark = `Invalid/disconnected contact number. Stage marked as CORRECTION_NEEDED.`;
        } else if (disposition === 'NO_ANSWER_VOICEMAIL') {
          targetStage = ApplicationStage.DOC_OUTREACH;
          auditRemark = `No answer / voicemail left. Retained in outreach.`;
        }

        // 2. Create CallLog entry
        const callLog = await tx.callLog.create({
          data: {
            applicationId: app.id,
            agentId: agentUserId,
            disposition,
            callSummary: callSummary || null,
            callbackScheduledAt: callbackDate ? new Date(callbackDate) : null,
          },
        });

        // 3. Update application stage
        await tx.taxApplication.update({
          where: { id: app.id },
          data: {
            currentStage: targetStage,
            assignedDocAgentId: app.assignedDocAgentId || agentUserId,
          },
        });

        // 4. Create StageHistory entry
        await tx.stageHistory.create({
          data: {
            applicationId: app.id,
            fromStage: app.currentStage,
            toStage: targetStage,
            movedByUserId: agentUserId,
            remarks: auditRemark,
          },
        });

        results.push({ applicationId: app.id, callLogId: callLog.id, stage: targetStage });
      }

      return results;
    });
  }

  /**
   * Save / Update draft tax computation summary for a lead in DOC_PREP
   */
  public static async saveTaxDraft(options: {
    applicationId: string;
    taxDraftSummary: any;
    agentUserId: string;
  }) {
    const { applicationId, taxDraftSummary, agentUserId } = options;

    const app = await prisma.taxApplication.findUnique({
      where: { id: applicationId },
    });

    if (!app) {
      throw new Error('Application not found');
    }

    const updated = await prisma.taxApplication.update({
      where: { id: applicationId },
      data: {
        taxDraftSummary,
        assignedDocAgentId: app.assignedDocAgentId || agentUserId,
      },
      include: {
        customer: true,
      },
    });

    return updated;
  }

  /**
   * Transition lead from DOC_PREP to SALES_PITCH_QUEUE (Send to Sales)
   */
  public static async sendToSales(options: {
    applicationId: string;
    taxDraftSummary?: any;
    remarks?: string;
    agentUserId: string;
  }) {
    const { applicationId, taxDraftSummary, remarks, agentUserId } = options;

    return await prisma.$transaction(async (tx) => {
      const app = await tx.taxApplication.findUnique({
        where: { id: applicationId },
        include: { customer: true },
      });

      if (!app) {
        throw new Error('Application not found');
      }

      const updatedApp = await tx.taxApplication.update({
        where: { id: applicationId },
        data: {
          currentStage: ApplicationStage.SALES_PITCH_QUEUE,
          ...(taxDraftSummary ? { taxDraftSummary } : {}),
        },
        include: {
          customer: true,
        },
      });

      await tx.stageHistory.create({
        data: {
          applicationId: app.id,
          fromStage: app.currentStage,
          toStage: ApplicationStage.SALES_PITCH_QUEUE,
          movedByUserId: agentUserId,
          remarks: remarks || `Tax draft completed. Sent to Sales Pitch Queue for fee quotation.`,
        },
      });

      return updatedApp;
    });
  }

  /**
   * Get physical file path for agent document download/view
   */
  static async getDocumentDownloadInfo(documentId: string) {
    const doc = await prisma.taxDocument.findUnique({
      where: { id: documentId },
    });

    if (!doc) {
      throw new NotFoundError('Tax document not found');
    }

    const absolutePath = StorageService.getAbsoluteFilePath(doc.filePath);
    if (!StorageService.fileExists(doc.filePath)) {
      throw new NotFoundError('Physical document file not found on storage server');
    }

    return {
      absolutePath,
      fileName: doc.fileName,
    };
  }

  /**
   * Mark document as verified / rejected
   */
  static async verifyDocument(documentId: string, status: 'VERIFIED' | 'REJECTED') {
    const doc = await prisma.taxDocument.findUnique({
      where: { id: documentId },
    });

    if (!doc) {
      throw new NotFoundError('Tax document not found');
    }

    const updated = await prisma.taxDocument.update({
      where: { id: documentId },
      data: {
        verificationStatus: status,
      },
    });

    return updated;
  }
}
