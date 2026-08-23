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
 * Zod Schema for Module 4 W-2 Wages & Rental Properties
 */
export const m4WagesSchema = z.object({
  hasW2: z.boolean().optional().default(true),
  employerName: z.string().trim().max(150).optional().default(''),
  estimatedWages: z.number().min(0).max(100000000).optional(),
  federalTaxWithheld: z.number().min(0).max(100000000).optional(),
  w2List: z
    .array(
      z.object({
        employerName: z.string().trim().max(150).optional().default(''),
        ein: z.string().trim().max(50).optional().default(''),
        box1Wages: z.number().min(0).optional().default(0),
        box2FederalTax: z.number().min(0).optional().default(0),
        state: z.string().trim().max(10).optional().default(''),
        stateTaxWithheld: z.number().min(0).optional().default(0),
      })
    )
    .optional()
    .default([]),
  hasRentalProperty: z.boolean().optional().default(false),
  rentalProperties: z
    .array(
      z.object({
        propertyType: z.string().trim().max(50).optional().default('RESIDENTIAL'),
        address: z.string().trim().max(255).optional().default(''),
        monthsRented2025: z.number().int().min(0).max(12).optional().default(12),
        personalMonths2025: z.number().int().min(0).max(12).optional().default(0),
        ownership: z.string().trim().max(50).optional().default('TAXPAYER'),
        purchaseDate: z.string().trim().max(30).optional().default(''),
        costOfProperty: z.number().min(0).optional().default(0),
        totalRentalIncome: z.number().min(0).optional().default(0),
        rentalExpenses: z.number().min(0).optional().default(0),
      })
    )
    .optional()
    .default([]),
});

/**
 * Zod Schema for Module 5 1099-INT / DIV / OID Interest & Dividends
 */
export const m5InterestSchema = z.object({
  hasInterestDividends: z.boolean().optional().default(false),
  bankName: z.string().trim().max(150).optional().default(''),
  interestAmount: z.number().min(0, 'Interest amount cannot be negative').max(100000000).optional().default(0),
  dividendAmount: z.number().min(0, 'Dividend amount cannot be negative').max(100000000).optional().default(0),
  form1099OidAmount: z.number().min(0, '1099-OID amount cannot be negative').max(100000000).optional().default(0),
  interestAccounts: z
    .array(
      z.object({
        bankName: z.string().trim().max(150).optional().default(''),
        interestAmount: z.number().min(0).optional().default(0),
        dividendAmount: z.number().min(0).optional().default(0),
      })
    )
    .optional()
    .default([]),
});

/**
 * Zod Schema for Module 6 1099-B Stocks, ESPP, RSU & Capital Losses
 */
export const m6StocksSchema = z.object({
  tradedStocks: z.boolean().optional().default(false),
  brokerName: z
    .string()
    .trim()
    .max(150)
    .refine((v) => !/<[^>]+>|<\s*script\b|javascript\s*:/i.test(v), 'HTML tags and script injections are forbidden')
    .optional()
    .default(''),
  totalCapitalGain: z.number().optional().default(0),
  capitalGain2025: z.number().optional().default(0),
  capitalLoss2025: z.number().optional().default(0),
  capitalLossCarryforward2023_2024: z.number().min(0).optional().default(0),
  capitalGainTaxpayer: z.number().optional().default(0),
  capitalLossTaxpayer: z.number().optional().default(0),
  lossCarryforwardTaxpayer: z.number().min(0).optional().default(0),
  capitalGainSpouse: z.number().optional().default(0),
  capitalLossSpouse: z.number().optional().default(0),
  lossCarryforwardSpouse: z.number().min(0).optional().default(0),
  esppRsuReported: z.boolean().optional().default(false),
  esppRsuDetails: z
    .string()
    .trim()
    .max(500)
    .refine((v) => !/<[^>]+>|<\s*script\b|javascript\s*:/i.test(v), 'HTML tags and script injections are forbidden')
    .optional()
    .default(''),
  stocksList: z
    .array(
      z.object({
        brokerName: z
          .string()
          .trim()
          .max(150)
          .refine((v) => !/<[^>]+>|<\s*script\b|javascript\s*:/i.test(v), 'HTML tags and script injections are forbidden')
          .optional()
          .default(''),
        taxpayerGainLoss: z.number().optional().default(0),
        spouseGainLoss: z.number().optional().default(0),
        shortTermGainLoss: z.number().optional().default(0),
        longTermGainLoss: z.number().optional().default(0),
        totalProceeds: z.number().min(0).optional().default(0),
      })
    )
    .optional()
    .default([]),
});

