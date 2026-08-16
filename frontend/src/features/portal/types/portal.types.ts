export interface TaxpayerProfile {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  ssnTinMasked: string;
  visaType: string;
  maritalStatus: string;
  city: string;
  state: string;
  clientSinceYear: number;
}

export type TaxYear = 'TY2025' | 'TY2024' | 'TY2023';

export type FilingStageStep = 
  | 'INTAKE_STARTED' 
  | 'DOC_REVIEW' 
  | 'QUOTATION_PENDING' 
  | 'FILING_PREPARATION' 
  | 'SIGNATURE_8879' 
  | 'IRS_ACCEPTED';

export interface PortalDocumentItem {
  id: string;
  taxYear: number;
  category: 'W2' | '1099' | 'VISA' | 'FINAL_RETURN' | 'IRS_ACCEPTANCE' | 'OTHER';
  name: string;
  size: string;
  uploadedAt: string;
  status: 'VERIFIED' | 'UNDER_REVIEW' | 'ACTION_REQUIRED';
  downloadUrl?: string;
}

export interface OrganizerModule {
  id: string;
  number: number;
  title: string;
  description: string;
  category: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED' | 'NOT_APPLICABLE';
  itemsCount: number;
}

export interface QuotationInvoiceItem {
  id: string;
  invoiceNumber: string;
  taxYear: number;
  description: string;
  amount: number;
  discount?: number;
  totalPayable: number;
  status: 'PENDING_PAYMENT' | 'PAID' | 'REFUNDED';
  paidAt?: string;
  paymentMethod?: string;
}

export interface TaxExpertProfile {
  name: string;
  role: string;
  email: string;
  phone: string;
  experience: string;
  avatarUrl?: string;
  assignedDepartment: string;
}
