import React from 'react';
import { Building2, CreditCard, FileText, Gift, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppInput } from '@/shared/components/AppInput';
import { AppSelect } from '@/shared/components/AppSelect';
import { type OrganizerData } from '../../../services/customer-api';
import { type ValidationErrorMap } from '../utils/organizer-validation';

interface Module9Props {
  data: OrganizerData['m9_directDeposit'];
  updateField: <K extends keyof OrganizerData['m9_directDeposit']>(field: K, value: OrganizerData['m9_directDeposit'][K]) => void;
  selectedTaxYear: number;
  errors?: ValidationErrorMap;
  clearError?: (field: string) => void;
}

export const Module9DirectDeposit: React.FC<Module9Props> = ({
  data,
  updateField,
  errors = {},
  clearError,
}) => {
  const referrals = data.referrals || [];

  return (
    <div className="space-y-6 font-sans">
      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
        <Building2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
        <div>
          <strong>Direct Deposit of Refund / Auto-Debit of Taxes Due:</strong> Providing your electronic routing &amp; checking account number allows the IRS to send your refund directly within 14-21 days.
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AppInput
          label="Bank Name *"
          placeholder="e.g. JPMorgan Chase / Bank of America / Wells Fargo"
          leftIcon={<Building2 className="w-4 h-4" />}
          error={errors.bankName}
          value={data.bankName || ''}
          onChange={(e) => {
            updateField('bankName', e.target.value);
            if (clearError) clearError('bankName');
          }}
        />

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 tracking-tight">Account Type *</label>
          <AppSelect
            options={[
              { label: 'Checking Account', value: 'CHECKING' },
              { label: 'Savings Account', value: 'SAVINGS' },
            ]}
            value={data.accountType || 'CHECKING'}
            onChange={(val) => updateField('accountType', val || 'CHECKING')}
          />
        </div>

        <AppInput
          label="9-Digit Routing Number (Electronic Only) *"
          placeholder="e.g. 111000614"
          leftIcon={<CreditCard className="w-4 h-4" />}
          error={errors.routingNumber}
          value={data.routingNumber || ''}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, '').slice(0, 9);
            updateField('routingNumber', raw);
            if (clearError) clearError('routingNumber');
          }}
        />

        <AppInput
          label="Account Number *"
          placeholder="e.g. 849204819"
          leftIcon={<CreditCard className="w-4 h-4" />}
          error={errors.accountNumber}
          value={data.accountNumber || ''}
          onChange={(e) => {
            updateField('accountNumber', e.target.value);
            if (clearError) clearError('accountNumber');
          }}
        />

        <div className="sm:col-span-2">
          <AppInput
            label="Account Owner Name (as appears on bank statement) *"
            placeholder="e.g. Taxpayer Full Name"
            error={errors.accountOwnerName}
            value={data.accountOwnerName || ''}
            onChange={(e) => {
              updateField('accountOwnerName', e.target.value);
              if (clearError) clearError('accountOwnerName');
            }}
          />
        </div>
      </div>

      {/* Notes to Tax Preparer */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-indigo-600" />
          <span>Notes to Tax Preparer &amp; Contact Preference</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-700 tracking-tight">
                Special Notes, Questions or Additional Information
              </label>
              <span
                className={`text-[11px] font-mono transition-colors ${
                  (data.notesToPreparer || '').length > 5000
                    ? 'text-rose-600 font-extrabold'
                    : (data.notesToPreparer || '').length > 4500
                    ? 'text-amber-600 font-bold'
                    : 'text-slate-400'
                }`}
              >
                {(data.notesToPreparer || '').length} / 5,000 chars
              </span>
            </div>

            <textarea
              rows={4}
              placeholder="Provide any feedback, special circumstances, or details for the tax preparer..."
              className={`w-full px-3.5 py-2.5 text-xs border rounded-xl transition-all focus:outline-none leading-relaxed ${
                errors.notesToPreparer || (data.notesToPreparer || '').length > 5000
                  ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/20 text-slate-900'
                  : 'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 bg-white text-slate-900'
              }`}
              value={data.notesToPreparer || ''}
              onChange={(e) => {
                updateField('notesToPreparer', e.target.value);
                if (clearError) clearError('notesToPreparer');
              }}
            />

            {errors.notesToPreparer && (
              <p className="text-xs font-bold text-rose-600 mt-1.5 flex items-center gap-1.5 animate-fadeIn">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0"></span>
                <span>{errors.notesToPreparer}</span>
              </p>
            )}
            {(data.notesToPreparer || '').length > 5000 && !errors.notesToPreparer && (
              <p className="text-xs font-bold text-rose-600 mt-1.5 flex items-center gap-1.5 animate-fadeIn">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0"></span>
                <span>Maximum 5,000 characters allowed. Please shorten your note.</span>
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-700 tracking-tight">
                Preferred Way &amp; Best Time to Reach You
              </label>
              <span
                className={`text-[11px] font-mono transition-colors ${
                  (data.preferredContactTime || '').length > 500
                    ? 'text-rose-600 font-extrabold'
                    : 'text-slate-400'
                }`}
              >
                {(data.preferredContactTime || '').length} / 500 chars
              </span>
            </div>

            <AppInput
              placeholder="e.g. Call after 5:00 PM EST or Email anytime"
              error={errors.preferredContactTime}
              value={data.preferredContactTime || ''}
              onChange={(e) => {
                updateField('preferredContactTime', e.target.value);
                if (clearError) clearError('preferredContactTime');
              }}
            />
          </div>
        </div>
      </div>

      {/* $10 Paid Referral Program Card */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 space-y-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#16A34A] text-white flex items-center justify-center font-bold shrink-0">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                Earn $10 for Every Friend / Colleague You Refer! 🎁
              </h4>
              <p className="text-[11px] text-slate-600">
                Share your colleagues&apos; or friends&apos; contact details. When they file with us, we will honor you with $10 per paid referral.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const list = [...referrals, { name: '', email: '', phone: '' }];
              updateField('referrals', list);
            }}
            className="text-xs font-bold border-emerald-300 text-emerald-800 bg-white hover:bg-emerald-100 flex items-center gap-1 shadow-2xs shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Referral</span>
          </Button>
        </div>

        {referrals.length > 0 && (
          <div className="space-y-2 pt-2">
            {referrals.map((refItem, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-white border border-emerald-100 shadow-2xs grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
                <AppInput
                  label="Friend / Colleague Name"
                  placeholder="e.g. Ramesh Kumar"
                  error={errors[`ref_${idx}_name`]}
                  value={refItem.name || ''}
                  onChange={(e) => {
                    const list = [...referrals];
                    list[idx].name = e.target.value;
                    updateField('referrals', list);
                    if (clearError) clearError(`ref_${idx}_name`);
                  }}
                />
                <AppInput
                  label="Email Address"
                  placeholder="e.g. name@company.com"
                  error={errors[`ref_${idx}_email`]}
                  value={refItem.email || ''}
                  onChange={(e) => {
                    const list = [...referrals];
                    list[idx].email = e.target.value;
                    updateField('referrals', list);
                    if (clearError) clearError(`ref_${idx}_email`);
                  }}
                />
                <AppInput
                  label="Phone Number"
                  placeholder="e.g. (555) 000-0000"
                  error={errors[`ref_${idx}_phone`]}
                  value={refItem.phone || ''}
                  onChange={(e) => {
                    const list = [...referrals];
                    list[idx].phone = e.target.value;
                    updateField('referrals', list);
                    if (clearError) clearError(`ref_${idx}_phone`);
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const list = referrals.filter((_, i) => i !== idx);
                    updateField('referrals', list);
                  }}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold border border-slate-200 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audit Substantiation Disclaimer */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 font-medium leading-relaxed">
        <strong>IRS Audit Substantiation Notice:</strong> In case of an IRS or State tax audit, the taxpayer must provide the necessary documentation and receipts as per IRS guidelines to substantiate all income, credits, and deductions claimed on this return.
      </div>
    </div>
  );
};
