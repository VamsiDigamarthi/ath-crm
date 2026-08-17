import React, { useState } from 'react';
import { Button } from '@/shared/components/Button';
import { AppSelect } from '@/shared/components/AppSelect';
import { AppInput } from '@/shared/components/AppInput';
import { 
  Calculator, 
  Sparkles, 
  Send,
  Save,
  DollarSign
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
  organizer?: any;
  customerMaritalStatus?: string;
  taxYear?: number;
  onSaveDraft: (draft: TaxDraftComputation) => void;
  onSendToSales: (draft: TaxDraftComputation) => void;
  isSaving?: boolean;
}

const FILING_STATUS_OPTIONS = [
  { label: 'Single ($15,000 Standard Deduction)', value: 'SINGLE' },
  { label: 'Married Filing Jointly ($30,000 Deduction)', value: 'MFJ' },
  { label: 'Married Filing Separately ($15,000 Deduction)', value: 'MFS' },
  { label: 'Head of Household ($22,500 Deduction)', value: 'HOH' },
];

export const TaxPrepDraftCalculator: React.FC<TaxPrepDraftCalculatorProps> = ({
  initialDraft,
  organizer,
  customerMaritalStatus,
  taxYear = 2025,
  onSaveDraft,
  onSendToSales,
  isSaving = false,
}) => {
  const defaultStatus: 'SINGLE' | 'MFJ' | 'MFS' | 'HOH' =
    initialDraft?.filingStatus ||
    (customerMaritalStatus?.toLowerCase() === 'married' ? 'MFJ' : 'SINGLE');

  const defaultWages = initialDraft?.w2GrossWages ?? organizer?.m4_wages?.estimatedWages ?? '';
  const defaultInterest = initialDraft?.interestIncome ?? organizer?.m5_interest?.interestAmount ?? '';
  const defaultStocks = initialDraft?.stocksCapitalGains ?? organizer?.m6_stocks?.totalCapitalGain ?? '';

  const [filingStatus, setFilingStatus] = useState<'SINGLE' | 'MFJ' | 'MFS' | 'HOH'>(defaultStatus);
  const [w2Wages, setW2Wages] = useState<number | string>(defaultWages);
  const [fedWithheld, setFedWithheld] = useState<number | string>(initialDraft?.fedTaxWithheld ?? '');
  const [stateWithheld, setStateWithheld] = useState<number | string>(initialDraft?.stateTaxWithheld ?? '');
  const [interestIncome, setInterestIncome] = useState<number | string>(defaultInterest);
  const [stocksIncome, setStocksIncome] = useState<number | string>(defaultStocks);

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
  const estimatedStateRefund = numStateWithheld > 0 ? Math.round(numStateWithheld * 0.4) : 0;

  const currentComputation: TaxDraftComputation = {
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
      {/* Input Form Column (7 cols) */}
      <div className="lg:col-span-7 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              1. Income & Tax Withholding Inputs
            </h4>
          </div>
          <span className="text-[10px] font-bold text-slate-400">
            From W-2 / 1099 Statements
          </span>
        </div>

        <div className="space-y-3.5">
          {/* Filing Status Dropdown using AppSelect */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 tracking-tight">
              Filing Status (TY {taxYear}) *
            </label>
            <AppSelect
              options={FILING_STATUS_OPTIONS}
              value={filingStatus}
              onChange={(val) => setFilingStatus((val as any) || 'SINGLE')}
              placeholder="Select Filing Status"
            />
          </div>

          {/* W-2 Box 1 Wages */}
          <AppInput
            label="W-2 Box 1 (Total Wages / Salary) ($) *"
            type="number"
            placeholder="0.00"
            leftIcon={<DollarSign className="w-4 h-4" />}
            value={w2Wages.toString()}
            onChange={(e) => setW2Wages(e.target.value)}
          />

          {/* Federal & State Withheld */}
          <div className="grid grid-cols-2 gap-3">
            <AppInput
              label="Fed Withheld (Box 2) ($) *"
              type="number"
              placeholder="0.00"
              leftIcon={<DollarSign className="w-4 h-4" />}
              value={fedWithheld.toString()}
              onChange={(e) => setFedWithheld(e.target.value)}
            />

            <AppInput
              label="State Withheld (Box 17) ($)"
              type="number"
              placeholder="0.00"
              leftIcon={<DollarSign className="w-4 h-4" />}
              value={stateWithheld.toString()}
              onChange={(e) => setStateWithheld(e.target.value)}
            />
          </div>

          {/* 1099 Interest & Stocks */}
          <div className="grid grid-cols-2 gap-3">
            <AppInput
              label="1099-INT/DIV Interest ($)"
              type="number"
              placeholder="0.00"
              leftIcon={<DollarSign className="w-4 h-4" />}
              value={interestIncome.toString()}
              onChange={(e) => setInterestIncome(e.target.value)}
            />

            <AppInput
              label="1099-B Stock Gains ($)"
              type="number"
              placeholder="0.00"
              leftIcon={<DollarSign className="w-4 h-4" />}
              value={stocksIncome.toString()}
              onChange={(e) => setStocksIncome(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Live Computation Column (5 cols) */}
      <div className="lg:col-span-5 flex flex-col justify-between rounded-xl bg-slate-900 text-white p-5 space-y-4 shadow-sm">
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span>2. Live Tax Draft Summary</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 rounded bg-slate-800">
              TY{taxYear} Rules
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Total Gross Income:</span>
              <span className="font-bold text-white">${grossTotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-slate-300">
              <span>Standard Deduction:</span>
              <span className="font-bold text-emerald-400">-${currentStdDeduction.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-slate-300">
              <span>Taxable Income:</span>
              <span className="font-bold text-white">${taxableIncome.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-slate-300 border-b border-slate-800 pb-2">
              <span>Estimated Fed Tax Liability:</span>
              <span className="font-bold text-rose-400">${estimatedFedTax.toLocaleString()}</span>
            </div>
          </div>

          {/* Refund Hero Display */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 text-center space-y-1">
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 block">
              Estimated Federal Refund
            </span>
            <div className={`text-2xl font-extrabold ${estimatedFedRefund >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {estimatedFedRefund >= 0 ? `+$${estimatedFedRefund.toLocaleString()}` : `-$${Math.abs(estimatedFedRefund).toLocaleString()}`}
            </div>
            {estimatedStateRefund > 0 && (
              <div className="text-[11px] font-medium text-slate-300">
                Estimated State Refund: <strong className="text-emerald-400">+${estimatedStateRefund.toLocaleString()}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <Button
            size="sm"
            onClick={() => onSaveDraft(currentComputation)}
            disabled={isSaving}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving Draft...' : 'Save Draft Computation'}</span>
          </Button>

          <Button
            size="sm"
            onClick={() => onSendToSales(currentComputation)}
            disabled={isSaving || numW2 === 0}
            className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send to Sales Pitch Queue</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
