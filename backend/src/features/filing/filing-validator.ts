import { z } from "zod";

export const irsRejectSchema = z.object({
  params: z.object({ id: z.string().uuid("Invalid application id") }),
  body: z.object({
    reason: z
      .string({ message: "Enter the IRS rejection reason" })
      .trim()
      .min(3, "Enter the IRS rejection reason")
      .max(500, "Reason cannot exceed 500 characters")
      .refine((v) => !/<[^>]+>|<\s*script\b|javascript\s*:/i.test(v), "HTML tags are not allowed"),
  }),
});

export const filingHoldSchema = z.object({
  params: z.object({ id: z.string().uuid("Invalid application id") }),
  body: z.object({
    onHold: z.boolean({ message: "onHold must be true or false" }),
    reason: z
      .string()
      .trim()
      .max(500, "Reason cannot exceed 500 characters")
      .refine((v) => !/<[^>]+>|<\s*script\b|javascript\s*:/i.test(v), "HTML tags are not allowed")
      .optional(),
  }),
});
