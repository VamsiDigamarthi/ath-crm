import type { ColumnDef } from '@tanstack/react-table';
import type { ReturnedLeadItem } from '../hooks/useReturnedLeads';
import { TaxpayerCell } from '@/shared/components/table/TaxpayerCell';
import { Button } from '@/shared/components/Button';
import { Eye, UserCheck } from 'lucide-react';

export const createReturnedLeadColumns = (
  onAudit: (lead: ReturnedLeadItem) => void,
  onAssign: (lead: ReturnedLeadItem) => void
): ColumnDef<ReturnedLeadItem, any>[] => [
  {
    id: 'taxpayer',
    header: 'TAXPAYER',
    accessorFn: (row) => `${row.customer?.firstName || ''} ${row.customer?.lastName || ''} ${row.customer?.email || ''}`,
    cell: ({ row }) => (
      <TaxpayerCell
        name={`${row.original.customer?.firstName || ''} ${row.original.lastName || ''}`.trim() || 'Taxpayer'}
        email={row.original.customer?.email || '—'}
      />
    ),
  },
  {
    id: 'department',
    header: 'DEPARTMENT',
    accessorKey: 'department',
    meta: {
      filterType: 'enum',
      filterOptions: [
        { label: 'Sales', value: 'SALES' },
        { label: 'Documenter', value: 'DOC' },
      ],
    },
    cell: ({ row }) => {
      const isSales = row.original.department === 'SALES';
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
            isSales
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
        >
          {isSales ? 'Sales' : 'Documenter'}
        </span>
      );
    },
  },
  {
    id: 'taxYear',
    header: 'TAX YEAR',
    accessorKey: 'taxYear',
    cell: ({ row }) => (
      <span className="text-xs font-medium text-zinc-900">
        TY{row.original.taxYear}
      </span>
    ),
  },
  {
    id: 'reason',
    header: 'RETURN REASON',
    accessorKey: 'returnedReason',
    cell: ({ row }) => (
      <span className="text-xs text-zinc-600 truncate max-w-[200px] block" title={row.original.returnedReason}>
        {row.original.returnedReason || 'Not Interested'}
      </span>
    ),
  },
  {
    id: 'returnedBy',
    header: 'RETURNED BY',
    accessorKey: 'returnedBy',
    cell: ({ row }) => (
      <span className="text-xs text-zinc-700">
        {row.original.returnedBy || '—'}
      </span>
    ),
  },
  {
    id: 'calls',
    header: 'CALLS',
    accessorKey: 'totalCalls',
    cell: ({ row }) => (
      <span className="text-xs text-zinc-700">
        {row.original.totalCalls} dial{row.original.totalCalls === 1 ? '' : 's'}
      </span>
    ),
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
      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAudit(row.original)}
          className="h-7 px-2 text-[11px] font-normal border-zinc-200 text-zinc-700 hover:bg-zinc-50 cursor-pointer"
        >
          <Eye className="w-3 h-3 text-zinc-500 mr-1" />
          <span>Audit</span>
        </Button>
        <Button
          size="sm"
          onClick={() => onAssign(row.original)}
          className="h-7 px-2 text-[11px] font-medium bg-[#16A34A] hover:bg-[#15803D] text-white shadow-2xs cursor-pointer"
        >
          <UserCheck className="w-3 h-3 mr-1" />
          <span>Assign</span>
        </Button>
      </div>
    ),
  },
];
