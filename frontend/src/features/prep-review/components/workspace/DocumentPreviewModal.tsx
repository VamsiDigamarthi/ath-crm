import React, { useState, useEffect } from 'react';
import { AppModal } from '@/shared/components/AppModal';
import { CheckCircle2, FileText, Download, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import apiClient from '@/lib/api-client';
import type { WorkspaceDocument } from '../../hooks/useTaxPreparerWorkspace';
import toast from 'react-hot-toast';

interface DocumentPreviewModalProps {
  document: WorkspaceDocument | null;
  onClose: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document,
  onClose,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);

  const fileName = document?.fileName || 'document';
  const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(fileName);
  const isPdf = /\.pdf$/i.test(fileName);

  useEffect(() => {
    let activeBlobUrl: string | null = null;

    const fetchDocumentBlob = async () => {
      if (!document?.id) return;
      setIsLoadingFile(true);
      try {
        const response: any = await apiClient.get(`/prep-review/documents/${document.id}/download`, {
          responseType: 'blob',
        });
        const mimeType = isImage ? 'image/jpeg' : isPdf ? 'application/pdf' : 'application/octet-stream';
        const blob = new Blob([response], { type: mimeType });
        const url = URL.createObjectURL(blob);
        activeBlobUrl = url;
        setPreviewUrl(url);
      } catch {
        setPreviewUrl(null);
      } finally {
        setIsLoadingFile(false);
      }
    };

    if (document) {
      fetchDocumentBlob();
    } else {
      setPreviewUrl(null);
    }

    return () => {
      if (activeBlobUrl) {
        URL.revokeObjectURL(activeBlobUrl);
      }
    };
  }, [document, isImage, isPdf]);

  if (!document) return null;

  const handleOpenInNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
      toast.success('Document opened in new tab');
    } else {
      toast.error('Preview is still loading');
    }
  };

  const handleDownloadFile = () => {
    if (!previewUrl) return;
    const link = window.document.createElement('a');
    link.href = previewUrl;
    link.setAttribute('download', fileName);
    window.document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success(`"${fileName}" downloaded successfully`);
  };

  return (
    <AppModal
      isOpen={Boolean(document)}
      onClose={onClose}
      title={`Document Vault: ${fileName}`}
      width="720px"
    >
      <div className="space-y-4 font-sans text-xs">
        {/* Header Metadata Pill */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">{fileName}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{document.verificationStatus || 'VERIFIED'}</span>
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Category: <strong>{document.category}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenInNewTab}
              disabled={!previewUrl || isLoadingFile}
              className="border-slate-200 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs h-8"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
              <span>Open in New Tab</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleDownloadFile}
              disabled={!previewUrl || isLoadingFile}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer h-8"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </Button>
          </div>
        </div>

        {/* Live File Preview Rendering Box */}
        <div className="rounded-xl border border-slate-200 bg-slate-900/5 p-4 min-h-[340px] flex items-center justify-center overflow-hidden">
          {isLoadingFile ? (
            <div className="flex flex-col items-center justify-center gap-2 text-slate-500 py-16">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
              <span className="text-xs font-bold">Decrypting &amp; rendering document preview...</span>
            </div>
          ) : previewUrl && isImage ? (
            <div className="w-full flex items-center justify-center">
              <img
                src={previewUrl}
                alt={fileName}
                className="max-h-[460px] max-w-full rounded-lg object-contain shadow-sm border border-slate-200 bg-white"
              />
            </div>
          ) : previewUrl && isPdf ? (
            <iframe
              src={previewUrl}
              title={fileName}
              className="w-full h-[460px] rounded-lg border border-slate-200 bg-white"
            />
          ) : (
            <div className="p-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-xs text-emerald-600 flex items-center justify-center mx-auto border border-slate-200">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">{fileName}</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Category: <strong>{document.category}</strong>
                </p>
              </div>
              <Button
                size="sm"
                onClick={handleDownloadFile}
                className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 mr-1" /> Download Raw Document
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-[11px] text-slate-400 font-medium">
            Authenticated via TaxCRM 4-Eyes Compliance Vault
          </span>
          <Button variant="outline" size="sm" onClick={onClose} className="cursor-pointer">
            Close Preview
          </Button>
        </div>
      </div>
    </AppModal>
  );
};
