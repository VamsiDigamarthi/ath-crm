import React from 'react';
import { Calculator, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { useTaxPreparerQueue, type PreparerQueueView, type PreparerQueueTab } from '../hooks/useTaxPreparerQueue';
import { PreparerFilterBar } from '../components/preparer/PreparerFilterBar';
import { PreparerQueueTable } from '../components/preparer/PreparerQueueTable';

// Title and subtitle for each preparer sidebar page
const VIEW_COPY: Record<PreparerQueueView, { title: string; subtitle: string }> = {
  ALL: { title: 'Preparer Queue', subtitle: '' },
  PREPARATION: { title: 'Return Preparation', subtitle: 'Returns you are working on, including revisions and reverted files' },
  PENDING: { title: 'Pending Returns', subtitle: 'Assigned to you and not started yet' },
  UNDER_REVIEW: { title: 'Under Review', subtitle: 'Sent to QA and waiting for the reviewer' },
  COMPLETED: { title: 'Completed Returns', subtitle: 'QA approved and moved on to sales or filing' },
};

export const TaxPreparerQueueScreen: React.FC<{ view?: PreparerQueueView }> = ({ view = 'ALL' }) => {
  const {
    filteredReturns,
    clientRows,
    handleOpenClient,
    counts,
    preparationCounts,
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
  } = useTaxPreparerQueue(view);

  const copy = VIEW_COPY[view];
  // Only Return Preparation has tabs; the legacy workbench keeps its full tab list
  const pageTabs: { id: PreparerQueueTab; label: string; count: number }[] | undefined =
    view === 'ALL'
      ? undefined
      : view === 'PREPARATION'
      ? [
          { id: 'ALL', label: 'All', count: preparationCounts.all },
          { id: 'DRAFTING', label: 'In progress', count: preparationCounts.inProgress },
          { id: 'REVISIONS', label: 'Revisions needed', count: preparationCounts.revisions },
          { id: 'REVERTED', label: 'Reverted files', count: preparationCounts.reverted },
        ]
      : [];

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{copy.title}</h2>
          <p className="text-sm text-slate-500 mt-1">
            {view === 'ALL'
              ? `${counts.all || 0} returns · ${counts.drafting || 0} drafting · ${counts.revisions || 0} need revisions`
              : `${filteredReturns.length} returns · ${copy.subtitle}`}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
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

      {/* 3. Search & Tab Filter Bar (Unified Box with Real Counts) */}
      <PreparerFilterBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        complexityFilter={complexityFilter}
        onComplexityChange={setComplexityFilter}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        counts={counts}
        tabs={pageTabs}
      />

      {/* 4. Queue Table Card (100% Real API Data) */}
      <PreparerQueueTable
        returns={clientRows}
        isLoading={isLoading}
        onOpenWorkspace={handleOpenClient}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
    </div>
  );
};
