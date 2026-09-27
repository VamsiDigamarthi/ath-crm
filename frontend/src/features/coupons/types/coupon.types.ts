export type CouponDiscountType = 'FLAT' | 'PERCENTAGE';
export const CouponDiscountType = {
  FLAT: 'FLAT',
  PERCENTAGE: 'PERCENTAGE',
} as const;

export type CouponJustificationCategory =
  | 'PRICING_CONCERN'
  | 'INTERNAL_SERVICE_ISSUE'
  | 'DOCUMENT_UPLOAD_FRICTION'
  | 'IMMEDIATE_CLOSING_INCENTIVE'
  | 'PROVIDED_REFERRALS'
  | 'RETURNING_LOYALTY'
  | 'OTHER';
export const CouponJustificationCategory = {
  PRICING_CONCERN: 'PRICING_CONCERN',
  INTERNAL_SERVICE_ISSUE: 'INTERNAL_SERVICE_ISSUE',
  DOCUMENT_UPLOAD_FRICTION: 'DOCUMENT_UPLOAD_FRICTION',
  IMMEDIATE_CLOSING_INCENTIVE: 'IMMEDIATE_CLOSING_INCENTIVE',
  PROVIDED_REFERRALS: 'PROVIDED_REFERRALS',
  RETURNING_LOYALTY: 'RETURNING_LOYALTY',
  OTHER: 'OTHER',
} as const;

export type CouponStatus = 'ACTIVE' | 'EXPIRED' | 'DISABLED' | 'DEPLETED';
export const CouponStatus = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  DISABLED: 'DISABLED',
  DEPLETED: 'DEPLETED',
} as const;

export interface DiscountCouponRecord {
  id: string;
  code: string;
  description?: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minServiceFee: number;
  maxDiscountAmount?: number | null;
  justificationCategory: CouponJustificationCategory;
  justificationNotes: string;
  validFrom: string;
  validUntil?: string | null;
  maxUsageLimit?: number | null;
  timesUsed: number;
  status: CouponStatus;
  isActive: boolean;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  approvedBy: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface CouponUsageRecord {
  id: string;
  couponCode: string;
  originalFee: number;
  discountAmount: number;
  finalFee: number;
  justificationCategory: CouponJustificationCategory;
  justificationNotes: string;
  appliedAt: string;
  appliedBy: {
    id: string;
    name: string;
    role: string;
  };
  approvedBy: {
    id: string;
    name: string;
    role: string;
  };
  taxpayer?: {
    id: string;
    name: string;
    email?: string;
  };
  application?: {
    id: string;
    taxYear: number;
    filingType: string;
    stage: string;
  };
}

export interface CouponStatsResponse {
  totalCoupons: number;
  activeCoupons: number;
  totalRedemptions: number;
  totalDiscountGiven: number;
  totalRevenueGenerated: number;
  justificationBreakdown: Array<{
    category: CouponJustificationCategory;
    count: number;
    totalDiscount: number;
    percentage: number;
  }>;
}

export interface CreateCouponFormData {
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

export interface CouponValidationResult {
  isValid: boolean;
  couponId: string;
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  originalFee: number;
  discountAmount: number;
  finalFee: number;
  justificationCategory: CouponJustificationCategory;
  justificationNotes: string;
  rejectionReason?: string;
  message?: string;
  approvedBy: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const JUSTIFICATION_CATEGORY_LABELS: Record<CouponJustificationCategory, { label: string; desc: string; color: string; iconName: string }> = {
  IMMEDIATE_CLOSING_INCENTIVE: {
    label: 'Immediate Closing Incentive',
    desc: 'Time-sensitive deal concession to secure prompt same-day client conversion',
    color: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    iconName: 'Zap',
  },
  PRICING_CONCERN: {
    label: 'Pricing Concern / Fee Objection',
    desc: 'Competitive price-match or fee dispute resolution',
    color: 'bg-amber-50 text-amber-800 border-amber-300',
    iconName: 'DollarSign',
  },
  INTERNAL_SERVICE_ISSUE: {
    label: 'Internal / Employee Service Delay',
    desc: 'Courtesy retention credit for internal delay or staff handover friction',
    color: 'bg-rose-50 text-rose-800 border-rose-300',
    iconName: 'AlertCircle',
  },
  DOCUMENT_UPLOAD_FRICTION: {
    label: 'Document Upload Friction',
    desc: 'Portal usability or mobile document upload inconvenience apology credit',
    color: 'bg-blue-50 text-blue-800 border-blue-300',
    iconName: 'FileText',
  },
  PROVIDED_REFERRALS: {
    label: 'Provided Referrals / Multi-Client',
    desc: 'Reward for bringing coworker/friend tax preparation referrals',
    color: 'bg-purple-50 text-purple-800 border-purple-300',
    iconName: 'Users',
  },
  RETURNING_LOYALTY: {
    label: 'Returning Customer Loyalty',
    desc: 'Multi-year consecutive tax filing client loyalty concession',
    color: 'bg-indigo-50 text-indigo-800 border-indigo-300',
    iconName: 'Award',
  },
  OTHER: {
    label: 'Manager Authorized Exception',
    desc: 'Custom manager-authorized business exception with audit notes',
    color: 'bg-slate-100 text-slate-800 border-slate-300',
    iconName: 'ShieldCheck',
  },
};
