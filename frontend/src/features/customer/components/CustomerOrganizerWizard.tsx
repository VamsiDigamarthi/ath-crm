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
  Lock,
  Gift,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppSelect } from '@/shared/components/AppSelect';
import toast from 'react-hot-toast';

export const CustomerOrganizerWizard: React.FC = () => {
  const [selectedModId, setSelectedModId] = useState<string>('m6');
  const [accountType, setAccountType] = useState<string>('CHECKING');
  const [tradedStocks, setTradedStocks] = useState<boolean>(true);
  const [hasFbar, setHasFbar] = useState<boolean>(true);

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
      title: 'Spouse & Daycare Expenses',
      description: 'Spouse details, Child Tax Credit ($2k/child) & Daycare expenses',
      icon: Users,
      status: 'COMPLETED',
    },
    {
      id: 'm3',
      number: 3,
      section: 'Residency & Visa',
      title: 'Substantial Presence & States',
      description: 'US present days (2025/2024/2023) & Resided states history',
      icon: Globe,
      status: 'COMPLETED',
    },
    {
      id: 'm4',
      number: 4,
      section: 'Wages & Income',
      title: 'W-2 Wage Statements & Employer',
      description: 'Energy Grids LLC wage statements & Federal/State withholdings',
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
      title: '1099-B Stocks, ESPP & RSUs',
      description: 'Robinhood, Fidelity, Form 3921/3922, Capital loss carryforwards',
      icon: TrendingUp,
      status: 'IN_PROGRESS',
    },
    {
      id: 'm7',
      number: 7,
      section: 'Foreign & FBAR',
      title: 'FBAR / FATCA & Indian Income',
      description: 'Foreign accounts >$10k (FinCEN 114), NRE/NRO interest in INR',
      icon: ShieldCheck,
      status: 'COMPLETED',
    },
    {
      id: 'm8',
      number: 8,
      section: 'Deductions & Credits',
      title: 'Mortgage 1098, HSA & Solar Energy',
      description: 'Form 1098 Mortgage, HSA Form 8889, Clean Energy credits',
      icon: Receipt,
      status: 'COMPLETED',
    },
    {
      id: 'm9',
      number: 9,
      section: 'IRS Refund Payout',
      title: 'Bank Direct Deposit Routing',
      description: 'Checking account and routing numbers for direct IRS payout',
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
      toast.success('All 9 intake modules reviewed! Ready for CPA return preparation.');
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
            ATH Tax Services IRS-compliant intake wizard. Complete all 9 sections to maximize your TY 2025 deductions.
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
              IRS Intake Checklist
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

            {/* Module 1: Personal Demographics */}
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

            {/* Module 2: Spouse & Daycare */}
            {currentMod.id === 'm2' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Child & Dependent Care Expenses:</strong> Day-care expenses can be claimed if your spouse is working or a full-time student. Qualifying children receive up to $2,000/child Child Tax Credit.
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                    <span className="text-[11px] text-slate-400 font-semibold">Marital Status</span>
                    <div className="text-xs font-bold text-slate-900">Single / No Dependents Claimed</div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                    <span className="text-[11px] text-slate-400 font-semibold">Child Tax Credit Eligibility</span>
                    <div className="text-xs font-bold text-slate-900">$0.00 (Single Filer)</div>
                  </div>
                </div>
              </div>
            )}

            {/* Module 3: Substantial Presence & States */}
            {currentMod.id === 'm3' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-start gap-2.5">
                  <Globe className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Substantial Presence Test:</strong> We calculate your days present in the US (2025: 365 days, 2024: 360 days, 2023: 350 days) to confirm Form 1040 Resident Alien status.
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl border border-slate-200 bg-white text-center">
                    <span className="text-[11px] text-slate-400 font-bold block">TY 2025 US Days</span>
                    <strong className="text-sm text-slate-900">365 Days</strong>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 bg-white text-center">
                    <span className="text-[11px] text-slate-400 font-bold block">TY 2024 US Days</span>
                    <strong className="text-sm text-slate-900">360 Days</strong>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 bg-white text-center">
                    <span className="text-[11px] text-slate-400 font-bold block">TY 2023 US Days</span>
                    <strong className="text-sm text-slate-900">350 Days</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Module 6: 1099-B Stocks, ESPP & RSUs */}
            {currentMod.id === 'm6' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>1099-B Stock & Crypto Statements (Schedule D):</strong> IRS requires reporting capital gains/losses from Robinhood, Fidelity, E*TRADE, plus employer stock ESPP/RSU Form 3921/3922.
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <label className="flex items-center gap-2.5 text-xs font-bold text-slate-900 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={tradedStocks}
                        onChange={(e) => setTradedStocks(e.target.checked)}
                        className="w-4 h-4 rounded text-[#16A34A] focus:ring-[#16A34A]" 
                      />
                      <span>I traded US stocks, ETFs, RSUs or Crypto during TY 2025</span>
                    </label>
                    <p className="text-[11px] text-slate-500 pl-6">
                      Check this box so your CPA includes IRS Schedule D & Form 8949 in your return.
                    </p>
                  </div>

                  {tradedStocks && (
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
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Employer Stock RSUs / ESPP Form 3921</label>
                        <input
                          type="text"
                          defaultValue="Energy Grids LLC RSU Payout"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Prior Year Capital Loss Carryforward ($)</label>
                        <input
                          type="number"
                          defaultValue="0"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Module 7: Foreign & FBAR */}
            {currentMod.id === 'm7' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>FBAR & FATCA Compliance:</strong> FinCEN Form 114 is mandatory if aggregate foreign Indian bank balances exceeded $10,000 at any point during 2025. FATCA Form 8938 applies over $50,000.
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <label className="flex items-center gap-2.5 text-xs font-bold text-slate-900 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={hasFbar}
                      onChange={(e) => setHasFbar(e.target.checked)}
                      className="w-4 h-4 rounded text-[#16A34A] focus:ring-[#16A34A]" 
                    />
                    <span>I had over $10,000 aggregate in Indian bank accounts (NRE/NRO/FDs)</span>
                  </label>
                </div>

                {hasFbar && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                      <span className="text-[11px] text-slate-400 font-semibold">Indian Bank Name & Branch</span>
                      <div className="text-xs font-bold text-slate-900">State Bank of India (SBI NRE Account)</div>
                    </div>
                    <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                      <span className="text-[11px] text-slate-400 font-semibold">Peak Year Balance (INR)</span>
                      <div className="text-xs font-bold text-slate-900">₹14,50,000 (Approx $17,200 USD)</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Module 8: Deductions & Credits */}
            {currentMod.id === 'm8' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
                  <Receipt className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                  <div>
                    <strong>Tax Deductions & Clean Energy Credits:</strong> HSA contributions (Form 8889), Form 1098 Mortgage Interest, and Energy Saving Equipment (Solar/Heat Pump) reduce your taxable income.
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                    <span className="text-[11px] text-slate-400 font-semibold">HSA Contribution (Form 8889)</span>
                    <div className="text-xs font-bold text-slate-900">$4,150.00 (Max Individual Deduction)</div>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                    <span className="text-[11px] text-slate-400 font-semibold">Student Loan Interest (1098-E)</span>
                    <div className="text-xs font-bold text-slate-900">$1,200.00 Claimed</div>
                  </div>
                </div>
              </div>
            )}

            {/* Module 9: Direct Deposit */}
            {currentMod.id === 'm9' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
                  <Building2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                  <div>
                    <strong>IRS Direct Deposit:</strong> Providing your checking routing & account numbers enables the IRS to deposit your <strong>+$2,840 refund</strong> directly into your account in 14-21 days.
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
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Account Number *</label>
                    <input
                      type="text"
                      defaultValue="•••• •••• 4819"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Other Modules fallback */}
            {currentMod.id !== 'm1' && currentMod.id !== 'm2' && currentMod.id !== 'm3' && currentMod.id !== 'm6' && currentMod.id !== 'm7' && currentMod.id !== 'm8' && currentMod.id !== 'm9' && (
              <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center mx-auto border border-emerald-200 font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">{currentMod.title} Completed</h4>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  All documents and figures for this section have been verified by your assigned intake specialist.
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
