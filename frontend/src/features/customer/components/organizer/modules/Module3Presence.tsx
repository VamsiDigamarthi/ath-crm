import React from 'react';
import { Globe, Home, Calendar, Plus, Trash2, Building2 } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppInput } from '@/shared/components/AppInput';
import { AppSelect } from '@/shared/components/AppSelect';
import { AppDatePicker } from '@/shared/components/AppDatePicker';
import { parseUsDate, formatUsDate } from '../utils/organizer-date-helpers';
import { type OrganizerData } from '../../../services/customer-api';
import { isLeapYear, type ValidationErrorMap } from '../utils/organizer-validation';

interface Module3Props {
  data: OrganizerData['m3_presence'];
  updateField: <K extends keyof OrganizerData['m3_presence']>(field: K, value: OrganizerData['m3_presence'][K]) => void;
  selectedTaxYear: number;
  organizerData?: OrganizerData | null;
  updateModuleField?: <K extends keyof OrganizerData>(moduleKey: K, field: keyof OrganizerData[K], value: any) => void;
  errors?: ValidationErrorMap;
  clearError?: (field: string) => void;
}

export const Module3Presence: React.FC<Module3Props> = ({
  data,
  updateField,
  selectedTaxYear,
  organizerData,
  updateModuleField,
  errors = {},
  clearError,
}) => {
  const d = (data || {}) as Partial<OrganizerData['m3_presence']>;
  const historyList = d.statesResidedHistory || [];
  
  // Support rental properties stored in either m3_presence or legacy m4_wages
  const rentalList = d.rentalProperties || organizerData?.m4_wages?.rentalProperties || [];

  const maxCurrentDays = isLeapYear(selectedTaxYear) ? 366 : 365;
  const maxPrior1Days = isLeapYear(selectedTaxYear - 1) ? 366 : 365;
  const maxPrior2Days = isLeapYear(selectedTaxYear - 2) ? 366 : 365;

  const handleDaysChange = (field: 'days2025' | 'days2024' | 'days2023', rawVal: string, maxDays: number) => {
    if (clearError) clearError(field);
    if (rawVal === '') {
      updateField(field, undefined as any);
      return;
    }
    const num = parseInt(rawVal, 10);
    if (isNaN(num)) {
      updateField(field, undefined as any);
      return;
    }
    // Prevent typing negative or gigantic numbers > maxDays
    const clamped = Math.min(maxDays, Math.max(0, num));
    updateField(field, clamped as any);
  };

  const handleUpdateRentalProperties = (newList: any[]) => {
    updateField('rentalProperties', newList as any);
    if (updateModuleField) {
      updateModuleField('m4_wages', 'rentalProperties', newList as any);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Notice Banner */}
      <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-start gap-2.5">
        <Globe className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <strong>State of Residency &amp; Physical Presence Calculation:</strong> Mention your multi-state residence history, total physical days in the US for {selectedTaxYear}, {selectedTaxYear - 1} &amp; {selectedTaxYear - 2}, and any real estate rental properties owned/rented. Maximum allowed physical days is <strong>{maxCurrentDays} days/year</strong>.
        </div>
      </div>

      {/* 1. 3-Year Physical Presence Day Inputs with Strict 0-365/366 Bound Validation */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white space-y-4 shadow-2xs">
        <div className="border-b border-slate-100 pb-2">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Substantial Presence Test (Physical Days in U.S.)</span>
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Legally determines whether you file Form 1040 (Resident Alien) or Form 1040-NR (Non-Resident Alien)
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AppInput
            label={`TY ${selectedTaxYear} Days in U.S. (Max: ${maxCurrentDays}) *`}
            type="number"
            placeholder="e.g. 365"
            leftIcon={<Calendar className="w-4 h-4" />}
            error={errors.days2025}
            value={d.days2025 !== undefined && d.days2025 !== null ? d.days2025.toString() : ''}
            onChange={(e) => handleDaysChange('days2025', e.target.value, maxCurrentDays)}
          />

          <AppInput
            label={`TY ${selectedTaxYear - 1} Days in U.S. (Max: ${maxPrior1Days}) *`}
            type="number"
            placeholder={isLeapYear(selectedTaxYear - 1) ? 'e.g. 366 (Leap)' : 'e.g. 365'}
            leftIcon={<Calendar className="w-4 h-4" />}
            error={errors.days2024}
            value={d.days2024 !== undefined && d.days2024 !== null ? d.days2024.toString() : ''}
            onChange={(e) => handleDaysChange('days2024', e.target.value, maxPrior1Days)}
          />

          <AppInput
            label={`TY ${selectedTaxYear - 2} Days in U.S. (Max: ${maxPrior2Days}) *`}
            type="number"
            placeholder="e.g. 365"
            leftIcon={<Calendar className="w-4 h-4" />}
            error={errors.days2023}
            value={d.days2023 !== undefined && d.days2023 !== null ? d.days2023.toString() : ''}
            onChange={(e) => handleDaysChange('days2023', e.target.value, maxPrior2Days)}
          />
        </div>
      </div>

      {/* 2. Multi-State Residing History Table (Taxpayer & Spouse) */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Home className="w-4 h-4 text-emerald-600" />
              <span>Resided / Residing State Details (Taxpayer &amp; Spouse)</span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Mention residence history with exact From and To dates for both Taxpayer and Spouse ({selectedTaxYear - 3} - {selectedTaxYear})
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const updated = [
                ...historyList,
                {
                  taxYear: selectedTaxYear,
                  state: '',
                  fromDate: '',
                  toDate: '',
                  spouseState: '',
                  spouseFromDate: '',
                  spouseToDate: '',
                },
              ];
              updateField('statesResidedHistory', updated);
            }}
            className="text-xs font-bold border-emerald-200 text-[#16A34A] bg-emerald-50 hover:bg-emerald-100 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add State Row</span>
          </Button>
        </div>

        {historyList.length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500 space-y-2">
            <p>No multi-state residence history added yet.</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const updated = [
                  {
                    taxYear: selectedTaxYear,
                    state: '',
                    fromDate: '',
                    toDate: '',
                    spouseState: '',
                    spouseFromDate: '',
                    spouseToDate: '',
                  },
                ];
                updateField('statesResidedHistory', updated);
              }}
              className="text-xs font-bold border-emerald-200 text-[#16A34A] bg-emerald-50 hover:bg-emerald-100 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Add State Row</span>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3 bg-slate-100 text-slate-700 text-center">Tax Year</th>
                  <th className="p-3 bg-emerald-50/70 text-emerald-900 border-l border-r border-slate-200 text-center" colSpan={3}>
                    Taxpayer Residency
                  </th>
                  <th className="p-3 bg-indigo-50/70 text-indigo-900 text-center" colSpan={3}>
                    Spouse Residency (Optional)
                  </th>
                  <th className="p-3 w-10 text-center">Action</th>
                </tr>
                <tr className="border-t border-slate-200 bg-slate-50/80 text-[11px] text-slate-600">
                  <th className="p-2 text-center">Year</th>
                  <th className="p-2 border-l border-slate-200 w-24">State *</th>
                  <th className="p-2 min-w-[150px]">From (MM/DD/YYYY) *</th>
                  <th className="p-2 border-r border-slate-200 min-w-[150px]">To (MM/DD/YYYY) *</th>
                  <th className="p-2 w-24">State</th>
                  <th className="p-2 min-w-[150px]">From (MM/DD/YYYY)</th>
                  <th className="p-2 min-w-[150px]">To (MM/DD/YYYY)</th>
                  <th className="p-2 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {historyList.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    {/* Tax Year */}
                    <td className="p-2.5 font-bold text-slate-900 bg-slate-50/40 text-center">
                      <input
                        type="number"
                        placeholder={selectedTaxYear.toString()}
                        className="w-16 px-1.5 py-1 border border-slate-200 rounded text-xs font-bold text-center bg-white"
                        value={row.taxYear || ''}
                        onChange={(e) => {
                          const list = [...historyList];
                          list[idx].taxYear = parseInt(e.target.value, 10) || selectedTaxYear;
                          updateField('statesResidedHistory', list);
                        }}
                      />
                    </td>

                    {/* Taxpayer State */}
                    <td className="p-2 border-l border-slate-200">
                      <div>
                        <input
                          type="text"
                          placeholder="TX"
                          maxLength={2}
                          className={`w-16 px-2 py-1.5 border rounded-lg text-xs uppercase font-bold ${
                            errors[`state_${idx}_state`]
                              ? 'border-rose-400 bg-rose-50 text-rose-900'
                              : 'border-slate-200 text-slate-800'
                          }`}
                          value={row.state || ''}
                          onChange={(e) => {
                            const list = [...historyList];
                            list[idx].state = e.target.value.toUpperCase();
                            updateField('statesResidedHistory', list);
                            if (clearError) clearError(`state_${idx}_state`);
                          }}
                        />
                        {errors[`state_${idx}_state`] && (
                          <span className="text-[10px] text-rose-600 block mt-0.5 font-medium">
                            {errors[`state_${idx}_state`]}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Taxpayer From Date */}
                    <td className="p-2">
                      <AppDatePicker
                        placeholder="MM/DD/YYYY"
                        format="MM/dd/yyyy"
                        accentColor="#16A34A"
                        error={errors[`state_${idx}_fromDate`]}
                        value={parseUsDate(row.fromDate)}
                        onChange={(dVal) => {
                          const list = [...historyList];
                          list[idx].fromDate = formatUsDate(dVal);
                          updateField('statesResidedHistory', list);
                          if (clearError) clearError(`state_${idx}_fromDate`);
                        }}
                      />
                    </td>

                    {/* Taxpayer To Date */}
                    <td className="p-2 border-r border-slate-200">
                      <AppDatePicker
                        placeholder="MM/DD/YYYY"
                        format="MM/dd/yyyy"
                        accentColor="#16A34A"
                        error={errors[`state_${idx}_toDate`]}
                        value={parseUsDate(row.toDate)}
                        onChange={(dVal) => {
                          const list = [...historyList];
                          list[idx].toDate = formatUsDate(dVal);
                          updateField('statesResidedHistory', list);
                          if (clearError) clearError(`state_${idx}_toDate`);
                        }}
                      />
                    </td>

                    {/* Spouse State */}
                    <td className="p-2">
                      <input
                        type="text"
                        placeholder="TX"
                        maxLength={2}
                        className="w-16 px-2 py-1.5 border border-slate-200 rounded-lg text-xs uppercase font-bold text-slate-800"
                        value={row.spouseState || ''}
                        onChange={(e) => {
                          const list = [...historyList];
                          list[idx].spouseState = e.target.value.toUpperCase();
                          updateField('statesResidedHistory', list);
                        }}
                      />
                    </td>

                    {/* Spouse From Date */}
                    <td className="p-2">
                      <AppDatePicker
                        placeholder="MM/DD/YYYY"
                        format="MM/dd/yyyy"
                        accentColor="#6366F1"
                        error={errors[`state_${idx}_spouseFromDate`]}
                        value={parseUsDate(row.spouseFromDate)}
                        onChange={(dVal) => {
                          const list = [...historyList];
                          list[idx].spouseFromDate = formatUsDate(dVal);
                          updateField('statesResidedHistory', list);
                          if (clearError) clearError(`state_${idx}_spouseFromDate`);
                        }}
                      />
                    </td>

                    {/* Spouse To Date */}
                    <td className="p-2">
                      <AppDatePicker
                        placeholder="MM/DD/YYYY"
                        format="MM/dd/yyyy"
                        accentColor="#6366F1"
                        error={errors[`state_${idx}_spouseToDate`]}
                        value={parseUsDate(row.spouseToDate)}
                        onChange={(dVal) => {
                          const list = [...historyList];
                          list[idx].spouseToDate = formatUsDate(dVal);
                          updateField('statesResidedHistory', list);
                          if (clearError) clearError(`state_${idx}_spouseToDate`);
                        }}
                      />
                    </td>

                    {/* Action Remove */}
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          const list = historyList.filter((_, i) => i !== idx);
                          updateField('statesResidedHistory', list);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                        title="Remove row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Rental Property Income & Expenses Worksheet (Schedule E) */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#16A34A]" />
              <span>Rental Property Income &amp; Expenses (Schedule E)</span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Report rental real estate properties owned and rented in {selectedTaxYear}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const list = rentalList;
              handleUpdateRentalProperties([
                ...list,
                {
                  propertyType: 'RESIDENTIAL',
                  address: '',
                  monthsRented2025: 12,
                  personalMonths2025: 0,
                  ownership: 'TAXPAYER',
                  purchaseDate: '',
                  rentedDate: '',
                  costOfProperty: 0,
                  totalRentalIncome: 0,
                  rentalExpenses: 0,
                },
              ]);
            }}
            className="text-xs font-bold border-emerald-200 text-[#16A34A] bg-emerald-50 hover:bg-emerald-100 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Rental Property</span>
          </Button>
        </div>

        {rentalList.length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500 space-y-2">
            <p>No rental properties added.</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const list = rentalList;
                handleUpdateRentalProperties([
                  ...list,
                  {
                    propertyType: 'RESIDENTIAL',
                    address: '',
                    monthsRented2025: 12,
                    personalMonths2025: 0,
                    ownership: 'TAXPAYER',
                    purchaseDate: '',
                    rentedDate: '',
                    costOfProperty: 0,
                    totalRentalIncome: 0,
                    rentalExpenses: 0,
                  },
                ]);
              }}
              className="text-xs font-bold border-emerald-200 text-[#16A34A] bg-emerald-50 hover:bg-emerald-100 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Add Rental Property</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {rentalList.map((prop, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-800">Rental Property #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const list = rentalList.filter((_, i) => i !== idx);
                      handleUpdateRentalProperties(list);
                    }}
                    className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <AppSelect
                    label="Property Type"
                    options={[
                      { label: 'Residential Single/Multi-Family', value: 'RESIDENTIAL' },
                      { label: 'Commercial / Land', value: 'COMMERCIAL' },
                    ]}
                    value={prop.propertyType}
                    onChange={(val) => {
                      const list = [...rentalList];
                      list[idx].propertyType = val || 'RESIDENTIAL';
                      handleUpdateRentalProperties(list);
                    }}
                  />

                  <div className="sm:col-span-2">
                    <AppInput
                      label="Property Location / Full Address *"
                      placeholder="e.g. 1024 Grand Pkwy, Katy, TX 77494"
                      error={errors[`rental_${idx}_address`]}
                      value={prop.address || ''}
                      onChange={(e) => {
                        const list = [...rentalList];
                        list[idx].address = e.target.value;
                        handleUpdateRentalProperties(list);
                        if (clearError) clearError(`rental_${idx}_address`);
                      }}
                    />
                  </div>

                  <AppInput
                    label={`Months Rented in ${selectedTaxYear} (0-12)`}
                    type="number"
                    placeholder="12"
                    value={prop.monthsRented2025 !== undefined ? prop.monthsRented2025.toString() : '12'}
                    onChange={(e) => {
                      const list = [...rentalList];
                      const val = parseInt(e.target.value, 10);
                      list[idx].monthsRented2025 = isNaN(val) ? 0 : Math.min(12, Math.max(0, val));
                      handleUpdateRentalProperties(list);
                    }}
                  />

                  <AppInput
                    label="Months Used for Personal Purpose (0-12)"
                    type="number"
                    placeholder="0"
                    value={prop.personalMonths2025 !== undefined ? prop.personalMonths2025.toString() : '0'}
                    onChange={(e) => {
                      const list = [...rentalList];
                      const val = parseInt(e.target.value, 10);
                      list[idx].personalMonths2025 = isNaN(val) ? 0 : Math.min(12, Math.max(0, val));
                      handleUpdateRentalProperties(list);
                    }}
                  />

                  <AppSelect
                    label="Ownership"
                    options={[
                      { label: 'Primary Taxpayer (100%)', value: 'TAXPAYER' },
                      { label: 'Spouse (100%)', value: 'SPOUSE' },
                      { label: 'Joint Ownership (50/50)', value: 'JOINT' },
                    ]}
                    value={prop.ownership}
                    onChange={(val) => {
                      const list = [...rentalList];
                      list[idx].ownership = val || 'TAXPAYER';
                      handleUpdateRentalProperties(list);
                    }}
                  />

                  <AppDatePicker
                    label="Property Purchase Date (MM/DD/YYYY)"
                    placeholder="MM/DD/YYYY"
                    format="MM/dd/yyyy"
                    accentColor="#16A34A"
                    error={errors[`rental_${idx}_purchaseDate`]}
                    value={parseUsDate(prop.purchaseDate)}
                    onChange={(dateVal) => {
                      const list = [...rentalList];
                      list[idx].purchaseDate = formatUsDate(dateVal);
                      handleUpdateRentalProperties(list);
                      if (clearError) clearError(`rental_${idx}_purchaseDate`);
                    }}
                  />

                  <AppDatePicker
                    label="Property Rented Date (MM/DD/YYYY)"
                    placeholder="MM/DD/YYYY"
                    format="MM/dd/yyyy"
                    accentColor="#16A34A"
                    error={errors[`rental_${idx}_rentedDate`]}
                    value={parseUsDate(prop.rentedDate)}
                    onChange={(dateVal) => {
                      const list = [...rentalList];
                      list[idx].rentedDate = formatUsDate(dateVal);
                      handleUpdateRentalProperties(list);
                      if (clearError) clearError(`rental_${idx}_rentedDate`);
                    }}
                  />

                  <AppInput
                    label="Cost Basis / Purchase Price ($)"
                    type="number"
                    placeholder="e.g. 350000"
                    value={prop.costOfProperty ? prop.costOfProperty.toString() : ''}
                    onChange={(e) => {
                      const list = [...rentalList];
                      list[idx].costOfProperty = parseFloat(e.target.value) || 0;
                      handleUpdateRentalProperties(list);
                    }}
                  />

                  <AppInput
                    label="Total Rental Income Received ($) *"
                    type="number"
                    placeholder="e.g. 28000"
                    error={errors[`rental_${idx}_totalRentalIncome`] || errors[`rental_${idx}_income`]}
                    value={prop.totalRentalIncome ? prop.totalRentalIncome.toString() : ''}
                    onChange={(e) => {
                      const list = [...rentalList];
                      list[idx].totalRentalIncome = parseFloat(e.target.value) || 0;
                      handleUpdateRentalProperties(list);
                      if (clearError) {
                        clearError(`rental_${idx}_totalRentalIncome`);
                        clearError(`rental_${idx}_income`);
                      }
                    }}
                  />

                  <AppInput
                    label="Expenses Incurred to Earn Rent ($)"
                    type="number"
                    placeholder="e.g. 6400 (HOA, Repairs, Tax)"
                    value={prop.rentalExpenses ? prop.rentalExpenses.toString() : ''}
                    onChange={(e) => {
                      const list = [...rentalList];
                      list[idx].rentalExpenses = parseFloat(e.target.value) || 0;
                      handleUpdateRentalProperties(list);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
