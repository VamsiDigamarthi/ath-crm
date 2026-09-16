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
  UserX,
  User,
  Globe,
  MapPin,
  Clock,
  History,
  Check,
  PhoneCall
} from 'lucide-react';
import type { DocumenterLeadItem, CallDisposition } from '../types/documenter.types';

export interface CallOutreachModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: DocumenterLeadItem | null;
  onSaveDisposition: (payload: {
    applicationId: string;
    disposition: CallDisposition;
    subDisposition?: string;
    callSummary?: string;
    callbackDate?: string;
    callbackTimezone?: string;
  }) => void;
  isLoading?: boolean;
}

export const PREFERRED_TIMEZONES = [
  'Eastern',
  'Central',
  'Mountain',
  'Pacific',
  'Alaska',
  'Hawaii',
  'Other',
];

interface DispositionConfig {
  id: CallDisposition;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  activeClass: string;
  chipActiveClass: string;
  subOptions: string[];
}

const dispositions: DispositionConfig[] = [
  {
    id: 'CONNECTED_INTERESTED',
    title: 'Connected - Interested in Filing',
    subtitle: 'Initiate Tax Prep & trigger Client Portal Access',
    icon: CheckCircle2,
    color: 'emerald',
    activeClass: 'border-[#16A34A] bg-emerald-50/70 text-[#16A34A]',
    chipActiveClass: 'bg-[#16A34A] text-white border-[#16A34A]',
    subOptions: [
      'Interested – Wants to File',
      'Interested – Wants Tax Planning',
      'Need Amended Return – Form 1040-X',
      'Interested – Needs More Information',
      'Interested – Needs CPA Consultation',
      'Interested – Price Discussion',
      'Callback',
    ],
  },
  {
    id: 'CONNECTED_CALLBACK',
    title: 'Connected - Busy / Call Back Later',
    subtitle: 'Schedule a specific follow-up date & time',
    icon: CalendarClock,
    color: 'amber',
    activeClass: 'border-amber-500 bg-amber-50/70 text-amber-800',
    chipActiveClass: 'bg-amber-600 text-white border-amber-600',
    subOptions: [
      'Client Busy',
      'At Work',
      'Call Back after working hours',
      'Driving',
      'In Meeting',
      'Wants to Discuss with Spouse',
      'Wants to Gather Documents First',
    ],
  },
  {
    id: 'NO_ANSWER_VOICEMAIL',
    title: 'No Answer / Voicemail',
    subtitle: 'Retain in queue and increment outreach attempts',
    icon: PhoneMissed,
    color: 'blue',
    activeClass: 'border-blue-500 bg-blue-50/70 text-blue-800',
    chipActiveClass: 'bg-blue-600 text-white border-blue-600',
    subOptions: [
      'No Answer – No Voicemail Left',
      'No Answer – Voicemail Left',
      'Voicemail Full',
      'Call Went to Voicemail Immediately',
      'Phone Busy',
      'Call Failed',
      'Call Dropped',
      'Ringing – No Response',
      'Not in Service',
    ],
  },
  {
    id: 'CONNECTED_NOT_INTERESTED',
    title: 'Connected – Not Interested',
    subtitle: 'Close lead & mark as Dropped / Cancelled',
    icon: XCircle,
    color: 'rose',
    activeClass: 'border-rose-500 bg-rose-50/70 text-rose-800',
    chipActiveClass: 'bg-rose-600 text-white border-rose-600',
    subOptions: [
      'Already Filed Taxes',
      'Already Has Tax Preparer / CPA',
      'Will File Himself / Own filing',
      'Price Too High',
      'Not Filing This Year',
      'Income Below Filing Requirement',
      'Does Not Need Tax Services',
      'Not Interested in Switching CPA',
      "Doesn't Trust/Know Company",
      'Wants to Wait',
      'Will Contact Later',
      'Tax Situation Too Simple',
      'Other',
    ],
  },
  {
    id: 'INVALID_DISCONNECTED',
    title: 'Invalid / Unreachable Contact',
    subtitle: 'Flag lead for contact number correction',
    icon: PhoneOff,
    color: 'slate',
    activeClass: 'border-slate-500 bg-slate-100 text-slate-800',
    chipActiveClass: 'bg-slate-700 text-white border-slate-700',
    subOptions: [
      'Disconnected Number',
      'Wrong Number',
      'Number Does Not Exist',
      'Phone Number Changed',
      'Number Belongs to Someone Else',
      'Business Number',
      'International Number',
      'Do Not Call Requested',
      'Call Blocking',
      'Unable to Connect',
      'Other',
    ],
  },
  {
    id: 'CLIENT_NOT_QUALIFIED',
    title: 'Client Not Qualified',
    subtitle: 'Lead is not eligible or created in error',
    icon: UserX,
    color: 'purple',
    activeClass: 'border-purple-500 bg-purple-50/70 text-purple-800',
    chipActiveClass: 'bg-purple-600 text-white border-purple-600',
    subOptions: [
      'Not a U.S. Taxpayer',
      'No U.S. Filing Requirement',
      'Duplicate Lead',
      'Existing Client',
      'Lead Created in Error',
    ],
  },
];

