import React from 'react';
import { UploadCloud, FileText, X, RotateCcw, FileUp } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppSelect } from '@/shared/components/AppSelect';

export const UPLOAD_CATEGORIES = [
  { label: 'W-2 Wage Statement (Employer)', value: 'W2_WAGES' },
  { label: '1099-B Stock & Brokerage (Robinhood)', value: '1099_BROKERAGE' },
  { label: '1099-INT / 1099-DIV Bank Interest', value: '1099_INT_DIV' },
  { label: 'FBAR / Indian Bank Statements (SBI NRE)', value: 'FBAR_FOREIGN' },
  { label: 'Form 1098 Mortgage Interest', value: 'MORTGAGE_1098' },
  { label: 'Visa Copy & I-797 Approval Notice', value: 'VISA_IDENTITY' },
  { label: 'Other Deduction Receipts', value: 'OTHER' },
];

interface VaultUploadDropzoneProps {
  uploadCategory: string;
  setUploadCategory: (cat: string) => void;
  stagedFile: File | null;
  uploading: boolean;
  uploadProgress: number;
  isDragOver: boolean;
  setIsDragOver: (drag: boolean) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  handleConfirmUpload: () => void;
  handleCancelStagedFile: () => void;
  formatFileSize: (bytes: number) => string;
}

export const VaultUploadDropzone: React.FC<VaultUploadDropzoneProps> = ({
  uploadCategory,
  setUploadCategory,
  stagedFile,
  uploading,
  uploadProgress,
  isDragOver,
  setIsDragOver,
  fileInputRef,
  handleFileSelect,
  handleDrop,
  handleConfirmUpload,
  handleCancelStagedFile,
  formatFileSize,
}) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
      {/* Category Selection Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-[#16A34A]" />
          <h3 className="text-sm font-bold text-slate-900">Upload New Tax Slips & Statements</h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Document Type:</span>
          <div className="w-64">
            <AppSelect
              options={UPLOAD_CATEGORIES}
              value={uploadCategory}
              onChange={(val) => setUploadCategory(val || 'W2_WAGES')}
              placeholder="Select Category"
            />
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef as any}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.docx,.doc,.xlsx,.xls,.csv"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Condition A: Staged File Preview Card */}
      {stagedFile ? (
        <div className="p-5 rounded-xl bg-slate-50 border-2 border-emerald-300 shadow-xs space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-[#16A34A] flex items-center justify-center shrink-0 border border-emerald-200">
                <FileText className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-900 truncate">
                    {stagedFile.name}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {UPLOAD_CATEGORIES.find((c) => c.value === uploadCategory)?.label || uploadCategory}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  File Size: <strong>{formatFileSize(stagedFile.size)}</strong> • Ready for upload
                </p>
              </div>
            </div>

            {/* Actions: Cancel, Change, Upload */}
            <div className="flex items-center gap-2.5 shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelStagedFile}
                disabled={uploading}
                className="border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Change File</span>
              </Button>

              <Button
                size="sm"
                onClick={handleConfirmUpload}
                disabled={uploading}
                className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer px-4"
              >
                <FileUp className="w-4 h-4" />
                <span>{uploading ? 'Uploading...' : 'Upload Document'}</span>
              </Button>
            </div>
          </div>

          {uploading && (
            <div className="space-y-1 pt-2 border-t border-slate-200">
              <div className="flex justify-between text-[11px] font-bold text-slate-600">
                <span>Uploading to Secure Vault...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#16A34A] h-full rounded-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Condition B: Dropzone */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
            isDragOver
              ? 'border-[#16A34A] bg-emerald-50/50 scale-[0.99]'
              : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50/80 bg-slate-50/30'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center border border-emerald-200">
            <UploadCloud className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-bold text-slate-800">
              Click to Browse or Drag & Drop Tax Slip Here
            </p>
            <p className="text-[11px] text-slate-500">
              Supported Formats: <strong>PDF, PNG, JPG, DOCX, XLSX</strong> (Max 10MB per file)
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
