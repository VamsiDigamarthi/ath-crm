import apiClient from '@/lib/api-client';
import type {
  EmailTemplateItem,
  EmailTemplateFormData,
  EmailTemplateQueryParams,
  RoleOption,
} from '../types/email-template.types';

export interface EmailTemplatesApiResponse {
  success: boolean;
  message: string;
  data: EmailTemplateItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface SingleEmailTemplateApiResponse {
  success: boolean;
  message: string;
  data: EmailTemplateItem;
}

export interface RolesApiResponse {
  success: boolean;
  message: string;
  data: RoleOption[];
}

export const emailTemplateService = {
  /**
   * Fetch all system roles for the multiselect dropdown
   */
  async getRoles(): Promise<RolesApiResponse> {
    return apiClient.get('/email-templates/roles');
  },

  /**
   * Fetch paginated list of email templates
   */
  async getTemplates(
    params: EmailTemplateQueryParams = {}
  ): Promise<EmailTemplatesApiResponse> {
    return apiClient.get('/email-templates', { params });
  },

  /**
   * Fetch single email template by ID
   */
  async getTemplateById(id: string): Promise<SingleEmailTemplateApiResponse> {
    return apiClient.get(`/email-templates/${id}`);
  },

  /**
   * Create a new email template
   */
  async createTemplate(
    payload: EmailTemplateFormData
  ): Promise<SingleEmailTemplateApiResponse> {
    return apiClient.post('/email-templates', payload);
  },

  /**
   * Update an existing email template
   */
  async updateTemplate(
    id: string,
    payload: Partial<EmailTemplateFormData>
  ): Promise<SingleEmailTemplateApiResponse> {
    return apiClient.put(`/email-templates/${id}`, payload);
  },

  /**
   * Delete an email template
   */
  async deleteTemplate(id: string): Promise<{ success: boolean; message: string; data: { id: string; message: string } }> {
    return apiClient.delete(`/email-templates/${id}`);
  },

  /**
   * Fetch active email templates configured for current user's role
   */
  async getAvailableTemplates(): Promise<{ success: boolean; message: string; data: EmailTemplateItem[] }> {
    return apiClient.get('/email-templates/available');
  },

  /**
   * Send email to client using logged-in user's SMTP credentials and record in DB
   */
  async sendStaffEmail(payload: {
    applicationId?: string;
    recipientEmail: string;
    subject: string;
    body: string;
    templateId?: string;
  }): Promise<{ success: boolean; message: string; data: any }> {
    return apiClient.post('/email-templates/send', payload);
  },
};

