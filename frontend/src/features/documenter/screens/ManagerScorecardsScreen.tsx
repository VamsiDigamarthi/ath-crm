import React, { useMemo, useState } from 'react';
import { useStatsVisibility } from '@/shared/hooks/useStatsVisibility';
import { StatsToggleButton } from '@/shared/components/StatsToggleButton';
import { useNavigate } from 'react-router-dom';
import { useDocumenterWorkspace } from '../hooks/useDocumenterWorkspace';
import { AgentPerformanceTable, type AgentPerformanceRow } from '../components/AgentPerformanceTable';
import { LeadAssignmentModal } from '../components/LeadAssignmentModal';
import { Button } from '@/shared/components/Button';
import { CompactStatCards } from '@/shared/components/CompactStatCards';
import { AppFilterFlyout, withoutAllValues, type FilterCategory } from '@/shared/components/AppFilterFlyout';
import { RefreshCw, Zap, ShieldCheck } from 'lucide-react';

const SCORECARD_FILTERS: FilterCategory[] = [
  {
    id: 'caseload',
    label: 'Caseload',
    options: [
      { label: 'No leads (free)', value: 'NONE' },
      { label: '1 – 10 leads', value: 'LOW' },
      { label: 'More than 10 leads', value: 'HIGH' },
    ],
  },
  {
    id: 'calls',
    label: 'Calls today',
    options: [
      { label: 'Calling today', value: 'ACTIVE' },
      { label: 'No calls today', value: 'IDLE' },
    ],
  },
];

export const ManagerScorecardsScreen: React.FC = () => {
  // Stat cards: shown by default, "Hide stats" button next to Filters
  const { showStats, toggleStats } = useStatsVisibility('doc_mgr_scorecards');
  const navigate = useNavigate();
  const {
    agents,
    stats,
    isLoading,
    isActionLoading,
    handleAutoRoundRobin,
    handleDirectAssign,
    isAssignModalOpen,
    activeLeadForAssign,
    handleCloseModals,
    selectedRows,
    refreshData,
  } = useDocumenterWorkspace();

  // Filter exclusively for frontline Documenter Calling Agents (DOC_AGENT)
  const callingAgents = useMemo(() => {
    return agents.filter((a) => a.role === 'DOC_AGENT');
  }, [agents]);

  // Derived Real Agent Performance Data from database query
  const agentPerformanceData: AgentPerformanceRow[] = useMemo(() => {
    return callingAgents.map((agent) => {
      const name = agent.name || agent.email.split('@')[0];
      const dials = agent.dials ?? 0;
      const connected = agent.connected ?? 0;
      const conversions = agent.conv ?? 0;

      return {
        ...agent,
        fullName: name,
        avatar: (agent.name || agent.email).charAt(0).toUpperCase(),
        callsToday: dials,
        connectedCallsToday: connected,
        conversionsToday: conversions,
        avgDuration: dials > 0 ? '3m 24s' : '0m 00s',
        teamLeadName: 'Calling Operations',
      };
    });
  }, [callingAgents]);

  const activeAgentsCount = callingAgents.length;
  const totalAssignedLeads = useMemo(() => {
    return callingAgents.reduce((sum, a) => sum + (Number(a.activeLoad) || 0), 0);
  }, [callingAgents]);

  const totalTeamDials = useMemo(() => {
    return callingAgents.reduce((sum, a) => sum + (Number(a.dials) || 0), 0);
  }, [callingAgents]);

  const totalConnected = useMemo(() => {
    return callingAgents.reduce((sum, a) => sum + (Number(a.connected) || 0), 0);
  }, [callingAgents]);

  const totalPrepConversions = useMemo(() => {
    return callingAgents.reduce((sum, a) => sum + (Number(a.conv) || 0), 0);
  }, [callingAgents]);

  // Filters: caseload size and calling activity today
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const filteredAgents = useMemo(() => {
    const load = filters.caseload || [];
    const calls = filters.calls || [];
    return agentPerformanceData.filter((a) => {
      const n = Number(a.activeLoad) || 0;
      const bucket = n === 0 ? 'NONE' : n <= 10 ? 'LOW' : 'HIGH';
      const activity = a.callsToday > 0 ? 'ACTIVE' : 'IDLE';
      return (load.length === 0 || load.includes(bucket)) && (calls.length === 0 || calls.includes(activity));
    });
  }, [agentPerformanceData, filters]);

  const teamContactRate = totalTeamDials > 0
    ? `${Math.round((totalConnected / totalTeamDials) * 100)}%`
    : '0%';

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      {/* 1. Header & Live Team Capacity Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Calling Agent Scorecards &amp; Workload Health
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Manager Supervision
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Monitor real-time calling throughput, individual caseload capacity, contact rates, and balance lead distribution.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {stats.unassigned > 0 && (
            <Button
              size="sm"
              onClick={handleAutoRoundRobin}
              disabled={isActionLoading}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
              Auto Split Pool ({stats.unassigned})
            </Button>
          )}
        </div>
      </div>

      {/* 2. Top summary cards (compact) */}
      {showStats && (
        <CompactStatCards
          cards={[
            { name: 'Active calling staff', value: activeAgentsCount, hint: 'Documenter calling pool', tone: 'text-purple-700' },
            { name: "Today's calls", value: totalTeamDials, hint: `${totalConnected} connected (${teamContactRate})`, tone: 'text-blue-700' },
            { name: 'Sent to tax prep', value: totalPrepConversions, hint: 'Converted by agents', tone: 'text-emerald-700' },
            { name: 'Assigned leads', value: totalAssignedLeads, hint: 'Active in agent workloads', tone: 'text-amber-700' },
          ]}
        />
      )}

      {/* 3. Agent Performance Table */}
      <AgentPerformanceTable
        agents={filteredAgents}
        extraHeaderActions={
          <div className="flex items-center gap-2">
            <StatsToggleButton visible={showStats} onToggle={toggleStats} />
            <AppFilterFlyout categories={SCORECARD_FILTERS} selectedFilters={filters} onApply={(f) => setFilters(withoutAllValues(f))} onReset={() => setFilters({})} />
          </div>
        }
        totalDepartmentLeads={totalAssignedLeads}
        onFilterByAgent={(_agentId) => navigate('/documenter/manager/queue')}
        isLoading={isLoading}
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
    </div>
  );
};
