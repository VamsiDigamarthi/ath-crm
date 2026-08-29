import { DollarSign, CheckCircle2, TrendingUp, Target } from 'lucide-react';
import type { SalesManagerStats } from '../../types/sales.types';

interface SalesManagerStatsCardsProps {
  stats: SalesManagerStats;
}

export const SalesManagerStatsCards: React.FC<SalesManagerStatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Pipeline Revenue Potential */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">
            Pipeline Leads (QA Passed)
          </span>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Target className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {stats.pipelineLeads || 0}
          </div>
          <div className="text-xs text-blue-600 font-medium mt-1 flex items-center gap-1">
            <span>{stats.activePitching || 0} in active phone pitch</span>
          </div>
        </div>
      </div>

      {/* 2. Deals Closed & Paid Today */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">
            Deals Closed &amp; Paid (MTD)
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center border border-emerald-100">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {stats.closedPaidDeals || 0}
          </div>
          <div className="text-xs text-[#16A34A] font-medium mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Ready for IRS E-Filing</span>
          </div>
        </div>
      </div>

      {/* 3. Total Fee Revenue Collected */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">
            Total Service Revenue (MTD)
          </span>
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            ${(stats.totalRevenueMTD || 0).toLocaleString()}
          </div>
          <div className="text-xs text-purple-600 font-medium mt-1">
            Avg Fee: ${(stats.avgDealSize || 0).toLocaleString()} / Client
          </div>
        </div>
      </div>

      {/* 4. Pitch-to-Payment Conversion Rate */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">
            Pitch Conversion Rate
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {stats.conversionRatePct || 0}%
          </div>
          <div className="text-xs text-amber-600 font-medium mt-1">
            {stats.pendingPayment || 0} Quotations awaiting payment
          </div>
        </div>
      </div>
    </div>
  );
};
