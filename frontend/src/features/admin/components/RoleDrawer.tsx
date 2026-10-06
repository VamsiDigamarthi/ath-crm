import React, { useState, useEffect } from 'react';
import { AppDrawer } from '@/shared/components/AppDrawer';
import { AppInput } from '@/shared/components/AppInput';
import { AppSelect } from '@/shared/components/AppSelect';
import { AppTextarea } from '@/shared/components/AppTextarea';
import { Button } from '@/shared/components/Button';
import {
  MASTER_SIDEBAR_CATALOG,
  DEPARTMENT_LABELS,
  type SidebarItemDefinition,
} from '@/shared/constants/sidebar-catalog';
import type { OrgRoleDto, CreateOrgRolePayload } from '../services/org-role-service';
import { ShieldCheck, CheckSquare, Square, LayoutGrid } from 'lucide-react';
import toast from 'react-hot-toast';

interface RoleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateOrgRolePayload, id?: string) => Promise<void>;
  role?: OrgRoleDto | null;
}

const SYSTEM_ROLE_OPTIONS = [
  { label: 'Documenter Agent (Intake & Calling)', value: 'DOC_AGENT' },
  { label: 'Documenter Manager (Lead Allocation & QA)', value: 'DOC_MANAGER' },
  { label: 'Tax Preparer (1040/W-2 Drafting)', value: 'TAX_PREPARER' },
  { label: 'Tax Reviewer / QA (4-Eyes Audit)', value: 'TAX_REVIEWER' },
  { label: 'Tax Prep Manager (Preparer Allocation)', value: 'PREP_MANAGER' },
  { label: 'Sales Closer Agent (Pricing & Quotes)', value: 'SALES_AGENT' },
  { label: 'Sales Manager (Pipeline & Deals)', value: 'SALES_MANAGER' },
  { label: 'Filing Specialist / CPA (IRS E-Filing)', value: 'FILE_OP_AGENT' },
  { label: 'Filing Operations Manager', value: 'FILE_OP_MANAGER' },
  { label: 'System Administrator (Full Global Access)', value: 'ADMIN' },
];

const DEPARTMENT_OPTIONS = [
  { label: 'Administration', value: 'ADMIN' },
  { label: 'Documenter Dept', value: 'DOC' },
  { label: 'Tax Prep & Review', value: 'PREP_REVIEW' },
  { label: 'Sales Dept', value: 'SALES' },
  { label: 'Filing Operations', value: 'FILE_OP' },
  { label: 'Custom / Cross-Functional', value: 'CUSTOM' },
];

const PRESET_ROUTES: { label: string; route: string }[] = [
  { label: 'Admin Dashboard', route: '/admin/dashboard' },
  { label: 'Doc Calling Queue', route: '/documenter/agent/queue' },
  { label: 'Doc Manager Queue', route: '/documenter/manager/queue' },
  { label: 'Prep Queue', route: '/prep-review/preparer/queue' },
  { label: 'Reviewer Queue', route: '/prep-review/reviewer/queue' },
  { label: 'Sales Queue', route: '/sales/agent/queue' },
  { label: 'Filing Queue', route: '/filing/agent/queue' },
];

