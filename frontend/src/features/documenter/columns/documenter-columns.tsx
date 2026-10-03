import { Link } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/shared/components/Button';
import { TaxpayerCell } from '@/shared/components/table/TaxpayerCell';
import { PriorityBadge } from '@/shared/components/PriorityBadge';
import {
  PhoneCall,
  UserCheck,
  Eye,
  FilePlus2,
} from 'lucide-react';
import type { DocumenterLeadItem } from '../types/documenter.types';
import { SYSTEM_PRIORITIES, SYSTEM_STAGES } from '@/shared/constants/system-enums';

export interface GetDocumenterColumnsProps {
  onOpenCallModal: (lead: DocumenterLeadItem) => void;
  onOpenAssignModal: (lead: DocumenterLeadItem) => void;
  onOpenStartFilingModal?: (lead: DocumenterLeadItem) => void;
  hideAssignedStaff?: boolean;
  isManagerView?: boolean;
  isAdmin?: boolean;
}

export const isRawLead = (item: DocumenterLeadItem): boolean => {
  if (item.isRawProspect === true) return true;
  if ((item as any).isReturnConfigured === false) return true;
  if ((item.taxDraftSummary as any)?.isReturnConfigured === false) return true;
  if ((item.taxDraftSummary as any)?.isRawIngested === true) return true;
  if (item.id?.startsWith('raw-')) return true;
  if (!item.taxYear || item.totalTaxYears === 0) return true;
  return false;
};

export const isLeadInterested = (item: DocumenterLeadItem): boolean => {
  const log = item.lastCallLog || (item as any).callLogs?.[0];
  return log?.disposition === 'CONNECTED_INTERESTED';
};

export const canConfigureReturn = (item: DocumenterLeadItem): boolean => {
  return isRawLead(item) && isLeadInterested(item);
};

export const canViewLead = (item: DocumenterLeadItem): boolean => {
  if (isRawLead(item)) return false;
  const advancedStages = [
    'DOC_PREP',
    'CORRECTION_NEEDED',
    'SALES_PITCH_QUEUE',
    'SALES_PITCHING',
    'FILING_QUEUE',
    'FILING_IN_PROGRESS',
    'FILING_SUCCESS',
  ];
  if (advancedStages.includes(item.currentStage) || item.clientPaymentStatus === 'PAID') {
    return true;
  }
  return isLeadInterested(item);
};

export const renderVisaBadge = (visa?: string | null) => {
  if (!visa) return null;
  return (
    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
      {visa}
    </span>
  );
};

export const renderStageBadge = (stage: string) => {
  switch (stage) {
    case 'RAW_PROSPECT':
      return <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">Raw Prospect</span>;
    case 'DOC_OUTREACH':
      return <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">Outreach Active</span>;
    case 'DOC_PREP':
      return <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">Doc Prep</span>;
    case 'CORRECTION_NEEDED':
      return <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">Needs Review</span>;
    case 'SALES_PITCH_QUEUE':
    case 'SALES_PITCHING':
      return <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">Sales Pitch</span>;
    case 'FILING_QUEUE':
    case 'FILING_IN_PROGRESS':
    case 'FILING_SUCCESS':
      return <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">IRS Filing</span>;
    case 'DROPPED_CANCELLED':
      return <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">Not Interested</span>;
    default:
      return <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">{stage.replace(/_/g, ' ')}</span>;
  }
};

