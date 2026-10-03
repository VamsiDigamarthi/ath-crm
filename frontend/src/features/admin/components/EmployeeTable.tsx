import React, { useMemo } from 'react';
import { AppTable } from '@/shared/components/AppTable';
import { AppTabs } from '@/shared/components/AppTabs';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
import type { EmployeeItem, EmployeeStats, DepartmentType } from '../types/employee.types';
import { getEmployeeColumns } from '../columns/employee-columns';

interface EmployeeTableProps {
  employees: EmployeeItem[];
  stats: EmployeeStats;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeDepartment: DepartmentType;
  onDepartmentChange: (dept: DepartmentType) => void;
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
  stats,
  searchQuery,
  onSearchChange,
  activeDepartment,
  onDepartmentChange,
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
    () => getEmployeeColumns({ onEdit: onEditEmployee, onToggleStatus }),
    [onEditEmployee, onToggleStatus]
  );

  const tabs = [
    { id: 'ALL', label: 'All', count: stats.total },
    { id: 'DOC', label: 'Documenter', count: stats.documenters },
    { id: 'PREP_REVIEW', label: 'Tax Prep & Review', count: stats.prepReview || 0 },
    { id: 'SALES', label: 'Sales', count: stats.sales },
    { id: 'FILE_OP', label: 'Filing', count: stats.fileOperators },
    { id: 'ADMIN', label: 'Admins', count: stats.admins },
  ];

  return (
    <div className="space-y-4">
      {/* Department Tabs & Search */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
        <AppTabs
          tabs={tabs}
          activeTab={activeDepartment}
          onChange={(id) => onDepartmentChange(id as DepartmentType)}
          size="sm"
          className="flex-1"
        />
        <div className="w-full lg:w-72 lg:pb-1.5">
          <AppSearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search name, email, phone..."
          />
        </div>
      </div>

      <AppTable<EmployeeItem>
        columns={columns}
        data={employees}
        isLoading={isLoading}
        selectable={false}
        searchable={false}
        density="comfortable"
        rowClassName={(row) => (!row.isActive ? 'opacity-60' : undefined)}
        pagination={{
          currentPage,
          totalPages,
          totalItems,
          itemsPerPage,
          onPageChange,
          onPerPageChange,
          perPageOptions: [5, 10, 20, 50],
        }}
        emptyText="No staff members found."
      />
    </div>
  );
};
