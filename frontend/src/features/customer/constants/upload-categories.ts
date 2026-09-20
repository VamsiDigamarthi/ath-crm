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

  // 3. Employer Stocks, Foreign & Identity
  { label: 'Form 3921 / 3922 Employer Stock (ESPP / ISO Exercise)', value: 'STOCK_3921_3922' },
  { label: 'FBAR / Indian Bank Statements (SBI / HDFC / ICICI NRE/NRO)', value: 'FBAR_FOREIGN' },
  { label: 'Prior Year Tax Returns (TY 2024 / 2023 / 2020)', value: 'PRIOR_YEAR_RETURN' },
  { label: 'Visa Copy, Passport & I-797 Approval Notice', value: 'VISA_IDENTITY' },

  // 4. Receipts & Expense Worksheets
  { label: 'Daycare Provider Statements / Receipts (Child Care)', value: 'DAYCARE_RECEIPTS' },
  { label: 'Clean Energy & Solar Invoices (Form 5695)', value: 'SOLAR_ENERGY_INVOICE' },
  { label: 'Property Tax Receipts (US County & India Municipal)', value: 'PROPERTY_TAX_RECEIPTS' },
  { label: 'Charitable Donation 501(c)(3) Receipts', value: 'CHARITY_DONATIONS' },
  { label: 'Rental Property Expenses & Rent Slips', value: 'RENTAL_EXPENSES' },
  { label: 'Other Deduction / Expense Receipts', value: 'OTHER' },
];

export const CLIENT_DRIVE_LINK_CATEGORIES = [
  { label: 'Google Drive / Cloud Folder (All Tax Documents)', value: 'GOOGLE_DRIVE_LINK' },
  { label: 'W-2 Wage Statement (Employer)', value: 'W2_WAGES' },
  { label: '1099-INT Bank Interest Statement', value: '1099_INT' },
  { label: '1099-DIV Dividend & Distribution', value: '1099_DIV' },
  { label: '1099-B Brokerage & Stock Sales', value: '1099_BROKERAGE' },
  { label: '1098 Mortgage Interest Statement', value: 'MORTGAGE_1098' },
  { label: '1098-T Tuition Statements (Higher Ed)', value: '1098_T_TUITION' },
  { label: '1098-E Student Loan Interest', value: '1098_E_STUDENT_LOAN' },
  { label: 'FBAR / Foreign Indian Bank Summary', value: 'FBAR_FOREIGN' },
  { label: 'Taxpayer ID / Passport / Visa Copy', value: 'VISA_IDENTITY' },
  { label: 'Prior Year 1040 Tax Return', value: 'PRIOR_YEAR_RETURN' },
  { label: 'Other Tax Document / Drive Link', value: 'OTHER' },
];

export const CATEGORY_FILTER_OPTIONS = [
  { label: 'All Document Categories', value: 'ALL' },
  { label: 'Google Drive / Cloud Links', value: 'GOOGLE_DRIVE_LINK' },
  { label: 'W-2 Wage Statements (Employer)', value: 'W2_WAGES' },
  { label: '1098 Mortgage Interest Statement', value: 'MORTGAGE_1098' },
  { label: '1098-T Tuition Statements (Higher Ed)', value: '1098_T_TUITION' },
  { label: '1098-E Student Loan Interest', value: '1098_E_STUDENT_LOAN' },
  { label: '1099-B Stock & RSUs (Robinhood/Fidelity)', value: '1099_BROKERAGE' },
  { label: '1099-INT / 1099-DIV Bank Interest', value: '1099_INT' },
  { label: '1099-MISC / 1099-NEC Miscellaneous', value: '1099_MISC' },
  { label: '1099-G State Refund / Government', value: '1099_G_STATE_REFUND' },
  { label: '1099-R 401(k) & Pension Distributions', value: '1099_R_RETIREMENT' },
  { label: '1099-SA HSA Distributions', value: '1099_SA_HSA' },
  { label: '1099-HC Massachusetts Health Statement', value: '1099_HC_MA_HEALTH' },
  { label: '1095-A ACA Health Marketplace', value: '1095_A_MARKETPLACE' },
  { label: 'W-2G Gambling Winnings', value: 'W2_G_GAMBLING' },
  { label: 'Form 3921 / 3922 Employer Stock (ESPP)', value: 'STOCK_3921_3922' },
  { label: 'FBAR / Foreign Accounts (SBI NRE/NRO)', value: 'FBAR_FOREIGN' },
  { label: 'Prior Year Tax Returns (TY 2024/2023)', value: 'PRIOR_YEAR_RETURN' },
  { label: 'Visa, I-797 & Identity Proofs', value: 'VISA_IDENTITY' },
  { label: 'Other Tax Receipts & Deduction Slips', value: 'OTHER' },
];
