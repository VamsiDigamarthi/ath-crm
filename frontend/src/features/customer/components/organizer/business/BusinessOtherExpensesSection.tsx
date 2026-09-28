import React from 'react';
import { DollarSign } from 'lucide-react';
import { AppInput } from '@/shared/components/AppInput';
import { type OrganizerData } from '../../../services/customer-api';

interface BusinessOtherExpensesSectionProps {
  data: Partial<OrganizerData['b3_businessExpenses']>;
  onChange: <K extends keyof NonNullable<OrganizerData['b3_businessExpenses']>>(
    field: K,
    val: NonNullable<OrganizerData['b3_businessExpenses']>[K]
  ) => void;
}

export const BusinessOtherExpensesSection: React.FC<BusinessOtherExpensesSectionProps> = ({
  data = {},
  onChange,
}) => {
  const updateAmount = (field: keyof NonNullable<OrganizerData['b3_businessExpenses']>, val: string) => {
    const raw = parseFloat(val);
    onChange(field, (isNaN(raw) ? 0 : raw) as any);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AppInput
          label="Corporation Liability Insurance ($)"
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-3.5 h-3.5" />}
          value={data.otherOperatingInsurance !== undefined && data.otherOperatingInsurance !== 0 ? data.otherOperatingInsurance.toString() : ''}
          onChange={(e) => updateAmount('otherOperatingInsurance', e.target.value)}
          helperText="Corporation liability insurance policies."
        />

        <AppInput
          label="Business Related Membership Costs ($)"
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-3.5 h-3.5" />}
          value={data.duesSubscriptions !== undefined && data.duesSubscriptions !== 0 ? data.duesSubscriptions.toString() : ''}
          onChange={(e) => updateAmount('duesSubscriptions', e.target.value)}
          helperText="Business related membership and trade dues."
        />

        <AppInput
          label="Any Bad Debts ($)"
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-3.5 h-3.5" />}
          value={data.badDebts !== undefined && data.badDebts !== 0 ? data.badDebts.toString() : ''}
          onChange={(e) => updateAmount('badDebts', e.target.value)}
          helperText="If any company is unable to recover expected income for services provided."
        />

        <AppInput
          label="Charitable Contributions ($)"
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-3.5 h-3.5" />}
          value={data.charitableContributions !== undefined && data.charitableContributions !== 0 ? data.charitableContributions.toString() : ''}
          onChange={(e) => updateAmount('charitableContributions', e.target.value)}
          helperText="Charity contributions made under the company name."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
        <div className="sm:col-span-2">
          <AppInput
            label="Miscellaneous Operating Expenses Description"
            placeholder="e.g. Courier shipping, safety deposit box, shredding service"
            value={data.otherExpensesDescription || ''}
            onChange={(e) => onChange('otherExpensesDescription', e.target.value)}
          />
        </div>

        <AppInput
          label="Miscellaneous Amount ($)"
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-3.5 h-3.5" />}
          value={data.otherExpensesAmount !== undefined && data.otherExpensesAmount !== 0 ? data.otherExpensesAmount.toString() : ''}
          onChange={(e) => updateAmount('otherExpensesAmount', e.target.value)}
        />
      </div>
    </div>
  );
};
