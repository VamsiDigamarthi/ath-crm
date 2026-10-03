import React from 'react';
import { Calculator, ShieldCheck, CheckCircle2, RotateCcw } from 'lucide-react';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
import { AppTabs } from '@/shared/components/AppTabs';
import { PriorityFilterSelect } from '@/shared/components/PriorityFilterSelect';
import type { PreparerQueueTab } from '../../hooks/useTaxPreparerQueue';

interface PreparerFilterBarProps {
  activeTab: PreparerQueueTab;
  onTabChange: (tab: PreparerQueueTab) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  complexityFilter: string;
  onComplexityChange: (comp: string) => void;
  priorityFilter?: string;
  onPriorityChange?: (priority: string) => void;
  counts: {
    all: number;
    drafting: number;
    qaSubmitted: number;
    qaApproved?: number;
    revisions: number;
    reverted?: number;
  };
}

export const PreparerFilterBar: React.FC<PreparerFilterBarProps> = ({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  complexityFilter,
  onComplexityChange,
  priorityFilter = 'ALL',
  onPriorityChange,
  counts,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
      {/* Left: Search & AppTabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
        <div className="w-full sm:w-72">
          <AppSearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search by taxpayer name, phone, email..."
            debounceMs={300}
          />
        </div>

        {/* Dynamic Tab Filter Ribbon */}
        <AppTabs
          tabs={[
            { id: 'ALL', label: 'All Returns', count: counts.all || 0 },
            { id: 'DRAFTING', label: 'Drafting 1040', count: counts.drafting || 0, icon: Calculator },
            { id: 'QA_SUBMITTED', label: 'Sent to QA', count: counts.qaSubmitted || 0, icon: ShieldCheck },
            { id: 'QA_APPROVED', label: 'QA Approved', count: counts.qaApproved || 0, icon: CheckCircle2 },
            { id: 'REVISIONS', label: 'Revisions Needed', count: counts.revisions || 0, icon: RotateCcw },
            { id: 'REVERTED', label: 'Reverted to Docs', count: counts.reverted || 0, icon: RotateCcw },
          ]}
          activeTab={activeTab}
          onChange={(tab) => onTabChange(tab as PreparerQueueTab)}
          size="sm"
        />
      </div>

      {/* Right: Complexity & Priority Filter Dropdowns */}
      <div className="flex items-center gap-2 flex-wrap">
        {onPriorityChange && (
          <PriorityFilterSelect
            value={priorityFilter}
            onChange={onPriorityChange}
          />
        )}
        <select
          value={complexityFilter}
          onChange={(e) => onComplexityChange(e.target.value)}
          className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#16A34A]"
        >
          <option value="ALL">Complexity: All Mix</option>
          <option value="STANDARD">Standard W-2</option>
          <option value="INVESTMENTS_1099B">1099-B Brokerage/Stocks</option>
          <option value="FOREIGN_FBAR">Foreign FBAR &amp; FATCA</option>
          <option value="SCHEDULE_C">Schedule C (Self-Employed)</option>
        </select>
      </div>
    </div>
  );
};
