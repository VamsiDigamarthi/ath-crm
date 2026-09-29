import React from 'react';
import { User, Users, Globe, Building2 } from 'lucide-react';
import { AppAccordion, AppAccordionItem } from '@/shared/components/AppAccordion';
import { type OrganizerData } from '../../../services/customer-api';
import { DemographicsTaxpayerSection } from './DemographicsTaxpayerSection';
import { DemographicsDependentsSection } from './DemographicsDependentsSection';
import { Module3Presence } from './Module3Presence';
import { DemographicsBankSection } from './DemographicsBankSection';

interface Module1Props {
  data: OrganizerData['m1_demographics'];
  updateField: <K extends keyof OrganizerData['m1_demographics']>(field: K, value: OrganizerData['m1_demographics'][K]) => void;
  m2Data?: OrganizerData['m2_dependents'];
  updateM2Field?: <K extends keyof OrganizerData['m2_dependents']>(field: K, value: OrganizerData['m2_dependents'][K]) => void;
  m3Data?: OrganizerData['m3_presence'];
  updateM3Field?: <K extends keyof OrganizerData['m3_presence']>(field: K, value: OrganizerData['m3_presence'][K]) => void;
  m9Data?: OrganizerData['m9_directDeposit'];
  updateM9Field?: <K extends keyof OrganizerData['m9_directDeposit']>(field: K, value: OrganizerData['m9_directDeposit'][K]) => void;
  selectedTaxYear: number;
  errors?: Record<string, string>;
  clearError?: (field: string) => void;
}

export const Module1Demographics: React.FC<Module1Props> = ({
  data,
  updateField,
  m2Data,
  updateM2Field,
  m3Data,
  updateM3Field,
  m9Data,
  updateM9Field,
  selectedTaxYear,
  errors = {},
  clearError,
}) => {
  const d = data || ({} as any);
  const displayLastName = d.lastName ?? (d.fullName ? d.fullName.split(' ').slice(1).join(' ') : '');
  const displayFirstName = d.firstName ?? (d.fullName ? d.fullName.split(' ')[0] : '');
  const defaultAccountOwner = d.fullName || `${displayFirstName} ${displayLastName}`.trim();

  return (
    <div className="space-y-4 font-sans">
      <AppAccordion defaultOpenIndex={0} allowMultiple={true}>
        {/* Accordion 1: General Information */}
        <AppAccordionItem
          index={0}
          title="General Information"
          icon={<User className="w-4 h-4" />}
        >
          <DemographicsTaxpayerSection
            data={data}
            m2Data={m2Data}
            updateField={updateField}
            updateM2Field={updateM2Field}
            selectedTaxYear={selectedTaxYear}
            errors={errors}
            clearError={clearError}
          />
        </AppAccordionItem>

        {/* Accordion 2: Dependents */}
        <AppAccordionItem
          index={1}
          title="Dependents"
          icon={<Users className="w-4 h-4" />}
        >
          <DemographicsDependentsSection
            m2Data={m2Data}
            updateM2Field={updateM2Field}
            defaultLastName={displayLastName}
            errors={errors}
            clearError={clearError}
          />
        </AppAccordionItem>

        {/* Accordion 3: State & Residency */}
        <AppAccordionItem
          index={2}
          title="State & Residency"
          icon={<Globe className="w-4 h-4" />}
        >
          <Module3Presence
            data={m3Data || ({} as any)}
            updateField={updateM3Field || (() => {})}
            selectedTaxYear={selectedTaxYear}
            errors={errors}
            clearError={clearError}
          />
        </AppAccordionItem>

        {/* Accordion 4: Bank Details */}
        <AppAccordionItem
          index={3}
          title="Bank Details"
          icon={<Building2 className="w-4 h-4" />}
        >
          <DemographicsBankSection
            m9Data={m9Data}
            updateM9Field={updateM9Field}
            defaultAccountOwner={defaultAccountOwner}
            errors={errors}
            clearError={clearError}
          />
        </AppAccordionItem>
      </AppAccordion>
    </div>
  );
};
