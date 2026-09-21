import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { prepReviewService } from '../services/prep-review-service';
import type { PrepReviewLead } from '../types/prep-review.types';
import {
  type DateFilterPreset,
  isDateInRange,
  getPeriodSuffix,
} from '@/shared/utils/date-filters';
import toast from 'react-hot-toast';

export type DashboardChartMode = 'TODAY' | 'WEEK';

export function useTaxSpecialistDashboard() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [allLeads, setAllLeads] = useState<PrepReviewLead[]>([]);
  const [timeRange, setTimeRange] = useState<DateFilterPreset>('MONTH');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
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

  // Actual Calendar Week Index: Monday (0) to Sunday (6)
  const getDayOfWeekIdx = (dateVal?: string | Date | null): number => {
    if (!dateVal) return -1;
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return -1;

    const now = new Date();
    const day = now.getDay();
    const diffToMonday = day === 0 ? 6 : day - 1;
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday, 0, 0, 0, 0);
    const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6, 23, 59, 59, 999);

    if (d.getTime() >= monday.getTime() && d.getTime() <= sunday.getTime()) {
      const targetDay = d.getDay();
      return targetDay === 0 ? 6 : targetDay - 1;
    }
    return -1;
  };

  // Compute strictly scoped Dual-Role stats for the logged-in specialist with date range
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
    let qaApprovedInPeriod = 0;
    let correctionsInPeriod = 0;

    userRelevantLeads.forEach((l) => {
      const draft: any = (l as any).taxDraftSummary || {};
      const isApproved =
        l.prepStage === 'QA_APPROVED' ||
        draft.status === 'QA_APPROVED' ||
        Boolean(draft.qaApprovedByUserId) ||
        Boolean(draft.qaApprovedAt) ||
        [
          'QA_APPROVED',
          'SALES_PITCH_QUEUE',
          'SALES_PITCHING',
          'QUOTATION_SENT',
          'PAYMENT_PENDING',
          'PAID_AND_AUTHORIZED',
          'FILING_QUEUE',
          'FILING_IN_PROGRESS',
          'FILING_SUCCESS',
        ].includes(l.currentStage);

      const approvedDate = draft.qaApprovedAt || (l as any).signedOffAt || (l as any).updatedAt;
      if (isApproved && isDateInRange(approvedDate, timeRange, customStartDate, customEndDate)) {
        qaApprovedInPeriod++;
      }

      const isCorrection =
        l.prepStage === 'QA_REVISION_REQUESTED' ||
        l.currentStage === 'QA_REVISION_REQUESTED' ||
        l.currentStage === 'CORRECTION_NEEDED' ||
        draft.status === 'REVISION_REQUESTED';

      const revertDate = draft.lastRevert?.revertedAt || (l as any).updatedAt;
      if (isCorrection && isDateInRange(revertDate, timeRange, customStartDate, customEndDate)) {
        correctionsInPeriod++;
      }
    });

    const totalCaseload = assignedPrepCount + assignedReviewCount;
    const periodSuffix = getPeriodSuffix(timeRange, customStartDate, customEndDate);

    return {
      prepLeads: prep,
      reviewerLeads: review,
      stats: {
        prepActiveDrafts: assignedPrepCount,
        prepSubmittedToQA: prep.filter((l) => l.currentStage === 'QA_IN_REVIEW').length,
        qaPendingAudits: assignedReviewCount,
        qaApprovedToday: qaApprovedInPeriod,
        correctionsPending: correctionsInPeriod,
        totalCaseload,
        passRate: 100,
        periodSuffix,
      },
    };
  }, [allLeads, user?.id, user?.email, timeRange, customStartDate, customEndDate]);

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

  // 1. DYNAMIC TODAY HOURLY VELOCITY
  const hourlyData = useMemo(() => {
    const prepEventsToday: number[] = [];
    prepLeads.forEach((l) => {
      const draft: any = (l as any).taxDraftSummary || {};
      const submittedAt = draft.submittedAt || (l as any).submittedAt;
      if (submittedAt && isDateInRange(submittedAt, timeRange, customStartDate, customEndDate)) {
        const d = new Date(submittedAt);
        prepEventsToday.push(d.getHours());
      }
    });

    const qaEventsToday: number[] = [];
    reviewerLeads.forEach((l) => {
      const draft: any = (l as any).taxDraftSummary || {};
      const approvedAt = draft.qaApprovedAt || (l as any).signedOffAt;
      if (approvedAt && isDateInRange(approvedAt, timeRange, customStartDate, customEndDate)) {
        const d = new Date(approvedAt);
        qaEventsToday.push(d.getHours());
      }
    });

    const hours = [8, 10, 12, 14, 16, 18, 20, 22];
    return hours.map((h) => {
      const draftsCount = prepEventsToday.filter((hr) => hr >= h && hr < h + 2).length;
      const reviewsCount = qaEventsToday.filter((hr) => hr >= h && hr < h + 2).length;

      return {
        hour: `${h.toString().padStart(2, '0')}:00`,
        prepDrafts: draftsCount,
        qaAudits: reviewsCount,
        completed: draftsCount + reviewsCount,
      };
    });
  }, [prepLeads, reviewerLeads, timeRange, customStartDate, customEndDate]);

  // 2. DYNAMIC WEEKLY VELOCITY (Mon-Sun of actual calendar week)
  const weeklyData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const prepByDay: number[] = [0, 0, 0, 0, 0, 0, 0];
    const qaByDay: number[] = [0, 0, 0, 0, 0, 0, 0];

    prepLeads.forEach((l) => {
      const draft: any = (l as any).taxDraftSummary || {};
      const dateVal = draft.submittedAt || (l as any).submittedAt || (l as any).updatedAt || (l as any).createdAt;
      const dayIdx = getDayOfWeekIdx(dateVal);
      if (dayIdx >= 0 && dayIdx < 7) {
        prepByDay[dayIdx] += 1;
      }
    });

    reviewerLeads.forEach((l) => {
      const draft: any = (l as any).taxDraftSummary || {};
      const dateVal = draft.qaApprovedAt || (l as any).signedOffAt || (l as any).updatedAt || (l as any).createdAt;
      const dayIdx = getDayOfWeekIdx(dateVal);
      if (dayIdx >= 0 && dayIdx < 7) {
        qaByDay[dayIdx] += 1;
      }
    });

    return days.map((day, idx) => ({
      day,
      prepDrafts: prepByDay[idx],
      qaAudits: qaByDay[idx],
      completed: prepByDay[idx] + qaByDay[idx],
    }));
  }, [prepLeads, reviewerLeads]);

  // Priority drafting tasks
  const priorityPrepTask = useMemo(() => {
    const raw =
      prepLeads.find(
        (l) =>
          l.currentStage === 'PREP_IN_PROGRESS' ||
          l.currentStage === 'DOC_PREP_COMPLETE' ||
          l.prepStage === 'PREP_IN_PROGRESS'
      ) ||
      prepLeads[0] ||
      null;

    if (!raw) return null;

    return {
      id: raw.id,
      taxpayerName: raw.taxpayerName || 'Assigned Taxpayer',
      taxYear: raw.taxYear || 2024,
      filingStatus: raw.maritalStatus || 'Single',
      complexity: raw.complexity || 'Standard W-2',
      designatedReviewer: raw.assignedReviewer?.name || 'Unassigned',
      slaDueTime: 'Today 5:00 PM',
      status: raw.prepStage || raw.currentStage || 'IN_PREP',
    };
  }, [prepLeads]);

  // Priority QA review tasks
  const priorityQATask = useMemo(() => {
    const raw =
      reviewerLeads.find(
        (l) =>
          l.currentStage === 'QA_IN_REVIEW' ||
          l.prepStage === 'QA_IN_REVIEW' ||
          l.prepStage === 'QA_REVIEW_QUEUE'
      ) ||
      reviewerLeads[0] ||
      null;

    if (!raw) return null;
    const draft: any = (raw as any).taxDraftSummary || {};

    return {
      id: raw.id,
      taxpayerName: raw.taxpayerName || 'Assigned Taxpayer',
      taxYear: raw.taxYear || 2024,
      filingStatus: raw.maritalStatus || 'Single',
      preparedBy: raw.assignedPreparer?.name || 'Assigned Specialist',
      computedRefund: draft.federalRefund || (raw as any).federalRefund || 0,
      slaDueTime: 'Today 4:30 PM',
      status: raw.prepStage || raw.currentStage || 'QA_IN_REVIEW',
    };
  }, [reviewerLeads]);

  const handleCustomDateChange = (start: string, end: string) => {
    setCustomStartDate(start);
    setCustomEndDate(end);
  };

  return {
    isLoading,
    stats,
    dualRoleMix,
    chartMode,
    setChartMode,
    timeRange,
    setTimeRange,
    customStartDate,
    customEndDate,
    handleCustomDateChange,
    hourlyData,
    weeklyData,
    priorityPrepTask,
    priorityQATask,
    refreshData: () => fetchDashboardData(),
  };
}
