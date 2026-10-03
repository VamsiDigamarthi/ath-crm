import { Link } from 'react-router-dom';
import type { ColumnDef } from '@/shared/components/AppTable';
import { AppCopyButton } from '@/shared/components/AppCopyButton';
import { Button } from '@/shared/components/Button';
import {
  PhoneCall,
  UserCheck,
  Globe,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sparkles,
  FilePlus2
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
  onOpenStartFilingModal?: (lead: DocumenterLeadItem) => void;
  onReassignLead?: (lead: DocumenterLeadItem) => void;
  onRevertLead?: (lead: DocumenterLeadItem) => void;
  hideAssignedStaff?: boolean;
  isManagerView?: boolean;
  isAdmin?: boolean;
}

/**
 * Helper to check if a lead is a raw ingested prospect (bulk uploaded without an active TaxApplication / Tax Year)
 */
export const isRawLead = (item: DocumenterLeadItem): boolean => {
  if (item.isRawProspect === true) return true;
  if ((item as any).isReturnConfigured === false) return true;
  if ((item.taxDraftSummary as any)?.isReturnConfigured === false) return true;
  if ((item.taxDraftSummary as any)?.isRawIngested === true) return true;
  if (item.id?.startsWith('raw-')) return true;
  if (!item.taxYear || item.totalTaxYears === 0) return true;
  return false;
};

/**
 * Check if the lead has been marked as Interested in calling outreach
 */
export const isLeadInterested = (item: DocumenterLeadItem): boolean => {
  const log = item.lastCallLog || (item as any).callLogs?.[0];
  return log?.disposition === 'CONNECTED_INTERESTED';
};

/**
 * Check if Configure Return (Start Filing) button should be displayed:
 * Flow: Admin bulk uploaded lead (raw prospect, no tax year yet) -> Agent calls lead -> Marks as Interested ->
 * Configure Return button appears so agent can configure Tax Year & Return Type.
 */
export const canConfigureReturn = (item: DocumenterLeadItem): boolean => {
  return isRawLead(item) && isLeadInterested(item);
};

/**
 * Check if 360 View is allowed:
 * 1. For RAW leads (no tax year configured yet): View is NEVER allowed.
 * 2. For EXISTING leads (already has a Tax Year / TaxApplication):
 *    - Allowed if marked as "Interested" (CONNECTED_INTERESTED)
 *    - Allowed if in advanced stages (DOC_PREP, SALES_PITCHING, FILING, PAID, etc.)
 *    - Otherwise (initial uncalled state, voicemail, callback, fallback, not interested) -> View is LOCKED / NOT shown.
 */
export const canViewLead = (item: DocumenterLeadItem): boolean => {
  // If it's still a raw lead without an active TaxApplication/taxYear, View cannot be opened yet
  if (isRawLead(item)) {
    return false;
  }

  // If already progressed to Tax Prep, Sales, or IRS Filing, or Paid client
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

  // For existing customer in outreach/calling stage: View is unlocked only when marked Interested
  return isLeadInterested(item);
};

export const isLeadInCallingOnlyMode = (item: DocumenterLeadItem): boolean => {
  return !canViewLead(item);
};

