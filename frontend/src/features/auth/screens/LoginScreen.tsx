import React from 'react';
import { Link } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';
import { EmailLoginForm } from '../components/EmailLoginForm';
import { OtpVerificationForm } from '../components/OtpVerificationForm';
import { FileSpreadsheet } from 'lucide-react';

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
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 font-sans px-4 py-10 selection:bg-emerald-500 selection:text-white">
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#16A34A] flex items-center justify-center text-white">
            <FileSpreadsheet size={20} />
          </div>
          <span className="font-bold text-gray-900 text-xl">TaxCRM</span>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 sm:p-8">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Sign in to TaxCRM
            </h2>
            <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
              {isOtpSent
                ? `Enter the 6-digit verification code sent to ${identifier}`
                : 'Enter your registered email to receive a one-time code.'}
            </p>
          </div>

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

          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600">
              New taxpayer?{' '}
              <Link to="/signup" className="font-bold text-[#16A34A] hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Need help logging in? Contact your Department Manager or Support.
        </p>
      </div>
    </div>
  );
};
