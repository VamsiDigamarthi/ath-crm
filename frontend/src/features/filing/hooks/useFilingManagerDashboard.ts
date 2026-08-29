import { useState, useEffect, useCallback, useMemo } from 'react';
import { filingService } from '../services/filing-service';
import type { FilingLeadItem, FilingManagerStats } from '../types/filing.types';
import toast from 'react-hot-toast';

export function useFilingManagerDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'TODAY' | 'WEEK' | 'MTD'>('MTD');
  const [leads, setLeads] = useState<FilingLeadItem[]>([]);
  const [stats, setStats] = useState<FilingManagerStats | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [queueRes, statsRes] = await Promise.all([
        filingService.getQueue({ limit: 100 }),
        filingService.getManagerStats(),
      ]);

      setLeads(queueRes.leads || []);
      setStats(statsRes);
    } catch {
      toast.error('Failed to sync filing manager dashboard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Stage Breakdown calculation
  const stageFunnel = useMemo(() => {
    const ready = leads.filter((l) => l.currentStage === 'FILING_QUEUE').length;
    const inProgress = leads.filter((l) => l.currentStage === 'FILING_IN_PROGRESS').length;
    const accepted = leads.filter((l) => l.currentStage === 'FILING_SUCCESS').length;
    const rejected = leads.filter((l) => l.currentStage === 'FILING_FAILED').length;
    const total = leads.length || 1;

    return [
      { name: 'Ready for Transmission', count: ready, pct: Math.round((ready / total) * 100), color: '#3B82F6' },
      { name: 'Transmitting via MeF', count: inProgress, pct: Math.round((inProgress / total) * 100), color: '#F59E0B' },
      { name: 'Accepted by IRS & Completed', count: accepted, pct: Math.round((accepted / total) * 100), color: '#16A34A' },
      { name: 'IRS Rejected / Error', count: rejected, pct: Math.round((rejected / total) * 100), color: '#EF4444' },
    ];
  }, [leads]);

  return {
    isLoading,
    timeRange,
    setTimeRange,
    leads,
    stats,
    stageFunnel,
    fetchDashboardData,
  };
}
