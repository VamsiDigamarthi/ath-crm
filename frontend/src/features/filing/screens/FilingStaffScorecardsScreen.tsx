import React from 'react';
import { 
  Users, 
  RefreshCw, 
  Scale, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { FilingStaffWorkloadTable } from '../components/manager/FilingStaffWorkloadTable';
import { useFilingStaffMatrix } from '../hooks/useFilingStaffMatrix';

export const FilingStaffScorecardsScreen: React.FC = () => {
  const {
    isLoading,
    staffList,
    kpiMetrics,
    totalDepartmentLeads,
    fetchStaffData,
    handleBalancePool,
  } = useFilingStaffMatrix();

  return (
    <div className="w-full space-y-6 font-sans">
      {/* 1. Header with Title & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200 flex items-center gap-1">
              <Users className="w-3 h-3 text-[#16A34A]" />
              <span>Filing Department Supervision</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Filing Specialists Staff &amp; Capacity Matrix
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Monitor individual transmission volume, IRS acceptance rate, and rebalance transmission caseload.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchStaffData(true)}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 border-slate-200 cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={handleBalancePool}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Balance Specialists Pool</span>
          </Button>
        </div>
      </div>

      {/* 2. Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Specialists */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Active Filing Specialists</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {kpiMetrics.activeSpecialists}
            </div>
            <div className="text-[11px] text-blue-600 font-semibold mt-1">
              Authorized MeF Transmitters
            </div>
          </div>
        </div>

        {/* Ready for Transmission */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Ready for Transmission</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {kpiMetrics.readyForTransmission}
            </div>
            <div className="text-[11px] text-amber-600 font-semibold mt-1">
              Awaiting XML Dispatch
            </div>
          </div>
        </div>

        {/* Accepted Returns Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">IRS Accepted Returns</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {kpiMetrics.acceptedToday}
            </div>
            <div className="text-[11px] text-[#16A34A] font-semibold mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Ack: 0000 Verified</span>
            </div>
          </div>
        </div>

        {/* Acceptance Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">IRS Acceptance Rate</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {kpiMetrics.acceptanceRate}
            </div>
            <div className="text-[11px] text-slate-500 font-semibold mt-1 flex items-center gap-1">
              {kpiMetrics.acceptedToday > 0 ? (
                <>
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span className="text-[#16A34A]">Zero Schema Rejections</span>
                </>
              ) : (
                <span>No Transmissions Yet</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filing Staff Workload Table */}
      <FilingStaffWorkloadTable
        staffList={staffList}
        totalDepartmentLeads={totalDepartmentLeads}
        isLoading={isLoading}
      />
    </div>
  );
};
