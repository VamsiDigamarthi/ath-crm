import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/shared/components/Button';
import { AppModal } from '@/shared/components/AppModal';
import { AppSelect } from '@/shared/components/AppSelect';
import { AppConfirmDialog } from '@/shared/components/AppConfirmDialog';
import { 
  FileText, 
  CheckCircle2, 
  Download, 
  FileCheck,
  Eye,
  FileSpreadsheet,
  Image as ImageIcon,
  UploadCloud,
  Trash2,
  Plus,
  ShieldCheck
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
  leadId?: string;
  customerName: string;
  documents?: DocumentItem[];
  onDocumentVerified?: (docId: string) => void;
  onDocumentUploaded?: () => void;
}

const DOCUMENT_CATEGORIES = [
  { label: 'W-2 Wage Statement (Employer)', value: 'W2_WAGES' },
  { label: '1099-INT Bank Interest Statement', value: '1099_INT' },
  { label: '1099-DIV Dividend & Distribution', value: '1099_DIV' },
  { label: '1099-B Brokerage Stock Sales', value: '1099_B' },
  { label: '1098 Mortgage Interest Statement', value: '1098_MORTGAGE' },
  { label: 'FBAR / Foreign Indian Bank Summary', value: 'FBAR_FOREIGN' },
  { label: 'Taxpayer ID / Passport / Visa Copy', value: 'ID_PASSPORT_VISA' },
  { label: 'Prior Year 1040 Tax Return', value: 'PREVIOUS_1040' },
  { label: 'Other Tax Form / Expense Receipt', value: 'OTHER_DOCUMENT' },
];

