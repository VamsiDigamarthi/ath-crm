import type { ColumnDef } from '@/shared/components/AppTable';
import { Edit3, Power } from 'lucide-react';
import type { EmployeeItem } from '../types/employee.types';

interface ColumnActionsProps {
  onEdit: (employee: EmployeeItem) => void;
  onToggleStatus: (employee: EmployeeItem) => void;
}

const DEPARTMENT_META: Record<EmployeeItem['department'], { label: string; dot: string }> = {
  DOC: { label: 'Documenter', dot: 'bg-blue-500' },
  PREP_REVIEW: { label: 'Tax Prep & Review', dot: 'bg-indigo-500' },
  SALES: { label: 'Sales', dot: 'bg-purple-500' },
  FILE_OP: { label: 'Filing', dot: 'bg-[#16A34A]' },
  ADMIN: { label: 'Administration', dot: 'bg-slate-500' },
};

/**
 * Returns column definitions for the Staff directory table
 */
export const getEmployeeColumns = (actions: ColumnActionsProps): ColumnDef<EmployeeItem>[] => [
  {
    header: 'Member',
    accessorKey: 'fullName',
    sortable: true,
    render: (row) => (
      <div className="min-w-0">
        <div className="font-semibold text-slate-900 text-sm truncate">{row.fullName}</div>
        <div className="text-xs text-slate-500 truncate" title={row.email}>
          {row.email}
        </div>
      </div>
    ),
  },
  {
    header: 'Role',
    accessorKey: 'department',
    render: (row) => {
      const meta = DEPARTMENT_META[row.department] ?? DEPARTMENT_META.ADMIN;
      return (
        <div>
          <div className="text-sm font-medium text-slate-800">{row.roleLabel}</div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
          </div>
        </div>
      );
    },
  },
  {
    header: 'Phone',
    accessorKey: 'mobile',
    render: (row) => <span className="text-sm text-slate-600">{row.mobile || '—'}</span>,
  },
  {
    header: 'Cases',
    accessorKey: 'assignedCasesCount',
    render: (row) => (
      <div className="text-sm text-slate-700">
        <span className="font-semibold text-slate-900">{row.assignedCasesCount}</span> active
        <span className="text-slate-400"> · {row.completedCasesCount} done</span>
      </div>
    ),
  },
  {
    header: 'Status',
    accessorKey: 'isActive',
    render: (row) => (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
          row.isActive ? 'bg-emerald-50 text-[#15803D]' : 'bg-slate-100 text-slate-500'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${row.isActive ? 'bg-[#16A34A]' : 'bg-slate-400'}`} />
        {row.isActive ? 'Active' : 'Inactive'}
      </span>
    ),
  },
  {
    header: '',
    width: '90px',
    render: (row) => (
      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          disabled={!row.isActive}
          onClick={() => row.isActive && actions.onEdit(row)}
          className={`p-2 rounded-lg transition-colors ${
            row.isActive
              ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer'
              : 'text-slate-300 cursor-not-allowed'
          }`}
          title={row.isActive ? 'Edit' : 'Activate to edit'}
        >
          <Edit3 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => actions.onToggleStatus(row)}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            row.isActive
              ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
              : 'text-[#16A34A] hover:bg-emerald-50'
          }`}
          title={row.isActive ? 'Deactivate' : 'Activate'}
        >
          <Power className="w-4 h-4" />
        </button>
      </div>
    ),
  },
];
