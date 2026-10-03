import React, { useMemo } from 'react';
import { UnifiedTable } from '@/shared/components/table/UnifiedTable';
import { exportTableToExcel } from '@/shared/utils/export-excel';
import { createEmailTemplateColumns } from '../columns/email-template-columns';
import { Button } from '@/shared/components/Button';
import { Plus } from 'lucide-react';
import type {
  EmailTemplateItem,
  RoleOption,
} from '../types/email-template.types';

interface EmailTemplateTableProps {
  templates: EmailTemplateItem[];
  roleOptions: RoleOption[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedRole: string;
  onRoleFilterChange: (val: string) => void;
  selectedStatus: string;
  onStatusFilterChange: (val: string) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (limit: number) => void;
  onOpenCreateModal: () => void;
  onPreviewTemplate: (template: EmailTemplateItem) => void;
  onEditTemplate: (template: EmailTemplateItem) => void;
  onDeleteTemplate: (template: EmailTemplateItem) => void;
  onRefresh: () => void;
}

export const EmailTemplateTable: React.FC<EmailTemplateTableProps> = ({
  templates,
  roleOptions,
  isLoading,
  onOpenCreateModal,
  onPreviewTemplate,
  onEditTemplate,
  onDeleteTemplate,
}) => {
  const columns = useMemo(
    () => createEmailTemplateColumns(roleOptions, onPreviewTemplate, onEditTemplate, onDeleteTemplate),
    [roleOptions, onPreviewTemplate, onEditTemplate, onDeleteTemplate]
  );

  const handleExport = () => {
    exportTableToExcel(
      templates,
      [
        { header: 'Template Name', key: 'name' },
        { header: 'Subject', key: 'subject' },
        { header: 'Roles', key: 'roles', format: (r) => r.roles?.join(', ') || 'No roles' },
        { header: 'Status', key: 'status', format: (r) => r.isActive ? 'ACTIVE' : 'INACTIVE' },
        { header: 'Last Modified', key: 'updatedAt', format: (r) => new Date(r.updatedAt).toLocaleDateString() },
      ],
      'email_templates_directory'
    );
  };

  return (
    <div className="space-y-4 font-sans">
      <div className="flex items-center justify-end">
        <Button
          onClick={onOpenCreateModal}
          className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-medium flex items-center gap-1.5 shadow-2xs cursor-pointer h-9 px-4"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Template</span>
        </Button>
      </div>

      <UnifiedTable<EmailTemplateItem>
        title="EMAIL NOTIFICATION TEMPLATES"
        subtitle="Configure and manage dynamic transactional and promotional email templates per role."
        data={templates}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Search templates by name, subject, or role..."
        onExportExcel={handleExport}
        onRowClick={onPreviewTemplate}
        emptyText="No email templates found matching your criteria."
      />
    </div>
  );
};
