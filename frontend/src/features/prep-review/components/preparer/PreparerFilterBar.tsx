import React from 'react';
import { AppSelect } from '@/shared/components/AppSelect';
import { AppTabs } from '@/shared/components/AppTabs';
import { PriorityFilterSelect } from '@/shared/components/PriorityFilterSelect';
import type { PreparerQueueTab } from '../../hooks/useTaxPreparerQueue';

interface PreparerFilterBarProps {
  activeTab: PreparerQueueTab;
  onTabChange: (tab: PreparerQueueTab) => void;
  complexityFilter: string;
  onComplexityChange: (comp: string) => void;
  priorityFilter?: string;
  onPriorityChange?: (priority: string) => void;
  counts: {
    all: number;
    working?: number;
    pending?: number;
    underReview?: number;
    completed?: number;
    drafting: number;
    qaSubmitted: number;
    qaApproved?: number;
    revisions: number;
    reverted?: number;
  };
  /** Custom tab list for a sidebar page; an empty array hides the tabs */
  tabs?: { id: PreparerQueueTab; label: string; count: number }[];
  /** Hide the Priority / Complexity dropdowns (the table has a Filters button instead) */
  hideSelects?: boolean;
}

export const PreparerFilterBar: React.FC<PreparerFilterBarProps> = ({
  activeTab,
  onTabChange,
  complexityFilter,
  onComplexityChange,
  priorityFilter = 'ALL',
  onPriorityChange,
  counts,
  tabs,
  hideSelects = false,
}) => {
  const tabItems = tabs ?? [
    { id: 'WORKING' as const, label: 'Return Preparation', count: counts.working ?? counts.drafting ?? 0 },
    { id: 'PENDING' as const, label: 'Pending Returns', count: counts.pending ?? 0 },
    { id: 'UNDER_REVIEW' as const, label: 'Under Review', count: counts.underReview ?? counts.qaSubmitted ?? 0 },
    { id: 'COMPLETED' as const, label: 'Completed Returns', count: counts.completed ?? counts.qaApproved ?? 0 },
    { id: 'REVISIONS' as const, label: 'Revisions', count: counts.revisions || 0 },
    { id: 'ALL' as const, label: 'All', count: counts.all || 0 },
  ];

  return (
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
      {tabItems.length > 0 ? (
        <AppTabs
          tabs={tabItems}
          activeTab={activeTab}
          onChange={(tab) => onTabChange(tab as PreparerQueueTab)}
          size="sm"
          className="flex-1"
        />
      ) : (
        <div className="flex-1" />
      )}

      {!hideSelects && (
      <div className="flex items-center gap-2 flex-wrap lg:pb-1.5">
        {onPriorityChange && <PriorityFilterSelect value={priorityFilter} onChange={onPriorityChange} />}
        <div className="w-48">
          <AppSelect
            value={complexityFilter}
            onChange={onComplexityChange}
            options={[
              { value: 'ALL', label: 'All complexity' },
              { value: 'STANDARD', label: 'Standard W-2' },
              { value: 'INVESTMENTS_1099B', label: '1099-B stocks' },
              { value: 'FOREIGN_FBAR', label: 'Foreign FBAR & FATCA' },
              { value: 'SCHEDULE_C', label: 'Schedule C' },
            ]}
          />
        </div>
      </div>
      )}
    </div>
  );
};
