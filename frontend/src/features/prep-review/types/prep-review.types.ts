export type PrepReviewStage =
  | 'DOC_PREP_COMPLETE'   // Ready for Prep Assignment
  | 'PREP_ASSIGNED'        // Assigned to Preparer
  | 'PREP_IN_PROGRESS'     // Preparer actively calculating 1040/W-2
  | 'QA_REVIEW_QUEUE'      // Sent for Review / Quality Assurance
  | 'QA_IN_REVIEW'         // Reviewer reviewing computations
  | 'QA_REVISION_REQUESTED'// Reviewer requested correction from preparer
  | 'QA_APPROVED'          // QA signed off, ready for Sales Pitch
  | 'SALES_PITCH_QUEUE';   // Transferred to Sales

export type ReturnComplexity = 'STANDARD' | 'MULTI_STATE' | 'INVESTMENTS_1099B' | 'FOREIGN_FBAR' | 'BUSINESS_SCH_C';

export interface PrepReviewLead {
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
  complexity: ReturnComplexity;
  currentStage: string;
  prepStage?: PrepReviewStage;

  // Assigned Staff Across Entire Lifecycle
  assignedDocAgent?: {
    id: string;
    name: string;
    email: string;
  };
  assignedPreparer?: {
    id: string;
    name: string;
    email: string;
  } | null;
  assignedReviewer?: {
    id: string;
    name: string;
    email: string;
  } | null;
  assignedSalesAgent?: {
    id: string;
    name: string;
    email: string;
  } | null;
  assignedFileOp?: {
    id: string;
    name: string;
    email: string;
  } | null;

  // Documents & Intake Status
  documentsCount: number;
  verifiedDocumentsCount: number;
  organizerPercent: number;

  // Tax Draft Summary
  taxDraftSummary?: any;
  targetDueDate?: string | null;
  prepNotes?: string;

  // Financial Snapshot
  estimatedWages: number;
  estimatedRefund: number;
  estimatedBalanceDue: number;

  // Dates
  intakeCompletedAt: string;
  prepStartedAt?: string;
  reviewStartedAt?: string;
  dueByDate?: string;
  lastUpdated: string;
}

export interface PrepStaffMember {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: 'PREP_MANAGER' | 'TAX_REVIEWER' | 'TAX_PREPARER';
  roleLabel: string;
  totalAssignedCount?: number;
  totalAssignedPrep?: number;
  totalAssignedReview?: number;
  activeCaseload: number;
  prepActiveCount?: number;
  reviewActiveCount?: number;
  maxCapacity?: number;
  completedThisMonth: number;
  prepCompletedCount?: number;
  reviewCompletedCount?: number;
  avgTurnaroundHours: number;
  accuracyRate: number; // e.g. 98.5%
  isAvailable: boolean;
  avatar: string;
}

export interface PrepManagerStats {
  totalInPipeline: number;
  unassignedToPrep: number;
  underPreparation: number;
  inQualityReview: number;
  revisionsPending: number;
  readyForSales: number;
  avgPreparationTimeHrs: number;
  firstTimePassRate: number;
  complexityMix?: Array<{ name: string; value: number; color: string; pct: number }>;
  hourlyVelocity?: Array<{ hour: string; prepared: number; reviewed: number }>;
  weeklyVelocity?: Array<{ day: string; prepared: number; reviewed: number }>;
}
