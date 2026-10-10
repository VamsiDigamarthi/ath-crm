import React from 'react';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { useTaxReviewerQueue, type ReviewerQueueView } from '../hooks/useTaxReviewerQueue';
// import { ReviewerStatsCards } from '../components/reviewer/ReviewerStatsCards';
import { ReviewerFilterBar } from '../components/reviewer/ReviewerFilterBar';
import { ReviewerQueueTable } from '../components/reviewer/ReviewerQueueTable';

// Title and subtitle for each reviewer sidebar page
const VIEW_COPY: Record<Exclude<ReviewerQueueView, 'ALL'>, { title: string; subtitle: string }> = {
  ASSIGNED: { title: 'Assigned Returns', subtitle: 'Submitted by the preparer and waiting for your review' },
  PENDING: { title: 'Pending Returns', subtitle: 'Assigned to you but still with the preparer' },
  REVISIONS: { title: 'Revision Required', subtitle: 'Sent back to the preparer for any revision' },
  APPROVED: { title: 'Approved Returns', subtitle: 'Signed off by QA' },
};

export const TaxReviewerQueueScreen: React.FC<{ view?: ReviewerQueueView }> = ({ view = 'ALL' }) => {
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
  } = useTaxReviewerQueue(view);

  const copy = view === 'ALL' ? null : VIEW_COPY[view];

  return (
    <div className="w-full space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{copy ? copy.title : 'QA Audit Queue'}</h2>
          <p className="text-sm text-slate-500 mt-1">
            {copy
              ? `${filteredReturns.length} returns · ${copy.subtitle}`
              : `${counts.all || 0} in review · ${counts.pending || 0} pending audit · ${counts.revisions || 0} revisions sent`}
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
      {/* Old tabs only on the legacy queue; each sidebar page is already one status */}
      {view === 'ALL' && (
        <ReviewerFilterBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={counts}
        />
      )}

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
