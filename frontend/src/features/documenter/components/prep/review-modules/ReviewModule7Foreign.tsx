import React from 'react';

interface ReviewModule7ForeignProps {
  m7: any;
}

export const ReviewModule7Foreign: React.FC<ReviewModule7ForeignProps> = ({ m7 }) => {
  return (
    <div className="space-y-4 font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1 text-xs">
          <span className="text-slate-400 font-bold uppercase text-[10px]">FBAR FinCEN 114 Status</span>
          <div
            className={`text-base font-extrabold ${
              m7.hasFbar || m7.hasFbarOver10k === 'YES' ? 'text-rose-600' : 'text-emerald-700'
            }`}
          >
            {m7.hasFbar || m7.hasFbarOver10k === 'YES' ? 'FBAR Applicable (> $10,000)' : 'No (< $10k aggregate)'}
          </div>
          <span className="text-slate-500 text-[11px]">Bank: {m7.indianBankName || 'State Bank of India / HDFC'}</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1 text-xs">
          <span className="text-slate-400 font-bold uppercase text-[10px]">Indian Interest Income</span>
          <div className="text-xl font-extrabold text-indigo-700">
            ₹{Number(m7.foreignInterestInr || 0).toLocaleString()}
          </div>
          <span className="text-slate-500 text-[11px]">NRE / NRO / FCNR Savings</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1 text-xs">
          <span className="text-slate-400 font-bold uppercase text-[10px]">Foreign TDS / Tax Paid</span>
          <div className="text-xl font-extrabold text-purple-700">
            ₹{Number(m7.foreignTaxesPaidInr || 0).toLocaleString()}
          </div>
          <span className="text-slate-500 text-[11px]">Eligible for Form 1116 FTC</span>
        </div>
      </div>
    </div>
  );
};
