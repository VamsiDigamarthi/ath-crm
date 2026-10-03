import React, { useMemo } from 'react';
import { useDocumenterWorkspace } from '../hooks/useDocumenterWorkspace';
import { DocumenterMetrics } from '../components/DocumenterMetrics';
import { FloatingActionBar } from '../components/FloatingActionBar';
import { LeadAssignmentModal } from '../components/LeadAssignmentModal';
import { CallOutreachModal } from '../components/CallOutreachModal';
import { StartFilingModal } from '../components/StartFilingModal';
import { getDocumenterColumns } from '../columns/documenter-columns';
import { UnifiedTable } from '@/shared/components/table/UnifiedTable';
import { exportTableToExcel } from '@/shared/utils/export-excel';
import { AppTabs } from '@/shared/components/AppTabs';
import { Button } from '@/shared/components/Button';
import { 
  Users, 
  PhoneCall, 
  FileCheck2, 
  Clock, 
  ListFilter, 
  Zap, 
  RefreshCw, 
  UserCheck, 
  ShieldCheck, 
  UserX, 
  UserPlus 
} from 'lucide-react';
import type { DocumenterTab, DocumenterLeadItem } from '../types/documenter.types';

export const ManagerQueueScreen: React.FC = () => {
  const {
    isAgent,
    activeTab,
    handleTabChange,
    leads,
    agents,
    stats,
    isLoading,
    isActionLoading,
    selectedRows,
    setSelectedRows,
    handleAutoRoundRobin,
    handleDirectAssign,
    isAssignModalOpen,
    isCallModalOpen,
    isStartFilingModalOpen,
    activeLeadForCall,
    activeLeadForAssign,
    activeLeadForStartFiling,
    handleOpenCallModal,
    handleOpenAssignModal,
    handleOpenStartFilingModal,
    handleStartFiling,
    handleCloseModals,
    handleSaveCallDisposition,
    refreshData,
  } = useDocumenterWorkspace();

  const columns = useMemo(
    () =>
      getDocumenterColumns({
        onOpenCallModal: handleOpenCallModal,
        onOpenAssignModal: handleOpenAssignModal,
        onOpenStartFilingModal: handleOpenStartFilingModal,
        isManagerView: true,
        isAdmin: true,
      }),
    [handleOpenCallModal, handleOpenAssignModal, handleOpenStartFilingModal]
  );

  const tabs = [
    { id: 'MY_LEADS' as DocumenterTab, label: 'My Assigned Leads', count: stats.myLeads || 0, icon: UserCheck },
    { id: 'RAW_PROSPECTS' as DocumenterTab, label: 'New Leads', count: stats.rawProspects || 0, icon: UserPlus },
    { id: 'UNASSIGNED' as DocumenterTab, label: 'Unassigned Pool', count: stats.unassigned, icon: Users },
    { id: 'OUTREACH' as DocumenterTab, label: 'In Active Outreach', count: stats.activeOutreach, icon: PhoneCall },
    { id: 'PREP' as DocumenterTab, label: 'In Tax Prep', count: stats.inPrep, icon: FileCheck2 },
    { id: 'CALLBACKS' as DocumenterTab, label: 'Scheduled Callbacks', count: stats.callbacks, icon: Clock },
    { id: 'NOT_INTERESTED' as DocumenterTab, label: 'Not Interested', count: stats.notInterested ?? stats.dropped ?? 0, icon: UserX },
    { id: 'ALL' as DocumenterTab, label: 'All Department Leads', count: stats.totalDepartment, icon: ListFilter },
  ];

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      {/* 1. Header & Live Team Capacity Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
              Department Caseload Queue & Pipeline Supervision
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Manager Full Queue
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 font-normal">
            Distribute bulk lead pools, monitor cross-agent calling pipelines, and rebalance departmental caseloads.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
            className="border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-normal flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {stats.unassigned > 0 && (
            <Button
              size="sm"
              onClick={() => handleAutoRoundRobin()}
              disabled={isActionLoading}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-medium flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
              1-Click Auto Round-Robin ({stats.unassigned})
            </Button>
          )}
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <DocumenterMetrics
        stats={stats}
        onQuickAutoDistribute={handleAutoRoundRobin}
        isDistributing={isActionLoading}
        showMyLeads={true}
      />

      {/* 3. Navigation Tabs */}
      <AppTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(id) => handleTabChange(id as any)}
      />

      {/* 4. Unified Table */}
      <UnifiedTable<DocumenterLeadItem>
        title="DOCUMENTER DEPARTMENT QUEUE"
        subtitle="Oversee full department assignments, outreach statuses, and client tax intake pipeline."
        data={leads}
        columns={columns}
        enableSelection={true}
        selectedRows={selectedRows}
        onSelectionChange={(selected) => setSelectedRows(selected)}
        isLoading={isLoading}
        searchPlaceholder="Search taxpayer, phone, stage, staff..."
        onExportExcel={() => {
          exportTableToExcel(
            leads,
            [
              { header: 'Taxpayer Name', key: 'name', format: (l) => l.customer?.fullName || `${l.customer?.firstName} ${l.customer?.lastName}` },
              { header: 'Email', key: 'email', format: (l) => l.customer?.email || '' },
              { header: 'Phone', key: 'phone', format: (l) => l.customer?.phone || '' },
              { header: 'Priority', key: 'priority' },
              { header: 'Stage', key: 'currentStage' },
              { header: 'Assigned Staff', key: 'staff', format: (l) => l.assignedDocAgent?.email || 'Unassigned' },
            ],
            'documenter_manager_queue'
          );
        }}
        emptyText={
          activeTab === 'RAW_PROSPECTS'
            ? 'No new leads awaiting tax filing intake.'
            : activeTab === 'UNASSIGNED'
            ? 'All leads have been distributed to staff, or no new bulk leads are unassigned.'
            : 'No leads match the selected filter criteria.'
        }
      />

      {/* Floating Action Bar when rows are checked */}
      <FloatingActionBar
        selectedCount={selectedRows.length}
        onAutoRoundRobin={() => handleAutoRoundRobin()}
        onOpenAssignModal={() => handleOpenAssignModal()}
        onClearSelection={() => setSelectedRows([])}
        isLoading={isActionLoading}
      />

      {/* Lead Assignment Modal */}
      <LeadAssignmentModal
        isOpen={isAssignModalOpen}
        onClose={handleCloseModals}
        selectedLeads={activeLeadForAssign ? [activeLeadForAssign] : selectedRows}
        agents={agents}
        onConfirmDirectAssign={handleDirectAssign}
        onConfirmRoundRobin={() => handleAutoRoundRobin()}
        isLoading={isActionLoading}
      />

      {/* Call Outreach & Disposition Modal */}
      <CallOutreachModal
        isOpen={isCallModalOpen}
        onClose={handleCloseModals}
        lead={activeLeadForCall}
        agents={agents}
        isManager={!isAgent}
        onSaveDisposition={handleSaveCallDisposition}
        isLoading={isActionLoading}
      />

      {/* Start Tax Filing Modal */}
      <StartFilingModal
        isOpen={isStartFilingModalOpen}
        onClose={handleCloseModals}
        lead={activeLeadForStartFiling}
        agents={agents}
        onConfirmStartFiling={handleStartFiling}
        isLoading={isActionLoading}
      />
    </div>
  );
};
