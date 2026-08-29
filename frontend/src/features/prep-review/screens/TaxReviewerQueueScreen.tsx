import React from 'react';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { useTaxReviewerQueue } from '../hooks/useTaxReviewerQueue';
import { ReviewerStatsCards } from '../components/reviewer/ReviewerStatsCards';
import { ReviewerFilterBar } from '../components/reviewer/ReviewerFilterBar';
import { ReviewerQueueTable } from '../components/reviewer/ReviewerQueueTable';

export const TaxReviewerQueueScreen: React.FC = () => {
  const {
    filteredReturns,
    stats,
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
    <div className="w-full space-y-6 pb-12 font-sans animate-in fade-in duration-200">
      {/* 1. Header with Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-purple-600" />
              <span>QA &amp; Compliance Audit Deck</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Senior QA Reviewer Audit Queue
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Perform 4-Eyes compliance verification on 1040 drafts, audit deduction limits, and sign off returns for Sales pitch.
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
            onClick={handleStartPriorityAudit}
            disabled={filteredReturns.length === 0}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Start Priority Audit</span>
          </Button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards (100% Dynamic from Database) */}
      <ReviewerStatsCards stats={stats} />

      {/* 3. Search & Tab Filter Bar */}
      <ReviewerFilterBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        counts={counts}
      />

      {/* 4. Queue Table Card (100% Real API Data) */}
      <ReviewerQueueTable
        returns={filteredReturns}
        isLoading={isLoading}
        onOpenAudit={handleOpenAudit}
      />
    </div>
  );
};
