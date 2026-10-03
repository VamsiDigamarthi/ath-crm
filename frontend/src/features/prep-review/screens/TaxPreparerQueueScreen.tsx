import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { useTaxPreparerQueue } from '../hooks/useTaxPreparerQueue';
import { PreparerFilterBar } from '../components/preparer/PreparerFilterBar';
import { PreparerQueueTable } from '../components/preparer/PreparerQueueTable';

export const TaxPreparerQueueScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    filteredReturns,
    counts,
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
  } = useTaxPreparerQueue();

  const handleOpenWorkspace = (applicationId: string) => {
    navigate(`/prep-review/preparer/workspace/${applicationId}`);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Preparer Queue</h2>
          <p className="text-sm text-slate-500 mt-1">
            {counts.all || 0} returns · {counts.drafting || 0} drafting · {counts.revisions || 0} need revisions
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
      />

      {/* 4. Queue Table Card (100% Real API Data) */}
      <PreparerQueueTable
        returns={filteredReturns}
        isLoading={isLoading}
        onOpenWorkspace={handleOpenWorkspace}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
    </div>
  );
};
