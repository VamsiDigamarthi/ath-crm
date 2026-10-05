import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/shared/components/Button';
import { ClientNameCell, ClientEmailCell, ClientPhoneCell } from '@/shared/components/table';
import { ArrowRight, Send } from 'lucide-react';
import type { FilingLeadItem } from '../types/filing.types';
import { SYSTEM_PAYMENT_STATUSES, SYSTEM_STAGES } from '@/shared/constants/system-enums';

export interface FilingColumnsOptions {
  onOpenWorkspace: (lead: FilingLeadItem) => void;
  onOpenAssignModal?: (lead: FilingLeadItem) => void;
  isSpecialist?: boolean;
  isAdmin?: boolean;
}

export function getFilingColumns({
  onOpenWorkspace,
}: FilingColumnsOptions): ColumnDef<FilingLeadItem, any>[] {
  return [
    {
      id: 'name',
      header: 'NAME',
      accessorFn: (row) => row.taxpayerName || '—',
      cell: ({ row }) => (
        <ClientNameCell name={row.original.taxpayerName} />
      ),
    },
    {
      id: 'email',
      header: 'EMAIL',
      accessorFn: (row) => row.taxpayerEmail || '—',
      cell: ({ row }) => (
        <ClientEmailCell email={row.original.taxpayerEmail} />
      ),
    },
    {
      id: 'phone',
      header: 'MOBILE',
      accessorFn: (row) => row.taxpayerPhone || '—',
      cell: ({ row }) => (
        <ClientPhoneCell phone={row.original.taxpayerPhone} />
      ),
    },
    {
      id: 'taxYear',
      header: 'TY',
      accessorFn: (row) => `TY ${row.taxYear || 2025}`,
      cell: ({ row }) => (
        <span className="text-xs font-medium text-slate-700">
          {row.original.taxYear || 2025}
        </span>
      ),
    },
    {
      id: 'state',
      header: 'STATE',
      accessorKey: 'stateOfResidence',
      cell: ({ row }) => (
        <span className="text-xs font-normal text-slate-700">
          {row.original.stateOfResidence || '—'}
        </span>
      ),
    },
    {
      id: 'refund',
      header: '1040 REFUND',
      accessorFn: (row) => row.federalRefund || row.balanceDue || 0,
      cell: ({ row }) => {
        const fed = Number(row.original.federalRefund) || 0;
        const due = Number(row.original.balanceDue) || 0;
        if (fed > 0) {
          return (
            <span className="text-xs font-medium text-emerald-600">
              +${fed.toLocaleString()}
            </span>
          );
        }
        if (due > 0) {
          return (
            <span className="text-xs font-medium text-rose-600">
              -${due.toLocaleString()}
            </span>
          );
        }
        return <span className="text-xs font-normal text-slate-500">$0</span>;
      },
    },
    {
      id: 'payment',
      header: 'PAYMENT',
      accessorKey: 'paymentStatus',
      meta: {
        filterType: 'enum',
        filterOptions: SYSTEM_PAYMENT_STATUSES,
      },
      cell: ({ row }) => {
        const status = row.original.paymentStatus || 'PAID';
        return (
          <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            {status.replace(/_/g, ' ')}
          </span>
        );
      },
    },
    {
      id: 'esign',
      header: '8879 SIGN',
      accessorKey: 'esignStatus',
      meta: {
        filterType: 'enum',
        filterOptions: [
          { label: 'Signed', value: 'SIGNED' },
          { label: 'Pending Signature', value: 'PENDING' },
        ],
      },
      cell: ({ row }) => {
        const status = row.original.esignStatus || 'SIGNED';
        return (
          <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            {status.replace(/_/g, ' ')}
          </span>
        );
      },
    },
    {
      id: 'stage',
      header: 'TRANSMISSION STAGE',
      accessorKey: 'currentStage',
      meta: {
        filterType: 'enum',
        filterOptions: SYSTEM_STAGES,
      },
      cell: ({ row }) => {
        const stage = row.original.currentStage;
        const isSuccess = stage === 'FILING_SUCCESS';
        return (
          <span
            className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded ${
              isSuccess
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                : 'bg-teal-50 text-teal-700 border border-teal-200'
            }`}
          >
            {stage.replace(/_/g, ' ')}
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
            onClick={() => onOpenWorkspace(row.original)}
            className="h-7 px-2.5 text-[11px] font-medium bg-[#16A34A] hover:bg-[#15803D] text-white flex items-center gap-1 shadow-2xs cursor-pointer"
          >
            <Send className="w-3 h-3" />
            <span>Transmit</span>
            <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      ),
    },
  ];
}
