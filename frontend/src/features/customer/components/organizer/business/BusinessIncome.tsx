import React from 'react';
import { FileSpreadsheet, TrendingUp, Calendar } from 'lucide-react';
import { AppAccordion, AppAccordionItem } from '@/shared/components/AppAccordion';
import { type OrganizerData } from '../../../services/customer-api';
import { Business1099IncomeSection } from './Business1099IncomeSection';
import { BusinessGrossSalesSection } from './BusinessGrossSalesSection';
import { BusinessMonthlyRevenueSection } from './BusinessMonthlyRevenueSection';

interface BusinessIncomeProps {
  data: Partial<OrganizerData['b2_businessIncome']>;
  updateField: <K extends keyof NonNullable<OrganizerData['b2_businessIncome']>>(
    field: K,
    value: NonNullable<OrganizerData['b2_businessIncome']>[K]
  ) => void;
  selectedTaxYear: number;
  errors?: Record<string, string>;
  clearError?: (field: string) => void;
}

export const BusinessIncome: React.FC<BusinessIncomeProps> = ({
  data = {},
  updateField,
  selectedTaxYear,
  errors = {},
  clearError,
}) => {
  const handleClientIncomeChange = (items: NonNullable<OrganizerData['b2_businessIncome']>['clientIncome1099']) => {
    updateField('clientIncome1099', items);
    if (clearError) {
      clearError('clientIncome');
    }
  };

  const handleMonthlyRevenueChange = (monthly: NonNullable<OrganizerData['b2_businessIncome']>['monthlyRevenue']) => {
    updateField('monthlyRevenue', monthly);
  };

  return (
    <div className="space-y-4 font-sans">
      <AppAccordion defaultOpenIndex={0} allowMultiple={true}>
        {/* Accordion 1: 1099-NEC & Client Income */}
        <AppAccordionItem
          index={0}
          title="Client & 1099 Income Sources"
          icon={<FileSpreadsheet className="w-4 h-4" />}
        >
          <Business1099IncomeSection
            items={data.clientIncome1099 || []}
            onChange={handleClientIncomeChange}
            errors={errors}
          />
        </AppAccordionItem>

        {/* Accordion 2: Gross Sales & Other Income */}
        <AppAccordionItem
          index={1}
          title="Direct Sales & Other Income"
          icon={<TrendingUp className="w-4 h-4" />}
        >
          <BusinessGrossSalesSection
            data={data}
            onChange={updateField}
          />
        </AppAccordionItem>

        {/* Accordion 3: Monthly Revenue Breakdown */}
        <AppAccordionItem
          index={2}
          title="Monthly Revenue Schedule (Jan – Dec)"
          icon={<Calendar className="w-4 h-4" />}
        >
          <BusinessMonthlyRevenueSection
            monthly={data.monthlyRevenue || {}}
            onChange={handleMonthlyRevenueChange}
            selectedTaxYear={selectedTaxYear}
          />
        </AppAccordionItem>
      </AppAccordion>
    </div>
  );
};
