import { z } from "zod";
import { Role } from "@prisma/client";

export const createEmailTemplateSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Template name is required").max(120, "Template name must be under 120 characters"),
    roles: z.array(z.nativeEnum(Role)).min(1, "At least one target role must be selected"),
    subject: z.string().min(1, "Subject is required").max(200, "Subject must be under 200 characters"),
    body: z.string().min(1, "Email body content is required"),
    isActive: z.boolean().optional().default(true),
  }),
});

export const updateEmailTemplateSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Template name is required").max(120, "Template name must be under 120 characters").optional(),
    roles: z.array(z.nativeEnum(Role)).min(1, "At least one target role must be selected").optional(),
    subject: z.string().min(1, "Subject is required").max(200, "Subject must be under 200 characters").optional(),
    body: z.string().min(1, "Email body content is required").optional(),
    isActive: z.boolean().optional(),
  }),
});

export const queryEmailTemplatesSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    role: z.nativeEnum(Role).optional(),
    status: z.enum(["ALL", "ACTIVE", "INACTIVE"]).optional(),
  }).optional(),
});

export const sendStaffEmailSchema = z.object({
  body: z.object({
    applicationId: z.string().optional(),
    recipientEmail: z.string().email("Valid recipient email address is required"),
    subject: z.string().min(1, "Email subject line is required").max(200, "Subject must be under 200 characters"),
    body: z.string().min(1, "Email body content is required"),
    templateId: z.string().optional(),
  }),
});

