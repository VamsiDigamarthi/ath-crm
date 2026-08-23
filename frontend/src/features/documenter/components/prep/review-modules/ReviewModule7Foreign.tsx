import React from 'react';
import { Clock, Globe, Landmark, ShieldCheck, AlertTriangle } from 'lucide-react';

interface ReviewModule7ForeignProps {
  m7: any;
  selectedTaxYear?: number;
  isSubmitted?: boolean;
}

export const ReviewModule7Foreign: React.FC<ReviewModule7ForeignProps> = ({
  m7,
  selectedTaxYear = 2025,
  isSubmitted = false,
}) => {
  const accountsList = m7.foreignAccountsList || [];

  const val = (v: any) => {
    if (v === null || v === undefined || v === '') return '-';
    return String(v).trim() || '-';
  };

  const valInr = (num: any) => {
    if (num === null || num === undefined || num === '' || isNaN(Number(num))) return '₹ 0';
    return `₹ ${Number(num).toLocaleString('en-IN')}`;
  };

  const valUsd = (inrNum: any) => {
    if (inrNum === null || inrNum === undefined || inrNum === '' || isNaN(Number(inrNum))) return '$0.00';
    // IRS Treasury Yearly Average Exchange Rate (~84 INR = 1 USD)
    const usd = Number(inrNum) / 84;
    return `$${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const isFbarTaxpayer = m7.hasFbar || m7.hasFbarOver10k === 'YES';
  const isFbarSpouse = m7.spouseFbarOver10k === 'YES';

  const totalIndianIncomeInr =
    Number(m7.foreignSalaryInr || 0) +
    Number(m7.foreignInterestInr || 0) +
    Number(m7.foreignDividendInr || 0) +
    Number(m7.foreignRentalInr || 0) +
    Number(m7.otherForeignIncomeInr || 0);

  return (
    <div className="space-y-4 font-sans">
      {/* Draft Status Banner if not submitted */}
      {!isSubmitted && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Draft Stage:</strong> Taxpayer has not submitted Module 07 (FBAR / FATCA &amp; Indian Income) yet.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-200/70 text-amber-800 border border-amber-300 whitespace-nowrap">
            Intake Pending
          </span>
        </div>
      )}

      {/* FBAR & FATCA Status Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={`p-4 rounded-xl border space-y-2 text-xs shadow-2xs ${
          isFbarTaxpayer ? 'bg-rose-50/60 border-rose-200' : 'bg-emerald-50/60 border-emerald-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
              Taxpayer FBAR FinCEN 114 ({selectedTaxYear})
            </span>
            {isFbarTaxpayer ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-200 text-rose-800 border border-rose-300">
                FBAR Required (&gt; $10k)
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-200 text-emerald-800 border border-emerald-300">
                Under $10k Threshold
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isFbarTaxpayer ? (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            )}
            <span className="font-bold text-slate-900 text-sm">
              {isFbarTaxpayer ? 'Aggregate Indian Account Balances Exceeded $10,000' : 'Indian Accounts Under $10,000 All Year'}
            </span>
          </div>
        </div>

        <div className={`p-4 rounded-xl border space-y-2 text-xs shadow-2xs ${
          isFbarSpouse ? 'bg-rose-50/60 border-rose-200' : 'bg-emerald-50/60 border-emerald-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
              Spouse FBAR FinCEN 114 ({selectedTaxYear})
            </span>
            {isFbarSpouse ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-200 text-rose-800 border border-rose-300">
                FBAR Required (&gt; $10k)
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-200 text-emerald-800 border border-emerald-300">
                Under $10k Threshold
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isFbarSpouse ? (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            )}
            <span className="font-bold text-slate-900 text-sm">
              {isFbarSpouse ? 'Spouse Balances Exceeded $10,000' : 'Spouse Accounts Under $10,000 All Year'}
            </span>
          </div>
        </div>
      </div>

      {/* Foreign Bank Accounts Audit Table */}
      {(isFbarTaxpayer || isFbarSpouse || accountsList.length > 0) && (
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
          <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Landmark className="w-4 h-4 text-emerald-600" />
            <span>Reported Indian Bank &amp; Demat Accounts (FinCEN 114 / FATCA 8938)</span>
          </h5>

          {accountsList.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-400 italic">
              FBAR is marked required, but no specific Indian accounts were itemized yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden bg-white">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">#</th>
                    <th className="p-2.5">Financial Institution</th>
                    <th className="p-2.5">Account Type</th>
                    <th className="p-2.5">Peak Balance (INR ₹)</th>
                    <th className="p-2.5">Est. Peak USD ($)</th>
                    <th className="p-2.5">Interest Earned (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accountsList.map((acc: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-500">{idx + 1}</td>
                      <td className="p-2.5 font-bold text-indigo-700">{val(acc.bankName)}</td>
                      <td className="p-2.5 font-medium text-slate-700">{val(acc.accountType).replace(/_/g, ' ')}</td>
                      <td className="p-2.5 font-extrabold text-emerald-700">{valInr(acc.maxBalanceInr)}</td>
                      <td className="p-2.5 font-semibold text-slate-800">{valUsd(acc.maxBalanceInr)}</td>
                      <td className="p-2.5 text-slate-700">{valInr(acc.interestEarnedInr)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Indian Income Breakdown & Form 1116 Foreign Tax Credit */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-indigo-600" />
            <span>Global Foreign Indian Income Breakdown</span>
          </h5>
          <span className="text-xs font-extrabold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
            Total Indian Income: <span className="text-indigo-700 font-bold">{valInr(totalIndianIncomeInr)}</span> ({valUsd(totalIndianIncomeInr)})
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Indian Salary</span>
            <div className="text-sm font-extrabold text-slate-900">{valInr(m7.foreignSalaryInr)}</div>
            <span className="text-[10px] text-slate-400">{valUsd(m7.foreignSalaryInr)}</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Interest (NRE/NRO)</span>
            <div className="text-sm font-extrabold text-slate-900">{valInr(m7.foreignInterestInr)}</div>
            <span className="text-[10px] text-slate-400">{valUsd(m7.foreignInterestInr)}</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Dividends</span>
            <div className="text-sm font-extrabold text-slate-900">{valInr(m7.foreignDividendInr)}</div>
            <span className="text-[10px] text-slate-400">{valUsd(m7.foreignDividendInr)}</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Rental Income</span>
            <div className="text-sm font-extrabold text-slate-900">{valInr(m7.foreignRentalInr)}</div>
            <span className="text-[10px] text-slate-400">{valUsd(m7.foreignRentalInr)}</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Other Foreign</span>
            <div className="text-sm font-extrabold text-slate-900">{valInr(m7.otherForeignIncomeInr)}</div>
            <span className="text-[10px] text-slate-500 truncate block">{val(m7.otherForeignIncomeSource)}</span>
          </div>

          <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 space-y-1">
            <span className="text-[10px] font-bold text-purple-800 uppercase block">Indian TDS (FTC)</span>
            <div className="text-sm font-extrabold text-purple-800">{valInr(m7.foreignTaxesPaidInr)}</div>
            <span className="text-[10px] text-purple-600 font-semibold">Form 1116 Credit</span>
          </div>
        </div>
      </div>
    </div>
  );
};
