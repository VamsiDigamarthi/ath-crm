import React, { useState, useEffect } from 'react';
import { AppModal } from '@/shared/components/AppModal';
import { AppInput } from '@/shared/components/AppInput';
import { AppMultiSelect } from '@/shared/components/AppMultiSelect';
import { Button } from '@/shared/components/Button';
import { EmailTemplateRichEditor } from './EmailTemplateRichEditor';
import { Check } from 'lucide-react';
import type {
  EmailTemplateItem,
  EmailTemplateFormData,
  RoleOption,
  SystemRole,
} from '../types/email-template.types';
import { emailTemplateFormSchema } from '../validations/email-template.schema';

interface EmailTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EmailTemplateFormData) => Promise<void>;
  template?: EmailTemplateItem | null;
  roleOptions: RoleOption[];
  isSubmitting?: boolean;
}

export const EmailTemplateModal: React.FC<EmailTemplateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  template,
  roleOptions,
  isSubmitting = false,
}) => {
  const [name, setName] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = Boolean(template);

  // Populate or reset form fields
  useEffect(() => {
    if (template) {
      setName(template.name);
      setRoles(template.roles || []);
      setSubject(template.subject);
      setBody(template.body);
      setIsActive(template.isActive);
    } else {
      setName('');
      setRoles([]);
      setSubject('');
      setBody('');
      setIsActive(true);
    }
    setErrors({});
  }, [template, isOpen]);

  // Convert role options for AppMultiSelect
  const multiSelectOptions = roleOptions.map((r) => ({
    label: `${r.label} (${r.department})`,
    value: r.value,
  }));

  const handleSelectAllRoles = () => {
    setRoles(roleOptions.map((r) => r.value));
    if (errors.roles) {
      setErrors((prev) => ({ ...prev, roles: '' }));
    }
  };

  const handleClearRoles = () => {
    setRoles([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: EmailTemplateFormData = {
      name: name.trim(),
      roles: roles as SystemRole[],
      subject: subject.trim(),
      body: body.trim(),
      isActive,
    };

    const validation = emailTemplateFormSchema.safeParse(payload);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    await onSave(payload);
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-3xl w-full"
      title={
        <div>
          <h3 className="text-base font-bold text-slate-900">
            {isEditing ? 'Edit Email Template' : 'Create New Email Template'}
          </h3>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Configure automated and manual email templates targeted to specific employee roles and client taxpayer personas.
          </p>
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-[#16A34A] focus:ring-[#16A34A] border-slate-300"
              />
              <span>Active Template</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving Template...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Update Template' : 'Save Template'}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-1">
        {/* Template Name */}
        <div className="space-y-1">
          <AppInput
            label="Template Name"
            placeholder="e.g. Taxpayer Intake Welcome & Document Request"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
            }}
            error={errors.name}
          />
          <p className="text-[11px] text-slate-400">
            Unique internal identifier for staff and automated trigger systems.
          </p>
        </div>

        {/* Target Roles Multiselect */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <span>Target Applicable Roles (From Database)</span>
              <span className="text-rose-500 font-bold">*</span>
            </label>

            <div className="flex items-center gap-2 text-[11px]">
              <button
                type="button"
                onClick={handleSelectAllRoles}
                className="text-[#16A34A] hover:underline font-semibold cursor-pointer"
              >
                Select All
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={handleClearRoles}
                className="text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          <AppMultiSelect
            options={multiSelectOptions}
            selectedValues={roles}
            onChange={(selected) => {
              setRoles(selected);
              if (errors.roles) setErrors((prev) => ({ ...prev, roles: '' }));
            }}
            placeholder="Choose one or more roles that can use this template..."
            searchPlaceholder="Search system roles (e.g. Sales, Taxpayer, Documenter)..."
            error={errors.roles}
          />
          <p className="text-[11px] text-slate-400">
            Selected roles define which departments or taxpayer personas receive and trigger this email.
          </p>
        </div>

        {/* Email Subject */}
        <div className="space-y-1">
          <AppInput
            label="Email Subject Line"
            placeholder="e.g. Action Required: Please review and e-sign your {{tax_year}} Form 1040 return"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              if (errors.subject) setErrors((prev) => ({ ...prev, subject: '' }));
            }}
            error={errors.subject}
          />
          <p className="text-[11px] text-slate-400">
            The subject line visible in the recipient's inbox. Supports variable tags like <code className="text-emerald-600 font-mono text-[10px]">{'{{taxpayer_name}}'}</code>.
          </p>
        </div>

        {/* Email Body Rich Text Editor */}
        <EmailTemplateRichEditor
          value={body}
          onChange={(val) => {
            setBody(val);
            if (errors.body) setErrors((prev) => ({ ...prev, body: '' }));
          }}
          error={errors.body}
          placeholder="Write your email body here. Use standard rich text styling and insert dynamic placeholder variables..."
        />
      </form>
    </AppModal>
  );
};
