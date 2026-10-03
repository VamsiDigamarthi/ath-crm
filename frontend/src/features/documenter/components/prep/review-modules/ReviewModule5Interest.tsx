import React from 'react';
import { Clock, Landmark, ShieldCheck } from 'lucide-react';

interface ReviewModule5InterestProps {
  m5: any;
  selectedTaxYear?: number;
  isSubmitted?: boolean;
}

export const ReviewModule5Interest: React.FC<ReviewModule5InterestProps> = ({
  m5 = {},
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

  const interestAmount = Number(m5?.interestAmount || 0);
  const interestWithheld = Number(m5?.interestFedTaxWithheld || 0);

  const dividendAmount = Number(m5?.dividendAmount || 0);
  const dividendWithheld = Number(m5?.dividendFedTaxWithheld || 0);

  const oidAmount = Number(m5?.form1099OidAmount || 0);
  const oidWithheld = Number(m5?.form1099OidFedTaxWithheld || 0);

  const totalPassiveIncome = interestAmount + dividendAmount + oidAmount;
  const totalPassiveWithheld = interestWithheld + dividendWithheld + oidWithheld;

  return (
    <div className="space-y-4 font-sans">
      {/* Draft Status Banner if not submitted */}
      {!isSubmitted && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Draft Stage:</strong> Taxpayer has not finalized submission of Module 05 (1099-INT / DIV / OID Interest &amp; Dividends).
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-200/70 text-amber-800 border border-amber-300 whitespace-nowrap">
            Intake Pending
          </span>
        </div>
      )}

      {/* 3-Column Passive Income & Federal Withholding Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 1099-INT */}
        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2 text-xs shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
              1099-INT Bank Interest
            </span>
            {interestWithheld > 0 && (
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded border border-emerald-300">
                Box 4 Withheld
              </span>
            )}
          </div>
          <div>
            <div className="text-2xl font-extrabold text-emerald-800">
              {valCurrency(interestAmount)}
            </div>
            <div className="text-[11px] text-emerald-900/80 font-medium mt-0.5">
              Fed Tax Withheld: <strong className="text-emerald-950 font-bold">{valCurrency(interestWithheld)}</strong>
            </div>
          </div>
          <div className="pt-1.5 border-t border-emerald-200/60 text-[11px] text-slate-600 truncate">
            Payer: <strong className="text-slate-900">{val(m5?.bankName)}</strong>
          </div>
        </div>

        {/* 1099-DIV */}
        <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 space-y-2 text-xs shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider">
              1099-DIV Dividends
            </span>
            {dividendWithheld > 0 && (
              <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-100/80 px-1.5 py-0.5 rounded border border-indigo-300">
                Box 4 Withheld
              </span>
            )}
          </div>
          <div>
            <div className="text-2xl font-extrabold text-indigo-800">
              {valCurrency(dividendAmount)}
            </div>
            <div className="text-[11px] text-indigo-900/80 font-medium mt-0.5">
              Fed Tax Withheld: <strong className="text-indigo-950 font-bold">{valCurrency(dividendWithheld)}</strong>
            </div>
          </div>
          <div className="pt-1.5 border-t border-indigo-200/60 text-[11px] text-slate-600">
            Ordinary &amp; qualified portfolio distributions
          </div>
        </div>

        {/* 1099-OID */}
        <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200 space-y-2 text-xs shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">
              1099-OID Original Discount
            </span>
            {oidWithheld > 0 && (
              <span className="text-[10px] font-extrabold text-purple-700 bg-purple-100/80 px-1.5 py-0.5 rounded border border-purple-300">
                Box 4 Withheld
              </span>
            )}
          </div>
          <div>
            <div className="text-2xl font-extrabold text-purple-800">
              {valCurrency(oidAmount)}
            </div>
            <div className="text-[11px] text-purple-900/80 font-medium mt-0.5">
              Fed Tax Withheld: <strong className="text-purple-950 font-bold">{valCurrency(oidWithheld)}</strong>
            </div>
          </div>
          <div className="pt-1.5 border-t border-purple-200/60 text-[11px] text-slate-600">
            Bond / Treasury note discount
          </div>
        </div>
      </div>

      {/* Detailed Structured Table */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
          <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Landmark className="w-4 h-4 text-emerald-600" />
            <span>Itemized 1099 Passive Income &amp; Withholding Breakdown</span>
          </h5>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              Total Gross: <strong className="text-slate-900">{valCurrency(totalPassiveIncome)}</strong>
            </span>
            <span className="text-xs font-medium text-slate-600 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Total Withheld: <strong className="text-emerald-900 font-bold">{valCurrency(totalPassiveWithheld)}</strong>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden bg-white">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Income Category</th>
                <th className="p-2.5">Payer / Financial Institution</th>
                <th className="p-2.5 text-right">Gross Income ($)</th>
                <th className="p-2.5 text-right">Fed Tax Withheld ($) (Box 4)</th>
                <th className="p-2.5">Tax Schedule / IRS Treatment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="p-2.5 font-bold text-slate-900">Form 1099-INT</td>
                <td className="p-2.5 font-bold text-indigo-700">{val(m5?.bankName)}</td>
                <td className="p-2.5 font-extrabold text-emerald-700 text-right">{valCurrency(interestAmount)}</td>
                <td className="p-2.5 font-bold text-slate-900 text-right">
                  {interestWithheld > 0 ? (
                    <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                      {valCurrency(interestWithheld)}
                    </span>
                  ) : (
                    <span className="text-slate-400">$0.00</span>
                  )}
                </td>
                <td className="p-2.5 text-slate-600">Schedule B / Form 1040 Line 2b (Taxable Interest)</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-2.5 font-bold text-slate-900">Form 1099-DIV</td>
                <td className="p-2.5 text-slate-600">Stock &amp; Mutual Fund Portfolios</td>
                <td className="p-2.5 font-extrabold text-indigo-700 text-right">{valCurrency(dividendAmount)}</td>
                <td className="p-2.5 font-bold text-slate-900 text-right">
                  {dividendWithheld > 0 ? (
                    <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                      {valCurrency(dividendWithheld)}
                    </span>
                  ) : (
                    <span className="text-slate-400">$0.00</span>
                  )}
                </td>
                <td className="p-2.5 text-slate-600">Schedule B / Form 1040 Line 3b (Ordinary Dividends)</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-2.5 font-bold text-slate-900">Form 1099-OID</td>
                <td className="p-2.5 text-slate-600">Discounted Debt Obligations</td>
                <td className="p-2.5 font-extrabold text-purple-700 text-right">{valCurrency(oidAmount)}</td>
                <td className="p-2.5 font-bold text-slate-900 text-right">
                  {oidWithheld > 0 ? (
                    <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                      {valCurrency(oidWithheld)}
                    </span>
                  ) : (
                    <span className="text-slate-400">$0.00</span>
                  )}
                </td>
                <td className="p-2.5 text-slate-600">Form 1040 Interest / OID Income</td>
              </tr>
            </tbody>
            <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
              <tr>
                <td className="p-2.5" colSpan={2}>Passive Income &amp; Withholding Totals</td>
                <td className="p-2.5 text-right text-emerald-800 font-extrabold">{valCurrency(totalPassiveIncome)}</td>
                <td className="p-2.5 text-right text-emerald-800 font-extrabold">{valCurrency(totalPassiveWithheld)}</td>
                <td className="p-2.5 text-slate-500 font-normal">Transferred to 1040 Calculations</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
