import apiClient from '@/lib/api-client';
import type { ProductFormData, ProductItem, ProductListResponse, ProductStatus } from '../types/product.types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface FetchProductsParams {
  search?: string;
  status?: ProductStatus | 'ALL';
  page?: number;
  limit?: number;
}

export const productService = {
  list: (params: FetchProductsParams): Promise<ApiResponse<ProductListResponse>> =>
    apiClient.get('/products', { params }),

  listActive: (): Promise<ApiResponse<ProductItem[]>> => apiClient.get('/products/active'),

  create: (data: ProductFormData): Promise<ApiResponse<ProductItem>> => apiClient.post('/products', data),

  update: (id: string, data: ProductFormData): Promise<ApiResponse<ProductItem>> =>
    apiClient.put(`/products/${id}`, data),

  updateStatus: (id: string, status: ProductStatus): Promise<ApiResponse<ProductItem>> =>
    apiClient.patch(`/products/${id}/status`, { status }),
};
