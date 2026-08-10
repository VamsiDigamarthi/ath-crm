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
