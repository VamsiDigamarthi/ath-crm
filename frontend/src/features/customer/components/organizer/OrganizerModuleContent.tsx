import React from 'react';
import { 
  CheckCircle2, 
  Lock, 
  HelpCircle, 
  Globe, 
  Sparkles, 
  ShieldCheck, 
  Receipt, 
  Building2, 
  ArrowLeft, 
  ArrowRight, 
  Save,
  DollarSign,
  Calendar,
  CreditCard,
  Briefcase
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppInput } from '@/shared/components/AppInput';
import { AppSelect } from '@/shared/components/AppSelect';
import { ORGANIZER_MODULES } from './OrganizerModuleSidebar';
import { type OrganizerData } from '../../services/customer-api';

interface OrganizerModuleContentProps {
  selectedModId: string;
  selectedTaxYear: number;
  organizerData: OrganizerData | null;
  updateModuleField: <K extends keyof OrganizerData>(moduleKey: K, field: keyof OrganizerData[K], value: any) => void;
  onNext: () => void;
  onPrev: () => void;
  onSave: () => void;
  currentModIndex: number;
  saving: boolean;
}

export const OrganizerModuleContent: React.FC<OrganizerModuleContentProps> = ({
  selectedModId,
  selectedTaxYear,
  organizerData,
  updateModuleField,
  onNext,
  onPrev,
  onSave,
  currentModIndex,
  saving,
}) => {
  const currentMod = ORGANIZER_MODULES.find((m) => m.id === selectedModId) || ORGANIZER_MODULES[0];

  if (!organizerData) {
    return (
      <div className="lg:col-span-8 bg-white p-12 rounded-xl border border-slate-200 shadow-xs text-center text-xs text-slate-400">
        Loading module intake data...
      </div>
    );
  }

  const {
    m1_demographics,
    m2_dependents,
    m3_presence,
    m4_wages,
    m5_interest,
    m6_stocks,
    m7_foreign,
    m8_deductions,
    m9_directDeposit,
  } = organizerData;

  return (
    <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
      <div className="space-y-5">
        {/* Module Header Bar */}
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
            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
              <span>Verified & Editable</span>
            </span>
          </div>
        </div>

        {/* Module 1: Personal Demographics */}
        {selectedModId === 'm1' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Personal information is verified via official SSN/ITIN card records.</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AppInput
                label="Primary Taxpayer Legal Name"
                placeholder="e.g. Naveen Krishnan"
                value={m1_demographics.fullName}
                onChange={(e) => updateModuleField('m1_demographics', 'fullName', e.target.value)}
              />

              <AppInput
                label="Social Security Number (SSN)"
                placeholder="•••-••-0124"
                disabled
                value={m1_demographics.ssnMasked}
              />

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 tracking-tight">
                  Filing Status (TY {selectedTaxYear})
                </label>
                <AppSelect
                  options={[
                    { label: 'Single ($15,000 Standard Deduction)', value: 'Single' },
                    { label: 'Married Filing Jointly ($30,000 Deduction)', value: 'Married Filing Jointly' },
                    { label: 'Married Filing Separately', value: 'Married Filing Separately' },
                    { label: 'Head of Household ($22,500 Deduction)', value: 'Head of Household' },
                  ]}
                  value={m1_demographics.filingStatus}
                  onChange={(val) => updateModuleField('m1_demographics', 'filingStatus', val || 'Single')}
                  placeholder="Select Filing Status"
                />
              </div>

              <AppInput
                label="Residential Tax City & State"
                placeholder="e.g. Houston, TX"
                value={`${m1_demographics.city}${m1_demographics.state ? `, ${m1_demographics.state}` : ''}`}
                onChange={(e) => {
                  const [city, state] = e.target.value.split(',');
                  updateModuleField('m1_demographics', 'city', (city || '').trim());
                  if (state) updateModuleField('m1_demographics', 'state', state.trim());
                }}
              />
            </div>
          </div>
        )}

        {/* Module 2: Spouse & Daycare */}
        {selectedModId === 'm2' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong>Child & Dependent Care Expenses:</strong> Day-care expenses can be claimed if your spouse is working or a full-time student. Qualifying children receive up to $2,000/child Child Tax Credit.
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AppInput
                label="Number of Qualifying Dependents"
                type="number"
                placeholder="0"
                value={m2_dependents.childCount?.toString() || '0'}
                onChange={(e) => updateModuleField('m2_dependents', 'childCount', parseInt(e.target.value, 10) || 0)}
              />

              <AppInput
                label="Daycare / Preschool Annual Paid ($)"
                type="number"
                placeholder="e.g. 2400"
                leftIcon={<DollarSign className="w-4 h-4" />}
                value={m2_dependents.daycareAmount ? m2_dependents.daycareAmount.toString() : ''}
                onChange={(e) => updateModuleField('m2_dependents', 'daycareAmount', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        )}

        {/* Module 3: Substantial Presence & States */}
        {selectedModId === 'm3' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-start gap-2.5">
              <Globe className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong>Substantial Presence Test:</strong> Mention your total days present in the US ({selectedTaxYear}, {selectedTaxYear - 1}, {selectedTaxYear - 2}) to establish Form 1040 Resident Alien status.
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <AppInput
                label={`TY ${selectedTaxYear} Days in US *`}
                type="number"
                placeholder="365"
                leftIcon={<Calendar className="w-4 h-4" />}
                value={m3_presence.days2025?.toString() || '365'}
                onChange={(e) => updateModuleField('m3_presence', 'days2025', parseInt(e.target.value, 10) || 0)}
              />

              <AppInput
                label={`TY ${selectedTaxYear - 1} Days in US`}
                type="number"
                placeholder="0"
                leftIcon={<Calendar className="w-4 h-4" />}
                value={m3_presence.days2024 ? m3_presence.days2024.toString() : ''}
                onChange={(e) => updateModuleField('m3_presence', 'days2024', parseInt(e.target.value, 10) || 0)}
              />

              <AppInput
                label={`TY ${selectedTaxYear - 2} Days in US`}
                type="number"
                placeholder="0"
                leftIcon={<Calendar className="w-4 h-4" />}
                value={m3_presence.days2023 ? m3_presence.days2023.toString() : ''}
                onChange={(e) => updateModuleField('m3_presence', 'days2023', parseInt(e.target.value, 10) || 0)}
              />
            </div>
          </div>
        )}

        {/* Module 4: Wages */}
        {selectedModId === 'm4' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AppInput
                label="Primary Employer Name *"
                placeholder="e.g. Energy Grids LLC"
                leftIcon={<Briefcase className="w-4 h-4" />}
                value={m4_wages.employerName || ''}
                onChange={(e) => updateModuleField('m4_wages', 'employerName', e.target.value)}
              />

              <AppInput
                label="Estimated Total Annual Wages ($)"
                type="number"
                placeholder="e.g. 145000"
                leftIcon={<DollarSign className="w-4 h-4" />}
                value={m4_wages.estimatedWages ? m4_wages.estimatedWages.toString() : ''}
                onChange={(e) => updateModuleField('m4_wages', 'estimatedWages', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        )}

        {/* Module 5: 1099 Interest & Dividends */}
        {selectedModId === 'm5' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AppInput
                label="1099-INT High-Yield Bank Name"
                placeholder="e.g. JPMorgan Chase Bank"
                leftIcon={<Building2 className="w-4 h-4" />}
                value={m5_interest.bankName || ''}
                onChange={(e) => updateModuleField('m5_interest', 'bankName', e.target.value)}
              />

              <AppInput
                label="1099-INT Interest Amount ($)"
                type="number"
                placeholder="e.g. 1420"
                leftIcon={<DollarSign className="w-4 h-4" />}
                value={m5_interest.interestAmount ? m5_interest.interestAmount.toString() : ''}
                onChange={(e) => updateModuleField('m5_interest', 'interestAmount', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        )}

        {/* Module 6: 1099-B Stocks & RSUs */}
        {selectedModId === 'm6' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>1099-B Stock & Crypto Statements (Schedule D):</strong> IRS requires reporting capital gains/losses from Robinhood, Fidelity, E*TRADE, plus employer stock ESPP/RSU Form 3921/3922.
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <label className="flex items-center gap-2.5 text-xs font-bold text-slate-900 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={m6_stocks.tradedStocks}
                  onChange={(e) => updateModuleField('m6_stocks', 'tradedStocks', e.target.checked)}
                  className="w-4 h-4 rounded text-[#16A34A] focus:ring-[#16A34A]" 
                />
                <span>I traded US stocks, ETFs, RSUs or Crypto during TY {selectedTaxYear}</span>
              </label>
            </div>

            {m6_stocks.tradedStocks && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <AppInput
                  label="Brokerage Platform Name"
                  placeholder="e.g. Robinhood Financial LLC / Fidelity"
                  value={m6_stocks.brokerName || ''}
                  onChange={(e) => updateModuleField('m6_stocks', 'brokerName', e.target.value)}
                />

                <AppInput
                  label="Estimated Total Capital Gain / (Loss) ($)"
                  type="number"
                  placeholder="e.g. 3450"
                  leftIcon={<DollarSign className="w-4 h-4" />}
                  value={m6_stocks.totalCapitalGain ? m6_stocks.totalCapitalGain.toString() : ''}
                  onChange={(e) => updateModuleField('m6_stocks', 'totalCapitalGain', parseFloat(e.target.value) || 0)}
                />
              </div>
            )}
          </div>
        )}

        {/* Module 7: Foreign & FBAR */}
        {selectedModId === 'm7' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <strong>FBAR & FATCA Compliance:</strong> FinCEN Form 114 is mandatory if aggregate foreign Indian bank balances exceeded $10,000 at any point during {selectedTaxYear}. FATCA Form 8938 applies over $50,000.
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <label className="flex items-center gap-2.5 text-xs font-bold text-slate-900 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={m7_foreign.hasFbar}
                  onChange={(e) => updateModuleField('m7_foreign', 'hasFbar', e.target.checked)}
                  className="w-4 h-4 rounded text-[#16A34A] focus:ring-[#16A34A]" 
                />
                <span>I had over $10,000 aggregate in Indian bank accounts (NRE/NRO/FDs) during TY {selectedTaxYear}</span>
              </label>
            </div>

            {m7_foreign.hasFbar && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <AppInput
                  label="Indian Bank Name & Branch"
                  placeholder="e.g. State Bank of India (SBI NRE Account)"
                  leftIcon={<Building2 className="w-4 h-4" />}
                  value={m7_foreign.indianBankName || ''}
                  onChange={(e) => updateModuleField('m7_foreign', 'indianBankName', e.target.value)}
                />

                <AppInput
                  label="Peak Year Balance (INR ₹)"
                  type="number"
                  placeholder="e.g. 1450000"
                  value={m7_foreign.peakBalanceInr ? m7_foreign.peakBalanceInr.toString() : ''}
                  onChange={(e) => updateModuleField('m7_foreign', 'peakBalanceInr', parseFloat(e.target.value) || 0)}
                />
              </div>
            )}
          </div>
        )}

        {/* Module 8: Deductions & Credits */}
        {selectedModId === 'm8' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
              <Receipt className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
              <div>
                <strong>Tax Deductions & Clean Energy Credits:</strong> HSA contributions (Form 8889), Form 1098 Mortgage Interest, and Energy Saving Equipment reduce your taxable income.
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <AppInput
                label="HSA Annual Contribution (Form 8889) ($)"
                type="number"
                placeholder="e.g. 4150"
                leftIcon={<DollarSign className="w-4 h-4" />}
                value={m8_deductions.hsaContribution ? m8_deductions.hsaContribution.toString() : ''}
                onChange={(e) => updateModuleField('m8_deductions', 'hsaContribution', parseFloat(e.target.value) || 0)}
              />

              <AppInput
                label="Student Loan Interest (1098-E) ($)"
                type="number"
                placeholder="e.g. 1200"
                leftIcon={<DollarSign className="w-4 h-4" />}
                value={m8_deductions.studentLoanInterest ? m8_deductions.studentLoanInterest.toString() : ''}
                onChange={(e) => updateModuleField('m8_deductions', 'studentLoanInterest', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        )}

        {/* Module 9: Bank Direct Deposit */}
        {selectedModId === 'm9' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
              <Building2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
              <div>
                <strong>IRS Direct Deposit:</strong> Providing your checking routing & account numbers enables the IRS to deposit your refund directly into your account in 14-21 days.
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AppInput
                label="Bank Name *"
                placeholder="e.g. JPMorgan Chase Bank, N.A."
                leftIcon={<Building2 className="w-4 h-4" />}
                value={m9_directDeposit.bankName || ''}
                onChange={(e) => updateModuleField('m9_directDeposit', 'bankName', e.target.value)}
              />

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 tracking-tight">
                  Account Type *
                </label>
                <AppSelect
                  options={[
                    { label: 'Checking Account', value: 'CHECKING' },
                    { label: 'Savings Account', value: 'SAVINGS' },
                  ]}
                  value={m9_directDeposit.accountType || 'CHECKING'}
                  onChange={(val) => updateModuleField('m9_directDeposit', 'accountType', val || 'CHECKING')}
                  placeholder="Select Account Type"
                />
              </div>

              <AppInput
                label="9-Digit Routing Number *"
                placeholder="e.g. 111000614"
                leftIcon={<CreditCard className="w-4 h-4" />}
                value={m9_directDeposit.routingNumber || ''}
                onChange={(e) => updateModuleField('m9_directDeposit', 'routingNumber', e.target.value)}
              />

              <AppInput
                label="Account Number *"
                placeholder="e.g. 849204819"
                leftIcon={<CreditCard className="w-4 h-4" />}
                value={m9_directDeposit.accountNumber || ''}
                onChange={(e) => updateModuleField('m9_directDeposit', 'accountNumber', e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation & Action Footer */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={currentModIndex === 0}
          className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Previous Module</span>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onSave}
            disabled={saving}
            className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Draft'}</span>
          </Button>

          <Button
            size="sm"
            onClick={onNext}
            disabled={saving}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer px-4"
          >
            <span>Save & Continue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
