import React from 'react';
import { 
  PhoneCall, 
  CheckCircle2, 
  FileCheck2, 
  PhoneForwarded, 
  Sparkles, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import type { DocumenterStats } from '../../types/documenter.types';

interface AgentStatsCardsProps {
  stats: DocumenterStats;
}

export const AgentStatsCards: React.FC<AgentStatsCardsProps> = ({ stats }) => {
  const todayDials = stats.todayDials || 0;
  const todayConnected = stats.todayConnected || 0;
  const contactRatePct = stats.contactRatePct || 0;
  const inPrepCount = stats.inPrep || 0;
  const callbacksCount = stats.callbacks || 0;
  const assignedTarget = stats.myLeads || (todayDials > 0 ? todayDials : 4);
  const quotaPct = Math.min(100, Math.round((todayDials / assignedTarget) * 100));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Today's Dials vs Assigned Leads */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">Today's Outreach Dials</span>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold">
            <PhoneCall className="w-4 h-4" />
          </div>
        </div>
        <div className="my-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{todayDials}</span>
            <span className="text-xs text-slate-500 font-semibold">/ {assignedTarget} Assigned Leads</span>
          </div>
          <p className="text-xs text-blue-600 mt-1 font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {quotaPct}% Outreach Progress
          </p>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-blue-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${quotaPct}%` }}
          />
        </div>
      </div>

      {/* Card 2: Contact Reach Rate (Connected calls / total dials) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">Contact Rate (Picked Up)</span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#16A34A] border border-emerald-200 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="my-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{contactRatePct}%</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {todayConnected} Connected
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Interested & Callbacks answered</span>
          </p>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-[#16A34A] h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(contactRatePct, 100)}%` }}
          />
        </div>
      </div>

      {/* Card 3: Tax Prep Conversions */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">Transferred to Tax Prep</span>
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center font-bold">
            <FileCheck2 className="w-4 h-4" />
          </div>
        </div>
        <div className="my-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{inPrepCount}</span>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
              {todayDials > 0 ? Math.round((inPrepCount / todayDials) * 100) : 0}% Conv
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Agreed to start W-2 intake
          </p>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-purple-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${todayDials > 0 ? Math.min(Math.round((inPrepCount / todayDials) * 100), 100) : 0}%` }}
          />
        </div>
      </div>

      {/* Card 4: Scheduled Callbacks */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">Callbacks Pending</span>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold">
            <PhoneForwarded className="w-4 h-4" />
          </div>
        </div>
        <div className="my-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{callbacksCount}</span>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Scheduled
            </span>
          </div>
          <p className="text-xs text-amber-700 mt-1 font-semibold flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-amber-500" />
            <span>
              {stats.nextCallbackAt
                ? `Next: ${new Date(stats.nextCallbackAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`
                : 'All on schedule'}
            </span>
          </p>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-amber-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(callbacksCount * 50, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
