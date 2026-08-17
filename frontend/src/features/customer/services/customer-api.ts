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
    ssnMasked: string;
    dob: string;
    occupation: string;
    filingStatus: string;
    residentialAddress: string;
    city: string;
    state: string;
    zipCode: string;
  };
  m2_dependents: {
    hasDependents: boolean;
    spouseName?: string;
    spouseSsn?: string;
    childCount: number;
    daycareExpensesClaimed: boolean;
    daycareProviderName?: string;
    daycareProviderEin?: string;
    daycareAmount?: number;
    employerReimbursedAmount?: number;
  };
  m3_presence: {
    days2025: number;
    days2024: number;
    days2023: number;
    visaType: string;
    residedStates: Array<{ state: string; fromDate: string; toDate: string }>;
    cityCountyTaxesRequired: boolean;
  };
  m4_wages: {
    hasW2: boolean;
    employerName: string;
    estimatedWages?: number;
  };
  m5_interest: {
    hasInterestDividends: boolean;
    bankName?: string;
    interestAmount?: number;
    dividendAmount?: number;
  };
  m6_stocks: {
    tradedStocks: boolean;
    brokerName?: string;
    totalCapitalGain?: number;
    esppRsuReported?: boolean;
    lossCarryforward?: number;
  };
  m7_foreign: {
    hasFbar: boolean;
    indianBankName?: string;
    peakBalanceInr?: number;
    foreignInterestInr?: number;
    foreignSalaryInr?: number;
  };
  m8_deductions: {
    hsaContribution?: number;
    mortgageInterest1098?: number;
    propertyTaxesUs?: number;
    propertyTaxesIndia?: number;
    studentLoanInterest?: number;
    cleanEnergyEquipment?: string;
    cleanEnergyCost?: number;
    charitableDonations?: number;
  };
  m9_directDeposit: {
    bankName: string;
    accountType: string;
    routingNumber: string;
    accountNumber: string;
    accountOwnerName: string;
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
