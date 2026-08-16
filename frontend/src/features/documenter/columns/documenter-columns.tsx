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
  AlertCircle
} from 'lucide-react';
import type { DocumenterLeadItem } from '../types/documenter.types';

export const renderVisaBadge = (visaType?: string | null) => {
  if (!visaType || visaType.trim() === '') {
    return null;
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
      <Globe className="w-2.5 h-2.5 text-indigo-500" />
      {visaType}
    </span>
  );
};

export const renderStageBadge = (stage: string) => {
  switch (stage) {
    case 'RAW_PROSPECT':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
          <Clock className="w-3 h-3 text-slate-500" />
          Uncontacted
        </span>
      );
    case 'DOC_OUTREACH':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <PhoneCall className="w-3 h-3 text-amber-600" />
          In Outreach
        </span>
      );
    case 'DOC_PREP':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
          Tax Prep Active
        </span>
      );
    case 'CORRECTION_NEEDED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <AlertCircle className="w-3 h-3 text-rose-600" />
          Needs Review
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
          {stage}
        </span>
      );
  }
};

export interface GetDocumenterColumnsProps {
  onOpenCallModal: (lead: DocumenterLeadItem) => void;
  onOpenAssignModal: (lead: DocumenterLeadItem) => void;
  hideAssignedStaff?: boolean;
}

export const getDocumenterColumns = ({
  onOpenCallModal,
  onOpenAssignModal,
  hideAssignedStaff = false,
}: GetDocumenterColumnsProps): ColumnDef<DocumenterLeadItem>[] => {
  const baseColumns: ColumnDef<DocumenterLeadItem>[] = [
    {
      header: 'Taxpayer Client',
      accessorKey: 'customer.fullName',
      render: (item) => {
        const c = item.customer;
        const initial = c.firstName?.[0] || 'T';
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
              {initial}
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                <span>{c.fullName || `${c.firstName} ${c.middleName ? c.middleName + ' ' : ''}${c.lastName}`}</span>
                {renderVisaBadge(c.visaType)}
              </div>
              <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                {c.occupation ? `${c.occupation}` : 'Individual Taxpayer'}
                {c.dob ? ` • DOB: ${c.dob}` : ''}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Contact Information',
      accessorKey: 'customer.email',
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
      render: (item) => (
        <div className="text-xs text-slate-700">
          <div className="font-semibold text-slate-800">
            {item.customer.city ? `${item.customer.city}, ` : ''}{item.customer.state || 'N/A'} {item.customer.zipCode || ''}
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            TY {item.taxYear} • {item.filingType || 'INDIVIDUAL'}
          </div>
        </div>
      ),
    },
  ];

  if (!hideAssignedStaff) {
    baseColumns.push({
      header: 'Assigned Staff',
      accessorKey: 'assignedDocAgent.email',
      render: (item) => {
        if (!item.assignedDocAgent) {
          return (
            <button
              onClick={() => onOpenAssignModal(item)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
            >
              <UserX className="w-3 h-3 text-amber-600" />
              Unassigned (Click)
            </button>
          );
        }

        return (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-200 text-[#16A34A] text-[10px] font-bold flex items-center justify-center">
              {item.assignedDocAgent.email[0].toUpperCase()}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">
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
      render: (item) => renderStageBadge(item.currentStage),
    },
    {
      header: 'Last Call Status',
      accessorKey: 'lastCallLog.disposition',
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
            default:
              return { label: disp.replace(/_/g, ' '), color: 'text-slate-700 bg-slate-100 border-slate-200' };
          }
        };

        const { label, color } = formatDispLabel(log.disposition);

        return (
          <div className="text-xs space-y-1">
            <div>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${color}`}>
                {label}
              </span>
            </div>
            {log.callbackScheduledAt && (
              <div className="text-[10px] text-purple-700 font-bold flex items-center gap-1">
                <Clock className="w-3 h-3 text-purple-500" />
                <span>
                  {new Date(log.callbackScheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(log.callbackScheduledAt).toLocaleDateString([], { month: 'short', day: 'numeric' })})
                </span>
              </div>
            )}
            {log.callSummary && (
              <div className="text-[11px] text-slate-500 truncate max-w-[180px] font-medium" title={log.callSummary}>
                "{log.callSummary}"
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cellClassName: 'text-right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            onClick={() => onOpenCallModal(item)}
            className="h-8 px-3 rounded-lg text-xs font-bold bg-[#16A34A] hover:bg-[#15803D] text-white flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            Call
          </Button>
          {!hideAssignedStaff && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onOpenAssignModal(item)}
              className="h-8 px-2.5 rounded-lg text-xs font-medium border-slate-200 hover:bg-slate-100 text-slate-700"
              title="Assign or Reassign Staff"
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
