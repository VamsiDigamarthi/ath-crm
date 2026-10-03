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
  const [code, setCode] = useState('CLOSE50');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<CouponDiscountType>('FLAT');
  const [discountValue, setDiscountValue] = useState<number>(50);
  const [minServiceFee, setMinServiceFee] = useState<number>(200);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number | undefined>(undefined);
  const [justificationCategory, setJustificationCategory] = useState<CouponJustificationCategory>('IMMEDIATE_CLOSING_INCENTIVE');
  const [justificationNotes, setJustificationNotes] = useState('Authorized concession for same-day client fee settlement');
  const [maxUsageLimit, setMaxUsageLimit] = useState<number>(25);
  const [validUntil, setValidUntil] = useState<string>('');

  React.useEffect(() => {
    if (isOpen && !code) {
      setCode(`CLOSE${discountValue}-${Math.floor(100 + Math.random() * 900)}`);
    }
  }, [isOpen, discountValue, code]);

  const generateRandomCode = () => {
    const prefixes = ['CLOSE', 'SAVE', 'REF', 'LOYALTY', 'MATCH', 'SPECIAL'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const val = discountType === 'FLAT' ? discountValue : `${discountValue}PCT`;
    const randomNum = Math.floor(100 + Math.random() * 900);
    setCode(`${randomPrefix}${val}-${randomNum}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCode = (code.trim() || `CLOSE${discountValue}-${Math.floor(100 + Math.random() * 900)}`).toUpperCase();
    if (discountValue <= 0) {
      toast.error('Discount value must be greater than 0');
      return;
    }
    if (!justificationNotes.trim()) {
      toast.error('Please enter manager justification notes');
      return;
    }

    try {
      await onSubmit({
        code: finalCode,
        description: description.trim() || undefined,
        discountType,
        discountValue: Number(discountValue),
        minServiceFee: Number(minServiceFee) || 0,
        maxDiscountAmount: discountType === 'PERCENTAGE' && maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
        justificationCategory,
        justificationNotes: justificationNotes.trim(),
        maxUsageLimit: maxUsageLimit ? Number(maxUsageLimit) : undefined,
        validUntil: validUntil && !isNaN(Date.parse(validUntil)) ? new Date(validUntil).toISOString() : undefined,
      });

      // Reset form with fresh random code
      setCode(`CLOSE${discountValue}-${Math.floor(100 + Math.random() * 900)}`);
      setDescription('');
      setDiscountValue(50);
      setJustificationNotes('Authorized concession for same-day client fee settlement');
    } catch {
      // Handled in parent
    }
  };

  const selectedCategoryMeta = JUSTIFICATION_CATEGORY_LABELS[justificationCategory];

  const labelCls = 'block text-sm font-medium text-slate-700 mb-1.5';
  const inputCls =
    'w-full h-10 px-3 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A]';
  const hintCls = 'text-xs text-slate-400 mt-1';

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="New Coupon"
      description="Each coupon is linked to you and its reason for the audit trail."
      size="lg"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-coupon-form"
            disabled={isSubmitting}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold"
          >
            {isSubmitting ? 'Saving...' : 'Create Coupon'}
          </Button>
        </>
      }
    >
      <form id="create-coupon-form" onSubmit={handleSubmit} className="space-y-5">
        {/* Code & Campaign */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-slate-700">
                Coupon code <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={generateRandomCode}
                className="text-xs font-semibold text-[#16A34A] hover:text-[#15803D] cursor-pointer"
              >
                Generate
              </button>
            </div>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
              placeholder="e.g. CLOSE50"
              required
              className={`${inputCls} font-semibold tracking-wide`}
            />
          </div>
          <div>
            <label className={labelCls}>Campaign note</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
              className={inputCls}
            />
          </div>
        </div>

        {/* Discount Type & Value */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Discount type</label>
            <div className="grid grid-cols-2 gap-1 p-1 h-10 rounded-lg bg-slate-100">
              {(['FLAT', 'PERCENTAGE'] as CouponDiscountType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setDiscountType(t)}
                  className={`rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    discountType === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t === 'FLAT' ? 'Flat ($)' : 'Percent (%)'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>
              Discount value <span className="text-rose-500">*</span>
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
                className={`${inputCls} pr-10`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                {discountType === 'FLAT' ? '$' : '%'}
              </span>
            </div>
          </div>
        </div>

        {/* Fee Rules */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Minimum fee ($)</label>
            <input
              type="number"
              min="0"
              step="10"
              value={minServiceFee}
              onChange={(e) => setMinServiceFee(Number(e.target.value))}
              placeholder="0"
              className={inputCls}
            />
            <p className={hintCls}>Coupon applies only above this fee</p>
          </div>
          {discountType === 'PERCENTAGE' && (
            <div>
              <label className={labelCls}>Max discount ($)</label>
              <input
                type="number"
                min="0"
                value={maxDiscountAmount || ''}
                onChange={(e) => setMaxDiscountAmount(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Optional"
                className={inputCls}
              />
              <p className={hintCls}>Caps the percentage discount</p>
            </div>
          )}
        </div>

        {/* Limits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Usage limit</label>
            <input
              type="number"
              min="1"
              max="10000"
              value={maxUsageLimit}
              onChange={(e) => setMaxUsageLimit(Number(e.target.value))}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Expires on</label>
            <input
              type="datetime-local"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className={inputCls}
            />
            <p className={hintCls}>Leave blank for no expiry</p>
          </div>
        </div>

        <div className="border-t border-slate-100" />

        {/* Justification */}
        <div>
          <label className={labelCls}>
            Reason <span className="text-rose-500">*</span>
          </label>
          <select
            value={justificationCategory}
            onChange={(e) => setJustificationCategory(e.target.value as CouponJustificationCategory)}
            className={`${inputCls} cursor-pointer`}
          >
            {(Object.keys(JUSTIFICATION_CATEGORY_LABELS) as CouponJustificationCategory[]).map((key) => (
              <option key={key} value={key}>
                {JUSTIFICATION_CATEGORY_LABELS[key].label}
              </option>
            ))}
          </select>
          {selectedCategoryMeta && <p className={hintCls}>{selectedCategoryMeta.desc}</p>}
        </div>

        <div>
          <label className={labelCls}>
            Notes <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            value={justificationNotes}
            onChange={(e) => setJustificationNotes(e.target.value)}
            placeholder="Why is this discount approved?"
            required
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A]"
          />
        </div>
      </form>
    </AppModal>
  );
};
