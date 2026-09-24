import React, { useState } from 'react';
import { Button } from '@/shared/components/Button';
import { AppCopyButton } from '@/shared/components/AppCopyButton';
import {
  JUSTIFICATION_CATEGORY_LABELS,
} from '../types/coupon.types';
import type {
  CouponValidationResult,
} from '../types/coupon.types';
import {
  Calculator,
  CheckCircle2,
  AlertCircle,
  Tag,
  DollarSign,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  User,
  Info,
} from 'lucide-react';

interface CouponValidationSimulatorProps {
  onSimulate: (code: string, fee: number) => Promise<void>;
  result: CouponValidationResult | null;
  error: string | null;
  isLoading: boolean;
  initialCode?: string;
  initialFee?: number;
}

export const CouponValidationSimulator: React.FC<CouponValidationSimulatorProps> = ({
  onSimulate,
  result,
  error,
  isLoading,
  initialCode = 'CLOSE50',
  initialFee = 350,
}) => {
  const [code, setCode] = useState(initialCode);
  const [fee, setFee] = useState(initialFee);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      onSimulate(code.trim().toUpperCase(), fee);
    }
  };

  const selectedCategoryMeta = result ? JUSTIFICATION_CATEGORY_LABELS[result.justificationCategory] : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-600" />
            <span>CRM Fee Quotation Engine &bull; Live Coupon Simulator</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Test any promo code against client service fees to preview authorized manager justification, discount value, and final fee.
          </p>
        </div>

        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
          Audit-Controlled Sandbox
        </span>
      </div>

      {/* Simulator Input Controls */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-4">
        <div className="sm:col-span-5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
            Promo Code to Test
          </label>
          <div className="relative">
            <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. CLOSE50, PRICEMATCH75"
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold uppercase tracking-wider text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="sm:col-span-4">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
            Sample Service Fee ($)
          </label>
          <div className="relative">
            <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="number"
              min="0"
              step="10"
              value={fee}
              onChange={(e) => setFee(Number(e.target.value))}
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="sm:col-span-3 flex items-end">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-[42px] bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{isLoading ? 'Verifying...' : 'Validate Code'}</span>
          </Button>
        </div>
      </form>

      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-800">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Validation Rejected</div>
            <div className="mt-0.5 text-rose-700">{error}</div>
          </div>
        </div>
      )}

      {/* Live Result Card */}
      {result && (
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-bold text-emerald-400 font-mono tracking-wider">
                COUPON VALIDATED &bull; {result.code}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                Authorized By {result.approvedBy.name} ({result.approvedBy.role})
              </span>
            </div>
          </div>

          {/* Pricing Math Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Original Service Fee
              </div>
              <div className="text-xl font-bold font-mono text-slate-300 line-through">
                ${result.originalFee.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Standard preparation quote</div>
            </div>

            <div className="bg-emerald-950/40 p-4 rounded-xl border border-emerald-500/30">
              <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                Authorized Discount
              </div>
              <div className="text-2xl font-black font-mono text-emerald-400">
                -${result.discountAmount.toFixed(2)}
              </div>
              <div className="text-[10px] text-emerald-300/80 mt-1">
                {result.discountType === 'FLAT' ? 'Flat manager concession' : `${result.discountValue}% percentage discount`}
              </div>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Final Payable Amount
              </div>
              <div className="text-2xl font-black font-mono text-white">
                ${result.finalFee.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Stripe payment checkout fee</div>
            </div>
          </div>

          {/* Business Justification Strip */}
          <div className="bg-slate-800/90 rounded-xl p-4 border border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Manager-Approved Business Justification:</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-900 text-emerald-400 border border-slate-700">
                {selectedCategoryMeta?.label || result.justificationCategory}
              </span>
            </div>

            <p className="text-xs text-slate-300 italic bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
              &ldquo;{result.justificationNotes}&rdquo;
            </p>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <div className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Approving Manager: <strong className="text-slate-200">{result.approvedBy.name}</strong> ({result.approvedBy.email})</span>
              </div>
              <span className="text-emerald-400 font-semibold">Audit Record Ready</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
