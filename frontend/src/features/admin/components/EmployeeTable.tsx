import React, { useMemo } from 'react';
import { AppTable } from '@/shared/components/AppTable';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
import { Button } from '@/shared/components/Button';
import { UserPlus, Users, DollarSign, FileCheck, ShieldCheck } from 'lucide-react';
import type { EmployeeItem, DepartmentType } from '../types/employee.types';
import { getEmployeeColumns } from '../columns/employee-columns';

interface EmployeeTableProps {
  employees: EmployeeItem[];
  totalEmployeesCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeDepartment: DepartmentType;
  onDepartmentChange: (dept: DepartmentType) => void;
  onOpenAddDrawer: () => void;
  onOpenBulkModal?: () => void;
  onEditEmployee: (employee: EmployeeItem) => void;
  onToggleStatus: (employee: EmployeeItem) => void;
  // Pagination
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  isLoading?: boolean;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  totalEmployeesCount,
  searchQuery,
  onSearchChange,
  activeDepartment,
  onDepartmentChange,
  onOpenAddDrawer,
  onOpenBulkModal: _onOpenBulkModal,
  onEditEmployee,
  onToggleStatus,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onPerPageChange,
  isLoading = false,
}) => {
  const columns = useMemo(
    () =>
      getEmployeeColumns({
        onEdit: onEditEmployee,
        onToggleStatus,
      }),
    [onEditEmployee, onToggleStatus]
  );

  return (
    <div className="space-y-4">
      {/* Search & Actions Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        {/* Left: Search & Department Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="w-full sm:w-72">
            <AppSearchInput
              value={searchQuery}
              onChange={onSearchChange}
              placeholder="Search by name, email, phone, role..."
            />
          </div>

          {/* Department Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
            <button
              type="button"
              onClick={() => onDepartmentChange('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeDepartment === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Staff ({totalEmployeesCount})
            </button>

            <button
              type="button"
              onClick={() => onDepartmentChange('DOC')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeDepartment === 'DOC'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Documenters
            </button>

            <button
              type="button"
              onClick={() => onDepartmentChange('SALES')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeDepartment === 'SALES'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              Sales Team
            </button>

            <button
              type="button"
              onClick={() => onDepartmentChange('FILE_OP')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeDepartment === 'FILE_OP'
                  ? 'bg-white text-[#16A34A] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              File Operators
            </button>

            <button
              type="button"
              onClick={() => onDepartmentChange('ADMIN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeDepartment === 'ADMIN'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admins
            </button>
          </div>
        </div>

        {/* Right: Add Staff Action Button */}
        <div className="flex items-center gap-3 justify-end">
          {/* <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onOpenBulkModal}
            className="border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <UploadCloud className="w-4 h-4 mr-2 text-slate-500" />
            Bulk Onboard Staff
          </Button> */}

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onOpenAddDrawer}
            className="px-5 shadow-sm"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Staff Member
          </Button>
        </div>
      </div>

      {/* Directory Table with Built-in Server Pagination */}
      <AppTable<EmployeeItem>
        title="Staff & Team Member Directory"
        description="Manage active operational personnel, department assignments, and login permissions."
        columns={columns}
        data={employees}
        isLoading={isLoading}
        selectable={false}
        searchable={false}
        density="comfortable"
        striped
        rowClassName={(row) =>
          !row.isActive
            ? 'opacity-60 bg-slate-100/80 hover:opacity-90 transition-opacity'
            : undefined
        }
        pagination={{
          currentPage,
          totalPages,
          totalItems,
          itemsPerPage,
          onPageChange,
          onPerPageChange,
          perPageOptions: [5, 10, 20, 50],
          activeBg: 'bg-[#16A34A]',
          activeText: 'text-white font-bold',
        }}
        emptyText="No staff members found matching active filters."
      />
    </div>
  );
};
