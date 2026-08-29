import React, { useState } from 'react';
import { 
  Calculator, 
  Check, 
  Shield, 
  Globe, 
  Tag, 
  CreditCard, 
  FileCheck
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import type { SalesFeeBreakdown } from '../../types/sales.types';
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
  paymentStatus: 'UNPAID' | 'PAYMENT_LINK_SENT' | 'PAID' | 'REFUNDED';
  esignStatus: 'NOT_SENT' | 'SENT' | 'VIEWED' | 'SIGNED';
}

export const PitchFeeCalculator: React.FC<PitchFeeCalculatorProps> = ({
  feeBreakdown,
  onUpdateFeeBreakdown,
  onOpenPaymentModal,
  onOpenEsignModal,
  paymentStatus,
  esignStatus,
}) => {
  const [couponCode, setCouponCode] = useState('');

  const handleToggleState = (stateName: string) => {
    const isSelected = feeBreakdown.selectedStates.includes(stateName);
    const newStates = isSelected
      ? feeBreakdown.selectedStates.filter((s) => s !== stateName)
      : [...feeBreakdown.selectedStates, stateName];

    const stateFeeTotal = newStates.length * 49;
    const total = 
      feeBreakdown.fed1040PrepFee + 
      stateFeeTotal + 
      (feeBreakdown.hasAuditDefense ? feeBreakdown.auditDefenseFee : 0) + 
      feeBreakdown.fbarFee - 
      feeBreakdown.discountAmount;

    onUpdateFeeBreakdown({
      ...feeBreakdown,
      selectedStates: newStates,
      statePrepFee: stateFeeTotal,
      totalServiceFee: Math.max(0, total),
    });
  };

  const handleToggleAuditDefense = () => {
    const nextHasDefense = !feeBreakdown.hasAuditDefense;
    const defenseAmount = nextHasDefense ? 29 : 0;
    const total = 
      feeBreakdown.fed1040PrepFee + 
      feeBreakdown.statePrepFee + 
      defenseAmount + 
      feeBreakdown.fbarFee - 
      feeBreakdown.discountAmount;

    onUpdateFeeBreakdown({
      ...feeBreakdown,
      hasAuditDefense: nextHasDefense,
      auditDefenseFee: defenseAmount,
      totalServiceFee: Math.max(0, total),
    });
  };

  const handleToggleFbar = () => {
    const nextFbarFee = feeBreakdown.fbarFee > 0 ? 0 : 99;
    const total = 
      feeBreakdown.fed1040PrepFee + 
      feeBreakdown.statePrepFee + 
      (feeBreakdown.hasAuditDefense ? feeBreakdown.auditDefenseFee : 0) + 
      nextFbarFee - 
      feeBreakdown.discountAmount;

    onUpdateFeeBreakdown({
      ...feeBreakdown,
      fbarFee: nextFbarFee,
      totalServiceFee: Math.max(0, total),
    });
  };

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    let discount = 0;
    if (code === 'EARLYBIRD20' || code === 'SAVE20') {
      discount = 20;
    } else if (code === 'VIP25' || code === 'TAXHERO25') {
      discount = 25;
    } else if (code === 'SPECIAL50') {
      discount = 50;
    } else {
      toast.error('Invalid coupon code');
      return;
    }

    const total = 
      feeBreakdown.fed1040PrepFee + 
      feeBreakdown.statePrepFee + 
      (feeBreakdown.hasAuditDefense ? feeBreakdown.auditDefenseFee : 0) + 
      feeBreakdown.fbarFee - 
      discount;

    onUpdateFeeBreakdown({
      ...feeBreakdown,
      discountAmount: discount,
      discountCode: code,
      totalServiceFee: Math.max(0, total),
    });

    toast.success(`Coupon ${code} applied! -$${discount} discount added.`);
    setCouponCode('');
  };

  const handleRemoveDiscount = () => {
    const total = 
      feeBreakdown.fed1040PrepFee + 
      feeBreakdown.statePrepFee + 
      (feeBreakdown.hasAuditDefense ? feeBreakdown.auditDefenseFee : 0) + 
      feeBreakdown.fbarFee;

    onUpdateFeeBreakdown({
      ...feeBreakdown,
      discountAmount: 0,
      discountCode: '',
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
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          Standard 1040 Rate
        </span>
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
              const isChecked = feeBreakdown.selectedStates.includes(state.name);
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
              feeBreakdown.fbarFee > 0
                ? 'bg-purple-600 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {feeBreakdown.fbarFee > 0 ? 'Added (+$99)' : '+ Add FBAR'}
          </button>
        </div>

        {/* Item 5: Discount Coupon Code */}
        <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-amber-500" />
            <div>
              <div className="text-xs font-bold text-slate-900">Discount Coupon / Promo Code</div>
              <div className="text-[10px] text-slate-400">Try EARLYBIRD20 or TAXHERO25</div>
            </div>
          </div>

          {feeBreakdown.discountAmount > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#16A34A] bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                {feeBreakdown.discountCode}: -${feeBreakdown.discountAmount}
              </span>
              <button
                type="button"
                onClick={handleRemoveDiscount}
                className="text-xs text-rose-600 hover:underline font-bold cursor-pointer"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter promo code"
                className="w-36 text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 uppercase font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
              </input>
              <Button
                size="sm"
                onClick={handleApplyCoupon}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
              >
                Apply
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Final Summary & 1-Click Action Buttons */}
      <div className="pt-4 border-t border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 rounded-xl">
        <div>
          <div className="text-xs text-slate-300 font-medium">Total Quoted Service Fee</div>
          <div className="text-3xl font-black text-white tracking-tight flex items-baseline gap-2">
            <span>${feeBreakdown.totalServiceFee}</span>
            <span className="text-xs font-semibold text-emerald-400">
              (All-Inclusive 1040 Filing)
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {paymentStatus !== 'PAID' ? (
            <Button
              size="sm"
              onClick={onOpenPaymentModal}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Collect Payment ($ {feeBreakdown.totalServiceFee})</span>
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
              onClick={onOpenEsignModal}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
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
  );
};
