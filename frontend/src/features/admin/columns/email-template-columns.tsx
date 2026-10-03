import type { ColumnDef } from '@tanstack/react-table';
import type { EmailTemplateItem, RoleOption, SystemRole } from '../types/email-template.types';
import { Button } from '@/shared/components/Button';
import { Eye, Edit2, Trash2 } from 'lucide-react';

export const createEmailTemplateColumns = (
  roleOptions: RoleOption[],
  onPreview: (item: EmailTemplateItem) => void,
  onEdit: (item: EmailTemplateItem) => void,
  onDelete: (item: EmailTemplateItem) => void
): ColumnDef<EmailTemplateItem, any>[] => {
  const getRoleLabel = (role: SystemRole) => {
    const found = roleOptions.find((r) => r.value === role);
    return found ? found.label : role;
  };

  return [
    {
      id: 'name',
      header: 'TEMPLATE NAME',
      accessorKey: 'name',
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-zinc-900">
          {row.original.name}
        </span>
      ),
    },
    {
      id: 'subject',
      header: 'SUBJECT LINE',
      accessorKey: 'subject',
      cell: ({ row }) => (
        <span className="text-xs text-zinc-600 truncate max-w-[260px] block" title={row.original.subject}>
          {row.original.subject}
        </span>
      ),
    },
    {
      id: 'roles',
      header: 'TARGET ROLES',
      accessorFn: (row) => row.roles?.map((r) => getRoleLabel(r)).join(', ') || 'No roles',
      meta: {
        filterType: 'enum',
        filterOptions: roleOptions.map((r) => ({ label: r.label, value: r.value })),
      },
      cell: ({ row }) => {
        const roles = row.original.roles || [];
        if (roles.length === 0) {
          return <span className="text-xs text-zinc-400">No roles assigned</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {roles.slice(0, 2).map((r) => (
              <span
                key={r}
                className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-700"
              >
                {getRoleLabel(r)}
              </span>
            ))}
            {roles.length > 2 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700">
                +{roles.length - 2}
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: 'status',
      header: 'STATUS',
      accessorFn: (row) => row.isActive ? 'ACTIVE' : 'INACTIVE',
      meta: {
        filterType: 'enum',
        filterOptions: [
          { label: 'Active', value: 'ACTIVE' },
          { label: 'Inactive', value: 'INACTIVE' },
        ],
      },
      cell: ({ row }) => {
        const active = row.original.isActive;
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
              active
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-zinc-100 text-zinc-600 border-zinc-200'
            }`}
          >
            {active ? 'ACTIVE' : 'INACTIVE'}
          </span>
        );
      },
    },
    {
      id: 'updatedAt',
      header: 'LAST MODIFIED',
      accessorKey: 'updatedAt',
      cell: ({ row }) => (
        <span className="text-xs text-zinc-500">
          {new Date(row.original.updatedAt).toLocaleDateString()}
        </span>
      ),
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
            variant="ghost"
            size="sm"
            onClick={() => onPreview(row.original)}
            className="h-7 w-7 p-0 text-zinc-500 hover:text-emerald-700 hover:bg-emerald-50 rounded cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row.original)}
            className="h-7 w-7 p-0 text-zinc-500 hover:text-blue-700 hover:bg-blue-50 rounded cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(row.original)}
            className="h-7 w-7 p-0 text-zinc-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];
};
