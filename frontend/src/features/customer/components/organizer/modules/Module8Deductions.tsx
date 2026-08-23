import React from 'react';
import { Receipt, Home, Plus, Trash2, DollarSign, Heart, AlertCircle, Sparkles, AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppInput } from '@/shared/components/AppInput';
import { AppSelect } from '@/shared/components/AppSelect';
import { type OrganizerData } from '../../../services/customer-api';
import { type ValidationErrorMap } from '../utils/organizer-validation';

interface Module8Props {
  data: OrganizerData['m8_deductions'];
  updateField: <K extends keyof OrganizerData['m8_deductions']>(field: K, value: OrganizerData['m8_deductions'][K]) => void;
  selectedTaxYear: number;
  errors?: ValidationErrorMap;
  clearError?: (field: string) => void;
}

const ALL_ELIGIBLE_STATES = [
  { label: 'California (CA Renters Credit)', value: 'CA' },
  { label: 'Arizona (AZ Renter Credit)', value: 'AZ' },
  { label: 'Minnesota (MN Renter Property Refund)', value: 'MN' },
  { label: 'Massachusetts (MA Rent Deduction)', value: 'MA' },
  { label: 'Wisconsin (WI Renter Credit)', value: 'WI' },
  { label: 'Indiana (IN Rent Deduction)', value: 'IN' },
  { label: 'New Jersey (NJ Rent Deduction)', value: 'NJ' },
  { label: 'Hawaii (HI Renter Credit)', value: 'HI' },
  { label: 'Maryland (MD Rent Credit)', value: 'MD' },
  { label: 'Michigan (MI Homestead Credit)', value: 'MI' },
  { label: 'Missouri (MO Property Tax Credit)', value: 'MO' },
  { label: 'New York (NYC / NY State Rent Credit)', value: 'NY' },
  { label: 'Texas (TX)', value: 'TX' },
  { label: 'Washington (WA)', value: 'WA' },
  { label: 'Other State', value: 'OTHER' },
];

