import React from 'react';
import { Sparkles, FileText } from 'lucide-react';

interface ReviewerAuditCalculationsPanelProps {
  taxDraftSummary: any;
  preparerNotes: string;
  assignedPreparer: { name: string; email: string } | null;
}

export const ReviewerAuditCalculationsPanel: React.FC<ReviewerAuditCalculationsPanelProps> = ({
  taxDraftSummary = {},
  preparerNotes,
  assignedPreparer,
}) => {
  const w2Wages = Number(taxDraftSummary?.w2Wages) || 0;
  const taxableInterest = Number(taxDraftSummary?.taxableInterest) || 0;
  const capitalGains = Number(taxDraftSummary?.capitalGains) || 0;
  const otherIncome = Number(taxDraftSummary?.otherIncome) || 0;
  const totalGrossIncome = Number(taxDraftSummary?.totalGrossIncome) || (w2Wages + taxableInterest + capitalGains + otherIncome);
  const deductionType = taxDraftSummary?.deductionType || 'STANDARD';
  const effectiveDeduction = Number(taxDraftSummary?.effectiveDeduction) || (deductionType === 'STANDARD' ? 29200 : Number(taxDraftSummary?.itemizedDeduction) || 0);
  const taxableIncome = Number(taxDraftSummary?.taxableIncome) || Math.max(0, totalGrossIncome - effectiveDeduction);
  const taxLiability = Number(taxDraftSummary?.taxLiability) || 0;
  const fedWithheld = Number(taxDraftSummary?.fedWithheld) || 0;
  const taxCredits = Number(taxDraftSummary?.taxCredits) || 0;
  const federalRefund = Number(taxDraftSummary?.federalRefund) || Math.max(0, (fedWithheld + taxCredits) - taxLiability);
  const balanceDue = Number(taxDraftSummary?.balanceDue) || Math.max(0, taxLiability - (fedWithheld + taxCredits));
  const stateWithheld = Number(taxDraftSummary?.stateWithheld) || 0;
  const stateRefund = Number(taxDraftSummary?.stateRefund) || 0;
  const stateBalanceDue = Number(taxDraftSummary?.stateBalanceDue) || 0;
  const combinedRefund = federalRefund + stateRefund;
  const preparerName = assignedPreparer?.name || 'Tax Preparer';

  return (
    <div className="space-y-6">
      {/* 1. Live Computation Result Banner */}
      <div className="bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 rounded-xl p-5 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-200 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-purple-300" />
            <span>Preparer Form 1040 Live Computation</span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight">
              {federalRefund > 0 ? `+$${federalRefund.toLocaleString()}` : `-$${balanceDue.toLocaleString()}`}
            </span>
            <span className="text-sm font-semibold text-purple-200">
              {federalRefund > 0 ? 'Fed Refund' : 'Fed Tax Due'}
            </span>
          </div>
          <div className="text-xs text-purple-200 font-medium mt-1">
            State IL: {stateRefund > 0 ? `+$${stateRefund.toLocaleString()} Refund` : `-$${stateBalanceDue.toLocaleString()} Due`} • Combined Total: ${combinedRefund.toLocaleString()}
          </div>
        </div>

        <div className="text-right sm:border-l sm:border-purple-600 sm:pl-6">
          <div className="text-[11px] text-purple-300 uppercase tracking-wider font-bold">
            Taxable Base (Line 15)
          </div>
          <div className="text-2xl font-bold text-white tracking-tight mt-0.5">
            ${taxableIncome.toLocaleString()}
          </div>
          <div className="text-[10px] text-purple-300 font-medium">
            Gross Income: ${totalGrossIncome.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 2. Part 1: Total Gross Income Breakdown */}
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
            Total: ${totalGrossIncome.toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium">Line 1a: W-2 Wages &amp; Salaries</span>
            <div className="text-sm font-bold text-slate-900 mt-0.5">${w2Wages.toLocaleString()}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium">Line 2b: Taxable Interest (1099-INT)</span>
            <div className="text-sm font-bold text-slate-900 mt-0.5">${taxableInterest.toLocaleString()}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium">Line 7: Capital Gains (1099-B)</span>
            <div className="text-sm font-bold text-slate-900 mt-0.5">${capitalGains.toLocaleString()}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium">Line 8: Other Income / 1099-MISC</span>
            <div className="text-sm font-bold text-slate-900 mt-0.5">${otherIncome.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* 3. Part 2: Deductions & Taxable Base */}
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
            Deduction: ${effectiveDeduction.toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={`p-3.5 rounded-xl border ${deductionType === 'STANDARD' ? 'border-emerald-500 bg-emerald-50/40' : 'border-slate-200 bg-slate-50'}`}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">Standard Deduction</span>
              <span className="font-bold text-xs text-[#16A34A]">${effectiveDeduction.toLocaleString()}</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">Applied 2025 IRS standard rate for filing status</p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">Calculated Taxable Base</span>
              <span className="font-bold text-xs text-purple-700">${taxableIncome.toLocaleString()}</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">Line 15 Adjusted Taxable Base</p>
          </div>
        </div>
      </div>

      {/* 4. Part 3: Tax Liability & Withholdings */}
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium">Line 16: Tax Liability</span>
            <div className="text-sm font-bold text-slate-900 mt-0.5">${taxLiability.toLocaleString()}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium">Line 25a: Fed Withheld</span>
            <div className="text-sm font-bold text-[#16A34A] mt-0.5">${fedWithheld.toLocaleString()}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium">State Withheld (Box 17)</span>
            <div className="text-sm font-bold text-blue-700 mt-0.5">${stateWithheld.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* 5. Part 4: Preparer Notes & Audit Observations */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-900 border-b border-slate-100 pb-2.5">
          <FileText className="w-4 h-4 text-purple-600" />
          <span>Part 4: Preparer Notes ({preparerName})</span>
        </div>

        <p className="text-xs text-slate-700 font-medium bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed">
          {preparerNotes || 'No specific observation notes provided by preparer for this return.'}
        </p>
      </div>
    </div>
  );
};
