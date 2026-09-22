import React, { useState } from 'react';
import { AppModal } from '@/shared/components/AppModal';
import { Button } from '@/shared/components/Button';
import { 
  Bell, 
  Mail, 
  Send, 
  CheckSquare, 
  Square, 
  Plus, 
  X, 
  FileText, 
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '@/lib/api-client';

export interface RequestMissingDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId?: string;
  applicationId?: string;
  customerName: string;
  customerEmail?: string;
  onRequestSent?: () => void;
}

const DEFAULT_CATEGORIES = [
  'W-2 Wage Statement (Employer)',
  '1099-INT Bank Interest Statement',
  '1099-DIV Dividend & Distribution',
  '1099-B Brokerage & Stock Sales',
  '1099-MISC / 1099-NEC Self-Employment',
  '1099-R / SSA-1099 Retirement & Pension',
  '1098 Mortgage Interest Statement',
  '1095-A / B / C Health Insurance Form',
  'Taxpayer ID / Passport / Visa Copy',
  'State ID / Driver\'s License Copy',
  'Prior Year 1040 Tax Return',
  'FBAR / Foreign Bank Account Summary',
  'Schedule C Business Expense Receipts',
  'Rental Property Income / Expense Records',
  'Form 8879 E-Sign Signature Form',
];

export const RequestMissingDocumentsModal: React.FC<RequestMissingDocumentsModalProps> = ({
  isOpen,
  onClose,
  leadId,
  applicationId,
  customerName,
  customerEmail,
  onRequestSent,
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [customDocInput, setCustomDocInput] = useState<string>('');
  const [customNotes, setCustomNotes] = useState<string>('');
  const [sendInApp, setSendInApp] = useState<boolean>(true);
  const [sendEmail, setSendEmail] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);

  const effectiveId = leadId || applicationId;

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleAddCustomDoc = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customDocInput.trim();
    if (!trimmed) return;
    if (!selectedCategories.includes(trimmed)) {
      setSelectedCategories((prev) => [...prev, trimmed]);
    }
    setCustomDocInput('');
  };

  const removeCategory = (cat: string) => {
    setSelectedCategories((prev) => prev.filter((c) => c !== cat));
  };

  const selectAll = () => {
    setSelectedCategories([...DEFAULT_CATEGORIES]);
  };

  const clearAll = () => {
    setSelectedCategories([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!effectiveId) {
      toast.error('Lead ID not found');
      return;
    }

    if (selectedCategories.length === 0 && !customNotes.trim()) {
      toast.error('Please select at least one document or write a note for the client.');
      return;
    }

    if (!sendInApp && !sendEmail) {
      toast.error('Please select at least one delivery option (In-App Notification or Email).');
      return;
    }

    try {
      setIsSending(true);
      const res: any = await apiClient.post(`/documenter/leads/${effectiveId}/request-documents`, {
        documentCategories: selectedCategories,
        customNotes: customNotes.trim(),
        sendInApp,
        sendEmail,
      });

      toast.success(res?.message || `Successfully sent missing documents request to ${customerName}! 🚀`);
      if (onRequestSent) {
        onRequestSent();
      }
      onClose();
      // Reset state
      setSelectedCategories([]);
      setCustomNotes('');
      setCustomDocInput('');
    } catch (err: any) {
      console.error('Failed to send missing documents request:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Failed to send request');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Missing Documents from Client"
      width="680px"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-sans py-1 text-slate-800">
        {/* Banner Header */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 text-xs flex items-start gap-2.5">
          <div className="p-2 rounded-lg bg-purple-100 text-purple-700 mt-0.5">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-purple-950 text-sm">
              Notify {customerName} for Required Tax Documents
            </div>
            <div className="text-purple-700 text-[11px] mt-0.5">
              Select the documents needed to continue preparation. The taxpayer will receive an instant checklist alert to upload them into their vault.
              {customerEmail && (
                <span className="block mt-0.5 font-medium text-slate-600">
                  Target Email: <strong>{customerEmail}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Category Multi-Select Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Select Missing Document Categories ({selectedCategories.length} selected)</span>
            </label>
            <div className="flex items-center gap-2 text-[11px]">
              <button
                type="button"
                onClick={selectAll}
                className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
              >
                Select All
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={clearAll}
                className="text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Quick Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50/50">
            {DEFAULT_CATEGORIES.map((category) => {
              const isSelected = selectedCategories.includes(category);
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className={`flex items-center gap-2.5 p-2 rounded-lg text-left text-xs transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold shadow-2xs'
                      : 'bg-white border-slate-200/80 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="shrink-0 text-emerald-600">
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-[#16A34A] fill-emerald-100" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <span className="truncate">{category}</span>
                </button>
              );
            })}
          </div>

          {/* Add Other Custom Document */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={customDocInput}
              onChange={(e) => setCustomDocInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomDoc();
                }
              }}
              placeholder="Type other custom document name (e.g. Robinhood Crypto 1099-B)..."
              className="flex-1 text-xs border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1.5 focus:ring-blue-500 bg-white placeholder-slate-400"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleAddCustomDoc()}
              disabled={!customDocInput.trim()}
              className="border-slate-300 text-slate-700 text-xs font-semibold shrink-0 cursor-pointer h-8"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Doc</span>
            </Button>
          </div>

          {/* Selected Badges Pill Box */}
          {selectedCategories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl bg-blue-50/70 border border-blue-200">
              {selectedCategories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-white text-blue-800 border border-blue-200 shadow-2xs"
                >
                  <span>{cat}</span>
                  <button
                    type="button"
                    onClick={() => removeCategory(cat)}
                    className="text-slate-400 hover:text-rose-600 rounded-full cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Comment / Personalized Message Box */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
            <span>Special Instructions / Comment for Client (Optional)</span>
            <span className="text-[10px] text-slate-400 font-normal">Will be included in notification and email</span>
          </label>
          <textarea
            rows={3}
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            placeholder="e.g. Please make sure your W-2 is the final copy from employer, and ensure all pages of the brokerage 1099-B are attached."
            className="w-full text-xs border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-1.5 focus:ring-emerald-500 bg-white placeholder-slate-400 leading-relaxed"
          />
        </div>

        {/* Delivery Options (In-App Notification & Email) */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Send Delivery Channels (Select one or both)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* 1. In-App Notification */}
            <label
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                sendInApp
                  ? 'bg-purple-50/80 border-purple-300 text-purple-950 font-semibold shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <input
                type="checkbox"
                checked={sendInApp}
                onChange={(e) => setSendInApp(e.target.checked)}
                className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <Bell className="w-3.5 h-3.5 text-purple-600" />
                  <span>Portal In-App Notification</span>
                </div>
                <div className="text-[11px] text-slate-500 font-normal leading-tight">
                  Displays notification alert inside the client's secure dashboard with direct vault upload link.
                </div>
              </div>
            </label>

            {/* 2. Email Dispatch */}
            <label
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                sendEmail
                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-semibold shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <Mail className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Direct Client Email</span>
                </div>
                <div className="text-[11px] text-slate-500 font-normal leading-tight">
                  Dispatches an official email with requested document checklist to {customerEmail || 'taxpayer email'}.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="text-[11px] text-slate-500 font-medium">
            Channels: {[sendInApp && 'In-App', sendEmail && 'Email'].filter(Boolean).join(' + ') || 'None selected'}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              loading={isSending}
              disabled={isSending || (selectedCategories.length === 0 && !customNotes.trim()) || (!sendInApp && !sendEmail)}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold px-4 cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Sending Request...' : 'Send Request to Client'}</span>
            </Button>
          </div>
        </div>
      </form>
    </AppModal>
  );
};
