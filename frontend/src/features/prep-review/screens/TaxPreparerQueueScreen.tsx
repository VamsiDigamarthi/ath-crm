import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Calculator, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { useTaxPreparerQueue, type PreparerQueueView, type PreparerQueueTab } from '../hooks/useTaxPreparerQueue';
import { PreparerFilterBar } from '../components/preparer/PreparerFilterBar';
import { PreparerQueueTable } from '../components/preparer/PreparerQueueTable';
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


export interface TaxPreparerQueueScreenProps {
  initialTab?: PreparerQueueTab;
  view?: PreparerQueueView;
}

export const TaxPreparerQueueScreen: React.FC<TaxPreparerQueueScreenProps> = ({ initialTab, view: propView }) => {
  const location = useLocation();

  const effectiveView = useMemo<PreparerQueueView>(() => {
    if (propView) return propView;
    const path = location.pathname;
    if (path.includes('/prep-review/preparer/pending')) return 'PENDING';
    if (path.includes('/prep-review/preparer/under-review')) return 'UNDER_REVIEW';
    if (path.includes('/prep-review/preparer/completed')) return 'COMPLETED';
    if (path.includes('/prep-review/preparer/working') || path === '/prep-review/preparer') return 'PREPARATION';
    return 'ALL';
  }, [propView, location.pathname]);

  const {
    filteredReturns,
    clientRows,
    handleOpenClient,
    counts,
    preparationCounts,
    bucketCounts,
    isLoading,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    complexityFilter,
    setComplexityFilter,
    priorityFilter,
    setPriorityFilter,
    refreshData,
    handleOpenNextReturn,
  } = useTaxPreparerQueue(effectiveView, initialTab);

  const getHeaderInfo = () => {
    switch (effectiveView) {
      case 'PENDING':
        return {
          title: 'Pending Returns',
          subtitle: `${filteredReturns.length} returns assigned to you awaiting draft initiation`,
        };
      case 'UNDER_REVIEW':
        return {
          title: 'Under Review',
          subtitle: `${filteredReturns.length} returns currently submitted for QA compliance audit`,
        };
      case 'COMPLETED':
        return {
          title: 'Completed Returns',
          subtitle: `${filteredReturns.length} returns with passed and approved QA compliance audits`,
        };
      case 'PREPARATION':
        return {
          title: 'Return Preparation',
          subtitle: `${filteredReturns.length} working returns (${preparationCounts.inProgress || 0} in preparation · ${preparationCounts.revisions || 0} revisions)`,
        };
      default:
        return {
          title: 'Preparer Queue',
          subtitle: `${filteredReturns.length} total returns · ${counts.working || 0} in preparation · ${counts.pending || 0} pending`,
        };
    }
  };

  const headerInfo = getHeaderInfo();

  // Stat cards (shown by default, "Hide stats" next to Filters)
  const { showStats, toggleStats } = useStatsVisibility('prep_preparer');
  const statCards = [
    { name: 'New assigned', value: bucketCounts.ASSIGNED, hint: 'Assigned in the last day', tone: 'text-slate-900' },
    { name: 'Pending', value: bucketCounts.PENDING, hint: 'Over 1 day, not started', tone: 'text-amber-700' },
    {
      name: 'In preparation',
      value: bucketCounts.IN_PROGRESS + bucketCounts.REVISIONS + bucketCounts.REVERTED,
      hint: `${bucketCounts.REVISIONS} revisions · ${bucketCounts.REVERTED} reverted`,
      tone: 'text-blue-700',
    },
    { name: 'Under review', value: bucketCounts.UNDER_REVIEW, hint: 'With QA reviewer', tone: 'text-purple-700' },
    { name: 'Completed', value: bucketCounts.COMPLETED, hint: 'QA approved', tone: 'text-emerald-700' },
  ];

  // Filters: Priority, Complexity, Tax year, Filing type (on top of the page / tab)
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const filterCategories = useMemo<FilterCategory[]>(() => {
    const years = Array.from(new Set(clientRows.map((r) => r.taxYear).filter(Boolean))).sort((a, b) => b - a);
    return [
      { id: 'priority', label: 'Priority', options: SYSTEM_PRIORITIES.map((p) => ({ label: p.label, value: p.value })) },
      { id: 'complexity', label: 'Complexity', options: COMPLEXITY_OPTIONS },
      { id: 'taxYear', label: 'Tax year', options: years.map((y) => ({ label: `TY ${y}`, value: String(y) })) },
      {
        id: 'filingType',
        label: 'Filing type',
        options: [
          { label: 'Individual (1040)', value: 'INDIVIDUAL' },
          { label: 'Business', value: 'BUSINESS' },
        ],
      },
    ];
  }, [clientRows]);
  const filteredRows = useMemo(() => {
    const match = (key: string, value: string) => !filters[key]?.length || filters[key].includes(value);
    return clientRows.filter(
      (r) =>
        match('priority', r.priority || 'NO_PRIORITY') &&
        match('complexity', r.complexity || 'STANDARD') &&
        match('taxYear', String(r.taxYear)) &&
        match('filingType', String(r.filingType || 'INDIVIDUAL').toUpperCase())
    );
  }, [clientRows, filters]);

  // Only Return Preparation has tabs; other pages hide tabs
  const pageTabs: { id: PreparerQueueTab; label: string; count: number }[] | undefined =
    effectiveView === 'ALL'
      ? undefined
      : effectiveView === 'PREPARATION'
      ? [
          { id: 'ALL', label: 'All', count: preparationCounts.all },
          { id: 'ASSIGNED', label: 'Assigned leads', count: preparationCounts.assigned },
          { id: 'DRAFTING', label: 'In preparation', count: preparationCounts.inProgress },
          { id: 'REVISIONS', label: 'Revisions needed', count: preparationCounts.revisions },
          { id: 'REVERTED', label: 'Reverted files', count: preparationCounts.reverted },
        ]
      : [];

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header with Title and Unified Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{headerInfo.title}</h2>
          <p className="text-sm text-slate-500 mt-1">
            {headerInfo.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Button variant="outline" size="md" onClick={refreshData} disabled={isLoading} title="Refresh" className="px-3 cursor-pointer">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            size="md"
            onClick={handleOpenNextReturn}
            disabled={filteredReturns.length === 0}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold flex items-center gap-2 cursor-pointer"
          >
            <Calculator className="w-4 h-4" />
            Open next return
          </Button>
        </div>
      </div>

      {showStats && <CompactStatCards cards={statCards} />}

      {/* Search & Tab Filter Bar */}
      <PreparerFilterBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        complexityFilter={complexityFilter}
        onComplexityChange={setComplexityFilter}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        counts={counts}
        tabs={pageTabs}
        hideSelects
      />

      {/* Queue Table Card (100% Real API Data) */}
      <PreparerQueueTable
        returns={filteredRows}
        extraHeaderActions={
          <div className="flex items-center gap-2">
            <StatsToggleButton visible={showStats} onToggle={toggleStats} />
            <AppFilterFlyout categories={filterCategories} selectedFilters={filters} onApply={(f) => setFilters(withoutAllValues(f))} onReset={() => setFilters({})} />
          </div>
        }
        isLoading={isLoading}
        onOpenWorkspace={handleOpenClient}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
    </div>
  );
};
