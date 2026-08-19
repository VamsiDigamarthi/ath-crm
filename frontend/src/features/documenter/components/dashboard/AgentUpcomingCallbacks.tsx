import React from 'react';
import { Clock, Calendar, PhoneCall } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { useNavigate } from 'react-router-dom';
import { renderVisaBadge } from '../../columns/documenter-columns';
import type { DocumenterLeadItem } from '../../types/documenter.types';

interface AgentUpcomingCallbacksProps {
  callbacks: DocumenterLeadItem[];
  callbacksCount: number;
  nextCallbackAt?: string | null;
  onOpenCallModal: (lead: DocumenterLeadItem) => void;
}

export const formatScheduledTime = (dateStr?: string | null): string => {
  if (!dateStr) return 'None';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'None';
    
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    const isTomorrow = d.toDateString() === tomorrow.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();

    const timePart = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isToday) {
      return `Today at ${timePart}`;
    }
    if (isTomorrow) {
      return `Tomorrow at ${timePart}`;
    }
    if (isYesterday) {
      return `Yesterday at ${timePart}`;
    }
    const datePart = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    return `${datePart} at ${timePart}`;
  } catch {
    return 'None';
  }
};

export const AgentUpcomingCallbacks: React.FC<AgentUpcomingCallbacksProps> = ({
  callbacks,
  callbacksCount,
  nextCallbackAt,
  onOpenCallModal,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Scheduled Callbacks & Follow-ups
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Time-sensitive callback commitments with taxpayers
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/documenter/agent/callbacks')}
            className="text-xs font-semibold text-slate-700 border-slate-200 hover:bg-slate-50 cursor-pointer"
          >
            <span>View All ({callbacksCount})</span>
          </Button>
        </div>

        {callbacks.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100">
            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">No Pending Callbacks</p>
            <p className="text-[11px] text-slate-400 mt-0.5">All appointments completed</p>
          </div>
        ) : (
          <div className="space-y-3">
            {callbacks.map((lead) => {
              const log = lead.lastCallLog || (lead as any).callLogs?.[0];
              const customer = lead.customer;
              const formattedDate = formatScheduledTime(log?.callbackScheduledAt);

              return (
                <div
                  key={lead.id}
                  className="p-3.5 rounded-xl border border-amber-300 bg-amber-50/50 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-slate-900">
                        {customer?.fullName || `${customer?.firstName} ${customer?.lastName}`}
                      </span>
                      {renderVisaBadge(customer?.visaType)}
                    </div>
                    <div className="text-xs text-slate-600 font-semibold">{customer?.phone}</div>
                    {log?.callSummary && (
                      <div className="text-[11px] text-slate-500 italic">"{log.callSummary}"</div>
                    )}
                  </div>

                  <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                    <span className="text-xs font-bold text-amber-900 bg-amber-100/70 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-600" />
                      {formattedDate}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => onOpenCallModal(lead)}
                      className="h-7 px-3 rounded-lg text-xs font-bold bg-[#16A34A] hover:bg-[#15803D] text-white flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>Call Now</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium flex items-center justify-between">
        <span>
          Next Callback:{' '}
          <strong className="text-amber-800 font-bold">
            {formatScheduledTime(nextCallbackAt)}
          </strong>
        </span>
        <span className="text-[#16A34A] font-bold">SLA: On-Time</span>
      </div>
    </div>
  );
};
