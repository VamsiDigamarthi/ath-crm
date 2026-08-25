import React, { useState, useRef } from 'react';
import { AppModal } from '@/shared/components/AppModal';
import { Button } from '@/shared/components/Button';
import { UploadCloud, FileSpreadsheet, Download, Trash2 } from 'lucide-react';
import type { EmployeeItem, EmployeeRole } from '../types/employee.types';
import toast from 'react-hot-toast';

interface BulkEmployeeImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newEmployees: EmployeeItem[]) => void;
}

export const BulkEmployeeImportModal: React.FC<BulkEmployeeImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedEmployees, setParsedEmployees] = useState<EmployeeItem[]>([]);
  const [fileName, setFileName] = useState<string>('');

  const handleDownloadTemplate = () => {
    const csvContent =
      '\uFEFF"First Name","Last Name","Work Email","Phone Number","Department (DOC/PREP_REVIEW/SALES/FILE_OP/ADMIN)","Role (MANAGER/REVIEWER/PREPARER/AGENT)"\n' +
      '"Rohan","Gupta","rohan.g@taxcrm.com","+1 (555) 019-3321","DOC","DOC_AGENT"\n' +
      '"Deepak","Joshi","deepak.j@taxcrm.com","+1 (555) 019-2004","PREP_REVIEW","TAX_PREPARER"\n' +
      '"Anjali","Rao","anjali.r@taxcrm.com","+1 (555) 019-2002","PREP_REVIEW","TAX_REVIEWER"\n' +
      '"Meera","Sen","meera.s@taxcrm.com","+1 (555) 019-4412","SALES","SALES_AGENT"\n' +
      '"Tanvi","Shah","tanvi.s@taxcrm.com","+1 (555) 019-8876","FILE_OP","FILE_OP_AGENT"\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'staff_onboarding_template.csv';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded Staff Onboarding CSV Template!');
  };

  const handleFileParse = (file: File) => {
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          toast.error('The selected file contains no employee records');
          return;
        }

        const dataRows = lines.slice(1);
        const newStaffList: EmployeeItem[] = dataRows.map((row, idx) => {
          const cols = row.split(',').map((c) => c.replace(/^"|"$/g, '').trim());
          const firstName = cols[0] || `Staff`;
          const lastName = cols[1] || `${idx + 1}`;
          const email = cols[2] || `staff${idx + 1}@taxcrm.com`;
          const mobile = cols[3] || `+1 (555) 019-000${idx}`;
          const deptRaw = (cols[4] || 'DOC').toUpperCase();
          const dept = (['DOC', 'PREP_REVIEW', 'SALES', 'FILE_OP', 'ADMIN'].includes(deptRaw)
            ? deptRaw
            : 'DOC') as 'DOC' | 'PREP_REVIEW' | 'SALES' | 'FILE_OP' | 'ADMIN';

          let role: EmployeeRole = 'DOC_AGENT';
          const roleRaw = (cols[5] || '').toUpperCase();
          if (roleRaw && ['PREP_MANAGER', 'TAX_REVIEWER', 'TAX_PREPARER', 'DOC_MANAGER', 'DOC_TEAM_LEAD', 'DOC_AGENT', 'SALES_MANAGER', 'SALES_TEAM_LEAD', 'SALES_AGENT', 'FILE_OP_MANAGER', 'FILE_OP_TEAM_LEAD', 'FILE_OP_AGENT', 'ADMIN'].includes(roleRaw)) {
            role = roleRaw as EmployeeRole;
          } else if (dept === 'PREP_REVIEW') {
            role = 'TAX_PREPARER';
          } else if (dept === 'SALES') {
            role = 'SALES_AGENT';
          } else if (dept === 'FILE_OP') {
            role = 'FILE_OP_AGENT';
          } else if (dept === 'ADMIN') {
            role = 'ADMIN';
          }

          const getRoleLabel = (r: EmployeeRole): string => {
            switch (r) {
              case 'DOC_MANAGER': return 'Department Manager';
              case 'DOC_AGENT': return 'Outreach / Intake Agent';
              case 'PREP_MANAGER': return 'Tax Prep Manager';
              case 'TAX_REVIEWER': return 'Tax Reviewer (QA Lead)';
              case 'TAX_PREPARER': return 'Tax Preparer (Draftsman)';
              case 'SALES_MANAGER': return 'Sales Operations Manager';
              case 'SALES_AGENT': return 'Sales Pitch Agent';
              case 'FILE_OP_MANAGER': return 'CPA Operations Head';
              case 'FILE_OP_AGENT': return 'IRS E-Filer (CPA)';
              case 'ADMIN': return 'System Administrator';
              default: return 'Staff Member';
            }
          };

          const getDeptLabel = (d: string): string => {
            switch (d) {
              case 'DOC': return 'Documenter Dept';
              case 'PREP_REVIEW': return 'Tax Prep & Review';
              case 'SALES': return 'Sales Dept';
              case 'FILE_OP': return 'File Operator';
              case 'ADMIN': return 'Administration';
              default: return 'Staff';
            }
          };

          return {
            id: `EMP-${Date.now().toString().slice(-4)}-${idx + 1}`,
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`.trim(),
            email,
            mobile,
            department: dept,
            departmentLabel: getDeptLabel(dept),
            role,
            roleLabel: getRoleLabel(role),
            isActive: true,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}`,
            assignedCasesCount: 0,
            completedCasesCount: 0,
            createdAt: new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric',
            }),
          };
        });

        setParsedEmployees(newStaffList);
        toast.success(`Successfully parsed ${newStaffList.length} staff records!`);
      } catch (err) {
        console.error(err);
        toast.error('Failed to parse staff file');
      }
    };

    reader.readAsText(file);
  };

  const handleConfirmOnboard = () => {
    if (parsedEmployees.length === 0) return;
    onSuccess(parsedEmployees);
    setParsedEmployees([]);
    setFileName('');
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Onboard Staff & Team Members"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownloadTemplate}
            className="text-xs border-slate-300 text-slate-700"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Download Staff Template (.csv)
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs border-slate-300 text-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={parsedEmployees.length === 0}
              onClick={handleConfirmOnboard}
              className="text-xs px-4"
            >
              Onboard {parsedEmployees.length} Staff Members
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-xs text-slate-500">
          Upload a CSV or Excel sheet with employee names, work emails, departments, and roles.
        </p>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFileParse(f);
            e.target.value = '';
          }}
          className="hidden"
        />

        {parsedEmployees.length === 0 ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-8 text-center bg-slate-50/60 hover:bg-emerald-50/40 transition-colors cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-[#16A34A] flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-800">
              Click to choose or drop Staff CSV / Excel file
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Supports columns: First Name, Last Name, Work Email, Phone, Department, Role
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="flex items-center gap-2.5 text-xs text-emerald-900">
                <FileSpreadsheet className="w-4 h-4 text-[#16A34A]" />
                <span className="font-bold">{fileName}</span>
                <span>({parsedEmployees.length} staff records ready)</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setParsedEmployees([]);
                  setFileName('');
                }}
                className="text-xs text-rose-600 hover:bg-rose-50 p-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Quick Preview List */}
            <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
              {parsedEmployees.map((emp, i) => (
                <div key={i} className="p-3 text-xs flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-2.5">
                    <img src={emp.avatar} alt="" className="w-7 h-7 rounded-full bg-slate-100" />
                    <div>
                      <div className="font-bold text-slate-800">{emp.fullName}</div>
                      <div className="text-[11px] text-slate-500">{emp.email} • {emp.mobile}</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                    {emp.departmentLabel} - {emp.roleLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppModal>
  );
};
