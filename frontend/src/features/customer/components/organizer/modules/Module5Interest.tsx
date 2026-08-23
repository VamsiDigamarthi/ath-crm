import React from 'react';
import { Landmark, Building2, DollarSign } from 'lucide-react';
import { AppInput } from '@/shared/components/AppInput';
import { type OrganizerData } from '../../../services/customer-api';

interface Module5Props {
  data: OrganizerData['m5_interest'];
  updateField: <K extends keyof OrganizerData['m5_interest']>(field: K, value: OrganizerData['m5_interest'][K]) => void;
  selectedTaxYear: number;
}

export const Module5Interest: React.FC<Module5Props> = ({
  data,
  updateField,
}) => {
  return (
    <div className="space-y-6">
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
        <Landmark className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <strong>Form 1099-INT &amp; 1099-DIV Income:</strong> Report interest earned from High-Yield Savings Accounts (HYSA), CDs, Bonds, plus ordinary/qualified dividends from mutual funds and stocks.
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AppInput
          label="Primary 1099-INT Bank Name"
          placeholder="e.g. Marcus by Goldman Sachs / Chase"
          leftIcon={<Building2 className="w-4 h-4" />}
          value={data.bankName || ''}
          onChange={(e) => updateField('bankName', e.target.value)}
        />

        <AppInput
          label="1099-INT Total Interest Income ($)"
          type="number"
          placeholder="e.g. 1850"
          leftIcon={<DollarSign className="w-4 h-4" />}
          value={data.interestAmount ? data.interestAmount.toString() : ''}
          onChange={(e) => updateField('interestAmount', parseFloat(e.target.value) || 0)}
        />

        <AppInput
          label="1099-DIV Dividend Income ($)"
          type="number"
          placeholder="e.g. 640"
          leftIcon={<DollarSign className="w-4 h-4" />}
          value={data.dividendAmount ? data.dividendAmount.toString() : ''}
          onChange={(e) => updateField('dividendAmount', parseFloat(e.target.value) || 0)}
        />

        <AppInput
          label="Form 1099-OID (Original Issue Discount) ($)"
          type="number"
          placeholder="0"
          leftIcon={<DollarSign className="w-4 h-4" />}
          value={data.form1099OidAmount ? data.form1099OidAmount.toString() : ''}
          onChange={(e) => updateField('form1099OidAmount', parseFloat(e.target.value) || 0)}
        />
      </div>
    </div>
  );
};
