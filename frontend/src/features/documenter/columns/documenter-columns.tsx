import { Link } from 'react-router-dom';
import type { ColumnDef } from '@/shared/components/AppTable';
import { AppCopyButton } from '@/shared/components/AppCopyButton';
import { Button } from '@/shared/components/Button';
import { 
  PhoneCall, 
  UserCheck, 
  UserX, 
  Globe, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Sparkles
} from 'lucide-react';
import { PriorityBadge } from '@/shared/components/PriorityBadge';
import { ClientPaymentStatusChip } from '@/shared/components/ClientPaymentStatusChip';
import type { DocumenterLeadItem } from '../types/documenter.types';

export const renderDualRoleBadge = (item: DocumenterLeadItem) => {
  const isDual = item.isDualDocSalesRole || (item.taxDraftSummary as any)?.isDualDocSalesRole;
  if (!isDual) return null;
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs whitespace-nowrap shrink-0">
      <Sparkles className="w-2.5 h-2.5 text-indigo-600 shrink-0" />
      <span>Dual Doc + Sales</span>
    </span>
  );
};

export const renderLeadSourceBadge = (item: DocumenterLeadItem) => {
  const source = (item.taxDraftSummary as any)?.leadSource;
  if (source === 'SELF_SIGNUP' || source === 'PUBLIC_PORTAL') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200 shadow-2xs whitespace-nowrap shrink-0">
        <span>🌐 Direct Sign-Up</span>
      </span>
    );
  }
  return null;
};

export const renderVisaBadge = (visaType?: string | null) => {
  if (!visaType || visaType.trim() === '') {
    return null;
  }

  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap shrink-0">
      <Globe className="w-2.5 h-2.5 text-indigo-500 shrink-0" />
      <span>{visaType}</span>
    </span>
  );
};

export const renderStageBadge = (stage: string) => {
  switch (stage) {
    case 'RAW_PROSPECT':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
          <Clock className="w-3 h-3 text-slate-500" />
          Uncontacted
        </span>
      );
    case 'DOC_OUTREACH':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200 whitespace-nowrap">
          <PhoneCall className="w-3 h-3 text-[#16A34A]" />
          Outreach Active
        </span>
      );
    case 'DOC_PREP':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
          <CheckCircle2 className="w-3 h-3 text-blue-600" />
          Doc Prep &amp; Review
        </span>
      );
    case 'CORRECTION_NEEDED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap">
          <AlertCircle className="w-3 h-3 text-rose-600" />
          Needs Review
        </span>
      );
    case 'SALES_PITCH_QUEUE':
    case 'SALES_PITCHING':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200 whitespace-nowrap">
          Sales Pitch Queue
        </span>
      );
    case 'FILING_QUEUE':
    case 'FILING_IN_PROGRESS':
    case 'FILING_SUCCESS':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200 whitespace-nowrap">
          IRS Filing Portal
        </span>
      );
    case 'DROPPED_CANCELLED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap">
          <AlertCircle className="w-3 h-3 text-rose-500" />
          Dropped / Not Interested
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
          {stage}
        </span>
      );
  }
};

export interface GetDocumenterColumnsProps {
  onOpenCallModal: (lead: DocumenterLeadItem) => void;
  onOpenAssignModal: (lead: DocumenterLeadItem) => void;
  onReassignLead?: (lead: DocumenterLeadItem) => void;
  onRevertLead?: (lead: DocumenterLeadItem) => void;
  hideAssignedStaff?: boolean;
  isManagerView?: boolean;
  isAdmin?: boolean;
}

