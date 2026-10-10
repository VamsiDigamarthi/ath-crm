import React, { useMemo, useState } from 'react';
import { RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';
import { CompactStatCards } from '@/shared/components/CompactStatCards';
import { AppFilterFlyout, withoutAllValues, type FilterCategory } from '@/shared/components/AppFilterFlyout';
import { StatsToggleButton } from '@/shared/components/StatsToggleButton';
import { useStatsVisibility } from '@/shared/hooks/useStatsVisibility';

const TEAM_FILTERS: FilterCategory[] = [
  {
    id: 'workload',
    label: 'Workload',
    options: [
      { label: 'No active leads (free)', value: 'NONE' },
      { label: '1 – 10 leads', value: 'LOW' },
      { label: 'More than 10 leads', value: 'HIGH' },
    ],
  },
  {
    id: 'today',
    label: 'Today',
    options: [
      { label: 'Closed a deal today', value: 'CLOSED' },
      { label: 'Pitched today', value: 'PITCHED' },
      { label: 'No activity today', value: 'IDLE' },
    ],
  },
];
import { Button } from '@/shared/components/Button';
import { SalesClosersWorkloadTable } from '../components/manager/SalesClosersWorkloadTable';
import { useSalesTeamScorecards } from '../hooks/useSalesTeamScorecards';

export const SalesTeamScorecardsScreen: React.FC = () => {
  const {
    salesReps,
    kpiMetrics,
    totalDepartmentLeads,
    isLoading,
    isRefreshing,
    handleRefresh,
    handleBalancePool,
  } = useSalesTeamScorecards();

  // Stat cards (shown by default) + filters on the closers table
  const { showStats, toggleStats } = useStatsVisibility('sales_mgr_team');
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const filteredReps = useMemo(() => {
    const match = (key: string, values: string[]) => !filters[key]?.length || values.some((v) => filters[key].includes(v));
    return salesReps.filter((r) => {
      const n = Number(r.activeLeads) || 0;
      const load = n === 0 ? 'NONE' : n <= 10 ? 'LOW' : 'HIGH';
      const today = [
        ...(r.dealsClosedToday > 0 ? ['CLOSED'] : []),
        ...(r.pitchesCompletedToday > 0 ? ['PITCHED'] : []),
        ...(r.dealsClosedToday === 0 && r.pitchesCompletedToday === 0 ? ['IDLE'] : []),
      ];
      return match('workload', [load]) && match('today', today);
    });
  }, [salesReps, filters]);

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      {/* 1. Header & Live Team Capacity Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Sales Closers Staff &amp; Capacity Matrix
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Manager Supervision
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Monitor individual closer pitch call volume, deal conversion rate, daily revenue generation, and balance caseload allocation.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={handleBalancePool}
            disabled={isLoading}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current text-amber-300" />
            <span>Balance Closers Pool</span>
          </Button>
        </div>
      </div>

      {/* 2. Summary cards (compact) */}
      {showStats && (
        <CompactStatCards
          cards={[
            { name: 'Active sales closers', value: kpiMetrics.activeClosers, hint: 'Dedicated revenue closers', tone: 'text-blue-700' },
            { name: 'Deals closed today', value: kpiMetrics.dealsClosedToday, hint: 'Paid & e-signed', tone: 'text-emerald-700' },
            { name: 'Revenue today', value: `${kpiMetrics.revenueGeneratedToday.toLocaleString()}`, hint: 'Service fee receipts', tone: 'text-purple-700' },
            { name: 'Team conversion', value: kpiMetrics.teamConversionRate, hint: 'Pitches converted to paid', tone: 'text-amber-700' },
          ]}
        />
      )}

      {/* 3. Closers Workload Table */}
      <SalesClosersWorkloadTable 
        salesReps={filteredReps}
        extraHeaderActions={
          <div className="flex items-center gap-2">
            <StatsToggleButton visible={showStats} onToggle={toggleStats} />
            <AppFilterFlyout categories={TEAM_FILTERS} selectedFilters={filters} onApply={(f) => setFilters(withoutAllValues(f))} onReset={() => setFilters({})} />
          </div>
        }
        totalDepartmentLeads={totalDepartmentLeads}
        isLoading={isLoading} 
      />
    </div>
  );
};
