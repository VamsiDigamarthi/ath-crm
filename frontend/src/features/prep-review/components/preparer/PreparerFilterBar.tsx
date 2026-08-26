import React from 'react';
import { Calculator, ShieldCheck, RotateCcw } from 'lucide-react';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
import type { PreparerQueueTab } from '../../hooks/useTaxPreparerQueue';

interface PreparerFilterBarProps {
  activeTab: PreparerQueueTab;
  onTabChange: (tab: PreparerQueueTab) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  complexityFilter: string;
  onComplexityChange: (comp: string) => void;
  counts: {
    all: number;
    drafting: number;
    qaSubmitted: number;
    revisions: number;
  };
}

export const PreparerFilterBar: React.FC<PreparerFilterBarProps> = ({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  complexityFilter,
  onComplexityChange,
  counts,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
      {/* Left: Search & Tab Filter Pills */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
        <div className="w-full sm:w-72">
          <AppSearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search by taxpayer name, phone, email..."
            debounceMs={300}
          />
        </div>

        {/* Dynamic Tab Filter Pills */}
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
            All Returns ({counts.all || 0})
          </button>

          <button
            type="button"
            onClick={() => onTabChange('DRAFTING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'DRAFTING'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-blue-600" />
            <span>Drafting 1040 ({counts.drafting || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('QA_SUBMITTED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'QA_SUBMITTED'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>Sent to QA ({counts.qaSubmitted || 0})</span>
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
            <span>Revisions Needed ({counts.revisions || 0})</span>
          </button>
        </div>
      </div>

      {/* Right: Complexity Filter Dropdown */}
      <div className="flex items-center gap-2">
        <select
          value={complexityFilter}
          onChange={(e) => onComplexityChange(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:border-slate-300 focus:outline-none cursor-pointer"
        >
          <option value="ALL">Complexity: All Mix</option>
          <option value="STANDARD">Standard W-2</option>
          <option value="INVESTMENTS_1099B">1099-B Stock Gains</option>
          <option value="FOREIGN_FBAR">Foreign FBAR / NRE</option>
          <option value="SCHEDULE_C">Schedule C Business</option>
        </select>
      </div>
    </div>
  );
};
