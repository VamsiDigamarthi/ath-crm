import { z } from "zod";
import { Role } from "@prisma/client";

export const registerAdminSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format").optional(),
    mobile: z.string().regex(/^[0-9]{10,15}$/, "Invalid mobile number format").optional(),
  }).refine((data) => data.email || data.mobile, {
    message: "Either email or mobile number must be provided",
    path: ["email"],
  }),
});

export const leadItemSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(5, "Valid phone number is required"),
  email: z.string().email("Invalid email format").optional().nullable().or(z.literal("")),
  ssnTin: z.string().optional().nullable().or(z.literal("")),
  filingType: z.string().optional().default("INDIVIDUAL"),
  addressLine1: z.string().optional().nullable().or(z.literal("")),
  city: z.string().optional().nullable().or(z.literal("")),
  state: z.string().optional().nullable().or(z.literal("")),
  zipCode: z.string().optional().nullable().or(z.literal("")),
});

export const bulkImportLeadsSchema = z.object({
  body: z.object({
    taxYear: z.number().int().min(2000).max(2050),
    leads: z.array(leadItemSchema).min(1, "At least 1 lead row is required to import").max(20000, "Maximum 20,000 rows per batch upload"),
  }),
});

export const createEmployeeSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Valid work email is required"),
    mobile: z.string().min(5, "Valid mobile number is required"),
    role: z.nativeEnum(Role, {
      message: "Valid department role is required",
    }),
    isActive: z.boolean().optional().default(true),
  }),
});

export const updateEmployeeSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    email: z.string().email("Valid work email is required").optional(),
    mobile: z.string().min(5).optional(),
    role: z.nativeEnum(Role).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const bulkOnboardEmployeesSchema = z.object({
  body: z.object({
    employees: z.array(
      z.object({
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        email: z.string().email("Valid email is required"),
        mobile: z.string().min(5, "Valid mobile is required"),
        role: z.nativeEnum(Role),
        isActive: z.boolean().optional().default(true),
      })
    ).min(1, "At least 1 staff member is required"),
  }),
});
