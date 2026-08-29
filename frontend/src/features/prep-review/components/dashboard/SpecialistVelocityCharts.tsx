import React from 'react';
import { AreaChart as AreaIcon, PieChart as PieIcon, Calendar, Clock } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { DashboardChartMode } from '../../hooks/useTaxSpecialistDashboard';

interface SpecialistVelocityChartsProps {
  chartMode: DashboardChartMode;
  onChartModeChange: (mode: DashboardChartMode) => void;
  hourlyData: Array<{ hour: string; prepDrafts: number; qaAudits: number }>;
  weeklyData: Array<{ day: string; prepDrafts: number; qaAudits: number }>;
  dualRoleMix: Array<{ name: string; value: number; color: string; pct: number }>;
  totalCaseload: number;
}

export const SpecialistVelocityCharts: React.FC<SpecialistVelocityChartsProps> = ({
  chartMode,
  onChartModeChange,
  hourlyData,
  weeklyData,
  dualRoleMix,
  totalCaseload,
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-700 text-xs font-sans">
          <div className="font-bold border-b border-slate-700 pb-1 mb-1.5 text-slate-200">
            {label}
          </div>
          {payload.map((p: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between gap-3 my-0.5 font-medium">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
                {p.name}:
              </span>
              <span className="font-bold text-white">{p.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Combined Velocity Chart (2 cols) with Dynamic Time & Weekly Toggle */}
      <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <AreaIcon className="w-4 h-4 text-[#16A34A]" />
              <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                {chartMode === 'TODAY'
                  ? "Today's Live Operations Velocity"
                  : 'Current Week Daily Throughput (Mon – Sun)'}
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              {chartMode === 'TODAY'
                ? 'Hourly drafting and 4-Eyes compliance audits completed today'
                : 'Day-by-day output and audit milestones for this week'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* View Mode Toggle Pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => onChartModeChange('TODAY')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  chartMode === 'TODAY'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>Today</span>
              </button>
              <button
                type="button"
                onClick={() => onChartModeChange('WEEK')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  chartMode === 'WEEK'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3 h-3" />
                <span>This Week</span>
              </button>
            </div>

            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-[#16A34A] border border-emerald-200">
              Active: {totalCaseload || 0}
            </span>
          </div>
        </div>

        {/* Dynamic Chart Container */}
        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === 'TODAY' ? (
              <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="prepGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="qaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="hour" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} domain={[0, 'dataMax + 2']} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={30}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
                <Area
                  type="monotone"
                  dataKey="prepDrafts"
                  name="1040 Drafting (as Preparer)"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#prepGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="qaAudits"
                  name="4-Eyes Audit (as Reviewer)"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#qaGrad)"
                />
              </AreaChart>
            ) : (
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} domain={[0, 'dataMax + 2']} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={30}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
                <Bar
                  dataKey="prepDrafts"
                  name="1040 Drafted (as Preparer)"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
                <Bar
                  dataKey="qaAudits"
                  name="4-Eyes Audited (as Reviewer)"
                  fill="#8B5CF6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Dual-Role Caseload Breakdown (1 col) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <PieIcon className="w-4 h-4 text-purple-600" />
            <h3 className="font-bold text-xs sm:text-sm text-slate-900">
              Dual-Role Caseload Allocation
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Distribution between Preparer and Reviewer duties
          </p>

          <div className="h-44 w-full relative mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dualRoleMix}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={68}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {dualRoleMix.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-slate-900">{totalCaseload || 0}</span>
              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">
                Assigned
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 border-t border-slate-100 pt-3">
          {dualRoleMix.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-700">{item.name}</span>
              </div>
              <span className="text-slate-900 font-bold">{item.pct || 0}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
