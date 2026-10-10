import React, { useMemo, useState } from 'react';
import { useStatsVisibility } from '@/shared/hooks/useStatsVisibility';
import { StatsToggleButton } from '@/shared/components/StatsToggleButton';
import { useNavigate } from 'react-router-dom';
import { usePrepManagerQueue } from '../hooks/usePrepManagerQueue';
import { PrepManagerQueueTable } from '../components/manager/PrepManagerQueueTable';
import { PrepAssignLeadDrawer } from '../components/manager/PrepAssignLeadDrawer';
import { PrepAutoDistributeModal } from '../components/manager/PrepAutoDistributeModal';
import { PrepLeadDetailModal } from '../components/manager/PrepLeadDetailModal';
import type { PrepReviewLead } from '../types/prep-review.types';
import { Button } from '@/shared/components/Button';
import { RefreshCw, X } from 'lucide-react';
import { CompactStatCards } from '@/shared/components/CompactStatCards';
import { AppFilterFlyout, withoutAllValues, type FilterCategory } from '@/shared/components/AppFilterFlyout';
import { SYSTEM_PRIORITIES } from '@/shared/constants/system-enums';

const COMPLEXITY_OPTIONS = [
  { label: 'Standard', value: 'STANDARD' },
  { label: 'Multi-state', value: 'MULTI_STATE' },
  { label: 'Investments (1099-B)', value: 'INVESTMENTS_1099B' },
  { label: 'Foreign / FBAR', value: 'FOREIGN_FBAR' },
  { label: 'Business (Sch C)', value: 'BUSINESS_SCH_C' },
];

export const PrepManagerQueueScreen: React.FC = () => {
  // Stat cards: shown by default, "Hide stats" button next to Filters
  const { showStats, toggleStats } = useStatsVisibility('prep_mgr_queue');
  const {
    leads,
    staff,
    tabStats,
    activeTab,
    setActiveTab,
    isLoading,
    fetchQueueData,
    assignModalLeads,
    setAssignModalLeads,
    isAutoDistributeOpen,
    setIsAutoDistributeOpen,
    staffIdFromUrl,
    clearStaffFilter,
  } = usePrepManagerQueue();

  const navigate = useNavigate();
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState<PrepReviewLead | null>(null);

  const selectedStaffMember = staff.find((s) => s.id === staffIdFromUrl);

  // Filters: Preparer, QA reviewer, Priority, Complexity, Tax year (options built from live data)
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const filterCategories = useMemo<FilterCategory[]>(() => {
    const years = Array.from(new Set(leads.map((l) => l.taxYear).filter(Boolean))).sort((a, b) => b - a);
    const people = (pick: (s: (typeof staff)[number]) => boolean | undefined) => [
      { label: 'Unassigned', value: 'UNASSIGNED' },
      ...staff.filter(pick).map((s) => ({ label: s.name || s.email, value: s.id })),
    ];
    return [
      { id: 'preparer', label: 'Preparer', options: people((s) => s.canPrepare ?? s.role === 'TAX_PREPARER') },
      { id: 'reviewer', label: 'QA reviewer', options: people((s) => s.canReview ?? s.role === 'TAX_REVIEWER') },
      { id: 'priority', label: 'Priority', options: SYSTEM_PRIORITIES.map((p) => ({ label: p.label, value: p.value })) },
      { id: 'complexity', label: 'Complexity', options: COMPLEXITY_OPTIONS },
      { id: 'taxYear', label: 'Tax year', options: years.map((y) => ({ label: `TY ${y}`, value: String(y) })) },
    ];
  }, [leads, staff]);
  const filteredLeads = useMemo(() => {
    const match = (key: string, value: string) => !filters[key]?.length || filters[key].includes(value);
    return leads.filter(
      (l) =>
        match('preparer', l.assignedPreparer?.id || 'UNASSIGNED') &&
        match('reviewer', l.assignedReviewer?.id || 'UNASSIGNED') &&
        match('priority', l.priority || 'NO_PRIORITY') &&
        match('complexity', l.complexity || 'STANDARD') &&
        match('taxYear', String(l.taxYear))
    );
  }, [leads, filters]);

  const clientRows = useMemo(() => {
    const seen = new Set<string>();
    return filteredLeads.filter((l) => {
      const key = l.taxpayerId || l.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [filteredLeads]);

  return (
    <div className="w-full space-y-6 pb-12 font-sans animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Department Queue</h2>
            {selectedStaffMember && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 ml-2">
                <span>Filtered: {selectedStaffMember.name}</span>
                <button
                  type="button"
                  onClick={clearStaffFilter}
                  className="hover:text-rose-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">Returns in preparation and QA review. Open a client to assign or inspect a tax year.</p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchQueueData}
            disabled={isLoading}
            className="px-3 cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Summary cards (compact): live counts per stage */}
      {showStats && (
        <CompactStatCards
          cards={[
            { name: 'Unassigned', value: tabStats.unassigned, hint: 'Waiting for a preparer', tone: 'text-amber-700' },
            { name: 'Under preparation', value: tabStats.underPrep, hint: 'Being drafted', tone: 'text-blue-700' },
            { name: 'In QA review', value: tabStats.qaReview, hint: 'Waiting for audit', tone: 'text-purple-700' },
            { name: 'Revisions', value: tabStats.revisions, hint: 'Sent back to preparer', tone: 'text-rose-600' },
            { name: 'Ready for sales', value: tabStats.qaApproved, hint: 'QA signed off', tone: 'text-emerald-700' },
          ]}
        />
      )}

      <PrepManagerQueueTable
        leads={clientRows}
        filterControl={
          <div className="flex items-center gap-2">
            <StatsToggleButton visible={showStats} onToggle={toggleStats} />
            <AppFilterFlyout categories={filterCategories} selectedFilters={filters} onApply={(f) => setFilters(withoutAllValues(f))} onReset={() => setFilters({})} />
          </div>
        }
        tabStats={tabStats}
        isLoading={isLoading}
        selectedStageFilter={activeTab}
        onStageFilterChange={setActiveTab}
        onOpenAssignModal={(selectedLeads) => setAssignModalLeads(selectedLeads)}
        onOpenAutoDistribute={() => setIsAutoDistributeOpen(true)}
        onViewLeadDetail={(lead) => navigate(`/prep-review/manager/queue/client/${lead.taxpayerId}`)}
      />

      {assignModalLeads && (
        <PrepAssignLeadDrawer
          isOpen={Boolean(assignModalLeads)}
          onClose={() => setAssignModalLeads(null)}
          targetLeads={assignModalLeads}
          staff={staff}
          onAssignSuccess={() => {
            fetchQueueData();
          }}
        />
      )}

      {isAutoDistributeOpen && (
        <PrepAutoDistributeModal
          isOpen={isAutoDistributeOpen}
          onClose={() => setIsAutoDistributeOpen(false)}
          unassignedLeads={leads.filter((l) => !l.assignedPreparer || l.currentStage === 'DOC_PREP_COMPLETE')}
          staff={staff}
          onDistributeSuccess={() => {
            fetchQueueData();
          }}
        />
      )}

      {selectedLeadForDetail && (
        <PrepLeadDetailModal
          isOpen={Boolean(selectedLeadForDetail)}
          lead={selectedLeadForDetail}
          onClose={() => setSelectedLeadForDetail(null)}
          onAssign={(lead) => {
            setSelectedLeadForDetail(null);
            setAssignModalLeads([lead]);
          }}
        />
      )}
    </div>
  );
};
