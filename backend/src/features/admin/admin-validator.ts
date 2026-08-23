import { z } from "zod";
import { Role } from "@prisma/client";

export const ALLOWED_VISA_TYPES = [
  'H-1B',
  'H-4',
  'L-1',
  'L-2',
  'F-1 OPT',
  'F-1 CPT',
  'F-1',
  'B-1/B-2',
  'J-1',
  'O-1',
  'TN',
  'E-3',
  'GREEN_CARD',
  'US_CITIZEN',
  'OTHER',
] as const;

export const ALLOWED_FILING_STATUSES = [
  'SINGLE',
  'MARRIED_FILING_JOINTLY',
  'MARRIED_FILING_SEPARATELY',
  'HEAD_OF_HOUSEHOLD',
  'QUALIFYING_SURVIVING_SPOUSE',
] as const;

/**
 * Normalizes input visa type string into standard canonical key, or returns null if invalid
 */
export function normalizeVisaType(input?: string | null): string | null {
  if (!input || !input.trim()) return null;
  const clean = input.trim().toUpperCase().replace(/[\s_-]+/g, '');
  
  if (['H1B', 'H1', 'H1BVISA'].includes(clean)) return 'H-1B';
  if (['H4', 'H4VISA'].includes(clean)) return 'H-4';
  if (['L1', 'L1A', 'L1B', 'L1VISA'].includes(clean)) return 'L-1';
  if (['L2', 'L2VISA'].includes(clean)) return 'L-2';
  if (['F1OPT', 'OPT', 'STEMOPT', 'F1STEMOPT'].includes(clean)) return 'F-1 OPT';
  if (['F1CPT', 'CPT'].includes(clean)) return 'F-1 CPT';
  if (['F1', 'F1STUDENT', 'STUDENT'].includes(clean)) return 'F-1';
  if (['B1B2', 'B1', 'B2', 'VISITOR', 'TOURIST'].includes(clean)) return 'B-1/B-2';
  if (['J1', 'J1VISA', 'EXCHANGE'].includes(clean)) return 'J-1';
  if (['O1', 'O1A', 'O1B', 'O1VISA'].includes(clean)) return 'O-1';
  if (['TN', 'TN1', 'TN2', 'TNVISA'].includes(clean)) return 'TN';
  if (['E3', 'E3VISA'].includes(clean)) return 'E-3';
  if (['GREENCARD', 'GC', 'PERMANENTRESIDENT', 'PR'].includes(clean)) return 'GREEN_CARD';
  if (['USCITIZEN', 'CITIZEN', 'USC', 'PASSPORT'].includes(clean)) return 'US_CITIZEN';
  if (['OTHER', 'NA', 'UNKNOWN'].includes(clean)) return 'OTHER';

  // Check if exactly matches one of ALLOWED_VISA_TYPES
  const exact = ALLOWED_VISA_TYPES.find((v) => v.toUpperCase() === input.trim().toUpperCase());
  if (exact) return exact;

  return null; // Invalid
}

export const registerAdminSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format").optional(),
    mobile: z.string().regex(/^[0-9]{10,15}$/, "Invalid mobile number format").optional(),
  }).refine((data) => data.email || data.mobile, {
    message: "Either email or mobile number must be provided",
    path: ["email"],
  }),
});

const EMOJI_REGEX = /[\p{Extended_Pictographic}\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/u;

const noObjectOrEmoji = (val: string) => {
  return !/\[object\s+object\]/i.test(val) && !val.includes('{') && !val.includes('}') && !EMOJI_REGEX.test(val);
};

export const leadItemSchema = z.object({
  firstName: z.string().trim()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters")
    .refine(noObjectOrEmoji, "First name contains invalid object reference or emojis"),
  middleName: z.string().trim().max(50, "Middle name must not exceed 50 characters").optional().nullable().or(z.literal("")),
  lastName: z.string().trim()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must not exceed 50 characters")
    .refine(noObjectOrEmoji, "Last name contains invalid object reference or emojis"),
  phone: z.string().trim()
    .min(7, "Valid phone number is required (min 7 digits)")
    .max(25, "Phone number too long")
    .refine(noObjectOrEmoji, "Phone number contains invalid object reference or emojis"),
  email: z.string().trim().email("Invalid email format").optional().nullable().or(z.literal("")),
  ssnTin: z.string().trim().optional().nullable().or(z.literal("")),
  dob: z.string().trim().optional().nullable().or(z.literal("")),
  occupation: z.string().trim().max(100).optional().nullable().or(z.literal("")),
  visaType: z.string().trim()
    .min(1, "Visa type is required")
    .refine(noObjectOrEmoji, "Visa type contains invalid object reference or emojis"),
  maritalStatus: z.string().trim().max(50).optional().nullable().or(z.literal("")),
  filingType: z.string().optional().default("INDIVIDUAL"),
  addressLine1: z.string().trim().max(200).optional().nullable().or(z.literal("")),
  city: z.string().trim().max(100).optional().nullable().or(z.literal("")),
  state: z.string().trim().max(50).optional().nullable().or(z.literal("")),
  zipCode: z.string().trim().max(20).optional().nullable().or(z.literal("")),
});

export const bulkImportLeadsSchema = z.object({
  body: z.object({
    taxYear: z.number().int().min(2000).max(2050),
    leads: z.array(leadItemSchema).min(1, "At least 1 lead row is required to import").max(20000, "Maximum 20,000 rows per batch upload"),
  }),
});

export const createEmployeeSchema = z.object({
  body: z.object({
    firstName: z.string().trim().min(2, "First name must be at least 2 characters"),
    lastName: z.string().trim().min(2, "Last name must be at least 2 characters"),
    email: z.string().trim().email("Valid work email is required"),
    mobile: z.string().trim().min(7, "Valid mobile number is required"),
    role: z.nativeEnum(Role, {
      message: "Valid department role is required",
    }),
    isActive: z.boolean().optional().default(true),
  }),
});

export const updateEmployeeSchema = z.object({
  body: z.object({
    firstName: z.string().trim().min(2).optional(),
    lastName: z.string().trim().min(2).optional(),
    email: z.string().trim().email("Valid work email is required").optional(),
    mobile: z.string().trim().min(7).optional(),
    role: z.nativeEnum(Role).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const bulkOnboardEmployeesSchema = z.object({
  body: z.object({
    employees: z.array(
      z.object({
        firstName: z.string().trim().min(2, "First name must be at least 2 characters"),
        lastName: z.string().trim().min(2, "Last name must be at least 2 characters"),
        email: z.string().trim().email("Valid work email is required"),
        mobile: z.string().trim().min(7, "Valid mobile number is required"),
        role: z.nativeEnum(Role, {
          message: "Valid department role is required",
        }),
        isActive: z.boolean().optional().default(true),
      })
    ).min(1, "At least 1 staff member is required"),
  }),
});
