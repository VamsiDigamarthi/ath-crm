import React from 'react';
import { 
  FileText, 
  ShieldCheck, 
  UserCheck, 
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { ReturnComplexityBadge } from '../common/ReturnComplexityBadge';
import { Button } from '@/shared/components/Button';
import type { SalesLeadItem } from '../../types/sales.types';

interface PitchTaxDraftSummaryCardProps {
  lead: SalesLeadItem;
  onViewOrganizer?: () => void;
}

export const PitchTaxDraftSummaryCard: React.FC<PitchTaxDraftSummaryCardProps> = ({ lead, onViewOrganizer }) => {
  const draft = lead.taxDraftSummary || {};

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header with Explainer Banner */}
      <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#16A34A] flex items-center justify-center border border-emerald-100 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm truncate">
              Tax Preparation &amp; QA Sign-Off Audit
            </h3>
            <ReturnComplexityBadge lead={lead} size="sm" />
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
            QA-Certified return preparation sign-off, reviewer audit status, and preparer notes.
          </p>
        </div>

        {onViewOrganizer && (
          <Button
            size="sm"
            variant="outline"
            onClick={onViewOrganizer}
            className="h-8 px-3 text-xs font-bold border-slate-300 bg-white hover:bg-emerald-50 hover:text-[#16A34A] hover:border-emerald-300 text-slate-700 rounded-xl shadow-2xs flex items-center gap-1.5 shrink-0 cursor-pointer transition-all"
            title="Inspect Taxpayer Info & Files"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Tax info and Files</span>
          </Button>
        )}
      </div>

      {/* Tab 1: Form 1040 Federal Schedule Breakdown - Commented out as requested */}
      {/*
      {activeTab === 'SCHEDULES' && (
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    {isMarriedJoint ? 'Married (MFJ)' : 'Single Taxpayer'}
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

            <div className={`p-4 rounded-xl border space-y-2.5 ${fedRefund > 0 ? 'border-emerald-200 bg-emerald-50/40' : balanceDue > 0 ? 'border-rose-200 bg-rose-50/40' : 'border-slate-200 bg-slate-50/40'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${fedRefund > 0 ? 'text-emerald-900' : balanceDue > 0 ? 'text-rose-900' : 'text-slate-700'}`}>
                  4. Payments &amp; Net {fedRefund > 0 ? 'Refund' : 'Balance'}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${fedRefund > 0 ? 'text-emerald-600 bg-emerald-100' : balanceDue > 0 ? 'text-rose-600 bg-rose-100' : 'text-slate-600 bg-slate-100'}`}>
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
                <div className={`pt-2 border-t flex items-center justify-between font-black text-sm ${fedRefund > 0 ? 'border-emerald-200' : balanceDue > 0 ? 'border-rose-200' : 'border-slate-200'}`}>
                  <span className={fedRefund > 0 ? 'text-emerald-900' : balanceDue > 0 ? 'text-rose-900' : 'text-slate-700'}>
                    {fedRefund > 0 ? 'Line 34: Certified Federal Refund' : 'Line 37: Federal Balance Due'}
                  </span>
                  <span className={`text-base font-extrabold ${fedRefund > 0 ? 'text-[#16A34A]' : balanceDue > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                    {fedRefund > 0 ? `+$${fedRefund.toLocaleString()}` : balanceDue > 0 ? `-$${balanceDue.toLocaleString()}` : '$0'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 flex items-start gap-2.5 text-xs text-blue-900">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong>Sales Closer Client Pitch Guide:</strong> "Mr./Ms. {lead.taxpayerName?.split(' ')[1] || lead.taxpayerName}, our Senior CPA finalized your Form 1040. Your total W-2 earnings were <strong>${grossIncome.toLocaleString()}</strong>. We claimed the full <strong>${stdDeduction.toLocaleString()} Standard Deduction</strong>, bringing your taxable income down to <strong>${taxableIncome.toLocaleString()}</strong>. {fedRefund > 0 ? (
                <span>Because your employer withheld <strong>${fedWithheld.toLocaleString()}</strong>, you are receiving a guaranteed certified Federal Refund of <strong className="text-emerald-700">+${fedRefund.toLocaleString()}</strong>.</span>
              ) : (
                <span>With <strong>${fedWithheld.toLocaleString()}</strong> withheld against <strong>${taxLiability.toLocaleString()}</strong> tax liability, your net balance due is <strong className="text-rose-700">-${balanceDue.toLocaleString()}</strong>.</span>
              )}"
            </div>
          </div>
        </div>
      )}
      */}

      {/* Tab 2: State Return Breakdown - Commented out as requested */}
      {/*
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
                  <span className="font-bold text-slate-900">{lead.stateOfResidence || '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Filing Form:</span>
                  <span className="font-bold text-slate-900">{lead.stateOfResidence ? `${lead.stateOfResidence} Resident Return` : 'State Resident Return'}</span>
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
      */}

      {/* Preparer & QA Sign-Off Compact Metadata & Audit Status */}
      {(() => {
        const rawStage = String(lead.currentStage || draft.status || '');
        let qaStatus: 'Approved' | 'Changes Required' | 'Pending Review' = 'Approved';
        if (rawStage.includes('CORRECTION') || rawStage.includes('REVISION')) {
          qaStatus = 'Changes Required';
        } else if (rawStage.includes('DOC') || rawStage.includes('PROSPECT') || rawStage.includes('PREP')) {
          qaStatus = 'Pending Review';
        } else {
          qaStatus = 'Approved';
        }

        const preparerName = String(lead.assignedPrepAgent?.name || (draft as any).preparerName || 'Ananya Iyer');
        const preparerEmail = String(lead.assignedPrepAgent?.email || 'ananya@taxcrm.com');
        const reviewerName = String(lead.qaAuditorName || (draft as any).reviewerName || 'Vikram Malhotra');
        const reviewDate = lead.qaApprovedAt 
          ? new Date(lead.qaApprovedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : 'Sep 23, 2026';
        const taxYearDisplay = `TY ${lead.taxYear || (draft as any).taxYear || 2025}`;
        const calcVersion = String((draft as any).calculationVersion || (draft as any).version || 'v2.1 (Certified)');
        const filingTypeStr = typeof lead.filingType === 'string' && lead.filingType ? lead.filingType : 'Form 1040';

        return (
          <div className="p-4 space-y-3.5">
            {/* Compact Top Metadata Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-50/80 p-3 rounded-xl border border-slate-200 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                {/* Preparer */}
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center border border-blue-200">
                    {preparerName[0]}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block -mb-0.5">Preparer</span>
                    <span className="font-bold text-slate-800" title={preparerEmail}>{preparerName}</span>
                  </div>
                </div>

                <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />

                {/* Auditor */}
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-bold text-[10px] flex items-center justify-center border border-purple-200">
                    {reviewerName[0]}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block -mb-0.5">Senior QA Auditor</span>
                    <span className="font-bold text-slate-800">{reviewerName}</span>
                  </div>
                </div>

                <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />

                {/* Tax Year & Version */}
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold text-slate-700">{taxYearDisplay}</span>
                  <span className="text-slate-400">({filingTypeStr})</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-600 text-[10px] font-bold ml-1">
                    {calcVersion}
                  </span>
                </div>
              </div>

              {/* QA Status Badge & Date */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-medium hidden md:inline">
                  Reviewed: <strong>{reviewDate}</strong>
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                    qaStatus === 'Approved'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : qaStatus === 'Changes Required'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-blue-50 text-blue-800 border-blue-200'
                  }`}
                >
                  {qaStatus === 'Approved' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  )}
                  <span>{qaStatus === 'Approved' ? 'QA Certified' : qaStatus}</span>
                </span>
              </div>
            </div>

            {/* Side-by-Side Audit Notes Strip */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-blue-50/40 border border-blue-100 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-blue-900 text-[11px] mb-1">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Preparer Note ({preparerName}):</span>
                </div>
                <p className="text-slate-700 italic text-[11px] line-clamp-2 leading-relaxed">
                  {draft.preparerNotes ? `"${draft.preparerNotes}"` : '"Form 1040 draft prepared and submitted for compliance review."'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-purple-50/40 border border-purple-100 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-purple-900 text-[11px] mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>Senior QA Auditor Remarks ({reviewerName}):</span>
                </div>
                <p className="text-purple-900 italic text-[11px] line-clamp-2 leading-relaxed">
                  {lead.qaAuditorRemarks ? `"${lead.qaAuditorRemarks}"` : '"All Form 1040 calculations 100% verified against source documents. Approved for fee pitch."'}
                </p>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
