import React from 'react';
import { useEmployeeManagement } from '../hooks/useEmployeeManagement';
import { EmployeeTable } from '../components/EmployeeTable';
import { AddEmployeeDrawer } from '../components/AddEmployeeDrawer';
import { BulkEmployeeImportModal } from '../components/BulkEmployeeImportModal';
import { AppConfirmDialog } from '@/shared/components/AppConfirmDialog';

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
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Team & Staff</h2>
          <p className="text-sm text-slate-500 mt-1">
            {stats.total} members · {stats.activeCount} active
          </p>
        </div>
      </div>

      {/* Directory */}
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
