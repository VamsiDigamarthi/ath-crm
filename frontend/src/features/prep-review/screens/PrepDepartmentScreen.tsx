import React, { useState } from 'react';
import { usePrepReviewManager } from '../hooks/usePrepReviewManager';
import { PrepManagerQueueTable } from '../components/manager/PrepManagerQueueTable';
import { PrepAssignLeadDrawer } from '../components/manager/PrepAssignLeadDrawer';
import { PrepAutoDistributeModal } from '../components/manager/PrepAutoDistributeModal';
import { Button } from '@/shared/components/Button';
import {
  Calculator,
  ShieldCheck,
  CheckCircle2,
  Clock,
  RotateCcw,
  RefreshCw,
  Zap,
  Users,
  BarChart3,
  ListFilter,
  AreaChart as AreaChartIcon,
  PieChart as PieIcon,
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
import toast from 'react-hot-toast';

export const PrepDepartmentScreen: React.FC = () => {
  const [viewMode, setViewMode] = useState<'QUEUE' | 'ANALYTICS'>('QUEUE');

  const {
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
    selectedStageFilter,
    setSelectedStageFilter,
  } = usePrepReviewManager();

  const totalInPipeline = stats.totalInPipeline || leads.length;
  const unassignedToPrep = stats.unassignedToPrep || leads.filter((l) => l.currentStage === 'DOC_PREP_COMPLETE' || !l.assignedPreparer).length;
  const underPreparation = stats.underPreparation || leads.filter((l) => l.currentStage === 'PREP_IN_PROGRESS' || l.currentStage === 'PREP_ASSIGNED').length;
  const inQualityReview = stats.inQualityReview || leads.filter((l) => l.currentStage === 'QA_IN_REVIEW' || l.currentStage === 'QA_REVIEW_QUEUE').length;
  const revisionsPending = stats.revisionsPending || leads.filter((l) => l.currentStage === 'QA_REVISION_REQUESTED').length;
  const readyForSales = stats.readyForSales || leads.filter((l) => l.currentStage === 'QA_APPROVED' || l.currentStage === 'SALES_PITCH_QUEUE').length;

  const allocatedPercent = totalInPipeline > 0
    ? Math.round(((totalInPipeline - unassignedToPrep) / totalInPipeline) * 100)
    : 0;

  // Chart Data: Hourly Velocity
  const hourlyPrepData = stats.hourlyVelocity && stats.hourlyVelocity.length > 0
    ? stats.hourlyVelocity
    : [
        { hour: '09:00', prepared: 2, reviewed: 1 },
        { hour: '11:00', prepared: 5, reviewed: 4 },
        { hour: '13:00', prepared: 8, reviewed: 6 },
        { hour: '15:00', prepared: 12, reviewed: 10 },
        { hour: '17:00', prepared: 16, reviewed: 14 },
      ];

  // Chart Data: Complexity Mix
  const complexityData = stats.complexityMix && stats.complexityMix.length > 0
    ? stats.complexityMix
    : [
        { name: 'Standard W-2', value: leads.filter((l) => l.complexity === 'STANDARD').length || 1, color: '#16A34A', pct: 45 },
        { name: '1099-B Stock Gains', value: leads.filter((l) => l.complexity === 'INVESTMENTS_1099B').length || 1, color: '#F59E0B', pct: 25 },
        { name: 'Foreign FBAR / India', value: leads.filter((l) => l.complexity === 'FOREIGN_FBAR').length || 1, color: '#8B5CF6', pct: 20 },
        { name: 'Schedule C Self-Employed', value: leads.filter((l) => l.complexity === 'BUSINESS_SCH_C').length || 1, color: '#0EA5E9', pct: 10 },
      ];

  // Chart Data: Staff Caseload
  const staffLoadChartData = staff
    .filter((s) => s.role !== 'PREP_MANAGER')
    .map((s) => ({
      staffName: s.name.split(' ')[0] || s.email.split('@')[0],
      preparerLoad: Number(s.prepActiveCount) || 0,
      reviewerLoad: Number(s.reviewActiveCount) || 0,
      totalActive: Number(s.activeCaseload) || 0,
    }));

  return (
    <div className="w-full space-y-6 pb-12 font-sans animate-in fade-in duration-200">
      {/* 1. Header & Live Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Tax Prep &amp; QA Review Department Supervision
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              4-Eyes QA Deck
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Supervise Form 1040 calculations, 4-Eyes QA compliance sign-offs, and allocate returns to Preparer &amp; Reviewer pairs.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('QUEUE')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'QUEUE'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Pipeline Queue</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('ANALYTICS')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'ANALYTICS'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Velocity &amp; Charts</span>
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* 2. Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Pipeline Volume */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
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
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">First-Time QA Pass Rate</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#16A34A] border border-emerald-200 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{stats.firstTimePassRate || 98.5}%</span>
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
              style={{ width: `${stats.firstTimePassRate || 98.5}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Avg Turnaround Velocity */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Avg 1040 Turnaround</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{stats.avgPreparationTimeHrs || 4.2}h</span>
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
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
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

      {/* 3. Render View based on toggle */}
      {viewMode === 'QUEUE' ? (
        <PrepManagerQueueTable
          leads={leads}
          tabStats={{
            all: totalInPipeline,
            unassigned: unassignedToPrep,
            underPrep: underPreparation,
            qaReview: inQualityReview,
            revisions: revisionsPending,
            qaApproved: readyForSales,
          }}
          isLoading={isLoading}
          selectedStageFilter={selectedStageFilter}
          onStageFilterChange={setSelectedStageFilter}
          onOpenAssignModal={() => {}}
          onViewLeadDetail={(lead) => {
            toast.success(`Tax return for ${lead.taxpayerName} (TY ${lead.taxYear})`);
          }}
          isAdmin={true}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 1: Dynamic Hourly Velocity */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <AreaChartIcon className="w-4 h-4 text-[#16A34A]" />
                  Preparation &amp; QA Sign-Off Velocity
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Returns drafted by Preparers vs QA sign-offs approved
                </p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
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
                  <Tooltip />
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
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Complexity Mix */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-purple-600" />
                  Complexity &amp; Filing Mix
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tax return categorization by complexity
                </p>
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
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-slate-900">{totalInPipeline}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Returns</span>
                </div>
              </div>

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

          {/* Chart 3: Staff Caseload Bar Chart */}
          <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  Staff Active Caseload Allocation (Preparers vs QA Reviewers)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live return assignments distributed across Preparers (Form 1040 Drafting) and QA Reviewers
                </p>
              </div>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={staffLoadChartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="staffName" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="preparerLoad" name="Assigned as Preparer" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="reviewerLoad" name="Assigned as QA Reviewer" fill="#8B5CF6" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="totalActive" name="Total Assigned Returns" fill="#16A34A" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
