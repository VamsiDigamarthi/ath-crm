import React from 'react';
import { Building2, DollarSign, FileText, Info, HelpCircle } from 'lucide-react';
import { AppInput } from '@/shared/components/AppInput';
import { AppSelect } from '@/shared/components/AppSelect';
import { type OrganizerData } from '../../../services/customer-api';
import { type ValidationErrorMap } from '../utils/organizer-validation';

interface Module10RetirementProps {
  data: OrganizerData['m10_retirement'];
  updateField: <K extends keyof NonNullable<OrganizerData['m10_retirement']>>(
    field: K,
    value: NonNullable<OrganizerData['m10_retirement']>[K]
  ) => void;
  selectedTaxYear: number;
  errors?: ValidationErrorMap;
  clearError?: (field: string) => void;
}

export const DISTRIBUTION_TYPE_OPTIONS = [
  { value: 'NORMAL', label: 'Normal Distribution (Age 59½ or older)' },
  { value: 'EARLY_NO_EXCEPTION', label: 'Early Withdrawal (Under 59½, No Exception - 10% Penalty)' },
  { value: 'EARLY_EXCEPTION', label: 'Early Withdrawal with Exception (Form 5329 Penalty Relief)' },
  { value: 'ROLLOVER', label: 'Direct Rollover to Qualified Plan / Traditional IRA' },
  { value: 'ROTH_CONVERSION', label: 'Roth IRA Conversion / Distribution' },
  { value: 'DISABILITY', label: 'Disability Distribution (Total & Permanent Disability)' },
  { value: 'DEATH', label: 'Death / Inherited Beneficiary Distribution' },
  { value: 'OTHER', label: 'Other Pension / Annuity / Retirement Distribution' },
];

export const EARLY_REASON_OPTIONS = [
  { value: 'FIRST_HOME', label: 'Qualified First-Time Homebuyer (Up to $10,000 lifetime)' },
  { value: 'HIGHER_ED', label: 'Qualified Higher Education Expenses (Tuition, Books, Fees)' },
  { value: 'MEDICAL_EXPENSES', label: 'Unreimbursed Medical Expenses (Exceeding 7.5% of AGI)' },
  { value: 'HEALTH_INSURANCE_UNEMPLOYED', label: 'Health Insurance Premiums while Unemployed (12+ weeks)' },
  { value: 'BIRTH_ADOPTION', label: 'Qualified Birth or Adoption Expenses (Up to $5,000 per child)' },
  { value: 'DISABILITY', label: 'Total and Permanent Disability (IRS Form 5329 Code 03)' },
  { value: 'SEPP', label: 'Substantially Equal Periodic Payments (SEPP / Rule 72(t))' },
  { value: 'IRS_LEVY', label: 'Distributions resulting from IRS Tax Levy' },
  { value: 'MILITARY_RESERVIST', label: 'Qualified Active Duty Reservist Distribution' },
  { value: 'NO_EXCEPTION', label: 'No Exception / Standard Early Withdrawal (10% Penalty applies)' },
  { value: 'OTHER', label: 'Other IRS Permitted Reason / Exception' },
];

