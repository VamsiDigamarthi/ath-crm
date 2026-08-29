import React from 'react';
import { Calculator, ShieldCheck, CheckCircle2, RotateCcw } from 'lucide-react';

interface PreparerStatsCardsProps {
  stats: {
    totalAssigned: number;
    inQA: number;
    qaApproved?: number;
    revisions: number;
    accuracyRate: number;
  };
}

export const PreparerStatsCards: React.FC<PreparerStatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Assigned 1040 Drafts */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">
            My Assigned 1040 Returns
          </span>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Calculator className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {stats.totalAssigned || 0}
          </div>
          <div className="text-xs text-blue-600 font-medium mt-1">
            Active in your drafting queue
          </div>
        </div>
      </div>

      {/* Card 2: Submitted to QA Review */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">
            In QA Audit Review
          </span>
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {stats.inQA || 0}
          </div>
          <div className="text-xs text-purple-600 font-medium mt-1 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-purple-500" />
            <span>Awaiting Senior Auditor Sign-Off</span>
          </div>
        </div>
      </div>

      {/* Card 3: QA Approved & Signed Off */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">
            QA Approved
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center border border-emerald-100">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {stats.qaApproved || 0}
          </div>
          <div className="text-xs text-[#16A34A] font-medium mt-1 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <span>Passed 4-Eyes Compliance</span>
          </div>
        </div>
      </div>

      {/* Card 4: Corrections & Revisions */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-rose-300 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">
            Discrepancies &amp; Corrections
          </span>
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
            <RotateCcw className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {stats.revisions || 0}
          </div>
          <div className="text-xs text-rose-600 font-medium mt-1">
            {stats.revisions === 0 ? 'Zero-defect audit rate' : `${stats.revisions} discrepancy rework items`}
          </div>
        </div>
      </div>
    </div>
  );
};
