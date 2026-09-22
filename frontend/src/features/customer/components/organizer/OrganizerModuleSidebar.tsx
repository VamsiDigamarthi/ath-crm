import React from 'react';
import { 
  User, 
  Users, 
  Globe, 
  ShieldCheck, 
  Receipt, 
  Building2 
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

export const ORGANIZER_MODULES: ModuleDefinition[] = [
  {
    id: 'm1',
    number: 1,
    section: 'Demographics & Family',
    title: 'Personal Info, Visa & Marriage',
    label: 'Personal Info & Visa',
    description: 'Name, SSN/ITIN, Port of Entry, Visa change date & Date of Marriage',
    icon: User,
  },
  {
    id: 'm2',
    number: 2,
    section: 'Demographics & Family',
    title: 'Spouse, Dependents & Daycare',
    label: 'Spouse & Dependents',
    description: 'Spouse details, Child Tax Credit & Daycare provider EIN / Address',
    icon: Users,
  },
  {
    id: 'm3',
    number: 3,
    section: 'Residency & Visa',
    title: 'State of Residency & Multi-State',
    label: 'STATE OF RESIDENCY',
    description: 'Presence test (2025/2024/2023), 4-Year State residency history & Rental properties',
    icon: Globe,
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
    id: 'm9',
    number: 5,
    section: 'IRS Refund Payout',
    title: 'Direct Deposit & Referral Program',
    label: 'Direct Deposit & Refund',
    description: 'Direct IRS deposit routing, Notes to preparer & $10 paid friend referrals',
    icon: Building2,
  },
  {
    id: 'm_income_expenses',
    number: 6,
    section: 'Income & Expenses',
    title: 'Income and Expenses',
    label: 'Income and Expenses',
    description: 'W-2 wages, 1099 interest/dividends, 1099-B stocks & itemized deductions',
    icon: Receipt,
  },
];

interface OrganizerModuleSidebarProps {
  selectedModId: string;
  onSelectModule: (id: string) => void;
  completedCount?: number;
  organizerData?: OrganizerData | null;
}

export const OrganizerModuleSidebar: React.FC<OrganizerModuleSidebarProps> = ({
  selectedModId,
  onSelectModule,
}) => {
  return (
    <AppTabs
      tabs={ORGANIZER_MODULES.map((m) => ({
        id: m.id,
        label: m.label,
      }))}
      activeTab={selectedModId}
      onChange={(tabId) => onSelectModule(tabId)}
      size="sm"
    />
  );
};