export const getDocumenterColumns = ({
  onOpenCallModal,
  onOpenAssignModal,
  onOpenStartFilingModal,
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
        const isCallingOnly = isLeadInCallingOnlyMode(item);

        const content = (
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-slate-900 group-hover:text-[#16A34A] transition-colors flex items-center gap-1.5 flex-wrap">
              <span>{c.fullName || `${c.firstName} ${c.middleName ? c.middleName + ' ' : ''}${c.lastName}`}</span>
              <ClientPaymentStatusChip lead={item} size="xs" />
              {renderDualRoleBadge(item)}
            </div>
            <div className="text-xs text-slate-500 mt-0.5 truncate max-w-[240px]" title={c.email || undefined}>
              {c.email || 'No email'}
              {c.visaType ? ` · ${c.visaType}` : ''}
            </div>
          </div>
        );

        if (isCallingOnly) {
          return (
            <div className="flex items-center gap-3 text-left min-w-0 select-none">
              {content}
            </div>
          );
        }

        return (
          <Link
            to={`/documenter/agent/lead/${item.id}?from=queue`}
            state={{ from: 'agent_queue' }}
            className="flex items-center gap-3 group text-left cursor-pointer min-w-0"
            title="View Lead Details & Call History"
          >
            {content}
          </Link>
        );
      },
    },
    {
      header: 'Phone',
      accessorKey: 'customer.phone',
      width: '170px',
      headerClassName: 'min-w-[170px]',
      cellClassName: 'min-w-[170px]',
      render: (item) => (
        <div className="flex items-center gap-1 text-sm text-slate-700">
          <span className="whitespace-nowrap">{item.customer.phone || '—'}</span>
          {item.customer.phone && <AppCopyButton text={item.customer.phone} size="sm" />}
        </div>
      ),
    },
    /*
    {
      header: 'Location & Year',
      accessorKey: 'customer.state',
      width: '180px',
      headerClassName: 'min-w-[180px]',
      cellClassName: 'min-w-[180px]',
      render: (item) => {
        const isRaw = item.isRawProspect || item.id?.startsWith('raw-') || item.totalTaxYears === 0;
        if (isRaw) {
          return (
            <div className="text-xs text-slate-700">
              <div className="font-semibold text-slate-800">
                {item.customer.city ? `${item.customer.city}, ` : ''}{item.customer.state || 'N/A'} {item.customer.zipCode || ''}
              </div>
              <div className="mt-1 flex items-center gap-1">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  No Filing Started
                </span>
              </div>
            </div>
          );
        }

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
    */
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
      header: 'Assigned to',
      accessorKey: 'assignedDocAgent.email',
      width: '160px',
      headerClassName: 'min-w-[160px]',
      cellClassName: 'min-w-[160px]',
      render: (item) => {
        if (!item.assignedDocAgent) {
          return (
            <div>
              {isAdmin ? (
                <span className="text-sm text-slate-400">Unassigned</span>
              ) : (
                <button
                  onClick={() => onOpenAssignModal(item)}
                  className="text-sm font-semibold text-[#16A34A] hover:text-[#15803D] cursor-pointer whitespace-nowrap"
                >
                  Assign
                </button>
              )}
              {item.previousDocAgent && (
                <div className="text-xs text-slate-500 mt-0.5 whitespace-nowrap">
                  Prev: {item.previousDocAgent.name || item.previousDocAgent.email.split('@')[0]} (TY{item.previousDocAgent.taxYear})
                </div>
              )}
            </div>
          );
        }

        return (
          <div className="min-w-0">
            <div className="text-sm text-slate-800 truncate">{item.assignedDocAgent.email.split('@')[0]}</div>
            <div className="text-xs text-slate-500 mt-0.5">{item.assignedDocAgent.role.replace('DOC_', '').replace(/_/g, ' ').toLowerCase()}</div>
          </div>
        );
      },
    });
  }

  baseColumns.push(
    {
      header: 'Stage',
      accessorKey: 'currentStage',
      width: '140px',
      headerClassName: 'min-w-[140px]',
      cellClassName: 'min-w-[140px]',
      render: (item) => {
        if (item.isRawProspect || item.id?.startsWith('raw-')) {
          return (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              New lead
            </span>
          );
        }
        return renderStageBadge(item.currentStage);
      },
    },
    {
      header: 'Last call',
      accessorKey: 'lastCallLog.disposition',
      width: '180px',
      headerClassName: 'min-w-[180px]',
      cellClassName: 'min-w-[180px]',
      render: (item) => {
        const log = item.lastCallLog || (item as any).callLogs?.[0];
        if (!log) {
          return <span className="text-sm text-slate-400">No calls yet</span>;
        }

        const formatDispLabel = (disp: string) => {
          switch (disp) {
            case 'CONNECTED_INTERESTED':
              return { label: 'Interested', dot: 'bg-[#16A34A]' };
            case 'CONNECTED_CALLBACK':
              return { label: 'Callback scheduled', dot: 'bg-purple-500' };
            case 'CONNECTED_NOT_INTERESTED':
              return { label: 'Not interested', dot: 'bg-slate-400' };
            case 'NO_ANSWER_VOICEMAIL':
              return { label: 'No answer', dot: 'bg-amber-500' };
            case 'INVALID_DISCONNECTED':
              return { label: 'Invalid number', dot: 'bg-rose-500' };
            case 'CLIENT_NOT_QUALIFIED':
              return { label: 'Not qualified', dot: 'bg-slate-400' };
            case 'FALLBACK':
              return { label: 'Fall back', dot: 'bg-slate-400' };
            default:
              return { label: disp.replace(/_/g, ' ').toLowerCase(), dot: 'bg-slate-400' };
          }
        };

        const { label, dot } = formatDispLabel(log.disposition);
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
          <div className="max-w-[200px]">
            <div className="flex items-center gap-1.5 text-sm text-slate-800 whitespace-nowrap">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
              {label}
            </div>
            {(subDisp || log.callbackScheduledAt) && (
              <div className="text-xs text-slate-500 mt-0.5 truncate">
                {subDisp}
                {subDisp && log.callbackScheduledAt ? ' · ' : ''}
                {log.callbackScheduledAt &&
                  `${new Date(log.callbackScheduledAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} ${new Date(log.callbackScheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${log.callbackTimezone ? ` ${log.callbackTimezone}` : ''}`}
              </div>
            )}
            {cleanSummary && (
              <div className="text-xs text-slate-400 truncate mt-0.5" title={cleanSummary}>
                {cleanSummary}
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: '',
      accessorKey: 'id',
      width: '180px',
      headerClassName: 'text-right min-w-[180px]',
      cellClassName: 'text-right min-w-[180px]',
      render: (item) => {
        const canView = canViewLead(item);
        const canConfig = canConfigureReturn(item);

        return (
          <div className="flex items-center justify-end gap-1.5">
            {/* 1. Configure Return button when Raw Ingested Lead is marked Interested */}
            {canConfig && onOpenStartFilingModal && (
              <Button
                size="sm"
                onClick={() => onOpenStartFilingModal(item)}
                className="h-8 px-2.5 rounded-lg text-xs font-semibold border border-emerald-200 bg-white hover:bg-emerald-50 text-[#15803D] flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                title="Configure Tax Year & Filing Type for this interested prospect"
              >
                <FilePlus2 className="w-3.5 h-3.5" />
                <span>Configure Return</span>
              </Button>
            )}

            {/* 2. View button when Tax Year exists & lead is Qualified / Interested */}
            {canView && (
              <Link
                to={`/documenter/agent/lead/${item.id}?from=queue`}
                state={{ from: 'agent_queue' }}
                className="h-8 px-2.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-1 cursor-pointer whitespace-nowrap"
                title="View Lead Details & Call History"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">View</span>
              </Link>
            )}

            {/* 3. Call button (Always active for queue outreach) */}
            <Button
              size="sm"
              onClick={() => onOpenCallModal(item)}
              className="h-8 px-3 rounded-lg text-xs font-semibold bg-[#16A34A] hover:bg-[#15803D] text-white flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              title="Call Prospect & Log Outcome"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call</span>
            </Button>

            {/* 4. Admin / Manager Assign Button */}
            {isAdmin && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onOpenAssignModal(item)}
                className="h-8 px-2.5 rounded-lg text-xs font-semibold border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                title="Assign Lead to Agent"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Assign</span>
              </Button>
            )}

            {/* 5. Non-admin unassigned staff self-assignment helper */}
            {!hideAssignedStaff && !isAdmin && (
              <Button
                size="sm"
                variant="outline"
                disabled={Boolean(item.assignedDocAgent)}
                onClick={() => !item.assignedDocAgent && onOpenAssignModal(item)}
                className={`h-8 px-2.5 rounded-lg text-xs font-medium border-slate-200 ${item.assignedDocAgent
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
        );
      },
    }
  );

  return baseColumns;
};
