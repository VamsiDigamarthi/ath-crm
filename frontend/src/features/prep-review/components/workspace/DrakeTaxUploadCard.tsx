import React, { useRef, useState } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  FileText, 
  CheckCircle2, 
  RefreshCw, 
  Layers, 
  FileCode, 
  Archive,
  Check,
  X,
  FileCheck
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import toast from 'react-hot-toast';

interface DrakeTaxUploadCardProps {
  drakeTaxFile: any | null;
  isUploading: boolean;
  isReadOnly?: boolean;
  onUpload: (file: File) => Promise<void>;
  onDelete?: (docId?: string) => Promise<void>;
  onPreview?: (doc: any) => void;
}

export const DrakeTaxUploadCard: React.FC<DrakeTaxUploadCardProps> = ({
  drakeTaxFile,
  isUploading,
  isReadOnly = false,
  onUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleFilePicked = (file: File) => {
    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size exceeds 50MB limit.');
      return;
    }
    setPendingFile(file);
  };

  const handleConfirmUpload = async () => {
    if (!pendingFile) return;
    try {
      await onUpload(pendingFile);
      setPendingFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch {
      // Error handled in hook
    }
  };

  const handleCancelSelection = () => {
    setPendingFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isReadOnly) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (isReadOnly) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFilePicked(file);
    }
  };

  const formatFileSize = (bytes: number | undefined): string => {
    if (!bytes || isNaN(bytes)) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getFileExtension = (name: string): string => {
    if (!name) return '';
    return name.split('.').pop()?.toUpperCase() || '';
  };

  const ext = drakeTaxFile?.fileName ? getFileExtension(drakeTaxFile.fileName) : '';
  const pendingExt = pendingFile?.name ? getFileExtension(pendingFile.name) : '';

  const getFileIcon = (extStr: string) => {
    if (['PDF'].includes(extStr)) return <FileText className="w-5 h-5 text-rose-600" />;
    if (['XML', 'JSON'].includes(extStr)) return <FileCode className="w-5 h-5 text-indigo-600" />;
    if (['ZIP', '7Z', 'RAR', 'BAK'].includes(extStr)) return <Archive className="w-5 h-5 text-amber-600" />;
    if (['XLS', 'XLSX', 'CSV'].includes(extStr)) return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
    return <Layers className="w-5 h-5 text-blue-600" />;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden font-sans">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.d25,.d24,.d23,.d22,.d21,.d20,.dtx,.dat,.bak,.xml,.json,.csv,.xlsx,.xls,.zip,.7z"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFilePicked(e.target.files[0]);
          }
        }}
      />

      {/* Card Header */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-xs sm:text-sm text-white tracking-tight">
                Drake Tax Software Return File
              </h4>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Drake Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Official Form 1040 computation &amp; return export generated from Drake Tax.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
          <span className="text-[10px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            .PDF • .D25 • .XML • .ZIP
          </span>
          {!isReadOnly && drakeTaxFile && !pendingFile && (
            <Button
              size="sm"
              variant="outline"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200 text-[11px] font-bold h-7 px-2.5 flex items-center gap-1 cursor-pointer"
              title="Replace current Drake Tax calculation file"
            >
              <RefreshCw className={`w-3 h-3 ${isUploading ? 'animate-spin' : ''}`} />
              <span>Replace File</span>
            </Button>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4">
        {/* State 1: A New File is Picked and Pending Confirmation */}
        {pendingFile ? (
          <div className="p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50/50 space-y-3.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-emerald-200 pb-2.5">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                  File Selected — Confirm Upload
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                Pending Confirmation
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-white border border-emerald-300 flex items-center justify-center shrink-0 shadow-2xs">
                  {getFileIcon(pendingExt)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 truncate block">
                      {pendingFile.name}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-emerald-200 text-emerald-900 border border-emerald-300 uppercase shrink-0">
                      {pendingExt || 'FILE'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5 flex items-center gap-2">
                    <span>Size: <strong>{formatFileSize(pendingFile.size)}</strong></span>
                    <span>•</span>
                    <span className="text-emerald-800 font-medium">Ready to upload &amp; link to Form 1040 draft</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Confirm, Change, Cancel */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  type="button"
                  loading={isUploading}
                  onClick={handleConfirmUpload}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-8 px-3.5 flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Upload</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white hover:bg-slate-50 text-slate-700 border-slate-300 text-xs font-bold h-8 px-3 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Change</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  disabled={isUploading}
                  onClick={handleCancelSelection}
                  className="bg-white hover:bg-rose-50 text-rose-700 border-rose-200 text-xs font-bold h-8 px-3 flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </Button>
              </div>
            </div>
          </div>
        ) : drakeTaxFile ? (
          /* State 2: Uploaded File Present (Clean View: No Download/Preview buttons) */
          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white border border-emerald-200 flex items-center justify-center shrink-0 shadow-2xs">
                  {getFileIcon(ext)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 truncate block">
                      {drakeTaxFile.fileName || 'Drake_Tax_Return_Export'}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase shrink-0">
                      {ext || 'DRAKE'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                    <span>Size: <strong>{formatFileSize(drakeTaxFile.fileSize)}</strong></span>
                    <span>•</span>
                    <span>Uploaded: <strong>{drakeTaxFile.uploadedAt ? new Date(drakeTaxFile.uploadedAt).toLocaleString() : 'Today'}</strong></span>
                    {drakeTaxFile.uploadedByName && (
                      <>
                        <span>•</span>
                        <span>By: <strong>{drakeTaxFile.uploadedByName}</strong></span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Only Replace (No Download/Preview/Delete) */}
              <div className="flex items-center gap-2 shrink-0">
                {!isReadOnly && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white hover:bg-slate-50 text-slate-700 border-slate-300 text-xs font-bold h-8 px-3 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Choose a new file to replace"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Replace File</span>
                  </Button>
                )}
              </div>
            </div>

            <div className="pt-2.5 border-t border-emerald-200/60 flex items-center justify-between text-[11px] text-emerald-800 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Drake Tax calculation file securely stored &amp; linked with TY2025 Form 1040 workspace.</span>
              </div>
              <span className="font-bold">Verified File</span>
            </div>
          </div>
        ) : (
          /* State 3: Empty / Upload Dropzone View */
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isReadOnly && !isUploading && fileInputRef.current?.click()}
            className={`p-6 rounded-xl border-2 border-dashed text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2.5 ${
              isDragOver
                ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
                : 'border-slate-300 hover:border-emerald-400 bg-slate-50/60 hover:bg-white'
            } ${isReadOnly ? 'cursor-not-allowed opacity-75' : ''}`}
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
              <Upload className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h5 className="text-xs sm:text-sm font-bold text-slate-800">
                Upload Drake Tax Return / Export File
              </h5>
              <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                Drag and drop your Drake Tax calculation file here, or click to browse from your computer. Supports <strong>.PDF, .D25, .D24, .XML, .DAT, .ZIP</strong> files up to 50MB.
              </p>
            </div>

            {!isReadOnly && (
              <Button
                size="sm"
                type="button"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-8 px-4 flex items-center gap-1.5 shadow-xs cursor-pointer mt-1"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Select Drake Tax File</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
