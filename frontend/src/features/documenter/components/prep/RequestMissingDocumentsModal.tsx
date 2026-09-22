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

const CATEGORIES_BY_TYPE = [
  {
    type: 'INDIVIDUAL',
    title: '1. Individual Documents',
    icon: '👤',
    categories: [
      'W-2 Wage Statement (Employer)',
      '1099-INT Bank Interest Statement',
      '1099-DIV Dividend & Distribution',
      '1099-B Brokerage & Stock Sales',
      '1098 Mortgage Interest Statement',
      '1098-T Tuition Fees Statement',
      '1098-E Student Loan Interest',
      '1099-R / SSA-1099 Retirement & Pension',
      '1099-G State Refund / Unemployment',
      '1099-SA HSA Distributions',
      '1095-A / B / C Health Insurance Form',
      'Taxpayer ID / Passport / Visa Copy',
      'State ID / Driver\'s License Copy',
      'Prior Year 1040 Tax Return',
      'Form 8879 E-Sign Signature Form',
      'Daycare / Solar / Property Tax Receipts',
      'Rental Property Income / Expense Records',
    ],
  },
  {
    type: 'BUSINESS',
    title: '2. Business Documents',
    icon: '💼',
    categories: [
      'Schedule C Business Profit & Loss Ledger',
      '1099-MISC / 1099-NEC Self-Employment',
      '1099-K Payment Card Network (Stripe/PayPal)',
      'Schedule K-1 (Form 1065 / 1120-S)',
      'Form 1120 / 1120-S Corporate Tax Return',
      'Form 1065 Partnership Tax Return',
      'Business Profit & Loss Statement (P&L)',
      'Business Bank & Merchant Statements',
      'Articles of Incorporation / EIN Letter',
      'Business Invoices & Expense Receipts',
    ],
  },
  {
    type: 'TAX_COMPLIANCE',
    title: '3. Tax compliance FBAR/FATCA/Other',
    icon: '🛡️',
    categories: [
      'FBAR FinCEN 114 Foreign Indian Bank Accounts',
      'FATCA Form 8938 Specified Foreign Assets',
      'Indian Bank Statements (SBI/HDFC/ICICI NRE & NRO)',
      'Indian Fixed Deposits & Recurring Deposit Records',
      'Indian Income Tax Return (ITR) / Form 16 / Salary Slips',
      'Indian Form 26AS / AIS / TIS Annual Statement',
      'Indian Mutual Funds & Demat Capital Gains',
      'Traditional Insurance / ULIP Policy Records',
      'Foreign Real Estate Purchase & Sale Records',
      'Other Foreign Compliance Documents',
    ],
  },
  {
    type: 'TAX_AUDIT',
    title: '4. Tax Audit',
    icon: '⚖️',
    categories: [
      'IRS Notice / Audit Inquiry Letter (CP2000, CP501)',
      'State Tax Department Notice / Inquiry Letter',
      'Form 2848 Power of Attorney (Representation)',
      'Form 8821 Tax Information Authorization',
      'Audit Substantiation Expense Receipts & Proofs',
      'IRS Audit Examination Report / Closing Letter',
      'Tax Penalty Abatement Request Records',
    ],
  },
];

const ALL_DEFAULT_CATEGORIES = CATEGORIES_BY_TYPE.flatMap((g) => g.categories);

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
  const [activeTypeTab, setActiveTypeTab] = useState<string>('INDIVIDUAL');
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
    setSelectedCategories([...ALL_DEFAULT_CATEGORIES]);
  };

  const clearAll = () => {
    setSelectedCategories([]);
  };

  const selectCurrentTabCategories = () => {
    const group = CATEGORIES_BY_TYPE.find((g) => g.type === activeTypeTab);
    if (!group) return;
    const newItems = group.categories.filter((c) => !selectedCategories.includes(c));
    setSelectedCategories((prev) => [...prev, ...newItems]);
  };

  const clearCurrentTabCategories = () => {
    const group = CATEGORIES_BY_TYPE.find((g) => g.type === activeTypeTab);
    if (!group) return;
    setSelectedCategories((prev) => prev.filter((c) => !group.categories.includes(c)));
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

  const activeGroup = CATEGORIES_BY_TYPE.find((g) => g.type === activeTypeTab) || CATEGORIES_BY_TYPE[0];
  const activeTabSelectedCount = activeGroup.categories.filter((c) => selectedCategories.includes(c)).length;

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Missing Documents from Client"
      width="720px"
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
              Select documents across <strong>Individual</strong>, <strong>Business</strong>, <strong>Tax Compliance</strong> &amp; <strong>Tax Audit</strong> categories.
              {customerEmail && (
                <span className="block mt-0.5 font-medium text-slate-600">
                  Target Email: <strong>{customerEmail}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 4 Document Type Tabs */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Document Type Categories ({selectedCategories.length} total selected)</span>
            </label>
            <div className="flex items-center gap-2 text-[11px]">
              <button
                type="button"
                onClick={selectAll}
                className="text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
              >
                Select All ({ALL_DEFAULT_CATEGORIES.length})
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={clearAll}
                className="text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* 4 Tabs Header */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
            {CATEGORIES_BY_TYPE.map((g) => {
              const count = g.categories.filter((c) => selectedCategories.includes(c)).length;
              const isActive = activeTypeTab === g.type;
              return (
                <button
                  key={g.type}
                  type="button"
                  onClick={() => setActiveTypeTab(g.type)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer truncate ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <span className="shrink-0">{g.icon}</span>
                  <span className="truncate">{g.title.split('. ')[1]?.split(' ')[0] || g.type}</span>
                  {count > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Sub-Header with per-tab quick select */}
          <div className="flex items-center justify-between px-1 text-[11px]">
            <span className="font-bold text-slate-700">
              {activeGroup.title} ({activeTabSelectedCount}/{activeGroup.categories.length} selected)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectCurrentTabCategories}
                className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
              >
                Select {activeGroup.title.split('. ')[1]}
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={clearCurrentTabCategories}
                className="text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
              >
                Clear Section
              </button>
            </div>
          </div>

          {/* Category Grid for Active Tab */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50/50">
            {activeGroup.categories.map((category) => {
              const isSelected = selectedCategories.includes(category);
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs transition-all cursor-pointer border ${
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
              placeholder="Type other custom document name (e.g. Robinhood Crypto 1099-B, Indian Demat Statement)..."
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
            <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 max-h-24 overflow-y-auto">
              {selectedCategories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-white text-blue-800 border border-blue-200 shadow-2xs"
                >
                  <span className="truncate max-w-[200px]">{cat}</span>
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
