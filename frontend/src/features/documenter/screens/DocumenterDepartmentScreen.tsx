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
import {
  Users,
  PhoneCall,
  FileCheck2,
  Clock,
  ListFilter,
  Zap,
  RefreshCw,
  UserX,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import type { DocumenterTab, DocumenterLeadItem } from '../types/documenter.types';

export const DocumenterDepartmentScreen: React.FC = () => {
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
        isAdmin: true,
        isManagerView: true,
      }),
    [handleOpenCallModal, handleOpenAssignModal, handleOpenStartFilingModal]
  );

  const tabs = [
    { id: 'RAW_PROSPECTS' as DocumenterTab, label: 'New Leads', count: stats.rawProspects || 0, icon: UserPlus },
    { id: 'UNASSIGNED' as DocumenterTab, label: 'Unassigned Pool', count: stats.unassigned, icon: Users },
    { id: 'OUTREACH' as DocumenterTab, label: 'In Active Outreach', count: stats.activeOutreach, icon: PhoneCall },
    { id: 'PREP' as DocumenterTab, label: 'In Tax Prep', count: stats.inPrep, icon: FileCheck2 },
    { id: 'CALLBACKS' as DocumenterTab, label: 'Scheduled Callbacks', count: stats.callbacks, icon: Clock },
    { id: 'NOT_INTERESTED' as DocumenterTab, label: 'Not Interested', count: stats.notInterested ?? stats.dropped ?? 0, icon: UserX },
    { id: 'ALL' as DocumenterTab, label: 'All Department Leads', count: stats.totalDepartment, icon: ListFilter },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
            {isAgent ? 'My Documenter Outreach Queue' : 'Documenter Lead Distribution & Routing'}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1 font-normal">
            {isAgent
              ? 'Contact your assigned taxpayer leads, log calling outcomes, and initiate client intake.'
              : 'Supervise departmental lead distribution, assign raw leads to calling agents, and track conversion funnel.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
            className="border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-normal flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            Refresh
          </Button>

          {!isAgent && stats.unassigned > 0 && (
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

      {/* Top Metric Cards */}
      <DocumenterMetrics
        stats={stats}
        onQuickAutoDistribute={() => handleAutoRoundRobin()}
        isDistributing={isActionLoading}
        showMyLeads={isAgent}
      />

      {/* Super Admin Supervision Tabs */}
      <AppTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(id) => handleTabChange(id as any)}
      />

      {/* Unified Table */}
      <UnifiedTable<DocumenterLeadItem>
        title="DOCUMENTER INTAKE & OUTREACH DIRECTORY"
        subtitle="Manage leads in active outreach, callback follow-up, and tax prep qualification."
        data={leads}
        columns={columns}
        enableSelection={!isAgent}
        selectedRows={selectedRows}
        onSelectionChange={(selected) => setSelectedRows(selected)}
        isLoading={isLoading}
        searchPlaceholder="Search taxpayer by name, email, phone, stage..."
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
            'documenter_department_leads'
          );
        }}
        emptyText={
          activeTab === 'UNASSIGNED'
            ? 'All leads have been distributed to staff, or no new bulk leads are unassigned.'
            : activeTab === 'MY_LEADS'
              ? 'No leads are currently assigned to you.'
              : 'No leads match the selected filter criteria.'
        }
      />

      {/* Floating Action Bar */}
      {!isAgent && (
        <FloatingActionBar
          selectedCount={selectedRows.length}
          onAutoRoundRobin={() => handleAutoRoundRobin()}
          onOpenAssignModal={() => handleOpenAssignModal()}
          onClearSelection={() => setSelectedRows([])}
          isLoading={isActionLoading}
        />
      )}

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
