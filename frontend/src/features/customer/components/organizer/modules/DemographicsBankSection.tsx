import React from 'react';
import { Building2, CreditCard } from 'lucide-react';
import { AppInput } from '@/shared/components/AppInput';
import { AppSelect } from '@/shared/components/AppSelect';
import { type OrganizerData } from '../../../services/customer-api';

interface DemographicsBankSectionProps {
  m9Data?: Partial<OrganizerData['m9_directDeposit']>;
  updateM9Field?: <K extends keyof OrganizerData['m9_directDeposit']>(field: K, value: OrganizerData['m9_directDeposit'][K]) => void;
  defaultAccountOwner?: string;
  errors?: Record<string, string>;
  clearError?: (field: string) => void;
}

export const DemographicsBankSection: React.FC<DemographicsBankSectionProps> = ({
  m9Data,
  updateM9Field,
  defaultAccountOwner = '',
  errors = {},
  clearError,
}) => {
  const m9 = m9Data || {};

  const handleM9FieldChange = <K extends keyof OrganizerData['m9_directDeposit']>(
    field: K,
    value: OrganizerData['m9_directDeposit'][K],
    errorKey?: string
  ) => {
    if (updateM9Field) {
      updateM9Field(field, value);
    }
    if (errorKey && clearError) {
      clearError(errorKey);
    }
    if (clearError) {
      clearError(field as string);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AppInput
          label="Bank Name *"
          placeholder="e.g. JPMorgan Chase / Bank of America / Wells Fargo"
          leftIcon={<Building2 className="w-4 h-4" />}
          error={errors.bankName}
          value={m9.bankName || ''}
          onChange={(e) => handleM9FieldChange('bankName', e.target.value)}
        />

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 tracking-tight">Account Type *</label>
          <AppSelect
            options={[
              { label: 'Checking Account', value: 'CHECKING' },
              { label: 'Savings Account', value: 'SAVINGS' },
            ]}
            value={m9.accountType || 'CHECKING'}
            onChange={(val) => handleM9FieldChange('accountType', val || 'CHECKING')}
          />
        </div>

        <AppInput
          label="9-Digit Routing Number *"
          placeholder="e.g. 111000614"
          leftIcon={<CreditCard className="w-4 h-4" />}
          error={errors.routingNumber}
          value={m9.routingNumber || ''}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, '').slice(0, 9);
            handleM9FieldChange('routingNumber', raw);
          }}
        />

        <AppInput
          label="Account Number *"
          placeholder="e.g. 849204819"
          leftIcon={<CreditCard className="w-4 h-4" />}
          error={errors.accountNumber}
          value={m9.accountNumber || ''}
          onChange={(e) => handleM9FieldChange('accountNumber', e.target.value)}
        />

        <div className="sm:col-span-2">
          <AppInput
            label="Account Owner Name (as appears on bank statement) *"
            placeholder="e.g. Taxpayer Full Name"
            error={errors.accountOwnerName}
            value={m9.accountOwnerName || defaultAccountOwner}
            onChange={(e) => handleM9FieldChange('accountOwnerName', e.target.value)}
          />
        </div>
      </div>

      {/* Special Notes, Questions or Additional Information */}
      <div className="pt-2">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-gray-700 tracking-tight">
              Special Notes, Questions or Additional Information
            </label>
            <span
              className={`text-[11px] font-mono transition-colors ${
                (m9.notesToPreparer || '').length > 5000
                  ? 'text-rose-600 font-extrabold'
                  : (m9.notesToPreparer || '').length > 4500
                  ? 'text-amber-600 font-bold'
                  : 'text-slate-400'
              }`}
            >
              {(m9.notesToPreparer || '').length} / 5,000 chars
            </span>
          </div>

          <textarea
            rows={4}
            placeholder="Provide any feedback, special circumstances, or details for the tax preparer..."
            className={`w-full px-3 py-2 text-xs border rounded-md transition-all focus:outline-none leading-relaxed ${
              errors.notesToPreparer || (m9.notesToPreparer || '').length > 5000
                ? 'border-rose-500 ring-1 ring-rose-200 bg-rose-50/20 text-black'
                : 'border-slate-300 focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A] bg-white text-black'
            }`}
            value={m9.notesToPreparer || ''}
            onChange={(e) => handleM9FieldChange('notesToPreparer', e.target.value)}
          />

          {errors.notesToPreparer && (
            <p className="text-xs font-bold text-rose-600 mt-1.5 flex items-center gap-1.5 animate-fadeIn">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0"></span>
              <span>{errors.notesToPreparer}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
