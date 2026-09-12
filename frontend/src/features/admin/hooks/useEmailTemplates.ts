import { useState, useEffect, useCallback } from 'react';
import { emailTemplateService } from '../services/email-template-service';
import type {
  EmailTemplateItem,
  EmailTemplateFormData,
  RoleOption,
} from '../types/email-template.types';
import toast from 'react-hot-toast';

export const useEmailTemplates = () => {
  const [templates, setTemplates] = useState<EmailTemplateItem[]>([]);
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Modals & Drawers
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplateItem | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplateItem | null>(null);

  // Confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: async () => {},
  });

  // Fetch all roles from database
  const fetchRoles = useCallback(async () => {
    try {
      const res = await emailTemplateService.getRoles();
      if (res && res.data && Array.isArray(res.data)) {
        setRoleOptions(res.data);
      }
    } catch {
      console.error('Failed to load system roles for email templates');
    }
  }, []);

  // Fetch templates with active parameters
  const fetchTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await emailTemplateService.getTemplates({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery || undefined,
        role: selectedRole || undefined,
        status: selectedStatus as 'ALL' | 'ACTIVE' | 'INACTIVE',
      });

      if (res && res.data && Array.isArray(res.data)) {
        setTemplates(res.data);
      } else {
        setTemplates([]);
      }

      if (res && res.meta) {
        setTotalPages(res.meta.totalPages || 1);
        setTotalItems(res.meta.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      toast.error('Failed to fetch email templates from server');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery, selectedRole, selectedStatus]);

  // Initial load
  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Handlers
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleRoleFilterChange = (val: string) => {
    setSelectedRole(val);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (val: string) => {
    setSelectedStatus(val);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePerPageChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingTemplate(null);
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (template: EmailTemplateItem) => {
    setEditingTemplate(template);
    setIsFormModalOpen(true);
  };

  // Open Preview Modal
  const handleOpenPreviewModal = (template: EmailTemplateItem) => {
    setPreviewTemplate(template);
    setIsPreviewModalOpen(true);
  };

  // Save (Create or Update)
  const handleSaveTemplate = async (data: EmailTemplateFormData) => {
    try {
      setIsSaving(true);
      if (editingTemplate) {
        await emailTemplateService.updateTemplate(editingTemplate.id, data);
        toast.success(`Template "${data.name}" updated successfully!`);
      } else {
        await emailTemplateService.createTemplate(data);
        toast.success(`Template "${data.name}" created successfully!`);
      }
      setIsFormModalOpen(false);
      setEditingTemplate(null);
      await fetchTemplates();
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to save email template';
      toast.error(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Template Confirmation
  const handleDeleteTemplate = (template: EmailTemplateItem) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Email Template',
      description: `Are you sure you want to delete template "${template.name}"? This action cannot be undone and automated systems using this template will stop dispatching.`,
      confirmLabel: 'Delete Template',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await emailTemplateService.deleteTemplate(template.id);
          toast.success(`Template "${template.name}" deleted.`);
          setConfirmDialog((c) => ({ ...c, isOpen: false }));
          await fetchTemplates();
        } catch {
          toast.error('Failed to delete email template');
        }
      },
    });
  };

  // Stats computation
  const stats = {
    total: totalItems,
    active: (templates || []).filter((t) => t?.isActive).length,
    rolesCount: (roleOptions || []).length,
  };

  return {
    templates: templates || [],
    roleOptions: roleOptions || [],
    stats,
    isLoading,
    isSaving,
    // Filters
    searchQuery,
    selectedRole,
    selectedStatus,
    handleSearchChange,
    handleRoleFilterChange,
    handleStatusFilterChange,
    // Pagination
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    handlePageChange,
    handlePerPageChange,
    // Modals
    isFormModalOpen,
    setIsFormModalOpen,
    editingTemplate,
    isPreviewModalOpen,
    setIsPreviewModalOpen,
    previewTemplate,
    confirmDialog,
    setConfirmDialog,
    // Action handlers
    handleOpenCreateModal,
    handleOpenEditModal,
    handleOpenPreviewModal,
    handleSaveTemplate,
    handleDeleteTemplate,
    fetchTemplates,
  };
};
