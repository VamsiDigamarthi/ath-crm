import apiClient from '@/lib/api-client';
import type { 
  MasterTaxpayerRecord, 
  MasterTaxpayerStats 
} from '../types/master-taxpayers.types';

export interface FetchMasterTaxpayersParams {
  search?: string;
  stage?: string;
  source?: string;
  lifecycle?: string;
  taxYear?: number;
  visa?: string;
  priority?: string;
  page?: number;
  limit?: number;
}

export interface FetchMasterTaxpayersResponse {
  records: MasterTaxpayerRecord[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: MasterTaxpayerStats;
}

export interface TaxpayerYearDetailsResponse {
  taxpayer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    ssnTin: string;
    visaType?: string;
    maritalStatus?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    isConvertedCustomer?: boolean;
    createdAt?: string;
  };
  taxYearsList: Array<{
    year: number;
    status: 'COMPLETED' | 'IN_PROGRESS' | 'DROPPED';
    currentStage: string;
    formType?: string;
    federalRefund?: number;
    federalTaxDue?: number;
    stateName?: string;
    stateRefund?: number;
  }>;
  yearDetails: {
    taxYear: number;
    applicationId?: string;
    currentStage: string;
    priority: string;
    filingType: string;
    taxDraftSummary: Record<string, any>;
    documents: Array<{
      id: string;
      fileName: string;
      filePath: string;
      documentCategory: string;
      verificationStatus: string;
      createdAt: string;
      uploadedBy?: string;
    }>;
    quotes: Array<{
      id: string;
      quoteAmount: number;
      discountAmount: number;
      status: string;
      salesAgent?: string;
    }>;
    stageHistories: Array<{
      id: string;
      fromStage?: string;
      toStage: string;
      remarks?: string;
      createdAt: string;
      movedBy?: string;
    }>;
    callLogs: Array<{
      id: string;
      disposition: string;
      subDisposition?: string;
      callSummary?: string;
      createdAt: string;
      agent?: string;
    }>;
    assignedAgents: {
      docAgent?: { id: string; name: string; role: string; email?: string };
      prepAgent?: { id: string; name: string; role: string; email?: string };
      reviewAgent?: { id: string; name: string; role: string; email?: string };
      salesAgent?: { id: string; name: string; role: string; email?: string };
      fileOp?: { id: string; name: string; role: string; email?: string };
    };
  };
}

export const MasterTaxpayersApiService = {
  async getMasterTaxpayers(params: FetchMasterTaxpayersParams): Promise<FetchMasterTaxpayersResponse> {
    const res: any = await apiClient.get('/admin/master-taxpayers', {
      params,
    });
    return res.data?.data || res.data || res;
  },

  async getTaxpayerYearDetails(customerId: string, taxYear?: number): Promise<TaxpayerYearDetailsResponse> {
    const url = taxYear 
      ? `/admin/master-taxpayers/${customerId}/year/${taxYear}`
      : `/admin/master-taxpayers/${customerId}`;
    const res: any = await apiClient.get(url);
    return res.data?.data || res.data || res;
  },
};

