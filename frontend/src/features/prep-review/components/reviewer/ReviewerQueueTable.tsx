import React, { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { UnifiedTable } from '@/shared/components/table/UnifiedTable';
import { TaxpayerCell } from '@/shared/components/table/TaxpayerCell';
import { PrepStageBadge } from '../common/PrepStageBadge';
import { exportTableToExcel } from '@/shared/utils/export-excel';
import type { PrepReviewLead } from '../../types/prep-review.types';

interface ReviewerQueueTableProps {
  returns: PrepReviewLead[];
  isLoading: boolean;
  onOpenAudit: (id: string) => void;
}

export const ReviewerQueueTable: React.FC<ReviewerQueueTableProps> = ({
  returns,
  isLoading,
  onOpenAudit,
}) => {
  const columns = useMemo<ColumnDef<PrepReviewLead, any>[]>(
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
        id: 'preparer',
        header: 'PREPARER',
        accessorFn: (row) => row.assignedPreparer?.name || 'Unassigned',
        cell: ({ row }) => {
          const prep = row.original.assignedPreparer;
          return (
            <span className="text-xs font-normal text-slate-800">
              {prep?.name || 'Unassigned'}
            </span>
          );
        },
      },
      {
        id: 'refund',
        header: '1040 REFUND',
        accessorFn: (row) => {
          const draft: any = (row as any).taxDraftSummary || {};
          return draft.federalRefund !== undefined ? Number(draft.federalRefund) : row.estimatedRefund || 0;
        },
        cell: ({ row }) => {
          const draft: any = (row.original as any).taxDraftSummary || {};
          const fed = draft.federalRefund !== undefined ? Number(draft.federalRefund) : row.original.estimatedRefund || 0;
          const due = draft.balanceDue !== undefined ? Number(draft.balanceDue) : row.original.estimatedBalanceDue || 0;

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
        id: 'docs',
        header: 'DOCS',
        accessorFn: (row) => `${row.verifiedDocumentsCount || 0}/${row.documentsCount || 0}`,
        cell: ({ row }) => {
          const verified = row.original.verifiedDocumentsCount || 0;
          const total = row.original.documentsCount || 0;
          return (
            <span className="text-xs font-normal text-slate-700">
              {verified}/{total} verified
            </span>
          );
        },
      },
      {
        id: 'stage',
        header: 'AUDIT STAGE',
        accessorKey: 'currentStage',
        meta: {
          filterType: 'enum',
          filterOptions: [
            { label: 'QA Review', value: 'QA_REVIEW' },
            { label: 'Correction Needed', value: 'CORRECTION_NEEDED' },
            { label: 'Sales Pitching', value: 'SALES_PITCHING' },
          ],
        },
        cell: ({ row }) => <PrepStageBadge stage={row.original.currentStage} />,
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
              onClick={() => onOpenAudit(row.original.id || row.original.applicationId)}
              className="h-7 px-2.5 text-[11px] font-medium bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>QA Review</span>
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        ),
      },
    ],
    [onOpenAudit]
  );

  const handleExportExcel = () => {
    exportTableToExcel(
      returns,
      [
        { header: 'Taxpayer Name', key: 'taxpayerName' },
        { header: 'Email', key: 'taxpayerEmail' },
        { header: 'Tax Year', key: 'taxYear' },
        { header: 'Preparer', key: 'prep', format: (r) => r.assignedPreparer?.name || 'Unassigned' },
        { header: 'State', key: 'stateOfResidence' },
        { header: 'Stage', key: 'currentStage' },
      ],
      'qa_audit_returns'
    );
  };

  return (
    <UnifiedTable<PrepReviewLead>
      columns={columns}
      data={returns}
      title="QA COMPLIANCE AUDIT QUEUE"
      subtitle="4-Eyes verification of Form 1040 calculations, W-2/1099 statements, and IRS compliance sign-off."
      isLoading={isLoading}
      searchPlaceholder="Search taxpayer, email, preparer, status..."
      onExportExcel={handleExportExcel}
      onRowClick={(item) => onOpenAudit(item.id || item.applicationId)}
      emptyText="No returns awaiting Senior QA compliance review. Great job!"
    />
  );
};
