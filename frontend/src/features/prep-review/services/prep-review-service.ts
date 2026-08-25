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
};
