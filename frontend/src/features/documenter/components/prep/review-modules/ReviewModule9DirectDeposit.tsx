import React from 'react';
import { Building2, Eye, EyeOff } from 'lucide-react';
import { AppCopyButton } from '@/shared/components/AppCopyButton';

interface ReviewModule9DirectDepositProps {
  m9: any;
  showSensitive: Record<string, boolean>;
  toggleShow: (key: string) => void;
}

export const ReviewModule9DirectDeposit: React.FC<ReviewModule9DirectDepositProps> = ({
  m9,
  showSensitive,
  toggleShow,
}) => {
  return (
    <div className="space-y-4 font-sans">
      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
        <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
          <Building2 className="w-4 h-4 text-emerald-600" />
          <span>IRS Direct Deposit Account</span>
        </h5>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-white rounded-lg border border-slate-200 space-y-1">
            <span className="text-slate-400 text-[10px] block font-medium">Bank Name</span>
            <span className="font-bold text-slate-900">{m9.bankName || 'JPMorgan Chase Bank'}</span>
          </div>

          <div className="p-3.5 bg-white rounded-lg border border-slate-200 space-y-1">
            <span className="text-slate-400 text-[10px] block font-medium">9-Digit Routing Number</span>
            <div className="flex items-center justify-between font-mono font-bold text-slate-900">
              <span>{m9.routingNumber || '111000025'}</span>
              {m9.routingNumber && <AppCopyButton text={m9.routingNumber} size="sm" />}
            </div>
          </div>

          <div className="p-3.5 bg-white rounded-lg border border-slate-200 space-y-1">
            <span className="text-slate-400 text-[10px] block font-medium">Account Number</span>
            <div className="flex items-center justify-between font-mono font-bold text-slate-900">
              <span>
                {showSensitive['m9_acct']
                  ? (m9.accountNumber || 'Not Provided')
                  : (m9.accountNumber ? `•••• ${m9.accountNumber.slice(-4)}` : '•••• 4819')}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => toggleShow('m9_acct')}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                  title={showSensitive['m9_acct'] ? 'Hide Account Number' : 'Show Account Number'}
                >
                  {showSensitive['m9_acct'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                {m9.accountNumber && <AppCopyButton text={m9.accountNumber} size="sm" />}
              </div>
            </div>
          </div>
        </div>

        {m9.notesToPreparer && (
          <div className="p-3.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 space-y-1">
            <span className="font-bold block">Taxpayer's Special Notes to CPA:</span>
            <p className="italic">{m9.notesToPreparer}</p>
          </div>
        )}
      </div>
    </div>
  );
};
