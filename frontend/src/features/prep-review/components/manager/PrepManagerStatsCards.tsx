import React from 'react';
import type { PrepManagerStats } from '../../types/prep-review.types';
import { 
  FileCheck2, 
  Clock, 
  Sparkles, 
  RotateCcw, 
  CheckCircle2 
} from 'lucide-react';

interface PrepManagerStatsCardsProps {
  stats: PrepManagerStats;
  onFilterByStage?: (stageKey: string) => void;
}

export const PrepManagerStatsCards: React.FC<PrepManagerStatsCardsProps> = ({ 
  stats,
  onFilterByStage 
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Unassigned to Prep */}
      <div 
        onClick={() => onFilterByStage?.('UNASSIGNED')}
        className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-amber-400 transition-all cursor-pointer flex flex-col justify-between group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 group-hover:text-amber-700 transition-colors">
            Unassigned (Intake Ready)
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {stats.unassignedToPrep}
          </div>
          <div className="text-xs text-amber-700 font-medium mt-1 flex items-center gap-1.5 whitespace-nowrap">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <span>Ready for Preparer Allocation</span>
          </div>
        </div>
      </div>

      {/* 2. Under Preparation */}
      <div 
        onClick={() => onFilterByStage?.('UNDER_PREP')}
        className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 transition-all cursor-pointer flex flex-col justify-between group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 group-hover:text-blue-700 transition-colors">
            Under Preparation
          </span>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shrink-0">
            <FileCheck2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {stats.underPreparation}
          </div>
          <div className="text-xs text-blue-600 font-medium mt-1 flex items-center gap-1.5 whitespace-nowrap">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 shrink-0" />
            <span>Form 1040 Calculations In-Flight</span>
          </div>
        </div>
      </div>

      {/* 3. In QA Review */}
      <div 
        onClick={() => onFilterByStage?.('QA_REVIEW')}
        className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-purple-400 transition-all cursor-pointer flex flex-col justify-between group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 group-hover:text-purple-700 transition-colors">
            In Quality Review
          </span>
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {stats.inQualityReview}
          </div>
          <div className="text-xs text-purple-600 font-medium mt-1 flex items-center gap-1.5 whitespace-nowrap">
            <span className="inline-block w-2 h-2 rounded-full bg-purple-500 shrink-0" />
            <span>Senior Auditor Inspection</span>
          </div>
        </div>
      </div>

      {/* 4. Revisions Pending */}
      <div 
        onClick={() => onFilterByStage?.('REVISION')}
        className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-rose-400 transition-all cursor-pointer flex flex-col justify-between group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 group-hover:text-rose-700 transition-colors">
            Revisions Required
          </span>
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 shrink-0">
            <RotateCcw className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {stats.revisionsPending}
          </div>
          <div className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1.5 whitespace-nowrap">
            <span className="inline-block w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            <span>Discrepancy Corrections</span>
          </div>
        </div>
      </div>

      {/* 5. Ready for Sales */}
      <div 
        onClick={() => onFilterByStage?.('APPROVED')}
        className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-400 transition-all cursor-pointer flex flex-col justify-between group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 group-hover:text-emerald-700 transition-colors">
            QA Signed Off
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center border border-emerald-200 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {stats.readyForSales}
          </div>
          <div className="text-xs text-[#16A34A] font-medium mt-1 flex items-center gap-1.5 whitespace-nowrap">
            <span className="inline-block w-2 h-2 rounded-full bg-[#16A34A] shrink-0" />
            <span>Passed to Sales Pitch Queue</span>
          </div>
        </div>
      </div>
    </div>
  );
};
