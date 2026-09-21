import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Globe,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { registerTaxpayerSchema, type RegisterTaxpayerInput } from '../validations/auth-schema';
import { authService } from '../services/auth-service';
import { useAuthStore } from '../store/auth-store';
import { AppInput } from '@/shared/components/AppInput';
import { Button } from '@/shared/components/Button';
import toast from 'react-hot-toast';

const VISA_OPTIONS = [
  { value: 'H1B', label: 'H-1B (Work Visa)' },
  { value: 'F1_OPT', label: 'F-1 Student (OPT / STEM)' },
  { value: 'L1', label: 'L-1 (Intracompany)' },
  { value: 'GREEN_CARD', label: 'Permanent Resident (Green Card)' },
  { value: 'US_CITIZEN', label: 'U.S. Citizen' },
  { value: 'B1_B2', label: 'B-1 / B-2 (Visitor)' },
  { value: 'OTHER', label: 'Other Visa / Non-Resident' },
];

// Dynamically generate tax years: 2 years in the future to 6 years in the past (descending)
// E.g., for currentYear 2025: [2027, 2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019]
export const generateTaxYears = (futureOffset = 2, pastOffset = 6): number[] => {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let yr = currentYear + futureOffset; yr >= currentYear - pastOffset; yr--) {
    years.push(yr);
  }
  return years;
};

const TAX_YEARS = generateTaxYears(2, 6);
const CURRENT_TAX_YEAR = new Date().getFullYear();

