import { z } from 'zod';

/**
 * Sanitizes input strings by stripping HTML tags and JavaScript injection vectors (XSS protection)
 */
export const sanitizeString = (val?: string | null): string => {
  if (!val || typeof val !== 'string') return '';
  return val
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove <script> tags
    .replace(/<[^>]+>/g, '') // Strip HTML tags
    .replace(/javascript:/gi, '') // Strip javascript: URIs
    .replace(/on\w+=/gi, '') // Strip inline event handlers like onclick=
    .trim();
};

/**
 * Recursively sanitizes any object or array of strings
 */
export const sanitizeObject = (obj: any): any => {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }
  if (obj !== null && typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      cleaned[key] = sanitizeObject(value);
    }
    return cleaned;
  }
  return obj;
};

/**
 * Zod Schema for Module 1 Demographics
 */
export const m1DemographicsSchema = z.object({
  firstName: z.string().trim().min(1, 'First Name is required as per SSN').max(50),
  middleName: z.string().trim().max(50).optional().default(''),
  lastName: z.string().trim().min(1, 'Last Name is required as per SSN').max(50),
  fullName: z.string().trim().max(150).optional().default(''),
  dob: z.string().trim().max(30).optional().default(''),
  ssnMasked: z.string().trim().max(30).optional().default(''),
  relationshipToPrimary: z.enum(['SELF', 'SPOUSE', 'CHILD', 'PARENT']).optional().default('SELF'),
  occupation: z.string().trim().max(100).optional().default(''),
  phone: z.string().trim().max(30).optional().default(''),
  workPhone: z.string().trim().max(30).optional().default(''),
  email: z.string().trim().email('Please provide a valid email address').optional().or(z.literal('')).default(''),
  visaType: z.string().max(50).optional().default('H-1B'),
  visaStatusChanged2025: z.enum(['YES', 'NO']).optional().default('NO'),
  visaChangeDate: z.string().max(30).optional().default(''),
  firstPortOfEntryDate: z.string().max(30).optional().default(''),
  stayMoreThan6Months2026: z.enum(['YES', 'NO']).optional().default('YES'),
  monthsStayedInUs2025: z
    .number()
    .int('Months stayed must be an integer')
    .min(0, 'Months stayed cannot be negative (min: 0)')
    .max(12, 'Months stayed in a year cannot exceed 12 months (max: 12)')
    .optional()
    .default(12),
  maritalStatus: z.string().max(50).optional().default('Single'),
  dateOfMarriage: z.string().max(30).optional().default(''),
  residentialAddress: z.string().trim().max(255).optional().default(''),
  city: z.string().trim().max(100).optional().default(''),
  state: z.string().trim().max(10).optional().default(''),
  zipCode: z.string().trim().max(20).optional().default(''),
});

/**
 * Root Schema for Saving Organizer
 */
export const saveOrganizerSchema = z.object({
  body: z.object({
    taxYear: z.number().int().min(2000).max(2100).optional().default(2025),
    organizerData: z.object({
      m1_demographics: m1DemographicsSchema.optional(),
      m2_dependents: z.record(z.string(), z.any()).optional(),
      m3_presence: z.record(z.string(), z.any()).optional(),
      m4_wages: z.record(z.string(), z.any()).optional(),
      m5_interest: z.record(z.string(), z.any()).optional(),
      m6_stocks: z.record(z.string(), z.any()).optional(),
      m7_foreign: z.record(z.string(), z.any()).optional(),
      m8_deductions: z.record(z.string(), z.any()).optional(),
      m9_directDeposit: z.record(z.string(), z.any()).optional(),
    }),
  }),
});
