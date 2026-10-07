import { z } from "zod";

const noHtml = (v: string) => !/<[^>]+>|<\s*script\b|javascript\s*:/i.test(v);

const applicationParam = z.object({ applicationId: z.string().uuid("Invalid application id") });
const requestParam = z.object({ id: z.string().uuid("Invalid request id") });

export const myStatusSchema = z.object({ params: applicationParam });

export const createRequestSchema = z.object({
  params: applicationParam,
  body: z.object({
    reason: z
      .string({ message: "Tell the admin why you need edit access" })
      .trim()
      .min(5, "Reason must be at least 5 characters")
      .max(1000, "Reason cannot exceed 1000 characters")
      .refine(noHtml, "HTML tags are not allowed"),
  }),
});

export const listRequestsSchema = z.object({
  query: z.object({
    status: z.enum(["PENDING", "APPROVED", "REJECTED", "REVOKED"]).optional(),
  }),
});

const optionalNote = z
  .string()
  .trim()
  .max(500, "Note cannot exceed 500 characters")
  .refine(noHtml, "HTML tags are not allowed")
  .optional();

export const approveRequestSchema = z.object({
  params: requestParam,
  body: z.object({
    accessUntil: z.coerce.date({ message: "Select until when access is allowed" }),
    reviewNote: optionalNote,
  }),
});

export const rejectRequestSchema = z.object({
  params: requestParam,
  body: z.object({ reviewNote: optionalNote }),
});

export const revokeRequestSchema = z.object({ params: requestParam });
