import React from 'react';
import { Receipt, Home, Plus, Trash2, DollarSign, Heart, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppInput } from '@/shared/components/AppInput';
import { AppSelect } from '@/shared/components/AppSelect';
import { type OrganizerData } from '../../../services/customer-api';

interface Module8Props {
  data: OrganizerData['m8_deductions'];
  updateField: <K extends keyof OrganizerData['m8_deductions']>(field: K, value: OrganizerData['m8_deductions'][K]) => void;
  selectedTaxYear: number;
}

export const Module8Deductions: React.FC<Module8Props> = ({
  data,
  updateField,
  selectedTaxYear,
}) => {
  return (
    <div className="space-y-6">
      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
        <Receipt className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
        <div>
          <strong>Itemized Deductions, Charity &amp; 2025 Incurred Expenses:</strong> Enter both Taxpayer and Spouse breakdown for all 12 expense categories as per the official ATH Tax Organizer.
        </div>
      </div>

      {/* 1. Rental Deductions for TY2025 Table */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Home className="w-4 h-4 text-emerald-600" />
              <span>Rental Deductions for TY{selectedTaxYear}</span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              In the United States, rental deductions typically refer to tax deductions that tenants/residents can claim related to their rented properties.
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const currentList = data.rentDeductionsList && data.rentDeductionsList.length > 0
                ? [...data.rentDeductionsList]
                : [{ state: 'CA', months: 12, monthlyRent: 0, totalRentPaid: 0 }];
              const updated = [
                ...currentList,
                {
                  state: 'CA',
                  months: 12,
                  monthlyRent: 0,
                  totalRentPaid: 0,
                },
              ];
              updateField('rentDeductionsList', updated);
            }}
            className="text-xs font-bold border-emerald-200 text-[#16A34A] bg-emerald-50 hover:bg-emerald-100 flex items-center gap-1 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add State Rent Row</span>
          </Button>
        </div>

        {/* Dynamic State Rental Deductions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden min-w-[620px]">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-2.5 w-[36%]">State (Eligible State Dropdown)</th>
                <th className="p-2.5 w-[18%]">No. OF Months</th>
                <th className="p-2.5 w-[22%]">Per Month ($)</th>
                <th className="p-2.5 w-[18%]">Total ($)</th>
                <th className="p-2.5 w-[6%] text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {(data.rentDeductionsList && data.rentDeductionsList.length > 0
                ? data.rentDeductionsList
                : [{ state: 'CA', months: 12, monthlyRent: 0, totalRentPaid: 0 }]
              ).map((rent, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  {/* State Dropdown */}
                  <td className="p-2.5">
                    <AppSelect
                      options={[
                        { label: '1. California (CA Renters Credit)', value: 'CA' },
                        { label: '2. Arizona (AZ Renter Credit)', value: 'AZ' },
                        { label: '3. Minnesota (MN Renter Property Refund)', value: 'MN' },
                        { label: '4. Massachusetts (MA Rent Deduction)', value: 'MA' },
                        { label: '5. Wisconsin (WI Renter Credit)', value: 'WI' },
                        { label: '6. Indiana (IN Rent Deduction)', value: 'IN' },
                        { label: '7. New Jersey (NJ Rent Deduction)', value: 'NJ' },
                        { label: 'Hawaii (HI Renter Credit)', value: 'HI' },
                        { label: 'Maryland (MD Rent Credit)', value: 'MD' },
                        { label: 'Michigan (MI Homestead Credit)', value: 'MI' },
                        { label: 'Missouri (MO Property Tax Credit)', value: 'MO' },
                        { label: 'New York (NYC / NY State Rent Credit)', value: 'NY' },
                        { label: 'Texas (TX)', value: 'TX' },
                        { label: 'Washington (WA)', value: 'WA' },
                        { label: 'Other State', value: 'OTHER' },
                      ]}
                      value={rent.state || 'CA'}
                      onChange={(val) => {
                        const list = data.rentDeductionsList && data.rentDeductionsList.length > 0
                          ? [...data.rentDeductionsList]
                          : [{ state: 'CA', months: 12, monthlyRent: 0, totalRentPaid: 0 }];
                        list[idx].state = val || 'CA';
                        updateField('rentDeductionsList', list);
                      }}
                      placeholder="Select State"
                    />
                  </td>

                  {/* Months Input */}
                  <td className="p-2.5">
                    <input
                      type="number"
                      placeholder="12"
                      min="0"
                      max="12"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 bg-white"
                      value={rent.months ? rent.months.toString() : ''}
                      onChange={(e) => {
                        const list = data.rentDeductionsList && data.rentDeductionsList.length > 0
                          ? [...data.rentDeductionsList]
                          : [{ state: 'CA', months: 12, monthlyRent: 0, totalRentPaid: 0 }];
                        const months = parseInt(e.target.value, 10) || 0;
                        list[idx].months = months;
                        list[idx].totalRentPaid = months * (list[idx].monthlyRent || 0);
                        updateField('rentDeductionsList', list);
                      }}
                    />
                  </td>

                  {/* Per Month $ */}
                  <td className="p-2.5">
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs font-bold">$</span>
                      <input
                        type="number"
                        placeholder="e.g. 2200"
                        className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 bg-white"
                        value={rent.monthlyRent ? rent.monthlyRent.toString() : ''}
                        onChange={(e) => {
                          const list = data.rentDeductionsList && data.rentDeductionsList.length > 0
                            ? [...data.rentDeductionsList]
                            : [{ state: 'CA', months: 12, monthlyRent: 0, totalRentPaid: 0 }];
                          const monthlyRent = parseFloat(e.target.value) || 0;
                          list[idx].monthlyRent = monthlyRent;
                          list[idx].totalRentPaid = (list[idx].months || 0) * monthlyRent;
                          updateField('rentDeductionsList', list);
                        }}
                      />
                    </div>
                  </td>

                  {/* Total Rent Badge */}
                  <td className="p-2.5 font-bold text-emerald-700">
                    <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-[#16A34A]">
                      ${((rent.months || 0) * (rent.monthlyRent || 0)).toLocaleString()}
                    </div>
                  </td>

                  {/* Remove Action */}
                  <td className="p-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        const current = data.rentDeductionsList && data.rentDeductionsList.length > 0
                          ? data.rentDeductionsList
                          : [{ state: 'CA', months: 12, monthlyRent: 0, totalRentPaid: 0 }];
                        if (current.length > 1) {
                          const list = current.filter((_, i) => i !== idx);
                          updateField('rentDeductionsList', list);
                        } else {
                          updateField('rentDeductionsList', [
                            { state: 'CA', months: 0, monthlyRent: 0, totalRentPaid: 0 }
                          ]);
                        }
                      }}
                      className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                      title="Remove Row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total Summary Footer */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold">
          <span className="text-slate-700">Total Claimed State Rental Deductions:</span>
          <span className="text-sm text-[#16A34A]">
            ${(
              (data.rentDeductionsList || [{ state: 'CA', months: 12, monthlyRent: 0, totalRentPaid: 0 }])
                .reduce((sum, r) => sum + ((r.months || 0) * (r.monthlyRent || 0)), 0)
            ).toLocaleString()}
          </span>
        </div>
      </div>

      {/* 2. Charitable Donations Table (Word Doc Page 3) */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-600" />
              <span>Charitable Donations Worksheet</span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">List 501(c)(3) religious, educational or disaster relief donations</p>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const list = data.charitableList || [];
              updateField('charitableList', [
                ...list,
                { institutionName: '', amountDonated: 0 },
              ]);
            }}
            className="text-xs font-bold border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Charity Row</span>
          </Button>
        </div>

        {(data.charitableList || []).length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
            No charitable donations listed. Click &quot;Add Charity Row&quot; if you made donations in {selectedTaxYear}.
          </div>
        ) : (
          <div className="space-y-2">
            {(data.charitableList || []).map((ch, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-1 text-xs font-bold text-slate-600 text-center">
                  #{idx + 1}
                </div>
                <div className="sm:col-span-7">
                  <AppInput
                    placeholder="Name of the Charitable Institution (e.g. Red Cross / Temple / UNICEF)"
                    value={ch.institutionName}
                    onChange={(e) => {
                      const list = [...(data.charitableList || [])];
                      list[idx].institutionName = e.target.value;
                      updateField('charitableList', list);
                    }}
                  />
                </div>
                <div className="sm:col-span-3">
                  <AppInput
                    type="number"
                    placeholder="Amount Donated ($)"
                    leftIcon={<DollarSign className="w-4 h-4" />}
                    value={ch.amountDonated ? ch.amountDonated.toString() : ''}
                    onChange={(e) => {
                      const list = [...(data.charitableList || [])];
                      list[idx].amountDonated = parseFloat(e.target.value) || 0;
                      updateField('charitableList', list);
                      updateField('charitableDonations', list.reduce((s, i) => s + (i.amountDonated || 0), 0));
                    }}
                  />
                </div>
                <div className="sm:col-span-1 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      const list = (data.charitableList || []).filter((_, i) => i !== idx);
                      updateField('charitableList', list);
                      updateField('charitableDonations', list.reduce((s, i) => s + (i.amountDonated || 0), 0));
                    }}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Expenses You Incurred In 2025 Table (Exact 12 Categories with Taxpayer & Spouse breakdown) */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white space-y-4">
        <div className="border-b border-slate-100 pb-2">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Expenses You Incurred In {selectedTaxYear} (Taxpayer &amp; Spouse Breakdown)</span>
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Official 12-item itemized deduction breakdown separated by Taxpayer and Spouse amounts
          </p>
        </div>

        {/* Mandatory Documentation Warning Banner from Word Doc */}
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Mandatory:</strong> Email us or upload the source documents of INCOME &amp; EXPENSES into Document Vault. If you have not received source documents yet, mention estimated amounts as per your knowledge.
          </div>
        </div>

        {/* 12-Item Incurred Expenses Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden min-w-[720px]">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-2.5 w-12 text-center">S.No</th>
                <th className="p-2.5 w-1/2">Type Of Expenses</th>
                <th className="p-2.5 w-1/4 bg-emerald-50/50 text-emerald-900">Taxpayer $ Amount</th>
                <th className="p-2.5 w-1/4 bg-indigo-50/50 text-indigo-900">Spouse $ Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {/* Row 1 */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-2.5 font-bold text-slate-900 text-center">1</td>
                <td className="p-2.5 font-medium text-slate-800">
                  Last Year&apos;s Tax Preparation Fees
                </td>
                <td className="p-2">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full pl-6 pr-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                      value={data.lastYearTaxPrepFeeTaxpayer ? data.lastYearTaxPrepFeeTaxpayer.toString() : ''}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        updateField('lastYearTaxPrepFeeTaxpayer', val);
                        updateField('lastYearTaxPrepFee', val + (data.lastYearTaxPrepFeeSpouse || 0));
                      }}
                    />
                  </div>
                </td>
                <td className="p-2">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full pl-6 pr-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                      value={data.lastYearTaxPrepFeeSpouse ? data.lastYearTaxPrepFeeSpouse.toString() : ''}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        updateField('lastYearTaxPrepFeeSpouse', val);
                        updateField('lastYearTaxPrepFee', (data.lastYearTaxPrepFeeTaxpayer || 0) + val);
                      }}
                    />
                  </div>
                </td>
              </tr>

              {/* Row 2 */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-2.5 font-bold text-slate-900 text-center">2</td>
                <td className="p-2.5 font-medium text-slate-800">
                  Home Mortgage Interest &amp; Points (For property in the US) - Provide Form 1098 (Interest Amount only, not EMI)
                </td>
                <td className="p-2">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full pl-6 pr-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                      value={data.mortgageInterestTaxpayer ? data.mortgageInterestTaxpayer.toString() : (data.mortgageInterest1098 ? data.mortgageInterest1098.toString() : '')}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        updateField('mortgageInterestTaxpayer', val);
                        updateField('mortgageInterest1098', val);
                      }}
                    />
                  </div>
                </td>
                <td className="p-2">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full pl-6 pr-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                      value={data.mortgageInterestSpouse ? data.mortgageInterestSpouse.toString() : ''}
                      onChange={(e) => updateField('mortgageInterestSpouse', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </td>
              </tr>

              {/* Row 3 */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-2.5 font-bold text-slate-900 text-center">3</td>
                <td className="p-2.5 font-medium text-slate-800">
                  Property Taxes (For property in the US)
                </td>
                <td className="p-2">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full pl-6 pr-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                      value={data.propertyTaxesUsTaxpayer ? data.propertyTaxesUsTaxpayer.toString() : (data.propertyTaxesUs ? data.propertyTaxesUs.toString() : '')}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        updateField('propertyTaxesUsTaxpayer', val);
                        updateField('propertyTaxesUs', val);
                      }}
                    />
                  </div>
                </td>
                <td className="p-2">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full pl-6 pr-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                      value={data.propertyTaxesUsSpouse ? data.propertyTaxesUsSpouse.toString() : ''}
                      onChange={(e) => updateField('propertyTaxesUsSpouse', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </td>
              </tr>

              {/* Row 4 */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-2.5 font-bold text-slate-900 text-center">4</td>
                <td className="p-2.5 font-medium text-slate-800">
                  Property Taxes (For property in India)
                </td>
                <td className="p-2">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full pl-6 pr-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                      value={data.propertyTaxesIndiaTaxpayer ? data.propertyTaxesIndiaTaxpayer.toString() : (data.propertyTaxesIndia ? data.propertyTaxesIndia.toString() : '')}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        updateField('propertyTaxesIndiaTaxpayer', val);
                        updateField('propertyTaxesIndia', val);
                      }}
                    />
                  </div>
                </td>
                <td className="p-2">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full pl-6 pr-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                      value={data.propertyTaxesIndiaSpouse ? data.propertyTaxesIndiaSpouse.toString() : ''}
                      onChange={(e) => updateField('propertyTaxesIndiaSpouse', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </td>
              </tr>

              {/* Row 5 */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-2.5 font-bold text-slate-900 text-center">5</td>
                <td className="p-2.5 font-medium text-slate-800">
                  Educator Expenses (if you / your spouse is a Teacher or Faculty)
                </td>
                <td className="p-2">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      placeholder="Up to $300"
                      className="w-full pl-6 pr-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                      value={data.educatorExpensesTaxpayer ? data.educatorExpensesTaxpayer.toString() : (data.educatorExpenses ? data.educatorExpenses.toString() : '')}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        updateField('educatorExpensesTaxpayer', val);
                        updateField('educatorExpenses', val);
                      }}
                    />
                  </div>
                </td>
                <td className="p-2">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      placeholder="Up to $300"
                      className="w-full pl-6 pr-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                      value={data.educatorExpensesSpouse ? data.educatorExpensesSpouse.toString() : ''}
                      onChange={(e) => updateField('educatorExpensesSpouse', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </td>
              </tr>

              {/* Row 6 */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-2.5 font-bold text-slate-900 text-center">6</td>
                <td className="p-2.5 font-medium text-slate-800">
                  Medical &amp; Dental Expenses
                </td>
                <td className="p-2">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full pl-6 pr-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                      value={data.medicalExpensesTaxpayer ? data.medicalExpensesTaxpayer.toString() : (data.medicalExpenses ? data.medicalExpenses.toString() : '')}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        updateField('medicalExpensesTaxpayer', val);
                        updateField('medicalExpenses', val);
                      }}
                    />
                  </div>
                </td>
                <td className="p-2">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full pl-6 pr-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                      value={data.medicalExpensesSpouse ? data.medicalExpensesSpouse.toString() : ''}
                      onChange={(e) => updateField('medicalExpensesSpouse', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </td>
              </tr>

              {/* Row 7 */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-2.5 font-bold text-slate-900 text-center">7</td>
                <td className="p-2.5 font-medium text-slate-800">
                  Any State Refunds Received for TY2024?
                </td>
                <td className="p-2">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full pl-6 pr-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                      value={data.stateRefundTY2024Taxpayer ? data.stateRefundTY2024Taxpayer.toString() : (data.stateRefundTY2024 ? data.stateRefundTY2024.toString() : '')}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        updateField('stateRefundTY2024Taxpayer', val);
                        updateField('stateRefundTY2024', val);
                      }}
                    />
                  </div>
                </td>
                <td className="p-2">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full pl-6 pr-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                      value={data.stateRefundTY2024Spouse ? data.stateRefundTY2024Spouse.toString() : ''}
                      onChange={(e) => updateField('stateRefundTY2024Spouse', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </td>
              </tr>

              {/* Row 8 */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-2.5 font-bold text-slate-900 text-center">8</td>
                <td className="p-2.5 space-y-1">
                  <div className="font-medium text-slate-800">
                    Cost of Energy Saving Equipment (Solar, Boiler, Skylights, Heat Pump, Roofing, etc.)
                  </div>
                  <input
                    type="text"
                    placeholder="Mention Equipment Purchased &amp; Model (e.g. Solar Roof 8kW)"
                    className="w-full px-2 py-1 border border-slate-200 rounded text-[11px] text-slate-700 bg-slate-50"
                    value={data.cleanEnergyEquipmentDetails || ''}
                    onChange={(e) => updateField('cleanEnergyEquipmentDetails', e.target.value)}
                  />
                </td>
                <td className="p-2">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full pl-6 pr-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                      value={data.cleanEnergyCostTaxpayer ? data.cleanEnergyCostTaxpayer.toString() : (data.cleanEnergyCost ? data.cleanEnergyCost.toString() : '')}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        updateField('cleanEnergyCostTaxpayer', val);
                        updateField('cleanEnergyCost', val);
                      }}
                    />
                  </div>
                </td>
                <td className="p-2">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full pl-6 pr-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                      value={data.cleanEnergyCostSpouse ? data.cleanEnergyCostSpouse.toString() : ''}
                      onChange={(e) => updateField('cleanEnergyCostSpouse', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </td>
              </tr>

              {/* Row 9 */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-2.5 font-bold text-slate-900 text-center">9</td>
                <td className="p-2.5 space-y-1">
                  <div className="font-medium text-slate-800">
                    Any other expenses not listed above
                  </div>
                  <input
                    type="text"
                    placeholder="Describe other tax-deductible expenses..."
                    className="w-full px-2 py-1 border border-slate-200 rounded text-[11px] text-slate-700 bg-slate-50"
                    value={data.otherExpensesDetails || ''}
                    onChange={(e) => updateField('otherExpensesDetails', e.target.value)}
                  />
                </td>
                <td className="p-2">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full pl-6 pr-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                      value={data.otherExpensesTaxpayer ? data.otherExpensesTaxpayer.toString() : (data.otherExpensesNotListed ? data.otherExpensesNotListed.toString() : '')}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        updateField('otherExpensesTaxpayer', val);
                        updateField('otherExpensesNotListed', val);
                      }}
                    />
                  </div>
                </td>
                <td className="p-2">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full pl-6 pr-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                      value={data.otherExpensesSpouse ? data.otherExpensesSpouse.toString() : ''}
                      onChange={(e) => updateField('otherExpensesSpouse', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </td>
              </tr>

              {/* Row 10 */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-2.5 font-bold text-slate-900 text-center">10</td>
                <td className="p-2.5 font-medium text-slate-800">
                  Capital Gain {selectedTaxYear}
                </td>
                <td className="p-2">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full pl-6 pr-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                      value={data.capitalGain2025Taxpayer ? data.capitalGain2025Taxpayer.toString() : ''}
                      onChange={(e) => updateField('capitalGain2025Taxpayer', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </td>
                <td className="p-2">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full pl-6 pr-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                      value={data.capitalGain2025Spouse ? data.capitalGain2025Spouse.toString() : ''}
                      onChange={(e) => updateField('capitalGain2025Spouse', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </td>
              </tr>

              {/* Row 11 */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-2.5 font-bold text-slate-900 text-center">11</td>
                <td className="p-2.5 font-medium text-slate-800">
                  Capital (Loss) {selectedTaxYear}
                </td>
                <td className="p-2">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full pl-6 pr-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                      value={data.capitalLoss2025Taxpayer ? data.capitalLoss2025Taxpayer.toString() : ''}
                      onChange={(e) => updateField('capitalLoss2025Taxpayer', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </td>
                <td className="p-2">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full pl-6 pr-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                      value={data.capitalLoss2025Spouse ? data.capitalLoss2025Spouse.toString() : ''}
                      onChange={(e) => updateField('capitalLoss2025Spouse', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </td>
              </tr>

              {/* Row 12 */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-2.5 font-bold text-slate-900 text-center">12</td>
                <td className="p-2.5 font-medium text-slate-800">
                  Capital (Loss) Carry Forward of {selectedTaxYear - 2} &amp; {selectedTaxYear - 1} (Attach prior tax returns)
                </td>
                <td className="p-2">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full pl-6 pr-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                      value={data.capitalLossCarryforwardTaxpayer ? data.capitalLossCarryforwardTaxpayer.toString() : ''}
                      onChange={(e) => updateField('capitalLossCarryforwardTaxpayer', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </td>
                <td className="p-2">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full pl-6 pr-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                      value={data.capitalLossCarryforwardSpouse ? data.capitalLossCarryforwardSpouse.toString() : ''}
                      onChange={(e) => updateField('capitalLossCarryforwardSpouse', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
