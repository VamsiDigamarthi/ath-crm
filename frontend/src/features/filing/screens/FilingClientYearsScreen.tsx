import React, { useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowLeft, Eye } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppCopyButton } from '@/shared/components/AppCopyButton';
import { UnifiedTable } from '@/shared/components/table/UnifiedTable';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { useFilingClientYears, type FilingYearRow } from '../hooks/useFilingClientYears';

const stageLabel = (s: string) => s.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

/** Filing: a client's tax years; View opens that year's filing workspace */
export const FilingClientYearsScreen: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const isManager = user?.role === 'FILE_OP_MANAGER' || user?.role === 'ADMIN' || location.pathname.includes('/manager');
  const { client, years, isLoading } = useFilingClientYears(customerId);

  const backPath = isManager ? '/filing/manager/queue' : '/filing/agent/queue';
  const openYear = (row: FilingYearRow) => navigate(`/filing/workspace/${row.id}${location.search}`);

  const columns = useMemo<ColumnDef<FilingYearRow, unknown>[]>(
    () => [
      {
        id: 'taxYear',
        header: 'Tax year',
        accessorKey: 'taxYear',
        cell: ({ row }) => <span className="text-sm font-semibold text-slate-900">TY {row.original.taxYear}</span>,
      },
      {
        id: 'filingType',
        header: 'Type',
        accessorKey: 'filingType',
        cell: ({ row }) => <span className="text-sm text-slate-700">{stageLabel(row.original.filingType)}</span>,
      },
      {
        id: 'stage',
        header: 'Stage',
        accessorKey: 'currentStage',
        cell: ({ row }) => <span className="text-sm text-slate-700">{stageLabel(row.original.currentStage)}</span>,
      },
      {
        id: 'assignedTo',
        header: 'Assigned to',
        accessorKey: 'assignedTo',
        cell: ({ row }) => <span className="text-sm text-slate-700">{row.original.assignedTo}</span>,
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        enableHiding: false,
        meta: { disableMenu: true, disableFilter: true },
        cell: ({ row }) => (
          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
            <Button
              size="sm"
              onClick={() => openYear(row.original)}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              View
            </Button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [location.search]
  );

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`${backPath}`)}
          className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
          title="Back to queue"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="text-sm text-slate-500">
          <span>Filing queue</span>
          <span className="mx-1.5 text-slate-300">/</span>
          <span className="text-slate-900 font-medium">Tax years</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">{client?.taxpayerName || (isLoading ? 'Loading...' : 'Client')}</h2>
          <p className="text-sm text-slate-500 mt-1">
            {years.length} tax year{years.length === 1 ? '' : 's'} · choose a year to view its details
          </p>
        </div>
        {client && (
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            <div className="px-5 py-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-xs text-slate-500">Phone</p>
                <p className="text-sm text-slate-900">{client.taxpayerPhone || '—'}</p>
              </div>
              {client.taxpayerPhone && <AppCopyButton text={client.taxpayerPhone} size="sm" />}
            </div>
            <div className="px-5 py-3 flex items-center justify-between gap-2 min-w-0">
              <div className="min-w-0">
                <p className="text-xs text-slate-500">Email</p>
                <p className="text-sm text-slate-900 truncate">{client.taxpayerEmail || '—'}</p>
              </div>
              {client.taxpayerEmail && <AppCopyButton text={client.taxpayerEmail} size="sm" />}
            </div>
            <div className="px-5 py-3">
              <p className="text-xs text-slate-500">Location</p>
              <p className="text-sm text-slate-900">{client.stateOfResidence || '—'}</p>
            </div>
          </div>
        )}
      </div>

      <UnifiedTable<FilingYearRow>
        data={years}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Search tax years..."
        onRowClick={openYear}
        emptyText="No tax years found for this client in filing."
      />
    </div>
  );
};