export const Module8Deductions: React.FC<Module8Props> = ({
  data,
  updateField,
  selectedTaxYear,
  errors = {},
  clearError,
}) => {
  const rentList = data.rentDeductionsList || [];
  const charityList = data.charitableList || [];

  const totalRentMonths = rentList.reduce((sum, r) => sum + (r.months || 0), 0);
  const totalRentClaimed = rentList.reduce((sum, r) => sum + ((r.months || 0) * (r.monthlyRent || 0)), 0);

  return (
    <div className="space-y-6 font-sans">
      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
        <Receipt className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
        <div>
          <strong>Itemized Deductions, State Rent &amp; {selectedTaxYear} Incurred Expenses (Optional):</strong> Enter both Taxpayer and Spouse breakdown for rental deductions, charitable contributions, and eligible itemized expense categories.
        </div>
      </div>

      {/* 1. Rental Deductions Table */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Home className="w-4 h-4 text-emerald-600" />
              <span>Rental Deductions for TY{selectedTaxYear} (Max 12 Months Total)</span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Claim state renter tax credits for properties rented during {selectedTaxYear}. Total months across all states cannot exceed 12 months.
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              // Find next available unused state
              const usedStates = rentList.map((r) => r.state).filter(Boolean);
              const nextState = ALL_ELIGIBLE_STATES.find((s) => !usedStates.includes(s.value))?.value || 'OTHER';
              const remainingMonths = Math.max(0, 12 - totalRentMonths);

              const updated = [
                ...rentList,
                {
                  state: nextState,
                  months: remainingMonths,
                  monthlyRent: 0,
                  totalRentPaid: 0,
                },
              ];
              updateField('rentDeductionsList', updated);
              updateField('hasRentDeductions', true);
            }}
            className="text-xs font-bold border-emerald-200 text-[#16A34A] bg-emerald-50 hover:bg-emerald-100 flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add State Rent Row</span>
          </Button>
        </div>

        {/* 12 Months Warning Banner */}
        {totalRentMonths > 12 && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2 font-bold">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              Total rental months cannot exceed 12 months in a calendar year! You currently have {totalRentMonths} months entered across all states.
            </span>
          </div>
        )}

        {errors.rentMonthsTotal && (
          <p className="text-xs font-bold text-rose-600">{errors.rentMonthsTotal}</p>
        )}

        {/* Dynamic State Rental Deductions Table */}
        {rentList.length === 0 ? (
          <div className="p-5 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500 space-y-2">
            <p>No state rental deduction rows added yet.</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                updateField('rentDeductionsList', [
                  { state: 'CA', months: 12, monthlyRent: 0, totalRentPaid: 0 },
                ]);
                updateField('hasRentDeductions', true);
              }}
              className="text-xs font-bold border-emerald-200 text-[#16A34A] bg-emerald-50 hover:bg-emerald-100 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Add State Rent Row</span>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden min-w-[620px]">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5 w-[36%]">State (Unique Selection)</th>
                  <th className="p-2.5 w-[18%]">No. OF Months (Max 12)</th>
                  <th className="p-2.5 w-[22%]">Per Month ($)</th>
                  <th className="p-2.5 w-[18%]">Total Rent ($)</th>
                  <th className="p-2.5 w-[6%] text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {rentList.map((rent, idx) => {
                  // Filter out states selected in other rows
                  const selectedInOtherRows = rentList
                    .filter((_, i) => i !== idx)
                    .map((r) => r.state)
                    .filter(Boolean);
                  const availableOptions = ALL_ELIGIBLE_STATES.filter(
                    (opt) => !selectedInOtherRows.includes(opt.value) || opt.value === rent.state
                  );

                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      {/* State Dropdown */}
                      <td className="p-2.5">
                        <AppSelect
                          options={availableOptions}
                          value={rent.state || ''}
                          error={errors[`rent_${idx}_state`]}
                          onChange={(val) => {
                            const list = [...rentList];
                            list[idx].state = val || '';
                            updateField('rentDeductionsList', list);
                            if (clearError) clearError(`rent_${idx}_state`);
                          }}
                          placeholder="Select State"
                        />
                      </td>

                      {/* Months Input */}
                      <td className="p-2.5">
                        <input
                          type="number"
                          placeholder="0"
                          min="0"
                          max="12"
                          className={`w-full px-3 py-2 border rounded-xl text-xs font-semibold text-slate-900 bg-white ${
                            errors[`rent_${idx}_months`] || totalRentMonths > 12 ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                          }`}
                          value={rent.months !== undefined && rent.months !== null && rent.months > 0 ? rent.months.toString() : ''}
                          onChange={(e) => {
                            const list = [...rentList];
                            const raw = parseInt(e.target.value, 10);
                            const months = isNaN(raw) ? 0 : Math.min(12, Math.max(0, raw));
                            list[idx].months = months;
                            list[idx].totalRentPaid = months * (list[idx].monthlyRent || 0);
                            updateField('rentDeductionsList', list);
                            if (clearError) {
                              clearError(`rent_${idx}_months`);
                              clearError('rentMonthsTotal');
                            }
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
                            value={rent.monthlyRent !== undefined && rent.monthlyRent !== null && rent.monthlyRent > 0 ? rent.monthlyRent.toString() : ''}
                            onChange={(e) => {
                              const list = [...rentList];
                              const raw = parseFloat(e.target.value);
                              const monthlyRent = isNaN(raw) ? 0 : Math.max(0, raw);
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
                            const list = rentList.filter((_, i) => i !== idx);
                            updateField('rentDeductionsList', list);
                          }}
                          className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                          title="Remove Row"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Total Summary Footer */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold">
          <span className="text-slate-700">
            Total Claimed Rental Deductions ({totalRentMonths} / 12 Months):
          </span>
          <span className={`text-sm font-extrabold ${totalRentMonths > 12 ? 'text-rose-600' : 'text-[#16A34A]'}`}>
            ${totalRentClaimed.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 2. Charitable Donations Table */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white space-y-4 shadow-2xs">
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
              const updated = [
                ...charityList,
                { institutionName: '', amountDonated: 0, donationType: 'CASH' },
              ];
              updateField('charitableList', updated);
            }}
            className="text-xs font-bold border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Charity Row</span>
          </Button>
        </div>

        {charityList.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
            No charitable donations listed. Click &quot;Add Charity Row&quot; if you made donations in {selectedTaxYear}.
          </div>
        ) : (
          <div className="space-y-2">
            {charityList.map((ch, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-1 text-xs font-bold text-slate-600 text-center">
                  #{idx + 1}
                </div>
                <div className="sm:col-span-7">
                  <AppInput
                    placeholder="Name of Charitable Institution (e.g. Red Cross / Temple / UNICEF)"
                    error={errors[`charity_${idx}_institutionName`]}
                    value={ch.institutionName || ''}
                    onChange={(e) => {
                      const list = [...charityList];
                      list[idx].institutionName = e.target.value;
                      updateField('charitableList', list);
                      if (clearError) clearError(`charity_${idx}_institutionName`);
                    }}
                  />
                </div>
                <div className="sm:col-span-3">
                  <AppInput
                    type="number"
                    placeholder="Amount Donated ($)"
                    leftIcon={<DollarSign className="w-4 h-4" />}
                    error={errors[`charity_${idx}_amountDonated`]}
                    value={ch.amountDonated !== undefined && ch.amountDonated !== null && ch.amountDonated > 0 ? ch.amountDonated.toString() : ''}
                    onChange={(e) => {
                      const list = [...charityList];
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      list[idx].amountDonated = val;
                      updateField('charitableList', list);
                      updateField('charitableDonations', list.reduce((s, i) => s + (i.amountDonated || 0), 0));
                      if (clearError) clearError(`charity_${idx}_amountDonated`);
                    }}
                  />
                </div>
                <div className="sm:col-span-1 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      const list = charityList.filter((_, i) => i !== idx);
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

      {/* 3. Expenses Incurred (12 Categories with Taxpayer & Spouse breakdown) */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white space-y-4 shadow-2xs">
        <div className="border-b border-slate-100 pb-2">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Expenses Incurred In {selectedTaxYear} (Taxpayer &amp; Spouse Breakdown)</span>
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Itemized deduction breakdown separated by Taxpayer and Spouse amounts
          </p>
        </div>

        {/* Documentation Banner */}
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Notice:</strong> If claiming Form 1098 Mortgage Interest, Real Estate Taxes, or Solar Clean Energy Credits (Form 5695), please upload supporting statements into the Document Vault.
          </div>
        </div>

        {/* 12-Item Incurred Expenses Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden min-w-[720px]">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-2.5 w-12 text-center">S.No</th>
                <th className="p-2.5 w-1/2">Type Of Expense Category</th>
                <th className="p-2.5 w-1/4 bg-emerald-50/50 text-emerald-900">Taxpayer ($)</th>
                <th className="p-2.5 w-1/4 bg-indigo-50/50 text-indigo-900">Spouse ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {/* Row 1 */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-2.5 font-bold text-slate-900 text-center">1</td>
                <td className="p-2.5 font-medium text-slate-800">Last Year&apos;s Tax Preparation Fees</td>
                <td className="p-2">
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                    value={data.lastYearTaxPrepFeeTaxpayer !== undefined && data.lastYearTaxPrepFeeTaxpayer !== null && data.lastYearTaxPrepFeeTaxpayer > 0 ? data.lastYearTaxPrepFeeTaxpayer.toString() : ''}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      updateField('lastYearTaxPrepFeeTaxpayer', val);
                      updateField('lastYearTaxPrepFee', val + (data.lastYearTaxPrepFeeSpouse || 0));
                    }}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                    value={data.lastYearTaxPrepFeeSpouse !== undefined && data.lastYearTaxPrepFeeSpouse !== null && data.lastYearTaxPrepFeeSpouse > 0 ? data.lastYearTaxPrepFeeSpouse.toString() : ''}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      updateField('lastYearTaxPrepFeeSpouse', val);
                      updateField('lastYearTaxPrepFee', (data.lastYearTaxPrepFeeTaxpayer || 0) + val);
                    }}
                  />
                </td>
              </tr>

              {/* Row 2 */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-2.5 font-bold text-slate-900 text-center">2</td>
                <td className="p-2.5 font-medium text-slate-800">
                  Home Mortgage Interest (Form 1098 - Interest Only)
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                    value={data.mortgageInterestTaxpayer !== undefined && data.mortgageInterestTaxpayer !== null && data.mortgageInterestTaxpayer > 0 ? data.mortgageInterestTaxpayer.toString() : (data.mortgageInterest1098 ? data.mortgageInterest1098.toString() : '')}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      updateField('mortgageInterestTaxpayer', val);
                      updateField('mortgageInterest1098', val + (data.mortgageInterestSpouse || 0));
                    }}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                    value={data.mortgageInterestSpouse !== undefined && data.mortgageInterestSpouse !== null && data.mortgageInterestSpouse > 0 ? data.mortgageInterestSpouse.toString() : ''}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      updateField('mortgageInterestSpouse', val);
                      updateField('mortgageInterest1098', (data.mortgageInterestTaxpayer || 0) + val);
                    }}
                  />
                </td>
              </tr>

              {/* Row 3 */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-2.5 font-bold text-slate-900 text-center">3</td>
                <td className="p-2.5 font-medium text-slate-800">Property / Real Estate Taxes (US)</td>
                <td className="p-2">
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                    value={data.propertyTaxesUsTaxpayer !== undefined && data.propertyTaxesUsTaxpayer !== null && data.propertyTaxesUsTaxpayer > 0 ? data.propertyTaxesUsTaxpayer.toString() : (data.propertyTaxesUs ? data.propertyTaxesUs.toString() : '')}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      updateField('propertyTaxesUsTaxpayer', val);
                      updateField('propertyTaxesUs', val + (data.propertyTaxesUsSpouse || 0));
                    }}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                    value={data.propertyTaxesUsSpouse !== undefined && data.propertyTaxesUsSpouse !== null && data.propertyTaxesUsSpouse > 0 ? data.propertyTaxesUsSpouse.toString() : ''}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      updateField('propertyTaxesUsSpouse', val);
                      updateField('propertyTaxesUs', (data.propertyTaxesUsTaxpayer || 0) + val);
                    }}
                  />
                </td>
              </tr>

              {/* Row 4 */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-2.5 font-bold text-slate-900 text-center">4</td>
                <td className="p-2.5 font-medium text-slate-800">Property Taxes (India)</td>
                <td className="p-2">
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                    value={data.propertyTaxesIndiaTaxpayer !== undefined && data.propertyTaxesIndiaTaxpayer !== null && data.propertyTaxesIndiaTaxpayer > 0 ? data.propertyTaxesIndiaTaxpayer.toString() : (data.propertyTaxesIndia ? data.propertyTaxesIndia.toString() : '')}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      updateField('propertyTaxesIndiaTaxpayer', val);
                      updateField('propertyTaxesIndia', val + (data.propertyTaxesIndiaSpouse || 0));
                    }}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                    value={data.propertyTaxesIndiaSpouse !== undefined && data.propertyTaxesIndiaSpouse !== null && data.propertyTaxesIndiaSpouse > 0 ? data.propertyTaxesIndiaSpouse.toString() : ''}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      updateField('propertyTaxesIndiaSpouse', val);
                      updateField('propertyTaxesIndia', (data.propertyTaxesIndiaTaxpayer || 0) + val);
                    }}
                  />
                </td>
              </tr>

              {/* Row 5 */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-2.5 font-bold text-slate-900 text-center">5</td>
                <td className="p-2.5 font-medium text-slate-800">Medical &amp; Dental Expenses (Exceeding 7.5% of AGI)</td>
                <td className="p-2">
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                    value={data.medicalExpensesTaxpayer !== undefined && data.medicalExpensesTaxpayer !== null && data.medicalExpensesTaxpayer > 0 ? data.medicalExpensesTaxpayer.toString() : (data.medicalExpenses ? data.medicalExpenses.toString() : '')}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      updateField('medicalExpensesTaxpayer', val);
                      updateField('medicalExpenses', val + (data.medicalExpensesSpouse || 0));
                    }}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                    value={data.medicalExpensesSpouse !== undefined && data.medicalExpensesSpouse !== null && data.medicalExpensesSpouse > 0 ? data.medicalExpensesSpouse.toString() : ''}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      updateField('medicalExpensesSpouse', val);
                      updateField('medicalExpenses', (data.medicalExpensesTaxpayer || 0) + val);
                    }}
                  />
                </td>
              </tr>

              {/* Row 6 */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-2.5 font-bold text-slate-900 text-center">6</td>
                <td className="p-2.5 font-medium text-slate-800">Student Loan Interest (Form 1098-E)</td>
                <td className="p-2">
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                    value={data.studentLoanInterestTaxpayer !== undefined && data.studentLoanInterestTaxpayer !== null && data.studentLoanInterestTaxpayer > 0 ? data.studentLoanInterestTaxpayer.toString() : (data.studentLoanInterest ? data.studentLoanInterest.toString() : '')}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      updateField('studentLoanInterestTaxpayer', val);
                      updateField('studentLoanInterest', val + (data.studentLoanInterestSpouse || 0));
                    }}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                    value={data.studentLoanInterestSpouse !== undefined && data.studentLoanInterestSpouse !== null && data.studentLoanInterestSpouse > 0 ? data.studentLoanInterestSpouse.toString() : ''}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      updateField('studentLoanInterestSpouse', val);
                      updateField('studentLoanInterest', (data.studentLoanInterestTaxpayer || 0) + val);
                    }}
                  />
                </td>
              </tr>

              {/* Row 7 */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-2.5 font-bold text-slate-900 text-center">7</td>
                <td className="p-2.5 font-medium text-slate-800">Solar / Clean Energy Credit (Form 5695)</td>
                <td className="p-2">
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                    value={data.solarCleanEnergyTaxpayer !== undefined && data.solarCleanEnergyTaxpayer !== null && data.solarCleanEnergyTaxpayer > 0 ? data.solarCleanEnergyTaxpayer.toString() : (data.solarCleanEnergyExpenses ? data.solarCleanEnergyExpenses.toString() : '')}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      updateField('solarCleanEnergyTaxpayer', val);
                      updateField('solarCleanEnergyExpenses', val + (data.solarCleanEnergySpouse || 0));
                    }}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                    value={data.solarCleanEnergySpouse !== undefined && data.solarCleanEnergySpouse !== null && data.solarCleanEnergySpouse > 0 ? data.solarCleanEnergySpouse.toString() : ''}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      updateField('solarCleanEnergySpouse', val);
                      updateField('solarCleanEnergyExpenses', (data.solarCleanEnergyTaxpayer || 0) + val);
                    }}
                  />
                </td>
              </tr>

              {/* Row 8 */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-2.5 font-bold text-slate-900 text-center">8</td>
                <td className="p-2.5 font-medium text-slate-800">Electric Vehicle (EV) Credit (Form 8936)</td>
                <td className="p-2">
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                    value={data.electricVehicleTaxpayer !== undefined && data.electricVehicleTaxpayer !== null && data.electricVehicleTaxpayer > 0 ? data.electricVehicleTaxpayer.toString() : (data.electricVehicleExpenses ? data.electricVehicleExpenses.toString() : '')}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      updateField('electricVehicleTaxpayer', val);
                      updateField('electricVehicleExpenses', val + (data.electricVehicleSpouse || 0));
                    }}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                    value={data.electricVehicleSpouse !== undefined && data.electricVehicleSpouse !== null && data.electricVehicleSpouse > 0 ? data.electricVehicleSpouse.toString() : ''}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      updateField('electricVehicleSpouse', val);
                      updateField('electricVehicleExpenses', (data.electricVehicleTaxpayer || 0) + val);
                    }}
                  />
                </td>
              </tr>

              {/* Row 9 */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-2.5 font-bold text-slate-900 text-center">9</td>
                <td className="p-2.5 font-medium text-slate-800">HSA Personal Contributions (Form 8889)</td>
                <td className="p-2">
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                    value={data.hsaTaxpayer !== undefined && data.hsaTaxpayer !== null && data.hsaTaxpayer > 0 ? data.hsaTaxpayer.toString() : (data.hsaContribution ? data.hsaContribution.toString() : '')}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      updateField('hsaTaxpayer', val);
                      updateField('hsaContribution', val + (data.hsaSpouse || 0));
                    }}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                    value={data.hsaSpouse !== undefined && data.hsaSpouse !== null && data.hsaSpouse > 0 ? data.hsaSpouse.toString() : ''}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      updateField('hsaSpouse', val);
                      updateField('hsaContribution', (data.hsaTaxpayer || 0) + val);
                    }}
                  />
                </td>
              </tr>

              {/* Row 10 */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-2.5 font-bold text-slate-900 text-center">10</td>
                <td className="p-2.5 font-medium text-slate-800">Traditional IRA Contributions</td>
                <td className="p-2">
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                    value={data.iraTaxpayer !== undefined && data.iraTaxpayer !== null && data.iraTaxpayer > 0 ? data.iraTaxpayer.toString() : (data.iraContribution ? data.iraContribution.toString() : '')}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      updateField('iraTaxpayer', val);
                      updateField('iraContribution', val + (data.iraSpouse || 0));
                    }}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                    value={data.iraSpouse !== undefined && data.iraSpouse !== null && data.iraSpouse > 0 ? data.iraSpouse.toString() : ''}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      updateField('iraSpouse', val);
                      updateField('iraContribution', (data.iraTaxpayer || 0) + val);
                    }}
                  />
                </td>
              </tr>

              {/* Row 11 */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-2.5 font-bold text-slate-900 text-center">11</td>
                <td className="p-2.5 font-medium text-slate-800">Educator Classroom Expenses ($300 Limit)</td>
                <td className="p-2">
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                    value={data.educatorExpensesTaxpayer !== undefined && data.educatorExpensesTaxpayer !== null && data.educatorExpensesTaxpayer > 0 ? data.educatorExpensesTaxpayer.toString() : (data.educatorExpenses ? data.educatorExpenses.toString() : '')}
                    onChange={(e) => {
                      const val = Math.min(300, Math.max(0, parseFloat(e.target.value) || 0));
                      updateField('educatorExpensesTaxpayer', val);
                      updateField('educatorExpenses', val + (data.educatorExpensesSpouse || 0));
                    }}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                    value={data.educatorExpensesSpouse !== undefined && data.educatorExpensesSpouse !== null && data.educatorExpensesSpouse > 0 ? data.educatorExpensesSpouse.toString() : ''}
                    onChange={(e) => {
                      const val = Math.min(300, Math.max(0, parseFloat(e.target.value) || 0));
                      updateField('educatorExpensesSpouse', val);
                      updateField('educatorExpenses', (data.educatorExpensesTaxpayer || 0) + val);
                    }}
                  />
                </td>
              </tr>

              {/* Row 12 */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-2.5 font-bold text-slate-900 text-center">12</td>
                <td className="p-2.5 font-medium text-slate-800">
                  Other Deductions
                  <input
                    type="text"
                    placeholder="Brief description of deduction..."
                    className="w-full mt-1 px-2.5 py-1 border border-slate-200 rounded text-[11px] font-normal text-slate-700"
                    value={data.otherDeductionsDescription || ''}
                    onChange={(e) => updateField('otherDeductionsDescription', e.target.value)}
                  />
                </td>
                <td className="p-2" colSpan={2}>
                  <input
                    type="number"
                    placeholder="Total Amount ($)"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                    value={data.otherDeductionsAmount !== undefined && data.otherDeductionsAmount !== null && data.otherDeductionsAmount > 0 ? data.otherDeductionsAmount.toString() : ''}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      updateField('otherDeductionsAmount', val);
                    }}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
