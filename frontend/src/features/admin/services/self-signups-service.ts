import apiClient from '@/lib/api-client';

export interface SelfSignupLeadItem extends Record<string, unknown> {
  id: string;
  customerId: string;
  taxYear: number;
  filingType: string;
  currentStage: string;
  priority: string;
  assignedDocAgentId?: string | null;
  assignedPrepAgentId?: string | null;
  assignedSalesAgentId?: string | null;
  taxDraftSummary?: any;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string | null;
    phone: string;
    ssnTin?: string | null;
    visaType?: string | null;
    occupation?: string | null;
    applications?: Array<{
      id: string;
      taxYear: number;
      filingType?: string;
      currentStage?: string;
      taxDraftSummary?: any;
    }>;
    user?: {
      id: string;
      email?: string | null;
      mobile?: string | null;
      createdAt: string;
      isActive: boolean;
    };
  };
  assignedDocAgent?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  } | null;
  assignedPrepAgent?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  } | null;
  assignedSalesAgent?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  } | null;
  previousDocAgent?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    taxYear: number;
  } | null;
  stageHistories?: Array<{
    id: string;
    fromStage?: string | null;
    toStage: string;
    remarks?: string | null;
    createdAt: string;
    movedByUserId?: string | null;
    movedByName?: string;
    movedByEmail?: string;
    movedByRole?: string;
    movedByUser?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role?: string;
    };
  }>;
  callLogs?: Array<{
    id: string;
    applicationId?: string;
    disposition: string;
    subDisposition?: string | null;
    callSummary?: string | null;
    agentName?: string;
    agentEmail?: string;
    agentRole?: string;
    durationSeconds?: number;
    createdAt: string;
  }>;
  auditLogs?: Array<{
    id: string;
    applicationId?: string;
    action: string;
    actorName?: string | null;
    actorRole?: string | null;
    actorEmail?: string | null;
    actorType?: string;
    moduleKey?: string | null;
    details?: any;
    createdAt: string;
  }>;
}

export interface SelfSignupsResponse {
  leads: SelfSignupLeadItem[];
  stats: {
    totalSelfSignups: number;
    rawProspectsCount: number;
    docOutreachCount: number;
    inProgressCount: number;
    completedFilingsCount: number;
  };
  availableDocAgents: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

export const selfSignupsService = {
  getSelfSignups: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    visaType?: string;
    taxYear?: number;
    stage?: string;
    priority?: string;
  }): Promise<SelfSignupsResponse> => {
    const res: any = await apiClient.get('/admin/self-signups', { params });
    return res.data?.data || res.data || res;
  },

  assignSelfSignupsBulk: async (applicationIds: string[], targetAgentId: string) => {
    const res: any = await apiClient.post('/admin/self-signups/assign-bulk', {
      applicationIds,
      targetAgentId,
    });
    return res.data?.data || res.data || res;
  },

  autoRoundRobinSelfSignups: async (applicationIds: string[]) => {
    const res: any = await apiClient.post('/admin/self-signups/assign-round-robin', {
      applicationIds,
    });
    return res.data?.data || res.data || res;
  },
};
