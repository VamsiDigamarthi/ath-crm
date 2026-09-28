import React from 'react';
import { DollarSign } from 'lucide-react';
import { AppInput } from '@/shared/components/AppInput';
import { type OrganizerData } from '../../../services/customer-api';

interface BusinessAdminSectionProps {
  data: Partial<OrganizerData['b3_businessExpenses']>;
  onChange: <K extends keyof NonNullable<OrganizerData['b3_businessExpenses']>>(
    field: K,
    val: NonNullable<OrganizerData['b3_businessExpenses']>[K]
  ) => void;
}

export const BusinessAdminSection: React.FC<BusinessAdminSectionProps> = ({
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
          label="Legal Fee / Attorney ($)"
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-3.5 h-3.5" />}
          value={data.legalProfessionalFees !== undefined && data.legalProfessionalFees !== 0 ? data.legalProfessionalFees.toString() : ''}
          onChange={(e) => updateAmount('legalProfessionalFees', e.target.value)}
          helperText="If there are any legal expenses or fees paid to attorney regarding company registration etc., please mention those details."
        />

        <AppInput
          label="Tax Filing &amp; Accounting Fee ($)"
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-3.5 h-3.5" />}
          value={data.accountingTaxPrepFees !== undefined && data.accountingTaxPrepFees !== 0 ? data.accountingTaxPrepFees.toString() : ''}
          onChange={(e) => updateAmount('accountingTaxPrepFees', e.target.value)}
          helperText="Fees paid to the preparer for filing the business return in the last year."
        />

        <AppInput
          label="Bank Fees ($)"
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-3.5 h-3.5" />}
          value={data.bankServiceCharges !== undefined && data.bankServiceCharges !== 0 ? data.bankServiceCharges.toString() : ''}
          onChange={(e) => updateAmount('bankServiceCharges', e.target.value)}
          helperText="Bank account fees, maintenance charges, wire transfer costs."
        />

        <AppInput
          label="Business Credit Card Fees &amp; Interest Costs ($)"
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-3.5 h-3.5" />}
          value={data.merchantCardFees !== undefined && data.merchantCardFees !== 0 ? data.merchantCardFees.toString() : ''}
          onChange={(e) => updateAmount('merchantCardFees', e.target.value)}
          helperText="Only charges/interest, not the total items you purchased using credit card."
        />

        <AppInput
          label="Software ($)"
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-3.5 h-3.5" />}
          value={data.softwareSubscriptions !== undefined && data.softwareSubscriptions !== 0 ? data.softwareSubscriptions.toString() : ''}
          onChange={(e) => updateAmount('softwareSubscriptions', e.target.value)}
          helperText="If you have purchased any softwares that have been used for company purpose, please mention those details."
        />

        <AppInput
          label="Office Supplies ($)"
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-3.5 h-3.5" />}
          value={data.officeSupplies !== undefined && data.officeSupplies !== 0 ? data.officeSupplies.toString() : ''}
          onChange={(e) => updateAmount('officeSupplies', e.target.value)}
          helperText="Office stationery, supplies, and business consumable items."
        />

        <AppInput
          label="Telephone Services (Mobile / Landline / Zoom) ($)"
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-3.5 h-3.5" />}
          value={data.telephoneCellular !== undefined && data.telephoneCellular !== 0 ? data.telephoneCellular.toString() : ''}
          onChange={(e) => updateAmount('telephoneCellular', e.target.value)}
          helperText="If it is partially used for business, mention business use portion."
        />

        <AppInput
          label="Internet &amp; Website Charges / Maintenance ($)"
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-3.5 h-3.5" />}
          value={data.internetHosting !== undefined && data.internetHosting !== 0 ? data.internetHosting.toString() : ''}
          onChange={(e) => updateAmount('internetHosting', e.target.value)}
          helperText="Internet and website registration/maintenance expenses (business portion)."
        />

        <AppInput
          label="State Registration Renewal ($)"
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-3.5 h-3.5" />}
          value={data.licensesPermitsStateFees !== undefined && data.licensesPermitsStateFees !== 0 ? data.licensesPermitsStateFees.toString() : ''}
          onChange={(e) => updateAmount('licensesPermitsStateFees', e.target.value)}
          helperText="Annual Secretary of State renewal and franchise taxes."
        />
      </div>
    </div>
  );
};
