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

export type FilingChartMode = 'HOURLY' | 'WEEKLY';

interface FilingSpecialistVelocityChartsProps {
  chartMode: FilingChartMode;
  onChartModeChange: (mode: FilingChartMode) => void;
  hourlyData: Array<{ hour: string; transmitted: number; accepted: number }>;
  weeklyData: Array<{ day: string; transmitted: number; accepted: number }>;
  stageMix: Array<{ name: string; value: number; color: string; pct: number }>;
  totalAssigned: number;
}

export const FilingSpecialistVelocityCharts: React.FC<FilingSpecialistVelocityChartsProps> = ({
  chartMode,
  onChartModeChange,
  hourlyData,
  weeklyData,
  stageMix,
  totalAssigned,
}) => {
  const chartData: any[] = chartMode === 'HOURLY' ? hourlyData : weeklyData;
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
                {p.value}
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
      {/* 1. Left 2 Cols: Transmission Velocity AreaChart */}
      <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#16A34A] flex items-center justify-center border border-emerald-100">
                <AreaIcon className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                IRS MeF Transmission Velocity &amp; Throughput
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Live progression of Form 1040 XML packages transmitted vs IRS Acknowledgements (Ack: 0000) verified.
            </p>
          </div>

          {/* Hourly vs Weekly Mode Toggles */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => onChartModeChange('HOURLY')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                chartMode === 'HOURLY'
                  ? 'bg-white text-emerald-700 shadow-xs'
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
        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTransmitted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorAccepted" x1="0" y1="0" x2="0" y2="1">
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
                dataKey="transmitted"
                name="MeF Transmitted"
                stroke="#3B82F6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorTransmitted)"
              />
              <Area
                type="monotone"
                dataKey="accepted"
                name="IRS Accepted (0000)"
                stroke="#16A34A"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorAccepted)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-semibold text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              MeF Transmitted
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
              IRS Accepted (0000)
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            IRS Modernized e-File (MeF) Gateway v2025.5
          </span>
        </div>
      </div>

      {/* 2. Right 1 Col: Transmission Caseload Distribution Donut Chart */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <PieIcon className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              My Caseload Mix
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Stage distribution of {totalAssigned} assigned returns.
          </p>
        </div>

        {/* Donut Chart with Center Total */}
        <div className="relative h-44 w-full flex items-center justify-center my-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stageMix.length > 0 ? stageMix : [{ name: 'Empty', value: 1, color: '#E2E8F0', pct: 100 }]}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={68}
                paddingAngle={3}
                dataKey="value"
              >
                {(stageMix.length > 0 ? stageMix : [{ name: 'Empty', value: 1, color: '#E2E8F0', pct: 100 }]).map(
                  (entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  )
                )}
              </Pie>
              <Tooltip
                formatter={(val: any, name: any) => [`${val} returns`, name]}
                contentStyle={{ borderRadius: '12px', backgroundColor: '#0F172A', color: '#fff', fontSize: '11px' }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-black text-slate-900 leading-none">{totalAssigned}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Returns</span>
          </div>
        </div>

        {/* Legend Breakdown */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          {stageMix.map((stage) => (
            <div key={stage.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                <span className="font-semibold text-slate-700">{stage.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">{stage.value}</span>
                <span className="text-[10px] font-medium text-slate-400">({stage.pct}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
