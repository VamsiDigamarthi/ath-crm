import React from 'react';
import { RefreshCw, LayoutDashboard } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { useTaxSpecialistDashboard } from '../hooks/useTaxSpecialistDashboard';
import { SpecialistKpiCards } from '../components/dashboard/SpecialistKpiCards';
import { SpecialistVelocityCharts } from '../components/dashboard/SpecialistVelocityCharts';
import { SpecialistPriorityTasks } from '../components/dashboard/SpecialistPriorityTasks';

export const TaxSpecialistDashboardScreen: React.FC = () => {
  const {
    isLoading,
    stats,
    dualRoleMix,
    chartMode,
    setChartMode,
    hourlyData,
    weeklyData,
    priorityPrepTask,
    priorityQATask,
    refreshData,
  } = useTaxSpecialistDashboard();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-16 flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 rounded-full border-3 border-[#16A34A] border-t-transparent animate-spin" />
        <span className="text-xs font-bold text-slate-700">Loading Specialist Unified Operations Deck...</span>
        <span className="text-[11px] text-slate-400 font-medium">Fetching real-time caseload, velocity curves &amp; audit priorities</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-12 font-sans animate-in fade-in duration-200">
      {/* 1. Header with Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
              <LayoutDashboard className="w-3 h-3 text-blue-600" />
              <span>Specialist Unified Operations Deck</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            My Operations Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Unified cockpit for Form 1040 preparation drafting, 4-Eyes compliance audits, and daily throughput tracking.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Dashboard</span>
          </Button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards (100% Dynamic from DB) */}
      <SpecialistKpiCards stats={stats} />

      {/* 3. Combined Velocity AreaChart & Dual-Role Donut Chart */}
      <SpecialistVelocityCharts
        chartMode={chartMode}
        onChartModeChange={setChartMode}
        hourlyData={hourlyData}
        weeklyData={weeklyData}
        dualRoleMix={dualRoleMix}
        totalCaseload={stats.totalCaseload}
      />

      {/* 4. Priority Operational Tasks (Drafting & QA Audits) */}
      <SpecialistPriorityTasks
        priorityPrepTask={priorityPrepTask}
        priorityQATask={priorityQATask}
      />
    </div>
  );
};
