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
    title: 'Personal Info & SSN/ITIN',
    description: 'Legal name, masked SSN/ITIN, date of birth, filing status',
    icon: User,
  },
  {
    id: 'm2',
    number: 2,
    section: 'Demographics & Family',
    title: 'Spouse & Daycare Expenses',
    description: 'Spouse details, Child Tax Credit ($2k/child) & Daycare expenses',
    icon: Users,
  },
  {
    id: 'm3',
    number: 3,
    section: 'Residency & Visa',
    title: 'Substantial Presence & States',
    description: 'US present days (2025/2024/2023) & Resided states history',
    icon: Globe,
  },
  {
    id: 'm4',
    number: 4,
    section: 'Wages & Income',
    title: 'W-2 Wage Statements & Employer',
    description: 'Employer wage statements & Federal/State withholdings',
    icon: FileSpreadsheet,
  },
  {
    id: 'm5',
    number: 5,
    section: 'Wages & Income',
    title: '1099-INT / 1099-DIV Interest',
    description: 'High-yield savings interest & dividend income',
    icon: Landmark,
  },
  {
    id: 'm6',
    number: 6,
    section: 'Wages & Income',
    title: '1099-B Stocks, ESPP & RSUs',
    description: 'Robinhood, Fidelity, Form 3921/3922, Capital loss carryforwards',
    icon: TrendingUp,
  },
  {
    id: 'm7',
    number: 7,
    section: 'Foreign & FBAR',
    title: 'FBAR / FATCA & Indian Income',
    description: 'Foreign accounts >$10k (FinCEN 114), NRE/NRO interest in INR',
    icon: ShieldCheck,
  },
  {
    id: 'm8',
    number: 8,
    section: 'Deductions & Credits',
    title: 'Mortgage 1098, HSA & Solar Energy',
    description: 'Form 1098 Mortgage, HSA Form 8889, Clean Energy credits',
    icon: Receipt,
  },
  {
    id: 'm9',
    number: 9,
    section: 'IRS Refund Payout',
    title: 'Bank Direct Deposit Routing',
    description: 'Checking account and routing numbers for direct IRS payout',
    icon: Landmark,
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
  const isModuleCompleted = (modId: string): boolean => {
    if (!organizerData) return false;
    switch (modId) {
      case 'm1':
        return Boolean(organizerData.m1_demographics.fullName && organizerData.m1_demographics.city);
      case 'm2':
        return organizerData.m2_dependents !== undefined;
      case 'm3':
        return organizerData.m3_presence.days2025 > 0;
      case 'm4':
        return Boolean(organizerData.m4_wages.hasW2 || organizerData.m4_wages.employerName);
      case 'm5':
        return Boolean(organizerData.m5_interest.hasInterestDividends || organizerData.m5_interest.bankName);
      case 'm6':
        return Boolean(organizerData.m6_stocks.tradedStocks || organizerData.m6_stocks.brokerName);
      case 'm7':
        return Boolean(organizerData.m7_foreign.hasFbar || organizerData.m7_foreign.indianBankName);
      case 'm8':
        return Boolean(organizerData.m8_deductions.hsaContribution || organizerData.m8_deductions.studentLoanInterest);
      case 'm9':
        return Boolean(organizerData.m9_directDeposit.routingNumber && organizerData.m9_directDeposit.accountNumber);
      default:
        return false;
    }
  };

  return (
    <div className="lg:col-span-4 space-y-2 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
      <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          IRS Intake Checklist
        </span>
        <span className="text-xs font-extrabold text-[#16A34A]">{completedCount}/9 Done</span>
      </div>

      <div className="space-y-1 max-h-[620px] overflow-y-auto pr-1">
        {ORGANIZER_MODULES.map((mod) => {
          const Icon = mod.icon;
          const isSelected = mod.id === selectedModId;
          const isDone = isModuleCompleted(mod.id);

          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => onSelectModule(mod.id)}
              className={`w-full p-3 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    isSelected
                      ? 'bg-emerald-500 text-white'
                      : isDone
                      ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="min-w-0">
                  <div className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {mod.title}
                  </div>
                  <div className={`text-[10px] truncate ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                    Module 0{mod.number} • {mod.section}
                  </div>
                </div>
              </div>

              <div className="shrink-0">
                {isDone ? (
                  <CheckCircle2 className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-[#16A34A]'}`} />
                ) : (
                  <Clock className={`w-4 h-4 ${isSelected ? 'text-amber-300' : 'text-amber-500'}`} />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Referral Reward Promo Banner */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 space-y-1.5 mt-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#16A34A]">
          <Gift className="w-4 h-4" />
          <span>Earn $10 Per Paid Referral</span>
        </div>
        <p className="text-[11px] text-slate-600 font-medium">
          Refer friends & colleagues filing US taxes with ATH Tax Services.
        </p>
      </div>
    </div>
  );
};
