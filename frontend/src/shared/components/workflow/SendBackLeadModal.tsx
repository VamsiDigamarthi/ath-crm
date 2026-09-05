import React, { useState } from 'react';
import { 
  Plus, 
  X, 
  RotateCcw, 
  CheckCircle2, 
} from 'lucide-react';
import { AppModal } from '@/shared/components/AppModal';
import { Button } from '@/shared/components/Button';
import apiClient from '@/lib/api-client';
import toast from 'react-hot-toast';

export type DepartmentKey = 'DOCUMENTER' | 'PREPARATION' | 'SALES';

export interface TargetDepartmentOption {
  key: DepartmentKey;
  label: string;
  badge: string;
  description: string;
  roleIcon?: React.ReactNode;
}

export interface SendBackLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  taxpayerName: string;
  taxYear?: number;
  currentDepartment: 'PREPARATION' | 'QA_REVIEW' | 'SALES' | 'FILING';
  assignedDocumenterName?: string;
  assignedPreparerName?: string;
  assignedSalesCloserName?: string;
  availableTargetDepartments?: TargetDepartmentOption[];
  defaultTargetDepartment?: DepartmentKey;
  onRevertSuccess?: (result: any) => void;
}

const COMMON_REVERT_REASONS = [
  { id: 'MISSING_DOCUMENTS', label: 'Missing Required Tax Documents', desc: 'W-2s, 1099s, or health coverage forms not uploaded' },
  { id: 'INCOMPLETE_ORGANIZER', label: 'Incomplete Tax Organizer', desc: 'Missing answers for residency, dependents, or foreign assets' },
  { id: 'DATA_DISCREPANCY', label: 'Data Discrepancy / Validation Error', desc: 'Uploaded documents mismatch entered figures or SSN' },
  { id: 'TAXPAYER_CLARIFICATION', label: 'Taxpayer Clarification Needed', desc: 'Need direct client confirmation on marital status or state residency' },
  { id: 'OTHER', label: 'Other Special Instructions', desc: 'Custom reasons specified in notes below' },
];

const SALES_REVERT_REASONS = [
  { id: 'TAX_REDUCTION_REQUEST', label: 'Taxpayer Requested Lower Tax / Review Deductions', desc: 'Client requested CPA review deductions, credits or minimize balance due' },
  { id: 'MISSING_DOCUMENTS', label: 'Client Uploading Additional Documents', desc: 'Client has additional W-2, 1099, 1098, or expense receipts to attach' },
  { id: 'FILING_STATUS_CHANGE', label: 'Filing Status / Dependent Adjustment', desc: 'Client requested change to Single / Married Filing Jointly / Dependents' },
  { id: 'DATA_DISCREPANCY', label: 'Data Discrepancy / Calculation Adjustment', desc: 'Income or withholding figures need correction after client discussion' },
  { id: 'TAXPAYER_CLARIFICATION', label: 'Taxpayer Clarification / Policy Inquiry', desc: 'Need preparer or documenter to verify specific client rules' },
  { id: 'OTHER', label: 'Other Pitch Discussion Notes', desc: 'Specific feedback captured during sales call' },
];

const FILING_REVERT_REASONS = [
  { id: 'XML_SCHEMA_ERROR', label: 'IRS MeF XML Schema / Calculation Error', desc: 'Pre-transmission XML validation failed or Math error on Form 1040/Schedules' },
  { id: 'PIN_AUTH_FAILURE', label: 'Form 8879 PIN / Authorization Issue', desc: 'Taxpayer PIN signature missing or invalid E-File authorization' },
  { id: 'DIRECT_DEPOSIT_ERROR', label: 'Direct Deposit / Banking Info Error', desc: 'Routing or account number rejected during pre-validation gate' },
  { id: 'MISSING_DOCUMENTS', label: 'Missing Supporting Schedules / Attachments', desc: 'W-2/1099 attachments or PDF state schedules missing' },
  { id: 'PAYMENT_LINK_DISCREPANCY', label: 'Service Fee / Invoice Payment Discrepancy', desc: 'Invoice fee payment or transaction status discrepancy needing Sales review' },
  { id: 'TAXPAYER_CLARIFICATION', label: 'Taxpayer Clarification / Re-authentication', desc: 'Identity verification or taxpayer clarification required' },
  { id: 'OTHER', label: 'Other Filing Operations Issue', desc: 'Custom reasons detailed in notes below' },
];

const SUGGESTED_DOC_TAGS = [
  'Form W-2 (Wage Statement)',
  'Form 1099-B (Brokerage / Crypto)',
  'Form 1099-INT / 1099-DIV',
  'Form 1095-A (Health Insurance Marketplace)',
  'Form 1098 (Mortgage Interest)',
  'Form 1099-NEC / 1099-MISC',
  'Spouse ID / SSN Copy',
  'Dependent SSN / Birth Certificate',
  'State Tax Statement',
  'Prior Year 1040 Return',
];

