import type { ColumnDef } from '@tanstack/react-table';
import type { CustomerFilingItem } from '../services/customer-api';
import { Button } from '@/shared/components/Button';
import { Eye } from 'lucide-react';

export const createCustomerFilingColumns = (
  onView: (item: CustomerFilingItem) => void
): ColumnDef<CustomerFilingItem, any>[] => [
  {
    id: 'taxYear',
    header: 'TAX YEAR',
    accessorKey: 'taxYear',
    cell: ({ row }) => (
      <span className="font-semibold text-xs text-zinc-900">
        TY{row.original.taxYear}
      </span>
    ),
  },
  {
    id: 'filingType',
    header: 'TYPE',
    accessorKey: 'filingType',
    meta: {
      filterType: 'enum',
      filterOptions: [
        { label: 'Individual', value: 'INDIVIDUAL' },
        { label: 'Business', value: 'BUSINESS' },
      ],
    },
    cell: ({ row }) => (
      <span className="text-xs text-zinc-700">
        {row.original.filingType === 'BUSINESS' ? 'Business' : 'Individual'}
      </span>
    ),
  },
  {
    id: 'stage',
    header: 'STAGE',
    accessorKey: 'currentStage',
    meta: {
      filterType: 'enum',
      filterOptions: [
        { label: 'IRS Accepted', value: 'FILING_SUCCESS' },
        { label: 'Doc Outreach', value: 'DOC_OUTREACH' },
        { label: 'In Tax Prep', value: 'DOC_PREP' },
        { label: 'QA Review', value: 'QA_REVIEW' },
        { label: 'Sales Pitching', value: 'SALES_PITCHING' },
        { label: 'Filing Queue', value: 'FILING_QUEUE' },
      ],
    },
    cell: ({ row }) => {
      const isCompleted = row.original.isCompleted;
      const stage = row.original.currentStage;
      if (isCompleted || stage === 'FILING_SUCCESS') {
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            IRS Accepted
          </span>
        );
      }
      return (
        <span className="text-xs text-zinc-700">
          {stage.replace(/_/g, ' ')}
        </span>
      );
    },
  },
  {
    id: 'refund',
    header: 'ESTIMATED REFUND',
    accessorFn: (row) => row.totalRefund ? `$${row.totalRefund}` : '$0',
    cell: ({ row }) => (
      <span className="text-xs font-semibold text-emerald-700">
        ${(row.original.totalRefund || 0).toLocaleString()}
      </span>
    ),
  },
  {
    id: 'due',
    header: 'DUE AMOUNT',
    accessorFn: (row) => row.totalBalanceDue ? `$${row.totalBalanceDue}` : '$0',
    cell: ({ row }) => (
      <span className="text-xs font-semibold text-zinc-700">
        ${(row.original.totalBalanceDue || 0).toLocaleString()}
      </span>
    ),
  },
  {
    id: 'documents',
    header: 'DOCUMENTS',
    accessorKey: 'documentsCount',
    cell: ({ row }) => (
      <span className="text-xs text-zinc-600">
        {row.original.documentsCount || 0} Files
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
      <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
        <Button
          size="sm"
          onClick={() => onView(row.original)}
          className="h-7 px-2.5 text-[11px] font-medium bg-[#16A34A] hover:bg-[#15803D] text-white shadow-2xs cursor-pointer"
        >
          <Eye className="w-3 h-3 mr-1" />
          <span>View</span>
        </Button>
      </div>
    ),
  },
];
