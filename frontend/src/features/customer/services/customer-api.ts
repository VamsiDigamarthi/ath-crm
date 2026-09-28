import apiClient from '@/lib/api-client';

export interface CustomerFilingItem extends Record<string, unknown> {
  id: string;
  taxYear: number;
  filingType: string;
  currentStage: string;
  isCompleted: boolean;
  isActive: boolean;
  totalRefund: number;
  totalBalanceDue: number;
  fedRefund: number;
  fedDue: number;
  stateRefund: number;
  stateDue: number;
  documentsCount: number;
  organizerPercent: number;
  assignedSpecialist: string;
  updatedAt: string;
  createdAt: string;
}

export interface CustomerDashboardResponse {
  taxpayer: {
    id: string;
    name: string;
    firstName: string;
    lastName?: string;
    email: string;
    phone: string;
    ssnMasked: string;
    visaType: string;
    maritalStatus: string;
    city: string;
    state: string;
    isConvertedCustomer: boolean;
  };
  application: {
    id: string;
    taxYear: number;
    currentStage: string;
    filingType: string;
  };
  refund: {
    fedRefund: number;
    fedDue?: number;
    stateRefund: number;
    stateDue?: number;
    totalRefund: number;
    totalBalanceDue?: number;
    stateName: string;
    bankMasked: string;
    isDraft: boolean;
  };
  assignedTeam: {
    docAgent: {
      name: string;
      email: string;
    };
    cpaReviewer: {
      name: string;
      credentials: string;
    };
  };
  stats: {
    docCount: number;
    organizerPercent: number;
    organizerVerifiedCount: number;
    quoteAmount: number;
    quoteStatus: string;
    activeFilingsCount?: number;
    completedFilingsCount?: number;
  };
  filings?: CustomerFilingItem[];
  availableTaxYears: number[];
}

export interface CustomerDocumentItem {
  id: string;
  applicationId: string;
  fileName: string;
  filePath: string;
  documentCategory: string;
  verificationStatus: string;
  createdAt: string;
  isUnlocked?: boolean;
  isDriveLink?: boolean;
  fileSize?: number;
  fileUrl?: string;
  uploadedAt?: string;
}

export interface CustomerDocumentsResponse {
  taxYear: number;
  applicationId: string;
  currentStage: string;
  isConvertedCustomer: boolean;
  documents: CustomerDocumentItem[];
}

