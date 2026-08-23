import React from 'react';

interface ReviewModule6StocksProps {
  m6: any;
}

export const ReviewModule6Stocks: React.FC<ReviewModule6StocksProps> = ({ m6 }) => {
  return (
    <div className="space-y-4 font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1 text-xs">
          <span className="text-slate-400 font-bold uppercase text-[10px]">Total Capital Gains (2025)</span>
          <div className="text-xl font-extrabold text-emerald-700">
            ${Number(m6.totalCapitalGain || m6.capitalGain2025 || 0).toLocaleString()}
          </div>
          <span className="text-slate-500 text-[11px]">
            Taxpayer: ${Number(m6.capitalGainTaxpayer || 0).toLocaleString()} | Spouse: ${Number(m6.capitalGainSpouse || 0).toLocaleString()}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1 text-xs">
          <span className="text-slate-400 font-bold uppercase text-[10px]">Loss Carryforward (2023/24)</span>
          <div className="text-xl font-extrabold text-rose-600">
            ${Number(m6.capitalLossCarryforward2023_2024 || m6.lossCarryforward || 0).toLocaleString()}
          </div>
          <span className="text-slate-500 text-[11px]">Prior year unused capital losses</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1 text-xs">
          <span className="text-slate-400 font-bold uppercase text-[10px]">ESPP / RSU Reported?</span>
          <div className="text-xl font-extrabold text-indigo-700">
            {m6.esppRsuReported ? 'Yes (Form 3921/22)' : 'No'}
          </div>
          <span className="text-slate-500 text-[11px]">Employer stock purchase plan</span>
        </div>
      </div>
    </div>
  );
};
