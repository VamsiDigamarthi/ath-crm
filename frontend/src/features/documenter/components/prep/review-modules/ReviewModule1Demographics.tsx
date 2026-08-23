import React from 'react';
import { User, Globe, Home, Eye, EyeOff } from 'lucide-react';
import { AppCopyButton } from '@/shared/components/AppCopyButton';

interface ReviewModule1DemographicsProps {
  m1: any;
  customerName: string;
  showSensitive: Record<string, boolean>;
  toggleShow: (key: string) => void;
}

export const ReviewModule1Demographics: React.FC<ReviewModule1DemographicsProps> = ({
  m1,
  customerName,
  showSensitive,
  toggleShow,
}) => {
  return (
    <div className="space-y-4 font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Taxpayer Identity */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
          <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
            <User className="w-4 h-4 text-emerald-600" />
            <span>Taxpayer Identity</span>
          </h5>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-400 font-medium block text-[10px]">Legal Full Name</span>
              <span className="font-bold text-slate-900">
                {m1.fullName || [m1.firstName, m1.middleName, m1.lastName].filter(Boolean).join(' ') || customerName}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block text-[10px]">Social Security Number / ITIN</span>
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span>
                  {showSensitive['m1_ssn']
                    ? (m1.ssnMasked || 'Not Provided')
                    : (m1.ssnMasked
                      ? (m1.ssnMasked.includes('••') ? m1.ssnMasked : `••••••-${m1.ssnMasked.slice(-4)}`)
                      : '••••••-6789')}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => toggleShow('m1_ssn')}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                    title={showSensitive['m1_ssn'] ? 'Hide SSN' : 'Show SSN'}
                  >
                    {showSensitive['m1_ssn'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  {m1.ssnMasked && <AppCopyButton text={m1.ssnMasked} size="sm" />}
                </div>
              </div>
            </div>
            <div>
              <span className="text-slate-400 font-medium block text-[10px]">Date of Birth</span>
              <span className="font-bold text-slate-900">{m1.dob || '05/14/1988'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block text-[10px]">Occupation</span>
              <span className="font-bold text-slate-900">{m1.occupation || 'Principal Cloud Architect'}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Visa & Entry Details */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
          <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
            <Globe className="w-4 h-4 text-indigo-600" />
            <span>Visa &amp; Entry Details</span>
          </h5>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-400 font-medium block text-[10px]">VISA Status (as of 12/31/2025)</span>
              <span className="font-bold text-slate-900 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 inline-block">
                {m1.visaType || 'H-1B'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block text-[10px]">VISA Status Changed in 2025?</span>
              <span className="font-bold text-slate-900">{m1.visaStatusChanged2025 || 'NO'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block text-[10px]">First Port of Entry in U.S.</span>
              <span className="font-bold text-slate-900">{m1.firstPortOfEntryDate || '08/15/2018'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block text-[10px]">Months Stayed in U.S. during 2025</span>
              <span className="font-bold text-emerald-700">{m1.monthsStayedInUs2025 ?? 12} Months</span>
            </div>
          </div>
        </div>

        {/* Card 3: Filing Status & Address */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
          <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
            <Home className="w-4 h-4 text-purple-600" />
            <span>Filing Status &amp; Address</span>
          </h5>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-400 font-medium block text-[10px]">Filing / Marital Status</span>
              <span className="font-bold text-slate-900 px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 inline-block">
                {m1.maritalStatus || 'Single'}
              </span>
            </div>
            {m1.maritalStatus?.includes('Married') && (
              <div>
                <span className="text-slate-400 font-medium block text-[10px]">Date of Marriage</span>
                <span className="font-bold text-slate-900">{m1.dateOfMarriage || 'Not Provided'}</span>
              </div>
            )}
            <div>
              <span className="text-slate-400 font-medium block text-[10px]">Residential Street Address</span>
              <span className="font-bold text-slate-900 block">{m1.residentialAddress || '1000 Louisiana St, Suite 4200'}</span>
              <span className="text-slate-600">{m1.city || 'Houston'}, {m1.state || 'TX'} {m1.zipCode || '77002'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
