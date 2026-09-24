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

  };
};
