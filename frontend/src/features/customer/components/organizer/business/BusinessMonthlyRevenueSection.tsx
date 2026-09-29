import React from 'react';
import { DollarSign } from 'lucide-react';
import { AppInput } from '@/shared/components/AppInput';
import { type OrganizerData } from '../../../services/customer-api';

interface BusinessMonthlyRevenueSectionProps {
  monthly?: NonNullable<OrganizerData['b2_businessIncome']>['monthlyRevenue'];
  onChange: (monthly: NonNullable<OrganizerData['b2_businessIncome']>['monthlyRevenue']) => void;
  selectedTaxYear: number;
}

const MONTHS: Array<{ key: keyof NonNullable<NonNullable<OrganizerData['b2_businessIncome']>['monthlyRevenue']>; label: string; quarter: string }> = [
  { key: 'jan', label: 'January', quarter: 'Q1' },
  { key: 'feb', label: 'February', quarter: 'Q1' },
  { key: 'mar', label: 'March', quarter: 'Q1' },
  { key: 'apr', label: 'April', quarter: 'Q2' },
  { key: 'may', label: 'May', quarter: 'Q2' },
  { key: 'jun', label: 'June', quarter: 'Q2' },
  { key: 'jul', label: 'July', quarter: 'Q3' },
  { key: 'aug', label: 'August', quarter: 'Q3' },
  { key: 'sep', label: 'September', quarter: 'Q3' },
  { key: 'oct', label: 'October', quarter: 'Q4' },
  { key: 'nov', label: 'November', quarter: 'Q4' },
  { key: 'dec', label: 'December', quarter: 'Q4' },
];

export const BusinessMonthlyRevenueSection: React.FC<BusinessMonthlyRevenueSectionProps> = ({
  monthly = {},
  onChange,
}) => {
  const m = monthly || {};

  const handleMonthChange = (
    key: keyof NonNullable<NonNullable<OrganizerData['b2_businessIncome']>['monthlyRevenue']>,
    val: number
  ) => {
    onChange({
      ...m,
      [key]: val,
    });
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {MONTHS.map((item) => (
        <AppInput
          key={item.key}
          label={`${item.label} (${item.quarter})`}
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-3.5 h-3.5" />}
          value={m[item.key] !== undefined && m[item.key] !== 0 ? m[item.key]?.toString() : ''}
          onChange={(e) => {
            const raw = parseFloat(e.target.value);
            handleMonthChange(item.key, isNaN(raw) ? 0 : raw);
          }}
        />
      ))}
    </div>
  );
};
