import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { salesService } from '../services/sales-service';
import type { SalesLeadItem, SalesAgentStats } from '../types/sales.types';
import {
  type DateFilterPreset,
  isDateInRange,
  getPeriodSuffix,
} from '@/shared/utils/date-filters';
import toast from 'react-hot-toast';

export type SalesChartMode = 'HOURLY' | 'WEEKLY';
export type SalesTimeRange = DateFilterPreset;

export function useSalesAgentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [chartMode, setChartMode] = useState<SalesChartMode>('HOURLY');
  const [timeRange, setTimeRange] = useState<DateFilterPreset>('TODAY');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [allLeads, setAllLeads] = useState<SalesLeadItem[]>([]);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await salesService.getPipelineLeads({ limit: 100 });
      const rawLeads = response.leads || [];

      const currentUserId = user?.id;
      const currentUserEmail = user?.email?.toLowerCase().trim();
      const isManager = user?.role === 'SALES_MANAGER' || user?.role === 'ADMIN';

      // Strictly assigned to this logged-in Sales Closer (or all leads if manager)
      const assignedToMe = isManager
        ? rawLeads
        : rawLeads.filter((lead) => {
            if (!lead.assignedSalesAgent) return false;
            if (currentUserId && lead.assignedSalesAgent.id === currentUserId) return true;
            if (currentUserEmail && lead.assignedSalesAgent.email?.toLowerCase().trim() === currentUserEmail) return true;
            return false;
          });

      setAllLeads(assignedToMe);
    } catch {
      toast.error('Failed to sync sales dashboard');
      setAllLeads([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.email, user?.role]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Stage checks
  const isPaidOrClosed = (lead: SalesLeadItem) => {
    return (
      lead.paymentStatus === 'PAID' ||
      lead.currentStage === 'PAID_AND_AUTHORIZED' ||
      lead.currentStage === 'FILING_QUEUE' ||
      lead.currentStage === 'FILING_IN_PROGRESS' ||
      lead.currentStage === 'FILING_SUCCESS'
    );
  };

  const isQuotedOrPaymentPending = (lead: SalesLeadItem) => {
    return (
      !isPaidOrClosed(lead) &&
      (lead.currentStage === 'QUOTATION_SENT' ||
        lead.currentStage === 'PAYMENT_PENDING' ||
        lead.paymentStatus === 'PAYMENT_LINK_SENT' ||
        Boolean(lead.feeBreakdown?.isQuoted))
    );
  };

  // Helper to extract relevant date for lead closure
  const getLeadClosedDate = (lead: SalesLeadItem): string | Date | null => {
    if (lead.paidAt) return lead.paidAt;
    if (lead.esignCompletedAt) return lead.esignCompletedAt;
    const paidHistory = lead.stageHistories?.find((h) => h.toStage === 'PAID_AND_AUTHORIZED');
    if (paidHistory?.createdAt) return paidHistory.createdAt;
    return (lead as any).updatedAt || null;
  };

  // Helper to extract revert date
  const getLeadRevertDate = (lead: SalesLeadItem): string | Date | null => {
    const draft = lead.taxDraftSummary as any;
    if (draft?.lastRevert?.revertedAt) return draft.lastRevert.revertedAt;
    const revHistory = lead.stageHistories?.find((h) =>
      ['CORRECTION_NEEDED', 'DOC_OUTREACH'].includes(h.toStage)
    );
    if (revHistory?.createdAt) return revHistory.createdAt;
    return (lead as any).updatedAt || null;
  };

  // Helper to extract quote date
  const getLeadQuotedDate = (lead: SalesLeadItem): string | Date | null => {
    const details = (lead.taxDraftSummary as any)?.paymentLinkDetails;
    if (details?.sentAt) return details.sentAt;
    const quoteHistory = lead.stageHistories?.find((h) =>
      ['QUOTATION_SENT', 'PAYMENT_PENDING'].includes(h.toStage)
    );
    if (quoteHistory?.createdAt) return quoteHistory.createdAt;
    return (lead as any).updatedAt || null;
  };

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
      return targetDay === 0 ? 6 : targetDay - 1; // 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
    }
    return -1;
  };

  // Top KPI Stats dynamically aggregated with strict filter range bounds
  const stats: SalesAgentStats & {
    avgDealSize: number;
    totalPotentialValue: number;
    periodSuffix: string;
  } = useMemo(() => {
    let awaiting = 0;
    let quoted = 0;
    let closedInPeriod = 0;
    let revenueInPeriod = 0;
    let reverted = 0;
    let totalPotentialValue = 0;
    let totalAssignedInPeriod = 0;

    allLeads.forEach((l) => {
      const fee = Number(l.feeBreakdown?.totalServiceFee) || 0;
      totalPotentialValue += fee;

      const isReverted =
        l.currentStage === 'CORRECTION_NEEDED' ||
        l.currentStage === 'DOC_OUTREACH' ||
        (l.taxDraftSummary as any)?.status === 'REVISION_REQUESTED' ||
        (l.taxDraftSummary as any)?.status === 'REVERTED_TO_DOCUMENTER';

      if (isReverted) {
        const revDate = getLeadRevertDate(l);
        if (isDateInRange(revDate, timeRange, customStartDate, customEndDate)) {
          reverted++;
        }
      } else if (isPaidOrClosed(l)) {
        const closedDate = getLeadClosedDate(l);
        if (isDateInRange(closedDate, timeRange, customStartDate, customEndDate)) {
          closedInPeriod++;
          revenueInPeriod += fee;
        }
      } else if (isQuotedOrPaymentPending(l)) {
        const quotedDate = getLeadQuotedDate(l);
        if (isDateInRange(quotedDate, timeRange, customStartDate, customEndDate)) {
          quoted++;
        }
      } else {
        awaiting++;
      }

      // Check if lead belongs to this period's assigned cohort
      const leadCreatedDate = (l as any).createdAt || (l as any).assignedAt || l.qaApprovedAt;
      if (isDateInRange(leadCreatedDate, timeRange, customStartDate, customEndDate)) {
        totalAssignedInPeriod++;
      }
    });

    const totalLeadsCount = allLeads.length;
    const periodCohortCount = totalAssignedInPeriod || totalLeadsCount;
    const conversionRate = periodCohortCount > 0 ? Math.round((closedInPeriod / periodCohortCount) * 100) : 0;
    const avgDealSize = closedInPeriod > 0
      ? Math.round(revenueInPeriod / closedInPeriod)
      : (totalLeadsCount > 0 ? Math.round(totalPotentialValue / totalLeadsCount) : 0);

    const periodSuffix = getPeriodSuffix(timeRange, customStartDate, customEndDate);

    return {
      assignedLeads: totalLeadsCount,
      pitchInProgress: awaiting,
      paymentsPending: quoted,
      dealsClosedToday: closedInPeriod,
      myRevenueToday: revenueInPeriod,
      myConversionRate: conversionRate,
      revertedLeads: reverted,
      avgDealSize,
      totalPotentialValue,
      periodSuffix,
    };
  }, [allLeads, timeRange, customStartDate, customEndDate]);

  // Donut Funnel Stage Mix
  const stageMix = useMemo(() => {
    const total = stats.assignedLeads || 1;
    const paidLeadsCount = stats.dealsClosedToday;
    return [
      {
        name: 'Awaiting Pitch Call',
        value: stats.pitchInProgress,
        pct: Math.round((stats.pitchInProgress / total) * 100),
        color: '#3B82F6',
      },
      {
        name: 'Quoted / Link Sent',
        value: stats.paymentsPending,
        pct: Math.round((stats.paymentsPending / total) * 100),
        color: '#A855F7',
      },
      {
        name: 'Paid & E-Signed',
        value: paidLeadsCount,
        pct: Math.round((paidLeadsCount / total) * 100),
        color: '#16A34A',
      },
    ];
  }, [stats]);

  // 100% Real Hourly Activity - Only plots activity within current day/period
  const hourlyData = useMemo(() => {
    const hours = [8, 10, 12, 14, 16, 18, 20];
    const slots = hours.map((h) => ({
      hour: `${h.toString().padStart(2, '0')}:00`,
      pitches: 0,
      deals: 0,
      revenue: 0,
    }));

    allLeads.forEach((lead) => {
      // Pitches / Calls logged
      const pitchTimestamps: Date[] = [];
      if (lead.callLogs && lead.callLogs.length > 0) {
        lead.callLogs.forEach((c) => {
          if (c.createdAt && isDateInRange(c.createdAt, timeRange, customStartDate, customEndDate)) {
            pitchTimestamps.push(new Date(c.createdAt));
          }
        });
      }
      if (lead.lastContactedAt && isDateInRange(lead.lastContactedAt, timeRange, customStartDate, customEndDate)) {
        pitchTimestamps.push(new Date(lead.lastContactedAt));
      }

      pitchTimestamps.forEach((d) => {
        const hour = d.getHours();
        let closestH = hours[0];
        let minDiff = Math.abs(hour - closestH);
        for (const h of hours) {
          const diff = Math.abs(hour - h);
          if (diff < minDiff) {
            minDiff = diff;
            closestH = h;
          }
        }
        const slotKey = `${closestH.toString().padStart(2, '0')}:00`;
        const slot = slots.find((s) => s.hour === slotKey);
        if (slot) slot.pitches += 1;
      });

      // Deals Closed & Paid
      if (isPaidOrClosed(lead)) {
        const closedDate = getLeadClosedDate(lead);
        if (closedDate && isDateInRange(closedDate, timeRange, customStartDate, customEndDate)) {
          const d = new Date(closedDate);
          const hour = d.getHours();
          let closestH = hours[0];
          let minDiff = Math.abs(hour - closestH);
          for (const h of hours) {
            const diff = Math.abs(hour - h);
            if (diff < minDiff) {
              minDiff = diff;
              closestH = h;
            }
          }
          const slotKey = `${closestH.toString().padStart(2, '0')}:00`;
          const slot = slots.find((s) => s.hour === slotKey);
          if (slot) {
            slot.deals += 1;
            slot.revenue += Number(lead.feeBreakdown?.totalServiceFee || 0);
          }
        }
      }
    });

    return slots;
  }, [allLeads, timeRange, customStartDate, customEndDate]);

  // Weekly Activity - Plots Monday to Sunday of the current calendar week
  const weeklyData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const slots = days.map((day) => ({
      day,
      pitches: 0,
      deals: 0,
      revenue: 0,
    }));

    allLeads.forEach((lead) => {
      // Pitches this week
      const weeklyPitchIdxs: number[] = [];
      if (lead.callLogs && lead.callLogs.length > 0) {
        lead.callLogs.forEach((c) => {
          const idx = getDayOfWeekIdx(c.createdAt);
          if (idx !== -1) weeklyPitchIdxs.push(idx);
        });
      }
      if (lead.lastContactedAt) {
        const idx = getDayOfWeekIdx(lead.lastContactedAt);
        if (idx !== -1) weeklyPitchIdxs.push(idx);
      }
      if (lead.stageHistories && lead.stageHistories.length > 0) {
        lead.stageHistories.forEach((h) => {
          if (['SALES_PITCHING', 'QUOTATION_SENT', 'PAYMENT_PENDING'].includes(h.toStage)) {
            const idx = getDayOfWeekIdx(h.createdAt);
            if (idx !== -1) weeklyPitchIdxs.push(idx);
          }
        });
      }

      weeklyPitchIdxs.forEach((dayIdx) => {
        if (dayIdx >= 0 && dayIdx < 7) {
          slots[dayIdx].pitches += 1;
        }
      });

      // Deals Closed this week
      if (isPaidOrClosed(lead)) {
        const closedDate = getLeadClosedDate(lead);
        const paidDayIdx = getDayOfWeekIdx(closedDate);

        if (paidDayIdx >= 0 && paidDayIdx < 7) {
          slots[paidDayIdx].deals += 1;
          slots[paidDayIdx].revenue += Number(lead.feeBreakdown?.totalServiceFee || 0);
        }
      }
    });

    return slots;
  }, [allLeads]);

  // Priority Pitch Targets (Top Leads to Call First)
  const priorityTargets = useMemo(() => {
    return allLeads
      .filter((l) => !isPaidOrClosed(l))
      .sort((a, b) => {
        return (Number(b.federalRefund) || 0) - (Number(a.federalRefund) || 0);
      })
      .slice(0, 4);
  }, [allLeads]);

  // Recent Sales Milestones & Activity from live DB records
  const recentActivities = useMemo(() => {
    const activities: Array<{
      id: string;
      title: string;
      taxpayerName: string;
      amount: string | number;
      type: string;
      time: string;
    }> = [];

    allLeads.forEach((l) => {
      const fee = l.feeBreakdown?.isQuoted
        ? `$${l.feeBreakdown.totalServiceFee}`
        : l.feeBreakdown?.totalServiceFee > 0
        ? `$${l.feeBreakdown.totalServiceFee}`
        : 'Unquoted';

      if (isPaidOrClosed(l)) {
        activities.push({
          id: `act-paid-${l.id}`,
          title: `Form 8879 Authorized & Fee Paid`,
          taxpayerName: l.taxpayerName,
          amount: fee,
          type: 'PAID',
          time: stats.periodSuffix,
        });
      } else if (isQuotedOrPaymentPending(l)) {
        activities.push({
          id: `act-quote-${l.id}`,
          title: `Fee Quotation Dispatched`,
          taxpayerName: l.taxpayerName,
          amount: fee,
          type: 'QUOTED',
          time: stats.periodSuffix,
        });
      } else {
        activities.push({
          id: `act-assign-${l.id}`,
          title: `QA Certified Return Assigned to You`,
          taxpayerName: l.taxpayerName,
          amount:
            l.federalRefund > 0
              ? `+$${Number(l.federalRefund).toLocaleString()} Refund`
              : l.balanceDue > 0
              ? `-$${Number(l.balanceDue).toLocaleString()} Tax Due`
              : '$0 Balance',
          type: 'ASSIGNED',
          time: stats.periodSuffix,
        });
      }
    });

    return activities;
  }, [allLeads, stats.periodSuffix]);

  const handleOpenPitch = (leadId: string) => {
    navigate(`/sales/agent/pitch/${leadId}`);
  };

  const handleCustomDateChange = (start: string, end: string) => {
    setCustomStartDate(start);
    setCustomEndDate(end);
  };

  return {
    isLoading,
    stats,
    stageMix,
    chartMode,
    setChartMode,
    timeRange,
    setTimeRange,
    customStartDate,
    customEndDate,
    handleCustomDateChange,
    hourlyData,
    weeklyData,
    priorityTargets,
    recentActivities,
    fetchDashboardData,
    handleOpenPitch,
  };
}
