import apiClient from '@/lib/api-client';
import type { SalesLeadItem, SalesRepItem, SalesManagerStats } from '../types/sales.types';

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
   * Assign Sales Lead to Closer
   */
  async assignLead(payload: { applicationId: string; salesAgentId: string }) {
    return apiClient.post('/sales/assign', payload);
  },

  /**
   * 1-Click Auto Round-Robin Lead Distribution across Sales Closers
   */
  async autoRoundRobin() {
    return apiClient.post('/sales/auto-round-robin');
  },
};
