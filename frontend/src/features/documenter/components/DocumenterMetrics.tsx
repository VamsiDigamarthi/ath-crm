import React from 'react';
import { Users, PhoneForwarded, FileCheck2, Clock, Zap, UserCheck } from 'lucide-react';
import type { DocumenterStats } from '../types/documenter.types';

export interface DocumenterMetricsProps {
  stats: DocumenterStats;
  onQuickAutoDistribute: () => void;
  isDistributing?: boolean;
  showMyLeads?: boolean;
}

export const DocumenterMetrics: React.FC<DocumenterMetricsProps> = ({
  stats,
  onQuickAutoDistribute,
  isDistributing = false,
  showMyLeads = false,
}) => {
  const hasMyLeads = showMyLeads && stats.myLeads !== undefined;

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${hasMyLeads ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-4`}>
      {/* 1. Unassigned Leads Card with Quick Action Button */}
      <div className="relative overflow-hidden rounded-xl bg-white border border-slate-200/80 p-5 shadow-xs transition-all hover:shadow-md hover:border-slate-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Unassigned Pool
          </span>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-sans tracking-tight">
            {stats.unassigned}
          </div>
          {stats.unassigned > 0 && (
            <button
              onClick={onQuickAutoDistribute}
              disabled={isDistributing}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
              title="Evenly distribute unassigned leads to Documenter Agents"
            >
              <Zap className="w-3 h-3 fill-current" />
              {isDistributing ? 'Assigning...' : 'Auto Distribute'}
            </button>
          )}
        </div>
        <div className="mt-2 text-xs text-slate-500 font-medium">
          Awaiting agent assignment
        </div>
      </div>

      {/* 2. My Assigned Leads Card (if applicable) */}
      {hasMyLeads && (
        <div className="rounded-xl bg-white border border-slate-200/80 p-5 shadow-xs transition-all hover:shadow-md hover:border-emerald-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              My Assigned Leads
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#16A34A]">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900 font-sans tracking-tight">
            {stats.myLeads}
          </div>
          <div className="mt-2 text-xs text-[#16A34A] font-medium">
            Assigned to me directly
          </div>
        </div>
      )}

      {/* 3. Active Outreach Card */}
      <div className="rounded-xl bg-white border border-slate-200/80 p-5 shadow-xs transition-all hover:shadow-md hover:border-slate-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            In Outreach
          </span>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <PhoneForwarded className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900 font-sans tracking-tight">
          {stats.activeOutreach}
        </div>
        <div className="mt-2 text-xs text-slate-500 font-medium">
          Assigned to agents for calling
        </div>
      </div>

      {/* 4. In Tax Prep Card */}
      <div className="rounded-xl bg-white border border-slate-200/80 p-5 shadow-xs transition-all hover:shadow-md hover:border-slate-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            In Tax Prep
          </span>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#16A34A]">
            <FileCheck2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900 font-sans tracking-tight">
          {stats.inPrep}
        </div>
        <div className="mt-2 text-xs text-slate-500 font-medium">
          Client portal & W-2 intake active
        </div>
      </div>

      {/* 5. Callbacks Scheduled Card */}
      <div className="rounded-xl bg-white border border-slate-200/80 p-5 shadow-xs transition-all hover:shadow-md hover:border-slate-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Callbacks Due
          </span>
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900 font-sans tracking-tight">
          {stats.callbacks}
        </div>
        <div className="mt-2 text-xs text-slate-500 font-medium">
          Follow-up phone calls scheduled
        </div>
      </div>
    </div>
  );
};
