import React from 'react';
import { Clock, Home, Heart, Receipt } from 'lucide-react';

interface ReviewModule8DeductionsProps {
  m8: any;
  selectedTaxYear?: number;
  isSubmitted?: boolean;
}

export const ReviewModule8Deductions: React.FC<ReviewModule8DeductionsProps> = ({
  m8,
  selectedTaxYear = 2025,
  isSubmitted = false,
}) => {
  const rentList = m8.rentDeductionsList || [];
  const charityList = m8.charitableList || [];

  const val = (v: any) => {
    if (v === null || v === undefined || v === '') return '-';
    return String(v).trim() || '-';
  };

  const valCurrency = (num: any) => {
    if (num === null || num === undefined || num === '' || isNaN(Number(num))) return '$0.00';
    return `$${Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const totalRent = rentList.reduce((sum: number, r: any) => sum + ((r.months || 0) * (r.monthlyRent || 0)), 0);
  const totalCharity = charityList.reduce((sum: number, c: any) => sum + Number(c.amountDonated || 0), 0) || Number(m8.charitableDonations || 0);

  const expenseItems = [
    { label: "Last Year's Tax Prep Fees", taxpayer: m8.lastYearTaxPrepFeeTaxpayer, spouse: m8.lastYearTaxPrepFeeSpouse, total: m8.lastYearTaxPrepFee },
    { label: 'Mortgage Interest (1098)', taxpayer: m8.mortgageInterestTaxpayer || m8.mortgageInterest1098, spouse: m8.mortgageInterestSpouse, total: (m8.mortgageInterestTaxpayer || m8.mortgageInterest1098 || 0) + (m8.mortgageInterestSpouse || 0) },
    { label: 'US Property Taxes', taxpayer: m8.propertyTaxesUsTaxpayer || m8.propertyTaxesUs, spouse: m8.propertyTaxesUsSpouse, total: (m8.propertyTaxesUsTaxpayer || m8.propertyTaxesUs || 0) + (m8.propertyTaxesUsSpouse || 0) },
    { label: 'India Property Taxes', taxpayer: m8.propertyTaxesIndiaTaxpayer || m8.propertyTaxesIndia, spouse: m8.propertyTaxesIndiaSpouse, total: (m8.propertyTaxesIndiaTaxpayer || m8.propertyTaxesIndia || 0) + (m8.propertyTaxesIndiaSpouse || 0) },
    { label: 'Medical & Dental (> 7.5% AGI)', taxpayer: m8.medicalExpensesTaxpayer || m8.medicalExpenses, spouse: m8.medicalExpensesSpouse, total: (m8.medicalExpensesTaxpayer || m8.medicalExpenses || 0) + (m8.medicalExpensesSpouse || 0) },
    { label: 'Student Loan Interest (1098-E)', taxpayer: m8.studentLoanInterestTaxpayer || m8.studentLoanInterest, spouse: m8.studentLoanInterestSpouse, total: (m8.studentLoanInterestTaxpayer || m8.studentLoanInterest || 0) + (m8.studentLoanInterestSpouse || 0) },
    { label: 'Solar / Clean Energy (Form 5695)', taxpayer: m8.solarCleanEnergyTaxpayer || m8.solarCleanEnergyExpenses, spouse: m8.solarCleanEnergySpouse, total: (m8.solarCleanEnergyTaxpayer || m8.solarCleanEnergyExpenses || 0) + (m8.solarCleanEnergySpouse || 0) },
    { label: 'EV Clean Vehicle Credit (Form 8936)', taxpayer: m8.electricVehicleTaxpayer || m8.electricVehicleExpenses, spouse: m8.electricVehicleSpouse, total: (m8.electricVehicleTaxpayer || m8.electricVehicleExpenses || 0) + (m8.electricVehicleSpouse || 0) },
    { label: 'HSA Contributions (Form 8889)', taxpayer: m8.hsaTaxpayer || m8.hsaContribution, spouse: m8.hsaSpouse, total: (m8.hsaTaxpayer || m8.hsaContribution || 0) + (m8.hsaSpouse || 0) },
    { label: 'Traditional IRA Contributions', taxpayer: m8.iraTaxpayer || m8.iraContribution, spouse: m8.iraSpouse, total: (m8.iraTaxpayer || m8.iraContribution || 0) + (m8.iraSpouse || 0) },
    { label: 'Educator Expenses', taxpayer: m8.educatorExpensesTaxpayer || m8.educatorExpenses, spouse: m8.educatorExpensesSpouse, total: (m8.educatorExpensesTaxpayer || m8.educatorExpenses || 0) + (m8.educatorExpensesSpouse || 0) },
  ];

  return (
    <div className="space-y-4 font-sans">
      {/* Draft Status Banner if not submitted */}
      {!isSubmitted && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Draft Stage:</strong> Taxpayer has not submitted Module 08 (Itemized Deductions &amp; Rent) yet.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-200/70 text-amber-800 border border-amber-300 whitespace-nowrap">
            Intake Pending
          </span>
        </div>
      )}

      {/* Summary Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-emerald-50/50 space-y-1.5 text-xs shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-800 uppercase block tracking-wider">
            Total State Rental Claimed ({selectedTaxYear})
          </span>
          <div className="text-2xl font-extrabold text-emerald-800">
            {valCurrency(totalRent)}
          </div>
          <span className="text-[11px] text-slate-600 block">
            {rentList.length} state rental credit rows reported
          </span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-rose-50/50 space-y-1.5 text-xs shadow-2xs">
          <span className="text-[10px] font-bold text-rose-800 uppercase block tracking-wider">
            Charitable Donations ({selectedTaxYear})
          </span>
          <div className="text-2xl font-extrabold text-rose-800">
            {valCurrency(totalCharity)}
          </div>
          <span className="text-[11px] text-slate-600 block">
            501(c)(3) religious / educational gifts
          </span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-indigo-50/50 space-y-1.5 text-xs shadow-2xs">
          <span className="text-[10px] font-bold text-indigo-800 uppercase block tracking-wider">
            Form 1098 Mortgage Interest
          </span>
          <div className="text-2xl font-extrabold text-indigo-800">
            {valCurrency((m8.mortgageInterestTaxpayer || m8.mortgageInterest1098 || 0) + (m8.mortgageInterestSpouse || 0))}
          </div>
          <span className="text-[11px] text-slate-600 block">
            Schedule A primary residence interest
          </span>
        </div>
      </div>

      {/* State Rental Deductions Audit Table */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Home className="w-4 h-4 text-emerald-600" />
            <span>State Rental Deductions (Renter Credit)</span>
          </h5>
          <span className="text-xs font-extrabold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
            Total Claimed: <span className="text-[#16A34A]">{valCurrency(totalRent)}</span>
          </span>
        </div>

        {rentList.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-400 italic">
            No state rental deduction rows claimed by taxpayer.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden bg-white">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">#</th>
                  <th className="p-2.5">State Renter Credit</th>
                  <th className="p-2.5">Months Rented</th>
                  <th className="p-2.5">Monthly Rent ($)</th>
                  <th className="p-2.5">Total Rent Paid ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rentList.map((rent: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-500">{idx + 1}</td>
                    <td className="p-2.5 font-bold text-indigo-700">{val(rent.state)}</td>
                    <td className="p-2.5 font-mono text-slate-800">{rent.months || 0} Months</td>
                    <td className="p-2.5 text-slate-700">{valCurrency(rent.monthlyRent)}</td>
                    <td className="p-2.5 font-extrabold text-emerald-700">{valCurrency((rent.months || 0) * (rent.monthlyRent || 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Charitable Donations Table */}
      {charityList.length > 0 && (
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
          <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Heart className="w-4 h-4 text-rose-600" />
            <span>501(c)(3) Charitable Contributions</span>
          </h5>
          <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden bg-white">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-2.5">#</th>
                <th className="p-2.5">Charitable Organization</th>
                <th className="p-2.5">Donation Type</th>
                <th className="p-2.5">Amount Donated ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {charityList.map((ch: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-2.5 font-bold text-slate-500">{idx + 1}</td>
                  <td className="p-2.5 font-bold text-slate-800">{val(ch.institutionName)}</td>
                  <td className="p-2.5 text-slate-600">{val(ch.donationType || 'CASH')}</td>
                  <td className="p-2.5 font-extrabold text-rose-700">{valCurrency(ch.amountDonated)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 12-Item Incurred Expenses Audit Grid */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
        <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <Receipt className="w-4 h-4 text-indigo-600" />
          <span>Itemized Incurred Expenses ({selectedTaxYear})</span>
        </h5>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden bg-white">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Expense Category</th>
                <th className="p-2.5">Taxpayer Amount ($)</th>
                <th className="p-2.5">Spouse Amount ($)</th>
                <th className="p-2.5">Total Claimed ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenseItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-2.5 font-medium text-slate-800">{item.label}</td>
                  <td className="p-2.5 text-slate-700">{valCurrency(item.taxpayer)}</td>
                  <td className="p-2.5 text-slate-700">{valCurrency(item.spouse)}</td>
                  <td className="p-2.5 font-bold text-indigo-700">{valCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
