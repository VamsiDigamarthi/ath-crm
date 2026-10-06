import React from 'react';
import { AppModal } from '@/shared/components/AppModal';
import { Button } from '@/shared/components/Button';
import { AppTextarea } from '@/shared/components/AppTextarea';
import { RotateCcw, ShieldCheck } from 'lucide-react';
import type { WorkspaceTaxpayer } from '../../../hooks/useTaxPreparerWorkspace';

interface ReviewerSignOffModalsProps {
  taxpayer: WorkspaceTaxpayer | null;
  taxDraftSummary: any;
  assignedPreparer: { name: string; email: string } | null;
  auditorRemarks: string;
  setAuditorRemarks: (v: string) => void;
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
  setAuditorRemarks,
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
          title="Approve Form 1040"
          description={`Transfer ${taxpayerName}'s certified return to Sales Pitch Queue (${fedRefund > 0 ? `Refund: +$${fedRefund.toLocaleString()}` : `Due: -$${balanceDue.toLocaleString()}`}).`}
          width="520px"
        >
          <div className="space-y-4 font-sans text-xs py-1">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Auditor Compliance Sign-Off Statement
              </label>
              <AppTextarea
                value={auditorRemarks}
                onChange={setAuditorRemarks}
                rows={4}
                maxLength={5000}
                showCount
                placeholder="Enter compliance sign-off remarks, verified schedules, or Drake cross-checks (e.g. Verified W-2, 1040 Schedule 1-3, all Drake calculation checks passed with zero discrepancies)..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={onCloseApproveModal}
                disabled={isSubmitting}
                className="border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={onConfirmApprove}
                disabled={isSubmitting}
                className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer px-4"
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
          title="Request Revision from Preparer"
          description={`Send return for ${taxpayerName} back to ${preparerName} for corrections.`}
          width="520px"
        >
          <div className="space-y-4 font-sans text-xs py-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Discrepancy Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={revisionReason}
                onChange={(e) => setRevisionReason(e.target.value)}
                className="w-full rounded-md border border-slate-300 p-2.5 text-sm font-medium text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 transition-colors"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Specific Correction Instructions for Preparer <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                placeholder="Explain the required correction clearly for the preparer..."
                className="w-full text-sm p-2.5 rounded-md border border-slate-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-colors resize-none text-slate-800 placeholder:text-slate-400 bg-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={onCloseRevisionModal}
                disabled={isSubmitting}
                className="border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={onConfirmRevision}
                disabled={isSubmitting || !revisionNotes.trim()}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 px-4"
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
