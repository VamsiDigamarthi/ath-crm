import type { ColumnDef } from '@tanstack/react-table';
import { ClientNameCell, ClientEmailCell, ClientPhoneCell } from '@/shared/components/table/ClientContactCells';
import type { ParsedLeadRow } from '../types/bulk-import.types';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export const getBulkImportColumns = (): ColumnDef<ParsedLeadRow, any>[] => [
  {
    id: 'name',
    header: 'NAME',
    accessorFn: (row) => row.fullName || `${row.firstName || ''} ${row.lastName || ''}`.trim() || 'Taxpayer',
    cell: ({ row }) => {
      const displayName = row.original.fullName || `${row.original.firstName || ''} ${row.original.lastName || ''}`.trim() || 'Taxpayer';
      return <ClientNameCell name={displayName} />;
    },
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
    accessorKey: 'phone',
    cell: ({ row }) => <ClientPhoneCell phone={row.original.phone} />,
  },
  {
    id: 'rowNumber',
    header: 'ROW #',
    accessorKey: 'rowNumber',
    cell: ({ row }) => (
      <span className="font-mono text-xs text-zinc-500">
        #{row.original.rowNumber}
      </span>
    ),
  },
  {
    id: 'status',
    header: 'VALIDATION STATUS',
    accessorFn: (row) => row.validationStatus === 'VALID' ? 'Valid' : 'Invalid',
    meta: {
      filterType: 'enum',
      filterOptions: [
        { label: 'Valid', value: 'VALID' },
        { label: 'Invalid', value: 'INVALID' },
      ],
    },
    cell: ({ row }) => {
      const isValid = row.original.validationStatus === 'VALID';
      return isValid ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Valid
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
          <AlertCircle className="w-3 h-3 text-rose-600" />
          {row.original.validationMessage || 'Error'}
        </span>
      );
    },
  },
];
