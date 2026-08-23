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
  CheckCircle2, 
  Clock, 
  Gift 
} from 'lucide-react';
import { type OrganizerData } from '../../services/customer-api';
import { isModuleCompleted } from './utils/organizer-validation';

export interface ModuleDefinition {
  id: string;
  number: number;
  section: string;
  title: string;
  description: string;
  icon: any;
}

export const ORGANIZER_MODULES: ModuleDefinition[] = [
  {
    id: 'm1',
    number: 1,
    section: 'Demographics & Family',
    title: 'Personal Info, Visa & Marriage',
    description: 'Name, SSN/ITIN, Port of Entry, Visa change date & Date of Marriage',
    icon: User,
  },
  {
    id: 'm2',
    number: 2,
    section: 'Demographics & Family',
    title: 'Spouse, Dependents & Daycare',
    description: 'Spouse details, Child Tax Credit & Daycare provider EIN / Address',
    icon: Users,
  },
  {
    id: 'm3',
    number: 3,
    section: 'Residency & Visa',
    title: 'Substantial Presence & Multi-State',
    description: 'Presence test (2025/2024/2023) & 4-Year State residency history',
    icon: Globe,
  },
  {
    id: 'm4',
    number: 4,
    section: 'Wages & Income',
    title: 'W-2 Wages & Rental Properties',
    description: 'Employer wage statements & Rental property income & expenses worksheet',
    icon: FileSpreadsheet,
  },
  {
    id: 'm5',
    number: 5,
    section: 'Wages & Income',
    title: '1099-INT / DIV / OID Interest',
    description: 'High-yield savings interest, dividends & Original Issue Discount',
    icon: Landmark,
  },
  {
    id: 'm6',
    number: 6,
    section: 'Wages & Income',
    title: '1099-B Stocks, ESPP, RSU & Losses',
    description: 'Robinhood/Fidelity, ESPP/RSU (Form 3921/3922) & Loss carryforwards',
    icon: TrendingUp,
  },
  {
    id: 'm7',
    number: 7,
    section: 'Foreign & FBAR',
    title: 'FBAR / FATCA & Indian Income (INR)',
    description: 'Foreign accounts >$10k/$50k, Indian Salary, Dividends, NRE/NRO Interest & TDS',
    icon: ShieldCheck,
  },
  {
    id: 'm8',
    number: 8,
    section: 'Deductions & Credits',
    title: 'Itemized Deductions & Solar Energy',
    description: 'State rent deduction, 1098 Mortgage, Indian property tax, Solar/Energy, HSA/IRA',
    icon: Receipt,
  },
  {
    id: 'm9',
    number: 9,
    section: 'IRS Refund Payout',
    title: 'Direct Deposit & $10 Referral Program',
    description: 'Direct IRS deposit routing, Notes to preparer & $10 paid friend referrals',
    icon: Gift,
  },
];

interface OrganizerModuleSidebarProps {
  selectedModId: string;
  onSelectModule: (id: string) => void;
  completedCount: number;
  organizerData: OrganizerData | null;
}

export const OrganizerModuleSidebar: React.FC<OrganizerModuleSidebarProps> = ({
  selectedModId,
  onSelectModule,
  completedCount,
  organizerData,
}) => {
  return (
    <div className="w-full bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
      {/* Top Header Row with Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
            9-Module Tax Intake Steps
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
            {completedCount} of 9 Verified
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
          <span>Click any tab below to jump directly to that section</span>
        </div>
      </div>

      {/* Horizontal Scrollable Tabs Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-200">
        {ORGANIZER_MODULES.map((mod) => {
          const Icon = mod.icon;
          const isSelected = mod.id === selectedModId;
          const isDone = isModuleCompleted(mod.id, organizerData);

          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => onSelectModule(mod.id)}
              className={`px-3.5 py-2.5 rounded-xl text-left transition-all cursor-pointer flex items-center gap-2.5 shrink-0 border ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : isDone
                  ? 'bg-emerald-50/60 hover:bg-emerald-50 text-slate-800 border-emerald-300/80'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                  isSelected
                    ? 'bg-emerald-500 text-white'
                    : isDone
                    ? 'bg-emerald-100 text-[#16A34A]'
                    : 'bg-white text-slate-500 border border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-extrabold uppercase ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`}>
                    0{mod.number}
                  </span>
                  <span className={`text-xs font-bold whitespace-nowrap ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {mod.title.split(',')[0]}
                  </span>
                </div>
              </div>

              {/* Status Pill Badge */}
              <div className="shrink-0 ml-1.5 flex items-center">
                {isDone ? (
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold border ${
                      isSelected
                        ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400/40'
                        : 'bg-emerald-100 text-[#15803D] border-emerald-300'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                    <span>Submitted</span>
                  </span>
                ) : (
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-semibold border ${
                      isSelected
                        ? 'bg-slate-800 text-slate-300 border-slate-700'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    <Clock className="w-2.5 h-2.5 text-amber-500" />
                    <span>Pending</span>
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