export const getDocumenterColumns = ({
  onOpenCallModal,
  onOpenAssignModal,
  onReassignLead: _onReassignLead,
  onRevertLead: _onRevertLead,
  hideAssignedStaff = false,
  isManagerView = false,
  isAdmin: isAdminProp = false,
}: GetDocumenterColumnsProps): ColumnDef<DocumenterLeadItem>[] => {
  const isAdmin = isManagerView || isAdminProp;
  const baseColumns: ColumnDef<DocumenterLeadItem>[] = [
    {
      header: 'Taxpayer Client',
      accessorKey: 'customer.fullName',
      width: '280px',
      headerClassName: 'min-w-[280px]',
      cellClassName: 'min-w-[280px]',
      render: (item) => {
        const c = item.customer;
        const initial = c.firstName?.[0] || 'T';
        return (
          <Link
            to={`/documenter/agent/lead/${item.id}`}
            className="flex items-center gap-3 group text-left cursor-pointer min-w-0"
            title="View Lead Details & Call History"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 group-hover:from-emerald-100 group-hover:to-teal-200 border border-slate-200 group-hover:border-emerald-300 text-slate-700 group-hover:text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs transition-all">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#16A34A] transition-colors flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-slate-900">{c.fullName || `${c.firstName} ${c.middleName ? c.middleName + ' ' : ''}${c.lastName}`}</span>
                {renderVisaBadge(c.visaType)}
                <ClientPaymentStatusChip lead={item} size="xs" />
                {renderDualRoleBadge(item)}
              </div>
              <div className="text-[11px] text-slate-500 font-normal mt-0.5 truncate max-w-[230px]">
                {c.occupation ? `${c.occupation}` : 'Individual Taxpayer'}
                {c.dob ? ` • DOB: ${c.dob}` : ''}
              </div>
            </div>
          </Link>
        );
      },
    },
    {
      header: 'Contact Information',
      accessorKey: 'customer.email',
      width: '220px',
      headerClassName: 'min-w-[220px]',
      cellClassName: 'min-w-[220px]',
      render: (item) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-800">{item.customer.email || 'No email provided'}</span>
            {item.customer.email && <AppCopyButton text={item.customer.email} size="sm" />}
          </div>
          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
            <span>{item.customer.phone}</span>
            <AppCopyButton text={item.customer.phone} size="sm" />
          </div>
        </div>
      ),
    },
    {
      header: 'Location & Year',
      accessorKey: 'customer.state',
      width: '180px',
      headerClassName: 'min-w-[180px]',
      cellClassName: 'min-w-[180px]',
      render: (item) => {
        const hasMultipleYears = Boolean(item.allApplications && item.allApplications.length > 1);
        return (
          <div className="text-xs text-slate-700">
            <div className="font-semibold text-slate-800">
              {item.customer.city ? `${item.customer.city}, ` : ''}{item.customer.state || 'N/A'} {item.customer.zipCode || ''}
            </div>
            {hasMultipleYears ? (
              <div className="flex flex-wrap items-center gap-1 mt-1">
                {item.allApplications?.map((app) => (
                  <span
                    key={app.id}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                      app.id === item.id
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-500/20'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                    title={`TY ${app.taxYear} (${app.filingType || 'INDIVIDUAL'}) • Stage: ${app.currentStage.replace(/_/g, ' ')}`}
                  >
                    TY {app.taxYear}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                TY {item.taxYear} • {item.filingType || 'INDIVIDUAL'}
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: 'Priority',
      accessorKey: 'priority',
      width: '110px',
      headerClassName: 'min-w-[110px]',
      cellClassName: 'min-w-[110px]',
      render: (item) => (
        <PriorityBadge priority={item.priority || 'NO_PRIORITY'} size="sm" />
      ),
    },
  ];

  if (!hideAssignedStaff) {
    baseColumns.push({
      header: 'Assigned Staff',
      accessorKey: 'assignedDocAgent.email',
      width: '160px',
      headerClassName: 'min-w-[160px]',
      cellClassName: 'min-w-[160px]',
      render: (item) => {
        if (!item.assignedDocAgent) {
          return (
            <div className="space-y-0.5">
              {isAdmin ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200 whitespace-nowrap">
                  <UserX className="w-3 h-3 text-slate-400" />
                  Unassigned
                </span>
              ) : (
                <button
                  onClick={() => onOpenAssignModal(item)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <UserX className="w-3 h-3 text-amber-600" />
                  Unassigned (Click)
                </button>
              )}
              {item.previousDocAgent && (
                <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                  <span>Prev: {item.previousDocAgent.name || item.previousDocAgent.email.split('@')[0]} (TY{item.previousDocAgent.taxYear})</span>
                </div>
              )}
            </div>
          );
        }

        return (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-200 text-[#16A34A] text-[10px] font-bold flex items-center justify-center shrink-0">
              {item.assignedDocAgent.email[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-800 truncate">
                {item.assignedDocAgent.email.split('@')[0]}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                {item.assignedDocAgent.role.replace('DOC_', '')}
              </div>
            </div>
          </div>
        );
      },
    });
  }

  baseColumns.push(
    {
      header: 'Outreach Stage',
      accessorKey: 'currentStage',
      width: '140px',
      headerClassName: 'min-w-[140px]',
      cellClassName: 'min-w-[140px]',
      render: (item) => renderStageBadge(item.currentStage),
    },
    {
      header: 'Last Call Status',
      accessorKey: 'lastCallLog.disposition',
      width: '180px',
      headerClassName: 'min-w-[180px]',
      cellClassName: 'min-w-[180px]',
      render: (item) => {
        const log = item.lastCallLog || (item as any).callLogs?.[0];
        if (!log) {
          return <span className="text-xs text-slate-400 font-medium">No calls yet</span>;
        }

        const formatDispLabel = (disp: string) => {
          switch (disp) {
            case 'CONNECTED_INTERESTED':
              return { label: 'Connected: Interested', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
            case 'CONNECTED_CALLBACK':
              return { label: 'Scheduled Callback', color: 'text-purple-700 bg-purple-50 border-purple-200' };
            case 'CONNECTED_NOT_INTERESTED':
              return { label: 'Not Interested', color: 'text-slate-600 bg-slate-100 border-slate-200' };
            case 'NO_ANSWER_VOICEMAIL':
              return { label: 'No Answer / Voicemail', color: 'text-amber-700 bg-amber-50 border-amber-200' };
            case 'INVALID_DISCONNECTED':
              return { label: 'Invalid / Wrong No', color: 'text-rose-700 bg-rose-50 border-rose-200' };
            case 'CLIENT_NOT_QUALIFIED':
              return { label: 'Client Not Qualified', color: 'text-purple-700 bg-purple-50 border-purple-200' };
            default:
              return { label: disp.replace(/_/g, ' '), color: 'text-slate-700 bg-slate-100 border-slate-200' };
          }
        };

        const { label, color } = formatDispLabel(log.disposition);
        const subDisp = log.subDisposition || (
          log.callSummary?.startsWith('[') && log.callSummary.includes(']')
            ? log.callSummary.slice(1, log.callSummary.indexOf(']'))
            : null
        );
        const cleanSummary = log.callSummary
          ? (log.callSummary.startsWith('[') && log.callSummary.includes(']')
              ? log.callSummary.replace(/^(\[[^\]]+\]\s*)+/, '').trim()
              : log.callSummary)
          : null;

        return (
          <div className="text-xs space-y-1">
            <div className="flex flex-wrap items-center gap-1">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border whitespace-nowrap ${color}`}>
                {label}
              </span>
              {subDisp && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
                  {subDisp}
                </span>
              )}
            </div>
            {log.callbackScheduledAt && (
              <div className="text-[10px] text-purple-700 font-bold flex items-center gap-1 whitespace-nowrap">
                <Clock className="w-3 h-3 text-purple-500" />
                <span>
                  {new Date(log.callbackScheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(log.callbackScheduledAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}){log.callbackTimezone ? ` • ${log.callbackTimezone}` : ''}
                </span>
              </div>
            )}
            {cleanSummary && (
              <div className="text-[11px] text-slate-500 truncate max-w-[180px] font-medium" title={cleanSummary}>
                "{cleanSummary}"
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      width: '130px',
      headerClassName: 'text-right min-w-[130px]',
      cellClassName: 'text-right min-w-[130px]',
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            to={`/documenter/agent/lead/${item.id}`}
            className="h-8 px-2.5 rounded-lg text-xs font-semibold border border-slate-200 hover:border-emerald-300 bg-white hover:bg-emerald-50 text-slate-700 hover:text-[#16A34A] flex items-center gap-1 shadow-2xs transition-all cursor-pointer whitespace-nowrap"
            title="View Lead Details & Call History"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View</span>
          </Link>
          {!isAdmin && (
            <Button
              size="sm"
              onClick={() => onOpenCallModal(item)}
              className="h-8 px-3 rounded-lg text-xs font-bold bg-[#16A34A] hover:bg-[#15803D] text-white flex items-center gap-1.5 shadow-2xs cursor-pointer whitespace-nowrap"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call</span>
            </Button>
          )}
          {isAdmin && (
            <button
              onClick={() => onOpenAssignModal(item)}
              className="w-8 h-8 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
              title="Assign Lead to Agent"
            >
              <UserCheck className="w-3.5 h-3.5" />
            </button>
          )}
          {!hideAssignedStaff && !isAdmin && (
            <Button
              size="sm"
              variant="outline"
              disabled={Boolean(item.assignedDocAgent)}
              onClick={() => !item.assignedDocAgent && onOpenAssignModal(item)}
              className={`h-8 px-2.5 rounded-lg text-xs font-medium border-slate-200 ${
                item.assignedDocAgent
                  ? 'opacity-30 cursor-not-allowed bg-slate-50 text-slate-400 pointer-events-none'
                  : 'hover:bg-slate-100 text-slate-700 cursor-pointer'
              }`}
              title={
                item.assignedDocAgent
                  ? `Already assigned to ${item.assignedDocAgent.email?.split('@')[0] || 'staff'}`
                  : 'Assign Staff'
              }
            >
              <UserCheck className="w-3.5 h-3.5 text-slate-600" />
            </Button>
          )}
        </div>
      ),
    }
  );

  return baseColumns;
};
