import React from 'react';
import { 
  Users, 
  RefreshCw, 
  Sparkles, 
  ShieldCheck, 
  DollarSign, 
  CheckCircle2, 
  TrendingUp, 
  Flame 
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { SalesClosersWorkloadTable } from '../components/manager/SalesClosersWorkloadTable';
import { useSalesTeamScorecards } from '../hooks/useSalesTeamScorecards';

export const SalesTeamScorecardsScreen: React.FC = () => {
  const {
    salesReps,
    kpiMetrics,
    totalDepartmentLeads,
    isLoading,
    isRefreshing,
    handleRefresh,
    handleBalancePool,
  } = useSalesTeamScorecards();

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      {/* 1. Header & Live Team Capacity Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Sales Closers Staff &amp; Capacity Matrix
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Manager Supervision
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Monitor individual closer pitch call volume, deal conversion rate, daily revenue generation, and balance caseload allocation.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={handleBalancePool}
            disabled={isLoading}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current text-amber-300" />
            <span>Balance Closers Pool</span>
          </Button>
        </div>
      </div>

      {/* 2. Top 4 KPI Cards for Sales Operations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Closers */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Active Sales Closers
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {kpiMetrics.activeClosers}
            </div>
            <div className="text-xs text-blue-600 font-medium mt-1">
              Dedicated revenue closers
            </div>
          </div>
        </div>

        {/* Card 2: Deals Closed Today */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Deals Closed Today
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center border border-emerald-100">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {kpiMetrics.dealsClosedToday}
            </div>
            <div className="text-xs text-[#16A34A] font-medium mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Paid &amp; E-Signed</span>
            </div>
          </div>
        </div>

        {/* Card 3: Revenue Generated Today */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Revenue Generated Today
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              ${kpiMetrics.revenueGeneratedToday.toLocaleString()}
            </div>
            <div className="text-xs text-purple-600 font-medium mt-1">
              Service fee receipts
            </div>
          </div>
        </div>

        {/* Card 4: Team Conversion Rate */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Team Conversion Rate
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {kpiMetrics.teamConversionRate}
            </div>
            <div className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>Above 30% baseline</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Closers Workload Table */}
      <SalesClosersWorkloadTable 
        salesReps={salesReps} 
        totalDepartmentLeads={totalDepartmentLeads}
        isLoading={isLoading} 
      />
    </div>
  );
};
