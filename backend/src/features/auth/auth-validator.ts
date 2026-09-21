import { z } from "zod";

export const requestOtpSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format").optional(),
    mobile: z.string().regex(/^[0-9]{10,15}$/, "Invalid mobile number format").optional(),
  }).refine((data) => data.email || data.mobile, {
    message: "Either email or mobile number must be provided",
    path: ["email"],
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email().optional(),
    mobile: z.string().optional(),
    otp: z.string().length(6, "OTP must be exactly 6 digits"),
  }).refine((data) => data.email || data.mobile, {
    message: "Either email or mobile number must be provided",
    path: ["email"],
  }),
});

export const registerTaxpayerSchema = z.object({
  body: z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Please provide a valid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    taxYear: z.union([z.number(), z.string()]).transform((val) => Number(val) || new Date().getFullYear()).optional(),
    visaType: z.string().min(1, "Visa or residency status is required").optional(),
    ssnTin: z.string().optional().nullable(),
  }),
});
