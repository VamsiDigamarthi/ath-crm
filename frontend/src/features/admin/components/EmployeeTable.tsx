import React, { useMemo } from 'react';
import { UnifiedTable } from '@/shared/components/table/UnifiedTable';
import { Button } from '@/shared/components/Button';
import { AppTabs } from '@/shared/components/AppTabs';
import { UserPlus, Users, DollarSign, FileCheck, ShieldCheck, Calculator } from 'lucide-react';
import type { EmployeeItem, DepartmentType } from '../types/employee.types';
import { getEmployeeColumns } from '../columns/employee-columns';
import { exportTableToExcel } from '@/shared/utils/export-excel';

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

  const departmentTabs = useMemo(() => [
    { id: 'ALL' as DepartmentType, label: `All Staff (${totalEmployeesCount})`, icon: Users },
    { id: 'DOC' as DepartmentType, label: 'Documenters', icon: Users },
    { id: 'PREP_REVIEW' as DepartmentType, label: 'Tax Prep & Review', icon: Calculator },
    { id: 'SALES' as DepartmentType, label: 'Sales Team', icon: DollarSign },
    { id: 'FILE_OP' as DepartmentType, label: 'File Operators', icon: FileCheck },
    { id: 'ADMIN' as DepartmentType, label: 'Admins', icon: ShieldCheck },
  ], [totalEmployeesCount]);

  const handleExportExcel = () => {
    exportTableToExcel(
      employees,
      [
        { header: 'Employee Name', key: 'fullName' },
        { header: 'Email', key: 'email' },
        { header: 'Role', key: 'roleLabel' },
        { header: 'Department', key: 'department' },
        { header: 'Phone', key: 'mobile' },
        { header: 'Status', key: 'status', format: (e) => (e.isActive ? 'Active' : 'Inactive') },
      ],
      'employee_directory'
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Department Switcher Tabs */}
      <AppTabs
        tabs={departmentTabs}
        activeTab={activeDepartment}
        onChange={(dept) => onDepartmentChange(dept as DepartmentType)}
      />

      <UnifiedTable<EmployeeItem>
        columns={columns}
        data={employees}
        isLoading={isLoading}
        searchPlaceholder="Search by name, email, phone, designation..."
        searchValue={searchQuery}
        onSearchChange={onSearchChange}
        serverPagination={{
          currentPage,
          totalPages,
          totalEntries: totalItems,
          pageSize: itemsPerPage,
          onPageChange,
          onPageSizeChange: onPerPageChange,
        }}
        onExportExcel={handleExportExcel}
        extraHeaderActions={
          <Button
            type="button"
            size="sm"
            onClick={onOpenAddDrawer}
            className="h-8 px-3 text-xs font-medium bg-[#16A34A] hover:bg-[#15803D] text-white flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Staff Member</span>
          </Button>
        }
        emptyText="No staff members found matching active filters."
      />
    </div>
  );
};
