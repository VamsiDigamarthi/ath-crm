import React from 'react';
import { FileSpreadsheet, Briefcase, DollarSign, Building2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppInput } from '@/shared/components/AppInput';
import { AppSelect } from '@/shared/components/AppSelect';
import { AppDatePicker } from '@/shared/components/AppDatePicker';
import { parseUsDate, formatUsDate } from '../utils/organizer-date-helpers';
import { type OrganizerData } from '../../../services/customer-api';

interface Module4Props {
  data: OrganizerData['m4_wages'];
  updateField: <K extends keyof OrganizerData['m4_wages']>(field: K, value: OrganizerData['m4_wages'][K]) => void;
  selectedTaxYear: number;
}

export const Module4Wages: React.FC<Module4Props> = ({
  data,
  updateField,
  selectedTaxYear,
}) => {
  return (
    <div className="space-y-6">
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
        <FileSpreadsheet className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <strong>Form W-2 Wage Statements &amp; Rental Real Estate:</strong> Enter your primary employer details and complete the Rental Property worksheet if you received rental income from US or foreign residential/commercial units.
        </div>
      </div>

      {/* W-2 Primary Employer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AppInput
          label="Primary Employer Name *"
          placeholder="e.g. Energy Grids Infrastructure LLC"
          leftIcon={<Briefcase className="w-4 h-4" />}
          value={data.employerName || 'Energy Grids LLC'}
          onChange={(e) => updateField('employerName', e.target.value)}
        />

        <AppInput
          label="Box 1 Total Wages ($) *"
          type="number"
          placeholder="e.g. 148500"
          leftIcon={<DollarSign className="w-4 h-4" />}
          value={data.estimatedWages ? data.estimatedWages.toString() : '148500'}
          onChange={(e) => updateField('estimatedWages', parseFloat(e.target.value) || 0)}
        />
      </div>

      {/* Rental Property Income & Expenses Worksheet */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#16A34A]" />
              <span>Rental Property Income &amp; Expenses (Schedule E)</span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Report rental real estate properties owned and rented in {selectedTaxYear}</p>
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
            className="text-xs font-bold border-emerald-200 text-[#16A34A] bg-emerald-50 hover:bg-emerald-100 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Rental Property</span>
          </Button>
        </div>

        {(data.rentalProperties || []).length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
            No rental properties added. Click &quot;Add Rental Property&quot; if you earned rent from real estate.
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
                      label="Property Location / Full Address"
                      placeholder="e.g. 1024 Grand Pkwy, Katy, TX 77494"
                      value={prop.address}
                      onChange={(e) => {
                        const list = [...(data.rentalProperties || [])];
                        list[idx].address = e.target.value;
                        updateField('rentalProperties', list);
                      }}
                    />
                  </div>

                  <AppInput
                    label={`Months Rented in ${selectedTaxYear}`}
                    type="number"
                    placeholder="12"
                    value={prop.monthsRented2025.toString()}
                    onChange={(e) => {
                      const list = [...(data.rentalProperties || [])];
                      list[idx].monthsRented2025 = parseInt(e.target.value, 10) || 0;
                      updateField('rentalProperties', list);
                    }}
                  />

                  <AppInput
                    label="Months Used for Personal Purpose"
                    type="number"
                    placeholder="0"
                    value={prop.personalMonths2025.toString()}
                    onChange={(e) => {
                      const list = [...(data.rentalProperties || [])];
                      list[idx].personalMonths2025 = parseInt(e.target.value, 10) || 0;
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
                    value={parseUsDate(prop.purchaseDate)}
                    onChange={(d) => {
                      const list = [...(data.rentalProperties || [])];
                      list[idx].purchaseDate = formatUsDate(d);
                      updateField('rentalProperties', list);
                    }}
                  />

                  <AppInput
                    label="Cost Basis / Purchase Price ($)"
                    type="number"
                    placeholder="e.g. 350000"
                    leftIcon={<DollarSign className="w-4 h-4" />}
                    value={prop.costOfProperty ? prop.costOfProperty.toString() : ''}
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
                    value={prop.totalRentalIncome ? prop.totalRentalIncome.toString() : ''}
                    onChange={(e) => {
                      const list = [...(data.rentalProperties || [])];
                      list[idx].totalRentalIncome = parseFloat(e.target.value) || 0;
                      updateField('rentalProperties', list);
                    }}
                  />

                  <AppInput
                    label="Expenses Incurred to Earn Rent ($)"
                    type="number"
                    placeholder="e.g. 6400 (HOA, Repairs, Tax)"
                    leftIcon={<DollarSign className="w-4 h-4" />}
                    value={prop.rentalExpenses ? prop.rentalExpenses.toString() : ''}
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
