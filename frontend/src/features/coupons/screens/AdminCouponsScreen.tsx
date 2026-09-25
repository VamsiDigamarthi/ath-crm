import React, { useState } from 'react';
import { useCoupons } from '../hooks/useCoupons';
import { CreateCouponModal } from '../components/CreateCouponModal';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
import { AppSelect } from '@/shared/components/AppSelect';
import { AppCopyButton } from '@/shared/components/AppCopyButton';
import { AppPagination } from '@/shared/components/AppPagination';
import { AppEmptyState } from '@/shared/components/AppEmptyState';
import { Button } from '@/shared/components/Button';
import {
  JUSTIFICATION_CATEGORY_LABELS,
} from '../types/coupon.types';
import type {
  CouponJustificationCategory,
  CouponStatus,
} from '../types/coupon.types';
import {
  Tag,
  Plus,
  ShieldCheck,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
  XCircle,
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active (Redeemable)' },
  { value: 'DISABLED', label: 'Disabled by Manager' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'DEPLETED', label: 'Depleted (Max Uses Reached)' },
];

const CATEGORY_OPTIONS = [
  { value: 'ALL', label: 'All Justification Reasons' },
  { value: 'IMMEDIATE_CLOSING_INCENTIVE', label: '⚡ Immediate Closing Incentive' },
  { value: 'PRICING_CONCERN', label: '💰 Pricing Concern / Price Match' },
  { value: 'INTERNAL_SERVICE_ISSUE', label: '⚠️ Internal Service Delay Credit' },
  { value: 'DOCUMENT_UPLOAD_FRICTION', label: '📄 Document Upload Friction Courtesy' },
  { value: 'PROVIDED_REFERRALS', label: '🤝 Provided Referrals Bonus' },
  { value: 'RETURNING_LOYALTY', label: '🌟 Returning Customer Loyalty' },
  { value: 'OTHER', label: '🛡️ Manager Authorized Exception' },
];

const DISCOUNT_TYPE_OPTIONS = [
  { value: 'ALL', label: 'All Discount Types' },
  { value: 'FLAT', label: 'Flat Amount ($ USD)' },
  { value: 'PERCENTAGE', label: 'Percentage (%)' },
];

