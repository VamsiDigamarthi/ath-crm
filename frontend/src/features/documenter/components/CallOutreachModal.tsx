import React, { useState, useEffect } from 'react';
import { AppModal } from '@/shared/components/AppModal';
import { Button } from '@/shared/components/Button';
import { AppCopyButton } from '@/shared/components/AppCopyButton';
import { 
  PhoneOutgoing, 
  CheckCircle2, 
  CalendarClock, 
  XCircle, 
  PhoneMissed, 
  PhoneOff,
  User,
  Globe,
  MapPin,
  Clock,
  History
} from 'lucide-react';
import type { DocumenterLeadItem, CallDisposition } from '../types/documenter.types';

export interface CallOutreachModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: DocumenterLeadItem | null;
  onSaveDisposition: (payload: {
    applicationId: string;
    disposition: CallDisposition;
    callSummary?: string;
    callbackDate?: string;
  }) => void;
  isLoading?: boolean;
}

export const CallOutreachModal: React.FC<CallOutreachModalProps> = ({
  isOpen,
  onClose,
  lead,
  onSaveDisposition,
  isLoading = false,
}) => {
  const [selectedDisposition, setSelectedDisposition] = useState<CallDisposition>('CONNECTED_INTERESTED');
  const [callSummary, setCallSummary] = useState<string>('');
  const [callbackDate, setCallbackDate] = useState<string>('');

  // Auto-bind / pre-fill previous call notes & callback time when modal opens
  useEffect(() => {
    if (lead && isOpen) {
      const log = lead.lastCallLog || (lead as any).callLogs?.[0];
      if (log) {
        setSelectedDisposition((log.disposition as CallDisposition) || 'CONNECTED_INTERESTED');
        setCallSummary(log.callSummary || '');
        if (log.callbackScheduledAt) {
          const d = new Date(log.callbackScheduledAt);
          const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
          setCallbackDate(localIso);
        } else {
          setCallbackDate('');
        }
      } else {
        setSelectedDisposition('CONNECTED_INTERESTED');
        setCallSummary('');
        setCallbackDate('');
      }
    }
  }, [lead, isOpen]);

  if (!lead) return null;

  const customer = lead.customer;
  const previousLog = lead.lastCallLog || (lead as any).callLogs?.[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveDisposition({
      applicationId: lead.id,
      disposition: selectedDisposition,
      callSummary,
      callbackDate: selectedDisposition === 'CONNECTED_CALLBACK' ? callbackDate : undefined,
    });
  };

  const dispositions = [
    {
      id: 'CONNECTED_INTERESTED' as CallDisposition,
      title: 'Connected - Interested in Filing',
      subtitle: 'Initiate Tax Prep & trigger Client Portal Access',
      icon: CheckCircle2,
      color: 'emerald',
      activeClass: 'border-[#16A34A] bg-emerald-50 text-[#16A34A]',
    },
    {
      id: 'CONNECTED_CALLBACK' as CallDisposition,
      title: 'Connected - Busy / Call Back Later',
      subtitle: 'Schedule a specific follow-up date & time',
      icon: CalendarClock,
      color: 'amber',
      activeClass: 'border-amber-500 bg-amber-50 text-amber-700',
    },
    {
      id: 'NO_ANSWER_VOICEMAIL' as CallDisposition,
      title: 'No Answer / Left Voicemail',
      subtitle: 'Retain in queue and increment outreach attempts',
      icon: PhoneMissed,
      color: 'blue',
      activeClass: 'border-blue-500 bg-blue-50 text-blue-700',
    },
    {
      id: 'CONNECTED_NOT_INTERESTED' as CallDisposition,
      title: 'Connected - Not Interested',
      subtitle: 'Close lead & mark as Dropped / Cancelled',
      icon: XCircle,
      color: 'rose',
      activeClass: 'border-rose-500 bg-rose-50 text-rose-700',
    },
    {
      id: 'INVALID_DISCONNECTED' as CallDisposition,
      title: 'Invalid / Disconnected Number',
      subtitle: 'Flag lead for contact number correction',
      icon: PhoneOff,
      color: 'slate',
      activeClass: 'border-slate-500 bg-slate-100 text-slate-800',
    },
  ];

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-2xl"
      title={
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Outreach Call & Disposition Logger
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Conduct phone call with {customer.firstName} {customer.lastName} and log outcome
          </p>
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-slate-400">
            Outreach Stage: <strong>{lead.currentStage}</strong>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
              className="border-slate-200 text-slate-700"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={isLoading || (selectedDisposition === 'CONNECTED_CALLBACK' && !callbackDate)}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white font-bold px-4 cursor-pointer"
            >
              {isLoading ? 'Saving...' : 'Save Disposition & Update'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Taxpayer Contact Card */}
        <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-slate-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-[#16A34A] border border-emerald-500/30 flex items-center justify-center font-bold text-sm">
              <User className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="font-bold text-sm text-white flex items-center gap-2">
                <span>{customer.fullName || `${customer.firstName} ${customer.lastName}`}</span>
                {customer.visaType && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    <Globe className="w-2.5 h-2.5" /> {customer.visaType}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-500" />
                <span>{customer.city ? `${customer.city}, ` : ''}{customer.state || 'US'} {customer.zipCode || ''}</span>
                <span>• TY {lead.taxYear}</span>
              </div>
            </div>
          </div>

          {/* Quick Click-to-Call */}
          <div className="flex items-center gap-2 bg-slate-800/80 p-2 rounded-xl border border-slate-700">
            <a
              href={`tel:${customer.phone}`}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs transition-colors shadow-2xs"
            >
              <PhoneOutgoing className="w-3.5 h-3.5" />
              {customer.phone}
            </a>
            <AppCopyButton text={customer.phone} size="sm" />
          </div>
        </div>

        {/* Previous Call Log History Banner (Auto-detected if exists) */}
        {previousLog && (
          <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200 text-xs text-purple-900 space-y-1 shadow-2xs">
            <div className="flex items-center justify-between font-bold text-[11px] text-purple-900">
              <span className="flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-purple-600" />
                Previous Call Status: <strong>{previousLog.disposition?.replace(/_/g, ' ')}</strong>
              </span>
              {previousLog.callbackScheduledAt && (
                <span className="flex items-center gap-1 text-amber-700">
                  <Clock className="w-3 h-3 text-amber-600" />
                  Scheduled: {new Date(previousLog.callbackScheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(previousLog.callbackScheduledAt).toLocaleDateString([], { month: 'short', day: 'numeric' })})
                </span>
              )}
            </div>
            {previousLog.callSummary && (
              <div className="text-[11px] text-purple-800 font-medium pl-5">
                Notes: "{previousLog.callSummary}"
              </div>
            )}
          </div>
        )}

        {/* Disposition Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
            Select Call Outcome / Disposition *
          </label>
          <div className="space-y-2">
            {dispositions.map((item) => {
              const Icon = item.icon;
              const isSelected = selectedDisposition === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedDisposition(item.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? item.activeClass + ' shadow-2xs font-semibold ring-1 ring-current'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-white shadow-xs' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-500 font-normal">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? 'border-current bg-current'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Callback Date Picker (shown only when Callback disposition is selected) */}
        {selectedDisposition === 'CONNECTED_CALLBACK' && (
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 animate-in fade-in duration-150">
            <label className="block text-xs font-bold text-amber-900 mb-1.5">
              Scheduled Callback Date & Time *
            </label>
            <input
              type="datetime-local"
              value={callbackDate}
              onChange={(e) => setCallbackDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-slate-800"
              required
            />
          </div>
        )}

        {/* Call Summary Notes */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Agent Call Notes & Summary
            </label>
            {previousLog?.callSummary && (
              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                Pre-filled from last call
              </span>
            )}
          </div>
          <textarea
            rows={3}
            value={callSummary}
            onChange={(e) => setCallSummary(e.target.value)}
            placeholder="E.g., Client confirmed filing TY2025 W2 & 1099-B with 1 dependent. Moving to intake..."
            className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#16A34A] bg-white font-medium text-slate-800 placeholder:text-slate-400"
          />
        </div>
      </div>
    </AppModal>
  );
};
