import { useState, useEffect, useCallback, useMemo } from 'react';
import { salesService } from '../services/sales-service';
import type { SalesRepItem, SalesManagerStats } from '../types/sales.types';
import toast from 'react-hot-toast';

export function useSalesTeamScorecards() {
  const [salesReps, setSalesReps] = useState<SalesRepItem[]>([]);
  const [managerStats, setManagerStats] = useState<SalesManagerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStaffData = useCallback(async (showToast = false) => {
    try {
      if (showToast) setIsRefreshing(true);
      const [staffData, statsData] = await Promise.all([
        salesService.getSalesStaff(),
        salesService.getManagerStats(),
      ]);

      setSalesReps(Array.isArray(staffData) ? staffData : []);
      setManagerStats(statsData);
      if (showToast) {
        toast.success('Sales Closers staff matrix & workload refreshed! 🔄');
      }
    } catch (err: any) {
      console.error('Failed to load sales team matrix:', err);
      toast.error('Failed to load sales team scorecard data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStaffData();
  }, [fetchStaffData]);

  // Dynamic Calculated Metrics from live database staff
  const kpiMetrics = useMemo(() => {
    const activeClosers = salesReps.length;
    const dealsClosed = salesReps.reduce((acc, r) => acc + (Number(r.dealsClosedToday) || 0), 0);
    const revenueToday = salesReps.reduce((acc, r) => acc + (Number(r.totalRevenueToday) || 0), 0);
    const totalHandled = salesReps.reduce((acc, r) => acc + (Number(r.pitchesCompletedToday) || Number(r.activeLeads) + Number(r.dealsClosedToday) || 0), 0);
    const avgConversion = totalHandled > 0 ? `${Math.round((dealsClosed / totalHandled) * 100)}%` : '0%';

    return {
      activeClosers,
      dealsClosedToday: dealsClosed || managerStats?.closedPaidDeals || 0,
      revenueGeneratedToday: revenueToday || managerStats?.totalRevenueMTD || 0,
      teamConversionRate: managerStats?.conversionRatePct ? `${managerStats.conversionRatePct}%` : avgConversion,
    };
  }, [salesReps, managerStats]);

  const totalDepartmentLeads = useMemo(() => {
    return managerStats?.pipelineLeads ?? salesReps.reduce((acc, r) => acc + (Number(r.activeLeads) || 0), 0);
  }, [managerStats, salesReps]);

  const handleBalancePool = async () => {
    try {
      await salesService.autoRoundRobin();
      toast.success('Pool workload balanced across active closers! ⚖️✨');
      await fetchStaffData(false);
    } catch {
      toast.error('Failed to rebalance pool workload');
    }
  };

  return {
    salesReps,
    kpiMetrics,
    totalDepartmentLeads,
    isLoading,
    isRefreshing,
    handleRefresh: () => fetchStaffData(true),
    handleBalancePool,
  };
}
