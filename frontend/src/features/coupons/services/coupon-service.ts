import apiClient from '@/lib/api-client';
import type {
  DiscountCouponRecord,
  CouponStatsResponse,
  CreateCouponFormData,
  CouponValidationResult,
  CouponUsageRecord,
  CouponStatus,
  CouponJustificationCategory,
  CouponDiscountType,
} from '../types/coupon.types';

export interface FetchCouponsParams {
  search?: string;
  status?: CouponStatus | 'ALL';
  category?: CouponJustificationCategory | 'ALL';
  discountType?: CouponDiscountType | 'ALL';
  page?: number;
  limit?: number;
}

export interface FetchCouponsResponse {
  records: DiscountCouponRecord[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FetchAuditTrailParams {
  couponCode?: string;
  applicationId?: string;
  category?: CouponJustificationCategory | 'ALL';
  page?: number;
  limit?: number;
}

export interface FetchAuditTrailResponse {
  records: CouponUsageRecord[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const CouponsApiService = {
  async getCoupons(params: FetchCouponsParams = {}): Promise<FetchCouponsResponse> {
    const res: any = await apiClient.get('/coupons', { params });
    return res.data?.data || res.data || res;
  },

  async getCouponStats(): Promise<CouponStatsResponse> {
    const res: any = await apiClient.get('/coupons/stats');
    return res.data?.data || res.data || res;
  },

  async createCoupon(data: CreateCouponFormData): Promise<DiscountCouponRecord> {
    const res: any = await apiClient.post('/coupons', data);
    return res.data?.data || res.data || res;
  },

  async validateCoupon(code: string, serviceFee: number, applicationId?: string, customerId?: string): Promise<CouponValidationResult> {
    const res: any = await apiClient.post('/coupons/validate', {
      code,
      serviceFee,
      applicationId,
      customerId,
    });
    return res.data?.data || res.data || res;
  },

  async applyCoupon(code: string, serviceFee: number, applicationId: string, customerId?: string): Promise<any> {
    const res: any = await apiClient.post('/coupons/apply', {
      code,
      serviceFee,
      applicationId,
      customerId,
    });
    return res.data?.data || res.data || res;
  },

  async toggleCouponStatus(id: string, status?: CouponStatus, isActive?: boolean): Promise<DiscountCouponRecord> {
    const res: any = await apiClient.patch(`/coupons/${id}/status`, { status, isActive });
    return res.data?.data || res.data || res;
  },

  async getAuditTrail(params: FetchAuditTrailParams = {}): Promise<FetchAuditTrailResponse> {
    const res: any = await apiClient.get('/coupons/audit-trail', { params });
    return res.data?.data || res.data || res;
  },
};
