export type AcquisitionSource = 
  | 'DIRECT_SIGNUP' 
  | 'BULK_IMPORT' 
  | 'MANUAL_ENTRY' 
  | 'REFERRAL' 
  | 'ORGANIC';

export type LifecycleStatus = 
  | 'CONVERTED' 
  | 'IN_PIPELINE' 
  | 'STALLED' 
  | 'DROPPED' 
  | 'RETURNED';

export type MasterFilingStage = 
  | 'RAW_PROSPECT'
  | 'DOC_OUTREACH'
  | 'DOC_COLLECTION'
  | 'PREP_IN_PROGRESS'
  | 'QA_REVIEW'
  | 'SALES_PITCH'
  | 'PAYMENT_PENDING'
  | 'FILING_READY'
  | 'E_FILED'
  | 'IRS_ACCEPTED'
  | 'DROPPED_UNRESPONSIVE'
  | 'DROPPED_PRICING'
  | 'DROPPED_SELF_FILED'
  | 'RETURNED_TO_POOL';

export type DepartmentTag = 
  | 'UNASSIGNED' 
  | 'DOCUMENTER' 
  | 'PREP_REVIEW' 
  | 'SALES' 
  | 'FILE_OPERATOR' 
  | 'COMPLETED' 
  | 'ARCHIVED';

export type VisaType = 
  | 'H1B' 
  | 'F1_OPT' 
  | 'L1' 
  | 'GREEN_CARD' 
  | 'US_CITIZEN' 
  | 'B1_B2' 
  | 'OTHER';

export interface TaxYearFilingRecord {
  year: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'DROPPED' | 'AVAILABLE';
  formType: 'FORM_1040' | 'FORM_1040_NR' | 'FORM_1120' | 'FORM_1065';
  federalRefund?: number;
  federalTaxDue?: number;
  stateName?: string;
  stateRefund?: number;
  filingDate?: string;
  irsAckId?: string;
}

export interface LifecycleTimelineEvent {
  id: string;
  timestamp: string;
  stage: string;
  title: string;
  description: string;
  actor: string;
  actorRole: string;
}

export interface MasterTaxpayerRecord {
  id: string;
  customerId?: string;
  leadId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  ssnMasked: string;
  fullSsn: string;
  visaType: VisaType;
  filingStatus: 'SINGLE' | 'MARRIED_JOINT' | 'MARRIED_SEPARATE' | 'HEAD_OF_HOUSEHOLD';
  acquisitionSource: AcquisitionSource;
  batchRef?: string;
  createdAt: string;
  updatedAt: string;
  lifecycleStatus: LifecycleStatus;
  currentStage: MasterFilingStage;
  currentDepartment: DepartmentTag;
  assignedAgent?: {
    id: string;
    name: string;
    role: string;
    email: string;
    department: string;
  };
  taxYears: TaxYearFilingRecord[];
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedFee?: number;
  feePaid?: number;
  dropReason?: string;
  lastActivity: string;
  notes?: string;
  city?: string;
  state?: string;
  timeline: LifecycleTimelineEvent[];
}

export interface MasterTaxpayerStats {
  totalRecords: number;
  totalConverted: number;
  totalInPipeline: number;
  totalDroppedOrStalled: number;
  totalDirectSignups: number;
  totalBulkIngested: number;
  totalManualOrReferral: number;
  conversionRate: number;
  stageCounts: Record<string, number>;
  departmentCounts: Record<string, number>;
}
