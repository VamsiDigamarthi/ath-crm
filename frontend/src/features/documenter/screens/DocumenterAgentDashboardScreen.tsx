import React, { useMemo } from 'react';
import { useDocumenterWorkspace } from '../hooks/useDocumenterWorkspace';
import { CallOutreachModal } from '../components/CallOutreachModal';
import { Button } from '@/shared/components/Button';
import { PhoneCall } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AgentStatsCards } from '../components/dashboard/AgentStatsCards';
import { AgentPerformanceCharts } from '../components/dashboard/AgentPerformanceCharts';
import { AgentUpcomingCallbacks } from '../components/dashboard/AgentUpcomingCallbacks';
import { AgentQuickCallingQueue } from '../components/dashboard/AgentQuickCallingQueue';

export const DocumenterAgentDashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    leads,
    stats,
    isCallModalOpen,
    activeLeadForCall,
    handleOpenCallModal,
    handleCloseModals,
    handleSaveCallDisposition,
    isActionLoading,
  } = useDocumenterWorkspace();

  const todayDials = stats.todayDials || 0;
  const todayConnected = stats.todayConnected || 0;
  const contactRatePct = stats.contactRatePct || 0;
  const inPrepCount = stats.inPrep || 0;
  const callbacksCount = stats.callbacks || 0;

  // Real Hourly calling velocity curve directly from DB
  const agentHourlyData = useMemo(() => {
    if (stats.hourlyBreakdown && stats.hourlyBreakdown.length > 0) {
      return stats.hourlyBreakdown;
    }
    return [
      { hour: '9 AM', dials: 0, connected: 0 },
      { hour: '10 AM', dials: 0, connected: 0 },
      { hour: '11 AM', dials: 0, connected: 0 },
      { hour: '12 PM', dials: 0, connected: 0 },
      { hour: '1 PM', dials: 0, connected: 0 },
      { hour: '2 PM', dials: 0, connected: 0 },
      { hour: '3 PM', dials: todayDials, connected: todayConnected },
      { hour: '4 PM', dials: 0, connected: 0 },
      { hour: '5 PM', dials: 0, connected: 0 },
    ];
  }, [stats.hourlyBreakdown, todayDials, todayConnected]);

  // Real 5-day weekly activity trend directly from DB (no fake past data)
  const agentWeeklyData = useMemo(() => {
    if (stats.weeklyBreakdown && stats.weeklyBreakdown.length > 0) {
      return stats.weeklyBreakdown;
    }
    return [
      { day: 'Mon', dials: 0, connected: 0, prep: 0 },
      { day: 'Tue', dials: 0, connected: 0, prep: 0 },
      { day: 'Wed', dials: 0, connected: 0, prep: 0 },
      { day: 'Thu', dials: 0, connected: 0, prep: 0 },
      { day: 'Today', dials: todayDials, connected: todayConnected, prep: inPrepCount },
    ];
  }, [stats.weeklyBreakdown, todayDials, todayConnected, inPrepCount]);

  // Live scheduled callbacks from DB
  const callbackLeads = useMemo(() => {
    return leads.filter((l) => {
      const log = l.lastCallLog || (l as any).callLogs?.[0];
      return Boolean(log?.callbackScheduledAt);
    });
  }, [leads]);

  // Live uncalled leads snapshot for quick dial
  const nextLeadsToCall = useMemo(() => {
    const uncalled = leads.filter((l) => l.currentStage === 'DOC_OUTREACH' && !l.lastCallLog);
    return uncalled.length > 0 ? uncalled.slice(0, 4) : leads.slice(0, 4);
  }, [leads]);

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      {/* 1. Header & Launch Queue Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            My Daily Calling & Outreach Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Review your daily dial quotas, scheduled callback appointments, and active W-2 client intakes.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            onClick={() => navigate('/documenter/agent/queue')}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Launch Calling Queue</span>
          </Button>
        </div>
      </div>

      {/* 2. Top 4 KPI Scorecard Cards */}
      <AgentStatsCards stats={stats} />

      {/* 3. Recharts Graphs (Hourly Calling & Weekly Trend) */}
      <AgentPerformanceCharts
        hourlyData={agentHourlyData}
        weeklyData={agentWeeklyData}
        todayDials={todayDials}
        contactRatePct={contactRatePct}
        inPrepCount={inPrepCount}
      />

      {/* 4. Upcoming Callbacks & Quick Calling Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AgentUpcomingCallbacks
          callbacks={callbackLeads}
          callbacksCount={callbacksCount}
          nextCallbackAt={stats.nextCallbackAt}
          onOpenCallModal={handleOpenCallModal}
        />

        <AgentQuickCallingQueue
          leads={nextLeadsToCall}
          totalLeadsCount={stats.myLeads || leads.length}
          onOpenCallModal={handleOpenCallModal}
        />
      </div>

      {/* 5. Connected Call Outreach Modal */}
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
