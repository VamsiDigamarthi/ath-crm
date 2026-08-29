import React from 'react';
import { Send, CheckCircle2, Zap, ShieldCheck } from 'lucide-react';

export interface FilingSpecialistStatsCardsProps {
  stats: {
    assignedReturns: number;
    readyToTransmit: number;
    acceptedCount: number;
    acceptanceRate: string;
  };
}

export const FilingSpecialistStatsCards: React.FC<FilingSpecialistStatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Assigned Returns */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            My Assigned Returns
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Send className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {stats.assignedReturns}
          </div>
          <div className="text-[11px] text-blue-600 font-semibold mt-1">
            Active Filing Caseload
          </div>
        </div>
      </div>

      {/* 2. Ready to Transmit */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Ready to Transmit
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {stats.readyToTransmit}
          </div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">
            Pending XML Dispatch
          </div>
        </div>
      </div>

      {/* 3. Accepted by IRS Today */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Accepted by IRS Today
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#16A34A] flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {stats.acceptedCount}
          </div>
          <div className="text-[11px] text-[#16A34A] font-semibold mt-1">
            Ack: 0000 Issued
          </div>
        </div>
      </div>

      {/* 4. My Acceptance Rate */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            My Acceptance Rate
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#16A34A] flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {stats.acceptanceRate}
          </div>
          <div className="text-[11px] text-slate-500 font-semibold mt-1">
            {stats.acceptedCount > 0 ? 'Zero Schema Rejections' : 'No Transmissions Yet'}
          </div>
        </div>
      </div>
    </div>
  );
};
