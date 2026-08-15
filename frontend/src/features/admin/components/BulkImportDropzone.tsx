import React, { useRef } from 'react';
import { UploadCloud, FileSpreadsheet, Download, RefreshCw, Trash2, CheckCircle2, PlayCircle } from 'lucide-react';
import { Button } from '@/shared/components/Button';

interface BulkImportDropzoneProps {
  fileName?: string;
  fileSize?: string;
  rowsCount: number;
  isDragOver: boolean;
  isParsing: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDownloadTemplate: () => void;
  onLoadDemoData: () => void;
  onClearFile: () => void;
}

export const BulkImportDropzone: React.FC<BulkImportDropzoneProps> = ({
  fileName,
  fileSize,
  rowsCount,
  isDragOver,
  isParsing,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileInputChange,
  onDownloadTemplate,
  onLoadDemoData,
  onClearFile,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const hasFile = !!fileName && rowsCount > 0;

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={onFileInputChange}
        className="hidden"
      />

      {!hasFile ? (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`relative flex flex-col items-center justify-center p-8 sm:p-12 border-2 border-dashed rounded-2xl transition-all duration-200 text-center ${
            isDragOver
              ? 'border-[#16A34A] bg-emerald-50/60 scale-[0.99]'
              : 'border-slate-300 hover:border-emerald-500 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          {/* Animated Cloud Icon */}
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#16A34A] mb-4 shadow-sm">
            {isParsing ? (
              <RefreshCw className="w-8 h-8 animate-spin text-[#16A34A]" />
            ) : (
              <UploadCloud className="w-8 h-8 text-[#16A34A]" />
            )}
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {isParsing ? 'Parsing and validating spreadsheet data...' : 'Choose or drop your Excel (.xlsx) or CSV lead file here'}
          </h3>

          <p className="text-xs sm:text-sm text-slate-500 max-w-md mt-1 mb-6 leading-relaxed">
            Supports standard columns: <span className="font-semibold text-slate-700">First Name, Last Name, Email, Phone, SSN/TIN, Address, City, State, Zip, Estimated Income</span>.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              type="button"
              variant="primary"
              size="md"
              loading={isParsing}
              onClick={handleBrowseClick}
              className="px-5 shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Browse Spreadsheet (.xlsx / .csv)
            </Button>

            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onDownloadTemplate}
              className="border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            >
              <Download className="w-4 h-4 mr-2 text-slate-500" />
              Download Excel Template (.xlsx)
            </Button>

            <button
              type="button"
              onClick={onLoadDemoData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200 border border-emerald-300/80 transition-colors cursor-pointer"
            >
              <PlayCircle className="w-4 h-4 text-[#16A34A]" />
              Load Sample Demo Data
            </button>
          </div>
        </div>
      ) : (
        /* File Loaded Preview Card */
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#16A34A] text-white flex items-center justify-center shadow-sm shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                  {fileName}
                </h4>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Loaded
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Size: <span className="font-semibold text-slate-700">{fileSize || 'N/A'}</span> • Rows:{' '}
                <span className="font-bold text-[#16A34A]">{rowsCount} records</span> ready for review
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleBrowseClick}
              className="text-xs border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Replace File
            </Button>

            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={onClearFile}
              className="text-xs bg-rose-600 hover:bg-rose-700 border-rose-600"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Remove
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
