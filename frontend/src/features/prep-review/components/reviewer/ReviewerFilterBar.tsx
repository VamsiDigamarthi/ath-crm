import React from 'react';
import { ShieldCheck, RotateCcw, CheckCircle2 } from 'lucide-react';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
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
      {/* Left: Dynamic Tab Filter Pills */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
        <button
          type="button"
          onClick={() => onTabChange('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'ALL'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All In Review ({counts.all || 0})
        </button>

        <button
          type="button"
          onClick={() => onTabChange('PENDING')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'PENDING'
              ? 'bg-white text-purple-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
          <span>Pending Audit ({counts.pending || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('REVISIONS')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'REVISIONS'
              ? 'bg-white text-rose-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
          <span>Revisions Sent ({counts.revisions || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('APPROVED')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'APPROVED'
              ? 'bg-white text-[#16A34A] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
          <span>Signed Off ({counts.signedOff || 0})</span>
        </button>
      </div>

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
