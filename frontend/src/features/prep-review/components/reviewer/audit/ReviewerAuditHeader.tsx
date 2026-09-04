import React from 'react';
import { ArrowLeft, RotateCcw, CheckCircle2, Lock, Clock } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { PrepStageBadge } from '../../common/PrepStageBadge';
import type { WorkspaceTaxpayer } from '../../../hooks/useTaxPreparerWorkspace';

interface ReviewerAuditHeaderProps {
  taxpayer: WorkspaceTaxpayer | null;
  taxYear: number;
  assignedPreparer: { name: string; email: string } | null;
  currentStage?: string;
  taxDraftSummary?: any;
  onBack: () => void;
  onOpenApproveModal: () => void;
  onOpenRevisionModal: () => void;
  allChecksPassed: boolean;
}

export const ReviewerAuditHeader: React.FC<ReviewerAuditHeaderProps> = ({
  taxpayer,
  taxYear,
  assignedPreparer,
  currentStage = 'PREP_IN_PROGRESS',
  taxDraftSummary,
  onBack,
  onOpenApproveModal,
  onOpenRevisionModal,
  allChecksPassed,
}) => {
  const taxpayerName = taxpayer?.name || '-';
  const taxpayerSSN = taxpayer?.ssnMasked || '-';
  const taxpayerFilingStatus = taxpayer?.maritalStatus || '-';
  const taxpayerLocation = taxpayer?.city && taxpayer?.state ? `${taxpayer.city}, ${taxpayer.state}` : (taxpayer?.state || '-');
  const preparerName = assignedPreparer?.name || 'Tax Preparer';

  const draftStatus = taxDraftSummary?.status;
  
  // Stage conditions
  const isQAReviewActive = currentStage === 'QA_IN_REVIEW' || draftStatus === 'SUBMITTED_FOR_QA';
  const isAlreadyApproved = currentStage === 'QA_APPROVED' || draftStatus === 'QA_APPROVED' || currentStage === 'SALES_PITCH_QUEUE';
  const isRevisionRequested = currentStage === 'QA_REVISION_REQUESTED' || currentStage === 'CORRECTION_NEEDED' || draftStatus === 'REVISION_REQUESTED';
  const isUnderPreparation = !isQAReviewActive && !isAlreadyApproved && !isRevisionRequested;

  // Determine button disabled states
  const isRevisionDisabled = !isQAReviewActive;
  const isApproveDisabled = !isQAReviewActive || !allChecksPassed || isAlreadyApproved;

  // Tooltip messages
  const revisionTooltip = isUnderPreparation
    ? 'Cannot Request Revision: Form 1040 is currently Under Preparation by the Tax Preparer. Awaiting Preparer draft submission for QA.'
    : isAlreadyApproved
      ? 'Cannot Request Revision: Form 1040 has already been QA Approved & Signed Off.'
      : isRevisionRequested
        ? 'Revision already requested: Awaiting corrections and re-submission from the Tax Preparer.'
        : 'Flag calculation discrepancies and return Form 1040 draft to Preparer for corrections.';

  const approveTooltip = isUnderPreparation
    ? 'Cannot Sign-Off: Form 1040 is currently Under Preparation by the Tax Preparer. Preparer must complete calculations and submit to QA first.'
    : isAlreadyApproved
      ? 'Already Signed-Off: Form 1040 has been certified and transferred to the Sales Pitch Queue.'
      : isRevisionRequested
        ? 'Cannot Sign-Off: Return is currently awaiting revisions from the Tax Preparer.'
        : !allChecksPassed
          ? 'Checklist Incomplete: Please verify all 6 items in the 4-Eyes Compliance Checklist below to enable Sign-Off.'
          : 'All 6 compliance checks passed! Click to sign off Form 1040 and transfer to Sales Pitch Queue.';

  return (
    <div className="space-y-3 font-sans">
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={onBack}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Queue</span>
            </button>
            <span className="text-slate-300">•</span>
            <PrepStageBadge stage={currentStage} assignedPreparerName={preparerName} />
            <span className="text-slate-300">•</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
              4-Eyes Verification
            </span>
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {taxpayerName}
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              TY {taxYear} Form 1040
            </span>
          </div>

          <p className="text-xs text-slate-500 font-medium">
            SSN: {taxpayerSSN} • {taxpayerFilingStatus} • {taxpayerLocation} • Prepared by: <strong className="text-slate-700">{preparerName}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
          {/* Button 1: Request Revision with Custom Floating Tooltip */}
          <div className="relative group inline-flex" title={revisionTooltip}>
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenRevisionModal}
              disabled={isRevisionDisabled}
              className={`border-rose-200 text-xs font-bold flex items-center gap-1.5 h-9 transition-all ${
                isRevisionDisabled
                  ? 'bg-slate-50 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed hover:bg-slate-50 pointer-events-none'
                  : 'bg-rose-50/50 hover:bg-rose-100/70 text-rose-700 cursor-pointer'
              }`}
            >
              {isRevisionDisabled ? (
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
              )}
              <span>Request Revision</span>
            </Button>

            {/* Hover Tooltip Popup Card - Solid Black with Crisp White Text */}
            <div 
              className="pointer-events-none absolute top-full mt-2 left-1/2 -translate-x-1/2 hidden group-hover:block w-64 p-2.5 rounded-lg shadow-2xl border border-slate-700 text-left transition-all duration-150"
              style={{ backgroundColor: '#0f172a', color: '#ffffff', zIndex: 9999 }}
            >
              <p className="text-[11px] font-medium leading-relaxed m-0 p-0" style={{ color: '#ffffff' }}>
                {revisionTooltip}
              </p>
              <div 
                className="w-2.5 h-2.5 rotate-45 absolute -top-1 left-1/2 -translate-x-1/2 border-l border-t border-slate-700" 
                style={{ backgroundColor: '#0f172a' }}
              />
            </div>
          </div>

          {/* Button 2: Sign-Off & Pass QA with Custom Floating Tooltip */}
          <div className="relative group inline-flex" title={approveTooltip}>
            <Button
              size="sm"
              onClick={onOpenApproveModal}
              disabled={isApproveDisabled}
              className={`text-xs font-bold flex items-center gap-1.5 h-9 shadow-2xs transition-all ${
                isApproveDisabled
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 opacity-60 cursor-not-allowed hover:bg-slate-100 pointer-events-none'
                  : 'bg-[#16A34A] hover:bg-[#15803D] text-white cursor-pointer shadow-sm'
              }`}
            >
              {isApproveDisabled ? (
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>Sign-Off &amp; Pass QA</span>
            </Button>

            {/* Hover Tooltip Popup Card - Solid Black with Crisp White Text */}
            <div 
              className="pointer-events-none absolute top-full mt-2 right-0 hidden group-hover:block w-72 p-2.5 rounded-lg shadow-2xl border border-slate-700 text-left transition-all duration-150"
              style={{ backgroundColor: '#0f172a', color: '#ffffff', zIndex: 9999 }}
            >
              <p className="text-[11px] font-medium leading-relaxed m-0 p-0" style={{ color: '#ffffff' }}>
                {approveTooltip}
              </p>
              <div 
                className="w-2.5 h-2.5 rotate-45 absolute -top-1 right-8 border-l border-t border-slate-700" 
                style={{ backgroundColor: '#0f172a' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Under Preparation Informational Banner */}
      {isUnderPreparation && (
        <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-3 sm:p-4 flex items-center justify-between gap-3 text-amber-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <span>Form 1040 Under Preparation (Draft Mode)</span>
              </div>
              <div className="text-[11px] text-amber-800 font-medium">
                {preparerName} is actively drafting tax calculations. 4-Eyes QA Sign-Off &amp; Revision actions will unlock once the Preparer completes calculations and submits Form 1040 for QA Review.
              </div>
            </div>
          </div>
          <span className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
            Awaiting Preparer Submission
          </span>
        </div>
      )}

      {/* Revision Requested Informational Banner */}
      {isRevisionRequested && (
        <div className="bg-rose-50/90 border border-rose-200 rounded-xl p-3 sm:p-4 flex items-center justify-between gap-3 text-rose-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-100 border border-rose-200 flex items-center justify-center shrink-0">
              <RotateCcw className="w-4 h-4 text-rose-700" />
            </div>
            <div>
              <div className="text-xs font-bold text-rose-900">
                Discrepancy Revision Requested
              </div>
              <div className="text-[11px] text-rose-800 font-medium">
                Revision notes dispatched to {preparerName}. Awaiting corrected Form 1040 calculations from Preparer.
              </div>
            </div>
          </div>
          <span className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
            Revision Pending
          </span>
        </div>
      )}

      {/* QA Approved Informational Banner */}
      {isAlreadyApproved && (
        <div className="bg-emerald-50/90 border border-emerald-200 rounded-xl p-3 sm:p-4 flex items-center justify-between gap-3 text-emerald-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-900">
                4-Eyes QA Compliance Approved &amp; Signed Off
              </div>
              <div className="text-[11px] text-emerald-800 font-medium">
                This return has been certified by Senior QA and transferred to the Sales Pitch Queue for client quotation.
              </div>
            </div>
          </div>
          <span className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-[#16A34A] border border-emerald-300">
            Transferred to Sales
          </span>
        </div>
      )}
    </div>
  );
};
