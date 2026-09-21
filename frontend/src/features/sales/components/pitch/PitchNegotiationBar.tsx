import React, { useState, useEffect } from 'react';
import { Tag, Lock, DollarSign, Save, CheckCircle2, MessageSquare } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { salesService } from '../../services/sales-service';
import type { SalesLeadItem, PitchNegotiationStatus } from '../../types/sales.types';
import toast from 'react-hot-toast';

interface PitchNegotiationBarProps {
  lead: SalesLeadItem;
  onUpdateSuccess?: (updatedLead: Partial<SalesLeadItem>) => void;
}

const PITCH_STATUS_OPTIONS: Array<{ value: PitchNegotiationStatus; label: string; shortLabel: string; badgeColor: string }> = [
  {
    value: 'NEED_TIME',
    label: 'Need time (Client needs time to think/review before closing)',
    shortLabel: 'Need Time',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  {
    value: 'PRICING_ISSUE',
    label: 'Pricing issue (Client feels the price is high / asking for discount)',
    shortLabel: 'Pricing Issue',
    badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
  },
  {
    value: 'FILING_WITH_OTHERS',
    label: 'Filing with others (Client decided to file with local CPA or other software)',
    shortLabel: 'Filing with Others',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
  },
  {
    value: 'NEED_CALL_WITH_CPA',
    label: 'Need call with CPA (Client requires technical tax consultation before paying)',
    shortLabel: 'Need Call with CPA',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
  },
  {
    value: 'OTHER_COMMENT',
    label: 'Other comment (Custom note entry)',
    shortLabel: 'Other Comment',
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
  },
];

export const PitchNegotiationBar: React.FC<PitchNegotiationBarProps> = ({ lead, onUpdateSuccess }) => {
  const appId = lead.id || lead.applicationId;
  const initialOriginalFee = Number(
    lead.originalFee ||
    lead.feeBreakdown?.totalServiceFee ||
    (lead.taxDraftSummary as any)?.totalQuotedFee ||
    247
  );

  const initialStatus: PitchNegotiationStatus =
    (lead.pitchStatus as PitchNegotiationStatus) ||
    ((lead.taxDraftSummary as any)?.salesPitch?.pitchStatus as PitchNegotiationStatus) ||
    'NEED_TIME';

  const initialNegotiated =
    lead.negotiatedAmount !== undefined && lead.negotiatedAmount !== null
      ? lead.negotiatedAmount
      : ((lead.taxDraftSummary as any)?.salesPitch?.negotiatedAmount ?? '');

  const initialComment =
    (lead.taxDraftSummary as any)?.salesPitch?.comment ||
    lead.closerCallNotes ||
    lead.notes ||
    '';

  const [pitchStatus, setPitchStatus] = useState<PitchNegotiationStatus>(initialStatus);
  const [originalFee] = useState<number>(initialOriginalFee);
  const [negotiatedAmount, setNegotiatedAmount] = useState<string | number>(initialNegotiated);
  const [comment, setComment] = useState<string>(initialComment);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (lead.pitchStatus) {
      setPitchStatus(lead.pitchStatus as PitchNegotiationStatus);
    }
    if (lead.negotiatedAmount !== undefined && lead.negotiatedAmount !== null) {
      setNegotiatedAmount(lead.negotiatedAmount);
    }
  }, [lead.pitchStatus, lead.negotiatedAmount]);

  const handleSave = async () => {
    setIsSaving(true);
    setIsSaved(false);

    try {
      const parsedNegotiated = negotiatedAmount === '' ? null : Number(negotiatedAmount);
      await salesService.updatePitchNegotiation(appId, {
        pitchStatus,
        originalFee,
        negotiatedAmount: parsedNegotiated,
        comment: comment.trim(),
      });

      setIsSaved(true);
      toast.success('Pitch negotiation status & proposed amount saved to database! 💾✅');

      if (onUpdateSuccess) {
        onUpdateSuccess({
          pitchStatus,
          negotiatedAmount: parsedNegotiated,
          originalFee,
          salesPitch: {
            pitchStatus,
            originalFee,
            negotiatedAmount: parsedNegotiated,
            comment: comment.trim(),
            updatedAt: new Date().toISOString(),
          },
        });
      }

      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save negotiation status');
    } finally {
      setIsSaving(false);
    }
  };

  const currentOption = PITCH_STATUS_OPTIONS.find((o) => o.value === pitchStatus) || PITCH_STATUS_OPTIONS[0];

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 font-sans animate-in fade-in duration-150">
      {/* Top Header Label */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
            <Tag className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
              Closer Pitch Status &amp; Fee Negotiation
            </h4>
            <p className="text-[11px] text-slate-500 font-medium">
              Record live call disposition, fee objections, and client-negotiated counter-offers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${currentOption.badgeColor}`}>
            ● {currentOption.shortLabel}
          </span>
          {isSaved && (
            <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 animate-in fade-in">
              <CheckCircle2 className="w-3 h-3" />
              <span>Saved in DB</span>
            </span>
          )}
        </div>
      </div>

      {/* Horizontal Layout Options */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        {/* 1. Status Dropdown (Col Span 5) */}
        <div className="md:col-span-5 space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            1. Pitch Status / Disposition *
          </label>
          <div className="relative">
            <select
              value={pitchStatus}
              onChange={(e) => {
                setPitchStatus(e.target.value as PitchNegotiationStatus);
                setIsSaved(false);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer shadow-2xs"
            >
              {PITCH_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2. Original Fee Amount (Read-Only) (Col Span 3) */}
        <div className="md:col-span-3 space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
            <span>2. Original Fee Amount</span>
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-0.5">
              <Lock className="w-2.5 h-2.5" /> Read-Only
            </span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              readOnly
              disabled
              value={originalFee.toFixed(2)}
              className="w-full bg-slate-100/80 border border-slate-200 rounded-xl pl-7 pr-3 py-2.5 text-xs font-bold text-slate-600 cursor-not-allowed select-none shadow-2xs"
              title="Standard Certified Fee Quote based on Form 1040 Drake calculation"
            />
          </div>
        </div>

        {/* 3. Negotiated Amount by Client (Col Span 3) */}
        <div className="md:col-span-3 space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            3. Negotiated Amount by Client
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 font-bold text-xs">
              $
            </div>
            <input
              type="number"
              min="0"
              step="1"
              value={negotiatedAmount}
              onChange={(e) => {
                setNegotiatedAmount(e.target.value);
                setIsSaved(false);
              }}
              placeholder="e.g. 200.00"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-7 pr-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* 4. Quick Save Button (Col Span 1) */}
        <div className="md:col-span-1">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="w-full h-[38px] bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer rounded-xl shadow-xs transition-all"
            title="Save status & negotiation to database"
          >
            {isSaving ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Save</span>
                <span className="md:hidden">Save Negotiation</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 5. Custom Comment Input (Strictly visible ONLY when OTHER_COMMENT is selected) */}
      {pitchStatus === 'OTHER_COMMENT' && (
        <div className="pt-2 border-t border-slate-100 animate-in fade-in duration-150 space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
            <span>Custom Negotiation Note / Closer Comment *</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                setIsSaved(false);
              }}
              placeholder="Enter specific client remarks, reasons for discount request, or callback timing..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-2xs"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleSave}
              disabled={isSaving}
              className="shrink-0 h-[34px] px-3 text-xs font-bold border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer rounded-xl"
            >
              Update Note
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
