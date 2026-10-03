import React, { useState, useMemo } from 'react';
import { useCoupons } from '../hooks/useCoupons';
import { CreateCouponModal } from '../components/CreateCouponModal';
import { UnifiedTable } from '@/shared/components/table/UnifiedTable';
import { exportTableToExcel } from '@/shared/utils/export-excel';
import { createCouponDirectoryColumns, createCouponAuditColumns } from '../columns/coupon-columns';
import { AppTabs } from '@/shared/components/AppTabs';
import { Button } from '@/shared/components/Button';
import { Plus } from 'lucide-react';

export const AdminCouponsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'DIRECTORY' | 'AUDIT_TRAIL'>('DIRECTORY');

  const {
    isLoading,
    coupons,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isSubmitting,
    handleCreateCoupon,
    handleToggleStatus,
    auditRecords,
    isAuditLoading,
  } = useCoupons();

  const directoryColumns = useMemo(
    () => createCouponDirectoryColumns(handleToggleStatus),
    [handleToggleStatus]
  );

  const auditColumns = useMemo(
    () => createCouponAuditColumns(),
    []
  );

  const handleExportDirectory = () => {
    exportTableToExcel(
      coupons,
      [
        { header: 'Coupon Code', key: 'code' },
        { header: 'Discount Type', key: 'discountType' },
        { header: 'Discount Value', key: 'discountValue' },
        { header: 'Justification', key: 'justificationCategory' },
        { header: 'Approver', key: 'approver', format: (r) => r.approvedBy?.name || 'Manager' },
        { header: 'Times Used', key: 'timesUsed' },
        { header: 'Status', key: 'status', format: (r) => r.isActive ? 'ACTIVE' : 'DISABLED' },
      ],
      'coupons_directory'
    );
  };

  const handleExportAudit = () => {
    exportTableToExcel(
      auditRecords,
      [
        { header: 'Coupon Code', key: 'couponCode' },
        { header: 'Taxpayer', key: 'taxpayer', format: (r) => r.taxpayer?.name || '—' },
        { header: 'Original Fee', key: 'originalFee' },
        { header: 'Discount', key: 'discountAmount' },
        { header: 'Final Fee', key: 'finalFee' },
        { header: 'Justification', key: 'justificationCategory' },
        { header: 'Applied By', key: 'appliedBy', format: (r) => r.appliedBy?.name || 'Staff' },
      ],
      'coupon_redemptions_audit'
    );
  };

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
            DISCOUNT COUPON GOVERNANCE
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1 font-normal">
            Issue, govern, and audit authorized client discount codes and fee reduction exceptions.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-medium flex items-center gap-1.5 shadow-2xs cursor-pointer h-9 px-4"
        >
          <Plus className="w-4 h-4" />
          <span>+ Issue Authorized Coupon</span>
        </Button>
      </div>

      {/* Tabs */}
      <AppTabs
        tabs={[
          { id: 'DIRECTORY', label: `Active Coupons (${coupons.length})` },
          { id: 'AUDIT_TRAIL', label: `Redemption Audit Logs (${auditRecords.length})` },
        ]}
        activeTab={activeTab}
        onChange={(t) => setActiveTab(t as any)}
      />

      {activeTab === 'DIRECTORY' ? (
        <UnifiedTable
          title="COUPON DIRECTORY"
          subtitle="All promotional codes, discount values, and manager authorizations."
          data={coupons}
          columns={directoryColumns}
          isLoading={isLoading}
          searchPlaceholder="Search coupon code, notes, approver..."
          onExportExcel={handleExportDirectory}
          emptyText="No discount coupons match your active criteria."
        />
      ) : (
        <UnifiedTable
          title="REDEMPTION AUDIT TRAIL"
          subtitle="Complete audit history of applied discount coupons on client service fees."
          data={auditRecords}
          columns={auditColumns}
          isLoading={isAuditLoading}
          searchPlaceholder="Search by coupon code, taxpayer, staff..."
          onExportExcel={handleExportAudit}
          emptyText="No coupon redemptions recorded yet."
        />
      )}

      {/* Create Modal */}
      <CreateCouponModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateCoupon}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
