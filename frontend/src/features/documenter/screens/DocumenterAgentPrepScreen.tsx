import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocumenterWorkspace } from '../hooks/useDocumenterWorkspace';
import { UnifiedTable } from '@/shared/components/table/UnifiedTable';
import { ClientNameCell, ClientEmailCell, ClientPhoneCell } from '@/shared/components/table';
import { exportTableToExcel } from '@/shared/utils/export-excel';
import { Button } from '@/shared/components/Button';
import type { ColumnDef } from '@tanstack/react-table';
import type { DocumenterLeadItem } from '../types/documenter.types';
import { ClientHistoryTag } from '@/shared/components/table';
import { Eye } from 'lucide-react';

export const DocumenterAgentPrepScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    leads,
    isLoading,
  } = useDocumenterWorkspace('PREP');

  const columns = useMemo<ColumnDef<DocumenterLeadItem, any>[]>(
    () => [
      {
        id: 'name',
        header: 'NAME',
        accessorFn: (row) => row.customer.fullName || `${row.customer.firstName || ''} ${row.customer.lastName || ''}`.trim() || '—',
        cell: ({ row }) => {
          const name = row.original.customer.fullName || `${row.original.customer.firstName || ''} ${row.original.customer.lastName || ''}`.trim() || '—';
          return (
            <div className="flex flex-col gap-0.5 min-w-0">
              <ClientNameCell name={name} />
              <ClientHistoryTag status={row.original.clientPaymentStatus} />
            </div>
          );
        },
      },
      {
        id: 'email',
        header: 'EMAIL',
        accessorFn: (row) => row.customer.email || '—',
        cell: ({ row }) => (
          <ClientEmailCell email={row.original.customer.email} />
        ),
      },
      {
        id: 'phone',
        header: 'MOBILE',
        accessorFn: (row) => row.customer.phone || '—',
        cell: ({ row }) => (
          <ClientPhoneCell phone={row.original.customer.phone} />
        ),
      },
      {
        id: 'taxYear',
        header: 'TAX YEAR',
        accessorFn: (row) => row.taxYear ? `TY${row.taxYear}` : '—',
        cell: ({ row }) => (
          <span className="text-xs font-medium text-zinc-900">
            {row.original.taxYear ? `TY${row.original.taxYear}` : '—'}
          </span>
        ),
      },
      {
        id: 'documents',
        header: 'DOCUMENTS',
        accessorFn: (row) => `${row.documents?.length || 0} Files`,
        cell: ({ row }) => (
          <span className="text-xs text-zinc-700">
            {row.original.documents?.length || 0} Files
          </span>
        ),
      },
      {
        id: 'stage',
        header: 'STAGE',
        accessorKey: 'currentStage',
        cell: ({ row }) => (
          <span className="text-xs text-zinc-700">
            {row.original.currentStage.replace(/_/g, ' ')}
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
              variant="outline"
              onClick={() => navigate(`/documenter/agent/documents/${row.original.id}`)}
              className="h-7 px-2.5 text-[11px] font-normal border-zinc-200 text-zinc-700 hover:bg-zinc-50 cursor-pointer"
            >
              <Eye className="w-3 h-3 text-zinc-500 mr-1" />
              <span>Tax Info & Files</span>
            </Button>
          </div>
        ),
      },
    ],
    [navigate]
  );

  const handleExport = () => {
    exportTableToExcel(
      leads,
      [
        { header: 'Taxpayer', key: 'fullName', format: (r) => r.customer?.fullName || `${r.customer?.firstName || ''} ${r.customer?.lastName || ''}` },
        { header: 'Email', key: 'email', format: (r) => r.customer?.email || '—' },
        { header: 'Phone', key: 'phone', format: (r) => r.customer?.phone || '—' },
        { header: 'Tax Year', key: 'taxYear', format: (r) => r.taxYear ? `TY${r.taxYear}` : '—' },
        { header: 'Documents Count', key: 'docs', format: (r) => r.documents?.length || 0 },
        { header: 'Stage', key: 'stage', format: (r) => r.currentStage },
      ],
      'document_gathering_queue'
    );
  };

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      <UnifiedTable<DocumenterLeadItem>
        title="DOCUMENT GATHERING & INTAKE VAULT"
        subtitle="Manage leads in active document gathering, client intake, and tax organizer completion."
        data={leads}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Search taxpayers by name, email, phone..."
        onExportExcel={handleExport}
        onRowClick={(item) => navigate(`/documenter/agent/documents/${item.id}`)}
        emptyText="No leads currently in document preparation."
      />
    </div>
  );
};
