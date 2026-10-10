import React, { useEffect, useMemo, useState } from 'react';
import { useDocumenterWorkspace } from '../hooks/useDocumenterWorkspace';
// import { DocumenterMetrics } from '../components/DocumenterMetrics';
import { FloatingActionBar } from '../components/FloatingActionBar';
import { LeadAssignmentModal } from '../components/LeadAssignmentModal';
import { CallOutreachModal } from '../components/CallOutreachModal';
import { StartFilingModal } from '../components/StartFilingModal';
import { getDocumenterColumns } from '../columns/documenter-columns';
import { UnifiedTable } from '@/shared/components/table/UnifiedTable';
import { exportTableToExcel } from '@/shared/utils/export-excel';
import { AppTabs } from '@/shared/components/AppTabs';
import { Zap, RefreshCw } from 'lucide-react';
import { CompactStatCards } from '@/shared/components/CompactStatCards';
import { AppFilterFlyout, withoutAllValues, type FilterCategory } from '@/shared/components/AppFilterFlyout';
import { StatsToggleButton } from '@/shared/components/StatsToggleButton';
import { useStatsVisibility } from '@/shared/hooks/useStatsVisibility';
import { SYSTEM_PRIORITIES, SYSTEM_VISA_TYPES } from '@/shared/constants/system-enums';
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
    handleLimitChange,
  } = useDocumenterWorkspace();

  // Load the whole tab (not just the first 10 rows) so the table, cards and filters are complete
  useEffect(() => {
    handleLimitChange(500);
  }, [handleLimitChange]);

  // Stat cards (shown by default, "Hide stats" next to Filters)
  const { showStats, toggleStats } = useStatsVisibility('admin_documenter_dept');

  // Filters: Priority, Visa type, Assigned agent
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const filterCategories = useMemo<FilterCategory[]>(
    () => [
      { id: 'priority', label: 'Priority', options: SYSTEM_PRIORITIES.map((p) => ({ label: p.label, value: p.value })) },
      { id: 'visa', label: 'Visa Type', options: SYSTEM_VISA_TYPES.map((v) => ({ label: v.label, value: v.value })) },
      {
        id: 'agent',
        label: 'Assigned to',
        options: [
          { label: 'Unassigned', value: 'UNASSIGNED' },
          ...agents.filter((a) => a.role === 'DOC_AGENT').map((a) => ({ label: a.name || a.email, value: a.id })),
        ],
      },
    ],
    [agents]
  );
  const filteredLeads = useMemo(() => {
    const match = (key: string, value: string) => !filters[key]?.length || filters[key].includes(value);
    return leads.filter(
      (l) =>
        match('priority', l.priority || 'NO_PRIORITY') &&
        match('visa', l.customer?.visaType || '') &&
        match('agent', l.assignedDocAgent?.id || l.assignedDocAgentId || 'UNASSIGNED')
    );
  }, [leads, filters]);

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
    { id: 'RAW_PROSPECTS' as DocumenterTab, label: 'New leads', count: stats.rawProspects || 0 },
    { id: 'UNASSIGNED' as DocumenterTab, label: 'Unassigned', count: stats.unassigned },
    { id: 'OUTREACH' as DocumenterTab, label: 'In outreach', count: stats.activeOutreach },
    { id: 'PREP' as DocumenterTab, label: 'In tax prep', count: stats.inPrep },
    { id: 'CALLBACKS' as DocumenterTab, label: 'Callbacks', count: stats.callbacks },
    { id: 'NOT_INTERESTED' as DocumenterTab, label: 'Not interested', count: stats.notInterested ?? stats.dropped ?? 0 },
    { id: 'ALL' as DocumenterTab, label: 'All', count: stats.totalDepartment },
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

      {/* Stat cards hidden on table pages (client: keep tables compact) */}
      {/*
      <DocumenterMetrics
        stats={stats}
        onQuickAutoDistribute={() => handleAutoRoundRobin()}
        isDistributing={isActionLoading}
        showMyLeads={isAgent}
      />
      */}

      {/* Summary cards (compact) */}
      {showStats && (
        <CompactStatCards
          cards={[
            { name: 'Total leads', value: stats.totalDepartment || 0, hint: 'Whole department' },
            { name: 'Unassigned', value: stats.unassigned || 0, hint: 'Waiting for an agent', tone: 'text-amber-700' },
            { name: 'In outreach', value: stats.activeOutreach || 0, hint: 'Being called', tone: 'text-blue-700' },
            { name: 'In tax prep', value: stats.inPrep || 0, hint: 'Handed to preparers', tone: 'text-emerald-700' },
          ]}
        />
      )}

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
        data={filteredLeads}
        columns={columns}
        enableSelection={!isAgent}
        selectedRows={selectedRows}
        onSelectionChange={(selected) => setSelectedRows(selected)}
        isLoading={isLoading}
        searchPlaceholder="Search taxpayer by name, email, phone, stage..."
        extraHeaderActions={
          <div className="flex items-center gap-2">
            <StatsToggleButton visible={showStats} onToggle={toggleStats} />
            <AppFilterFlyout categories={filterCategories} selectedFilters={filters} onApply={(f) => setFilters(withoutAllValues(f))} onReset={() => setFilters({})} />
          </div>
        }
        onExportExcel={() => {
          exportTableToExcel(
            filteredLeads,
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
