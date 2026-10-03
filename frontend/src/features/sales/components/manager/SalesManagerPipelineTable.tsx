import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import { Sparkles, PhoneCall, UserCheck } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { UnifiedTable } from '@/shared/components/table/UnifiedTable';
import { TaxpayerCell } from '@/shared/components/table/TaxpayerCell';
import { SalesStageBadge } from '../common/SalesStageBadge';
import { SalesLeadAssignmentModal } from './SalesLeadAssignmentModal';
import { exportTableToExcel } from '@/shared/utils/export-excel';
import { SYSTEM_PAYMENT_STATUSES } from '@/shared/constants/system-enums';
import type { SalesLeadItem, SalesRepItem } from '../../types/sales.types';

interface SalesManagerPipelineTableProps {
  leads: SalesLeadItem[];
  salesReps: SalesRepItem[];
  onAssignLead: (leadId: string, agentId: string) => void;
  onAutoRoundRobin: () => void;
}

export const SalesManagerPipelineTable: React.FC<SalesManagerPipelineTableProps> = ({
  leads,
  salesReps,
  onAssignLead,
  onAutoRoundRobin,
}) => {
  const navigate = useNavigate();
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedLeadForAssign, setSelectedLeadForAssign] = useState<SalesLeadItem | null>(null);
  const [selectedRows, setSelectedRows] = useState<SalesLeadItem[]>([]);

  const columns = useMemo<ColumnDef<SalesLeadItem, any>[]>(
    () => [
      {
        id: 'taxpayer',
        header: 'TAXPAYER',
        accessorFn: (row) => `${row.taxpayerName} ${row.taxpayerEmail}`,
        cell: ({ row }) => (
          <TaxpayerCell
            name={row.original.taxpayerName}
            email={row.original.taxpayerEmail}
          />
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
        id: 'assignedAgent',
        header: 'ASSIGNED CLOSER',
        accessorFn: (row) => row.assignedSalesAgent?.name || 'Unassigned',
        cell: ({ row }) => {
          const agent = row.original.assignedSalesAgent;
          if (!agent) {
            return (
              <span className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                Unassigned
              </span>
            );
          }
          return (
            <span className="text-xs font-medium text-slate-800">
              {agent.name}
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
        cell: ({ row }) => {
          const lead = row.original;
          return (
            <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedLeadForAssign(lead);
                  setIsAssignModalOpen(true);
                }}
                className="h-7 px-2 text-[11px] font-normal border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <UserCheck className="w-3 h-3 text-slate-500" />
                <span>{lead.assignedSalesAgent ? 'Reassign' : 'Assign'}</span>
              </Button>

              <Button
                size="sm"
                onClick={() => navigate(`/sales/manager/pitch/${lead.id || lead.applicationId}`)}
                className="h-7 px-2.5 text-[11px] font-medium bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <PhoneCall className="w-3 h-3" />
                <span>Pitch</span>
              </Button>
            </div>
          );
        },
      },
    ],
    [navigate]
  );

  const handleExportExcel = () => {
    exportTableToExcel(
      leads,
      [
        { header: 'Taxpayer Name', key: 'taxpayerName' },
        { header: 'Taxpayer Email', key: 'taxpayerEmail' },
        { header: 'Tax Year', key: 'taxYear' },
        { header: 'State', key: 'stateOfResidence' },
        { header: 'Refund', key: 'federalRefund', format: (l) => l.federalRefund || 0 },
        { header: 'Quoted Fee', key: 'fee', format: (l) => l.feeBreakdown?.totalServiceFee || 0 },
        { header: 'Payment', key: 'paymentStatus' },
        { header: 'Stage', key: 'currentStage' },
        { header: 'Assigned Closer', key: 'closer', format: (l) => l.assignedSalesAgent?.name || 'Unassigned' },
      ],
      'sales_manager_pipeline'
    );
  };

  return (
    <>
      <UnifiedTable<SalesLeadItem>
        columns={columns}
        data={leads}
        title="SALES OPERATIONS PIPELINE"
        subtitle="Master closer queue, dispatch tracking, workload balancing, and stage governance."
        enableSelection={true}
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        searchPlaceholder="Search taxpayer, email, state, closer..."
        onExportExcel={handleExportExcel}
        onRowClick={(item) => navigate(`/sales/manager/pitch/${item.id || item.applicationId}`)}
        extraHeaderActions={
          <div className="flex items-center gap-2">
            {selectedRows.length > 0 && (
              <Button
                size="sm"
                onClick={() => {
                  setSelectedLeadForAssign(null);
                  setIsAssignModalOpen(true);
                }}
                className="h-8 px-3 text-xs font-semibold bg-[#16A34A] hover:bg-[#15803D] text-white flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Assign Selected ({selectedRows.length})</span>
              </Button>
            )}
            <Button
              size="sm"
              onClick={onAutoRoundRobin}
              className="h-8 px-3 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto Round-Robin</span>
            </Button>
          </div>
        }
      />

      {/* Assignment Modal */}
      {isAssignModalOpen && (
        <SalesLeadAssignmentModal
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false);
            setSelectedLeadForAssign(null);
          }}
          selectedLeads={selectedLeadForAssign ? [selectedLeadForAssign] : selectedRows}
          salesReps={salesReps}
          onConfirmDirectAssign={(agentId: string) => {
            const targets = selectedLeadForAssign ? [selectedLeadForAssign] : selectedRows;
            targets.forEach((t) => onAssignLead(t.id || t.applicationId, agentId));
            setIsAssignModalOpen(false);
            setSelectedLeadForAssign(null);
            setSelectedRows([]);
          }}
          onConfirmRoundRobin={() => {
            onAutoRoundRobin();
            setIsAssignModalOpen(false);
            setSelectedLeadForAssign(null);
            setSelectedRows([]);
          }}
        />
      )}
    </>
  );
};
