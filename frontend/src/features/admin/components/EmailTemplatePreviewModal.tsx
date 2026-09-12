import React, { useState } from 'react';
import { AppModal } from '@/shared/components/AppModal';
import { Button } from '@/shared/components/Button';
import { AppCopyButton } from '@/shared/components/AppCopyButton';
import { Mail, Sparkles, Edit3, CheckCircle2 } from 'lucide-react';
import type { EmailTemplateItem, RoleOption } from '../types/email-template.types';

interface EmailTemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: EmailTemplateItem | null;
  onEdit?: (template: EmailTemplateItem) => void;
  roleOptions: RoleOption[];
}

export const EmailTemplatePreviewModal: React.FC<EmailTemplatePreviewModalProps> = ({
  isOpen,
  onClose,
  template,
  onEdit,
  roleOptions,
}) => {
  const [showSimulatedValues, setShowSimulatedValues] = useState(true);

  if (!template) return null;

  // Role labels lookup
  const getRoleLabel = (roleVal: string) => {
    const found = roleOptions.find((r) => r.value === roleVal);
    return found ? found.label : roleVal;
  };

  // Sample dynamic variable replacements for preview simulation
  const simulateVariables = (text: string) => {
    return text
      .replace(/\{\{taxpayer_name\}\}/g, 'Alex Chen')
      .replace(/\{\{tax_year\}\}/g, '2025')
      .replace(/\{\{visa_type\}\}/g, 'F-1 OPT')
      .replace(/\{\{assigned_agent\}\}/g, 'Sarah Jenkins (CPA)')
      .replace(/\{\{assigned_agent_email\}\}/g, 'sarah.j@taxcrm.com')
      .replace(/\{\{fed_refund\}\}/g, '$1,845.00')
      .replace(/\{\{state_refund\}\}/g, '$420.00')
      .replace(/\{\{total_refund\}\}/g, '$2,265.00')
      .replace(/\{\{filing_status\}\}/g, 'QA_APPROVED')
      .replace(/\{\{company_name\}\}/g, 'ATH Tax Advisory')
      .replace(
        /\{\{portal_link\}\}/g,
        '<a href="#" class="text-emerald-600 font-bold underline">https://taxcrm.com/customer/organizer</a>'
      );
  };

  const renderedSubject = showSimulatedValues
    ? simulateVariables(template.subject)
    : template.subject;

  const renderedBody = showSimulatedValues
    ? simulateVariables(template.body)
    : template.body;

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-2xl w-full"
      title={
        <div>
          <h3 className="text-base font-bold text-slate-900">Email Template Preview</h3>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Inspecting email template &quot;{template.name}&quot;
          </p>
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowSimulatedValues((v) => !v)}
              className="border-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>{showSimulatedValues ? 'Show Raw Variable Tags' : 'Simulate Sample Values'}</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Close
            </Button>
            {onEdit && (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  onClose();
                  onEdit(template);
                }}
                className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Template</span>
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4 font-sans py-1">
        {/* Top Header Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-[#16A34A]">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{template.name}</h3>
                <span className="text-[11px] text-slate-400">
                  Last updated: {new Date(template.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold border inline-flex items-center gap-1 w-fit ${
                template.isActive
                  ? 'bg-emerald-50 text-[#16A34A] border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              {template.isActive ? 'Active Template' : 'Inactive'}
            </span>
          </div>

          {/* Applicable Roles Chips */}
          <div className="space-y-1 pt-1 border-t border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-500">Target Roles:</span>
            <div className="flex flex-wrap gap-1.5">
              {template.roles.map((r) => (
                <span
                  key={r}
                  className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white text-slate-700 border border-slate-200 shadow-2xs"
                >
                  {getRoleLabel(r)}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Email Envelope Container */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
          {/* Email Subject Header */}
          <div className="bg-slate-100/70 border-b border-slate-200 px-4 py-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-xs font-bold text-slate-500 shrink-0">Subject:</span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                {renderedSubject}
              </span>
            </div>
            <AppCopyButton text={renderedSubject} size="sm" />
          </div>

          {/* Email Rendered Body */}
          <div className="p-6 text-xs sm:text-sm text-slate-900 leading-relaxed min-h-[220px] max-h-[380px] overflow-y-auto font-sans">
            <div
              className="rich-editor-content text-xs sm:text-sm text-slate-900 leading-relaxed font-sans"
              dangerouslySetInnerHTML={{ __html: renderedBody }}
            />
          </div>
        </div>
      </div>
    </AppModal>
  );
};
