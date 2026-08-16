import React, { useState } from 'react';
import { Button } from '@/shared/components/Button';
import { 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  Clock, 
  Eye, 
  FileCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DocumentItem {
  id: string;
  docType: string;
  name: string;
  size: string;
  uploadedAt: string;
  status: 'VERIFIED' | 'PENDING_REVIEW' | 'AWAITING_CLIENT_UPLOAD';
}

interface TaxPrepDocumentVaultProps {
  customerName: string;
  onDocumentVerified?: (docId: string) => void;
}

export const TaxPrepDocumentVault: React.FC<TaxPrepDocumentVaultProps> = ({
  customerName,
  onDocumentVerified,
}) => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  const handleVerify = (docId: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, status: 'VERIFIED' } : d))
    );
    toast.success('Document verified successfully!');
    if (onDocumentVerified) onDocumentVerified(docId);
  };

  const handleSimulatedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newDoc: DocumentItem = {
        id: `doc-${Date.now()}`,
        docType: 'Supplemental Tax Document',
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadedAt: 'Just now',
        status: 'PENDING_REVIEW',
      };
      setDocuments((prev) => [newDoc, ...prev]);
      toast.success(`Attached ${file.name} to ${customerName}'s vault!`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Documents Vault Notice */}
      <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-purple-600 shrink-0" />
          <span className="font-medium">
            <strong>Client Documents Vault</strong> — Review taxpayer uploaded files or attach documents sent directly to you by {customerName}.
          </span>
        </div>
        <label className="px-3 py-1 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shrink-0 cursor-pointer flex items-center gap-1.5 shadow-2xs">
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Upload Document</span>
          <input
            type="file"
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg,.xlsx"
            onChange={handleSimulatedUpload}
          />
        </label>
      </div>

      {/* Documents List */}
      {documents.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto border border-purple-100 font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-slate-800">No Uploaded Documents Yet</h4>
          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
            {customerName} has not uploaded W-2 or tax forms yet. You can attach documents received via email/chat using the <strong>Upload Document</strong> button above.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-all"
            >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                doc.status === 'VERIFIED'
                  ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200'
                  : doc.status === 'PENDING_REVIEW'
                  ? 'bg-amber-50 text-amber-600 border border-amber-200'
                  : 'bg-slate-100 text-slate-400 border border-slate-200'
              }`}>
                <FileText className="w-5 h-5" />
              </div>

              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{doc.name}</span>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {doc.docType}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium flex items-center gap-2">
                  <span>Size: <strong>{doc.size}</strong></span>
                  <span>•</span>
                  <span>Uploaded: <strong>{doc.uploadedAt}</strong></span>
                </div>
              </div>
            </div>

            {/* Status & Actions */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              {doc.status === 'VERIFIED' && (
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                  Verified
                </span>
              )}

              {doc.status === 'PENDING_REVIEW' && (
                <Button
                  size="sm"
                  onClick={() => handleVerify(doc.id)}
                  className="h-7 px-2.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verify & Approve</span>
                </Button>
              )}

              {doc.status === 'AWAITING_CLIENT_UPLOAD' && (
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Awaiting Upload
                </span>
              )}

              {doc.status !== 'AWAITING_CLIENT_UPLOAD' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.success(`Viewing preview of ${doc.name}`)}
                  className="h-7 w-7 p-0 rounded-lg text-slate-600 border-slate-200 hover:bg-slate-50 cursor-pointer"
                  title="Preview document"
                >
                  <Eye className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};
