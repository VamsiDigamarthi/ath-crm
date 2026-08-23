import React from 'react';
import { Clock, Building2 } from 'lucide-react';

interface ReviewModule6StocksProps {
  m6: any;
  selectedTaxYear?: number;
  isSubmitted?: boolean;
}

export const ReviewModule6Stocks: React.FC<ReviewModule6StocksProps> = ({
  m6,
  selectedTaxYear = 2025,
  isSubmitted = false,
}) => {
  const stockList = m6.stocksList || [];

  const val = (v: any) => {
    if (v === null || v === undefined || v === '') return '-';
    return String(v).trim() || '-';
  };

  const valCurrency = (num: any) => {
    if (num === null || num === undefined || num === '' || isNaN(Number(num))) return '$0.00';
    const n = Number(num);
    const formatted = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return n < 0 ? `-$${formatted}` : `$${formatted}`;
  };

  const totalGain = (m6.capitalGainTaxpayer || m6.totalCapitalGain || 0) + (m6.capitalGainSpouse || 0);
  const totalLoss = (m6.capitalLossTaxpayer || m6.capitalLoss2025 || 0) + (m6.capitalLossSpouse || 0);
  const netCapital = totalGain - totalLoss;

  return (
    <div className="space-y-4 font-sans">
      {/* Draft Status Banner if not submitted */}
      {!isSubmitted && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Draft Stage:</strong> Taxpayer has not submitted Module 06 (1099-B Stocks, ESPP, RSU &amp; Losses) yet.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-200/70 text-amber-800 border border-amber-300 whitespace-nowrap">
            Intake Pending
          </span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-emerald-50/50 space-y-1.5 text-xs shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-800 uppercase block tracking-wider">
            Total Capital Gains ({selectedTaxYear})
          </span>
          <div className="text-2xl font-extrabold text-emerald-800">
            {valCurrency(totalGain)}
          </div>
          <span className="text-[11px] text-slate-600 block">
            Taxpayer: {valCurrency(m6.capitalGainTaxpayer || m6.totalCapitalGain || 0)} | Spouse: {valCurrency(m6.capitalGainSpouse || 0)}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-rose-50/50 space-y-1.5 text-xs shadow-2xs">
          <span className="text-[10px] font-bold text-rose-800 uppercase block tracking-wider">
            Capital Losses ({selectedTaxYear})
          </span>
          <div className="text-2xl font-extrabold text-rose-800">
            {valCurrency(totalLoss)}
          </div>
          <span className="text-[11px] text-slate-600 block">
            Taxpayer: {valCurrency(m6.capitalLossTaxpayer || 0)} | Spouse: {valCurrency(m6.capitalLossSpouse || 0)}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-indigo-50/50 space-y-1.5 text-xs shadow-2xs">
          <span className="text-[10px] font-bold text-indigo-800 uppercase block tracking-wider">
            Net Capital Gain / (Loss)
          </span>
          <div className={`text-2xl font-extrabold ${netCapital >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
            {valCurrency(netCapital)}
          </div>
          <span className="text-[11px] text-slate-600 block">
            Net taxable Schedule D gain/loss
          </span>
        </div>
      </div>

      {/* Brokerage Platforms Table */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
        <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <Building2 className="w-4 h-4 text-emerald-600" />
          <span>Brokerage Platforms &amp; 1099-B Accounts</span>
        </h5>

        {stockList.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-400 italic">
            No individual brokerage trading platforms reported by taxpayer.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden bg-white">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">#</th>
                  <th className="p-2.5">Brokerage Platform Name</th>
                  <th className="p-2.5">Taxpayer Gain / (Loss)</th>
                  <th className="p-2.5">Spouse Gain / (Loss)</th>
                  <th className="p-2.5">Total Proceeds</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stockList.map((stk: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-500">{idx + 1}</td>
                    <td className="p-2.5 font-bold text-indigo-700">{val(stk.brokerName)}</td>
                    <td className={`p-2.5 font-semibold ${(stk.taxpayerGainLoss ?? 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {valCurrency(stk.taxpayerGainLoss)}
                    </td>
                    <td className={`p-2.5 font-semibold ${(stk.spouseGainLoss ?? 0) >= 0 ? 'text-purple-700' : 'text-rose-700'}`}>
                      {valCurrency(stk.spouseGainLoss)}
                    </td>
                    <td className="p-2.5 font-mono text-slate-700">
                      {stk.totalProceeds ? valCurrency(stk.totalProceeds) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Prior Year Loss Carryforwards & ESPP Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs shadow-2xs">
          <span className="font-bold text-slate-800 uppercase text-[10px] block border-b border-slate-100 pb-1">
            Prior Year Capital Loss Carryforwards ({selectedTaxYear - 2} &amp; {selectedTaxYear - 1})
          </span>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <span className="text-slate-400 block text-[10px]">Taxpayer Carryforward:</span>
              <span className="font-bold text-slate-900 text-sm">
                {valCurrency(m6.lossCarryforwardTaxpayer || m6.capitalLossCarryforward2023_2024 || 0)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Spouse Carryforward:</span>
              <span className="font-bold text-slate-900 text-sm">
                {valCurrency(m6.lossCarryforwardSpouse || 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs shadow-2xs">
          <span className="font-bold text-slate-800 uppercase text-[10px] block border-b border-slate-100 pb-1">
            ESPP / RSU / Crypto Disposition Notes
          </span>
          <p className="text-slate-600 text-xs italic">
            {val(m6.esppRsuDetails) !== '-' ? val(m6.esppRsuDetails) : 'No additional ESPP / RSU / Crypto disclaimers reported.'}
          </p>
        </div>
      </div>
    </div>
  );
};
