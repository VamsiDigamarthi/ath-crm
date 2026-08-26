import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calculator, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  RotateCcw,
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

export const TaxSpecialistDashboardScreen: React.FC = () => {
  const navigate = useNavigate();

  // Dual-Role Combined Stats for the Logged-in Specialist (Preparer + Reviewer)
  const stats = {
    prepActiveDrafts: 1,
    prepSubmittedToQA: 0,
    qaPendingAudits: 1,
    qaApprovedToday: 0,
    correctionsPending: 0,
    totalCaseload: 2,
    passRate: 100,
  };

  // Combined Dual-Role Hourly Activity Curve (AreaChart)
  const hourlyData = useMemo(() => [
    { hour: '09:00', prepDrafts: 0, qaAudits: 0 },
    { hour: '11:00', prepDrafts: 1, qaAudits: 0 },
    { hour: '13:00', prepDrafts: 1, qaAudits: 1 },
    { hour: '15:00', prepDrafts: 1, qaAudits: 1 },
    { hour: '17:00', prepDrafts: 1, qaAudits: 1 },
  ], []);

  // Dual-Role Caseload Breakdown (Donut Chart)
  const dualRoleMix = useMemo(() => [
    { name: 'Assigned as Tax Preparer', value: stats.prepActiveDrafts, color: '#3B82F6', pct: 50 },
    { name: 'Assigned as QA Reviewer', value: stats.qaPendingAudits, color: '#8B5CF6', pct: 50 },
  ], [stats.prepActiveDrafts, stats.qaPendingAudits]);

  // Priority Preparer Task (Arjun Varma)
  const priorityPrepTask = {
    id: '3a73c237-e778-45a4-9d57-79171a59cd0e',
    taxpayerName: 'Arjun Varma',
    taxYear: 2025,
    filingStatus: 'Married Filing Jointly (MFJ)',
    complexity: 'STANDARD W-2',
    designatedReviewer: 'Kavita Nair',
    slaDueTime: 'Tomorrow, 05:00 PM',
    status: 'Drafting 1040',
  };

  // Priority QA Audit Task (Arjun Varma)
  const priorityQATask = {
    id: '3a73c237-e778-45a4-9d57-79171a59cd0e',
    taxpayerName: 'Arjun Varma',
    taxYear: 2025,
    filingStatus: 'Married Filing Jointly (MFJ)',
    preparedBy: 'Vikram Deshmukh',
    computedRefund: 5770,
    slaDueTime: 'Tomorrow, 05:00 PM',
    status: 'Pending QA Audit',
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
      {/* 1. Unified Specialist Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Tax Specialist Unified Operations Deck
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Unified workspace monitoring returns assigned to you as <strong>Tax Preparer</strong> (1040 drafting) and as <strong>QA Reviewer</strong> (4-Eyes audit).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/prep-review/preparer')}
            className="border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Open Prep Queue ({stats.prepActiveDrafts})</span>
          </Button>

          <Button
            size="sm"
            onClick={() => navigate('/prep-review/reviewer')}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Open QA Queue ({stats.qaPendingAudits})</span>
          </Button>
        </div>
      </div>

      {/* 2. Top 4 Dual-Role KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Assigned as Preparer */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Assigned as Preparer</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Calculator className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {stats.prepActiveDrafts}
              </span>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                1040 Drafting
              </span>
            </div>
            <div className="text-xs text-blue-600 font-medium mt-1">
              Active Form 1040 calculations
            </div>
          </div>
        </div>

        {/* Card 2: Assigned as QA Reviewer */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Assigned as QA Reviewer</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {stats.qaPendingAudits}
              </span>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                4-Eyes Audit
              </span>
            </div>
            <div className="text-xs text-purple-600 font-medium mt-1">
              Awaiting compliance sign-off
            </div>
          </div>
        </div>

        {/* Card 3: Completed & Transferred to Sales */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Passed QA (MTD)</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center border border-emerald-100">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {stats.qaApprovedToday}
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Ready for Sales
              </span>
            </div>
            <div className="text-xs text-[#16A34A] font-medium mt-1">
              Zero-defect compliance rating
            </div>
          </div>
        </div>

        {/* Card 4: Discrepancies / Revisions */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-rose-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Revisions / Fixes</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {stats.correctionsPending}
              </span>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                0 Discrepancies
              </span>
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1">
              No audit discrepancy rework
            </div>
          </div>
        </div>
      </div>

      {/* 3. Recharts Visualizations: Dual-Role AreaChart & Distribution Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GRAPH 1: Dual-Role Velocity AreaChart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <AreaIcon className="w-4 h-4 text-[#16A34A]" />
                  Combined Preparation vs QA Audit Velocity (09:00 - 17:00)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Returns in 1040 Drafting (as Preparer) vs Returns Audited (as QA Reviewer)
                </p>
              </div>
              <span className="text-xs font-bold text-[#16A34A] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Active Caseload: {stats.totalCaseload} Returns
              </span>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="hour" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area
                    type="monotone"
                    dataKey="prepDrafts"
                    name="1040 Drafting (as Preparer)"
                    stroke="#3B82F6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#prepGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="qaAudits"
                    name="4-Eyes Audit (as Reviewer)"
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

        {/* GRAPH 2: Dual-Role Caseload Mix (Donut Chart) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-purple-600" />
                  Dual-Role Caseload Allocation
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Distribution between Preparer and Reviewer duties
                </p>
              </div>
            </div>

            <div className="h-48 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dualRoleMix}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={68}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {dualRoleMix.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-slate-900">{stats.totalCaseload}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Assigned</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
              {dualRoleMix.map((c) => (
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

      {/* 4. Side-by-Side Priority Action Panels (Preparer Priority vs Reviewer Priority) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PANEL 1: Priority Preparer Task */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
              <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                <Calculator className="w-3.5 h-3.5" />
              </div>
              <span>My Priority 1040 Drafting Task</span>
            </div>
            <button
              onClick={() => navigate('/prep-review/preparer')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View Prep Queue</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/30 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <span>{priorityPrepTask.taxpayerName}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white text-slate-700 border border-slate-200">
                    TY {priorityPrepTask.taxYear}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">
                  {priorityPrepTask.filingStatus} • QA: {priorityPrepTask.designatedReviewer}
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                {priorityPrepTask.status}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-blue-100/80">
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-semibold text-slate-700">{priorityPrepTask.slaDueTime}</span>
              </div>

              <Button
                size="sm"
                onClick={() => navigate(`/prep-review/preparer/workspace/${priorityPrepTask.id}`)}
                className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold px-3.5 h-8 flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Open 1040 Workspace</span>
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* PANEL 2: Priority QA Audit Task */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
              <div className="w-6 h-6 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span>My Priority QA Compliance Audit</span>
            </div>
            <button
              onClick={() => navigate('/prep-review/reviewer')}
              className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View Audit Queue</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/30 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <span>{priorityQATask.taxpayerName}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white text-slate-700 border border-slate-200">
                    TY {priorityQATask.taxYear}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    +${priorityQATask.computedRefund.toLocaleString()} Fed Refund
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">
                  Drafted by: <strong>{priorityQATask.preparedBy}</strong> • {priorityQATask.filingStatus}
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                {priorityQATask.status}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-purple-100/80">
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-semibold text-slate-700">{priorityQATask.slaDueTime}</span>
              </div>

              <Button
                size="sm"
                onClick={() => navigate(`/prep-review/reviewer/audit/${priorityQATask.id}`)}
                className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold px-3.5 h-8 flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Start Compliance Audit</span>
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
