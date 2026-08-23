import React from 'react';

interface ReviewModule3PresenceProps {
  m3: any;
  m1: any;
}

export const ReviewModule3Presence: React.FC<ReviewModule3PresenceProps> = ({
  m3,
  m1,
}) => {
  return (
    <div className="space-y-4 font-sans">
      {/* 3-Year Presence Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-emerald-50/50 space-y-2">
          <span className="text-[10px] font-bold text-emerald-800 uppercase">TY 2025 Days in U.S.</span>
          <div className="text-2xl font-extrabold text-emerald-900">{m3.days2025 ?? 365} Days</div>
          <span className="text-[11px] text-emerald-700">Substantial Presence Factor: 100%</span>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase">TY 2024 Days in U.S.</span>
          <div className="text-2xl font-extrabold text-slate-800">{m3.days2024 ?? 0} Days</div>
          <span className="text-[11px] text-slate-500">1/3 Weight Factor: {Math.round((m3.days2024 ?? 0) / 3)} Days</span>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase">TY 2023 Days in U.S.</span>
          <div className="text-2xl font-extrabold text-slate-800">{m3.days2023 ?? 0} Days</div>
          <span className="text-[11px] text-slate-500">1/6 Weight Factor: {Math.round((m3.days2023 ?? 0) / 6)} Days</span>
        </div>
      </div>

      {/* State Residency Table */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
        <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
          Multi-State Residing History (Taxpayer &amp; Spouse)
        </h5>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden bg-white">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Tax Year</th>
                <th className="p-2.5">Taxpayer State</th>
                <th className="p-2.5">Taxpayer Residency Period</th>
                <th className="p-2.5">Spouse State</th>
                <th className="p-2.5">Spouse Residency Period</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(m3.statesResidedHistory && m3.statesResidedHistory.length > 0 ? m3.statesResidedHistory : [
                {
                  taxYear: 2025,
                  state: m1.state || 'TX',
                  fromDate: '01/01/2025',
                  toDate: '12/31/2025',
                  spouseState: m1.state || 'TX',
                  spouseFromDate: '01/01/2025',
                  spouseToDate: '12/31/2025',
                }
              ]).map((row: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-2.5 font-bold text-slate-900">TY {row.taxYear}</td>
                  <td className="p-2.5 font-bold text-indigo-700">{row.state}</td>
                  <td className="p-2.5 font-mono text-slate-600">{row.fromDate || '01/01/2025'} → {row.toDate || '12/31/2025'}</td>
                  <td className="p-2.5 font-bold text-purple-700">{row.spouseState || row.state}</td>
                  <td className="p-2.5 font-mono text-slate-600">{row.spouseFromDate || row.fromDate || '01/01/2025'} → {row.spouseToDate || row.toDate || '12/31/2025'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
