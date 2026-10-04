import React, { useCallback, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowLeft, Eye } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppCopyButton } from '@/shared/components/AppCopyButton';
import { UnifiedTable } from '@/shared/components/table/UnifiedTable';
import { useTaxpayerYears } from '../hooks/useTaxpayerYears';
import type { DocumenterTaxYearSummary } from '../types/documenter.types';

const money = (v?: number) => `$${(v || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
const titleCase = (v?: string) => (v || '').toLowerCase().replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

export const DocumenterTaxpayerYearsScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { lead, years, isLoading } = useTaxpayerYears(id);
  const customer = lead?.customer;
  const name = customer ? customer.fullName || `${customer.firstName} ${customer.lastName}` : '';

  const fromQuery = new URLSearchParams(location.search).get('from') || (location.state as any)?.from;
  let parentTitle = 'My Documents';
  let parentUrl = '/documenter/agent/documents';
  if (fromQuery === 'queue' || fromQuery === 'agent_queue') {
    parentTitle = 'Calling Workspace';
    parentUrl = '/documenter/agent/queue';
  } else if (fromQuery === 'callbacks' || fromQuery === 'agent_callbacks') {
    parentTitle = 'Scheduled Callbacks';
    parentUrl = '/documenter/agent/callbacks';
  } else if (fromQuery === 'fallback' || fromQuery === 'agent_fallback') {
    parentTitle = 'Follow-up Leads';
    parentUrl = '/documenter/agent/fallback';
  } else if (fromQuery === 'caseload' || fromQuery === 'manager') {
    parentTitle = 'Department Queue';
    parentUrl = '/documenter/manager/queue';
  }

  const openYear = useCallback(
    (appId: string) =>
      navigate(`/documenter/agent/lead/${appId}?from=${fromQuery || 'documents'}`, {
        state: { from: fromQuery || 'documents' },
      }),
    [navigate, fromQuery]
  );

  const columns = useMemo<ColumnDef<DocumenterTaxYearSummary, unknown>[]>(
    () => [
      {
        id: 'taxYear',
        header: 'Tax year',
        accessorKey: 'taxYear',
        cell: ({ row }) => <span className="text-sm font-semibold text-slate-900">TY {row.original.taxYear}</span>,
      },
      {
        id: 'type',
        header: 'Type',
        accessorKey: 'filingType',
        cell: ({ row }) => <span className="text-sm text-slate-600">{titleCase(row.original.filingType || 'INDIVIDUAL')}</span>,
      },
      {
        id: 'stage',
        header: 'Stage',
        accessorKey: 'currentStage',
        cell: ({ row }) => <span className="text-sm text-slate-600">{titleCase(row.original.currentStage)}</span>,
      },
      {
        id: 'refund',
        header: 'Estimated refund',
        accessorKey: 'estimatedRefund',
        cell: ({ row }) => <span className="text-sm text-[#15803D]">{money(row.original.estimatedRefund)}</span>,
      },
      {
        id: 'due',
        header: 'Due amount',
        accessorKey: 'dueAmount',
        cell: ({ row }) => <span className="text-sm text-slate-900">{money(row.original.dueAmount)}</span>,
      },
      {
        id: 'documents',
        header: 'Documents',
        accessorKey: 'documentsCount',
        cell: ({ row }) => (
          <span className="text-sm text-slate-600">
            {row.original.documentsCount ?? 0} {row.original.documentsCount === 1 ? 'file' : 'files'}
          </span>
        ),
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
              onClick={() => openYear(row.original.id)}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              View
            </Button>
          </div>
        ),
      },
    ],
    [openYear]
  );

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(parentUrl)}
          className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
          title={`Back to ${parentTitle}`}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-1.5 text-sm text-slate-500">
          <span>{parentTitle}</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-medium">Tax years</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-5">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{isLoading ? 'Loading…' : name || 'Taxpayer'}</h2>
          <p className="text-sm text-slate-500 mt-1">
            {years.length} tax {years.length === 1 ? 'year' : 'years'} · choose a year to view its details
          </p>
        </div>
        {customer && (
          <div className="grid grid-cols-1 sm:grid-cols-3 border-t border-slate-100 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {[
              { label: 'Phone', value: customer.phone, copy: customer.phone },
              { label: 'Email', value: customer.email || '—', copy: customer.email },
              {
                label: 'Location',
                value: [customer.city, customer.state, customer.zipCode].filter(Boolean).join(', ') || '—',
                copy: null,
              },
            ].map((item) => (
              <div key={item.label} className="px-5 py-3 flex items-center justify-between gap-2 min-w-0">
                <div className="min-w-0">
                  <div className="text-xs text-slate-500">{item.label}</div>
                  <div className="text-sm font-medium text-slate-900 truncate">{item.value}</div>
                </div>
                {item.copy && <AppCopyButton text={item.copy} size="sm" />}
              </div>
            ))}
          </div>
        )}
      </div>

      <UnifiedTable<DocumenterTaxYearSummary>
        columns={columns}
        data={years}
        isLoading={isLoading}
        searchPlaceholder="Search tax years..."
        onRowClick={(item) => openYear(item.id)}
        emptyText="No tax years recorded for this taxpayer."
      />
    </div>
  );
};
