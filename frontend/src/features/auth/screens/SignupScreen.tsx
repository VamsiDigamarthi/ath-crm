import React from 'react';
import { Link } from 'react-router-dom';
import { AuthBrandShowcase } from '../components/AuthBrandShowcase';
import { TaxpayerSignupForm } from '../components/TaxpayerSignupForm';
import { AuthSecurityFooter } from '../components/AuthSecurityFooter';
import { FileSpreadsheet, LogIn } from 'lucide-react';

export const SignupScreen: React.FC = () => {
  return (
    <div className="h-screen w-full flex bg-slate-950 font-sans selection:bg-emerald-500 selection:text-white overflow-hidden">

      {/* Left Brand Showcase Component */}
      <AuthBrandShowcase />

      {/* Right Registration Panel */}
      <div className="w-full lg:w-5/12 flex flex-col justify-between p-6 sm:p-8 xl:p-10 bg-white h-full overflow-y-auto custom-scrollbar">

        {/* Mobile Brand Bar & Top Nav */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 lg:border-none">
          {/* Brand Logo only shown on mobile screen sizes (<lg) */}
          <div className="flex lg:hidden items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#16A34A] flex items-center justify-center text-white font-bold">
              <FileSpreadsheet size={18} />
            </div>
            <div>
              <span className="font-bold text-gray-900 text-lg">TaxCRM</span>
              <p className="text-[10px] text-gray-500">Taxpayer Client Portal</p>
            </div>
          </div>

          <Link
            to="/login"
            className="text-xs font-bold text-[#16A34A] hover:text-[#15803D] flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 transition-colors ml-auto"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </Link>
        </div>

        {/* Center Form Container */}
        <div className="max-w-lg w-full mx-auto my-4 py-2">
          <div className="mb-5">

            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Create Taxpayer Account
            </h2>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Fill in your basic information to set up your tax filing case. Certified CPAs will review and optimize your deductions.
            </p>
          </div>

          {/* Form */}
          <TaxpayerSignupForm />

          {/* Security Guarantee Footer Component */}
          <AuthSecurityFooter />
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-gray-400 pt-4">
          Need help with registration? Contact our Support Desk at support@taxcrm.com
        </div>

      </div>

    </div>
  );
};
