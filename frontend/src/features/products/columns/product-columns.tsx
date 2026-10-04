import type { ColumnDef } from '@tanstack/react-table';
import { Edit3, Power } from 'lucide-react';
import type { ProductItem } from '../types/product.types';
import { taxLabel, unitLabel } from '../types/product.types';

interface ProductColumnActions {
  onEdit: (item: ProductItem) => void;
  onToggleStatus: (item: ProductItem) => void;
}

const formatPrice = (value: number) =>
  `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const getProductColumns = ({ onEdit, onToggleStatus }: ProductColumnActions): ColumnDef<ProductItem, unknown>[] => [
  {
    id: 'name',
    header: 'Item',
    accessorFn: (row) => `${row.name} ${row.description || ''}`,
    cell: ({ row }) => (
      <div className="min-w-0 max-w-[320px]">
        <div className="text-sm font-semibold text-slate-900 truncate">{row.original.name}</div>
        {row.original.description && (
          <div className="text-xs text-slate-500 truncate" title={row.original.description}>
            {row.original.description}
          </div>
        )}
      </div>
    ),
  },
  {
    id: 'price',
    header: 'Price',
    accessorKey: 'price',
    cell: ({ row }) => <span className="text-sm font-medium text-slate-900">{formatPrice(row.original.price)}</span>,
  },
  {
    id: 'unit',
    header: 'Unit',
    accessorKey: 'unit',
    cell: ({ row }) => <span className="text-sm text-slate-600">{unitLabel(row.original.unit)}</span>,
  },
  {
    id: 'tax',
    header: 'Tax',
    accessorKey: 'taxType',
    cell: ({ row }) => <span className="text-sm text-slate-600">{taxLabel(row.original.taxType, row.original.taxRate)}</span>,
  },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
    cell: ({ row }) => {
      const active = row.original.status === 'ACTIVE';
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
            active ? 'bg-emerald-50 text-[#15803D]' : 'bg-slate-100 text-slate-500'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-[#16A34A]' : 'bg-slate-400'}`} />
          {active ? 'Active' : 'Inactive'}
        </span>
      );
    },
  },
  {
    id: 'actions',
    header: '',
    enableSorting: false,
    enableHiding: false,
    meta: { disableMenu: true, disableFilter: true },
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => onEdit(row.original)}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
          title="Edit"
        >
          <Edit3 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onToggleStatus(row.original)}
          className={`p-2 rounded-lg cursor-pointer ${
            row.original.status === 'ACTIVE'
              ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
              : 'text-[#16A34A] hover:bg-emerald-50'
          }`}
          title={row.original.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        >
          <Power className="w-4 h-4" />
        </button>
      </div>
    ),
  },
];
