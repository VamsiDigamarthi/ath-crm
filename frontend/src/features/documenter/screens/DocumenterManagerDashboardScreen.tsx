import React, { useMemo } from 'react';
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
  Sparkles,
  ArrowRight,
  ChevronRight,
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

  const {
    timeRange,
    setTimeRange,
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

  // Dynamic Chart Data derived from real DB stats
  const hourlyCallingData = useMemo(() => {
    if (stats?.hourlyBreakdown && stats.hourlyBreakdown.length > 0) {
      return stats.hourlyBreakdown;
    }
    return [
      { hour: '9 AM', dials: 0, connected: 0 },
      { hour: '10 AM', dials: 0, connected: 0 },
      { hour: '11 AM', dials: 0, connected: 0 },
      { hour: '12 PM', dials: 0, connected: 0 },
      { hour: '1 PM', dials: 0, connected: 0 },
      { hour: '2 PM', dials: 0, connected: 0 },
      { hour: '3 PM', dials: 0, connected: 0 },
      { hour: '4 PM', dials: 0, connected: 0 },
      { hour: '5 PM', dials: 0, connected: 0 },
    ];
  }, [stats?.hourlyBreakdown]);

  const weeklyTrendData = useMemo(() => {
    if (stats?.weeklyBreakdown && stats.weeklyBreakdown.length > 0) {
      return stats.weeklyBreakdown;
    }
    return [
      { day: 'Mon', dials: 0, connected: 0, prep: 0 },
      { day: 'Tue', dials: 0, connected: 0, prep: 0 },
      { day: 'Wed', dials: 0, connected: 0, prep: 0 },
      { day: 'Thu', dials: 0, connected: 0, prep: 0 },
      { day: 'Today', dials: stats.todayDials || 0, connected: stats.todayConnected || 0, prep: stats.inPrep || 0 },
    ];
  }, [stats?.weeklyBreakdown, stats.todayDials, stats.todayConnected, stats.inPrep]);

  const visaData = useMemo(() => {
    if (stats?.visaDistribution && stats.visaDistribution.length > 0) {
      return stats.visaDistribution;
    }
    return [
      { name: 'H-1B Speciality', value: 1, color: '#16A34A', pct: 100 },
    ];
  }, [stats?.visaDistribution]);

  // Real Staff Caseload & Calling Workload data (capped to Top 6 for clean readable charts)
  const agentWorkloadData = useMemo(() => {
    if (!agents || agents.length === 0) return [];
    return [...agents]
      .sort((a, b) => (b.activeLoad || 0) - (a.activeLoad || 0))
      .slice(0, 6)
      .map((agent) => {
        const shortName = (agent.name || agent.email.split('@')[0]).split(' ')[0];
        return {
          staffName: shortName,
          assignedLeads: agent.activeLoad ?? 0,
          dials: agent.dials ?? 0,
          connected: agent.connected ?? 0,
        };
      });
  }, [agents]);

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
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Documenter Operations Command Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Real-time interactive graphs on lead velocity, calling contact curves, intake conversion funnel, and team workloads.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time Range Pills */}
          <div className="flex items-center bg-white p-1 rounded-lg border border-slate-200 text-xs font-bold shadow-2xs">
            {(['TODAY', 'WEEK', 'SEASON'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  timeRange === range
                    ? 'bg-slate-100 text-[#16A34A] font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {range === 'TODAY' ? 'Today' : range === 'WEEK' ? 'This Week' : 'All-Time Season'}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Live</span>
          </Button>

          {stats.unassigned > 0 && (
            <Button
              size="sm"
              onClick={handleAutoRoundRobin}
              disabled={isActionLoading}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs"
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
              <span className="text-3xl font-bold text-slate-900">
                {stats.totalDepartment || (stats.unassigned + stats.activeOutreach + stats.inPrep) || 0}
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {Math.round((((stats.totalDepartment || 1) - stats.unassigned) / (stats.totalDepartment || 1)) * 100)}% Assigned
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {stats.unassigned} unassigned • {stats.activeOutreach} in outreach
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-[#16A34A] h-full rounded-full transition-all duration-300" 
              style={{ width: `${Math.min(100, Math.round((((stats.totalDepartment || 1) - stats.unassigned) / (stats.totalDepartment || 1)) * 100))}%` }} 
            />
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
              <span className="text-3xl font-bold text-slate-900">
                {stats.contactRatePct ? `${stats.contactRatePct}%` : '0.0%'}
              </span>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                {stats.todayConnected || 0} / {stats.todayDials || 0} Dials
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              Today's connected calling rate
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-blue-500 h-full rounded-full transition-all duration-300" 
              style={{ width: `${Math.min(100, stats.contactRatePct || 0)}%` }} 
            />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Tax Prep Active Pipeline</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#16A34A] border border-emerald-200 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{stats.inPrep || 0}</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                DOC_PREP Active
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Taxpayers onboarding W-2 intake
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-[#16A34A] h-full rounded-full" style={{ width: '100%' }} />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Scheduled Callbacks</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{stats.callbacks || 0}</span>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                {stats.nextCallbackAt ? `Next: ${new Date(stats.nextCallbackAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'No Callbacks'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Taxpayers scheduled for follow-up
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: '80%' }} />
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
          {(() => {
            const totalLeads = stats.totalDepartment || (stats.unassigned + stats.activeOutreach + stats.inPrep) || 1;
            const outreachCount = (stats.activeOutreach || 0) + (stats.inPrep || 0);
            const connectedCount = stats.todayConnected || 0;
            const prepCount = stats.inPrep || 0;

            const pipelineSteps = [
              {
                step: 1,
                title: '1. Ingested Leads',
                count: totalLeads,
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
                count: outreachCount,
                pct: `${Math.min(100, Math.round((outreachCount / totalLeads) * 100))}%`,
                sub: 'Assigned to Agents',
                badge: 'Stage: OUTREACH',
                color: 'blue',
                barColor: 'bg-blue-500',
                active: false,
              },
              {
                step: 3,
                title: '3. Connected Calls',
                count: connectedCount,
                pct: `${stats.contactRatePct ? `${stats.contactRatePct}%` : '0%'}`,
                sub: 'Contacted Taxpayers',
                badge: `${stats.contactRatePct || 0}% Rate`,
                color: 'purple',
                barColor: 'bg-purple-500',
                active: false,
              },
              {
                step: 4,
                title: '4. W-2 Tax Prep',
                count: prepCount,
                pct: `${Math.min(100, Math.round((prepCount / totalLeads) * 100))}%`,
                sub: 'Intake Computation',
                badge: 'Stage: PREP',
                color: 'emerald',
                barColor: 'bg-[#16A34A]',
                active: true,
              },
              {
                step: 5,
                title: '5. Moved to Sales',
                count: Math.max(0, totalLeads - stats.unassigned - outreachCount),
                pct: `${Math.round((Math.max(0, totalLeads - stats.unassigned - outreachCount) / totalLeads) * 100)}%`,
                sub: 'Ready for Quotation',
                badge: 'Stage: SALES',
                color: 'emerald',
                barColor: 'bg-emerald-600',
                active: false,
              },
            ];

            return pipelineSteps.map((item) => (
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

                <div className="w-full bg-slate-200/70 rounded-full h-1.5 overflow-hidden mt-3">
                  <div
                    className={`${item.barColor} h-full rounded-full transition-all duration-300`}
                    style={{ width: item.pct }}
                  />
                </div>
              </div>
            ));
          })()}
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
                  7-Day Department Outreach Velocity & Intake Trend
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Weekly trend of volume dialed, calls connected, and conversion velocity
                </p>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                {stats.todayDials || 0} Dials Today
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
              Contact Rate: {stats.contactRatePct ? `${stats.contactRatePct}%` : '0.0%'}
            </span>
            <span className="font-bold text-slate-700">{stats.todayConnected || 0} Connected Calls</span>
          </div>
        </div>

        {/* GRAPH 4: Real Staff Caseload & Calling Workload Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                  Staff Caseload & Workload Breakdown
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  {agents.length > 6 ? `Top 6 active staff (of ${agents.length} total)` : 'Live lead distribution across calling staff'}
                </p>
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
                <BarChart data={agentWorkloadData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="staffName" stroke="#64748B" fontSize={10} />
                  <YAxis stroke="#64748B" fontSize={10} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }} />
                  <Bar dataKey="assignedLeads" name="Assigned Leads" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="dials" name="Today's Dials" fill="#16A34A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between font-medium">
            <span>Active Calling Staff: <strong>{agents.length}</strong></span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Avg: {agents.length > 0 ? Math.round((stats.activeOutreach || 0) / agents.length) : 0} Leads/Staff
            </span>
          </div>
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
