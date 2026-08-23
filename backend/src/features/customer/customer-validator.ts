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
 * Zod Schema for Module 2 Spouse, Dependents & Daycare
 */
export const m2DependentsSchema = z.object({
  hasSpouse: z.boolean().optional().default(false),
  spouseFirstName: z.string().trim().max(50).optional().default(''),
  spouseMiddleName: z.string().trim().max(50).optional().default(''),
  spouseLastName: z.string().trim().max(50).optional().default(''),
  spouseName: z.string().trim().max(150).optional().default(''),
  spouseDob: z.string().trim().max(30).optional().default(''),
  spouseSsn: z.string().trim().max(30).optional().default(''),
  spouseOccupation: z.string().trim().max(100).optional().default(''),
  spouseVisaType: z.string().trim().max(50).optional().default('H-4 EAD'),
  spouseWorkPhone: z.string().trim().max(30).optional().default(''),
  spouseEmail: z.string().trim().max(100).optional().default(''),
  spouseRelationship: z.string().trim().max(50).optional().default('Spouse'),
  spouseList: z
    .array(
      z.object({
        firstName: z.string().trim().max(50).optional().default(''),
        middleName: z.string().trim().max(50).optional().default(''),
        lastName: z.string().trim().max(50).optional().default(''),
        dob: z.string().trim().max(30).optional().default(''),
        ssn: z.string().trim().max(30).optional().default(''),
        occupation: z.string().trim().max(100).optional().default(''),
        visaType: z.string().trim().max(50).optional().default('H-4 EAD'),
        workPhone: z.string().trim().max(30).optional().default(''),
        email: z.string().trim().max(100).optional().default(''),
        relationship: z.string().trim().max(50).optional().default('Spouse'),
      })
    )
    .optional()
    .default([]),
  hasDependents: z.boolean().optional().default(false),
  childCount: z.number().int().min(0).max(20).optional().default(0),
  dependentsList: z
    .array(
      z.object({
        firstName: z.string().trim().max(50).optional().default(''),
        middleName: z.string().trim().max(50).optional().default(''),
        lastName: z.string().trim().max(50).optional().default(''),
        name: z.string().trim().max(150).optional().default(''),
        dob: z.string().trim().max(30).optional().default(''),
        ssn: z.string().trim().max(30).optional().default(''),
        relationship: z.string().trim().max(50).optional().default('Son'),
        monthsInHome: z.number().int().min(0).max(12).optional().default(12),
      })
    )
    .optional()
    .default([]),
  daycareExpensesClaimed: z.boolean().optional().default(false),
  daycareProviderName: z.string().trim().max(150).optional().default(''),
  daycareProviderEin: z.string().trim().max(50).optional().default(''),
  daycareProviderAddress: z.string().trim().max(255).optional().default(''),
  daycareAmount: z.number().min(0).optional().default(0),
  employerReimbursedAmount: z.number().min(0).optional().default(0),
  daycareList: z
    .array(
      z.object({
        dependentName: z.string().trim().max(150).optional().default(''),
        providerName: z.string().trim().max(150).optional().default(''),
        providerEinSsn: z.string().trim().max(50).optional().default(''),
        providerAddress: z.string().trim().max(255).optional().default(''),
        amountPaid: z.number().min(0).optional().default(0),
        employerReimbursed: z.number().min(0).optional().default(0),
      })
    )
    .optional()
    .default([]),
});

/**
 * Zod Schema for Module 3 Substantial Presence & Multi-State
 */
export const m3PresenceSchema = z.object({
  days2025: z
    .number()
    .int('Days in U.S. must be an integer')
    .min(0, 'Days in U.S. cannot be negative (min: 0)')
    .max(366, 'Days in U.S. in a single calendar year cannot exceed 365 days (max: 366 for leap years)')
    .optional(),
  days2024: z
    .number()
    .int('Days in U.S. must be an integer')
    .min(0, 'Days in U.S. cannot be negative (min: 0)')
    .max(366, 'Days in U.S. in 2024 leap year cannot exceed 366 days')
    .optional(),
  days2023: z
    .number()
    .int('Days in U.S. must be an integer')
    .min(0, 'Days in U.S. cannot be negative (min: 0)')
    .max(365, 'Days in U.S. in 2023 cannot exceed 365 days')
    .optional(),
  visaType: z.string().trim().max(50).optional().default('H-1B'),
  statesResidedHistory: z
    .array(
      z.object({
        taxYear: z.number().int().min(2000).max(2100).optional().default(2025),
        state: z.string().trim().max(10).optional().default(''),
        fromDate: z.string().trim().max(30).optional().default(''),
        toDate: z.string().trim().max(30).optional().default(''),
        spouseState: z.string().trim().max(10).optional().default(''),
        spouseFromDate: z.string().trim().max(30).optional().default(''),
        spouseToDate: z.string().trim().max(30).optional().default(''),
      })
    )
    .optional()
    .default([]),
  cityCountyTaxesRequired: z.boolean().optional().default(false),
});

/**
 * Root Schema for Saving Organizer
 */
export const saveOrganizerSchema = z.object({
  body: z.object({
    taxYear: z.number().int().min(2000).max(2100).optional().default(2025),
    organizerData: z.object({
      m1_demographics: m1DemographicsSchema.optional(),
      m2_dependents: m2DependentsSchema.optional(),
      m3_presence: m3PresenceSchema.optional(),
      m4_wages: z.record(z.string(), z.any()).optional(),
      m5_interest: z.record(z.string(), z.any()).optional(),
      m6_stocks: z.record(z.string(), z.any()).optional(),
      m7_foreign: z.record(z.string(), z.any()).optional(),
      m8_deductions: z.record(z.string(), z.any()).optional(),
      m9_directDeposit: z.record(z.string(), z.any()).optional(),
    }),
  }),
});
