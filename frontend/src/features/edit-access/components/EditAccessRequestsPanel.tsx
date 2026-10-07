import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppEmptyState } from '@/shared/components/AppEmptyState';
import { ROLE_LABELS } from '@/features/permissions/types/permission.types';
import type { EditAccessRequestItem, EditAccessStatus } from '../types/edit-access.types';
import type { RequestFilter } from '../hooks/useEditAccessRequests';

interface EditAccessRequestsPanelProps {
  isLoading: boolean;
  filter: RequestFilter;
  onFilterChange: (filter: RequestFilter) => void;
  pendingCount: number;
  requests: EditAccessRequestItem[];
  busyId: string | null;
  onApprove: (req: EditAccessRequestItem) => void;
  onReject: (req: EditAccessRequestItem) => void;
  onRevoke: (req: EditAccessRequestItem) => void;
}

const STATUS_LABEL: Record<EditAccessStatus, string> = {
  PENDING: 'Pending',
  APPROVED: 'Active',
  REJECTED: 'Declined',
  REVOKED: 'Removed',
  EXPIRED: 'Expired',
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

export const EditAccessRequestsPanel: React.FC<EditAccessRequestsPanelProps> = ({
  isLoading,
  filter,
  onFilterChange,
  pendingCount,
  requests,
  busyId,
  onApprove,
  onReject,
  onRevoke,
}) => {
  const filterButton = (value: RequestFilter, label: string) => (
    <button
      type="button"
      onClick={() => onFilterChange(value)}
      className={`px-3 py-1.5 text-xs rounded-md cursor-pointer transition-colors ${
        filter === value ? 'bg-white text-slate-900 font-medium shadow-2xs' : 'text-slate-500 hover:text-slate-800'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl">
      <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Edit access requests</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            Staff ask here to edit a return they have already submitted. Access ends automatically at the time you set.
          </p>
        </div>
        <div className="inline-flex p-0.5 bg-slate-100 rounded-lg shrink-0">
          {filterButton('PENDING', pendingCount > 0 ? `Pending (${pendingCount})` : 'Pending')}
          {filterButton('HISTORY', 'History')}
        </div>
      </div>

      {isLoading ? (
        <div className="p-5 space-y-3 animate-pulse">
          <div className="h-14 bg-slate-100 rounded-lg" />
          <div className="h-14 bg-slate-100 rounded-lg" />
        </div>
      ) : requests.length === 0 ? (
        <AppEmptyState
          icon={Inbox}
          title={filter === 'PENDING' ? 'No pending requests' : 'No past requests'}
          description={filter === 'PENDING' ? 'New requests from staff will appear here.' : 'Approved and declined requests will appear here.'}
        />
      ) : (
        <ul className="divide-y divide-slate-100">
          {requests.map((r) => {
            const isBusy = busyId === r.id;
            return (
              <li key={r.id} className="px-5 py-4 flex flex-col lg:flex-row lg:items-start gap-3">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="text-sm font-medium text-slate-900">{r.requester.name}</span>
                    <span className="text-xs text-slate-400">{ROLE_LABELS[r.requester.role] || r.requester.role}</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    wants to edit <span className="font-medium text-slate-800">{r.taxpayerName}</span> · TY {r.taxYear}
                    {r.filingType && r.filingType !== 'INDIVIDUAL' ? ` · ${r.filingType.toLowerCase()}` : ''}
                  </p>
                  <p className="text-sm text-slate-700 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 whitespace-pre-wrap break-words">
                    {r.reason}
                  </p>
                  <p className="text-xs text-slate-400">
                    Requested {formatDate(r.createdAt)}
                    {r.status !== 'PENDING' && r.reviewedByName ? ` · ${STATUS_LABEL[r.status].toLowerCase()} by ${r.reviewedByName}` : ''}
                    {r.accessUntil && (r.status === 'APPROVED' || r.status === 'EXPIRED')
                      ? ` · ${r.status === 'APPROVED' ? 'until' : 'ended'} ${formatDate(r.accessUntil)}`
                      : ''}
                    {r.reviewNote ? ` · "${r.reviewNote}"` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 lg:pt-0.5">
                  {r.status === 'PENDING' ? (
                    <>
                      <Button variant="outline" size="sm" disabled={isBusy} onClick={() => onReject(r)} className="cursor-pointer">
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        disabled={isBusy}
                        onClick={() => onApprove(r)}
                        className="bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold cursor-pointer"
                      >
                        Approve
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="text-xs text-slate-500 px-2 py-1 rounded-md bg-slate-100">{STATUS_LABEL[r.status]}</span>
                      {r.status === 'APPROVED' && (
                        <Button variant="outline" size="sm" disabled={isBusy} onClick={() => onRevoke(r)} className="cursor-pointer">
                          Remove access
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
