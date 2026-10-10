import React, { useMemo, useState } from 'react';
import { Users, RefreshCw, Scale } from 'lucide-react';
import { CompactStatCards } from '@/shared/components/CompactStatCards';
import { AppFilterFlyout, withoutAllValues, type FilterCategory } from '@/shared/components/AppFilterFlyout';
import { StatsToggleButton } from '@/shared/components/StatsToggleButton';
import { useStatsVisibility } from '@/shared/hooks/useStatsVisibility';

const STAFF_FILTERS: FilterCategory[] = [
  {
    id: 'workload',
    label: 'Workload',
    options: [
      { label: 'No active returns (free)', value: 'NONE' },
      { label: '1 – 5 returns', value: 'LOW' },
      { label: 'More than 5 returns', value: 'HIGH' },
    ],
  },
  {
    id: 'today',
    label: 'Today',
    options: [
      { label: 'Transmitted today', value: 'ACTIVE' },
      { label: 'No transmissions today', value: 'IDLE' },
    ],
  },
  {
    id: 'rejections',
    label: 'IRS rejections',
    options: [
      { label: 'Has rejections', value: 'YES' },
      { label: 'No rejections', value: 'NO' },
    ],
  },
];
import { Button } from '@/shared/components/Button';
import { FilingStaffWorkloadTable } from '../components/manager/FilingStaffWorkloadTable';
import { useFilingStaffMatrix } from '../hooks/useFilingStaffMatrix';

export const FilingStaffScorecardsScreen: React.FC = () => {
  const {
    isLoading,
    staffList,
    kpiMetrics,
    totalDepartmentLeads,
    fetchStaffData,
    handleBalancePool,
  } = useFilingStaffMatrix();

  // Stat cards (shown by default) + filters on the specialists table
  const { showStats, toggleStats } = useStatsVisibility('filing_mgr_staff');
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const filteredStaff = useMemo(() => {
    const match = (key: string, value: string) => !filters[key]?.length || filters[key].includes(value);
    return staffList.filter((s) => {
      const n = Number(s.activeCaseload) || 0;
      return (
        match('workload', n === 0 ? 'NONE' : n <= 5 ? 'LOW' : 'HIGH') &&
        match('today', s.transmissionsCompletedToday > 0 ? 'ACTIVE' : 'IDLE') &&
        match('rejections', s.rejectedCount > 0 ? 'YES' : 'NO')
      );
    });
  }, [staffList, filters]);

  return (
    <div className="w-full space-y-6 font-sans">
      {/* 1. Header with Title & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200 flex items-center gap-1">
              <Users className="w-3 h-3 text-[#16A34A]" />
              <span>Filing Department Supervision</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Filing Specialists Staff &amp; Capacity Matrix
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Monitor individual transmission volume, IRS acceptance rate, and rebalance transmission caseload.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchStaffData(true)}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 border-slate-200 cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={handleBalancePool}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Balance Specialists Pool</span>
          </Button>
        </div>
      </div>

      {/* 2. Summary cards (compact) */}
      {showStats && (
        <CompactStatCards
          cards={[
            { name: 'Active specialists', value: kpiMetrics.activeSpecialists, hint: 'Authorized e-file transmitters', tone: 'text-blue-700' },
            { name: 'Ready for transmission', value: kpiMetrics.readyForTransmission, hint: 'Waiting to be sent', tone: 'text-amber-700' },
            { name: 'IRS accepted', value: kpiMetrics.acceptedToday, hint: 'Filed successfully', tone: 'text-emerald-700' },
            { name: 'Acceptance rate', value: kpiMetrics.acceptanceRate, hint: kpiMetrics.acceptedToday > 0 ? 'Accepted vs sent' : 'No transmissions yet', tone: 'text-purple-700' },
          ]}
        />
      )}

      {/* 3. Filing Staff Workload Table */}
      <FilingStaffWorkloadTable
        staffList={filteredStaff}
        extraHeaderActions={
          <div className="flex items-center gap-2">
            <StatsToggleButton visible={showStats} onToggle={toggleStats} />
            <AppFilterFlyout categories={STAFF_FILTERS} selectedFilters={filters} onApply={(f) => setFilters(withoutAllValues(f))} onReset={() => setFilters({})} />
          </div>
        }
        totalDepartmentLeads={totalDepartmentLeads}
        isLoading={isLoading}
      />
    </div>
  );
};
