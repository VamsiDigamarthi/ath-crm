import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PhoneCall, ArrowRight, RefreshCw, LayoutDashboard } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { SalesAgentStatsCards } from '../components/agent/SalesAgentStatsCards';
import { SalesAgentVelocityCharts } from '../components/dashboard/SalesAgentVelocityCharts';
import { SalesAgentPriorityTargets } from '../components/dashboard/SalesAgentPriorityTargets';
import { SalesAgentActivityFeed } from '../components/dashboard/SalesAgentActivityFeed';
import { useSalesAgentDashboard } from '../hooks/useSalesAgentDashboard';

export const SalesAgentDashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    isLoading,
    stats,
    stageMix,
    chartMode,
    setChartMode,
    timeRange,
    setTimeRange,
    hourlyData,
    weeklyData,
    priorityTargets,
    recentActivities,
    fetchDashboardData,
    handleOpenPitch,
  } = useSalesAgentDashboard();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-16 flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 rounded-full border-3 border-[#16A34A] border-t-transparent animate-spin" />
        <span className="text-xs font-bold text-slate-700">Loading Closer Daily Operations Hub...</span>
        <span className="text-[11px] text-slate-400 font-medium">Fetching real-time caseload, pitch velocity &amp; fee checkouts</span>
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
              <span>Sales Closer Operations Deck</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Sales Closer Daily Operations Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Call taxpayers, pitch eligible tax refund deductions, collect service payments, and authorize Form 8879.
          </p>
        </div>

        {/* Right Actions: Time Range & Quick Pitch Queue Button */}
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
            onClick={() => navigate('/sales/agent/queue')}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Go to My Pitch Queue ({stats.assignedLeads})</span>
            <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards (100% Dynamic from Database) */}
      <SalesAgentStatsCards stats={stats} />

      {/* 3. Combined Pitch Velocity AreaChart & Stage Funnel Donut Chart */}
      <SalesAgentVelocityCharts
        chartMode={chartMode}
        onChartModeChange={setChartMode}
        hourlyData={hourlyData}
        weeklyData={weeklyData}
        stageMix={stageMix}
        totalAssigned={stats.assignedLeads}
      />

      {/* 4. Two-Column Operational Section: Priority Pitch Targets & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: High-Priority Pitch Targets */}
        <div className="lg:col-span-7">
          <SalesAgentPriorityTargets
            priorityTargets={priorityTargets}
            onOpenPitch={handleOpenPitch}
            onGoToQueue={() => navigate('/sales/agent/queue')}
          />
        </div>

        {/* Right 5 Cols: Recent Activity Feed */}
        <div className="lg:col-span-5">
          <SalesAgentActivityFeed
            activities={recentActivities}
            onGoToQueue={() => navigate('/sales/agent/queue')}
          />
        </div>
      </div>
    </div>
  );
};
