import React, { useMemo } from 'react';
import { UnifiedTable } from '@/shared/components/table/UnifiedTable';
import { TaxpayerCell } from '@/shared/components/table/TaxpayerCell';
import { exportTableToExcel } from '@/shared/utils/export-excel';
import { Button } from '@/shared/components/Button';
import { useNavigate } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import type { SalesRepItem } from '../../types/sales.types';
import { ArrowRight } from 'lucide-react';

interface SalesClosersWorkloadTableProps {
  salesReps: SalesRepItem[];
  totalDepartmentLeads?: number;
  isLoading?: boolean;
}

export const SalesClosersWorkloadTable: React.FC<SalesClosersWorkloadTableProps> = ({
  salesReps,
  isLoading = false,
}) => {
  const navigate = useNavigate();

  const columns = useMemo<ColumnDef<SalesRepItem, any>[]>(
    () => [
      {
        id: 'rep',
        header: 'SALES CLOSER',
        accessorFn: (row) => `${row.name} ${row.email}`,
        cell: ({ row }) => (
          <TaxpayerCell
            name={row.original.name}
            email={row.original.email}
          />
        ),
      },
      {
        id: 'tier',
        header: 'TIER',
        accessorFn: (row) => row.dealsClosedToday >= 4 ? 'STAR CLOSER' : 'SALES CLOSER',
        cell: ({ row }) => {
          const isStar = row.original.dealsClosedToday >= 4;
          return (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                isStar
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {isStar ? 'Star Closer' : 'Sales Closer'}
            </span>
          );
        },
      },
      {
        id: 'caseload',
        header: 'ACTIVE PIPELINE',
        accessorKey: 'activeLeads',
        cell: ({ row }) => (
          <span className="text-xs font-semibold text-zinc-900">
            {row.original.activeLeads || 0} Leads
          </span>
        ),
      },
      {
        id: 'dials',
        header: 'PITCHES TODAY',
        accessorKey: 'pitchesCompletedToday',
        cell: ({ row }) => (
          <span className="text-xs text-zinc-700">
            {row.original.pitchesCompletedToday || 0} Pitches
          </span>
        ),
      },
      {
        id: 'deals',
        header: 'DEALS CLOSED',
        accessorKey: 'dealsClosedToday',
        cell: ({ row }) => (
          <span className="text-xs font-semibold text-emerald-700">
            {row.original.dealsClosedToday || 0} Paid Returns
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
              variant="outline"
              onClick={() => navigate(`/sales/manager/queue?agent=${row.original.id}`)}
              className="h-7 px-2.5 text-[11px] font-normal border-zinc-200 text-zinc-700 hover:bg-zinc-50 cursor-pointer flex items-center gap-1"
            >
              <span>View Queue</span>
              <ArrowRight className="w-3 h-3 text-zinc-400" />
            </Button>
          </div>
        ),
      },
    ],
    [navigate]
  );

  const handleExport = () => {
    exportTableToExcel(
      salesReps,
      [
        { header: 'Closer Name', key: 'name' },
        { header: 'Email', key: 'email' },
        { header: 'Active Pipeline', key: 'activeLeads' },
        { header: 'Pitches Today', key: 'pitchesCompletedToday' },
        { header: 'Deals Closed', key: 'dealsClosedToday' },
      ],
      'sales_closers_workload'
    );
  };

  return (
    <div className="space-y-4 font-sans">
      <UnifiedTable<SalesRepItem>
        data={salesReps}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Search closers by name, email..."
        onExportExcel={handleExport}
        emptyText="No sales closers found."
      />
    </div>
  );
};
