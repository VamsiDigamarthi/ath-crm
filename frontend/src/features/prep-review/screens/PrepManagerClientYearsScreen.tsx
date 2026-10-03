import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowLeft, Eye, UserCheck } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppCopyButton } from '@/shared/components/AppCopyButton';
import { UnifiedTable } from '@/shared/components/table/UnifiedTable';
import { usePrepClientYears } from '../hooks/usePrepClientYears';
import { PrepAssignLeadDrawer } from '../components/manager/PrepAssignLeadDrawer';
import { PrepLeadDetailModal } from '../components/manager/PrepLeadDetailModal';
import type { PrepReviewLead } from '../types/prep-review.types';

const titleCase = (v?: string) => (v || '').toLowerCase().replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

export const PrepManagerClientYearsScreen: React.FC = () => {
  const { taxpayerId } = useParams<{ taxpayerId: string }>();
  const navigate = useNavigate();
  const { years, client, staff, isLoading, assignLeads, setAssignLeads, inspectLead, setInspectLead, refresh } =
    usePrepClientYears(taxpayerId);

  const columns = useMemo<ColumnDef<PrepReviewLead, unknown>[]>(
    () => [
      {
        id: 'taxYear',
        header: 'Tax year',
        accessorKey: 'taxYear',
        cell: ({ row }) => <span className="text-sm font-semibold text-slate-900">TY {row.original.taxYear}</span>,
      },
      {
        id: 'stage',
        header: 'Stage',
        accessorKey: 'currentStage',
        cell: ({ row }) => <span className="text-sm text-slate-600">{titleCase(row.original.currentStage)}</span>,
      },
      {
        id: 'preparer',
        header: 'Preparer',
        accessorFn: (r) => r.assignedPreparer?.name || 'Unassigned',
        cell: ({ row }) => (
          <span className={`text-sm ${row.original.assignedPreparer ? 'text-slate-800' : 'text-slate-400'}`}>
            {row.original.assignedPreparer?.name || 'Unassigned'}
          </span>
        ),
      },
      {
        id: 'reviewer',
        header: 'QA reviewer',
        accessorFn: (r) => r.assignedReviewer?.name || 'Unassigned',
        cell: ({ row }) => (
          <span className={`text-sm ${row.original.assignedReviewer ? 'text-slate-800' : 'text-slate-400'}`}>
            {row.original.assignedReviewer?.name || 'Unassigned'}
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
          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAssignLeads([row.original])}
              className="text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              {row.original.assignedPreparer ? 'Reassign' : 'Assign'}
            </Button>
            <Button
              size="sm"
              onClick={() => setInspectLead(row.original)}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              Inspect
            </Button>
          </div>
        ),
      },
    ],
    [setAssignLeads, setInspectLead]
  );

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/prep-review/manager/queue')}
          className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
          title="Back to queue"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-1.5 text-sm text-slate-500">
          <span>Department Queue</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-medium">Tax years</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-5">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {isLoading ? 'Loading…' : client?.taxpayerName || 'Taxpayer'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {years.length} tax {years.length === 1 ? 'year' : 'years'} in preparation · assign staff or inspect a year
          </p>
        </div>
        {client && (
          <div className="grid grid-cols-1 sm:grid-cols-3 border-t border-slate-100 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {[
              { label: 'Phone', value: client.taxpayerPhone || '—', copy: client.taxpayerPhone },
              { label: 'Email', value: client.taxpayerEmail || '—', copy: client.taxpayerEmail },
              { label: 'Location', value: client.stateOfResidence || '—', copy: null },
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

      <UnifiedTable<PrepReviewLead>
        columns={columns}
        data={years}
        isLoading={isLoading}
        searchPlaceholder="Search tax years..."
        emptyText="No tax years in preparation for this taxpayer."
      />

      {assignLeads && (
        <PrepAssignLeadDrawer
          isOpen={Boolean(assignLeads)}
          onClose={() => setAssignLeads(null)}
          targetLeads={assignLeads}
          staff={staff}
          onAssignSuccess={() => {
            refresh();
          }}
        />
      )}

      {inspectLead && (
        <PrepLeadDetailModal
          isOpen={Boolean(inspectLead)}
          lead={inspectLead}
          onClose={() => setInspectLead(null)}
          onAssign={(lead) => {
            setInspectLead(null);
            setAssignLeads([lead]);
          }}
        />
      )}
    </div>
  );
};
