import React from 'react';
import { Clock, Landmark, ShieldAlert, ShieldCheck } from 'lucide-react';
import { DISTRIBUTION_TYPE_OPTIONS, EARLY_REASON_OPTIONS } from '../../../../customer/components/organizer/modules/Module10Retirement';

interface ReviewModule10RetirementProps {
  m10: any;
  selectedTaxYear?: number;
  isSubmitted?: boolean;
}

export const ReviewModule10Retirement: React.FC<ReviewModule10RetirementProps> = ({
  m10 = {},
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

  const grossDistribution = Number(m10?.grossDistribution || 0);
  const fedTaxWithheld = Number(m10?.fedTaxWithheld || 0);
  const distTypeKey = m10?.distributionType || 'NORMAL';
  const earlyReasonKey = m10?.earlyWithdrawalReason || 'NO_EXCEPTION';

  const distTypeLabel =
    DISTRIBUTION_TYPE_OPTIONS.find((opt) => opt.value === distTypeKey)?.label || distTypeKey;
  const earlyReasonLabel =
    EARLY_REASON_OPTIONS.find((opt) => opt.value === earlyReasonKey)?.label || earlyReasonKey;

  const isEarlyWithdrawal =
    distTypeKey === 'EARLY_NO_EXCEPTION' || distTypeKey === 'EARLY_EXCEPTION';

  return (
    <div className="space-y-4 font-sans">
      {/* Draft Status Banner if not submitted */}
      {!isSubmitted && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Draft Stage:</strong> Taxpayer has not finalized submission of Module 10 (Form 1099-R IRA &amp; Retirement Distributions).
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-200/70 text-amber-800 border border-amber-300 whitespace-nowrap">
            Intake Pending
          </span>
        </div>
      )}

      {/* 3-Column Retirement & IRA Distribution Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Gross Distribution */}
        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2 text-xs shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-800 uppercase block tracking-wider">
            1099-R Gross Distribution (Box 1)
          </span>
          <div className="text-2xl font-extrabold text-emerald-800">
            {valCurrency(grossDistribution)}
          </div>
          <div className="pt-1.5 border-t border-emerald-200/60 text-[11px] text-slate-600 truncate">
            Custodian: <strong className="text-slate-900">{val(m10?.payerName)}</strong>
          </div>
        </div>

        {/* Federal Tax Withheld */}
        <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 space-y-2 text-xs shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider">
              IRA Fed Tax Withheld (Box 4)
            </span>
            {fedTaxWithheld > 0 && (
              <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-100/80 px-1.5 py-0.5 rounded border border-indigo-300">
                1099-R Box 4
              </span>
            )}
          </div>
          <div className="text-2xl font-extrabold text-indigo-800">
            {valCurrency(fedTaxWithheld)}
          </div>
          <div className="pt-1.5 border-t border-indigo-200/60 text-[11px] text-slate-600">
            Credited toward Form 1040 Line 25b
          </div>
        </div>

        {/* Penalty & Exception Status Card */}
        <div
          className={`p-4 rounded-xl border space-y-2 text-xs shadow-2xs ${
            isEarlyWithdrawal
              ? earlyReasonKey !== 'NO_EXCEPTION'
                ? 'bg-amber-50/60 border-amber-200'
                : 'bg-rose-50/60 border-rose-200'
              : 'bg-purple-50/50 border-purple-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${
                isEarlyWithdrawal
                  ? earlyReasonKey !== 'NO_EXCEPTION'
                    ? 'text-amber-800'
                    : 'text-rose-800'
                  : 'text-purple-800'
              }`}
            >
              IRS Penalty / Form 5329 Status
            </span>
            {isEarlyWithdrawal ? (
              earlyReasonKey !== 'NO_EXCEPTION' ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              )
            ) : null}
          </div>
          <div className="text-sm font-bold text-slate-900 leading-snug">
            {isEarlyWithdrawal ? (
              earlyReasonKey !== 'NO_EXCEPTION' ? (
                <span className="text-emerald-700">Form 5329 Exception Claimed</span>
              ) : (
                <span className="text-rose-700">10% Early Withdrawal Penalty</span>
              )
            ) : (
              <span className="text-purple-900">Standard / Qualified Distribution</span>
            )}
          </div>
          <div className="pt-1.5 border-t border-slate-200 text-[11px] text-slate-600 truncate">
            {distTypeLabel}
          </div>
        </div>
      </div>

      {/* Itemized 1099-R Distribution Breakdown Table */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
          <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Landmark className="w-4 h-4 text-emerald-600" />
            <span>Form 1099-R IRA / Retirement Distribution Breakdown</span>
          </h5>
          <span className="text-xs font-extrabold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
            Gross Total: <span className="text-emerald-700 font-bold">{valCurrency(grossDistribution)}</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden bg-white">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Payer / Plan Custodian</th>
                <th className="p-2.5">Distribution Type (Box 7)</th>
                <th className="p-2.5 text-right">Gross Amount ($)</th>
                <th className="p-2.5 text-right">Fed Withheld ($) (Box 4)</th>
                <th className="p-2.5">Reason / Exception (Form 5329)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="p-2.5 font-bold text-indigo-700">{val(m10?.payerName)}</td>
                <td className="p-2.5 text-slate-800 font-medium">{distTypeLabel}</td>
                <td className="p-2.5 font-extrabold text-emerald-700 text-right">
                  {valCurrency(grossDistribution)}
                </td>
                <td className="p-2.5 font-bold text-slate-900 text-right">
                  {fedTaxWithheld > 0 ? (
                    <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                      {valCurrency(fedTaxWithheld)}
                    </span>
                  ) : (
                    <span className="text-slate-400">$0.00</span>
                  )}
                </td>
                <td className="p-2.5 text-slate-600">
                  <div>{earlyReasonLabel}</div>
                  {m10?.reasonExplanation && (
                    <div className="text-[10px] text-slate-500 italic mt-0.5">
                      Note: &ldquo;{m10.reasonExplanation}&rdquo;
                    </div>
                  )}
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
              <tr>
                <td className="p-2.5" colSpan={2}>
                  1099-R Retirement Totals
                </td>
                <td className="p-2.5 text-right text-emerald-800 font-extrabold">
                  {valCurrency(grossDistribution)}
                </td>
                <td className="p-2.5 text-right text-emerald-800 font-extrabold">
                  {valCurrency(fedTaxWithheld)}
                </td>
                <td className="p-2.5 text-slate-500 font-normal">
                  Transferred to Form 1040 Line 4a/4b &amp; Line 25b
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
