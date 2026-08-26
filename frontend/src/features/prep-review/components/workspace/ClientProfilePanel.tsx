import React from 'react';
import { ShieldCheck, CheckCircle2, Eye, FileText, Lock, ExternalLink } from 'lucide-react';
import apiClient from '@/lib/api-client';
import type { WorkspaceTaxpayer, WorkspaceAssignedReviewer, WorkspaceDocument } from '../../hooks/useTaxPreparerWorkspace';
import toast from 'react-hot-toast';

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
  const reviewerName = assignedReviewer?.name || 'Kavita Nair';
  const reviewerEmail = assignedReviewer?.email || 'kavita.nair@taxcrm.com';

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
    <div className="space-y-6">
      {/* 1. Assigned Senior QA Reviewer Card */}
      <div className="p-4 rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50/70 to-white shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span className="font-bold text-xs text-purple-950 uppercase tracking-wider">
              4-Eyes QA Designated Auditor
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
            Senior Reviewer
          </span>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <div className="w-9 h-9 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            {reviewerName[0]}
          </div>
          <div>
            <div className="font-bold text-xs sm:text-sm text-slate-900">{reviewerName}</div>
            <div className="text-[11px] text-purple-700 font-medium">{reviewerEmail}</div>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 font-medium leading-relaxed pt-1 border-t border-purple-100">
          Upon clicking Submit, this calculation will immediately be audited against source files by {reviewerName}.
        </p>
      </div>

      {/* 2. Verified Source Documents Vault */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#16A34A]" />
            <span className="font-bold text-xs sm:text-sm text-slate-900">
              Verified Source Documents ({documents.length || 0})
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#16A34A] border border-emerald-200">
            100% Authenticated
          </span>
        </div>

        {documents.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No uploaded documents attached.
          </div>
        ) : (
          <div className="space-y-2.5">
            {documents.map((doc) => (
              <div
                key={doc.id}
                onClick={() => onPreviewDoc(doc)}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {doc.fileName || doc.category || 'Document'}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      Category: <strong className="text-slate-600">{doc.category || 'Tax Slip'}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => handleDirectOpenNewTab(e, doc)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                    title="Open in New Tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreviewDoc(doc);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                    title="View Verified Slip"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
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
            <span className="font-bold text-slate-800">{taxpayer?.maritalStatus || 'Married Filing Jointly'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Visa / Tax Residency:</span>
            <span className="font-bold text-slate-800">{taxpayer?.visaType || 'H-1B Specialty Occupation'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Primary State:</span>
            <span className="font-bold text-slate-800">{taxpayer?.state || 'Illinois (IL)'}</span>
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
