import React from 'react';
import { 
  User, 
  Users, 
  Globe, 
  FileSpreadsheet, 
  Landmark, 
  TrendingUp, 
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
    title: 'Substantial Presence & Multi-State',
    label: 'Substantial Presence',
    description: 'Presence test (2025/2024/2023) & 4-Year State residency history',
    icon: Globe,
  },
  {
    id: 'm4',
    number: 4,
    section: 'Wages & Income',
    title: 'W-2 Wages & Rental Properties',
    label: 'W-2 Wages & Income',
    description: 'Employer wage statements & Rental property income & expenses worksheet',
    icon: FileSpreadsheet,
  },
  {
    id: 'm5',
    number: 5,
    section: 'Wages & Income',
    title: '1099-INT / DIV / OID Interest',
    label: '1099 Interest & Dividends',
    description: 'High-yield savings interest, dividends & Original Issue Discount',
    icon: Landmark,
  },
  {
    id: 'm6',
    number: 6,
    section: 'Wages & Income',
    title: '1099-B Stocks, ESPP, RSU & Losses',
    label: '1099-B Stocks & Gains',
    description: 'Robinhood/Fidelity, ESPP/RSU (Form 3921/3922) & Loss carryforwards',
    icon: TrendingUp,
  },
  {
    id: 'm7',
    number: 7,
    section: 'Foreign & FBAR',
    title: 'FBAR / FATCA & Indian Income (INR)',
    label: 'FBAR & FATCA',
    description: 'Foreign accounts >$10k/$50k, Indian Salary, Dividends, NRE/NRO Interest & TDS',
    icon: ShieldCheck,
  },
  {
    id: 'm8',
    number: 8,
    section: 'Deductions & Credits',
    title: 'Itemized Deductions & Solar Energy',
    label: 'Itemized Deductions',
    description: 'State rent deduction, 1098 Mortgage, Indian property tax, Solar/Energy, HSA/IRA',
    icon: Receipt,
  },
  {
    id: 'm9',
    number: 9,
    section: 'IRS Refund Payout',
    title: 'Direct Deposit & $10 Referral Program',
    label: 'Direct Deposit & Refund',
    description: 'Direct IRS deposit routing, Notes to preparer & $10 paid friend referrals',
    icon: Building2,
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