/**
 * Zod Schema for Module 7 FBAR / FATCA & Indian Income (INR)
 */
export const m7ForeignSchema = z.object({
  hasFbar: z.boolean().optional().default(false),
  hasFbarOver10k: z.enum(['YES', 'NO']).optional().default('NO'),
  spouseFbarOver10k: z.enum(['YES', 'NO']).optional().default('NO'),
  indianBankName: z
    .string()
    .trim()
    .max(150)
    .refine((v) => !/<[^>]+>|<\s*script\b|javascript\s*:/i.test(v), 'HTML tags and script injections are forbidden')
    .optional()
    .default(''),
  foreignSalaryInr: z.number().min(0).max(1000000000).optional().default(0),
  foreignInterestInr: z.number().min(0).max(1000000000).optional().default(0),
  foreignDividendInr: z.number().min(0).max(1000000000).optional().default(0),
  foreignRentalInr: z.number().min(0).max(1000000000).optional().default(0),
  otherForeignIncomeSource: z
    .string()
    .trim()
    .max(150)
    .refine((v) => !/<[^>]+>|<\s*script\b|javascript\s*:/i.test(v), 'HTML tags and script injections are forbidden')
    .optional()
    .default(''),
  otherForeignIncomeInr: z.number().min(0).max(1000000000).optional().default(0),
  foreignTaxesPaidInr: z.number().min(0).max(1000000000).optional().default(0),
  foreignAccountsList: z
    .array(
      z.object({
        bankName: z
          .string()
          .trim()
          .max(150)
          .refine((v) => !/<[^>]+>|<\s*script\b|javascript\s*:/i.test(v), 'HTML tags and script injections are forbidden')
          .optional()
          .default(''),
        accountType: z.string().trim().max(50).optional().default('SAVINGS_NRE'),
        accountNumber: z.string().trim().max(50).optional().default(''),
        maxBalanceInr: z.number().min(0).optional().default(0),
        interestEarnedInr: z.number().min(0).optional().default(0),
      })
    )
    .optional()
    .default([]),
});

/**
 * Zod Schema for Module 8 Itemized Deductions, Rent & Solar Energy
 */
