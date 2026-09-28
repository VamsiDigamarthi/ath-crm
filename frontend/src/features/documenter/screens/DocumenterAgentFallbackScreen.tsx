import React, { useState, useMemo } from 'react';
import { useDocumenterWorkspace } from '../hooks/useDocumenterWorkspace';
import { CallOutreachModal } from '../components/CallOutreachModal';
import { StartFilingModal } from '../components/StartFilingModal';
import { getDocumenterColumns } from '../columns/documenter-columns';
import { AppTable } from '@/shared/components/AppTable';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
import { AppFilterFlyout, type FilterCategory } from '@/shared/components/AppFilterFlyout';
import { AppColumnConfigDropdown, type ColumnConfigItem } from '@/shared/components/AppColumnConfigDropdown';
import { Button } from '@/shared/components/Button';
import { 
  RotateCcw, 
  PhoneCall, 
  RefreshCw, 
  CheckCircle2, 
  ChevronUp, 
  ChevronDown
} from 'lucide-react';
import type { DocumenterLeadItem } from '../types/documenter.types';

const AVAILABLE_COLUMNS: ColumnConfigItem[] = [
  { id: 'taxpayer', label: 'Taxpayer Client', defaultVisible: true, locked: true },
  { id: 'contact', label: 'Contact Information', defaultVisible: true },
  { id: 'priority', label: 'Priority', defaultVisible: true },
  { id: 'stage', label: 'Outreach Stage', defaultVisible: true },
  { id: 'call_status', label: 'Last Call Status', defaultVisible: true },
  { id: 'actions', label: 'Actions', defaultVisible: true, locked: true },
];

