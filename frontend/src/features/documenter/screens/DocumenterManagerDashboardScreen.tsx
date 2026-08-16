import React, { useState, useMemo } from 'react';
import { useDocumenterWorkspace } from '../hooks/useDocumenterWorkspace';
import { LeadAssignmentModal } from '../components/LeadAssignmentModal';
import { Button } from '@/shared/components/Button';
import { 
  Users, 
  PhoneCall, 
  TrendingUp, 
  Clock, 
  Zap, 
  RefreshCw, 
  Award, 
  Sparkles,
  ArrowRight,
  ChevronRight,
  UserCheck,
  CheckCircle2,
  PieChart as PieIcon,
  BarChart3,
  LineChart as LineIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

export const DocumenterManagerDashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<'TODAY' | 'WEEK' | 'SEASON'>('TODAY');

  const {
    agents,
    stats,
    isLoading,
    isActionLoading,
    handleAutoRoundRobin,
    handleDirectAssign,
    isAssignModalOpen,
    activeLeadForAssign,
    handleCloseModals,
    refreshData,
  } = useDocumenterWorkspace();

  // 1. Hourly Calling Outreach Data (for Area & Bar Chart)
  const hourlyCallingData = [
    { hour: '9 AM', dials: 14, connected: 11, conversions: 3 },
    { hour: '10 AM', dials: 28, connected: 23, conversions: 7 },
    { hour: '11 AM', dials: 45, connected: 38, conversions: 14 }, // Peak
    { hour: '12 PM', dials: 32, connected: 26, conversions: 9 },
    { hour: '1 PM', dials: 20, connected: 15, conversions: 4 },
    { hour: '2 PM', dials: 36, connected: 30, conversions: 11 },
    { hour: '3 PM', dials: 48, connected: 42, conversions: 16 }, // Peak
    { hour: '4 PM', dials: 38, connected: 31, conversions: 12 },
    { hour: '5 PM', dials: 22, connected: 17, conversions: 5 },
  ];

  // 2. Weekly Outreach & Conversion Trend Data (for Composed Line/Bar Chart)
  const weeklyTrendData = [
    { day: 'Mon', dials: 180, connected: 148, prep: 52, rate: 82.2 },
    { day: 'Tue', dials: 210, connected: 172, prep: 64, rate: 81.9 },
    { day: 'Wed', dials: 245, connected: 205, prep: 78, rate: 83.6 },
    { day: 'Thu', dials: 230, connected: 190, prep: 71, rate: 82.6 },
    { day: 'Fri', dials: 260, connected: 218, prep: 89, rate: 83.8 },
    { day: 'Sat', dials: 110, connected: 92, prep: 34, rate: 83.6 },
    { day: 'Sun', dials: 65, connected: 52, prep: 18, rate: 80.0 },
  ];

  // 3. Visa Category Distribution Data (for Donut Chart)
  const visaData = [
    { name: 'H-1B Speciality', value: 186, color: '#16A34A', pct: 43 },
    { name: 'F-1 OPT Students', value: 122, color: '#3B82F6', pct: 28 },
    { name: 'L-1 Intra-Company', value: 68, color: '#8B5CF6', pct: 16 },
    { name: 'Green Card / US', value: 56, color: '#F59E0B', pct: 13 },
  ];

  // 4. Team Lead Pod Head-to-Head Performance (for Grouped Bar Chart)
  const podComparisonData = [
    { metric: 'Active Calling Staff', podAlpha: 4, podBeta: 4 },
    { metric: 'Calls Logged (Dials)', podAlpha: 168, podBeta: 144 },
    { metric: 'Connected Calls', podAlpha: 145, podBeta: 118 },
    { metric: 'Tax Prep Intakes', podAlpha: 48, podBeta: 39 },
  ];

  // Top Performing Calling Agents
  const topAgents = useMemo(() => [
    { name: 'Kavya R.', email: 'kavya.r@taxcrm.com', dials: 48, connected: 41, conv: 14, rate: '85.4%', avatar: 'K' },
    { name: 'Manish G.', email: 'manish.g@taxcrm.com', dials: 44, connected: 36, conv: 11, rate: '81.8%', avatar: 'M' },
    { name: 'Divya S.', email: 'divya.s@taxcrm.com', dials: 40, connected: 33, conv: 9, rate: '82.5%', avatar: 'D' },
  ], []);

  // Custom Chart Tooltip Formatter
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
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-200">
      {/* 1. Executive Hero Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-pulse" />
            <span className="text-xs font-bold text-slate-500">Live Executive Intelligence</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
              Tax Season TY2025 Active
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Documenter Operations Command Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Real-time interactive graphs on lead velocity, calling contact curves, intake conversion funnel, and team workloads.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time Range Pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold">
            {(['TODAY', 'WEEK', 'SEASON'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  timeRange === range
                    ? 'bg-white text-[#16A34A] shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {range === 'TODAY' ? 'Today' : range === 'WEEK' ? 'This Week' : 'TY2025 Season'}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Live</span>
          </Button>

          {stats.unassigned > 0 && (
            <Button
              size="sm"
              onClick={handleAutoRoundRobin}
              disabled={isActionLoading}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs h-9"
            >
              <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
              <span>Auto Split Pool ({stats.unassigned})</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Top 4 High-Impact KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Department Leads</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">432</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                95.3% Assigned
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {stats.unassigned} unassigned • 20 in active calling
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-[#16A34A] h-full rounded-full" style={{ width: '95%' }} />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Outreach Contact Rate</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">79.6%</span>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                328 / 412 Dials
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              Avg Call: <strong className="text-slate-700">3m 48s</strong>
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: '79.6%' }} />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Intake to Tax Prep Rate</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#16A34A] border border-emerald-200 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">43.3%</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                142 in Prep
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Taxpayers onboarding W-2 intake
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-[#16A34A] h-full rounded-full" style={{ width: '43.3%' }} />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">First-Dial Response SLA</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">4.2m</span>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                Target: &lt;10m
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Time from ingestion to 1st call
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: '85%' }} />
          </div>
        </div>
      </div>

      {/* 3. The Visual End-to-End Pipeline Stage Flow Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#16A34A]" />
              Documenter End-to-End Intake Flow & Pipeline Velocity
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Visual stage-by-stage progression from initial bulk CSV import to Sales Pitch Queue handoff.
            </p>
          </div>
          <button
            onClick={() => navigate('/documenter/manager/queue')}
            className="text-xs font-bold text-[#16A34A] hover:text-[#15803D] flex items-center gap-1 cursor-pointer"
          >
            <span>Open Department Queue</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 5-Step Pipeline Horizontal Stepper Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {[
            {
              step: 1,
              title: '1. Ingested Leads',
              count: 432,
              pct: '100%',
              sub: 'Raw Ingestion Pool',
              badge: 'Stage: RAW',
              color: 'slate',
              barColor: 'bg-slate-500',
              active: false,
            },
            {
              step: 2,
              title: '2. Calling Outreach',
              count: 412,
              pct: '95.3%',
              sub: 'Assigned to Agents',
              badge: 'Stage: OUTREACH',
              color: 'blue',
              barColor: 'bg-blue-500',
              active: false,
            },
            {
              step: 3,
              title: '3. Connected Calls',
              count: 328,
              pct: '79.6%',
              sub: 'Contacted Taxpayers',
              badge: '79.6% Rate',
              color: 'purple',
              barColor: 'bg-purple-500',
              active: false,
            },
            {
              step: 4,
              title: '4. W-2 Tax Prep',
              count: 142,
              pct: '43.3%',
              sub: 'Intake Computation',
              badge: 'Stage: PREP',
              color: 'emerald',
              barColor: 'bg-[#16A34A]',
              active: true,
            },
            {
              step: 5,
              title: '5. Moved to Sales',
              count: 108,
              pct: '76.1%',
              sub: 'Ready for Quotation',
              badge: 'Stage: SALES',
              color: 'emerald',
              barColor: 'bg-emerald-600',
              active: false,
            },
          ].map((item) => (
            <div
              key={item.step}
              className={`p-4 rounded-xl border transition-all relative flex flex-col justify-between ${
                item.active
                  ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-slate-50/80 border-slate-200/90 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-xs font-bold text-slate-700 truncate">
                    {item.title}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                      item.active
                        ? 'bg-[#16A34A] text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.pct}
                  </span>
                </div>

                <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight my-1">
                  {item.count}
                </div>
                <div className="text-[11px] text-slate-500 font-medium truncate">
                  {item.sub}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60">
                <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`${item.barColor} h-full rounded-full transition-all`}
                    style={{ width: item.pct }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. REAL RECHARTS GRAPHS & VISUALIZATIONS (Grid Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GRAPH 1: Hourly Calling Outreach Velocity (Dual-Axis Smooth Area Chart) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <AreaChart className="w-4 h-4 text-[#16A34A]" />
                  Hourly Calling Outreach Velocity & Connected Rates (9 AM - 6 PM)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Real-time dial volume vs connected calls curve throughout the business day
                </p>
              </div>
              <span className="text-xs font-bold text-[#16A34A] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Peak: 11 AM & 3 PM
              </span>
            </div>

            {/* Recharts Area Graph */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyCallingData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorConnected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16A34A" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#16A34A" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorDials" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#94A3B8" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="hour" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area
                    type="monotone"
                    dataKey="dials"
                    name="Total Dials"
                    stroke="#94A3B8"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorDials)"
                  />
                  <Area
                    type="monotone"
                    dataKey="connected"
                    name="Connected Calls"
                    stroke="#16A34A"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorConnected)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Optimal Outreach Windows: <strong className="text-slate-800">11:00 AM - 12:00 PM</strong> and <strong className="text-slate-800">3:00 PM - 4:00 PM</strong>
            </span>
            <span className="font-bold text-slate-700">Daily Average: 81.2% Connection</span>
          </div>
        </div>

        {/* GRAPH 2: Visa Category Distribution (Interactive Donut / Pie Chart) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-indigo-600" />
                  Taxpayer Visa Category Mix
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">TY2025 Non-Resident & Resident Profiles</p>
              </div>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                432 Total
              </span>
            </div>

            {/* Recharts Pie Chart */}
            <div className="h-56 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={visaData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {visaData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-slate-900">432</span>
                <span className="text-[10px] text-slate-400 font-bold">Leads</span>
              </div>
            </div>

            {/* Legend List */}
            <div className="space-y-2 pt-1">
              {visaData.map((v) => (
                <div key={v.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: v.color }} />
                    <span className="font-medium text-slate-700">{v.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{v.value}</span>
                    <span className="text-slate-400 font-semibold w-8 text-right">{v.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between font-medium">
            <span>Dominant Filing Profile:</span>
            <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              H-1B Dual Status & 1040
            </span>
          </div>
        </div>
      </div>

      {/* 5. MORE REAL RECHARTS GRAPHS: Weekly Performance Trend & Pod Head-to-Head */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GRAPH 3: Weekly Calling & Intake Conversion Velocity (Line + Bar Chart) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <LineIcon className="w-4 h-4 text-emerald-600" />
                  7-Day Department Outreach Velocity & Contact Rate %
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Weekly trend of volume dialed, calls connected, and conversion velocity
                </p>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                Weekly Total: 1,300 Dials
              </span>
            </div>

            {/* Recharts Bar/Line Chart */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyTrendData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="dials" name="Total Dials" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="connected" name="Connected Calls" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="prep" name="Tax Prep Intakes" fill="#16A34A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
              Weekly Intake Velocity Target: 100% On-Track
            </span>
            <span className="font-bold text-slate-700">Friday Peak: 260 Dials</span>
          </div>
        </div>

        {/* GRAPH 4: Sub-Team Pod Head-to-Head Comparison (Grouped Bar Chart) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                  Pod Alpha vs Pod Beta Head-to-Head
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">Sub-team leadership comparison</p>
              </div>
              <button
                onClick={() => navigate('/documenter/manager/scorecards')}
                className="text-xs font-bold text-[#16A34A] hover:text-[#15803D] flex items-center gap-1 cursor-pointer"
              >
                <span>Scorecards</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Recharts Bar Chart */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={podComparisonData} layout="vertical" margin={{ top: 5, right: 20, left: 35, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis type="number" stroke="#64748B" fontSize={10} />
                  <YAxis dataKey="metric" type="category" stroke="#334155" fontSize={10} fontWeight={600} width={90} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }} />
                  <Bar dataKey="podAlpha" name="Pod Alpha (Ananya I)" fill="#2563EB" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="podBeta" name="Pod Beta (Vikram S)" fill="#9333EA" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between font-medium">
            <span>Leadership Contact Rate:</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Pod Alpha: 86.2% • Pod Beta: 81.5%
            </span>
          </div>
        </div>
      </div>

      {/* 6. Star Calling Agents Leaderboard */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Top Calling Performers Leaderboard
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Calling agents with highest connection velocity and W-2 intake conversions
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/documenter/manager/scorecards')}
            className="text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5 text-slate-500" />
            <span>Manage All 8 Calling Staff</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {topAgents.map((agent, index) => (
            <div 
              key={agent.email} 
              className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/60 hover:bg-white hover:border-[#16A34A]/50 transition-all flex items-center justify-between gap-3 shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                  index === 0 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                  index === 1 ? 'bg-slate-200 text-slate-800 border border-slate-300' :
                  'bg-orange-100 text-orange-800 border border-orange-300'
                }`}>
                  #{index + 1}
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm text-slate-900">{agent.name}</div>
                  <div className="text-[11px] text-slate-500 font-medium">{agent.dials} dials • {agent.connected} connected</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-bold text-[#16A34A]">{agent.conv} in Prep</div>
                <div className="text-[10px] text-slate-400 font-bold">{agent.rate} Rate</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lead Assignment Modal */}
      <LeadAssignmentModal
        isOpen={isAssignModalOpen}
        onClose={handleCloseModals}
        selectedLeads={activeLeadForAssign ? [activeLeadForAssign] : []}
        agents={agents}
        onConfirmDirectAssign={handleDirectAssign}
        onConfirmRoundRobin={handleAutoRoundRobin}
        isLoading={isActionLoading}
      />
    </div>
  );
};
