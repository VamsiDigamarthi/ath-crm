import { 
  User, 
  Briefcase, 
  ShieldCheck, 
  Scale
} from 'lucide-react';

export type DocumentTypeId = 'INDIVIDUAL' | 'BUSINESS' | 'TAX_COMPLIANCE' | 'TAX_AUDIT';

export interface DocumentTypeDefinition {
  id: DocumentTypeId;
  number: number;
  label: string;
  shortLabel: string;
  description: string;
  icon: any;
  colorClass: string;
  badgeClass: string;
}

export interface DocumentCategoryItem {
  value: string;
  label: string;
  shortLabel?: string;
  docType: DocumentTypeId;
  isDriveLink?: boolean;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export const DOCUMENT_TYPES: DocumentTypeDefinition[] = [
  {
    id: 'INDIVIDUAL',
    number: 1,
    label: 'Individual',
    shortLabel: 'Individual',
    description: 'W-2 wages, 1099 interest/dividends, 1098 deductions, identity & prior returns',
    icon: User,
    colorClass: 'text-blue-600 bg-blue-50 border-blue-200',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: 'BUSINESS',
    number: 2,
    label: 'Business',
    shortLabel: 'Business',
    description: 'Schedule C, 1099-NEC/MISC, K-1, P&L, incorporation & corporate 1120/1065',
    icon: Briefcase,
    colorClass: 'text-amber-600 bg-amber-50 border-amber-200',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  {
    id: 'TAX_COMPLIANCE',
    number: 3,
    label: 'Tax compliance FBAR/FATCA/Other',
    shortLabel: 'FBAR / FATCA & Compliance',
    description: 'FBAR FinCEN 114, FATCA 8938, Indian bank accounts, 26AS/AIS & foreign assets',
    icon: ShieldCheck,
    colorClass: 'text-purple-600 bg-purple-50 border-purple-200',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  {
    id: 'TAX_AUDIT',
    number: 4,
    label: 'Tax Audit',
    shortLabel: 'Tax Audit',
    description: 'IRS/State notices, audit letters, Form 2848 POA & substantiation records',
    icon: Scale,
    colorClass: 'text-rose-600 bg-rose-50 border-rose-200',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
];

export const ALL_DOCUMENT_CATEGORIES: DocumentCategoryItem[] = [
  // ==========================================
  // 1. INDIVIDUAL CATEGORIES
  // ==========================================
  {
    value: 'W2_WAGES',
    label: 'W-2 Wage Statement (Employer)',
    shortLabel: 'W-2 Wages',
    docType: 'INDIVIDUAL',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
  },
  {
    value: '1099_INT',
    label: '1099-INT Bank Interest Statement',
    shortLabel: '1099-INT',
    docType: 'INDIVIDUAL',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
  },
  {
    value: '1099_DIV',
    label: '1099-DIV Dividends & Distributions',
    shortLabel: '1099-DIV',
    docType: 'INDIVIDUAL',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
  },
  {
    value: '1099_INT_DIV',
    label: '1099-INT / 1099-DIV Consolidated Interest & Dividends',
    shortLabel: '1099-INT/DIV',
    docType: 'INDIVIDUAL',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
  },
  {
    value: '1099_BROKERAGE',
    label: '1099-B Brokerage & Stocks (Robinhood, ESPP, RSU)',
    shortLabel: '1099-B Stocks',
    docType: 'INDIVIDUAL',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
  },
  {
    value: '1099_B',
    label: '1099-B Capital Gains & Stock Sales',
    shortLabel: '1099-B',
    docType: 'INDIVIDUAL',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
  },
  {
    value: '1098_MORTGAGE',
    label: '1098 Mortgage Interest Statement',
    shortLabel: '1098 Mortgage',
    docType: 'INDIVIDUAL',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    badgeBorder: 'border-indigo-200',
  },
  {
    value: 'MORTGAGE_1098',
    label: '1098 Mortgage Interest Statement (Home Loan)',
    shortLabel: '1098 Mortgage',
    docType: 'INDIVIDUAL',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    badgeBorder: 'border-indigo-200',
  },
  {
    value: '1098_T_TUITION',
    label: '1098-T Tuition Fees Statement (University / College)',
    shortLabel: '1098-T Tuition',
    docType: 'INDIVIDUAL',
    badgeBg: 'bg-violet-50',
    badgeText: 'text-violet-700',
    badgeBorder: 'border-violet-200',
  },
  {
    value: '1098_E_STUDENT_LOAN',
    label: '1098-E Student Loan Interest Statement',
    shortLabel: '1098-E Loan',
    docType: 'INDIVIDUAL',
    badgeBg: 'bg-violet-50',
    badgeText: 'text-violet-700',
    badgeBorder: 'border-violet-200',
  },
  {
    value: '1099_R_RETIREMENT',
    label: '1099-R Retirement, Annuity & 401(k) Distributions',
    shortLabel: '1099-R 401k',
    docType: 'INDIVIDUAL',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    badgeBorder: 'border-indigo-200',
  },
  {
    value: '1099_R',
    label: '1099-R Pension & IRA Distributions',
    shortLabel: '1099-R',
    docType: 'INDIVIDUAL',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    badgeBorder: 'border-indigo-200',
  },
  {
    value: '1099_G_STATE_REFUND',
    label: '1099-G State Refund / Unemployment Compensation',
    shortLabel: '1099-G State',
    docType: 'INDIVIDUAL',
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-700',
    badgeBorder: 'border-teal-200',
  },
  {
    value: '1099_SA_HSA',
    label: '1099-SA HSA / Archer MSA Distributions',
    shortLabel: '1099-SA HSA',
    docType: 'INDIVIDUAL',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-200',
  },
  {
    value: '1099_OID',
    label: '1099-OID Original Issue Discount',
    shortLabel: '1099-OID',
    docType: 'INDIVIDUAL',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
  },
  {
    value: '1099_C_DEBT',
    label: '1099-C Cancellation of Debt',
    shortLabel: '1099-C Debt',
    docType: 'INDIVIDUAL',
    badgeBg: 'bg-slate-50',
    badgeText: 'text-slate-700',
    badgeBorder: 'border-slate-200',
  },
  {
    value: '1099_Q_EDUCATION',
    label: '1099-Q Payments from Qualified Education Programs (529)',
    shortLabel: '1099-Q 529',
    docType: 'INDIVIDUAL',
    badgeBg: 'bg-violet-50',
    badgeText: 'text-violet-700',
    badgeBorder: 'border-violet-200',
  },
  {
    value: '1099_HC_MA_HEALTH',
    label: '1099-HC Massachusetts Health Insurance Statement',
    shortLabel: '1099-HC Health',
    docType: 'INDIVIDUAL',
    badgeBg: 'bg-pink-50',
    badgeText: 'text-pink-700',
    badgeBorder: 'border-pink-200',
  },
  {
    value: '1095_A_MARKETPLACE',
    label: '1095-A / 1095-B / 1095-C Health Marketplace (ACA)',
    shortLabel: '1095-A ACA',
    docType: 'INDIVIDUAL',
    badgeBg: 'bg-pink-50',
    badgeText: 'text-pink-700',
    badgeBorder: 'border-pink-200',
  },
  {
    value: 'W2_G_GAMBLING',
    label: 'W-2G Certain Gambling Winnings',
    shortLabel: 'W-2G Gaming',
    docType: 'INDIVIDUAL',
    badgeBg: 'bg-yellow-50',
    badgeText: 'text-yellow-800',
    badgeBorder: 'border-yellow-200',
  },
  {
    value: 'STOCK_3921_3922',
    label: 'Form 3921 / 3922 Employer Stock (ESPP / ISO Exercise)',
    shortLabel: '3921/3922 ESPP',
    docType: 'INDIVIDUAL',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
  },
  {
    value: 'VISA_IDENTITY',
    label: 'Visa Copy, Passport & I-797 Approval Notice',
    shortLabel: 'Visa / ID',
    docType: 'INDIVIDUAL',
    badgeBg: 'bg-cyan-50',
    badgeText: 'text-cyan-700',
    badgeBorder: 'border-cyan-200',
  },
  {
    value: 'ID_PASSPORT_VISA',
    label: 'Taxpayer ID / Passport / Visa Copy',
    shortLabel: 'ID / Passport',
    docType: 'INDIVIDUAL',
    badgeBg: 'bg-cyan-50',
    badgeText: 'text-cyan-700',
    badgeBorder: 'border-cyan-200',
  },
  {
    value: 'PRIOR_YEAR_RETURN',
    label: 'Prior Year Tax Returns (TY 2024 / 2023 / 2022)',
    shortLabel: 'Prior 1040',
    docType: 'INDIVIDUAL',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-800',
    badgeBorder: 'border-slate-300',
  },
  {
    value: 'PREVIOUS_1040',
    label: 'Prior Year 1040 Tax Return',
    shortLabel: 'Prior 1040',
    docType: 'INDIVIDUAL',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-800',
    badgeBorder: 'border-slate-300',
  },
  {
    value: 'FORM_8879',
    label: 'Form 8879 E-Sign Signature Form',
    shortLabel: 'Form 8879 E-Sign',
    docType: 'INDIVIDUAL',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    badgeBorder: 'border-purple-200',
  },
  {
    value: 'DAYCARE_RECEIPTS',
    label: 'Daycare Provider Statements / Receipts (Child Care)',
    shortLabel: 'Daycare Receipts',
    docType: 'INDIVIDUAL',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
  },
  {
    value: 'SOLAR_ENERGY_INVOICE',
    label: 'Clean Energy & Solar Invoices (Form 5695)',
    shortLabel: 'Solar Invoice',
    docType: 'INDIVIDUAL',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
  },
  {
    value: 'PROPERTY_TAX_RECEIPTS',
    label: 'Property Tax Receipts (US County & India Municipal)',
    shortLabel: 'Property Tax',
    docType: 'INDIVIDUAL',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    badgeBorder: 'border-indigo-200',
  },
  {
    value: 'CHARITY_DONATIONS',
    label: 'Charitable Donation 501(c)(3) Receipts',
    shortLabel: 'Charity Receipts',
    docType: 'INDIVIDUAL',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
  },
  {
    value: 'RENTAL_EXPENSES',
    label: 'Rental Property Expenses & Rent Slips',
    shortLabel: 'Rental Expenses',
    docType: 'INDIVIDUAL',
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-700',
    badgeBorder: 'border-teal-200',
  },
  {
    value: 'OTHER',
    label: 'Other Personal Tax Form / Expense Receipt',
    shortLabel: 'Other Individual',
    docType: 'INDIVIDUAL',
    badgeBg: 'bg-slate-50',
    badgeText: 'text-slate-700',
    badgeBorder: 'border-slate-200',
  },
  {
    value: 'OTHER_DOCUMENT',
    label: 'Other Tax Form / Expense Receipt',
    shortLabel: 'Other Document',
    docType: 'INDIVIDUAL',
    badgeBg: 'bg-slate-50',
    badgeText: 'text-slate-700',
    badgeBorder: 'border-slate-200',
  },
  {
    value: 'INDIVIDUAL_DRIVE_LINK',
    label: 'Individual Tax Documents Cloud / Drive Folder',
    shortLabel: 'Drive Link',
    docType: 'INDIVIDUAL',
    isDriveLink: true,
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    badgeBorder: 'border-indigo-200',
  },

  // ==========================================
  // 2. BUSINESS CATEGORIES
  // ==========================================
  {
    value: 'SCHEDULE_C',
    label: 'Schedule C Business Income & Expense Ledger',
    shortLabel: 'Schedule C',
    docType: 'BUSINESS',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
  },
  {
    value: '1099_MISC',
    label: '1099-MISC / 1099-NEC Freelance & Contractor Income',
    shortLabel: '1099-MISC/NEC',
    docType: 'BUSINESS',
    badgeBg: 'bg-orange-50',
    badgeText: 'text-orange-700',
    badgeBorder: 'border-orange-200',
  },
  {
    value: '1099_NEC',
    label: '1099-NEC Nonemployee Compensation',
    shortLabel: '1099-NEC',
    docType: 'BUSINESS',
    badgeBg: 'bg-orange-50',
    badgeText: 'text-orange-700',
    badgeBorder: 'border-orange-200',
  },
  {
    value: '1099_K_PAYMENTS',
    label: '1099-K Payment Card & Third-Party Network (Stripe, PayPal)',
    shortLabel: '1099-K Card',
    docType: 'BUSINESS',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
  },
  {
    value: 'SCHEDULE_K1',
    label: 'Schedule K-1 (Partnership / S-Corp / Estate Form 1065/1120-S)',
    shortLabel: 'Schedule K-1',
    docType: 'BUSINESS',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
  },
  {
    value: 'FORM_1120_CORP',
    label: 'Form 1120 / 1120-S Corporate Tax Return',
    shortLabel: 'Form 1120 Corp',
    docType: 'BUSINESS',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
  },
  {
    value: 'FORM_1065_PARTNERSHIP',
    label: 'Form 1065 Partnership Tax Return',
    shortLabel: 'Form 1065 Partner',
    docType: 'BUSINESS',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
  },
  {
    value: 'BUSINESS_PNL_STATEMENT',
    label: 'Business Profit & Loss Statement (P&L / Income Statement)',
    shortLabel: 'Business P&L',
    docType: 'BUSINESS',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
  },
  {
    value: 'BUSINESS_BALANCE_SHEET',
    label: 'Business Balance Sheet & Asset Register',
    shortLabel: 'Balance Sheet',
    docType: 'BUSINESS',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
  },
  {
    value: 'BUSINESS_BANK_STATEMENTS',
    label: 'Business Bank & Merchant Account Statements',
    shortLabel: 'Business Bank',
    docType: 'BUSINESS',
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-700',
    badgeBorder: 'border-teal-200',
  },
  {
    value: 'BUSINESS_EIN_ARTICLES',
    label: 'Business Articles of Incorporation / EIN Official Letter',
    shortLabel: 'EIN / Articles',
    docType: 'BUSINESS',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    badgeBorder: 'border-indigo-200',
  },
  {
    value: 'BUSINESS_EXPENSES',
    label: 'Business Invoices, Mileage & Receipt Records',
    shortLabel: 'Business Receipts',
    docType: 'BUSINESS',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
  },
  {
    value: 'BUSINESS_DRIVE_LINK',
    label: 'Business Tax Documents Cloud / Drive Folder',
    shortLabel: 'Business Drive Link',
    docType: 'BUSINESS',
    isDriveLink: true,
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
  },

  // ==========================================
  // 3. TAX COMPLIANCE FBAR/FATCA/OTHER
  // ==========================================
  {
    value: 'FBAR_FOREIGN',
    label: 'FBAR FinCEN 114 Foreign Indian Bank Accounts',
    shortLabel: 'FBAR FinCEN 114',
    docType: 'TAX_COMPLIANCE',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    badgeBorder: 'border-purple-200',
  },
  {
    value: 'FBAR_FINCEN_114',
    label: 'FinCEN Form 114 FBAR Annual Report',
    shortLabel: 'FBAR 114',
    docType: 'TAX_COMPLIANCE',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    badgeBorder: 'border-purple-200',
  },
  {
    value: 'FATCA_FORM_8938',
    label: 'FATCA Form 8938 Specified Foreign Assets Statement',
    shortLabel: 'FATCA 8938',
    docType: 'TAX_COMPLIANCE',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    badgeBorder: 'border-purple-200',
  },
  {
    value: 'INDIAN_NRE_NRO_STATEMENTS',
    label: 'Indian Bank Statements (SBI / HDFC / ICICI NRE & NRO)',
    shortLabel: 'NRE/NRO Bank',
    docType: 'TAX_COMPLIANCE',
    badgeBg: 'bg-violet-50',
    badgeText: 'text-violet-700',
    badgeBorder: 'border-violet-200',
  },
  {
    value: 'INDIAN_FD_RD_RECORDS',
    label: 'Indian Fixed Deposits & Recurring Deposit Certificates',
    shortLabel: 'Indian FD / RD',
    docType: 'TAX_COMPLIANCE',
    badgeBg: 'bg-violet-50',
    badgeText: 'text-violet-700',
    badgeBorder: 'border-violet-200',
  },
  {
    value: 'INDIAN_ITR_FORM_16',
    label: 'Indian Income Tax Return (ITR) / Form 16 / Salary Slips',
    shortLabel: 'Indian ITR / Form 16',
    docType: 'TAX_COMPLIANCE',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
  },
  {
    value: 'INDIAN_26AS_AIS_TDS',
    label: 'Indian Form 26AS, AIS (Annual Information) & TDS Certificates',
    shortLabel: '26AS / AIS / TDS',
    docType: 'TAX_COMPLIANCE',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
  },
  {
    value: 'INDIAN_MUTUAL_FUNDS_STOCKS',
    label: 'Indian Mutual Funds, Demat Portfolio & Capital Gains',
    shortLabel: 'Indian Mutual Funds',
    docType: 'TAX_COMPLIANCE',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
  },
  {
    value: 'INDIAN_INSURANCE_POLICIES',
    label: 'Traditional Insurance / Unit Linked (ULIP) Policy Records',
    shortLabel: 'ULIP / Insurance',
    docType: 'TAX_COMPLIANCE',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    badgeBorder: 'border-purple-200',
  },
  {
    value: 'FOREIGN_PROPERTY_RECORDS',
    label: 'Foreign Real Estate Purchase, Sale & Rental Records',
    shortLabel: 'Foreign Property',
    docType: 'TAX_COMPLIANCE',
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-700',
    badgeBorder: 'border-teal-200',
  },
  {
    value: 'FOREIGN_OTHER_COMPLIANCE',
    label: 'Other Foreign Compliance & Indian Tax Documents',
    shortLabel: 'Foreign Compliance',
    docType: 'TAX_COMPLIANCE',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    badgeBorder: 'border-purple-200',
  },
  {
    value: 'FBAR_FATCA_DRIVE_LINK',
    label: 'FBAR / FATCA & Foreign Accounts Cloud / Drive Folder',
    shortLabel: 'FBAR Drive Link',
    docType: 'TAX_COMPLIANCE',
    isDriveLink: true,
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    badgeBorder: 'border-purple-200',
  },

  // ==========================================
  // 4. TAX AUDIT CATEGORIES
  // ==========================================
  {
    value: 'IRS_NOTICE_AUDIT',
    label: 'IRS Notice / Inquiry Letter (CP2000, CP501, Letter 525)',
    shortLabel: 'IRS Notice',
    docType: 'TAX_AUDIT',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-200',
  },
  {
    value: 'STATE_TAX_NOTICE',
    label: 'State Tax Department Notice / Inquiry Letter',
    shortLabel: 'State Notice',
    docType: 'TAX_AUDIT',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-200',
  },
  {
    value: 'FORM_2848_POA',
    label: 'Form 2848 Power of Attorney (CPA Representation)',
    shortLabel: 'Form 2848 POA',
    docType: 'TAX_AUDIT',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    badgeBorder: 'border-indigo-200',
  },
  {
    value: 'FORM_8821_TIA',
    label: 'Form 8821 Tax Information Authorization',
    shortLabel: 'Form 8821 TIA',
    docType: 'TAX_AUDIT',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    badgeBorder: 'border-indigo-200',
  },
  {
    value: 'AUDIT_EVIDENCE_RECORDS',
    label: 'Audit Substantiation Expense Receipts & Bank Proofs',
    shortLabel: 'Audit Evidence',
    docType: 'TAX_AUDIT',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
  },
  {
    value: 'AUDIT_CLOSING_LETTER',
    label: 'IRS Audit Examination Report / Closing Letter',
    shortLabel: 'Audit Closing Letter',
    docType: 'TAX_AUDIT',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
  },
  {
    value: 'PENALTY_ABATEMENT_DOCS',
    label: 'Tax Penalty Abatement Request & Reasonable Cause Proofs',
    shortLabel: 'Penalty Abatement',
    docType: 'TAX_AUDIT',
    badgeBg: 'bg-yellow-50',
    badgeText: 'text-yellow-800',
    badgeBorder: 'border-yellow-200',
  },
  {
    value: 'AUDIT_DRIVE_LINK',
    label: 'Tax Audit Representation Cloud / Drive Folder',
    shortLabel: 'Audit Drive Link',
    docType: 'TAX_AUDIT',
    isDriveLink: true,
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-200',
  },

  // Legacy Generic Drive Links
  {
    value: 'GOOGLE_DRIVE_LINK',
    label: 'Google Drive / Cloud Folder (All Documents)',
    shortLabel: 'Drive Folder',
    docType: 'INDIVIDUAL',
    isDriveLink: true,
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    badgeBorder: 'border-indigo-200',
  },
  {
    value: 'DRIVE_LINK',
    label: 'Cloud / Drive Link',
    shortLabel: 'Drive Link',
    docType: 'INDIVIDUAL',
    isDriveLink: true,
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    badgeBorder: 'border-indigo-200',
  },
];

/**
 * Maps any category code / string to its parent DocumentTypeId
 */
export function getDocumentTypeForCategory(category?: string): DocumentTypeId {
  if (!category) return 'INDIVIDUAL';
  const upper = category.toUpperCase().trim();

  // Explicit match in registry
  const match = ALL_DOCUMENT_CATEGORIES.find((c) => c.value.toUpperCase() === upper);
  if (match) return match.docType;

  // Heuristic fallbacks for legacy/free-text categories
  if (
    upper.includes('BUSINESS') ||
    upper.includes('SCHEDULE_C') ||
    upper.includes('1120') ||
    upper.includes('1065') ||
    upper.includes('PNL') ||
    upper.includes('K1') ||
    upper.includes('K-1') ||
    upper.includes('EIN') ||
    upper.includes('1099-NEC') ||
    upper.includes('1099_NEC') ||
    upper.includes('1099-MISC') ||
    upper.includes('1099_MISC') ||
    upper.includes('1099-K') ||
    upper.includes('1099_K')
  ) {
    return 'BUSINESS';
  }

  if (
    upper.includes('FBAR') ||
    upper.includes('FATCA') ||
    upper.includes('8938') ||
    upper.includes('114') ||
    upper.includes('INDIAN') ||
    upper.includes('NRE') ||
    upper.includes('NRO') ||
    upper.includes('FOREIGN') ||
    upper.includes('26AS') ||
    upper.includes('AIS') ||
    upper.includes('TIS') ||
    upper.includes('INR') ||
    upper.includes('INDIA')
  ) {
    return 'TAX_COMPLIANCE';
  }

  if (
    upper.includes('AUDIT') ||
    upper.includes('NOTICE') ||
    upper.includes('CP2000') ||
    upper.includes('CP501') ||
    upper.includes('2848') ||
    upper.includes('8821') ||
    upper.includes('PENALTY') ||
    upper.includes('ABATEMENT') ||
    upper.includes('INQUIRY')
  ) {
    return 'TAX_AUDIT';
  }

  return 'INDIVIDUAL';
}

/**
 * Returns all categories belonging to a specific DocumentType
 */
export function getCategoriesForType(type: DocumentTypeId, includeDriveLinks: boolean = true): DocumentCategoryItem[] {
  return ALL_DOCUMENT_CATEGORIES.filter((c) => c.docType === type && (includeDriveLinks || !c.isDriveLink));
}

/**
 * Returns formatted select options grouped by Document Type
 */
export function getGroupedCategoryOptions(includeDriveLinks: boolean = false) {
  return DOCUMENT_TYPES.map((dt) => ({
    label: dt.label,
    options: getCategoriesForType(dt.id, includeDriveLinks).map((c) => ({
      label: c.label,
      value: c.value,
    })),
  }));
}

/**
 * Returns the default category for a specific DocumentType
 */
export function getDefaultCategoryForType(type: DocumentTypeId): string {
  switch (type) {
    case 'BUSINESS':
      return 'SCHEDULE_C';
    case 'TAX_COMPLIANCE':
      return 'FBAR_FOREIGN';
    case 'TAX_AUDIT':
      return 'IRS_NOTICE_AUDIT';
    case 'INDIVIDUAL':
    default:
      return 'W2_WAGES';
  }
}

/**
 * Returns the default Drive Link category for a specific DocumentType
 */
export function getDefaultDriveLinkForType(type: DocumentTypeId): string {
  switch (type) {
    case 'BUSINESS':
      return 'BUSINESS_DRIVE_LINK';
    case 'TAX_COMPLIANCE':
      return 'FBAR_FATCA_DRIVE_LINK';
    case 'TAX_AUDIT':
      return 'AUDIT_DRIVE_LINK';
    case 'INDIVIDUAL':
    default:
      return 'INDIVIDUAL_DRIVE_LINK';
  }
}

/**
 * Detects category from filename scoped to a specific DocumentType
 */
export function detectCategoryForType(name: string, type: DocumentTypeId): string {
  const lower = name.toLowerCase();

  if (type === 'BUSINESS') {
    if (lower.includes('1099-nec') || lower.includes('1099nec') || lower.includes('nec')) return '1099_NEC';
    if (lower.includes('1099-misc') || lower.includes('1099misc') || lower.includes('misc')) return '1099_MISC';
    if (lower.includes('1099-k') || lower.includes('1099k') || lower.includes('stripe') || lower.includes('paypal')) return '1099_K_PAYMENTS';
    if (lower.includes('k-1') || lower.includes('k1') || lower.includes('schedule k')) return 'SCHEDULE_K1';
    if (lower.includes('1120') || lower.includes('corporate')) return 'FORM_1120_CORP';
    if (lower.includes('1065') || lower.includes('partnership')) return 'FORM_1065_PARTNERSHIP';
    if (lower.includes('p&l') || lower.includes('profit') || lower.includes('income statement')) return 'BUSINESS_PNL_STATEMENT';
    if (lower.includes('balance sheet') || lower.includes('asset')) return 'BUSINESS_BALANCE_SHEET';
    if (lower.includes('bank') || lower.includes('statement') || lower.includes('merchant')) return 'BUSINESS_BANK_STATEMENTS';
    if (lower.includes('ein') || lower.includes('article') || lower.includes('incorporation') || lower.includes('llc')) return 'BUSINESS_EIN_ARTICLES';
    if (lower.includes('expense') || lower.includes('mileage') || lower.includes('receipt') || lower.includes('invoice')) return 'BUSINESS_EXPENSES';
    return 'SCHEDULE_C';
  }

  if (type === 'TAX_COMPLIANCE') {
    if (lower.includes('fincen') || lower.includes('114')) return 'FBAR_FINCEN_114';
    if (lower.includes('8938') || lower.includes('fatca')) return 'FATCA_FORM_8938';
    if (lower.includes('nre') || lower.includes('nro') || lower.includes('sbi') || lower.includes('hdfc') || lower.includes('icici')) return 'INDIAN_NRE_NRO_STATEMENTS';
    if (lower.includes('fd') || lower.includes('fixed') || lower.includes('deposit') || lower.includes('rd') || lower.includes('recurring')) return 'INDIAN_FD_RD_RECORDS';
    if (lower.includes('itr') || lower.includes('form 16') || lower.includes('form16') || lower.includes('saral')) return 'INDIAN_ITR_FORM_16';
    if (lower.includes('26as') || lower.includes('ais') || lower.includes('tis') || lower.includes('tds')) return 'INDIAN_26AS_AIS_TDS';
    if (lower.includes('mutual') || lower.includes('mf') || lower.includes('demat') || lower.includes('zerodha') || lower.includes('groww') || lower.includes('cams')) return 'INDIAN_MUTUAL_FUNDS_STOCKS';
    if (lower.includes('lic') || lower.includes('insurance') || lower.includes('ulip') || lower.includes('policy')) return 'INDIAN_INSURANCE_POLICIES';
    if (lower.includes('property') || lower.includes('flat') || lower.includes('land') || lower.includes('registry')) return 'FOREIGN_PROPERTY_RECORDS';
    return 'FBAR_FOREIGN';
  }

  if (type === 'TAX_AUDIT') {
    if (lower.includes('cp2000') || lower.includes('cp501') || lower.includes('525') || lower.includes('irs') || lower.includes('examination')) return 'IRS_NOTICE_AUDIT';
    if (lower.includes('state') || lower.includes('franchise') || lower.includes('california') || lower.includes('department of revenue')) return 'STATE_TAX_NOTICE';
    if (lower.includes('2848') || lower.includes('poa') || lower.includes('power of attorney')) return 'FORM_2848_POA';
    if (lower.includes('8821') || lower.includes('tia') || lower.includes('authorization')) return 'FORM_8821_TIA';
    if (lower.includes('closing') || lower.includes('report') || lower.includes('agreement') || lower.includes('letter')) return 'AUDIT_CLOSING_LETTER';
    if (lower.includes('penalty') || lower.includes('abatement') || lower.includes('reasonable cause')) return 'PENALTY_ABATEMENT_DOCS';
    return 'AUDIT_EVIDENCE_RECORDS';
  }

  // Individual
  if (lower.includes('w-2') || lower.includes('w2') || lower.includes('wage')) return 'W2_WAGES';
  if (lower.includes('1099-int') || lower.includes('1099int') || lower.includes('interest')) return '1099_INT';
  if (lower.includes('1099-div') || lower.includes('1099div') || lower.includes('dividend')) return '1099_DIV';
  if (lower.includes('1099-b') || lower.includes('1099b') || lower.includes('stock') || lower.includes('brokerage') || lower.includes('trade')) return '1099_BROKERAGE';
  if (lower.includes('1098-t') || lower.includes('tuition')) return '1098_T_TUITION';
  if (lower.includes('1098-e') || lower.includes('student')) return '1098_E_STUDENT_LOAN';
  if (lower.includes('1098') || lower.includes('mortgage')) return 'MORTGAGE_1098';
  if (lower.includes('passport') || lower.includes('visa') || lower.includes('i797') || lower.includes('i-797') || lower.includes('id_') || lower.includes('dl_')) return 'VISA_IDENTITY';
  if (lower.includes('1040') || lower.includes('prior') || lower.includes('previous')) return 'PRIOR_YEAR_RETURN';
  if (lower.includes('hsa') || lower.includes('1099-sa')) return '1099_SA_HSA';
  if (lower.includes('1095')) return '1095_A_MARKETPLACE';
  if (lower.includes('espp') || lower.includes('3921') || lower.includes('3922')) return 'STOCK_3921_3922';
  if (lower.includes('8879') || lower.includes('esign')) return 'FORM_8879';
  if (lower.includes('daycare') || lower.includes('child care')) return 'DAYCARE_RECEIPTS';
  if (lower.includes('solar') || lower.includes('clean energy')) return 'SOLAR_ENERGY_INVOICE';
  if (lower.includes('property tax') || lower.includes('tax bill')) return 'PROPERTY_TAX_RECEIPTS';
  if (lower.includes('charity') || lower.includes('donation') || lower.includes('501c3')) return 'CHARITY_DONATIONS';
  if (lower.includes('rental') || lower.includes('rent')) return 'RENTAL_EXPENSES';

  return 'W2_WAGES';
}

/**
 * Returns badge styling and formatted label for a document category
 */
export function getCategoryBadgeInfo(category?: string) {
  if (!category) {
    return {
      label: 'Tax Document',
      docType: 'INDIVIDUAL' as DocumentTypeId,
      badgeBg: 'bg-slate-50',
      badgeText: 'text-slate-700',
      badgeBorder: 'border-slate-200',
    };
  }

  const upper = category.toUpperCase().trim();
  const match = ALL_DOCUMENT_CATEGORIES.find((c) => c.value.toUpperCase() === upper);

  if (match) {
    return {
      label: match.shortLabel || match.label,
      docType: match.docType,
      badgeBg: match.badgeBg,
      badgeText: match.badgeText,
      badgeBorder: match.badgeBorder,
    };
  }

  // Drive link fallback
  if (upper.includes('DRIVE') || upper.includes('GOOGLE')) {
    return {
      label: 'Drive Folder',
      docType: getDocumentTypeForCategory(category),
      badgeBg: 'bg-indigo-50',
      badgeText: 'text-indigo-700',
      badgeBorder: 'border-indigo-200',
    };
  }

  const docType = getDocumentTypeForCategory(category);
  return {
    label: category.replace(/_/g, ' '),
    docType,
    badgeBg: 'bg-slate-50',
    badgeText: 'text-slate-700',
    badgeBorder: 'border-slate-200',
  };
}
