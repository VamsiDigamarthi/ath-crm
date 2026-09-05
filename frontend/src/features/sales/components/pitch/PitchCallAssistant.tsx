import React, { useState } from 'react';
import { 
  Phone, 
  PhoneOff, 
  Sparkles, 
  Rocket,
  AlertCircle,
  Lock
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import type { SalesLeadItem } from '../../types/sales.types';
import toast from 'react-hot-toast';

interface PitchCallAssistantProps {
  lead: SalesLeadItem;
  paymentStatus: 'UNPAID' | 'PAYMENT_LINK_SENT' | 'PAID' | 'REFUNDED';
  esignStatus: 'NOT_SENT' | 'SENT' | 'VIEWED' | 'SIGNED';
  onDispatchToFiling: () => void;
}

export const PitchCallAssistant: React.FC<PitchCallAssistantProps> = ({
  lead,
  paymentStatus,
  esignStatus,
  onDispatchToFiling,
}) => {
  const [isCalling, setIsCalling] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callNotes, setCallNotes] = useState(lead.notes || '');

  React.useEffect(() => {
    let interval: any = null;
    if (isCalling) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCalling]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartCall = () => {
    setIsCalling(true);
    toast.success(`Dialing ${lead.taxpayerName} (${lead.taxpayerPhone})... 📞`);
  };

  const handleEndCall = () => {
    setIsCalling(false);
    toast(`Call completed (${formatTime(callDuration)}). Call log saved! ⏱️`, {
      icon: '📞',
    });
  };

  const isAlreadyDispatched =
    lead.currentStage === 'FILING_QUEUE' ||
    lead.currentStage === 'FILING_IN_PROGRESS' ||
    lead.currentStage === 'FILING_SUCCESS';

  const isReadyForFiling = paymentStatus === 'PAID' && esignStatus === 'SIGNED' && !isAlreadyDispatched;

  const dispatchTooltip = isAlreadyDispatched
    ? 'Already Dispatched: Form 1040 has been certified, fee-paid, authorized, and transferred to the IRS Modernized e-File (MeF) Queue.'
    : !isReadyForFiling
    ? paymentStatus !== 'PAID' && esignStatus !== 'SIGNED'
      ? 'Cannot Dispatch: Both fee payment and Form 8879 taxpayer authorization are required before dispatching to IRS.'
      : paymentStatus !== 'PAID'
      ? 'Cannot Dispatch: Service fee payment is pending collection.'
      : 'Cannot Dispatch: IRS Form 8879 taxpayer signature authorization is pending.'
    : 'Click to authorize and transfer this certified return to the IRS Modernized e-File (MeF) Department Queue.';

  return (
    <div className="space-y-4 font-sans">
      {/* 1. Integrated Softphone Dialer Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-blue-600" />
            <h4 className="font-bold text-xs sm:text-sm text-slate-900">
              Closer Softphone &amp; Outreach
            </h4>
          </div>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {isCalling ? 'Call in Progress' : 'Ready to Call'}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div>
            <div className="font-bold text-slate-900 text-xs">
              {lead.taxpayerName}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              {lead.taxpayerPhone} • {lead.stateOfResidence}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isCalling ? (
              <>
                <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200 animate-pulse">
                  {formatTime(callDuration)}
                </span>
                <Button
                  size="sm"
                  onClick={handleEndCall}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <PhoneOff className="w-3.5 h-3.5" />
                  <span>End Call</span>
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={handleStartCall}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Client</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Recommended Talking Points */}
      <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80 shadow-2xs space-y-2">
        <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Recommended Closer Talking Points</span>
        </div>

        <ul className="text-[11px] text-amber-900/80 space-y-1.5 list-disc list-inside leading-relaxed">
          <li>
            <strong className="text-amber-950">Certified Calculation Pitch:</strong> &quot;Our Senior Auditor finalized your 1040 Form with a {lead.federalRefund > 0 ? `maximized refund of $${lead.federalRefund.toLocaleString()}` : `minimized balance due of -$${lead.balanceDue.toLocaleString()}`}.&quot;
          </li>
          <li>
            <strong className="text-amber-950">Compliance &amp; State:</strong> &quot;We audited your W-2 wages and optimized state credits to eliminate audit risk.&quot;
          </li>
          <li>
            <strong className="text-amber-950">Payment Close:</strong> &quot;We can transmit this return to the IRS today for ${lead.feeBreakdown.totalServiceFee} all-inclusive.&quot;
          </li>
        </ul>
      </div>

      {/* 3. Call Disposition & Notes */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
        <label className="block text-xs font-bold text-slate-700">
          Closer Call Notes
        </label>
        <textarea
          rows={2}
          value={callNotes}
          onChange={(e) => setCallNotes(e.target.value)}
          placeholder="Record client questions, promised payment time, or discount discussed..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 4. Final Handoff: Dispatch to IRS E-Filing Queue */}
      <div
        className={`p-5 rounded-xl border transition-all ${
          isAlreadyDispatched
            ? 'bg-slate-50 border-slate-200'
            : isReadyForFiling
            ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300 shadow-xs'
            : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Rocket
              className={`w-4 h-4 ${isAlreadyDispatched ? 'text-slate-400' : isReadyForFiling ? 'text-[#16A34A]' : 'text-slate-400'}`}
            />
            <h4 className="font-bold text-xs sm:text-sm text-slate-900">
              IRS E-Filing Dispatch Handoff
            </h4>
          </div>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isAlreadyDispatched
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : isReadyForFiling
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            {isAlreadyDispatched
              ? 'Transferred to Filing Queue'
              : isReadyForFiling
              ? 'Ready to Dispatch'
              : 'Requirements Incomplete'}
          </span>
        </div>

        <div className="space-y-1.5 text-xs text-slate-600 mb-3">
          <div className="flex items-center justify-between">
            <span>1. Service Fee Paid:</span>
            <span className={`font-bold ${paymentStatus === 'PAID' ? 'text-[#16A34A]' : 'text-amber-600'}`}>
              {paymentStatus === 'PAID' ? '✓ Paid ($' + lead.feeBreakdown.totalServiceFee + ')' : '⏳ Pending Payment'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span>2. Form 8879 E-Signed:</span>
            <span className={`font-bold ${esignStatus === 'SIGNED' ? 'text-[#16A34A]' : 'text-amber-600'}`}>
              {esignStatus === 'SIGNED' ? '✓ E-Signed & Verified' : '⏳ Pending Authorization'}
            </span>
          </div>
        </div>

        {/* Clear Explanation when Requirements are Incomplete */}
        {!isReadyForFiling && !isAlreadyDispatched && (
          <div className="mb-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">IRS Transmission Gate:</strong>
              <span className="ml-1">
                {paymentStatus !== 'PAID' && esignStatus !== 'SIGNED'
                  ? 'Both fee payment and Form 8879 taxpayer authorization are required before dispatching to IRS.'
                  : paymentStatus !== 'PAID'
                  ? 'Fee payment is pending. Please collect payment to enable IRS dispatch.'
                  : 'Form 8879 authorization is pending. Please collect digital signature or upload signed PDF to enable IRS dispatch.'}
              </span>
            </div>
          </div>
        )}

        {/* Button with Floating Tooltip matching Reviewer Screen Reference */}
        <div className="relative group w-full" title={dispatchTooltip}>
          <Button
            onClick={onDispatchToFiling}
            disabled={!isReadyForFiling || isAlreadyDispatched}
            className={`w-full text-xs font-bold py-2.5 flex items-center justify-center gap-2 shadow-sm transition-all ${
              isAlreadyDispatched
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 hover:bg-slate-100 pointer-events-none'
                : isReadyForFiling
                ? 'bg-[#16A34A] hover:bg-[#15803D] text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
            }`}
          >
            {isAlreadyDispatched ? (
              <>
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Dispatched to Filing Queue</span>
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4" />
                <span>Dispatch to IRS E-Filing Queue 🚀</span>
              </>
            )}
          </Button>

          {/* Hover Tooltip Popup Card - Matching Reviewer Screen Styling */}
          {(isAlreadyDispatched || !isReadyForFiling) && (
            <div
              className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block w-72 p-2.5 rounded-lg shadow-2xl border border-slate-700 text-left transition-all duration-150"
              style={{ backgroundColor: '#0f172a', color: '#ffffff', zIndex: 9999 }}
            >
              <p className="text-[11px] font-medium leading-relaxed m-0 p-0" style={{ color: '#ffffff' }}>
                {dispatchTooltip}
              </p>
              <div
                className="w-2.5 h-2.5 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 border-r border-b border-slate-700"
                style={{ backgroundColor: '#0f172a' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
