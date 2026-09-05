export type SalesFilingType = 'INDIVIDUAL' | 'BUSINESS' | 'EXPAT_FBAR';

export type SalesLeadStage = 
  | 'SALES_PITCH_QUEUE'     // Freshly approved by QA, awaiting pitch
  | 'SALES_PITCHING'        // Agent actively calling/pitching client
  | 'QUOTATION_SENT'        // Fee quote generated & sent to client
  | 'PAYMENT_PENDING'       // Client agreed, awaiting card swipe/link payment
  | 'PAID_AND_AUTHORIZED'   // Payment verified & Form 8879 E-Signed
  | 'FILING_QUEUE'          // Transferred to Filing Operations
  | 'FILING_IN_PROGRESS'    // Filing currently active
  | 'FILING_SUCCESS'        // Successfully accepted by IRS
  | 'CORRECTION_NEEDED'     // Reverted to Tax Preparer for calculations revision
  | 'DOC_OUTREACH'          // Reverted to Documenter for missing paperwork
  | 'DOC_PREP'              // Resumed Tax Preparation
  | 'PITCH_REJECTED';       // Client declined / dropped

export interface SalesFeeBreakdown {
  fed1040PrepFee: number;
  statePrepFee: number;
  selectedStates: string[];
  fbarFee: number;
  auditDefenseFee: number;
  hasAuditDefense: boolean;
  discountAmount: number;
  discountCode: string;
  totalServiceFee: number;
  isQuoted?: boolean;
}

export interface SalesLeadItem extends Record<string, unknown> {
  id: string;
  applicationId: string;
  taxpayerId: string;
  taxpayerName: string;
  taxpayerEmail: string;
  taxpayerPhone: string;
  taxYear: number;
  visaType: string;
  maritalStatus: string;
  stateOfResidence: string;
  complexity: 'STANDARD' | 'INVESTMENTS_1099B' | 'FOREIGN_FBAR' | 'SCHEDULE_C';
  currentStage: SalesLeadStage;
  
  // Tax Return Financials from QA Sign-Off
  grossIncome: number;
  federalRefund: number;
  stateRefund: number;
  balanceDue: number;
  qaAuditorName: string;
  qaAuditorRemarks: string;
  qaApprovedAt: string;

  // Assignment & Sales Info
  assignedPrepAgent?: {
    id: string;
    name: string;
    email: string;
  } | null;
  assignedSalesAgent?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  } | null;

  // Complete Form 1040 Tax Calculation Draft from Preparer & QA Reviewer
  taxDraftSummary?: {
    status?: string;
    w2Wages?: number;
    taxableInterest?: number;
    capitalGains?: number;
    otherIncome?: number;
    grossIncome?: number;
    deductionType?: 'STANDARD' | 'ITEMIZED';
    standardDeduction?: number;
    effectiveDeduction?: number;
    taxableIncome?: number;
    taxLiability?: number;
    taxCredits?: number;
    fedWithheld?: number;
    federalRefund?: number;
    federalBalanceDue?: number;
    stateTaxLiability?: number;
    stateWithheld?: number;
    stateRefund?: number;
    stateBalanceDue?: number;
    combinedRefund?: number;
    preparerNotes?: string;
    auditorRemarks?: string;
    targetDueDate?: string;
    lastRevert?: {
      sourceDepartment: string;
      targetDepartment: string;
      fromStage: string;
      toStage: string;
      reasonCategory: string;
      missingDocumentTypes?: string[];
      revertNotes: string;
      revertedAt: string;
      revertedByUserId: string;
      revertedByName: string;
      revertedByRole: string;
      resolved?: boolean;
    };
  };

  // Pricing & Payment Status
  feeBreakdown: SalesFeeBreakdown;
  paymentStatus: 'UNPAID' | 'PAYMENT_LINK_SENT' | 'PAID' | 'REFUNDED';
  paymentMethod?: 'STRIPE_CARD' | 'PAYPAL' | 'WIRE_TRANSFER' | 'ZELLE';
  paidAt?: string;
  transactionRef?: string;
  esignStatus: 'NOT_SENT' | 'SENT' | 'VIEWED' | 'SIGNED';
  esignCompletedAt?: string;

  lastContactedAt?: string;
  callDisposition?: string;
  notes?: string;
  taxpayerPin?: string;

  // Real Database Stage History & Immutable Audit Logs
  stageHistories?: Array<{
    id: string;
    fromStage: string;
    toStage: string;
    movedByUserId: string;
    movedByName: string;
    movedByEmail?: string;
    movedByRole?: string;
    remarks?: string;
    createdAt: string;
  }>;
  callLogs?: Array<{
    id: string;
    disposition: string;
    callSummary?: string;
    agentId: string;
    agentName: string;
    agentEmail?: string;
    agentRole?: string;
    createdAt: string;
  }>;
  auditLogs?: Array<{
    id: string;
    action: string;
    moduleKey?: string;
    actorType?: string;
    actorName: string;
    actorEmail?: string;
    actorRole?: string;
    details?: Record<string, any>;
    createdAt: string;
  }>;
}

export interface SalesRepItem {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
  activeLeads: number;
  pitchesCompletedToday: number;
  dealsClosedToday: number;
  totalRevenueToday: number;
  conversionRate: string;
}

export interface SalesManagerStats {
  pipelineLeads: number;
  activePitching: number;
  pendingPayment: number;
  closedPaidDeals: number;
  totalRevenueMTD: number;
  avgDealSize: number;
  conversionRatePct: number;
  revertedLeads?: number;
}

export interface SalesAgentStats {
  assignedLeads: number;
  pitchInProgress: number;
  paymentsPending: number;
  dealsClosedToday: number;
  myRevenueToday: number;
  myConversionRate: number;
  revertedLeads: number;
}
