import React from 'react';
import { 
  User, 
  ShieldCheck, 
  Receipt, 
  FolderArchive, 
  TrendingUp,
  Building2,
  FileCheck
} from 'lucide-react';
import { AppTabs } from '@/shared/components/AppTabs';
import { type OrganizerData } from '../../services/customer-api';

export interface ModuleDefinition {
  id: string;
  number: number;
  section: string;
  title: string;
  label: string;
  description: string;
  icon: any;
}

export const INDIVIDUAL_MODULES: ModuleDefinition[] = [
  {
    id: 'm1',
    number: 1,
    section: 'Demographics & Family',
    title: 'General Information',
    label: 'General Information',
    description: 'Name, SSN/ITIN, Port of Entry, Spouse, Dependents, State & Residency, Direct Deposit',
    icon: User,
  },
  {
    id: 'm_income',
    number: 2,
    section: 'Income Sources',
    title: 'Income',
    label: 'Income',
    description: 'W-2 wages, 1099 interest/dividends, 1099-B stocks & Schedule E rental property',
    icon: TrendingUp,
  },
  {
    id: 'm_expenses',
    number: 3,
    section: 'Expenses & Deductions',
    title: 'Expenses',
    label: 'Expenses',
    description: 'State rent, charitable donations, daycare expenses & itemized deductions',
    icon: Receipt,
  },
  {
    id: 'm7',
    number: 4,
    section: 'Foreign & FBAR',
    title: 'FBAR / FATCA & Indian Income (INR)',
    label: 'FBAR & FATCA',
    description: 'Foreign accounts >$10k/$50k, Indian Salary, Dividends, NRE/NRO Interest & TDS',
    icon: ShieldCheck,
  },
  {
    id: 'm_vault',
    number: 5,
    section: 'Documents & Receipts',
    title: 'Upload Documents',
    label: 'Upload Documents',
    description: 'Upload W-2, 1099, FBAR statements, tax records & Google Drive links',
    icon: FolderArchive,
  },
  {
    id: 'm_review_draft',
    number: 6,
    section: 'Tax Return & E-Sign',
    title: 'Review Tax Return Draft & E-Sign',
    label: 'Review Draft & E-Sign',
    description: 'Inspect Form 1040 calculations, download return draft copy, and e-sign required deliverables',
    icon: FileCheck,
  },
];

export const BUSINESS_MODULES: ModuleDefinition[] = [
  {
    id: 'b1_companyInfo',
    number: 1,
    section: 'Company Profile & Ownership',
    title: 'General Information',
    label: 'General Information',
    description: 'Entity Name, EIN, Formation Date, Structure, Address & Partners/Shareholders K-1',
    icon: Building2,
  },
  {
    id: 'b2_businessIncome',
    number: 2,
    section: 'Revenue & Gross Receipts',
    title: 'Income',
    label: 'Income',
    description: 'Form 1099-NEC/MISC, Client Invoices, Gross Receipts & Monthly Sales',
    icon: TrendingUp,
  },
  {
    id: 'b3_businessExpenses',
    number: 3,
    section: 'Operating Deductions & Assets',
    title: 'Expenses',
    label: 'Expenses',
    description: 'Payroll, Commercial Facility, Supplies, Marketing, COGS, Vehicle, Assets & Home Office',
    icon: Receipt,
  },
  {
    id: 'm7',
    number: 4,
    section: 'Foreign & FBAR',
    title: 'FBAR / FATCA & Indian Income (INR)',
    label: 'FBAR & FATCA',
    description: 'Foreign accounts >$10k/$50k, Indian Salary, Dividends, NRE/NRO Interest & TDS',
    icon: ShieldCheck,
  },
  {
    id: 'm_vault',
    number: 5,
    section: 'Documents & Vault',
    title: 'Upload Documents',
    label: 'Upload Documents',
    description: 'Corporate records, P&L, 1099s, bank statements & tax audit files',
    icon: FolderArchive,
  },
  {
    id: 'm_review_draft',
    number: 6,
    section: 'Tax Return & E-Sign',
    title: 'Review Tax Return Draft & E-Sign',
    label: 'Review Draft & E-Sign',
    description: 'Inspect Form 1120 calculations, download return draft copy, and e-sign required deliverables',
    icon: FileCheck,
  },
];

// Backwards compatibility alias
export const ORGANIZER_MODULES = INDIVIDUAL_MODULES;

export const getModulesForFilingType = (filingType?: string): ModuleDefinition[] => {
  return filingType?.toUpperCase() === 'BUSINESS' ? BUSINESS_MODULES : INDIVIDUAL_MODULES;
};

interface OrganizerModuleSidebarProps {
  selectedModId: string;
  onSelectModule: (id: string) => void;
  completedCount?: number;
  organizerData?: OrganizerData | null;
  filingType?: string;
}

export const OrganizerModuleSidebar: React.FC<OrganizerModuleSidebarProps> = ({
  selectedModId,
  onSelectModule,
  filingType,
}) => {
  const modules = getModulesForFilingType(filingType);

  return (
    <AppTabs
      tabs={modules.map((m) => ({
        id: m.id,
        label: m.label,
      }))}
      activeTab={selectedModId}
      onChange={(tabId) => onSelectModule(tabId)}
      size="sm"
    />
  );
};
