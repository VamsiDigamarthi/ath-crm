import React from 'react';
import type { ReturnComplexity } from '../../types/prep-review.types';
import { 
  FileText, 
  TrendingUp, 
  ShieldCheck, 
  Building2, 
  MapPin 
} from 'lucide-react';

interface PrepComplexityBadgeProps {
  complexity: ReturnComplexity;
}

export const PrepComplexityBadge: React.FC<PrepComplexityBadgeProps> = ({ complexity }) => {
  switch (complexity) {
    case 'STANDARD':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
          <FileText className="w-3 h-3 text-slate-500" />
          <span>Standard W-2</span>
        </span>
      );
    case 'MULTI_STATE':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <MapPin className="w-3 h-3 text-indigo-500" />
          <span>Multi-State</span>
        </span>
      );
    case 'INVESTMENTS_1099B':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <TrendingUp className="w-3 h-3 text-amber-600" />
          <span>Stocks / 1099-B</span>
        </span>
      );
    case 'FOREIGN_FBAR':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
          <ShieldCheck className="w-3 h-3 text-purple-600" />
          <span>FBAR / Foreign</span>
        </span>
      );
    case 'BUSINESS_SCH_C':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
          <Building2 className="w-3 h-3 text-teal-600" />
          <span>Schedule C Business</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
          <span>{complexity}</span>
        </span>
      );
  }
};
