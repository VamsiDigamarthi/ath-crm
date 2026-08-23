import React from 'react';
import { FileSpreadsheet, Briefcase, DollarSign, Building2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppInput } from '@/shared/components/AppInput';
import { AppSelect } from '@/shared/components/AppSelect';
import { AppDatePicker } from '@/shared/components/AppDatePicker';
import { parseUsDate, formatUsDate } from '../utils/organizer-date-helpers';
import { type OrganizerData } from '../../../services/customer-api';
import { type ValidationErrorMap } from '../utils/organizer-validation';

interface Module4Props {
  data: OrganizerData['m4_wages'];
  updateField: <K extends keyof OrganizerData['m4_wages']>(field: K, value: OrganizerData['m4_wages'][K]) => void;
  selectedTaxYear: number;
  errors?: ValidationErrorMap;
  clearError?: (field: string) => void;
}

export const Module4Wages: React.FC<Module4Props> = ({
  data,
  updateField,
  selectedTaxYear,
  errors = {},
  clearError,
}) => {
  return (
    <div className="space-y-6 font-sans">
      <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-start gap-2.5">
        <FileSpreadsheet className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <strong>Form W-2 Wage Statements &amp; Rental Real Estate:</strong> Enter your primary employer details as listed on your Form W-2 (Box c &amp; Box 1). If you owned and rented residential/commercial property in {selectedTaxYear}, add the details to the Schedule E worksheet below.
        </div>
      </div>

      {/* W-2 Primary Employer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AppInput
          label="Primary Employer Name *"
          placeholder="e.g. Google LLC or Microsoft Corp"
          leftIcon={<Briefcase className="w-4 h-4" />}
          error={errors.employerName}
          value={data.employerName || ''}
          onChange={(e) => {
            updateField('employerName', e.target.value);
            if (clearError) clearError('employerName');
          }}
        />

        <AppInput
          label="Box 1 Total Wages ($) *"
          type="number"
          placeholder="e.g. 148500"
          leftIcon={<DollarSign className="w-4 h-4" />}
          error={errors.estimatedWages}
          value={data.estimatedWages !== undefined && data.estimatedWages !== null ? data.estimatedWages.toString() : ''}
          onChange={(e) => {
            const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
            updateField('estimatedWages', val as any);
            if (clearError) clearError('estimatedWages');
          }}
        />
      </div>

      {/* Rental Property Income & Expenses Worksheet (Schedule E) */}
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
              const list = data.rentalProperties || [];
              updateField('rentalProperties', [
                ...list,
                {
                  propertyType: 'RESIDENTIAL',
                  address: '',
                  monthsRented2025: 12,
                  personalMonths2025: 0,
                  ownership: 'TAXPAYER',
                  purchaseDate: '',
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

        {(data.rentalProperties || []).length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500 space-y-2">
            <p>No rental properties added.</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const list = data.rentalProperties || [];
                updateField('rentalProperties', [
                  ...list,
                  {
                    propertyType: 'RESIDENTIAL',
                    address: '',
                    monthsRented2025: 12,
                    personalMonths2025: 0,
                    ownership: 'TAXPAYER',
                    purchaseDate: '',
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
            {(data.rentalProperties || []).map((prop, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-800">Rental Property #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const list = (data.rentalProperties || []).filter((_, i) => i !== idx);
                      updateField('rentalProperties', list);
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
                      const list = [...(data.rentalProperties || [])];
                      list[idx].propertyType = val || 'RESIDENTIAL';
                      updateField('rentalProperties', list);
                    }}
                  />

                  <div className="sm:col-span-2">
                    <AppInput
                      label="Property Location / Full Address *"
                      placeholder="e.g. 1024 Grand Pkwy, Katy, TX 77494"
                      error={errors[`rental_${idx}_address`]}
                      value={prop.address || ''}
                      onChange={(e) => {
                        const list = [...(data.rentalProperties || [])];
                        list[idx].address = e.target.value;
                        updateField('rentalProperties', list);
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
                      const list = [...(data.rentalProperties || [])];
                      const val = parseInt(e.target.value, 10);
                      list[idx].monthsRented2025 = isNaN(val) ? 0 : Math.min(12, Math.max(0, val));
                      updateField('rentalProperties', list);
                    }}
                  />

                  <AppInput
                    label="Months Used for Personal Purpose (0-12)"
                    type="number"
                    placeholder="0"
                    value={prop.personalMonths2025 !== undefined ? prop.personalMonths2025.toString() : '0'}
                    onChange={(e) => {
                      const list = [...(data.rentalProperties || [])];
                      const val = parseInt(e.target.value, 10);
                      list[idx].personalMonths2025 = isNaN(val) ? 0 : Math.min(12, Math.max(0, val));
                      updateField('rentalProperties', list);
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
                      const list = [...(data.rentalProperties || [])];
                      list[idx].ownership = val || 'TAXPAYER';
                      updateField('rentalProperties', list);
                    }}
                  />

                  <AppDatePicker
                    label="Property Purchase Date (MM/DD/YYYY)"
                    placeholder="MM/DD/YYYY"
                    format="MM/dd/yyyy"
                    accentColor="#16A34A"
                    error={errors[`rental_${idx}_purchaseDate`]}
                    value={parseUsDate(prop.purchaseDate)}
                    onChange={(d) => {
                      const list = [...(data.rentalProperties || [])];
                      list[idx].purchaseDate = formatUsDate(d);
                      updateField('rentalProperties', list);
                      if (clearError) clearError(`rental_${idx}_purchaseDate`);
                    }}
                  />

                  <AppInput
                    label="Cost Basis / Purchase Price ($)"
                    type="number"
                    placeholder="e.g. 350000"
                    leftIcon={<DollarSign className="w-4 h-4" />}
                    value={prop.costOfProperty !== undefined && prop.costOfProperty !== null && prop.costOfProperty > 0 ? prop.costOfProperty.toString() : ''}
                    onChange={(e) => {
                      const list = [...(data.rentalProperties || [])];
                      list[idx].costOfProperty = parseFloat(e.target.value) || 0;
                      updateField('rentalProperties', list);
                    }}
                  />

                  <AppInput
                    label="Total Rental Income Received ($) *"
                    type="number"
                    placeholder="e.g. 28000"
                    leftIcon={<DollarSign className="w-4 h-4" />}
                    error={errors[`rental_${idx}_totalRentalIncome`]}
                    value={prop.totalRentalIncome !== undefined && prop.totalRentalIncome !== null && prop.totalRentalIncome > 0 ? prop.totalRentalIncome.toString() : ''}
                    onChange={(e) => {
                      const list = [...(data.rentalProperties || [])];
                      list[idx].totalRentalIncome = parseFloat(e.target.value) || 0;
                      updateField('rentalProperties', list);
                      if (clearError) clearError(`rental_${idx}_totalRentalIncome`);
                    }}
                  />

                  <AppInput
                    label="Expenses Incurred to Earn Rent ($)"
                    type="number"
                    placeholder="e.g. 6400 (HOA, Repairs, Tax)"
                    leftIcon={<DollarSign className="w-4 h-4" />}
                    value={prop.rentalExpenses !== undefined && prop.rentalExpenses !== null && prop.rentalExpenses > 0 ? prop.rentalExpenses.toString() : ''}
                    onChange={(e) => {
                      const list = [...(data.rentalProperties || [])];
                      list[idx].rentalExpenses = parseFloat(e.target.value) || 0;
                      updateField('rentalProperties', list);
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
