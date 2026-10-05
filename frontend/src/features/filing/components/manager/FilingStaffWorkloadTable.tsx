import React, { useMemo } from 'react';
import { UnifiedTable } from '@/shared/components/table/UnifiedTable';
import { TaxpayerCell } from '@/shared/components/table/TaxpayerCell';
import { exportTableToExcel } from '@/shared/utils/export-excel';
import { Button } from '@/shared/components/Button';
import { useNavigate } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import type { FilingStaffMember } from '../../types/filing.types';
import { ArrowRight } from 'lucide-react';

interface FilingStaffWorkloadTableProps {
  staffList: FilingStaffMember[];
  totalDepartmentLeads?: number;
  isLoading?: boolean;
}

export const FilingStaffWorkloadTable: React.FC<FilingStaffWorkloadTableProps> = ({
  staffList,
  isLoading = false,
}) => {
  const navigate = useNavigate();

  const columns = useMemo<ColumnDef<FilingStaffMember, any>[]>(
    () => [
      {
        id: 'staff',
        header: 'CPA FILING SPECIALIST',
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
        header: 'STATUS',
        accessorFn: (row) => row.acceptedCount >= 1 ? 'VERIFIED CPA FILER' : 'FILING SPECIALIST',
        cell: ({ row }) => {
          const isVerified = row.original.acceptedCount >= 1;
          return (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                isVerified
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}
            >
              {isVerified ? 'Verified CPA Filer' : 'Filing Specialist'}
            </span>
          );
        },
      },
      {
        id: 'caseload',
        header: 'ACTIVE TRANSMISSIONS',
        accessorKey: 'activeCaseload',
        cell: ({ row }) => (
          <span className="text-xs font-semibold text-zinc-900">
            {row.original.activeCaseload || 0} Returns
          </span>
        ),
      },
      {
        id: 'filed',
        header: 'TRANSMITTED TODAY',
        accessorKey: 'transmissionsCompletedToday',
        cell: ({ row }) => (
          <span className="text-xs text-zinc-700">
            {row.original.transmissionsCompletedToday || 0} E-Filed
          </span>
        ),
      },
      {
        id: 'accepted',
        header: 'IRS ACCEPTED',
        accessorKey: 'acceptedCount',
        cell: ({ row }) => (
          <span className="text-xs font-semibold text-emerald-700">
            {row.original.acceptedCount || 0} Accepted
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
              onClick={() => navigate(`/filing/manager/queue?agent=${row.original.id}`)}
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
      staffList,
      [
        { header: 'Specialist Name', key: 'name' },
        { header: 'Email', key: 'email' },
        { header: 'Active Transmissions', key: 'activeCaseload' },
        { header: 'Transmitted Today', key: 'transmissionsCompletedToday' },
        { header: 'IRS Accepted', key: 'acceptedCount' },
      ],
      'filing_staff_workload'
    );
  };

  return (
    <div className="space-y-4 font-sans">
      <UnifiedTable<FilingStaffMember>
        data={staffList}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Search specialists by name, email..."
        onExportExcel={handleExport}
        emptyText="No filing specialists found."
      />
    </div>
  );
};
