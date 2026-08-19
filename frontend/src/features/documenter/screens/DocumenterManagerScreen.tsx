import React, { useState, useMemo } from 'react';
import { useDocumenterWorkspace } from '../hooks/useDocumenterWorkspace';
import { ManagerAnalyticsCards, type ManagerAnalyticsStats } from '../components/ManagerAnalyticsCards';
import { AgentPerformanceTable, type AgentPerformanceRow } from '../components/AgentPerformanceTable';
import { ManagerFunnelAnalytics } from '../components/ManagerFunnelAnalytics';
import { FloatingActionBar } from '../components/FloatingActionBar';
import { LeadAssignmentModal } from '../components/LeadAssignmentModal';
import { CallOutreachModal } from '../components/CallOutreachModal';
import { getDocumenterColumns } from '../columns/documenter-columns';
import { AppTable } from '@/shared/components/AppTable';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
import { Button } from '@/shared/components/Button';
import { 
  Users, 
  PhoneCall, 
  FileCheck2, 
  Clock, 
  ListFilter, 
  Zap, 
  RefreshCw, 
  Globe,
  TrendingUp,
  LayoutGrid
} from 'lucide-react';
import type { DocumenterTab, DocumenterLeadItem } from '../types/documenter.types';

export const DocumenterManagerScreen: React.FC = () => {
  const {
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

  // Active Manager Workspace View
  const [managerView, setManagerView] = useState<'TEAM_PERFORMANCE' | 'CASELOAD_QUEUE' | 'ANALYTICS'>('TEAM_PERFORMANCE');

  // Selected agent filter for drilling down into an agent's queue
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string | null>(null);

  // Filter leads if manager clicks "View Queue" for a specific agent
  const displayedLeads = useMemo(() => {
    if (!selectedAgentFilter) return leads;
    return leads.filter((l) => l.assignedDocAgentId === selectedAgentFilter);
  }, [leads, selectedAgentFilter]);

  // Lead Table Columns
  const leadColumns = useMemo(
    () =>
      getDocumenterColumns({
        onOpenCallModal: handleOpenCallModal,
        onOpenAssignModal: handleOpenAssignModal,
      }),
    [handleOpenCallModal, handleOpenAssignModal]
  );

  // Department Queue Tabs
  const departmentTabs = [
    { id: 'UNASSIGNED' as DocumenterTab, label: 'Unassigned Pool', count: stats.unassigned, icon: Users },
    { id: 'OUTREACH' as DocumenterTab, label: 'In Active Outreach', count: stats.activeOutreach, icon: PhoneCall },
    { id: 'PREP' as DocumenterTab, label: 'In Tax Prep', count: stats.inPrep, icon: FileCheck2 },
    { id: 'CALLBACKS' as DocumenterTab, label: 'Scheduled Callbacks', count: stats.callbacks, icon: Clock },
    { id: 'ALL' as DocumenterTab, label: 'All Department Leads', count: stats.totalDepartment || totalItems, icon: ListFilter },
  ];

  // Calculated Manager Analytics Stats
  const managerStats: ManagerAnalyticsStats = useMemo(() => {
    const totalCallsToday = 38;
    const connectedCalls = 31;
    const inTaxPrep = stats.inPrep || 4;
    const inOutreach = stats.activeOutreach || 8;
    const totalLeads = stats.totalDepartment || totalItems || 20;

    return {
      totalLeads,
      unassignedLeads: stats.unassigned,
      inOutreach,
      inTaxPrep,
      callbacksScheduled: stats.callbacks || 2,
      totalCallsToday,
      connectedCalls,
      contactRatePct: totalCallsToday > 0 ? Math.round((connectedCalls / totalCallsToday) * 100) : 82,
      conversionRatePct: inOutreach > 0 ? Math.round((inTaxPrep / inOutreach) * 100) : 33,
      activeAgentsCount: agents.filter((a) => a.role === 'DOC_AGENT').length || 6,
      avgCallDuration: '3m 45s',
    };
  }, [stats, totalItems, agents]);

  // Mocked / Derived Agent Performance Data with realistic metrics
  const agentPerformanceData: AgentPerformanceRow[] = useMemo(() => {
    const callingStaff = agents.filter((a) => a.role === 'DOC_AGENT' || a.role === 'DOC_TEAM_LEAD');
    
    return callingStaff.map((agent, index) => {
      const isTL = agent.role === 'DOC_TEAM_LEAD';
      const callsToday = isTL ? 4 : 8 + (index % 5) * 2;
      const connected = Math.round(callsToday * 0.8);
      const conversions = Math.round(connected * 0.3);
      const teamLeadName = index < 4 ? 'Ananya I (Pod Alpha)' : 'Vikram S (Pod Beta)';
      
      const emailName = agent.email.split('@')[0];
      const parts = emailName.split('.');
      const firstName = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : 'Agent';
      const lastName = parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : '';
      const fullName = `${firstName} ${lastName}`.trim();

      return {
        ...agent,
        fullName: fullName || agent.email,
        avatar: `https://images.unsplash.com/photo-${1534528741775 + index * 1000}?w=100&auto=format&fit=crop&q=80`,
        callsToday,
        connectedCallsToday: connected,
        conversionsToday: conversions,
        avgDuration: `${3 + (index % 3)}m ${(index * 15) % 60}s`,
        maxCapacity: isTL ? 6 : 10,
        teamLeadName: isTL ? 'Self (Team Lead)' : teamLeadName,
      };
    });
  }, [agents]);

  // Funnel Breakdown Data
  const funnelData = useMemo(() => ({
    outreachBreakdown: {
      interested: 12,
      callbacks: 8,
      notInterested: 4,
      noAnswer: 6,
      invalid: 1,
      total: 31,
    },
    visaBreakdown: {
      h1b: 9,
      f1Opt: 5,
      l1: 3,
      greenCard: 3,
      total: 20,
    },
  }), []);

  const handleFilterByAgent = (agentId: string) => {
    setSelectedAgentFilter(agentId);
    setManagerView('CASELOAD_QUEUE');
  };

  const handleClearAgentFilter = () => {
    setSelectedAgentFilter(null);
  };

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      {/* 1. Header & Live Team Health Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Documenter Department Operations & Intelligence
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
              Live Operations
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Supervise calling pipelines, monitor agent workload capacity, track conversion metrics, and rebalance departmental caseloads.
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
            Refresh Data
          </Button>

          {stats.unassigned > 0 && (
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

      {/* 2. Top Manager KPI Overview Cards */}
      <ManagerAnalyticsCards
        stats={managerStats}
        onQuickRoundRobin={handleAutoRoundRobin}
        isActionLoading={isActionLoading}
      />

      {/* 3. Modern Workspace View Selector (Segmented Tabs) */}
      <div className="flex items-center justify-between gap-4 p-1.5 bg-slate-100/90 rounded-xl border border-slate-200/80">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full sm:w-auto">
          {[
            { id: 'TEAM_PERFORMANCE', label: 'Team Performance & Scorecards', icon: Users },
            { id: 'CASELOAD_QUEUE', label: 'Department Lead Queue & Workloads', icon: LayoutGrid },
            { id: 'ANALYTICS', label: 'Conversion Funnel & Visa Insights', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = managerView === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setManagerView(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-[#16A34A] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#16A34A]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {selectedAgentFilter && (
          <div className="hidden sm:flex items-center gap-2 text-xs bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-emerald-900 font-bold">
            <span>Filtered to Agent</span>
            <button
              onClick={handleClearAgentFilter}
              className="text-emerald-700 hover:text-emerald-950 font-bold cursor-pointer ml-1 underline"
            >
              Clear Filter
            </button>
          </div>
        )}
      </div>

      {/* 4. Active View Content */}

      {/* View 1: Team Performance & Agent Scorecards Table */}
      {managerView === 'TEAM_PERFORMANCE' && (
        <AgentPerformanceTable
          agents={agentPerformanceData}
          onFilterByAgent={handleFilterByAgent}
          isLoading={isLoading}
        />
      )}

      {/* View 2: Full Department Caseload Queue */}
      {managerView === 'CASELOAD_QUEUE' && (
        <div className="space-y-4">
          {/* Tabs & Search Bar Card */}
          <div className="rounded-xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
            {/* Navigation Tabs Header */}
            <div className="border-b border-slate-200 px-6 pt-3 flex items-center justify-between overflow-x-auto">
              <div className="flex items-center gap-1 sm:gap-2">
                {departmentTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`flex items-center gap-2 px-3.5 py-3 border-b-2 font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'border-[#16A34A] text-[#16A34A] bg-emerald-50/40 rounded-t-lg'
                          : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#16A34A]' : 'text-slate-400'}`} />
                      <span>{tab.label}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive
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

                {selectedRows.length > 0 && (
                  <Button
                    size="sm"
                    onClick={() => handleOpenAssignModal()}
                    className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                  >
                    <Users className="w-3.5 h-3.5" />
                    Assign / Reassign ({selectedRows.length})
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Department Lead Table */}
          <AppTable<DocumenterLeadItem>
            data={displayedLeads}
            columns={leadColumns}
            selectable
            selectedRows={selectedRows}
            rowKey="id"
            onSelectionChange={(selected) => setSelectedRows(selected)}
            isLoading={isLoading}
            emptyText={
              selectedAgentFilter
                ? 'No leads currently assigned to this staff member.'
                : activeTab === 'UNASSIGNED'
                ? 'All leads have been distributed to staff, or no new bulk leads are unassigned.'
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
        </div>
      )}

      {/* View 3: Conversion Funnel & Visa Insights */}
      {managerView === 'ANALYTICS' && (
        <ManagerFunnelAnalytics
          outreachBreakdown={funnelData.outreachBreakdown}
          visaBreakdown={funnelData.visaBreakdown}
        />
      )}

      {/* Floating Action Bar when leads are checked */}
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
        onSaveDisposition={handleSaveCallDisposition}
        isLoading={isActionLoading}
      />
    </div>
  );
};
