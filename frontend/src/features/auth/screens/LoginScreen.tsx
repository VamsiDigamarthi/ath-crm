import React from 'react';
import { useLogin } from '../hooks/useLogin';
import { AuthBrandShowcase } from '../components/AuthBrandShowcase';
import { EmailLoginForm } from '../components/EmailLoginForm';
import { OtpVerificationForm } from '../components/OtpVerificationForm';
import { AuthSecurityFooter } from '../components/AuthSecurityFooter';
import { FileSpreadsheet, KeyRound } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const {
    isOtpSent,
    identifier,
    loading,
    loginForm,
    otpForm,
    onLoginSubmit,
    onOtpSubmit,
    handleBackToLogin,
  } = useLogin();

  return (
    <div className="h-screen w-full flex bg-slate-950 font-sans selection:bg-emerald-500 selection:text-white overflow-hidden">
      
      {/* Left Brand Showcase Component */}
      <AuthBrandShowcase />

      {/* Right Login Panel */}
      <div className="w-full lg:w-5/12 flex flex-col justify-between p-6 sm:p-8 xl:p-10 bg-white h-full overflow-hidden">
        
        {/* Mobile Brand Bar */}
        <div className="flex lg:hidden items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#16A34A] flex items-center justify-center text-white font-bold shadow-md shadow-emerald-600/20">
            <FileSpreadsheet size={18} />
          </div>
          <div>
            <span className="font-bold text-gray-900 text-lg font-mono">TaxCRM</span>
            <p className="text-[10px] text-gray-500">Tax Filing Operations</p>
          </div>
        </div>

        {/* Center Form Container */}
        <div className="max-w-md w-full mx-auto my-auto py-2">
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#16A34A] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 mb-3">
              <KeyRound className="w-3.5 h-3.5" />
              Secure OTP Authentication
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Sign in to TaxCRM
            </h2>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
              {isOtpSent
                ? `Enter the 6-digit verification code sent to ${identifier}`
                : 'Enter your registered email or phone to receive your one-time passkey.'}
            </p>
          </div>

          {/* Render Modular Form Step Components */}
          {!isOtpSent ? (
            <EmailLoginForm
              loginForm={loginForm}
              onLoginSubmit={onLoginSubmit}
              loading={loading}
            />
          ) : (
            <OtpVerificationForm
              otpForm={otpForm}
              onOtpSubmit={onOtpSubmit}
              onLoginSubmit={onLoginSubmit}
              handleBackToLogin={handleBackToLogin}
              identifier={identifier}
              loading={loading}
            />
          )}

          {/* Security Guarantee Footer Component */}
          <AuthSecurityFooter />
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-gray-400">
          Need help logging in? Contact your Department Manager or Support.
        </div>

      </div>

    </div>
  );
};
