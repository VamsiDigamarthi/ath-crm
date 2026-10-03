import type { ColumnDef } from '@tanstack/react-table';
import type { SelfSignupLeadItem } from '../services/self-signups-service';
import { TaxpayerCell } from '@/shared/components/table/TaxpayerCell';
import { Button } from '@/shared/components/Button';
import { UserCheck } from 'lucide-react';
import { SYSTEM_VISA_TYPES, SYSTEM_STAGES } from '@/shared/constants/system-enums';

export const createSelfSignupColumns = (
  onAssign: (lead: SelfSignupLeadItem) => void
): ColumnDef<SelfSignupLeadItem, any>[] => [
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
    id: 'visa',
    header: 'VISA',
    accessorFn: (row) => row.customer?.visaType || '—',
    meta: {
      filterType: 'enum',
      filterOptions: SYSTEM_VISA_TYPES,
    },
    cell: ({ row }) => (
      <span className="text-xs text-zinc-700">
        {row.original.customer?.visaType || '—'}
      </span>
    ),
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
    id: 'stage',
    header: 'STAGE',
    accessorKey: 'currentStage',
    meta: {
      filterType: 'enum',
      filterOptions: SYSTEM_STAGES,
    },
    cell: ({ row }) => (
      <span className="text-xs text-zinc-700">
        {row.original.currentStage.replace(/_/g, ' ')}
      </span>
    ),
  },
  {
    id: 'agent',
    header: 'ASSIGNED AGENT',
    accessorFn: (row) => row.assignedDocAgent ? `${row.assignedDocAgent.firstName} ${row.assignedDocAgent.lastName}` : 'Unassigned',
    cell: ({ row }) => {
      const docAgent = row.original.assignedDocAgent;
      return (
        <span className="text-xs text-zinc-700">
          {docAgent ? `${docAgent.firstName} ${docAgent.lastName}` : 'Unassigned'}
        </span>
      );
    },
  },
  {
    id: 'registeredAt',
    header: 'REGISTERED',
    accessorKey: 'createdAt',
    cell: ({ row }) => (
      <span className="text-xs text-zinc-500">
        {row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : '—'}
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
      <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
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
