import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/shared/components/Button';
import { ClientNameCell, ClientEmailCell, ClientPhoneCell } from '@/shared/components/table';
import { SalesStageBadge } from '../components/common/SalesStageBadge';
import { ClientTypeBadge, CLIENT_TYPE_FILTER_OPTIONS } from '../components/common/ClientTypeBadge';
import { PhoneCall, UserCheck } from 'lucide-react';
import type { SalesLeadItem } from '../types/sales.types';
import { SYSTEM_PAYMENT_STATUSES } from '@/shared/constants/system-enums';

export interface SalesColumnsOptions {
  onOpenPitch: (lead: SalesLeadItem) => void;
  onOpenAssignModal?: (lead: SalesLeadItem) => void;
  isAdmin?: boolean;
}

export function getSalesColumns({
  onOpenPitch,
  onOpenAssignModal,
  isAdmin = false,
}: SalesColumnsOptions): ColumnDef<SalesLeadItem, any>[] {
  const columns: ColumnDef<SalesLeadItem, any>[] = [
    {
      id: 'name',
      header: 'NAME',
      accessorFn: (row) => row.taxpayerName || '—',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <ClientNameCell
            name={item.taxpayerName || '—'}
            badge={
              item.visaType && item.visaType !== '-' ? (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                  {item.visaType}
                </span>
              ) : undefined
            }
            status={item.clientPaymentStatus}
          />
        );
      },
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
      cell: ({ row }) => {
        const item = row.original;
        const appCount = item.allApplications?.length || item.totalTaxYears || 1;
        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-slate-800">
              {item.taxYear || 2025}
            </span>
            {appCount > 1 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                {appCount} Filings
              </span>
            )}
          </div>
        );
      },
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
      id: 'quotedFee',
      header: 'QUOTED FEE',
      accessorFn: (row) => row.feeBreakdown?.totalServiceFee || 0,
      cell: ({ row }) => {
        const fee = Number(row.original.feeBreakdown?.totalServiceFee) || 0;
        const isQuoted = Boolean(row.original.feeBreakdown?.isQuoted || fee > 0);
        return (
          <span className={`text-xs ${isQuoted ? 'font-medium text-slate-900' : 'font-normal text-slate-500'}`}>
            {fee > 0 ? `$${fee}` : 'Unquoted'}
          </span>
        );
      },
    },
    {
      id: 'clientType',
      header: 'CLIENT TYPE',
      accessorKey: 'clientType',
      meta: { filterType: 'enum', filterOptions: CLIENT_TYPE_FILTER_OPTIONS },
      cell: ({ row }) => <ClientTypeBadge type={row.original.clientType} />,
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
        const status = row.original.paymentStatus || 'UNPAID';
        const isPaid = status === 'PAID';
        return (
          <span
            className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded ${
              isPaid
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : status === 'PAYMENT_LINK_SENT'
                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {status.replace(/_/g, ' ')}
          </span>
        );
      },
    },
    {
      id: 'stage',
      header: 'STAGE',
      accessorKey: 'currentStage',
      cell: ({ row }) => <SalesStageBadge stage={row.original.currentStage} />,
    },
    {
      id: 'closer',
      header: 'ASSIGNED CLOSER',
      accessorFn: (row) => row.assignedSalesAgent?.name || 'Unassigned',
      cell: ({ row }) => {
        const item = row.original;
        const agent = item.assignedSalesAgent;
        if (!agent) {
          if (!onOpenAssignModal || isAdmin) {
            return <span className="text-xs text-slate-400">Unassigned</span>;
          }
          return (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenAssignModal(item);
              }}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 cursor-pointer"
            >
              Assign
            </button>
          );
        }
        return (
          <span className="text-xs font-medium text-slate-800">
            {agent.name}
          </span>
        );
      },
    },
  ];

  if (!isAdmin) {
    columns.push({
      id: 'actions',
      header: 'ACTION',
      enableSorting: false,
      enableHiding: false,
      meta: {
        disableMenu: true,
        disableFilter: true,
      },
      cell: ({ row }) => {
        const item = row.original;
        const isAssigned = Boolean(item.assignedSalesAgent);
        const isCompletedOrLocked =
          (item.paymentStatus === 'PAID' && item.esignStatus === 'SIGNED') ||
          item.currentStage === 'PAID_AND_AUTHORIZED' ||
          item.currentStage === 'FILING_QUEUE' ||
          item.currentStage === 'FILING_IN_PROGRESS' ||
          item.currentStage === 'FILING_SUCCESS';
        const isAssignDisabled = isAssigned || isCompletedOrLocked;

        return (
          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            {onOpenAssignModal && (
              <Button
                variant="outline"
                size="sm"
                disabled={isAssignDisabled}
                title={
                  isAssigned
                    ? `Already assigned to ${item.assignedSalesAgent?.name || 'closer'}`
                    : isCompletedOrLocked
                    ? 'Lead is already Paid & E-Signed / Completed'
                    : 'Assign to closer'
                }
                onClick={() => !isAssignDisabled && onOpenAssignModal(item)}
                className={`border-slate-200 text-[11px] font-normal flex items-center gap-1 h-7 px-2 ${
                  isAssignDisabled
                    ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 pointer-events-none'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer'
                }`}
              >
                <UserCheck className="w-3 h-3" />
                <span>Assign</span>
              </Button>
            )}

            <Button
              size="sm"
              onClick={() => onOpenPitch(item)}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-[11px] font-medium flex items-center gap-1 cursor-pointer h-7 px-2.5 shadow-2xs"
            >
              <PhoneCall className="w-3 h-3" />
              <span>Pitch</span>
            </Button>
          </div>
        );
      },
    });
  }

  return columns;
}
