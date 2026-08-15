import React, { useState, useEffect } from 'react';
import { AppDrawer } from '@/shared/components/AppDrawer';
import { AppInput } from '@/shared/components/AppInput';
import { AppSelect } from '@/shared/components/AppSelect';
import { Button } from '@/shared/components/Button';
import { UserCheck, ShieldCheck } from 'lucide-react';
import type { EmployeeItem, EmployeeRole, AddEmployeeFormData } from '../types/employee.types';

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
  const [department, setDepartment] = useState<'DOC' | 'SALES' | 'FILE_OP' | 'ADMIN'>('DOC');
  const [role, setRole] = useState<EmployeeRole>('DOC_AGENT');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset or Populate form fields on open
  useEffect(() => {
    if (employee) {
      setFirstName(employee.firstName);
      setLastName(employee.lastName);
      setEmail(employee.email);
      setMobile(employee.mobile);
      setDepartment(employee.department);
      setRole(employee.role);
      setIsActive(employee.isActive);
    } else {
      setFirstName('');
      setLastName('');
      setEmail('');
      setMobile('');
      setDepartment('DOC');
      setRole('DOC_AGENT');
      setIsActive(true);
    }
    setErrors({});
  }, [employee, isOpen]);

  // Dynamic role options based on department
  const getRoleOptions = () => {
    switch (department) {
      case 'DOC':
        return [
          { label: 'Documenter Manager (Department Lead)', value: 'DOC_MANAGER' },
          { label: 'Documenter Team Leader (Supervises Agents)', value: 'DOC_TEAM_LEAD' },
          { label: 'Documenter Agent (Outreach & Tax Prep)', value: 'DOC_AGENT' },
        ];
      case 'SALES':
        return [
          { label: 'Sales Manager (Quota & Deals Lead)', value: 'SALES_MANAGER' },
          { label: 'Sales Team Leader (Pipeline Supervisor)', value: 'SALES_TEAM_LEAD' },
          { label: 'Sales Agent (Quotation & Pitching)', value: 'SALES_AGENT' },
        ];
      case 'FILE_OP':
        return [
          { label: 'File Operator Manager (CPA Lead)', value: 'FILE_OP_MANAGER' },
          { label: 'File Operator Team Leader (Filing Supervisor)', value: 'FILE_OP_TEAM_LEAD' },
          { label: 'File Operator / CPA Agent (E-Filing Specialist)', value: 'FILE_OP_AGENT' },
        ];
      case 'ADMIN':
      default:
        return [
          { label: 'System Administrator (Full Global Access)', value: 'ADMIN' },
        ];
    }
  };

  const handleDepartmentChange = (newDept: string) => {
    const dept = newDept as 'DOC' | 'SALES' | 'FILE_OP' | 'ADMIN';
    setDepartment(dept);
    if (dept === 'DOC') setRole('DOC_AGENT');
    else if (dept === 'SALES') setRole('SALES_AGENT');
    else if (dept === 'FILE_OP') setRole('FILE_OP_AGENT');
    else setRole('ADMIN');
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

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      mobile: mobile.trim(),
      department,
      role,
      isActive,
    });
  };

  return (
    <AppDrawer
      isOpen={isOpen}
      onClose={onClose}
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
                ? `Updating details for ${employee.fullName}`
                : 'Provision role-based credentials for team member'}
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
            className="px-6 shadow-sm"
          >
            {employee ? 'Save Changes' : 'Create Staff Member'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5 py-2">
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

        {/* Department Selector */}
        <div>
          <AppSelect
            label="Assign Department *"
            value={department}
            onChange={handleDepartmentChange}
            options={[
              { label: 'Documenter Dept (Outreach & Prep)', value: 'DOC' },
              { label: 'Sales Dept (Quotations & Negotiation)', value: 'SALES' },
              { label: 'File Operator Dept (CPA E-Filing)', value: 'FILE_OP' },
              { label: 'System Administration (Admin)', value: 'ADMIN' },
            ]}
          />
        </div>

        {/* Role Selector */}
        <div>
          <AppSelect
            label="Department Role Level *"
            value={role}
            onChange={(val) => setRole(val as EmployeeRole)}
            options={getRoleOptions()}
          />
        </div>

        {/* Active Status Switch */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-800">
              Active Operational Status
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Allow this staff member to access department queues
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#16A34A]"></div>
          </label>
        </div>

        {/* Security / Role Notice */}
        <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Access Governance:</span> Inactive staff accounts cannot access queues or receive new lead assignments.
          </div>
        </div>
      </form>
    </AppDrawer>
  );
};
