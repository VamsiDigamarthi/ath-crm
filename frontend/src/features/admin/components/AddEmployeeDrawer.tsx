import React, { useState, useEffect } from 'react';
import { AppDrawer } from '@/shared/components/AppDrawer';
import { AppInput } from '@/shared/components/AppInput';
import { Button } from '@/shared/components/Button';
import {
  UserCheck,
  ShieldCheck,
  Mail,
  CheckSquare,
  Square,
  Star,
} from 'lucide-react';
import type { EmployeeItem, EmployeeRole, AddEmployeeFormData } from '../types/employee.types';
import { orgRoleService, type OrgRoleDto } from '../services/org-role-service';

interface AddEmployeeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AddEmployeeFormData) => void;
  employee?: EmployeeItem | null;
}

export const AddEmployeeDrawer: React.FC<AddEmployeeDrawerProps> = ({
  isOpen,
  onClose,
  onSave,
  employee,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [smtpEmail, setSmtpEmail] = useState('');
  const [smtpAppPassword, setSmtpAppPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Multi-Role State
  const [availableOrgRoles, setAvailableOrgRoles] = useState<OrgRoleDto[]>([]);
  const [selectedOrgRoleIds, setSelectedOrgRoleIds] = useState<string[]>([]);
  const [primaryOrgRoleId, setPrimaryOrgRoleId] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      orgRoleService
        .listRoles()
        .then((roles) => {
          setAvailableOrgRoles(roles);
          // If creating new and no role selected yet, default to first doc agent role
          if (!employee && roles.length > 0) {
            const defaultRole = roles.find((r) => r.systemRole === 'DOC_AGENT') || roles[0];
            setSelectedOrgRoleIds([defaultRole.id]);
            setPrimaryOrgRoleId(defaultRole.id);
          }
        })
        .catch(console.error);
    }
  }, [isOpen, employee]);

  // Reset or Populate form fields on open
  useEffect(() => {
    if (employee) {
      setFirstName(employee.firstName || '');
      setLastName(employee.lastName || '');
      setEmail(employee.email || '');
      setMobile(employee.mobile || '');
      setIsActive(employee.isActive ?? true);
      setSmtpEmail(employee.smtpEmail || '');
      setSmtpAppPassword(employee.smtpAppPassword || '');

      if (employee.orgRoles && employee.orgRoles.length > 0) {
        setSelectedOrgRoleIds(employee.orgRoles.map((r) => r.id));
        const primary =
          employee.orgRoles.find((r) => r.isPrimary)?.id ||
          employee.activeOrgRoleId ||
          employee.orgRoles[0].id;
        setPrimaryOrgRoleId(primary);
      } else {
        setSelectedOrgRoleIds([]);
        setPrimaryOrgRoleId('');
      }
    } else {
      setFirstName('');
      setLastName('');
      setEmail('');
      setMobile('');
      setIsActive(true);
      setSmtpEmail('');
      setSmtpAppPassword('');
    }
    setErrors({});
  }, [employee, isOpen]);

  const toggleOrgRole = (roleId: string) => {
    setSelectedOrgRoleIds((prev) => {
      const exists = prev.includes(roleId);
      const next = exists ? prev.filter((id) => id !== roleId) : [...prev, roleId];
      if (!exists && prev.length === 0) {
        setPrimaryOrgRoleId(roleId);
      } else if (exists && primaryOrgRoleId === roleId) {
        setPrimaryOrgRoleId(next[0] || '');
      }
      return next;
    });
    if (errors.roles) {
      setErrors((prev) => ({ ...prev, roles: '' }));
    }
  };

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Valid work email is required';
    }
    if (!mobile.trim() || mobile.replace(/\D/g, '').length < 7) {
      newErrors.mobile = 'Valid contact number is required';
    }
    if (selectedOrgRoleIds.length === 0) {
      newErrors.roles = 'Please select at least one role for this staff member';
    }
    if (smtpEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(smtpEmail.trim())) {
      newErrors.smtpEmail = 'Valid SMTP email format required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const effectivePrimaryId = primaryOrgRoleId || selectedOrgRoleIds[0];
    const primaryRoleObj = availableOrgRoles.find((r) => r.id === effectivePrimaryId);
    const systemRole = (primaryRoleObj?.systemRole || 'DOC_AGENT') as EmployeeRole;
    const dept = (primaryRoleObj?.department || 'DOC') as any;

    onSave({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      mobile: mobile.trim(),
      department: dept,
      role: systemRole,
      isActive,
      smtpEmail: smtpEmail.trim() || undefined,
      smtpAppPassword: smtpAppPassword.trim() || undefined,
      orgRoleIds: selectedOrgRoleIds,
      primaryOrgRoleId: effectivePrimaryId,
    });
  };

  return (
    <AppDrawer
      isOpen={isOpen}
      onClose={onClose}
      className="sm:max-w-[620px] md:max-w-[680px]"
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center border border-emerald-200">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              {employee ? 'Edit Staff Member' : 'Add New Staff Member'}
            </h3>
            <p className="text-xs text-slate-500 font-normal">
              {employee
                ? `Updating details and roles for ${employee.fullName}`
                : 'Provision role-based credentials and multiple roles for team member'}
            </p>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            className="border-slate-300 text-slate-700"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleSubmit}
            className="px-6 shadow-sm bg-[#16A34A] hover:bg-[#15803D]"
          >
            {employee ? 'Save Changes' : 'Create Staff Member'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5 py-2">
        {/* Personal Details Header */}
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Personal &amp; Contact Details
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AppInput
            label="First Name *"
            placeholder="e.g. Arjun"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: '' }));
            }}
            error={errors.firstName}
          />
          <AppInput
            label="Last Name *"
            placeholder="e.g. Varma"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              if (errors.lastName) setErrors((prev) => ({ ...prev, lastName: '' }));
            }}
            error={errors.lastName}
          />
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <AppInput
            label="Work Email Address *"
            placeholder="arjun.v@taxcrm.com"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
            }}
            error={errors.email}
          />

          <AppInput
            label="Mobile / Direct Contact Number *"
            placeholder="+1 (555) 019-2831"
            type="tel"
            value={mobile}
            onChange={(e) => {
              setMobile(e.target.value);
              if (errors.mobile) setErrors((prev) => ({ ...prev, mobile: '' }));
            }}
            error={errors.mobile}
          />
        </div>

        {/* Multi-Role Assignment Section */}
        <div className="pt-2 border-t border-slate-200/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Assigned Roles (Multi-Role Support) *
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-[#16A34A] border border-emerald-200">
                  {selectedOrgRoleIds.length} assigned
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Select one or multiple roles. The user can switch between these roles in the top-right profile section.
              </p>
            </div>
          </div>

          {errors.roles && (
            <p className="text-xs font-semibold text-rose-600 animate-in fade-in">{errors.roles}</p>
          )}

          {/* Role Checkbox Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
            {availableOrgRoles.map((r) => {
              const isSelected = selectedOrgRoleIds.includes(r.id);
              const isPrimary = primaryOrgRoleId === r.id;

              return (
                <div
                  key={r.id}
                  className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'bg-emerald-50/40 border-emerald-300 shadow-2xs'
                      : 'bg-white border-slate-200/90 hover:bg-slate-50'
                  }`}
                >
                  <div
                    onClick={() => toggleOrgRole(r.id)}
                    className="flex items-start gap-2.5 cursor-pointer select-none"
                  >
                    <div className="mt-0.5 shrink-0 text-emerald-600">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#16A34A]" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 leading-tight">
                          {r.name}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${getDepartmentColor(
                            r.department
                          )}`}
                        >
                          {r.department}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                        {r.systemRole} · {r.sidebarPermissions?.length || 0} items
                      </span>
                    </div>
                  </div>

                  {/* Primary Role Indicator */}
                  {isSelected && (
                    <div className="pt-1.5 border-t border-emerald-200/50 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPrimaryOrgRoleId(r.id);
                        }}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 transition-colors cursor-pointer ${
                          isPrimary
                            ? 'bg-[#16A34A] text-white shadow-2xs'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-emerald-50'
                        }`}
                      >
                        <Star className={`w-3 h-3 ${isPrimary ? 'fill-white text-white' : 'text-slate-400'}`} />
                        <span>{isPrimary ? 'Primary Default' : 'Set as Primary'}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Outbound SMTP Email Configuration */}
        <div className="pt-2 border-t border-slate-200/80 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 text-[#16A34A] flex items-center justify-center border border-emerald-200">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">SMTP Outbound Credentials</h4>
                <p className="text-[11px] text-slate-500">Enable this staff member to send emails directly within the platform</p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Optional</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <AppInput
              label="Sender Email Address"
              placeholder="e.g. arjun.varma@taxcrm.com"
              type="email"
              value={smtpEmail}
              onChange={(e) => setSmtpEmail(e.target.value)}
              error={errors.smtpEmail}
            />

            <AppInput
              label="App Password (16-character SMTP Secret)"
              placeholder="•••• •••• •••• ••••"
              type="password"
              value={smtpAppPassword}
              onChange={(e) => setSmtpAppPassword(e.target.value)}
            />
          </div>
        </div>

        {/* Account Status Toggle */}
        <div className="pt-2 border-t border-slate-200/80">
          <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/60 transition-colors">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded text-[#16A34A] focus:ring-[#16A34A] border-slate-300"
            />
            <div>
              <div className="text-xs font-bold text-slate-800">Account Active</div>
              <div className="text-[11px] text-slate-500">Allow this staff member to log in and receive assignments</div>
            </div>
          </label>
        </div>
      </form>
    </AppDrawer>
  );
};
