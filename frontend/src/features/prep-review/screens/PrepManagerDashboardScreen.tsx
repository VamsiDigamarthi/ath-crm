import React, { useState, useMemo } from 'react';
import { usePrepReviewManager } from '../hooks/usePrepReviewManager';
import { PrepAssignLeadDrawer } from '../components/manager/PrepAssignLeadDrawer';
import { PrepAutoDistributeModal } from '../components/manager/PrepAutoDistributeModal';
import { Button } from '@/shared/components/Button';
import {
  Calculator,
  Sparkles,
  Users,
  CheckCircle2,
  RefreshCw,
  Zap,
  Clock,
  Calendar,
  ShieldCheck,
  RotateCcw,
  ChevronRight,
  PieChart as PieIcon,
  BarChart3
} from 'lucide-react';
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
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const PrepManagerDashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const [chartMode, setChartMode] = useState<'HOURLY' | 'WEEKLY'>('HOURLY');

  const {
    timeRange,
    setTimeRange,
    stats,
    staff,
    leads,
    isLoading,
    refreshData,
    assignModalLeads,
    setAssignModalLeads,
    isAutoDistributeOpen,
    setIsAutoDistributeOpen,
    handleAssignSuccess,
    handleAutoDistributeSuccess,
  } = usePrepReviewManager();

  const totalInPipeline = stats.totalInPipeline || leads.length;
  const unassignedToPrep = stats.unassignedToPrep || leads.filter((l) => l.currentStage === 'DOC_PREP_COMPLETE').length;
  const underPreparation = stats.underPreparation || leads.filter((l) => l.currentStage === 'PREP_IN_PROGRESS').length;
  const inQualityReview = stats.inQualityReview || leads.filter((l) => l.currentStage === 'QA_IN_REVIEW').length;
  const revisionsPending = stats.revisionsPending || leads.filter((l) => l.currentStage === 'QA_REVISION_REQUESTED').length;
  const readyForSales = stats.readyForSales || leads.filter((l) => l.currentStage === 'QA_APPROVED').length;

  const allocatedPercent = totalInPipeline > 0
    ? Math.round(((totalInPipeline - unassignedToPrep) / totalInPipeline) * 100)
    : 0;

  // 1. Chart Data: Hourly & Weekly Tax Return Preparation Velocity
  const hourlyPrepData = useMemo(() => {
    if (stats.hourlyVelocity && stats.hourlyVelocity.length > 0) {
      return stats.hourlyVelocity;
    }
    const currentH = new Date().getHours();
    const defaultHours = [];
    for (let h = 8; h <= Math.min(23, Math.max(18, currentH)); h++) {
      defaultHours.push(`${h.toString().padStart(2, '0')}:00`);
    }
    return defaultHours.map((h) => ({
      hour: h,
      prepared: 0,
      reviewed: 0,
    }));
  }, [stats.hourlyVelocity]);

  const weeklyPrepData = useMemo(() => {
    if (stats.weeklyVelocity && stats.weeklyVelocity.length > 0) {
      return stats.weeklyVelocity;
    }
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return dayNames.map((d) => ({
      day: d,
      prepared: 0,
      reviewed: 0,
    }));
  }, [stats.weeklyVelocity]);

  const peakText = useMemo(() => {
    const dataToEval = chartMode === 'HOURLY' ? hourlyPrepData : weeklyPrepData;
    if (!dataToEval || dataToEval.length === 0) return 'Peak: Active Shift';
    const highest = [...dataToEval].sort((a: any, b: any) => ((b.prepared || 0) + (b.reviewed || 0)) - ((a.prepared || 0) + (a.reviewed || 0)))[0] as any;
    if (highest && ((highest.prepared || 0) > 0 || (highest.reviewed || 0) > 0)) {
      return `Peak: ${chartMode === 'HOURLY' ? highest.hour : highest.day}`;
    }
    return 'Live Flow Active';
  }, [hourlyPrepData, weeklyPrepData, chartMode]);

  // 2. Chart Data: Return Complexity Distribution (Donut Chart)
  const complexityData = useMemo(() => {
    if (stats.complexityMix && stats.complexityMix.length > 0) {
      return stats.complexityMix;
    }
    const std = leads.filter((l) => l.complexity === 'STANDARD').length;
    const inv = leads.filter((l) => l.complexity === 'INVESTMENTS_1099B').length;
    const fbar = leads.filter((l) => l.complexity === 'FOREIGN_FBAR').length;
    const schC = leads.filter((l) => l.complexity === 'BUSINESS_SCH_C').length;
    const tot = totalInPipeline || 1;

    return [
      { name: 'Standard W-2', value: std, color: '#16A34A', pct: Math.round((std / tot) * 100) },
      { name: '1099-B Stock Capital Gains', value: inv, color: '#F59E0B', pct: Math.round((inv / tot) * 100) },
      { name: 'Foreign FBAR & Indian Income', value: fbar, color: '#8B5CF6', pct: Math.round((fbar / tot) * 100) },
      { name: 'Schedule C Self-Employed', value: schC, color: '#0EA5E9', pct: Math.round((schC / tot) * 100) },
    ];
  }, [stats.complexityMix, leads, totalInPipeline]);

  // 3. Chart Data: Staff Caseload vs Dual-Role Breakdown (Bar Chart)
  const staffLoadChartData = useMemo(() => {
    return staff
      .filter((s) => s.role !== 'PREP_MANAGER')
      .map((s) => ({
        staffName: s.name.split(' ')[0] || s.email.split('@')[0],
        preparerLoad: Number(s.prepActiveCount) || 0,
        reviewerLoad: Number(s.reviewActiveCount) || 0,
        totalActive: Number(s.activeCaseload) || 0,
      }));
  }, [staff]);

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
    <div className="w-full space-y-6 pb-12 font-sans animate-in fade-in duration-200">
      {/* 1. Header & Time Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Tax Prep &amp; Review Operations Command Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Real-time interactive command deck for Form 1040 computation velocity, 4-Eyes QA audits, and staff load balancing.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap lg:flex-nowrap">
          {/* Time Range Pills */}
          <div className="flex items-center bg-white p-1 rounded-lg border border-slate-200 text-xs font-bold shadow-2xs">
            {(['TODAY', 'WEEK', 'SEASON'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${timeRange === range
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
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Live</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAutoDistributeOpen(true)}
            className="border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-[#16A34A] text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer whitespace-nowrap"
          >
            <Zap className="w-3.5 h-3.5 fill-current text-amber-500" />
            <span>Auto Split Pool ({unassignedToPrep})</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              const unassigned = leads.filter((l) => !l.assignedPreparer || l.currentStage === 'DOC_PREP_COMPLETE');
              if (unassigned.length === 0) {
                toast.success('All returns in pipeline are already allocated!');
                return;
              }
              setAssignModalLeads(unassigned);
            }}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer whitespace-nowrap"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Assign Unassigned ({unassignedToPrep})</span>
          </Button>
        </div>
      </div>

      {/* 2. Top 4 High-Impact KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Pipeline Volume */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Pipeline Caseload</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{totalInPipeline}</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {allocatedPercent}% Allocated
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {unassignedToPrep} unassigned • {underPreparation} under prep
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#16A34A] h-full rounded-full transition-all duration-300"
              style={{ width: `${allocatedPercent}%` }}
            />
          </div>
        </div>

        {/* Metric 2: QA First-Time Pass Rate */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">First-Time QA Pass Rate</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#16A34A] border border-emerald-200 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{stats.firstTimePassRate}%</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {readyForSales} Signed Off
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
              Zero-defect compliance accuracy
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#16A34A] h-full rounded-full transition-all duration-300"
              style={{ width: `${stats.firstTimePassRate}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Avg Turnaround Velocity */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Avg 1040 Turnaround</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{stats.avgPreparationTimeHrs}h</span>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                SLA: &lt; 6.0h
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Average intake-to-draft completion time
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: '75%' }} />
          </div>
        </div>

        {/* Metric 4: Revisions Pending */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Revisions &amp; Fixes</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{revisionsPending}</span>
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                Reviewer Notes
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Returns sent back for discrepancy fixes
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full" style={{ width: revisionsPending > 0 ? '60%' : '0%' }} />
          </div>
        </div>
      </div>

      {/* 3. The Visual End-to-End Pipeline Stage Flow Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#16A34A]" />
              Tax Preparation &amp; QA Compliance Lifecycle Flow
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Stage-by-stage progression from Documenter intake completion to 4-Eyes QA Sign-Off and Sales handoff.
            </p>
          </div>
          <button
            onClick={() => navigate('/prep-review/manager/queue')}
            className="text-xs font-bold text-[#16A34A] hover:text-[#15803D] flex items-center gap-1 cursor-pointer"
          >
            <span>Open Pipeline Queue</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 5-Step Pipeline Horizontal Stepper Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {[
            {
              step: 1,
              title: '1. Intake Ready',
              count: unassignedToPrep,
              pct: totalInPipeline > 0 ? `${Math.round((unassignedToPrep / totalInPipeline) * 100)}%` : '0%',
              sub: 'Unassigned Pool',
              barColor: 'bg-amber-500',
              active: unassignedToPrep > 0,
            },
            {
              step: 2,
              title: '2. Under Prep (1040)',
              count: underPreparation,
              pct: totalInPipeline > 0 ? `${Math.round((underPreparation / totalInPipeline) * 100)}%` : '0%',
              sub: 'Assigned to Preparers',
              barColor: 'bg-blue-500',
              active: underPreparation > 0,
            },
            {
              step: 3,
              title: '3. In QA Review',
              count: inQualityReview,
              pct: totalInPipeline > 0 ? `${Math.round((inQualityReview / totalInPipeline) * 100)}%` : '0%',
              sub: 'Compliance Audit',
              barColor: 'bg-purple-500',
              active: inQualityReview > 0,
            },
            {
              step: 4,
              title: '4. Revisions Required',
              count: revisionsPending,
              pct: totalInPipeline > 0 ? `${Math.round((revisionsPending / totalInPipeline) * 100)}%` : '0%',
              sub: 'Fixing Discrepancies',
              barColor: 'bg-rose-500',
              active: revisionsPending > 0,
            },
            {
              step: 5,
              title: '5. Ready for Sales',
              count: readyForSales,
              pct: totalInPipeline > 0 ? `${Math.round((readyForSales / totalInPipeline) * 100)}%` : '0%',
              sub: 'Passed to Sales Queue',
              barColor: 'bg-[#16A34A]',
              active: readyForSales > 0,
            },
          ].map((item) => (
            <div
              key={item.step}
              className={`p-4 rounded-xl border transition-all relative flex flex-col justify-between ${item.active
                  ? 'bg-emerald-50/50 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-slate-50/80 border-slate-200/90 hover:bg-white hover:border-slate-300'
                }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-xs font-bold text-slate-700 truncate">{item.title}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${item.active ? 'bg-[#16A34A] text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                  >
                    {item.pct}
                  </span>
                </div>

                <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight my-1">
                  {item.count}
                </div>
                <div className="text-[11px] text-slate-500 font-medium truncate">{item.sub}</div>
              </div>

              <div className="w-full bg-slate-200/70 rounded-full h-1.5 overflow-hidden mt-3">
                <div
                  className={`${item.barColor} h-full rounded-full transition-all duration-300`}
                  style={{ width: item.pct }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. REAL RECHARTS GRAPHS & VISUALIZATIONS (Grid Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GRAPH 1: Dynamic Hourly & Weekly Preparation & Review Velocity */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <AreaChart className="w-4 h-4 text-[#16A34A]" />
                  {chartMode === 'HOURLY'
                    ? "Today's Live Operations Velocity"
                    : 'Current Week Daily Throughput (Mon – Sun)'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  {chartMode === 'HOURLY'
                    ? 'Returns drafted by Preparers vs QA sign-offs approved today'
                    : 'Day-by-day tax return output and audit milestones for this week'}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                {/* View Mode Toggle Pills */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setChartMode('HOURLY')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${chartMode === 'HOURLY'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                      }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>Today Hourly</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartMode('WEEKLY')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${chartMode === 'WEEKLY'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                      }`}
                  >
                    <Calendar className="w-3 h-3" />
                    <span>This Week</span>
                  </button>
                </div>

                <span className="text-xs font-bold text-[#16A34A] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  {peakText}
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartMode === 'HOURLY' ? (
                  <AreaChart data={hourlyPrepData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="prepGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="reviewGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16A34A" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#16A34A" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="hour" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Area
                      type="monotone"
                      dataKey="prepared"
                      name="1040 Returns Under Prep"
                      stroke="#3B82F6"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#prepGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="reviewed"
                      name="QA Audits Signed Off"
                      stroke="#16A34A"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#reviewGrad)"
                    />
                  </AreaChart>
                ) : (
                  <BarChart data={weeklyPrepData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar
                      dataKey="prepared"
                      name="1040 Returns Under Prep"
                      fill="#3B82F6"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="reviewed"
                      name="QA Audits Signed Off"
                      fill="#16A34A"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* GRAPH 2: Return Complexity Distribution (Donut Chart) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-purple-600" />
                  Complexity &amp; Filing Mix
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Tax return categorization by complexity
                </p>
              </div>
            </div>

            <div className="h-52 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={complexityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {complexityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-slate-900">{totalInPipeline}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Returns</span>
              </div>
            </div>

            {/* Legend List */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              {complexityData.map((c) => (
                <div key={c.name} className="flex items-center justify-between text-xs">
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

        {/* GRAPH 3: Real-Time Staff Caseload Allocation (BarChart) */}
        <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                Staff Active Caseload Allocation (Preparers vs QA Reviewers)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Live return assignments distributed across Preparers (Form 1040 Drafting) and QA Reviewers
              </p>
            </div>
            <button
              onClick={() => navigate('/prep-review/manager/staff')}
              className="text-xs font-bold text-[#16A34A] hover:text-[#15803D] flex items-center gap-1 cursor-pointer"
            >
              <span>View Staff Matrix</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={staffLoadChartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="staffName" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="preparerLoad" name="Assigned as Preparer" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Bar dataKey="reviewerLoad" name="Assigned as QA Reviewer" fill="#8B5CF6" radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Bar dataKey="totalActive" name="Total Assigned Returns" fill="#16A34A" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 5. Modals & Assignment Drawers */}
      {assignModalLeads && (
        <PrepAssignLeadDrawer
          isOpen={Boolean(assignModalLeads)}
          onClose={() => setAssignModalLeads(null)}
          targetLeads={assignModalLeads}
          staff={staff}
          onAssignSuccess={handleAssignSuccess}
        />
      )}

      {isAutoDistributeOpen && (
        <PrepAutoDistributeModal
          isOpen={isAutoDistributeOpen}
          onClose={() => setIsAutoDistributeOpen(false)}
          unassignedLeads={leads.filter((l) => !l.assignedPreparer || l.currentStage === 'DOC_PREP_COMPLETE')}
          staff={staff}
          onDistributeSuccess={handleAutoDistributeSuccess}
        />
      )}
    </div>
  );
};
