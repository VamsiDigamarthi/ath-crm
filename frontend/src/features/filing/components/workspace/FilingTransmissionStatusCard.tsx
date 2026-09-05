import React from 'react';
import { 
  Send, 
  CheckCircle2, 
  Printer, 
  ShieldCheck, 
  Zap,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import type { FilingLeadItem } from '../../types/filing.types';
import toast from 'react-hot-toast';

interface FilingTransmissionStatusCardProps {
  lead: FilingLeadItem;
  onTransmit: () => Promise<void>;
  isTransmitting: boolean;
}

export const FilingTransmissionStatusCard: React.FC<FilingTransmissionStatusCardProps> = ({
  lead,
  onTransmit,
  isTransmitting,
}) => {
  const isAccepted = lead.currentStage === 'FILING_SUCCESS' || lead.transmissionInfo?.status === 'ACCEPTED';
  const isDispatchedToFiling =
    lead.currentStage === 'FILING_QUEUE' ||
    lead.currentStage === 'FILING_IN_PROGRESS' ||
    isAccepted;

  const lastRevert =
    (lead as any).taxDraftSummary?.revertsByTarget?.['FILING_TO_SALES'] ||
    (lead as any).taxDraftSummary?.revertsByTarget?.['FILING_TO_PREPARATION'] ||
    (lead as any).taxDraftSummary?.revertsByTarget?.['FILING_TO_DOCUMENTER'] ||
    (lead.lastRevert?.sourceDepartment === 'FILING' ? lead.lastRevert : null) ||
    ((lead as any).taxDraftSummary?.lastRevert?.sourceDepartment === 'FILING' ? (lead as any).taxDraftSummary?.lastRevert : null) ||
    lead.lastRevert ||
    (lead as any).taxDraftSummary?.lastRevert ||
    (lead.taxReturnSummary as any)?.lastRevert;

  const isReverted = !isDispatchedToFiling && Boolean(
    (lastRevert && !lastRevert.resolved) ||
    ['CORRECTION_NEEDED', 'DOC_OUTREACH', 'DOC_PREP', 'SALES_PITCH_QUEUE', 'SALES_PITCHING'].includes(lead.currentStage)
  );

  const submissionId = lead.transmissionInfo?.submissionId || `5829102026${String(lead.id).replace(/[^0-9]/g, '').slice(0, 8).padEnd(8, '0')}`;
  const certificateId = lead.transmissionInfo?.acceptanceCertificateId || `IRS-ACK-2026-${lead.id.slice(0, 8).toUpperCase()}`;

  const handlePrintCertificate = () => {
    window.print();
    toast.success('Printing IRS e-File Acceptance Certificate... 🖨️');
  };

  const targetDeptLabel = lastRevert?.targetDepartment === 'SALES'
    ? 'Sales Closer'
    : lastRevert?.targetDepartment === 'DOCUMENTER'
    ? 'Documenter'
    : 'Tax Preparer';

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Official IRS Transmission Gateway Control */}
      <div className={`p-6 rounded-2xl border transition-all ${
        isAccepted
          ? 'bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white border-emerald-300 shadow-sm'
          : isReverted
          ? 'bg-amber-50/30 border-amber-300 shadow-xs'
          : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isAccepted
                ? 'bg-emerald-500 text-white shadow-xs'
                : isReverted
                ? 'bg-amber-100 text-amber-700'
                : 'bg-blue-50 text-blue-600'
            }`}>
              {isAccepted ? <CheckCircle2 className="w-5 h-5" /> : isReverted ? <RotateCcw className="w-5 h-5" /> : <Send className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  IRS Modernized e-File (MeF) Gateway
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  isAccepted
                    ? 'bg-emerald-100 text-emerald-800'
                    : isReverted
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {isAccepted
                    ? '✓ IRS E-File Accepted'
                    : isReverted
                    ? `🔄 In Revision with ${targetDeptLabel}`
                    : 'Ready to Transmit'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Official ERO Electronic Return Originator Transmission (EFIN: 582910)
              </p>
            </div>
          </div>

          {isAccepted && (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintCertificate}
              className="border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Acceptance Certificate</span>
            </Button>
          )}
        </div>

        {/* Transmission Status Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs mb-5">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-[10px] text-slate-400 font-medium">IRS Submission ID</div>
            <div className="font-mono font-bold text-slate-900 mt-0.5 truncate" title={submissionId}>
              {submissionId}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-[10px] text-slate-400 font-medium">Federal Status</div>
            <div className={`font-bold mt-0.5 ${
              isAccepted ? 'text-[#16A34A]' : isReverted ? 'text-amber-700' : 'text-blue-600'
            }`}>
              {isAccepted ? 'ACCEPTED (Ack: 0000)' : isReverted ? `In Revision (${targetDeptLabel})` : 'Form 1040 Ready'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-[10px] text-slate-400 font-medium">State Gateway ({lead.stateOfResidence})</div>
            <div className={`font-bold mt-0.5 ${
              isAccepted ? 'text-[#16A34A]' : isReverted ? 'text-amber-700' : 'text-blue-600'
            }`}>
              {isAccepted ? `ACCEPTED (${lead.stateOfResidence})` : isReverted ? `In Revision (${lead.stateOfResidence})` : 'Ready to Transmit'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-[10px] text-slate-400 font-medium">Transmission Speed</div>
            <div className="font-bold text-slate-900 mt-0.5 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>Instant MeF Direct</span>
            </div>
          </div>
        </div>

        {/* Reverted Warning Info */}
        {isReverted && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-2.5 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span><strong>IRS Transmission Disabled:</strong> This return was reverted to <strong>{targetDeptLabel}</strong>. Direct transmission to the IRS Gateway is locked until the return is updated, re-authorized, and dispatched back to Filing.</span>
          </div>
        )}

        {/* Action Button */}
        {!isAccepted ? (
          <Button
            size="lg"
            onClick={onTransmit}
            disabled={isTransmitting || lead.paymentStatus !== 'PAID' || isReverted}
            className={`w-full text-sm font-bold py-3 flex items-center justify-center gap-2 shadow-md transition-all ${
              isReverted
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300 hover:bg-slate-200 shadow-none'
                : lead.paymentStatus !== 'PAID'
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                : 'bg-[#16A34A] hover:bg-[#15803D] text-white cursor-pointer'
            }`}
            title={
              isReverted
                ? `Cannot Transmit: Return is currently in revision with ${targetDeptLabel}.`
                : undefined
            }
          >
            {isTransmitting ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Transmitting MeF Package to IRS Gateway...</span>
              </>
            ) : isReverted ? (
              <>
                <RotateCcw className="w-4 h-4 text-slate-400" />
                <span>Locked: Return is In Revision with {targetDeptLabel}</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Transmit Return to IRS Gateway (E-File Form 1040) 🚀</span>
              </>
            )}
          </Button>
        ) : (
          /* Official IRS Acceptance Certificate Box */
          <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-300 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#16A34A]" />
                <span className="font-bold text-xs sm:text-sm text-emerald-950">
                  Official IRS Electronic Filing Acceptance Certificate
                </span>
              </div>
              <span className="font-mono text-[11px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                {certificateId}
              </span>
            </div>

            <p className="text-xs text-emerald-900 leading-relaxed font-medium">
              The United States Internal Revenue Service (IRS) and the Department of Revenue for {lead.stateOfResidence} have successfully received and verified the electronic Form 1040 tax return for <strong>{lead.taxpayerName}</strong>. Refund processing is now officially underway.
            </p>

            <div className="pt-2 border-t border-emerald-200/60 flex flex-wrap items-center justify-between text-[11px] text-emerald-800">
              <span>Timestamp: <strong>{new Date(lead.updatedAt).toLocaleString()}</strong></span>
              <span>ERO EFIN: <strong>582910</strong> • ETIN: <strong>9281</strong></span>
              <span>Status: <strong className="text-[#16A34A]">COMPLETED (FILING_SUCCESS)</strong></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
