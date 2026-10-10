import React, { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Calculator, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { UnifiedTable } from '@/shared/components/table/UnifiedTable';
import { ClientNameCell, ClientEmailCell, ClientPhoneCell, makeRevertedColumn } from '@/shared/components/table';
import { PrepStageBadge } from '../common/PrepStageBadge';
import { exportTableToExcel } from '@/shared/utils/export-excel';
import type { PrepReviewLead } from '../../types/prep-review.types';

interface PreparerQueueTableProps {
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  returns: PrepReviewLead[];
  isLoading: boolean;
  onOpenWorkspace: (lead: PrepReviewLead) => void;
  /** Toolbar buttons (Filters, Hide stats) */
  extraHeaderActions?: React.ReactNode;
}

export const PreparerQueueTable: React.FC<PreparerQueueTableProps> = ({
  searchQuery,
  onSearchChange,
  returns,
  isLoading,
  onOpenWorkspace,
  extraHeaderActions,
}) => {
  const columns = useMemo<ColumnDef<PrepReviewLead, any>[]>(
    () => [
      {
        id: 'name',
        header: 'Name',
        accessorFn: (row) => row.taxpayerName || '—',
        cell: ({ row }) => (
          <ClientNameCell name={row.original.taxpayerName} status={row.original.clientPaymentStatus} />
        ),
      },
      {
        id: 'email',
        header: 'Email',
        accessorFn: (row) => row.taxpayerEmail || '—',
        cell: ({ row }) => (
          <ClientEmailCell email={row.original.taxpayerEmail} />
        ),
      },
      {
        id: 'phone',
        header: 'Mobile',
        accessorFn: (row) => row.taxpayerPhone || '—',
        cell: ({ row }) => (
          <ClientPhoneCell phone={row.original.taxpayerPhone} />
        ),
      },
      {
        id: 'taxYear',
        header: 'Tax year',
        accessorFn: (row) => `TY ${row.taxYear || 2025}`,
        cell: ({ row }) => (
          <span className="text-xs font-medium text-slate-700">
            {row.original.taxYear || 2025}
          </span>
        ),
      },
      {
        id: 'filingStatus',
        header: 'Filing status',
        accessorKey: 'maritalStatus',
        cell: ({ row }) => (
          <span className="text-xs font-normal text-slate-700">
            {row.original.maritalStatus || 'Single'}
          </span>
        ),
      },
      {
        id: 'state',
        header: 'State',
        accessorKey: 'stateOfResidence',
        cell: ({ row }) => (
          <span className="text-xs font-normal text-slate-700">
            {row.original.stateOfResidence || '—'}
          </span>
        ),
      },
      {
        id: 'docs',
        header: 'Docs',
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
        header: 'QA reviewer',
        accessorFn: (row) => row.assignedReviewer?.name || 'Unassigned',
        cell: ({ row }) => {
          const rev = row.original.assignedReviewer;
          const isSelf = Boolean(rev?.id && rev.id === row.original.assignedPreparer?.id);
          return (
            <span className="text-xs font-normal text-slate-700 whitespace-nowrap">
              {isSelf ? 'You' : rev?.name || 'Unassigned'}
              {isSelf && <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-[#15803D]">Self-review</span>}
            </span>
          );
        },
      },
      {
        id: 'stage',
        header: 'Stage',
        accessorKey: 'currentStage',
        meta: {
          filterType: 'enum',
          filterOptions: [
            { label: 'In Tax Prep', value: 'DOC_PREP' },
            { label: 'QA Review', value: 'QA_REVIEW' },
            { label: 'Correction Needed', value: 'CORRECTION_NEEDED' },
          ],
        },
        cell: ({ row }) => (
          <PrepStageBadge
            stage={row.original.currentStage}
            draftStatus={(row.original.taxDraftSummary as any)?.status}
            assignedPreparerName={row.original.assignedPreparer?.name}
          />
        ),
      },
      makeRevertedColumn<PrepReviewLead>((r) => (r as any).taxDraftSummary),
      {
        id: 'actions',
        header: '',
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
              className="h-7 px-2.5 text-[11px] font-medium bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <Calculator className="w-3 h-3" />
              <span>{row.original.filingType === 'BUSINESS' ? 'Draft 1120' : 'Draft 1040'}</span>
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
        { header: 'Mobile', key: 'taxpayerPhone' },
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
      isLoading={isLoading}
      searchPlaceholder="Search name, phone, email..."
      searchValue={searchQuery}
      onSearchChange={onSearchChange}
      onExportExcel={handleExportExcel}
      onRowClick={(item) => onOpenWorkspace(item)}
      emptyText="No assigned returns in this queue. Great job!"
      extraHeaderActions={extraHeaderActions}
    />
  );
};
