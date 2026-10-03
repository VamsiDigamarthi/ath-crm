import type { ColumnDef } from '@tanstack/react-table';
import type { AdminCustomerItem } from '../types/customer-directory.types';
import { TaxpayerCell } from '@/shared/components/table/TaxpayerCell';
import { Button } from '@/shared/components/Button';
import { Eye } from 'lucide-react';
import { SYSTEM_STAGES, SYSTEM_PAYMENT_STATUSES, SYSTEM_IRS_STATUSES } from '@/shared/constants/system-enums';

export const createAdminCustomerColumns = (
  onInspect: (item: AdminCustomerItem) => void
): ColumnDef<AdminCustomerItem, any>[] => [
  {
    id: 'customer',
    header: 'TAXPAYER',
    accessorFn: (row) => `${row.fullName} ${row.email}`,
    cell: ({ row }) => (
      <TaxpayerCell
        name={row.original.fullName}
        email={row.original.email}
      />
    ),
  },
  {
    id: 'phone',
    header: 'PHONE',
    accessorKey: 'phone',
    cell: ({ row }) => (
      <span className="text-xs text-zinc-600">
        {row.original.phone || '—'}
      </span>
    ),
  },
  {
    id: 'taxYear',
    header: 'TAX YEAR',
    accessorFn: (row) => row.activeApplication ? `TY${row.activeApplication.taxYear}` : '—',
    cell: ({ row }) => {
      const ty = row.original.activeApplication?.taxYear;
      return ty ? (
        <span className="text-xs font-medium text-zinc-900">TY{ty}</span>
      ) : (
        <span className="text-xs text-zinc-400">—</span>
      );
    },
  },
  {
    id: 'stage',
    header: 'STAGE',
    accessorFn: (row) => row.activeApplication?.currentStage || 'RAW_PROSPECT',
    meta: {
      filterType: 'enum',
      filterOptions: SYSTEM_STAGES,
    },
    cell: ({ row }) => {
      const stage = row.original.activeApplication?.currentStage || 'RAW_PROSPECT';
      return (
        <span className="text-xs text-zinc-700">
          {stage.replace(/_/g, ' ')}
        </span>
      );
    },
  },
  {
    id: 'paymentStatus',
    header: 'PAYMENT',
    accessorFn: (row) => row.activeApplication?.paymentStatus || 'UNPAID',
    meta: {
      filterType: 'enum',
      filterOptions: SYSTEM_PAYMENT_STATUSES,
    },
    cell: ({ row }) => {
      const isPaid = row.original.activeApplication?.paymentStatus === 'PAID';
      return isPaid ? (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          PAID
        </span>
      ) : (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
          PENDING
        </span>
      );
    },
  },
  {
    id: 'irsStatus',
    header: 'IRS STATUS',
    accessorFn: (row) => row.activeApplication?.irsStatus || 'PENDING',
    meta: {
      filterType: 'enum',
      filterOptions: SYSTEM_IRS_STATUSES,
    },
    cell: ({ row }) => {
      const status = row.original.activeApplication?.irsStatus || 'PENDING';
      if (status === 'ACCEPTED') {
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            ACCEPTED
          </span>
        );
      }
      if (status === 'REJECTED') {
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
            REJECTED
          </span>
        );
      }
      return (
        <span className="text-xs text-zinc-500">
          {status.replace(/_/g, ' ')}
        </span>
      );
    },
  },
  {
    id: 'assignedTeam',
    header: 'ASSIGNED DOC',
    accessorFn: (row) => row.activeApplication?.assignedTeam?.docAgent || 'Unassigned',
    cell: ({ row }) => {
      const agent = row.original.activeApplication?.assignedTeam?.docAgent;
      return (
        <span className="text-xs text-zinc-700">
          {agent || 'Unassigned'}
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
          size="sm"
          variant="outline"
          onClick={() => onInspect(row.original)}
          className="h-7 px-2.5 text-[11px] font-normal border-zinc-200 text-zinc-700 hover:bg-zinc-50 cursor-pointer"
        >
          <Eye className="w-3 h-3 text-zinc-500 mr-1" />
          <span>Inspect</span>
        </Button>
      </div>
    ),
  },
];
