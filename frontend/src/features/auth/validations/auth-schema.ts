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
