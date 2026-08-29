import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { prepReviewService } from '../services/prep-review-service';
import type { PrepReviewLead } from '../types/prep-review.types';
import toast from 'react-hot-toast';

export type DashboardChartMode = 'TODAY' | 'WEEK';

export function useTaxSpecialistDashboard() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [allLeads, setAllLeads] = useState<PrepReviewLead[]>([]);
  const [chartMode, setChartMode] = useState<DashboardChartMode>('TODAY');

  // Fetch real leads from backend database
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await prepReviewService.getPipelineLeads({ limit: 100 });
      setAllLeads(response.leads || []);
    } catch {
      toast.error('Failed to load specialist dashboard data');
      setAllLeads([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Compute strictly scoped Dual-Role stats for the logged-in specialist
  const { prepLeads, reviewerLeads, stats } = useMemo(() => {
    const currentUserId = user?.id;
    const currentUserEmail = user?.email?.toLowerCase().trim();

    // 1. Preparer leads: STRICTLY returns where this logged-in specialist is the assignedPreparer
    const prep = allLeads.filter((l) => {
      if (!l.assignedPreparer) return false;
      if (currentUserId && l.assignedPreparer.id === currentUserId) return true;
      if (currentUserEmail && l.assignedPreparer.email?.toLowerCase().trim() === currentUserEmail) return true;
      return false;
    });

    // 2. Reviewer leads: STRICTLY returns where this logged-in specialist is the assignedReviewer
    const review = allLeads.filter((l) => {
      if (!l.assignedReviewer) return false;
      if (currentUserId && l.assignedReviewer.id === currentUserId) return true;
      if (currentUserEmail && l.assignedReviewer.email?.toLowerCase().trim() === currentUserEmail) return true;
      return false;
    });

    const assignedPrepCount = prep.length;
    const assignedReviewCount = review.length;

    // Relevant leads
    const userRelevantLeads = [...prep, ...review];
    const qaApprovedToday = userRelevantLeads.filter(
      (l) => l.currentStage === 'QA_APPROVED' || l.currentStage === 'SALES_PITCH_QUEUE'
    ).length;

    const correctionsPending = userRelevantLeads.filter(
      (l) => l.currentStage === 'QA_REVISION_REQUESTED'
    ).length;

    const totalCaseload = assignedPrepCount + assignedReviewCount;

    return {
      prepLeads: prep,
      reviewerLeads: review,
      stats: {
        prepActiveDrafts: assignedPrepCount,
        prepSubmittedToQA: prep.filter((l) => l.currentStage === 'QA_IN_REVIEW').length,
        qaPendingAudits: assignedReviewCount,
        qaApprovedToday,
        correctionsPending,
        totalCaseload,
        passRate: 100,
      },
    };
  }, [allLeads, user?.id, user?.email]);

  // Dual-Role Caseload Breakdown (Donut Chart)
  const dualRoleMix = useMemo(() => {
    const total = stats.prepActiveDrafts + stats.qaPendingAudits;
    if (total === 0) {
      return [
        { name: 'Assigned as Tax Preparer', value: 0, color: '#3B82F6', pct: 0 },
        { name: 'Assigned as QA Reviewer', value: 0, color: '#8B5CF6', pct: 0 },
      ];
    }

    const prepPct = Math.round((stats.prepActiveDrafts / total) * 100);
    const reviewPct = 100 - prepPct;

    return [
      { name: 'Assigned as Tax Preparer', value: stats.prepActiveDrafts, color: '#3B82F6', pct: prepPct },
      { name: 'Assigned as QA Reviewer', value: stats.qaPendingAudits, color: '#8B5CF6', pct: reviewPct },
    ];
  }, [stats.prepActiveDrafts, stats.qaPendingAudits]);

  // 1. DYNAMIC TODAY HOURLY VELOCITY (Evaluates real today timestamps & dynamic 08:00 - 22:00 hours)
  const hourlyData = useMemo(() => {
    const todayStr = new Date().toDateString();

    // Find actual timestamps for prep submissions today
    const prepEventsToday: number[] = [];
    prepLeads.forEach((l) => {
      const draft: any = (l as any).taxDraftSummary || {};
      const submittedAt = draft.submittedAt || (l as any).submittedAt;
      if (submittedAt) {
        const d = new Date(submittedAt);
        if (d.toDateString() === todayStr) {
          prepEventsToday.push(d.getHours());
        }
      }
    });

    // Find actual timestamps for QA audits signed off today
    const qaEventsToday: number[] = [];
    reviewerLeads.forEach((l) => {
      const draft: any = (l as any).taxDraftSummary || {};
      const approvedAt = draft.qaApprovedAt || (l as any).signedOffAt;
      if (approvedAt) {
        const d = new Date(approvedAt);
        if (d.toDateString() === todayStr) {
          qaEventsToday.push(d.getHours());
        }
      }
    });

    // Determine max hour (supports night hours up to 22:00)
    const currentHour = new Date().getHours();
    const maxEventHour = Math.max(
      18,
      currentHour,
      ...prepEventsToday,
      ...qaEventsToday
    );
    const endHour = Math.min(23, maxEventHour > 18 ? maxEventHour + 1 : 20);

    // Generate dynamic hour slots: e.g. 08:00, 10:00, 12:00, 14:00, 16:00, 18:00, 20:00...
    const slots: { hour: string; hourNum: number }[] = [];
    for (let h = 8; h <= endHour; h += 2) {
      slots.push({
        hour: `${h.toString().padStart(2, '0')}:00`,
        hourNum: h,
      });
    }

    return slots.map((slot) => {
      const prepCount = prepEventsToday.filter((h) => h <= slot.hourNum).length;
      const qaCount = qaEventsToday.filter((h) => h <= slot.hourNum).length;
      return {
        hour: slot.hour,
        prepDrafts: prepCount,
        qaAudits: qaCount,
      };
    });
  }, [prepLeads, reviewerLeads]);

  // 2. DYNAMIC CURRENT WEEK DAILY THROUGHPUT (Mon to Sun)
  const weeklyData = useMemo(() => {
    const now = new Date();
    const currentDayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday...
    const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + distanceToMonday);

    const weekDays: { label: string; dateStr: string; dateObj: Date }[] = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const monthName = d.toLocaleString('en-US', { month: 'short' });
      const dayNum = d.getDate();
      weekDays.push({
        label: `${dayNames[i]} (${monthName} ${dayNum})`,
        dateStr: d.toDateString(),
        dateObj: d,
      });
    }

    return weekDays.map((day) => {
      // 1. Preparations done on this day
      let prepCount = 0;
      prepLeads.forEach((l) => {
        const draft: any = (l as any).taxDraftSummary || {};
        const timestamp = draft.submittedAt || (l as any).submittedAt || (l as any).createdAt;
        if (timestamp && new Date(timestamp).toDateString() === day.dateStr) {
          prepCount++;
        }
      });

      // 2. QA Audits completed on this day
      let qaCount = 0;
      reviewerLeads.forEach((l) => {
        const draft: any = (l as any).taxDraftSummary || {};
        const timestamp = draft.qaApprovedAt || (l as any).signedOffAt || (l as any).updatedAt;
        if (timestamp && new Date(timestamp).toDateString() === day.dateStr && l.currentStage === 'QA_APPROVED') {
          qaCount++;
        }
      });

      return {
        day: day.label,
        prepDrafts: prepCount,
        qaAudits: qaCount,
      };
    });
  }, [prepLeads, reviewerLeads]);

  // Priority Preparer Task (First return assigned to this specialist as Preparer)
  const priorityPrepTask = useMemo(() => {
    if (prepLeads.length === 0) return null;
    const item = prepLeads[0];

    const stageLabel =
      item.currentStage === 'QA_APPROVED'
        ? 'QA Approved'
        : item.currentStage === 'QA_IN_REVIEW'
          ? 'In QA Review'
          : item.currentStage === 'QA_REVISION_REQUESTED'
            ? 'Revision Requested'
            : 'Drafting 1040';

    return {
      id: item.id || item.applicationId,
      taxpayerName: item.taxpayerName || '-',
      taxYear: item.taxYear || 2025,
      filingStatus: item.maritalStatus || '-',
      complexity: item.complexity || 'STANDARD',
      designatedReviewer: item.assignedReviewer?.name || '-',
      slaDueTime: (item as any).targetDueDate
        ? new Date((item as any).targetDueDate).toLocaleString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : '-',
      status: stageLabel,
    };
  }, [prepLeads]);

  // Priority QA Audit Task (First return assigned to this specialist as QA Reviewer)
  const priorityQATask = useMemo(() => {
    if (reviewerLeads.length === 0) return null;
    const item = reviewerLeads[0];

    const draft: any = (item as any).taxDraftSummary || {};
    return {
      id: item.id || item.applicationId,
      taxpayerName: item.taxpayerName || '-',
      taxYear: item.taxYear || 2025,
      filingStatus: item.maritalStatus || '-',
      preparedBy: item.assignedPreparer?.name || '-',
      computedRefund: draft.federalRefund ?? item.estimatedRefund ?? 0,
      slaDueTime: (item as any).targetDueDate
        ? new Date((item as any).targetDueDate).toLocaleString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : '-',
      status: 'Pending QA Audit',
    };
  }, [reviewerLeads]);

  return {
    isLoading,
    stats,
    dualRoleMix,
    chartMode,
    setChartMode,
    hourlyData,
    weeklyData,
    priorityPrepTask,
    priorityQATask,
    refreshData: fetchDashboardData,
  };
}
