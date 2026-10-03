import React from 'react';
import { TaxpayerSignupForm } from '../components/TaxpayerSignupForm';
import { FileSpreadsheet } from 'lucide-react';

export const SignupScreen: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 font-sans px-4 py-10 selection:bg-emerald-500 selection:text-white">
      <div className="w-full max-w-lg">

        {/* Brand */}
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#16A34A] flex items-center justify-center text-white">
            <FileSpreadsheet size={20} />
          </div>
          <span className="font-bold text-gray-900 text-xl">TaxCRM</span>
        </div>

        {/* Signup Card */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 sm:p-8">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Create Taxpayer Account
            </h2>
            <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
              Fill in your basic information to set up your tax filing case.
            </p>
          </div>

          <TaxpayerSignupForm />
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Need help with registration? Contact our Support Desk at support@taxcrm.com
        </p>
      </div>
    </div>
  );
};
