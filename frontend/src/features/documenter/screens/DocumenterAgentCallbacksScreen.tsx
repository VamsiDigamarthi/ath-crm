import React from 'react';
import { useDocumenterWorkspace } from '../hooks/useDocumenterWorkspace';
import { CallOutreachModal } from '../components/CallOutreachModal';
import { AppCopyButton } from '@/shared/components/AppCopyButton';
import { Button } from '@/shared/components/Button';
import { 
  PhoneCall, 
  Clock, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { renderVisaBadge } from '../columns/documenter-columns';

export const DocumenterAgentCallbacksScreen: React.FC = () => {
  const {
    leads,
    stats,
    isLoading,
    isActionLoading,
    isCallModalOpen,
    activeLeadForCall,
    handleOpenCallModal,
    handleCloseModals,
    handleSaveCallDisposition,
    refreshData,
  } = useDocumenterWorkspace('CALLBACKS');

  // Helper to format callback urgency and time label
  const getCallbackUrgency = (dateStr?: string | null) => {
    if (!dateStr) return { urgency: 'UPCOMING' as const, label: 'Scheduled Later', isToday: false, isImminent: false };

    const targetDate = new Date(dateStr);
    const now = new Date();
    const diffMs = targetDate.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);

    const isToday = targetDate.toDateString() === now.toDateString();
    const timeFormatted = targetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (diffMins < 0 && Math.abs(diffMins) <= 120) {
      return {
        urgency: 'IMMINENT' as const,
        label: `Overdue by ${Math.abs(diffMins)} mins (${timeFormatted})`,
        isToday,
        isImminent: true,
      };
    }

    if (diffMins >= 0 && diffMins <= 30) {
      return {
        urgency: 'IMMINENT' as const,
        label: `In ${diffMins} mins (${timeFormatted})`,
        isToday: true,
        isImminent: true,
      };
    }

    if (isToday) {
      return {
        urgency: 'UPCOMING' as const,
        label: `Today at ${timeFormatted}`,
        isToday: true,
        isImminent: false,
      };
    }

    return {
      urgency: 'UPCOMING' as const,
      label: `${targetDate.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeFormatted}`,
      isToday: false,
      isImminent: false,
    };
  };

  const callbackLeads = leads.filter((l) => {
    const log = l.lastCallLog || (l as any).callLogs?.[0];
    return Boolean(log?.callbackScheduledAt);
  });

  const imminentCount = callbackLeads.filter((l) => {
    const log = l.lastCallLog || (l as any).callLogs?.[0];
    return log?.callbackScheduledAt && getCallbackUrgency(log.callbackScheduledAt).isImminent;
  }).length;

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Scheduled Callbacks & Appointments
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Time-sensitive callback commitments with interested taxpayers. Maintain 100% on-time outreach SLAs.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* 2. Top Metric Cards (Consistent with Admin Teams UI) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Callbacks */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Total Scheduled Callbacks
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {stats.callbacks || callbackLeads.length}
            </div>
            <div className="text-xs text-purple-600 font-medium mt-1">
              Active commitments in your queue
            </div>
          </div>
        </div>

        {/* Card 2: Imminent / Due Today */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Due Today / Imminent
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {imminentCount > 0 ? imminentCount : (stats.callbacks ? Math.min(stats.callbacks, 1) : 0)}
            </div>
            <div className="text-xs text-amber-700 font-medium mt-1 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
              <span>{stats.nextCallbackAt ? `Next: ${new Date(stats.nextCallbackAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'On track'}</span>
            </div>
          </div>
        </div>

        {/* Card 3: On-Time SLA */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              On-Time SLA Health
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center border border-emerald-100">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              100%
            </div>
            <div className="text-xs text-[#16A34A] font-medium mt-1 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-[#16A34A]" />
              <span>Prompt outreach turnaround</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Real Dynamic Callbacks List */}
      {callbackLeads.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3 border border-purple-100 font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Pending Callbacks</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            You currently have no scheduled callback appointments. When you log a call with a callback time, it will automatically appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {callbackLeads.map((lead) => {
            const log = lead.lastCallLog || (lead as any).callLogs?.[0];
            const callbackInfo = getCallbackUrgency(log?.callbackScheduledAt);
            const customer = lead.customer;

            return (
              <div
                key={lead.id}
                className={`p-5 rounded-xl border transition-all bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs ${
                  callbackInfo.isImminent
                    ? 'border-amber-300 ring-2 ring-amber-400/20 bg-amber-50/15'
                    : 'border-slate-200 shadow-xs hover:border-slate-300'
                }`}
              >
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-base font-bold text-slate-900">
                      {customer?.fullName || `${customer?.firstName} ${customer?.lastName}`}
                    </span>
                    {renderVisaBadge(customer?.visaType)}
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      TY{lead.taxYear}
                    </span>
                    {callbackInfo.isImminent && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200 animate-pulse flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Due Imminently
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium">
                    <span>Phone: <strong className="text-slate-900">{customer?.phone}</strong></span>
                    {customer?.phone && <AppCopyButton text={customer.phone} size="sm" />}
                    <span className="text-slate-300">•</span>
                    <span>Email: <strong className="text-slate-900">{customer?.email || 'No email'}</strong></span>
                    {customer?.email && <AppCopyButton text={customer.email} size="sm" />}
                  </div>

                  {log?.callSummary && (
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 text-xs text-slate-700 font-medium">
                      <span className="font-bold text-slate-900">Previous Discussion Notes: </span>
                      "{log.callSummary}"
                    </div>
                  )}
                </div>

                <div className="flex flex-col md:items-end justify-between gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-500">Scheduled Time</div>
                    <div className="text-sm font-bold text-amber-800 flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-4 h-4 text-amber-600" />
                      <span>{callbackInfo.label}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="md"
                      onClick={() => handleOpenCallModal(lead)}
                      className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>Dial Taxpayer</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Call Outreach & Disposition Modal */}
      <CallOutreachModal
        isOpen={isCallModalOpen}
        onClose={handleCloseModals}
        lead={activeLeadForCall}
        onSaveDisposition={handleSaveCallDisposition}
        isLoading={isActionLoading}
      />
    </div>
  );
};
