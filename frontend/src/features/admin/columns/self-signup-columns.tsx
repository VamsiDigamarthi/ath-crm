import type { ColumnDef } from '@tanstack/react-table';
import type { SelfSignupLeadItem } from '../services/self-signups-service';
import { ClientNameCell, ClientEmailCell, ClientPhoneCell } from '@/shared/components/table/ClientContactCells';
import { Button } from '@/shared/components/Button';
import { UserCheck } from 'lucide-react';
import { SYSTEM_VISA_TYPES, SYSTEM_STAGES } from '@/shared/constants/system-enums';

export const createSelfSignupColumns = (
  onAssign: (lead: SelfSignupLeadItem) => void
): ColumnDef<SelfSignupLeadItem, any>[] => [
  {
    id: 'name',
    header: 'NAME',
    accessorFn: (row) => `${row.customer?.firstName || ''} ${row.customer?.lastName || ''}`.trim() || 'Taxpayer',
    cell: ({ row }) => (
      <ClientNameCell
        name={`${row.original.customer?.firstName || ''} ${row.original.customer?.lastName || ''}`.trim() || 'Taxpayer'}
        status={row.original.clientPaymentStatus}
      />
    ),
  },
  {
    id: 'email',
    header: 'EMAIL',
    accessorFn: (row) => row.customer?.email || '—',
    cell: ({ row }) => <ClientEmailCell email={row.original.customer?.email} />,
  },
  {
    id: 'mobile',
    header: 'MOBILE',
    accessorFn: (row) => row.customer?.phone || '—',
    cell: ({ row }) => <ClientPhoneCell phone={row.original.customer?.phone} />,
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
    cell: ({ row }) => {
      const isAssigned = Boolean(row.original.assignedDocAgent);
      return (
        <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant={isAssigned ? 'outline' : undefined}
            onClick={() => onAssign(row.original)}
            className={
              isAssigned
                ? 'h-7 px-2 text-[11px] font-normal border-slate-200 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer'
                : 'h-7 px-2 text-[11px] font-medium bg-[#16A34A] hover:bg-[#15803D] text-white shadow-2xs cursor-pointer'
            }
          >
            <UserCheck className={`w-3 h-3 mr-1 ${isAssigned ? 'text-slate-500' : ''}`} />
            <span>{isAssigned ? 'Reassign' : 'Assign'}</span>
          </Button>
        </div>
      );
    },
  },
];
