import React from 'react';
import { Building2, Mail, Phone, Hash } from 'lucide-react';
import { AppInput } from '@/shared/components/AppInput';
import { AppSelect } from '@/shared/components/AppSelect';
import { AppDatePicker } from '@/shared/components/AppDatePicker';
import { parseUsDate, formatUsDate } from '../utils/organizer-date-helpers';
import { type OrganizerData } from '../../../services/customer-api';

interface BusinessCompanyInfoSectionProps {
  data: Partial<OrganizerData['b1_companyInfo']>;
  onChange: <K extends keyof NonNullable<OrganizerData['b1_companyInfo']>>(
    field: K,
    value: NonNullable<OrganizerData['b1_companyInfo']>[K]
  ) => void;
  selectedTaxYear: number;
  errors?: Record<string, string>;
}

export const BusinessCompanyInfoSection: React.FC<BusinessCompanyInfoSectionProps> = ({
  data = {},
  onChange,
  selectedTaxYear,
  errors = {},
}) => {
  return (
    <div className="space-y-4">
      {/* Row 1: Company Identity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AppInput
          label="Legal Business Name *"
          placeholder="e.g. Apex Tech Solutions LLC"
          leftIcon={<Building2 className="w-4 h-4" />}
          error={errors.businessName}
          value={data.businessName || ''}
          onChange={(e) => onChange('businessName', e.target.value)}
        />

        <AppInput
          label="DBA / Trade Name (if different)"
          placeholder="e.g. Apex Cloud Labs"
          value={data.dba || ''}
          onChange={(e) => onChange('dba', e.target.value)}
        />

        <AppInput
          label="Employer Identification Number (EIN) *"
          placeholder="XX-XXXXXXX"
          leftIcon={<Hash className="w-4 h-4" />}
          error={errors.ein}
          value={data.ein || ''}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^\d-]/g, '').slice(0, 10);
            onChange('ein', raw);
          }}
        />
      </div>

      {/* Row 2: Entity Structure & Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AppSelect
          label="Business Entity Structure *"
          options={[
            { label: 'Single-Member LLC (Disregarded Entity / Sch C)', value: 'LLC_SINGLE' },
            { label: 'Multi-Member LLC (Form 1065 / Partnership)', value: 'LLC_MULTI' },
            { label: 'S-Corporation (Form 1120-S)', value: 'S_CORP' },
            { label: 'C-Corporation (Form 1120)', value: 'C_CORP' },
            { label: 'General / Limited Partnership (Form 1065)', value: 'PARTNERSHIP' },
            { label: 'Sole Proprietorship', value: 'SOLE_PROP' },
          ]}
          error={errors.entityType}
          value={data.entityType || 'LLC_MULTI'}
          onChange={(val) => onChange('entityType', val || 'LLC_MULTI')}
        />

        <AppDatePicker
          label="Date of Incorporation / Formation *"
          placeholder="MM/DD/YYYY"
          format="MM/dd/yyyy"
          accentColor="#16A34A"
          maxDate={new Date()}
          value={parseUsDate(data.formationDate)}
          onChange={(dateVal) => onChange('formationDate', formatUsDate(dateVal))}
        />

        {data.entityType === 'S_CORP' ? (
          <AppDatePicker
            label="S-Corp Election Effective Date (Form 2553)"
            placeholder="MM/DD/YYYY"
            format="MM/dd/yyyy"
            accentColor="#16A34A"
            maxDate={new Date()}
            value={parseUsDate(data.scorpElectionDate)}
            onChange={(dateVal) => onChange('scorpElectionDate', formatUsDate(dateVal))}
          />
        ) : (
          <AppSelect
            label="Accounting Method *"
            options={[
              { label: 'Cash Basis (Most common)', value: 'CASH' },
              { label: 'Accrual Basis', value: 'ACCRUAL' },
              { label: 'Other', value: 'OTHER' },
            ]}
            value={data.accountingMethod || 'CASH'}
            onChange={(val) => onChange('accountingMethod', (val || 'CASH') as any)}
          />
        )}
      </div>

      {/* Row 3: Activity & Prior Filing */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <AppInput
            label="Principal Business Activity & Industry *"
            placeholder="e.g. IT Consulting / Software Development / E-Commerce / Transportation"
            error={errors.businessActivity}
            value={data.businessActivity || ''}
            onChange={(e) => onChange('businessActivity', e.target.value)}
          />
        </div>

        <AppSelect
          label={`Filed Federal Return for TY ${selectedTaxYear - 1}? *`}
          options={[
            { label: 'Yes - Filed Prior Year Return', value: 'YES' },
            { label: 'No - First Year Filing / New Business', value: 'NO' },
          ]}
          value={data.priorYearReturnFiled || 'YES'}
          onChange={(val) => onChange('priorYearReturnFiled', (val || 'YES') as any)}
        />
      </div>

      {/* Row 4: Address */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <AppInput
            label="Street Address *"
            placeholder="e.g. 1200 Smith St"
            error={errors.address}
            value={data.address || ''}
            onChange={(e) => onChange('address', e.target.value)}
          />
        </div>

        <AppInput
          label="Suite / Unit / Floor"
          placeholder="e.g. Suite 400"
          value={data.suite || ''}
          onChange={(e) => onChange('suite', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AppInput
          label="City *"
          placeholder="e.g. Houston"
          error={errors.city}
          value={data.city || ''}
          onChange={(e) => onChange('city', e.target.value)}
        />

        <AppInput
          label="State (2-Letter) *"
          placeholder="e.g. TX"
          error={errors.state}
          value={data.state || ''}
          onChange={(e) => onChange('state', e.target.value.toUpperCase().slice(0, 2))}
        />

        <AppInput
          label="ZIP Code *"
          placeholder="e.g. 77002"
          error={errors.zipCode}
          value={data.zipCode || ''}
          onChange={(e) => onChange('zipCode', e.target.value.slice(0, 10))}
        />
      </div>

      {/* Row 5: Authorized Representative Contact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AppInput
          label="Contact Full Name *"
          placeholder="e.g. Rajesh Sharma"
          error={errors.contactName}
          value={data.contactName || ''}
          onChange={(e) => onChange('contactName', e.target.value)}
        />

        <AppInput
          label="Title / Official Role *"
          placeholder="e.g. Managing Partner / CEO / President"
          error={errors.contactTitle}
          value={data.contactTitle || ''}
          onChange={(e) => onChange('contactTitle', e.target.value)}
        />

        <AppInput
          label="Business Email *"
          placeholder="contact@company.com"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.contactEmail}
          value={data.contactEmail || ''}
          onChange={(e) => onChange('contactEmail', e.target.value)}
        />

        <AppInput
          label="Contact Phone Number *"
          placeholder="+1 (713) 555-0199"
          leftIcon={<Phone className="w-4 h-4" />}
          error={errors.contactPhone}
          value={data.contactPhone || ''}
          onChange={(e) => onChange('contactPhone', e.target.value)}
        />
      </div>
    </div>
  );
};
