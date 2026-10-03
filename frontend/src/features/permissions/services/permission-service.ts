import apiClient from '@/lib/api-client';
import type { PermissionItem } from '../types/permission.types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const permissionService = {
  list: (): Promise<ApiResponse<PermissionItem[]>> => apiClient.get('/permissions'),

  setUserPermission: (key: string, userId: string, enabled: boolean): Promise<ApiResponse<unknown>> =>
    apiClient.put(`/permissions/${encodeURIComponent(key)}/users/${userId}`, { enabled }),

  setBulk: (key: string, userIds: string[], enabled: boolean): Promise<ApiResponse<unknown>> =>
    apiClient.put(`/permissions/${encodeURIComponent(key)}/users`, { userIds, enabled }),

  getMine: (): Promise<ApiResponse<string[]>> => apiClient.get('/permissions/me'),
};
