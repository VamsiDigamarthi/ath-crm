import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrepManagerQueue } from '../hooks/usePrepManagerQueue';
import { PrepManagerQueueTable } from '../components/manager/PrepManagerQueueTable';
import { PrepAssignLeadDrawer } from '../components/manager/PrepAssignLeadDrawer';
import { PrepAutoDistributeModal } from '../components/manager/PrepAutoDistributeModal';
import { PrepLeadDetailModal } from '../components/manager/PrepLeadDetailModal';
import type { PrepReviewLead } from '../types/prep-review.types';
import { Button } from '@/shared/components/Button';
import { RefreshCw, X } from 'lucide-react';

export const PrepManagerQueueScreen: React.FC = () => {
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

  const clientRows = useMemo(() => {
    const seen = new Set<string>();
    return leads.filter((l) => {
      const key = l.taxpayerId || l.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [leads]);

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

      <PrepManagerQueueTable
        leads={clientRows}
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
