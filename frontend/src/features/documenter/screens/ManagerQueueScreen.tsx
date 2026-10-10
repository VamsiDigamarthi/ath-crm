import React, { useEffect, useMemo, useState } from 'react';
import { useStatsVisibility } from '@/shared/hooks/useStatsVisibility';
import { StatsToggleButton } from '@/shared/components/StatsToggleButton';
import { useDocumenterWorkspace } from '../hooks/useDocumenterWorkspace';
import { FloatingActionBar } from '../components/FloatingActionBar';
import { LeadAssignmentModal } from '../components/LeadAssignmentModal';
import { CallOutreachModal } from '../components/CallOutreachModal';
import { StartFilingModal } from '../components/StartFilingModal';
import { getDocumenterColumns } from '../columns/documenter-columns';
import { UnifiedTable } from '@/shared/components/table/UnifiedTable';
import { exportTableToExcel } from '@/shared/utils/export-excel';
import { AppTabs } from '@/shared/components/AppTabs';
import { Button } from '@/shared/components/Button';
import { RefreshCw, Zap } from 'lucide-react';
import type { DocumenterTab, DocumenterLeadItem } from '../types/documenter.types';
import { CompactStatCards } from '@/shared/components/CompactStatCards';
import { AppFilterFlyout, withoutAllValues, type FilterCategory } from '@/shared/components/AppFilterFlyout';
import { SYSTEM_PRIORITIES, SYSTEM_VISA_TYPES } from '@/shared/constants/system-enums';

export const ManagerQueueScreen: React.FC = () => {
  // Stat cards: shown by default, "Hide stats" button next to Filters
  const { showStats, toggleStats } = useStatsVisibility('doc_mgr_queue');
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
    const pr = filters.priority || [];
    const vi = filters.visa || [];
    const ag = filters.agent || [];
    return leads.filter(
      (l) =>
        (pr.length === 0 || pr.includes(l.priority || 'NO_PRIORITY')) &&
        (vi.length === 0 || vi.includes(l.customer?.visaType || '')) &&
        (ag.length === 0 || ag.includes(l.assignedDocAgent?.id || l.assignedDocAgentId || 'UNASSIGNED'))
    );
  }, [leads, filters]);

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
    { id: 'MY_LEADS', label: 'My leads', count: stats.myLeads || 0 },
    { id: 'RAW_PROSPECTS', label: 'New leads', count: stats.rawProspects || 0 },
    { id: 'UNASSIGNED', label: 'Unassigned', count: stats.unassigned },
    { id: 'OUTREACH', label: 'In outreach', count: stats.activeOutreach },
    { id: 'PREP', label: 'In tax prep', count: stats.inPrep },
    { id: 'CALLBACKS', label: 'Callbacks', count: stats.callbacks },
    { id: 'NOT_INTERESTED', label: 'Not interested', count: stats.notInterested ?? stats.dropped ?? 0 },
    { id: 'ALL', label: 'All', count: stats.totalDepartment },
  ];

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Department Queue</h2>
          <p className="text-sm text-slate-500 mt-1">
            {stats.totalDepartment || leads.length} leads · {stats.unassigned} unassigned · {stats.callbacks} callbacks due
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="md" onClick={refreshData} disabled={isLoading} title="Refresh" className="px-3 cursor-pointer">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          {stats.unassigned > 0 && (
            <Button
              size="md"
              onClick={() => handleAutoRoundRobin()}
              disabled={isActionLoading}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold flex items-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              Auto-assign ({stats.unassigned})
            </Button>
          )}
        </div>
      </div>

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

      {/* 3. Navigation Tabs */}
      <AppTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(id) => handleTabChange(id as DocumenterTab)}
      />

      {/* 4. Unified Table */}
      <UnifiedTable<DocumenterLeadItem>
        data={filteredLeads}
        columns={columns}
        enableSelection={true}
        selectedRows={selectedRows}
        onSelectionChange={(selected) => setSelectedRows(selected)}
        isLoading={isLoading}
        searchPlaceholder="Search taxpayer, phone, stage, staff..."
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
