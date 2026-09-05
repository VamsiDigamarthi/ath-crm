import apiClient from '@/lib/api-client';
import type { RegisterAdminInput } from '../validations/admin-schema';
import type { 
  EmployeeItem, 
  EmployeeStats, 
  DepartmentType, 
  EmployeeRole, 
  AddEmployeeFormData 
} from '../types/employee.types';

export interface BulkImportPayload {
  taxYear: number;
  leads: {
    firstName: string;
    middleName?: string | null;
    lastName: string;
    email?: string | null;
    phone: string;
    ssnTin?: string | null;
    dob?: string | null;
    occupation?: string | null;
    visaType?: string | null;
    maritalStatus?: string | null;
    filingType?: string;
    addressLine1?: string | null;
    city?: string | null;
    state?: string | null;
    zipCode?: string | null;
  }[];
}

import type { BulkImportServerResult } from '../types/bulk-import.types';

export interface BulkImportApiResponse {
  success: boolean;
  message: string;
  data: BulkImportServerResult;
}

export interface EmployeesListApiResponse {
  success: boolean;
  message: string;
  data: {
    employees: EmployeeItem[];
    stats: EmployeeStats;
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

export interface SingleEmployeeApiResponse {
  success: boolean;
  message: string;
  data: EmployeeItem;
}

export interface BulkOnboardApiResponse {
  success: boolean;
  message: string;
  data: {
    totalReceived: number;
    createdCount: number;
    duplicatesSkipped: number;
  };
}

export const adminService = {
  registerAdmin: async (data: RegisterAdminInput) => {
    return apiClient.post('/admin/register', data);
  },

  bulkImportLeads: async (data: BulkImportPayload): Promise<BulkImportApiResponse> => {
    return apiClient.post('/admin/leads/bulk-import', data);
  },

  getEmployees: async (params?: {
    search?: string;
    department?: DepartmentType;
    role?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<EmployeesListApiResponse> => {
    return apiClient.get('/admin/employees', { params });
  },

  createEmployee: async (data: AddEmployeeFormData): Promise<SingleEmployeeApiResponse> => {
    return apiClient.post('/admin/employees', data);
  },

  updateEmployee: async (
    id: string,
    data: Partial<AddEmployeeFormData>
  ): Promise<SingleEmployeeApiResponse> => {
    return apiClient.put(`/admin/employees/${id}`, data);
  },

  toggleEmployeeStatus: async (id: string): Promise<any> => {
    return apiClient.patch(`/admin/employees/${id}/toggle-status`);
  },

  resetEmployeeCredentials: async (id: string): Promise<any> => {
    return apiClient.post(`/admin/employees/${id}/reset-credentials`);
  },

  deleteEmployee: async (id: string): Promise<any> => {
    return apiClient.delete(`/admin/employees/${id}`);
  },

  bulkOnboardEmployees: async (employees: {
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
    role: EmployeeRole;
    isActive?: boolean;
  }[]): Promise<BulkOnboardApiResponse> => {
    return apiClient.post('/admin/employees/bulk-onboard', { employees });
  },

  getCustomers: async (params?: {
    search?: string;
    taxYear?: number;
    filingStatus?: 'ALL' | 'ACCEPTED' | 'REJECTED' | 'IN_PROGRESS';
    page?: number;
    limit?: number;
  }): Promise<any> => {
    return apiClient.get('/admin/customers', { params });
  },

  getCustomerDetails: async (id: string): Promise<any> => {
    return apiClient.get(`/admin/customers/${id}`);
  },

  getDashboardStats: async (): Promise<{
    success: boolean;
    data: {
      counts: {
        totalProspects: number;
        documenterCount: number;
        prepReviewCount: number;
        salesCount: number;
        filingQueueCount: number;
        completedFilingsCount: number;
        totalEmployees: number;
      };
      recentActivities: Array<{
        id: string;
        title: string;
        details: string;
        time: string;
        type: 'success' | 'info' | 'warning' | 'primary';
      }>;
    };
  }> => {
    return apiClient.get('/admin/dashboard-stats');
  },
};
