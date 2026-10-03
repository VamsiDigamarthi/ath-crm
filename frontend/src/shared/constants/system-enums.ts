export interface EnumOption {
  label: string;
  value: string;
}

export const SYSTEM_ROLES: EnumOption[] = [
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Documenter Manager', value: 'DOC_MANAGER' },
  { label: 'Documenter Team Lead', value: 'DOC_TEAM_LEAD' },
  { label: 'Documenter Agent', value: 'DOC_AGENT' },
  { label: 'Tax Prep Manager', value: 'PREP_MANAGER' },
  { label: 'Tax Reviewer (QA Lead)', value: 'TAX_REVIEWER' },
  { label: 'Tax Preparer (Draftsman)', value: 'TAX_PREPARER' },
  { label: 'Sales Operations Manager', value: 'SALES_MANAGER' },
  { label: 'Sales Team Leader', value: 'SALES_TEAM_LEAD' },
  { label: 'Sales Pitch Agent', value: 'SALES_AGENT' },
  { label: 'CPA Operations Head', value: 'FILE_OP_MANAGER' },
  { label: 'Filing Team Leader', value: 'FILE_OP_TEAM_LEAD' },
  { label: 'IRS E-Filer (CPA)', value: 'FILE_OP_AGENT' },
];

export const SYSTEM_DEPARTMENTS: EnumOption[] = [
  { label: 'Documenter', value: 'DOC' },
  { label: 'Prep & Review', value: 'PREP_REVIEW' },
  { label: 'Sales', value: 'SALES' },
  { label: 'Filing Ops', value: 'FILE_OP' },
  { label: 'Admin', value: 'ADMIN' },
];

export const SYSTEM_STATUSES: EnumOption[] = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
];

export const SYSTEM_VISA_TYPES: EnumOption[] = [
  { label: 'H-1B', value: 'H-1B' },
  { label: 'L-1', value: 'L-1' },
  { label: 'F-1 OPT', value: 'F-1 OPT' },
  { label: 'H-4', value: 'H-4' },
  { label: 'Green Card', value: 'GREEN_CARD' },
  { label: 'US Citizen', value: 'US_CITIZEN' },
  { label: 'Other', value: 'OTHER' },
];

export const SYSTEM_STAGES: EnumOption[] = [
  { label: 'Raw Prospect', value: 'RAW_PROSPECT' },
  { label: 'Doc Outreach', value: 'DOC_OUTREACH' },
  { label: 'In Tax Prep', value: 'DOC_PREP' },
  { label: 'QA Review', value: 'QA_REVIEW' },
  { label: 'Sales Pitching', value: 'SALES_PITCHING' },
  { label: 'Payment Pending', value: 'PAYMENT_PENDING' },
  { label: 'Filing Queue', value: 'FILING_QUEUE' },
  { label: 'Transmitting MeF', value: 'FILING_IN_PROGRESS' },
  { label: 'IRS Accepted', value: 'FILING_SUCCESS' },
  { label: 'IRS Rejected', value: 'FILING_FAILED' },
];

export const SYSTEM_PAYMENT_STATUSES: EnumOption[] = [
  { label: 'Paid', value: 'PAID' },
  { label: 'Unpaid / Pending', value: 'UNPAID' },
  { label: 'Partially Paid', value: 'PARTIALLY_PAID' },
];

export const SYSTEM_IRS_STATUSES: EnumOption[] = [
  { label: 'Accepted', value: 'ACCEPTED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Pending', value: 'PENDING' },
];

export const SYSTEM_PRIORITIES: EnumOption[] = [
  { label: 'High', value: 'HIGH' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'Low', value: 'LOW' },
];
