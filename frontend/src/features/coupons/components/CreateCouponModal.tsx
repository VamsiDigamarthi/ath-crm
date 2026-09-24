import React, { useState } from 'react';
import { AppModal } from '@/shared/components/AppModal';
import { Button } from '@/shared/components/Button';
import {
  JUSTIFICATION_CATEGORY_LABELS,
} from '../types/coupon.types';
import type {
  CouponDiscountType,
  CouponJustificationCategory,
  CreateCouponFormData,
} from '../types/coupon.types';
import {
  Tag,
  DollarSign,
  Percent,
  Sparkles,
  ShieldCheck,
  Calendar,
  Layers,
  HelpCircle,
  AlertCircle,
  Zap,
  Users,
  Award,
  FileText,
  Lock,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CreateCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCouponFormData) => Promise<void>;
  isSubmitting: boolean;
}

export const CreateCouponModal: React.FC<CreateCouponModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<CouponDiscountType>('FLAT');
  const [discountValue, setDiscountValue] = useState<number>(50);
  const [minServiceFee, setMinServiceFee] = useState<number>(250);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number | undefined>(undefined);
  const [justificationCategory, setJustificationCategory] = useState<CouponJustificationCategory>('IMMEDIATE_CLOSING_INCENTIVE');
  const [justificationNotes, setJustificationNotes] = useState('');
  const [maxUsageLimit, setMaxUsageLimit] = useState<number>(25);
  const [validUntil, setValidUntil] = useState<string>('');

  const generateRandomCode = () => {
    const prefixes = ['CLOSE', 'SAVE', 'REF', 'LOYALTY', 'MATCH', 'SPECIAL'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const val = discountType === 'FLAT' ? discountValue : `${discountValue}PCT`;
    const randomNum = Math.floor(100 + Math.random() * 900);
    setCode(`${randomPrefix}${val}-${randomNum}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error('Coupon code is required');
      return;
    }
    if (discountValue <= 0) {
      toast.error('Discount value must be greater than 0');
      return;
    }
    if (!justificationNotes.trim() || justificationNotes.trim().length < 10) {
      toast.error('Please enter detailed manager justification notes (at least 10 characters)');
      return;
    }

    try {
      await onSubmit({
        code: code.trim().toUpperCase(),
        description: description.trim() || undefined,
        discountType,
        discountValue,
        minServiceFee: minServiceFee || 0,
        maxDiscountAmount: discountType === 'PERCENTAGE' && maxDiscountAmount ? maxDiscountAmount : undefined,
        justificationCategory,
        justificationNotes: justificationNotes.trim(),
        maxUsageLimit: maxUsageLimit || undefined,
        validUntil: validUntil ? new Date(validUntil).toISOString() : undefined,
      });

      // Reset form
      setCode('');
      setDescription('');
      setDiscountValue(50);
      setJustificationNotes('');
    } catch {
      // Handled in parent
    }
  };

  const selectedCategoryMeta = JUSTIFICATION_CATEGORY_LABELS[justificationCategory];

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Manager-Approved Discount Coupon"
      description="Authorize a tracked promotional discount code with mandatory business justification for fee collections."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Top Notification Banner */}
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-emerald-900">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-bold">Manager &amp; Team Leader Audit Control Active</div>
            <div className="text-emerald-700">
              Every issued promo code is permanently attached to your manager identity and the authorized business justification reason.
            </div>
          </div>
        </div>

        {/* 1. Code & Description */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Coupon Code *
              </label>
              <button
                type="button"
                onClick={generateRandomCode}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-Generate Code</span>
              </button>
            </div>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
              placeholder="e.g. CLOSE50, PRICEMATCH75, REF-BONUS-100"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold tracking-wider text-slate-900 bg-white uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Internal Promotion Name / Campaign Note
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Q1 Tax Filing Same-Day Incentive Campaign"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* 2. Discount Type & Value */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Discount Calculation Type
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-200/70 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setDiscountType('FLAT')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  discountType === 'FLAT'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Flat Amount ($)</span>
              </button>

              <button
                type="button"
                onClick={() => setDiscountType('PERCENTAGE')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  discountType === 'PERCENTAGE'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Percent className="w-3.5 h-3.5" />
                <span>Percentage (%)</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Discount Value * ({discountType === 'FLAT' ? '$ USD' : '% Percent'})
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max={discountType === 'PERCENTAGE' ? 100 : 1000}
                step={discountType === 'FLAT' ? '1' : '0.5'}
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">
                {discountType === 'FLAT' ? '$ OFF' : '% OFF'}
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Minimum Service Fee Requirement ($)
            </label>
            <input
              type="number"
              min="0"
              step="10"
              value={minServiceFee}
              onChange={(e) => setMinServiceFee(Number(e.target.value))}
              placeholder="e.g. 250"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Fee must be at least this amount to apply
            </span>
          </div>

          {discountType === 'PERCENTAGE' && (
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Max Cap Limit ($ Optional)
              </label>
              <input
                type="number"
                min="0"
                value={maxDiscountAmount || ''}
                onChange={(e) => setMaxDiscountAmount(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g. 100"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Upper limit ceiling for percentage discount
              </span>
            </div>
          )}
        </div>

        {/* 3. Mandatory Manager Justification Engine */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold tracking-wider uppercase text-emerald-400">
                Mandatory Business Justification (Audit Control)
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Strict CRM Compliance</span>
          </div>

          {/* Justification Category Dropdown */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              Authorized Justification Reason Category *
            </label>
            <select
              value={justificationCategory}
              onChange={(e) => setJustificationCategory(e.target.value as CouponJustificationCategory)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-white bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 cursor-pointer"
            >
              <option value="IMMEDIATE_CLOSING_INCENTIVE">⚡ Immediate Closing Incentive (Same-Day Conversion)</option>
              <option value="PRICING_CONCERN">💰 Pricing Concern / Fee Objection (Price Match Resolution)</option>
              <option value="INTERNAL_SERVICE_ISSUE">⚠️ Internal / Employee Service Delay (Apology &amp; Retention)</option>
              <option value="DOCUMENT_UPLOAD_FRICTION">📄 Document Upload Friction (Portal Usability Courtesy)</option>
              <option value="PROVIDED_REFERRALS">🤝 Provided Referrals (Multi-Client Network Bonus)</option>
              <option value="RETURNING_LOYALTY">🌟 Returning Customer Loyalty (Multi-Year Client)</option>
              <option value="OTHER">🛡️ Manager Authorized Exception (Custom Justification)</option>
            </select>

            {selectedCategoryMeta && (
              <p className="text-[11px] text-slate-400 mt-1.5 italic">
                &bull; {selectedCategoryMeta.desc}
              </p>
            )}
          </div>

          {/* Justification Rationale Notes */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              Manager Justification &amp; Audit Notes * (Why is this discount authorized?)
            </label>
            <textarea
              rows={3}
              value={justificationNotes}
              onChange={(e) => setJustificationNotes(e.target.value)}
              placeholder="e.g. Client had competing $275 quote from CPA firm. Approved $50 closing discount to secure multi-state return with $4,200 refund."
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs text-slate-100 bg-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>Must clearly explain the business justification for the finance &amp; audit trail</span>
              <span>{justificationNotes.length} chars (min 10)</span>
            </div>
          </div>
        </div>

        {/* 4. Limits & Expiry */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Maximum Authorized Redemptions
            </label>
            <input
              type="number"
              min="1"
              max="10000"
              value={maxUsageLimit}
              onChange={(e) => setMaxUsageLimit(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Auto-depletes after reaching this usage count
            </span>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Expiration Date (Optional)
            </label>
            <input
              type="datetime-local"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Leave blank for ongoing authorized campaign
            </span>
          </div>
        </div>

        {/* 5. Modal Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isSubmitting ? 'Authorizing Coupon...' : 'Authorize & Save Coupon'}</span>
          </Button>
        </div>
      </form>
    </AppModal>
  );
};
