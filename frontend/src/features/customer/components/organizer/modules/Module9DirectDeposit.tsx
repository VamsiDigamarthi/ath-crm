import React from 'react';
import { Building2, CreditCard, FileText, Gift, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppInput } from '@/shared/components/AppInput';
import { AppSelect } from '@/shared/components/AppSelect';
import { type OrganizerData } from '../../../services/customer-api';

interface Module9Props {
  data: OrganizerData['m9_directDeposit'];
  updateField: <K extends keyof OrganizerData['m9_directDeposit']>(field: K, value: OrganizerData['m9_directDeposit'][K]) => void;
  selectedTaxYear: number;
}

export const Module9DirectDeposit: React.FC<Module9Props> = ({
  data,
  updateField,
}) => {
  return (
    <div className="space-y-6">
      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
        <Building2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
        <div>
          <strong>Direct Deposit of Refund / Auto-Debit of Taxes Due:</strong> Providing your electronic routing &amp; checking account number allows the IRS to send your refund directly within 14-21 days.
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AppInput
          label="Bank Name *"
          placeholder="e.g. JPMorgan Chase Bank, N.A."
          leftIcon={<Building2 className="w-4 h-4" />}
          value={data.bankName || ''}
          onChange={(e) => updateField('bankName', e.target.value)}
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
          value={data.routingNumber || ''}
          onChange={(e) => updateField('routingNumber', e.target.value)}
        />

        <AppInput
          label="Account Number *"
          placeholder="e.g. 849204819"
          leftIcon={<CreditCard className="w-4 h-4" />}
          value={data.accountNumber || ''}
          onChange={(e) => updateField('accountNumber', e.target.value)}
        />

        <div className="sm:col-span-2">
          <AppInput
            label="Account Owner Name (as appears on bank statement) *"
            placeholder="e.g. Naveen Krishnan"
            value={data.accountOwnerName || ''}
            onChange={(e) => updateField('accountOwnerName', e.target.value)}
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
            <label className="text-xs font-semibold text-gray-700 tracking-tight block mb-1">
              Special Notes, Questions or Additional Information
            </label>
            <textarea
              rows={3}
              placeholder="Provide any feedback, special circumstances, or details for the tax preparer..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              value={data.notesToPreparer || ''}
              onChange={(e) => updateField('notesToPreparer', e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <AppInput
              label="Preferred Way & Best Time to Reach You"
              placeholder="e.g. Call after 5:00 PM EST or Email anytime"
              value={data.preferredContactTime || ''}
              onChange={(e) => updateField('preferredContactTime', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* $10 Paid Referral Program Card */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#16A34A] text-white flex items-center justify-center font-bold">
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
              const list = data.referrals || [];
              updateField('referrals', [
                ...list,
                { name: '', email: '', phone: '' },
              ]);
            }}
            className="text-xs font-bold border-emerald-300 text-emerald-800 bg-white hover:bg-emerald-100 flex items-center gap-1 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Referral</span>
          </Button>
        </div>

        {(data.referrals || []).length > 0 && (
          <div className="space-y-2 pt-2">
            {(data.referrals || []).map((refItem, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-white border border-emerald-100 shadow-2xs grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
                <AppInput
                  label="Friend / Colleague Name"
                  placeholder="e.g. Ramesh Kumar"
                  value={refItem.name}
                  onChange={(e) => {
                    const list = [...(data.referrals || [])];
                    list[idx].name = e.target.value;
                    updateField('referrals', list);
                  }}
                />
                <AppInput
                  label="Email Address"
                  placeholder="ramesh@company.com"
                  value={refItem.email}
                  onChange={(e) => {
                    const list = [...(data.referrals || [])];
                    list[idx].email = e.target.value;
                    updateField('referrals', list);
                  }}
                />
                <AppInput
                  label="Phone Number"
                  placeholder="+1 (555) 000-0000"
                  value={refItem.phone}
                  onChange={(e) => {
                    const list = [...(data.referrals || [])];
                    list[idx].phone = e.target.value;
                    updateField('referrals', list);
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const list = (data.referrals || []).filter((_, i) => i !== idx);
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
