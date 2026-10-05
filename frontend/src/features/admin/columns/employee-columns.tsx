import type { ColumnDef } from '@tanstack/react-table';
import { ClientNameCell, ClientEmailCell, ClientPhoneCell } from '@/shared/components/table/ClientContactCells';
import { Button } from '@/shared/components/Button';
import { Edit3, Power } from 'lucide-react';
import type { EmployeeItem } from '../types/employee.types';
import { SYSTEM_ROLES, SYSTEM_DEPARTMENTS, SYSTEM_STATUSES } from '@/shared/constants/system-enums';

interface ColumnActionsProps {
  onEdit: (employee: EmployeeItem) => void;
  onToggleStatus: (employee: EmployeeItem) => void;
}

export const getEmployeeColumns = ({
  onEdit,
  onToggleStatus,
}: ColumnActionsProps): ColumnDef<EmployeeItem, any>[] => [
  {
    id: 'name',
    header: 'NAME',
    accessorKey: 'fullName',
    cell: ({ row }) => <ClientNameCell name={row.original.fullName} />,
  },
  {
    id: 'email',
    header: 'EMAIL',
    accessorKey: 'email',
    cell: ({ row }) => <ClientEmailCell email={row.original.email} />,
  },
  {
    id: 'mobile',
    header: 'MOBILE',
    accessorKey: 'mobile',
    cell: ({ row }) => <ClientPhoneCell phone={row.original.mobile} />,
  },
  {
    id: 'empId',
    header: 'EMP ID',
    accessorFn: (row) => row.id.split('-')[0].toUpperCase(),
    cell: ({ row }) => (
      <span className="font-mono text-xs text-zinc-600">
        {row.original.id.split('-')[0].toUpperCase()}
      </span>
    ),
  },
  {
    id: 'role',
    header: 'DESIGNATION',
    accessorFn: (row) => `${row.roleLabel || ''} ${row.role || ''}`.trim(),
    meta: {
      filterType: 'enum',
      filterOptions: SYSTEM_ROLES,
    },
    cell: ({ row }) => (
      <span className="text-xs font-normal text-zinc-800">
        {row.original.roleLabel || row.original.role}
      </span>
    ),
  },
  {
    id: 'department',
    header: 'DEPARTMENT',
    accessorFn: (row) => `${row.department || ''} ${row.departmentLabel || ''}`.trim(),
    meta: {
      filterType: 'enum',
      filterOptions: SYSTEM_DEPARTMENTS,
    },
    cell: ({ row }) => {
      const deptMap: Record<string, string> = {
        DOC: 'Documenter',
        PREP_REVIEW: 'Prep & Review',
        SALES: 'Sales',
        FILE_OP: 'Filing Ops',
        ADMIN: 'Admin',
      };
      return (
        <span className="text-xs font-normal text-zinc-700">
          {deptMap[row.original.department] || row.original.department}
        </span>
      );
    },
  },
  {
    id: 'mobile',
    header: 'CONTACT',
    accessorKey: 'mobile',
    cell: ({ row }) => (
      <span className="text-xs font-normal text-zinc-600">
        {row.original.mobile || '—'}
      </span>
    ),
  },
  {
    id: 'status',
    header: 'STATUS',
    accessorKey: 'isActive',
    meta: {
      filterType: 'enum',
      filterOptions: SYSTEM_STATUSES,
    },
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <span
          className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded ${
            isActive
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
          }`}
        >
          {isActive ? 'Active' : 'Inactive'}
        </span>
      );
    },
  },
  {
    id: 'actions',
    header: 'ACTION',
    enableSorting: false,
    enableHiding: false,
    meta: {
      disableMenu: true,
      disableFilter: true,
    },
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(row.original)}
          className="h-7 px-2 text-[11px] font-normal border-zinc-200 text-zinc-700 hover:bg-zinc-50 cursor-pointer"
        >
          <Edit3 className="w-3 h-3 text-zinc-500 mr-1" />
          <span>Edit</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onToggleStatus(row.original)}
          className={`h-7 px-2 text-[11px] font-normal border-zinc-200 cursor-pointer ${
            row.original.isActive
              ? 'text-rose-600 hover:bg-rose-50'
              : 'text-emerald-600 hover:bg-emerald-50'
          }`}
        >
          <Power className="w-3 h-3 mr-1" />
          <span>{row.original.isActive ? 'Deactivate' : 'Activate'}</span>
        </Button>
      </div>
    ),
  },
];
