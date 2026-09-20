import { useState, useEffect, useCallback, useMemo } from 'react';
import { filingService } from '../services/filing-service';
import type { FilingLeadItem, FilingManagerStats } from '../types/filing.types';
import {
  type DateFilterPreset,
  isDateInRange,
  getPeriodSuffix,
} from '@/shared/utils/date-filters';
import toast from 'react-hot-toast';

export function useFilingManagerDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<DateFilterPreset>('MONTH');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [leads, setLeads] = useState<FilingLeadItem[]>([]);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const queueRes = await filingService.getQueue({ limit: 100 });
      setLeads(queueRes.leads || []);
    } catch {
      toast.error('Failed to sync filing manager dashboard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Dynamically Filtered Metrics based on Selected Date Range
  const stats: (FilingManagerStats & { periodSuffix: string }) = useMemo(() => {
    const totalQueue = leads.length;
    const readyForTransmission = leads.filter((l) => l.currentStage === 'FILING_QUEUE').length;
    const inProgressCount = leads.filter((l) => l.currentStage === 'FILING_IN_PROGRESS').length;

    let acceptedInPeriod = 0;
    let rejectedInPeriod = 0;

    leads.forEach((l) => {
      const isAccepted = l.currentStage === 'FILING_SUCCESS';
      const isRejected = l.currentStage === 'FILING_FAILED';

      const transDate =
        l.transmissionInfo?.acceptedAt ||
        l.transmissionInfo?.transmittedAt ||
        (l as any).updatedAt ||
        (l as any).createdAt;

      if (isAccepted && isDateInRange(transDate, timeRange, customStartDate, customEndDate)) {
        acceptedInPeriod++;
      }
      if (isRejected && isDateInRange(transDate, timeRange, customStartDate, customEndDate)) {
        rejectedInPeriod++;
      }
    });

    const totalFinished = acceptedInPeriod + rejectedInPeriod;
    const acceptanceRate = totalFinished > 0 ? Math.round((acceptedInPeriod / totalFinished) * 100) : (acceptedInPeriod > 0 ? 100 : 0);
    const periodSuffix = getPeriodSuffix(timeRange, customStartDate, customEndDate);

    return {
      readyForTransmission,
      transmittingMeF: inProgressCount,
      acceptedToday: acceptedInPeriod,
      rejectedToday: rejectedInPeriod,
      totalDepartmentLeads: totalQueue,
      acceptanceRatePct: acceptanceRate,
      efinGatewayStatus: 'ONLINE',
      inProgressCount,
      acceptedCount: acceptedInPeriod,
      rejectedCount: rejectedInPeriod,
      acceptanceRate: `${acceptanceRate}%`,
      avgTransmissionMinutes: 1.4,
      periodSuffix,
    };
  }, [leads, timeRange, customStartDate, customEndDate]);

  // Stage Breakdown calculation
  const stageFunnel = useMemo(() => {
    const ready = stats.readyForTransmission || 0;
    const inProgress = stats.inProgressCount || 0;
    const accepted = stats.acceptedCount || 0;
    const rejected = stats.rejectedCount || 0;
    const total = leads.length || 1;

    return [
      { name: 'Ready for Transmission', count: ready, pct: Math.round((ready / total) * 100), color: '#3B82F6' },
      { name: 'Transmitting via MeF', count: inProgress, pct: Math.round((inProgress / total) * 100), color: '#F59E0B' },
      { name: 'Accepted by IRS & Completed', count: accepted, pct: Math.round((accepted / total) * 100), color: '#16A34A' },
      { name: 'IRS Rejected / Error', count: rejected, pct: Math.round((rejected / total) * 100), color: '#EF4444' },
    ];
  }, [leads, stats]);

  const handleCustomDateChange = (start: string, end: string) => {
    setCustomStartDate(start);
    setCustomEndDate(end);
  };

  return {
    isLoading,
    timeRange,
    setTimeRange,
    customStartDate,
    customEndDate,
    handleCustomDateChange,
    leads,
    stats,
    stageFunnel,
    fetchDashboardData,
  };
}
