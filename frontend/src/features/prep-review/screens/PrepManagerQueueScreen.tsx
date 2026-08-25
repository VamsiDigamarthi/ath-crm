import React from 'react';
import { usePrepManagerQueue } from '../hooks/usePrepManagerQueue';
import { PrepManagerQueueTable } from '../components/manager/PrepManagerQueueTable';
import { PrepAssignLeadDrawer } from '../components/manager/PrepAssignLeadDrawer';
import { PrepAutoDistributeModal } from '../components/manager/PrepAutoDistributeModal';
import { Button } from '@/shared/components/Button';
import { RefreshCw, Calculator, X } from 'lucide-react';
import toast from 'react-hot-toast';

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

  const selectedStaffMember = staff.find((s) => s.id === staffIdFromUrl);

  return (
    <div className="w-full space-y-6 pb-12 font-sans animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calculator className="w-6 h-6 text-[#16A34A]" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Preparation &amp; QA Caseload Pipeline
            </h2>
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
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Full live queue view of all tax filings across intake readiness, computation, and QA review.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchQueueData}
            disabled={isLoading}
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Live Queue</span>
          </Button>
        </div>
      </div>

      <PrepManagerQueueTable
        leads={leads}
        tabStats={tabStats}
        isLoading={isLoading}
        selectedStageFilter={activeTab}
        onStageFilterChange={setActiveTab}
        onOpenAssignModal={(selectedLeads) => setAssignModalLeads(selectedLeads)}
        onOpenAutoDistribute={() => setIsAutoDistributeOpen(true)}
        onViewLeadDetail={(lead) => {
          toast(`Opening return file for ${lead.taxpayerName}`);
        }}
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
    </div>
  );
};
