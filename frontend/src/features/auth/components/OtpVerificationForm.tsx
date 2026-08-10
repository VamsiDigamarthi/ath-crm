import React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { AppInput } from '@/shared/components/AppInput';
import { Button } from '@/shared/components/Button';
import { KeyRound } from 'lucide-react';
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
  return (
    <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
      <AppInput
        label="6-Digit One-Time Password"
        labelSize="sm"
        placeholder="000000"
        leftIcon={<KeyRound className="w-4 h-4 text-[#16A34A]" />}
        size="md"
        value={otpForm.watch('otp')}
        onChange={(e) => otpForm.setValue('otp', e.target.value, { shouldValidate: true })}
        error={otpForm.formState.errors.otp?.message}
      />

      <Button
        type="submit"
        variant="primary"
        size="md"
        fullWidth
        loading={loading}
        className="shadow-md shadow-emerald-600/20 cursor-pointer font-bold"
      >
        {loading ? 'Verifying OTP Code...' : 'Verify OTP & Authenticate'}
      </Button>

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={handleBackToLogin}
          disabled={loading}
          className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
        >
          ← Change Email/Phone
        </button>
        <button
          type="button"
          onClick={() => onLoginSubmit({ identifier })}
          disabled={loading}
          className="text-xs font-bold text-[#16A34A] hover:text-emerald-700 transition-colors cursor-pointer"
        >
          Resend OTP
        </button>
      </div>
    </form>
  );
};
