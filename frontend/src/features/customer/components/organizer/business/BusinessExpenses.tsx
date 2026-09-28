import React from 'react';
import { 
  Users, 
  Building, 
  Briefcase, 
  Megaphone, 
  MoreHorizontal, 
  Package, 
  Car, 
  Laptop, 
  Home 
} from 'lucide-react';
import { AppAccordion, AppAccordionItem } from '@/shared/components/AppAccordion';
import { type OrganizerData } from '../../../services/customer-api';
import { BusinessPayrollSection } from './BusinessPayrollSection';
import { BusinessOperationsSection } from './BusinessOperationsSection';
import { BusinessAdminSection } from './BusinessAdminSection';
import { BusinessMarketingSection } from './BusinessMarketingSection';
import { BusinessOtherExpensesSection } from './BusinessOtherExpensesSection';
import { BusinessCogsSection } from './BusinessCogsSection';
import { BusinessExpenseVehicle } from './BusinessExpenseVehicle';
import { BusinessExpenseAssets } from './BusinessExpenseAssets';
import { BusinessExpenseHome } from './BusinessExpenseHome';

interface BusinessExpensesProps {
  data: Partial<OrganizerData['b3_businessExpenses']>;
  updateField: <K extends keyof NonNullable<OrganizerData['b3_businessExpenses']>>(
    field: K,
    value: NonNullable<OrganizerData['b3_businessExpenses']>[K]
  ) => void;
  selectedTaxYear: number;
  errors?: Record<string, string>;
  clearError?: (field: string) => void;
}

export const BusinessExpenses: React.FC<BusinessExpensesProps> = ({
  data = {},
  updateField,
  selectedTaxYear,
  errors = {},
}) => {
  return (
    <div className="space-y-4 font-sans">
      <AppAccordion defaultOpenIndex={0} allowMultiple={true}>
        {/* Accordion 1: Compensation & Payroll */}
        <AppAccordionItem
          index={0}
          title="Compensation, Wages &amp; Payroll Taxes"
          icon={<Users className="w-4 h-4" />}
        >
          <BusinessPayrollSection
            data={data}
            onChange={updateField}
          />
        </AppAccordionItem>

        {/* Accordion 2: Occupancy & Operations */}
        <AppAccordionItem
          index={1}
          title="Facility, Office Rent &amp; Utilities"
          icon={<Building className="w-4 h-4" />}
        >
          <BusinessOperationsSection
            data={data}
            onChange={updateField}
          />
        </AppAccordionItem>

        {/* Accordion 3: Professional & Administrative */}
        <AppAccordionItem
          index={2}
          title="Legal, Accounting &amp; Software Subscriptions"
          icon={<Briefcase className="w-4 h-4" />}
        >
          <BusinessAdminSection
            data={data}
            onChange={updateField}
          />
        </AppAccordionItem>

        {/* Accordion 4: Marketing & Travel */}
        <AppAccordionItem
          index={3}
          title="Marketing, Travel &amp; Client Meals"
          icon={<Megaphone className="w-4 h-4" />}
        >
          <BusinessMarketingSection
            data={data}
            onChange={updateField}
          />
        </AppAccordionItem>

        {/* Accordion 5: Other Operating Deductions */}
        <AppAccordionItem
          index={4}
          title="Other Operating Deductions &amp; Insurance"
          icon={<MoreHorizontal className="w-4 h-4" />}
        >
          <BusinessOtherExpensesSection
            data={data}
            onChange={updateField}
          />
        </AppAccordionItem>

        {/* Accordion 6: Cost of Goods Sold (Inventory) */}
        <AppAccordionItem
          index={5}
          title="Cost of Goods Sold (COGS) &amp; Inventory"
          icon={<Package className="w-4 h-4" />}
        >
          <BusinessCogsSection
            data={data}
            onChange={updateField}
            selectedTaxYear={selectedTaxYear}
          />
        </AppAccordionItem>

        {/* Accordion 7: Business Vehicles */}
        <AppAccordionItem
          index={6}
          title="Business Use of Vehicles (Form 4562)"
          icon={<Car className="w-4 h-4" />}
        >
          <BusinessExpenseVehicle
            hasVehicle={data.hasVehicleExpenses}
            onToggleHasVehicle={(val) => updateField('hasVehicleExpenses', val)}
            vehicles={data.vehicles || []}
            onChangeVehicles={(veh) => updateField('vehicles', veh)}
            errors={errors}
          />
        </AppAccordionItem>

        {/* Accordion 8: Equipment & Depreciation */}
        <AppAccordionItem
          index={7}
          title="Equipment &amp; Asset Depreciation (Section 179)"
          icon={<Laptop className="w-4 h-4" />}
        >
          <BusinessExpenseAssets
            hasAssets={data.hasEquipmentPurchases}
            onToggleHasAssets={(val) => updateField('hasEquipmentPurchases', val)}
            assets={data.equipmentAssets || []}
            onChangeAssets={(assets) => updateField('equipmentAssets', assets)}
            errors={errors}
          />
        </AppAccordionItem>

        {/* Accordion 9: Home Office */}
        <AppAccordionItem
          index={8}
          title="Business Use of Home (Form 8829 Home Office)"
          icon={<Home className="w-4 h-4" />}
        >
          <BusinessExpenseHome
            hasHomeOffice={data.hasHomeOffice}
            onToggleHasHomeOffice={(val) => updateField('hasHomeOffice', val)}
            homeOffice={data.homeOffice || {}}
            onChangeHomeOffice={(ho) => updateField('homeOffice', ho)}
          />
        </AppAccordionItem>
      </AppAccordion>
    </div>
  );
};
