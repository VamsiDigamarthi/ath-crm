import React from 'react';
import { Building2, Users } from 'lucide-react';
import { AppAccordion, AppAccordionItem } from '@/shared/components/AppAccordion';
import { type OrganizerData } from '../../../services/customer-api';
import { BusinessCompanyInfoSection } from './BusinessCompanyInfoSection';
import { BusinessPartnersSection } from './BusinessPartnersSection';

interface BusinessGeneralInfoProps {
  data: Partial<OrganizerData['b1_companyInfo']>;
  updateField: <K extends keyof NonNullable<OrganizerData['b1_companyInfo']>>(
    field: K,
    value: NonNullable<OrganizerData['b1_companyInfo']>[K]
  ) => void;
  selectedTaxYear: number;
  errors?: Record<string, string>;
  clearError?: (field: string) => void;
}

export const BusinessGeneralInfo: React.FC<BusinessGeneralInfoProps> = ({
  data = {},
  updateField,
  selectedTaxYear,
  errors = {},
  clearError,
}) => {
  const handleCompanyFieldChange = <K extends keyof NonNullable<OrganizerData['b1_companyInfo']>>(
    field: K,
    value: NonNullable<OrganizerData['b1_companyInfo']>[K]
  ) => {
    updateField(field, value);
    if (clearError) {
      clearError(field as string);
    }
  };

  const handlePartnersChange = (partners: NonNullable<OrganizerData['b1_companyInfo']>['partners']) => {
    updateField('partners', partners);
    if (clearError) {
      clearError('totalOwnership');
    }
  };

  return (
    <div className="space-y-4 font-sans">
      <AppAccordion defaultOpenIndex={0} allowMultiple={true}>
        {/* Accordion 1: Company Profile & Registration */}
        <AppAccordionItem
          index={0}
          title="Company Details & Registration"
          icon={<Building2 className="w-4 h-4" />}
        >
          <BusinessCompanyInfoSection
            data={data}
            onChange={handleCompanyFieldChange}
            selectedTaxYear={selectedTaxYear}
            errors={errors}
          />
        </AppAccordionItem>

        {/* Accordion 2: Partners & Shareholders */}
        <AppAccordionItem
          index={1}
          title="Partners, Members &amp; Shareholders"
          icon={<Users className="w-4 h-4" />}
        >
          <BusinessPartnersSection
            partners={data.partners || []}
            onChange={handlePartnersChange}
            errors={errors}
          />
        </AppAccordionItem>
      </AppAccordion>
    </div>
  );
};
