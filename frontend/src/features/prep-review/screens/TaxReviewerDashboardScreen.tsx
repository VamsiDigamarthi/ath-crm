import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  RotateCcw,
  Sparkles,
  PieChart as PieIcon,
  AreaChart as AreaIcon
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
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
  Tooltip,
  Legend,
} from 'recharts';

export const TaxReviewerDashboardScreen: React.FC = () => {
  const navigate = useNavigate();

  // Representative QA stats
  const stats = {
    pendingAudits: 1,
    approvedMTD: 0,
    revisionsSent: 0,
    firstTimePassRate: 100,
    avgAuditMinutes: 24,
  };

  // Hourly QA Audit Velocity (AreaChart)
  const hourlyData = useMemo(() => [
    { hour: '09:00', audits: 0, approved: 0 },
    { hour: '11:00', audits: 1, approved: 0 },
    { hour: '13:00', audits: 1, approved: 0 },
    { hour: '15:00', audits: 1, approved: 0 },
    { hour: '17:00', audits: 1, approved: 0 },
  ], []);

  // Compliance Verification Pass/Fail Distribution
  const complianceMix = useMemo(() => [
    { name: 'W-2 Withholding Verified', value: 1, color: '#16A34A', pct: 100 },
    { name: '1099-B Capital Gains Verified', value: 0, color: '#F59E0B', pct: 0 },
    { name: 'State Apportionment Verified', value: 0, color: '#8B5CF6', pct: 0 },
    { name: 'Foreign Asset Reporting', value: 0, color: '#0EA5E9', pct: 0 },
  ], []);

  // Priority Audit Item
  const priorityAudit = {
    id: '3a73c237-e778-45a4-9d57-79171a59cd0e',
    taxpayerName: 'Arjun Varma',
    email: 'arjun.varma@gmail.com',
    taxYear: 2025,
    filingStatus: 'Married Filing Jointly (MFJ)',
    preparedBy: 'Vikram Deshmukh',
    computedRefund: 5770,
    stateRefund: 840,
    grossIncome: 130350,
    slaDueTime: 'Tomorrow, 05:00 PM',
  };

  // Custom Chart Tooltip
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
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      {/* 1. Header & Launch Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Senior QA &amp; 4-Eyes Compliance Audit Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Review 1040 drafts submitted by Preparers, audit calculation accuracy, and stamp returns for Sales Quotation.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            onClick={() => navigate('/prep-review/reviewer/queue')}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Launch Audit Queue</span>
          </Button>
        </div>
      </div>

      {/* 2. Top 4 KPI Scorecard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pending 4-Eyes Audit */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending 4-Eyes Audit</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {stats.pendingAudits}
            </div>
            <div className="text-xs text-purple-600 font-medium mt-1">
              Awaiting your compliance verification
            </div>
          </div>
        </div>

        {/* Card 2: Passed QA (Signed Off) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Passed QA (Signed Off)</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center border border-emerald-100">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {stats.approvedMTD}
            </div>
            <div className="text-xs text-emerald-600 font-medium mt-1">
              Transferred to Sales pitch queue
            </div>
          </div>
        </div>

        {/* Card 3: Revisions Dispatched */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-rose-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Sent for Revision</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {stats.revisionsSent}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1">
              0 Discrepancy returns flagged
            </div>
          </div>
        </div>

        {/* Card 4: First-Time Pass Rate */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">First-Time Pass Rate</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {stats.firstTimePassRate}%
            </div>
            <div className="text-xs text-blue-600 font-medium mt-1">
              Zero-defect department audit rating
            </div>
          </div>
        </div>
      </div>

      {/* 3. Recharts Performance Graphs (AreaChart & Donut Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GRAPH 1: Hourly QA Audit Velocity (AreaChart) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <AreaIcon className="w-4 h-4 text-purple-600" />
                  Today's QA Sign-Off &amp; Audit Velocity Curve
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Tax returns audited vs compliance sign-offs approved throughout the shift
                </p>
              </div>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                Avg Audit Time: 24 mins
              </span>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="qaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="hour" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area
                    type="monotone"
                    dataKey="audits"
                    name="Returns Awaiting Audit"
                    stroke="#8B5CF6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#qaGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* GRAPH 2: Compliance Verification Mix (Donut Chart) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-[#16A34A]" />
                  Compliance Verification Mix
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Audited items categorized by protocol
                </p>
              </div>
            </div>

            <div className="h-48 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={complianceMix}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={68}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {complianceMix.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-slate-900">{stats.pendingAudits}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Audits</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
              {complianceMix.map((c) => (
                <div key={c.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                    <span className="text-slate-600 font-medium truncate max-w-[170px]">{c.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{c.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Priority Pending Audit Return & Quick Launch Deck */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              Priority Return Awaiting Compliance Audit
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Tax returns submitted by Preparers requiring 4-Eyes compliance check before Sales handoff.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/prep-review/reviewer/queue')}
            className="text-xs font-bold text-purple-700 border-purple-200 bg-purple-50 hover:bg-purple-100 cursor-pointer"
          >
            View Full Queue ({stats.pendingAudits})
          </Button>
        </div>

        {/* Priority Item Card */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-200 text-purple-800 font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
              {priorityAudit.taxpayerName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">{priorityAudit.taxpayerName}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                  TY {priorityAudit.taxYear}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  +${priorityAudit.computedRefund.toLocaleString()} Fed Refund
                </span>
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                {priorityAudit.email} • {priorityAudit.filingStatus} • Drafted by: <strong>{priorityAudit.preparedBy}</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-800 flex items-center justify-end gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>{priorityAudit.slaDueTime}</span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium">Standard 24h SLA</div>
            </div>

            <Button
              size="sm"
              onClick={() => navigate(`/prep-review/reviewer/audit/${priorityAudit.id}`)}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold px-4 h-9 flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Start Compliance Audit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
