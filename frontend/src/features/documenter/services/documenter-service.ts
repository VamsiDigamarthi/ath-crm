import apiClient from '@/lib/api-client';
import type { 
  DocumenterLeadItem, 
  DocumenterStats, 
  DocumenterAgentItem, 
  DocumenterTab,
  CallDisposition
} from '../types/documenter.types';

export interface DocumenterLeadsResponse {
  success: boolean;
  message: string;
  data: {
    leads: DocumenterLeadItem[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
    stats: DocumenterStats;
  };
}

export interface DocumenterAgentsResponse {
  success: boolean;
  message: string;
  data: DocumenterAgentItem[];
}

export const documenterService = {
  /**
   * Fetch paginated leads in Documenter Department
   */
  async getLeads(params: {
    page?: number;
    limit?: number;
    tab?: DocumenterTab;
    search?: string;
    visaType?: string;
    taxYear?: number;
  }): Promise<DocumenterLeadsResponse> {
    const res = await apiClient.get<DocumenterLeadsResponse>('/documenter/leads', { params });
    return res.data;
  },

  /**
   * Fetch active documenter agents with live workload stats
   */
  async getAgents(): Promise<DocumenterAgentsResponse> {
    const res = await apiClient.get<DocumenterAgentsResponse>('/documenter/agents');
    return res.data;
  },

  /**
   * Bulk assign leads to a specific agent/staff member
   */
  async assignBulk(payload: {
    applicationIds: string[];
    targetAgentId: string;
  }) {
    const res = await apiClient.post('/documenter/assign-bulk', payload);
    return res.data;
  },

  /**
   * 1-Click Auto Round-Robin Lead Distribution
   */
  async autoRoundRobin(payload: {
    applicationIds?: string[];
  }) {
    const res = await apiClient.post('/documenter/assign-round-robin', payload);
    return res.data;
  },

  /**
   * Log outreach call disposition
   */
  async logCallDisposition(payload: {
    applicationIds: string[];
    disposition: CallDisposition;
    callSummary?: string;
    callbackDate?: string;
  }) {
    const res = await apiClient.post('/documenter/dispositions', payload);
    return res.data;
  },
};
