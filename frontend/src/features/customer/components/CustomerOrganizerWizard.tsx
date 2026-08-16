import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  User, 
  Users, 
  Globe, 
  FileSpreadsheet, 
  Landmark, 
  TrendingUp, 
  ShieldCheck, 
  Receipt, 
  Save,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Building2,
  Lock
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppSelect } from '@/shared/components/AppSelect';
import toast from 'react-hot-toast';

export const CustomerOrganizerWizard: React.FC = () => {
  const [selectedModId, setSelectedModId] = useState<string>('m6');
  const [accountType, setAccountType] = useState<string>('CHECKING');

  const modules = [
    {
      id: 'm1',
      number: 1,
      section: 'Demographics & Family',
      title: 'Personal Info & SSN/ITIN',
      description: 'Legal name, masked SSN/ITIN, date of birth, filing status',
      icon: User,
      status: 'COMPLETED',
    },
    {
      id: 'm2',
      number: 2,
      section: 'Demographics & Family',
      title: 'Spouse & Dependents',
      description: 'Spouse details, Child Tax Credit eligibility ($2,000/child)',
      icon: Users,
      status: 'COMPLETED',
    },
    {
      id: 'm3',
      number: 3,
      section: 'Residency & Visa',
      title: 'US Visa & Substantial Presence',
      description: 'H-1B arrival history to determine Form 1040 vs 1040-NR',
      icon: Globe,
      status: 'COMPLETED',
    },
    {
      id: 'm4',
      number: 4,
      section: 'Wages & Income',
      title: 'W-2 Wages & Employment',
      description: 'Energy Grids LLC wage statements & withholdings',
      icon: FileSpreadsheet,
      status: 'COMPLETED',
    },
    {
      id: 'm5',
      number: 5,
      section: 'Wages & Income',
      title: '1099-INT / 1099-DIV Interest',
      description: 'Chase Bank high-yield savings interest & dividend income',
      icon: Landmark,
      status: 'COMPLETED',
    },
    {
      id: 'm6',
      number: 6,
      section: 'Wages & Income',
      title: '1099-B Stocks, Crypto & RSUs',
      description: 'Robinhood, Fidelity, ESPP capital gains (Schedule D)',
      icon: TrendingUp,
      status: 'IN_PROGRESS',
    },
    {
      id: 'm7',
      number: 7,
      section: 'Foreign & Deductions',
      title: 'Foreign Accounts & FBAR',
      description: 'Indian NRE/NRO bank accounts (FinCEN 114 reporting)',
      icon: ShieldCheck,
      status: 'COMPLETED',
    },
    {
      id: 'm8',
      number: 8,
      section: 'Foreign & Deductions',
      title: 'Deductions & Credits (HSA/1098)',
      description: 'HSA contributions (Form 8889), student loan interest',
      icon: Receipt,
      status: 'COMPLETED',
    },
    {
      id: 'm9',
      number: 9,
      section: 'IRS Refund Payout',
      title: 'Bank Direct Deposit Routing',
      description: 'Checking account and routing numbers for IRS refund',
      icon: Landmark,
      status: 'IN_PROGRESS',
    },
  ];

  const currentModIndex = modules.findIndex((m) => m.id === selectedModId);
  const currentMod = modules[currentModIndex] || modules[0];

  const completedCount = modules.filter((m) => m.status === 'COMPLETED').length;
  const progressPct = Math.round((completedCount / modules.length) * 100);

  const handleNext = () => {
    if (currentModIndex < modules.length - 1) {
      setSelectedModId(modules[currentModIndex + 1].id);
    } else {
      toast.success('All 9 modules reviewed! Your organizer is ready for CPA audit.');
    }
  };

  const handlePrev = () => {
    if (currentModIndex > 0) {
      setSelectedModId(modules[currentModIndex - 1].id);
    }
  };

  const handleSaveCurrent = () => {
    toast.success(`${currentMod.title} saved to your file! 🚀`);
    handleNext();
  };

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      
      {/* 1. Standard Top Header & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              9-Module Comprehensive Tax Organizer
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
              {progressPct}% Verified
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Review and complete all 9 IRS intake modules to ensure maximum tax deductions for TY 2025.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-slate-800">{completedCount} of 9 Verified</span>
            <div className="w-32 bg-slate-100 rounded-full h-2 mt-1 overflow-hidden">
              <div className="bg-[#16A34A] h-full rounded-full transition-all" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          <Button
            size="sm"
            onClick={handleSaveCurrent}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer px-4"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save All Drafts</span>
          </Button>
        </div>
      </div>

      {/* 2. Master Split Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: 9-Module Navigator Sidebar (4 Cols) */}
        <div className="lg:col-span-4 space-y-2 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Intake Checklist
            </span>
            <span className="text-xs font-extrabold text-[#16A34A]">{completedCount}/9 Done</span>
          </div>

          <div className="space-y-1 max-h-[620px] overflow-y-auto pr-1">
            {modules.map((mod) => {
              const Icon = mod.icon;
              const isSelected = mod.id === selectedModId;
              const isDone = mod.status === 'COMPLETED';

              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => setSelectedModId(mod.id)}
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
        </div>

        {/* Right Column: Focused Interactive Workspace Canvas (8 Cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
          
          <div className="space-y-5">
            {/* Active Module Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center border border-emerald-200 font-bold">
                  {React.createElement(currentMod.icon, { className: 'w-5 h-5' })}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Module 0{currentMod.number}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                      {currentMod.section}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    {currentMod.title}
                  </h3>
                </div>
              </div>

              <div>
                {currentMod.status === 'COMPLETED' ? (
                  <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                    <span>Verified & Locked</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>Needs Taxpayer Input</span>
                  </span>
                )}
              </div>
            </div>

            {/* Dynamic Interactive Module Workspace */}
            {currentMod.id === 'm1' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Personal information is verified via official SSN/ITIN card records.</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                    <span className="text-[11px] text-slate-400 font-semibold">Primary Taxpayer Legal Name</span>
                    <div className="text-xs font-bold text-slate-900">Naveen Krishnan</div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                    <span className="text-[11px] text-slate-400 font-semibold">Social Security Number (SSN)</span>
                    <div className="text-xs font-bold text-slate-900">•••-••-4819 (Verified)</div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                    <span className="text-[11px] text-slate-400 font-semibold">Filing Status TY2025</span>
                    <div className="text-xs font-bold text-slate-900">Single ($15,000 Standard Deduction)</div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                    <span className="text-[11px] text-slate-400 font-semibold">Residential Tax State</span>
                    <div className="text-xs font-bold text-slate-900">Houston, Texas (TX - 0% State Tax)</div>
                  </div>
                </div>
              </div>
            )}

            {currentMod.id === 'm6' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>1099-B Stock & Crypto Transactions</strong> — IRS Form 1040 Schedule D requires reporting capital gains/losses from Robinhood, Fidelity, E*TRADE, or employer RSUs.
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <label className="flex items-center gap-2.5 text-xs font-bold text-slate-900 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-[#16A34A] focus:ring-[#16A34A]" />
                      <span>I traded US stocks, ETFs, or Crypto during TY 2025</span>
                    </label>
                    <p className="text-[11px] text-slate-500 pl-6">
                      Check this box so your CPA includes IRS Schedule D & Form 8949 in your return.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Brokerage Platform Name</label>
                      <input
                        type="text"
                        defaultValue="Robinhood Financial LLC"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Estimated Total Capital Gain / (Loss) ($)</label>
                      <input
                        type="number"
                        defaultValue="3450"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentMod.id === 'm9' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
                  <Building2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                  <div>
                    <strong>IRS Direct Deposit</strong> — Providing your checking routing & account numbers enables the IRS to deposit your <strong>+$2,840 refund</strong> directly into your account in 14-21 days.
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Bank Name *</label>
                    <input
                      type="text"
                      defaultValue="JPMorgan Chase Bank, N.A."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Account Type *</label>
                    <AppSelect
                      options={[
                        { label: 'Checking Account', value: 'CHECKING' },
                        { label: 'Savings Account', value: 'SAVINGS' },
                      ]}
                      value={accountType}
                      onChange={(val) => setAccountType(val || 'CHECKING')}
                      placeholder="Select Account Type"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">9-Digit Routing Number *</label>
                    <input
                      type="text"
                      defaultValue="111000614"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Account Number *</label>
                    <input
                      type="text"
                      defaultValue="•••• •••• 4819"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentMod.id !== 'm1' && currentMod.id !== 'm6' && currentMod.id !== 'm9' && (
              <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center mx-auto border border-emerald-200 font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">{currentMod.title} Completed</h4>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  All documents and wage figures for this section have been verified by your assigned intake specialist Kavya R.
                </p>
              </div>
            )}
          </div>

          {/* Module Navigation Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={currentModIndex === 0}
              className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous Module</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleSaveCurrent}
                className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer px-4"
              >
                <span>Save & Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
