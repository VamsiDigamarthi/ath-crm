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
  complexityFilter,
  onComplexityChange,
  priorityFilter = 'ALL',
  onPriorityChange,
  counts,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
      <AppTabs
        tabs={[
          { id: 'ALL', label: 'All', count: counts.all || 0 },
          { id: 'DRAFTING', label: 'Drafting', count: counts.drafting || 0 },
          { id: 'QA_SUBMITTED', label: 'Sent to QA', count: counts.qaSubmitted || 0 },
          { id: 'QA_APPROVED', label: 'QA approved', count: counts.qaApproved || 0 },
          { id: 'REVISIONS', label: 'Revisions needed', count: counts.revisions || 0 },
          { id: 'REVERTED', label: 'Reverted to docs', count: counts.reverted || 0 },
        ]}
        activeTab={activeTab}
        onChange={(tab) => onTabChange(tab as PreparerQueueTab)}
        size="sm"
        className="flex-1"
      />

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
    </div>
  );
};
