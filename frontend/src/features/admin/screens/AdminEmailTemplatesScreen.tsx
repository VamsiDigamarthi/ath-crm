import React from 'react';
import { useEmailTemplates } from '../hooks/useEmailTemplates';
import { EmailTemplateTable } from '../components/EmailTemplateTable';
import { EmailTemplateModal } from '../components/EmailTemplateModal';
import { EmailTemplatePreviewModal } from '../components/EmailTemplatePreviewModal';
import { AppConfirmDialog } from '@/shared/components/AppConfirmDialog';
import { Button } from '@/shared/components/Button';
import { Mail, Plus, CheckCircle2, Users, Sparkles } from 'lucide-react';

export const AdminEmailTemplatesScreen: React.FC = () => {
  const {
    templates,
    roleOptions,
    stats,
    isLoading,
    isSaving,
    searchQuery,
    selectedRole,
    selectedStatus,
    handleSearchChange,
    handleRoleFilterChange,
    handleStatusFilterChange,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    handlePageChange,
    handlePerPageChange,
    isFormModalOpen,
    setIsFormModalOpen,
    editingTemplate,
    isPreviewModalOpen,
    setIsPreviewModalOpen,
    previewTemplate,
    confirmDialog,
    setConfirmDialog,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleOpenPreviewModal,
    handleSaveTemplate,
    handleDeleteTemplate,
    fetchTemplates,
  } = useEmailTemplates();

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      {/* 1. Header Banner & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Email Templates &amp; Communications
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#16A34A]" /> Template Hub
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Create, customize, and manage email notification templates targeted to specific department roles and taxpayer lifecycles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleOpenCreateModal}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Email Template</span>
          </Button>
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#16A34A] shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 block">Total Templates</span>
            <span className="text-lg font-bold text-slate-900">{totalItems}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#16A34A] shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 block">Active Status</span>
            <span className="text-lg font-bold text-slate-900">{stats.active}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 block">Targetable Roles in DB</span>
            <span className="text-lg font-bold text-slate-900">{stats.rolesCount}</span>
          </div>
        </div>
      </div>

      {/* 3. Directory Table with Filters & Pagination */}
      <EmailTemplateTable
        templates={templates}
        roleOptions={roleOptions}
        isLoading={isLoading}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedRole={selectedRole}
        onRoleFilterChange={handleRoleFilterChange}
        selectedStatus={selectedStatus}
        onStatusFilterChange={handleStatusFilterChange}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onPerPageChange={handlePerPageChange}
        onOpenCreateModal={handleOpenCreateModal}
        onPreviewTemplate={handleOpenPreviewModal}
        onEditTemplate={handleOpenEditModal}
        onDeleteTemplate={handleDeleteTemplate}
        onRefresh={fetchTemplates}
      />

      {/* 4. Add / Edit Template Modal */}
      <EmailTemplateModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveTemplate}
        template={editingTemplate}
        roleOptions={roleOptions}
        isSubmitting={isSaving}
      />

      {/* 5. Preview Modal */}
      <EmailTemplatePreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        template={previewTemplate}
        onEdit={handleOpenEditModal}
        roleOptions={roleOptions}
      />

      {/* 6. Reusable AppConfirmDialog for Deletion */}
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
