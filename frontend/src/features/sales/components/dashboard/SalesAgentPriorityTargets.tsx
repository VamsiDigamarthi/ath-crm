import React from 'react';
import { PhoneCall, ArrowRight, Sparkles, AlertCircle, ArrowUpRight } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import type { SalesLeadItem } from '../../types/sales.types';

interface SalesAgentPriorityTargetsProps {
  priorityTargets: SalesLeadItem[];
  onOpenPitch: (id: string) => void;
  onGoToQueue: () => void;
}

export const SalesAgentPriorityTargets: React.FC<SalesAgentPriorityTargetsProps> = ({
  priorityTargets,
  onOpenPitch,
  onGoToQueue,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-white">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#16A34A] flex items-center justify-center border border-emerald-100">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              High-Priority Pitch Targets
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Top QA-approved tax returns ready for immediate phone consultation &amp; fee agreement.
          </p>
        </div>

        <button
          type="button"
          onClick={onGoToQueue}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>View All in Pitch Queue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Targets List */}
      <div className="divide-y divide-slate-100">
        {priorityTargets.length === 0 ? (
          <div className="p-8 text-center text-slate-400 font-medium text-xs">
            <AlertCircle className="w-6 h-6 mx-auto text-slate-300 mb-2" />
            <span>No pending returns in pitch queue right now. Great job closing all deals!</span>
          </div>
        ) : (
          priorityTargets.map((lead) => (
            <div
              key={lead.id || lead.applicationId}
              className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              {/* Left: Taxpayer info */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200 shrink-0">
                  {lead.taxpayerName?.substring(0, 2).toUpperCase() || 'TX'}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                    <span>{lead.taxpayerName}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                      TY {lead.taxYear || 2025}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {lead.stateOfResidence || 'US Resident'} • {lead.visaType || 'Individual'}
                  </div>
                  <div className="text-[10px] text-slate-400">{lead.taxpayerPhone} • {lead.taxpayerEmail}</div>
                </div>
              </div>

              {/* Middle: Certified Refund & Quoted Fee */}
              <div className="flex items-center gap-4 sm:gap-6">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Certified 1040
                  </div>
                  {Number(lead.federalRefund) > 0 ? (
                    <span className="font-bold text-[#16A34A] text-xs">
                      +${Number(lead.federalRefund).toLocaleString()} Refund
                    </span>
                  ) : Number(lead.balanceDue) > 0 ? (
                    <span className="font-bold text-rose-600 text-xs">
                      -${Number(lead.balanceDue).toLocaleString()} Tax Due
                    </span>
                  ) : (
                    <span className="font-bold text-slate-600 text-xs">$0 Balance</span>
                  )}
                </div>

                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Estimated Fee
                  </div>
                  <span className="font-bold text-slate-900 text-xs">
                    ${lead.feeBreakdown?.totalServiceFee || 227}
                  </span>
                </div>

                {/* Right CTA */}
                <Button
                  size="sm"
                  onClick={() => onOpenPitch(lead.id || lead.applicationId)}
                  className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 h-8.5 px-3.5 cursor-pointer shadow-2xs shrink-0"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Start Pitch Call</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
