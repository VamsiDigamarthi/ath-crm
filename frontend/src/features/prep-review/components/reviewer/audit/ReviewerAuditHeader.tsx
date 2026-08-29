import React from 'react';
import { ArrowLeft, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import type { WorkspaceTaxpayer } from '../../../hooks/useTaxPreparerWorkspace';

interface ReviewerAuditHeaderProps {
  taxpayer: WorkspaceTaxpayer | null;
  taxYear: number;
  assignedPreparer: { name: string; email: string } | null;
  onBack: () => void;
  onOpenApproveModal: () => void;
  onOpenRevisionModal: () => void;
  allChecksPassed: boolean;
}

export const ReviewerAuditHeader: React.FC<ReviewerAuditHeaderProps> = ({
  taxpayer,
  taxYear,
  assignedPreparer,
  onBack,
  onOpenApproveModal,
  onOpenRevisionModal,
  allChecksPassed,
}) => {
  const taxpayerName = taxpayer?.name || '-';
  const taxpayerSSN = taxpayer?.ssnMasked || '-';
  const taxpayerFilingStatus = taxpayer?.maritalStatus || '-';
  const taxpayerLocation = taxpayer?.city && taxpayer?.state ? `${taxpayer.city}, ${taxpayer.state}` : (taxpayer?.state || '-');
  const preparerName = assignedPreparer?.name || '-';

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Queue</span>
          </button>
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

      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenRevisionModal}
          className="border-rose-200 bg-rose-50/50 hover:bg-rose-100/70 text-rose-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer h-9"
        >
          <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
          <span>Request Revision</span>
        </Button>

        <Button
          size="sm"
          onClick={onOpenApproveModal}
          disabled={!allChecksPassed}
          className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer h-9 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Sign-Off &amp; Pass QA</span>
        </Button>
      </div>
    </div>
  );
};
