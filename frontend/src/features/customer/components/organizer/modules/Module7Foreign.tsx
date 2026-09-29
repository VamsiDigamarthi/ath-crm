import React from 'react';
import {
  AlertTriangle,
  Plus,
  Trash2,
  Landmark,
  UserCheck,
  FileText,
  Coins,
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppInput } from '@/shared/components/AppInput';
import { AppSelect } from '@/shared/components/AppSelect';
import { AppAccordion, AppAccordionItem } from '@/shared/components/AppAccordion';
import { type OrganizerData } from '../../../services/customer-api';
import { type ValidationErrorMap } from '../utils/organizer-validation';

interface Module7Props {
  data: OrganizerData['m7_foreign'];
  updateField: <K extends keyof OrganizerData['m7_foreign']>(field: K, value: OrganizerData['m7_foreign'][K]) => void;
  selectedTaxYear: number;
  m1Data?: OrganizerData['m1_demographics'];
  m2Data?: OrganizerData['m2_dependents'];
  b1Data?: OrganizerData['b1_companyInfo'];
  errors?: ValidationErrorMap;
  clearError?: (field: string) => void;
}

const ACCOUNT_TYPE_OPTIONS = [
  { label: 'Bank - Savings Account', value: 'SAVINGS' },
  { label: 'Bank - Current / Checking Account', value: 'CHECKING' },
  { label: 'Bank - Fixed Deposit (FD) / Time Deposit', value: 'FIXED_DEPOSIT' },
  { label: 'Bank - Recurring Deposit (RD)', value: 'RECURRING_DEPOSIT' },
  { label: 'Securities - Demat / Trading / Brokerage Account', value: 'SECURITIES_DEMAT' },
  { label: 'Other - Mutual Funds / Portfolio', value: 'MUTUAL_FUNDS' },
  { label: 'Other - Life Insurance / Annuity with Cash Value', value: 'LIFE_INSURANCE' },
  { label: 'Other - Public Provident Fund (PPF / EPF / Pension)', value: 'PROVIDENT_FUND' },
  { label: 'Other - Custom Account Type', value: 'OTHER' },
];

const CURRENCY_OPTIONS = [
  { label: 'INR - Indian Rupee (₹)', value: 'INR' },
  { label: 'USD - United States Dollar ($)', value: 'USD' },
  { label: 'EUR - Euro (€)', value: 'EUR' },
  { label: 'GBP - British Pound (£)', value: 'GBP' },
  { label: 'CAD - Canadian Dollar (C$)', value: 'CAD' },
  { label: 'AUD - Australian Dollar (A$)', value: 'AUD' },
  { label: 'SGD - Singapore Dollar (S$)', value: 'SGD' },
  { label: 'AED - UAE Dirham', value: 'AED' },
  { label: 'Other Currency', value: 'OTHER' },
];

const OWNER_TYPE_OPTIONS = [
  { label: 'Taxpayer (Separately Owned - FinCEN Part II)', value: 'TAXPAYER' },
  { label: 'Spouse (Separately Owned - FinCEN Part II)', value: 'SPOUSE' },
  { label: 'Jointly Owned with Spouse (FinCEN Part III)', value: 'JOINT_SPOUSE' },
  { label: 'Jointly Owned with Other Person (FinCEN Part III)', value: 'JOINT_OTHER' },
  { label: 'Signature Authority Only - No Financial Interest (FinCEN Part IV)', value: 'SIGNATURE_ONLY' },
];

