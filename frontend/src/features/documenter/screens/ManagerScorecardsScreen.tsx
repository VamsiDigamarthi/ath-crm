import React, { useMemo } from 'react';
import { useDocumenterWorkspace } from '../hooks/useDocumenterWorkspace';
import { AgentPerformanceTable, type AgentPerformanceRow } from '../components/AgentPerformanceTable';
import { LeadAssignmentModal } from '../components/LeadAssignmentModal';
import { Button } from '@/shared/components/Button';
import { 
  Users, 
  RefreshCw, 
  Zap, 
  ShieldCheck, 
  Activity, 
  CheckCircle2,
  PhoneCall
} from 'lucide-react';

export const ManagerScorecardsScreen: React.FC = () => {
  const {
    agents,
    stats,
    isLoading,
    isActionLoading,
    handleAutoRoundRobin,
    handleDirectAssign,
    isAssignModalOpen,
    activeLeadForAssign,
    handleOpenAssignModal,
    handleCloseModals,
    selectedRows,
    refreshData,
  } = useDocumenterWorkspace();

  // Derived Agent Performance Data
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

  const activeAgentsCount = agents.filter((a) => a.role === 'DOC_AGENT').length || 6;
  const totalTeamDials = agentPerformanceData.reduce((acc, a) => acc + a.callsToday, 0);
  const totalConversions = agentPerformanceData.reduce((acc, a) => acc + a.conversionsToday, 0);

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      {/* 1. Header & Live Team Capacity Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Calling Agent Scorecards & Workload Health
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
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {stats.unassigned > 0 && (
            <Button
              size="sm"
              onClick={handleAutoRoundRobin}
              disabled={isActionLoading}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs"
            >
              <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
              Auto Split Pool ({stats.unassigned})
            </Button>
          )}
        </div>
      </div>

      {/* 2. Top Metric Cards for Agent Operations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{activeAgentsCount} Active Agents</div>
            <div className="text-xs text-slate-500 font-medium">In Round-Robin Pool</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{totalTeamDials} Dials Today</div>
            <div className="text-xs text-slate-500 font-medium">82% Connection Rate</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-[#16A34A] flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{totalConversions} Conversions</div>
            <div className="text-xs text-slate-500 font-medium">Transferred to Tax Prep</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">Optimal Load</div>
            <div className="text-xs text-slate-500 font-medium">Avg. 3.2 leads/agent</div>
          </div>
        </div>
      </div>

      {/* 3. Agent Performance Table */}
      <AgentPerformanceTable
        agents={agentPerformanceData}
        onAssignToAgent={(_agentId) => handleOpenAssignModal()}
        onFilterByAgent={(_agentId) => {}}
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
