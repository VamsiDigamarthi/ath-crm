import React from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  FileCode, 
  Archive, 
  Layers 
} from 'lucide-react';
import { Button } from '@/shared/components/Button';

interface ReviewerDrakeTaxCardProps {
  drakeTaxFile: any | null;
  assignedPreparer: { name: string; email?: string } | null;
  onPreview?: (doc: any) => void;
}

export const ReviewerDrakeTaxCard: React.FC<ReviewerDrakeTaxCardProps> = ({
  drakeTaxFile,
  assignedPreparer,
  onPreview,
}) => {

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

  const getFileIcon = (extStr: string) => {
    if (['PDF'].includes(extStr)) return <FileText className="w-5 h-5 text-rose-600" />;
    if (['XML', 'JSON'].includes(extStr)) return <FileCode className="w-5 h-5 text-indigo-600" />;
    if (['ZIP', '7Z', 'RAR', 'BAK'].includes(extStr)) return <Archive className="w-5 h-5 text-amber-600" />;
    if (['XLS', 'XLSX', 'CSV'].includes(extStr)) return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
    return <Layers className="w-5 h-5 text-blue-600" />;
  };

  const preparerName = drakeTaxFile?.uploadedByName || assignedPreparer?.name || 'Tax Preparer';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden font-sans">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-xs sm:text-sm text-white tracking-tight">
                Drake Tax Software Calculation &amp; Return File
              </h4>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-400/30">
                Preparer Source Backing
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Official computation &amp; return export submitted by {preparerName} for 4-Eyes Compliance Verification.
            </p>
          </div>
        </div>

        {drakeTaxFile && (
          <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/40 flex items-center gap-1 shrink-0">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Ready for Audit</span>
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        {drakeTaxFile ? (
          <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/30 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white border border-purple-200 flex items-center justify-center shrink-0 shadow-2xs">
                  {getFileIcon(ext)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 truncate block">
                      {drakeTaxFile.fileName || 'Drake_Tax_Return_Export'}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-purple-100 text-purple-800 border border-purple-300 uppercase shrink-0">
                      {ext || 'DRAKE'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                    <span>Size: <strong>{formatFileSize(drakeTaxFile.fileSize)}</strong></span>
                    <span>•</span>
                    <span>Uploaded: <strong>{drakeTaxFile.uploadedAt ? new Date(drakeTaxFile.uploadedAt).toLocaleString() : 'Today'}</strong></span>
                    <span>•</span>
                    <span>By: <strong className="text-purple-900">{preparerName}</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Buttons for QA Reviewer */}
              <div className="flex items-center gap-2 shrink-0">
                {onPreview && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onPreview(drakeTaxFile)}
                    className="bg-white hover:bg-purple-50 text-purple-700 border-purple-200 text-xs font-bold h-8 px-3.5 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Preview Drake Return"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-purple-600" />
                    <span>Preview File</span>
                  </Button>
                )}
              </div>
            </div>

            <div className="pt-2.5 border-t border-purple-200/60 flex items-center justify-between text-[11px] text-purple-900 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>Verified Drake calculation file linked to TY2025 Form 1040 audit package.</span>
              </div>
              <span className="font-bold text-purple-700">Audit Grade Backing</span>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl border border-dashed border-amber-200 bg-amber-50/50 text-xs text-amber-900 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold block text-slate-900">No Drake Tax software calculation file attached</span>
              <span className="text-slate-600 text-[11px]">
                Tax Preparer has not uploaded a Drake Tax export file for this return. Review is based on live drafting entries.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
