import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { useTaxPreparerQueue } from '../hooks/useTaxPreparerQueue';
import { PreparerStatsCards } from '../components/preparer/PreparerStatsCards';
import { PreparerFilterBar } from '../components/preparer/PreparerFilterBar';
import { PreparerQueueTable } from '../components/preparer/PreparerQueueTable';

export const TaxPreparerQueueScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    filteredReturns,
    stats,
    counts,
    isLoading,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    complexityFilter,
    setComplexityFilter,
    refreshData,
    handleOpenNextReturn,
  } = useTaxPreparerQueue();

  const handleOpenWorkspace = (applicationId: string) => {
    navigate(`/prep-review/preparer/workspace/${applicationId}`);
  };

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      {/* 1. Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            My Active 1040 Drafting &amp; Tax Prep Queue
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Compute Form 1040 deductions, calculate federal &amp; state refund liability, and submit verified drafts for 4-Eyes QA review.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Queue</span>
          </Button>

          <Button
            size="sm"
            onClick={handleOpenNextReturn}
            disabled={filteredReturns.length === 0}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Open Next Priority Return</span>
          </Button>
        </div>
      </div>

      {/* 2. Top 3 Metric Cards (100% Dynamic from Database) */}
      <PreparerStatsCards stats={stats} />

      {/* 3. Search & Tab Filter Bar (Unified Box with Real Counts) */}
      <PreparerFilterBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        complexityFilter={complexityFilter}
        onComplexityChange={setComplexityFilter}
        counts={counts}
      />

      {/* 4. Queue Table Card (100% Real API Data) */}
      <PreparerQueueTable
        returns={filteredReturns}
        isLoading={isLoading}
        onOpenWorkspace={handleOpenWorkspace}
      />
    </div>
  );
};
