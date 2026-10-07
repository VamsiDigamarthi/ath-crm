export type EditAccessStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED' | 'EXPIRED';

export interface MyEditAccess {
  hasAccess: boolean;
  accessUntil: string | null;
  pendingRequestId: string | null;
  pendingSince: string | null;
}

export interface EditAccessRequestItem {
  id: string;
  applicationId: string;
  department: string;
  reason: string;
  status: EditAccessStatus;
  accessUntil: string | null;
  reviewNote: string | null;
  reviewedAt: string | null;
  reviewedByName: string | null;
  createdAt: string;
  requester: { id: string; name: string; email: string | null; role: string };
  taxpayerName: string;
  taxpayerEmail: string | null;
  taxYear: number;
  filingType: string;
  currentStage: string;
}
