import React from 'react';
import { Sparkles, DollarSign, FileText, Lock } from 'lucide-react';

interface Tax1040FormEngineProps {
  w2Wages: number;
  setW2Wages: (v: number) => void;
  taxableInterest: number;
  setTaxableInterest: (v: number) => void;
  capitalGains: number;
  setCapitalGains: (v: number) => void;
  otherIncome: number;
  setOtherIncome: (v: number) => void;
  deductionType: 'STANDARD' | 'ITEMIZED';
  setDeductionType: (v: 'STANDARD' | 'ITEMIZED') => void;
  itemizedDeduction: number;
  setItemizedDeduction: (v: number) => void;
  taxCredits: number;
  setTaxCredits: (v: number) => void;
  fedWithheld: number;
  setFedWithheld: (v: number) => void;
  stateWithheld: number;
  setStateWithheld: (v: number) => void;
  preparerNotes: string;
  setPreparerNotes: (v: string) => void;
  standardDeductionAmount: number;
  isReadOnly?: boolean;
  readOnlyReason?: 'QA_AUDIT' | 'REVERTED_DOCS';
  calculations: {
    totalGrossIncome: number;
    effectiveDeduction: number;
    taxableIncome: number;
    taxLiability: number;
    federalRefund: number;
    balanceDue: number;
    stateTaxLiability: number;
    stateRefund: number;
    stateBalanceDue: number;
    combinedRefund: number;
  };
}

