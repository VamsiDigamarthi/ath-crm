import React, { useMemo } from 'react';
import { useStatsVisibility } from '@/shared/hooks/useStatsVisibility';
import { StatsToggleButton } from '@/shared/components/StatsToggleButton';
import { CompactStatCards } from '@/shared/components/CompactStatCards';
import { AppFilterFlyout, type FilterCategory } from '@/shared/components/AppFilterFlyout';
import { SYSTEM_PRIORITIES, SYSTEM_VISA_TYPES } from '@/shared/constants/system-enums';

// Server-side filters: one value per category is applied
const SIGNUP_FILTERS: FilterCategory[] = [
  { id: 'visa', label: 'Visa Type', options: SYSTEM_VISA_TYPES.map((v) => ({ label: v.label, value: v.value })) },
  { id: 'priority', label: 'Priority', options: SYSTEM_PRIORITIES.map((p) => ({ label: p.label, value: p.value })) },
];
import { useSelfSignups } from '../hooks/useSelfSignups';
import type { SelfSignupLeadItem } from '../services/self-signups-service';
import { createSelfSignupColumns } from '../columns/self-signup-columns';
import { UnifiedTable } from '@/shared/components/table/UnifiedTable';
import { exportTableToExcel } from '@/shared/utils/export-excel';
import { LeadAssignmentModal } from '@/features/documenter/components/LeadAssignmentModal';
import { Button } from '@/shared/components/Button';
import { AppTabs } from '@/shared/components/AppTabs';

export const AdminSelfSignupsScreen: React.FC = () => {
  // Stat cards: shown by default, "Hide stats" button next to Filters
  const { showStats, toggleStats } = useStatsVisibility('direct_signups');
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
    assignmentTab,
    assignmentCounts,
    handleAssignmentTabChange,
    stats,
    visaFilter,
    priorityFilter,
    handleVisaChange,
    handlePriorityChange,
  } = useSelfSignups();

  // Filter flyout -> server filters (the last picked value in each category is used)
  const selectedFilters = useMemo(
    () => ({
      visa: visaFilter !== 'ALL' ? [visaFilter] : [],
      priority: priorityFilter !== 'ALL' ? [priorityFilter] : [],
    }),
    [visaFilter, priorityFilter]
  );
  const applyFilters = (f: Record<string, string[]>) => {
    const last = (v?: string[]) => (v && v.length > 0 ? v[v.length - 1] : 'ALL');
    handleVisaChange(last(f.visa));
    handlePriorityChange(last(f.priority));
  };

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

      {showStats && (
        <CompactStatCards
          cards={[
            { name: 'Total sign-ups', value: stats.totalSelfSignups || assignmentCounts.new + assignmentCounts.assigned, hint: 'Registered on the portal' },
            { name: 'Waiting to assign', value: assignmentCounts.new, hint: 'No agent yet', tone: 'text-amber-700' },
            { name: 'In progress', value: stats.inProgressCount || 0, hint: 'Outreach, prep or sales', tone: 'text-blue-700' },
            { name: 'Filed', value: stats.completedFilingsCount || 0, hint: 'Returns completed', tone: 'text-emerald-700' },
          ]}
        />
      )}

      <AppTabs
        tabs={[
          { id: 'NEW', label: 'New leads', count: assignmentCounts.new },
          { id: 'ASSIGNED', label: 'Assigned', count: assignmentCounts.assigned },
        ]}
        activeTab={assignmentTab}
        onChange={(id) => handleAssignmentTabChange(id as 'NEW' | 'ASSIGNED')}
        size="sm"
      />

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
        extraHeaderActions={
          <div className="flex items-center gap-2">
            <StatsToggleButton visible={showStats} onToggle={toggleStats} />
            <AppFilterFlyout
            categories={SIGNUP_FILTERS}
            selectedFilters={selectedFilters}
            onApply={applyFilters}
            onReset={() => applyFilters({})}
          />
          </div>
        }
        emptyText={
          assignmentTab === 'NEW'
            ? 'No new sign-ups waiting. Everyone has been assigned.'
            : 'No assigned sign-ups yet.'
        }
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
