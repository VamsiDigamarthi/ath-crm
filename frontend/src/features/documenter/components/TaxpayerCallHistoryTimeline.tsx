import React, { useState } from 'react';
import { 
  PhoneCall, 
  PhoneOutgoing, 
  PhoneMissed, 
  Calendar, 
  Clock, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  Plus
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import type { CallLogItem } from '../types/documenter.types';

interface TaxpayerCallHistoryTimelineProps {
  callLogs: CallLogItem[];
  taxpayerName: string;
  onOpenCallModal: () => void;
}

export const TaxpayerCallHistoryTimeline: React.FC<TaxpayerCallHistoryTimelineProps> = ({
  callLogs,
  taxpayerName,
  onOpenCallModal,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'CONNECTED' | 'CALLBACKS'>('ALL');
  const [expandedCallIds, setExpandedCallIds] = useState<Record<string, boolean>>({});

  // Format date helper: "Aug 23, 2026 at 01:05 PM" + relative time
  const formatCallDate = (dateStr: string): { fullDate: string; timeStr: string } => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return { fullDate: dateStr, timeStr: '' };
      
      const fullDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      });
      const timeStr = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      return { fullDate, timeStr };
    } catch {
      return { fullDate: dateStr, timeStr: '' };
    }
  };

  // Render disposition badge with custom styling
  const renderDispositionBadge = (disposition: string) => {
    switch (disposition) {
      case 'CONNECTED_INTERESTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
            Connected: Interested in Filing
          </span>
        );
      case 'CONNECTED_CALLBACK':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Calendar className="w-3.5 h-3.5 text-purple-600" />
            Scheduled Callback
          </span>
        );
      case 'CONNECTED_NOT_INTERESTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            Connected: Not Interested
          </span>
        );
      case 'NO_ANSWER_VOICEMAIL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <PhoneMissed className="w-3.5 h-3.5 text-amber-600" />
            No Answer / Left Voicemail
          </span>
        );
      case 'INVALID_DISCONNECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
            Invalid / Disconnected Number
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <PhoneCall className="w-3.5 h-3.5 text-slate-500" />
            {disposition.replace(/_/g, ' ')}
          </span>
        );
    }
  };

  // Filter logs
  const filteredLogs = callLogs.filter((log) => {
    if (filterType === 'CONNECTED') {
      return log.disposition === 'CONNECTED_INTERESTED' || log.disposition === 'CONNECTED_CALLBACK';
    }
    if (filterType === 'CALLBACKS') {
      return Boolean(log.callbackScheduledAt);
    }
    return true;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#16A34A] border border-emerald-200 flex items-center justify-center font-bold">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Call History & Communication Timeline
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Comprehensive audit trail of outbound outreach calls made to {taxpayerName}.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Pills */}
          <div className="inline-flex p-1 rounded-lg bg-slate-100 border border-slate-200 text-xs">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                filterType === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({callLogs.length})
            </button>
            <button
              onClick={() => setFilterType('CONNECTED')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                filterType === 'CONNECTED'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Connected
            </button>
            <button
              onClick={() => setFilterType('CALLBACKS')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                filterType === 'CALLBACKS'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Callbacks
            </button>
          </div>

          <Button
            size="sm"
            onClick={onOpenCallModal}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log New Call</span>
          </Button>
        </div>
      </div>

      {/* Timeline Stream */}
      {filteredLogs.length === 0 ? (
        <div className="py-12 text-center space-y-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <div className="w-12 h-12 rounded-full bg-white border border-slate-200 text-slate-400 mx-auto flex items-center justify-center shadow-2xs">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">No Call Records Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-0.5">
              No outbound calls have been logged for this lead yet. Click "Log New Call" to record the first conversation.
            </p>
          </div>
          <Button
            size="sm"
            onClick={onOpenCallModal}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold inline-flex items-center gap-1.5"
          >
            <PhoneOutgoing className="w-3.5 h-3.5" />
            <span>Dial / Log Call Now</span>
          </Button>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {filteredLogs.map((log, index) => {
            const { fullDate, timeStr } = formatCallDate(log.createdAt);
            const isFirst = index === 0;

            return (
              <div key={log.id || index} className="relative group">
                {/* Timeline node icon */}
                <div
                  className={`absolute -left-6 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shadow-2xs transition-all ${
                    isFirst
                      ? 'bg-[#16A34A] border-emerald-200 text-white'
                      : 'bg-white border-slate-300 text-slate-500'
                  }`}
                >
                  <PhoneCall className="w-3 h-3" />
                </div>

                {/* Call Card */}
                <div className="bg-slate-50 hover:bg-slate-50/80 border border-slate-200 rounded-xl p-4 transition-all shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    {/* Caller Info & Disposition */}
                    <div className="flex flex-wrap items-center gap-2">
                      {renderDispositionBadge(log.disposition)}

                      <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                        <span className="text-slate-400">•</span>
                        <span className="font-bold text-slate-800">
                          {log.agentName || 'Kavya Reddy'}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-200/70 text-slate-700">
                          {log.agentRole === 'SALES_AGENT' ? 'Sales Agent' : 'Documenter'}
                        </span>
                      </div>
                    </div>

                    {/* Date & Time Timestamp */}
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 shrink-0">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{fullDate}</span>
                      {timeStr && <span className="text-slate-400">at {timeStr}</span>}
                    </div>
                  </div>

                  {/* Call Summary Notes (Clamped to 2 lines with read more toggle) */}
                  {log.callSummary && (
                    <div className="mt-3 p-3 rounded-lg bg-white border border-slate-200/80 text-xs text-slate-700 leading-relaxed flex items-start gap-2.5">
                      <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="font-semibold text-slate-800 block text-[11px] mb-0.5">
                          Agent Call Summary:
                        </span>
                        <p className={`text-slate-600 font-normal italic leading-relaxed ${expandedCallIds[log.id] ? '' : 'line-clamp-2'}`}>
                          "{log.callSummary}"
                        </p>
                        {log.callSummary.length > 130 && (
                          <button
                            type="button"
                            onClick={() => setExpandedCallIds((prev) => ({ ...prev, [log.id]: !prev[log.id] }))}
                            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 hover:underline mt-1 cursor-pointer transition-colors"
                          >
                            {expandedCallIds[log.id] ? 'Show less' : '... Read more'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Scheduled Callback Alert if present */}
                  {log.callbackScheduledAt && (
                    <div className="mt-2.5 p-2.5 rounded-lg bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-medium">
                        <Calendar className="w-4 h-4 text-purple-600 shrink-0" />
                        <span>
                          <strong>Follow-up Scheduled:</strong> {new Date(log.callbackScheduledAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-200 text-purple-800">
                        Appointment Set
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