export const Tax1040FormEngine: React.FC<Tax1040FormEngineProps> = ({
  w2Wages,
  setW2Wages,
  taxableInterest,
  setTaxableInterest,
  capitalGains,
  setCapitalGains,
  otherIncome,
  setOtherIncome,
  deductionType,
  setDeductionType,
  itemizedDeduction,
  setItemizedDeduction,
  taxCredits,
  setTaxCredits,
  fedWithheld,
  setFedWithheld,
  stateWithheld,
  setStateWithheld,
  preparerNotes,
  setPreparerNotes,
  standardDeductionAmount,
  isReadOnly = false,
  readOnlyReason = 'QA_AUDIT',
  calculations,
}) => {
  return (
    <div className="space-y-6">
      {/* Read-Only Locked Alerts */}
      {isReadOnly && readOnlyReason === 'REVERTED_DOCS' && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-900 shadow-2xs">
          <div className="flex items-center gap-2 font-semibold">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Form 1040 Locked — Awaiting Documenter Intake:</strong> This return is currently with the Documenter department. Inputs are locked until documents are re-submitted to Preparation.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-900 text-[10px] font-bold uppercase tracking-wider">
            Awaiting Docs
          </span>
        </div>
      )}
      {isReadOnly && readOnlyReason !== 'REVERTED_DOCS' && (
        <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-between text-xs text-purple-900 shadow-2xs">
          <div className="flex items-center gap-2 font-semibold">
            <Lock className="w-4 h-4 text-purple-600 shrink-0" />
            <span>
              <strong>Form 1040 Locked for QA Audit:</strong> This return is currently undergoing 4-Eyes verification by Senior QA Reviewer. Inputs are locked.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-purple-200/70 text-purple-800 text-[10px] font-bold uppercase tracking-wider">
            In QA Review
          </span>
        </div>
      )}

      {/* 1. Live Computation Result Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-[#16A34A] to-teal-700 rounded-xl p-5 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-100 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>Form 1040 Live Tax Calculation Result</span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight">
              {calculations.federalRefund > 0 ? `+$${calculations.federalRefund.toLocaleString()}` : `-$${calculations.balanceDue.toLocaleString()}`}
            </span>
            <span className="text-sm font-semibold text-emerald-100">
              {calculations.federalRefund > 0 ? 'Fed Refund' : 'Fed Tax Due'}
            </span>
          </div>
          <div className="text-xs text-emerald-100 font-medium mt-1">
            State IL: {calculations.stateRefund > 0 ? `+$${calculations.stateRefund.toLocaleString()} Refund` : `-$${calculations.stateBalanceDue.toLocaleString()} Due`} • Combined Total: ${calculations.combinedRefund.toLocaleString()}
          </div>
        </div>

        <div className="text-right sm:border-l sm:border-emerald-500/50 sm:pl-6">
          <div className="text-[11px] text-emerald-200 uppercase tracking-wider font-bold">
            Taxable Income (Line 15)
          </div>
          <div className="text-2xl font-bold text-white tracking-tight mt-0.5">
            ${calculations.taxableIncome.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-200 font-medium">
            Gross: ${calculations.totalGrossIncome.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 2. Part 1: Total Gross Income (Lines 1a - 9) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
              1
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-900">
              Part 1: Total Gross Income (Lines 1a – 9)
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
            Total: ${calculations.totalGrossIncome.toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Line 1a: W-2 Wages */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Line 1a: W-2 Wages &amp; Salaries *
            </label>
            <div className="relative rounded-xl shadow-2xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <input
                type="number"
                disabled={isReadOnly}
                value={w2Wages || ''}
                onChange={(e) => setW2Wages(Number(e.target.value) || 0)}
                className={`w-full rounded-xl border border-slate-200 pl-8 pr-3 py-2 text-xs font-bold text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none ${isReadOnly ? 'bg-slate-100 cursor-not-allowed text-slate-600' : 'bg-white'}`}
                placeholder="0"
              />
            </div>
          </div>

          {/* Line 2b: Taxable Interest */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Line 2b: Taxable Interest (1099-INT)
            </label>
            <div className="relative rounded-xl shadow-2xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <input
                type="number"
                disabled={isReadOnly}
                value={taxableInterest || ''}
                onChange={(e) => setTaxableInterest(Number(e.target.value) || 0)}
                className={`w-full rounded-xl border border-slate-200 pl-8 pr-3 py-2 text-xs font-bold text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none ${isReadOnly ? 'bg-slate-100 cursor-not-allowed text-slate-600' : 'bg-white'}`}
                placeholder="0"
              />
            </div>
          </div>

          {/* Line 7: Capital Gains */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Line 7: Capital Gains (Schedule D / 1099-B)
            </label>
            <div className="relative rounded-xl shadow-2xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <input
                type="number"
                disabled={isReadOnly}
                value={capitalGains || ''}
                onChange={(e) => setCapitalGains(Number(e.target.value) || 0)}
                className={`w-full rounded-xl border border-slate-200 pl-8 pr-3 py-2 text-xs font-bold text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none ${isReadOnly ? 'bg-slate-100 cursor-not-allowed text-slate-600' : 'bg-white'}`}
                placeholder="0"
              />
            </div>
          </div>

          {/* Line 8: Other Income */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Line 8: Other Income / 1099-MISC
            </label>
            <div className="relative rounded-xl shadow-2xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <input
                type="number"
                disabled={isReadOnly}
                value={otherIncome || ''}
                onChange={(e) => setOtherIncome(Number(e.target.value) || 0)}
                className={`w-full rounded-xl border border-slate-200 pl-8 pr-3 py-2 text-xs font-bold text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none ${isReadOnly ? 'bg-slate-100 cursor-not-allowed text-slate-600' : 'bg-white'}`}
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Part 2: Deductions & Taxable Base (Lines 12 - 15) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
              2
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-900">
              Part 2: Deductions &amp; Taxable Base (Lines 12 – 15)
            </h3>
          </div>
          <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
            Deduction: ${calculations.effectiveDeduction.toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Option A: Standard Deduction */}
          <div
            onClick={() => !isReadOnly && setDeductionType('STANDARD')}
            className={`p-4 rounded-xl border transition-all ${
              isReadOnly ? 'cursor-not-allowed' : 'cursor-pointer'
            } ${
              deductionType === 'STANDARD'
                ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-slate-900">Standard Deduction</span>
              <span className="font-bold text-xs text-[#16A34A]">${standardDeductionAmount.toLocaleString()}</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              2025 IRS standard deduction rate for this filing status
            </p>
          </div>

          {/* Option B: Itemized Deduction */}
          <div
            onClick={() => !isReadOnly && setDeductionType('ITEMIZED')}
            className={`p-4 rounded-xl border transition-all ${
              isReadOnly ? 'cursor-not-allowed' : 'cursor-pointer'
            } ${
              deductionType === 'ITEMIZED'
                ? 'border-purple-500 bg-purple-50/40 ring-1 ring-purple-500'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-slate-900">Itemized (Schedule A)</span>
              <span className="font-bold text-xs text-purple-700">${itemizedDeduction.toLocaleString()}</span>
            </div>
            <input
              type="number"
              disabled={isReadOnly}
              value={itemizedDeduction || ''}
              onChange={(e) => {
                if (!isReadOnly) {
                  setDeductionType('ITEMIZED');
                  setItemizedDeduction(Number(e.target.value) || 0);
                }
              }}
              className={`mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none ${isReadOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'}`}
              placeholder="Enter Custom Itemized ($)"
            />
          </div>
        </div>
      </div>

      {/* 4. Part 3: Taxes, Withholdings & Net Refund (Lines 16 - 34) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-50 text-[#16A34A] flex items-center justify-center font-bold text-xs">
              3
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-900">
              Part 3: Taxes, Withholdings &amp; Net Refund (Lines 16 – 34)
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Line 16: Tax Liability */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Line 16: Tax Liability
            </label>
            <div className="bg-slate-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 border border-slate-200">
              ${calculations.taxLiability.toLocaleString()}
            </div>
          </div>

          {/* Line 19: Tax Credits */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Line 19: Tax Credits
            </label>
            <input
              type="number"
              disabled={isReadOnly}
              value={taxCredits || ''}
              onChange={(e) => setTaxCredits(Number(e.target.value) || 0)}
              className={`w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 focus:border-blue-500 focus:outline-none ${isReadOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'}`}
              placeholder="0"
            />
          </div>

          {/* Line 25a: Fed Withheld */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Line 25a: Fed Withheld *
            </label>
            <input
              type="number"
              disabled={isReadOnly}
              value={fedWithheld || ''}
              onChange={(e) => setFedWithheld(Number(e.target.value) || 0)}
              className={`w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 focus:border-blue-500 focus:outline-none ${isReadOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'}`}
              placeholder="0"
            />
          </div>

          {/* State Withheld */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              State Withheld (Box 17) *
            </label>
            <input
              type="number"
              disabled={isReadOnly}
              value={stateWithheld || ''}
              onChange={(e) => setStateWithheld(Number(e.target.value) || 0)}
              className={`w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 focus:border-blue-500 focus:outline-none ${isReadOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'}`}
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* 5. Part 4: Preparer Observations & Audit Notes */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-900 border-b border-slate-100 pb-2.5">
          <FileText className="w-4 h-4 text-purple-600" />
          <span>Part 4: Preparer Notes &amp; Observations for QA Auditor</span>
        </div>

        <textarea
          rows={3}
          disabled={isReadOnly}
          value={preparerNotes}
          onChange={(e) => setPreparerNotes(e.target.value)}
          placeholder="Add notes for Senior QA Auditor (e.g. verified W-2 box 1 vs box 16, dual-state apportionment checked)..."
          className={`w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:border-blue-500 focus:outline-none placeholder:text-slate-400 ${isReadOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'}`}
        />
      </div>
    </div>
  );
};
