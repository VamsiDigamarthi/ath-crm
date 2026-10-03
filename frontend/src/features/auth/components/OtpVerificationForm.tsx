import React, { useState, useEffect } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Button } from '@/shared/components/Button';
import { OtpSixDigitInput } from './OtpSixDigitInput';
import { ArrowLeft } from 'lucide-react';
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
    <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4 font-sans">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-gray-700 tracking-tight">Verification code</label>
          <span className="text-[11px] text-slate-400">{otpValue.length}/6</span>
        </div>
        <OtpSixDigitInput
          value={otpValue}
          onChange={handleOtpChange}
          error={otpForm.formState.errors.otp?.message}
          disabled={loading}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="md"
        fullWidth
        loading={loading}
        disabled={!isComplete || loading}
        className="mt-1 cursor-pointer font-bold bg-[#16A34A] hover:bg-[#15803D] text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Verifying...' : 'Verify & Sign In'}
      </Button>

      <div className="flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={handleBackToLogin}
          disabled={loading}
          className="font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Change email</span>
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={resendCountdown > 0 || isResending || loading}
          className={`font-semibold transition-colors cursor-pointer ${
            resendCountdown > 0 || isResending || loading
              ? 'text-slate-400 cursor-not-allowed'
              : 'text-[#16A34A] hover:text-[#15803D]'
          }`}
        >
          {isResending ? 'Sending...' : resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend code'}
        </button>
      </div>
    </form>
  );
};
