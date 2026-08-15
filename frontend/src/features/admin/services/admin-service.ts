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
    lastName: string;
    email?: string | null;
    phone: string;
    ssnTin?: string | null;
    filingType?: string;
    addressLine1?: string | null;
    city?: string | null;
    state?: string | null;
    zipCode?: string | null;
  }[];
}

export interface BulkImportApiResponse {
  success: boolean;
  message: string;
  data: {
    totalReceived: number;
    validProcessed: number;
    newProfilesCreated: number;
    existingProfilesLinked: number;
    duplicatesSkipped: number;
    taxYear: number;
    processingTimeMs: number;
  };
}

export interface EmployeesListApiResponse {
  success: boolean;
  message: string;
  data: {
    employees: EmployeeItem[];
    stats: EmployeeStats;
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
};
