import React from 'react';
import { Building2, Eye, EyeOff, FileText, Gift, Clock, CreditCard } from 'lucide-react';
import { AppCopyButton } from '@/shared/components/AppCopyButton';

interface ReviewModule9DirectDepositProps {
  m9: any;
  showSensitive: Record<string, boolean>;
  toggleShow: (key: string) => void;
  selectedTaxYear?: number;
  isSubmitted?: boolean;
}

export const ReviewModule9DirectDeposit: React.FC<ReviewModule9DirectDepositProps> = ({
  m9,
  showSensitive,
  toggleShow,
  isSubmitted = false,
}) => {
  const referrals = m9.referrals || [];

  const val = (v: any) => {
    if (v === null || v === undefined || v === '') return '-';
    return String(v).trim() || '-';
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Draft Status Banner if not submitted */}
      {!isSubmitted && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Draft Stage:</strong> Taxpayer has not submitted Module 09 (Direct Deposit &amp; Referrals) yet.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-200/70 text-amber-800 border border-amber-300 whitespace-nowrap">
            Intake Pending
          </span>
        </div>
      )}

      {/* IRS Direct Deposit Bank Account Details */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>IRS Refund Direct Deposit Account</span>
          </h5>
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            {val(m9.accountType)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 text-[10px] block font-bold uppercase tracking-wider">Bank Name</span>
            <span className="font-extrabold text-slate-900 text-sm block truncate">{val(m9.bankName)}</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 text-[10px] block font-bold uppercase tracking-wider">Account Owner</span>
            <span className="font-extrabold text-slate-900 text-sm block truncate">{val(m9.accountOwnerName)}</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 text-[10px] block font-bold uppercase tracking-wider">9-Digit Routing Number</span>
            <div className="flex items-center justify-between font-mono font-bold text-slate-900 text-sm">
              <span>{val(m9.routingNumber)}</span>
              {m9.routingNumber && <AppCopyButton text={m9.routingNumber} size="sm" />}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 text-[10px] block font-bold uppercase tracking-wider">Account Number</span>
            <div className="flex items-center justify-between font-mono font-bold text-slate-900 text-sm">
              <span>
                {showSensitive['m9_acct']
                  ? val(m9.accountNumber)
                  : (m9.accountNumber ? `•••• ${m9.accountNumber.slice(-4)}` : '-')}
              </span>
              <div className="flex items-center gap-1">
                {m9.accountNumber && (
                  <>
                    <button
                      type="button"
                      onClick={() => toggleShow('m9_acct')}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                      title={showSensitive['m9_acct'] ? 'Hide Account Number' : 'Show Account Number'}
                    >
                      {showSensitive['m9_acct'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <AppCopyButton text={m9.accountNumber} size="sm" />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Taxpayer's Special Notes & Contact Preferences */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs shadow-2xs">
          <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>Special Notes to Tax Preparer</span>
          </h5>
          <p className="text-slate-700 leading-relaxed italic">
            {val(m9.notesToPreparer) !== '-' ? val(m9.notesToPreparer) : 'No special notes or instructions provided.'}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs shadow-2xs">
          <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
            <CreditCard className="w-4 h-4 text-purple-600" />
            <span>Contact &amp; Call Preference</span>
          </h5>
          <p className="text-slate-700 leading-relaxed font-semibold">
            {val(m9.preferredContactTime) !== '-' ? val(m9.preferredContactTime) : 'Email or phone anytime.'}
          </p>
        </div>
      </div>

      {/* $10 Referral Program Table */}
      {referrals.length > 0 && (
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-emerald-600" />
              <span>$10 Referral Program Contacts ({referrals.length} Referred)</span>
            </h5>
            <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              Potential Reward: ${referrals.length * 10}
            </span>
          </div>

          <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden bg-white">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-2.5">#</th>
                <th className="p-2.5">Friend / Colleague Name</th>
                <th className="p-2.5">Email Address</th>
                <th className="p-2.5">Phone Number</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {referrals.map((ref: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-2.5 font-bold text-slate-500">{idx + 1}</td>
                  <td className="p-2.5 font-bold text-slate-900">{val(ref.name)}</td>
                  <td className="p-2.5 font-mono text-indigo-700">{val(ref.email)}</td>
                  <td className="p-2.5 font-mono text-slate-700">{val(ref.phone)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
