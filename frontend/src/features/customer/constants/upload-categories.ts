export { 
  DOCUMENT_TYPES,
  ALL_DOCUMENT_CATEGORIES,
  getDocumentTypeForCategory,
  getCategoriesForType,
  getGroupedCategoryOptions,
  getCategoryBadgeInfo,
  type DocumentTypeId,
  type DocumentTypeDefinition,
  type DocumentCategoryItem
} from '@/shared/constants/document-taxonomy';

export const UPLOAD_CATEGORIES = [
  // 1. Primary Wage & Income Statements
  { label: 'W-2 Wage Statement (Employer)', value: 'W2_WAGES' },
  { label: '1099-INT Bank Interest Income Statement', value: '1099_INT' },
  { label: '1099-DIV Dividends & Distributions Statement', value: '1099_DIV' },
  { label: '1099-B Brokerage & Stocks (Robinhood, ESPP, RSU)', value: '1099_BROKERAGE' },
  { label: '1099-MISC / 1099-NEC Miscellaneous / Freelance Income', value: '1099_MISC' },
  { label: '1099-K Payment Card & Third-Party Network (PayPal, Venmo, Stripe)', value: '1099_K_PAYMENTS' },
  { label: '1099-G State Refund / Unemployment Compensation', value: '1099_G_STATE_REFUND' },
  { label: '1099-R Retirement, Annuity & 401(k) Distributions', value: '1099_R_RETIREMENT' },
  { label: '1099-OID Original Issue Discount', value: '1099_OID' },
  { label: '1099-C Cancellation of Debt', value: '1099_C_DEBT' },
  { label: '1099-Q Payments from Qualified Education Programs (529 & 530)', value: '1099_Q_EDUCATION' },
  { label: '1099-SA HSA / Archer MSA Distributions', value: '1099_SA_HSA' },
  { label: '1099-HC Massachusetts Health Insurance Statement', value: '1099_HC_MA_HEALTH' },
  { label: '1095-A / 1095-B / 1095-C Health Insurance Marketplace (ACA)', value: '1095_A_MARKETPLACE' },
  { label: 'W-2G Certain Gambling Winnings', value: 'W2_G_GAMBLING' },
  { label: 'Schedule K-1 (Partnership / S-Corp / Estate Form 1065/1120-S)', value: 'SCHEDULE_K1' },

  // 2. 1098 Deductions & Educational Forms
  { label: '1098 Mortgage Interest Statement (Home Loan)', value: 'MORTGAGE_1098' },
  { label: '1098-T Tuition Fees Statement (University / College)', value: '1098_T_TUITION' },
  { label: '1098-E Student Loan Interest Statement', value: '1098_E_STUDENT_LOAN' },

  // 3. Business & Schedule C Forms
  { label: 'Schedule C Business Profit & Loss Ledger', value: 'SCHEDULE_C' },
  { label: 'Business Financial Statements (P&L / Balance Sheet)', value: 'BUSINESS_PNL_STATEMENT' },
  { label: 'Business Bank & Merchant Statements', value: 'BUSINESS_BANK_STATEMENTS' },
  { label: 'Articles of Incorporation / EIN Official Letter', value: 'BUSINESS_EIN_ARTICLES' },
  { label: 'Business Invoices & Mileage Records', value: 'BUSINESS_EXPENSES' },

  // 4. Foreign & FBAR / FATCA Compliance
  { label: 'FBAR FinCEN 114 Foreign Indian Bank Accounts', value: 'FBAR_FOREIGN' },
  { label: 'FATCA Form 8938 Specified Foreign Assets Statement', value: 'FATCA_FORM_8938' },
  { label: 'Indian Bank Statements (SBI / HDFC / ICICI NRE & NRO)', value: 'INDIAN_NRE_NRO_STATEMENTS' },
  { label: 'Indian Fixed Deposits & Recurring Deposit Certificates', value: 'INDIAN_FD_RD_RECORDS' },
  { label: 'Indian Income Tax Return (ITR) / Form 16', value: 'INDIAN_ITR_FORM_16' },
  { label: 'Indian Form 26AS / AIS Annual Tax Statement', value: 'INDIAN_26AS_AIS_TDS' },
  { label: 'Indian Mutual Funds, Demat & Capital Gains Statement', value: 'INDIAN_MUTUAL_FUNDS_STOCKS' },

  // 5. Tax Audit & IRS Notice
  { label: 'IRS Notice / Inquiry Letter (CP2000, CP501, Letter 525)', value: 'IRS_NOTICE_AUDIT' },
  { label: 'State Tax Department Notice / Inquiry Letter', value: 'STATE_TAX_NOTICE' },
  { label: 'Form 2848 Power of Attorney (Representation)', value: 'FORM_2848_POA' },
  { label: 'Audit Substantiation Expense Receipts & Proofs', value: 'AUDIT_EVIDENCE_RECORDS' },
  { label: 'Tax Penalty Abatement Request Records', value: 'PENALTY_ABATEMENT_DOCS' },

  // 6. Identity & Receipts
  { label: 'Visa Copy, Passport & I-797 Approval Notice', value: 'VISA_IDENTITY' },
  { label: 'Prior Year Tax Returns (TY 2024 / 2023 / 2022)', value: 'PRIOR_YEAR_RETURN' },
  { label: 'Daycare Provider Statements / Receipts (Child Care)', value: 'DAYCARE_RECEIPTS' },
  { label: 'Clean Energy & Solar Invoices (Form 5695)', value: 'SOLAR_ENERGY_INVOICE' },
  { label: 'Property Tax Receipts (US County & India Municipal)', value: 'PROPERTY_TAX_RECEIPTS' },
  { label: 'Charitable Donation 501(c)(3) Receipts', value: 'CHARITY_DONATIONS' },
  { label: 'Rental Property Expenses & Rent Slips', value: 'RENTAL_EXPENSES' },
  { label: 'Form 8879 E-Sign Signature Form', value: 'FORM_8879' },
  { label: 'Other Tax Form / Expense Receipt', value: 'OTHER' },
];

