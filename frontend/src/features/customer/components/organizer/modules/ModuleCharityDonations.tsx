import React from 'react';
import { Plus, Trash2, Heart } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppInput } from '@/shared/components/AppInput';
import { AppSelect } from '@/shared/components/AppSelect';
import { type OrganizerData } from '../../../services/customer-api';
import { type ValidationErrorMap } from '../utils/organizer-validation';

interface ModuleCharityDonationsProps {
  charityList: NonNullable<OrganizerData['m8_deductions']['charitableList']>;
  onUpdateCharityList: (newList: NonNullable<OrganizerData['m8_deductions']['charitableList']>) => void;
  selectedTaxYear: number;
  errors?: ValidationErrorMap;
  clearError?: (field: string) => void;
}

export const ModuleCharityDonations: React.FC<ModuleCharityDonationsProps> = ({
  charityList = [],
  onUpdateCharityList,
  selectedTaxYear: _selectedTaxYear,
  errors = {},
  clearError,
}) => {
  const totalDonations = charityList.reduce((sum, item) => sum + (item.amountDonated || 0), 0);

  const handleAddDonation = () => {
    const updated = [
      ...charityList,
      {
        institutionName: '',
        amountDonated: 0,
        donationType: 'CASH_CHECK',
      },
    ];
    onUpdateCharityList(updated);
  };

  const handleRemoveDonation = (idx: number) => {
    const updated = charityList.filter((_, i) => i !== idx);
    onUpdateCharityList(updated);
  };

  const handleFieldChange = (idx: number, field: string, value: any) => {
    const list = [...charityList];
    list[idx] = { ...list[idx], [field]: value };
    onUpdateCharityList(list);
    if (clearError) {
      clearError(`charity_${idx}_${field}`);
    }
  };

  if (charityList.length === 0) {
    return (
      <div className="py-6 text-center space-y-3">
        <p className="text-xs text-slate-500">
          No charitable donations added. If you made qualifying donations to 501(c)(3) charities, religious places, or disaster relief, click below to add them.
        </p>
        <Button
          size="sm"
          type="button"
          onClick={handleAddDonation}
          className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs px-3.5 py-1.5 rounded-md inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Charitable Donation</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-500" />
          <span className="text-xs text-slate-600 font-medium">
            Total Charitable Donations: <strong className="text-[#16A34A]">${totalDonations.toLocaleString()}</strong>
          </span>
        </div>

        <Button
          size="sm"
          type="button"
          onClick={handleAddDonation}
          className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-1 cursor-pointer shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Another Donation</span>
        </Button>
      </div>

      <div className="space-y-3">
        {charityList.map((item, idx) => (
          <div key={idx} className="flex flex-col sm:flex-row items-end gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
            <div className="w-full sm:flex-1">
              <AppInput
                label={`#${idx + 1} Institution / Organization Name *`}
                placeholder="e.g. Red Cross / Local Temple / UNICEF"
                error={errors[`charity_${idx}_institutionName`]}
                value={item.institutionName || ''}
                onChange={(e) => handleFieldChange(idx, 'institutionName', e.target.value)}
              />
            </div>

            <div className="w-full sm:w-48">
              <AppSelect
                label="Donation Type"
                options={[
                  { label: 'Cash / Check / Card', value: 'CASH_CHECK' },
                  { label: 'Non-Cash / Clothing / Goods', value: 'NON_CASH' },
                  { label: 'Religious Tithe', value: 'RELIGIOUS' },
                ]}
                value={item.donationType || 'CASH_CHECK'}
                onChange={(val) => handleFieldChange(idx, 'donationType', val || 'CASH_CHECK')}
              />
            </div>

            <div className="w-full sm:w-40">
              <AppInput
                label="Amount Donated ($) *"
                type="number"
                placeholder="e.g. 500"
                error={errors[`charity_${idx}_amountDonated`]}
                value={item.amountDonated ? item.amountDonated.toString() : ''}
                onChange={(e) => handleFieldChange(idx, 'amountDonated', parseFloat(e.target.value) || 0)}
              />
            </div>

            <button
              type="button"
              onClick={() => handleRemoveDonation(idx)}
              className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer shrink-0 self-center sm:self-end mb-1"
              title="Remove Donation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
