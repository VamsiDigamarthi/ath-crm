import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMasterTaxpayers } from '../hooks/useMasterTaxpayers';
import { UnifiedTable } from '@/shared/components/table/UnifiedTable';
import { ClientNameCell, ClientEmailCell, ClientPhoneCell } from '@/shared/components/table/ClientContactCells';
import { exportTableToExcel } from '@/shared/utils/export-excel';
import { Button } from '@/shared/components/Button';
import type { ColumnDef } from '@tanstack/react-table';
import type { MasterTaxpayerRecord } from '../types/master-taxpayers.types';
import { SYSTEM_STAGES } from '@/shared/constants/system-enums';
import { Eye } from 'lucide-react';

export const AdminMasterTaxpayerDirectoryScreen: React.FC = () => {
  const navigate = useNavigate();

  const {
    records = [],
    totalItems,
    totalPages,
    page,
    setPage,
    limit,
    setLimit,
    searchQuery,
    setSearchQuery,
    isLoading,
  } = useMasterTaxpayers();

  const columns = useMemo<ColumnDef<MasterTaxpayerRecord, any>[]>(
    () => [
      {
        id: 'name',
        header: 'NAME',
        accessorFn: (row) => `${row.firstName} ${row.lastName}`.trim() || 'Taxpayer',
        cell: ({ row }) => (
          <ClientNameCell
            name={`${row.original.firstName} ${row.original.lastName}`.trim() || 'Taxpayer'}
          />
        ),
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
        id: 'source',
        header: 'SOURCE',
        accessorKey: 'acquisitionSource',
        meta: {
          filterType: 'enum',
          filterOptions: [
            { label: 'Direct Web Intake', value: 'DIRECT_WEB' },
            { label: 'Bulk Import', value: 'BULK_IMPORT' },
            { label: 'Self Signup', value: 'SELF_SIGNUP' },
            { label: 'Referral', value: 'REFERRAL' },
          ],
        },
        cell: ({ row }) => (
          <span className="text-xs text-zinc-700">
            {row.original.acquisitionSource?.replace(/_/g, ' ') || 'Direct'}
          </span>
        ),
      },
      {
        id: 'stage',
        header: 'STAGE',
        accessorKey: 'currentStage',
        meta: {
          filterType: 'enum',
          filterOptions: SYSTEM_STAGES,
        },
        cell: ({ row }) => (
          <span className="text-xs text-zinc-700">
            {row.original.currentStage?.replace(/_/g, ' ')}
          </span>
        ),
      },
      {
        id: 'lifecycle',
        header: 'STATUS',
        accessorKey: 'lifecycleStatus',
        meta: {
          filterType: 'enum',
          filterOptions: [
            { label: 'Prospect', value: 'PROSPECT' },
            { label: 'Active', value: 'ACTIVE' },
            { label: 'Converted', value: 'CONVERTED' },
            { label: 'Dropped', value: 'DROPPED' },
          ],
        },
        cell: ({ row }) => {
          const status = row.original.lifecycleStatus;
          const isConverted = status === 'CONVERTED';
          return (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                isConverted
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-zinc-100 text-zinc-600 border-zinc-200'
              }`}
            >
              {status?.replace(/_/g, ' ') || 'Active'}
            </span>
          );
        },
      },
      {
        id: 'team',
        header: 'ASSIGNED STAFF',
        accessorFn: (row) => row.assignedAgent?.name || 'Unassigned',
        cell: ({ row }) => (
          <span className="text-xs text-zinc-700">
            {row.original.assignedAgent?.name || 'Unassigned'}
          </span>
        ),
      },
      {
        id: 'taxYears',
        header: 'TAX YEARS',
        accessorFn: (row) => row.taxYears?.map((t) => t.year).join(', ') || '—',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.taxYears?.map((ty) => (
              <span
                key={ty.year}
                className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-700"
              >
                TY{ty.year}
              </span>
            ))}
          </div>
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
              onClick={() => navigate(`/admin/all-taxpayers/${row.original.customerId || row.original.id}`)}
              className="h-7 px-2 text-[11px] font-normal border-zinc-200 text-zinc-700 hover:bg-zinc-50 cursor-pointer"
            >
              <Eye className="w-3 h-3 text-zinc-500 mr-1" />
              <span>Inspect</span>
            </Button>
          </div>
        ),
      },
    ],
    [navigate]
  );

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Master Taxpayer Directory</h2>
          <p className="text-sm text-slate-500 mt-1">
            Global taxpayer ledger, cross-department lifecycle stages, multi-year returns, and SLA tracking.
          </p>
        </div>
      </div>

      <UnifiedTable<MasterTaxpayerRecord>
        data={records}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Search by name, email, phone, SSN..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        serverPagination={{
          currentPage: page,
          totalPages,
          totalEntries: totalItems,
          pageSize: limit,
          onPageChange: setPage,
          onPageSizeChange: setLimit,
        }}
        onExportExcel={() => {
          exportTableToExcel(
            records,
            [
              { header: 'Name', key: 'name', format: (r) => `${r.firstName} ${r.lastName}` },
              { header: 'Email', key: 'email' },
              { header: 'Source', key: 'acquisitionSource' },
              { header: 'Stage', key: 'currentStage' },
              { header: 'Status', key: 'lifecycleStatus' },
              { header: 'Assigned Staff', key: 'staff', format: (r) => r.assignedAgent?.name || 'Unassigned' },
            ],
            'master_taxpayers_directory'
          );
        }}
        onRowClick={(item) => navigate(`/admin/all-taxpayers/${item.customerId || item.id}`)}
        emptyText="No taxpayer records match your active search and filter criteria."
      />
    </div>
  );
};
