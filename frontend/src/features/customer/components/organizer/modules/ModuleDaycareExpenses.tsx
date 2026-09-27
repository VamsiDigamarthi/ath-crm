import React from 'react';
import { Plus, Trash2, Baby } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppInput } from '@/shared/components/AppInput';
import { type OrganizerData } from '../../../services/customer-api';
import { type ValidationErrorMap } from '../utils/organizer-validation';

interface ModuleDaycareExpensesProps {
  daycareList: NonNullable<OrganizerData['m2_dependents']['daycareList']>;
  onUpdateDaycareList: (newList: NonNullable<OrganizerData['m2_dependents']['daycareList']>) => void;
  selectedTaxYear: number;
  errors?: ValidationErrorMap;
  clearError?: (field: string) => void;
}

export const ModuleDaycareExpenses: React.FC<ModuleDaycareExpensesProps> = ({
  daycareList = [],
  onUpdateDaycareList,
  selectedTaxYear: _selectedTaxYear,
  errors = {},
  clearError,
}) => {
  const totalPaid = daycareList.reduce((sum, item) => sum + (item.amountPaid || 0), 0);
  const totalReimbursed = daycareList.reduce((sum, item) => sum + (item.employerReimbursed || 0), 0);

  const handleAddProvider = () => {
    const updated = [
      ...daycareList,
      {
        dependentName: '',
        providerName: '',
        providerEinSsn: '',
        providerAddress: '',
        amountPaid: 0,
        employerReimbursed: 0,
      },
    ];
    onUpdateDaycareList(updated);
  };

  const handleRemoveProvider = (idx: number) => {
    const updated = daycareList.filter((_, i) => i !== idx);
    onUpdateDaycareList(updated);
  };

  const handleFieldChange = (idx: number, field: string, value: any) => {
    const list = [...daycareList];
    list[idx] = { ...list[idx], [field]: value };
    onUpdateDaycareList(list);
    if (clearError) {
      clearError(`daycare_${idx}_${field}`);
    }
  };

  if (daycareList.length === 0) {
    return (
      <div className="py-6 text-center space-y-3">
        <p className="text-xs text-slate-500">
          No daycare or childcare providers added. If you paid daycare, nursery, or babysitting expenses so you could work, click below to claim Form 2441 Child Care Credit.
        </p>
        <Button
          size="sm"
          type="button"
          onClick={handleAddProvider}
          className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs px-3.5 py-1.5 rounded-md inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Daycare Provider</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <Baby className="w-4 h-4 text-emerald-600" />
          <span className="text-xs text-slate-600 font-medium">
            Total Daycare Paid: <strong className="text-[#16A34A]">${totalPaid.toLocaleString()}</strong>
          </span>
          {totalReimbursed > 0 && (
            <>
              <span className="text-slate-300">|</span>
              <span className="text-xs text-slate-600 font-medium">
                Employer Reimbursed: <strong className="text-amber-600">${totalReimbursed.toLocaleString()}</strong>
              </span>
            </>
          )}
        </div>

        <Button
          size="sm"
          type="button"
          onClick={handleAddProvider}
          className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-1 cursor-pointer shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Another Provider</span>
        </Button>
      </div>

      <div className="space-y-6">
        {daycareList.map((care, idx) => (
          <div key={idx} className="space-y-3 pt-1 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700">Daycare Provider #{idx + 1}</span>
              <button
                type="button"
                onClick={() => handleRemoveProvider(idx)}
                className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <AppInput
                label="Dependent Name for Whom Paid *"
                placeholder="e.g. Aarav Varma"
                error={errors[`daycare_${idx}_dependentName`]}
                value={care.dependentName || ''}
                onChange={(e) => handleFieldChange(idx, 'dependentName', e.target.value)}
              />

              <AppInput
                label="Daycare Institution / Provider Name *"
                placeholder="e.g. Primrose School / Bright Horizons"
                error={errors[`daycare_${idx}_providerName`]}
                value={care.providerName || ''}
                onChange={(e) => handleFieldChange(idx, 'providerName', e.target.value)}
              />

              <AppInput
                label="Provider EIN or SSN *"
                placeholder="XX-XXXXXXX or SSN"
                error={errors[`daycare_${idx}_providerEinSsn`]}
                value={care.providerEinSsn || ''}
                onChange={(e) => handleFieldChange(idx, 'providerEinSsn', e.target.value)}
              />

              <div className="sm:col-span-3">
                <AppInput
                  label="Provider Full Address (Street, City, State, ZIP) *"
                  placeholder="e.g. 5200 University Dr, Houston, TX 77004"
                  error={errors[`daycare_${idx}_providerAddress`]}
                  value={care.providerAddress || ''}
                  onChange={(e) => handleFieldChange(idx, 'providerAddress', e.target.value)}
                />
              </div>

              <AppInput
                label="Total Amount Paid ($) *"
                type="number"
                placeholder="e.g. 3600"
                error={errors[`daycare_${idx}_amountPaid`]}
                value={care.amountPaid ? care.amountPaid.toString() : ''}
                onChange={(e) => handleFieldChange(idx, 'amountPaid', parseFloat(e.target.value) || 0)}
              />

              <AppInput
                label="Employer Reimbursed (FSA / DCFSA) ($)"
                type="number"
                placeholder="e.g. 0"
                value={care.employerReimbursed ? care.employerReimbursed.toString() : ''}
                onChange={(e) => handleFieldChange(idx, 'employerReimbursed', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
