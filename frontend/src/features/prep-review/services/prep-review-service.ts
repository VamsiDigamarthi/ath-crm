import apiClient from '@/lib/api-client';
import type { PrepStaffMember, PrepReviewLead, PrepManagerStats } from '../types/prep-review.types';
import { INITIAL_PREP_MANAGER_STATS } from '../constants/prep-review-constants';

export interface PipelineLeadsResponse {
  leads: PrepReviewLead[];
  stats?: {
    all: number;
    unassigned: number;
    underPrep: number;
    qaReview: number;
    revisions: number;
    qaApproved: number;
  };
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export const prepReviewService = {
  /**
   * Fetch Staff Members for Tax Prep & Review Department from dedicated backend endpoint
   */
  async getStaffMembers(): Promise<PrepStaffMember[]> {
    try {
      const response: any = await apiClient.get('/prep-review/staff');
      const staff = response?.data || response || [];
      if (Array.isArray(staff)) {
        return staff;
      }
      return [];
    } catch {
      return [];
    }
  },

  /**
   * Fetch Live Pipeline Leads from dedicated backend endpoint
   */
  async getPipelineLeads(params?: {
    tab?: string;
    search?: string;
    staffId?: string;
    preparerId?: string;
    reviewerId?: string;
    page?: number;
    limit?: number;
  }): Promise<PipelineLeadsResponse> {
    try {
      const response: any = await apiClient.get('/prep-review/leads', { params });
      const result = response?.data || response;
      const leads = result?.leads || (Array.isArray(result) ? result : []);
      return {
        leads: Array.isArray(leads) ? leads : [],
        stats: result?.stats,
        pagination: result?.pagination,
      };
    } catch {
      return {
        leads: [],
        stats: {
          all: 0,
          unassigned: 0,
          underPrep: 0,
          qaReview: 0,
          revisions: 0,
          qaApproved: 0,
        },
      };
    }
  },

  /**
   * Assign Tax Return(s) to Preparer & QA Reviewer Pair
   */
  async assignLeadPair(payload: {
    applicationIds: string[];
    preparerId: string;
    reviewerId?: string;
    targetDueDate?: string;
    prepNotes?: string;
  }): Promise<any> {
    return apiClient.post('/prep-review/assign', payload);
  },

  /**
   * Fetch Manager Operations Stats & Analytics from live backend
   */
  async getManagerStats(): Promise<PrepManagerStats> {
    try {
      const response: any = await apiClient.get('/prep-review/dashboard-stats');
      const data = response?.data || response;
      return data || INITIAL_PREP_MANAGER_STATS;
    } catch {
      return INITIAL_PREP_MANAGER_STATS;
    }
  },

  /**
   * Fetch Real Workspace Data (Client, Documents, Assigned Reviewer, Form 1040 draft)
   */
  async getWorkspaceDetails(id: string): Promise<any> {
    try {
      const response: any = await apiClient.get(`/prep-review/workspace/${id}`);
      return response?.data || response;
    } catch (err: any) {
      throw new Error(err?.response?.data?.message || 'Failed to fetch workspace details');
    }
  },

  /**
   * Save 1040 Workspace Calculation Draft
   */
  async saveWorkspaceDraft(id: string, payload: any): Promise<any> {
    return apiClient.post(`/prep-review/workspace/${id}/save-draft`, payload);
  },

  /**
   * Submit 1040 Computation for Senior QA Review
   */
  async submitWorkspaceToQA(id: string, payload: any): Promise<any> {
    return apiClient.post(`/prep-review/workspace/${id}/submit-qa`, payload);
  },

  /**
   * Senior QA Reviewer Sign-Off & Approval
   */
  async signOffQAReturn(id: string, remarks: string): Promise<any> {
    return apiClient.post(`/prep-review/reviewer/audit/${id}/sign-off`, { remarks });
  },

  /**
   * Senior QA Reviewer Request Revision
   */
  async requestRevisionQAReturn(id: string, payload: {
    discrepancyCategory: string;
    revisionNotes: string;
  }): Promise<any> {
    return apiClient.post(`/prep-review/reviewer/audit/${id}/request-revision`, payload);
  },
};

