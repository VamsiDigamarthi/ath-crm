import React from 'react';
import { ShieldCheck, FileText, Lock, ExternalLink } from 'lucide-react';
import apiClient from '@/lib/api-client';
import toast from 'react-hot-toast';
import type { WorkspaceTaxpayer, WorkspaceAssignedReviewer, WorkspaceDocument } from '../../hooks/useTaxPreparerWorkspace';

interface ClientProfilePanelProps {
  taxpayer: WorkspaceTaxpayer | null;
  assignedReviewer: WorkspaceAssignedReviewer | null;
  documents: WorkspaceDocument[];
  standardDeductionAmount: number;
  onPreviewDoc: (doc: WorkspaceDocument) => void;
}

export const ClientProfilePanel: React.FC<ClientProfilePanelProps> = ({
  taxpayer,
  assignedReviewer,
  documents,
  standardDeductionAmount,
  onPreviewDoc,
}) => {
  const reviewerName = assignedReviewer?.name || '-';
  const reviewerEmail = assignedReviewer?.email || '-';

  const handleDirectOpenNewTab = async (e: React.MouseEvent, doc: WorkspaceDocument) => {
    e.stopPropagation();
    try {
      toast.loading(`Opening ${doc.fileName}...`, { id: 'direct-open' });
      const response: any = await apiClient.get(`/prep-review/documents/${doc.id}/download`, {
        responseType: 'blob',
      });
      const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(doc.fileName);
      const isPdf = /\.pdf$/i.test(doc.fileName);
      const mimeType = isImage ? 'image/jpeg' : isPdf ? 'application/pdf' : 'application/octet-stream';
      const blob = new Blob([response], { type: mimeType });
      const fileUrl = URL.createObjectURL(blob);
      window.open(fileUrl, '_blank');
      toast.success('Opened in new tab', { id: 'direct-open' });
    } catch {
      toast.error('Failed to open document in new tab', { id: 'direct-open' });
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Designated 4-Eyes Compliance Auditor */}
      <div className="bg-gradient-to-br from-purple-50 via-white to-slate-50 p-5 rounded-xl border border-purple-200 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-4 h-4 text-purple-600" />
          <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">
            Designated 4-Eyes QA Auditor
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
            {reviewerName !== '-' ? reviewerName.charAt(0).toUpperCase() : 'Q'}
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">{reviewerName}</div>
            <div className="text-xs text-slate-500 font-medium">{reviewerEmail}</div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-purple-100 flex items-center justify-between text-[11px] text-purple-700 font-medium">
          <span>Compliance Reviewer</span>
          <span className="font-bold">4-Eyes Sign-Off Authority</span>
        </div>
      </div>

      {/* 2. Source Documents Vault */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
            <FileText className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Verified Source Documents</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#16A34A] border border-emerald-200">
            {documents.filter((d) => d.verificationStatus === 'VERIFIED').length}/{documents.length} Verified
          </span>
        </div>

        {documents.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
            No source documents uploaded for this tax application.
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                onClick={() => onPreviewDoc(doc)}
                className="group p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-2xs transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 group-hover:scale-105 transition-transform">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                      {doc.fileName || doc.category || '-'}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      Category: <strong className="text-slate-600">{doc.category || '-'}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    title="Open document in new browser tab"
                    onClick={(e) => handleDirectOpenNewTab(e, doc)}
                    className="p-1.5 rounded-md hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      doc.verificationStatus === 'VERIFIED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {doc.verificationStatus || 'PENDING'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Taxpayer & Filing Profile Specs */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 font-bold text-xs text-slate-900 border-b border-slate-100 pb-2.5">
          <Lock className="w-3.5 h-3.5 text-blue-600" />
          <span>Taxpayer &amp; Filing Specs</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Filing Status:</span>
            <span className="font-bold text-slate-800">{taxpayer?.maritalStatus || '-'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Visa / Tax Residency:</span>
            <span className="font-bold text-slate-800">{taxpayer?.visaType || '-'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Primary State:</span>
            <span className="font-bold text-slate-800">{taxpayer?.state || '-'}</span>
          </div>
          <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
            <span className="text-slate-500 font-medium">Standard Deduction (2025):</span>
            <span className="font-bold text-[#16A34A]">${standardDeductionAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
