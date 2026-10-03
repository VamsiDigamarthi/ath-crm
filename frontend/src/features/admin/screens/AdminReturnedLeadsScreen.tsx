import React, { useMemo } from 'react';
import { useReturnedLeads, type ReturnedLeadItem } from '../hooks/useReturnedLeads';
import { createReturnedLeadColumns } from '../columns/returned-lead-columns';
import { UnifiedTable } from '@/shared/components/table/UnifiedTable';
import { exportTableToExcel } from '@/shared/utils/export-excel';
import { AppDrawer } from '@/shared/components/AppDrawer';
import { LeadAssignmentModal } from '@/features/documenter/components/LeadAssignmentModal';
import { LeadAuditTrailSection } from '@/features/documenter/components/LeadAuditTrailSection';
import { AlertCircle, Zap, UserCheck } from 'lucide-react';
import { Button } from '@/shared/components/Button';

export const AdminReturnedLeadsScreen: React.FC = () => {
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
    isAuditDrawerOpen,
    activeLeadForAudit,
    handleOpenAssignModal,
    handleCloseAssignModal,
    handleOpenAuditDrawer,
    handleCloseAuditDrawer,
    handleDirectAssign,
    handleAutoRoundRobin,
  } = useReturnedLeads();

  const columns = useMemo(
    () => createReturnedLeadColumns(handleOpenAuditDrawer, handleOpenAssignModal),
    [handleOpenAuditDrawer, handleOpenAssignModal]
  );

  const handleExport = () => {
    exportTableToExcel(
      leads,
      [
        { header: 'Taxpayer', key: 'taxpayer', format: (r) => `${r.customer?.firstName || ''} ${r.customer?.lastName || ''}` },
        { header: 'Email', key: 'email', format: (r) => r.customer?.email || '—' },
        { header: 'Department', key: 'dept', format: (r) => r.department === 'SALES' ? 'Sales' : 'Documenter' },
        { header: 'Tax Year', key: 'taxYear', format: (r) => `TY${r.taxYear}` },
        { header: 'Reason', key: 'returnedReason' },
        { header: 'Returned By', key: 'returnedBy' },
        { header: 'Calls', key: 'totalCalls' },
      ],
      'returned_leads_pool'
    );
  };

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      <UnifiedTable<ReturnedLeadItem>
        title="RETURNED & UNASSIGNED LEADS POOL"
        subtitle="Manage returned prospect and quotation leads released by Calling Agents and Sales Closers."
        data={leads}
        columns={columns}
        isLoading={isLoading}
        enableSelection={true}
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        searchPlaceholder="Search by taxpayer name, phone, email, reason..."
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
        onRowClick={handleOpenAuditDrawer}
        emptyText="No returned leads in the pool. All prospects and returns have been assigned."
      />

      {/* Floating Action Bar when rows are checked */}
      {selectedRows.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-zinc-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-zinc-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-2 pr-3 border-r border-zinc-700">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/30">
              {selectedRows.length}
            </span>
            <span className="text-xs font-semibold text-zinc-200">
              {selectedRows.length} Returned Lead{selectedRows.length > 1 ? 's' : ''} Selected
            </span>
          </div>

          <Button
            size="sm"
            onClick={() => handleAutoRoundRobin(selectedRows.map((r) => r.id))}
            disabled={isActionLoading}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer px-3.5"
          >
            <Zap className="w-3.5 h-3.5 fill-current text-amber-200" />
            <span>Auto Round-Robin</span>
          </Button>

          <Button
            size="sm"
            onClick={() => handleOpenAssignModal()}
            disabled={isActionLoading}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer px-4"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Direct Assign Agent / Closer</span>
          </Button>

          <button
            type="button"
            onClick={() => setSelectedRows([])}
            className="text-zinc-400 hover:text-white text-xs font-medium cursor-pointer ml-1"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Lead Assignment Modal */}
      <LeadAssignmentModal
        isOpen={isAssignModalOpen}
        onClose={handleCloseAssignModal}
        selectedLeads={selectedRows as any}
        agents={agents}
        onConfirmDirectAssign={handleDirectAssign}
        onConfirmRoundRobin={() => handleAutoRoundRobin(selectedRows.map((r) => r.id))}
        isLoading={isActionLoading}
      />

      {/* Taxpayer 360 & Audit Trail Drawer */}
      <AppDrawer
        isOpen={isAuditDrawerOpen}
        onClose={handleCloseAuditDrawer}
        className="sm:max-w-[700px] md:max-w-[820px] lg:max-w-[920px]"
        title={
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl font-bold text-sm flex items-center justify-center border ${
                activeLeadForAudit?.department === 'SALES'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {activeLeadForAudit?.customer?.firstName?.[0] || 'T'}
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                <span>{activeLeadForAudit?.customer?.firstName} {activeLeadForAudit?.customer?.lastName}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                    activeLeadForAudit?.department === 'SALES'
                      ? 'bg-blue-100 text-blue-900 border-blue-300'
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}
                >
                  {activeLeadForAudit?.department === 'SALES' ? 'Sales Closer Return' : 'Documenter Return'}
                </span>
              </h3>
              <p className="text-xs text-zinc-500 font-normal">
                TY {activeLeadForAudit?.taxYear} • SSN: ***-**-{activeLeadForAudit?.customer?.ssnTin?.slice(-4) || 'N/A'} • {activeLeadForAudit?.customer?.email}
              </p>
            </div>
          </div>
        }
      >
        {activeLeadForAudit && (
          <div className="space-y-6">
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                activeLeadForAudit.department === 'SALES'
                  ? 'bg-blue-50/80 border-blue-200 text-blue-950'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}
            >
              <AlertCircle
                className={`w-5 h-5 shrink-0 mt-0.5 ${
                  activeLeadForAudit.department === 'SALES' ? 'text-blue-600' : 'text-amber-600'
                }`}
              />
              <div>
                <h4 className="text-xs font-semibold">
                  Released by {activeLeadForAudit.department === 'SALES' ? 'Sales Closer' : 'Calling Agent'}: {activeLeadForAudit.returnedBy}
                </h4>
                <p className="text-xs mt-1 leading-relaxed">
                  <strong>Reason:</strong> {activeLeadForAudit.returnedReason}
                </p>
                <div className="text-[11px] font-normal mt-1 text-zinc-500">
                  Released at: {new Date(activeLeadForAudit.returnedAt).toLocaleString()}
                </div>
              </div>
            </div>

            <LeadAuditTrailSection
              taxpayerName={`${activeLeadForAudit.customer?.firstName} ${activeLeadForAudit.customer?.lastName}`}
              taxpayerEmail={activeLeadForAudit.customer?.email}
              currentStage={activeLeadForAudit.currentStage}
              stageHistories={activeLeadForAudit.stageHistories || []}
              callLogs={activeLeadForAudit.callLogs || []}
              auditLogs={activeLeadForAudit.auditLogs || []}
            />
          </div>
        )}
      </AppDrawer>
    </div>
  );
};
