import React from 'react';
import { Shield, Database } from 'lucide-react';

export const AdminSettingsScreen: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            System & Operations Settings
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Configure deduplication match rules, automated round-robin thresholds, OTP authentication, and audit preferences.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#16A34A] border border-emerald-200 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Deduplication Matching Engine</h3>
              <p className="text-xs text-slate-500 font-medium">SSN/ITIN, Phone, and Email exact match</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            When bulk uploading leads, profiles with matching SSN/ITIN or Phone will automatically update the taxpayer record rather than creating duplicate profiles.
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
            Active & Enforced
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Security & Authentication</h3>
              <p className="text-xs text-slate-500 font-medium">6-Digit One-Time OTP Login</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Staff and Taxpayers authenticate via email OTP with strict expiration windows and 256-bit encrypted JWT session cookies.
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            TLS & Secure Cookies Active
          </div>
        </div>
      </div>
    </div>
  );
};
