import React from 'react';
import { AppTable, type ColumnDef } from '@/shared/components/AppTable';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
import { AppSelect } from '@/shared/components/AppSelect';
import { Button } from '@/shared/components/Button';
import {
  Mail,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
} from 'lucide-react';
import type {
  EmailTemplateItem,
  RoleOption,
  SystemRole,
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
  // Pagination
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (limit: number) => void;
  // Actions
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
  searchQuery,
  onSearchChange,
  selectedRole,
  onRoleFilterChange,
  selectedStatus,
  onStatusFilterChange,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onPerPageChange,
  onOpenCreateModal,
  onPreviewTemplate,
  onEditTemplate,
  onDeleteTemplate,
  onRefresh,
}) => {
  // Role lookup map
  const getRoleLabel = (role: SystemRole) => {
    const found = roleOptions.find((r) => r.value === role);
    return found ? found.label : role;
  };

  const roleFilterOptions = [
    { label: 'All Target Roles', value: '' },
    ...roleOptions.map((r) => ({ label: `${r.label} (${r.department})`, value: r.value })),
  ];

  const statusFilterOptions = [
    { label: 'All Statuses', value: 'ALL' },
    { label: 'Active Only', value: 'ACTIVE' },
    { label: 'Inactive Only', value: 'INACTIVE' },
  ];

  // Table Column Definitions
  const columns: ColumnDef<EmailTemplateItem>[] = [
    {
      header: 'Template Name',
      accessorKey: 'name',
      render: (item) => (
        <div className="flex items-center gap-3 min-w-[200px]">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#16A34A] shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                {item.name}
              </span>
              {item.isActive ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-slate-300" title="Inactive" />
              )}
            </div>
            <span className="text-[11px] text-slate-400 block truncate">
              ID: {item.id.slice(0, 8)}...
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Target Roles',
      render: (item) => {
        const roles = item.roles || [];
        if (roles.length === 0) {
          return <span className="text-xs text-slate-400 italic">No roles assigned</span>;
        }

        const visibleRoles = roles.slice(0, 2);
        const remainingCount = roles.length - 2;

        return (
          <div className="flex flex-wrap items-center gap-1 min-w-[180px]">
            {visibleRoles.map((r) => (
              <span
                key={r}
                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200"
              >
                {getRoleLabel(r)}
              </span>
            ))}
            {remainingCount > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                +{remainingCount} more
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Subject Line',
      accessorKey: 'subject',
      render: (item) => (
        <div className="max-w-[280px] min-w-[180px]">
          <span className="text-xs text-slate-700 font-medium line-clamp-1" title={item.subject}>
            {item.subject}
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'isActive',
      render: (item) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border inline-flex items-center gap-1 ${
            item.isActive
              ? 'bg-emerald-50 text-[#16A34A] border-emerald-200'
              : 'bg-slate-100 text-slate-500 border-slate-200'
          }`}
        >
          {item.isActive ? (
            <>
              <CheckCircle2 className="w-3 h-3" /> Active
            </>
          ) : (
            <>
              <XCircle className="w-3 h-3" /> Inactive
            </>
          )}
        </span>
      ),
    },
    {
      header: 'Last Modified',
      render: (item) => (
        <span className="text-xs text-slate-500 whitespace-nowrap">
          {new Date(item.updatedAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPreviewTemplate(item)}
            title="Preview Template"
            className="h-7 w-7 p-0 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditTemplate(item)}
            title="Edit Template"
            className="h-7 w-7 p-0 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeleteTemplate(item)}
            title="Delete Template"
            className="h-7 w-7 p-0 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 font-sans">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex-1 max-w-sm">
          <AppSearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search templates by name or subject..."
            className="w-full"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <div className="w-48">
            <AppSelect
              options={roleFilterOptions}
              value={selectedRole}
              onChange={onRoleFilterChange}
              placeholder="Filter by Role"
            />
          </div>

          {/* Status Filter */}
          <div className="w-36">
            <AppSelect
              options={statusFilterOptions}
              value={selectedStatus}
              onChange={onStatusFilterChange}
              placeholder="All Status"
            />
          </div>

          {/* Refresh button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            title="Refresh Table"
            className="border-slate-200 text-slate-600 hover:bg-slate-50 text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          {/* New Template Primary Action */}
          <Button
            size="sm"
            onClick={onOpenCreateModal}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Template</span>
          </Button>
        </div>
      </div>

      {/* Main Table Layout */}
      <AppTable<EmailTemplateItem>
        columns={columns}
        data={templates}
        isLoading={isLoading}
        skeletonRows={5}
        emptyText="No email templates found. Click 'New Template' above to create one."
        pagination={{
          currentPage,
          totalPages,
          totalItems,
          itemsPerPage,
          perPageOptions: [5, 10, 25, 50],
          onPageChange,
          onPerPageChange,
        }}
      />
    </div>
  );
};
