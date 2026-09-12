import React, { useState, useEffect } from 'react';
import { AppDrawer } from '@/shared/components/AppDrawer';
import { AppInput } from '@/shared/components/AppInput';
import { AppSelect } from '@/shared/components/AppSelect';
import { Button } from '@/shared/components/Button';
import { UserCheck, ShieldCheck, Mail, Info } from 'lucide-react';
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
  const [department, setDepartment] = useState<'DOC' | 'PREP_REVIEW' | 'SALES' | 'FILE_OP' | 'ADMIN'>('DOC');
  const [role, setRole] = useState<EmployeeRole>('DOC_AGENT');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [smtpEmail, setSmtpEmail] = useState('');
  const [smtpAppPassword, setSmtpAppPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset or Populate form fields on open
  useEffect(() => {
    if (employee) {
      setFirstName(employee.firstName || '');
      setLastName(employee.lastName || '');
      setEmail(employee.email || '');
      setMobile(employee.mobile || '');
      setDepartment(employee.department || 'DOC');
      setRole(employee.role || 'DOC_AGENT');
      setIsActive(employee.isActive ?? true);
      setSmtpEmail(employee.smtpEmail || '');
      setSmtpAppPassword(employee.smtpAppPassword || '');
    } else {
      setFirstName('');
      setLastName('');
      setEmail('');
      setMobile('');
      setDepartment('DOC');
      setRole('DOC_AGENT');
      setIsActive(true);
      setSmtpEmail('');
      setSmtpAppPassword('');
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
          { label: 'Documenter Agent (Outreach & Intake)', value: 'DOC_AGENT' },
        ];
      case 'PREP_REVIEW':
        return [
          { label: 'Tax Prep Manager (Department Lead)', value: 'PREP_MANAGER' },
          { label: 'Tax Reviewer / QA Lead (Quality Assurance & Sign-off)', value: 'TAX_REVIEWER' },
          { label: 'Tax Preparer (1040/W-2 Computation & Drafts)', value: 'TAX_PREPARER' },
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
    const dept = newDept as 'DOC' | 'PREP_REVIEW' | 'SALES' | 'FILE_OP' | 'ADMIN';
    setDepartment(dept);
    if (dept === 'DOC') setRole('DOC_AGENT');
    else if (dept === 'PREP_REVIEW') setRole('TAX_PREPARER');
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

    if (smtpEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(smtpEmail.trim())) {
      newErrors.smtpEmail = 'Valid SMTP email format required';
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
      smtpEmail: smtpEmail.trim() || undefined,
      smtpAppPassword: smtpAppPassword.trim() || undefined,
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
        {/* Basic Information Header */}
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

        {/* Department & Role Section */}
        <div className="pt-2 border-t border-slate-200/80 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Department &amp; Permission Level
          </div>

          <div>
            <AppSelect
              label="Assign Department *"
              value={department}
              onChange={handleDepartmentChange}
              options={[
                { label: 'Documenter Dept (Outreach & Intake)', value: 'DOC' },
                { label: 'Tax Prep & Review Dept (Computation & QA)', value: 'PREP_REVIEW' },
                { label: 'Sales Dept (Quotations & Negotiation)', value: 'SALES' },
                { label: 'File Operator Dept (CPA E-Filing)', value: 'FILE_OP' },
                { label: 'System Administration (Admin)', value: 'ADMIN' },
              ]}
            />
          </div>

          <div>
            <AppSelect
              label="Department Role Level *"
              value={role}
              onChange={(val) => setRole(val as EmployeeRole)}
              options={getRoleOptions()}
            />
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
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3.5">
            <div>
              <AppInput
                label="SMTP Email Address"
                placeholder="e.g. user@gmail.com or staff@taxcrm.com"
                type="email"
                value={smtpEmail}
                onChange={(e) => {
                  setSmtpEmail(e.target.value);
                  if (errors.smtpEmail) setErrors((prev) => ({ ...prev, smtpEmail: '' }));
                }}
                error={errors.smtpEmail}
              />
              <p className="text-[11px] text-slate-400 mt-1">Email account used to dispatch outbound client emails</p>
            </div>

            <div>
              <AppInput
                label="SMTP App Password"
                placeholder="e.g. 16-character App Password (xxxx xxxx xxxx xxxx)"
                type="password"
                value={smtpAppPassword}
                onChange={(e) => {
                  setSmtpAppPassword(e.target.value);
                  if (errors.smtpAppPassword) setErrors((prev) => ({ ...prev, smtpAppPassword: '' }));
                }}
                error={errors.smtpAppPassword}
              />
              <p className="text-[11px] text-slate-400 mt-1">Generated App Password from Google / Outlook / Mail Provider</p>
            </div>

            <div className="flex items-start gap-2 text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/70">
              <Info className="w-3.5 h-3.5 text-[#16A34A] shrink-0 mt-0.5" />
              <span>
                These credentials allow the system to dispatch transactional emails, review notices, and tax communications directly via this user's email account.
              </span>
            </div>
          </div>
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
