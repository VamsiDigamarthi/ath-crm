import type { ColumnDef } from '@tanstack/react-table';
import type { DiscountCouponRecord, CouponUsageRecord } from '../types/coupon.types';
import { Button } from '@/shared/components/Button';
import { AppCopyButton } from '@/shared/components/AppCopyButton';

export const createCouponDirectoryColumns = (
  onToggleStatus: (id: string, status: any, isActive: boolean) => void
): ColumnDef<DiscountCouponRecord, any>[] => [
  {
    id: 'code',
    header: 'COUPON CODE',
    accessorKey: 'code',
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 font-mono">
        <span className="font-semibold text-xs text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
          {row.original.code}
        </span>
        <AppCopyButton text={row.original.code} size="sm" />
      </div>
    ),
  },
  {
    id: 'value',
    header: 'DISCOUNT VALUE',
    accessorFn: (row) => row.discountType === 'FLAT' ? `$${row.discountValue}` : `${row.discountValue}%`,
    cell: ({ row }) => (
      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
        {row.original.discountType === 'FLAT' ? `$${row.original.discountValue} FLAT` : `${row.original.discountValue}% OFF`}
      </span>
    ),
  },
  {
    id: 'category',
    header: 'JUSTIFICATION',
    accessorKey: 'justificationCategory',
    cell: ({ row }) => (
      <span className="text-xs text-zinc-700">
        {row.original.justificationCategory.replace(/_/g, ' ')}
      </span>
    ),
  },
  {
    id: 'approver',
    header: 'APPROVER',
    accessorFn: (row) => row.approvedBy?.name || 'Manager',
    cell: ({ row }) => (
      <span className="text-xs text-zinc-700">
        {row.original.approvedBy?.name || 'Manager'}
      </span>
    ),
  },
  {
    id: 'usage',
    header: 'TIMES USED',
    accessorFn: (row) => `${row.timesUsed} / ${row.maxUsageLimit || '∞'}`,
    cell: ({ row }) => (
      <span className="text-xs text-zinc-600">
        {row.original.timesUsed} {row.original.maxUsageLimit ? `/ ${row.original.maxUsageLimit}` : '(Unlimited)'}
      </span>
    ),
  },
  {
    id: 'status',
    header: 'STATUS',
    accessorFn: (row) => row.isActive ? 'ACTIVE' : 'DISABLED',
    meta: {
      filterType: 'enum',
      filterOptions: [
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Disabled', value: 'DISABLED' },
      ],
    },
    cell: ({ row }) => {
      const active = row.original.isActive;
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
            active
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-zinc-100 text-zinc-600 border-zinc-200'
          }`}
        >
          {active ? 'ACTIVE' : 'DISABLED'}
        </span>
      );
    },
  },
  {
    id: 'actions',
    header: 'ACTION',
    enableSorting: false,
    enableHiding: false,
    meta: {
      disableMenu: true,
      disableFilter: true,
    },
    cell: ({ row }) => (
      <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onToggleStatus(row.original.id, row.original.status, row.original.isActive)}
          className={`h-7 px-2 text-[11px] font-normal rounded cursor-pointer ${
            row.original.isActive
              ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
              : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          {row.original.isActive ? 'Disable' : 'Enable'}
        </Button>
      </div>
    ),
  },
];

export const createCouponAuditColumns = (): ColumnDef<CouponUsageRecord, any>[] => [
  {
    id: 'code',
    header: 'COUPON CODE',
    accessorKey: 'couponCode',
    cell: ({ row }) => (
      <span className="font-mono text-xs font-semibold text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
        {row.original.couponCode}
      </span>
    ),
  },
  {
    id: 'taxpayer',
    header: 'TAXPAYER CLIENT',
    accessorFn: (row) => row.taxpayer?.name || '—',
    cell: ({ row }) => (
      <span className="text-xs text-zinc-800">
        {row.original.taxpayer?.name || '—'}
      </span>
    ),
  },
  {
    id: 'math',
    header: 'PRICING MATH',
    accessorFn: (row) => `$${row.originalFee} -> $${row.finalFee}`,
    cell: ({ row }) => (
      <span className="text-xs text-zinc-700 font-mono">
        ${row.original.originalFee} &rarr; <strong className="text-emerald-700 font-medium">${row.original.finalFee}</strong> (-${row.original.discountAmount})
      </span>
    ),
  },
  {
    id: 'category',
    header: 'JUSTIFICATION',
    accessorKey: 'justificationCategory',
    cell: ({ row }) => (
      <span className="text-xs text-zinc-700">
        {row.original.justificationCategory.replace(/_/g, ' ')}
      </span>
    ),
  },
  {
    id: 'appliedBy',
    header: 'APPLIED BY',
    accessorFn: (row) => row.appliedBy?.name || 'Staff',
    cell: ({ row }) => (
      <span className="text-xs text-zinc-700">
        {row.original.appliedBy?.name || 'Staff'}
      </span>
    ),
  },
  {
    id: 'date',
    header: 'DATE',
    accessorKey: 'appliedAt',
    cell: ({ row }) => (
      <span className="text-xs text-zinc-500 font-normal">
        {row.original.appliedAt ? new Date(row.original.appliedAt).toLocaleDateString() : '—'}
      </span>
    ),
  },
];
