import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import { PhoneCall, ArrowRight, RotateCcw } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { UnifiedTable } from '@/shared/components/table/UnifiedTable';
import { TaxpayerCell } from '@/shared/components/table/TaxpayerCell';
import { PriorityEditMenu } from '@/shared/components/PriorityEditMenu';
import { ClientNameCell, ClientEmailCell, ClientPhoneCell } from '@/shared/components/table';
import { SalesStageBadge } from '../common/SalesStageBadge';
import { SalesReturnToAdminModal } from '../common/SalesReturnToAdminModal';
import { exportTableToExcel } from '@/shared/utils/export-excel';
import { SYSTEM_PAYMENT_STATUSES } from '@/shared/constants/system-enums';
import type { SalesLeadItem } from '../../types/sales.types';

interface SalesAgentQueueTableProps {
  leads: SalesLeadItem[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onUpdatePriority?: (applicationId: string, priority: string) => void;
}

export const SalesAgentQueueTable: React.FC<SalesAgentQueueTableProps> = ({
  leads,
  isLoading = false,
  onRefresh,
  onUpdatePriority,
}) => {
  const navigate = useNavigate();
  const [selectedLeadForReturn, setSelectedLeadForReturn] = useState<SalesLeadItem | null>(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  const columns = useMemo<ColumnDef<SalesLeadItem, any>[]>(
    () => [
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
        cell: ({ row }) => {
          const appCount = row.original.allApplications?.length || row.original.totalTaxYears || 1;
          return (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-slate-800">
                {row.original.taxYear || 2025}
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
          const isQuoted = Boolean(row.original.feeBreakdown?.isQuoted);
          return (
            <span className={`text-xs ${isQuoted ? 'font-medium text-slate-900' : 'font-normal text-slate-500'}`}>
              {fee > 0 ? `$${fee}` : 'Unquoted'}
            </span>
          );
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
        id: 'esign',
        header: '8879 SIGN',
        accessorKey: 'esignStatus',
        meta: {
          filterType: 'enum',
          filterOptions: [
            { label: 'Signed', value: 'SIGNED' },
            { label: 'Sent', value: 'SENT' },
            { label: 'Not Sent', value: 'NOT_SENT' },
          ],
        },
        cell: ({ row }) => {
          const status = row.original.esignStatus || 'NOT_SENT';
          const isSigned = status === 'SIGNED';
          return (
            <span
              className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded ${
                isSigned
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : status === 'SENT'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
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
        header: 'SALES STAGE',
        accessorKey: 'currentStage',
        meta: {
          filterType: 'enum',
          filterOptions: [
            { label: 'Sales Pitch Queue', value: 'SALES_PITCH_QUEUE' },
            { label: 'Sales Pitching', value: 'SALES_PITCHING' },
            { label: 'Payment Pending', value: 'PAYMENT_PENDING' },
            { label: 'Correction Needed', value: 'CORRECTION_NEEDED' },
            { label: 'Paid - Filing Queue', value: 'FILING_QUEUE' },
          ],
        },
        cell: ({ row }) => <SalesStageBadge stage={row.original.currentStage} />,
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
          const lead = row.original;
          const isReverted =
            lead.currentStage === 'CORRECTION_NEEDED' ||
            (lead.taxDraftSummary as any)?.status === 'REVISION_REQUESTED';

          return (
            <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedLeadForReturn(lead);
                  setIsReturnModalOpen(true);
                }}
                className="h-7 px-2 text-[11px] font-normal border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                title="Return lead to Super Admin"
              >
                <RotateCcw className="w-3 h-3 text-rose-500" />
                <span className="hidden xl:inline">Return</span>
              </Button>

              {onUpdatePriority && (
                <PriorityEditMenu
                  priority={lead.priority}
                  onChange={(priority) => onUpdatePriority(lead.id || lead.applicationId, priority)}
                />
              )}

              <Button
                size="sm"
                onClick={() => navigate(`/sales/agent/client/${lead.taxpayerId || lead.id || lead.applicationId}`)}
                className={`h-7 px-2.5 text-[11px] text-white font-medium flex items-center gap-1 shadow-2xs cursor-pointer ${
                  isReverted ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {isReverted ? <RotateCcw className="w-3 h-3" /> : <PhoneCall className="w-3 h-3" />}
                <span>{isReverted ? 'View Filings' : 'Pitch Returns'}</span>
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          );
        },
      },
    ],
    [navigate, onUpdatePriority]
  );

  const handleExportExcel = () => {
    exportTableToExcel(
      leads,
      [
        { header: 'Taxpayer Name', key: 'taxpayerName' },
        { header: 'Taxpayer Email', key: 'taxpayerEmail' },
        { header: 'Mobile', key: 'taxpayerPhone' },
        { header: 'Tax Year', key: 'taxYear' },
        { header: 'State', key: 'stateOfResidence' },
        { header: 'Federal Refund', key: 'federalRefund', format: (l) => l.federalRefund || 0 },
        { header: 'Balance Due', key: 'balanceDue', format: (l) => l.balanceDue || 0 },
        { header: 'Quoted Fee', key: 'fee', format: (l) => l.feeBreakdown?.totalServiceFee || 0 },
        { header: 'Payment Status', key: 'paymentStatus' },
        { header: 'Form 8879 Status', key: 'esignStatus' },
        { header: 'Stage', key: 'currentStage' },
      ],
      'sales_agent_queue'
    );
  };

  return (
    <>
      <UnifiedTable<SalesLeadItem>
        columns={columns}
        data={leads}
        isLoading={isLoading}
        searchPlaceholder="Search taxpayer, email, state, status..."
        onExportExcel={handleExportExcel}
        onRowClick={(item) => navigate(`/sales/agent/client/${item.taxpayerId || item.id || item.applicationId}`)}
      />

      {/* Return to Admin Modal */}
      {selectedLeadForReturn && (
        <SalesReturnToAdminModal
          isOpen={isReturnModalOpen}
          onClose={() => {
            setIsReturnModalOpen(false);
            setSelectedLeadForReturn(null);
          }}
          applicationId={selectedLeadForReturn.id || selectedLeadForReturn.applicationId}
          taxpayerName={selectedLeadForReturn.taxpayerName}
          taxYear={selectedLeadForReturn.taxYear || 2025}
          onReturnSuccess={() => {
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </>
  );
};
