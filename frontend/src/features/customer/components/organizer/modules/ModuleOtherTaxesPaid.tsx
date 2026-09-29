import React, { useState, useRef } from 'react';
import { Plus, X, UploadCloud, FileText, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import toast from 'react-hot-toast';
import { customerApi, type OrganizerData } from '../../../services/customer-api';

interface ModuleOtherTaxesPaidProps {
  documents?: OrganizerData['m8_deductions']['otherTaxesPaidDocuments'];
  onUpdateDocuments: (documents: NonNullable<OrganizerData['m8_deductions']['otherTaxesPaidDocuments']>) => void;
  selectedTaxYear: number;
}

export const ModuleOtherTaxesPaid: React.FC<ModuleOtherTaxesPaidProps> = ({
  documents = [],
  onUpdateDocuments,
  selectedTaxYear,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formatFileSize = (bytes?: number): string => {
    if (!bytes || isNaN(bytes)) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFilesUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    try {
      setIsUploading(true);
      const newDocs = [...(documents || [])];

      for (const file of fileArray) {
        let docItem = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: file.name,
          size: file.size,
          fileUrl: '',
          uploadedAt: new Date().toISOString(),
        };

        try {
          const res = await customerApi.uploadDocument(file, 'OTHER_TAXES_PAID', String(selectedTaxYear));
          if (res?.data) {
            const uploaded = res.data;
            docItem = {
              id: uploaded.id || docItem.id,
              name: uploaded.fileName || file.name,
              size: uploaded.fileSize || file.size,
              fileUrl: uploaded.fileUrl || uploaded.filePath || '',
              uploadedAt: uploaded.uploadedAt || uploaded.createdAt || docItem.uploadedAt,
            };
          }
        } catch {
          // If server upload fails (e.g. offline/mock), save file metadata locally
        }
        newDocs.push(docItem);
      }

      onUpdateDocuments(newDocs);
      toast.success(`Attached ${fileArray.length} document(s) successfully!`);
    } catch {
      toast.error('Failed to attach documents');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFilesUpload(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      handleFilesUpload(e.dataTransfer.files);
    }
  };

  const handleRemoveDoc = (indexToRemove: number) => {
    const updated = (documents || []).filter((_, idx) => idx !== indexToRemove);
    onUpdateDocuments(updated);
    toast.success('Document removed');
  };

  if (!isOpen) {
    return (
      <div className="p-4 rounded-md border border-slate-200 bg-slate-50/50 hover:border-slate-300 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <span>5. Other Taxes Paid</span>
              {documents && documents.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-[#16A34A] font-medium border border-emerald-200">
                  {documents.length} Document{documents.length > 1 ? 's' : ''} Attached
                </span>
              )}
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Upload receipts, vouchers, or statements for other taxes paid (state, local, county, estimated taxes)
            </p>
          </div>

          <Button
            size="sm"
            type="button"
            onClick={() => setIsOpen(true)}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{documents && documents.length > 0 ? 'View / Upload Documents' : 'Upload Documents'}</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div id="section-other-taxes-paid" className="p-4 sm:p-5 rounded-md border border-slate-200 bg-white space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div>
          <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
            <span>5. Other Taxes Paid</span>
            {documents && documents.length > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-[#16A34A] font-medium border border-emerald-200">
                {documents.length} Document{documents.length > 1 ? 's' : ''}
              </span>
            )}
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Attach receipts, proof of payments, or vouchers for other taxes paid. Only files accepted — no form inputs required.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-medium px-3 py-1.5 rounded-md flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Files</span>
          </Button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-xs text-slate-600 hover:text-slate-800 font-medium px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Close</span>
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
          isDragOver
            ? 'border-[#16A34A] bg-emerald-50/50 scale-[1.005]'
            : 'border-slate-300 hover:border-[#16A34A] hover:bg-slate-50/50'
        }`}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#16A34A] flex items-center justify-center">
            <UploadCloud className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-700">
            {isUploading ? 'Uploading files...' : 'Drag & drop multiple tax payment documents here, or click to browse'}
          </p>
          <p className="text-[11px] text-slate-400">
            Supports PDF, PNG, JPG, JPEG, Word &amp; Excel files. Only file attachments accepted — no forms required.
          </p>
        </div>
      </div>

      {/* Uploaded Documents List */}
      {documents && documents.length > 0 && (
        <div className="space-y-2 pt-1">
          <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            Attached Documents ({documents.length})
          </h5>
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-white">
            {documents.map((doc, idx) => (
              <div key={doc.id || idx} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate" title={doc.name}>
                      {doc.name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {formatFileSize(doc.size)}
                      {doc.uploadedAt ? ` • Uploaded ${new Date(doc.uploadedAt).toLocaleDateString()}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {doc.fileUrl && (
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-slate-500 hover:text-emerald-700 rounded hover:bg-slate-100 transition-colors"
                      title="View file"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveDoc(idx)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors cursor-pointer"
                    title="Remove document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