export const AdminCouponsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'DIRECTORY' | 'AUDIT_TRAIL'>('DIRECTORY');

  const {
    isLoading,
    coupons,
    totalCount,
    totalPages,
    page,
    setPage,
    stats,

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
  } = useCoupons();

  const renderStatusBadge = (status: CouponStatus, isActive: boolean) => {
    if (!isActive || status === 'DISABLED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
          <XCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>Disabled</span>
        </span>
      );
    }
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Active</span>
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <Clock className="w-3.5 h-3.5 text-rose-500" />
            <span>Expired</span>
          </span>
        );
      case 'DEPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>Depleted</span>
          </span>
        );
      default:
        return null;
    }
  };

  const renderCategoryBadge = (category?: CouponJustificationCategory) => {
    const meta = (category && JUSTIFICATION_CATEGORY_LABELS[category]) || JUSTIFICATION_CATEGORY_LABELS.OTHER;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${meta?.color || 'bg-slate-100 text-slate-800 border-slate-300'}`}>
        <span>{meta?.label || category || 'Manager Authorized'}</span>
      </span>
    );
  };

  // Top driver
  const topJustification = Array.isArray(stats?.justificationBreakdown) && stats.justificationBreakdown.length > 0
    ? stats.justificationBreakdown[0]
    : null;
  const topMeta = topJustification?.category && topJustification.category in JUSTIFICATION_CATEGORY_LABELS
    ? JUSTIFICATION_CATEGORY_LABELS[topJustification.category as keyof typeof JUSTIFICATION_CATEGORY_LABELS]
    : null;

  return (
    <div className="w-full px-6 py-5 space-y-6 pb-24 font-sans">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Manager-Approved Discount Coupons &amp; Audit Control
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
              Audit Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain strict managerial oversight over sales fee adjustments. Every promo code tracks manager authorization and business justification.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchCoupons();
              fetchAuditTrail();
            }}
            className="h-9 px-3 border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Issue Authorized Coupon</span>
          </Button>
        </div>
      </div>

      {/* 2. KPI Metrics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Coupons */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Active Authorized Coupons</span>
            <Tag className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {stats?.activeCoupons ?? (coupons || []).filter((c) => c?.status === 'ACTIVE').length}
            <span className="text-xs font-normal text-slate-400 ml-1.5">
              / {stats?.totalCoupons ?? (coupons || []).length} total issued
            </span>
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-2 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Manager Approved</span>
          </div>
        </div>

        {/* Total Redemptions */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Total Times Redeemed</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {stats?.totalRedemptions ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <span>Applied during quotation checkouts</span>
          </div>
        </div>

        {/* Total Discount Volume Authorized */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Total Discount Concessions</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono">
            ${(stats?.totalDiscountGiven ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <span>Tracked in financial audit trail</span>
          </div>
        </div>

        {/* Top Justification Driver */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Top Justification Driver</span>
            <Zap className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-sm font-bold text-slate-900 truncate">
            {topMeta?.label || (topJustification ? topJustification.category : 'None Yet')}
          </div>
          <div className="text-[11px] text-purple-700 font-semibold mt-2 flex items-center gap-1">
            <span>{topJustification ? `${topJustification.percentage}% of authorized discounts` : 'Awaiting first redemption'}</span>
          </div>
        </div>
      </div>

      {/* 3. Tab Switcher Navigation */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('DIRECTORY')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'DIRECTORY'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>1. Authorized Coupons ({totalCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('AUDIT_TRAIL')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'AUDIT_TRAIL'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>2. Fee Concession &amp; Justification Audit Trail ({auditTotalCount})</span>
          </button>
        </div>
      </div>

      {/* 4. TAB 1: COUPONS DIRECTORY & RULES */}
      {activeTab === 'DIRECTORY' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
          {/* Filters Bar */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex-1 max-w-md">
              <AppSearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by code, notes, or campaign..."
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="w-44">
                <AppSelect
                  value={selectedStatus}
                  onChange={(val) => {
                    setSelectedStatus(val as any);
                    setPage(1);
                  }}
                  options={STATUS_OPTIONS}
                />
              </div>

              <div className="w-56">
                <AppSelect
                  value={selectedCategory}
                  onChange={(val) => {
                    setSelectedCategory(val as any);
                    setPage(1);
                  }}
                  options={CATEGORY_OPTIONS}
                />
              </div>

              <div className="w-40">
                <AppSelect
                  value={selectedDiscountType}
                  onChange={(val) => {
                    setSelectedDiscountType(val as any);
                    setPage(1);
                  }}
                  options={DISCOUNT_TYPE_OPTIONS}
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="h-10 text-xs font-semibold cursor-pointer"
              >
                Reset
              </Button>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
              <div className="text-xs text-slate-500 font-semibold">Loading authorized discount coupons...</div>
            </div>
          ) : coupons.length === 0 ? (
            <div className="p-12 text-center">
              <AppEmptyState
                title="No Coupons Found"
                description="No discount coupons match the selected filter criteria. Click '+ Issue Authorized Coupon' to create one."
                action={{
                  label: '+ Issue Authorized Coupon',
                  onClick: () => setIsCreateModalOpen(true),
                }}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Coupon Code &amp; Value</th>
                    <th className="py-3.5 px-4">Authorized Justification Reason</th>
                    <th className="py-3.5 px-4">Approving Manager</th>
                    <th className="py-3.5 px-4">Redemption Progress</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Code & Value */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                            {coupon.code}
                          </span>
                          <AppCopyButton text={coupon.code} tooltip="Copy Code" className="h-6 w-6" />
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                            {coupon.discountType === 'FLAT' ? `$${coupon.discountValue} FLAT OFF` : `${coupon.discountValue}% PERCENT OFF`}
                          </span>
                          {coupon.minServiceFee > 0 && (
                            <span className="text-[10px] text-slate-400">
                              Min fee: ${coupon.minServiceFee}
                            </span>
                          )}
                        </div>
                        {coupon.description && (
                          <div className="text-[10px] text-slate-400 mt-1 truncate max-w-xs">
                            {coupon.description}
                          </div>
                        )}
                      </td>

                      {/* Business Justification */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {renderCategoryBadge(coupon.justificationCategory)}
                        <p className="text-[11px] text-slate-600 italic mt-1 line-clamp-2" title={coupon.justificationNotes}>
                          &ldquo;{coupon.justificationNotes}&rdquo;
                        </p>
                      </td>

                      {/* Approver */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                            {coupon.approvedBy?.name ? coupon.approvedBy.name.charAt(0).toUpperCase() : 'M'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs">
                              {coupon.approvedBy?.name || 'Manager'}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {coupon.approvedBy?.role || 'ADMIN'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Progress */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                          <span>{coupon.timesUsed} used</span>
                          <span className="text-slate-400">
                            {coupon.maxUsageLimit ? `of ${coupon.maxUsageLimit}` : 'Unlimited'}
                          </span>
                        </div>
                        {coupon.maxUsageLimit && (
                          <div className="w-28 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${Math.min(100, (coupon.timesUsed / coupon.maxUsageLimit) * 100)}%` }}
                            />
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {renderStatusBadge(coupon.status, coupon.isActive)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(coupon.id, coupon.status, coupon.isActive)}
                            className={`h-7 px-2.5 text-[11px] font-semibold transition-colors cursor-pointer rounded-lg ${
                              coupon.isActive
                                ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                                : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            {coupon.isActive ? 'Disable' : 'Enable'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalCount} total coupons)
              </div>
              <AppPagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}

      {/* 5. TAB 2: REDEMPTION & JUSTIFICATION AUDIT TRAIL */}
      {activeTab === 'AUDIT_TRAIL' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Coupon Redemption &amp; Manager Justification Audit Log</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every promo code discount applied in the CRM Fee Quotation Engine with timestamp, client, agent, and authorized reason.
              </p>
            </div>

            <div className="w-60">
              <AppSelect
                value={auditCategory}
                onChange={(val) => {
                  setAuditCategory(val as any);
                  setAuditPage(1);
                }}
                options={CATEGORY_OPTIONS}
              />
            </div>
          </div>

          {isAuditLoading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
              <div className="text-xs text-slate-500 font-semibold">Loading redemption audit trail...</div>
            </div>
          ) : auditRecords.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No coupon redemptions recorded yet matching this filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Coupon &amp; Client</th>
                    <th className="py-3 px-4">Pricing Math (Original &rarr; Final)</th>
                    <th className="py-3 px-4">Business Justification Reason</th>
                    <th className="py-3 px-4">Applied By &amp; Authorized By</th>
                    <th className="py-3 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {auditRecords.map((audit) => (
                    <tr key={audit.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {audit.couponCode}
                        </span>
                        {audit.taxpayer && (
                          <div className="font-semibold text-slate-900 text-xs mt-1">
                            {audit.taxpayer.name}
                          </div>
                        )}
                        {audit.application && (
                          <div className="text-[10px] text-slate-400">
                            TY {audit.application.taxYear} &bull; {audit.application.filingType}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="text-slate-400 line-through">${(audit.originalFee || 0).toFixed(2)}</span>
                          <span className="text-slate-400">&rarr;</span>
                          <span className="font-black text-emerald-600 font-bold">-${(audit.discountAmount || 0).toFixed(2)}</span>
                          <span className="text-slate-400">=</span>
                          <span className="font-black text-slate-900">${(audit.finalFee || 0).toFixed(2)}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        {renderCategoryBadge(audit.justificationCategory)}
                        <p className="text-[11px] text-slate-600 italic mt-1 line-clamp-2">
                          &ldquo;{audit.justificationNotes}&rdquo;
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-xs text-slate-800">
                          Applied by: <strong>{audit.appliedBy?.name || 'Staff'}</strong> ({audit.appliedBy?.role || 'Staff'})
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Authorized by: <strong>{audit.approvedBy?.name || 'Manager'}</strong> ({audit.approvedBy?.role || 'ADMIN'})
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {audit.appliedAt ? new Date(audit.appliedAt).toLocaleString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {auditTotalPages > 1 && (
            <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                Showing Page <strong>{auditPage}</strong> of <strong>{auditTotalPages}</strong> ({auditTotalCount} total audit records)
              </div>
              <AppPagination
                currentPage={auditPage}
                totalPages={auditTotalPages}
                onPageChange={setAuditPage}
              />
            </div>
          )}
        </div>
      )}

      {/* 6. Create Coupon Modal */}
      <CreateCouponModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateCoupon}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
