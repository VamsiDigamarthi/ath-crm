import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/components/Button';
import { AppModal } from '@/shared/components/AppModal';
import { 
  FileText, 
  CheckCircle2, 
  Download, 
  FileCheck,
  Eye,
  FileSpreadsheet,
  Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '@/lib/api-client';

export interface DocumentItem {
  id: string;
  fileName: string;
  filePath?: string;
  documentCategory: string;
  verificationStatus: string;
  createdAt: string;
}

interface TaxPrepDocumentVaultProps {
  customerName: string;
  documents?: DocumentItem[];
  onDocumentVerified?: (docId: string) => void;
}

export const TaxPrepDocumentVault: React.FC<TaxPrepDocumentVaultProps> = ({
  customerName,
  documents: initialDocuments = [],
  onDocumentVerified,
}) => {
  const [docList, setDocList] = useState<DocumentItem[]>(initialDocuments);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  useEffect(() => {
    setDocList(initialDocuments || []);
  }, [initialDocuments]);

  const handleVerify = async (docId: string) => {
    try {
      await apiClient.patch(`/documenter/documents/${docId}/verify`, { status: 'VERIFIED' });
      setDocList((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, verificationStatus: 'VERIFIED' } : d))
      );
      toast.success('Document marked as Verified & Approved in Database! 📁✅');
      if (onDocumentVerified) onDocumentVerified(docId);
    } catch {
      toast.error('Failed to update verification status');
    }
  };

  const handleDownload = async (docId: string, fileName: string) => {
    try {
      toast.loading(`Downloading ${fileName}...`, { id: 'doc-dl' });
      const response: any = await apiClient.get(`/documenter/documents/${docId}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Download complete!', { id: 'doc-dl' });
    } catch {
      toast.error('Failed to download document', { id: 'doc-dl' });
    }
  };

  const getCategoryBadge = (cat: string) => {
    const upper = (cat || '').toUpperCase();
    if (upper.includes('W2') || upper.includes('W-2')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">W-2 Wages</span>;
    }
    if (upper.includes('DIV') || upper.includes('DIVIDEND')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">1099-DIV Dividends</span>;
    }
    if (upper.includes('INT') || upper.includes('INTEREST')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">1099-INT Interest</span>;
    }
    if (upper.includes('BROKERAGE') || upper.includes('1099_B') || upper.includes('STOCK')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">1099-B Stocks</span>;
    }
    if (upper.includes('FBAR') || upper.includes('INDIAN') || upper.includes('FOREIGN')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">FBAR Indian</span>;
    }
    if (upper.includes('1098') || upper.includes('MORTGAGE')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">1098 Mortgage</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">{cat || 'Tax Slip'}</span>;
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
      return <ImageIcon className="w-4 h-4 text-emerald-600" />;
    }
    if (['xlsx', 'xls', 'csv'].includes(ext)) {
      return <FileSpreadsheet className="w-4 h-4 text-blue-600" />;
    }
    return <FileText className="w-4 h-4 text-slate-600" />;
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Notice Banner */}
      <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-purple-600 shrink-0" />
          <span className="font-medium">
            <strong>Client Tax Vault</strong> — Review and verify taxpayer statements uploaded by {customerName}.
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
          {docList.length} Files Uploaded
        </span>
      </div>

      {/* Documents List */}
      {docList.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto border border-purple-100 font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-slate-800">No Uploaded Documents Yet</h4>
          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
            {customerName} has not uploaded tax forms yet. Remind them during outreach to upload via their client portal.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {docList.map((doc) => (
            <div
              key={doc.id}
              className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#16A34A] border border-emerald-100 flex items-center justify-center font-bold shrink-0">
                  {getFileIcon(doc.fileName)}
                </div>

                <div className="space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{doc.fileName}</span>
                    {getCategoryBadge(doc.documentCategory)}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Uploaded: <strong>{new Date(doc.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong>
                  </div>
                </div>
              </div>

              {/* Status & Actions: Preview, Download, Verify */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {/* 1. Preview Button */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPreviewDoc(doc)}
                  className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold h-7 px-2.5 flex items-center gap-1 cursor-pointer"
                  title="Preview Document"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span>Preview</span>
                </Button>

                {/* 2. Download Button */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(doc.id, doc.fileName)}
                  className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold h-7 px-2.5 flex items-center gap-1 cursor-pointer"
                  title="Download File"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Download</span>
                </Button>

                {/* 3. Verify Status */}
                {doc.verificationStatus === 'VERIFIED' ? (
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                    Verified
                  </span>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleVerify(doc.id)}
                    className="h-7 px-2.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verify &amp; Approve</span>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <AppModal
          isOpen={Boolean(previewDoc)}
          onClose={() => setPreviewDoc(null)}
          title={`Document Preview: ${previewDoc.fileName}`}
          width="600px"
        >
          <div className="space-y-4 font-sans">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span className="font-bold">{previewDoc.fileName}</span>
                {getCategoryBadge(previewDoc.documentCategory)}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleDownload(previewDoc.id, previewDoc.fileName)}
                  className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer h-7"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </Button>
              </div>
            </div>

            {/* Preview Box */}
            <div className="p-8 rounded-xl bg-slate-100 border border-slate-200 text-center space-y-3 min-h-[260px] flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-xs text-emerald-600 flex items-center justify-center mx-auto border border-slate-200">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">{previewDoc.fileName}</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Taxpayer Uploaded Document • Category: <strong>{previewDoc.documentCategory}</strong>
                </p>
              </div>
              <p className="text-[11px] text-slate-400 max-w-sm">
                Document is stored securely in the ATH CRM encrypted storage engine. Click download above to open the raw physical copy.
              </p>
            </div>
          </div>
        </AppModal>
      )}
    </div>
  );
};
