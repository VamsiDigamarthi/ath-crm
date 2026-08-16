import React, { useMemo } from 'react';
import { useDocumenterWorkspace } from '../hooks/useDocumenterWorkspace';
import { Button } from '@/shared/components/Button';
import { 
  PhoneCall, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  PhoneForwarded,
  FileCheck2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

export const DocumenterAgentDashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const { leads, stats, handleOpenCallModal } = useDocumenterWorkspace();

  // Agent's Personal Performance Metrics
  const agentMetrics = {
    todayDials: 24,
    dailyTarget: 35,
    connectedCalls: 20,
    contactRatePct: 83.3,
    conversionsToday: 6,
    conversionRatePct: 30.0,
    callbacksDueToday: 3,
    avgCallDuration: '3m 42s',
  };

  // Agent Hourly Calling Curve
  const agentHourlyData = [
    { hour: '9 AM', dials: 3, connected: 2 },
    { hour: '10 AM', dials: 5, connected: 4 },
    { hour: '11 AM', dials: 7, connected: 6 }, // Peak
    { hour: '12 PM', dials: 4, connected: 3 },
    { hour: '1 PM', dials: 1, connected: 1 },
    { hour: '2 PM', dials: 4, connected: 4 },
    { hour: '3 PM', dials: 6, connected: 5 },
    { hour: '4 PM', dials: 4, connected: 3 },
  ];

  // Agent Weekly Activity Trend
  const agentWeeklyData = [
    { day: 'Mon', dials: 32, connected: 26, prep: 8 },
    { day: 'Tue', dials: 36, connected: 30, prep: 9 },
    { day: 'Wed', dials: 38, connected: 32, prep: 11 },
    { day: 'Thu', dials: 34, connected: 28, prep: 8 },
    { day: 'Fri', dials: 40, connected: 34, prep: 14 },
  ];

  // Up Next High-Priority Callbacks
  const urgentCallbacks = useMemo(() => [
    {
      id: 'cb-1',
      name: 'Vikram Sharma',
      phone: '+1 (555) 234-8910',
      time: 'In 15 mins (02:30 PM)',
      visa: 'H-1B',
      status: 'URGENT',
      notes: 'Wants to know about dual-status deductions and spouse ITIN',
    },
    {
      id: 'cb-2',
      name: 'Pooja Hegde',
      phone: '+1 (555) 876-1204',
      time: 'Today 04:00 PM',
      visa: 'F-1 OPT',
      status: 'SCHEDULED',
      notes: 'Available after office hours to review Form 8843',
    },
    {
      id: 'cb-3',
      name: 'Ramesh Patel',
      phone: '+1 (555) 456-7890',
      time: 'Today 05:15 PM',
      visa: 'L-1',
      status: 'SCHEDULED',
      notes: 'Has foreign rental income in India, needs FBAR review',
    },
  ], []);

  // Quick Queue Snapshot (Next leads to call)
  const nextLeadsToCall = useMemo(() => {
    return leads.slice(0, 4);
  }, [leads]);

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
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            My Daily Calling & Outreach Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Review your daily dial quotas, scheduled callback appointments, and active W-2 client intakes.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            onClick={() => navigate('/documenter/agent/queue')}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Launch Calling Queue</span>
          </Button>
        </div>
      </div>

      {/* 2. Agent Personal KPI Scorecard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Dials Target */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Today's Outreach Dials</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{agentMetrics.todayDials}</span>
              <span className="text-xs text-slate-500 font-semibold">/ {agentMetrics.dailyTarget} Target</span>
            </div>
            <p className="text-xs text-blue-600 mt-1 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              68.5% Quota Completed
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: '68.5%' }} />
          </div>
        </div>

        {/* Card 2: Contact Connectivity Rate */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Contact Rate</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#16A34A] border border-emerald-200 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{agentMetrics.contactRatePct}%</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {agentMetrics.connectedCalls} Connected
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              Avg: <strong className="text-slate-700">{agentMetrics.avgCallDuration}</strong>
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-[#16A34A] h-full rounded-full" style={{ width: '83.3%' }} />
          </div>
        </div>

        {/* Card 3: Tax Prep Conversions */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Transferred to Tax Prep</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center font-bold">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{agentMetrics.conversionsToday}</span>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                {agentMetrics.conversionRatePct}% Conv
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Agreed to start W-2 intake
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-purple-600 h-full rounded-full" style={{ width: '60%' }} />
          </div>
        </div>

        {/* Card 4: Scheduled Callbacks */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Callbacks Pending</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold">
              <PhoneForwarded className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{agentMetrics.callbacksDueToday}</span>
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Due Today
              </span>
            </div>
            <p className="text-xs text-amber-700 mt-1 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-amber-500" />
              1 urgent callback in 15 mins
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: '75%' }} />
          </div>
        </div>
      </div>

      {/* 3. Real Recharts Graphs: Hourly Dials vs Weekly Trend */}
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
                <p className="text-xs text-slate-500 font-medium">Hourly dials vs successfully connected taxpayers</p>
              </div>
              <span className="text-xs font-bold text-[#16A34A] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Peak: 11 AM
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={agentHourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="agentConn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16A34A" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#16A34A" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="hour" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} />
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
            <span>Total Logged Today: <strong>24 Calls</strong></span>
            <span className="text-[#16A34A] font-bold">83.3% Connection Rate</span>
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
                <p className="text-xs text-slate-500 font-medium">5-day daily dials, connections, and W-2 prep starts</p>
              </div>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                50 Preps This Week
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agentWeeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="dials" name="Dials" fill="#CBD5E1" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="connected" name="Connected" fill="#3B82F6" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="prep" name="Tax Prep Intakes" fill="#16A34A" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between font-medium">
            <span>Weekly Record: <strong>Friday (14 Preps)</strong></span>
            <span className="text-purple-700 font-bold">High Velocity</span>
          </div>
        </div>
      </div>

      {/* 4. Scheduled Callbacks & Next Up Calling Queue (2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Scheduled Callbacks Action List */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Upcoming Callbacks Due Today
                </h3>
                <p className="text-xs text-slate-500 font-medium">Appointments with interested taxpayers</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/documenter/agent/callbacks')}
                className="text-xs font-semibold text-slate-700 border-slate-200 hover:bg-slate-50"
              >
                <span>View All ({stats.callbacks || 3})</span>
              </Button>
            </div>

            <div className="space-y-3">
              {urgentCallbacks.map((cb) => (
                <div 
                  key={cb.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                    cb.status === 'URGENT' 
                      ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-400/30' 
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-slate-900">{cb.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {cb.visa}
                      </span>
                      {cb.status === 'URGENT' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 animate-pulse">
                          Urgent
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-600 font-semibold">{cb.phone}</div>
                    <div className="text-[11px] text-slate-500 italic">"{cb.notes}"</div>
                  </div>

                  <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                    <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-600" />
                      {cb.time}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleOpenCallModal(leads[0])}
                      className="h-7 px-3 rounded-lg text-xs font-bold bg-[#16A34A] hover:bg-[#15803D] text-white flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>Call Now</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium flex items-center justify-between">
            <span>Next Callback in: <strong className="text-rose-600 font-bold">15 minutes</strong></span>
            <span className="text-[#16A34A] font-bold">SLA: On-Time</span>
          </div>
        </div>

        {/* Column 2: Next Assigned Leads to Call (Quick Queue) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <PhoneForwarded className="w-4 h-4 text-emerald-600" />
                  Next Leads in My Calling Queue
                </h3>
                <p className="text-xs text-slate-500 font-medium">Assigned prospects awaiting first outreach call</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/documenter/agent/queue')}
                className="text-xs font-semibold text-slate-700 border-slate-200 hover:bg-slate-50"
              >
                <span>Full Queue (20)</span>
              </Button>
            </div>

            <div className="space-y-3">
              {nextLeadsToCall.map((lead) => (
                <div 
                  key={lead.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-[#16A34A]/50 transition-all flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-slate-900">
                        {lead.customer?.fullName || `${lead.customer?.firstName} ${lead.customer?.lastName}`}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {lead.customer?.visaType || 'H-1B'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 font-medium">
                      {lead.customer?.phone} • {lead.customer?.state || 'CA'}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleOpenCallModal(lead)}
                    className="h-8 px-3 rounded-lg text-xs font-bold bg-[#16A34A] hover:bg-[#15803D] text-white flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Dial</span>
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <Button
              size="sm"
              variant="outline"
              fullWidth
              onClick={() => navigate('/documenter/agent/queue')}
              className="text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5"
            >
              <span>View All 20 Assigned Leads</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
