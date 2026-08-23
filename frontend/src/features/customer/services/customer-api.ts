import apiClient from '@/lib/api-client';

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
    stateRefund: number;
    totalRefund: number;
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
  };
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
};

export interface OrganizerData {
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
    visaChangeDate?: string;
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
      costOfProperty: number;
      totalRentalIncome: number;
      rentalExpenses: number;
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
      peakBalanceInr: number;
      accountCity: string;
    }>;
  };
  m8_deductions: {
    hsaContribution?: number;
    hsaTaxpayer?: number;
    hsaSpouse?: number;
    traditionalIraTaxpayer?: number;
    traditionalIraSpouse?: number;

    // 12-Item Incurred Expenses (Taxpayer vs Spouse)
    lastYearTaxPrepFeeTaxpayer?: number;
    lastYearTaxPrepFeeSpouse?: number;
    mortgageInterestTaxpayer?: number;
    mortgageInterestSpouse?: number;
    propertyTaxesUsTaxpayer?: number;
    propertyTaxesUsSpouse?: number;
    propertyTaxesIndiaTaxpayer?: number;
    propertyTaxesIndiaSpouse?: number;
    educatorExpensesTaxpayer?: number;
    educatorExpensesSpouse?: number;
    medicalExpensesTaxpayer?: number;
    medicalExpensesSpouse?: number;
    stateRefundTY2024Taxpayer?: number;
    stateRefundTY2024Spouse?: number;
    cleanEnergyCostTaxpayer?: number;
    cleanEnergyCostSpouse?: number;
    cleanEnergyEquipmentDetails?: string;
    otherExpensesTaxpayer?: number;
    otherExpensesSpouse?: number;
    otherExpensesDetails?: string;
    capitalGain2025Taxpayer?: number;
    capitalGain2025Spouse?: number;
    capitalLoss2025Taxpayer?: number;
    capitalLoss2025Spouse?: number;
    capitalLossCarryforwardTaxpayer?: number;
    capitalLossCarryforwardSpouse?: number;

    // Legacy fields
    mortgageInterest1098?: number;
    propertyTaxesUs?: number;
    propertyTaxesIndia?: number;
    educatorExpenses?: number;
    medicalExpenses?: number;
    studentLoanInterest?: number;
    stateRefundTY2024?: number;
    cleanEnergyEquipment?: string;
    cleanEnergyCost?: number;
    cleanEnergyList?: Array<{
      equipmentType: string;
      cost: number;
    }>;
    charitableDonations?: number;
    charitableList?: Array<{
      institutionName: string;
      amountDonated: number;
    }>;
    lastYearTaxPrepFee?: number;
    otherExpensesNotListed?: number;
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
}

export interface OrganizerResponse {
  taxYear: number;
  applicationId: string;
  organizer: OrganizerData;
  progressPercent: number;
  completedCount: number;
  totalModules: number;
}
