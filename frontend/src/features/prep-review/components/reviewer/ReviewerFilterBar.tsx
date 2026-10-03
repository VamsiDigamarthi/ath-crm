import React from 'react';
import { ShieldCheck, RotateCcw, CheckCircle2 } from 'lucide-react';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
import { AppTabs } from '@/shared/components/AppTabs';
import type { ReviewerQueueTab } from '../../hooks/useTaxReviewerQueue';

interface ReviewerFilterBarProps {
  activeTab: ReviewerQueueTab;
  onTabChange: (tab: ReviewerQueueTab) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  counts: {
    all: number;
    pending: number;
    revisions: number;
    signedOff: number;
  };
}

export const ReviewerFilterBar: React.FC<ReviewerFilterBarProps> = ({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  counts,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
      {/* Left: Dynamic AppTabs */}
      <AppTabs
        tabs={[
          { id: 'ALL', label: 'All In Review', count: counts.all || 0 },
          { id: 'PENDING', label: 'Pending Audit', count: counts.pending || 0, icon: ShieldCheck },
          { id: 'REVISIONS', label: 'Revisions Sent', count: counts.revisions || 0, icon: RotateCcw },
          { id: 'APPROVED', label: 'Signed Off', count: counts.signedOff || 0, icon: CheckCircle2 },
        ]}
        activeTab={activeTab}
        onChange={(tab) => onTabChange(tab as ReviewerQueueTab)}
        size="sm"
      />

      {/* Right: Search Filter Input */}
      <div className="w-full sm:w-80">
        <AppSearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search taxpayer, preparer..."
          debounceMs={300}
        />
      </div>
    </div>
  );
};
