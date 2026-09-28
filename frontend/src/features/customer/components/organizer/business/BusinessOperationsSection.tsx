import React from 'react';
import { DollarSign } from 'lucide-react';
import { AppInput } from '@/shared/components/AppInput';
import { type OrganizerData } from '../../../services/customer-api';

interface BusinessOperationsSectionProps {
  data: Partial<OrganizerData['b3_businessExpenses']>;
  onChange: <K extends keyof NonNullable<OrganizerData['b3_businessExpenses']>>(
    field: K,
    val: NonNullable<OrganizerData['b3_businessExpenses']>[K]
  ) => void;
}

export const BusinessOperationsSection: React.FC<BusinessOperationsSectionProps> = ({
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
          label="Rent Paid (Office, Facility, Warehouse) ($)"
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-3.5 h-3.5" />}
          value={data.rentProperty !== undefined && data.rentProperty !== 0 ? data.rentProperty.toString() : ''}
          onChange={(e) => updateAmount('rentProperty', e.target.value)}
          helperText="If any rents paid for office, vehicle, warehouses etc., please enter details here."
        />

        <AppInput
          label="Utilities ($)"
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-3.5 h-3.5" />}
          value={data.utilitiesCommercial !== undefined && data.utilitiesCommercial !== 0 ? data.utilitiesCommercial.toString() : ''}
          onChange={(e) => updateAmount('utilitiesCommercial', e.target.value)}
          helperText="If they are 100% used for business. If used partially for home, include in Home Office worksheet."
        />

        <AppInput
          label="Insurance (Other than Health Insurance) ($)"
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-3.5 h-3.5" />}
          value={data.commercialInsurance !== undefined && data.commercialInsurance !== 0 ? data.commercialInsurance.toString() : ''}
          onChange={(e) => updateAmount('commercialInsurance', e.target.value)}
          helperText="General liability, commercial property, casualty insurance."
        />

        <AppInput
          label="Repairs &amp; Facility Maintenance ($)"
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-3.5 h-3.5" />}
          value={data.repairsMaintenance !== undefined && data.repairsMaintenance !== 0 ? data.repairsMaintenance.toString() : ''}
          onChange={(e) => updateAmount('repairsMaintenance', e.target.value)}
          helperText="Repairs and maintenance expenses for business facility."
        />

        <AppInput
          label="Cleaning &amp; Janitorial Expenses ($)"
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-3.5 h-3.5" />}
          value={data.cleaningJanitorial !== undefined && data.cleaningJanitorial !== 0 ? data.cleaningJanitorial.toString() : ''}
          onChange={(e) => updateAmount('cleaningJanitorial', e.target.value)}
          helperText="Janitor services for business area cleaning. If partial, include in Home Office."
        />

        <AppInput
          label="Real Estate &amp; Property Taxes on Business Property ($)"
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-3.5 h-3.5" />}
          value={data.realEstateTaxes !== undefined && data.realEstateTaxes !== 0 ? data.realEstateTaxes.toString() : ''}
          onChange={(e) => updateAmount('realEstateTaxes', e.target.value)}
          helperText="Local county/city taxes on business owned real estate."
        />
      </div>
    </div>
  );
};