export const CallOutreachModal: React.FC<CallOutreachModalProps> = ({
  isOpen,
  onClose,
  lead,
  onSaveDisposition,
  isLoading = false,
}) => {
  const [selectedDisposition, setSelectedDisposition] = useState<CallDisposition>('CONNECTED_INTERESTED');
  const [selectedSubDisposition, setSelectedSubDisposition] = useState<string>('');
  const [callSummary, setCallSummary] = useState<string>('');
  const [callbackDate, setCallbackDate] = useState<string>('');
  const [callbackTimezone, setCallbackTimezone] = useState<string>('Eastern');
  const [isPreviousSummaryExpanded, setIsPreviousSummaryExpanded] = useState<boolean>(false);

  // Auto-bind / pre-fill previous call notes & callback time when modal opens
  useEffect(() => {
    if (lead && isOpen) {
      const log = lead.lastCallLog || (lead as any).callLogs?.[0];
      if (log) {
        setSelectedDisposition((log.disposition as CallDisposition) || 'CONNECTED_INTERESTED');
        setCallSummary(log.callSummary || '');
        setSelectedSubDisposition('');
        if (log.callbackScheduledAt) {
          const d = new Date(log.callbackScheduledAt);
          const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
          setCallbackDate(localIso);
        } else {
          setCallbackDate('');
        }
        if (log.callbackTimezone) {
          setCallbackTimezone(log.callbackTimezone);
        } else {
          setCallbackTimezone('Eastern');
        }
      } else {
        setSelectedDisposition('CONNECTED_INTERESTED');
        setSelectedSubDisposition('');
        setCallSummary('');
        setCallbackDate('');
        setCallbackTimezone('Eastern');
      }
    }
  }, [lead, isOpen]);

  if (!lead) return null;

  const customer = lead.customer;
  const previousLog = lead.lastCallLog || (lead as any).callLogs?.[0];

  const handleDispositionChange = (newDisp: CallDisposition) => {
    setSelectedDisposition(newDisp);
    const config = dispositions.find((d) => d.id === newDisp);
    if (config && !config.subOptions.includes(selectedSubDisposition)) {
      setSelectedSubDisposition('');
    }
  };

  const handleSubOptionClick = (sub: string) => {
    if (selectedSubDisposition === sub) {
      setSelectedSubDisposition('');
    } else {
      setSelectedSubDisposition(sub);
    }
  };

  const isCallbackRequired = selectedDisposition === 'CONNECTED_CALLBACK' || selectedSubDisposition === 'Callback';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveDisposition({
      applicationId: lead.id,
      disposition: selectedDisposition,
      subDisposition: selectedSubDisposition || undefined,
      callSummary,
      callbackDate: isCallbackRequired ? callbackDate : undefined,
      callbackTimezone: isCallbackRequired ? callbackTimezone : undefined,
    });
  };

  const previousCallsCount = (lead as any).callLogs?.length ?? (lead as any).totalCalls ?? (lead.lastCallLog ? 1 : 0);
  const attemptNumber = previousCallsCount + 1;

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-2xl"
      title={
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-slate-900">
              Outreach Call & Disposition Logger
            </h3>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200 shadow-2xs">
              <PhoneCall className="w-3 h-3 text-[#16A34A]" />
              Attempt #{attemptNumber}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Conduct phone call with {customer.firstName} {customer.lastName} and log outcome
          </p>
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 flex-wrap">
            <span>Outreach Stage: <strong className="text-slate-700">{lead.currentStage}</strong></span>
            <span>•</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Attempt #{attemptNumber}
            </span>
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
              disabled={isLoading || (isCallbackRequired && !callbackDate)}
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

          {/* Attempt Badge & Quick Click-to-Call */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-xs shadow-2xs whitespace-nowrap">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span>Attempt #{attemptNumber}</span>
            </div>

            <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
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
        </div>

        {/* Previous Call Log History Banner */}
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
                <p className={`leading-relaxed ${isPreviousSummaryExpanded ? '' : 'line-clamp-2'}`}>
                  Notes: "{previousLog.callSummary}"
                </p>
                {previousLog.callSummary.length > 100 && (
                  <button
                    type="button"
                    onClick={() => setIsPreviousSummaryExpanded((prev) => !prev)}
                    className="text-[10px] font-bold text-purple-700 hover:text-purple-900 hover:underline mt-0.5 cursor-pointer transition-colors"
                  >
                    {isPreviousSummaryExpanded ? 'Show less' : '... Read more'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Disposition Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 tracking-wide mb-2.5">
            Select Call Outcome / Disposition *
          </label>
          <div className="space-y-2.5">
            {dispositions.map((item) => {
              const Icon = item.icon;
              const isSelected = selectedDisposition === item.id;
              return (
                <div
                  key={item.id}
                  className={`rounded-xl border transition-all ${
                    isSelected
                      ? item.activeClass + ' shadow-xs ring-1 ring-current'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div
                    onClick={() => handleDispositionChange(item.id)}
                    className="flex items-center justify-between p-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
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

                  {/* Sub-options Chips (Shown when this disposition is selected) */}
                  {isSelected && item.subOptions && item.subOptions.length > 0 && (
                    <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-200/60 mt-1">
                      <div className="text-[11px] font-semibold text-slate-600 mb-2 flex items-center gap-1">
                        <span>Select Sub-Outcome / Reason:</span>
                        {selectedSubDisposition && (
                          <span className="font-bold text-[#16A34A] text-[11px]">
                            ({selectedSubDisposition})
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {item.subOptions.map((sub) => {
                          const isChipSelected = selectedSubDisposition === sub;
                          return (
                            <button
                              key={sub}
                              type="button"
                              onClick={() => handleSubOptionClick(sub)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                                isChipSelected
                                  ? `${item.chipActiveClass} shadow-xs font-semibold`
                                  : 'bg-white/90 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-white hover:text-slate-900'
                              }`}
                            >
                              {isChipSelected && <Check className="w-3 h-3 shrink-0 stroke-[2.5]" />}
                              <span>{sub}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Callback Date, Time & Timezone Scheduler */}
        {isCallbackRequired && (
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 animate-in fade-in duration-150 space-y-3 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
              <CalendarClock className="w-4 h-4 text-amber-600" />
              <span>Schedule Follow-Up Appointment *</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-amber-900 mb-1">
                  Callback Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={callbackDate}
                  onChange={(e) => setCallbackDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-slate-800 shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-amber-900 mb-1">
                  Client Preferred Timezone *
                </label>
                <select
                  value={callbackTimezone}
                  onChange={(e) => setCallbackTimezone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-slate-800 shadow-2xs cursor-pointer"
                >
                  {PREFERRED_TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz} Time
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Call Summary Notes */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700 tracking-wide">
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
