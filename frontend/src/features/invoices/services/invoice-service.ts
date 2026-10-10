import apiClient from '@/lib/api-client';
import type { InvoiceItem } from '../types/invoice.types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const invoiceService = {
  listForApplication: (applicationId: string): Promise<ApiResponse<InvoiceItem[]>> =>
    apiClient.get(`/invoices/applications/${applicationId}`),

  raise: (applicationId: string): Promise<ApiResponse<InvoiceItem>> =>
    apiClient.post(`/invoices/applications/${applicationId}`),

  listMine: (): Promise<ApiResponse<InvoiceItem[]>> => apiClient.get('/invoices/mine'),
};
