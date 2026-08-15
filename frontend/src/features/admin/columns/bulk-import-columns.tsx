import type { ColumnDef } from '@/shared/components/AppTable';
import { AppCopyButton } from '@/shared/components/AppCopyButton';
import { 
  Building2, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Lock,
  Globe
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
        title={message || "Ready for Server Ingestion"}
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
 * Renders tailored visa badge
 */
export const renderVisaBadge = (visaType?: string, status?: LeadValidationStatus) => {
  if (!visaType || visaType.trim() === '') {
    return <span className="text-xs text-slate-400 font-normal">N/A</span>;
  }

  if (status === 'INVALID_VISA') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200" title="Invalid Visa Type">
        <AlertCircle className="w-3 h-3 text-rose-600" />
        {visaType}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
      <Globe className="w-3 h-3 text-indigo-500" />
      {visaType}
    </span>
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
        <span className="text-[10px] text-slate-400">Server deduplication pending</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-0.5">
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
        <AlertCircle className="w-3 h-3 text-rose-600" />
        Validation Issue
      </span>
      {message && <span className="text-[10px] text-rose-600 font-medium max-w-[200px] leading-tight">{message}</span>}
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
    header: 'Taxpayer Client',
    accessorKey: 'fullName',
    sortable: true,
    render: (item) => (
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
          {item.firstName?.[0] || item.fullName?.[0] || 'T'}
        </div>
        <div>
          <div className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
            {item.fullName}
            {item.filingType === 'CORPORATE' ? (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                <Building2 className="w-2.5 h-2.5" /> Corp
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-600">
                <User className="w-2.5 h-2.5" /> Indv
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {item.occupation ? `${item.occupation} • ` : ''}
            {item.dob ? `DOB: ${item.dob}` : item.source || 'Bulk Ingestion'}
          </div>
        </div>
      </div>
    ),
  },
  {
    header: 'Contact Information',
    accessorKey: 'email',
    sortable: true,
    render: (item) => (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-800">{item.email}</span>
          {item.email && <AppCopyButton text={item.email} size="sm" />}
        </div>
        <div className="text-[11px] text-slate-500 font-medium">{item.phone || 'No phone provided'}</div>
      </div>
    ),
  },
  {
    header: 'Visa Status',
    accessorKey: 'visaType',
    sortable: true,
    render: (item) => renderVisaBadge(item.visaType, item.validationStatus),
  },
  {
    header: 'SSN / TIN',
    accessorKey: 'ssnTin',
    render: (item) => (
      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-mono">
        <Lock className="w-3 h-3 text-slate-400" />
        <span>{item.ssnTin}</span>
      </div>
    ),
  },
  {
    header: 'Location',
    accessorKey: 'city',
    render: (item) => (
      <div className="text-xs text-slate-700">
        <div className="font-medium">{item.addressLine1 || `${item.city}, ${item.state}`}</div>
        <div className="text-[11px] text-slate-400 font-normal">
          {item.city && `${item.city}, `}{item.state} {item.zipCode}
        </div>
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
