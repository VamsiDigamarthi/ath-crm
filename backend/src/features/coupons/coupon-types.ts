import { CouponDiscountType, CouponJustificationCategory, CouponStatus } from "@prisma/client";

export { CouponDiscountType, CouponJustificationCategory, CouponStatus };

export interface CreateCouponInput {
  code: string;
  description?: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minServiceFee?: number;
  maxDiscountAmount?: number;
  justificationCategory: CouponJustificationCategory;
  justificationNotes: string;
  approvedById?: string;
  validFrom?: string;
  validUntil?: string;
  maxUsageLimit?: number;
}

export interface ValidateCouponInput {
  code: string;
  serviceFee: number;
  applicationId?: string;
  customerId?: string;
}

export interface ApplyCouponInput {
  code: string;
  serviceFee: number;
  applicationId: string;
  customerId?: string;
}

export interface CouponFilterQuery {
  search?: string;
  status?: CouponStatus | 'ALL';
  category?: CouponJustificationCategory | 'ALL';
  discountType?: CouponDiscountType | 'ALL';
  page?: number;
  limit?: number;
}

export interface CouponAuditFilterQuery {
  couponCode?: string;
  applicationId?: string;
  category?: CouponJustificationCategory | 'ALL';
  page?: number;
  limit?: number;
}
