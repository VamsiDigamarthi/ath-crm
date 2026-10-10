import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrepReviewManager } from '../hooks/usePrepReviewManager';
import { PrepManagerQueueTable } from '../components/manager/PrepManagerQueueTable';
import { PrepAssignLeadDrawer } from '../components/manager/PrepAssignLeadDrawer';
import { PrepAutoDistributeModal } from '../components/manager/PrepAutoDistributeModal';
import { AppTabs } from '@/shared/components/AppTabs';
import { Button } from '@/shared/components/Button';
import { CompactStatCards } from '@/shared/components/CompactStatCards';
import { AppFilterFlyout, withoutAllValues, type FilterCategory } from '@/shared/components/AppFilterFlyout';
import { StatsToggleButton } from '@/shared/components/StatsToggleButton';
import { useStatsVisibility } from '@/shared/hooks/useStatsVisibility';
import { SYSTEM_PRIORITIES } from '@/shared/constants/system-enums';
import {
  ShieldCheck,
  RefreshCw,
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

export const PrepDepartmentScreen: React.FC = () => {
  const navigate = useNavigate();
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

  // Stat cards (shown by default, "Hide stats" next to Filters)
  const { showStats, toggleStats } = useStatsVisibility('admin_prep_dept');

  // Filters: Preparer, QA reviewer, Priority, Complexity, Tax year (options from live data)
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const filterCategories = useMemo<FilterCategory[]>(() => {
    const years = Array.from(new Set(leads.map((l) => l.taxYear).filter(Boolean))).sort((a, b) => b - a);
    const people = (pick: (s: (typeof staff)[number]) => boolean | undefined) => [
      { label: 'Unassigned', value: 'UNASSIGNED' },
      ...staff.filter(pick).map((s) => ({ label: s.name || s.email, value: s.id })),
    ];
    return [
      { id: 'preparer', label: 'Preparer', options: people((s) => s.canPrepare ?? s.role === 'TAX_PREPARER') },
      { id: 'reviewer', label: 'QA reviewer', options: people((s) => s.canReview ?? s.role === 'TAX_REVIEWER') },
      { id: 'priority', label: 'Priority', options: SYSTEM_PRIORITIES.map((p) => ({ label: p.label, value: p.value })) },
      {
        id: 'complexity',
        label: 'Complexity',
        options: [
          { label: 'Standard', value: 'STANDARD' },
          { label: 'Multi-state', value: 'MULTI_STATE' },
          { label: 'Investments (1099-B)', value: 'INVESTMENTS_1099B' },
          { label: 'Foreign / FBAR', value: 'FOREIGN_FBAR' },
          { label: 'Business (Sch C)', value: 'BUSINESS_SCH_C' },
        ],
      },
      { id: 'taxYear', label: 'Tax year', options: years.map((y) => ({ label: `TY ${y}`, value: String(y) })) },
    ];
  }, [leads, staff]);
  const filteredLeads = useMemo(() => {
    const match = (key: string, value: string) => !filters[key]?.length || filters[key].includes(value);
    return leads.filter(
      (l) =>
        match('preparer', l.assignedPreparer?.id || 'UNASSIGNED') &&
        match('reviewer', l.assignedReviewer?.id || 'UNASSIGNED') &&
        match('priority', l.priority || 'NO_PRIORITY') &&
        match('complexity', l.complexity || 'STANDARD') &&
        match('taxYear', String(l.taxYear))
    );
  }, [leads, filters]);

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
          {/* View Mode Toggle AppTabs */}
          <AppTabs
            tabs={[
              { id: 'QUEUE', label: 'Pipeline Queue', icon: ListFilter },
              { id: 'ANALYTICS', label: 'Velocity & Charts', icon: BarChart3 },
            ]}
            activeTab={viewMode}
            onChange={(id) => setViewMode(id as any)}
            size="sm"
          />

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

      {/* 2. Summary cards (compact, live counts per stage) */}
      {showStats && (
        <CompactStatCards
          cards={[
            { name: 'Unassigned', value: unassignedToPrep, hint: `${allocatedPercent}% of ${totalInPipeline} allocated`, tone: 'text-amber-700' },
            { name: 'Under preparation', value: underPreparation, hint: 'Being drafted', tone: 'text-blue-700' },
            { name: 'In QA review', value: inQualityReview, hint: 'Waiting for audit', tone: 'text-purple-700' },
            { name: 'Revisions', value: revisionsPending, hint: 'Sent back to preparer', tone: 'text-rose-600' },
            { name: 'Ready for sales', value: readyForSales, hint: 'QA signed off', tone: 'text-emerald-700' },
          ]}
        />
      )}

      {/* 3. Render View based on toggle */}
      {viewMode === 'QUEUE' ? (
        <PrepManagerQueueTable
          leads={filteredLeads}
          filterControl={
            <div className="flex items-center gap-2">
            <StatsToggleButton visible={showStats} onToggle={toggleStats} />
            <AppFilterFlyout categories={filterCategories} selectedFilters={filters} onApply={(f) => setFilters(withoutAllValues(f))} onReset={() => setFilters({})} />
          </div>
          }
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
          onOpenAssignModal={(selected) => setAssignModalLeads(selected)}
          onOpenAutoDistribute={() => setIsAutoDistributeOpen(true)}
          onViewLeadDetail={(lead) => {
            navigate(`/prep-review/preparer/workspace/${lead.id || lead.applicationId}`);
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

      {/* Assignment Drawer & Auto Distribute Modal */}
      <PrepAssignLeadDrawer
        isOpen={Boolean(assignModalLeads && assignModalLeads.length > 0)}
        onClose={() => setAssignModalLeads(null)}
        targetLeads={assignModalLeads || []}
        staff={staff}
        onAssignSuccess={handleAssignSuccess}
      />

      <PrepAutoDistributeModal
        isOpen={isAutoDistributeOpen}
        onClose={() => setIsAutoDistributeOpen(false)}
        unassignedLeads={leads.filter((l) => l.currentStage === 'DOC_PREP_COMPLETE' || !l.assignedPreparer)}
        staff={staff}
        onDistributeSuccess={handleAutoDistributeSuccess}
      />
    </div>
  );
};
