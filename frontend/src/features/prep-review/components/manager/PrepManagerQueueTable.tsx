import React, { useState, useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { UserCheck, Sparkles, Calculator } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppTabs } from '@/shared/components/AppTabs';
import { UnifiedTable } from '@/shared/components/table/UnifiedTable';
import { ClientNameCell, ClientEmailCell, ClientPhoneCell, makeRevertedColumn } from '@/shared/components/table';
import { PrepStageBadge } from '../common/PrepStageBadge';
import { exportTableToExcel } from '@/shared/utils/export-excel';
import type { PrepReviewLead } from '../../types/prep-review.types';

export interface PrepManagerQueueTableProps {
  leads: PrepReviewLead[];
  tabStats?: any;
  selectedStageFilter?: string;
  onStageFilterChange?: (stage: string) => void;
  onOpenAutoDistribute?: () => void;
  isAdmin?: boolean;
  isLoading?: boolean;
  onOpenAssignModal: (leadsToAssign: PrepReviewLead[]) => void;
  onViewLeadDetail: (lead: PrepReviewLead) => void;
}

export const PrepManagerQueueTable: React.FC<PrepManagerQueueTableProps> = ({
  leads,
  tabStats,
  selectedStageFilter,
  onStageFilterChange,
  onOpenAutoDistribute,
  isLoading = false,
  onOpenAssignModal,
  onViewLeadDetail,
}) => {
  const [selectedRows, setSelectedRows] = useState<PrepReviewLead[]>([]);
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
        id: 'preparer',
        header: 'Preparer',
        accessorFn: (row) => row.assignedPreparer?.name || 'Unassigned',
        cell: ({ row }) => {
          const prep = row.original.assignedPreparer;
          if (!prep) {
            return (
              <span className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                Unassigned
              </span>
            );
          }
          return (
            <span className="text-xs font-normal text-slate-800">
              {prep.name}
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
          if (!rev) {
            return (
              <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Unassigned
              </span>
            );
          }
          return (
            <span className="text-xs font-normal text-slate-800">
              {rev.name}
            </span>
          );
        },
      },
      {
        id: 'docs',
        header: 'Docs',
        accessorFn: (row) => `${row.verifiedDocumentsCount || 0}/${row.documentsCount || 0}`,
        cell: ({ row }) => (
          <span className="text-xs font-normal text-slate-700">
            {row.original.verifiedDocumentsCount || 0}/{row.original.documentsCount || 0}
          </span>
        ),
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
            { label: 'Sales Pitching', value: 'SALES_PITCHING' },
          ],
        },
        cell: ({ row }) => <PrepStageBadge stage={row.original.currentStage} />,
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
        cell: ({ row }) => {
          const lead = row.original;
          return (
            <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
              <Button
                size="sm"
                onClick={() => onViewLeadDetail(lead)}
                className="h-7 px-2.5 text-[11px] font-semibold bg-[#16A34A] hover:bg-[#15803D] text-white flex items-center gap-1 cursor-pointer shadow-2xs"
                title="Open Form 1040 Drafting Workspace"
              >
                <Calculator className="w-3 h-3" />
                <span>{lead.filingType === 'BUSINESS' ? 'Draft 1120' : 'Draft 1040'}</span>
              </Button>
            </div>
          );
        },
      },
    ],
    [onOpenAssignModal, onViewLeadDetail]
  );

  const handleExportExcel = () => {
    exportTableToExcel(
      leads,
      [
        { header: 'Taxpayer Name', key: 'taxpayerName' },
        { header: 'Email', key: 'taxpayerEmail' },
        { header: 'Mobile', key: 'taxpayerPhone' },
        { header: 'Tax Year', key: 'taxYear' },
        { header: 'State', key: 'stateOfResidence' },
        { header: 'Preparer', key: 'prep', format: (r) => r.assignedPreparer?.name || 'Unassigned' },
        { header: 'Reviewer', key: 'rev', format: (r) => r.assignedReviewer?.name || 'Unassigned' },
        { header: 'Stage', key: 'currentStage' },
      ],
      'prep_manager_queue'
    );
  };

  const tabs = useMemo(() => {
    if (!tabStats) return [];
    return [
      { id: 'ALL', label: 'All Pipeline', count: tabStats.all || leads.length },
      { id: 'UNASSIGNED', label: 'Unassigned', count: tabStats.unassigned || 0 },
      { id: 'UNDER_PREP', label: 'Under Prep', count: tabStats.underPrep || 0 },
      { id: 'QA_REVIEW', label: 'QA Review', count: tabStats.qaReview || 0 },
      { id: 'REVISIONS', label: 'Revisions', count: tabStats.revisions || 0 },
      { id: 'QA_APPROVED', label: 'Ready for Sales', count: tabStats.qaApproved || 0 },
    ];
  }, [tabStats, leads.length]);

  return (
    <div className="space-y-3">
      {onStageFilterChange && tabs.length > 0 && (
        <AppTabs
          tabs={tabs}
          activeTab={selectedStageFilter || 'ALL'}
          onChange={(tab) => onStageFilterChange(tab)}
          size="sm"
        />
      )}

      <UnifiedTable<PrepReviewLead>
        columns={columns}
        data={leads}
        isLoading={isLoading}
        enableSelection={true}
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        searchPlaceholder="Search taxpayer, preparer, reviewer, stage..."
        onExportExcel={handleExportExcel}
        onRowClick={(item) => onViewLeadDetail(item)}
        extraHeaderActions={
          <div className="flex items-center gap-2">
            {selectedRows.length > 0 && (
              <Button
                size="sm"
                onClick={() => onOpenAssignModal(selectedRows)}
                className="h-8 px-3 text-xs font-semibold bg-[#16A34A] hover:bg-[#15803D] text-white flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Assign Selected ({selectedRows.length})</span>
              </Button>
            )}
            {onOpenAutoDistribute && (
              <Button
                size="sm"
                variant="outline"
                onClick={onOpenAutoDistribute}
                className="h-8 px-3 text-xs font-medium border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Auto Distribute</span>
              </Button>
            )}
          </div>
        }
        emptyText="No returns in this supervisor queue."
      />
    </div>
  );
};
