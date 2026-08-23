import React from 'react';

interface ReviewModule5InterestProps {
  m5: any;
}

export const ReviewModule5Interest: React.FC<ReviewModule5InterestProps> = ({ m5 }) => {
  return (
    <div className="space-y-4 font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1 text-xs">
          <span className="text-slate-400 font-bold uppercase text-[10px]">1099-INT Bank Interest</span>
          <div className="text-xl font-extrabold text-emerald-700">
            ${Number(m5.interestAmount || 0).toLocaleString()}
          </div>
          <span className="text-slate-500 text-[11px]">{m5.bankName || 'Chase / Marcus Bank'}</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1 text-xs">
          <span className="text-slate-400 font-bold uppercase text-[10px]">1099-DIV Dividends</span>
          <div className="text-xl font-extrabold text-indigo-700">
            ${Number(m5.dividendAmount || 0).toLocaleString()}
          </div>
          <span className="text-slate-500 text-[11px]">Ordinary &amp; Qualified Distributions</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1 text-xs">
          <span className="text-slate-400 font-bold uppercase text-[10px]">1099-OID Original Discount</span>
          <div className="text-xl font-extrabold text-purple-700">
            ${Number(m5.form1099OidAmount || 0).toLocaleString()}
          </div>
          <span className="text-slate-500 text-[11px]">Bond / Treasury discount</span>
        </div>
      </div>
    </div>
  );
};
