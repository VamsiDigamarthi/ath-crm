import React, { useState, useEffect } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Button } from '@/shared/components/Button';
import { OtpSixDigitInput } from './OtpSixDigitInput';
import { ShieldCheck, RefreshCw, ArrowLeft, CheckCircle2 } from 'lucide-react';
import type { OtpInput, LoginInput } from '../validations/auth-schema';

interface OtpVerificationFormProps {
  otpForm: UseFormReturn<OtpInput>;
  onOtpSubmit: (data: OtpInput) => void;
  onLoginSubmit: (data: LoginInput) => void;
  handleBackToLogin: () => void;
  identifier: string;
  loading: boolean;
}

export const OtpVerificationForm: React.FC<OtpVerificationFormProps> = ({
  otpForm,
  onOtpSubmit,
  onLoginSubmit,
  handleBackToLogin,
  identifier,
  loading,
}) => {
  const [resendCountdown, setResendCountdown] = useState<number>(30);
  const [isResending, setIsResending] = useState<boolean>(false);

  // 30s Countdown timer for resend OTP
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleResend = async () => {
    if (resendCountdown > 0 || isResending) return;
    setIsResending(true);
    try {
      await onLoginSubmit({ identifier });
      setResendCountdown(30);
    } finally {
      setIsResending(false);
    }
  };

  const otpValue = otpForm.watch('otp') || '';
  const isComplete = otpValue.length === 6;

  const handleOtpChange = (newOtp: string) => {
    otpForm.setValue('otp', newOtp, { shouldValidate: true });
  };

  return (
    <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-6 font-sans">
      {/* 6-Digit OTP Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
            <span>6-Digit Security Passkey</span>
          </label>
          <span className="text-[11px] font-medium text-slate-400">
            {otpValue.length}/6 digits
          </span>
        </div>

        {/* The 6-Box Component */}
        <OtpSixDigitInput
          value={otpValue}
          onChange={handleOtpChange}
          error={otpForm.formState.errors.otp?.message}
          disabled={loading}
          onComplete={(completedOtp) => {
            // Option to auto submit if desired, or user can click verify
            if (completedOtp.length === 6) {
              // Focus remains or ready
            }
          }}
        />
      </div>

      {/* Verify & Authenticate Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={loading}
        disabled={!isComplete || loading}
        className={`h-12 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
          isComplete && !loading
            ? 'bg-[#16A34A] hover:bg-[#15803D] text-white shadow-lg shadow-emerald-600/25 scale-[1.01]'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
        }`}
      >
        {loading ? (
          <span>Authenticating Session...</span>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4" />
            <span>Verify OTP &amp; Authenticate</span>
          </>
        )}
      </Button>

      {/* Action Links Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        <button
          type="button"
          onClick={handleBackToLogin}
          disabled={loading}
          className="font-semibold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Change Email/Phone</span>
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={resendCountdown > 0 || isResending || loading}
          className={`font-bold transition-colors flex items-center gap-1 cursor-pointer ${
            resendCountdown > 0 || isResending || loading
              ? 'text-slate-400 cursor-not-allowed'
              : 'text-[#16A34A] hover:text-emerald-700'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
          <span>
            {resendCountdown > 0
              ? `Resend OTP in ${resendCountdown}s`
              : 'Resend OTP Code'}
          </span>
        </button>
      </div>
    </form>
  );
};
