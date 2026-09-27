import React, { useState } from 'react';
import { 
  Calculator, 
  Check, 
  Shield, 
  Globe, 
  Tag, 
  CreditCard, 
  FileCheck,
  Lock,
  History,
  Coins,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { CouponsApiService } from '@/features/coupons/services/coupon-service';
import { JUSTIFICATION_CATEGORY_LABELS } from '@/features/coupons/types/coupon.types';
import type { SalesFeeBreakdown, SalesPaymentStatus, PaymentHistoryItem } from '../../types/sales.types';
import toast from 'react-hot-toast';

const AVAILABLE_STATES = [
  { code: 'IL', name: 'Illinois (IL)', hasTax: true },
  { code: 'CA', name: 'California (CA)', hasTax: true },
  { code: 'NY', name: 'New York (NY)', hasTax: true },
  { code: 'WA', name: 'Washington (WA - No State Income Tax)', hasTax: false },
  { code: 'TX', name: 'Texas (TX - No State Income Tax)', hasTax: false },
  { code: 'CT', name: 'Connecticut (CT)', hasTax: true },
  { code: 'NJ', name: 'New Jersey (NJ)', hasTax: true },
];

interface PitchFeeCalculatorProps {
  feeBreakdown: SalesFeeBreakdown;
  onUpdateFeeBreakdown: (updated: SalesFeeBreakdown) => void;
  onOpenPaymentModal: () => void;
  onOpenEsignModal: () => void;
  paymentStatus: SalesPaymentStatus;
  esignStatus: 'NOT_SENT' | 'SENT' | 'VIEWED' | 'SIGNED';
  applicationId?: string;
  customerId?: string;
  isLocked?: boolean;
  lockReason?: string;
  paidAmount?: number;
  remainingBalance?: number;
  paymentHistory?: PaymentHistoryItem[];
  onOpenPaymentHistoryModal?: () => void;
}

export const PitchFeeCalculator: React.FC<PitchFeeCalculatorProps> = ({
  feeBreakdown,
  onUpdateFeeBreakdown,
  onOpenPaymentModal,
  onOpenEsignModal,
  paymentStatus,
  esignStatus,
  applicationId,
  customerId,
  isLocked = false,
  lockReason,
  paidAmount = 0,
  remainingBalance,
  paymentHistory = [],
  onOpenPaymentHistoryModal,
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const isPaymentVerified = paymentStatus === 'PAID' || paidAmount > 0;
  const isQuotationLocked = isLocked || isPaymentVerified;

  const currentFatcaFee = feeBreakdown.fatcaFee || 0;
  const currentFbarFee = feeBreakdown.fbarFee || 0;
  const currentAuditDefenseFee = feeBreakdown.hasAuditDefense ? (feeBreakdown.auditDefenseFee || 29) : 0;
  const effectiveRemainingBalance = remainingBalance !== undefined 
    ? remainingBalance 
    : Math.max(0, feeBreakdown.totalServiceFee - paidAmount);

  const handleToggleState = (stateIdentifier: string) => {
    if (isQuotationLocked) {
      toast.error('Quotation is locked because payment has already been verified.');
      return;
    }
    const targetState = AVAILABLE_STATES.find((s) => s.name === stateIdentifier || s.code === stateIdentifier);
    const standardName = targetState ? targetState.name : stateIdentifier;
    const isSelected = feeBreakdown.selectedStates.some((s) => 
      s === standardName || 
      s === targetState?.code ||
      (targetState && (s.startsWith(targetState.code) || targetState.name.includes(s)))
    );

    const newStates = isSelected
      ? feeBreakdown.selectedStates.filter((s) => !(
          s === standardName || 
          s === targetState?.code ||
          (targetState && (s.startsWith(targetState.code) || targetState.name.includes(s)))
        ))
      : [...feeBreakdown.selectedStates, standardName];

    const stateFeeTotal = newStates.length * 49;
    const total = 
      feeBreakdown.fed1040PrepFee + 
      stateFeeTotal + 
      currentAuditDefenseFee + 
      currentFbarFee + 
      currentFatcaFee - 
      feeBreakdown.discountAmount;

    onUpdateFeeBreakdown({
      ...feeBreakdown,
      selectedStates: newStates,
      statePrepFee: stateFeeTotal,
      totalServiceFee: Math.max(0, total),
    });
  };

  const handleToggleAuditDefense = () => {
    if (isQuotationLocked) {
      toast.error('Quotation is locked because payment has already been verified.');
      return;
    }
    const nextHasDefense = !feeBreakdown.hasAuditDefense;
    const defenseAmount = nextHasDefense ? 29 : 0;
    const total = 
      feeBreakdown.fed1040PrepFee + 
      feeBreakdown.statePrepFee + 
      defenseAmount + 
      currentFbarFee + 
      currentFatcaFee - 
      feeBreakdown.discountAmount;

    onUpdateFeeBreakdown({
      ...feeBreakdown,
      hasAuditDefense: nextHasDefense,
      auditDefenseFee: defenseAmount,
      totalServiceFee: Math.max(0, total),
    });
  };

  const handleToggleFbar = () => {
    if (isQuotationLocked) {
      toast.error('Quotation is locked because payment has already been verified.');
      return;
    }
    const nextFbarFee = currentFbarFee > 0 ? 0 : 99;
    const total = 
      feeBreakdown.fed1040PrepFee + 
      feeBreakdown.statePrepFee + 
      currentAuditDefenseFee + 
      nextFbarFee + 
      currentFatcaFee - 
      feeBreakdown.discountAmount;

    onUpdateFeeBreakdown({
      ...feeBreakdown,
      fbarFee: nextFbarFee,
      totalServiceFee: Math.max(0, total),
    });
  };

  const handleToggleFatca = () => {
    if (isQuotationLocked) {
      toast.error('Quotation is locked because payment has already been verified.');
      return;
    }
    const nextFatcaFee = currentFatcaFee > 0 ? 0 : 99;
    const total = 
      feeBreakdown.fed1040PrepFee + 
      feeBreakdown.statePrepFee + 
      currentAuditDefenseFee + 
      currentFbarFee + 
      nextFatcaFee - 
      feeBreakdown.discountAmount;

    onUpdateFeeBreakdown({
      ...feeBreakdown,
      fatcaFee: nextFatcaFee,
      hasFatca: nextFatcaFee > 0,
      totalServiceFee: Math.max(0, total),
    });
  };

  const handleApplyCoupon = async () => {
    if (isQuotationLocked) {
      toast.error('Coupon cannot be applied because payment has already been verified.');
      return;
    }
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      toast.error('Please enter a coupon code');
      return;
    }

    const currentSubtotal = 
      feeBreakdown.fed1040PrepFee + 
      feeBreakdown.statePrepFee + 
      currentAuditDefenseFee + 
      currentFbarFee + 
      currentFatcaFee;

    setIsApplyingCoupon(true);
    try {
      const res = await CouponsApiService.validateCoupon(
        code,
        currentSubtotal,
        applicationId,
        customerId
      );

      if (res.isValid) {
        const discount = Number(res.discountAmount) || 0;
        const total = Math.max(0, currentSubtotal - discount);

        onUpdateFeeBreakdown({
          ...feeBreakdown,
          discountAmount: discount,
          discountCode: res.code,
          justificationCategory: res.justificationCategory,
          justificationNotes: res.justificationNotes,
          approvedByName: res.approvedBy?.name,
          totalServiceFee: total,
        });

        toast.success(`Coupon ${res.code} applied! -$${discount} discount added.`);
        setCouponCode('');
      } else {
        toast.error(res.rejectionReason || 'Invalid or non-applicable coupon code');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to validate coupon';
      toast.error(msg);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveDiscount = () => {
    if (isQuotationLocked) {
      toast.error('Coupon cannot be removed because payment has already been verified.');
      return;
    }
    const total = 
      feeBreakdown.fed1040PrepFee + 
      feeBreakdown.statePrepFee + 
      currentAuditDefenseFee + 
      currentFbarFee + 
      currentFatcaFee;

    onUpdateFeeBreakdown({
      ...feeBreakdown,
      discountAmount: 0,
      discountCode: '',
      justificationCategory: undefined,
      justificationNotes: undefined,
      approvedByName: undefined,
      totalServiceFee: total,
    });
    toast.success('Discount removed');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-6">
      {/* 1. Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-sm sm:text-base text-slate-900">
            Interactive Fee Quotation &amp; Pricing Engine
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {paymentHistory.length > 0 && (
            <button
              type="button"
              onClick={onOpenPaymentHistoryModal || onOpenPaymentModal}
              className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span>Payment Ledger ({paymentHistory.length})</span>
            </button>
          )}
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Standard 1040 Rate
          </span>
        </div>
      </div>

      {/* 2. Interactive Fee Options */}
      <div className="space-y-4">
        {/* Item 1: Base Federal 1040 Prep Fee */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-slate-900">Federal Form 1040 Preparation &amp; E-File</div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
              Includes W-2 wage aggregation, Schedule B interest, and standard deduction optimization.
            </div>
          </div>
          <div className="text-sm font-black text-slate-900 shrink-0">
            ${feeBreakdown.fed1040PrepFee}
          </div>
        </div>

        {/* Item 2: State Tax Return Filing (Selectable checkboxes) */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900">State Tax Return Preparation ($49 / State)</div>
              <div className="text-[11px] text-slate-500 font-medium">
                Select states where the client lived or worked during tax year 2025.
              </div>
            </div>
            <div className="text-sm font-black text-slate-900">
              ${feeBreakdown.statePrepFee}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            {AVAILABLE_STATES.map((state) => {
              const isChecked = feeBreakdown.selectedStates.some((s) => 
                s === state.name || 
                s === state.code || 
                s.startsWith(state.code) || 
                state.name.includes(s)
              );
              return (
                <label
                  key={state.code}
                  className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    isChecked
                      ? 'border-blue-500 bg-blue-50/60 font-bold text-blue-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleState(state.name)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>{state.name}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Item 3: Audit Defense Shield (Toggle) */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#16A34A] flex items-center justify-center shrink-0 border border-emerald-100">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>Audit Defense &amp; IRS Representation Shield</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  Recommended
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                100% CPA representation if IRS audits or issues notice within 3 years (+$29).
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleAuditDefense}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
              feeBreakdown.hasAuditDefense ? 'bg-[#16A34A]' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                feeBreakdown.hasAuditDefense ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Item 4: FBAR & Foreign Assets Compliance */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Foreign Bank Account FBAR (FinCEN Form 114)</div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                Required for taxpayers with foreign bank balances &gt; $10,000 (+$99).
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleFbar}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentFbarFee > 0
                ? 'bg-purple-600 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {currentFbarFee > 0 ? 'Added (+$99)' : '+ Add FBAR'}
          </button>
        </div>

        {/* Item 4b: FATCA Option (Foreign Account Tax Compliance Act Form 8938) */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Foreign Account Tax Compliance Act FATCA (Form 8938)</div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                Required for taxpayers with foreign financial assets &gt; $50,000 (+$99).
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleFatca}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentFatcaFee > 0
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {currentFatcaFee > 0 ? 'Added (+$99)' : '+ Add FATCA'}
          </button>
        </div>

        {/* Item 5: Discount Coupon Code */}
        <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
                <Tag className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Manager-Authorized Discount Coupon</div>
                <div className="text-[11px] text-slate-500 font-medium">
                  Apply manager-issued promo code during customer fee collection.
                </div>
              </div>
            </div>

            {feeBreakdown.discountAmount > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#16A34A] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  {feeBreakdown.discountCode}: -${feeBreakdown.discountAmount}
                </span>
                {isQuotationLocked ? (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg flex items-center gap-1 border border-emerald-200">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Applied &amp; Verified</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleRemoveDiscount}
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold cursor-pointer transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            ) : isQuotationLocked ? (
              <div className="text-xs font-semibold text-slate-400 italic">
                (Fee Locked - Payment Verified)
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApplyCoupon();
                    }
                  }}
                  placeholder="Enter promo code"
                  className="w-40 text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 uppercase font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Button
                  size="sm"
                  onClick={handleApplyCoupon}
                  disabled={isApplyingCoupon || !couponCode.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isApplyingCoupon ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Apply</span>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* If coupon is applied, show Manager-Approved Justification banner */}
          {feeBreakdown.discountAmount > 0 && (
            <div className="pt-2.5 border-t border-slate-200/80 bg-white p-3 rounded-lg border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Authorized Justification:</span>
                </span>
                {feeBreakdown.justificationCategory && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {JUSTIFICATION_CATEGORY_LABELS[feeBreakdown.justificationCategory as keyof typeof JUSTIFICATION_CATEGORY_LABELS]?.label || feeBreakdown.justificationCategory}
                  </span>
                )}
                {feeBreakdown.approvedByName && (
                  <span className="text-[10px] text-slate-400">
                    Approved by: <strong className="text-slate-700">{feeBreakdown.approvedByName}</strong>
                  </span>
                )}
              </div>
              {feeBreakdown.justificationNotes && (
                <div className="text-[11px] text-slate-600 italic">
                  &ldquo;{feeBreakdown.justificationNotes}&rdquo;
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. Final Summary & 1-Click Action Buttons */}
      <div className="pt-4 border-t border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 rounded-xl">
        <div className="space-y-1">
          <div className="text-xs text-slate-300 font-medium flex items-center gap-2">
            <span>Total Quoted Service Fee</span>
            {paidAmount > 0 && paymentStatus !== 'PAID' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                Partially Paid (${paidAmount} Paid)
              </span>
            )}
          </div>
          <div className="text-3xl font-black text-white tracking-tight flex items-baseline gap-2">
            <span>${feeBreakdown.totalServiceFee}</span>
            <span className="text-xs font-semibold text-emerald-400">
              (All-Inclusive 1040 Filing)
            </span>
          </div>
          {paidAmount > 0 && (
            <div className="flex items-center gap-3 text-xs pt-1">
              <div className="flex items-center gap-1 text-emerald-300">
                <Coins className="w-3.5 h-3.5" />
                <span>Paid: <strong>${paidAmount}</strong></span>
              </div>
              <div className="flex items-center gap-1 text-amber-300">
                <span>Remaining Due: <strong>${effectiveRemainingBalance}</strong></span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
          {isLocked && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[11px] font-semibold">
              <Lock className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              <span>{lockReason || 'Payment & E-Sign locked while return is in revision'}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2.5">
            {paymentStatus !== 'PAID' ? (
              <Button
                size="sm"
                disabled={isLocked}
                title={isLocked ? lockReason || 'Payment collection locked while return is in revision' : undefined}
                onClick={() => !isLocked && onOpenPaymentModal()}
                className={`text-xs font-bold flex items-center gap-1.5 shadow-md ${
                  isLocked
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600 opacity-60'
                    : 'bg-[#16A34A] hover:bg-[#15803D] text-white cursor-pointer'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>
                  {paidAmount > 0
                    ? `Collect Balance ($${effectiveRemainingBalance})`
                    : `Collect Payment ($${feeBreakdown.totalServiceFee})`}
                </span>
              </Button>
            ) : (
              <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400 text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-bold">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Payment Verified ($ {feeBreakdown.totalServiceFee})</span>
              </div>
            )}

            {esignStatus !== 'SIGNED' ? (
              <Button
                variant="outline"
                size="sm"
                disabled={isLocked}
                title={isLocked ? lockReason || 'E-Sign authorization locked while return is in revision' : undefined}
                onClick={() => !isLocked && onOpenEsignModal()}
                className={`border-white/20 text-xs font-bold flex items-center gap-1.5 ${
                  isLocked
                    ? 'bg-white/5 text-slate-400 cursor-not-allowed opacity-60'
                    : 'bg-white/10 hover:bg-white/20 text-white cursor-pointer'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                <span>Authorize Form 8879</span>
              </Button>
            ) : (
              <div className="flex items-center gap-1.5 bg-blue-500/20 border border-blue-400 text-blue-200 px-3 py-1.5 rounded-lg text-xs font-bold">
                <Check className="w-4 h-4 text-blue-300" />
                <span>Form 8879 E-Signed</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
