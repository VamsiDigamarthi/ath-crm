import React, { useState, useMemo } from 'react';
import { useDocumenterWorkspace } from '../hooks/useDocumenterWorkspace';
import { CallOutreachModal } from '../components/CallOutreachModal';
import { getDocumenterColumns } from '../columns/documenter-columns';
import { AppTable } from '@/shared/components/AppTable';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
import { AppFilterFlyout, type FilterCategory } from '@/shared/components/AppFilterFlyout';
import { AppColumnConfigDropdown, type ColumnConfigItem } from '@/shared/components/AppColumnConfigDropdown';
import { Button } from '@/shared/components/Button';
import { 
  PhoneCall, 
  PhoneOutgoing,
  RefreshCw, 
  CheckCircle2,
  Clock,
  UserX,
  RotateCcw,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import type { DocumenterLeadItem } from '../types/documenter.types';
import toast from 'react-hot-toast';

const AVAILABLE_COLUMNS: ColumnConfigItem[] = [
  { id: 'taxpayer', label: 'Taxpayer Client', defaultVisible: true, locked: true },
  { id: 'contact', label: 'Contact Information', defaultVisible: true },
  { id: 'priority', label: 'Priority', defaultVisible: true },
  { id: 'stage', label: 'Outreach Stage', defaultVisible: true },
  { id: 'call_status', label: 'Last Call Status', defaultVisible: true },
  { id: 'actions', label: 'Actions', defaultVisible: true, locked: true },
];

export const DocumenterAgentQueueScreen: React.FC = () => {
  // 1. Collapsible Top Summary Cards State
  const [isStatsCollapsed, setIsStatsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ath_calling_queue_stats_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleStats = () => {
    setIsStatsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('ath_calling_queue_stats_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // 2. Visible Columns State (Persisted)
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(() => {
    const lockedIds = AVAILABLE_COLUMNS.filter((c) => c.locked).map((c) => c.id);
    try {
      const saved = localStorage.getItem('ath_calling_queue_visible_columns');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Always ensure locked columns are included
          return Array.from(new Set([...lockedIds, ...parsed]));
        }
      }
    } catch {}
    return AVAILABLE_COLUMNS.map((c) => c.id);
  });

  const {
    activeTab,
    handleTabChange,
    searchQuery,
    setSearchQuery,
    visaFilter,
    setVisaFilter,
    priorityFilter,
    handlePriorityChange,
    leads,
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
    handleReturnToAdminPool,
    isCallModalOpen,
    activeLeadForCall,
    handleOpenCallModal,
    handleOpenAssignModal,
    handleCloseModals,
    handleSaveCallDisposition,
    refreshData,
  } = useDocumenterWorkspace();

  // 3. Filter Categories for 2-Column Flyout
  const filterCategories = useMemo<FilterCategory[]>(() => [
    {
      id: 'tab',
      label: 'Lead Stage / Tab',
      options: [
        { label: 'All Leads', value: 'ALL' },
        { label: 'New / Uncontacted Leads', value: 'NOT_CALLED' },
        { label: 'Outreach Active', value: 'OUTREACH' },
        { label: 'Scheduled Callbacks', value: 'CALLBACKS' },
        { label: 'Not Interested / Dropped', value: 'NOT_INTERESTED' },
      ],
    },
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
    tab: [activeTab],
    priority: [priorityFilter],
    visa: [visaFilter],
  }), [activeTab, priorityFilter, visaFilter]);

  const handleApplyFilters = (newFilters: Record<string, string[]>) => {
    // 1. Sync Tab / Stage
    const selectedTab = newFilters.tab?.[0] || 'ALL';
    if (selectedTab && selectedTab !== activeTab) {
      handleTabChange(selectedTab as any);
    }
    
    // 2. Sync Priority
    const selectedPriority = newFilters.priority?.[0] || 'ALL';
    if (selectedPriority && selectedPriority !== priorityFilter) {
      handlePriorityChange(selectedPriority);
    }
    
    // 3. Sync Visa
    const selectedVisa = newFilters.visa?.[0] || 'ALL';
    if (selectedVisa && selectedVisa !== visaFilter) {
      setVisaFilter(selectedVisa);
    }
  };

  // 5. Generate and Filter Columns Dynamically
  const allColumns = useMemo(
    () =>
      getDocumenterColumns({
        onOpenCallModal: handleOpenCallModal,
        onOpenAssignModal: handleOpenAssignModal,
        hideAssignedStaff: true,
      }),
    [handleOpenCallModal, handleOpenAssignModal]
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

  const handleStartNextCall = () => {
    // 1. Priority 1: Next uncalled lead in active outreach (no calls yet)
    const nextUncalledLead = leads.find(
      (l) => l.currentStage === 'DOC_OUTREACH' && !l.lastCallLog
    );
    if (nextUncalledLead) {
      handleOpenCallModal(nextUncalledLead);
      return;
    }

    // 2. Priority 2: Next lead in outreach needing follow-up
    const nextOutreachLead = leads.find((l) => l.currentStage === 'DOC_OUTREACH');
    if (nextOutreachLead) {
      handleOpenCallModal(nextOutreachLead);
      return;
    }

    // 3. Fallback: First available lead or completion message
    if (leads.length > 0) {
      handleOpenCallModal(leads[0]);
    } else {
      toast.success('All assigned leads have been dialed! Great job!');
    }
  };

  return (
    <div className="space-y-4 pb-12 font-sans animate-in fade-in duration-150">
      {/* 1. Header & Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            My Active Calling & Outreach Queue
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Execute outbound calls, qualify taxpayer filing requirements, schedule callbacks, and initiate W-2 tax preparation.
          </p>
        </div>
      </div>

      {/* 2. Top Metric Summary Cards (Collapsible with Single Button) */}
      {!isStatsCollapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Card 1: Assigned Leads */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                My Assigned Leads
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
                Active in your personal queue
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
                <span>{stats.contactRatePct ?? 0}% Contact Rate ({stats.todayConnected ?? 0} connected today)</span>
              </div>
            </div>
          </div>

          {/* Card 3: Callbacks Due */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Pending Callbacks
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {stats.callbacks ?? 0}
              </div>
              <div className="text-xs text-purple-600 font-medium mt-1">
                {stats.nextCallbackAt 
                  ? `Next: ${new Date(stats.nextCallbackAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : 'No pending appointments'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Sleek Enterprise Toolbar (Clean Flat Layout, No Heavy White Box) */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pt-1">
        {/* Left: Search Input + Quick Tab Pills */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5 flex-1 min-w-0">
          <div className="w-full md:w-64 lg:w-72 shrink-0">
            <AppSearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by name, email, phone, SSN..."
              debounceMs={300}
            />
          </div>

          {/* Dynamic Quick Tab Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl overflow-x-auto min-w-0 border border-slate-200/60 shadow-2xs">
            <button
              type="button"
              onClick={() => handleTabChange('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'ALL' || activeTab === 'MY_LEADS'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Leads ({stats.myLeads || totalItems})
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('NOT_CALLED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'NOT_CALLED'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PhoneOutgoing className="w-3.5 h-3.5 text-blue-600" />
              <span>New Leads ({stats.uncontacted ?? 0})</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('OUTREACH')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'OUTREACH'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>In Outreach ({stats.activeOutreach})</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('CALLBACKS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'CALLBACKS'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Scheduled Callbacks ({stats.callbacks})</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('NOT_INTERESTED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'NOT_INTERESTED' || activeTab === 'DROPPED'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserX className="w-3.5 h-3.5 text-rose-500" />
              <span>Not Interested ({stats.notInterested ?? stats.dropped ?? 0})</span>
            </button>
          </div>
        </div>

        {/* Right: Filters Flyout + Columns Config + Collapse Toggle + Refresh + Start Call */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          {/* Advanced 2-Column Filters Popover (Screenshot 2 Match) */}
          <AppFilterFlyout
            categories={filterCategories}
            selectedFilters={activeFilters}
            onApply={handleApplyFilters}
            onReset={() => {
              handleTabChange('ALL');
              handlePriorityChange('ALL');
              setVisaFilter('ALL');
            }}
          />

          {/* Dynamic Column Visibility Configuration (Screenshot 3 Match) */}
          <AppColumnConfigDropdown
            columns={AVAILABLE_COLUMNS}
            visibleColumnIds={visibleColumnIds}
            onChange={setVisibleColumnIds}
            storageKey="ath_calling_queue_visible_columns"
          />

          {/* Expand/Collapse KPI Cards Button */}
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

          {/* Refresh Queue */}
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

          {/* Start Next Call CTA */}
          <Button
            size="sm"
            onClick={handleStartNextCall}
            disabled={leads.length === 0}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Start Next Call</span>
          </Button>
        </div>
      </div>

      {/* 4. Calling Queue AppTable with Dynamic Columns */}
      <AppTable<DocumenterLeadItem>
        data={leads}
        columns={columns}
        selectable={activeTab === 'NOT_INTERESTED'}
        selectedRows={selectedRows}
        rowKey="id"
        onSelectionChange={(selected) => setSelectedRows(selected)}
        isLoading={isLoading}
        emptyText="No assigned leads in your queue right now. Great job!"
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

      {/* Floating Action Bar when Not-Interested rows are checked */}
      {activeTab === 'NOT_INTERESTED' && selectedRows.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-2 pr-3 border-r border-slate-700">
            <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 font-bold text-xs flex items-center justify-center border border-rose-500/30">
              {selectedRows.length}
            </span>
            <span className="text-xs font-semibold text-slate-200">
              {selectedRows.length} Not-Interested Lead{selectedRows.length > 1 ? 's' : ''} Selected
            </span>
          </div>
          <Button
            size="sm"
            onClick={() => handleReturnToAdminPool()}
            disabled={isActionLoading}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer px-4"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isActionLoading ? 'animate-spin' : ''}`} />
            <span>Return to Admin / Unassigned Pool</span>
          </Button>
          <button
            type="button"
            onClick={() => setSelectedRows([])}
            className="text-slate-400 hover:text-white text-xs font-medium cursor-pointer ml-1"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Call Outreach & Disposition Modal */}
      <CallOutreachModal
        isOpen={isCallModalOpen}
        onClose={handleCloseModals}
        lead={activeLeadForCall}
        isManager={false}
        onSaveDisposition={handleSaveCallDisposition}
        isLoading={isActionLoading}
      />
    </div>
  );
};
