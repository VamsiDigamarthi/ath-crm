import React from 'react';
import { PhoneCall, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface AgentPerformanceChartsProps {
  hourlyData: Array<{ hour: string; dials: number; connected: number }>;
  weeklyData: Array<{ day: string; dials: number; connected: number; prep: number }>;
  todayDials: number;
  contactRatePct: number;
  inPrepCount: number;
}

export const AgentPerformanceCharts: React.FC<AgentPerformanceChartsProps> = ({
  hourlyData,
  weeklyData,
  todayDials,
  contactRatePct,
  inPrepCount,
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-lg border border-slate-700 text-xs font-sans">
          <div className="font-bold border-b border-slate-700 pb-1 mb-1 text-slate-200">
            {label}
          </div>
          {payload.map((p: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between gap-3 my-0.5">
              <span className="text-slate-300">{p.name}:</span>
              <span className="font-bold text-white">{p.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Graph 1: Hourly Calling Throughput */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-blue-600" />
                My Hourly Calling Velocity (Today)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Hourly dials vs successfully connected taxpayers
              </p>
            </div>
            <span className="text-xs font-bold text-[#16A34A] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Active Today
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={hourlyData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="agentConn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A34A" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="hour" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} domain={[0, 'auto']} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="dials"
                  name="Dials"
                  stroke="#94A3B8"
                  strokeWidth={2}
                  fillOpacity={0.2}
                  fill="#94A3B8"
                />
                <Area
                  type="monotone"
                  dataKey="connected"
                  name="Connected"
                  stroke="#16A34A"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#agentConn)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between font-medium">
          <span>Total Logged Today: <strong>{todayDials} Calls</strong></span>
          <span className="text-[#16A34A] font-bold">{contactRatePct}% Connection Rate</span>
        </div>
      </div>

      {/* Graph 2: 5-Day Weekly Conversion Trend */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                Weekly Outreach & Intake Conversions
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                5-day daily dials, connections, and W-2 prep starts
              </p>
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              {inPrepCount} Preps Active
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weeklyData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} domain={[0, 'auto']} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="dials" name="Dials" fill="#CBD5E1" radius={[3, 3, 0, 0]} />
                <Bar dataKey="connected" name="Connected" fill="#3B82F6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="prep" name="Tax Prep Intakes" fill="#16A34A" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between font-medium">
          <span>Current Pipeline Status: <strong>{inPrepCount} Active Intakes</strong></span>
          <span className="text-purple-700 font-bold">Good Velocity</span>
        </div>
      </div>
    </div>
  );
};
