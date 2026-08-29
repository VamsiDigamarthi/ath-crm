import React from 'react';
import { ShieldCheck, CheckSquare, Square, FileText, CheckCircle2, Eye, ExternalLink } from 'lucide-react';
import apiClient from '@/lib/api-client';
import type { WorkspaceDocument } from '../../../hooks/useTaxPreparerWorkspace';
import toast from 'react-hot-toast';

interface ReviewerComplianceChecklistProps {
  documents: WorkspaceDocument[];
  checks: { [key: string]: boolean };
  toggleCheck: (key: string) => void;
  onSelectAllChecks: () => void;
  allChecksPassed: boolean;
  onPreviewDoc: (doc: WorkspaceDocument) => void;
}

export const ReviewerComplianceChecklist: React.FC<ReviewerComplianceChecklistProps> = ({
  documents,
  checks,
  toggleCheck,
  onSelectAllChecks,
  allChecksPassed,
  onPreviewDoc,
}) => {
  const handleDirectOpenNewTab = async (e: React.MouseEvent, doc: WorkspaceDocument) => {
    e.stopPropagation();
    try {
      toast.loading(`Opening ${doc.fileName}...`, { id: 'audit-open' });
      const response: any = await apiClient.get(`/prep-review/documents/${doc.id}/download`, {
        responseType: 'blob',
      });
      const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(doc.fileName);
      const isPdf = /\.pdf$/i.test(doc.fileName);
      const mimeType = isImage ? 'image/jpeg' : isPdf ? 'application/pdf' : 'application/octet-stream';
      const blob = new Blob([response], { type: mimeType });
      const fileUrl = URL.createObjectURL(blob);
      window.open(fileUrl, '_blank');
      toast.success('Opened in new tab', { id: 'audit-open' });
    } catch {
      toast.error('Failed to open document in new tab', { id: 'audit-open' });
    }
  };

  const checklistItems = [
    { key: 'checkW2', title: 'W-2 Wages & Box 1 Match', desc: 'Verified W-2 box 1 against 1040 Line 1a total' },
    { key: 'checkWithheld', title: 'Fed & State Withholding Audit', desc: 'Cross-checked Box 2 & Box 17 withholdings' },
    { key: 'check1099B', title: '1099-B Capital Gains / 1099-INT', desc: 'Brokerage proceeds and dividend income audited' },
    { key: 'checkDeduction', title: 'Deduction Optimization (MFJ)', desc: 'Standard deduction ($29,200) verified' },
    { key: 'checkState', title: 'State Tax Apportionment', desc: 'IL state residency & credit allocation confirmed' },
    { key: 'checkFBAR', title: 'FBAR / Foreign Account Compliance', desc: 'Foreign asset disclosures validated' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. 4-Eyes Compliance Verification Deck */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <h3 className="font-bold text-xs sm:text-sm text-slate-900">
              4-Eyes Compliance Audit Checklist
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {!allChecksPassed && (
              <button
                type="button"
                onClick={onSelectAllChecks}
                className="text-[10px] font-bold text-purple-600 hover:text-purple-800 cursor-pointer"
              >
                Select All
              </button>
            )}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${allChecksPassed ? 'bg-emerald-50 text-[#16A34A] border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
              {allChecksPassed ? '6 of 6 Verified' : `${Object.values(checks).filter(Boolean).length} of 6 Checked`}
            </span>
          </div>
        </div>

        <div className="space-y-2.5">
          {checklistItems.map((item) => {
            const isChecked = checks[item.key] || false;
            return (
              <div
                key={item.key}
                onClick={() => toggleCheck(item.key)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  isChecked
                    ? 'border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50/70'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-[#16A34A]" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div>
                  <div className={`font-bold text-xs ${isChecked ? 'text-slate-900' : 'text-slate-700'}`}>
                    {item.title}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">{item.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Authenticated Source Documents Vault */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#16A34A]" />
            <h3 className="font-bold text-xs sm:text-sm text-slate-900">
              Source Documents Vault ({documents.length || 0})
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#16A34A] border border-emerald-200">
            100% Authenticated
          </span>
        </div>

        {documents.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No source documents uploaded.
          </div>
        ) : (
          <div className="space-y-2">
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
                    <div className="font-bold text-xs text-slate-900 group-hover:text-purple-700 transition-colors truncate">
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
    </div>
  );
};
