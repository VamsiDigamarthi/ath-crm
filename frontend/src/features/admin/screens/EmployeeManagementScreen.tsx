import React from 'react';
import { useEmployeeManagement } from '../hooks/useEmployeeManagement';
import { EmployeeStatsCards } from '../components/EmployeeStatsCards';
import { EmployeeTable } from '../components/EmployeeTable';
import { AddEmployeeDrawer } from '../components/AddEmployeeDrawer';
import { BulkEmployeeImportModal } from '../components/BulkEmployeeImportModal';
import { AppConfirmDialog } from '@/shared/components/AppConfirmDialog';
import { Users, UserPlus } from 'lucide-react';
import { Button } from '@/shared/components/Button';

export const EmployeeManagementScreen: React.FC = () => {
  const {
    filteredEmployees,
    stats,
    isLoading,
    searchQuery,
    setSearchQuery,
    activeDepartment,
    setActiveDepartment,
    // Pagination
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    totalItems,
    // Drawers & Modals
    isDrawerOpen,
    setIsDrawerOpen,
    editingEmployee,
    isBulkModalOpen,
    setIsBulkModalOpen,
    confirmDialog,
    setConfirmDialog,
    handleOpenAddDrawer,
    handleOpenEditDrawer,
    handleSaveEmployee,
    handleToggleStatus,
    handleBulkOnboardSuccess,
  } = useEmployeeManagement();

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-[#16A34A] to-emerald-700 p-6 sm:p-7 text-white border border-emerald-600 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-950 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 mb-3">
              <Users className="w-3.5 h-3.5 text-[#16A34A]" />
              Human Resources & Access Governance
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Staff & Team Directory
            </h2>
            <p className="text-xs sm:text-sm text-emerald-50 mt-1.5 leading-relaxed">
              Manage employee credentials, department roles, and active operational status across Documenters, Sales Executives, and CPA File Operators.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleOpenAddDrawer}
              className="bg-white/10 hover:bg-white/20 border-white/30 text-white shadow-sm text-xs font-semibold"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Quick Add Staff
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <EmployeeStatsCards stats={stats} />

      {/* Directory Table with Pagination */}
      <EmployeeTable
        employees={filteredEmployees}
        totalEmployeesCount={stats.total}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeDepartment={activeDepartment}
        onDepartmentChange={setActiveDepartment}
        onOpenAddDrawer={handleOpenAddDrawer}
        onOpenBulkModal={() => setIsBulkModalOpen(true)}
        onEditEmployee={handleOpenEditDrawer}
        onToggleStatus={handleToggleStatus}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onPerPageChange={setItemsPerPage}
        isLoading={isLoading}
      />

      {/* Add / Edit Staff Drawer */}
      <AddEmployeeDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleSaveEmployee}
        employee={editingEmployee}
      />

      {/* Bulk Staff Onboarding Modal */}
      <BulkEmployeeImportModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={handleBulkOnboardSuccess}
      />

      {/* Reusable Confirm Dialog for Status Activation / Deactivation */}
      <AppConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((c) => ({ ...c, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel={confirmDialog.confirmLabel}
        variant={confirmDialog.variant}
      />
    </div>
  );
};
