import React, { useState } from 'react';
import { useCoupons } from '../hooks/useCoupons';
import { CreateCouponModal } from '../components/CreateCouponModal';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
import { AppSelect } from '@/shared/components/AppSelect';
import { AppCopyButton } from '@/shared/components/AppCopyButton';
import { AppEmptyState } from '@/shared/components/AppEmptyState';
import { AppTable, type ColumnDef } from '@/shared/components/AppTable';
import { AppTabs } from '@/shared/components/AppTabs';
import { Button } from '@/shared/components/Button';
import { JUSTIFICATION_CATEGORY_LABELS } from '../types/coupon.types';
import type {
  CouponJustificationCategory,
  CouponStatus,
  DiscountCouponRecord,
  CouponUsageRecord,
} from '../types/coupon.types';
import { Plus, RefreshCw, Tag } from 'lucide-react';

type CouponRow = DiscountCouponRecord & Record<string, unknown>;
type AuditRow = CouponUsageRecord & Record<string, unknown>;

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'DISABLED', label: 'Disabled' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'DEPLETED', label: 'Depleted' },
];

const CATEGORY_OPTIONS = [
  { value: 'ALL', label: 'All reasons' },
  { value: 'IMMEDIATE_CLOSING_INCENTIVE', label: 'Immediate closing incentive' },
  { value: 'PRICING_CONCERN', label: 'Pricing concern' },
  { value: 'INTERNAL_SERVICE_ISSUE', label: 'Internal service delay' },
  { value: 'DOCUMENT_UPLOAD_FRICTION', label: 'Document upload friction' },
  { value: 'PROVIDED_REFERRALS', label: 'Referral bonus' },
  { value: 'RETURNING_LOYALTY', label: 'Returning customer' },
  { value: 'OTHER', label: 'Manager exception' },
];

const DISCOUNT_TYPE_OPTIONS = [
  { value: 'ALL', label: 'All types' },
  { value: 'FLAT', label: 'Flat ($)' },
  { value: 'PERCENTAGE', label: 'Percentage (%)' },
];

