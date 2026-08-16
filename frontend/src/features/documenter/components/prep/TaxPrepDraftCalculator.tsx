import React, { useState } from 'react';
import { Button } from '@/shared/components/Button';
import { 
  Calculator, 
  Sparkles, 
  Send,
  Save,
  Percent
} from 'lucide-react';

export interface TaxDraftComputation {
  filingStatus: 'SINGLE' | 'MFJ' | 'MFS' | 'HOH';
  w2GrossWages: number;
  fedTaxWithheld: number;
  stateTaxWithheld: number;
  interestIncome: number;
  stocksCapitalGains: number;
  standardDeduction: number;
  taxableIncome: number;
  estimatedFedTax: number;
  estimatedFedRefund: number;
  estimatedStateRefund: number;
}

interface TaxPrepDraftCalculatorProps {
  initialDraft?: Partial<TaxDraftComputation> | null;
  onSaveDraft: (draft: TaxDraftComputation) => void;
  onSendToSales: (draft: TaxDraftComputation) => void;
  isSaving?: boolean;
}

export const TaxPrepDraftCalculator: React.FC<TaxPrepDraftCalculatorProps> = ({
  initialDraft,
  onSaveDraft,
  onSendToSales,
  isSaving = false,
}) => {
  const [filingStatus, setFilingStatus] = useState<'SINGLE' | 'MFJ' | 'MFS' | 'HOH'>(
    initialDraft?.filingStatus || 'SINGLE'
  );
  const [w2Wages, setW2Wages] = useState<number | string>(initialDraft?.w2GrossWages ?? '');
  const [fedWithheld, setFedWithheld] = useState<number | string>(initialDraft?.fedTaxWithheld ?? '');
  const [stateWithheld, setStateWithheld] = useState<number | string>(initialDraft?.stateTaxWithheld ?? '');
  const [interestIncome, setInterestIncome] = useState<number | string>(initialDraft?.interestIncome ?? '');
  const [stocksIncome, setStocksIncome] = useState<number | string>(initialDraft?.stocksCapitalGains ?? '');

  // 2025 IRS Standard Deductions
  const standardDeductions: Record<string, number> = {
    SINGLE: 15000,
    MFS: 15000,
    MFJ: 30000,
    HOH: 22500,
  };

  const currentStdDeduction = standardDeductions[filingStatus] || 15000;
  const numW2 = Number(w2Wages) || 0;
  const numFedWithheld = Number(fedWithheld) || 0;
  const numStateWithheld = Number(stateWithheld) || 0;
  const numInterest = Number(interestIncome) || 0;
  const numStocks = Number(stocksIncome) || 0;

  const grossTotal = numW2 + numInterest + numStocks;
  const taxableIncome = grossTotal > 0 ? Math.max(0, grossTotal - currentStdDeduction) : 0;

  // Simplified IRS bracket estimate for quick intake preview
  const computeFedTax = (taxable: number): number => {
    if (taxable <= 0) return 0;
    if (taxable <= 11925) return taxable * 0.10;
    if (taxable <= 48475) return 1192.5 + (taxable - 11925) * 0.12;
    if (taxable <= 103350) return 5578.5 + (taxable - 48475) * 0.22;
    if (taxable <= 197300) return 17651 + (taxable - 103350) * 0.24;
    return 40199 + (taxable - 197300) * 0.32;
  };

  const estimatedFedTax = Math.round(computeFedTax(taxableIncome));
  const estimatedFedRefund = grossTotal > 0 ? Math.round(numFedWithheld - estimatedFedTax) : 0;
  const estimatedStateTax = grossTotal > 0 ? Math.round(taxableIncome * 0.045) : 0;
  const estimatedStateRefund = grossTotal > 0 ? Math.round(numStateWithheld - estimatedStateTax) : 0;

  const currentDraft: TaxDraftComputation = {
    filingStatus,
    w2GrossWages: numW2,
    fedTaxWithheld: numFedWithheld,
    stateTaxWithheld: numStateWithheld,
    interestIncome: numInterest,
    stocksCapitalGains: numStocks,
    standardDeduction: currentStdDeduction,
    taxableIncome,
    estimatedFedTax,
    estimatedFedRefund,
    estimatedStateRefund,
  };

  return (
    <div className="space-y-6">
      {/* Draft Calculation Notice */}
      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#16A34A] shrink-0" />
          <span className="font-medium">
            <strong>Tax Draft Estimator</strong> — Enter taxpayer wage & withholding figures to compute estimated preliminary refund before transferring to Sales.
          </span>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#16A34A] text-white shrink-0">
          Live Calculator
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Parameters */}
        <div className="space-y-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-600" />
              1. Income & Tax Withholding Inputs
            </h4>
          </div>

          {/* Filing Status */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Filing Status (TY2025) *
            </label>
            <select
              value={filingStatus}
              onChange={(e: any) => setFilingStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16A34A] font-semibold text-slate-800"
            >
              <option value="SINGLE">Single ($15,000 Std Ded)</option>
              <option value="MFJ">Married Filing Jointly ($30,000 Std Ded)</option>
              <option value="MFS">Married Filing Separately ($15,000 Std Ded)</option>
              <option value="HOH">Head of Household ($22,500 Std Ded)</option>
            </select>
          </div>

          {/* W-2 Box 1 Wages */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              W-2 Box 1 (Total Wages / Salary) ($) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs text-slate-400 font-bold">$</span>
              <input
                type="number"
                value={w2Wages}
                onChange={(e) => setW2Wages(Number(e.target.value))}
                className="w-full pl-7 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#16A34A] font-bold text-slate-900"
                placeholder="120000"
              />
            </div>
          </div>

          {/* Federal Withheld Box 2 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Fed Withheld (Box 2) ($) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  value={fedWithheld}
                  onChange={(e) => setFedWithheld(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#16A34A] font-bold text-slate-900"
                  placeholder="18500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                State Withheld (Box 17) ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  value={stateWithheld}
                  onChange={(e) => setStateWithheld(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#16A34A] font-bold text-slate-900"
                  placeholder="4500"
                />
              </div>
            </div>
          </div>

          {/* Other 1099 Income */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                1099-INT/DIV Interest ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  value={interestIncome}
                  onChange={(e) => setInterestIncome(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#16A34A] font-semibold text-slate-800"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                1099-B Stock Gains ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  value={stocksIncome}
                  onChange={(e) => setStocksIncome(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#16A34A] font-semibold text-slate-800"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Refund Computation Result */}
        <div className="space-y-4 bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-md flex flex-col justify-between">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <Percent className="w-4 h-4" />
                2. Live Tax Draft Summary
              </h4>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                TY2025 Rules
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span>Total Gross Income:</span>
                <span className="font-bold text-white">${grossTotal.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Standard Deduction:</span>
                <span className="font-bold text-emerald-400">-${currentStdDeduction.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800 pt-1.5 font-bold text-slate-200">
                <span>Taxable Income:</span>
                <span className="text-white">${taxableIncome.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Estimated Fed Tax Liability:</span>
                <span>${estimatedFedTax.toLocaleString()}</span>
              </div>
            </div>

            {/* Refund Hero Card */}
            <div className="p-4 rounded-xl bg-slate-800/90 border border-emerald-500/30 text-center space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Estimated Federal Refund
              </span>
              <div className={`text-2xl sm:text-3xl font-extrabold ${estimatedFedRefund >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {estimatedFedRefund >= 0 ? `+$${estimatedFedRefund.toLocaleString()}` : `-$${Math.abs(estimatedFedRefund).toLocaleString()}`}
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                Estimated State Refund: <strong className="text-emerald-300">{estimatedStateRefund >= 0 ? `+$${estimatedStateRefund.toLocaleString()}` : `-$${Math.abs(estimatedStateRefund).toLocaleString()}`}</strong>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSaveDraft(currentDraft)}
              disabled={isSaving}
              className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-semibold flex-1 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </Button>

            <Button
              size="sm"
              onClick={() => onSendToSales(currentDraft)}
              disabled={isSaving}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex-1 flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send to Sales</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