export const customerApi = {
  getDashboard: async (taxYear?: string): Promise<{ success: boolean; data: CustomerDashboardResponse }> => {
    const params = taxYear ? { taxYear } : {};
    const res: any = await apiClient.get('/customer/dashboard', { params });
    return res;
  },

  getDocuments: async (taxYear?: string): Promise<{ success: boolean; data: CustomerDocumentsResponse }> => {
    const params = taxYear ? { taxYear } : {};
    const res: any = await apiClient.get('/customer/documents', { params });
    return res;
  },

  uploadDocument: async (
    file: File,
    documentCategory: string,
    taxYear?: string,
    onProgress?: (pct: number) => void
  ): Promise<{ success: boolean; data: CustomerDocumentItem }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentCategory', documentCategory);
    if (taxYear) formData.append('taxYear', taxYear);

    const res: any = await apiClient.post('/customer/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
    return res;
  },

  uploadMultipleDocuments: async (
    files: File[],
    categories: Record<string, string>,
    taxYear?: string,
    onProgress?: (pct: number) => void
  ): Promise<{ success: boolean; data: CustomerDocumentItem[] }> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('categories', JSON.stringify(categories));
    if (taxYear) formData.append('taxYear', taxYear);

    const res: any = await apiClient.post('/customer/documents/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
    return res;
  },

  uploadDriveLink: async (payload: {
    linkUrl: string;
    title?: string;
    documentCategory?: string;
    remarks?: string;
    taxYear?: string | number;
  }): Promise<{ success: boolean; data: CustomerDocumentItem }> => {
    const res: any = await apiClient.post('/customer/documents/drive-links', payload);
    return res;
  },

  deleteDocument: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res: any = await apiClient.delete(`/customer/documents/${id}`);
    return res;
  },

  downloadDocument: async (id: string, fileName: string): Promise<void> => {
    const response: any = await apiClient.get(`/customer/documents/${id}/download`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  getOrganizer: async (taxYear?: string): Promise<{ success: boolean; data: OrganizerResponse }> => {
    const params = taxYear ? { taxYear } : {};
    const res: any = await apiClient.get('/customer/organizer', { params });
    return res;
  },

  saveOrganizer: async (taxYear: number, organizerData: OrganizerData): Promise<{ success: boolean; data: any }> => {
    const res: any = await apiClient.put('/customer/organizer', { taxYear, organizerData });
    return res;
  },

  startTaxYearReturn: async (taxYear: number, filingType: 'INDIVIDUAL' | 'BUSINESS' = 'INDIVIDUAL'): Promise<{ success: boolean; data: any; message: string }> => {
    const res: any = await apiClient.post('/customer/tax-years', { taxYear, filingType });
    return res;
  },
};

export interface OrganizerData {
  submittedModules?: string[];
  m1_demographics: {
    fullName: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    ssnMasked: string;
    dob: string;
    occupation: string;
    phone?: string;
    workPhone?: string;
    email?: string;
    relationshipToPrimary?: string;
    visaType: string;
    visaStatusChanged2025?: 'YES' | 'NO';
    previousVisaType?: string;
    newVisaType?: string;
    visaChangeDate?: string;
    visaStatusChangeReason?: string;
    maritalStatus: string;
    dateOfMarriage?: string;
    residentialAddress: string;
    city: string;
    state: string;
    zipCode: string;
    firstPortOfEntryDate?: string;
    stayMoreThan6Months2026?: 'YES' | 'NO';
    monthsStayedInUs2025?: number;
  };
  m2_dependents: {
    hasSpouse?: boolean;
    spouseName?: string;
    spouseFirstName?: string;
    spouseMiddleName?: string;
    spouseLastName?: string;
    spouseDob?: string;
    spouseSsn?: string;
    spouseOccupation?: string;
    spouseVisaType?: string;
    spouseWorkPhone?: string;
    spouseEmail?: string;
    spouseRelationship?: string;
    spouseList?: Array<{
      firstName: string;
      middleName?: string;
      lastName: string;
      dob: string;
      ssn: string;
      occupation: string;
      visaType: string;
      workPhone?: string;
      email?: string;
      relationship: string;
    }>;
    hasDependents: boolean;
    childCount: number;
    dependentsList?: Array<{
      firstName?: string;
      middleName?: string;
      lastName?: string;
      name: string;
      dob: string;
      ssn: string;
      relationship: string;
      monthsInHome: number;
    }>;
    daycareExpensesClaimed: boolean;
    daycareProviderName?: string;
    daycareProviderEin?: string;
    daycareProviderAddress?: string;
    daycareAmount?: number;
    employerReimbursedAmount?: number;
    daycareList?: Array<{
      dependentName: string;
      providerName: string;
      providerEinSsn: string;
      providerAddress: string;
      amountPaid: number;
      employerReimbursed: number;
    }>;
  };
  m3_presence: {
    days2025: number;
    days2024: number;
    days2023: number;
    visaType: string;
    residedStates: Array<{ state: string; fromDate: string; toDate: string }>;
    statesResidedHistory?: Array<{
      taxYear: number;
      state: string;
      fromDate: string;
      toDate: string;
      spouseState?: string;
      spouseFromDate?: string;
      spouseToDate?: string;
    }>;
    cityCountyTaxesRequired: boolean;
    hasRentalProperty?: boolean;
    rentalProperties?: Array<{
      propertyType: 'RESIDENTIAL' | 'COMMERCIAL' | string;
      address: string;
      monthsRented2025: number;
      personalMonths2025: number;
      ownership: 'TAXPAYER' | 'SPOUSE' | 'JOINT' | string;
      purchaseDate: string;
      rentedDate?: string;
      costOfProperty: number;
      totalRentalIncome: number;
      otherRentalIncome?: number;
      rentalExpenses: number;
      mortgageInterest?: number;
      propertyTaxes?: number;
      insurance?: number;
      repairs?: number;
      hoaFees?: number;
      managementFees?: number;
      utilities?: number;
      advertising?: number;
      cleaning?: number;
      legalFees?: number;
      otherExpenses?: number;
      otherExpensesDesc?: string;
    }>;
  };
  m4_wages: {
    hasW2: boolean;
    employerName: string;
    estimatedWages?: number;
    w2List?: Array<{
      employerName: string;
      wages: number;
      fedTax: number;
      stateTax: number;
      stateCode: string;
      box12Codes?: string;
    }>;
    hasRentalProperty?: boolean;
    rentalProperties?: Array<{
      propertyType: 'RESIDENTIAL' | 'COMMERCIAL' | string;
      address: string;
      monthsRented2025: number;
      personalMonths2025: number;
      ownership: 'TAXPAYER' | 'SPOUSE' | 'JOINT' | string;
      purchaseDate: string;
      rentedDate?: string;
      costOfProperty: number;
      totalRentalIncome: number;
      otherRentalIncome?: number;
      rentalExpenses: number;
      mortgageInterest?: number;
      propertyTaxes?: number;
      insurance?: number;
      repairs?: number;
      hoaFees?: number;
      managementFees?: number;
      utilities?: number;
      advertising?: number;
      cleaning?: number;
      legalFees?: number;
      otherExpenses?: number;
      otherExpensesDesc?: string;
    }>;
  };
  m5_interest: {
    hasInterestDividends: boolean;
    bankName?: string;
    interestAmount?: number;
    dividendAmount?: number;
    form1099OidAmount?: number;
    interestAccounts?: Array<{
      bankName: string;
      interestAmount: number;
      box4Withholding?: number;
    }>;
    dividendAccounts?: Array<{
      institutionName: string;
      ordinaryDividends: number;
      qualifiedDividends: number;
      capitalGainDistributions?: number;
    }>;
  };
  m6_stocks: {
    tradedStocks: boolean;
    brokerName?: string;
    totalCapitalGain?: number;
    capitalGainTaxpayer?: number;
    capitalGainSpouse?: number;
    capitalLossTaxpayer?: number;
    capitalLossSpouse?: number;
    lossCarryforwardTaxpayer?: number;
    lossCarryforwardSpouse?: number;
    capitalGain2025?: number;
    capitalLoss2025?: number;
    capitalLossCarryforward2023_2024?: number;
    esppRsuReported?: boolean;
    esppRsuDetails?: string;
    hasCryptoTransactions?: boolean;
    stocksList?: Array<{
      brokerName: string;
      taxpayerGainLoss?: number;
      spouseGainLoss?: number;
      shortTermGainLoss?: number;
      longTermGainLoss?: number;
      totalProceeds?: number;
    }>;
  };
  m7_foreign: {
    hasFbar: boolean;
    hasFbarOver10k?: 'YES' | 'NO';
    hasFatcaOver50k?: 'YES' | 'NO';
    spouseFbarOver10k?: 'YES' | 'NO';
    spouseFatcaOver50k?: 'YES' | 'NO';
    indianBankName?: string;
    peakBalanceInr?: number;
    foreignInterestInr?: number;
    foreignSalaryInr?: number;
    foreignDividendInr?: number;
    foreignRentalInr?: number;
    otherForeignIncomeSource?: string;
    otherForeignIncomeInr?: number;
    foreignTaxesPaidInr?: number;
    foreignAccountsList?: Array<{
      bankName: string;
      accountType: string;
      accountNumber?: string;
      peakBalanceInr?: number;
      maxBalanceInr?: number;
      interestEarnedInr?: number;
      accountCity?: string;
    }>;
  };
  m8_deductions: {
    hasRentDeductions?: boolean;
    hsaContribution?: number;
    hsaTaxpayer?: number;
    hsaSpouse?: number;
    traditionalIraTaxpayer?: number;
    traditionalIraSpouse?: number;
    iraContribution?: number;
    iraTaxpayer?: number;
    iraSpouse?: number;

    // 12-Item Incurred Expenses (Taxpayer vs Spouse)
    lastYearTaxPrepFeeTaxpayer?: number;
    lastYearTaxPrepFeeSpouse?: number;
    lastYearTaxPrepFee?: number;
    mortgageInterestTaxpayer?: number;
    mortgageInterestSpouse?: number;
    mortgageInterest1098?: number;
    propertyTaxesUsTaxpayer?: number;
    propertyTaxesUsSpouse?: number;
    propertyTaxesUs?: number;
    propertyTaxesIndiaTaxpayer?: number;
    propertyTaxesIndiaSpouse?: number;
    propertyTaxesIndia?: number;
    educatorExpensesTaxpayer?: number;
    educatorExpensesSpouse?: number;
    educatorExpenses?: number;
    medicalExpensesTaxpayer?: number;
    medicalExpensesSpouse?: number;
    medicalExpenses?: number;
    studentLoanInterestTaxpayer?: number;
    studentLoanInterestSpouse?: number;
    studentLoanInterest?: number;
    solarCleanEnergyTaxpayer?: number;
    solarCleanEnergySpouse?: number;
    solarCleanEnergyExpenses?: number;
    cleanEnergyCostTaxpayer?: number;
    cleanEnergyCostSpouse?: number;
    cleanEnergyCost?: number;
    cleanEnergyEquipmentDetails?: string;
    electricVehicleTaxpayer?: number;
    electricVehicleSpouse?: number;
    electricVehicleExpenses?: number;
    stateRefundTY2024Taxpayer?: number;
    stateRefundTY2024Spouse?: number;
    stateRefundTY2024?: number;
    otherExpensesTaxpayer?: number;
    otherExpensesSpouse?: number;
    otherExpensesDetails?: string;
    otherDeductionsDescription?: string;
    otherDeductionsAmount?: number;

    charitableDonations?: number;
    charitableList?: Array<{
      institutionName: string;
      amountDonated: number;
      donationType?: string;
    }>;
    stateRentDeduction?: {
      state: string;
      months: number;
      monthlyRent: number;
      totalRentPaid: number;
    };
    rentDeductionsList?: Array<{
      state: string;
      months: number;
      monthlyRent: number;
      totalRentPaid: number;
    }>;
    otherTaxesPaidDocuments?: Array<{
      id?: string;
      name: string;
      fileUrl?: string;
      size?: number;
      type?: string;
      uploadedAt?: string;
    }>;
  };
  m9_directDeposit: {
    bankName: string;
    accountType: string;
    routingNumber: string;
    accountNumber: string;
    accountOwnerName: string;
    notesToPreparer?: string;
    preferredContactTime?: string;
    referrals?: Array<{
      name: string;
      email: string;
      phone: string;
    }>;
  };

  // Business Filing Modules
  b1_companyInfo?: {
    businessName: string;
    dba?: string;
    ein: string;
    formationDate?: string;
    entityType: string;
    scorpElectionDate?: string;
    businessActivity: string;
    accountingMethod?: 'CASH' | 'ACCRUAL' | 'OTHER';
    address: string;
    suite?: string;
    city: string;
    state: string;
    zipCode: string;
    contactName: string;
    contactTitle: string;
    contactEmail: string;
    contactPhone: string;
    priorYearReturnFiled?: 'YES' | 'NO';
    partners?: BusinessPartnerItem[];
  };

  b2_businessIncome?: {
    clientIncome1099?: Business1099IncomeItem[];
    grossSalesNot1099?: number;
    returnsAndAllowances?: number;
    interestIncome?: number;
    dividendIncome?: number;
    otherIncomeDescription?: string;
    otherIncomeAmount?: number;
    monthlyRevenue?: {
      jan?: number;
      feb?: number;
      mar?: number;
      apr?: number;
      may?: number;
      jun?: number;
      jul?: number;
      aug?: number;
      sep?: number;
      oct?: number;
      nov?: number;
      dec?: number;
    };
  };

  b3_businessExpenses?: {
    // 1. Payroll & Compensation
    officerCompensation?: number;
    employeeWages?: number;
    contractorPayments?: number;
    employerPayrollTaxes?: number;
    futaTax?: number;
    sutaTax?: number;
    employeeBenefits?: number;
    retirementPlanContributions?: number;
    payrollProcessingFees?: number;

    // 2. Facilities & Occupancy
    rentProperty?: number;
    utilitiesCommercial?: number;
    commercialInsurance?: number;
    repairsMaintenance?: number;
    cleaningJanitorial?: number;
    realEstateTaxes?: number;

    // 3. Professional & Administrative
    legalProfessionalFees?: number;
    accountingTaxPrepFees?: number;
    bankServiceCharges?: number;
    merchantCardFees?: number;
    softwareSubscriptions?: number;
    officeSupplies?: number;
    telephoneCellular?: number;
    internetHosting?: number;
    licensesPermitsStateFees?: number;

    // 4. Marketing & Travel
    advertisingMarketing?: number;
    travelAirfare?: number;
    lodgingHotels?: number;
    businessMeals50?: number;
    clientGifts?: number;
    educationConferences?: number;
    employeeWelfare?: number;
    meetingExpenses?: number;
    perDiemExpenses?: number;

    // 5. Other Operating Deductions
    otherOperatingInsurance?: number;
    duesSubscriptions?: number;
    badDebts?: number;
    charitableContributions?: number;
    otherExpensesDescription?: string;
    otherExpensesAmount?: number;

    // 6. Cost of Goods Sold (COGS)
    hasInventory?: boolean;
    beginningInventory?: number;
    inventoryPurchases?: number;
    directLabor?: number;
    otherProductionCosts?: number;
    endingInventory?: number;

    // 7. Business Vehicles (Form 4562)
    hasVehicleExpenses?: boolean;
    vehicles?: BusinessVehicleItem[];

    // 8. Equipment & Depreciation (Sec 179)
    hasEquipmentPurchases?: boolean;
    equipmentAssets?: BusinessAssetItem[];

    // 9. Home Office Deduction (Form 8829)
    hasHomeOffice?: boolean;
    homeOffice?: BusinessHomeOffice;
  };
}

export interface BusinessPartnerItem {
  id?: string;
  name: string;
  title?: string;
  ssnOrEin?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  visaStatus?: string;
  ownershipPercentage: number;
  isForeign?: boolean;
  isActiveMember?: boolean;
  guaranteedPayments?: number;
  distributionsReceived?: number;
  capitalContributions?: number;
}

export interface Business1099IncomeItem {
  id?: string;
  clientName: string;
  clientEin?: string;
  clientAddress?: string;
  grossAmount: number;
  fedTaxWithheld?: number;
  stateTaxWithheld?: number;
  note?: string;
}

export interface BusinessVehicleItem {
  id?: string;
  vehicleDescription: string;
  datePlacedInService?: string;
  isPurchasedOnBusinessName?: 'YES' | 'NO';
  usedForAnotherBusiness?: 'YES' | 'NO';
  totalMiles?: number;
  businessMiles?: number;
  commutingMiles?: number;
  personalMiles?: number;
  calculationMethod?: 'STANDARD' | 'ACTUAL';
  gasOilExpenses?: number;
  repairsMaintenance?: number;
  insuranceLease?: number;
  parkingAndTolls?: number;
  isAnotherPersonalVehicle?: 'YES' | 'NO';
  hasWrittenEvidence?: 'YES' | 'NO';
}

export interface BusinessAssetItem {
  id?: string;
  description: string;
  dateAcquired: string;
  costBasis: number;
  businessUsePercentage: number;
  isNewProperty?: 'NEW' | 'USED';
  section179Requested?: 'YES' | 'NO';
  soldDuringYear?: 'YES' | 'NO';
  salePrice?: number;
  saleDate?: string;
  carryoverDepreciation?: number;
}

export interface BusinessHomeOffice {
  officeSquareFootage?: number;
  totalHomeSquareFootage?: number;
  calculationMethod?: 'SIMPLIFIED' | 'ACTUAL';
  personalTaxClaimed?: 'YES' | 'NO';
  directRepairs?: number;
  mortgageInterest?: number;
  realEstateTaxes?: number;
  rentPaid?: number;
  homeownersInsurance?: number;
  utilities?: number;
  internet?: number;
  maintenanceRepairs?: number;
  homeCostBasis?: number;
  datePlacedInUse?: string;
  landValue?: number;
}

export interface OrganizerResponse {
  taxYear: number;
  applicationId: string;
  organizer: OrganizerData;
  progressPercent: number;
  completedCount: number;
  totalModules: number;
}
