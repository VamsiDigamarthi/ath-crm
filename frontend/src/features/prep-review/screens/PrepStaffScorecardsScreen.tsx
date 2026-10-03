import React from 'react';
import { usePrepStaffScorecards } from '../hooks/usePrepStaffScorecards';
import { PrepStaffWorkloadTable } from '../components/manager/PrepStaffWorkloadTable';
import { PrepAutoDistributeModal } from '../components/manager/PrepAutoDistributeModal';
import { Button } from '@/shared/components/Button';
import { RefreshCw, Zap } from 'lucide-react';

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

  // const activeStaffCount = staff.filter((s) => s.role !== 'PREP_MANAGER').length;

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Staff & Capacity</h2>
          <p className="text-sm text-slate-500 mt-1">Caseload and throughput for preparers and QA reviewers.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="md" onClick={fetchStaffData} disabled={isLoading} title="Refresh" className="px-3 cursor-pointer">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          {stats.unassigned > 0 && (
            <Button
              size="md"
              onClick={() => setIsAutoDistributeOpen(true)}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold flex items-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              Auto-assign ({stats.unassigned})
            </Button>
          )}
        </div>
      </div>

      {/* Summary strip (hidden)
      <div className="bg-white border border-slate-200 rounded-xl grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
        {[
          { label: 'Active staff', value: activeStaffCount, hint: 'Preparers & QA reviewers' },
          { label: 'Under preparation', value: stats.underPrep, hint: 'Returns being drafted' },
          { label: 'In QA review', value: stats.qaReview, hint: 'Waiting for audit' },
          { label: 'Total returns', value: stats.all, hint: `${stats.unassigned} unassigned` },
        ].map((item) => (
          <div key={item.label} className="p-5 min-w-0">
            <div className="text-xs font-medium text-slate-500">{item.label}</div>
            <div className="text-xl font-bold text-slate-900 mt-1">{item.value ?? 0}</div>
            <div className="text-xs text-slate-400 mt-0.5">{item.hint}</div>
          </div>
        ))}
      </div>
      */}

      {/* Previous KPI cards (kept for reference)
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
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
      */}

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
