import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  ArrowRight, 
  RefreshCw, 
  LayoutDashboard 
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { FilingSpecialistStatsCards } from '../components/dashboard/FilingSpecialistStatsCards';
import { FilingSpecialistVelocityCharts } from '../components/dashboard/FilingSpecialistVelocityCharts';
import { FilingSpecialistPriorityTargets } from '../components/dashboard/FilingSpecialistPriorityTargets';
import { useFilingSpecialistDashboard } from '../hooks/useFilingSpecialistDashboard';

export const FilingSpecialistDashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    isLoading,
    allLeads,
    stats,
    stageMix,
    chartMode,
    setChartMode,
    timeRange,
    setTimeRange,
    hourlyData,
    weeklyData,
    priorityTargets,
    fetchDashboardData,
    handleOpenWorkspace,
  } = useFilingSpecialistDashboard();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-16 flex flex-col items-center justify-center gap-3 font-sans">
        <div className="w-9 h-9 rounded-full border-3 border-[#16A34A] border-t-transparent animate-spin" />
        <span className="text-xs font-bold text-slate-700">Loading Filing Specialist Hub...</span>
        <span className="text-[11px] text-slate-400 font-medium">Fetching assigned returns, MeF XML schemas &amp; IRS gateway status</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      {/* 1. Header with Title, Time Range Selector & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200 flex items-center gap-1">
              <LayoutDashboard className="w-3 h-3 text-[#16A34A]" />
              <span>Specialist Operations Deck</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Filing Specialist Daily Operations Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Validate Form 1040 XML schema packages, inspect EFIN PIN compliance, and transmit returns to the IRS e-File Gateway.
          </p>
        </div>

        {/* Right Actions: Time Range & Quick Queue Button */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Time Range Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setTimeRange('TODAY')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeRange === 'TODAY'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('WEEK')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeRange === 'WEEK'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Week
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('MTD')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeRange === 'MTD'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Month
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={() => navigate('/filing/agent/queue')}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Go to My Queue ({allLeads.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <FilingSpecialistStatsCards stats={stats} />

      {/* 3. Combined Transmission Velocity AreaChart & Caseload Donut Chart */}
      <FilingSpecialistVelocityCharts
        chartMode={chartMode}
        onChartModeChange={setChartMode}
        hourlyData={hourlyData}
        weeklyData={weeklyData}
        stageMix={stageMix}
        totalAssigned={allLeads.length}
      />

      {/* 4. Full-Width High-Priority Transmission Targets (Top 3 Latest) */}
      <div className="w-full">
        <FilingSpecialistPriorityTargets
          priorityTargets={priorityTargets}
          onOpenWorkspace={handleOpenWorkspace}
          onGoToQueue={() => navigate('/filing/agent/queue')}
        />
      </div>
    </div>
  );
};
