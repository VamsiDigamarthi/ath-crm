import React, { useMemo } from 'react';
import { useDocumenterWorkspace } from '../hooks/useDocumenterWorkspace';
import { FloatingActionBar } from '../components/FloatingActionBar';
import { LeadAssignmentModal } from '../components/LeadAssignmentModal';
import { CallOutreachModal } from '../components/CallOutreachModal';
import { StartFilingModal } from '../components/StartFilingModal';
import { getDocumenterColumns } from '../columns/documenter-columns';
import { AppTable } from '@/shared/components/AppTable';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
import { Button } from '@/shared/components/Button';
import { AppTabs } from '@/shared/components/AppTabs';
import { AppSelect } from '@/shared/components/AppSelect';
import { Users, Zap, RefreshCw } from 'lucide-react';
import type { DocumenterTab, DocumenterLeadItem } from '../types/documenter.types';

const VISA_OPTIONS = [
  { value: 'ALL', label: 'All visas' },
  { value: 'H-1B', label: 'H-1B' },
  { value: 'L-1', label: 'L-1' },
  { value: 'F-1 OPT', label: 'F-1 OPT' },
  { value: 'H-4', label: 'H-4' },
  { value: 'GREEN_CARD', label: 'Green Card' },
  { value: 'US_CITIZEN', label: 'US Citizen' },
];

export const ManagerQueueScreen: React.FC = () => {
  const {
    isAgent,
    activeTab,
    handleTabChange,
    searchQuery,
    setSearchQuery,
    visaFilter,
    setVisaFilter,
    leads,
    agents,
    stats,
    isLoading,
    isActionLoading,
    page,
    limit,
    totalPages,
    totalItems,
    handlePageChange,
    handleLimitChange,
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
    { id: 'MY_LEADS', label: 'My leads', count: stats.myLeads || 0 },
    { id: 'RAW_PROSPECTS', label: 'New leads', count: stats.rawProspects || 0 },
    { id: 'UNASSIGNED', label: 'Unassigned', count: stats.unassigned },
    { id: 'OUTREACH', label: 'In outreach', count: stats.activeOutreach },
    { id: 'PREP', label: 'In tax prep', count: stats.inPrep },
    { id: 'CALLBACKS', label: 'Callbacks', count: stats.callbacks },
    { id: 'NOT_INTERESTED', label: 'Not interested', count: stats.notInterested ?? stats.dropped ?? 0 },
    { id: 'ALL', label: 'All', count: stats.totalDepartment || totalItems },
  ];

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Department Queue</h2>
          <p className="text-sm text-slate-500 mt-1">
            {stats.totalDepartment || totalItems} leads · {stats.unassigned} unassigned · {stats.callbacks} callbacks due
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="md" onClick={refreshData} disabled={isLoading} title="Refresh" className="px-3">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          {stats.unassigned > 0 && (
            <Button
              size="md"
              onClick={handleAutoRoundRobin}
              disabled={isActionLoading}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Auto-assign ({stats.unassigned})
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <AppTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(id) => handleTabChange(id as DocumenterTab)}
        size="sm"
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="w-full sm:w-80">
          <AppSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search name, phone, email, SSN..."
            debounceMs={300}
          />
        </div>
        <div className="flex items-center gap-2 sm:ml-auto">
          {selectedRows.length > 0 && (
            <Button
              size="md"
              onClick={() => handleOpenAssignModal()}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Assign selected ({selectedRows.length})
            </Button>
          )}
          <div className="w-40">
            <AppSelect value={visaFilter} onChange={setVisaFilter} options={VISA_OPTIONS} />
          </div>
        </div>
      </div>

      {/* Table */}
      <AppTable<DocumenterLeadItem>
        data={leads}
        columns={columns}
        selectable
        isRowSelectable={(item) => !item.assignedDocAgent}
        selectedRows={selectedRows}
        rowKey="id"
        onSelectionChange={(selected) => setSelectedRows(selected)}
        isLoading={isLoading}
        emptyText={
          activeTab === 'RAW_PROSPECTS'
            ? 'No new leads waiting.'
            : activeTab === 'UNASSIGNED'
            ? 'All leads are assigned.'
            : 'No leads match these filters.'
        }
        pagination={{
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          perPageOptions: [5, 10, 20, 50],
          onPageChange: handlePageChange,
          onPerPageChange: handleLimitChange,
        }}
      />

      {/* Floating Emerald Action Bar when rows are checked */}
      <FloatingActionBar
        selectedCount={selectedRows.length}
        onAutoRoundRobin={handleAutoRoundRobin}
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
        onConfirmRoundRobin={handleAutoRoundRobin}
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