export const TaxpayerSignupForm: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, refreshUser } = useAuthStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterTaxpayerInput>({
    resolver: zodResolver(registerTaxpayerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      taxYear: CURRENT_TAX_YEAR,
      visaType: 'H1B',
      ssnTin: '',
    },
  });

  // Format Phone as (XXX) XXX-XXXX
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    let formatted = digits;
    if (digits.length > 6) {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    } else if (digits.length > 3) {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else if (digits.length > 0) {
      formatted = `(${digits}`;
    }
    setValue('phone', formatted, { shouldValidate: true });
  };

  // Format SSN as XXX-XX-XXXX
  const handleSsnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    let formatted = digits;
    if (digits.length > 5) {
      formatted = `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}`;
    } else if (digits.length > 3) {
      formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
    }
    setValue('ssnTin', formatted, { shouldValidate: true });
  };

  const onSubmit = async (data: RegisterTaxpayerInput) => {
    setErrorMessage(null);
    try {
      const payload = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        taxYear: Number(data.taxYear) || CURRENT_TAX_YEAR,
        visaType: data.visaType,
        ssnTin: data.ssnTin?.trim() || null,
      };

      const res: any = await authService.registerTaxpayer(payload);
      const responseData = res?.data || res;

      if (responseData?.user) {
        setUser(responseData.user);
      } else if (responseData?.data?.user) {
        setUser(responseData.data.user);
      }
      try {
        await refreshUser();
      } catch {
        // ignore
      }

      setIsSuccess(true);
      toast.success('Registration successful! Welcome to TaxCRM 🎉');

      setTimeout(() => {
        navigate('/customer/dashboard');
      }, 1200);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to complete registration.';
      setErrorMessage(message);
      toast.error(message);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-8 space-y-4 max-w-sm mx-auto">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#16A34A] flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 animate-bounce" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Registration Complete!</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Your taxpayer account has been created. Redirecting to your tax workspace...
        </p>
        <div className="pt-2">
          <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Existing account alert */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold leading-relaxed">{errorMessage}</p>
            {errorMessage.toLowerCase().includes('already') && (
              <div className="pt-0.5">
                <Link to="/login" className="underline font-bold text-rose-900 hover:text-rose-950">
                  Click here to sign in &rarr;
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        {/* Name Fields (First Name & Last Name) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AppInput
            label="First Name"
            labelSize="sm"
            placeholder="e.g. John"
            leftIcon={<User className="w-4 h-4 text-gray-400" />}
            size="md"
            required
            value={watch('firstName')}
            onChange={(e) => setValue('firstName', e.target.value, { shouldValidate: true })}
            error={errors.firstName?.message}
          />

          <AppInput
            label="Last Name"
            labelSize="sm"
            placeholder="e.g. Doe"
            leftIcon={<User className="w-4 h-4 text-gray-400" />}
            size="md"
            required
            value={watch('lastName')}
            onChange={(e) => setValue('lastName', e.target.value, { shouldValidate: true })}
            error={errors.lastName?.message}
          />
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AppInput
            label="Email Address"
            labelSize="sm"
            type="email"
            placeholder="name@company.com"
            leftIcon={<Mail className="w-4 h-4 text-gray-400" />}
            size="md"
            required
            value={watch('email')}
            onChange={(e) => setValue('email', e.target.value, { shouldValidate: true })}
            error={errors.email?.message}
          />

          <AppInput
            label="Phone Number"
            labelSize="sm"
            type="tel"
            placeholder="(555) 000-0000"
            leftIcon={<Phone className="w-4 h-4 text-gray-400" />}
            size="md"
            required
            maxLength={14}
            value={watch('phone')}
            onChange={handlePhoneChange}
            error={errors.phone?.message}
          />
        </div>

        {/* Tax Year & Visa Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Tax Year Selector with exact AppInput styling */}
          <div className="flex flex-col gap-1 w-full">
            <label className="text-xs font-semibold text-gray-700 tracking-tight">
              Filing Tax Year <span className="text-rose-500">*</span>
            </label>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none z-10">
                <Calendar className="w-4 h-4 text-gray-400" />
              </div>
              <select
                value={watch('taxYear')}
                onChange={(e) => setValue('taxYear', Number(e.target.value), { shouldValidate: true })}
                className="h-10 text-xs font-semibold text-slate-900 w-full rounded-xl border-[1.5px] border-gray-200 bg-white pl-10 pr-8 transition-all duration-200 outline-none hover:border-gray-300 focus:ring-2 focus:ring-emerald-500/15 focus:border-[#16A34A] cursor-pointer"
              >
                {TAX_YEARS.map((yr) => (
                  <option key={yr} value={yr}>
                    Tax Year {yr}
                  </option>
                ))}
              </select>
            </div>
            {errors.taxYear && (
              <p className="text-[11px] text-rose-500 font-medium">{errors.taxYear.message}</p>
            )}
          </div>

          {/* Visa Type Selector with exact AppInput styling */}
          <div className="flex flex-col gap-1 w-full">
            <label className="text-xs font-semibold text-gray-700 tracking-tight">
              Visa / Residency Status <span className="text-rose-500">*</span>
            </label>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none z-10">
                <Globe className="w-4 h-4 text-gray-400" />
              </div>
              <select
                value={watch('visaType')}
                onChange={(e) => setValue('visaType', e.target.value, { shouldValidate: true })}
                className={`h-10 text-xs font-semibold text-slate-900 w-full rounded-xl border-[1.5px] bg-white pl-10 pr-8 transition-all duration-200 outline-none hover:border-gray-300 focus:ring-2 focus:ring-emerald-500/15 focus:border-[#16A34A] cursor-pointer ${
                  errors.visaType ? 'border-rose-400 focus:border-rose-500' : 'border-gray-200'
                }`}
              >
                {VISA_OPTIONS.map((v) => (
                  <option key={v.value} value={v.value}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
            {errors.visaType && (
              <p className="text-[11px] text-rose-500 font-medium">{errors.visaType.message}</p>
            )}
          </div>
        </div>

        {/* SSN / ITIN (Optional) with native AppInput password toggle */}
        <AppInput
          label="SSN / ITIN (Optional)"
          labelSize="sm"
          type="password"
          placeholder="XXX-XX-XXXX"
          leftIcon={<ShieldCheck className="w-4 h-4 text-gray-400" />}
          size="md"
          maxLength={11}
          value={watch('ssnTin') || ''}
          onChange={handleSsnChange}
          error={errors.ssnTin?.message}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          loading={isSubmitting}
          className="mt-2 shadow-md shadow-emerald-600/20 cursor-pointer font-bold bg-[#16A34A] hover:bg-[#15803D] text-white"
        >
          {isSubmitting ? (
            'Creating Account...'
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span>Create Account &amp; Start Filing</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </Button>
      </form>

      {/* Switch to Login */}
      <div className="text-center pt-2 text-xs text-slate-600">
        <span>Already have an account? </span>
        <Link to="/login" className="font-bold text-[#16A34A] hover:underline cursor-pointer">
          Sign In &rarr;
        </Link>
      </div>
    </div>
  );
};
