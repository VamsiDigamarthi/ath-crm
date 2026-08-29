import React from 'react';
import { 
  ShieldCheck, 
  PhoneCall, 
  DollarSign, 
  CheckCircle2, 
  Rocket, 
  Zap 
} from 'lucide-react';

export interface SalesManagerMetricsProps {
  awaitingPitchCount: number;
  pitchingCount: number;
  quotedCount: number;
  paidSignedCount: number;
  filingReadyCount: number;
  unassignedCount: number;
  onQuickAutoDistribute: () => void;
  isDistributing?: boolean;
}

export const SalesManagerMetrics: React.FC<SalesManagerMetricsProps> = ({
  awaitingPitchCount,
  pitchingCount,
  quotedCount,
  paidSignedCount,
  filingReadyCount,
  unassignedCount,
  onQuickAutoDistribute,
  isDistributing = false,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 font-sans">
      {/* 1. QA Approved / Awaiting Pitch Card */}
      <div className="relative overflow-hidden rounded-xl bg-white border border-slate-200/80 p-5 shadow-xs transition-all hover:shadow-md hover:border-slate-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Awaiting Pitch
          </span>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {awaitingPitchCount}
          </div>
          {unassignedCount > 0 && (
            <button
              onClick={onQuickAutoDistribute}
              disabled={isDistributing}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
              title="Evenly distribute unassigned leads to Sales Closers"
            >
              <Zap className="w-3 h-3 fill-current" />
              {isDistributing ? 'Assigning...' : 'Auto Distribute'}
            </button>
          )}
        </div>
        <div className="mt-2 text-xs text-slate-500 font-medium">
          QA-certified returns ready for pitch
        </div>
      </div>

      {/* 2. In Active Pitch Card */}
      <div className="rounded-xl bg-white border border-slate-200/80 p-5 shadow-xs transition-all hover:shadow-md hover:border-blue-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            In Active Pitch
          </span>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <PhoneCall className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {pitchingCount}
        </div>
        <div className="mt-2 text-xs text-blue-600 font-medium">
          Assigned to closers for calling
        </div>
      </div>

      {/* 3. Quoted / Pending Payment Card */}
      <div className="rounded-xl bg-white border border-slate-200/80 p-5 shadow-xs transition-all hover:shadow-md hover:border-purple-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Pending Payment
          </span>
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {quotedCount}
        </div>
        <div className="mt-2 text-xs text-purple-600 font-medium">
          Checkout links dispatched
        </div>
      </div>

      {/* 4. Paid & Form 8879 Signed Card */}
      <div className="rounded-xl bg-white border border-slate-200/80 p-5 shadow-xs transition-all hover:shadow-md hover:border-emerald-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Paid &amp; E-Signed
          </span>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#16A34A]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {paidSignedCount}
        </div>
        <div className="mt-2 text-xs text-[#16A34A] font-medium">
          Payment &amp; Form 8879 authorized
        </div>
      </div>

      {/* 5. Transferred to Filing Operations Card */}
      <div className="rounded-xl bg-white border border-slate-200/80 p-5 shadow-xs transition-all hover:shadow-md hover:border-slate-400">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            In Filing Queue
          </span>
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
            <Rocket className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {filingReadyCount}
        </div>
        <div className="mt-2 text-xs text-slate-600 font-medium">
          Transferred to IRS E-Filing
        </div>
      </div>
    </div>
  );
};
