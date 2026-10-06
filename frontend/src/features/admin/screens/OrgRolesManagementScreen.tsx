import React, { useState, useEffect, useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import {
  ShieldCheck,
  Plus,
  Users,
  LayoutGrid,
  Trash2,
  Edit2,
  Lock,
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppEmptyState } from '@/shared/components/AppEmptyState';
import { AppConfirmDialog } from '@/shared/components/AppConfirmDialog';
import { UnifiedTable } from '@/shared/components/table/UnifiedTable';
import { exportTableToExcel } from '@/shared/utils/export-excel';
import { RoleDrawer } from '../components/RoleDrawer';
import {
  orgRoleService,
  type OrgRoleDto,
  type CreateOrgRolePayload,
} from '../services/org-role-service';
import { MASTER_SIDEBAR_CATALOG } from '@/shared/constants/sidebar-catalog';
import toast from 'react-hot-toast';

export const OrgRolesManagementScreen: React.FC = () => {
  const [roles, setRoles] = useState<OrgRoleDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeDepartment, setActiveDepartment] = useState<string>('ALL');

  // Drawer & Dialog State
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [editingRole, setEditingRole] = useState<OrgRoleDto | null>(null);
  const [deletingRole, setDeletingRole] = useState<OrgRoleDto | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const data = await orgRoleService.listRoles();
      setRoles(data);
    } catch (err: any) {
      toast.error('Failed to load roles');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleCreateOrUpdate = async (data: CreateOrgRolePayload, id?: string) => {
    if (id) {
      await orgRoleService.updateRole(id, data);
      toast.success(`Role "${data.name}" updated successfully!`);
    } else {
      await orgRoleService.createRole(data);
      toast.success(`Role "${data.name}" created successfully!`);
    }
    await fetchRoles();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingRole) return;
    try {
      setIsDeleting(true);
      await orgRoleService.deleteRole(deletingRole.id);
      toast.success(`Role "${deletingRole.name}" deleted successfully`);
      setDeletingRole(null);
      await fetchRoles();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete role');
    } finally {
      setIsDeleting(false);
    }
  };

  // Stats
  const stats = useMemo(() => {
    let systemCount = 0;
    let customCount = 0;
    let totalAssignments = 0;

    roles.forEach((r) => {
      if (r.isSystemDefault) systemCount++;
      else customCount++;
      totalAssignments += r.userCount || 0;
    });

    return {
      total: roles.length,
      systemCount,
      customCount,
      totalAssignments,
    };
  }, [roles]);

  // Filtered Roles
  const filteredRoles = useMemo(() => {
    if (activeDepartment === 'ALL') return roles;
    return roles.filter((r) => r.department === activeDepartment);
  }, [roles, activeDepartment]);

  const getDepartmentColor = (dept?: string) => {
    switch (dept) {
      case 'ADMIN':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'DOC':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'PREP_REVIEW':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'SALES':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'FILE_OP':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleExportExcel = () => {
    exportTableToExcel(
      roles,
      [
        { header: 'Role Name', key: 'name' },
        { header: 'Description', key: 'description' },
        { header: 'System Capability', key: 'systemRole' },
        { header: 'Department', key: 'department' },
        { header: 'Staff Active', key: 'userCount', format: (r) => r.userCount || 0 },
        { header: 'Default Route', key: 'defaultRoute', format: (r) => r.defaultRoute || '/' },
      ],
      'roles_permissions'
    );
  };

  const columns = useMemo<ColumnDef<OrgRoleDto>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Role Name & Description',
        cell: ({ row }) => (
          <div className="max-w-xs py-0.5">
            <span className="font-bold text-slate-900 text-xs sm:text-sm block">
              {row.original.name}
            </span>
            {row.original.description && (
              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                {row.original.description}
              </p>
            )}
          </div>
        ),
        meta: {
          filterType: 'text',
        },
      },
      {
        accessorKey: 'systemRole',
        header: 'System Capability',
        cell: ({ row }) => (
          <span className="font-mono text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block">
            {row.original.systemRole}
          </span>
        ),
        meta: {
          filterType: 'enum',
          filterOptions: [
            { label: 'DOC_AGENT', value: 'DOC_AGENT' },
            { label: 'DOC_MANAGER', value: 'DOC_MANAGER' },
            { label: 'TAX_PREPARER', value: 'TAX_PREPARER' },
            { label: 'TAX_REVIEWER', value: 'TAX_REVIEWER' },
            { label: 'PREP_MANAGER', value: 'PREP_MANAGER' },
            { label: 'SALES_AGENT', value: 'SALES_AGENT' },
            { label: 'SALES_MANAGER', value: 'SALES_MANAGER' },
            { label: 'FILE_OP_AGENT', value: 'FILE_OP_AGENT' },
            { label: 'FILE_OP_MANAGER', value: 'FILE_OP_MANAGER' },
            { label: 'ADMIN', value: 'ADMIN' },
          ],
        },
      },
      {
        accessorKey: 'department',
        header: 'Department',
        cell: ({ row }) => (
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold border inline-block ${getDepartmentColor(
              row.original.department
            )}`}
          >
            {row.original.department}
          </span>
        ),
        meta: {
          filterType: 'enum',
          filterOptions: [
            { label: 'Documenter (DOC)', value: 'DOC' },
            { label: 'Tax Prep & QA (PREP_REVIEW)', value: 'PREP_REVIEW' },
            { label: 'Sales (SALES)', value: 'SALES' },
            { label: 'Filing (FILE_OP)', value: 'FILE_OP' },
            { label: 'Admin (ADMIN)', value: 'ADMIN' },
            { label: 'Custom (CUSTOM)', value: 'CUSTOM' },
          ],
        },
      },
      {
        id: 'sidebarPermissions',
        header: 'Sidebar Visibility',
        accessorFn: (row) => row.sidebarPermissions?.length || 0,
        cell: ({ row }) => {
          const permCount = row.original.sidebarPermissions?.length || 0;
          const totalCatalogItems = MASTER_SIDEBAR_CATALOG.length;
          return (
            <div className="flex items-center gap-1.5">
              <LayoutGrid className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-bold text-slate-800">
                {permCount} / {totalCatalogItems}
              </span>
              <span className="text-[10px] text-slate-400">items</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'userCount',
        header: 'Staff Active',
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-bold text-slate-800">{row.original.userCount || 0}</span>
            <span className="text-[10px] text-slate-400">users</span>
          </div>
        ),
      },
      {
        accessorKey: 'defaultRoute',
        header: 'Default Route',
        cell: ({ row }) => (
          <span className="text-[11px] font-mono text-slate-500">
            {row.original.defaultRoute || '/'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingRole(r);
                  setIsDrawerOpen(true);
                }}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Edit Role & Permissions"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              {r.isSystemDefault ? (
                <span
                  className="p-1.5 text-slate-300 cursor-not-allowed"
                  title="System presets cannot be deleted"
                >
                  <Lock className="w-3.5 h-3.5" />
                </span>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletingRole(r);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Delete Role"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        },
        meta: {
          disableMenu: true,
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      {/* 1. Header with Stats & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Roles &amp; Permissions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Define organizational roles, configure sidebar item visibility, and assign multiple roles to staff.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setEditingRole(null);
            setIsDrawerOpen(true);
          }}
          className="bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer px-4 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Role</span>
        </Button>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">Defined Roles</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across all departments</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">System Presets</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{stats.systemCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Pre-configured roles</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">Custom Roles</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{stats.customCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Custom created roles</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">Role Allocations</div>
          <div className="text-2xl font-bold text-indigo-600 mt-1">{stats.totalAssignments}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Assigned to staff</div>
        </div>
      </div>

      {/* 3. Roles Table (TanStack Table with Filters) */}
      <UnifiedTable<OrgRoleDto>
        columns={columns}
        data={filteredRoles}
        isLoading={isLoading}
        searchPlaceholder="Search roles..."
        initialPageSize={25}
        onExportExcel={handleExportExcel}
        extraHeaderActions={
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-zinc-500 hidden sm:inline">Department:</span>
            <select
              value={activeDepartment}
              onChange={(e) => setActiveDepartment(e.target.value)}
              className="h-8 px-2.5 text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-lg shadow-2xs transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#16A34A]"
            >
              <option value="ALL">All Departments</option>
              <option value="DOC">Documenter</option>
              <option value="PREP_REVIEW">Tax Prep &amp; QA</option>
              <option value="SALES">Sales</option>
              <option value="FILE_OP">Filing</option>
              <option value="ADMIN">Admin</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </div>
        }
        emptyContent={
          <AppEmptyState
            icon={ShieldCheck}
            title="No roles found"
            description={
              activeDepartment !== 'ALL'
                ? 'No roles found in this department. Click "+ Create New Role" to create one.'
                : 'No roles found matching active filters.'
            }
          />
        }
      />

      {/* Role Create / Edit Drawer */}
      <RoleDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleCreateOrUpdate}
        role={editingRole}
      />

      {/* Delete Confirmation Dialog */}
      <AppConfirmDialog
        isOpen={Boolean(deletingRole)}
        onClose={() => setDeletingRole(null)}
        onConfirm={handleDeleteConfirm}
        title={`Delete Role: ${deletingRole?.name}`}
        description={`Are you sure you want to delete "${deletingRole?.name}"? Any users assigned to this role will lose this role assignment.`}
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete Role'}
        variant="danger"
      />
    </div>
  );
};
