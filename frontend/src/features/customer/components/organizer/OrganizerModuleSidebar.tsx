import React from 'react';
import { 
  User, 
  ShieldCheck, 
  Receipt,
  FolderArchive,
  TrendingUp
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
