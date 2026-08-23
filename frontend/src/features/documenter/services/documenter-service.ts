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
    timeRange?: 'TODAY' | 'WEEK' | 'SEASON';
  }): Promise<DocumenterLeadsResponse> {
    return apiClient.get('/documenter/leads', { params });
  },

  /**
   * Fetch full 360 case details for a single application including ALL historical call logs
   */
  async getLeadDetails(id: string): Promise<{ success: boolean; data: DocumenterLeadItem }> {
    return apiClient.get(`/documenter/leads/${id}`);
  },

  /**
   * Fetch active documenter agents with live workload stats
   */
  async getAgents(params?: { timeRange?: 'TODAY' | 'WEEK' | 'SEASON' }): Promise<DocumenterAgentsResponse> {
    return apiClient.get('/documenter/agents', { params });
  },

  /**
   * Bulk assign leads to a specific agent/staff member
   */
  async assignBulk(payload: {
    applicationIds: string[];
    targetAgentId: string;
  }): Promise<any> {
    return apiClient.post('/documenter/assign-bulk', payload);
  },

  /**
   * 1-Click Auto Round-Robin Lead Distribution
   */
  async autoRoundRobin(payload: {
    applicationIds?: string[];
  }): Promise<any> {
    return apiClient.post('/documenter/assign-round-robin', payload);
  },

  /**
   * Log outreach call disposition
   */
  async logCallDisposition(payload: {
    applicationIds: string[];
    disposition: CallDisposition;
    callSummary?: string;
    callbackDate?: string;
  }): Promise<any> {
    return apiClient.post('/documenter/dispositions', payload);
  },

  /**
   * Save / update draft tax computation
   */
  async saveTaxDraft(payload: {
    applicationId: string;
    taxDraftSummary: any;
  }): Promise<any> {
    return apiClient.post('/documenter/tax-draft', payload);
  },

  /**
   * Transition lead to Sales Pitch Queue (Handoff to Sales)
   */
  async sendToSales(payload: {
    applicationId: string;
    taxDraftSummary?: any;
    remarks?: string;
  }): Promise<any> {
    return apiClient.post('/documenter/send-to-sales', payload);
  },
};
