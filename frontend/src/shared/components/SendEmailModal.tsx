import React, { useState, useEffect } from 'react';
import { Mail, Send, Sparkles, UserCheck, Shield } from 'lucide-react';
import { AppModal } from './AppModal';
import { Button } from './Button';
import { AppInput } from './AppInput';
import { AppSelect, type SelectOption } from './AppSelect';
import { EmailTemplateRichEditor } from '@/features/admin/components/EmailTemplateRichEditor';
import { emailTemplateService } from '@/features/admin/services/email-template-service';
import type { EmailTemplateItem } from '@/features/admin/types/email-template.types';
import { useAuthStore } from '@/features/auth/store/auth-store';
import toast from 'react-hot-toast';

export interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId?: string;
  recipientEmail?: string;
  recipientName?: string;
  taxYear?: number | string;
  visaType?: string;
  filingStatus?: string;
  fedRefund?: number | string;
  stateRefund?: number | string;
  totalRefund?: number | string;
  onSuccess?: () => void;
}

export const SendEmailModal: React.FC<SendEmailModalProps> = ({
  isOpen,
  onClose,
  applicationId,
  recipientEmail: initialRecipientEmail = '',
  recipientName = '',
  taxYear = 2025,
  visaType = 'Taxpayer',
  filingStatus = 'Active',
  fedRefund = '0',
  stateRefund = '0',
  totalRefund = '0',
  onSuccess,
}) => {
  const { user } = useAuthStore();

  const [templates, setTemplates] = useState<EmailTemplateItem[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState<boolean>(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  const [recipientEmail, setRecipientEmail] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [body, setBody] = useState<string>('');

  const [isSending, setIsSending] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<{
    recipientEmail?: string;
    subject?: string;
    body?: string;
  }>({});

  // Reset form when modal opens or target recipient changes
  useEffect(() => {
    if (isOpen) {
      setRecipientEmail(initialRecipientEmail || '');
      setSubject('');
      setBody('');
      setSelectedTemplateId('');
      setFormErrors({});
      loadAvailableTemplates();
    }
  }, [isOpen, initialRecipientEmail]);

  // Fetch available templates configured for this user's role
  const loadAvailableTemplates = async () => {
    try {
      setIsLoadingTemplates(true);
      const res = await emailTemplateService.getAvailableTemplates();
      if (res && res.data) {
        setTemplates(res.data);
      }
    } catch (err) {
      console.error('Failed to load available templates:', err);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  // Replace variable placeholders with current customer & agent context
  const interpolateVariables = (rawContent: string): string => {
    if (!rawContent) return '';

    const agentName =
      `${user?.firstName || ''} ${user?.lastName || ''}`.trim() ||
      user?.email ||
      'Tax Specialist';
    const agentEmail = user?.smtpEmail || user?.email || 'support@taxcrm.com';

    return rawContent
      .replace(/\{\{taxpayer_name\}\}/g, recipientName || 'Valued Taxpayer')
      .replace(/\{\{tax_year\}\}/g, String(taxYear || 2025))
      .replace(/\{\{visa_type\}\}/g, visaType || 'Taxpayer')
      .replace(/\{\{assigned_agent\}\}/g, agentName)
      .replace(/\{\{assigned_agent_email\}\}/g, agentEmail)
      .replace(/\{\{fed_refund\}\}/g, `$${fedRefund}`)
      .replace(/\{\{state_refund\}\}/g, `$${stateRefund}`)
      .replace(/\{\{total_refund\}\}/g, `$${totalRefund}`)
      .replace(/\{\{filing_status\}\}/g, filingStatus || 'Active')
      .replace(/\{\{company_name\}\}/g, 'TaxCRM')
      .replace(
        /\{\{portal_link\}\}/g,
        'https://taxcrm.com/customer/organizer'
      );
  };

  // Handle template selection
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (!templateId) return;

    const matched = templates.find((t) => t.id === templateId);
    if (matched) {
      const interpolatedSubject = interpolateVariables(matched.subject);
      const interpolatedBody = interpolateVariables(matched.body);

      setSubject(interpolatedSubject);
      setBody(interpolatedBody);

      // Clear errors on field updates
      setFormErrors((prev) => ({
        ...prev,
        subject: undefined,
        body: undefined,
      }));
    }
  };

  const validateForm = () => {
    const errors: { recipientEmail?: string; subject?: string; body?: string } = {};

    if (!recipientEmail || recipientEmail.trim() === '') {
      errors.recipientEmail = 'Recipient email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail.trim())) {
      errors.recipientEmail = 'Please enter a valid email address';
    }

    if (!subject || subject.trim() === '') {
      errors.subject = 'Subject line is required';
    }

    if (!body || body.trim() === '' || body === '<p></p>' || body === '<br>') {
      errors.body = 'Email body content cannot be empty';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSendEmail = async () => {
    if (!validateForm()) return;

    try {
      setIsSending(true);
      await emailTemplateService.sendStaffEmail({
        applicationId,
        recipientEmail: recipientEmail.trim().toLowerCase(),
        subject: subject.trim(),
        body,
        templateId: selectedTemplateId || undefined,
      });

      toast.success('Email dispatched successfully and logged to audit trail! 🚀');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Failed to send email:', err);
      toast.error(
        err?.response?.data?.message ||
          'Failed to send email. Please check your SMTP configuration.'
      );
    } finally {
      setIsSending(false);
    }
  };

  const templateOptions: SelectOption[] = [
    { label: '-- Write Custom Email (No Template) --', value: '' },
    ...templates.map((t) => ({
      label: t.name,
      value: t.id,
    })),
  ];

  const senderName =
    `${user?.firstName || ''} ${user?.lastName || ''}`.trim() ||
    user?.email ||
    'Staff Member';
  const senderSmtpEmail = user?.smtpEmail || user?.email || 'user@taxcrm.com';

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      width="780px"
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#16A34A] flex items-center justify-center shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <span className="text-base font-bold text-slate-900 block leading-tight">
              Send Email to Taxpayer
            </span>
            <span className="text-[11px] font-normal text-slate-500 block">
              Dispatches directly to client via configured Gmail SMTP and logs to audit trail.
            </span>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted SMTP Dispatch &amp; DB Audit Record</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSending}
              className="text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSendEmail}
              disabled={isSending}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Send className={`w-3.5 h-3.5 ${isSending ? 'animate-spin' : ''}`} />
              <span>{isSending ? 'Sending Email...' : 'Send Email'}</span>
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 font-sans">
        {/* Sender SMTP Info Card */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 truncate">
                  Sender: {senderName}
                </span>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Gmail SMTP
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium block truncate">
                Dispatched from: <strong className="text-slate-700">{senderSmtpEmail}</strong>
              </span>
            </div>
          </div>

          {recipientName && (
            <div className="text-right shrink-0 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">
                Client Target
              </span>
              <span className="text-xs font-bold text-slate-800 block">
                {recipientName} (TY {taxYear})
              </span>
            </div>
          )}
        </div>

        {/* Template Selector Dropdown */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 tracking-tight flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Select Configured Email Template</span>
            </label>
            <span className="text-[11px] text-slate-400 font-medium">
              Filtered for role: <strong>{user?.role || 'Staff'}</strong>
            </span>
          </div>

          <AppSelect
            options={templateOptions}
            value={selectedTemplateId}
            onChange={handleTemplateChange}
            placeholder={
              isLoadingTemplates
                ? 'Loading role-based templates...'
                : '-- Choose an email template to populate --'
            }
            disabled={isLoadingTemplates || isSending}
            className="w-full"
          />
        </div>

        {/* Recipient Email & Subject Fields */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Recipient Email */}
          <div className="md:col-span-5 space-y-1">
            <label className="text-xs font-bold text-slate-700 tracking-tight flex items-center gap-1">
              <span>Recipient Email</span>
              <span className="text-rose-500 font-bold">*</span>
            </label>
            <AppInput
              type="email"
              value={recipientEmail}
              onChange={(e) => {
                setRecipientEmail(e.target.value);
                if (formErrors.recipientEmail) {
                  setFormErrors((prev) => ({ ...prev, recipientEmail: undefined }));
                }
              }}
              placeholder="customer@example.com"
              leftIcon={<Mail className="w-3.5 h-3.5 text-slate-400" />}
              error={formErrors.recipientEmail}
              disabled={isSending}
            />
          </div>

          {/* Subject Line */}
          <div className="md:col-span-7 space-y-1">
            <label className="text-xs font-bold text-slate-700 tracking-tight flex items-center gap-1">
              <span>Subject Line</span>
              <span className="text-rose-500 font-bold">*</span>
            </label>
            <AppInput
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                if (formErrors.subject) {
                  setFormErrors((prev) => ({ ...prev, subject: undefined }));
                }
              }}
              placeholder="e.g. Action Required: Tax Year 2025 Documents..."
              error={formErrors.subject}
              disabled={isSending}
            />
          </div>
        </div>

        {/* Rich Email Body Editor */}
        <div className="space-y-1">
          <EmailTemplateRichEditor
            value={body}
            onChange={(val) => {
              setBody(val);
              if (formErrors.body) {
                setFormErrors((prev) => ({ ...prev, body: undefined }));
              }
            }}
            label="Email Message Content"
            placeholder="Type your message to the taxpayer here, or choose a template above..."
            error={formErrors.body}
          />
        </div>
      </div>
    </AppModal>
  );
};
