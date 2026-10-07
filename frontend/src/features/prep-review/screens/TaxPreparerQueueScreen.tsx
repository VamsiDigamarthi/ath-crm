import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Calculator, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppSelect } from '@/shared/components/AppSelect';
import { PriorityFilterSelect } from '@/shared/components/PriorityFilterSelect';
import { useTaxPreparerQueue, type PreparerQueueTab } from '../hooks/useTaxPreparerQueue';
import { PreparerQueueTable } from '../components/preparer/PreparerQueueTable';

export interface TaxPreparerQueueScreenProps {
  initialTab?: PreparerQueueTab;
}

export const TaxPreparerQueueScreen: React.FC<TaxPreparerQueueScreenProps> = ({ initialTab }) => {
  const location = useLocation();

  const routeTab = useMemo<PreparerQueueTab>(() => {
    if (initialTab) return initialTab;
    const path = location.pathname;
    if (path.includes('/prep-review/preparer/pending')) return 'PENDING';
    if (path.includes('/prep-review/preparer/under-review')) return 'UNDER_REVIEW';
    if (path.includes('/prep-review/preparer/completed')) return 'COMPLETED';
    return 'WORKING';
  }, [initialTab, location.pathname]);

  const {
    filteredReturns,
    clientRows,
    handleOpenClient,
    counts,
    isLoading,
    activeTab,
    searchQuery,
    setSearchQuery,
    complexityFilter,
    setComplexityFilter,
    priorityFilter,
    setPriorityFilter,
    refreshData,
    handleOpenNextReturn,
  } = useTaxPreparerQueue(routeTab);

  const getHeaderInfo = () => {
    switch (activeTab) {
      case 'PENDING':
        return {
          title: 'Pending Returns',
          subtitle: `${counts.pending || 0} returns assigned to you awaiting draft initiation`,
        };
      case 'UNDER_REVIEW':
      case 'QA_SUBMITTED':
        return {
          title: 'Under Review',
          subtitle: `${counts.underReview || 0} returns currently submitted for QA compliance audit`,
        };
      case 'COMPLETED':
      case 'QA_APPROVED':
        return {
          title: 'Completed Returns',
          subtitle: `${counts.completed || 0} returns with passed and approved QA compliance audits`,
        };
      case 'WORKING':
      case 'DRAFTING':
        return {
          title: 'Return Preparation',
          subtitle: `${counts.working || 0} working returns (${counts.drafting || 0} drafting · ${counts.revisions || 0} revisions)`,
        };
      default:
        return {
          title: 'Preparer Queue',
          subtitle: `${counts.all || 0} total returns · ${counts.working || 0} in preparation · ${counts.pending || 0} pending`,
        };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header with Title and Unified Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{headerInfo.title}</h2>
          <p className="text-sm text-slate-500 mt-1">
            {headerInfo.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <PriorityFilterSelect value={priorityFilter} onChange={setPriorityFilter} />
          <div className="w-44">
            <AppSelect
              value={complexityFilter}
              onChange={setComplexityFilter}
              options={[
                { value: 'ALL', label: 'All complexity' },
                { value: 'STANDARD', label: 'Standard W-2' },
                { value: 'INVESTMENTS_1099B', label: '1099-B stocks' },
                { value: 'FOREIGN_FBAR', label: 'Foreign FBAR & FATCA' },
                { value: 'SCHEDULE_C', label: 'Schedule C' },
              ]}
            />
          </div>
          <Button variant="outline" size="md" onClick={refreshData} disabled={isLoading} title="Refresh" className="px-3 cursor-pointer">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            size="md"
            onClick={handleOpenNextReturn}
            disabled={filteredReturns.length === 0}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold flex items-center gap-2 cursor-pointer"
          >
            <Calculator className="w-4 h-4" />
            Open next return
          </Button>
        </div>
      </div>

      {/* Queue Table Card (100% Real API Data) */}
      <PreparerQueueTable
        returns={clientRows}
        isLoading={isLoading}
        onOpenWorkspace={handleOpenClient}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
    </div>
  );
};
