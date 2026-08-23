import React from 'react';
import { AlertTriangle, Globe } from 'lucide-react';
import { AppInput } from '@/shared/components/AppInput';
import { AppSelect } from '@/shared/components/AppSelect';
import { type OrganizerData } from '../../../services/customer-api';

interface Module7Props {
  data: OrganizerData['m7_foreign'];
  updateField: <K extends keyof OrganizerData['m7_foreign']>(field: K, value: OrganizerData['m7_foreign'][K]) => void;
  selectedTaxYear: number;
}

export const Module7Foreign: React.FC<Module7Props> = ({
  data,
  updateField,
  selectedTaxYear,
}) => {
  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-2">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-rose-900 block text-sm">Mandatory FBAR &amp; FATCA Reporting Notice:</strong>
            If your aggregate foreign Indian accounts (Bank/Fixed Deposits/Bonds/Mutual Funds) exceeded <strong>$10,000</strong> (FBAR FinCEN 114) or <strong>$50,000</strong> (FATCA Form 8938) at any time during {selectedTaxYear}, reporting is legally mandatory. Non-reporting attracts civil penalties between <strong>$12,921 to $129,210</strong> or 50% of account balance!
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
              { label: 'Yes - Balances exceeded $10,000', value: 'YES' },
              { label: 'No - Under $10,000 all year', value: 'NO' },
            ]}
            value={data.hasFbarOver10k || (data.hasFbar ? 'YES' : 'NO')}
            onChange={(val) => {
              updateField('hasFbarOver10k', (val || 'NO') as 'YES' | 'NO');
              updateField('hasFbar', val === 'YES');
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
            value={data.spouseFbarOver10k || 'NO'}
            onChange={(val) => updateField('spouseFbarOver10k', (val || 'NO') as 'YES' | 'NO')}
          />
        </div>
      </div>

      {/* Indian Foreign Income in INR (₹) */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-indigo-600" />
          <span>Foreign Indian Income Breakdown (Report in INR ₹)</span>
        </h4>
        <p className="text-[11px] text-slate-500">The IRS cross-verifies global foreign income. Report your Indian earnings to avoid green card / visa hurdles.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AppInput
            label="Indian Salary Income (INR ₹)"
            type="number"
            placeholder="₹ 0"
            value={data.foreignSalaryInr ? data.foreignSalaryInr.toString() : ''}
            onChange={(e) => updateField('foreignSalaryInr', parseFloat(e.target.value) || 0)}
          />

          <AppInput
            label="Indian Interest Income (NRE/NRO/FDs ₹)"
            type="number"
            placeholder="e.g. ₹ 85000"
            value={data.foreignInterestInr ? data.foreignInterestInr.toString() : ''}
            onChange={(e) => updateField('foreignInterestInr', parseFloat(e.target.value) || 0)}
          />

          <AppInput
            label="Indian Dividend Income (INR ₹)"
            type="number"
            placeholder="e.g. ₹ 25000"
            value={data.foreignDividendInr ? data.foreignDividendInr.toString() : ''}
            onChange={(e) => updateField('foreignDividendInr', parseFloat(e.target.value) || 0)}
          />

          <AppInput
            label="Indian Rental Income (INR ₹)"
            type="number"
            placeholder="e.g. ₹ 180000"
            value={data.foreignRentalInr ? data.foreignRentalInr.toString() : ''}
            onChange={(e) => updateField('foreignRentalInr', parseFloat(e.target.value) || 0)}
          />

          <AppInput
            label="Other Foreign Income Source"
            placeholder="e.g. Agriculture / Consulting"
            value={data.otherForeignIncomeSource || ''}
            onChange={(e) => updateField('otherForeignIncomeSource', e.target.value)}
          />

          <AppInput
            label="Foreign Tax Paid / Indian TDS (INR ₹)"
            type="number"
            placeholder="e.g. ₹ 32000"
            value={data.foreignTaxesPaidInr ? data.foreignTaxesPaidInr.toString() : ''}
            onChange={(e) => updateField('foreignTaxesPaidInr', parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>
    </div>
  );
};
