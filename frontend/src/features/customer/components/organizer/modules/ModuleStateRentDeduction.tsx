import React from 'react';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppSelect } from '@/shared/components/AppSelect';
import { type OrganizerData } from '../../../services/customer-api';
import { type ValidationErrorMap } from '../utils/organizer-validation';

interface ModuleStateRentDeductionProps {
  rentList: NonNullable<OrganizerData['m8_deductions']['rentDeductionsList']>;
  onUpdateRentList: (newList: NonNullable<OrganizerData['m8_deductions']['rentDeductionsList']>) => void;
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

export const ModuleStateRentDeduction: React.FC<ModuleStateRentDeductionProps> = ({
  rentList = [],
  onUpdateRentList,
  selectedTaxYear: _selectedTaxYear,
  errors = {},
  clearError,
}) => {
  const totalRentMonths = rentList.reduce((sum, r) => sum + (r.months || 0), 0);
  const totalRentPaidAll = rentList.reduce((sum, r) => sum + (r.totalRentPaid || (r.months || 0) * (r.monthlyRent || 0)), 0);

  const handleAddRow = () => {
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
    onUpdateRentList(updated);
  };

  const handleRemoveRow = (idx: number) => {
    const updated = rentList.filter((_, i) => i !== idx);
    onUpdateRentList(updated);
  };

  if (rentList.length === 0) {
    return (
      <div className="py-6 text-center space-y-3">
        <p className="text-xs text-slate-500">
          No state rent deductions added. If you paid residential rent as a tenant in an eligible state, click below to claim your renter deduction.
        </p>
        <Button
          size="sm"
          type="button"
          onClick={handleAddRow}
          className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs px-3.5 py-1.5 rounded-md inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add State Rent Row</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 font-medium">
            Total Months: <strong className={totalRentMonths > 12 ? 'text-rose-600' : 'text-slate-900'}>{totalRentMonths} / 12 max</strong>
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-xs text-slate-600 font-medium">
            Total Rent Claimed: <strong className="text-[#16A34A]">${totalRentPaidAll.toLocaleString()}</strong>
          </span>
        </div>

        <Button
          size="sm"
          type="button"
          onClick={handleAddRow}
          disabled={totalRentMonths >= 12 && rentList.length > 0}
          className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-1 cursor-pointer shadow-2xs disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Another State</span>
        </Button>
      </div>

      {totalRentMonths > 12 && (
        <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2 font-medium">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>
            Total rental months cannot exceed 12 months in a calendar year! You currently have {totalRentMonths} months entered across all states.
          </span>
        </div>
      )}

      {errors.rentMonthsTotal && (
        <p className="text-xs font-medium text-rose-600">{errors.rentMonthsTotal}</p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border border-slate-200 rounded-md overflow-hidden min-w-[620px]">
          <thead className="bg-slate-50 text-slate-700 font-medium border-b border-slate-200">
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
              const selectedInOtherRows = rentList
                .filter((_, i) => i !== idx)
                .map((r) => r.state)
                .filter(Boolean);
              const availableOptions = ALL_ELIGIBLE_STATES.filter(
                (opt) => !selectedInOtherRows.includes(opt.value) || opt.value === rent.state
              );

              return (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-2.5">
                    <AppSelect
                      options={availableOptions}
                      value={rent.state || ''}
                      error={errors[`rent_${idx}_state`]}
                      onChange={(val) => {
                        const list = [...rentList];
                        list[idx].state = val || '';
                        onUpdateRentList(list);
                        if (clearError) clearError(`rent_${idx}_state`);
                      }}
                      placeholder="Select State"
                    />
                  </td>

                  <td className="p-2.5">
                    <input
                      type="number"
                      placeholder="0"
                      min="0"
                      max="12"
                      className={`w-full px-3 py-2 border rounded-md text-xs font-normal text-slate-900 bg-white ${
                        errors[`rent_${idx}_months`] || totalRentMonths > 12 ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                      }`}
                      value={rent.months !== undefined && rent.months !== null && rent.months > 0 ? rent.months.toString() : ''}
                      onChange={(e) => {
                        const list = [...rentList];
                        const raw = parseInt(e.target.value, 10);
                        const months = isNaN(raw) ? 0 : Math.min(12, Math.max(0, raw));
                        list[idx].months = months;
                        list[idx].totalRentPaid = months * (list[idx].monthlyRent || 0);
                        onUpdateRentList(list);
                        if (clearError) {
                          clearError(`rent_${idx}_months`);
                          clearError('rentMonthsTotal');
                        }
                      }}
                    />
                  </td>

                  <td className="p-2.5">
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs font-normal">$</span>
                      <input
                        type="number"
                        placeholder="e.g. 2200"
                        className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-md text-xs font-normal text-slate-900 bg-white"
                        value={rent.monthlyRent !== undefined && rent.monthlyRent !== null && rent.monthlyRent > 0 ? rent.monthlyRent.toString() : ''}
                        onChange={(e) => {
                          const list = [...rentList];
                          const monthly = parseFloat(e.target.value) || 0;
                          list[idx].monthlyRent = monthly;
                          list[idx].totalRentPaid = (list[idx].months || 0) * monthly;
                          onUpdateRentList(list);
                        }}
                      />
                    </div>
                  </td>

                  <td className="p-2.5 font-medium text-slate-800">
                    ${((rent.months || 0) * (rent.monthlyRent || 0)).toLocaleString()}
                  </td>

                  <td className="p-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(idx)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                      title="Remove Row"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
