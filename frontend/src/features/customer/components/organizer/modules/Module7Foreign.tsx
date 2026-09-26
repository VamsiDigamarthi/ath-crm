import React from 'react';
import { AlertTriangle, Globe, Landmark, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppInput } from '@/shared/components/AppInput';
import { AppSelect } from '@/shared/components/AppSelect';
import { type OrganizerData } from '../../../services/customer-api';
import { type ValidationErrorMap } from '../utils/organizer-validation';

interface Module7Props {
  data: OrganizerData['m7_foreign'];
  updateField: <K extends keyof OrganizerData['m7_foreign']>(field: K, value: OrganizerData['m7_foreign'][K]) => void;
  selectedTaxYear: number;
  errors?: ValidationErrorMap;
  clearError?: (field: string) => void;
}

export const Module7Foreign: React.FC<Module7Props> = ({
  data,
  updateField,
  selectedTaxYear,
  errors = {},
  clearError,
}) => {
  const d = (data || {}) as Partial<OrganizerData['m7_foreign']>;
  const accountsList = d.foreignAccountsList || [];
  const isFbarYes = d.hasFbarOver10k === 'YES' || d.hasFbar || d.spouseFbarOver10k === 'YES';
  const [isOpenAccounts, setIsOpenAccounts] = React.useState<boolean>(false);

  return (
    <div className="space-y-6 font-sans">
      <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs space-y-2">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-rose-900 block text-sm mb-1">Mandatory FBAR &amp; FATCA Reporting Notice:</strong>
            <p className="text-slate-900 leading-relaxed font-medium">
              Report FBAR/FATCA, if your foreign (INDIA) financial accounts, like Bank Accounts/Fixed Deposits/Recurring Accounts/Bonds/Traditional Insurance Policies/Unit Linked Policies/Mutual Funds/Securities, etc., need to report FBAR accounts value over $10,000 and FATCA $50,000-$1,00,000. Non-Reporting FBAR and Non-Filing of FBAR &amp; FATCA will attract CIVIL LEGAL CASES &amp; PENALTIES between $12,921 to $129,210 or 50% of the account balance, whichever is HIGHER!
            </p>
          </div>
        </div>
      </div>

      {/* FBAR / FATCA Questionnaire */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 tracking-tight">
            Primary Taxpayer: Indian Accounts &gt; $10,000 in {selectedTaxYear}?
          </label>
          <AppSelect
            options={[
              { label: 'No - Under $10,000 all year', value: 'NO' },
              { label: 'Yes - Balances exceeded $10,000', value: 'YES' },
            ]}
            value={d.hasFbarOver10k || (d.hasFbar ? 'YES' : 'NO')}
            onChange={(val) => {
              const yes = val === 'YES';
              updateField('hasFbarOver10k', (val || 'NO') as 'YES' | 'NO');
              updateField('hasFbar', yes);
            }}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 tracking-tight">
            Spouse: Indian Accounts &gt; $10,000 in {selectedTaxYear}?
          </label>
          <AppSelect
            options={[
              { label: 'No - Under $10,000 all year', value: 'NO' },
              { label: 'Yes - Balances exceeded $10,000', value: 'YES' },
            ]}
            value={d.spouseFbarOver10k || 'NO'}
            onChange={(val) => updateField('spouseFbarOver10k', (val || 'NO') as 'YES' | 'NO')}
          />
        </div>
      </div>

      {/* Foreign Bank Accounts Worksheet (if FBAR = YES or user adds accounts) */}
      {isFbarYes && (
        !isOpenAccounts ? (
          /* Collapsed State (Default): Heading at left, Add Button at right */
          <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white shadow-2xs">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-emerald-600" />
                  <span>Foreign Bank &amp; Demat Accounts (FinCEN Form 114)</span>
                  {accountsList.length > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      {accountsList.length} Added
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  List each Indian bank account / fixed deposit / demat account held during {selectedTaxYear}
                </p>
              </div>

              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={() => {
                  setIsOpenAccounts(true);
                  if (accountsList.length === 0) {
                    updateField('foreignAccountsList', [
                      {
                        bankName: '',
                        accountType: 'SAVINGS_NRE',
                        accountNumber: '',
                        maxBalanceInr: 0,
                        interestEarnedInr: 0,
                      },
                    ]);
                  }
                }}
                className="text-xs font-bold border-emerald-200 text-[#16A34A] bg-emerald-50 hover:bg-emerald-100 flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{accountsList.length > 0 ? 'View / Edit Foreign Accounts' : 'Add Foreign Account'}</span>
              </Button>
            </div>
          </div>
        ) : (
          /* Open State: Header with Count + Add Button, List of Accounts */
          <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-emerald-600" />
                  <span>Foreign Bank &amp; Demat Accounts (FinCEN Form 114)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                    {accountsList.length} Added
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  List each Indian bank account / fixed deposit / demat account held during {selectedTaxYear}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => {
                    const updated = [
                      ...accountsList,
                      {
                        bankName: '',
                        accountType: 'SAVINGS_NRE',
                        accountNumber: '',
                        maxBalanceInr: 0,
                        interestEarnedInr: 0,
                      },
                    ];
                    updateField('foreignAccountsList', updated);
                  }}
                  className="text-xs font-bold border-emerald-200 text-[#16A34A] bg-emerald-50 hover:bg-emerald-100 flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Another Account</span>
                </Button>
                <button
                  type="button"
                  onClick={() => setIsOpenAccounts(false)}
                  className="text-xs text-slate-600 hover:text-slate-800 font-semibold cursor-pointer px-2 py-1"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {accountsList.map((acc, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-xs font-bold text-slate-800">Account #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const list = accountsList.filter((_, i) => i !== idx);
                        updateField('foreignAccountsList', list);
                      }}
                      className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    <div className="sm:col-span-2">
                      <AppInput
                        label="Bank / Institution Name *"
                        placeholder="e.g. HDFC Bank / SBI / Zerodha"
                        error={errors[`foreignAcc_${idx}_bankName`]}
                        value={acc.bankName || ''}
                        onChange={(e) => {
                          const list = [...accountsList];
                          list[idx].bankName = e.target.value;
                          updateField('foreignAccountsList', list);
                          if (idx === 0) updateField('indianBankName', e.target.value);
                          if (clearError) clearError(`foreignAcc_${idx}_bankName`);
                        }}
                      />
                    </div>

                    <AppSelect
                      label="Account Type"
                      options={[
                        { label: 'NRE Savings Account', value: 'SAVINGS_NRE' },
                        { label: 'NRO Savings Account', value: 'SAVINGS_NRO' },
                        { label: 'Fixed Deposit (FD)', value: 'FIXED_DEPOSIT' },
                        { label: 'Mutual Funds / Portfolio', value: 'MUTUAL_FUNDS' },
                        { label: 'PPF (Public Provident Fund)', value: 'PPF' },
                        { label: 'Demat / Trading Account', value: 'DEMAT' },
                      ]}
                      value={acc.accountType}
                      onChange={(val) => {
                        const list = [...accountsList];
                        list[idx].accountType = val || 'SAVINGS_NRE';
                        updateField('foreignAccountsList', list);
                      }}
                    />

                    <AppInput
                      label="Peak Balance in 2025 (INR ₹)"
                      type="number"
                      placeholder="e.g. 1500000"
                      error={errors[`foreignAcc_${idx}_maxBalanceInr`]}
                      value={acc.maxBalanceInr !== undefined && acc.maxBalanceInr !== null && acc.maxBalanceInr > 0 ? acc.maxBalanceInr.toString() : ''}
                      onChange={(e) => {
                        const list = [...accountsList];
                        list[idx].maxBalanceInr = Math.max(0, parseFloat(e.target.value) || 0);
                        updateField('foreignAccountsList', list);
                        if (clearError) clearError(`foreignAcc_${idx}_maxBalanceInr`);
                      }}
                    />

                    <AppInput
                      label="Interest Earned (INR ₹)"
                      type="number"
                      placeholder="e.g. 65000"
                      value={acc.interestEarnedInr !== undefined && acc.interestEarnedInr !== null && acc.interestEarnedInr > 0 ? acc.interestEarnedInr.toString() : ''}
                      onChange={(e) => {
                        const list = [...accountsList];
                        list[idx].interestEarnedInr = Math.max(0, parseFloat(e.target.value) || 0);
                        updateField('foreignAccountsList', list);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {/* Indian Foreign Income in INR (₹) */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white space-y-4 shadow-2xs">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <Globe className="w-4 h-4 text-indigo-600" />
          <span>Foreign Indian Income Breakdown (Report in INR ₹)</span>
        </h4>
        <p className="text-[11px] text-slate-500">
          The IRS cross-verifies global foreign income. Report your Indian earnings to avoid green card / visa hurdles. Enter 0 or leave empty if no foreign income was earned.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AppInput
            label="Indian Salary Income (INR ₹)"
            type="number"
            placeholder="₹ 0"
            error={errors.foreignSalaryInr}
            value={d.foreignSalaryInr !== undefined && d.foreignSalaryInr !== null && d.foreignSalaryInr > 0 ? d.foreignSalaryInr.toString() : ''}
            onChange={(e) => {
              updateField('foreignSalaryInr', Math.max(0, parseFloat(e.target.value) || 0));
              if (clearError) clearError('foreignSalaryInr');
            }}
          />

          <AppInput
            label="Indian Interest Income (NRE/NRO/FDs ₹)"
            type="number"
            placeholder="e.g. ₹ 85000"
            error={errors.foreignInterestInr}
            value={d.foreignInterestInr !== undefined && d.foreignInterestInr !== null && d.foreignInterestInr > 0 ? d.foreignInterestInr.toString() : ''}
            onChange={(e) => {
              updateField('foreignInterestInr', Math.max(0, parseFloat(e.target.value) || 0));
              if (clearError) clearError('foreignInterestInr');
            }}
          />

          <AppInput
            label="Indian Dividend Income (INR ₹)"
            type="number"
            placeholder="e.g. ₹ 25000"
            error={errors.foreignDividendInr}
            value={d.foreignDividendInr !== undefined && d.foreignDividendInr !== null && d.foreignDividendInr > 0 ? d.foreignDividendInr.toString() : ''}
            onChange={(e) => {
              updateField('foreignDividendInr', Math.max(0, parseFloat(e.target.value) || 0));
              if (clearError) clearError('foreignDividendInr');
            }}
          />

          <AppInput
            label="Indian Rental Income (INR ₹)"
            type="number"
            placeholder="e.g. ₹ 180000"
            error={errors.foreignRentalInr}
            value={d.foreignRentalInr !== undefined && d.foreignRentalInr !== null && d.foreignRentalInr > 0 ? d.foreignRentalInr.toString() : ''}
            onChange={(e) => {
              updateField('foreignRentalInr', Math.max(0, parseFloat(e.target.value) || 0));
              if (clearError) clearError('foreignRentalInr');
            }}
          />

          <AppInput
            label="Other Foreign Income Source"
            placeholder="e.g. Agriculture / Consulting"
            error={errors.otherForeignIncomeSource}
            value={d.otherForeignIncomeSource || ''}
            onChange={(e) => {
              updateField('otherForeignIncomeSource', e.target.value);
              if (clearError) clearError('otherForeignIncomeSource');
            }}
          />

          <AppInput
            label="Foreign Tax Paid / Indian TDS (INR ₹)"
            type="number"
            placeholder="e.g. ₹ 32000"
            error={errors.foreignTaxesPaidInr}
            value={d.foreignTaxesPaidInr !== undefined && d.foreignTaxesPaidInr !== null && d.foreignTaxesPaidInr > 0 ? d.foreignTaxesPaidInr.toString() : ''}
            onChange={(e) => {
              updateField('foreignTaxesPaidInr', Math.max(0, parseFloat(e.target.value) || 0));
              if (clearError) clearError('foreignTaxesPaidInr');
            }}
          />
        </div>
      </div>
    </div>
  );
};
