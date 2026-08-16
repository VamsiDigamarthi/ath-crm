import React from 'react';
import { PhoneForwarded, PhoneCall, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { useNavigate } from 'react-router-dom';
import { renderVisaBadge } from '../../columns/documenter-columns';
import type { DocumenterLeadItem } from '../../types/documenter.types';

interface AgentQuickCallingQueueProps {
  leads: DocumenterLeadItem[];
  totalLeadsCount: number;
  onOpenCallModal: (lead: DocumenterLeadItem) => void;
}

export const AgentQuickCallingQueue: React.FC<AgentQuickCallingQueueProps> = ({
  leads,
  totalLeadsCount,
  onOpenCallModal,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PhoneForwarded className="w-4 h-4 text-emerald-600" />
              Next Leads in My Calling Queue
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Assigned prospects awaiting first outreach call
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/documenter/agent/queue')}
            className="text-xs font-semibold text-slate-700 border-slate-200 hover:bg-slate-50 cursor-pointer"
          >
            <span>Full Queue ({totalLeadsCount})</span>
          </Button>
        </div>

        <div className="space-y-3">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-[#16A34A]/50 transition-all flex items-center justify-between gap-3 shadow-2xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs sm:text-sm text-slate-900">
                    {lead.customer?.fullName ||
                      `${lead.customer?.firstName} ${lead.customer?.lastName}`}
                  </span>
                  {renderVisaBadge(lead.customer?.visaType)}
                </div>
                <div className="text-xs text-slate-600 font-medium">
                  {lead.customer?.phone} • {lead.customer?.city ? `${lead.customer?.city}, ` : ''}
                  {lead.customer?.state || 'US'}
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => onOpenCallModal(lead)}
                className="h-8 px-3 rounded-lg text-xs font-bold bg-[#16A34A] hover:bg-[#15803D] text-white flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Dial</span>
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100">
        <Button
          size="sm"
          variant="outline"
          fullWidth
          onClick={() => navigate('/documenter/agent/queue')}
          className="text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>View All ({totalLeadsCount}) Assigned Leads</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};
