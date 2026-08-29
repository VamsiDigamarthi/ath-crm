import React from 'react';
import { Send, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import type { FilingLeadItem } from '../../types/filing.types';

export interface FilingSpecialistPriorityTargetsProps {
  priorityTargets: FilingLeadItem[];
  onOpenWorkspace: (lead: FilingLeadItem) => void;
  onGoToQueue: () => void;
}

export const FilingSpecialistPriorityTargets: React.FC<FilingSpecialistPriorityTargetsProps> = ({
  priorityTargets,
  onOpenWorkspace,
  onGoToQueue,
}) => {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Send className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              High-Priority Transmission Targets
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Verified tax returns ready for direct XML transmission to the IRS Gateway.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onGoToQueue}
          className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-2xs"
        >
          <span>View All Queue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      {priorityTargets.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs space-y-2">
          <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500/60" />
          <p className="font-medium text-slate-600">No pending returns waiting for transmission!</p>
          <p className="text-[11px] text-slate-400">All assigned returns have been successfully transmitted to the IRS.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {priorityTargets.map((lead) => {
            const initial = (lead.taxpayerName?.[0] || 'T').toUpperCase();
            return (
              <div
                key={lead.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 px-2 rounded-xl transition-colors"
              >
                {/* Left: Avatar + Name + Visa + Contact */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-300 text-emerald-800">
                    {initial}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                        {lead.taxpayerName}
                      </span>
                      {lead.visaType && lead.visaType !== '-' && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {lead.visaType}
                        </span>
                      )}
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        TY {lead.taxYear || 2025}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      <span>{lead.stateOfResidence || 'United States'}</span>
                      <span className="mx-1.5 text-slate-300">•</span>
                      <span className="font-mono text-[10px] text-slate-400">{lead.ssnMasked || '***-**-****'}</span>
                    </div>
                  </div>
                </div>

                {/* Middle: Refund + Compliance Badges */}
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#16A34A] text-xs bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                    +${lead.federalRefund.toLocaleString()} Fed
                  </span>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                      ${lead.serviceFeePaid} PAID
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">
                      PIN {lead.taxpayerPin || '84920'}
                    </span>
                  </div>
                </div>

                {/* Right: Transmit Action */}
                <Button
                  size="sm"
                  onClick={() => onOpenWorkspace(lead)}
                  className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs shrink-0 self-end sm:self-auto"
                >
                  <span>Transmit E-File</span>
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