export const TaxPrepDocumentVault: React.FC<TaxPrepDocumentVaultProps> = ({
  leadId,
  customerName,
  documents: initialDocuments = [],
  onDocumentVerified,
  onDocumentUploaded,
}) => {
  const [docList, setDocList] = useState<DocumentItem[]>(initialDocuments);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  
  // Agent Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('W2_WAGES');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // AppConfirmDialog States
  const [docToVerify, setDocToVerify] = useState<DocumentItem | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [docToDelete, setDocToDelete] = useState<DocumentItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDocList(initialDocuments || []);
  }, [initialDocuments]);

  const handleConfirmVerify = async () => {
    if (!docToVerify) return;
    try {
      setIsVerifying(true);
      await apiClient.patch(`/documenter/documents/${docToVerify.id}/verify`, { status: 'VERIFIED' });
      setDocList((prev) =>
        prev.map((d) => (d.id === docToVerify.id ? { ...d, verificationStatus: 'VERIFIED' } : d))
      );
      toast.success(`"${docToVerify.fileName}" marked as Verified & Approved! 📁✅`);
      if (onDocumentVerified) onDocumentVerified(docToVerify.id);
      setDocToVerify(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update verification status');
    } finally {
      setIsVerifying(false);
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

  const handleConfirmDelete = async () => {
    if (!docToDelete) return;
    try {
      setIsDeleting(true);
      await apiClient.delete(`/documenter/documents/${docToDelete.id}`);
      setDocList((prev) => prev.filter((d) => d.id !== docToDelete.id));
      toast.success(`"${docToDelete.fileName}" deleted from vault successfully`);
      if (onDocumentUploaded) onDocumentUploaded();
      setDocToDelete(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete document');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAgentUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a document file to upload');
      return;
    }
    if (!leadId) {
      toast.error('Application ID is missing');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('documentCategory', selectedCategory);

      const res: any = await apiClient.post(`/documenter/leads/${leadId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res?.data) {
        setDocList((prev) => [res.data, ...prev]);
        toast.success(`Uploaded ${selectedFile.name} successfully on behalf of ${customerName}! 📁✨`);
        setIsUploadModalOpen(false);
        setSelectedFile(null);
        if (onDocumentUploaded) onDocumentUploaded();
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to upload document';
      toast.error(msg);
    } finally {
      setIsUploading(false);
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
    if (upper.includes('BROKERAGE') || upper.includes('1099_B') || upper.includes('1099-B') || upper.includes('STOCK')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">1099-B Stocks</span>;
    }
    if (upper.includes('FBAR') || upper.includes('INDIAN') || upper.includes('FOREIGN')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">FBAR Indian</span>;
    }
    if (upper.includes('1098') || upper.includes('MORTGAGE')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">1098 Mortgage</span>;
    }
    if (upper.includes('PASSPORT') || upper.includes('VISA') || upper.includes('ID')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">ID / Visa Copy</span>;
    }
    if (upper.includes('1040') || upper.includes('PRIOR')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Prior 1040 Return</span>;
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
      {/* Notice Banner with Upload Button */}
      <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-purple-600 shrink-0" />
          <span className="font-medium">
            <strong>Client Tax Vault</strong> — Review and manage taxpayer statements for {customerName}.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
            {docList.length} Files in Vault
          </span>
          <Button
            size="sm"
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer h-7.5 px-3 rounded-lg"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </Button>
        </div>
      </div>

      {/* Documents List */}
      {docList.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto border border-purple-100 font-bold">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">No Uploaded Documents Yet</h4>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-0.5">
              No files are uploaded yet for {customerName}. You can upload W-2s, 1099s, or ID proofs directly on behalf of the client using the button below.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer px-4 h-8"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload Document on Behalf of Client</span>
          </Button>
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

              {/* Status & Actions: Preview, Download, Delete, Verify */}
              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
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

                {/* 3. Delete Button */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDocToDelete(doc)}
                  className="border-slate-200 text-rose-600 hover:bg-rose-50 text-xs font-bold h-7 px-2 flex items-center gap-1 cursor-pointer"
                  title="Delete File"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>

                {/* 4. Verify Status */}
                {doc.verificationStatus === 'VERIFIED' ? (
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                    Verified
                  </span>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setDocToVerify(doc)}
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

      {/* Agent Upload Document Modal */}
      <AppModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setSelectedFile(null);
        }}
        title={`Upload Tax Document for ${customerName}`}
        width="540px"
      >
        <form onSubmit={handleAgentUploadSubmit} className="space-y-4 font-sans py-1">
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Agent Assisted Upload:</strong> This document will be saved directly into the client's secure vault and automatically logged in the audit ledger.
            </div>
          </div>

          <div>
            <AppSelect
              label="Select Document Category *"
              value={selectedCategory}
              onChange={(val) => setSelectedCategory(val)}
              options={DOCUMENT_CATEGORIES}
            />
          </div>

          {/* File Dropper */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Select Document File (PDF, Image, Excel, CSV) *
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all duration-200 ${
                selectedFile
                  ? 'border-emerald-500 bg-emerald-50/30'
                  : 'border-slate-300 hover:border-emerald-500 bg-slate-50/60 hover:bg-white'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls,.csv"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
              />
              <UploadCloud className={`w-8 h-8 mx-auto mb-2 ${selectedFile ? 'text-[#16A34A]' : 'text-slate-400'}`} />
              {selectedFile ? (
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-800">{selectedFile.name}</div>
                  <div className="text-[11px] text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB • Ready to upload</div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-700">Click or drag &amp; drop file here</div>
                  <div className="text-[11px] text-slate-400">PDF, JPG, PNG, Excel or CSV (Max 25MB)</div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsUploadModalOpen(false)}
              className="border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isUploading}
              disabled={!selectedFile || isUploading}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold px-4 cursor-pointer"
            >
              Upload &amp; Secure in Vault
            </Button>
          </div>
        </form>
      </AppModal>

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

      {/* Confirmation Dialog for Verify & Approve */}
      {docToVerify && (
        <AppConfirmDialog
          isOpen={Boolean(docToVerify)}
          onClose={() => setDocToVerify(null)}
          onConfirm={handleConfirmVerify}
          title="Verify & Approve Tax Document"
          description={`Are you sure you want to verify and approve "${docToVerify.fileName}"? This will mark the client's tax statement as authenticated and ready for 1040 preparation.`}
          confirmLabel="Yes, Verify & Approve"
          cancelLabel="Cancel"
          variant="success"
          isLoading={isVerifying}
        />
      )}

      {/* Confirmation Dialog for Delete Document */}
      {docToDelete && (
        <AppConfirmDialog
          isOpen={Boolean(docToDelete)}
          onClose={() => setDocToDelete(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Document from Vault"
          description={`Are you sure you want to permanently remove "${docToDelete.fileName}" from this taxpayer's vault? This action cannot be undone.`}
          confirmLabel="Yes, Delete Document"
          cancelLabel="Cancel"
          variant="danger"
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};
