export interface FilingCustomerProfile {
  fullName: string;
  email: string;
  phone: string;
  ssnMasked: string;
  dob: string;
  visaType: string;
  filingStatus: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface FilingTaxReturnSummary {
  w2Wages: number;
  federalWithheld: number;
  standardDeduction: number;
  taxableIncome: number;
  totalFederalTax: number;
  federalRefund: number;
  federalBalanceDue: number;
  stateWages: number;
  stateWithheld: number;
  stateTaxLiability: number;
  stateRefund: number;
  stateBalanceDue: number;
  qaAuditorName: string;
}

export interface FilingBankDirectDeposit {
  bankName: string;
  accountType: string;
  routingNumber: string;
  accountNumberMasked: string;
}

export interface FilingSourceDoc {
  id: string;
  title: string;
  type: string;
  issuer: string;
  status: string;
  verifiedAt: string;
}

export interface FilingLeadItem extends Record<string, unknown> {
  id: string;
  taxYear: number;
  filingType: string;
  currentStage: string;
  customerId: string;
  taxpayerName: string;
  taxpayerEmail: string;
  taxpayerPhone: string;
  ssnMasked: string;
  stateOfResidence: string;
  filingStatus: string;
  visaType?: string;
  balanceDue?: number;
  federalRefund: number;
  federalBalanceDue: number;
  stateRefund: number;
  stateBalanceDue: number;
  totalRefundOrDue: number;
  paymentStatus: 'PAID' | 'UNPAID';
  serviceFeePaid: number;
  esignStatus: 'SIGNED' | 'PENDING';
  esignCompletedAt?: string | null;
  taxpayerPin?: string;
  assignedFilingAgent?: {
    id: string;
    name: string;
    email: string;
  } | null;
  transmissionInfo?: {
    submissionId?: string;
    efin?: string;
    etin?: string;
    status?: 'READY' | 'VALIDATING' | 'TRANSMITTING' | 'ACCEPTED' | 'REJECTED' | 'FAILED';
    transmittedAt?: string | null;
    acceptedAt?: string | null;
    acceptanceCertificateId?: string | null;
    irsAckCode?: string;
    irsMessage?: string;
    stateSubmissionId?: string;
    stateStatus?: string;
  };
  mefXmlSummary?: {
    form1040SchemaValid: boolean;
    stateSchemaValid: boolean;
    checksumSha256: string;
    generatedAt: string;
  };
  customerProfile?: FilingCustomerProfile;
  taxReturnSummary?: FilingTaxReturnSummary;
  bankDirectDeposit?: FilingBankDirectDeposit;
  sourceDocuments?: FilingSourceDoc[];
  createdAt: string;
  updatedAt: string;
}

export interface FilingStaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  activeCaseload: number;
  openQueue: number;
  transmissionsCompletedToday: number;
  acceptedCount: number;
  rejectedCount: number;
  acceptanceRate: string;
}

export interface FilingManagerStats {
  readyForTransmission: number;
  transmittingMeF: number;
  acceptedToday: number;
  rejectedToday: number;
  totalDepartmentLeads: number;
  acceptanceRatePct: number;
  efinGatewayStatus: string;
}
