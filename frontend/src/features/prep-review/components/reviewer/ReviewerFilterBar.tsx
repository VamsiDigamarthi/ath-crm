import React from 'react';
import { AppTabs } from '@/shared/components/AppTabs';
import type { ReviewerQueueTab } from '../../hooks/useTaxReviewerQueue';

interface ReviewerFilterBarProps {
  activeTab: ReviewerQueueTab;
  onTabChange: (tab: ReviewerQueueTab) => void;
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
  counts,
}) => {
  return (
    <AppTabs
      tabs={[
        { id: 'ALL', label: 'All', count: counts.all || 0 },
        { id: 'PENDING', label: 'Pending audit', count: counts.pending || 0 },
        { id: 'REVISIONS', label: 'Revisions sent', count: counts.revisions || 0 },
        { id: 'APPROVED', label: 'Signed off', count: counts.signedOff || 0 },
      ]}
      activeTab={activeTab}
      onChange={(tab) => onTabChange(tab as ReviewerQueueTab)}
      size="sm"
    />
  );
};
