import React, { useMemo } from 'react';
import { UnifiedTable } from '@/shared/components/table/UnifiedTable';
import { TaxpayerCell } from '@/shared/components/table/TaxpayerCell';
import { exportTableToExcel } from '@/shared/utils/export-excel';
import { Button } from '@/shared/components/Button';
import { useNavigate } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import type { PrepStaffMember } from '../../types/prep-review.types';
import { ArrowRight } from 'lucide-react';

interface PrepStaffWorkloadTableProps {
  staff: PrepStaffMember[];
  isLoading?: boolean;
}

export const PrepStaffWorkloadTable: React.FC<PrepStaffWorkloadTableProps> = ({
  staff,
  isLoading = false,
}) => {
  const navigate = useNavigate();

  const nonManagerStaff = useMemo(
    () => staff.filter((s) => s.role !== 'PREP_MANAGER'),
    [staff]
  );

  const columns = useMemo<ColumnDef<PrepStaffMember, any>[]>(
    () => [
      {
        id: 'staff',
        header: 'SPECIALIST',
        accessorFn: (row) => `${row.name} ${row.email}`,
        cell: ({ row }) => (
          <TaxpayerCell
            name={row.original.name}
            email={row.original.email}
          />
        ),
      },
      {
        id: 'role',
        header: 'ROLE',
        accessorKey: 'role',
        cell: ({ row }) => {
          const isReviewer = row.original.role === 'TAX_REVIEWER';
          return (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                isReviewer
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {isReviewer ? 'Senior QA Reviewer' : 'Tax Preparer'}
            </span>
          );
        },
      },
      {
        id: 'caseload',
        header: 'ACTIVE CASELOAD',
        accessorKey: 'activeCaseload',
        cell: ({ row }) => (
          <span className="text-xs font-semibold text-zinc-900">
            {row.original.activeCaseload || 0} Files
          </span>
        ),
      },
      {
        id: 'completed',
        header: 'COMPLETED THIS MONTH',
        accessorKey: 'completedThisMonth',
        cell: ({ row }) => (
          <span className="text-xs font-semibold text-emerald-700">
            {row.original.completedThisMonth || 0} Completed
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
              onClick={() => navigate(`/prep-review/manager/queue?agent=${row.original.id}`)}
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
      nonManagerStaff,
      [
        { header: 'Specialist Name', key: 'name' },
        { header: 'Email', key: 'email' },
        { header: 'Role', key: 'role' },
        { header: 'Active Caseload', key: 'activeCaseload' },
        { header: 'Completed This Month', key: 'completedThisMonth' },
      ],
      'tax_prep_staff_workload'
    );
  };

  return (
    <div className="space-y-4 font-sans">
      <UnifiedTable<PrepStaffMember>
        title="TAX PREPARERS & QA AUDITORS WORKLOAD"
        subtitle="Monitor active calculation caseload, daily returns audited, and staff turnaround."
        data={nonManagerStaff}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Search specialists by name, email..."
        onExportExcel={handleExport}
        emptyText="No tax preparers or reviewers found."
      />
    </div>
  );
};
