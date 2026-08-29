import { useState, useEffect, useCallback, useMemo } from 'react';
import { filingService } from '../services/filing-service';
import type { FilingStaffMember, FilingManagerStats } from '../types/filing.types';
import toast from 'react-hot-toast';

export function useFilingStaffMatrix() {
  const [isLoading, setIsLoading] = useState(true);
  const [staffList, setStaffList] = useState<FilingStaffMember[]>([]);
  const [managerStats, setManagerStats] = useState<FilingManagerStats | null>(null);

  const fetchStaffData = useCallback(async (showToast = false) => {
    setIsLoading(true);
    try {
      const [staffData, statsData] = await Promise.all([
        filingService.getStaff(),
        filingService.getManagerStats(),
      ]);

      setStaffList(staffData);
      setManagerStats(statsData);
      if (showToast) {
        toast.success('Filing matrix refreshed! ⚡');
      }
    } catch {
      toast.error('Failed to sync filing specialists matrix');
      setStaffList([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaffData();
  }, [fetchStaffData]);

  const kpiMetrics = useMemo(() => {
    const activeSpecialists = staffList.length;
    const acceptedCount = staffList.reduce((acc, s) => acc + (Number(s.acceptedCount) || 0), 0);
    const totalTransmissions = staffList.reduce((acc, s) => acc + (Number(s.transmissionsCompletedToday) || 0), 0);
    const avgAcceptance = totalTransmissions > 0 
      ? `${Math.round((acceptedCount / totalTransmissions) * 100)}%` 
      : '0%';

    return {
      activeSpecialists,
      readyForTransmission: managerStats?.readyForTransmission ?? staffList.reduce((acc, s) => acc + (Number(s.openQueue) || 0), 0),
      acceptedToday: acceptedCount || managerStats?.acceptedToday || 0,
      acceptanceRate: managerStats?.acceptanceRatePct !== undefined ? `${managerStats.acceptanceRatePct}%` : avgAcceptance,
      efinStatus: managerStats?.efinGatewayStatus || 'ONLINE',
    };
  }, [staffList, managerStats]);

  const totalDepartmentLeads = useMemo(() => {
    return managerStats?.totalDepartmentLeads ?? staffList.reduce((acc, s) => acc + (Number(s.activeCaseload) || 0), 0);
  }, [managerStats, staffList]);

  const handleBalancePool = async () => {
    try {
      await filingService.autoRoundRobin();
      toast.success('Transmission workload balanced across active specialists! ⚖️✨');
      await fetchStaffData(false);
    } catch {
      toast.error('Failed to rebalance workload');
    }
  };

  return {
    isLoading,
    staffList,
    managerStats,
    kpiMetrics,
    totalDepartmentLeads,
    fetchStaffData,
    handleBalancePool,
  };
}