export const Module10Retirement: React.FC<Module10RetirementProps> = ({
  data,
  updateField,
  errors = {},
  clearError,
}) => {
  const d = (data || {}) as Partial<NonNullable<OrganizerData['m10_retirement']>>;
  const currentDistType = d.distributionType || 'NORMAL';
  const isEarly = currentDistType === 'EARLY_NO_EXCEPTION' || currentDistType === 'EARLY_EXCEPTION';

  return (
    <div className="space-y-4 font-sans">
      {/* 1. IRA Withdrawal or Distribution Type Dropdown */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-700 tracking-tight flex items-center gap-1.5">
          <span>IRA Withdrawal or Distribution Type (Form 1099-R Box 7) *</span>
        </label>
        <AppSelect
          options={DISTRIBUTION_TYPE_OPTIONS}
          value={d.distributionType || 'NORMAL'}
          onChange={(val) => {
            updateField('distributionType', val as any);
            updateField('hasRetirementDistribution', true);
            if (clearError) clearError('distributionType');
          }}
          placeholder="Select Withdrawal / Distribution Type"
          error={errors.distributionType}
        />
        <p className="text-[11px] text-slate-500">
          Identify whether this withdrawal is a regular retirement distribution, an early withdrawal under age 59½, or a tax-free rollover.
        </p>
      </div>

      {/* 2. Payer / Plan Custodian Name */}
      <div>
        <AppInput
          label="Payer / Plan Custodian Name (Fidelity, Vanguard, Charles Schwab, Empower, etc.)"
          placeholder="e.g. Fidelity Investments / Charles Schwab / Vanguard / Principal 401(k)"
          leftIcon={<Building2 className="w-4 h-4 text-slate-400" />}
          error={errors.payerName}
          value={d.payerName || ''}
          onChange={(e) => {
            updateField('payerName', e.target.value);
            updateField('hasRetirementDistribution', true);
            if (clearError) clearError('payerName');
          }}
        />
      </div>

      {/* 3. Gross IRA Distribution Amount & IRA Federal Tax Withheld Side-by-Side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AppInput
          label="Gross IRA / Distribution Amount ($) (Box 1)"
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-4 h-4 text-slate-400" />}
          error={errors.grossDistribution}
          value={
            d.grossDistribution !== undefined && d.grossDistribution !== null && d.grossDistribution > 0
              ? d.grossDistribution.toString()
              : ''
          }
          onChange={(e) => {
            const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
            const nonNeg = isNaN(val) ? 0 : Math.max(0, val);
            updateField('grossDistribution', nonNeg);
            updateField('hasRetirementDistribution', true);
            if (clearError) clearError('grossDistribution');
          }}
        />

        <AppInput
          label="IRA Federal Tax Withheld ($) (Box 4)"
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-4 h-4 text-slate-400" />}
          error={errors.fedTaxWithheld}
          value={
            d.fedTaxWithheld !== undefined && d.fedTaxWithheld !== null && d.fedTaxWithheld > 0
              ? d.fedTaxWithheld.toString()
              : ''
          }
          onChange={(e) => {
            const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
            const nonNeg = isNaN(val) ? 0 : Math.max(0, val);
            updateField('fedTaxWithheld', nonNeg);
            updateField('hasRetirementDistribution', true);
            if (clearError) clearError('fedTaxWithheld');
          }}
        />
      </div>

      {/* 4. Reason for Withdrawal / Early Withdrawal Penalty Exception */}
      <div className="space-y-3 p-4 rounded-xl bg-slate-50/80 border border-slate-200">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            <span>Reason for Withdrawal / Penalty Exception (IRS Form 5329)</span>
          </label>
          {isEarly && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
              Under 59½ Early Distribution
            </span>
          )}
        </div>

        <AppSelect
          options={EARLY_REASON_OPTIONS}
          value={d.earlyWithdrawalReason || (isEarly ? 'NO_EXCEPTION' : 'NO_EXCEPTION')}
          onChange={(val) => {
            updateField('earlyWithdrawalReason', val as any);
            if (clearError) clearError('earlyWithdrawalReason');
          }}
          placeholder="Select Reason / Penalty Exception"
          error={errors.earlyWithdrawalReason}
        />

        <div className="pt-1">
          <AppInput
            label="Reason / Exception Details (Optional explanation for CPA)"
            placeholder="e.g. Used for qualified first home purchase down payment; educational tuition bills attached..."
            leftIcon={<FileText className="w-4 h-4 text-slate-400" />}
            value={d.reasonExplanation || ''}
            onChange={(e) => {
              updateField('reasonExplanation', e.target.value);
              if (clearError) clearError('reasonExplanation');
            }}
          />
        </div>

        <div className="flex items-start gap-2 text-[11px] text-slate-500 bg-white/70 p-2.5 rounded-lg border border-slate-200/80">
          <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <span>
            <strong>Tax Preparation Note:</strong> If you are under 59½ and qualify for an exception (such as first-time homebuyer or higher education), our tax team will attach IRS Form 5329 to waive the 10% additional penalty tax.
          </span>
        </div>
      </div>
    </div>
  );
};