export const CLIENT_DRIVE_LINK_CATEGORIES = [
  { label: 'Individual Tax Documents Drive Folder', value: 'INDIVIDUAL_DRIVE_LINK' },
  { label: 'Business Tax Documents Drive Folder', value: 'BUSINESS_DRIVE_LINK' },
  { label: 'FBAR / FATCA & Foreign Accounts Drive Folder', value: 'FBAR_FATCA_DRIVE_LINK' },
  { label: 'Tax Audit Representation Drive Folder', value: 'AUDIT_DRIVE_LINK' },
  { label: 'Google Drive / Cloud Folder (All Tax Documents)', value: 'GOOGLE_DRIVE_LINK' },
  { label: 'W-2 Wage Statement (Employer)', value: 'W2_WAGES' },
  { label: '1099-INT Bank Interest Statement', value: '1099_INT' },
  { label: '1099-DIV Dividend & Distribution', value: '1099_DIV' },
  { label: '1099-B Brokerage & Stock Sales', value: '1099_BROKERAGE' },
  { label: '1098 Mortgage Interest Statement', value: 'MORTGAGE_1098' },
  { label: 'FBAR / Foreign Indian Bank Summary', value: 'FBAR_FOREIGN' },
  { label: 'Taxpayer ID / Passport / Visa Copy', value: 'VISA_IDENTITY' },
  { label: 'Prior Year 1040 Tax Return', value: 'PRIOR_YEAR_RETURN' },
  { label: 'Other Tax Document / Drive Link', value: 'OTHER' },
];

export const CATEGORY_FILTER_OPTIONS = [
  { label: 'All Categories in Section', value: 'ALL' },
  { label: 'Google Drive / Cloud Links', value: 'GOOGLE_DRIVE_LINK' },
  { label: 'W-2 Wage Statements (Employer)', value: 'W2_WAGES' },
  { label: '1098 Mortgage Interest Statement', value: 'MORTGAGE_1098' },
  { label: '1099-B Stock & RSUs (Robinhood/Fidelity)', value: '1099_BROKERAGE' },
  { label: '1099-INT / 1099-DIV Bank Interest', value: '1099_INT' },
  { label: '1099-MISC / 1099-NEC Miscellaneous', value: '1099_MISC' },
  { label: 'Schedule C Business Expenses', value: 'SCHEDULE_C' },
  { label: 'FBAR / Foreign Accounts (SBI NRE/NRO)', value: 'FBAR_FOREIGN' },
  { label: 'FATCA Form 8938 Foreign Assets', value: 'FATCA_FORM_8938' },
  { label: 'IRS / State Audit Notice', value: 'IRS_NOTICE_AUDIT' },
  { label: 'Form 2848 Power of Attorney', value: 'FORM_2848_POA' },
  { label: 'Prior Year Tax Returns (TY 2024/2023)', value: 'PRIOR_YEAR_RETURN' },
  { label: 'Visa, I-797 & Identity Proofs', value: 'VISA_IDENTITY' },
  { label: 'Other Tax Receipts & Deduction Slips', value: 'OTHER' },
];
