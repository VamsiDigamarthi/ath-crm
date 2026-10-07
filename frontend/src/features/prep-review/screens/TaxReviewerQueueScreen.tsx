import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { useTaxReviewerQueue, type ReviewerQueueTab } from '../hooks/useTaxReviewerQueue';
import { ReviewerQueueTable } from '../components/reviewer/ReviewerQueueTable';

export interface TaxReviewerQueueScreenProps {
  initialTab?: ReviewerQueueTab;
}

export const TaxReviewerQueueScreen: React.FC<TaxReviewerQueueScreenProps> = ({ initialTab }) => {
  const location = useLocation();

  const routeTab = useMemo<ReviewerQueueTab>(() => {
    if (initialTab) return initialTab;
    const path = location.pathname;
    if (path.includes('/prep-review/reviewer/pending')) return 'PENDING';
    if (path.includes('/prep-review/reviewer/revisions')) return 'REVISIONS';
    if (path.includes('/prep-review/reviewer/approved')) return 'APPROVED';
    return 'ALL';
  }, [initialTab, location.pathname]);

  const {
    filteredReturns,
    clientRows,
    counts,
    isLoading,
    activeTab,
    searchQuery,
    setSearchQuery,
    refreshData,
    handleStartPriorityAudit,
    handleOpenAudit,
  } = useTaxReviewerQueue(routeTab);

  const getHeaderInfo = () => {
    switch (activeTab) {
      case 'PENDING':
        return {
          title: 'Pending Returns',
          subtitle: `${counts.pending || 0} returns in processing awaiting QA compliance audit`,
          emptyText: 'No pending returns currently in processing awaiting QA audit.',
        };
      case 'REVISIONS':
        return {
          title: 'Revision Required',
          subtitle: `${counts.revisions || 0} returns sent back to preparers for correction`,
          emptyText: 'No returns currently requiring revisions from preparers.',
        };
      case 'APPROVED':
        return {
          title: 'Approved Returns',
          subtitle: `${counts.signedOff || 0} returns with passed and approved QA compliance audits`,
          emptyText: 'No approved returns found in this period.',
        };
      default:
        return {
          title: 'Assigned Returns',
          subtitle: `${counts.all || 0} total returns assigned (${counts.pending || 0} in processing · ${counts.revisions || 0} revisions · ${counts.signedOff || 0} approved)`,
          emptyText: 'No assigned returns in this queue. Great job!',
        };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="w-full space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{headerInfo.title}</h2>
          <p className="text-sm text-slate-500 mt-1">
            {headerInfo.subtitle}
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

      {/* Queue Table Card (100% Real API Data) */}
      <ReviewerQueueTable
        returns={clientRows}
        isLoading={isLoading}
        onOpenAudit={handleOpenAudit}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        emptyText={headerInfo.emptyText}
      />
    </div>
  );
};
