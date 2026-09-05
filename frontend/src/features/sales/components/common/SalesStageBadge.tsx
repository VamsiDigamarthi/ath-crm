import React from 'react';
import { RotateCcw } from 'lucide-react';
import type { SalesLeadStage } from '../../types/sales.types';

interface SalesStageBadgeProps {
  stage: SalesLeadStage;
}

export const SalesStageBadge: React.FC<SalesStageBadgeProps> = ({ stage }) => {
  switch (stage) {
    case 'SALES_PITCH_QUEUE':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
          <span>Awaiting Pitch</span>
        </span>
      );

    case 'SALES_PITCHING':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
          <span>Pitch in Progress</span>
        </span>
      );

    case 'QUOTATION_SENT':
    case 'PAYMENT_PENDING':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
          <span>Quoted / Pending Payment</span>
        </span>
      );

    case 'PAID_AND_AUTHORIZED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
          <span>Paid &amp; E-Signed 🌟</span>
        </span>
      );

    case 'FILING_QUEUE':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
          <span>In Filing Queue</span>
        </span>
      );

    case 'CORRECTION_NEEDED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
          <RotateCcw className="w-3 h-3 text-amber-700" />
          <span>Sent to Prep (Revision)</span>
        </span>
      );

    case 'DOC_OUTREACH':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-900 border border-orange-300">
          <RotateCcw className="w-3 h-3 text-orange-700" />
          <span>Sent to Documenter</span>
        </span>
      );

    case 'DOC_PREP':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <RotateCcw className="w-3 h-3 text-amber-600" />
          <span>In Tax Prep</span>
        </span>
      );

    case 'PITCH_REJECTED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
          <span>Pitch Declined</span>
        </span>
      );

    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
          {stage}
        </span>
      );
  }
};
