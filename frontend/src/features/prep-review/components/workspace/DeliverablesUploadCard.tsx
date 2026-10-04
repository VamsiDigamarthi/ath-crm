import React, { useState, useRef } from 'react';
import { 
  FileCheck2, 
  Upload, 
  Trash2, 
  ExternalLink, 
  CheckSquare, 
  Square, 
  FileText, 
  Loader2, 
  Download
} from 'lucide-react';
import { Button } from '@/shared/components/Button';

export interface DeliverableDocument {
  id: string;
  fileName: string;
  fileUrl?: string;
  filePath?: string;
  fileSize?: number;
  category?: string;
  requiresEsign: boolean;
  uploadedAt: string;
  uploadedByUserId?: string;
  signedDocument?: {
    id: string;
    fileName: string;
    fileUrl?: string;
    uploadedAt: string;
  } | null;
}

interface DeliverablesUploadCardProps {
  documents: DeliverableDocument[];
  isUploading: boolean;
  isReadOnly?: boolean;
  onUpload: (file: File, requiresEsign: boolean) => Promise<void> | void;
  onDelete: (docId: string) => Promise<void> | void;
  onToggleEsign?: (docId: string, requiresEsign: boolean) => Promise<void> | void;
  onPreview?: (doc: any) => void;
  title?: string;
  subtitle?: string;
}

export const DeliverablesUploadCard: React.FC<DeliverablesUploadCardProps> = ({
  documents = [],
  isUploading,
  isReadOnly = false,
  onUpload,
  onDelete,
  onToggleEsign,
  onPreview,
  title = '2. Client Deliverable Documents & E-Sign Requirements',
  subtitle = 'Upload Form 8879, State signature authorizations, or engagement agreements. Check "Requires E-Sign" for documents the client must sign & re-upload.',
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [requiresEsign, setRequiresEsign] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleTriggerUpload = async () => {
    if (!selectedFile) return;
    await onUpload(selectedFile, requiresEsign);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes === 0) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const openDocument = async (url?: string, fileName?: string) => {
    if (!url) return;
    const finalName = fileName || 'deliverable_document';
    const isPdf = /\.pdf$/i.test(finalName);
    const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(finalName);
    const fullUrl = url.startsWith('http') ? url : `http://localhost:5000${url.startsWith('/') ? '' : '/'}${url}`;

    try {
      const res = await fetch(fullUrl, { credentials: 'include' });
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      if (!isPdf && !isImage) {
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = finalName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(blobUrl);
      } else {
        window.open(blobUrl, '_blank');
      }
    } catch {
      window.open(fullUrl, '_blank');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
              {documents.length} {documents.length === 1 ? 'file' : 'files'}
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">{subtitle}</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Upload bar (only if not read-only) */}
        {!isReadOnly && (
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-dashed border-slate-300 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="block w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 file:cursor-pointer cursor-pointer border border-slate-200 rounded-lg p-1 bg-white"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shrink-0">
                <input
                  type="checkbox"
                  checked={requiresEsign}
                  onChange={(e) => setRequiresEsign(e.target.checked)}
                  disabled={isUploading}
                  className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                />
                <span>Requires E-Sign / Re-upload</span>
              </label>

              <Button
                type="button"
                size="sm"
                onClick={handleTriggerUpload}
                disabled={!selectedFile || isUploading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 h-8 rounded-lg shrink-0 flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Add Deliverable</span>
                  </>
                )}
              </Button>
            </div>
            {selectedFile && (
              <p className="text-[11px] text-slate-600 font-medium">
                Ready to upload: <span className="font-semibold text-slate-800">{selectedFile.name}</span> ({formatFileSize(selectedFile.size)}) · {requiresEsign ? 'Requires client e-sign' : 'No signature needed (informational only)'}
              </p>
            )}
          </div>
        )}

        {/* Deliverables List */}
        {documents.length === 0 ? (
          <div className="text-center py-6 border border-slate-200 rounded-xl bg-slate-50/50">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">No deliverable documents attached yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Upload Form 8879, State signature authorizations, or engagement letters that the client will receive.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {documents.map((doc, idx) => (
              <div
                key={doc.id || idx}
                className="p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 ${
                    doc.requiresEsign
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-bold text-slate-900 truncate" title={doc.fileName}>
                        {doc.fileName}
                      </p>
                      {doc.requiresEsign ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                          ✍️ E-Sign Required
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          📄 Reference Only
                        </span>
                      )}

                      {doc.signedDocument && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          ✓ Signed by Client
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <span>{formatFileSize(doc.fileSize)}</span>
                      <span>•</span>
                      <span>Uploaded {new Date(doc.uploadedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      {doc.signedDocument && (
                        <>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={() => openDocument(doc.signedDocument?.fileUrl, doc.signedDocument?.fileName || 'signed_deliverable.pdf')}
                            className="text-emerald-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>View Signed Copy</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {/* Interactive toggle for requiresEsign if not read-only */}
                  {!isReadOnly && onToggleEsign && (
                    <button
                      type="button"
                      onClick={() => onToggleEsign(doc.id, !doc.requiresEsign)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                        doc.requiresEsign
                          ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                      title="Click to toggle whether client must sign/re-upload this file"
                    >
                      {doc.requiresEsign ? <CheckSquare className="w-3.5 h-3.5 text-amber-700" /> : <Square className="w-3.5 h-3.5 text-slate-400" />}
                      <span>{doc.requiresEsign ? 'E-Sign Needed' : 'No Sign Needed'}</span>
                    </button>
                  )}

                  {doc.fileUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (onPreview) {
                          onPreview({
                            id: doc.id,
                            fileName: doc.fileName,
                            fileUrl: doc.fileUrl,
                            category: doc.category || 'DELIVERABLE_DOCUMENT',
                          });
                        } else {
                          openDocument(doc.fileUrl, doc.fileName);
                        }
                      }}
                      className="h-7 px-2.5 text-[11px] font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3 text-slate-500" />
                      <span>View</span>
                    </Button>
                  )}

                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => onDelete(doc.id)}
                      className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                      title="Delete document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
