import React from 'react';
import {
  FileCheck,
  Clock,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  PhoneCall,
  DollarSign,
  Rocket,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';

interface PrepStageBadgeProps {
  stage: string;
  assignedPreparerName?: string;
  assignedCloserName?: string;
  assignedFileOpName?: string;
}

export const PrepStageBadge: React.FC<PrepStageBadgeProps> = ({
  stage,
  assignedPreparerName,
  assignedCloserName,
  assignedFileOpName
}) => {
  // If assigned preparer exists and stage is DOC_PREP, show Under Preparation (1040)
  if (assignedPreparerName && (stage === 'DOC_PREP' || stage === 'DOC_PREP_COMPLETE')) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
        <FileSpreadsheet className="w-3 h-3 text-blue-600 shrink-0" />
        <span>Under Preparation (1040)</span>
      </span>
    );
  }

  switch (stage) {
    case 'DOC_PREP_COMPLETE':
    case 'DOC_PREP':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <Clock className="w-3 h-3 text-amber-600 shrink-0" />
          <span>Unassigned (Intake Ready)</span>
        </span>
      );

    case 'PREP_ASSIGNED':
    case 'PREP_IN_PROGRESS':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
          <FileSpreadsheet className="w-3 h-3 text-blue-600 shrink-0" />
          <span>Under Preparation (1040)</span>
        </span>
      );

    case 'QA_REVIEW_QUEUE':
    case 'QA_IN_REVIEW':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
          <Sparkles className="w-3 h-3 text-purple-600 shrink-0" />
          <span>In QA Review (4-Eyes)</span>
        </span>
      );

    case 'QA_REVISION_REQUESTED':
    case 'CORRECTION_NEEDED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
          <RotateCcw className="w-3 h-3 text-rose-600 shrink-0" />
          <span>Revision Required</span>
        </span>
      );

    case 'QA_APPROVED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-[#16A34A] shrink-0" />
          <span>QA Approved &amp; Signed Off</span>
        </span>
      );

    case 'SALES_PITCH_QUEUE':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <PhoneCall className="w-3 h-3 text-indigo-600 shrink-0" />
          <span>Ready for Sales Pitch</span>
        </span>
      );

    case 'SALES_PITCHING':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
          <PhoneCall className="w-3 h-3 text-purple-600 shrink-0" />
          <span>
            {assignedCloserName ? `In Sales Pitch (${assignedCloserName})` : 'In Sales Pitch'}
          </span>
        </span>
      );

    case 'QUOTATION_SENT':
    case 'PAYMENT_PENDING':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <DollarSign className="w-3 h-3 text-amber-600 shrink-0" />
          <span>Quoted / Pending Payment</span>
        </span>
      );

    case 'PAID_AND_AUTHORIZED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
          <FileCheck className="w-3 h-3 text-[#16A34A] shrink-0" />
          <span>Fee Paid &amp; E-Signed</span>
        </span>
      );

    case 'FILING_QUEUE':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
          <Rocket className="w-3 h-3 text-cyan-600 shrink-0" />
          <span>In Filing Queue</span>
        </span>
      );

    case 'FILING_IN_PROGRESS':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
          <Rocket className="w-3 h-3 text-blue-600 shrink-0" />
          <span>
            {assignedFileOpName ? `IRS Filing Active (${assignedFileOpName})` : 'IRS Filing Active'}
          </span>
        </span>
      );

    case 'FILING_SUCCESS':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3 h-3 text-emerald-700 shrink-0" />
          <span>IRS Accepted (Filing Success)</span>
        </span>
      );

    case 'FILING_REJECTED':
    case 'FILING_FAILED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
          <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
          <span>IRS Filing Rejected</span>
        </span>
      );

    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
          <span>{stage}</span>
        </span>
      );
  }
};
