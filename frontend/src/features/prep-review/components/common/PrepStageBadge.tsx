import React from 'react';
import type { PrepReviewStage } from '../../types/prep-review.types';
import { 
  FileCheck, 
  Clock, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles,
  ArrowRightCircle
} from 'lucide-react';

interface PrepStageBadgeProps {
  stage: PrepReviewStage;
}

export const PrepStageBadge: React.FC<PrepStageBadgeProps> = ({ stage }) => {
  switch (stage) {
    case 'DOC_PREP_COMPLETE':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <Clock className="w-3 h-3 text-amber-600" />
          <span>Unassigned (Intake Ready)</span>
        </span>
      );
    case 'PREP_ASSIGNED':
    case 'PREP_IN_PROGRESS':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
          <FileCheck className="w-3 h-3 text-blue-600" />
          <span>Under Preparation (1040)</span>
        </span>
      );
    case 'QA_REVIEW_QUEUE':
    case 'QA_IN_REVIEW':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
          <Sparkles className="w-3 h-3 text-purple-600" />
          <span>In QA Review</span>
        </span>
      );
    case 'QA_REVISION_REQUESTED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
          <RotateCcw className="w-3 h-3 text-rose-600" />
          <span>Revision Required</span>
        </span>
      );
    case 'QA_APPROVED':
    case 'SALES_PITCH_QUEUE':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
          <span>QA Approved &amp; Signed Off</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
          <ArrowRightCircle className="w-3 h-3" />
          <span>{stage}</span>
        </span>
      );
  }
};
