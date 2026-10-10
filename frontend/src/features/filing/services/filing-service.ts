import apiClient from '@/lib/api-client';
import type { FilingLeadItem, FilingStaffMember, FilingManagerStats } from '../types/filing.types';

export interface FilingQueueResponse {
  leads: FilingLeadItem[];
  total: number;
}

export const filingService = {
  /**
   * Fetch Filing Queue with optional stage and specialist filters
   */
  async getQueue(params?: {
    stage?: string;
    search?: string;
    filingAgentId?: string;
    priority?: string;
    limit?: number;
    offset?: number;
  }): Promise<FilingQueueResponse> {
    try {
      const response: any = await apiClient.get('/filing/queue', { params });
      const result = response?.data || response;
      return {
        leads: Array.isArray(result?.leads) ? result.leads : [],
        total: Number(result?.total) || 0,
      };
    } catch (err: any) {
      throw new Error(err?.response?.data?.error || 'Failed to fetch filing queue');
    }
  },

  /**
   * Fetch Single Filing Return by ID
   */
  async getLeadById(id: string): Promise<FilingLeadItem> {
    try {
      const response: any = await apiClient.get(`/filing/leads/${id}`);
      return response?.data || response;
    } catch (err: any) {
      throw new Error(err?.response?.data?.error || 'Failed to fetch filing return details');
    }
  },

  /**
   * Fetch Filing Staff Matrix & Capacity
   */
  async getStaff(): Promise<FilingStaffMember[]> {
    try {
      const response: any = await apiClient.get('/filing/staff');
      const result = response?.data || response;
      return Array.isArray(result) ? result : [];
    } catch (err: any) {
      throw new Error(err?.response?.data?.error || 'Failed to fetch filing staff');
    }
  },

  /**
   * Fetch Filing Manager KPI Statistics
   */
  async getManagerStats(): Promise<FilingManagerStats> {
    try {
      const response: any = await apiClient.get('/filing/manager-stats');
      return response?.data || response;
    } catch (err: any) {
      throw new Error(err?.response?.data?.error || 'Failed to fetch manager stats');
    }
  },

  /**
   * Fetch Generated IRS MeF XML Schema
   */
  async getMeFXML(id: string): Promise<{
    submissionId: string;
    efin: string;
    etin: string;
    xml: string;
    schemaValidation: {
      isValid: boolean;
      irsVersion: string;
      errors: string[];
    };
  }> {
    try {
      const response: any = await apiClient.get(`/filing/leads/${id}/mef-xml`);
      return response?.data || response;
    } catch (err: any) {
      throw new Error(err?.response?.data?.error || 'Failed to generate MeF XML');
    }
  },

  /**
   * Transmit Return to IRS E-Filing Gateway
   */
  /** Record an IRS rejection; the return moves to Returned Status → Rejected returns */
  async markIrsRejected(id: string, reason: string) {
    const response: any = await apiClient.post(`/filing/leads/${id}/irs-reject`, { reason });
    return response?.data || response;
  },

  /** Put a return on hold or release it (flag only, stage unchanged) */
  async setHold(id: string, onHold: boolean, reason?: string) {
    const response: any = await apiClient.post(`/filing/leads/${id}/hold`, { onHold, reason });
    return response?.data || response;
  },

  async transmitToIRS(
    id: string,
    data?: {
      efin?: string;
      taxpayerPin?: string;
      notes?: string;
    }
  ): Promise<{
    success: boolean;
    submissionId: string;
    certificateId: string;
    application: any;
  }> {
    try {
      const response: any = await apiClient.post(`/filing/leads/${id}/transmit`, data || {});
      return response?.data || response;
    } catch (err: any) {
      throw new Error(err?.response?.data?.error || 'IRS Transmission failed');
    }
  },

  /**
   * Assign Filing Specialist to returns
   */
  async assignFilingAgent(applicationIds: string[], filingAgentId: string) {
    try {
      const response: any = await apiClient.post('/filing/assign', { applicationIds, filingAgentId });
      return response?.data || response;
    } catch (err: any) {
      throw new Error(err?.response?.data?.error || 'Failed to assign filing specialist');
    }
  },

  /**
   * Auto-balance unassigned returns across active specialists
   */
  async autoRoundRobin() {
    try {
      const response: any = await apiClient.post('/filing/auto-balance');
      return response?.data || response;
    } catch (err: any) {
      throw new Error(err?.response?.data?.error || 'Failed to balance workload');
    }
  },
};
