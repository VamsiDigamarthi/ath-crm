import type { ColumnDef } from '@/shared/components/AppTable';
import { AppCopyButton } from '@/shared/components/AppCopyButton';
import { 
  Users, 
  DollarSign, 
  FileCheck, 
  ShieldCheck, 
  Edit3, 
  Power 
} from 'lucide-react';
import type { EmployeeItem } from '../types/employee.types';

interface ColumnActionsProps {
  onEdit: (employee: EmployeeItem) => void;
  onToggleStatus: (employee: EmployeeItem) => void;
}

/**
 * Renders tailored department badge with icon
 */
export const renderDepartmentBadge = (department: string, roleLabel: string) => {
  switch (department) {
    case 'DOC':
      return (
        <div className="flex flex-col gap-1 items-start">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            Documenter
          </span>
          <span className="text-[11px] font-medium text-slate-500 pl-0.5">{roleLabel}</span>
        </div>
      );
    case 'SALES':
      return (
        <div className="flex flex-col gap-1 items-start">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs">
            <DollarSign className="w-3.5 h-3.5 text-purple-600" />
            Sales Dept
          </span>
          <span className="text-[11px] font-medium text-slate-500 pl-0.5">{roleLabel}</span>
        </div>
      );
    case 'FILE_OP':
      return (
        <div className="flex flex-col gap-1 items-start">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200 shadow-2xs">
            <FileCheck className="w-3.5 h-3.5 text-[#16A34A]" />
            File Operator
          </span>
          <span className="text-[11px] font-medium text-slate-500 pl-0.5">{roleLabel}</span>
        </div>
      );
    case 'ADMIN':
    default:
      return (
        <div className="flex flex-col gap-1 items-start">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
            Administration
          </span>
          <span className="text-[11px] font-medium text-slate-500 pl-0.5">{roleLabel}</span>
        </div>
      );
  }
};

/**
 * Returns strongly typed column definitions for Employee Directory Table with Status and Edit/Toggle actions
 */
export const getEmployeeColumns = (actions: ColumnActionsProps): ColumnDef<EmployeeItem>[] => [
  {
    header: 'Staff Member',
    accessorKey: 'fullName',
    sortable: true,
    render: (row) => (
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={row.avatar}
            alt={row.fullName}
            className="w-10 h-10 rounded-full border border-slate-200 bg-slate-100 object-cover shadow-2xs"
          />
          <span
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
              row.isActive ? 'bg-[#16A34A]' : 'bg-slate-400'
            }`}
            title={row.isActive ? 'Active Staff' : 'Inactive Staff'}
          />
        </div>
        <div>
          <div className="font-bold text-slate-900 text-xs sm:text-sm">
            {row.fullName}
          </div>
          <div className="text-[11px] text-slate-400">
            Joined {row.createdAt}
          </div>
        </div>
      </div>
    ),
  },
  {
    header: 'Contact Information',
    accessorKey: 'email',
    render: (row) => (
      <div className="space-y-1 text-xs">
        <div className="flex items-center gap-1.5 text-slate-700">
          <span className="truncate max-w-[180px]" title={row.email}>
            {row.email}
          </span>
          <AppCopyButton text={row.email} size="sm" />
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          <span>{row.mobile}</span>
          <AppCopyButton text={row.mobile} size="sm" />
        </div>
      </div>
    ),
  },
  {
    header: 'Department & Role',
    accessorKey: 'department',
    render: (row) => renderDepartmentBadge(row.department, row.roleLabel),
  },
  {
    header: 'Active Cases',
    accessorKey: 'assignedCasesCount',
    render: (row) => (
      <div className="space-y-1">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
          {row.assignedCasesCount} active leads
        </span>
        <div className="text-[10px] font-medium text-slate-500">
          {row.department === 'DOC'
            ? `${row.completedCasesCount} completed intakes`
            : `${row.completedCasesCount} completed filings`}
        </div>
      </div>
    ),
  },
  {
    header: 'Account Status',
    accessorKey: 'isActive',
    render: (row) => (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
          row.isActive
            ? 'bg-emerald-50 text-[#16A34A] border-emerald-200'
            : 'bg-slate-100 text-slate-600 border-slate-200'
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            row.isActive ? 'bg-[#16A34A]' : 'bg-slate-400'
          }`}
        />
        {row.isActive ? 'Active' : 'Inactive'}
      </span>
    ),
  },
  {
    header: 'Actions',
    width: '100px',
    render: (row) => (
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!row.isActive}
          onClick={() => row.isActive && actions.onEdit(row)}
          className={`p-1.5 rounded-lg border transition-all shadow-2xs ${
            row.isActive
              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200/80 bg-white cursor-pointer'
              : 'text-slate-300 bg-slate-100/60 border-slate-200/40 cursor-not-allowed opacity-50'
          }`}
          title={row.isActive ? 'Edit Staff Member' : 'Cannot edit inactive staff (Activate first)'}
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => actions.onToggleStatus(row)}
          className={`p-1.5 rounded-lg transition-all border shadow-2xs cursor-pointer ${
            row.isActive
              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 border-slate-200/80 bg-white'
              : 'text-[#16A34A] hover:bg-emerald-50 border-emerald-200/80 bg-emerald-50/40'
          }`}
          title={row.isActive ? 'Deactivate Staff (Set Inactive)' : 'Activate Staff (Set Active)'}
        >
          <Power className="w-3.5 h-3.5" />
        </button>
      </div>
    ),
  },
];
