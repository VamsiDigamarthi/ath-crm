import React from 'react';
import { AppModal } from '@/shared/components/AppModal';
import { Button } from '@/shared/components/Button';
import { CheckCircle2, RotateCcw, ShieldCheck } from 'lucide-react';
import type { WorkspaceTaxpayer } from '../../../hooks/useTaxPreparerWorkspace';

interface ReviewerSignOffModalsProps {
  taxpayer: WorkspaceTaxpayer | null;
  taxDraftSummary: any;
  assignedPreparer: { name: string; email: string } | null;
  auditorRemarks: string;
  isApproveModalOpen: boolean;
  onCloseApproveModal: () => void;
  onConfirmApprove: () => void;
  isRevisionModalOpen: boolean;
  onCloseRevisionModal: () => void;
  revisionReason: string;
  setRevisionReason: (v: string) => void;
  revisionNotes: string;
  setRevisionNotes: (v: string) => void;
  onConfirmRevision: () => void;
  isSubmitting: boolean;
}

export const ReviewerSignOffModals: React.FC<ReviewerSignOffModalsProps> = ({
  taxpayer,
  taxDraftSummary,
  assignedPreparer,
  auditorRemarks,
  isApproveModalOpen,
  onCloseApproveModal,
  onConfirmApprove,
  isRevisionModalOpen,
  onCloseRevisionModal,
  revisionReason,
  setRevisionReason,
  revisionNotes,
  setRevisionNotes,
  onConfirmRevision,
  isSubmitting,
}) => {
  const taxpayerName = taxpayer?.name || 'Taxpayer Client';
  const preparerName = assignedPreparer?.name || 'Tax Preparer';
  const fedRefund = Number(taxDraftSummary?.federalRefund) || 0;
  const balanceDue = Number(taxDraftSummary?.balanceDue) || 0;

  return (
    <>
      {/* 1. Approve & Transfer to Sales Pitch Modal */}
      {isApproveModalOpen && (
        <AppModal
          isOpen={isApproveModalOpen}
          onClose={onCloseApproveModal}
          title="Sign-Off & Approve Form 1040 (4-Eyes QA Passed)"
          width="540px"
        >
          <div className="space-y-4 font-sans text-xs">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-[#16A34A]">
                <CheckCircle2 className="w-4 h-4" />
                <span>Ready to Sign Off Form 1040 for {taxpayerName}</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
                Upon sign-off, this return will be transferred directly to the <strong>Sales Pitch Queue</strong> with computed Federal Refund of <strong>${fedRefund > 0 ? `+${fedRefund.toLocaleString()}` : `-$${balanceDue.toLocaleString()}`}</strong>.
              </p>
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="font-bold text-slate-700">Auditor Compliance Sign-Off Statement:</div>
              <div className="text-[11px] text-slate-600 font-medium italic">
                "{auditorRemarks}"
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={onCloseApproveModal}
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={onConfirmApprove}
                disabled={isSubmitting}
                className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Signing Off...' : 'Approve & Transfer to Sales Pitch'}</span>
              </Button>
            </div>
          </div>
        </AppModal>
      )}

      {/* 2. Request Revision Modal */}
      {isRevisionModalOpen && (
        <AppModal
          isOpen={isRevisionModalOpen}
          onClose={onCloseRevisionModal}
          title="Flag Calculation Discrepancy & Request Revision"
          width="540px"
        >
          <div className="space-y-4 font-sans text-xs">
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-sm text-rose-700">
                <RotateCcw className="w-4 h-4" />
                <span>Send Return Back to Tax Preparer ({preparerName})</span>
              </div>
              <p className="text-[11px] text-rose-800 font-medium">
                The return will be moved to <strong>Correction Needed</strong> and flagged in {preparerName}'s queue for revision.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Discrepancy Category *
              </label>
              <select
                value={revisionReason}
                onChange={(e) => setRevisionReason(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-800 bg-white focus:outline-none"
              >
                <option value="Discrepancy in Box 2 Federal Withholding calculation">
                  Discrepancy in Box 2 Federal Withholding calculation
                </option>
                <option value="W-2 Box 1 Wages do not reconcile with Line 1a">
                  W-2 Box 1 Wages do not reconcile with Line 1a
                </option>
                <option value="1099-B Capital Gains basis mismatch">
                  1099-B Capital Gains basis mismatch
                </option>
                <option value="State residency apportionment incorrect">
                  State residency apportionment incorrect
                </option>
                <option value="Other calculation / schedule discrepancy">
                  Other calculation / schedule discrepancy
                </option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Specific Correction Instructions for Preparer *
              </label>
              <textarea
                rows={3}
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                placeholder="Explain the required correction clearly for the preparer..."
                className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:border-rose-500 focus:outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={onCloseRevisionModal}
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={onConfirmRevision}
                disabled={isSubmitting || !revisionNotes.trim()}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Dispatching...' : 'Dispatch Revision to Preparer'}</span>
              </Button>
            </div>
          </div>
        </AppModal>
      )}
    </>
  );
};
