import React from 'react';
import { Clock, FileSpreadsheet } from 'lucide-react';

interface ReviewModule4WagesProps {
  m4: any;
  selectedTaxYear?: number;
  isSubmitted?: boolean;
}

export const ReviewModule4Wages: React.FC<ReviewModule4WagesProps> = ({
  m4,
  selectedTaxYear: _selectedTaxYear = 2025,
  isSubmitted = false,
}) => {
  const val = (v: any) => {
    if (v === null || v === undefined || v === '') return '-';
    return String(v).trim() || '-';
  };

  const valCurrency = (num: any) => {
    if (num === null || num === undefined || num === '' || isNaN(Number(num))) return '-';
    return `$${Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Draft Status Banner if not submitted */}
      {!isSubmitted && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Draft Stage:</strong> Taxpayer has not submitted Module 04 (Form W-2 Wages) yet.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-200/70 text-amber-800 border border-amber-300 whitespace-nowrap">
            Intake Pending
          </span>
        </div>
      )}

      {/* Primary W-2 Wages Summary Card */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
        <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Primary Form W-2 Wage Breakdown</span>
        </h5>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-100 space-y-1.5">
            <span className="text-[10px] font-bold text-emerald-800 uppercase block tracking-wider">
              Primary Employer Name (Box c)
            </span>
            <div className="text-base font-bold text-slate-900">
              {val(m4.employerName)}
            </div>
            <span className="text-[11px] text-slate-500 block">
              Official employer entity reporting taxable compensation
            </span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-100 space-y-1.5">
            <span className="text-[10px] font-bold text-emerald-800 uppercase block tracking-wider">
              Box 1 Total Wages, Tips &amp; Compensation
            </span>
            <div className="text-2xl font-extrabold text-emerald-800">
              {m4.estimatedWages !== undefined && m4.estimatedWages !== null && m4.estimatedWages > 0
                ? valCurrency(m4.estimatedWages)
                : '-'}
            </div>
            <span className="text-[11px] text-slate-500 block">
              Federal taxable gross income
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