export const Module7Foreign: React.FC<Module7Props> = ({
  data,
  updateField,
  selectedTaxYear,
  m1Data,
  m2Data,
  b1Data,
  errors = {},
  clearError,
}) => {
  const d = (data || {}) as Partial<OrganizerData['m7_foreign']>;
  const accountsList = d.foreignAccountsList || [];

  // Filer Information derivation from m1 and m2
  const m1 = m1Data || ({} as Partial<OrganizerData['m1_demographics']>);
  const m2 = m2Data || ({} as Partial<OrganizerData['m2_dependents']>);

  const taxpayerFirstName = m1.firstName || (m1.fullName ? m1.fullName.split(' ')[0] : '');
  const taxpayerMiddleName = m1.middleName || '';
  const taxpayerLastName = m1.lastName || (m1.fullName ? m1.fullName.split(' ').slice(1).join(' ') : '');
  const taxpayerDob = m1.dob || '-';
  const taxpayerSsn = m1.ssnMasked || '***-**-****';
  const taxpayerEmail = m1.email || '-';
  const taxpayerPhone = m1.phone || '-';
  const taxpayerAddress = [m1.residentialAddress, m1.city, m1.state, m1.zipCode].filter(Boolean).join(', ') || '-';
  const maritalStatus = m1.maritalStatus || 'Single';

  const isMarried = maritalStatus.toLowerCase().includes('married') || m2.hasSpouse || Boolean(m2.spouseName || m2.spouseFirstName);
  const spouseFirstName = m2.spouseFirstName || (m2.spouseName ? m2.spouseName.split(' ')[0] : '');
  const spouseMiddleName = m2.spouseMiddleName || '';
  const spouseLastName = m2.spouseLastName || (m2.spouseName ? m2.spouseName.split(' ').slice(1).join(' ') : '');
  const spouseDob = m2.spouseDob || (isMarried ? 'On file' : 'N/A - Unmarried');
  const spouseSsn = m2.spouseSsn || (isMarried ? '***-**-****' : 'N/A - Unmarried');
  const spouseEmail = m2.spouseEmail || (isMarried ? taxpayerEmail : 'N/A - Unmarried');
  const spousePhone = m2.spouseWorkPhone || (isMarried ? taxpayerPhone : 'N/A - Unmarried');
  const spouseAddress = isMarried ? taxpayerAddress : 'N/A - Unmarried';

  // Exchange rate heuristic: 1 USD ~ 84 INR for estimated peak conversion
  const computeUsd = (val: number, curr: string) => {
    if (!val || val <= 0) return 0;
    if (curr === 'USD') return val;
    if (curr === 'INR') return Math.round((val / 84) * 100) / 100;
    return val;
  };

  const handleAccountChange = (idx: number, field: string, val: any) => {
    const list = accountsList.map((acc, i) => {
      if (i !== idx) return acc;
      const updated: any = { ...acc, [field]: val };
      if (field === 'maxValue' || field === 'currencyType') {
        const amount = field === 'maxValue' ? (parseFloat(val) || 0) : (updated.maxValue || updated.maxBalanceInr || 0);
        const curr = field === 'currencyType' ? val : (updated.currencyType || 'INR');
        updated.maxValue = amount;
        updated.maxBalanceInr = amount;
        updated.maxValueUsd = computeUsd(amount, curr);
      }
      if (field === 'institutionName') {
        updated.bankName = val;
      }
      return updated;
    });
    updateField('foreignAccountsList', list);
    if (clearError) clearError(`foreignAcc_${idx}_${field}`);
  };

  const handleAddAccount = () => {
    const newAccount: any = {
      ownerType: 'TAXPAYER',
      institutionName: '',
      bankName: '',
      accountType: 'SAVINGS',
      otherAccountTypeDesc: '',
      accountNumber: '',
      currencyType: 'INR',
      maxValue: 0,
      maxBalanceInr: 0,
      maxValueUsd: 0,
      interestEarned: 0,
      interestEarnedInr: 0,
      dividendEarned: 0,
      branchAddress: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      jointOwnersCount: 0,
      jointOwnerName: '',
      jointOwnerRelationship: '',
      jointOwnerTin: '',
      jointOwnerAddress: '',
    };
    updateField('foreignAccountsList', [...accountsList, newAccount]);
  };

  const handleRemoveAccount = (idx: number) => {
    const list = accountsList.filter((_, i) => i !== idx);
    updateField('foreignAccountsList', list);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 1. TOP CLOSABLE ACCORDION: Filer Information (Self & Spouse) - Open by Default */}
      <AppAccordion defaultOpenIndex={0} allowMultiple={true}>
        <AppAccordionItem
          index={0}
          title="Filer Information (Self & Spouse)"
          subtitle="Pre-populated identity, SSN/ITIN & address details for FinCEN Form 114 & Form 8938"
          icon={<UserCheck className="w-4 h-4 text-[#16A34A]" />}
          defaultOpen={true}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-700">
                Information on Financial Account(s) Owned Separately / Jointly
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                Status: <strong className="text-emerald-700">{maritalStatus}</strong>
              </span>
            </div>

            {/* Table of Self & Spouse Details matching FBAR & FATCA Form.docx */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3 w-1/3 bg-slate-100 text-slate-800">Particulars</th>
                    <th className="p-3 w-1/3 bg-emerald-50/80 text-emerald-950 border-l border-slate-200">
                      Primary Taxpayer (Self)
                    </th>
                    <th className="p-3 w-1/3 bg-indigo-50/80 text-indigo-950 border-l border-slate-200">
                      Spouse {isMarried ? '' : '(N/A)'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  <tr className="hover:bg-slate-50/60">
                    <td className="p-2.5 font-medium text-slate-700">First Name (as per SSN)</td>
                    <td className="p-2.5 border-l border-slate-200 font-semibold text-slate-900">{taxpayerFirstName || '-'}</td>
                    <td className="p-2.5 border-l border-slate-200 text-slate-700">{spouseFirstName || (isMarried ? '-' : 'N/A')}</td>
                  </tr>
                  <tr className="hover:bg-slate-50/60">
                    <td className="p-2.5 font-medium text-slate-700">Middle Name (as per SSN)</td>
                    <td className="p-2.5 border-l border-slate-200 text-slate-800">{taxpayerMiddleName || '-'}</td>
                    <td className="p-2.5 border-l border-slate-200 text-slate-700">{spouseMiddleName || (isMarried ? '-' : 'N/A')}</td>
                  </tr>
                  <tr className="hover:bg-slate-50/60">
                    <td className="p-2.5 font-medium text-slate-700">Last Name (as per SSN)</td>
                    <td className="p-2.5 border-l border-slate-200 font-semibold text-slate-900">{taxpayerLastName || '-'}</td>
                    <td className="p-2.5 border-l border-slate-200 text-slate-700">{spouseLastName || (isMarried ? '-' : 'N/A')}</td>
                  </tr>
                  <tr className="hover:bg-slate-50/60">
                    <td className="p-2.5 font-medium text-slate-700">Date of Birth (MM/DD/YYYY)</td>
                    <td className="p-2.5 border-l border-slate-200 font-mono text-slate-800">{taxpayerDob}</td>
                    <td className="p-2.5 border-l border-slate-200 font-mono text-slate-700">{spouseDob}</td>
                  </tr>
                  <tr className="hover:bg-slate-50/60">
                    <td className="p-2.5 font-medium text-slate-700">SSN / ITIN</td>
                    <td className="p-2.5 border-l border-slate-200 font-mono text-slate-800">{taxpayerSsn}</td>
                    <td className="p-2.5 border-l border-slate-200 font-mono text-slate-700">{spouseSsn}</td>
                  </tr>
                  <tr className="hover:bg-slate-50/60">
                    <td className="p-2.5 font-medium text-slate-700">E-mail Address</td>
                    <td className="p-2.5 border-l border-slate-200 text-slate-800">{taxpayerEmail}</td>
                    <td className="p-2.5 border-l border-slate-200 text-slate-700">{spouseEmail}</td>
                  </tr>
                  <tr className="hover:bg-slate-50/60">
                    <td className="p-2.5 font-medium text-slate-700">Mobile Number</td>
                    <td className="p-2.5 border-l border-slate-200 text-slate-800">{taxpayerPhone}</td>
                    <td className="p-2.5 border-l border-slate-200 text-slate-700">{spousePhone}</td>
                  </tr>
                  <tr className="hover:bg-slate-50/60">
                    <td className="p-2.5 font-medium text-slate-700">Mandatory: Current Address with ZIP</td>
                    <td className="p-2.5 border-l border-slate-200 text-slate-800">{taxpayerAddress}</td>
                    <td className="p-2.5 border-l border-slate-200 text-slate-700">{spouseAddress}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* If Business return, show company reference info */}
            {b1Data && (
              <div className="p-3 bg-slate-50 rounded-md border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">Business Entity: </span>
                  <span className="text-slate-700">{b1Data.businessName || 'Registered Business'}</span>
                  {b1Data.ein && <span className="ml-2 font-mono text-slate-500">(EIN: {b1Data.ein})</span>}
                </div>
                <span className="text-[11px] text-slate-500">{b1Data.state || ''} • Form {b1Data.entityType || '1120-S'}</span>
              </div>
            )}
          </div>
        </AppAccordionItem>
      </AppAccordion>

      {/* 2. ATH Tax Services - Compliance & Penalty Notice */}
      <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 text-xs space-y-2.5">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <strong className="text-rose-950 font-bold text-sm">
                ATH Tax Services, Inc. • Mandatory FBAR &amp; FATCA Compliance Report
              </strong>
              <span className="text-[10px] px-2 py-0.5 bg-rose-100 text-rose-800 font-bold rounded">
                Calendar Year Ended 12/31/{selectedTaxYear}
              </span>
            </div>
            <p className="text-slate-800 leading-relaxed font-medium">
              <strong>FBAR (FinCEN Form 114):</strong> Must be filed by U.S. persons with foreign financial accounts totaling over $10,000 at any point during {selectedTaxYear}. Filed separately from Form 1040 via FinCEN BSA E-Filing.
            </p>
            <p className="text-slate-800 leading-relaxed font-medium">
              <strong>FATCA (Form 8938):</strong> Requires reporting foreign financial assets if total value exceeds $50,000 for Single filers ($100,000 for Married Filing Jointly) on the last day of the tax year, or $75,000 Single ($150,000 Married) at any time.
            </p>
            <p className="text-rose-900 font-bold leading-relaxed pt-0.5">
              ⚠️ Non-Reporting of FBAR &amp; FATCA attracts civil legal cases &amp; statutory penalties between $12,921 to $129,210 or 50% of the account balance, whichever is HIGHER! All foreign interest, dividends, rents, and capital gains must also be reported.
            </p>
          </div>
        </div>
      </div>

      {/* 3. FBAR & FATCA Questionnaire */}
      <div className="p-4 rounded-md border border-slate-200 bg-white space-y-4">
        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider border-b border-slate-100 pb-2">
          <FileText className="w-4 h-4 text-[#16A34A]" />
          <span>FBAR &amp; FATCA Filing Determination ({selectedTaxYear})</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 tracking-tight">
              Primary Taxpayer: Foreign Accounts &gt; $10k in {selectedTaxYear}? *
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
              Spouse: Foreign Accounts &gt; $10k in {selectedTaxYear}?
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

          {/* FATCA Question from Note.txt: Do you need Fatca to be filed ? question (single > 50k usd) (married > 100k usd) */}
          <div className="space-y-1 sm:col-span-2 lg:col-span-1">
            <label className="text-xs font-semibold text-gray-700 tracking-tight flex items-center gap-1">
              <span>Do you need FATCA to be filed? *</span>
              <span className="text-[10px] text-slate-400 font-normal">(&gt;$50k Single / &gt;$100k Married)</span>
            </label>
            <AppSelect
              options={[
                { label: 'No - Below FATCA asset threshold', value: 'NO' },
                { label: 'Yes - Foreign assets exceed threshold (Form 8938)', value: 'YES' },
              ]}
              value={d.needsFatcaFiling || d.hasFatcaOver50k || 'NO'}
              onChange={(val) => {
                const choice = (val || 'NO') as 'YES' | 'NO';
                updateField('needsFatcaFiling', choice);
                updateField('hasFatcaOver50k', choice);
              }}
            />
          </div>
        </div>
      </div>

      {/* 4. DYNAMIC MULTIPLY-ADDABLE TABLES: Report of Foreign Bank and Financial Accounts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div>
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
              <Landmark className="w-4 h-4 text-emerald-600" />
              <span>Report of Foreign Bank and Financial Accounts</span>
              {accountsList.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-[#16A34A] font-bold border border-emerald-200">
                  {accountsList.length} Account{accountsList.length > 1 ? 's' : ''} Added
                </span>
              )}
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Complete each section in its entirety for all reportable foreign bank accounts, fixed deposits, securities &amp; provident funds ({selectedTaxYear})
            </p>
          </div>

          <Button
            size="sm"
            type="button"
            onClick={handleAddAccount}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-medium px-3 py-1.5 rounded-md flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Another Account</span>
          </Button>
        </div>

        {accountsList.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-300 rounded-lg bg-slate-50/50 space-y-2">
            <Landmark className="w-6 h-6 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-700 font-semibold">No foreign financial accounts reported</p>
            <p className="text-[11px] text-slate-400 max-w-md mx-auto">
              If you held Indian savings, fixed deposits, demat, mutual funds, or other foreign accounts during {selectedTaxYear}, click below to report each account.
            </p>
            <Button
              size="sm"
              type="button"
              onClick={handleAddAccount}
              className="mt-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-medium px-3.5 py-1.5 rounded-md inline-flex items-center gap-1 cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Foreign Account</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {accountsList.map((acc, idx) => {
              const peakValue = acc.maxValue !== undefined ? acc.maxValue : (acc.maxBalanceInr || 0);
              const curr = acc.currencyType || 'INR';
              const usdVal = acc.maxValueUsd !== undefined ? acc.maxValueUsd : computeUsd(peakValue, curr);
              const isOtherAccountType = acc.accountType === 'OTHER';
              const hasJointOwners = acc.ownerType?.includes('JOINT') || Number(acc.jointOwnersCount || 0) > 0;

              return (
                <div
                  key={idx}
                  className="p-4 sm:p-5 rounded-lg border border-slate-200 bg-white shadow-2xs space-y-4 hover:border-slate-300 transition-colors"
                >
                  {/* Account Header with Index and Delete */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                        Foreign Account #{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {acc.institutionName || acc.bankName || 'New Foreign Account'}
                      </span>
                      {acc.accountNumber && (
                        <span className="text-[11px] font-mono text-slate-500">
                          (Acct: ••••{acc.accountNumber.slice(-4)})
                        </span>
                      )}
                      {peakValue > 0 && (
                        <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                          Peak: {curr === 'INR' ? '₹' : curr} {peakValue.toLocaleString()} (~${usdVal.toLocaleString()})
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveAccount(idx)}
                      className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1 cursor-pointer transition-colors p-1"
                      title="Remove Account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>

                  {/* Grid 1: Particulars / Ownership & Account Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700 tracking-tight">
                        Particulars / Account Ownership *
                      </label>
                      <AppSelect
                        options={OWNER_TYPE_OPTIONS}
                        value={acc.ownerType || 'TAXPAYER'}
                        onChange={(val) => handleAccountChange(idx, 'ownerType', val || 'TAXPAYER')}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700 tracking-tight">
                        Type of Account (BSA Item 16) *
                      </label>
                      <AppSelect
                        options={ACCOUNT_TYPE_OPTIONS}
                        value={acc.accountType || 'SAVINGS'}
                        onChange={(val) => handleAccountChange(idx, 'accountType', val || 'SAVINGS')}
                      />
                    </div>

                    {isOtherAccountType ? (
                      <AppInput
                        label="Specify Other Account Type *"
                        placeholder="e.g. Foreign Pension / Gold Deposit"
                        value={acc.otherAccountTypeDesc || ''}
                        onChange={(e) => handleAccountChange(idx, 'otherAccountTypeDesc', e.target.value)}
                      />
                    ) : (
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-700 tracking-tight">
                          Number of Joint Owners
                        </label>
                        <AppSelect
                          options={[
                            { label: 'None (Sole Owner)', value: '0' },
                            { label: '1 Joint Owner', value: '1' },
                            { label: '2 Joint Owners', value: '2' },
                            { label: '3+ Joint Owners', value: '3' },
                          ]}
                          value={String(acc.jointOwnersCount ?? '0')}
                          onChange={(val) => handleAccountChange(idx, 'jointOwnersCount', parseInt(val || '0', 10))}
                        />
                      </div>
                    )}
                  </div>

                  {/* Grid 2: Institution Name & Account Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <AppInput
                      label="Financial Institution Name * (e.g. ICICI, HDFC, SBI)"
                      placeholder="e.g. ICICI Bank"
                      error={errors[`foreignAcc_${idx}_bankName`] || errors[`foreignAcc_${idx}_institutionName`]}
                      value={acc.institutionName || acc.bankName || ''}
                      onChange={(e) => handleAccountChange(idx, 'institutionName', e.target.value)}
                    />

                    <AppInput
                      label="Account Number / Identification *"
                      placeholder="e.g. 059801528386"
                      error={errors[`foreignAcc_${idx}_accountNumber`]}
                      value={acc.accountNumber || ''}
                      onChange={(e) => handleAccountChange(idx, 'accountNumber', e.target.value)}
                    />
                  </div>

                  {/* Grid 3: Maximum Value, Currency, USD & Interest */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700 tracking-tight">
                        Currency Type *
                      </label>
                      <AppSelect
                        options={CURRENCY_OPTIONS}
                        value={curr}
                        onChange={(val) => handleAccountChange(idx, 'currencyType', val || 'INR')}
                      />
                    </div>

                    <AppInput
                      label={`Maximum Account Value (${curr}) *`}
                      type="number"
                      placeholder="e.g. 1000000"
                      error={errors[`foreignAcc_${idx}_maxBalanceInr`] || errors[`foreignAcc_${idx}_maxValue`]}
                      value={peakValue > 0 ? peakValue.toString() : ''}
                      onChange={(e) => handleAccountChange(idx, 'maxValue', e.target.value)}
                    />

                    <AppInput
                      label="Converted Peak Value in USD ($)"
                      type="number"
                      placeholder="e.g. 11904.76"
                      value={usdVal > 0 ? usdVal.toString() : ''}
                      onChange={(e) => handleAccountChange(idx, 'maxValueUsd', parseFloat(e.target.value) || 0)}
                    />

                    <AppInput
                      label={`Interest / Dividend Earned (${curr})`}
                      type="number"
                      placeholder="e.g. 45000"
                      value={acc.interestEarned || acc.interestEarnedInr ? (acc.interestEarned || acc.interestEarnedInr)?.toString() : ''}
                      onChange={(e) => {
                        const amt = parseFloat(e.target.value) || 0;
                        handleAccountChange(idx, 'interestEarned', amt);
                        handleAccountChange(idx, 'interestEarnedInr', amt);
                      }}
                    />
                  </div>

                  {/* Grid 4: Branch / Account Address as required by FinCEN and docx */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div className="sm:col-span-2">
                      <AppInput
                        label="Account / Branch Address *"
                        placeholder="e.g. MINDSPACE, HYDERABAD BRANCH, RAHEJA IT PARK"
                        value={acc.branchAddress || ''}
                        onChange={(e) => handleAccountChange(idx, 'branchAddress', e.target.value)}
                      />
                    </div>

                    <AppInput
                      label="City *"
                      placeholder="e.g. Hyderabad / Secunderabad"
                      value={acc.city || ''}
                      onChange={(e) => handleAccountChange(idx, 'city', e.target.value)}
                    />

                    <AppInput
                      label="State / Province"
                      placeholder="e.g. Telangana / Maharashtra"
                      value={acc.state || ''}
                      onChange={(e) => handleAccountChange(idx, 'state', e.target.value)}
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <AppInput
                        label="PIN / Zip"
                        placeholder="500033"
                        value={acc.postalCode || ''}
                        onChange={(e) => handleAccountChange(idx, 'postalCode', e.target.value)}
                      />
                      <AppInput
                        label="Country"
                        placeholder="India"
                        value={acc.country || 'India'}
                        onChange={(e) => handleAccountChange(idx, 'country', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Joint Owner Details Section (if Joint Ownership selected or count > 0) */}
                  {hasJointOwners && (
                    <div className="p-3.5 bg-indigo-50/50 rounded-md border border-indigo-100 space-y-3">
                      <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider block">
                        Principal Joint Owner Details (FinCEN Form 114 Part III)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <AppInput
                          label="Joint Owner Full Name"
                          placeholder={isMarried ? (spouseFirstName ? `${spouseFirstName} ${spouseLastName}` : 'Spouse Name') : 'Joint Owner Name'}
                          value={acc.jointOwnerName || ''}
                          onChange={(e) => handleAccountChange(idx, 'jointOwnerName', e.target.value)}
                        />
                        <AppInput
                          label="Relationship to Filer"
                          placeholder="e.g. Spouse / Parent / Brother"
                          value={acc.jointOwnerRelationship || (acc.ownerType === 'JOINT_SPOUSE' ? 'Spouse' : '')}
                          onChange={(e) => handleAccountChange(idx, 'jointOwnerRelationship', e.target.value)}
                        />
                        <AppInput
                          label="Joint Owner TIN / PAN / SSN (Optional)"
                          placeholder="e.g. ABCDE1234F"
                          value={acc.jointOwnerTin || ''}
                          onChange={(e) => handleAccountChange(idx, 'jointOwnerTin', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Indian Foreign Income Breakdown (in INR ₹) */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-emerald-600" />
            <span>Foreign Indian Income Breakdown (Report in INR ₹)</span>
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            The IRS requires full global income disclosure. Report Indian earnings (Salary, Interest, Dividends, Rental, Taxes Paid). Leave 0 if none.
          </p>
        </div>

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
            placeholder="e.g. Agriculture / Royalties / Consulting"
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

      {/* 6. Notes to Tax Preparer (from FBAR & FATCA Form.docx) */}
      <div className="space-y-2 pt-4 border-t border-slate-200">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
          Notes to Tax Preparer
        </label>
        <p className="text-[11px] text-slate-500">
          Mention additional information, service improvement, the best way and time to reach you, or any kind of feedback or expectation.
        </p>
        <textarea
          rows={3}
          placeholder="Enter notes or specific details for your tax preparer regarding your foreign accounts or taxes..."
          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A] bg-white text-slate-800"
          value={d.notesToPreparer || ''}
          onChange={(e) => updateField('notesToPreparer', e.target.value)}
        />
      </div>
    </div>
  );
};
