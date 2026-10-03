import React from 'react';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { useTaxReviewerQueue } from '../hooks/useTaxReviewerQueue';
// import { ReviewerStatsCards } from '../components/reviewer/ReviewerStatsCards';
import { ReviewerFilterBar } from '../components/reviewer/ReviewerFilterBar';
import { ReviewerQueueTable } from '../components/reviewer/ReviewerQueueTable';

export const TaxReviewerQueueScreen: React.FC = () => {
  const {
    filteredReturns,
    clientRows,
    // stats,
    counts,
    isLoading,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    refreshData,
    handleStartPriorityAudit,
    handleOpenAudit,
  } = useTaxReviewerQueue();

  return (
    <div className="w-full space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">QA Audit Queue</h2>
          <p className="text-sm text-slate-500 mt-1">
            {counts.all || 0} in review · {counts.pending || 0} pending audit · {counts.revisions || 0} revisions sent
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="md" onClick={refreshData} disabled={isLoading} title="Refresh" className="px-3 cursor-pointer">
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

      {/* Summary KPI cards (hidden for now)
      <ReviewerStatsCards stats={stats} />
      */}

      {/* 3. Search & Tab Filter Bar */}
      <ReviewerFilterBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={counts}
      />

      {/* 4. Queue Table Card (100% Real API Data) */}
      <ReviewerQueueTable
        returns={clientRows}
        isLoading={isLoading}
        onOpenAudit={handleOpenAudit}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
    </div>
  );
};
