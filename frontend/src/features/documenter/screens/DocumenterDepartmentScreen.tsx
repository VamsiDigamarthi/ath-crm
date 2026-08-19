import React, { useMemo } from 'react';
import { useDocumenterWorkspace } from '../hooks/useDocumenterWorkspace';
import { DocumenterMetrics } from '../components/DocumenterMetrics';
import { FloatingActionBar } from '../components/FloatingActionBar';
import { LeadAssignmentModal } from '../components/LeadAssignmentModal';
import { CallOutreachModal } from '../components/CallOutreachModal';
import { getDocumenterColumns } from '../columns/documenter-columns';
import { AppTable } from '@/shared/components/AppTable';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
import {
  Users,
  PhoneCall,
  FileCheck2,
  Clock,
  UserCheck,
  ListFilter,
  Zap,
  RefreshCw,
  Globe
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import type { DocumenterTab, DocumenterLeadItem } from '../types/documenter.types';

export const DocumenterDepartmentScreen: React.FC = () => {
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
    activeLeadForCall,
    activeLeadForAssign,
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
      }),
    [handleOpenCallModal, handleOpenAssignModal]
  );

  // Role-specific Tabs Configuration
  const tabs = isAgent
    ? [
      { id: 'MY_LEADS' as DocumenterTab, label: 'My Assigned Leads', count: stats.myLeads, icon: UserCheck },
      { id: 'CALLBACKS' as DocumenterTab, label: 'My Callbacks', count: stats.callbacks, icon: Clock },
      { id: 'PREP' as DocumenterTab, label: 'Tax Prep Active', count: stats.inPrep, icon: FileCheck2 },
      { id: 'ALL' as DocumenterTab, label: 'All My Leads', count: stats.total, icon: ListFilter },
    ]
    : [
      { id: 'MY_LEADS' as DocumenterTab, label: 'My Assigned Leads', count: stats.myLeads || 0, icon: UserCheck },
      { id: 'UNASSIGNED' as DocumenterTab, label: 'Unassigned Pool', count: stats.unassigned, icon: Users },
      { id: 'OUTREACH' as DocumenterTab, label: 'In Active Outreach', count: stats.activeOutreach, icon: PhoneCall },
      { id: 'PREP' as DocumenterTab, label: 'In Tax Prep', count: stats.inPrep, icon: FileCheck2 },
      { id: 'CALLBACKS' as DocumenterTab, label: 'Scheduled Callbacks', count: stats.callbacks, icon: Clock },
      { id: 'ALL' as DocumenterTab, label: 'All Department Leads', count: stats.totalDepartment || totalItems, icon: ListFilter },
    ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {isAgent ? 'My Documenter Outreach Queue' : 'Documenter Lead Distribution & Routing'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            {isAgent
              ? 'Contact your assigned taxpayer leads, log calling outcomes, and initiate client intake.'
              : 'Distribute unassigned tax leads, balance agent workloads, and monitor department calling pipeline.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {!isAgent && stats.unassigned > 0 && (
            <Button
              size="sm"
              onClick={handleAutoRoundRobin}
              disabled={isActionLoading}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs"
            >
              <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
              1-Click Auto Round-Robin ({stats.unassigned})
            </Button>
          )}
        </div>
      </div>

      {/* Top Metric Cards */}
      <DocumenterMetrics
        stats={stats}
        onQuickAutoDistribute={handleAutoRoundRobin}
        isDistributing={isActionLoading}
      />

      {/* 1. Tabs & Search Bar Card */}
      <div className="rounded-xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Navigation Tabs Header */}
        <div className="border-b border-slate-200 px-6 pt-3 flex items-center justify-between overflow-x-auto">
          <div className="flex items-center gap-1 sm:gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-3 border-b-2 font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${isActive
                      ? 'border-[#16A34A] text-[#16A34A] bg-emerald-50/40 rounded-t-lg'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#16A34A]' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive
                        ? 'bg-[#16A34A] text-white'
                        : 'bg-slate-100 text-slate-600'
                      }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 sm:p-5 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-80">
            <AppSearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by taxpayer name, phone, email, SSN..."
              debounceMs={300}
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Visa Filter */}
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs text-xs font-medium text-slate-600">
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

            {!isAgent && selectedRows.length > 0 && (
              <Button
                size="sm"
                onClick={() => handleOpenAssignModal()}
                className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs"
              >
                <Users className="w-3.5 h-3.5" />
                Assign Selected ({selectedRows.length})
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Separate Dedicated Table Section */}
      <AppTable<DocumenterLeadItem>
        data={leads}
        columns={columns}
        selectable={!isAgent}
        selectedRows={selectedRows}
        rowKey="id"
        onSelectionChange={(selected) => setSelectedRows(selected)}
        isLoading={isLoading}
        emptyText={
          activeTab === 'UNASSIGNED'
            ? 'All leads have been distributed to staff, or no new bulk leads are unassigned.'
            : activeTab === 'MY_LEADS'
              ? 'No leads are currently assigned to you. Leads will appear here once assigned by your Team Lead or Manager.'
              : 'No leads match the selected filter criteria.'
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
      {!isAgent && (
        <FloatingActionBar
          selectedCount={selectedRows.length}
          onAutoRoundRobin={handleAutoRoundRobin}
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
        onConfirmRoundRobin={handleAutoRoundRobin}
        isLoading={isActionLoading}
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
