import { prisma } from '../../config/db.js';
import { 
  ApplicationStage, 
  Role, 
  NotificationCategory, 
  NotificationPriority,
  AuditActorType,
  AuditActionType
} from '@prisma/client';
import { NotFoundError } from '../../errors/not-found-error.js';
import { StorageService } from '../../utils/storage-service.js';
import { EmailService } from '../../utils/email-service.js';
import { sanitizeObject } from '../customer/customer-validator.js';

export interface DocumenterLeadQuery {
  page?: number;
  limit?: number;
  tab?: 'UNASSIGNED' | 'NOT_CALLED' | 'UNCONTACTED' | 'OUTREACH' | 'PREP' | 'MY_LEADS' | 'CALLBACKS' | 'DROPPED' | 'NOT_INTERESTED' | 'ALL';
  search?: string;
  agentId?: string;
  visaType?: string;
  taxYear?: number;
  priority?: string;
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
        assignedPrepAgent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
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
                firstName: true,
                lastName: true,
                email: true,
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
                firstName: true,
                lastName: true,
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
      subDisposition: c.subDisposition || null,
      callSummary: c.callSummary,
      callbackScheduledAt: c.callbackScheduledAt?.toISOString() || null,
      callbackTimezone: c.callbackTimezone || null,
      createdAt: c.createdAt.toISOString(),
    }));

    const formattedStageHistories = app.stageHistories.map((s) => {
      const isClient = s.movedByUser?.role === Role.TAXPAYER_USER;
      const clientName = `${app.customer.firstName || ''} ${app.customer.lastName || ''}`.trim() || app.customer.email || 'Taxpayer Client';
      const staffName = s.movedByUser 
        ? `${s.movedByUser.firstName || ''} ${s.movedByUser.lastName || ''}`.trim() || s.movedByUser.email?.split('@')[0] 
        : 'System';

      return {
        id: s.id,
        applicationId: s.applicationId,
        fromStage: s.fromStage,
        toStage: s.toStage,
        movedByUserId: s.movedByUserId,
        movedByName: isClient ? clientName : staffName,
        movedByEmail: isClient ? (app.customer.email || s.movedByUser?.email || '') : (s.movedByUser?.email || 'System'),
        movedByRole: isClient ? 'CLIENT' : (s.movedByUser?.role || 'SYSTEM'),
        remarks: s.remarks || `Stage transitioned from ${s.fromStage} to ${s.toStage}`,
        createdAt: s.createdAt.toISOString(),
      };
    });

    const formattedAuditLogs = app.auditLogs.map((a) => {
      const isClient = a.actorType === 'CLIENT' || 
                       a.actorRole === 'TAXPAYER_USER' || 
                       a.actorRole === 'CLIENT' ||
                       (a.details as any)?.source === 'TAXPAYER_CLIENT_PORTAL' ||
                       (a.details as any)?.source?.includes('CLIENT');

      const clientName = `${app.customer.firstName || ''} ${app.customer.lastName || ''}`.trim() || app.customer.email || 'Taxpayer Client';
      const clientEmail = (a.details as any)?.clientEmail || app.customer.email || a.actorUser?.email || '';

      const staffName = a.actorUser 
        ? `${a.actorUser.firstName || ''} ${a.actorUser.lastName || ''}`.trim() || a.actorUser.email?.split('@')[0]
        : 'System Actor';
      const staffEmail = a.actorUser?.email || '';

      return {
        id: a.id,
        applicationId: a.applicationId,
        actorId: a.actorId,
        actorType: a.actorType,
        actorName: isClient ? (a.actorName && !a.actorName.includes('@') ? a.actorName : clientName) : (a.actorName || staffName),
        actorEmail: isClient ? clientEmail : staffEmail,
        actorRole: isClient ? 'CLIENT' : (a.actorRole || a.actorUser?.role || 'SYSTEM'),
        action: a.action,
        moduleKey: a.moduleKey,
        details: a.details,
        createdAt: a.createdAt.toISOString(),
      };
    });

    return {
      ...app,
      callLogs: formattedCallLogs,
      stageHistories: formattedStageHistories,
      auditLogs: formattedAuditLogs,
    };
  }

  /**
   * List paginated leads in Documenter Department with real-time metric stats
   */
  public static async listLeads(query: DocumenterLeadQuery) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const { tab = 'ALL', search, agentId, visaType, taxYear, priority, timeRange = 'TODAY', currentUserId, currentUserRole } = query;

    // 1. Build where clause
    const where: any = {};

    if (taxYear) {
      where.taxYear = Number(taxYear);
    }

    if (priority && priority !== 'ALL') {
      where.priority = priority as any;
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
        where.currentStage = {
          in: [
            ApplicationStage.DOC_PREP,
            ApplicationStage.CORRECTION_NEEDED,
            ApplicationStage.SALES_PITCH_QUEUE,
            ApplicationStage.SALES_PITCHING,
            ApplicationStage.FILING_QUEUE,
            ApplicationStage.FILING_IN_PROGRESS,
            ApplicationStage.FILING_SUCCESS,
          ],
        };
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
      case 'NOT_INTERESTED':
        where.currentStage = ApplicationStage.DROPPED_CANCELLED;
        break;
      case 'ALL':
      default:
        // All Leads includes all stages and statuses
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
      notInterestedCount,
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
          currentStage: {
            in: [
              ApplicationStage.DOC_PREP,
              ApplicationStage.CORRECTION_NEEDED,
              ApplicationStage.SALES_PITCH_QUEUE,
              ApplicationStage.SALES_PITCHING,
              ApplicationStage.FILING_QUEUE,
              ApplicationStage.FILING_IN_PROGRESS,
              ApplicationStage.FILING_SUCCESS,
            ],
          },
          ...(currentUserRole === Role.DOC_AGENT && currentUserId ? { assignedDocAgentId: currentUserId } : {}),
        },
      }),
      currentUserId
        ? prisma.taxApplication.count({
            where: { 
              assignedDocAgentId: currentUserId,
            },
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
      prisma.taxApplication.count({
        where: {
          ...(currentUserRole === Role.DOC_AGENT && currentUserId ? { assignedDocAgentId: currentUserId } : {}),
          currentStage: ApplicationStage.DROPPED_CANCELLED,
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
        notInterested: notInterestedCount,
        dropped: notInterestedCount,
        totalDepartment: unassignedCount + outreachCount + prepCount + notInterestedCount,
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
        (a) =>
          a.currentStage !== ApplicationStage.RAW_PROSPECT &&
          a.currentStage !== ApplicationStage.DOC_OUTREACH &&
          a.currentStage !== ApplicationStage.DROPPED_CANCELLED
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
   * Return Not Interested leads to Admin / Unassigned Pool with full assignment history tracking
   */
  public static async returnLeadsToPool(options: {
    applicationIds: string[];
    returnedByUserId: string;
    reason?: string;
  }) {
    const { applicationIds, returnedByUserId, reason = 'Not Interested - Returned to Admin Pool for Redistribution' } = options;

    if (!applicationIds || applicationIds.length === 0) {
      throw new Error('No leads selected to return to pool');
    }

    const returnedByUser = await prisma.user.findUnique({
      where: { id: returnedByUserId },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });
    const returnerName = returnedByUser?.firstName 
      ? `${returnedByUser.firstName} ${returnedByUser.lastName || ''}`.trim() 
      : returnedByUser?.email || 'Calling Agent';

    return await prisma.$transaction(async (tx) => {
      // 1. Fetch current applications with their assigned agent and existing summary
      const apps = await tx.taxApplication.findMany({
        where: { id: { in: applicationIds } },
        include: {
          assignedDocAgent: {
            select: { id: true, email: true, firstName: true, lastName: true, role: true },
          },
          customer: {
            select: { firstName: true, lastName: true },
          },
        },
      });

      const nowIso = new Date().toISOString();

      for (const app of apps) {
        const prevSummary = (app.taxDraftSummary as Record<string, any>) || {};
        const prevHistory: any[] = Array.isArray(prevSummary.assignmentHistory) ? prevSummary.assignmentHistory : [];

        const prevAgent = app.assignedDocAgent;
        const prevAgentName = prevAgent?.firstName
          ? `${prevAgent.firstName} ${prevAgent.lastName || ''}`.trim()
          : prevAgent?.email || 'Unassigned Agent';

        const newHistoryEntry = {
          agentId: prevAgent?.id || app.assignedDocAgentId || 'unknown',
          agentName: prevAgentName,
          agentEmail: prevAgent?.email || '',
          role: prevAgent?.role || 'DOC_AGENT',
          action: 'RETURNED_TO_POOL',
          assignedAt: app.updatedAt?.toISOString() || app.createdAt.toISOString(),
          returnedAt: nowIso,
          returnedByUserId,
          returnedByUserName: returnerName,
          reason,
        };

        const updatedHistory = [...prevHistory, newHistoryEntry];
        const updatedSummary = {
          ...prevSummary,
          assignmentHistory: updatedHistory,
          isReturnedToPool: true,
          returnedAt: nowIso,
          returnedBy: returnerName,
          returnedReason: reason,
        };

        // Update application: unassign doc agent and set stage back to RAW_PROSPECT (unassigned pool)
        await tx.taxApplication.update({
          where: { id: app.id },
          data: {
            assignedDocAgentId: null,
            currentStage: ApplicationStage.RAW_PROSPECT,
            taxDraftSummary: updatedSummary,
          },
        });

        // Stage history audit
        await tx.stageHistory.create({
          data: {
            applicationId: app.id,
            fromStage: app.currentStage,
            toStage: ApplicationStage.RAW_PROSPECT,
            movedByUserId: returnedByUserId,
            remarks: `Calling Agent ${returnerName} (${returnedByUser?.email || 'agent'}) released lead back to Admin Unassigned Pool. Reason: ${reason}. Previous Agent: ${prevAgentName}.`,
          },
        });

        // Audit log
        await tx.auditLog.create({
          data: {
            applicationId: app.id,
            actorId: returnedByUserId,
            actorType: returnedByUser?.role === Role.ADMIN ? AuditActorType.ADMIN : AuditActorType.AGENT,
            actorName: returnerName,
            actorRole: returnedByUser?.role || 'DOC_AGENT',
            action: AuditActionType.STAGE_CHANGE,
            moduleKey: 'OUTREACH',
            details: {
              actorEmail: returnedByUser?.email || '',
              previousAgentId: prevAgent?.id,
              previousAgentEmail: prevAgent?.email,
              previousAgentName: prevAgentName,
              actionType: 'LEAD_RETURNED_TO_POOL',
              reason,
              timestamp: nowIso,
            },
          },
        });
      }

      // Notify Managers and Admins that leads were returned to pool
      const managers = await tx.user.findMany({
        where: {
          role: { in: [Role.ADMIN, Role.DOC_MANAGER] },
          isActive: true,
        },
        select: { id: true },
      });

      for (const mgr of managers) {
        await tx.notification.create({
          data: {
            recipientUserId: mgr.id,
            title: `${apps.length} Not-Interested Lead${apps.length > 1 ? 's' : ''} Returned to Unassigned Pool`,
            message: `${returnerName} released ${apps.length} not-interested lead${apps.length > 1 ? 's' : ''} back to the Unassigned Pool for redistribution.`,
            category: 'DOCUMENTER',
            priority: 'NORMAL',
            actionUrl: '/admin/returned-leads',
            actionLabel: 'View Returned Leads',
          },
        });
      }

      return {
        returnedCount: apps.length,
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
    alsoAssignAsSales?: boolean;
  }) {
    const { applicationIds, targetAgentId, assignedByUserId, alsoAssignAsSales = false } = options;

    if (!applicationIds || applicationIds.length === 0) {
      throw new Error('No leads selected for assignment');
    }

    const targetAgent = await prisma.user.findUnique({
      where: { id: targetAgentId, isActive: true },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });

    if (!targetAgent) {
      throw new Error('Target staff member not found or inactive');
    }

    if (targetAgent.role !== Role.DOC_AGENT) {
      throw new Error('Tax leads can only be assigned to Documenter Calling Agents (DOC_AGENT). Managers and Team Leads are excluded from lead assignment.');
    }

    const targetAgentName = targetAgent.firstName
      ? `${targetAgent.firstName} ${targetAgent.lastName || ''}`.trim()
      : targetAgent.email;

    const assignedByUser = await prisma.user.findUnique({
      where: { id: assignedByUserId },
      select: { email: true, firstName: true, lastName: true, role: true },
    });
    const assignerRoleTitle = assignedByUser?.role === Role.ADMIN ? 'Super Admin' : 'Documenter Manager';
    const assignerName = assignedByUser?.firstName 
      ? `${assignedByUser.firstName} ${assignedByUser.lastName || ''}`.trim() 
      : assignedByUser?.email || assignerRoleTitle;

    return await prisma.$transaction(async (tx) => {
      // 1. Fetch current applications
      const apps = await tx.taxApplication.findMany({
        where: { id: { in: applicationIds } },
        select: { 
          id: true, 
          currentStage: true, 
          assignedDocAgentId: true,
          assignedSalesAgentId: true,
          isDualDocSalesRole: true,
          taxDraftSummary: true,
          customer: {
            select: { firstName: true, lastName: true }
          }
        },
      });

      const nowIso = new Date().toISOString();

      // 2. Update all selected applications and record assignment history
      for (const app of apps) {
        const prevSummary = (app.taxDraftSummary as Record<string, any>) || {};
        const prevHistory: any[] = Array.isArray(prevSummary.assignmentHistory) ? prevSummary.assignmentHistory : [];

        const newHistoryEntry = {
          agentId: targetAgent.id,
          agentName: targetAgentName,
          agentEmail: targetAgent.email,
          role: targetAgent.role,
          action: 'ASSIGNED',
          isDualDocSalesRole: Boolean(alsoAssignAsSales),
          assignedAt: nowIso,
          assignedByUserId,
          assignedByUserName: assignerName,
          assignedByUserRole: assignedByUser?.role || 'ADMIN',
        };

        const updatedSummary = {
          ...prevSummary,
          assignmentHistory: [...prevHistory, newHistoryEntry],
          isReturnedToPool: false,
          isDualDocSalesRole: Boolean(alsoAssignAsSales),
          dualRoleAssigned: Boolean(alsoAssignAsSales),
          dualRoleAssignedAt: alsoAssignAsSales ? nowIso : undefined,
        };

        await tx.taxApplication.update({
          where: { id: app.id },
          data: {
            assignedDocAgentId: targetAgentId,
            ...(alsoAssignAsSales ? { assignedSalesAgentId: targetAgentId } : {}),
            isDualDocSalesRole: Boolean(alsoAssignAsSales),
            currentStage: ApplicationStage.DOC_OUTREACH,
            taxDraftSummary: updatedSummary,
          },
        });

        const roleRemark = alsoAssignAsSales 
          ? `directly assigned this lead to Calling Agent ${targetAgent.email} (${targetAgent.role}) as DUAL-ROLE (Documenter Intake + Sales Closer).`
          : `directly assigned this lead to Calling Agent ${targetAgent.email} (${targetAgent.role}).`;

        await tx.stageHistory.create({
          data: {
            applicationId: app.id,
            fromStage: app.currentStage,
            toStage: ApplicationStage.DOC_OUTREACH,
            movedByUserId: assignedByUserId,
            remarks: `${assignerRoleTitle} ${assignerName} (${assignedByUser?.email || 'admin'}) ${roleRemark} Stage progressed from ${app.currentStage} → DOC_OUTREACH. Lead placed in agent calling queue.`,
          },
        });

        // Audit log for direct assignment
        await tx.auditLog.create({
          data: {
            applicationId: app.id,
            actorId: assignedByUserId,
            actorType: assignedByUser?.role === Role.ADMIN ? AuditActorType.ADMIN : AuditActorType.MANAGER,
            actorName: assignerName,
            actorRole: assignedByUser?.role || 'ADMIN',
            action: AuditActionType.STAGE_CHANGE,
            moduleKey: 'LEAD_ASSIGNMENT',
            details: {
              targetAgentId: targetAgent.id,
              targetAgentName,
              targetAgentEmail: targetAgent.email,
              actionType: 'DIRECT_ASSIGNMENT',
              isDualDocSalesRole: Boolean(alsoAssignAsSales),
              timestamp: nowIso,
            },
          },
        });
      }

      // 3. Create targeted notification ONLY for the assigned calling agent
      await tx.notification.create({
        data: {
          recipientUserId: targetAgent.id,
          title: apps.length === 1 
            ? (alsoAssignAsSales ? `1 Dual-Role Lead Assigned (Doc + Sales)` : `1 New Lead Assigned to Your Calling Queue`)
            : (alsoAssignAsSales ? `${apps.length} Dual-Role Leads Assigned (Doc + Sales)` : `${apps.length} New Leads Assigned to Your Calling Queue`),
          message: alsoAssignAsSales
            ? `${assignerName} assigned ${apps.length} lead${apps.length > 1 ? 's' : ''} to you with Dual-Role responsibility (Documenter Intake + Downstream Sales Closer).`
            : `${assignerName} directly assigned ${apps.length} tax intake lead${apps.length > 1 ? 's' : ''} to your queue. Ready for taxpayer outreach!`,
          category: 'DOCUMENTER',
          priority: 'HIGH',
          actionUrl: '/documenter/agent/queue',
          actionLabel: 'Open Calling Queue',
          relatedLeadName: apps.length === 1 && apps[0]?.customer?.firstName 
            ? `${apps[0].customer.firstName} ${apps[0].customer.lastName || ''}`.trim() 
            : undefined,
          applicationId: apps.length === 1 ? apps[0].id : undefined,
        },
      });

      return {
        assignedCount: apps.length,
        isDualDocSalesRole: Boolean(alsoAssignAsSales),
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

    const assignedByUser = await prisma.user.findUnique({
      where: { id: assignedByUserId },
      select: { email: true, firstName: true, lastName: true },
    });
    const assignerName = assignedByUser?.firstName 
      ? `${assignedByUser.firstName} ${assignedByUser.lastName || ''}`.trim() 
      : assignedByUser?.email || 'Documenter Manager';

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
      const agentDistributionMap: Record<string, { agent: typeof activeAgents[0]; count: number }> = {};
      activeAgents.forEach((a) => {
        agentDistributionMap[a.id] = { agent: a, count: 0 };
      });

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
            remarks: `Documenter Manager ${assignerName} (${assignedByUser?.email || 'manager'}) auto-distributed lead via 1-Click Round-Robin Pool to Calling Agent ${assignedAgent.email} (${assignedAgent.role}). Stage progressed from ${app.currentStage} → DOC_OUTREACH.`,
          },
        });

        agentDistributionMap[assignedAgent.id].count++;
      }

      // Create targeted notifications ONLY for the specific agents who received leads
      for (const [agentId, { count }] of Object.entries(agentDistributionMap)) {
        if (count > 0) {
          await tx.notification.create({
            data: {
              recipientUserId: agentId,
              title: count === 1
                ? `Round-Robin: 1 New Lead Assigned`
                : `Round-Robin: ${count} New Leads Assigned`,
              message: `${assignerName} auto-distributed ${count} new tax prospect lead${count > 1 ? 's' : ''} to your calling queue. Ready for outreach!`,
              category: 'DOCUMENTER',
              priority: 'HIGH',
              actionUrl: '/documenter/agent/queue',
              actionLabel: 'Open Calling Queue',
            },
          });
        }
      }

      return {
        totalDistributed: targetApps.length,
        agentsCount: activeAgents.length,
        agentDistribution: Object.values(agentDistributionMap).map(({ agent, count }) => ({
          id: agent.id,
          email: agent.email,
          role: agent.role,
          count,
        })),
      };
    });
  }

  /**
   * Log outreach call disposition, schedule callbacks, or advance to DOC_PREP with lazy taxpayer user provisioning
   */
  public static async logCallDisposition(options: {
    applicationIds: string[];
    disposition: string;
    subDisposition?: string;
    callSummary?: string;
    callbackDate?: string;
    callbackTimezone?: string;
    agentUserId: string;
  }) {
    const { applicationIds, disposition, subDisposition, callSummary, callbackDate, callbackTimezone, agentUserId } = options;

    if (!applicationIds || applicationIds.length === 0) {
      throw new Error('No applications provided');
    }

    const cleanCallSummary = callSummary && callSummary.trim() ? callSummary.trim() : null;

    return await prisma.$transaction(async (tx) => {
      const results = [];

      for (const appId of applicationIds) {
        const app = await tx.taxApplication.findUnique({
          where: { id: appId },
          include: { customer: true },
        });

        if (!app) continue;

        let targetStage: ApplicationStage = app.currentStage;
        let auditRemark = subDisposition
          ? `Call outcome logged: ${disposition} (${subDisposition})`
          : `Call outcome logged: ${disposition}`;

        // 1. Handle disposition transitions (CONNECTED_INTERESTED keeps lead in DOC_OUTREACH until agent manually verifies & moves to prep)
        if (disposition === 'CONNECTED_INTERESTED') {
          targetStage = ApplicationStage.DOC_OUTREACH;
          auditRemark = subDisposition
            ? `Lead agreed & interested in filing (${subDisposition}). Provisioned Client Portal access for taxpayer.`
            : `Lead agreed & interested in filing. Provisioned Client Portal access for taxpayer (Tax Organizer & Document Vault).`;

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
          const tzStr = callbackTimezone ? ` (${callbackTimezone})` : '';
          auditRemark = `Callback scheduled for ${callbackDate ? new Date(callbackDate).toLocaleString() : 'later'}${tzStr}${subDisposition ? ` [${subDisposition}]` : ''}.`;
        } else if (disposition === 'CONNECTED_NOT_INTERESTED') {
          targetStage = ApplicationStage.DROPPED_CANCELLED;
          auditRemark = subDisposition
            ? `Lead not interested (${subDisposition}). Stage marked as DROPPED_CANCELLED.`
            : `Lead not interested. Stage marked as DROPPED_CANCELLED.`;
        } else if (disposition === 'CLIENT_NOT_QUALIFIED') {
          targetStage = ApplicationStage.DROPPED_CANCELLED;
          auditRemark = subDisposition
            ? `Client not qualified: ${subDisposition}. Stage marked as DROPPED_CANCELLED.`
            : `Client not qualified. Stage marked as DROPPED_CANCELLED.`;
        } else if (disposition === 'INVALID_DISCONNECTED') {
          targetStage = ApplicationStage.CORRECTION_NEEDED;
          auditRemark = subDisposition
            ? `Invalid/unreachable contact (${subDisposition}). Stage marked as CORRECTION_NEEDED.`
            : `Invalid/disconnected contact number. Stage marked as CORRECTION_NEEDED.`;
        } else if (disposition === 'NO_ANSWER_VOICEMAIL') {
          targetStage = ApplicationStage.DOC_OUTREACH;
          auditRemark = subDisposition
            ? `No answer / voicemail (${subDisposition}). Retained in outreach.`
            : `No answer / voicemail left. Retained in outreach.`;
        }

        // 2. Create CallLog entry (Call History already tracks this cleanly)
        const callLog = await tx.callLog.create({
          data: {
            applicationId: app.id,
            agentId: agentUserId,
            disposition,
            subDisposition: subDisposition || null,
            callSummary: cleanCallSummary,
            callbackScheduledAt: callbackDate ? new Date(callbackDate) : null,
            callbackTimezone: callbackTimezone || null,
          },
        });

        // 3. Update application stage if stage changed
        await tx.taxApplication.update({
          where: { id: app.id },
          data: {
            currentStage: targetStage,
            assignedDocAgentId: app.assignedDocAgentId || agentUserId,
          },
        });

        // 4. Create StageHistory entry ONLY if actual stage transition occurred
        if (app.currentStage !== targetStage) {
          await tx.stageHistory.create({
            data: {
              applicationId: app.id,
              fromStage: app.currentStage,
              toStage: targetStage,
              movedByUserId: agentUserId,
              remarks: auditRemark,
            },
          });
        }

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
   * Transition lead from DOC_OUTREACH / RAW_PROSPECT to DOC_PREP (Move to Tax Preparation)
   */
  public static async moveToTaxPrep(options: {
    applicationId: string;
    remarks?: string;
    agentUserId: string;
  }) {
    const { applicationId, remarks, agentUserId } = options;

    return await prisma.$transaction(async (tx) => {
      const app = await tx.taxApplication.findUnique({
        where: { id: applicationId },
        include: { customer: true },
      });

      if (!app) {
        throw new NotFoundError('Application not found');
      }

      if (app.currentStage === ApplicationStage.DOC_PREP) {
        throw new Error('This tax application is already transferred to the Tax Preparation Department.');
      }
      const lockedStages: ApplicationStage[] = [
        ApplicationStage.SALES_PITCH_QUEUE,
        ApplicationStage.SALES_PITCHING,
        ApplicationStage.FILING_QUEUE,
        ApplicationStage.FILING_IN_PROGRESS,
        ApplicationStage.FILING_SUCCESS,
      ];
      if (lockedStages.includes(app.currentStage)) {
        throw new Error(`Cannot transfer to preparation: This tax application is already in downstream stage (${app.currentStage}).`);
      }

      const agentUser = await tx.user.findUnique({
        where: { id: agentUserId },
      });

      const customerName = `${app.customer.firstName || ''} ${app.customer.lastName || ''}`.trim() || app.customer.email || 'Taxpayer';
      const agentName = agentUser ? `${agentUser.firstName || ''} ${agentUser.lastName || ''}`.trim() || agentUser.email : 'Documenter Agent';
      const transitionRemarks = `Documenter Agent ${agentName} (${agentUser?.email || ''}) completed document verification and transferred taxpayer return to Tax Preparation Department queue.${remarks ? ` Intake Handover Notes: "${remarks}"` : ''}`;

      const currentDraft = (app.taxDraftSummary as any) || {};
      const existingRevertsByTarget = currentDraft.revertsByTarget || {};
      const updatedRevertsByTarget = { ...existingRevertsByTarget };
      if (updatedRevertsByTarget.DOCUMENTER) {
        updatedRevertsByTarget.DOCUMENTER = {
          ...updatedRevertsByTarget.DOCUMENTER,
          resolved: true,
          resolvedAt: new Date().toISOString(),
          resolutionRemarks: remarks || undefined,
        };
      }
      if (updatedRevertsByTarget.PREPARATION_TO_DOCUMENTER) {
        updatedRevertsByTarget.PREPARATION_TO_DOCUMENTER = {
          ...updatedRevertsByTarget.PREPARATION_TO_DOCUMENTER,
          resolved: true,
          resolvedAt: new Date().toISOString(),
          resolutionRemarks: remarks || undefined,
        };
      }
      if (updatedRevertsByTarget.SALES_TO_DOCUMENTER) {
        updatedRevertsByTarget.SALES_TO_DOCUMENTER = {
          ...updatedRevertsByTarget.SALES_TO_DOCUMENTER,
          resolved: true,
          resolvedAt: new Date().toISOString(),
          resolutionRemarks: remarks || undefined,
        };
      }

      const updatedDraft = {
        ...currentDraft,
        status: currentDraft.status === 'REVERTED_TO_DOCUMENTER' ? 'IN_PROGRESS' : (currentDraft.status || 'IN_PROGRESS'),
        documenterNotes: remarks || currentDraft.documenterNotes || undefined,
        documenterNotesBy: agentName,
        documenterNotesAt: new Date().toISOString(),
        revertResolvedAt: new Date().toISOString(),
        revertsByTarget: updatedRevertsByTarget,
        lastRevert: currentDraft.lastRevert ? {
          ...currentDraft.lastRevert,
          resolved: true,
          resolvedAt: new Date().toISOString(),
          resolvedByAgent: agentName,
          resolvedByUserId: agentUserId,
          resolutionRemarks: remarks || undefined,
        } : undefined,
      };

      const updatedApp = await tx.taxApplication.update({
        where: { id: applicationId },
        data: {
          currentStage: ApplicationStage.DOC_PREP,
          taxDraftSummary: updatedDraft,
        },
        include: {
          customer: true,
          assignedPrepAgent: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      });

      // 1. Record Stage History audit log
      await tx.stageHistory.create({
        data: {
          applicationId: app.id,
          fromStage: app.currentStage,
          toStage: ApplicationStage.DOC_PREP,
          movedByUserId: agentUserId,
          remarks: transitionRemarks,
        },
      });

      // 2. Broadcast Notifications: if already assigned to a Preparer, notify them directly. Otherwise, notify Preparation Managers.
      if (app.assignedPrepAgentId) {
        await tx.notification.create({
          data: {
            recipientUserId: app.assignedPrepAgentId,
            targetRole: Role.TAX_PREPARER,
            applicationId: app.id,
            title: `Intake Verified - Return Resumed: ${customerName}`,
            message: `Documenter Agent ${agentName} has re-verified documents for ${customerName} (TY ${app.taxYear}). Return is now active in your drafting workbench.`,
            category: NotificationCategory.PREP_REVIEW,
            priority: NotificationPriority.HIGH,
            actionUrl: `/prep-review/preparer/workspace/${app.id}`,
            actionLabel: 'Open 1040 Workspace',
            relatedLeadName: customerName,
          },
        });
      } else {
        const prepManagers = await tx.user.findMany({
          where: {
            role: Role.PREP_MANAGER,
            isActive: true,
          },
        });

        if (prepManagers.length > 0) {
          await tx.notification.createMany({
            data: prepManagers.map((manager) => ({
              recipientUserId: manager.id,
              targetRole: Role.PREP_MANAGER,
              applicationId: app.id,
              title: `New Tax Return Ready for Preparation: ${customerName}`,
              message: `Documenter Agent ${agentName} has completed intake verification for ${customerName} (TY ${app.taxYear}). Return is ready for preparer allocation.`,
              category: NotificationCategory.PREP_REVIEW,
              priority: NotificationPriority.HIGH,
              actionUrl: `/prep-review/manager/queue`,
              actionLabel: 'Assign Preparer',
              relatedLeadName: customerName,
            })),
          });
        }
      }

      return updatedApp;
    });
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

    if (doc.filePath.startsWith('http://') || doc.filePath.startsWith('https://')) {
      return {
        isExternalLink: true,
        url: doc.filePath,
        fileName: doc.fileName,
      };
    }

    const absolutePath = StorageService.getAbsoluteFilePath(doc.filePath);
    if (!StorageService.fileExists(doc.filePath)) {
      throw new NotFoundError('Physical document file not found on storage server');
    }

    return {
      isExternalLink: false,
      absolutePath,
      fileName: doc.fileName,
    };
  }

  /**
   * Mark document as verified / rejected
   */
  static async verifyDocument(documentId: string, status: 'VERIFIED' | 'REJECTED', agentUserId?: string) {
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

    if (agentUserId) {
      const agentUser = await prisma.user.findUnique({ where: { id: agentUserId } });
      const actorName = agentUser ? `${agentUser.firstName || ''} ${agentUser.lastName || ''}`.trim() || agentUser.email : 'Calling Agent';
      await prisma.auditLog.create({
        data: {
          applicationId: doc.applicationId,
          actorId: agentUserId,
          actorType: 'AGENT',
          actorName,
          actorRole: agentUser?.role || 'DOC_AGENT',
          action: 'DOCUMENT_VERIFY',
          moduleKey: 'DOCUMENT_VAULT',
          details: {
            documentId: doc.id,
            fileName: doc.fileName,
            verificationStatus: status,
            source: 'AGENT_CALLING_PORTAL',
            remarks: `Documenter Agent ${actorName} marked document "${doc.fileName}" as ${status}.`,
            timestamp: new Date().toISOString(),
          },
        },
      });
    }

    return updated;
  }

  /**
  /**
   * Upload multiple tax documents on behalf of customer by Documenter Agent
   */
  public static async uploadLeadDocuments(
    applicationId: string,
    agentUserId: string,
    fileItems: Array<{ file: Express.Multer.File; category: string }>
  ) {
    const app = await prisma.taxApplication.findUnique({
      where: { id: applicationId },
      include: { customer: true },
    });

    if (!app) {
      throw new NotFoundError('Tax application not found');
    }

    const agentUser = await prisma.user.findUnique({
      where: { id: agentUserId },
    });
    const actorName = agentUser ? `${agentUser.firstName || ''} ${agentUser.lastName || ''}`.trim() || agentUser.email : 'Calling Agent';

    const categoryLabels: Record<string, string> = {
      W2_WAGES: 'W-2 Wages',
      FORM_1099: '1099 Interest/Div/Misc',
      '1099_INT': '1099-INT Interest',
      '1099_DIV': '1099-DIV Dividends',
      '1099_B': '1099-B Stocks',
      FORM_1099_B: '1099-B Stock Trading',
      '1098_MORTGAGE': '1098 Mortgage Interest',
      MORTGAGE_1098: '1098 Mortgage Interest',
      FBAR_FOREIGN: 'FBAR Indian Accounts',
      ID_PASSPORT_VISA: 'ID / Passport / Visa',
      PASSPORT_VISA: 'Passport / Visa ID',
      PREVIOUS_1040: 'Prior Year 1040',
      PRIOR_YEAR_RETURN: 'Prior Year 1040',
      FORM_1095_HEALTH: '1095 Health Coverage',
      OTHER_EXPENSES: 'Tax Deduction Receipts',
      OTHER_DOCUMENT: 'Other Tax Document',
      FORM_8879: 'IRS Form 8879 E-Sign',
    };

    const uploadedDocs = [];

    for (const item of fileItems) {
      const { file, category } = item;
      // Save file via Storage Service
      const storageResult = await StorageService.saveFile(file, `taxpayer_${app.customerId}_ty${app.taxYear}`);

      // Insert TaxDocument record
      const newDoc = await prisma.taxDocument.create({
        data: {
          applicationId: app.id,
          uploadedByUserId: agentUserId,
          fileName: file.originalname,
          filePath: storageResult.filePath,
          documentCategory: category || 'W2_WAGES',
          verificationStatus: 'VERIFIED', // Agent uploaded directly
        },
      });

      const catLabel = categoryLabels[newDoc.documentCategory] || newDoc.documentCategory;

      // Record AuditLog for Agent Document Upload
      await prisma.auditLog.create({
        data: {
          applicationId: app.id,
          actorId: agentUserId,
          actorType: 'AGENT',
          actorName,
          actorRole: agentUser?.role || 'DOC_AGENT',
          action: 'DOCUMENT_UPLOAD',
          moduleKey: 'DOCUMENT_VAULT',
          details: {
            documentId: newDoc.id,
            fileName: file.originalname,
            documentCategory: newDoc.documentCategory,
            categoryLabel: catLabel,
            fileSize: storageResult.fileSize,
            source: 'AGENT_CALLING_PORTAL',
            remarks: `Documenter Agent ${actorName} uploaded document "${file.originalname}" (${catLabel}) on behalf of taxpayer.`,
            timestamp: new Date().toISOString(),
          },
        },
      });

      uploadedDocs.push({
        id: newDoc.id,
        fileName: newDoc.fileName,
        documentCategory: newDoc.documentCategory,
        verificationStatus: newDoc.verificationStatus,
        createdAt: newDoc.createdAt,
        fileSize: storageResult.fileSize,
        mimeType: storageResult.mimeType,
      });
    }

    return uploadedDocs;
  }

  /**
   * Upload single tax document on behalf of customer by Documenter Agent
   */
  public static async uploadLeadDocument(
    applicationId: string,
    agentUserId: string,
    file: Express.Multer.File,
    documentCategory: string
  ) {
    const results = await this.uploadLeadDocuments(applicationId, agentUserId, [
      { file, category: documentCategory },
    ]);
    return results[0];
  }

  /**
   * Upload / attach Google Drive or Cloud document link on behalf of customer by Documenter Agent
   */
  public static async uploadDriveLink(
    applicationId: string,
    agentUserId: string,
    payload: {
      linkUrl: string;
      title?: string;
      documentCategory?: string;
      remarks?: string;
    }
  ) {
    const { linkUrl, title, documentCategory, remarks } = payload;
    if (!linkUrl || !linkUrl.trim()) {
      throw new Error('Drive link URL is required');
    }

    const trimmedUrl = linkUrl.trim();
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      throw new Error('Invalid URL. Drive link must begin with http:// or https://');
    }

    const app = await prisma.taxApplication.findUnique({
      where: { id: applicationId },
      include: { customer: true },
    });

    if (!app) {
      throw new NotFoundError('Tax application not found');
    }

    const agentUser = await prisma.user.findUnique({
      where: { id: agentUserId },
    });
    const actorName = agentUser ? `${agentUser.firstName || ''} ${agentUser.lastName || ''}`.trim() || agentUser.email : 'Calling Agent';

    const categoryLabels: Record<string, string> = {
      W2_WAGES: 'W-2 Wages',
      FORM_1099: '1099 Interest/Div/Misc',
      '1099_INT': '1099-INT Interest',
      '1099_DIV': '1099-DIV Dividends',
      '1099_B': '1099-B Stocks',
      FORM_1099_B: '1099-B Stock Trading',
      '1098_MORTGAGE': '1098 Mortgage Interest',
      MORTGAGE_1098: '1098 Mortgage Interest',
      FBAR_FOREIGN: 'FBAR Indian Accounts',
      ID_PASSPORT_VISA: 'ID / Passport / Visa',
      PASSPORT_VISA: 'Passport / Visa ID',
      PREVIOUS_1040: 'Prior Year 1040',
      PRIOR_YEAR_RETURN: 'Prior Year 1040',
      FORM_1095_HEALTH: '1095 Health Coverage',
      OTHER_EXPENSES: 'Tax Deduction Receipts',
      GOOGLE_DRIVE_LINK: 'Google Drive / Cloud Folder',
      OTHER_DOCUMENT: 'Other Tax Form / Drive Link',
    };

    const cat = documentCategory || 'GOOGLE_DRIVE_LINK';
    const catLabel = categoryLabels[cat] || cat;
    let docTitle = (title && title.trim()) ? title.trim() : '';
    if (!docTitle) {
      if (cat === 'GOOGLE_DRIVE_LINK') {
        if (trimmedUrl.includes('onedrive') || trimmedUrl.includes('1drv.ms') || trimmedUrl.includes('sharepoint')) {
          docTitle = 'OneDrive Cloud Folder';
        } else if (trimmedUrl.includes('dropbox')) {
          docTitle = 'Dropbox Cloud Folder';
        } else if (trimmedUrl.includes('box.com')) {
          docTitle = 'Box Cloud Folder';
        } else {
          docTitle = 'Google Drive Folder';
        }
      } else {
        docTitle = `${catLabel} Link`;
      }
    }

    const newDoc = await prisma.taxDocument.create({
      data: {
        applicationId: app.id,
        uploadedByUserId: agentUserId,
        fileName: docTitle,
        filePath: trimmedUrl,
        documentCategory: cat,
        verificationStatus: 'VERIFIED',
      },
    });

    // Record AuditLog for Agent Drive Link Upload
    await prisma.auditLog.create({
      data: {
        applicationId: app.id,
        actorId: agentUserId,
        actorType: 'AGENT',
        actorName,
        actorRole: agentUser?.role || 'DOC_AGENT',
        action: 'DOCUMENT_UPLOAD',
        moduleKey: 'DOCUMENT_VAULT',
        details: {
          documentId: newDoc.id,
          fileName: newDoc.fileName,
          documentCategory: newDoc.documentCategory,
          categoryLabel: catLabel,
          linkUrl: trimmedUrl,
          isDriveLink: true,
          source: 'AGENT_CALLING_PORTAL',
          remarks: remarks?.trim() || `Documenter Agent ${actorName} attached Drive Link "${newDoc.fileName}" (${trimmedUrl}) to Document Vault.`,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return {
      id: newDoc.id,
      fileName: newDoc.fileName,
      filePath: newDoc.filePath,
      documentCategory: newDoc.documentCategory,
      verificationStatus: newDoc.verificationStatus,
      createdAt: newDoc.createdAt.toISOString(),
      isDriveLink: true,
    };
  }

  /**
   * Delete document by Agent with Audit Log
   */
  public static async deleteLeadDocument(documentId: string, agentUserId: string) {
    const doc = await prisma.taxDocument.findUnique({
      where: { id: documentId },
      include: {
        application: {
          include: { customer: true },
        },
      },
    });

    if (!doc) {
      throw new NotFoundError('Tax document not found');
    }

    const agentUser = await prisma.user.findUnique({
      where: { id: agentUserId },
    });

    // Delete from storage
    await StorageService.deleteFile(doc.filePath);

    // Delete from DB
    await prisma.taxDocument.delete({
      where: { id: documentId },
    });

    const actorName = agentUser ? `${agentUser.firstName || ''} ${agentUser.lastName || ''}`.trim() || agentUser.email : 'Calling Agent';

    // Record AuditLog for Agent Document Deletion
    await prisma.auditLog.create({
      data: {
        applicationId: doc.applicationId,
        actorId: agentUserId,
        actorType: 'AGENT',
        actorName,
        actorRole: agentUser?.role || 'DOC_AGENT',
        action: 'DOCUMENT_DELETE',
        moduleKey: 'DOCUMENT_VAULT',
        details: {
          deletedFileName: doc.fileName,
          documentCategory: doc.documentCategory,
          source: 'AGENT_CALLING_PORTAL',
          remarks: `Documenter Agent ${actorName} removed document "${doc.fileName}" from Document Vault.`,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return { success: true, message: 'Document deleted successfully by agent' };
  }

  /**
   * Save / update 9-module intake organizer on call by Documenter Agent
   */
  public static async saveLeadOrganizer(
    applicationId: string,
    agentUserId: string,
    dataOrBody: any,
    _taxYearParam?: number | string
  ) {
    const app = await prisma.taxApplication.findUnique({
      where: { id: applicationId },
      include: { customer: true },
    });

    if (!app) {
      throw new NotFoundError('Tax application not found');
    }

    const agentUser = await prisma.user.findUnique({
      where: { id: agentUserId },
    });
    const actorName = agentUser ? `${agentUser.firstName || ''} ${agentUser.lastName || ''}`.trim() || agentUser.email : 'Calling Agent';

    const organizerData = dataOrBody?.organizerData || dataOrBody;
    const cleanOrganizerData = sanitizeObject(organizerData);
    const m1 = cleanOrganizerData.m1_demographics || {};

    // Synchronize Demographics with CustomerProfile
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

    // Store customer's exact raw SSN/TIN into database without modification or masking
    if (m1.ssnMasked !== undefined && m1.ssnMasked !== null) {
      profileUpdateData.ssnTin = String(m1.ssnMasked).trim();
    }

    if (Object.keys(profileUpdateData).length > 0) {
      await prisma.customerProfile.update({
        where: { id: app.customerId },
        data: profileUpdateData,
      });
    }

    const currentDraft = (app.taxDraftSummary as any) || {};
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
      where: { id: app.id },
      data: {
        taxDraftSummary: updatedSummary,
      },
    });

    const moduleNamesMap: Record<string, string> = {
      m1: 'Module 01 (Personal Info & Demographics)',
      m2: 'Module 02 (Spouse & Dependents)',
      m3: 'Module 03 (Substantial Presence & Multi-State)',
      m4: 'Module 04 (W-2 Wages & Rental Properties)',
      m5: 'Module 05 (1099-INT / DIV / OID Interest)',
      m6: 'Module 06 (1099-B Stock & Crypto Capital Gains)',
      m7: 'Module 07 (Foreign Assets & FBAR)',
      m8: 'Module 08 (Itemized Deductions & HSA)',
      m9: 'Module 09 (Direct Deposit Bank Details)',
    };
    const latestModuleKey = submittedModules[submittedModules.length - 1] || 'm1';
    const latestModuleName = moduleNamesMap[latestModuleKey] || `Section ${latestModuleKey.toUpperCase()}`;

    // Record AuditLog for Agent Organizer Update
    await prisma.auditLog.create({
      data: {
        applicationId: app.id,
        actorId: agentUserId,
        actorType: 'AGENT',
        actorName,
        actorRole: agentUser?.role || 'DOC_AGENT',
        action: 'ORGANIZER_UPDATE',
        moduleKey: `ORGANIZER_${latestModuleKey.toUpperCase()}`,
        details: {
          activeModule: latestModuleName,
          submittedModules,
          progressPercent,
          completedCount,
          source: 'AGENT_CALLING_PORTAL',
          remarks: `Documenter Agent ${actorName} updated ${latestModuleName} on intake call (${completedCount}/9 verified, ${progressPercent}% complete).`,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return {
      taxYear: updatedApp.taxYear,
      applicationId: updatedApp.id,
      organizer: cleanOrganizerData,
      progressPercent,
      completedCount,
      message: 'Organizer saved successfully by agent on call',
    };
  }

  /**
   * Update Tax Application Priority by staff
   */
  public static async updateLeadPriority(applicationId: string, priority: string, agentUserId: string) {
    const validPriorities = ['URGENT', 'IMPORTANT', 'HIGH', 'MEDIUM', 'LOW', 'NO_PRIORITY'];
    if (!validPriorities.includes(priority)) {
      throw new Error(`Invalid priority value: ${priority}`);
    }

    const app = await prisma.taxApplication.findUnique({
      where: { id: applicationId },
      include: { customer: true },
    });

    if (!app) {
      throw new NotFoundError('Tax application not found');
    }

    const updated = await prisma.taxApplication.update({
      where: { id: applicationId },
      data: { priority: priority as any },
    });

    const agentUser = await prisma.user.findUnique({
      where: { id: agentUserId },
      select: { firstName: true, lastName: true, email: true, role: true },
    });
    const actorName = agentUser ? `${agentUser.firstName || ''} ${agentUser.lastName || ''}`.trim() || agentUser.email : 'Staff';

    await prisma.auditLog.create({
      data: {
        applicationId: app.id,
        actorId: agentUserId,
        actorType: 'AGENT',
        actorName,
        actorRole: agentUser?.role || 'DOC_AGENT',
        action: 'STAGE_CHANGE',
        moduleKey: 'LEAD_PRIORITY',
        details: {
          previousPriority: app.priority,
          newPriority: priority,
          source: 'STAFF_WORKSPACE',
          remarks: `${actorName} updated tax application priority from ${app.priority} to ${priority}.`,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return updated;
  }

  /**
   * Send notification / email to client requesting specific missing document categories
   */
  public static async requestMissingDocuments(
    leadOrAppId: string,
    agentUserId: string,
    payload: {
      documentCategories: string[];
      customNotes?: string;
      sendInApp: boolean;
      sendEmail: boolean;
    }
  ) {
    const { documentCategories = [], customNotes = '', sendInApp = true, sendEmail = false } = payload;
    if (documentCategories.length === 0 && !customNotes?.trim()) {
      throw new Error('Please select at least one document category or enter a custom note.');
    }
    if (!sendInApp && !sendEmail) {
      throw new Error('Please select at least one delivery channel (Notification or Email).');
    }

    // Find lead/application
    const app = await prisma.taxApplication.findFirst({
      where: {
        OR: [{ id: leadOrAppId }, { customerId: leadOrAppId }],
      },
      include: {
        customer: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!app) {
      throw new NotFoundError('Tax application not found');
    }

    const agentUser = await prisma.user.findUnique({
      where: { id: agentUserId },
      select: { id: true, firstName: true, lastName: true, email: true, role: true },
    });
    const actorName = agentUser ? `${agentUser.firstName || ''} ${agentUser.lastName || ''}`.trim() || agentUser.email : 'Operations Staff';

    const customerUser = app.customer.user;
    const customerEmail = app.customer.email || customerUser?.email;
    const customerName = `${app.customer.firstName || ''} ${app.customer.lastName || ''}`.trim() || 'Taxpayer';

    const categoryListFormatted = documentCategories.map((c) => `• ${c}`).join('\n');
    const noteFormatted = customNotes?.trim() ? `\n\nStaff Note:\n"${customNotes.trim()}"` : '';

    let inAppDelivered = false;
    let emailDelivered = false;
    let docAgentNotified = false;

    // 1. In-App Notification to Customer
    if (sendInApp && customerUser?.id) {
      await prisma.notification.create({
        data: {
          recipientUserId: customerUser.id,
          applicationId: app.id,
          title: 'Action Required: Missing Tax Documents Requested',
          message: `Your tax agent (${actorName}) requested the following document(s):\n${categoryListFormatted}${noteFormatted}`,
          category: NotificationCategory.DOCUMENTER,
          priority: NotificationPriority.HIGH,
          actionUrl: '/customer/documents',
          actionLabel: 'Upload to Document Vault',
          relatedLeadName: customerName,
        },
      });
      inAppDelivered = true;
    }

    // 2. Email Dispatch to Customer
    if (sendEmail && customerEmail) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="background: linear-gradient(135deg, #16a34a, #15803d); padding: 18px; border-radius: 8px; text-align: center; color: white; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 20px;">Tax Documentation Required</h2>
            <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Tax Year ${app.taxYear} Preparation</p>
          </div>
          <p>Dear <strong>${customerName}</strong>,</p>
          <p>Our tax operations team is reviewing your <strong>Tax Year ${app.taxYear}</strong> return. To ensure accurate calculations, maximize your tax deductions, and avoid filing delays, please upload the following missing document(s) to your secure portal:</p>
          <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #16a34a; margin: 16px 0;">
            <h4 style="margin: 0 0 10px 0; color: #0f172a; font-size: 14px;">Requested Documents:</h4>
            <ul style="margin: 0; padding-left: 20px;">
              ${documentCategories.map((c) => `<li style="margin-bottom: 6px; font-weight: bold; color: #334155;">${c}</li>`).join('')}
            </ul>
            ${customNotes?.trim() ? `<p style="margin-top: 12px; font-style: italic; color: #64748b; font-size: 13px;"><strong>Agent Note:</strong> ${customNotes.trim()}</p>` : ''}
          </div>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${process.env.APP_URL || 'http://localhost:5173'}/customer/documents" style="background-color: #16a34a; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 14px;">Upload Missing Documents</a>
          </div>
          <p style="font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 24px;">
            Requested by: <strong>${actorName}</strong> (${agentUser?.role || 'Tax Operations Team'})<br/>
            TaxCRM Client Secure Vault
          </p>
        </div>
      `;

      await EmailService.sendEmail({
        to: customerEmail,
        subject: `[Action Required] Missing Tax Documents Needed for TY${app.taxYear} - ${customerName}`,
        text: `Dear ${customerName},\n\nPlease upload the following missing document(s) for your TY${app.taxYear} return:\n${categoryListFormatted}${noteFormatted}\n\nUpload link: ${process.env.APP_URL || 'http://localhost:5173'}/customer/documents`,
        html: emailHtml,
      });
      emailDelivered = true;
    }

    // 3. In-App Notification & Email to the Document Agent who handled/verified this lead
    let docAgentUser = app.assignedDocAgentId 
      ? await prisma.user.findUnique({ where: { id: app.assignedDocAgentId }, select: { id: true, firstName: true, lastName: true, email: true, role: true } })
      : null;

    if (!docAgentUser) {
      const docHistory = await prisma.stageHistory.findFirst({
        where: {
          applicationId: app.id,
          movedByUser: {
            role: { in: [Role.DOC_AGENT, Role.DOC_MANAGER, Role.DOC_TEAM_LEAD] },
          },
        },
        include: {
          movedByUser: {
            select: { id: true, firstName: true, lastName: true, email: true, role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      if (docHistory?.movedByUser) {
        docAgentUser = docHistory.movedByUser;
      }
    }

    if (docAgentUser && docAgentUser.id !== agentUserId) {
      const docAgentName = `${docAgentUser.firstName || ''} ${docAgentUser.lastName || ''}`.trim() || 'Document Agent';

      // 3a. In-App Notification to Document Agent
      await prisma.notification.create({
        data: {
          recipientUserId: docAgentUser.id,
          applicationId: app.id,
          title: `Missing Documents Requested: ${customerName}`,
          message: `${actorName} (${agentUser?.role || 'Tax Operations'}) requested missing documents from client ${customerName} (TY${app.taxYear}):\n${categoryListFormatted}${noteFormatted}`,
          category: NotificationCategory.DOCUMENTER,
          priority: NotificationPriority.HIGH,
          actionUrl: `/documenter?leadId=${app.id}`,
          actionLabel: 'View Lead in Documenter',
          relatedLeadName: customerName,
        },
      });

      // 3b. Email to Document Agent
      if (sendEmail && docAgentUser.email) {
        const docAgentEmailHtml = `
          <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="background: linear-gradient(135deg, #7c3aed, #6d28d9); padding: 18px; border-radius: 8px; text-align: center; color: white; margin-bottom: 20px;">
              <h2 style="margin: 0; font-size: 20px;">Missing Documents Alert</h2>
              <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Client: ${customerName} • TY${app.taxYear}</p>
            </div>
            <p>Hello <strong>${docAgentName}</strong>,</p>
            <p><strong>${actorName}</strong> (${agentUser?.role || 'Tax Operations'}) has requested additional missing documents from client <strong>${customerName}</strong>:</p>
            <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #7c3aed; margin: 16px 0;">
              <h4 style="margin: 0 0 10px 0; color: #0f172a; font-size: 14px;">Requested Documents:</h4>
              <ul style="margin: 0; padding-left: 20px;">
                ${documentCategories.map((c) => `<li style="margin-bottom: 6px; font-weight: bold; color: #334155;">${c}</li>`).join('')}
              </ul>
              ${customNotes?.trim() ? `<p style="margin-top: 12px; font-style: italic; color: #64748b; font-size: 13px;"><strong>Staff Note:</strong> ${customNotes.trim()}</p>` : ''}
            </div>
            <p style="font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 24px;">
              TaxCRM Operations Workflow Dispatch
            </p>
          </div>
        `;

        await EmailService.sendEmail({
          to: docAgentUser.email,
          subject: `[Missing Documents Alert] ${actorName} requested documents for ${customerName}`,
          text: `Hello ${docAgentName},\n\n${actorName} requested missing documents for ${customerName}:\n${categoryListFormatted}${noteFormatted}`,
          html: docAgentEmailHtml,
        });
      }

      docAgentNotified = true;
    }

    const channelsUsed = [
      inAppDelivered && 'In-App Notification to Client',
      emailDelivered && `Email to Client (${customerEmail})`,
      docAgentNotified && 'Notification to Document Agent',
    ].filter(Boolean).join(', ');

    // 4. Record AuditLog
    await prisma.auditLog.create({
      data: {
        applicationId: app.id,
        actorId: agentUserId,
        actorType: 'AGENT',
        actorName,
        actorRole: agentUser?.role || 'DOC_AGENT',
        action: 'STAGE_CHANGE',
        moduleKey: 'DOCUMENT_VAULT',
        details: {
          actionType: 'MISSING_DOCUMENTS_REQUESTED',
          requestedCategories: documentCategories,
          customNotes,
          sendInApp,
          sendEmail,
          recipientEmail: customerEmail,
          docAgentNotified,
          timestamp: new Date().toISOString(),
          remarks: `${actorName} requested missing documents (${documentCategories.join(', ')}) via ${channelsUsed || 'Portal'}.`,
        },
      },
    });

    // 5. Record StageHistory note
    await prisma.stageHistory.create({
      data: {
        applicationId: app.id,
        fromStage: app.currentStage,
        toStage: app.currentStage,
        remarks: `Requested missing documents: ${documentCategories.slice(0, 3).join(', ')}${documentCategories.length > 3 ? ` (+${documentCategories.length - 3} more)` : ''}. Dispatched to Client${docAgentNotified ? ' & Document Agent' : ''}.`,
        movedByUserId: agentUserId,
      },
    });

    return {
      success: true,
      documentCategories,
      sendInApp: inAppDelivered,
      sendEmail: emailDelivered,
      docAgentNotified,
      recipientEmail: customerEmail,
      message: `Successfully sent missing documents request to ${customerName}${docAgentNotified ? ' and notified Document Agent' : ''}! 🚀`,
    };
  }
}
