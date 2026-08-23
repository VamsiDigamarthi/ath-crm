import React from 'react';

interface ReviewModule8DeductionsProps {
  m8: any;
}

export const ReviewModule8Deductions: React.FC<ReviewModule8DeductionsProps> = ({ m8 }) => {
  return (
    <div className="space-y-4 font-sans">
      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
        <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">
          12-Item Incurred Expenses &amp; Itemized Deductions (Taxpayer vs Spouse)
        </h5>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <span className="text-slate-400 block text-[10px]">Form 1098 Mortgage Interest:</span>
            <span className="font-bold text-slate-900">
              ${Number(m8.mortgageInterestTaxpayer || m8.mortgageInterest1098 || 0).toLocaleString()}
            </span>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <span className="text-slate-400 block text-[10px]">US Property Taxes:</span>
            <span className="font-bold text-slate-900">
              ${Number(m8.propertyTaxesUsTaxpayer || m8.propertyTaxesUs || 0).toLocaleString()}
            </span>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <span className="text-slate-400 block text-[10px]">India Property Taxes:</span>
            <span className="font-bold text-slate-900">
              ${Number(m8.propertyTaxesIndiaTaxpayer || m8.propertyTaxesIndia || 0).toLocaleString()}
            </span>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <span className="text-slate-400 block text-[10px]">HSA Contributions:</span>
            <span className="font-bold text-emerald-700">
              ${Number(m8.hsaTaxpayer || m8.hsaContribution || 0).toLocaleString()}
            </span>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <span className="text-slate-400 block text-[10px]">Clean Energy Equipment Cost:</span>
            <span className="font-bold text-indigo-700">
              ${Number(m8.cleanEnergyCostTaxpayer || m8.cleanEnergyCost || 0).toLocaleString()}
            </span>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <span className="text-slate-400 block text-[10px]">Student Loan Interest (1098-E):</span>
            <span className="font-bold text-purple-700">
              ${Number(m8.studentLoanInterest || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