export const m8DeductionsSchema = z.object({
  hasRentDeductions: z.boolean().optional().default(false),
  rentDeductionsList: z
    .array(
      z.object({
        state: z.string().trim().max(50).optional().default(''),
        months: z.number().int().min(0).max(12).optional().default(0),
        monthlyRent: z.number().min(0).optional().default(0),
        totalRentPaid: z.number().min(0).optional().default(0),
      })
    )
    .optional()
    .default([]),
  charitableDonations: z.number().min(0).optional().default(0),
  charitableList: z
    .array(
      z.object({
        institutionName: z
          .string()
          .trim()
          .max(150)
          .refine((v) => !/<[^>]+>|<\s*script\b|javascript\s*:/i.test(v), 'HTML tags and script injections are forbidden')
          .optional()
          .default(''),
        amountDonated: z.number().min(0).optional().default(0),
        donationType: z.string().trim().max(50).optional().default('CASH'),
      })
    )
    .optional()
    .default([]),
  lastYearTaxPrepFee: z.number().min(0).optional().default(0),
  lastYearTaxPrepFeeTaxpayer: z.number().min(0).optional().default(0),
  lastYearTaxPrepFeeSpouse: z.number().min(0).optional().default(0),
  mortgageInterest1098: z.number().min(0).optional().default(0),
  mortgageInterestTaxpayer: z.number().min(0).optional().default(0),
  mortgageInterestSpouse: z.number().min(0).optional().default(0),
  propertyTaxesUs: z.number().min(0).optional().default(0),
  propertyTaxesUsTaxpayer: z.number().min(0).optional().default(0),
  propertyTaxesUsSpouse: z.number().min(0).optional().default(0),
  propertyTaxesIndia: z.number().min(0).optional().default(0),
  propertyTaxesIndiaTaxpayer: z.number().min(0).optional().default(0),
  propertyTaxesIndiaSpouse: z.number().min(0).optional().default(0),
  medicalExpenses: z.number().min(0).optional().default(0),
  medicalExpensesTaxpayer: z.number().min(0).optional().default(0),
  medicalExpensesSpouse: z.number().min(0).optional().default(0),
  studentLoanInterest: z.number().min(0).optional().default(0),
  studentLoanInterestTaxpayer: z.number().min(0).optional().default(0),
  studentLoanInterestSpouse: z.number().min(0).optional().default(0),
  solarCleanEnergyExpenses: z.number().min(0).optional().default(0),
  solarCleanEnergyTaxpayer: z.number().min(0).optional().default(0),
  solarCleanEnergySpouse: z.number().min(0).optional().default(0),
  electricVehicleExpenses: z.number().min(0).optional().default(0),
  electricVehicleTaxpayer: z.number().min(0).optional().default(0),
  electricVehicleSpouse: z.number().min(0).optional().default(0),
  hsaContribution: z.number().min(0).optional().default(0),
  hsaTaxpayer: z.number().min(0).optional().default(0),
  hsaSpouse: z.number().min(0).optional().default(0),
  iraContribution: z.number().min(0).optional().default(0),
  iraTaxpayer: z.number().min(0).optional().default(0),
  iraSpouse: z.number().min(0).optional().default(0),
  educatorExpenses: z.number().min(0).optional().default(0),
  educatorExpensesTaxpayer: z.number().min(0).optional().default(0),
  educatorExpensesSpouse: z.number().min(0).optional().default(0),
  otherDeductionsDescription: z
    .string()
    .trim()
    .max(500)
    .refine((v) => !/<[^>]+>|<\s*script\b|javascript\s*:/i.test(v), 'HTML tags and script injections are forbidden')
    .optional()
    .default(''),
  otherDeductionsAmount: z.number().min(0).optional().default(0),
});

/**
 * Zod Schema for Module 9 Direct Deposit & Referrals
 */
export const m9DirectDepositSchema = z.object({
  bankName: z
    .string()
    .trim()
    .max(150)
    .refine((v) => !/<[^>]+>|<\s*script\b|javascript\s*:/i.test(v), 'HTML tags and script injections are forbidden')
    .optional()
    .default(''),
  accountType: z.enum(['CHECKING', 'SAVINGS']).optional().default('CHECKING'),
  routingNumber: z.string().trim().max(30).optional().default(''),
  accountNumber: z
    .string()
    .trim()
    .max(50)
    .refine((v) => !/<[^>]+>|<\s*script\b|javascript\s*:/i.test(v), 'HTML tags and script injections are forbidden')
    .optional()
    .default(''),
  accountOwnerName: z
    .string()
    .trim()
    .max(150)
    .refine((v) => !/<[^>]+>|<\s*script\b|javascript\s*:/i.test(v), 'HTML tags and script injections are forbidden')
    .optional()
    .default(''),
  notesToPreparer: z
    .string()
    .trim()
    .max(10000)
    .refine((v) => !/<[^>]+>|<\s*script\b|javascript\s*:/i.test(v), 'HTML tags and script injections are forbidden')
    .optional()
    .default(''),
  preferredContactTime: z
    .string()
    .trim()
    .max(1000)
    .refine((v) => !/<[^>]+>|<\s*script\b|javascript\s*:/i.test(v), 'HTML tags and script injections are forbidden')
    .optional()
    .default(''),
  referrals: z
    .array(
      z.object({
        name: z
          .string()
          .trim()
          .max(150)
          .refine((v) => !/<[^>]+>|<\s*script\b|javascript\s*:/i.test(v), 'HTML tags and script injections are forbidden')
          .optional()
          .default(''),
        email: z.string().trim().email('Invalid referral email address').optional().or(z.literal('')).default(''),
        phone: z.string().trim().max(30).optional().default(''),
      })
    )
    .optional()
    .default([]),
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
      m4_wages: m4WagesSchema.optional(),
      m5_interest: m5InterestSchema.optional(),
      m6_stocks: m6StocksSchema.optional(),
      m7_foreign: m7ForeignSchema.optional(),
      m8_deductions: m8DeductionsSchema.optional(),
      m9_directDeposit: m9DirectDepositSchema.optional(),
    }),
  }),
});
