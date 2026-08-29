import React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { AppInput } from '@/shared/components/AppInput';
import { Button } from '@/shared/components/Button';
import { Mail, ArrowRight } from 'lucide-react';
import type { LoginInput } from '../validations/auth-schema';

interface EmailLoginFormProps {
  loginForm: UseFormReturn<LoginInput>;
  onLoginSubmit: (data: LoginInput) => void;
  loading: boolean;
}

export const EmailLoginForm: React.FC<EmailLoginFormProps> = ({
  loginForm,
  onLoginSubmit,
  loading,
}) => {
  return (
    <div className="space-y-4">
      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
        <AppInput
          label="Registered Email"
          labelSize="sm"
          placeholder="name@company.com"
          leftIcon={<Mail className="w-4 h-4 text-gray-400" />}
          size="md"
          value={loginForm.watch('identifier')}
          onChange={(e) => loginForm.setValue('identifier', e.target.value, { shouldValidate: true })}
          error={loginForm.formState.errors.identifier?.message}
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          loading={loading}
          className="mt-1 shadow-md shadow-emerald-600/20 cursor-pointer font-bold bg-[#16A34A] hover:bg-[#15803D] text-white"
        >
          {loading ? (
            'Sending One-Time OTP...'
          ) : (
            <span className="flex items-center justify-center gap-2">
              Send One-Time OTP Code
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </Button>
      </form>
    </div>
  );
};
