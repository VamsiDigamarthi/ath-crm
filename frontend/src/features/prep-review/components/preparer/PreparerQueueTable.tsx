import React, { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Calculator, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { UnifiedTable } from '@/shared/components/table/UnifiedTable';
import { TaxpayerCell } from '@/shared/components/table/TaxpayerCell';
import { PrepStageBadge } from '../common/PrepStageBadge';
import { exportTableToExcel } from '@/shared/utils/export-excel';
import type { PrepReviewLead } from '../../types/prep-review.types';

interface PreparerQueueTableProps {
  returns: PrepReviewLead[];
  isLoading: boolean;
  onOpenWorkspace: (id: string) => void;
}

export const PreparerQueueTable: React.FC<PreparerQueueTableProps> = ({
  returns,
  isLoading,
  onOpenWorkspace,
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
        id: 'filingStatus',
        header: 'FILING STATUS',
        accessorKey: 'maritalStatus',
        cell: ({ row }) => (
          <span className="text-xs font-normal text-slate-700">
            {row.original.maritalStatus || 'Single'}
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
        id: 'reviewer',
        header: 'QA REVIEWER',
        accessorFn: (row) => row.assignedReviewer?.name || 'Unassigned',
        cell: ({ row }) => {
          const rev = row.original.assignedReviewer;
          return (
            <span className="text-xs font-normal text-slate-700">
              {rev?.name || 'Unassigned'}
            </span>
          );
        },
      },
      {
        id: 'stage',
        header: 'STAGE',
        accessorKey: 'currentStage',
        meta: {
          filterType: 'enum',
          filterOptions: [
            { label: 'In Tax Prep', value: 'DOC_PREP' },
            { label: 'QA Review', value: 'QA_REVIEW' },
            { label: 'Correction Needed', value: 'CORRECTION_NEEDED' },
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
              onClick={() => onOpenWorkspace(row.original.id || row.original.applicationId)}
              className="h-7 px-2.5 text-[11px] font-medium bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <Calculator className="w-3 h-3" />
              <span>Draft 1040</span>
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        ),
      },
    ],
    [onOpenWorkspace]
  );

  const handleExportExcel = () => {
    exportTableToExcel(
      returns,
      [
        { header: 'Taxpayer Name', key: 'taxpayerName' },
        { header: 'Email', key: 'taxpayerEmail' },
        { header: 'Tax Year', key: 'taxYear' },
        { header: 'Filing Status', key: 'maritalStatus' },
        { header: 'State', key: 'stateOfResidence' },
        { header: 'QA Reviewer', key: 'rev', format: (r) => r.assignedReviewer?.name || 'Unassigned' },
        { header: 'Stage', key: 'currentStage' },
      ],
      'preparer_assigned_returns'
    );
  };

  return (
    <UnifiedTable<PrepReviewLead>
      columns={columns}
      data={returns}
      title="TAX PREPARATION WORKBENCH"
      subtitle="Draft IRS Form 1040, state returns, itemized deductions, and submit for 4-Eyes QA certification."
      isLoading={isLoading}
      searchPlaceholder="Search taxpayer, email, state, status..."
      onExportExcel={handleExportExcel}
      onRowClick={(item) => onOpenWorkspace(item.id || item.applicationId)}
      emptyText="No assigned returns in this queue. Great job!"
    />
  );
};