export const getDocumenterColumns = ({
  onOpenCallModal,
  onOpenAssignModal,
  onOpenStartFilingModal,
  hideAssignedStaff = false,
  isManagerView = false,
  isAdmin: isAdminProp = false,
}: GetDocumenterColumnsProps): ColumnDef<DocumenterLeadItem, any>[] => {
  const isAdmin = isManagerView || isAdminProp;

  const cols: ColumnDef<DocumenterLeadItem, any>[] = [
    {
      id: 'taxpayer',
      header: 'Taxpayer',
      accessorFn: (row) => `${row.customer.fullName || `${row.customer.firstName} ${row.customer.lastName}`} ${row.customer.email}`,
      cell: ({ row }) => {
        const c = row.original.customer;
        const name = c.fullName || `${c.firstName} ${c.lastName || ''}`.trim();
        return <TaxpayerCell name={name} email={c.email || undefined} />;
      },
    },
    {
      id: 'phone',
      header: 'Phone',
      accessorKey: 'customer.phone',
      cell: ({ row }) => (
        <span className="text-xs font-normal text-slate-700">
          {row.original.customer.phone || '—'}
        </span>
      ),
    },
    {
      id: 'priority',
      header: 'Priority',
      accessorKey: 'priority',
      meta: {
        filterType: 'enum',
        filterOptions: SYSTEM_PRIORITIES,
      },
      cell: ({ row }) => (
        <PriorityBadge priority={row.original.priority || 'NO_PRIORITY'} size="sm" />
      ),
    },
    {
      id: 'stage',
      header: 'Stage',
      accessorKey: 'currentStage',
      meta: {
        filterType: 'enum',
        filterOptions: SYSTEM_STAGES,
      },
      cell: ({ row }) => renderStageBadge(row.original.currentStage),
    },
    {
      id: 'lastCall',
      header: 'Last call',
      accessorFn: (row) => row.lastCallLog?.disposition || 'NO_CALLS',
      cell: ({ row }) => {
        const log = row.original.lastCallLog || (row.original as any).callLogs?.[0];
        if (!log) {
          return <span className="text-xs text-slate-400 font-normal">No calls</span>;
        }
        return (
          <span className="text-xs font-normal text-slate-700">
            {log.disposition.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (ch: string) => ch.toUpperCase())}
          </span>
        );
      },
    },
  ];

  if (!hideAssignedStaff) {
    cols.push({
      id: 'assignedAgent',
      header: 'Assigned to',
      accessorFn: (row) => row.assignedDocAgent?.email || 'Unassigned',
      cell: ({ row }) => {
        const agent = row.original.assignedDocAgent;
        if (!agent) {
          return (
            <span className="text-xs text-slate-400">Unassigned</span>
          );
        }
        return (
          <span className="text-xs font-normal text-slate-800">
            {(agent as any).name || agent.email.split('@')[0]}
          </span>
        );
      },
    });
  }

  cols.push({
    id: 'actions',
    header: '',
    enableSorting: false,
    enableHiding: false,
    meta: {
      disableMenu: true,
      disableFilter: true,
    },
    cell: ({ row }) => {
      const item = row.original;
      const canView = canViewLead(item);
      const canConfig = canConfigureReturn(item);

      return (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          {canConfig && onOpenStartFilingModal && (
            <Button
              size="sm"
              onClick={() => onOpenStartFilingModal(item)}
              className="h-7 px-2 text-[11px] font-medium border border-emerald-200 bg-white text-[#15803D] hover:bg-emerald-50 flex items-center gap-1 cursor-pointer"
              title="Configure Tax Year & Filing Type"
            >
              <FilePlus2 className="w-3 h-3" />
              <span>Configure</span>
            </Button>
          )}

          {canView && (
            <Link
              to={`/documenter/agent/lead/${item.id}?from=queue`}
              state={{ from: 'agent_queue' }}
              className="h-7 px-2 text-[11px] font-normal border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1 shadow-2xs rounded-lg cursor-pointer"
              title="View Lead Details"
            >
              <Eye className="w-3 h-3" />
              <span>View</span>
            </Link>
          )}

          <Button
            size="sm"
            onClick={() => onOpenCallModal(item)}
            className="h-7 px-2.5 text-[11px] font-medium bg-[#16A34A] hover:bg-[#15803D] text-white flex items-center gap-1 shadow-2xs cursor-pointer"
            title="Call Prospect"
          >
            <PhoneCall className="w-3 h-3" />
            <span>Call</span>
          </Button>

          {isAdmin && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onOpenAssignModal(item)}
              className="h-7 px-2 text-[11px] font-normal border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
              title="Assign Lead"
            >
              <UserCheck className="w-3 h-3 text-slate-500" />
              <span>Assign</span>
            </Button>
          )}
        </div>
      );
    },
  });

  return cols;
};