export const SendBackLeadModal: React.FC<SendBackLeadModalProps> = ({
  isOpen,
  onClose,
  applicationId,
  taxpayerName,
  taxYear = 2025,
  currentDepartment = 'PREPARATION',
  assignedDocumenterName,
  assignedPreparerName,
  assignedSalesCloserName,
  availableTargetDepartments = [
    {
      key: 'DOCUMENTER',
      label: 'Documenter Department (Intake & Verification)',
      badge: 'DOC_OUTREACH',
      description: 'Send back to Documenter agent to collect missing documents or follow up with the taxpayer.',
    },
  ],
  defaultTargetDepartment = 'DOCUMENTER',
  onRevertSuccess,
}) => {
  const reasonList =
    currentDepartment === 'FILING'
      ? FILING_REVERT_REASONS
      : currentDepartment === 'SALES'
      ? SALES_REVERT_REASONS
      : COMMON_REVERT_REASONS;

  const getDefaultReason = () => {
    if (currentDepartment === 'FILING') return 'XML_SCHEMA_ERROR';
    if (currentDepartment === 'SALES') return 'TAX_REDUCTION_REQUEST';
    return 'MISSING_DOCUMENTS';
  };

  const [targetDepartment, setTargetDepartment] = useState<DepartmentKey>(defaultTargetDepartment);
  const [selectedReason, setSelectedReason] = useState<string>(getDefaultReason());
  const [selectedDocTags, setSelectedDocTags] = useState<string[]>([]);
  const [customDocInput, setCustomDocInput] = useState<string>('');
  const [revertNotes, setRevertNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  React.useEffect(() => {
    if (isOpen) {
      setTargetDepartment(defaultTargetDepartment);
      setSelectedReason(getDefaultReason());
      setSelectedDocTags([]);
      setCustomDocInput('');
      setRevertNotes('');
    }
  }, [isOpen, defaultTargetDepartment, currentDepartment]);

  const toggleDocTag = (tag: string) => {
    if (selectedDocTags.includes(tag)) {
      setSelectedDocTags((prev) => prev.filter((t) => t !== tag));
    } else {
      setSelectedDocTags((prev) => [...prev, tag]);
    }
  };

  const handleAddCustomDoc = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = customDocInput.trim();
    if (trimmed && !selectedDocTags.includes(trimmed)) {
      setSelectedDocTags((prev) => [...prev, trimmed]);
      setCustomDocInput('');
    }
  };

  const handleRemoveDocTag = (tag: string) => {
    setSelectedDocTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revertNotes.trim() || revertNotes.trim().length < 5) {
      toast.error('Please provide clear instructions or notes for the recipient agent (min 5 characters).');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        applicationId,
        sourceDepartment: currentDepartment,
        targetDepartment,
        reasonCategory: selectedReason,
        missingDocumentTypes: selectedDocTags,
        revertNotes: revertNotes.trim(),
      };

      const response: any = await apiClient.post('/workflow/revert', payload);
      const data = response?.data || response;

      toast.success(
        `Lead successfully reverted back to ${
          targetDepartment === 'DOCUMENTER' ? 'Documenter Department' : targetDepartment
        }!`,
        { duration: 4500 }
      );

      if (onRevertSuccess) {
        onRevertSuccess(data);
      }
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to revert lead stage';
      toast.error(msg);
      console.error('Workflow revert error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={() => !isSubmitting && onClose()}
      title="Send Back & Revert Return File"
      width="840px"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-sans text-slate-800">
        {/* 1. Header Information Banner */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-50/80 to-orange-50/40 border border-amber-200/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/20">
              <RotateCcw className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm tracking-tight">{taxpayerName}</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  TY {taxYear} Form 1040
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Transfer return back to preceding stage for tax calculation adjustment or additional paperwork.
              </p>
            </div>
          </div>

          <div className="text-right shrink-0 text-xs hidden sm:block">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Current Department</span>
            <span className="font-bold text-slate-800 bg-white px-2.5 py-1 rounded-md border border-slate-200 inline-block mt-0.5">
              {currentDepartment}
            </span>
          </div>
        </div>

        {/* 2. Target Department Selector */}
        {availableTargetDepartments.length > 1 ? (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Send Back To Department: <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableTargetDepartments.map((dept) => {
                const isSelected = targetDepartment === dept.key;
                return (
                  <button
                    key={dept.key}
                    type="button"
                    onClick={() => setTargetDepartment(dept.key)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-slate-900">{dept.label}</span>
                      <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-amber-600 text-white' : 'border border-slate-300 bg-white'
                      }`}>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">{dept.description}</p>
                    {dept.key === 'SALES' && assignedSalesCloserName && (
                      <div className="text-[10px] font-semibold text-blue-700 mt-1.5 pt-1 border-t border-slate-100 flex items-center gap-1">
                        <span>Assigned Closer:</span>
                        <span className="font-bold">{assignedSalesCloserName}</span>
                      </div>
                    )}
                    {dept.key === 'PREPARATION' && assignedPreparerName && (
                      <div className="text-[10px] font-semibold text-emerald-700 mt-1.5 pt-1 border-t border-slate-100 flex items-center gap-1">
                        <span>Assigned Preparer:</span>
                        <span className="font-bold">{assignedPreparerName}</span>
                      </div>
                    )}
                    {dept.key === 'DOCUMENTER' && assignedDocumenterName && (
                      <div className="text-[10px] font-semibold text-indigo-700 mt-1.5 pt-1 border-t border-slate-100 flex items-center gap-1">
                        <span>Assigned Documenter:</span>
                        <span className="font-bold">{assignedDocumenterName}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Destination Department:</span>
              <span className="font-bold text-slate-900">
                {availableTargetDepartments[0]?.label || 'Documenter Department (Intake Queue)'}
              </span>
            </div>
            {targetDepartment === 'DOCUMENTER' && assignedDocumenterName ? (
              <span className="text-[11px] text-indigo-600 font-semibold">
                Assigned: {assignedDocumenterName}
              </span>
            ) : targetDepartment === 'PREPARATION' && assignedPreparerName ? (
              <span className="text-[11px] text-emerald-700 font-semibold">
                Assigned: {assignedPreparerName}
              </span>
            ) : targetDepartment === 'SALES' && assignedSalesCloserName ? (
              <span className="text-[11px] text-blue-700 font-semibold">
                Assigned: {assignedSalesCloserName}
              </span>
            ) : null}
          </div>
        )}

        {/* 3. Main 2-Column Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-1">
          {/* Left Column (7 Cols): Reason Category & Revert Notes */}
          <div className="lg:col-span-7 space-y-3.5">
            {/* Reason Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Primary Reason for Revert: <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all cursor-pointer shadow-2xs"
              >
                {reasonList.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label} — {r.desc}
                  </option>
                ))}
              </select>
            </div>

            {/* Revert Instructions / Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Instructions &amp; Feedback for Recipient Agent: <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                value={revertNotes}
                onChange={(e) => setRevertNotes(e.target.value)}
                placeholder={
                  currentDepartment === 'FILING'
                    ? 'e.g. IRS MeF XML validation failed on Form 1040 Line 25b or Form 8879 PIN authorization issue. Please review and adjust.'
                    : currentDepartment === 'SALES'
                    ? 'e.g. Taxpayer requested reducing balance due. Stated they have $3,500 unreimbursed expenses and wants to evaluate filing as Married Filing Jointly instead of Single. Please adjust 1040.'
                    : 'e.g. Taxpayer reported Robinhood stock trades but uploaded 1099 is corrupted. Please call the client to re-upload Form 1099-B so we can finish drafting Part 1 Capital Gains.'
                }
                required
                className="w-full p-3 text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all leading-relaxed shadow-2xs resize-none"
              />
              <p className="text-[11px] text-slate-400">
                Instructions are recorded in the immutable Audit Trail and sent as an in-app priority notification.
              </p>
            </div>
          </div>

          {/* Right Column (5 Cols): Missing Documents Tag Selector */}
          <div className="lg:col-span-5 space-y-2.5 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Missing Documents Checklist:
                </label>
                <span className="text-[10px] font-semibold text-slate-400">
                  {selectedDocTags.length > 0 ? `${selectedDocTags.length} selected` : 'Optional'}
                </span>
              </div>

              {/* Tag Quick-Select Pills */}
              <div className="flex flex-wrap gap-1 max-h-[140px] overflow-y-auto pr-1">
                {SUGGESTED_DOC_TAGS.map((docTag) => {
                  const isSelected = selectedDocTags.includes(docTag);
                  return (
                    <button
                      key={docTag}
                      type="button"
                      onClick={() => toggleDocTag(docTag)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      <span>{docTag}</span>
                      {isSelected && <CheckCircle2 className="w-2.5 h-2.5 text-white ml-0.5" />}
                    </button>
                  );
                })}
              </div>

              {/* Custom Document Input */}
              <div className="flex items-center gap-1.5 pt-1">
                <input
                  type="text"
                  value={customDocInput}
                  onChange={(e) => setCustomDocInput(e.target.value)}
                  onKeyDown={handleAddCustomDoc}
                  placeholder="Other form (e.g. Schedule C, 1099-K)..."
                  className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddCustomDoc}
                  disabled={!customDocInput.trim()}
                  className="text-xs font-bold border-slate-200 cursor-pointer h-7 px-2"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add</span>
                </Button>
              </div>
            </div>

            {/* Selected Custom Tags Chips */}
            {selectedDocTags.length > 0 && (
              <div className="p-2 bg-amber-50 rounded-lg border border-amber-200/80 flex flex-wrap gap-1 mt-1">
                <span className="text-[10px] uppercase font-bold text-amber-800 self-center mr-1">
                  Requested:
                </span>
                {selectedDocTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 border border-amber-300"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDocTag(tag)}
                      className="hover:text-rose-700 cursor-pointer"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 4. Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || !revertNotes.trim()}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer px-4 h-9"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
            <span>
              {isSubmitting
                ? 'Reverting Lead...'
                : targetDepartment === 'SALES'
                ? 'Send Back to Sales Closer'
                : targetDepartment === 'PREPARATION'
                ? 'Send Back to Tax Preparer'
                : targetDepartment === 'DOCUMENTER'
                ? 'Send Back to Documenter'
                : 'Send Back Lead'}
            </span>
          </Button>
        </div>
      </form>
    </AppModal>
  );
};
