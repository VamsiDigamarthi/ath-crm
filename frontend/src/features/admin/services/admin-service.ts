import apiClient from '@/lib/api-client';
import type { RegisterAdminInput } from '../validations/admin-schema';

export const adminService = {
  registerAdmin: async (data: RegisterAdminInput) => {
    return apiClient.post('/admin/register', data);
  },
};
