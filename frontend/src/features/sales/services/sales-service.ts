import apiClient from '@/lib/api-client';
import type { SalesLeadItem, SalesRepItem, SalesManagerStats, SalesAgentStats, SalesFeeBreakdown } from '../types/sales.types';

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
    priority?: string;
    salesAgentId?: string;
    isDualRole?: boolean | string;
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
        revertedLeads: s?.revertedLeads || s?.revertedCount || 0,
      };
    } catch {
      return {
        assignedLeads: 0,
        pitchInProgress: 0,
        paymentsPending: 0,
        dealsClosedToday: 0,
        myRevenueToday: 0,
        myConversionRate: 0,
        revertedLeads: 0,
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
   * Dispatch paid & e-signed return to IRS Filing Queue with optional notes
   */
  async dispatchToFiling(id: string, payloadOrNotes?: string | { notes?: string }) {
    const payload = typeof payloadOrNotes === 'string'
      ? { notes: payloadOrNotes }
      : (payloadOrNotes || {});
    return apiClient.post(`/sales/leads/${id}/dispatch-filing`, payload);
  },

  /**
   * Update and persist Pitch Negotiation Status, Original Fee & Negotiated Amount
   */
  async updatePitchNegotiation(id: string, payload: {
    pitchStatus?: string;
    originalFee?: number;
    negotiatedAmount?: number | null;
    comment?: string;
  }) {
    return apiClient.post(`/sales/leads/${id}/pitch-negotiation`, payload);
  },

  /**
   * Save closer call notes directly into database & CallLog
   */
  async saveCloserNotes(id: string, payload: {
    notes: string;
    disposition?: string;
    callDuration?: number;
    callbackScheduledAt?: string | null;
  }) {
    return apiClient.post(`/sales/leads/${id}/notes`, payload);
  },

  /**
   * Update and persist Fee Quotation Breakdown in database
   */
  async updateFeeBreakdown(id: string, feeBreakdown: SalesFeeBreakdown) {
    return apiClient.post(`/sales/leads/${id}/fee-breakdown`, { feeBreakdown });
  },

  /**
   * Record Service Fee Payment in Database
   */
  async recordPayment(id: string, payload: {
    amount: number;
    feeBreakdown?: SalesFeeBreakdown;
    totalQuotedFee?: number;
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

  /**
   * Complete E-Sign alias
   */
  async completeEsign(payload: {
    applicationId: string;
    method?: string;
    pin?: string;
    taxpayerPin?: string;
    fileName?: string;
    notes?: string;
  }) {
    return this.recordEsign(payload.applicationId, {
      esignMethod: payload.method,
      taxpayerPin: payload.taxpayerPin || payload.pin,
      fileName: payload.fileName,
      notes: payload.notes,
    });
  },

  /**
   * Dispatch Stripe Self-Checkout Payment Link to Primary & optional Secondary Email
   */
  async sendPaymentLink(id: string, payload: {
    amount: number;
    primaryEmail?: string;
    secondaryEmail?: string;
    sendToPrimary?: boolean;
    sendToSecondary?: boolean;
    phone?: string;
    notes?: string;
  }) {
    return apiClient.post(`/sales/leads/${id}/send-payment-link`, payload);
  },

  /**
   * Email the Form 8879 signing link to the client (first send or a re-share)
   */
  async sendForm8879(id: string, payload: {
    primaryEmail?: string;
    secondaryEmail?: string;
    sendToPrimary?: boolean;
    sendToSecondary?: boolean;
    emailedByStaff?: boolean;
  }) {
    return apiClient.post(`/sales/leads/${id}/send-form-8879`, payload);
  },

  /**
   * Return a lead back to Admin / Unassigned Pool (when client does not convert or rejects fee)
   */
  async returnLeadToAdmin(id: string, reason?: string) {
    const res: any = await apiClient.post(`/sales/leads/${id}/return-to-admin`, { reason });
    return res?.data || res;
  },

  /**
   * Sales Closer sets the tax application priority
   */
  async updatePriority(id: string, priority: string) {
    const res: any = await apiClient.patch(`/sales/leads/${id}/priority`, { priority });
    return res?.data || res;
  },

  /**
   * Bulk return multiple leads back to Admin Unassigned Pool
   */
  async returnLeadsBulkToAdmin(applicationIds: string[], reason?: string) {
    const res: any = await apiClient.post('/sales/return-to-admin', { applicationIds, reason });
    return res?.data || res;
  },

  /**
   * Sales Closer modifies Form 1040/1120 draft calculation values
   */
  async updateDraftValues(id: string, payload: any): Promise<any> {
    const res: any = await apiClient.post(`/sales/leads/${id}/update-draft-values`, payload);
    return res?.data || res;
  },

  /**
   * Sales Closer uploads scalable client deliverable document
   */
  async uploadDeliverableDocument(id: string, file: File, requiresEsign: boolean = false): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('requiresEsign', String(requiresEsign));
    const res: any = await apiClient.post(`/sales/leads/${id}/deliverable-document`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res?.data || res;
  },

  /**
   * Sales Closer deletes deliverable document
   */
  async deleteDeliverableDocument(id: string, docId: string): Promise<any> {
    const res: any = await apiClient.delete(`/sales/leads/${id}/deliverable-document/${docId}`);
    return res?.data || res;
  },

  /**
   * Sales Closer toggles requiresEsign flag on deliverable document
   */
  async toggleDeliverableEsign(id: string, docId: string, requiresEsign: boolean): Promise<any> {
    const res: any = await apiClient.patch(`/sales/leads/${id}/deliverable-document/${docId}`, { requiresEsign });
    return res?.data || res;
  },

  /**
   * Sales Closer dispatches draft return package & deliverables to client for review & e-sign
   */
  async sendDraftToClient(id: string, payload?: { message?: string }): Promise<any> {
    const res: any = await apiClient.post(`/sales/leads/${id}/send-draft-to-client`, payload || {});
    return res?.data || res;
  },

  /**
   * Sales Closer reopens a new draft version (e.g. v2, v3) on demand
   */
  async reopenDraftVersion(id: string, payload?: { reason?: string }): Promise<any> {
    const res: any = await apiClient.post(`/sales/leads/${id}/reopen-draft-version`, payload || {});
    return res?.data || res;
  },
};