const formatMoney = (value: number) =>
  `$${(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const categoryLabel = (category?: CouponJustificationCategory) =>
  (category && JUSTIFICATION_CATEGORY_LABELS[category]?.label) || 'Manager exception';

const StatusPill: React.FC<{ status: CouponStatus; isActive: boolean }> = ({ status, isActive }) => {
  const label = !isActive || status === 'DISABLED' ? 'Disabled' : status === 'ACTIVE' ? 'Active' : status === 'EXPIRED' ? 'Expired' : 'Depleted';
  const active = label === 'Active';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
        active ? 'bg-emerald-50 text-[#15803D]' : 'bg-slate-100 text-slate-500'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-[#16A34A]' : 'bg-slate-400'}`} />
      {label}
    </span>
  );
};

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

  const topJustification = Array.isArray(stats?.justificationBreakdown) && stats.justificationBreakdown.length > 0
    ? stats.justificationBreakdown[0]
    : null;
  const topLabel = topJustification
    ? categoryLabel(topJustification.category as CouponJustificationCategory)
    : '—';

  const summary = [
    {
      label: 'Active coupons',
      value: stats?.activeCoupons ?? (coupons || []).filter((c) => c?.status === 'ACTIVE').length,
      hint: `of ${stats?.totalCoupons ?? (coupons || []).length} issued`,
    },
    { label: 'Times redeemed', value: stats?.totalRedemptions ?? 0, hint: 'across all quotes' },
    { label: 'Discount given', value: formatMoney(stats?.totalDiscountGiven ?? 0), hint: 'total concessions' },
    {
      label: 'Top reason',
      value: topLabel,
      hint: topJustification ? `${topJustification.percentage}% of discounts` : 'No redemptions yet',
    },
  ];

  const couponColumns: ColumnDef<CouponRow>[] = [
    {
      header: 'Code',
      accessorKey: 'code',
      render: (c) => (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-slate-900">{c.code}</span>
            <AppCopyButton text={c.code} tooltip="Copy code" className="h-6 w-6" />
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {c.discountType === 'FLAT' ? `$${c.discountValue} off` : `${c.discountValue}% off`}
            {c.minServiceFee > 0 && <span className="text-slate-400"> · min fee ${c.minServiceFee}</span>}
          </div>
        </div>
      ),
    },
    {
      header: 'Reason',
      accessorKey: 'justificationCategory',
      render: (c) => (
        <div className="max-w-xs">
          <div className="text-sm text-slate-800">{categoryLabel(c.justificationCategory)}</div>
          {c.justificationNotes && (
            <div className="text-xs text-slate-500 mt-0.5 line-clamp-1" title={c.justificationNotes}>
              {c.justificationNotes}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Approved by',
      render: (c) => (
        <div>
          <div className="text-sm text-slate-800">{c.approvedBy?.name || 'Manager'}</div>
          <div className="text-xs text-slate-500 mt-0.5">{c.approvedBy?.role || 'ADMIN'}</div>
        </div>
      ),
    },
    {
      header: 'Usage',
      accessorKey: 'timesUsed',
      render: (c) => (
        <span className="text-sm text-slate-700">
          <span className="font-semibold text-slate-900">{c.timesUsed}</span>
          <span className="text-slate-400"> / {c.maxUsageLimit ?? '∞'}</span>
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      render: (c) => <StatusPill status={c.status} isActive={c.isActive} />,
    },
    {
      header: '',
      width: '100px',
      render: (c) => (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => handleToggleStatus(c.id, c.status, c.isActive)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              c.isActive ? 'text-slate-600 hover:text-rose-600 hover:bg-rose-50' : 'text-[#16A34A] hover:bg-emerald-50'
            }`}
          >
            {c.isActive ? 'Disable' : 'Enable'}
          </button>
        </div>
      ),
    },
  ];

  const auditColumns: ColumnDef<AuditRow>[] = [
    {
      header: 'Coupon',
      accessorKey: 'couponCode',
      render: (a) => (
        <div>
          <div className="text-sm font-semibold text-slate-900">{a.couponCode}</div>
          {a.taxpayer && <div className="text-xs text-slate-600 mt-0.5">{a.taxpayer.name}</div>}
          {a.application && (
            <div className="text-xs text-slate-400">
              TY {a.application.taxYear} · {a.application.filingType}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Fee',
      render: (a) => (
        <div className="text-sm">
          <span className="font-semibold text-slate-900">{formatMoney(a.finalFee)}</span>
          <div className="text-xs text-slate-500 mt-0.5">
            <span className="line-through text-slate-400">{formatMoney(a.originalFee)}</span>
            <span className="text-[#15803D]"> −{formatMoney(a.discountAmount)}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Reason',
      accessorKey: 'justificationCategory',
      render: (a) => (
        <div className="max-w-xs">
          <div className="text-sm text-slate-800">{categoryLabel(a.justificationCategory)}</div>
          {a.justificationNotes && (
            <div className="text-xs text-slate-500 mt-0.5 line-clamp-1" title={a.justificationNotes}>
              {a.justificationNotes}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Applied by',
      render: (a) => (
        <div>
          <div className="text-sm text-slate-800">{a.appliedBy?.name || 'Staff'}</div>
          <div className="text-xs text-slate-500 mt-0.5">Approved by {a.approvedBy?.name || 'Manager'}</div>
        </div>
      ),
    },
    {
      header: 'Date',
      accessorKey: 'appliedAt',
      render: (a) => (
        <span className="text-sm text-slate-600">
          {a.appliedAt ? new Date(a.appliedAt).toLocaleString() : '—'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Discount Coupons</h2>
          <p className="text-sm text-slate-500 mt-1">Manager-approved promo codes and their redemption history.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={() => {
              fetchCoupons();
              fetchAuditTrail();
            }}
            title="Refresh"
            className="px-3"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            size="md"
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Coupon
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white border border-slate-200 rounded-xl grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
        {summary.map((s) => (
          <div key={s.label} className="p-5 min-w-0">
            <div className="text-xs font-medium text-slate-500">{s.label}</div>
            <div className="text-xl font-bold text-slate-900 mt-1 truncate" title={String(s.value)}>
              {s.value}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">{s.hint}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <AppTabs
        tabs={[
          { id: 'DIRECTORY', label: 'Coupons', count: totalCount },
          { id: 'AUDIT_TRAIL', label: 'Redemption history', count: auditTotalCount },
        ]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as 'DIRECTORY' | 'AUDIT_TRAIL')}
        size="sm"
      />

      {activeTab === 'DIRECTORY' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="w-full lg:w-72">
              <AppSearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search code or notes..." />
            </div>
            <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
              <div className="w-40">
                <AppSelect
                  value={selectedStatus}
                  onChange={(val) => {
                    setSelectedStatus(val as any);
                    setPage(1);
                  }}
                  options={STATUS_OPTIONS}
                />
              </div>
              <div className="w-52">
                <AppSelect
                  value={selectedCategory}
                  onChange={(val) => {
                    setSelectedCategory(val as any);
                    setPage(1);
                  }}
                  options={CATEGORY_OPTIONS}
                />
              </div>
              <div className="w-36">
                <AppSelect
                  value={selectedDiscountType}
                  onChange={(val) => {
                    setSelectedDiscountType(val as any);
                    setPage(1);
                  }}
                  options={DISCOUNT_TYPE_OPTIONS}
                />
              </div>
              <Button variant="ghost" size="sm" onClick={handleResetFilters} className="text-slate-600">
                Reset
              </Button>
            </div>
          </div>

          <AppTable<CouponRow>
            columns={couponColumns}
            data={coupons as CouponRow[]}
            isLoading={isLoading}
            selectable={false}
            searchable={false}
            density="comfortable"
            rowClassName={(c) => (!c.isActive ? 'opacity-60' : undefined)}
            pagination={{ currentPage: page, totalPages, totalItems: totalCount, itemsPerPage: 10, onPageChange: setPage }}
            emptyContent={
              <AppEmptyState
                icon={Tag}
                title="No coupons yet"
                description="Create a coupon to give approved discounts during sales quotes."
                action={{ label: 'New Coupon', onClick: () => setIsCreateModalOpen(true), icon: Plus }}
              />
            }
          />
        </div>
      )}

      {activeTab === 'AUDIT_TRAIL' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <div className="w-56">
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

          <AppTable<AuditRow>
            columns={auditColumns}
            data={auditRecords as AuditRow[]}
            isLoading={isAuditLoading}
            selectable={false}
            searchable={false}
            density="comfortable"
            pagination={{
              currentPage: auditPage,
              totalPages: auditTotalPages,
              totalItems: auditTotalCount,
              itemsPerPage: 10,
              onPageChange: setAuditPage,
            }}
            emptyContent={
              <AppEmptyState
                icon={Tag}
                title="No redemptions yet"
                description="Coupons applied during sales quotes will show up here."
              />
            }
          />
        </div>
      )}

      <CreateCouponModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateCoupon}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
