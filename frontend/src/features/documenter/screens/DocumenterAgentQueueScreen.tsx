import React, { useMemo } from 'react';
import { useDocumenterWorkspace } from '../hooks/useDocumenterWorkspace';
import { CallOutreachModal } from '../components/CallOutreachModal';
import { getDocumenterColumns } from '../columns/documenter-columns';
import { AppTable } from '@/shared/components/AppTable';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
import { Button } from '@/shared/components/Button';
import { 
  PhoneCall, 
  RefreshCw, 
  Globe,
  CheckCircle2,
  Clock,
  FileCheck2
} from 'lucide-react';
import type { DocumenterLeadItem } from '../types/documenter.types';
import toast from 'react-hot-toast';

export const DocumenterAgentQueueScreen: React.FC = () => {
  const {
    activeTab,
    handleTabChange,
    searchQuery,
    setSearchQuery,
    visaFilter,
    setVisaFilter,
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
    isCallModalOpen,
    activeLeadForCall,
    handleOpenCallModal,
    handleOpenAssignModal,
    handleCloseModals,
    handleSaveCallDisposition,
    refreshData,
  } = useDocumenterWorkspace();

  const columns = useMemo(
    () =>
      getDocumenterColumns({
        onOpenCallModal: handleOpenCallModal,
        onOpenAssignModal: handleOpenAssignModal,
        hideAssignedStaff: true,
      }),
    [handleOpenCallModal, handleOpenAssignModal]
  );

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
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            My Active Calling & Outreach Queue
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Execute outbound calls, qualify taxpayer filing requirements, schedule callbacks, and initiate W-2 tax preparation.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Queue
          </Button>

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

      {/* 2. Top Metric Cards (Consistent with Admin Teams UI) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {/* 3. Search & Tab Filter Bar (Server-Side Dynamic Filtering) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        {/* Left: Search & Tab Filter Pills */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="w-full sm:w-72">
            <AppSearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by taxpayer name, phone, email, SSN..."
              debounceMs={300}
            />
          </div>

          {/* Dynamic Tab Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
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
              onClick={() => handleTabChange('PREP')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'PREP'
                  ? 'bg-white text-[#16A34A] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Tax Prep Active ({stats.inPrep})</span>
            </button>
          </div>
        </div>

        {/* Right: Visa Filter */}
        <div className="flex items-center gap-3 w-full lg:w-auto shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs text-xs font-medium text-slate-600">
            <Globe className="w-3.5 h-3.5 text-indigo-500" />
            <span>Visa:</span>
            <select
              value={visaFilter}
              onChange={(e) => setVisaFilter(e.target.value)}
              className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Visas</option>
              <option value="H-1B">H-1B</option>
              <option value="L-1">L-1</option>
              <option value="F-1 OPT">F-1 OPT</option>
              <option value="H-4">H-4</option>
              <option value="GREEN_CARD">Green Card</option>
              <option value="US_CITIZEN">US Citizen</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Calling Queue AppTable */}
      <AppTable<DocumenterLeadItem>
        data={leads}
        columns={columns}
        selectable={false}
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

      {/* Call Outreach & Disposition Modal */}
      <CallOutreachModal
        isOpen={isCallModalOpen}
        onClose={handleCloseModals}
        lead={activeLeadForCall}
        onSaveDisposition={handleSaveCallDisposition}
        isLoading={isActionLoading}
      />
    </div>
  );
};
