import apiClient from '@/lib/api-client';
import type { ProductTaxType } from '@/features/products/types/product.types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ReturnItem {
  id: string;
  productId: string | null;
  name: string;
  description: string | null;
  unit: string;
  taxType: ProductTaxType;
  catalogPrice: number;
  unitPrice: number;
  quantity: number;
  isPriceOverridden: boolean;
  amount: number;
  tax: number;
  total: number;
}

export interface ReturnItemsResponse {
  items: ReturnItem[];
  totals: { subtotal: number; tax: number; total: number; count: number };
  canEditPrice: boolean;
}

export const returnItemsService = {
  list: (applicationId: string): Promise<ApiResponse<ReturnItemsResponse>> =>
    apiClient.get(`/applications/${applicationId}/items`),

  add: (applicationId: string, productId: string, quantity: number): Promise<ApiResponse<ReturnItemsResponse>> =>
    apiClient.post(`/applications/${applicationId}/items`, { productId, quantity }),

  update: (
    applicationId: string,
    itemId: string,
    changes: { quantity?: number; unitPrice?: number }
  ): Promise<ApiResponse<ReturnItemsResponse>> => apiClient.patch(`/applications/${applicationId}/items/${itemId}`, changes),

  remove: (applicationId: string, itemId: string): Promise<ApiResponse<ReturnItemsResponse>> =>
    apiClient.delete(`/applications/${applicationId}/items/${itemId}`),
};
