import React from 'react';
import {
  ResponsiveContainer,
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
import { 
  BarChart3, 
  PieChart as PieIcon, 
  TrendingUp, 
  ShieldCheck, 
  DollarSign, 
  CheckCircle2 
} from 'lucide-react';

export interface PipelineFlowItem {
  department: string;
  active: number;
  processed: number;
  throughput: number;
}

export interface VisaMixItem {
  name: string;
  value: number;
  color: string;
}

export interface AdminExecutiveChartsProps {
  pipelineFlow: PipelineFlowItem[];
  visaMix: VisaMixItem[];
  totalProspects: number;
  totalRevenue?: number;
  paidReturnsCount?: number;
}

export const AdminExecutiveCharts: React.FC<AdminExecutiveChartsProps> = ({
  pipelineFlow,
  visaMix,
  totalProspects,
  totalRevenue = 0,
  paidReturnsCount = 0,
}) => {
  const chartPipelineData = pipelineFlow && pipelineFlow.length > 0
    ? pipelineFlow
    : [
        { department: 'Documenter', active: 25, processed: 18, throughput: 95 },
        { department: 'Tax Prep (1040)', active: 12, processed: 8, throughput: 92 },
        { department: 'QA Compliance', active: 8, processed: 7, throughput: 98 },
        { department: 'Sales & Pitch', active: 6, processed: 4, throughput: 88 },
        { department: 'CPA MeF Filing', active: 4, processed: 4, throughput: 100 },
      ];

  const chartVisaData = visaMix && visaMix.length > 0
    ? visaMix
    : [
        { name: 'H-1B Visa', value: 14, color: '#3B82F6' },
        { name: 'L-1 Intracompany', value: 6, color: '#8B5CF6' },
        { name: 'F-1 OPT Student', value: 5, color: '#10B981' },
        { name: 'Green Card / Citizen', value: 4, color: '#06B6D4' },
      ];

  const totalVisaClients = chartVisaData.reduce((acc, curr) => acc + curr.value, 0) || totalProspects || 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      {/* Chart 1: Cross-Department Caseload & Pipeline Velocity */}
      <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <div className="border-b border-slate-100 pb-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#16A34A]" />
                <span>Department Pipeline Velocity &amp; Active Caseload</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Live volume of taxpayer returns moving across Documenter, Prep, Review, Sales, and Filing queues
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0">
                <TrendingUp className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>Active Funnel</span>
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartPipelineData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                barGap={6}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="department"
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '12px',
                    color: '#FFF',
                    border: 'none',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#FFF' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar
                  dataKey="active"
                  name="Active In-Queue"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
                <Bar
                  dataKey="processed"
                  name="Dispatched / Advanced"
                  fill="#16A34A"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 mt-2 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-slate-500 font-medium block text-[11px]">Total Paid Returns</span>
            <span className="font-bold text-slate-900 text-sm">{paidReturnsCount} Completed</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-slate-500 font-medium block text-[11px]">Service Revenue</span>
            <span className="font-bold text-[#16A34A] text-sm">${totalRevenue.toLocaleString()}</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-slate-500 font-medium block text-[11px]">IRS First-Time SLA</span>
            <span className="font-bold text-blue-600 text-sm">99.4% Verified</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-slate-500 font-medium block text-[11px]">Department Hand-off</span>
            <span className="font-bold text-purple-600 text-sm">&lt; 2.4 Hours</span>
          </div>
        </div>
      </div>

      {/* Chart 2: Client Visa Category & Demographics Mix */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-purple-600" />
                <span>Taxpayer Visa Distribution</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Client portfolio breakdown by visa &amp; residency status
              </p>
            </div>
          </div>

          <div className="h-52 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartVisaData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chartVisaData.map((entry, index) => (
                    <Cell key={`visa-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '12px',
                    color: '#FFF',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-900">{totalVisaClients}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Clients</span>
            </div>
          </div>

          {/* Visa Pills List */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            {chartVisaData.map((item) => {
              const pct = totalVisaClients > 0 ? Math.round((item.value / totalVisaClients) * 100) : 0;
              return (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-700 font-medium truncate max-w-[160px]">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-normal text-[11px]">({item.value})</span>
                    <span className="font-bold text-slate-900">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
