import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or Phone is required').refine((val) => {
    const trimmed = val.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    const cleanDigits = trimmed.replace(/\D/g, '');
    const isPhone = cleanDigits.length >= 7 && cleanDigits.length <= 15;
    return isEmail || isPhone;
  }, 'Please enter a valid email or phone number'),
});

export const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d+$/, 'OTP must contain only numbers'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type OtpInput = z.infer<typeof otpSchema>;

export const registerTaxpayerSchema = z.object({
  firstName: z.string().trim().min(2, 'First name is required (min 2 characters)'),
  lastName: z.string().trim().min(2, 'Last name is required (min 2 characters)'),
  email: z.string().trim().email('Please enter a valid email address'),
  phone: z.string().trim().refine((val) => val.replace(/\D/g, '').length >= 10, 'Please enter a valid 10-digit phone number'),
  taxYear: z.number().default(() => new Date().getFullYear()),
  visaType: z.string().min(1, 'Please select your visa or residency status'),
  ssnTin: z.string().trim().optional(),
});

export type RegisterTaxpayerInput = z.infer<typeof registerTaxpayerSchema>;
