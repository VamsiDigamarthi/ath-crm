import React from 'react';
import { Landmark, Building2, DollarSign } from 'lucide-react';
import { AppInput } from '@/shared/components/AppInput';
import { type OrganizerData } from '../../../services/customer-api';
import { type ValidationErrorMap } from '../utils/organizer-validation';

interface Module5Props {
  data: OrganizerData['m5_interest'];
  updateField: <K extends keyof OrganizerData['m5_interest']>(field: K, value: OrganizerData['m5_interest'][K]) => void;
  selectedTaxYear: number;
  errors?: ValidationErrorMap;
  clearError?: (field: string) => void;
}

export const Module5Interest: React.FC<Module5Props> = ({
  data,
  updateField,
  errors = {},
  clearError,
}) => {
  return (
    <div className="space-y-6 font-sans">
      <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-start gap-2.5">
        <Landmark className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <strong>Form 1099-INT, 1099-DIV &amp; 1099-OID Income (Optional):</strong> Report interest earned from High-Yield Savings Accounts (HYSA), CDs, Bonds, plus ordinary/qualified dividends from mutual funds and stocks. Leave blank or enter $0 if you did not receive passive interest/dividends.
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AppInput
          label="Primary 1099-INT Bank / Payer Name"
          placeholder="e.g. Marcus by Goldman Sachs / Chase / Discover"
          leftIcon={<Building2 className="w-4 h-4" />}
          error={errors.bankName}
          value={data.bankName || ''}
          onChange={(e) => {
            updateField('bankName', e.target.value);
            if (clearError) clearError('bankName');
          }}
        />

        <AppInput
          label="1099-INT Total Interest Income ($)"
          type="number"
          placeholder="e.g. 1850"
          leftIcon={<DollarSign className="w-4 h-4" />}
          error={errors.interestAmount}
          value={data.interestAmount !== undefined && data.interestAmount !== null && data.interestAmount > 0 ? data.interestAmount.toString() : ''}
          onChange={(e) => {
            const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
            const nonNeg = isNaN(val) ? 0 : Math.max(0, val);
            updateField('interestAmount', nonNeg);
            if (clearError) clearError('interestAmount');
          }}
        />

        <AppInput
          label="1099-DIV Dividend Income ($)"
          type="number"
          placeholder="e.g. 640"
          leftIcon={<DollarSign className="w-4 h-4" />}
          error={errors.dividendAmount}
          value={data.dividendAmount !== undefined && data.dividendAmount !== null && data.dividendAmount > 0 ? data.dividendAmount.toString() : ''}
          onChange={(e) => {
            const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
            const nonNeg = isNaN(val) ? 0 : Math.max(0, val);
            updateField('dividendAmount', nonNeg);
            if (clearError) clearError('dividendAmount');
          }}
        />

        <AppInput
          label="Form 1099-OID (Original Issue Discount) ($)"
          type="number"
          placeholder="0"
          leftIcon={<DollarSign className="w-4 h-4" />}
          error={errors.form1099OidAmount}
          value={data.form1099OidAmount !== undefined && data.form1099OidAmount !== null && data.form1099OidAmount > 0 ? data.form1099OidAmount.toString() : ''}
          onChange={(e) => {
            const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
            const nonNeg = isNaN(val) ? 0 : Math.max(0, val);
            updateField('form1099OidAmount', nonNeg);
            if (clearError) clearError('form1099OidAmount');
          }}
        />
      </div>
    </div>
  );
};
