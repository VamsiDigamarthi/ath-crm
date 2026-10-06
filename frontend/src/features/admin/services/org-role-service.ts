import apiClient from '@/lib/api-client';

export interface OrgRoleDto {
  id: string;
  name: string;
  description?: string;
  systemRole: string;
  department: string;
  sidebarPermissions: string[];
  defaultRoute?: string;
  isSystemDefault: boolean;
  userCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrgRolePayload {
  name: string;
  description?: string;
  systemRole: string;
  department: string;
  sidebarPermissions: string[];
  defaultRoute?: string;
}

export interface UpdateOrgRolePayload {
  name?: string;
  description?: string;
  systemRole?: string;
  department?: string;
  sidebarPermissions?: string[];
  defaultRoute?: string;
}

export const orgRoleService = {
  listRoles: async (): Promise<OrgRoleDto[]> => {
    const res: any = await apiClient.get('/admin/org-roles');
    return res.data?.data || res.data || [];
  },

  getRole: async (id: string): Promise<OrgRoleDto> => {
    const res: any = await apiClient.get(`/admin/org-roles/${id}`);
    return res.data?.data || res.data;
  },

  createRole: async (data: CreateOrgRolePayload): Promise<OrgRoleDto> => {
    const res: any = await apiClient.post('/admin/org-roles', data);
    return res.data?.data || res.data;
  },

  updateRole: async (id: string, data: UpdateOrgRolePayload): Promise<OrgRoleDto> => {
    const res: any = await apiClient.put(`/admin/org-roles/${id}`, data);
    return res.data?.data || res.data;
  },

  deleteRole: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res: any = await apiClient.delete(`/admin/org-roles/${id}`);
    return res.data;
  },
};
