import React from 'react';
import { Clock, Calendar, MapPin, Building2 } from 'lucide-react';

interface ReviewModule3PresenceProps {
  m3: any;
  selectedTaxYear?: number;
  isSubmitted?: boolean;
}

export const ReviewModule3Presence: React.FC<ReviewModule3PresenceProps> = ({
  m3,
  selectedTaxYear = 2025,
  isSubmitted = false,
}) => {
  const historyList = m3.statesResidedHistory || [];
  const rentalList = m3.rentalProperties || [];

  const valDays = (days: any) => {
    if (days === null || days === undefined || days === '') return '-';
    return `${days} Days`;
  };

  const val = (v: any) => {
    if (v === null || v === undefined || v === '') return '-';
    return String(v).trim() || '-';
  };

  const valCurrency = (num: any) => {
    if (num === null || num === undefined || num === '' || isNaN(Number(num))) return '-';
    return `$${Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const currentYearDays = m3[`days${selectedTaxYear}`] !== undefined 
    ? m3[`days${selectedTaxYear}`] 
    : m3.days2025;

  const priorYear1Days = m3[`days${selectedTaxYear - 1}`] !== undefined 
    ? m3[`days${selectedTaxYear - 1}`] 
    : m3.days2024;

  const priorYear2Days = m3[`days${selectedTaxYear - 2}`] !== undefined 
    ? m3[`days${selectedTaxYear - 2}`] 
    : m3.days2023;

  return (
    <div className="space-y-4 font-sans">
      {/* Draft Status Banner if not submitted */}
      {!isSubmitted && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Draft Stage:</strong> Taxpayer has not submitted Module 03 (State of Residency &amp; Multi-State) yet.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-200/70 text-amber-800 border border-amber-300 whitespace-nowrap">
            Intake Pending
          </span>
        </div>
      )}

      {/* 3-Year Presence Breakdown Dynamic to active taxYear */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-emerald-50/50 space-y-2">
          <span className="text-[10px] font-bold text-emerald-800 uppercase flex items-center gap-1">
            <Calendar className="w-3 h-3 text-emerald-600" />
            <span>TY {selectedTaxYear} Days in U.S.</span>
          </span>
          <div className="text-2xl font-extrabold text-emerald-900">
            {valDays(currentYearDays)}
          </div>
          <span className="text-[11px] text-emerald-700">
            {currentYearDays !== undefined ? 'Substantial Presence Factor: 100%' : 'Not reported'}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>TY {selectedTaxYear - 1} Days in U.S.</span>
          </span>
          <div className="text-2xl font-extrabold text-slate-800">
            {valDays(priorYear1Days)}
          </div>
          <span className="text-[11px] text-slate-500">
            {priorYear1Days !== undefined ? `1/3 Weight Factor: ${Math.round(priorYear1Days / 3)} Days` : 'Not reported'}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>TY {selectedTaxYear - 2} Days in U.S.</span>
          </span>
          <div className="text-2xl font-extrabold text-slate-800">
            {valDays(priorYear2Days)}
          </div>
          <span className="text-[11px] text-slate-500">
            {priorYear2Days !== undefined ? `1/6 Weight Factor: ${Math.round(priorYear2Days / 6)} Days` : 'Not reported'}
          </span>
        </div>
      </div>

      {/* State Residency Table */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
        <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-indigo-600" />
          <span>Multi-State Residing History ({selectedTaxYear - 3} - {selectedTaxYear})</span>
        </h5>
        
        {historyList.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-400 italic">
            No multi-state residency history reported by taxpayer yet.
          </div>
        ) : (
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
                {historyList.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-900">TY {val(row.taxYear)}</td>
                    <td className="p-2.5 font-bold text-indigo-700">{val(row.state)}</td>
                    <td className="p-2.5 font-mono text-slate-600">
                      {row.fromDate || row.toDate ? `${val(row.fromDate)} → ${val(row.toDate)}` : '-'}
                    </td>
                    <td className="p-2.5 font-bold text-purple-700">{val(row.spouseState)}</td>
                    <td className="p-2.5 font-mono text-slate-600">
                      {row.spouseFromDate || row.spouseToDate ? `${val(row.spouseFromDate)} → ${val(row.spouseToDate)}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Schedule E Rental Properties Section */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
        <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <Building2 className="w-4 h-4 text-indigo-600" />
          <span>Rental Real Estate Income &amp; Expenses (Schedule E) ({selectedTaxYear})</span>
        </h5>

        {rentalList.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-400 italic">
            No rental properties reported by taxpayer for tax year {selectedTaxYear}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden bg-white">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">#</th>
                  <th className="p-2.5">Property Location / Address</th>
                  <th className="p-2.5">Type</th>
                  <th className="p-2.5">Ownership</th>
                  <th className="p-2.5">Purchase Date</th>
                  <th className="p-2.5">Rented Date</th>
                  <th className="p-2.5">Months Rented</th>
                  <th className="p-2.5">Gross Income</th>
                  <th className="p-2.5">Expenses</th>
                  <th className="p-2.5">Net Profit / (Loss)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rentalList.map((prop: any, idx: number) => {
                  const income = Number(prop.totalRentalIncome || 0);
                  const expenses = Number(prop.rentalExpenses || 0);
                  const net = income - expenses;

                  return (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-500">{idx + 1}</td>
                      <td className="p-2.5 font-semibold text-slate-900 max-w-[200px] truncate" title={prop.address}>
                        {val(prop.address)}
                      </td>
                      <td className="p-2.5 font-medium text-slate-700">{val(prop.propertyType)}</td>
                      <td className="p-2.5 text-slate-600">{val(prop.ownership)}</td>
                      <td className="p-2.5 text-slate-600 whitespace-nowrap">{val(prop.purchaseDate)}</td>
                      <td className="p-2.5 text-slate-600 whitespace-nowrap">{val(prop.rentedDate)}</td>
                      <td className="p-2.5 font-mono text-slate-700">{prop.monthsRented2025 ?? 12} Mos</td>
                      <td className="p-2.5 font-bold text-emerald-700">{valCurrency(income)}</td>
                      <td className="p-2.5 font-bold text-rose-700">{valCurrency(expenses)}</td>
                      <td className={`p-2.5 font-extrabold ${net >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {valCurrency(net)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
