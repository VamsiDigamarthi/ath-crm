import React from 'react';
import { DollarSign } from 'lucide-react';
import { AppInput } from '@/shared/components/AppInput';
import { type OrganizerData } from '../../../services/customer-api';

interface BusinessGrossSalesSectionProps {
  data: Partial<OrganizerData['b2_businessIncome']>;
  onChange: <K extends keyof NonNullable<OrganizerData['b2_businessIncome']>>(
    field: K,
    val: NonNullable<OrganizerData['b2_businessIncome']>[K]
  ) => void;
}

export const BusinessGrossSalesSection: React.FC<BusinessGrossSalesSectionProps> = ({
  data = {},
  onChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AppInput
          label="Gross Sales / Direct Receipts (Not on 1099) ($)"
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-3.5 h-3.5" />}
          value={data.grossSalesNot1099 !== undefined && data.grossSalesNot1099 !== 0 ? data.grossSalesNot1099.toString() : ''}
          onChange={(e) => {
            const raw = parseFloat(e.target.value);
            onChange('grossSalesNot1099', isNaN(raw) ? 0 : raw);
          }}
          helperText="Direct retail, cash, card, or invoice sales without Form 1099"
        />

        <AppInput
          label="Returns &amp; Customer Allowances / Refunds ($)"
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-3.5 h-3.5" />}
          value={data.returnsAndAllowances !== undefined && data.returnsAndAllowances !== 0 ? data.returnsAndAllowances.toString() : ''}
          onChange={(e) => {
            const raw = parseFloat(e.target.value);
            onChange('returnsAndAllowances', isNaN(raw) ? 0 : raw);
          }}
          helperText="Customer refunds, price adjustments, or chargebacks"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        <AppInput
          label="Business Bank Interest Income ($)"
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-3.5 h-3.5" />}
          value={data.interestIncome !== undefined && data.interestIncome !== 0 ? data.interestIncome.toString() : ''}
          onChange={(e) => {
            const raw = parseFloat(e.target.value);
            onChange('interestIncome', isNaN(raw) ? 0 : raw);
          }}
          helperText="Interest on checking, savings, or sweep accounts"
        />

        <AppInput
          label="Business Dividend Income ($)"
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-3.5 h-3.5" />}
          value={data.dividendIncome !== undefined && data.dividendIncome !== 0 ? data.dividendIncome.toString() : ''}
          onChange={(e) => {
            const raw = parseFloat(e.target.value);
            onChange('dividendIncome', isNaN(raw) ? 0 : raw);
          }}
          helperText="Dividends earned on corporate investments"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
        <div className="sm:col-span-2">
          <AppInput
            label="Other Income Description"
            placeholder="e.g. State grant, lawsuit settlement, scrap sale, foreign currency gain"
            value={data.otherIncomeDescription || ''}
            onChange={(e) => onChange('otherIncomeDescription', e.target.value)}
          />
        </div>

        <AppInput
          label="Other Income Amount ($)"
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-3.5 h-3.5" />}
          value={data.otherIncomeAmount !== undefined && data.otherIncomeAmount !== 0 ? data.otherIncomeAmount.toString() : ''}
          onChange={(e) => {
            const raw = parseFloat(e.target.value);
            onChange('otherIncomeAmount', isNaN(raw) ? 0 : raw);
          }}
        />
      </div>
    </div>
  );
};
