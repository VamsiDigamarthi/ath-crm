export type DocumenterTab = 
  | 'UNASSIGNED'
  | 'NOT_CALLED'
  | 'OUTREACH'
  | 'PREP'
  | 'MY_LEADS'
  | 'CALLBACKS'
  | 'DROPPED'
  | 'ALL';

export type CallDisposition = 
  | 'CONNECTED_INTERESTED'
  | 'CONNECTED_CALLBACK'
  | 'CONNECTED_NOT_INTERESTED'
  | 'NO_ANSWER_VOICEMAIL'
  | 'INVALID_DISCONNECTED';

export interface CallLogItem {
  id: string;
  applicationId: string;
  agentId: string;
  agentName?: string;
  agentRole?: string;
  agentEmail?: string;
  agentAvatar?: string;
  disposition: CallDisposition | string;
  callSummary?: string | null;
  callbackScheduledAt?: string | null;
  durationSeconds?: number;
  createdAt: string;
}

export interface TaxDocumentItem {
  id: string;
  fileName: string;
  fileCategory: 'W2' | '1099' | '1040' | 'ID_PROOF' | 'OTHER';
  fileSize?: string;
  uploadedAt: string;
  uploadedByName?: string;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  fileUrl?: string;
}

export interface StageHistoryItem {
  id: string;
  applicationId?: string;
  fromStage: string;
  toStage: string;
  movedByUserId?: string | null;
  movedByName?: string;
  movedByEmail?: string;
  movedByRole?: string;
  remarks?: string;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  applicationId: string;
  actorId?: string | null;
  actorType?: string;
  actorName?: string;
  actorEmail?: string;
  actorRole?: string;
  action: string;
  moduleKey?: string | null;
  details?: Record<string, unknown> | null;
  createdAt: string;
}

export interface DocumenterLeadCustomer {
  id: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  fullName: string;
  email?: string | null;
  phone: string;
  ssnTin?: string | null;
  dob?: string | null;
  occupation?: string | null;
  visaType?: string | null;
  maritalStatus?: string | null;
  addressLine1?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
}

export interface DocumenterLeadItem extends Record<string, unknown> {
  id: string;
  customerId: string;
  taxYear: number;
  filingType: string;
  currentStage: string;
  customer: DocumenterLeadCustomer;
  assignedDocAgent?: {
    id: string;
    email: string;
    mobile: string;
    role: string;
  } | null;
  lastCallLog?: {
    disposition: string;
    callSummary?: string | null;
    callbackScheduledAt?: string | null;
    createdAt: string;
  } | null;
  callLogs?: CallLogItem[];
  documents?: TaxDocumentItem[];
  stageHistory?: StageHistoryItem[];
  stageHistories?: StageHistoryItem[];
  auditLogs?: AuditLogItem[];
  taxDraftSummary?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocumenterStats {
  unassigned: number;
  uncontacted?: number;
  activeOutreach: number;
  inPrep: number;
  myLeads: number;
  callbacks: number;
  total: number;
  totalDepartment?: number;
  todayDials?: number;
  todayConnected?: number;
  contactRatePct?: number;
  nextCallbackAt?: string | null;
  hourlyBreakdown?: Array<{ hour: string; dials: number; connected: number }>;
  weeklyBreakdown?: Array<{ day: string; dials: number; connected: number; prep: number }>;
  visaDistribution?: Array<{ name: string; value: number; color: string; pct: number }>;
}

export interface DocumenterAgentItem {
  id: string;
  name?: string;
  email: string;
  mobile: string;
  role: string;
  activeLoad: number;
  dials?: number;
  connected?: number;
  conv?: number;
  rate?: string;
  avatar?: string;
}
