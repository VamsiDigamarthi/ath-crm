import type { ColumnDef } from '@/shared/components/AppTable';
import { AppCopyButton } from '@/shared/components/AppCopyButton';
import { 
  CheckCircle2, 
  AlertCircle, 
  Mail,
  Phone
} from 'lucide-react';
import type { ParsedLeadRow, LeadValidationStatus } from '../types/bulk-import.types';

/**
 * Renders circular status indicator icon for table rows
 */
export const renderStatusIcon = (status: LeadValidationStatus, message?: string) => {
  if (status === 'VALID') {
    return (
      <div 
        className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-[#16A34A] flex items-center justify-center shadow-2xs transition-transform hover:scale-105" 
        title={message || "Ready for Import"}
      >
        <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
      </div>
    );
  }

  return (
    <div 
      className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shadow-2xs transition-transform hover:scale-105" 
      title={message || "Validation Error"}
    >
      <AlertCircle className="w-4 h-4 text-rose-600" />
    </div>
  );
};

/**
 * Renders detailed validation diagnosis badge for table rows
 */
export const renderValidationBadge = (status: LeadValidationStatus, message?: string) => {
  if (status === 'VALID') {
    return (
      <div className="flex flex-col items-start gap-0.5">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
          Valid & Ready
        </span>
        <span className="text-[10px] text-slate-400">Ready for deduplication & outreach</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-0.5">
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
        <AlertCircle className="w-3 h-3 text-rose-600" />
        Validation Issue
      </span>
      {message && <span className="text-[10px] text-rose-600 font-medium max-w-[280px] leading-tight">{message}</span>}
    </div>
  );
};

/**
 * Column definitions for the Bulk Lead Import Preview Table
 */
export const getBulkImportColumns = (): ColumnDef<ParsedLeadRow>[] => [
  {
    header: 'Status',
    accessorKey: 'validationStatus',
    sortable: true,
    width: '65px',
    render: (item) => renderStatusIcon(item.validationStatus, item.validationMessage),
  },
  {
    header: 'Row #',
    accessorKey: 'rowNumber',
    sortable: true,
    width: '65px',
    cellClassName: 'font-mono text-xs text-slate-400 font-semibold',
  },
  {
    header: 'Taxpayer Name',
    accessorKey: 'fullName',
    sortable: true,
    render: (item) => {
      const displayName = item.fullName || `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'Taxpayer';
      const initial = item.firstName?.[0] || displayName[0] || 'T';
      return (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">
            {initial.toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-xs sm:text-sm text-slate-900">
              {displayName}
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              Lead Contact
            </div>
          </div>
        </div>
      );
    },
  },
  {
    header: 'Email Address',
    accessorKey: 'email',
    sortable: true,
    render: (item) => (
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>{item.email || '—'}</span>
        {item.email && <AppCopyButton text={item.email} size="sm" />}
      </div>
    ),
  },
  {
    header: 'Phone Number',
    accessorKey: 'phone',
    sortable: true,
    render: (item) => (
      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>{item.phone || '—'}</span>
        {item.phone && <AppCopyButton text={item.phone} size="sm" />}
      </div>
    ),
  },
  {
    header: 'Validation Diagnosis',
    accessorKey: 'validationStatus',
    sortable: true,
    render: (item) => renderValidationBadge(item.validationStatus, item.validationMessage),
  },
];
