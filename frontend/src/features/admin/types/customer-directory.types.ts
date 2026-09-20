export interface CustomerApplicationSummary {
  id: string;
  taxYear: number;
  currentStage: string;
  filingType: string;
  priority?: string;
  irsStatus: 'ACCEPTED' | 'REJECTED' | 'IN_PROGRESS' | 'QUEUED' | 'PENDING';
  irsStatusLabel: string;
}

export interface AdminCustomerItem {
  id: string;
  customerId: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  ssnMasked: string;
  dob: string;
  city: string;
  state: string;
  visaType: string;
  filingStatus: string;
  isConvertedCustomer: boolean;
  createdAt: string;
  updatedAt: string;
  applications?: CustomerApplicationSummary[];
  activeApplication: {
    id: string;
    taxYear: number;
    currentStage: string;
    filingType: string;
    priority?: string;
    fedRefund: number;
    fedDue: number;
    stateRefund: number;
    stateDue: number;
    paymentStatus: 'PAID' | 'PENDING';
    paidAmount: number;
    esignStatus: 'SIGNED' | 'PENDING';
    taxpayerPin: string;
    docCount: number;
    irsStatus: 'ACCEPTED' | 'REJECTED' | 'IN_PROGRESS' | 'QUEUED' | 'PENDING';
    irsStatusLabel: string;
    rejectionCode: string | null;
    rejectionReason: string | null;
    submissionId: string | null;
    certificateId: string | null;
    assignedTeam: {
      docAgent: string;
      prepAgent: string;
      reviewAgent: string;
      salesAgent: string;
      fileOperator: string;
    };
  } | null;
}

export interface AdminCustomerResponse {
  customers: AdminCustomerItem[];
  availableTaxYears: number[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: {
    totalCustomers: number;
    totalConverted: number;
    totalAccepted: number;
    totalRejected: number;
    totalInProgress: number;
    totalFeesCollected: number;
  };
}

export interface StartNewTaxYearPayload {
  taxYear: number;
  filingType?: 'INDIVIDUAL' | 'CORPORATE';
  currentStage?: 'RAW_PROSPECT' | 'DOC_OUTREACH' | 'DOC_PREP';
  assignedDocAgentId?: string | null;
  carryForwardDemographics?: boolean;
  intakeRemarks?: string | null;
}

