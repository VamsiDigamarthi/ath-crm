import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import toast from 'react-hot-toast';
import { ArrowLeft, Calculator } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppCopyButton } from '@/shared/components/AppCopyButton';
import { UnifiedTable } from '@/shared/components/table/UnifiedTable';
import { prepReviewService } from '../services/prep-review-service';
import type { PrepReviewLead } from '../types/prep-review.types';

const titleCase = (v?: string) => (v || '').toLowerCase().replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

const STATUS_META: Record<string, { label: string; dot: string }> = {
  DOC_PREP_COMPLETE: { label: 'Ready to prepare', dot: 'bg-slate-400' },
  PREP_ASSIGNED: { label: 'Assigned to you', dot: 'bg-slate-400' },
  PREP_IN_PROGRESS: { label: 'In tax preparation', dot: 'bg-blue-500' },
  QA_IN_REVIEW: { label: 'Sent to QA', dot: 'bg-purple-500' },
  QA_REVISION_REQUESTED: { label: 'QA revision requested', dot: 'bg-rose-500' },
  QA_APPROVED: { label: 'QA approved', dot: 'bg-[#16A34A]' },
  REVERTED_TO_DOC: { label: 'Sent back to documenter', dot: 'bg-amber-500' },
};

const usePreparerClientYears = (taxpayerId?: string) => {
  const [years, setYears] = useState<PrepReviewLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!taxpayerId) return;
    try {
      const res = await prepReviewService.getPipelineLeads({ limit: 100 });
      const leads = res.leads || [];
      const baseLead = leads.find(
        (l: PrepReviewLead) =>
          l.taxpayerId === taxpayerId || l.id === taxpayerId || l.applicationId === taxpayerId
      );

      if (baseLead?.allApplications && baseLead.allApplications.length > 0) {
        const fullList: PrepReviewLead[] = baseLead.allApplications.map((appItem: any) => {
          const existing = leads.find((l: PrepReviewLead) => l.id === appItem.id);
          return (
            existing || {
              ...baseLead,
              id: appItem.id,
              applicationId: appItem.id,
              taxYear: appItem.taxYear,
              filingType: appItem.filingType || 'INDIVIDUAL',
              currentStage: appItem.currentStage,
              assignedPreparer: appItem.assignedPrepAgent
                ? {
                    id: appItem.assignedPrepAgent.id,
                    name: `${appItem.assignedPrepAgent.firstName || ''} ${appItem.assignedPrepAgent.lastName || ''}`.trim() || appItem.assignedPrepAgent.email,
                    email: appItem.assignedPrepAgent.email,
                  }
                : baseLead.assignedPreparer,
              assignedReviewer: appItem.assignedReviewAgent
                ? {
                    id: appItem.assignedReviewAgent.id,
                    name: `${appItem.assignedReviewAgent.firstName || ''} ${appItem.assignedReviewAgent.lastName || ''}`.trim() || appItem.assignedReviewAgent.email,
                    email: appItem.assignedReviewAgent.email,
                  }
                : baseLead.assignedReviewer,
            }
          );
        });
        setYears(fullList.sort((a, b) => b.taxYear - a.taxYear));
      } else {
        const matched = leads.filter(
          (l: PrepReviewLead) =>
            l.taxpayerId === taxpayerId || l.id === taxpayerId || l.applicationId === taxpayerId
        );
        setYears(matched.sort((a, b) => b.taxYear - a.taxYear));
      }
    } catch (err) {
      toast.error((err as Error).message || 'Failed to load tax years');
    } finally {
      setIsLoading(false);
    }
  }, [taxpayerId]);

  useEffect(() => {
    load();
  }, [load]);

  return { years, client: years[0] || null, isLoading };
};

export const PreparerClientYearsScreen: React.FC = () => {
  const { taxpayerId } = useParams<{ taxpayerId: string }>();
  const navigate = useNavigate();
  const { years, client, isLoading } = usePreparerClientYears(taxpayerId);

  const openYear = useCallback(
    (lead: PrepReviewLead) => navigate(`/prep-review/preparer/workspace/${lead.id || lead.applicationId}`),
    [navigate]
  );

  const columns = useMemo<ColumnDef<PrepReviewLead, unknown>[]>(
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
        cell: ({ row }) => (
          <span className="text-sm font-medium text-slate-700">
            {row.original.filingType === 'BUSINESS' ? 'Business' : 'Individual'}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        accessorFn: (r) => STATUS_META[r.prepStage || '']?.label || titleCase(r.currentStage),
        cell: ({ row }) => {
          const meta = STATUS_META[row.original.prepStage || ''] || { label: titleCase(row.original.currentStage), dot: 'bg-slate-400' };
          return (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 whitespace-nowrap">
              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
              {meta.label}
            </span>
          );
        },
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
          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
            <Button
              size="sm"
              onClick={() => openYear(row.original)}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Calculator className="w-3.5 h-3.5" />
              {row.original.filingType === 'BUSINESS' ? 'Draft 1120' : 'Draft 1040'}
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
          onClick={() => navigate('/prep-review/preparer')}
          className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
          title="Back to queue"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-1.5 text-sm text-slate-500">
          <span>Preparer Queue</span>
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
            {years.length} tax {years.length === 1 ? 'filing' : 'filings'} available · choose a return to open
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
        onRowClick={(item) => openYear(item)}
        emptyText="No tax years assigned to you for this taxpayer."
      />
    </div>
  );
};
