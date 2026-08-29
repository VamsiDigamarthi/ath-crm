import React from 'react';
import { ShieldCheck, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';

interface ReviewerStatsCardsProps {
  stats: {
    pendingAudit: number;
    signedOff: number;
    revisionsSent: number;
    passRate: number;
  };
}

export const ReviewerStatsCards: React.FC<ReviewerStatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Pending 4-Eyes Audit */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">
            Pending 4-Eyes Audit
          </span>
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {stats.pendingAudit || 0}
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
              Awaiting Audit
            </span>
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">
            Returns submitted by Preparers
          </div>
        </div>
        <div className="h-1 w-full bg-purple-600 rounded-full mt-3" />
      </div>

      {/* 2. Passed QA (Signed Off) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">
            Passed QA (Signed Off)
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center border border-emerald-100">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {stats.signedOff || 0}
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-[#16A34A] border border-emerald-200">
              Ready for Sales
            </span>
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">
            Transferred to sales pitch
          </div>
        </div>
        <div className="h-1 w-full bg-[#16A34A] rounded-full mt-3 opacity-20" />
      </div>

      {/* 3. Sent Back for Revision */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-rose-300 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">
            Sent Back for Revision
          </span>
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
            <RotateCcw className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {stats.revisionsSent || 0}
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
              Discrepancies
            </span>
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">
            Flagged for calculation fixes
          </div>
        </div>
        <div className="h-1 w-full bg-rose-500 rounded-full mt-3 opacity-20" />
      </div>

      {/* 4. First-Time Pass Rate */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">
            First-Time Pass Rate
          </span>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {stats.passRate || 100}%
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
              Top Quality
            </span>
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">
            Zero-defect compliance accuracy
          </div>
        </div>
        <div className="h-1 w-full bg-blue-600 rounded-full mt-3" />
      </div>
    </div>
  );
};
