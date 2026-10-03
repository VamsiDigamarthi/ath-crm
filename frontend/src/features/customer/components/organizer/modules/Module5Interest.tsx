import React from 'react';
import { Building2, DollarSign } from 'lucide-react';
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
  const d = (data || {}) as Partial<OrganizerData['m5_interest']>;

  return (
    <div className="space-y-4 font-sans">
      {/* 1. Primary Institution / Bank Name */}
      <div>
        <AppInput
          label="Primary 1099-INT Bank / Payer Name"
          placeholder="e.g. Marcus by Goldman Sachs / Chase / Discover / Vanguard"
          leftIcon={<Building2 className="w-4 h-4 text-slate-400" />}
          error={errors.bankName}
          value={d.bankName || ''}
          onChange={(e) => {
            updateField('bankName', e.target.value);
            if (clearError) clearError('bankName');
          }}
        />
      </div>

      {/* 2. 1099-INT Interest & Federal Withholding */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AppInput
          label="1099-INT Total Interest Income ($)"
          type="number"
          placeholder="e.g. 1850"
          leftIcon={<DollarSign className="w-4 h-4 text-slate-400" />}
          error={errors.interestAmount}
          value={d.interestAmount !== undefined && d.interestAmount !== null && d.interestAmount > 0 ? d.interestAmount.toString() : ''}
          onChange={(e) => {
            const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
            const nonNeg = isNaN(val) ? 0 : Math.max(0, val);
            updateField('interestAmount', nonNeg);
            if (clearError) clearError('interestAmount');
          }}
        />

        <AppInput
          label="1099-INT Federal Tax Withheld ($)"
          type="number"
          placeholder="0"
          leftIcon={<DollarSign className="w-4 h-4 text-slate-400" />}
          error={errors.interestFedTaxWithheld}
          value={d.interestFedTaxWithheld !== undefined && d.interestFedTaxWithheld !== null && d.interestFedTaxWithheld > 0 ? d.interestFedTaxWithheld.toString() : ''}
          onChange={(e) => {
            const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
            const nonNeg = isNaN(val) ? 0 : Math.max(0, val);
            updateField('interestFedTaxWithheld', nonNeg);
            if (clearError) clearError('interestFedTaxWithheld');
          }}
        />
      </div>

      {/* 3. 1099-DIV Dividends & Federal Withholding */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AppInput
          label="1099-DIV Dividend Income ($)"
          type="number"
          placeholder="e.g. 640"
          leftIcon={<DollarSign className="w-4 h-4 text-slate-400" />}
          error={errors.dividendAmount}
          value={d.dividendAmount !== undefined && d.dividendAmount !== null && d.dividendAmount > 0 ? d.dividendAmount.toString() : ''}
          onChange={(e) => {
            const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
            const nonNeg = isNaN(val) ? 0 : Math.max(0, val);
            updateField('dividendAmount', nonNeg);
            if (clearError) clearError('dividendAmount');
          }}
        />

        <AppInput
          label="1099-DIV Federal Tax Withheld ($)"
          type="number"
          placeholder="0"
          leftIcon={<DollarSign className="w-4 h-4 text-slate-400" />}
          error={errors.dividendFedTaxWithheld}
          value={d.dividendFedTaxWithheld !== undefined && d.dividendFedTaxWithheld !== null && d.dividendFedTaxWithheld > 0 ? d.dividendFedTaxWithheld.toString() : ''}
          onChange={(e) => {
            const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
            const nonNeg = isNaN(val) ? 0 : Math.max(0, val);
            updateField('dividendFedTaxWithheld', nonNeg);
            if (clearError) clearError('dividendFedTaxWithheld');
          }}
        />
      </div>

      {/* 4. Form 1099-OID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AppInput
          label="Form 1099-OID (Original Issue Discount) ($)"
          type="number"
          placeholder="0"
          leftIcon={<DollarSign className="w-4 h-4 text-slate-400" />}
          error={errors.form1099OidAmount}
          value={d.form1099OidAmount !== undefined && d.form1099OidAmount !== null && d.form1099OidAmount > 0 ? d.form1099OidAmount.toString() : ''}
          onChange={(e) => {
            const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
            const nonNeg = isNaN(val) ? 0 : Math.max(0, val);
            updateField('form1099OidAmount', nonNeg);
            if (clearError) clearError('form1099OidAmount');
          }}
        />

        <AppInput
          label="Form 1099-OID Federal Tax Withheld ($)"
          type="number"
          placeholder="0"
          leftIcon={<DollarSign className="w-4 h-4 text-slate-400" />}
          error={errors.form1099OidFedTaxWithheld}
          value={d.form1099OidFedTaxWithheld !== undefined && d.form1099OidFedTaxWithheld !== null && d.form1099OidFedTaxWithheld > 0 ? d.form1099OidFedTaxWithheld.toString() : ''}
          onChange={(e) => {
            const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
            const nonNeg = isNaN(val) ? 0 : Math.max(0, val);
            updateField('form1099OidFedTaxWithheld', nonNeg);
            if (clearError) clearError('form1099OidFedTaxWithheld');
          }}
        />
      </div>
    </div>
  );
};