export const DocumenterAgentFallbackScreen: React.FC = () => {
  // 1. Collapsible Top Summary Cards State
  const [isStatsCollapsed, setIsStatsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ath_fallback_queue_stats_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleStats = () => {
    setIsStatsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('ath_fallback_queue_stats_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // 2. Visible Columns State (Persisted)
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(() => {
    const lockedIds = AVAILABLE_COLUMNS.filter((c) => c.locked).map((c) => c.id);
    try {
      const saved = localStorage.getItem('ath_fallback_queue_visible_columns');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return Array.from(new Set([...lockedIds, ...parsed]));
        }
      }
    } catch {}
    return AVAILABLE_COLUMNS.map((c) => c.id);
  });

  const {
    searchQuery,
    setSearchQuery,
    visaFilter,
    handleVisaChange,
    priorityFilter,
    handlePriorityChange,
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
    isCallModalOpen,
    isStartFilingModalOpen,
    activeLeadForCall,
    activeLeadForStartFiling,
    handleOpenCallModal,
    handleOpenAssignModal,
    handleOpenStartFilingModal,
    handleStartFiling,
    handleCloseModals,
    handleSaveCallDisposition,
    refreshData,
  } = useDocumenterWorkspace('FALLBACK');

  // 3. Filter Categories for 2-Column Flyout
  const filterCategories = useMemo<FilterCategory[]>(() => [
    {
      id: 'priority',
      label: 'Priority',
      options: [
        { label: 'All Priorities', value: 'ALL' },
        { label: 'High Priority (P1)', value: 'HIGH' },
        { label: 'Medium Priority (P2)', value: 'MEDIUM' },
        { label: 'Low Priority (P3)', value: 'LOW' },
      ],
    },
    {
      id: 'visa',
      label: 'Visa Type',
      options: [
        { label: 'All Visas', value: 'ALL' },
        { label: 'H-1B Specialty Occupation', value: 'H-1B' },
        { label: 'L-1 Intracompany Transferee', value: 'L-1' },
        { label: 'F-1 OPT Student', value: 'F-1 OPT' },
        { label: 'H-4 Dependent', value: 'H-4' },
        { label: 'Green Card (Permanent Resident)', value: 'GREEN_CARD' },
        { label: 'US Citizen', value: 'US_CITIZEN' },
      ],
    },
  ], []);

  // 4. Selected Filters Mapping
  const activeFilters = useMemo<Record<string, string[]>>(() => ({
    priority: priorityFilter === 'ALL' ? ['ALL'] : priorityFilter.split(','),
    visa: visaFilter === 'ALL' ? ['ALL'] : visaFilter.split(','),
  }), [priorityFilter, visaFilter]);

  const handleApplyFilters = (newFilters: Record<string, string[]>) => {
    const validPriorities = (newFilters.priority || []).filter((v) => v !== 'ALL' && v !== '');
    const priorityVal = validPriorities.length === 0 ? 'ALL' : validPriorities.join(',');
    if (priorityVal !== priorityFilter) {
      handlePriorityChange(priorityVal);
    }
    
    const validVisas = (newFilters.visa || []).filter((v) => v !== 'ALL' && v !== '');
    const visaVal = validVisas.length === 0 ? 'ALL' : validVisas.join(',');
    if (visaVal !== visaFilter) {
      handleVisaChange(visaVal);
    }
  };

  // 5. Generate and Filter Columns Dynamically
  const allColumns = useMemo(
    () =>
      getDocumenterColumns({
        onOpenCallModal: handleOpenCallModal,
        onOpenAssignModal: handleOpenAssignModal,
        onOpenStartFilingModal: handleOpenStartFilingModal,
        hideAssignedStaff: true,
      }),
    [handleOpenCallModal, handleOpenAssignModal, handleOpenStartFilingModal]
  );

  const columns = useMemo(() => {
    return allColumns.filter((col) => {
      if (col.header === 'Taxpayer Client') return visibleColumnIds.includes('taxpayer');
      if (col.header === 'Contact Information') return visibleColumnIds.includes('contact');
      if (col.header === 'Priority') return visibleColumnIds.includes('priority');
      if (col.header === 'Outreach Stage') return visibleColumnIds.includes('stage');
      if (col.header === 'Last Call Status') return visibleColumnIds.includes('call_status');
      if (col.header === 'Actions') return visibleColumnIds.includes('actions');
      return true;
    });
  }, [allColumns, visibleColumnIds]);

  return (
    <div className="space-y-4 pb-12 font-sans animate-in fade-in duration-150">
      {/* 1. Header & Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Fallback Leads &amp; Re-Outreach Queue
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
              <RotateCcw className="w-3 h-3 text-slate-600" />
              <span>Fall Back</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Review and re-engage qualified leads retained for subsequent calling cycles and follow-up outreach.
          </p>
        </div>
      </div>

      {/* 2. Top Metric Summary Cards (Collapsible) */}
      {!isStatsCollapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Card 1: Total Fallback Leads */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Total Fallback Leads
              </span>
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
                <RotateCcw className="w-4 h-4 text-slate-600" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {stats.fallback ?? totalItems}
              </div>
              <div className="text-xs text-slate-600 font-medium mt-1">
                Awaiting next follow-up cycle
              </div>
            </div>
          </div>

          {/* Card 2: Dials Completed Today */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Today's Dials Completed
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center border border-emerald-100">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {stats.todayDials ?? 0}
              </div>
              <div className="text-xs text-[#16A34A] font-medium mt-1 flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-[#16A34A]" />
                <span>{stats.contactRatePct ?? 0}% Contact Rate ({stats.todayConnected ?? 0} connected)</span>
              </div>
            </div>
          </div>

          {/* Card 3: Personal Queue Activity */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                My Total Assigned Leads
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <PhoneCall className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {stats.myLeads || totalItems}
              </div>
              <div className="text-xs text-blue-600 font-medium mt-1">
                Active in your calling caseload
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Sleek Enterprise Toolbar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pt-1">
        {/* Left: Search Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 min-w-0">
          <div className="w-full sm:w-72 lg:w-80 shrink-0">
            <AppSearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search fallback leads by name, email, phone..."
              debounceMs={300}
            />
          </div>
        </div>

        {/* Right: Filters Flyout + Columns Config + Collapse Toggle + Refresh */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          <AppFilterFlyout
            categories={filterCategories}
            selectedFilters={activeFilters}
            onApply={handleApplyFilters}
            onReset={() => {
              handlePriorityChange('ALL');
              handleVisaChange('ALL');
            }}
          />

          <AppColumnConfigDropdown
            columns={AVAILABLE_COLUMNS}
            visibleColumnIds={visibleColumnIds}
            onChange={setVisibleColumnIds}
            storageKey="ath_fallback_queue_visible_columns"
          />

          <Button
            variant="outline"
            size="sm"
            onClick={toggleStats}
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
            title={isStatsCollapsed ? 'Expand summary cards' : 'Collapse summary cards to see more rows'}
          >
            {isStatsCollapsed ? (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                <span>Expand Cards</span>
              </>
            ) : (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                <span>Collapse Cards</span>
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* 4. Fallback Leads AppTable */}
      <AppTable<DocumenterLeadItem>
        data={leads}
        columns={columns}
        selectedRows={selectedRows}
        rowKey="id"
        onSelectionChange={(selected) => setSelectedRows(selected)}
        isLoading={isLoading}
        emptyText="No leads in your Fallback queue. All follow-ups are up to date!"
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

      {/* Call Outreach & Disposition Modal */}
      <CallOutreachModal
        isOpen={isCallModalOpen}
        onClose={handleCloseModals}
        lead={activeLeadForCall}
        isManager={false}
        onSaveDisposition={handleSaveCallDisposition}
        isLoading={isActionLoading}
      />

      {/* Start / Configure Tax Filing Modal */}
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
