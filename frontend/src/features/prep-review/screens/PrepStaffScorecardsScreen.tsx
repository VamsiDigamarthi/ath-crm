import React from 'react';
import { usePrepStaffScorecards } from '../hooks/usePrepStaffScorecards';
import { PrepStaffWorkloadTable } from '../components/manager/PrepStaffWorkloadTable';
import { PrepAutoDistributeModal } from '../components/manager/PrepAutoDistributeModal';
import { Button } from '@/shared/components/Button';
import { 
  Users, 
  RefreshCw, 
  Zap, 
  ShieldCheck, 
  Activity, 
  CheckCircle2,
  Calculator
} from 'lucide-react';

export const PrepStaffScorecardsScreen: React.FC = () => {
  const {
    staff,
    stats,
    unassignedLeads,
    isLoading,
    fetchStaffData,
    isAutoDistributeOpen,
    setIsAutoDistributeOpen,
  } = usePrepStaffScorecards();

  const activeStaffCount = staff.filter((s) => s.role !== 'PREP_MANAGER').length;

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      {/* 1. Header & Live Team Capacity Action (Exact Documenter Manager Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Tax Operations Staff &amp; Capacity Matrix
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Manager Supervision
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Monitor real-time preparation throughput, individual caseload capacity, QA review velocity, and balance return distribution.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStaffData}
            disabled={isLoading}
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          {stats.unassigned > 0 && (
            <Button
              size="sm"
              onClick={() => setIsAutoDistributeOpen(true)}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
              <span>Auto Split Pool ({stats.unassigned})</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Top 4 Metric KPI Cards for Tax Operations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Tax Staff */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Active Tax Staff
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {activeStaffCount}
            </div>
            <div className="text-xs text-purple-600 font-medium mt-1 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-purple-500" />
              <span>Preparers &amp; QA Reviewers</span>
            </div>
          </div>
        </div>

        {/* Card 2: Under Preparation (1040) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Under Preparation (1040)
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Calculator className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {stats.underPrep}
            </div>
            <div className="text-xs text-blue-600 font-medium mt-1">
              Active Drafting Computations
            </div>
          </div>
        </div>

        {/* Card 3: In QA Audit Review */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              In QA Audit Review
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center border border-emerald-100">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {stats.qaReview}
            </div>
            <div className="text-xs text-[#16A34A] font-medium mt-1">
              4-Eyes Compliance Audits
            </div>
          </div>
        </div>

        {/* Card 4: Total Department Returns */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Total Department Returns
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {stats.all}
            </div>
            <div className="text-xs text-amber-600 font-medium mt-1">
              {stats.unassigned} Unassigned Returns
            </div>
          </div>
        </div>
      </div>

      {/* 3. Staff Workload & Capacity Table */}
      <PrepStaffWorkloadTable
        staff={staff}
        isLoading={isLoading}
      />

      {/* Auto Distribute Modal */}
      {isAutoDistributeOpen && (
        <PrepAutoDistributeModal
          isOpen={isAutoDistributeOpen}
          onClose={() => setIsAutoDistributeOpen(false)}
          unassignedLeads={unassignedLeads}
          staff={staff}
          onDistributeSuccess={() => {
            fetchStaffData();
          }}
        />
      )}
    </div>
  );
};
