export type LeadValidationStatus = 
  | 'VALID'
  | 'INVALID_NAME'
  | 'INVALID_EMAIL'
  | 'INVALID_PHONE'
  | 'INVALID_VISA'
  | 'INVALID_STATE'
  | 'MISSING_DATA';

export interface ParsedLeadRow extends Record<string, unknown> {
  id: string;
  rowNumber: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  ssnTin: string;
  dob?: string;
  occupation?: string;
  visaType?: string;
  maritalStatus?: string;
  taxYear: number;
  filingType: 'INDIVIDUAL' | 'CORPORATE';
  addressLine1: string;
  city: string;
  state: string;
  zipCode: string;
  estimatedIncome?: string;
  source: string;
  validationStatus: LeadValidationStatus;
  validationMessage?: string;
}

export interface BulkImportStatsData {
  total: number;
  valid: number;
  invalid: number;
}

export interface SkippedLeadItem {
  rowNumber: number;
  taxpayerName: string;
  email?: string | null;
  phone: string;
  ssnTin?: string | null;
  reason: string;
  reasonCategory?: 'EXISTING_CONVERTED_CUSTOMER' | 'EXISTING_CUSTOMER_PROFILE' | 'EXISTING_USER_ACCOUNT' | 'DUPLICATE_APPLICATION' | 'IN_SHEET_DUPLICATE' | 'INVALID_DATA' | string;
}

export interface BulkImportServerResult {
  totalReceived: number;
  validProcessed: number;
  newProfilesCreated: number;
  existingProfilesLinked: number;
  duplicatesSkipped: number;
  skippedLeads: SkippedLeadItem[];
  taxYear: number;
  processingTimeMs: number;
}
