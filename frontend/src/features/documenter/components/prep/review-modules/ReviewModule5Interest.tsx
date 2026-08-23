import React from 'react';
import { Clock, Landmark } from 'lucide-react';

interface ReviewModule5InterestProps {
  m5: any;
  selectedTaxYear?: number;
  isSubmitted?: boolean;
}

export const ReviewModule5Interest: React.FC<ReviewModule5InterestProps> = ({
  m5,
  isSubmitted = false,
}) => {
  const val = (v: any) => {
    if (v === null || v === undefined || v === '') return '-';
    return String(v).trim() || '-';
  };

  const valCurrency = (num: any) => {
    if (num === null || num === undefined || num === '' || isNaN(Number(num))) return '$0.00';
    return `$${Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const totalPassive = Number(m5.interestAmount || 0) + Number(m5.dividendAmount || 0) + Number(m5.form1099OidAmount || 0);

  return (
    <div className="space-y-4 font-sans">
      {/* Draft Status Banner if not submitted */}
      {!isSubmitted && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Draft Stage:</strong> Taxpayer has not submitted Module 05 (1099-INT / DIV / OID Interest) yet.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-200/70 text-amber-800 border border-amber-300 whitespace-nowrap">
            Intake Pending
          </span>
        </div>
      )}

      {/* 3-Column Passive Income Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-1.5 text-xs shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-800 uppercase block tracking-wider">
            1099-INT Bank Interest
          </span>
          <div className="text-2xl font-extrabold text-emerald-800">
            {valCurrency(m5.interestAmount)}
          </div>
          <span className="text-[11px] text-slate-600 block">
            Payer: <strong className="text-slate-900">{val(m5.bankName)}</strong>
          </span>
        </div>

        <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 space-y-1.5 text-xs shadow-2xs">
          <span className="text-[10px] font-bold text-indigo-800 uppercase block tracking-wider">
            1099-DIV Dividends
          </span>
          <div className="text-2xl font-extrabold text-indigo-800">
            {valCurrency(m5.dividendAmount)}
          </div>
          <span className="text-[11px] text-slate-600 block">
            Ordinary &amp; qualified distributions
          </span>
        </div>

        <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200 space-y-1.5 text-xs shadow-2xs">
          <span className="text-[10px] font-bold text-purple-800 uppercase block tracking-wider">
            1099-OID Original Discount
          </span>
          <div className="text-2xl font-extrabold text-purple-800">
            {valCurrency(m5.form1099OidAmount)}
          </div>
          <span className="text-[11px] text-slate-600 block">
            Bond / Treasury note discount
          </span>
        </div>
      </div>

      {/* Detailed Structured Table */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Landmark className="w-4 h-4 text-emerald-600" />
            <span>Itemized 1099 Income Breakdown</span>
          </h5>
          <span className="text-xs font-extrabold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
            Total: <span className="text-emerald-700 font-bold">{valCurrency(totalPassive)}</span>
          </span>
        </div>

        <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden bg-white">
          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="p-2.5">Income Category</th>
              <th className="p-2.5">Payer / Financial Institution</th>
              <th className="p-2.5">Reported Amount ($)</th>
              <th className="p-2.5">Tax Schedule / IRS Treatment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr className="hover:bg-slate-50">
              <td className="p-2.5 font-bold text-slate-900">Form 1099-INT</td>
              <td className="p-2.5 font-bold text-indigo-700">{val(m5.bankName)}</td>
              <td className="p-2.5 font-extrabold text-emerald-700">{valCurrency(m5.interestAmount)}</td>
              <td className="p-2.5 text-slate-600">Schedule B / Form 1040 Line 2b (Taxable Interest)</td>
            </tr>
            <tr className="hover:bg-slate-50">
              <td className="p-2.5 font-bold text-slate-900">Form 1099-DIV</td>
              <td className="p-2.5 text-slate-600">Stock &amp; Mutual Fund Portfolios</td>
              <td className="p-2.5 font-extrabold text-indigo-700">{valCurrency(m5.dividendAmount)}</td>
              <td className="p-2.5 text-slate-600">Schedule B / Form 1040 Line 3b (Ordinary Dividends)</td>
            </tr>
            <tr className="hover:bg-slate-50">
              <td className="p-2.5 font-bold text-slate-900">Form 1099-OID</td>
              <td className="p-2.5 text-slate-600">Discounted Debt Obligations</td>
              <td className="p-2.5 font-extrabold text-purple-700">{valCurrency(m5.form1099OidAmount)}</td>
              <td className="p-2.5 text-slate-600">Form 1040 Interest / OID Income</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
