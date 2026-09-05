import React from 'react';
import { PhoneCall, DollarSign, CheckCircle2, Clock, Flame, RotateCcw } from 'lucide-react';
import type { SalesAgentStats } from '../../types/sales.types';

interface SalesAgentStatsCardsProps {
  stats: SalesAgentStats;
}

export const SalesAgentStatsCards: React.FC<SalesAgentStatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {/* Card 1: Assigned Leads */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">
            My Pitching Queue
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <PhoneCall className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {stats.assignedLeads || 0}
          </div>
          <div className="text-[11px] text-blue-600 font-medium mt-0.5">
            Active QA-approved returns
          </div>
        </div>
      </div>

      {/* Card 2: Reverted / Sent Back */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">
            Sent for Revision
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
            <RotateCcw className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl font-bold text-amber-900 tracking-tight">
            {stats.revertedLeads || 0}
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>With Prep or Documenter</span>
          </div>
        </div>
      </div>

      {/* Card 3: Quotations & Payments Pending */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">
            Pending Payment
          </span>
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {stats.paymentsPending || 0}
          </div>
          <div className="text-[11px] text-purple-600 font-medium mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span>Quotation sent to client</span>
          </div>
        </div>
      </div>

      {/* Card 4: Deals Closed & Paid Today */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">
            Deals Closed Today
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#16A34A] flex items-center justify-center border border-emerald-100">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {stats.dealsClosedToday || 0}
          </div>
          <div className="text-[11px] text-[#16A34A] font-medium mt-0.5 flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span>{stats.myConversionRate || 0}% Conversion</span>
          </div>
        </div>
      </div>

      {/* Card 5: My Revenue Generated Today */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">
            My Revenue Today
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#16A34A] flex items-center justify-center border border-emerald-100">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            ${(stats.myRevenueToday || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
            Collected &amp; authorized
          </div>
        </div>
      </div>
    </div>
  );
};
