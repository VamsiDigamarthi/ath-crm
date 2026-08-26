import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calculator, 
  Clock, 
  ShieldCheck, 
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

export const TaxPreparerDashboardScreen: React.FC = () => {
  const navigate = useNavigate();

  // Representative preparer stats
  const stats = {
    activeDrafts: 1,
    submittedToQA: 0,
    correctionsCount: 0,
    passedQAMTD: 0,
    firstTimeAccuracy: 100,
    avgDraftHours: 1.8,
  };

  // Hourly Preparation Velocity (AreaChart)
  const hourlyData = useMemo(() => [
    { hour: '09:00', drafts: 0, completed: 0 },
    { hour: '11:00', drafts: 1, completed: 0 },
    { hour: '13:00', drafts: 1, completed: 0 },
    { hour: '15:00', drafts: 1, completed: 0 },
    { hour: '17:00', drafts: 1, completed: 0 },
  ], []);

  // Return Complexity Distribution (Donut Chart)
  const complexityMix = useMemo(() => [
    { name: 'Standard W-2', value: 1, color: '#16A34A', pct: 100 },
    { name: '1099-B Stock Gains', value: 0, color: '#F59E0B', pct: 0 },
    { name: 'Foreign FBAR & NRE', value: 0, color: '#8B5CF6', pct: 0 },
    { name: 'Schedule C Business', value: 0, color: '#0EA5E9', pct: 0 },
  ], []);

  // Priority queue item
  const priorityReturn = {
    id: '3a73c237-e778-45a4-9d57-79171a59cd0e',
    taxpayerName: 'Arjun Varma',
    email: 'arjun.varma@gmail.com',
    taxYear: 2025,
    filingStatus: 'Married Filing Jointly (MFJ)',
    visaType: 'H-1B Specialty Occupation',
    location: 'Springfield, IL',
    complexity: 'STANDARD W-2',
    verifiedDocsCount: 3,
    assignedReviewer: 'Kavita Nair',
    slaDueTime: 'Tomorrow, 05:00 PM',
    stageLabel: 'Drafting 1040',
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
            My 1040 Tax Preparation Operations Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Monitor your daily 1040 drafting velocity, standard/itemized deduction calculations, and QA compliance submissions.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            onClick={() => navigate('/prep-review/preparer/queue')}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Launch Prep Queue</span>
          </Button>
        </div>
      </div>

      {/* 2. Top 4 KPI Scorecard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active 1040 Drafts */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active 1040 Caseload</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Calculator className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {stats.activeDrafts}
            </div>
            <div className="text-xs text-blue-600 font-medium mt-1">
              Active in your personal drafting queue
            </div>
          </div>
        </div>

        {/* Card 2: Submitted for QA Review */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">In QA Audit Review</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {stats.submittedToQA}
            </div>
            <div className="text-xs text-purple-600 font-medium mt-1">
              Awaiting Senior Auditor Sign-Off
            </div>
          </div>
        </div>

        {/* Card 3: Discrepancies & Fixes */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-rose-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Corrections Requested</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {stats.correctionsCount}
            </div>
            <div className="text-xs text-emerald-600 font-medium mt-1">
              0 Discrepancy rework items
            </div>
          </div>
        </div>

        {/* Card 4: First-Time Pass Rate */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">First-Time Pass Rate</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center border border-emerald-100">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {stats.firstTimeAccuracy}%
            </div>
            <div className="text-xs text-[#16A34A] font-medium mt-1">
              Top quality compliance accuracy
            </div>
          </div>
        </div>
      </div>

      {/* 3. Recharts Performance Graphs (AreaChart & Donut Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GRAPH 1: Hourly Drafting Velocity (AreaChart) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <AreaIcon className="w-4 h-4 text-[#16A34A]" />
                  Today's 1040 Drafting Velocity Curve (09:00 - 17:00)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Tax returns drafted and submitted for QA audit throughout the shift
                </p>
              </div>
              <span className="text-xs font-bold text-[#16A34A] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Avg Velocity: 1.8h / return
              </span>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="draftGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="hour" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area
                    type="monotone"
                    dataKey="drafts"
                    name="1040 Returns in Progress"
                    stroke="#3B82F6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#draftGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* GRAPH 2: Complexity & Filing Mix (Donut Chart) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-purple-600" />
                  My Caseload Complexity Mix
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Tax return categorization by form complexity
                </p>
              </div>
            </div>

            <div className="h-48 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={complexityMix}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={68}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {complexityMix.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-slate-900">{stats.activeDrafts}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Return</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
              {complexityMix.map((c) => (
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

      {/* 4. Priority Active Return & Quick Launch Deck */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#16A34A]" />
              Priority Assigned Return in Computation
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Tax returns awaiting Form 1040 completion and submission to QA auditor.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/prep-review/preparer/queue')}
            className="text-xs font-bold text-[#16A34A] border-emerald-200 bg-emerald-50 hover:bg-emerald-100 cursor-pointer"
          >
            View Full Queue ({stats.activeDrafts})
          </Button>
        </div>

        {/* Priority Item Card */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 text-blue-800 font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
              {priorityReturn.taxpayerName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">{priorityReturn.taxpayerName}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                  TY {priorityReturn.taxYear}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {priorityReturn.verifiedDocsCount} Docs Verified
                </span>
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                {priorityReturn.email} • {priorityReturn.filingStatus} • QA: {priorityReturn.assignedReviewer}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-800 flex items-center justify-end gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>{priorityReturn.slaDueTime}</span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium">Standard 24h SLA</div>
            </div>

            <Button
              size="sm"
              onClick={() => navigate(`/prep-review/preparer/workspace/${priorityReturn.id}`)}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold px-4 h-9 flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Open 1040 Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
