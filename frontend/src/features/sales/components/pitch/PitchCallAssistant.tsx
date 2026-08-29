import React, { useState } from 'react';
import { 
  Phone, 
  PhoneOff, 
  Clock, 
  Sparkles, 
  Rocket
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
  const [callDuration] = useState(142); // 02:22
  const [callNotes, setCallNotes] = useState(lead.notes || '');

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleCall = () => {
    if (!isCalling) {
      setIsCalling(true);
      toast.success(`Connected to ${lead.taxpayerName} (${lead.taxpayerPhone}) 📞`);
    } else {
      setIsCalling(false);
      toast.success('Call ended. Please record call disposition.');
    }
  };

  const isReadyForFiling = paymentStatus === 'PAID' && esignStatus === 'SIGNED';

  return (
    <div className="space-y-4">
      {/* 1. Live Phone Call Controller */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-blue-600" />
            <h4 className="font-bold text-xs sm:text-sm text-slate-900">
              Taxpayer Phone Line &amp; Closer Assistant
            </h4>
          </div>

          {isCalling && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 animate-pulse">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTimer(callDuration)}</span>
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <div className="text-xs font-bold text-slate-900">{lead.taxpayerPhone}</div>
            <div className="text-[10px] text-slate-500 font-medium">Direct Mobile Line</div>
          </div>

          <Button
            size="sm"
            onClick={handleToggleCall}
            className={`text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
              isCalling
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isCalling ? (
              <>
                <PhoneOff className="w-3.5 h-3.5" />
                <span>End Call</span>
              </>
            ) : (
              <>
                <Phone className="w-3.5 h-3.5" />
                <span>Call Client</span>
              </>
            )}
          </Button>
        </div>

        {/* 2. Talking Points & Pitch Script Assistant */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Recommended Closer Talking Points</span>
          </div>

          <div className="space-y-1.5 text-[11px] text-slate-600 bg-amber-50/50 p-3 rounded-xl border border-amber-200/80 leading-relaxed">
            <p>
              • <strong>Certified Refund Pitch:</strong> "Our Senior Auditor certified your 1040 return with eligible <strong>+${lead.federalRefund.toLocaleString()}</strong> Federal refund."
            </p>
            <p>
              • <strong>Compliance &amp; State:</strong> "We audited your W-2 wages and optimized state credits to eliminate audit risk."
            </p>
            <p>
              • <strong>Payment Close:</strong> "We can transmit this return to the IRS today for just <strong>${lead.feeBreakdown.totalServiceFee}</strong> all-inclusive."
            </p>
          </div>
        </div>

        {/* 3. Closer Notes */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-700 block">Closer Call Notes</label>
          <textarea
            rows={2}
            value={callNotes}
            onChange={(e) => setCallNotes(e.target.value)}
            placeholder="Record client questions, promised payment time, or discount discussed..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 4. Final Handoff: Dispatch to IRS E-Filing Queue */}
      <div
        className={`p-5 rounded-xl border transition-all ${
          isReadyForFiling
            ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300 shadow-xs'
            : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Rocket
              className={`w-4 h-4 ${isReadyForFiling ? 'text-[#16A34A]' : 'text-slate-400'}`}
            />
            <h4 className="font-bold text-xs sm:text-sm text-slate-900">
              IRS E-Filing Dispatch Handoff
            </h4>
          </div>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isReadyForFiling
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            {isReadyForFiling ? 'Ready to Dispatch' : 'Requirements Incomplete'}
          </span>
        </div>

        <div className="space-y-1.5 text-xs text-slate-600 mb-4">
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

        <Button
          onClick={onDispatchToFiling}
          disabled={!isReadyForFiling}
          className={`w-full text-xs font-bold py-2.5 flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
            isReadyForFiling
              ? 'bg-[#16A34A] hover:bg-[#15803D] text-white'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Rocket className="w-4 h-4" />
          <span>Dispatch to IRS E-Filing Queue 🚀</span>
        </Button>
      </div>
    </div>
  );
};