export const RoleDrawer: React.FC<RoleDrawerProps> = ({
  isOpen,
  onClose,
  onSave,
  role,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [systemRole, setSystemRole] = useState('DOC_AGENT');
  const [department, setDepartment] = useState('DOC');
  const [defaultRoute, setDefaultRoute] = useState('/documenter/agent/queue');
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (role) {
      setName(role.name || '');
      setDescription(role.description || '');
      setSystemRole(role.systemRole || 'DOC_AGENT');
      setDepartment(role.department || 'DOC');
      setDefaultRoute(role.defaultRoute || '/admin/dashboard');
      setSelectedPermissions(new Set(role.sidebarPermissions || []));
    } else {
      setName('');
      setDescription('');
      setSystemRole('DOC_AGENT');
      setDepartment('DOC');
      setDefaultRoute('/documenter/agent/queue');
      // Default to doc agent items
      const docItems = MASTER_SIDEBAR_CATALOG.filter((i) => i.department === 'DOC').map((i) => i.id);
      setSelectedPermissions(new Set(docItems));
    }
  }, [role, isOpen]);

  // Group catalog items by department
  const catalogByDept = React.useMemo(() => {
    const groups: Record<string, SidebarItemDefinition[]> = {
      ADMIN: [],
      DOC: [],
      PREP_REVIEW: [],
      SALES: [],
      FILE_OP: [],
    };
    MASTER_SIDEBAR_CATALOG.forEach((item) => {
      if (groups[item.department]) {
        groups[item.department].push(item);
      }
    });
    return groups;
  }, []);

  const togglePermission = (id: string) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllDept = (deptKey: string) => {
    const items = catalogByDept[deptKey] || [];
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      items.forEach((i) => next.add(i.id));
      return next;
    });
  };

  const deselectAllDept = (deptKey: string) => {
    const items = catalogByDept[deptKey] || [];
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      items.forEach((i) => next.delete(i.id));
      return next;
    });
  };

  const applyPreset = (type: 'ALL' | 'DOC' | 'PREP' | 'SALES' | 'FILING') => {
    if (type === 'ALL') {
      setSelectedPermissions(new Set(MASTER_SIDEBAR_CATALOG.map((i) => i.id)));
      toast.success('Selected all sidebar navigation items');
      return;
    }
    const deptMap: Record<string, string> = {
      DOC: 'DOC',
      PREP: 'PREP_REVIEW',
      SALES: 'SALES',
      FILING: 'FILE_OP',
    };
    const targetDept = deptMap[type];
    const items = MASTER_SIDEBAR_CATALOG.filter((i) => i.department === targetDept).map((i) => i.id);
    setSelectedPermissions(new Set(items));
    toast.success(`Applied ${type} department preset`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Role name is required');
      return;
    }
    if (selectedPermissions.size === 0) {
      toast.error('Please select at least one sidebar navigation item');
      return;
    }

    try {
      setIsSaving(true);
      await onSave(
        {
          name: name.trim(),
          description: description.trim() || undefined,
          systemRole,
          department,
          sidebarPermissions: Array.from(selectedPermissions),
          defaultRoute: defaultRoute.trim() || undefined,
        },
        role?.id
      );
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to save role');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={role ? `Edit Role: ${role.name}` : 'Create New Org Role'}
      className="sm:max-w-[640px] md:max-w-[720px]"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Basic Details */}
        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AppInput
              label="Role Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Senior Documenter & Closer"
              required
            />

            <AppSelect
              label="System Capability Role (system_role)"
              options={SYSTEM_ROLE_OPTIONS}
              value={systemRole}
              onChange={(v) => setSystemRole(v || 'DOC_AGENT')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AppSelect
              label="Department Category"
              options={DEPARTMENT_OPTIONS}
              value={department}
              onChange={(v) => setDepartment(v || 'CUSTOM')}
            />

            <div>
              <AppInput
                label="Default Landing Route"
                value={defaultRoute}
                onChange={(e) => setDefaultRoute(e.target.value)}
                placeholder="/documenter/agent/queue"
                required
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {PRESET_ROUTES.map((p) => (
                  <button
                    key={p.route}
                    type="button"
                    onClick={() => setDefaultRoute(p.route)}
                    className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                      defaultRoute === p.route
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <AppTextarea
            label="Role Description"
            value={description}
            onChange={setDescription}
            placeholder="Briefly describe what responsibilities and access this role grants..."
            rows={2}
          />
        </div>

        {/* Master Sidebar Checklist Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-[#16A34A]" />
                <h4 className="text-sm font-bold text-slate-900">
                  Sidebar Navigation Visibility Permissions
                </h4>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
                  {selectedPermissions.size} / {MASTER_SIDEBAR_CATALOG.length} Selected
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Checked items will be visible in the sidebar whenever a user is operating in this role.
              </p>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Presets:</span>
              <button
                type="button"
                onClick={() => applyPreset('ALL')}
                className="px-2 py-1 text-[11px] font-bold rounded bg-slate-800 text-white hover:bg-slate-900 cursor-pointer"
              >
                All
              </button>
              <button
                type="button"
                onClick={() => applyPreset('DOC')}
                className="px-2 py-1 text-[11px] font-semibold rounded bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 cursor-pointer"
              >
                Doc
              </button>
              <button
                type="button"
                onClick={() => applyPreset('PREP')}
                className="px-2 py-1 text-[11px] font-semibold rounded bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
              >
                Prep
              </button>
              <button
                type="button"
                onClick={() => applyPreset('SALES')}
                className="px-2 py-1 text-[11px] font-semibold rounded bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100 cursor-pointer"
              >
                Sales
              </button>
              <button
                type="button"
                onClick={() => applyPreset('FILING')}
                className="px-2 py-1 text-[11px] font-semibold rounded bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 cursor-pointer"
              >
                Filing
              </button>
            </div>
          </div>

          {/* Department Groups Accordion / Cards */}
          <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
            {Object.entries(catalogByDept).map(([deptKey, items]) => {
              const deptLabel = DEPARTMENT_LABELS[deptKey] || deptKey;
              const selectedInDept = items.filter((i) => selectedPermissions.has(i.id)).length;
              const isAllDeptSelected = selectedInDept === items.length && items.length > 0;

              return (
                <div
                  key={deptKey}
                  className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs"
                >
                  {/* Department Bar */}
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{deptLabel}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                        {selectedInDept} / {items.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {isAllDeptSelected ? (
                        <button
                          type="button"
                          onClick={() => deselectAllDept(deptKey)}
                          className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 cursor-pointer"
                        >
                          Deselect All
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => selectAllDept(deptKey)}
                          className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-800 cursor-pointer"
                        >
                          Select All
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {items.map((item) => {
                      const isChecked = selectedPermissions.has(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => togglePermission(item.id)}
                          className={`text-left p-2.5 rounded-lg border transition-all cursor-pointer flex items-start gap-2.5 ${
                            isChecked
                              ? 'bg-emerald-50/40 border-emerald-300 text-slate-900 shadow-2xs'
                              : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0 text-emerald-600">
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-[#16A34A]" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-300" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold truncate">{item.label}</span>
                              <span className="text-[9px] text-slate-400 font-mono truncate">
                                {item.path}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {item.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSaving}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white font-bold px-5 cursor-pointer shadow-2xs"
          >
            <ShieldCheck className="w-4 h-4 mr-1.5" />
            <span>{isSaving ? 'Saving Role...' : role ? 'Save Changes' : 'Create Role'}</span>
          </Button>
        </div>
      </form>
    </AppDrawer>
  );
};
