import React from 'react';
import { DollarSign } from 'lucide-react';
import { AppInput } from '@/shared/components/AppInput';
import { type OrganizerData } from '../../../services/customer-api';

interface BusinessPayrollSectionProps {
  data: Partial<OrganizerData['b3_businessExpenses']>;
  onChange: <K extends keyof NonNullable<OrganizerData['b3_businessExpenses']>>(
    field: K,
    val: NonNullable<OrganizerData['b3_businessExpenses']>[K]
  ) => void;
}

export const BusinessPayrollSection: React.FC<BusinessPayrollSectionProps> = ({
  data = {},
  onChange,
}) => {
  const updateAmount = (field: keyof NonNullable<OrganizerData['b3_businessExpenses']>, val: string) => {
    const raw = parseFloat(val);
    onChange(field, (isNaN(raw) ? 0 : raw) as any);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AppInput
          label="Officer / Managing Member Compensation ($)"
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-3.5 h-3.5" />}
          value={data.officerCompensation !== undefined && data.officerCompensation !== 0 ? data.officerCompensation.toString() : ''}
          onChange={(e) => updateAmount('officerCompensation', e.target.value)}
          helperText="The wages paid to the Business owners/partners (Either using W-2s or 1099s). If you have forms, send those forms to us."
        />

        <AppInput
          label="Employee Wages &amp; Salaries ($)"
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-3.5 h-3.5" />}
          value={data.employeeWages !== undefined && data.employeeWages !== 0 ? data.employeeWages.toString() : ''}
          onChange={(e) => updateAmount('employeeWages', e.target.value)}
          helperText="The wages paid to other people/employees (Either using W-2s or 1099s). If you have forms, send those forms to us."
        />

        <AppInput
          label="Contractor &amp; Vendor Payments ($)"
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-3.5 h-3.5" />}
          value={data.contractorPayments !== undefined && data.contractorPayments !== 0 ? data.contractorPayments.toString() : ''}
          onChange={(e) => updateAmount('contractorPayments', e.target.value)}
          helperText="Invoices paid to other companies or individual contractors for services/items received under company name."
        />

        <AppInput
          label="Social Security &amp; Medicare Taxes Paid ($)"
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-3.5 h-3.5" />}
          value={data.employerPayrollTaxes !== undefined && data.employerPayrollTaxes !== 0 ? data.employerPayrollTaxes.toString() : ''}
          onChange={(e) => updateAmount('employerPayrollTaxes', e.target.value)}
          helperText="Employer portion of SS &amp; Medicare wages mentioned in W-2s of employees produced under payroll."
        />

        <AppInput
          label="Federal Unemployment Taxes (FUTA) ($)"
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-3.5 h-3.5" />}
          value={data.futaTax !== undefined && data.futaTax !== 0 ? data.futaTax.toString() : ''}
          onChange={(e) => updateAmount('futaTax', e.target.value)}
          helperText="Employer portion of taxes available in Form 940 which are payable to federal."
        />

        <AppInput
          label="State Unemployment Taxes (SUTA) ($)"
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-3.5 h-3.5" />}
          value={data.sutaTax !== undefined && data.sutaTax !== 0 ? data.sutaTax.toString() : ''}
          onChange={(e) => updateAmount('sutaTax', e.target.value)}
          helperText="Employer portion of wages subjected to state in Form 940 generated under payroll services."
        />

        <AppInput
          label="Health Insurance Paid by Company ($)"
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-3.5 h-3.5" />}
          value={data.employeeBenefits !== undefined && data.employeeBenefits !== 0 ? data.employeeBenefits.toString() : ''}
          onChange={(e) => updateAmount('employeeBenefits', e.target.value)}
          helperText="Health insurance paid by company for members / employees."
        />

        <AppInput
          label="Profit Sharing / Retirement Plans ($)"
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-3.5 h-3.5" />}
          value={data.retirementPlanContributions !== undefined && data.retirementPlanContributions !== 0 ? data.retirementPlanContributions.toString() : ''}
          onChange={(e) => updateAmount('retirementPlanContributions', e.target.value)}
          helperText="Employer contribution paid towards retirement benefit of employees (SEP IRA / SOLO 401K)."
        />

        <AppInput
          label="Payroll Processing Costs ($)"
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-3.5 h-3.5" />}
          value={data.payrollProcessingFees !== undefined && data.payrollProcessingFees !== 0 ? data.payrollProcessingFees.toString() : ''}
          onChange={(e) => updateAmount('payrollProcessingFees', e.target.value)}
          helperText="Fees paid to preparer / service provider for providing payroll services for the company."
        />
      </div>
    </div>
  );
};
