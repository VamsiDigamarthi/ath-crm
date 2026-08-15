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
