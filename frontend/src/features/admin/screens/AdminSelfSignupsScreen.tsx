import React, { useMemo } from 'react';
import { useSelfSignups } from '../hooks/useSelfSignups';
import type { SelfSignupLeadItem } from '../services/self-signups-service';
import { createSelfSignupColumns } from '../columns/self-signup-columns';
import { UnifiedTable } from '@/shared/components/table/UnifiedTable';
import { exportTableToExcel } from '@/shared/utils/export-excel';
import { LeadAssignmentModal } from '@/features/documenter/components/LeadAssignmentModal';
import { Button } from '@/shared/components/Button';

export const AdminSelfSignupsScreen: React.FC = () => {
  const {
    leads,
    agents,
    isLoading,
    isActionLoading,
    selectedRows,
    setSelectedRows,
    searchQuery,
    handleSearchChange,
    page,
    handlePageChange,
    totalPages,
    totalItems,
    limit,
    handleLimitChange,
    isAssignModalOpen,
    handleOpenAssignModal,
    handleCloseAssignModal,
    handleDirectAssign,
    handleAutoRoundRobin,
  } = useSelfSignups();

  const handleSingleAssign = (lead: SelfSignupLeadItem) => {
    handleOpenAssignModal(lead);
  };

  const columns = useMemo(
    () => createSelfSignupColumns(handleSingleAssign),
    []
  );

  const handleExport = () => {
    exportTableToExcel(
      leads,
      [
        { header: 'Taxpayer', key: 'taxpayer', format: (r) => `${r.customer?.firstName || ''} ${r.customer?.lastName || ''}` },
        { header: 'Email', key: 'email', format: (r) => r.customer?.email || '—' },
        { header: 'Mobile', key: 'mobile', format: (r) => r.customer?.phone || '—' },
        { header: 'Visa', key: 'visa', format: (r) => r.customer?.visaType || '—' },
        { header: 'Tax Year', key: 'taxYear', format: (r) => `TY${r.taxYear}` },
        { header: 'Stage', key: 'stage', format: (r) => r.currentStage },
        { header: 'Assigned Agent', key: 'agent', format: (r) => r.assignedDocAgent ? `${r.assignedDocAgent.firstName} ${r.assignedDocAgent.lastName}` : 'Unassigned' },
        { header: 'Registered', key: 'registered', format: (r) => r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—' },
      ],
      'self_signups_directory'
    );
  };

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Direct Sign-ups</h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage and assign self-registered taxpayer accounts from the client portal.
          </p>
        </div>
      </div>

      {/* Selected Rows Action Banner */}
      {selectedRows.length > 0 && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#16A34A]">
              {selectedRows.length} lead(s) selected
            </span>
            <span className="text-zinc-600">• Ready for direct assignment or round-robin</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedRows([])}
              className="text-xs text-zinc-600 bg-white border-zinc-200 cursor-pointer"
            >
              Clear Selection
            </Button>
            <Button
              size="sm"
              onClick={() => handleOpenAssignModal()}
              className="text-xs font-semibold bg-[#16A34A] hover:bg-[#15803D] text-white cursor-pointer shadow-2xs"
            >
              Assign Selected ({selectedRows.length})
            </Button>
          </div>
        </div>
      )}

      <UnifiedTable<SelfSignupLeadItem>
        data={leads}
        columns={columns}
        isLoading={isLoading}
        enableSelection={true}
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        searchPlaceholder="Search by taxpayer name, email, phone, visa..."
        searchValue={searchQuery}
        onSearchChange={handleSearchChange}
        serverPagination={{
          currentPage: page,
          totalPages,
          totalEntries: totalItems,
          pageSize: limit,
          onPageChange: handlePageChange,
          onPageSizeChange: handleLimitChange,
        }}
        onExportExcel={handleExport}
        emptyText="No direct self-signups found matching your search criteria."
      />

      {isAssignModalOpen && (
        <LeadAssignmentModal
          isOpen={isAssignModalOpen}
          onClose={handleCloseAssignModal}
          agents={agents as any}
          selectedLeads={selectedRows as any}
          onConfirmDirectAssign={handleDirectAssign}
          onConfirmRoundRobin={handleAutoRoundRobin}
          isLoading={isActionLoading}
        />
      )}
    </div>
  );
};
