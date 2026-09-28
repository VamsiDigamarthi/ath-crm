import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  PhoneCall, 
  PhoneOutgoing, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  UserX, 
  RotateCcw, 
  ChevronUp, 
  ChevronDown,
  Layers,
  Check
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
    handleReturnToAdminPool,
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
  } = useDocumenterWorkspace();

  // Status Filter Dropdown State & Click Outside Listener
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    };
    if (isStatusDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isStatusDropdownOpen]);

  // Statuses for queue dropdown with live counts
  const queueStatuses = useMemo(() => [
    {
      id: 'ALL',
      label: 'All Leads',
      count: stats.myLeads || totalItems || 0,
      icon: Layers,
      color: 'text-slate-700 bg-slate-100',
    },
    {
      id: 'NOT_CALLED',
      label: 'New Leads',
      count: stats.uncontacted ?? 0,
      icon: PhoneOutgoing,
      color: 'text-blue-700 bg-blue-50',
    },
    {
      id: 'OUTREACH',
      label: 'In Outreach',
      count: stats.activeOutreach ?? 0,
      icon: PhoneCall,
      color: 'text-amber-700 bg-amber-50',
    },
    {
      id: 'CALLBACKS',
      label: 'Scheduled Callbacks',
      count: stats.callbacks ?? 0,
      icon: Clock,
      color: 'text-purple-700 bg-purple-50',
    },
    {
      id: 'FALLBACK',
      label: 'Fall Back',
      count: stats.fallback ?? 0,
      icon: RotateCcw,
      color: 'text-slate-700 bg-slate-100',
    },
    {
      id: 'NOT_INTERESTED',
      label: 'Not Interested',
      count: stats.notInterested ?? stats.dropped ?? 0,
      icon: UserX,
      color: 'text-rose-700 bg-rose-50',
    },
  ], [stats, totalItems]);

  const currentStatus = useMemo(() => {
    return (
      queueStatuses.find((s) => s.id === activeTab) ||
      (activeTab === 'MY_LEADS' ? queueStatuses[0] : (activeTab === 'DROPPED' ? queueStatuses[5] : queueStatuses[0]))
    );
  }, [queueStatuses, activeTab]);

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
        { label: 'Fall Back', value: 'FALLBACK' },
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
    priority: priorityFilter === 'ALL' ? ['ALL'] : priorityFilter.split(','),
    visa: visaFilter === 'ALL' ? ['ALL'] : visaFilter.split(','),
  }), [activeTab, priorityFilter, visaFilter]);

  const handleApplyFilters = (newFilters: Record<string, string[]>) => {
    // 1. Sync Tab / Stage
    const selectedTab = newFilters.tab?.[0] || 'ALL';
    if (selectedTab && selectedTab !== activeTab) {
      handleTabChange(selectedTab as any);
    }
    
    // 2. Sync Priority
    const validPriorities = (newFilters.priority || []).filter((v) => v !== 'ALL' && v !== '');
    const priorityVal = validPriorities.length === 0 ? 'ALL' : validPriorities.join(',');
    if (priorityVal !== priorityFilter) {
      handlePriorityChange(priorityVal);
    }
    
    // 3. Sync Visa
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
        {/* Left: Search Input + Status Filter Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 min-w-0">
          <div className="w-full sm:w-64 lg:w-72 shrink-0">
            <AppSearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by name, email, phone, SSN..."
              debounceMs={300}
            />
          </div>

          {/* Status Filter Dropdown with Live Counts */}
          <div className="relative shrink-0" ref={statusDropdownRef}>
            <button
              type="button"
              onClick={() => setIsStatusDropdownOpen((prev) => !prev)}
              className={`h-9 px-3.5 rounded-xl border bg-white text-xs font-bold flex items-center justify-between gap-2.5 cursor-pointer transition-all shadow-2xs min-w-[190px] ${
                isStatusDropdownOpen
                  ? 'border-slate-400 ring-2 ring-slate-400/20 text-slate-900 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 text-slate-800 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <currentStatus.icon className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span className="truncate">{currentStatus.label}</span>
                <span className="px-1.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                  {currentStatus.count}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isStatusDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                  Filter by Status
                </div>
                <div className="space-y-0.5 px-1">
                  {queueStatuses.map((opt) => {
                    const isSelected = currentStatus.id === opt.id;
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          handleTabChange(opt.id as any);
                          setIsStatusDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-slate-100 text-slate-900 font-bold'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center ${opt.color}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span>{opt.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            isSelected
                              ? 'bg-white text-slate-800 border border-slate-300 shadow-2xs'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {opt.count}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-slate-700 stroke-[2.5]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
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
              handleVisaChange('ALL');
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
