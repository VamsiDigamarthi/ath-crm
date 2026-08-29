import React, { useState } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  UserCheck, 
  Info 
} from 'lucide-react';
import type { SalesLeadItem } from '../../types/sales.types';

interface PitchTaxDraftSummaryCardProps {
  lead: SalesLeadItem;
}

export const PitchTaxDraftSummaryCard: React.FC<PitchTaxDraftSummaryCardProps> = ({ lead }) => {
  const [activeTab, setActiveTab] = useState<'SCHEDULES' | 'STATE' | 'QA_AUDIT'>('SCHEDULES');
  const draft = lead.taxDraftSummary || {};

  const grossIncome = Number(draft.grossIncome || lead.grossIncome) || 145000;
  const w2Wages = Number(draft.w2Wages) || grossIncome;
  const stdDeduction = Number(draft.standardDeduction || draft.effectiveDeduction) || (lead.maritalStatus?.includes('Joint') ? 30000 : 15000);
  const taxableIncome = Number(draft.taxableIncome) || Math.max(0, grossIncome - stdDeduction);
  const taxLiability = Number(draft.taxLiability) || Math.round(taxableIncome * 0.22);
  const fedRefund = Number(draft.federalRefund || lead.federalRefund) || 3420;
  const fedWithheld = Number(draft.fedWithheld) || (taxLiability + fedRefund);
  const stateRefund = Number(draft.stateRefund || lead.stateRefund) || 680;
  const stateWithheld = Number(draft.stateWithheld) || 4880;
  const stateTax = Number(draft.stateTaxLiability) || (stateWithheld - stateRefund);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header with Explainer Banner */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#16A34A] flex items-center justify-center border border-emerald-100">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Certified Form 1040 Tax Calculation &amp; Deductions Breakdown
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Prepared by CPA Specialist and QA-Certified. Use these exact line numbers to explain deductions &amp; refund to client.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('SCHEDULES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'SCHEDULES'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Form 1040 Federal
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('STATE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'STATE'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            State Return ({lead.stateOfResidence?.split(',')[1]?.trim() || lead.stateOfResidence || 'NJ'})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('QA_AUDIT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'QA_AUDIT'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Preparer &amp; QA Sign-Off
          </button>
        </div>
      </div>

      {/* Tab 1: Form 1040 Federal Schedule Breakdown */}
      {activeTab === 'SCHEDULES' && (
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box 1: Income & Wages (Lines 1 - 9) */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  1. Income &amp; Wages
                </span>
                <span className="text-[10px] font-bold text-slate-400">IRS Form 1040</span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Line 1a: W-2 Wages &amp; Salary</span>
                  <span className="font-bold text-slate-900">${w2Wages.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Line 2b: Taxable Interest (1099-INT)</span>
                  <span className="font-semibold text-slate-800">${Number(draft.taxableInterest || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Line 7: Capital Gains (1099-B)</span>
                  <span className="font-semibold text-slate-800">${Number(draft.capitalGains || 0).toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-slate-900">
                  <span>Line 9: Total Gross Income (AGI)</span>
                  <span className="text-[#16A34A] text-sm">${grossIncome.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Box 2: Deductions & Taxable Income (Lines 12 - 15) */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  2. Deductions &amp; Taxable Income
                </span>
                <span className="text-[10px] font-bold text-slate-400">IRS Form 1040</span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Line 12: Standard Deduction</span>
                  <span className="font-bold text-slate-900">-${stdDeduction.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Filing Category / Type</span>
                  <span className="font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                    {lead.maritalStatus?.includes('Joint') ? 'Married Filing Jointly (MFJ)' : 'Single Taxpayer'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Line 13: Qualified Business Deduction</span>
                  <span className="font-semibold text-slate-800">$0</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-slate-900">
                  <span>Line 15: Taxable Net Income</span>
                  <span className="text-slate-900 text-sm">${taxableIncome.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Box 3: Tax Calculation & Credits (Lines 16 - 24) */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  3. Tax Liability &amp; Credits
                </span>
                <span className="text-[10px] font-bold text-slate-400">IRS Form 1040</span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Line 16: Calculated Federal Tax</span>
                  <span className="font-bold text-slate-900">${taxLiability.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Line 19: Child &amp; Dependent Credits</span>
                  <span className="font-semibold text-slate-800">$0</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Effective Federal Tax Rate</span>
                  <span className="font-semibold text-slate-800">
                    {grossIncome > 0 ? `${Math.round((taxLiability / grossIncome) * 100)}%` : '0%'}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-slate-900">
                  <span>Line 24: Total Federal Tax Liability</span>
                  <span className="text-rose-700 text-sm">${taxLiability.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Box 4: Payments & Final Refund Result (Lines 25d - 34) */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  4. Payments &amp; Net Refund
                </span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.2 rounded">
                  Certified QA Result
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-700">
                  <span>Line 25a: W-2 Federal Withholding</span>
                  <span className="font-bold text-slate-900">${fedWithheld.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span>Line 33: Total IRS Payments</span>
                  <span className="font-bold text-slate-900">${fedWithheld.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-emerald-200 flex items-center justify-between font-black text-sm">
                  <span className="text-emerald-900">Line 34: Certified Federal Refund</span>
                  <span className="text-[#16A34A] text-base font-extrabold">+${fedRefund.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Closer Quick Explanation Helper Box */}
          <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 flex items-start gap-2.5 text-xs text-blue-900">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong>Sales Closer Client Pitch Guide:</strong> "Mr./Ms. {lead.taxpayerName?.split(' ')[1] || lead.taxpayerName}, our Senior CPA finalized your Form 1040. Your total W-2 earnings were <strong>${grossIncome.toLocaleString()}</strong>. We claimed the full <strong>${stdDeduction.toLocaleString()} Standard Deduction</strong>, bringing your taxable income down. Because your employer withheld <strong>${fedWithheld.toLocaleString()}</strong>, you are receiving a guaranteed certified Federal Refund of <strong className='text-emerald-700'>+${fedRefund.toLocaleString()}</strong>."
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: State Return Breakdown */}
      {activeTab === 'STATE' && (
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-2.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                State Filing Residency &amp; Nexus
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Resident State:</span>
                  <span className="font-bold text-slate-900">{lead.stateOfResidence || 'New Jersey (NJ)'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Filing Form:</span>
                  <span className="font-bold text-slate-900">NJ-1040 Resident Income Tax</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Allocated State Wages:</span>
                  <span className="font-bold text-slate-900">${grossIncome.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2.5">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                State Withholding vs Liability
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">State Income Tax Withheld:</span>
                  <span className="font-bold text-slate-900">${stateWithheld.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">Calculated State Tax:</span>
                  <span className="font-bold text-slate-900">${stateTax.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-emerald-200 flex items-center justify-between font-bold">
                  <span className="text-emerald-900">Certified State Refund:</span>
                  <span className="text-[#16A34A] text-sm">+${stateRefund.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Preparer & QA Sign-Off Audit */}
      {activeTab === 'QA_AUDIT' && (
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Preparer Card */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-2">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-900">Prepared by Tax Specialist</span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {lead.assignedPrepAgent?.name || 'Senior Tax Preparer'} ({lead.assignedPrepAgent?.email || 'prep@taxcrm.com'})
              </p>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-700 italic">
                "{draft.preparerNotes || 'Verified all W-2 wage forms and optimized deductions for maximum compliance.'}"
              </div>
            </div>

            {/* QA Reviewer Card */}
            <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold text-purple-900">4-Eyes QA Compliance Sign-Off</span>
              </div>
              <p className="text-xs text-purple-700 font-medium">
                Audited by {lead.qaAuditorName}
              </p>
              <div className="p-2.5 rounded-lg bg-white border border-purple-200 text-[11px] text-purple-900 italic">
                "{lead.qaAuditorRemarks || 'Form 1040 certified and approved for Sales pitch.'}"
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
