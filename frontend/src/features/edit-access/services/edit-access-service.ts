import apiClient from '@/lib/api-client';
import type { EditAccessRequestItem, MyEditAccess } from '../types/edit-access.types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const editAccessService = {
  getMine: (applicationId: string): Promise<ApiResponse<MyEditAccess>> =>
    apiClient.get(`/edit-access/applications/${applicationId}/me`),

  request: (applicationId: string, reason: string): Promise<ApiResponse<unknown>> =>
    apiClient.post(`/edit-access/applications/${applicationId}`, { reason }),

  list: (): Promise<ApiResponse<EditAccessRequestItem[]>> => apiClient.get('/edit-access'),

  approve: (id: string, accessUntil: Date, reviewNote?: string): Promise<ApiResponse<unknown>> =>
    apiClient.patch(`/edit-access/${id}/approve`, { accessUntil: accessUntil.toISOString(), reviewNote }),

  reject: (id: string, reviewNote?: string): Promise<ApiResponse<unknown>> =>
    apiClient.patch(`/edit-access/${id}/reject`, { reviewNote }),

  revoke: (id: string): Promise<ApiResponse<unknown>> => apiClient.patch(`/edit-access/${id}/revoke`),
};
