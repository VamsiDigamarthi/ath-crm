export interface CustomerProfileData {
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

export type TaxYearKey = 'TY2025' | 'TY2024' | 'TY2023';

export type CustomerFilingStage = 
  | 'INTAKE_STARTED' 
  | 'DOC_PREP' 
  | 'QUOTATION_PENDING' 
  | 'FILING_PREP' 
  | 'SIGNATURE_8879' 
  | 'IRS_ACCEPTED';

export interface CustomerDocumentItem {
  id: string;
  taxYear: number;
  category: 'W2' | '1099' | 'VISA' | 'FINAL_RETURN' | 'IRS_ACCEPTANCE' | 'OTHER';
  name: string;
  size: string;
  uploadedAt: string;
  status: 'VERIFIED' | 'UNDER_REVIEW' | 'ACTION_REQUIRED';
  downloadUrl?: string;
}

export interface CustomerOrganizerModule {
  id: string;
  number: number;
  title: string;
  description: string;
  category: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED' | 'NOT_APPLICABLE';
  itemsCount: number;
}

export interface CustomerInvoiceItem {
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

export interface CustomerTaxExpert {
  name: string;
  role: string;
  email: string;
  phone: string;
  experience: string;
  avatarUrl?: string;
  department: string;
}
