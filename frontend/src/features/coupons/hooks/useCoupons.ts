import { useState, useEffect, useCallback } from 'react';
import { 
  CouponsApiService, 
  type FetchCouponsParams,
  type FetchAuditTrailParams
} from '../services/coupon-service';
import type {
  DiscountCouponRecord,
  CouponStatsResponse,
  CouponUsageRecord,
  CouponStatus,
  CouponJustificationCategory,
  CouponDiscountType,
  CreateCouponFormData,
  CouponValidationResult,
} from '../types/coupon.types';
import toast from 'react-hot-toast';

export const useCoupons = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [coupons, setCoupons] = useState<DiscountCouponRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Statistics
  const [stats, setStats] = useState<CouponStatsResponse | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<CouponStatus | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<CouponJustificationCategory | 'ALL'>('ALL');
  const [selectedDiscountType, setSelectedDiscountType] = useState<CouponDiscountType | 'ALL'>('ALL');

  // Create Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Audit Trail Tab State
  const [auditRecords, setAuditRecords] = useState<CouponUsageRecord[]>([]);
  const [auditTotalCount, setAuditTotalCount] = useState(0);
  const [auditTotalPages, setAuditTotalPages] = useState(1);
  const [auditPage, setAuditPage] = useState(1);
  const [auditCategory, setAuditCategory] = useState<CouponJustificationCategory | 'ALL'>('ALL');
  const [isAuditLoading, setIsAuditLoading] = useState(false);

  // Simulator State
  const [simulatorCode, setSimulatorCode] = useState('CLOSE50');
  const [simulatorFee, setSimulatorFee] = useState<number>(350);
  const [simulatorResult, setSimulatorResult] = useState<CouponValidationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatorError, setSimulatorError] = useState<string | null>(null);

  // Fetch Coupons
  const fetchCoupons = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: FetchCouponsParams = {
        search: searchQuery.trim() || undefined,
        status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
        category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
        discountType: selectedDiscountType !== 'ALL' ? selectedDiscountType : undefined,
        page,
        limit,
      };
      const res = await CouponsApiService.getCoupons(params);
      const records = Array.isArray(res?.records) ? res.records : Array.isArray(res) ? res : [];
      setCoupons(records);
      setTotalCount(res?.totalCount ?? records.length);
      setTotalPages(res?.totalPages ?? 1);
    } catch (err: any) {
      console.error('Failed to fetch coupons:', err);
      toast.error(err.message || 'Failed to load coupons');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedStatus, selectedCategory, selectedDiscountType, page, limit]);

  // Fetch Stats
  const fetchStats = useCallback(async () => {
    setIsStatsLoading(true);
    try {
      const res = await CouponsApiService.getCouponStats();
      setStats(res);
    } catch (err: any) {
      console.error('Failed to fetch coupon stats:', err);
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  // Fetch Audit Trail
  const fetchAuditTrail = useCallback(async () => {
    setIsAuditLoading(true);
    try {
      const params: FetchAuditTrailParams = {
        category: auditCategory !== 'ALL' ? auditCategory : undefined,
        page: auditPage,
        limit: 10,
      };
      const res = await CouponsApiService.getAuditTrail(params);
      const records = Array.isArray(res?.records) ? res.records : Array.isArray(res) ? res : [];
      setAuditRecords(records);
      setAuditTotalCount(res?.totalCount ?? records.length);
      setAuditTotalPages(res?.totalPages ?? 1);
    } catch (err: any) {
      console.error('Failed to fetch coupon audit trail:', err);
    } finally {
      setIsAuditLoading(false);
    }
  }, [auditCategory, auditPage]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchAuditTrail();
  }, [fetchAuditTrail]);

  // Create Coupon Action
  const handleCreateCoupon = async (formData: CreateCouponFormData) => {
    setIsSubmitting(true);
    try {
      await CouponsApiService.createCoupon(formData);
      toast.success(`Manager-approved coupon '${formData.code.toUpperCase()}' created successfully!`);
      setIsCreateModalOpen(false);
      fetchCoupons();
      fetchStats();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create coupon');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Coupon Status
  const handleToggleStatus = async (id: string, currentStatus: CouponStatus, currentActive: boolean) => {
    try {
      const newActive = !currentActive;
      const newStatus = newActive ? 'ACTIVE' : 'DISABLED';
      await CouponsApiService.toggleCouponStatus(id, newStatus, newActive);
      toast.success(`Coupon status updated to ${newStatus}`);
      fetchCoupons();
      fetchStats();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update coupon status');
    }
  };

  // Test Simulator
  const handleSimulateCoupon = async (codeToTest?: string, feeToTest?: number) => {
    const code = (codeToTest || simulatorCode).trim().toUpperCase();
    const fee = feeToTest !== undefined ? feeToTest : simulatorFee;
    if (!code) {
      toast.error('Please enter a coupon code to test');
      return;
    }
    setIsSimulating(true);
    setSimulatorError(null);
    try {
      const res = await CouponsApiService.validateCoupon(code, fee);
      setSimulatorResult(res);
      toast.success(`Coupon '${code}' is VALID with authorized justification!`);
    } catch (err: any) {
      setSimulatorError(err.message || 'Coupon validation failed');
      setSimulatorResult(null);
      toast.error(err.message || 'Invalid coupon');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('ALL');
    setSelectedCategory('ALL');
    setSelectedDiscountType('ALL');
    setPage(1);
  };

  return {
    isLoading,
    coupons,
    totalCount,
    totalPages,
    page,
    setPage,
    limit,
    setLimit,

    stats,
    isStatsLoading,

    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    selectedCategory,
    setSelectedCategory,
    selectedDiscountType,
    setSelectedDiscountType,
    handleResetFilters,
    fetchCoupons,

    isCreateModalOpen,
    setIsCreateModalOpen,
    isSubmitting,
    handleCreateCoupon,
    handleToggleStatus,

    auditRecords,
    auditTotalCount,
    auditTotalPages,
    auditPage,
    setAuditPage,
    auditCategory,
    setAuditCategory,
    isAuditLoading,
    fetchAuditTrail,

    simulatorCode,
    setSimulatorCode,
    simulatorFee,
    setSimulatorFee,
    simulatorResult,
    simulatorError,
    isSimulating,
    handleSimulateCoupon,
  };
};
