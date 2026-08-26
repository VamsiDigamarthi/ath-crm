import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowLeft, 
  CheckCircle2, 
  RotateCcw, 
  Sparkles, 
  CheckSquare, 
  AlertTriangle,
  Calculator,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppConfirmDialog } from '@/shared/components/AppConfirmDialog';
import { AppModal } from '@/shared/components/AppModal';
import toast from 'react-hot-toast';

export const TaxReviewerAuditScreen: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // 1. Audit Context Data
  const returnData = {
    id: id || '3a73c237-e778-45a4-9d57-79171a59cd0e',
    taxpayerName: 'Arjun Varma',
    ssnLast4: '8842',
    taxYear: 2025,
    filingStatus: 'Married Filing Jointly (MFJ)',
    stateOfResidence: 'Springfield, IL',
    visaType: 'H-1B Specialty Occupation',
    preparer: {
      name: 'Vikram Deshmukh',
      role: 'Tax Preparer',
      email: 'vikram.deshmukh@taxcrm.com',
      submittedAt: 'Today at 02:45 PM'
    },
    preparerNotes: 'Verified Amazon W-2, Chase 1099-INT, and Robinhood 1099-B. Applied MFJ standard deduction ($29,200). Dual-state residency schedule attached.',
    computation: {
      w2Wages: 125000,
      interestIncome: 1150,
      capitalGains: 4200,
      otherIncome: 0,
      grossIncome: 130350,
      deductionType: 'STANDARD',
      deductionAmount: 29200,
      taxableIncome: 101150,
      fedTaxLiability: 12680,
      fedWithheld: 18450,
      federalRefund: 5770,
      stateWithheld: 6200,
      stateTax: 5007,
      stateRefund: 1193
    }
  };

  // 2. 4-Eyes Compliance Checklist States
  const [checks, setChecks] = useState<{ [key: string]: boolean }>({
    checkW2: true,
    checkWithheld: true,
    check1099B: true,
    checkDeduction: true,
    checkState: true,
    checkFBAR: true,
  });

  const toggleCheck = (key: string) => {
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecksPassed = Object.values(checks).every(Boolean);

  // 3. QA Auditor Remarks State
  const [auditorRemarks, setAuditorRemarks] = useState<string>(
    'Comprehensive 4-Eyes compliance verification completed. All W-2, 1099-B and 1099-INT values match source records. Form 1040 draft is approved for Sales pitch.'
  );

  // 4. Modals States
  const [isApproveModalOpen, setIsApproveModalOpen] = useState<boolean>(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState<boolean>(false);
  const [revisionReason, setRevisionReason] = useState<string>('Discrepancy in Box 2 Federal Withholding calculation');
  const [revisionNotes, setRevisionNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Handle Approve Sign-Off
  const handleConfirmApprove = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsApproveModalOpen(false);
      toast.success(`Form 1040 for ${returnData.taxpayerName} approved! Transferred to Sales Pitch Queue 🛡️🚀`);
      navigate('/prep-review/reviewer');
    }, 500);
  };

  // Handle Request Revision
  const handleConfirmRevision = () => {
    if (!revisionNotes.trim()) {
      toast.error('Please specify revision instructions for the Preparer');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsRevisionModalOpen(false);
      toast.success(`Revision dispatched to Tax Preparer (${returnData.preparer.name})! 🔄`);
      navigate('/prep-review/reviewer');
    }, 500);
  };

  return (
    <div className="w-full space-y-5 pb-16 font-sans animate-in fade-in duration-200">
      {/* 1. Pro Header */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/prep-review/reviewer')}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Reviewer Queue</span>
            </button>
            <span className="text-slate-300">•</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
              4-Eyes QA Compliance Audit
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>{returnData.taxpayerName}</span>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
              TY {returnData.taxYear} Form 1040
            </span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Drafted by: <strong className="text-slate-800">{returnData.preparer.name}</strong> • Submitted: {returnData.preparer.submittedAt}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRevisionModalOpen(true)}
            className="border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 h-9 cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Request Revision</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsApproveModalOpen(true)}
            disabled={!allChecksPassed}
            className={`text-white text-xs font-bold px-4 h-9 flex items-center gap-1.5 shadow-2xs cursor-pointer ${
              allChecksPassed
                ? 'bg-[#16A34A] hover:bg-[#15803D]'
                : 'bg-slate-300 cursor-not-allowed text-slate-600'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sign Off &amp; Approve Return</span>
          </Button>
        </div>
      </div>

      {/* 2. Top Summary Result Banner */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-purple-700 via-indigo-800 to-slate-900 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-200 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>4-Eyes Audit Computed Results</span>
          </div>
          <div className="text-3xl font-extrabold tracking-tight">
            <span>+${returnData.computation.federalRefund.toLocaleString()} <span className="text-sm font-bold text-purple-200">Federal Refund</span></span>
          </div>
          <div className="text-xs text-purple-200 font-medium">
            State (IL): <strong>+${returnData.computation.stateRefund.toLocaleString()}</strong> • Gross Income: <strong>${returnData.computation.grossIncome.toLocaleString()}</strong>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xs border border-white/20 p-3 rounded-xl text-right space-y-1">
          <div className="flex items-center justify-end gap-1.5 text-xs font-bold">
            {allChecksPassed ? (
              <span className="text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>All 6 Audit Checks Passed</span>
              </span>
            ) : (
              <span className="text-amber-300 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                <span>Pending Checklist Verification</span>
              </span>
            )}
          </div>
          <span className="text-[10px] text-purple-200 block">Zero-Defect Audit Protocol</span>
        </div>
      </div>

      {/* 3. 2-Column Split Pro Layout: Left Panel (1040 Breakdown) & Right Panel (Checklist & Source Comparison) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: Preparer's Computed Form 1040 Numbers (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <Calculator className="w-4 h-4 text-blue-600" />
                <span>Preparer Form 1040 Computation Summary</span>
              </div>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Drafted by {returnData.preparer.name.split(' ')[0]}
              </span>
            </div>

            {/* Line-by-Line Breakdown Table */}
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 flex items-center justify-between font-medium text-slate-700">
                <span>Line 1a: Total W-2 Wages &amp; Salaries</span>
                <strong className="text-slate-900">${returnData.computation.w2Wages.toLocaleString()}</strong>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 flex items-center justify-between font-medium text-slate-700">
                <span>Line 2b: Taxable Interest Income</span>
                <strong className="text-slate-900">${returnData.computation.interestIncome.toLocaleString()}</strong>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 flex items-center justify-between font-medium text-slate-700">
                <span>Line 7: Capital Gains (Schedule D)</span>
                <strong className="text-slate-900">${returnData.computation.capitalGains.toLocaleString()}</strong>
              </div>

              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-between font-bold text-blue-900">
                <span>Line 9: Total Gross Income (AGI)</span>
                <span>${returnData.computation.grossIncome.toLocaleString()}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 flex items-center justify-between font-medium text-slate-700">
                <span>Line 12: Standard Deduction Applied (MFJ 2025)</span>
                <strong className="text-purple-700">${returnData.computation.deductionAmount.toLocaleString()}</strong>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 flex items-center justify-between font-bold text-slate-900">
                <span>Line 15: Net Taxable Base</span>
                <span>${returnData.computation.taxableIncome.toLocaleString()}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 flex items-center justify-between font-medium text-slate-700">
                <span>Line 24: Total Federal Tax Liability</span>
                <strong className="text-slate-900">${returnData.computation.fedTaxLiability.toLocaleString()}</strong>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 flex items-center justify-between font-medium text-slate-700">
                <span>Line 25a: Federal Income Tax Withheld (W-2 Box 2)</span>
                <strong className="text-emerald-700">${returnData.computation.fedWithheld.toLocaleString()}</strong>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between font-extrabold text-emerald-900 text-sm">
                <span>Line 34: Final Federal Refund</span>
                <span>+${returnData.computation.federalRefund.toLocaleString()}</span>
              </div>
            </div>

            {/* Preparer Notes Callout */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Preparer Observations:
              </span>
              <p className="text-xs text-slate-700 font-medium">
                "{returnData.preparerNotes}"
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 4-Eyes Compliance Verification Checklist & Sign-Off (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Card 1: 4-Eyes Checklist */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>4-Eyes Compliance Verification Protocol</span>
              </div>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                Auditor Sign-Off
              </span>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Check all boxes after cross-verifying each computation item against client source documents:
            </p>

            <div className="space-y-2.5">
              {[
                {
                  id: 'checkW2',
                  title: '1. Form W-2 Box 1 Gross Wages ($125,000)',
                  desc: 'Matches Amazon Web Services wage statement Box 1 exactly'
                },
                {
                  id: 'checkWithheld',
                  title: '2. Federal Withholding ($18,450) & State Withheld',
                  desc: 'Cross-verified with W-2 Box 2 and Box 17'
                },
                {
                  id: 'check1099B',
                  title: '3. Brokerage Capital Gains ($4,200)',
                  desc: 'Cross-checked with Robinhood 1099-B 1040 Schedule D'
                },
                {
                  id: 'checkDeduction',
                  title: '4. MFJ Standard Deduction ($29,200)',
                  desc: 'Correct 2025 rate applied for Married Filing Jointly'
                },
                {
                  id: 'checkState',
                  title: '5. State Residency (Illinois Schedule NR/CR)',
                  desc: 'State apportionment and residency credits verified'
                },
                {
                  id: 'checkFBAR',
                  title: '6. Foreign Asset Reporting (FBAR / Form 8938)',
                  desc: 'Checked client foreign account disclosure threshold'
                },
              ].map((c) => (
                <div
                  key={c.id}
                  onClick={() => toggleCheck(c.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    checks[c.id]
                      ? 'bg-purple-50/40 border-purple-200'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="pt-0.5 shrink-0">
                    {checks[c.id] ? (
                      <div className="w-4 h-4 rounded bg-purple-600 text-white flex items-center justify-center">
                        <CheckSquare className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded border border-slate-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">{c.title}</div>
                    <div className="text-[11px] text-slate-500 font-medium">{c.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: QA Auditor Sign-Off Remarks Box */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              Senior QA Compliance Sign-Off Remarks (Included in Sales Handoff)
            </label>
            <textarea
              value={auditorRemarks}
              onChange={(e) => setAuditorRemarks(e.target.value)}
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A]"
              placeholder="e.g. Comprehensive 4-Eyes compliance verification completed..."
            />
          </div>
        </div>
      </div>

      {/* 4. Request Revisions Modal */}
      {isRevisionModalOpen && (
        <AppModal
          isOpen={isRevisionModalOpen}
          onClose={() => setIsRevisionModalOpen(false)}
          title="Send Return Back for Revision"
          width="600px"
        >
          <div className="space-y-4 font-sans py-2">
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>
                This return will be moved to <strong>Correction Needed (Revisions)</strong> stage and assigned back to <strong>{returnData.preparer.name}</strong> for correction.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Discrepancy Category *
              </label>
              <select
                value={revisionReason}
                onChange={(e) => setRevisionReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white"
              >
                <option value="Discrepancy in Box 2 Federal Withholding calculation">Discrepancy in Box 2 Federal Withholding calculation</option>
                <option value="Missing Schedule D or 1099-B Capital Gains basis">Missing Schedule D or 1099-B Capital Gains basis</option>
                <option value="State Residency multi-state apportionment error">State Residency multi-state apportionment error</option>
                <option value="Filing Status standard deduction mismatch">Filing Status standard deduction mismatch</option>
                <option value="Other computation mismatch">Other computation mismatch</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Detailed Correction Notes for Preparer *
              </label>
              <textarea
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800"
                placeholder="Explain the discrepancy and exact corrections needed..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsRevisionModalOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmRevision}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
                disabled={isSubmitting}
              >
                Dispatch Revisions
              </Button>
            </div>
          </div>
        </AppModal>
      )}

      {/* 5. Approve Confirmation Dialog */}
      <AppConfirmDialog
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        onConfirm={handleConfirmApprove}
        title="Sign Off & Approve Tax Return"
        description={`Are you sure you want to approve Arjun Varma's Form 1040 return (Calculated Federal Refund: $${returnData.computation.federalRefund.toLocaleString()})? This return will be stamped with 4-Eyes QA Compliance Sign-Off and dispatched to the Sales Pitch Queue.`}
        confirmLabel="Yes, Sign Off & Approve"
        cancelLabel="Continue Review"
        variant="success"
        isLoading={isSubmitting}
      />
    </div>
  );
};
