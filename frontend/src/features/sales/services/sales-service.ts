import apiClient from '@/lib/api-client';
import type { SalesLeadItem, SalesRepItem, SalesManagerStats, SalesAgentStats } from '../types/sales.types';

export interface SalesPipelineResponse {
  leads: SalesLeadItem[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const salesService = {
  /**
   * Fetch Live Sales Pipeline Leads from dedicated backend database endpoint
   */
  async getPipelineLeads(params?: {
    stage?: string;
    search?: string;
    page?: number;
    limit?: number;
    salesAgentId?: string;
  }): Promise<SalesPipelineResponse> {
    try {
      const response: any = await apiClient.get('/sales/leads', { params });
      const result = response?.data || response;
      const leads = result?.leads || (Array.isArray(result) ? result : []);
      return {
        leads: Array.isArray(leads) ? leads : [],
        pagination: result?.pagination,
      };
    } catch (err: any) {
      throw new Error(err?.response?.data?.message || 'Failed to fetch sales leads');
    }
  },

  /**
   * Fetch Single Sales Lead by ID
   */
  async getLeadById(id: string): Promise<SalesLeadItem | null> {
    try {
      const response: any = await apiClient.get(`/sales/leads/${id}`);
      return response?.data?.lead || response?.lead || null;
    } catch (err: any) {
      console.error('Failed to load lead by id:', err);
      return null;
    }
  },

  /**
   * Fetch Sales Staff & Closers from backend
   */
  async getSalesStaff(): Promise<SalesRepItem[]> {
    try {
      const response: any = await apiClient.get('/sales/staff');
      const staff = response?.data?.staff || response?.staff || [];
      return Array.isArray(staff) ? staff : [];
    } catch {
      return [];
    }
  },

  /**
   * Fetch Manager KPI Stats from backend database
   */
  async getManagerStats(): Promise<SalesManagerStats> {
    try {
      const response: any = await apiClient.get('/sales/manager-stats');
      return response?.data?.stats || response?.stats || {
        pipelineLeads: 0,
        activePitching: 0,
        pendingPayment: 0,
        closedPaidDeals: 0,
        totalRevenueMTD: 0,
        avgDealSize: 0,
        conversionRatePct: 0,
      };
    } catch {
      return {
        pipelineLeads: 0,
        activePitching: 0,
        pendingPayment: 0,
        closedPaidDeals: 0,
        totalRevenueMTD: 0,
        avgDealSize: 0,
        conversionRatePct: 0,
      };
    }
  },

  /**
   * Fetch Agent KPI Stats from backend database
   */
  async getAgentStats(salesAgentId?: string): Promise<SalesAgentStats> {
    try {
      const response: any = await apiClient.get('/sales/agent-stats', {
        params: salesAgentId ? { salesAgentId } : undefined,
      });
      const s = response?.data?.stats || response?.stats;
      return {
        assignedLeads: s?.totalAssigned || 0,
        pitchInProgress: s?.activePitching || 0,
        paymentsPending: s?.pendingPayment || 0,
        dealsClosedToday: s?.dealsClosedToday || 0,
        myRevenueToday: s?.revenueToday || 0,
        myConversionRate: s?.conversionRate || 0,
      };
    } catch {
      return {
        assignedLeads: 0,
        pitchInProgress: 0,
        paymentsPending: 0,
        dealsClosedToday: 0,
        myRevenueToday: 0,
        myConversionRate: 0,
      };
    }
  },

  /**
   * Assign Sales Lead to Closer
   */
  async assignLead(payload: { applicationId?: string; applicationIds?: string[]; salesAgentId: string }) {
    return apiClient.post('/sales/assign', payload);
  },

  /**
   * 1-Click Auto Round-Robin Lead Distribution across Sales Closers
   */
  async autoRoundRobin() {
    return apiClient.post('/sales/auto-round-robin');
  },

  /**
   * Dispatch paid & e-signed return to IRS Filing Queue
   */
  async dispatchToFiling(id: string) {
    return apiClient.post(`/sales/leads/${id}/dispatch-filing`);
  },

  /**
   * Record Service Fee Payment in Database
   */
  async recordPayment(id: string, payload: {
    amount: number;
    discountAmount?: number;
    paymentMethod?: string;
    transactionRef?: string;
    notes?: string;
  }) {
    return apiClient.post(`/sales/leads/${id}/record-payment`, payload);
  },

  /**
   * Record Form 8879 Authorization in Database
   */
  async recordEsign(id: string, payload: {
    esignMethod?: string;
    fileName?: string;
    taxpayerPin?: string;
    callRecordingRef?: string;
    notes?: string;
  }) {
    return apiClient.post(`/sales/leads/${id}/record-esign`, payload);
  },
};
