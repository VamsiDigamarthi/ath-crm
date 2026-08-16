import React from 'react';
import { 
  PhoneCall, 
  Globe, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  PhoneOff
} from 'lucide-react';

export interface ManagerFunnelAnalyticsProps {
  outreachBreakdown: {
    interested: number;
    callbacks: number;
    notInterested: number;
    noAnswer: number;
    invalid: number;
    total: number;
  };
  visaBreakdown: {
    h1b: number;
    f1Opt: number;
    l1: number;
    greenCard: number;
    total: number;
  };
}

export const ManagerFunnelAnalytics: React.FC<ManagerFunnelAnalyticsProps> = ({
  outreachBreakdown,
  visaBreakdown,
}) => {
  const getPct = (count: number, total: number) => {
    if (!total || total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      {/* 1. Call Outcome & Disposition Distribution */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Call Disposition Breakdown</h4>
              <p className="text-[11px] text-slate-500 font-medium">Outcomes across all outreach dials</p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
            {outreachBreakdown.total} Total Dials
          </span>
        </div>

        <div className="space-y-3 text-xs">
          {/* Interested */}
          <div className="space-y-1">
            <div className="flex items-center justify-between font-medium">
              <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                Connected - Interested (To Prep)
              </span>
              <span className="font-bold text-slate-900">
                {outreachBreakdown.interested} ({getPct(outreachBreakdown.interested, outreachBreakdown.total)}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-[#16A34A] h-full rounded-full" 
                style={{ width: `${getPct(outreachBreakdown.interested, outreachBreakdown.total)}%` }} 
              />
            </div>
          </div>

          {/* Callbacks */}
          <div className="space-y-1">
            <div className="flex items-center justify-between font-medium">
              <span className="flex items-center gap-1.5 text-purple-800 font-bold">
                <Clock className="w-3.5 h-3.5 text-purple-600" />
                Connected - Scheduled Callback
              </span>
              <span className="font-bold text-slate-900">
                {outreachBreakdown.callbacks} ({getPct(outreachBreakdown.callbacks, outreachBreakdown.total)}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-purple-500 h-full rounded-full" 
                style={{ width: `${getPct(outreachBreakdown.callbacks, outreachBreakdown.total)}%` }} 
              />
            </div>
          </div>

          {/* Not Interested */}
          <div className="space-y-1">
            <div className="flex items-center justify-between font-medium">
              <span className="flex items-center gap-1.5 text-slate-700">
                <XCircle className="w-3.5 h-3.5 text-slate-400" />
                Connected - Not Interested
              </span>
              <span className="font-semibold text-slate-700">
                {outreachBreakdown.notInterested} ({getPct(outreachBreakdown.notInterested, outreachBreakdown.total)}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-slate-400 h-full rounded-full" 
                style={{ width: `${getPct(outreachBreakdown.notInterested, outreachBreakdown.total)}%` }} 
              />
            </div>
          </div>

          {/* No Answer */}
          <div className="space-y-1">
            <div className="flex items-center justify-between font-medium">
              <span className="flex items-center gap-1.5 text-amber-700">
                <PhoneOff className="w-3.5 h-3.5 text-amber-500" />
                No Answer / Voicemail
              </span>
              <span className="font-semibold text-slate-700">
                {outreachBreakdown.noAnswer} ({getPct(outreachBreakdown.noAnswer, outreachBreakdown.total)}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-amber-400 h-full rounded-full" 
                style={{ width: `${getPct(outreachBreakdown.noAnswer, outreachBreakdown.total)}%` }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Visa & Filing Category Intelligence */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Visa Category Breakdown</h4>
              <p className="text-[11px] text-slate-500 font-medium">Non-resident & Resident profile mix</p>
            </div>
          </div>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
            TY2025 Pool
          </span>
        </div>

        <div className="space-y-3.5 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <div>
                <div className="font-bold text-slate-900">H-1B Work Visa</div>
                <div className="text-[10px] text-slate-500">Dual-status / 1040 Individual</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-slate-900">{visaBreakdown.h1b} Taxpayers</div>
              <div className="text-[10px] text-indigo-600 font-bold">{getPct(visaBreakdown.h1b, visaBreakdown.total)}% of total</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <div>
                <div className="font-bold text-slate-900">F-1 OPT Students</div>
                <div className="text-[10px] text-slate-500">1040-NR Non-Resident Alien</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-slate-900">{visaBreakdown.f1Opt} Taxpayers</div>
              <div className="text-[10px] text-blue-600 font-bold">{getPct(visaBreakdown.f1Opt, visaBreakdown.total)}% of total</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <div>
                <div className="font-bold text-slate-900">L-1 & Green Card / US</div>
                <div className="text-[10px] text-slate-500">Standard 1040 Residents</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-slate-900">{visaBreakdown.l1 + visaBreakdown.greenCard} Taxpayers</div>
              <div className="text-[10px] text-[#16A34A] font-bold">{getPct(visaBreakdown.l1 + visaBreakdown.greenCard, visaBreakdown.total)}% of total</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Team Lead Oversight & Sub-Team Summary */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Sub-Team Leadership Health</h4>
              <p className="text-[11px] text-slate-500 font-medium">Performance per Team Lead pod</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            2 Pods Active
          </span>
        </div>

        <div className="space-y-3 text-xs">
          {/* Pod Alpha */}
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                  A
                </div>
                <div>
                  <div className="font-bold text-slate-900">Pod Alpha (Ananya I - TL)</div>
                  <div className="text-[10px] text-slate-500">4 Calling Agents Assigned</div>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                86% Contact Rate
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 font-medium">
              <span>Active Leads: <strong className="text-slate-800">12</strong></span>
              <span>Conversions: <strong className="text-[#16A34A]">4</strong></span>
              <span>Load: <strong className="text-blue-600">Optimal</strong></span>
            </div>
          </div>

          {/* Pod Beta */}
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                  V
                </div>
                <div>
                  <div className="font-bold text-slate-900">Pod Beta (Vikram S - TL)</div>
                  <div className="text-[10px] text-slate-500">4 Calling Agents Assigned</div>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                81% Contact Rate
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 font-medium">
              <span>Active Leads: <strong className="text-slate-800">10</strong></span>
              <span>Conversions: <strong className="text-[#16A34A]">3</strong></span>
              <span>Load: <strong className="text-blue-600">Optimal</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
