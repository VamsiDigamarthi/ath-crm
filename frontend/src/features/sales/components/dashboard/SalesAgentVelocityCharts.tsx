import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { AreaChart as AreaIcon, PieChart as PieIcon, Clock, Calendar } from 'lucide-react';
import type { SalesChartMode } from '../../hooks/useSalesAgentDashboard';

interface SalesAgentVelocityChartsProps {
  chartMode: SalesChartMode;
  onChartModeChange: (mode: SalesChartMode) => void;
  hourlyData: Array<{ hour: string; pitches: number; deals: number; revenue: number }>;
  weeklyData: Array<{ day: string; pitches: number; deals: number; revenue: number }>;
  stageMix: Array<{ name: string; value: number; color: string; pct: number }>;
  totalAssigned: number;
}

export const SalesAgentVelocityCharts: React.FC<SalesAgentVelocityChartsProps> = ({
  chartMode,
  onChartModeChange,
  hourlyData,
  weeklyData,
  stageMix,
  totalAssigned,
}) => {
  const chartData = chartMode === 'HOURLY' ? hourlyData : weeklyData;
  const xKey = chartMode === 'HOURLY' ? 'hour' : 'day';

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
              <span className="font-bold text-white">
                {p.name.includes('Revenue') ? `$${Number(p.value).toLocaleString()}` : p.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Left 2 Cols: Pitch Conversion Velocity & Hourly/Weekly Trajectory */}
      <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <AreaIcon className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Pitch Conversion Velocity &amp; Throughput
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Live progression of phone pitches initiated versus fee payments finalized.
            </p>
          </div>

          {/* Hourly vs Weekly Mode Toggles */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => onChartModeChange('HOURLY')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                chartMode === 'HOURLY'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Today Hourly</span>
            </button>

            <button
              type="button"
              onClick={() => onChartModeChange('WEEKLY')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                chartMode === 'WEEKLY'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>This Week</span>
            </button>
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-64 sm:h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData as any} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="pitchGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="dealGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16A34A" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#16A34A" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis 
                dataKey={xKey} 
                tickLine={false} 
                axisLine={{ stroke: '#E2E8F0' }} 
                tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }}
              />
              <YAxis 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#64748B', fontSize: 11 }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="pitches"
                name="Pitches Initiated"
                stroke="#3B82F6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#pitchGrad)"
              />
              <Area
                type="monotone"
                dataKey="deals"
                name="Deals Closed & Paid"
                stroke="#16A34A"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#dealGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom Legend Pills */}
        <div className="flex items-center justify-center gap-6 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Pitches Initiated</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
            <span>Deals Closed &amp; Paid</span>
          </div>
        </div>
      </div>

      {/* 2. Right 1 Col: Stage Breakdown Donut Chart */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <PieIcon className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Pitch Funnel Distribution
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Breakdown across pitch discussions, payment links, and closed returns.
          </p>
        </div>

        {/* Donut Chart with Center Text */}
        <div className="relative h-52 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stageMix}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {stageMix.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Centered Total */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
              {totalAssigned}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-0.5">
              Assigned
            </span>
          </div>
        </div>

        {/* Stage Legend Breakdown */}
        <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
          {stageMix.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-700">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-900 font-bold">{item.value}</span>
                <span className="text-[11px] text-slate-400 font-medium w-8 text-right">
                  {item.pct}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
