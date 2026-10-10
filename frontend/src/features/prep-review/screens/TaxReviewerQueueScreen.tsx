import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import {
  useTaxReviewerQueue,
  type ReviewerQueueTab,
  type ReviewerQueueView,
} from '../hooks/useTaxReviewerQueue';
import { ReviewerFilterBar } from '../components/reviewer/ReviewerFilterBar';
import { ReviewerQueueTable } from '../components/reviewer/ReviewerQueueTable';
import { CompactStatCards } from '@/shared/components/CompactStatCards';
import { AppFilterFlyout, withoutAllValues, type FilterCategory } from '@/shared/components/AppFilterFlyout';
import { StatsToggleButton } from '@/shared/components/StatsToggleButton';
import { useStatsVisibility } from '@/shared/hooks/useStatsVisibility';
import { SYSTEM_PRIORITIES } from '@/shared/constants/system-enums';

const COMPLEXITY_OPTIONS = [
  { label: 'Standard', value: 'STANDARD' },
  { label: 'Multi-state', value: 'MULTI_STATE' },
  { label: 'Investments (1099-B)', value: 'INVESTMENTS_1099B' },
  { label: 'Foreign / FBAR', value: 'FOREIGN_FBAR' },
  { label: 'Business (Sch C)', value: 'BUSINESS_SCH_C' },
];

export interface TaxReviewerQueueScreenProps {
  initialTab?: ReviewerQueueTab;
  view?: ReviewerQueueView;
}

export const TaxReviewerQueueScreen: React.FC<TaxReviewerQueueScreenProps> = ({
  initialTab,
  view: propView,
}) => {
  const location = useLocation();

  const effectiveView = useMemo<ReviewerQueueView>(() => {
    if (propView) return propView;
    const path = location.pathname;
    if (path.includes('/prep-review/reviewer/assigned')) return 'ASSIGNED';
    if (path.includes('/prep-review/reviewer/pending')) return 'PENDING';
    if (path.includes('/prep-review/reviewer/revisions')) return 'REVISIONS';
    if (path.includes('/prep-review/reviewer/approved')) return 'APPROVED';
    return 'ALL';
  }, [propView, location.pathname]);

  const {
    filteredReturns,
    clientRows,
    counts,
    bucketCounts,
    isLoading,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    refreshData,
    handleStartPriorityAudit,
    handleOpenAudit,
  } = useTaxReviewerQueue(effectiveView, initialTab);

  const getHeaderInfo = () => {
    switch (effectiveView) {
      case 'PENDING':
        return {
          title: 'Pending Returns',
          subtitle: `${filteredReturns.length} returns assigned to you but still with the preparer`,
          emptyText: 'No pending returns currently in processing awaiting QA audit.',
        };
      case 'REVISIONS':
        return {
          title: 'Revision Required',
          subtitle: `${filteredReturns.length} returns sent back to preparers for corrections`,
          emptyText: 'No returns currently requiring revisions from preparers.',
        };
      case 'APPROVED':
        return {
          title: 'Approved Returns',
          subtitle: `${filteredReturns.length} returns signed off by QA`,
          emptyText: 'No approved returns found in this period.',
        };
      case 'ASSIGNED':
        return {
          title: 'Assigned Returns',
          subtitle: `${filteredReturns.length} returns submitted by preparers awaiting your QA review`,
          emptyText: 'No assigned returns waiting for your review. Great job!',
        };
      default:
        return {
          title: 'Assigned Returns',
          subtitle: `${counts.all || 0} total returns (${counts.pending || 0} in processing · ${counts.revisions || 0} revisions · ${counts.signedOff || 0} approved)`,
          emptyText: 'No assigned returns in this queue. Great job!',
        };
    }
  };

  const headerInfo = getHeaderInfo();

  // Stat cards (shown by default, "Hide stats" next to Filters)
  const { showStats, toggleStats } = useStatsVisibility('prep_reviewer');
  const statCards = [
    { name: 'Waiting for my review', value: bucketCounts.ASSIGNED, hint: 'Submitted by preparers', tone: 'text-blue-700' },
    { name: 'Pending', value: bucketCounts.PENDING, hint: 'Still with the preparer', tone: 'text-amber-700' },
    { name: 'Revision required', value: bucketCounts.REVISIONS, hint: 'Sent back for corrections', tone: 'text-rose-600' },
    { name: 'Approved', value: bucketCounts.APPROVED, hint: 'Signed off by QA', tone: 'text-emerald-700' },
  ];

  // Filters: Preparer, Priority, Complexity, Tax year (options from live data)
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const filterCategories = useMemo<FilterCategory[]>(() => {
    const years = Array.from(new Set(clientRows.map((r) => r.taxYear).filter(Boolean))).sort((a, b) => b - a);
    const preparers = new Map<string, string>();
    clientRows.forEach((r) => r.assignedPreparer && preparers.set(r.assignedPreparer.id, r.assignedPreparer.name || r.assignedPreparer.email));
    return [
      { id: 'preparer', label: 'Preparer', options: Array.from(preparers, ([value, label]) => ({ label, value })) },
      { id: 'priority', label: 'Priority', options: SYSTEM_PRIORITIES.map((p) => ({ label: p.label, value: p.value })) },
      { id: 'complexity', label: 'Complexity', options: COMPLEXITY_OPTIONS },
      { id: 'taxYear', label: 'Tax year', options: years.map((y) => ({ label: `TY ${y}`, value: String(y) })) },
    ];
  }, [clientRows]);
  const filteredRows = useMemo(() => {
    const match = (key: string, value: string) => !filters[key]?.length || filters[key].includes(value);
    return clientRows.filter(
      (r) =>
        match('preparer', r.assignedPreparer?.id || '') &&
        match('priority', r.priority || 'NO_PRIORITY') &&
        match('complexity', r.complexity || 'STANDARD') &&
        match('taxYear', String(r.taxYear))
    );
  }, [clientRows, filters]);

  return (
    <div className="w-full space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {headerInfo.title}
          </h2>
          <p className="text-sm text-slate-500 mt-1">{headerInfo.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="md"
            onClick={refreshData}
            disabled={isLoading}
            title="Refresh"
            className="px-3 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            size="md"
            onClick={handleStartPriorityAudit}
            disabled={filteredReturns.length === 0}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold flex items-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            Start next audit
          </Button>
        </div>
      </div>

      {showStats && <CompactStatCards cards={statCards} />}

      {/* Legacy Filter Bar only if effectiveView === 'ALL' and on legacy queue */}
      {effectiveView === 'ALL' && (
        <ReviewerFilterBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={counts}
        />
      )}

      {/* Queue Table Card (100% Real API Data) */}
      <ReviewerQueueTable
        returns={filteredRows}
        extraHeaderActions={
          <div className="flex items-center gap-2">
            <StatsToggleButton visible={showStats} onToggle={toggleStats} />
            <AppFilterFlyout categories={filterCategories} selectedFilters={filters} onApply={(f) => setFilters(withoutAllValues(f))} onReset={() => setFilters({})} />
          </div>
        }
        isLoading={isLoading}
        onOpenAudit={handleOpenAudit}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        emptyText={headerInfo.emptyText}
      />
    </div>
  );
};
