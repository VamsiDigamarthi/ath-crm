import React, { useState, useMemo, useEffect } from 'react';
import { AppModal } from '@/shared/components/AppModal';
import { Button } from '@/shared/components/Button';
import { AppSelect } from '@/shared/components/AppSelect';
import { Link2, Globe, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  type DocumentTypeId,
  DOCUMENT_TYPES,
  getCategoriesForType,
  getDefaultDriveLinkForType,
} from '@/shared/constants/document-taxonomy';

interface CustomerDriveLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    linkUrl: string;
    title?: string;
    documentCategory?: string;
    remarks?: string;
  }) => Promise<boolean>;
  isSubmitting: boolean;
  selectedTaxYear: string;
  activeDocType?: DocumentTypeId;
}

export const CustomerDriveLinkModal: React.FC<CustomerDriveLinkModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  selectedTaxYear,
  activeDocType = 'INDIVIDUAL',
}) => {
  const [modalDocType, setModalDocType] = useState<DocumentTypeId>(activeDocType);
  const [linkUrl, setLinkUrl] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(getDefaultDriveLinkForType(activeDocType));
  const [remarks, setRemarks] = useState('');
  const [urlError, setUrlError] = useState('');

  // Sync with prop when modal opens
  useEffect(() => {
    if (isOpen) {
      setModalDocType(activeDocType);
      setCategory(getDefaultDriveLinkForType(activeDocType));
    }
  }, [isOpen, activeDocType]);

  const handleSelectModalDocType = (typeId: DocumentTypeId) => {
    setModalDocType(typeId);
    setCategory(getDefaultDriveLinkForType(typeId));
  };

  const categoryOptions = useMemo(() => {
    const typeCategories = getCategoriesForType(modalDocType, true);
    return typeCategories.map((c) => ({
      label: c.label,
      value: c.value,
    }));
  }, [modalDocType]);

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) {
      setUrlError('URL is required');
      return false;
    }
    const trimmed = url.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setUrlError('Link must begin with http:// or https://');
      return false;
    }
    setUrlError('');
    return true;
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLinkUrl(val);
    if (urlError) validateUrl(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUrl(linkUrl)) return;

    const success = await onSubmit({
      linkUrl: linkUrl.trim(),
      title: title.trim() || undefined,
      documentCategory: category,
      remarks: remarks.trim() || undefined,
    });

    if (success) {
      setLinkUrl('');
      setTitle('');
      setCategory(getDefaultDriveLinkForType(modalDocType));
      setRemarks('');
      setUrlError('');
      onClose();
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setLinkUrl('');
    setTitle('');
    setCategory(getDefaultDriveLinkForType(activeDocType));
    setRemarks('');
    setUrlError('');
    onClose();
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload Google Drive / Cloud Link"
      subtitle={`Attach a shared cloud link (Google Drive, OneDrive, Dropbox) for TY ${selectedTaxYear}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 1. Document Type Switcher Tabs */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Select Document Section
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
            {DOCUMENT_TYPES.map((dt) => {
              const Icon = dt.icon;
              const isActive = modalDocType === dt.id;
              return (
                <button
                  key={dt.id}
                  type="button"
                  onClick={() => handleSelectModalDocType(dt.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer truncate ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#16A34A]' : 'text-slate-400'}`} />
                  <span className="truncate">{dt.number}) {dt.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. URL Input */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Drive / Cloud URL <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Globe className="w-4 h-4 text-indigo-500" />
            </div>
            <input
              type="url"
              value={linkUrl}
              onChange={handleUrlChange}
              placeholder="https://drive.google.com/drive/folders/... or OneDrive / Dropbox link"
              className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border bg-white text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 ${
                urlError
                  ? 'border-red-300 focus:ring-red-200'
                  : 'border-slate-200 focus:ring-emerald-200 focus:border-[#16A34A]'
              }`}
              required
            />
          </div>
          {urlError && (
            <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {urlError}
            </p>
          )}
          <p className="text-[10px] text-slate-400 mt-1">
            Please make sure the link sharing setting is set to &quot;Anyone with the link can view&quot; so our CPA team can access your tax slips.
          </p>
        </div>

        {/* 3. Category Dropdown (Filtered to Selected Tab) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Document Category for {DOCUMENT_TYPES.find(d => d.id === modalDocType)?.label}
          </label>
          <AppSelect
            options={categoryOptions}
            value={category}
            onChange={(val) => setCategory(val || categoryOptions[0]?.value || 'GOOGLE_DRIVE_LINK')}
            placeholder="Select Category"
          />
        </div>

        {/* 4. Title / Label Input */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Link Title / Description <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`e.g. 2025 ${DOCUMENT_TYPES.find(d => d.id === modalDocType)?.shortLabel} Statements Folder`}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-[#16A34A]"
          />
        </div>

        {/* 5. Remarks / Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Notes for CPA / Tax Preparer <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <textarea
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. Contains all statements and documents for this tax year."
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-[#16A34A] resize-none"
          />
        </div>

        {/* Info notice */}
        <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            Your link will be securely attached under <strong>{DOCUMENT_TYPES.find(d => d.id === modalDocType)?.label}</strong> for <strong>TY {selectedTaxYear}</strong> and reviewed by our CPA team.
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
            className="border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Attaching Link...' : 'Attach Drive Link'}</span>
          </Button>
        </div>
      </form>
    </AppModal>
  );
};
