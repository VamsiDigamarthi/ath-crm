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
  const d = (data || {}) as Partial<OrganizerData['m8_deductions']>;
  const rentList = d.rentDeductionsList || [];
  const charityList = d.charitableList || [];

  const [isOpenRentDeductions, setIsOpenRentDeductions] = React.useState<boolean>(false);
  const [isOpenCharity, setIsOpenCharity] = React.useState<boolean>(false);

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
      {!isOpenRentDeductions ? (
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:border-emerald-300 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Rental Deductions for TY{selectedTaxYear} (Max 12 Months Total)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Optional: Claim state renter tax credits for properties rented during {selectedTaxYear}.
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={() => {
                setIsOpenRentDeductions(true);
                if (rentList.length === 0) {
                  const usedStates = rentList.map((r) => r.state).filter(Boolean);
                  const nextState = ALL_ELIGIBLE_STATES.find((s) => !usedStates.includes(s.value))?.value || 'OTHER';
                  const remainingMonths = Math.max(0, 12 - totalRentMonths);

                  const updated = [
                    {
                      state: nextState,
                      months: remainingMonths,
                      monthlyRent: 0,
                      totalRentPaid: 0,
                    },
                  ];
                  updateField('rentDeductionsList', updated);
                  updateField('hasRentDeductions', true);
                }
              }}
              className="text-xs font-bold border-emerald-300 text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100 flex items-center gap-1.5 shrink-0 cursor-pointer px-3.5 py-2 self-start sm:self-auto rounded-xl shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>{rentList.length > 0 ? 'View / Edit State Rent' : 'Add State Rent Row'}</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white space-y-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Home className="w-4 h-4 text-emerald-600" />
                <span>Rental Deductions for TY{selectedTaxYear} ({rentList.length} States)</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Claim state renter tax credits for properties rented during {selectedTaxYear}. Total months across all states cannot exceed 12 months.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={() => {
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
                <span>Add Another State</span>
              </Button>
              <button
                type="button"
                onClick={() => setIsOpenRentDeductions(false)}
                className="text-xs text-slate-600 hover:text-slate-800 font-semibold cursor-pointer px-2 py-1"
              >
                Close
              </button>
            </div>
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
                            if (list.length === 0) updateField('hasRentDeductions', false);
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
      )}

      {/* 2. Charitable Donations Table */}
      {!isOpenCharity ? (
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:border-rose-300 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0 mt-0.5">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Charitable Donations Worksheet
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Optional: List 501(c)(3) religious, educational or disaster relief donations in {selectedTaxYear}.
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={() => {
                setIsOpenCharity(true);
                if (charityList.length === 0) {
                  const updated = [
                    { institutionName: '', amountDonated: 0, donationType: 'CASH' },
                  ];
                  updateField('charitableList', updated);
                }
              }}
              className="text-xs font-bold border-rose-300 text-rose-700 bg-rose-50/80 hover:bg-rose-100 flex items-center gap-1.5 shrink-0 cursor-pointer px-3.5 py-2 self-start sm:self-auto rounded-xl shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>{charityList.length > 0 ? 'View / Edit Charities' : 'Add Charity Row'}</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-600" />
                <span>Charitable Donations Worksheet ({charityList.length})</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">List 501(c)(3) religious, educational or disaster relief donations</p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                type="button"
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
                <span>Add Another Charity</span>
              </Button>
              <button
                type="button"
                onClick={() => setIsOpenCharity(false)}
                className="text-xs text-slate-600 hover:text-slate-800 font-semibold cursor-pointer px-2 py-1"
              >
                Close
              </button>
            </div>
          </div>

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
        </div>
      )}

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
                    value={d.lastYearTaxPrepFeeTaxpayer !== undefined && d.lastYearTaxPrepFeeTaxpayer !== null && d.lastYearTaxPrepFeeTaxpayer > 0 ? d.lastYearTaxPrepFeeTaxpayer.toString() : ''}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      updateField('lastYearTaxPrepFeeTaxpayer', val);
                      updateField('lastYearTaxPrepFee', val + (d.lastYearTaxPrepFeeSpouse || 0));
                    }}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                    value={d.lastYearTaxPrepFeeSpouse !== undefined && d.lastYearTaxPrepFeeSpouse !== null && d.lastYearTaxPrepFeeSpouse > 0 ? d.lastYearTaxPrepFeeSpouse.toString() : ''}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      updateField('lastYearTaxPrepFeeSpouse', val);
                      updateField('lastYearTaxPrepFee', (d.lastYearTaxPrepFeeTaxpayer || 0) + val);
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
                    value={d.mortgageInterestTaxpayer !== undefined && d.mortgageInterestTaxpayer !== null && d.mortgageInterestTaxpayer > 0 ? d.mortgageInterestTaxpayer.toString() : (d.mortgageInterest1098 ? d.mortgageInterest1098.toString() : '')}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      updateField('mortgageInterestTaxpayer', val);
                      updateField('mortgageInterest1098', val + (d.mortgageInterestSpouse || 0));
                    }}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                    value={d.mortgageInterestSpouse !== undefined && d.mortgageInterestSpouse !== null && d.mortgageInterestSpouse > 0 ? d.mortgageInterestSpouse.toString() : ''}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      updateField('mortgageInterestSpouse', val);
                      updateField('mortgageInterest1098', (d.mortgageInterestTaxpayer || 0) + val);
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
                    value={d.propertyTaxesUsTaxpayer !== undefined && d.propertyTaxesUsTaxpayer !== null && d.propertyTaxesUsTaxpayer > 0 ? d.propertyTaxesUsTaxpayer.toString() : (d.propertyTaxesUs ? d.propertyTaxesUs.toString() : '')}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      updateField('propertyTaxesUsTaxpayer', val);
                      updateField('propertyTaxesUs', val + (d.propertyTaxesUsSpouse || 0));
                    }}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                    value={d.propertyTaxesUsSpouse !== undefined && d.propertyTaxesUsSpouse !== null && d.propertyTaxesUsSpouse > 0 ? d.propertyTaxesUsSpouse.toString() : ''}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      updateField('propertyTaxesUsSpouse', val);
                      updateField('propertyTaxesUs', (d.propertyTaxesUsTaxpayer || 0) + val);
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
                    value={d.propertyTaxesIndiaTaxpayer !== undefined && d.propertyTaxesIndiaTaxpayer !== null && d.propertyTaxesIndiaTaxpayer > 0 ? d.propertyTaxesIndiaTaxpayer.toString() : (d.propertyTaxesIndia ? d.propertyTaxesIndia.toString() : '')}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      updateField('propertyTaxesIndiaTaxpayer', val);
                      updateField('propertyTaxesIndia', val + (d.propertyTaxesIndiaSpouse || 0));
                    }}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                    value={d.propertyTaxesIndiaSpouse !== undefined && d.propertyTaxesIndiaSpouse !== null && d.propertyTaxesIndiaSpouse > 0 ? d.propertyTaxesIndiaSpouse.toString() : ''}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      updateField('propertyTaxesIndiaSpouse', val);
                      updateField('propertyTaxesIndia', (d.propertyTaxesIndiaTaxpayer || 0) + val);
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
                    value={d.medicalExpensesTaxpayer !== undefined && d.medicalExpensesTaxpayer !== null && d.medicalExpensesTaxpayer > 0 ? d.medicalExpensesTaxpayer.toString() : (d.medicalExpenses ? d.medicalExpenses.toString() : '')}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      updateField('medicalExpensesTaxpayer', val);
                      updateField('medicalExpenses', val + (d.medicalExpensesSpouse || 0));
                    }}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                    value={d.medicalExpensesSpouse !== undefined && d.medicalExpensesSpouse !== null && d.medicalExpensesSpouse > 0 ? d.medicalExpensesSpouse.toString() : ''}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      updateField('medicalExpensesSpouse', val);
                      updateField('medicalExpenses', (d.medicalExpensesTaxpayer || 0) + val);
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
                    value={d.studentLoanInterestTaxpayer !== undefined && d.studentLoanInterestTaxpayer !== null && d.studentLoanInterestTaxpayer > 0 ? d.studentLoanInterestTaxpayer.toString() : (d.studentLoanInterest ? d.studentLoanInterest.toString() : '')}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      updateField('studentLoanInterestTaxpayer', val);
                      updateField('studentLoanInterest', val + (d.studentLoanInterestSpouse || 0));
                    }}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                    value={d.studentLoanInterestSpouse !== undefined && d.studentLoanInterestSpouse !== null && d.studentLoanInterestSpouse > 0 ? d.studentLoanInterestSpouse.toString() : ''}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      updateField('studentLoanInterestSpouse', val);
                      updateField('studentLoanInterest', (d.studentLoanInterestTaxpayer || 0) + val);
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
                    value={d.solarCleanEnergyTaxpayer !== undefined && d.solarCleanEnergyTaxpayer !== null && d.solarCleanEnergyTaxpayer > 0 ? d.solarCleanEnergyTaxpayer.toString() : (d.solarCleanEnergyExpenses ? d.solarCleanEnergyExpenses.toString() : '')}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      updateField('solarCleanEnergyTaxpayer', val);
                      updateField('solarCleanEnergyExpenses', val + (d.solarCleanEnergySpouse || 0));
                    }}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                    value={d.solarCleanEnergySpouse !== undefined && d.solarCleanEnergySpouse !== null && d.solarCleanEnergySpouse > 0 ? d.solarCleanEnergySpouse.toString() : ''}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      updateField('solarCleanEnergySpouse', val);
                      updateField('solarCleanEnergyExpenses', (d.solarCleanEnergyTaxpayer || 0) + val);
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
                    value={d.electricVehicleTaxpayer !== undefined && d.electricVehicleTaxpayer !== null && d.electricVehicleTaxpayer > 0 ? d.electricVehicleTaxpayer.toString() : (d.electricVehicleExpenses ? d.electricVehicleExpenses.toString() : '')}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      updateField('electricVehicleTaxpayer', val);
                      updateField('electricVehicleExpenses', val + (d.electricVehicleSpouse || 0));
                    }}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                    value={d.electricVehicleSpouse !== undefined && d.electricVehicleSpouse !== null && d.electricVehicleSpouse > 0 ? d.electricVehicleSpouse.toString() : ''}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      updateField('electricVehicleSpouse', val);
                      updateField('electricVehicleExpenses', (d.electricVehicleTaxpayer || 0) + val);
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
                    value={d.hsaTaxpayer !== undefined && d.hsaTaxpayer !== null && d.hsaTaxpayer > 0 ? d.hsaTaxpayer.toString() : (d.hsaContribution ? d.hsaContribution.toString() : '')}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      updateField('hsaTaxpayer', val);
                      updateField('hsaContribution', val + (d.hsaSpouse || 0));
                    }}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                    value={d.hsaSpouse !== undefined && d.hsaSpouse !== null && d.hsaSpouse > 0 ? d.hsaSpouse.toString() : ''}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      updateField('hsaSpouse', val);
                      updateField('hsaContribution', (d.hsaTaxpayer || 0) + val);
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
                    value={d.iraTaxpayer !== undefined && d.iraTaxpayer !== null && d.iraTaxpayer > 0 ? d.iraTaxpayer.toString() : (d.iraContribution ? d.iraContribution.toString() : '')}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      updateField('iraTaxpayer', val);
                      updateField('iraContribution', val + (d.iraSpouse || 0));
                    }}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                    value={d.iraSpouse !== undefined && d.iraSpouse !== null && d.iraSpouse > 0 ? d.iraSpouse.toString() : ''}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      updateField('iraSpouse', val);
                      updateField('iraContribution', (d.iraTaxpayer || 0) + val);
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
                    value={d.educatorExpensesTaxpayer !== undefined && d.educatorExpensesTaxpayer !== null && d.educatorExpensesTaxpayer > 0 ? d.educatorExpensesTaxpayer.toString() : (d.educatorExpenses ? d.educatorExpenses.toString() : '')}
                    onChange={(e) => {
                      const val = Math.min(300, Math.max(0, parseFloat(e.target.value) || 0));
                      updateField('educatorExpensesTaxpayer', val);
                      updateField('educatorExpenses', val + (d.educatorExpensesSpouse || 0));
                    }}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                    value={d.educatorExpensesSpouse !== undefined && d.educatorExpensesSpouse !== null && d.educatorExpensesSpouse > 0 ? d.educatorExpensesSpouse.toString() : ''}
                    onChange={(e) => {
                      const val = Math.min(300, Math.max(0, parseFloat(e.target.value) || 0));
                      updateField('educatorExpensesSpouse', val);
                      updateField('educatorExpenses', (d.educatorExpensesTaxpayer || 0) + val);
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
                    value={d.otherDeductionsDescription || ''}
                    onChange={(e) => updateField('otherDeductionsDescription', e.target.value)}
                  />
                </td>
                <td className="p-2" colSpan={2}>
                  <input
                    type="number"
                    placeholder="Total Amount ($)"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                    value={d.otherDeductionsAmount !== undefined && d.otherDeductionsAmount !== null && d.otherDeductionsAmount > 0 ? d.otherDeductionsAmount.toString() : ''}
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
