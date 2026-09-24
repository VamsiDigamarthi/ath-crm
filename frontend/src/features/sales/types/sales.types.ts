export type SalesFilingType = 'INDIVIDUAL' | 'BUSINESS' | 'EXPAT_FBAR';

export type SalesLeadStage = 
  | 'SALES_PITCH_QUEUE'     // Freshly approved by QA, awaiting pitch
  | 'SALES_PITCHING'        // Agent actively calling/pitching client
  | 'QUOTATION_SENT'        // Fee quote generated & sent to client
  | 'PAYMENT_PENDING'       // Client agreed, awaiting card swipe/link payment
  | 'SALES_PAYMENT_PENDING'
  | 'SALES_ESIGN_PENDING'
  | 'PAID_AND_AUTHORIZED'   // Payment verified & Form 8879 E-Signed
  | 'FILING_QUEUE'          // Transferred to Filing Operations
  | 'FILING_IN_PROGRESS'    // Filing currently active
  | 'FILING_SUCCESS'        // Successfully accepted by IRS
  | 'CORRECTION_NEEDED'     // Reverted to Tax Preparer for calculations revision
  | 'QA_REVISION_REQUESTED'
  | 'QA_APPROVED'
  | 'DOC_OUTREACH'          // Reverted to Documenter for missing paperwork
  | 'DOC_PREP'              // Resumed Tax Preparation
  | 'COMPLETED'
  | (string & {});
export type PitchNegotiationStatus = 
  | 'NEED_TIME'           // Need time (Client needs time to think/review before closing)
  | 'PRICING_ISSUE'        // Pricing issue (Client feels the price is high / asking for discount)
  | 'FILING_WITH_OTHERS'   // Filing with others (Client decided to file with local CPA or other software)
  | 'NEED_CALL_WITH_CPA'   // Need call with CPA (Client requires technical tax consultation before paying)
  | 'OTHER_COMMENT';       // Other comment (Custom note entry)

export interface SalesFeeBreakdown {
  fed1040PrepFee: number;
  statePrepFee: number;
  selectedStates: string[];
  fbarFee: number;
  fatcaFee?: number;
  hasFatca?: boolean;
  auditDefenseFee: number;
  hasAuditDefense: boolean;
  discountAmount: number;
  discountCode: string;
  justificationCategory?: string;
  justificationNotes?: string;
  approvedByName?: string;
  totalServiceFee: number;
  isQuoted?: boolean;
}

export type SalesPaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAYMENT_LINK_SENT' | 'PAID' | 'REFUNDED';

export interface PaymentHistoryItem {
  id: string;
  amount: number;
  totalQuotedFee: number;
  cumulativePaid: number;
  remainingBalance: number;
  paymentMethod: 'STRIPE_CARD' | 'PAYPAL' | 'WIRE_TRANSFER' | 'ZELLE' | 'CASH';
  transactionRef?: string;
  paidAt: string;
  collectedBy?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  };
  notes?: string;
}

export interface CloserNoteItem {
  id: string;
  note: string;
  authorId?: string;
  authorName: string;
  authorEmail?: string;
  authorRole?: string;
  disposition?: string;
  callDuration?: number;
  createdAt: string;
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
  priority?: string;
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
  isDualDocSalesRole?: boolean;
  assignedDocAgent?: {
    id: string;
    name: string;
    email: string;
  } | null;
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
    paidAmount?: number;
    totalQuotedFee?: number;
    remainingBalance?: number;
    paymentHistory?: PaymentHistoryItem[];
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
  paymentStatus: SalesPaymentStatus;
  paidAmount?: number;
  remainingBalance?: number;
  paymentHistory?: PaymentHistoryItem[];
  paymentMethod?: 'STRIPE_CARD' | 'PAYPAL' | 'WIRE_TRANSFER' | 'ZELLE' | 'CASH';
  paidAt?: string;
  transactionRef?: string;
  esignStatus: 'NOT_SENT' | 'SENT' | 'VIEWED' | 'SIGNED';
  esignCompletedAt?: string;

  // Negotiation & Closer Outreach Status
  salesPitch?: {
    pitchStatus?: PitchNegotiationStatus | string;
    originalFee?: number;
    negotiatedAmount?: number | null;
    comment?: string;
    updatedAt?: string;
  };
  pitchStatus?: PitchNegotiationStatus | string;
  negotiatedAmount?: number | null;
  originalFee?: number;
  closerCallNotes?: string;
  closerNotesHistory?: CloserNoteItem[];

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
