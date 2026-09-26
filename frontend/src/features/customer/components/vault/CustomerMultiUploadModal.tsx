import React, { useRef, useMemo } from 'react';
import { AppModal } from '@/shared/components/AppModal';
import { Button } from '@/shared/components/Button';
import { AppSelect } from '@/shared/components/AppSelect';
import { 
  UploadCloud, 
  FileText, 
  Trash2, 
  Plus 
} from 'lucide-react';
import { type StagedFileItem } from '../../hooks/useCustomerDocuments';
import { 
  type DocumentTypeId, 
  DOCUMENT_TYPES,
  getCategoriesForType 
} from '@/shared/constants/document-taxonomy';

interface CustomerMultiUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  stagedFiles: StagedFileItem[];
  bulkCategory: string;
  onBulkCategoryChange: (cat: string) => void;
  onUpdateCategory: (id: string, cat: string) => void;
  onRemoveFile: (id: string) => void;
  onAddMoreFiles: (files: FileList | File[]) => void;
  onUploadAll: () => Promise<void>;
  uploading: boolean;
  uploadProgress: number;
  formatFileSize: (bytes: number) => string;
  selectedTaxYear: string;
  activeDocType?: DocumentTypeId;
}

export const CustomerMultiUploadModal: React.FC<CustomerMultiUploadModalProps> = ({
  isOpen,
  onClose,
  stagedFiles,
  bulkCategory,
  onBulkCategoryChange,
  onUpdateCategory,
  onRemoveFile,
  onAddMoreFiles,
  onUploadAll,
  uploading,
  uploadProgress,
  formatFileSize,
  selectedTaxYear,
  activeDocType = 'INDIVIDUAL',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeDocTypeDef = useMemo(() => {
    return DOCUMENT_TYPES.find((dt) => dt.id === activeDocType) || DOCUMENT_TYPES[0];
  }, [activeDocType]);

  const categoryOptions = useMemo(() => {
    return getCategoriesForType(activeDocType, false).map((c) => ({
      label: c.label,
      value: c.value,
    }));
  }, [activeDocType]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddMoreFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onAddMoreFiles(e.dataTransfer.files);
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={uploading ? () => {} : onClose}
      title={`Upload ${activeDocTypeDef.label} Documents (TY ${selectedTaxYear})`}
      subtitle={`Review categories and upload ${stagedFiles.length} file(s) under ${activeDocTypeDef.label}`}
      size="xl"
    >
      <div className="space-y-4">
        {/* Bulk Category Bar */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs">
            <span className="font-bold text-slate-800">Apply category to all files:</span>
            <p className="text-[11px] text-slate-400">Quickly tag all files in this upload batch</p>
          </div>
          <div className="w-72">
            <AppSelect
              options={[{ label: '-- Keep Individual Categories --', value: '' }, ...categoryOptions]}
              value={bulkCategory}
              onChange={(val) => onBulkCategoryChange(val || '')}
              placeholder="Select Bulk Category"
            />
          </div>
        </div>

        {/* Staged Files List */}
        <div className="max-h-72 overflow-y-auto space-y-2 border border-slate-100 rounded-xl p-1 pr-2">
          {stagedFiles.map((item, idx) => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 text-[#16A34A] flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 truncate" title={item.file.name}>
                    {idx + 1}. {item.file.name}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {formatFileSize(item.file.size)}
                  </div>
                </div>
              </div>

              {/* Per-File Category Selector & Remove */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-64">
                  <AppSelect
                    options={categoryOptions}
                    value={item.category}
                    onChange={(val) => onUpdateCategory(item.id, val || categoryOptions[0]?.value || 'W2_WAGES')}
                    placeholder="Document Category"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveFile(item.id)}
                  disabled={uploading}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Remove this file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {stagedFiles.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400">
              No files staged. Please add files using the dropzone below.
            </div>
          )}
        </div>

        {/* Add More Files Dropzone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/20 transition-all text-center cursor-pointer group"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.docx,.doc,.xlsx,.xls,.csv,.txt,.rtf,.zip"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-600 group-hover:text-[#16A34A]">
            <Plus className="w-4 h-4" />
            <span>Add More Files (PDF, Images, Excel, Word)</span>
          </div>
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-1.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
              <span className="flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 animate-bounce text-[#16A34A]" />
                Uploading {stagedFiles.length} documents...
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-emerald-200 overflow-hidden">
              <div
                className="h-full bg-[#16A34A] transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="text-xs text-slate-500 font-medium">
            Total: <strong>{stagedFiles.length} file(s)</strong>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={uploading}
              className="border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={onUploadAll}
              disabled={uploading || stagedFiles.length === 0}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{uploading ? 'Uploading...' : `Upload All (${stagedFiles.length} Files)`}</span>
            </Button>
          </div>
        </div>
      </div>
    </AppModal>
  );
};
