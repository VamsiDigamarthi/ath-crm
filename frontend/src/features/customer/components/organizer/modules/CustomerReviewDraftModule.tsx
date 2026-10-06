import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  FileCheck2, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  FileText, 
  Loader2, 
  Trash2,
  Eye,
  CheckSquare,
  Square,
  Send
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppModal } from '@/shared/components/AppModal';
import { AppTextarea } from '@/shared/components/AppTextarea';
import { customerApi } from '../../../services/customer-api';
import { apiClient } from '@/lib/api-client';
import { prepReviewService } from '@/features/prep-review/services/prep-review-service';
import { salesService } from '@/features/sales/services/sales-service';
import { useAuthStore } from '@/features/auth/store/auth-store';
import toast from 'react-hot-toast';

interface CustomerReviewDraftModuleProps {
  selectedTaxYear: number;
  leadId?: string;
  readOnly?: boolean;
}

export const CustomerReviewDraftModule: React.FC<CustomerReviewDraftModuleProps> = ({
  selectedTaxYear,
  leadId,
}) => {
  const { user } = useAuthStore();
  const routeId = typeof window !== 'undefined' ? window.location.pathname.split('/').filter(Boolean).pop() : undefined;
  const effectiveLeadId = leadId || (routeId && routeId.length > 10 ? routeId : undefined);
  const isClient = user?.role === 'TAXPAYER_USER' || user?.role === 'CLIENT';
  const isPrepOrReviewWorkspace = typeof window !== 'undefined' && 
    (window.location.pathname.includes('/prep-review/') || 
     window.location.pathname.includes('/preparer/') || 
     window.location.pathname.includes('/reviewer/'));
  const isPrepOrReviewerRole = user?.role === 'TAX_PREPARER' || 
    user?.role === 'PREP_MANAGER' || 
    user?.role === 'TAX_REVIEWER';
  const isSalesTeam = !isPrepOrReviewWorkspace && !isPrepOrReviewerRole && (
    user?.role === 'ADMIN' || 
    user?.role === 'SALES_MANAGER' || 
    user?.role === 'SALES_AGENT'
  );
  const isStaff = !isClient;

  const isDocumenter = user?.role === 'DOC_AGENT' || 
    user?.role === 'DOC_MANAGER' || 
    (typeof window !== 'undefined' && window.location.pathname.includes('/documenter/'));

  const [loading, setLoading] = useState(true);
  const [draftData, setDraftData] = useState<any>(null);

  // Staff upload states
  const [isUploadingDraft, setIsUploadingDraft] = useState(false);
  const [isUploadingDeliverable, setIsUploadingDeliverable] = useState(false);
  const [deliverableFile, setDeliverableFile] = useState<File | null>(null);
  const [deliverableRequiresEsign, setDeliverableRequiresEsign] = useState(true);
  const [isSendingDraft, setIsSendingDraft] = useState(false);
  const [isReopeningVersion, setIsReopeningVersion] = useState(false);

  const draftFileInputRef = useRef<HTMLInputElement>(null);
  const deliverableFileInputRef = useRef<HTMLInputElement>(null);

  // Client actions state
  const [isApproving, setIsApproving] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);

  const fetchDraftReview = useCallback(async () => {
    if (isDocumenter) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await customerApi.getDraftReview(selectedTaxYear, effectiveLeadId);
      if (res?.data) {
        setDraftData(res.data);
      }
    } catch {
      toast.error('Failed to load tax draft review');
    } finally {
      setLoading(false);
    }
  }, [selectedTaxYear, effectiveLeadId]);

  useEffect(() => {
    fetchDraftReview();
  }, [fetchDraftReview]);

  const draft = draftData?.taxDraftSummary || {};
  const deliverables: any[] = draftData?.deliverableDocuments || draft.deliverableDocuments || [];
  const drakeFile = draftData?.drakeTaxFile || draft.drakeTaxFile;
  const draftVersion = draftData?.draftVersion || draft.draftVersion || 1;
  const clientReviewStatus = draftData?.clientReviewStatus || draft.clientReviewStatus || 'NOT_SENT';
  const clientRevisionNotes = draftData?.clientRevisionNotes || draft.clientRevisionNotes || '';

  // Staff Handlers: 1. Tax Draft Upload
  const handleUploadTaxDraft = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !effectiveLeadId) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File exceeds 50MB limit');
      return;
    }

    setIsUploadingDraft(true);
    const toastId = toast.loading(`Uploading tax return draft "${file.name}"...`);
    try {
      await prepReviewService.uploadDrakeTaxFile(effectiveLeadId, file);
      toast.success('Tax return draft uploaded successfully! ✓', { id: toastId });
      if (draftFileInputRef.current) draftFileInputRef.current.value = '';
      await fetchDraftReview();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to upload tax draft', { id: toastId });
    } finally {
      setIsUploadingDraft(false);
    }
  };

  const handleDeleteTaxDraft = async () => {
    if (!effectiveLeadId) return;
    const toastId = toast.loading('Removing draft file...');
    try {
      await prepReviewService.deleteDrakeTaxFile(effectiveLeadId);
      toast.success('Tax return draft removed.', { id: toastId });
      await fetchDraftReview();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to remove draft', { id: toastId });
    }
  };

  // Staff Handlers: 2. Deliverable Document Upload
  const handleUploadDeliverable = async () => {
    if (!effectiveLeadId || !deliverableFile) return;

    if (deliverableFile.size > 50 * 1024 * 1024) {
      toast.error('File exceeds 50MB limit');
      return;
    }

    setIsUploadingDeliverable(true);
    const toastId = toast.loading(`Uploading "${deliverableFile.name}"...`);
    try {
      await prepReviewService.uploadDeliverableDocument(effectiveLeadId, deliverableFile, deliverableRequiresEsign);
      toast.success('Deliverable document added! ✓', { id: toastId });
      setDeliverableFile(null);
      setDeliverableRequiresEsign(true);
      if (deliverableFileInputRef.current) deliverableFileInputRef.current.value = '';
      await fetchDraftReview();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to upload deliverable document', { id: toastId });
    } finally {
      setIsUploadingDeliverable(false);
    }
  };

  const handleToggleDeliverableEsign = async (docId: string, currentReq: boolean) => {
    if (!effectiveLeadId) return;
    const newReq = !currentReq;
    try {
      await prepReviewService.toggleDeliverableEsign(effectiveLeadId, docId, newReq);
      toast.success(newReq ? 'Requires client e-sign & re-upload' : 'Marked as reference only');
      await fetchDraftReview();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update signature requirement');
    }
  };

  const handleDeleteDeliverable = async (docId: string) => {
    if (!effectiveLeadId) return;
    const toastId = toast.loading('Removing deliverable document...');
    try {
      await prepReviewService.deleteDeliverableDocument(effectiveLeadId, docId);
      toast.success('Document removed.', { id: toastId });
      await fetchDraftReview();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to remove document', { id: toastId });
    }
  };

  // Staff Handlers: 3. Dispatch Draft to Client
  const handleSendDraftToClient = async () => {
    if (!effectiveLeadId) return;
    setIsSendingDraft(true);
    const toastId = toast.loading(`Dispatching return draft v${draftVersion} to taxpayer...`);
    try {
      await salesService.sendDraftToClient(effectiveLeadId);
      toast.success(`Draft package sent to client! Taxpayer notified via email & portal. 🚀`, { id: toastId });
      await fetchDraftReview();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to send draft to client', { id: toastId });
    } finally {
      setIsSendingDraft(false);
    }
  };

  // Staff Handlers: 4. Reopen New Version on Demand
  const handleReopenDraftVersion = async () => {
    if (!effectiveLeadId) return;
    setIsReopeningVersion(true);
    const toastId = toast.loading('Reopening new draft version...');
    try {
      const res = await salesService.reopenDraftVersion(effectiveLeadId);
      toast.success(`New draft version v${res?.draftVersion || draftVersion + 1} opened for modifications! 🔄`, { id: toastId });
      await fetchDraftReview();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to reopen new version', { id: toastId });
    } finally {
      setIsReopeningVersion(false);
    }
  };

  // Client Handlers: Upload signed file
  const targetAppId = draftData?.applicationId || effectiveLeadId;

  const handleUploadSignedFile = async (docId: string, file: File) => {
    setUploadingDocId(docId);
    const toastId = toast.loading(`Uploading signed "${file.name}"...`);
    try {
      await customerApi.uploadSignedDeliverable(docId, file, selectedTaxYear, targetAppId);
      toast.success(`Signed document uploaded successfully! ✍️✓`, { id: toastId });
      fetchDraftReview();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to upload signed document', { id: toastId });
    } finally {
      setUploadingDocId(null);
    }
  };

  // Client Handlers: Approve draft
  const missingSignatures = deliverables.filter((d) => d.requiresEsign && !d.signedDocument);
  const canApprove = missingSignatures.length === 0;

  const handleApproveDraft = async () => {
    if (!canApprove) {
      toast.error('Please sign and upload all required documents before approving.');
      return;
    }
    setIsApproving(true);
    const toastId = toast.loading('Submitting tax return approval...');
    try {
      await customerApi.approveDraft({
        applicationId: targetAppId,
        leadId: targetAppId,
        taxYear: selectedTaxYear,
        notes: 'Taxpayer reviewed calculation summary and approved all return deliverables.',
      });
      toast.success('Tax Return Draft Approved! 🎉 Thank you.', { id: toastId });
      fetchDraftReview();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to approve draft', { id: toastId });
    } finally {
      setIsApproving(false);
    }
  };

  // Client Handlers: Reject draft
  const handleRejectDraft = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide reasons for your revision request.');
      return;
    }
    setIsRejecting(true);
    const toastId = toast.loading('Submitting revision request to specialist...');
    try {
      await customerApi.rejectDraft({
        applicationId: targetAppId,
        leadId: targetAppId,
        taxYear: selectedTaxYear,
        reason: rejectReason.trim(),
      });
      toast.success('Revision request sent to your tax specialist! We will update your draft promptly.', { id: toastId });
      setIsRejectModalOpen(false);
      setRejectReason('');
      fetchDraftReview();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to submit revision request', { id: toastId });
    } finally {
      setIsRejecting(false);
    }
  };

  const handleDownloadFile = async (doc?: { id?: string; fileName?: string; fileUrl?: string } | null) => {
    if (!doc) return;
    const fileName = doc.fileName || 'tax_document.pdf';
    const toastId = toast.loading(`Downloading ${fileName}...`);
    try {
      if (doc.id) {
        await customerApi.downloadDocument(doc.id, fileName, effectiveLeadId);
        toast.success(`Downloaded ${fileName}`, { id: toastId });
        return;
      }

      if (doc.fileUrl) {
        const fullUrl = doc.fileUrl.startsWith('http')
          ? doc.fileUrl
          : `${apiClient.defaults.baseURL?.replace(/\/api\/?$/, '') || 'http://localhost:5000'}${doc.fileUrl.startsWith('/') ? '' : '/'}${doc.fileUrl}`;
        const response = await fetch(fullUrl, { credentials: 'include' });
        if (!response.ok) throw new Error('File download failed');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success(`Downloaded ${fileName}`, { id: toastId });
        return;
      }
      toast.error('Document file not available', { id: toastId });
    } catch {
      toast.error('Failed to download document', { id: toastId });
    }
  };

  const handleViewFile = async (doc?: { id?: string; fileName?: string; fileUrl?: string } | null) => {
    if (!doc) return;
    const fileName = doc.fileName || '';
    const isPdf = /\.pdf$/i.test(fileName);
    const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(fileName);

    // For non-previewable formats (like .docx, .xlsx, .zip), browsers cannot render them. Direct download immediately.
    if (!isPdf && !isImage) {
      handleDownloadFile(doc);
      return;
    }

    const toastId = toast.loading(`Opening ${fileName}...`);
    try {
      let blob: Blob;
      if (doc.id) {
        const params = effectiveLeadId ? { leadId: effectiveLeadId } : undefined;
        const response: any = await apiClient.get(`/customer/documents/${doc.id}/download`, {
          params,
          responseType: 'blob',
        });
        blob = new Blob([response], { type: isPdf ? 'application/pdf' : 'image/jpeg' });
      } else if (doc.fileUrl) {
        const fullUrl = doc.fileUrl.startsWith('http')
          ? doc.fileUrl
          : `${apiClient.defaults.baseURL?.replace(/\/api\/?$/, '') || 'http://localhost:5000'}${doc.fileUrl.startsWith('/') ? '' : '/'}${doc.fileUrl}`;
        const res = await fetch(fullUrl, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch file');
        blob = await res.blob();
      } else {
        toast.error('File not available', { id: toastId });
        return;
      }

      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      toast.dismiss(toastId);
    } catch {
      toast.error('Failed to open preview, downloading instead...', { id: toastId });
      handleDownloadFile(doc);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes === 0) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isDocumenter) {
    return null;
  }

  if (loading) {
    return (
      <div className="py-6 text-center space-y-2 font-sans">
        <Loader2 className="w-5 h-5 text-emerald-600 animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading draft files...</p>
      </div>
    );
  }

  const fedRefund = Number(draft.federalRefund ?? draft.fedRefund ?? 0);
  const stateRefund = Number(draft.stateRefund ?? draft.stateTaxRefund ?? 0);
  const totalGrossIncome = Number(draft.totalGrossIncome ?? draft.w2Wages ?? 0);
  const hasFinancialData = fedRefund > 0 || stateRefund > 0 || totalGrossIncome > 0;

  return (
    <div className="w-full space-y-6 font-sans text-slate-900 py-1">
      {/* 1. Flat Header (Zero Boxes) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-slate-900 text-white">
            v{draftVersion}
          </span>
          <h3 className="text-sm font-bold text-slate-900">
            Review Draft &amp; E-Sign
          </h3>
          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
            clientReviewStatus === 'CLIENT_APPROVED'
              ? 'bg-emerald-100 text-emerald-800'
              : clientReviewStatus === 'CLIENT_REVISION_REQUESTED'
              ? 'bg-rose-100 text-rose-800'
              : clientReviewStatus === 'SENT_TO_CLIENT'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-slate-100 text-slate-600'
          }`}>
            {clientReviewStatus === 'CLIENT_APPROVED'
              ? '✓ Client Approved'
              : clientReviewStatus === 'CLIENT_REVISION_REQUESTED'
              ? 'Revision Requested'
              : clientReviewStatus === 'SENT_TO_CLIENT'
              ? 'Dispatched to Client'
              : 'Internal Draft'}
          </span>

          {isSalesTeam && (
            <div className="flex items-center gap-2 ml-2">
              <Button
                type="button"
                size="sm"
                disabled={isSendingDraft}
                onClick={handleSendDraftToClient}
                className="h-7 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Send return draft copy and e-sign deliverables to client portal"
              >
                <Send className="w-3 h-3" />
                <span>{isSendingDraft ? 'Sending...' : clientReviewStatus === 'SENT_TO_CLIENT' ? 'Re-send to Client' : 'Send to Client'}</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isReopeningVersion}
                onClick={handleReopenDraftVersion}
                className="h-7 px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer border-slate-300"
                title="Reopen a new revision draft version"
              >
                <RotateCcw className="w-3 h-3 text-slate-500" />
                <span>Reopen v{draftVersion + 1}</span>
              </Button>
            </div>
          )}
        </div>

        {hasFinancialData && (
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span>Fed Refund: <strong className="text-emerald-700">${fedRefund.toLocaleString()}</strong></span>
            <span>•</span>
            <span>State Refund: <strong className="text-blue-700">${stateRefund.toLocaleString()}</strong></span>
          </div>
        )}
      </div>

      {/* Client Revision Note if any */}
      {clientReviewStatus === 'CLIENT_REVISION_REQUESTED' && clientRevisionNotes && (
        <div className="p-2 bg-amber-50 border border-amber-200 text-amber-900 rounded text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Client Revision Note: "{clientRevisionNotes}"</span>
        </div>
      )}

      {/* 2. SECTION 1: Tax Return Draft (Form 1040 / 1120 / Drake File) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            1. Prepared Tax Return Draft (Form 1040 / 1120)
          </h4>
          {drakeFile && (
            <span className="text-xs font-semibold text-emerald-600">
              ✓ Attached
            </span>
          )}
        </div>

        {drakeFile ? (
          <div className="flex items-center justify-between py-2 border-b border-slate-200 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold text-slate-900 truncate">{drakeFile.fileName}</span>
              <span className="text-[11px] text-slate-500">
                ({formatFileSize(drakeFile.fileSize)})
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDownloadFile(drakeFile)}
                className="h-7 text-xs font-medium cursor-pointer flex items-center gap-1.5"
                title="Download tax return draft"
              >
                <Download className="w-3 h-3 text-slate-500" />
                <span>Download</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleViewFile(drakeFile)}
                className="h-7 text-xs font-medium cursor-pointer flex items-center gap-1.5"
                title="View draft"
              >
                <Eye className="w-3 h-3 text-slate-500" />
                <span>View</span>
              </Button>
              {isStaff && (
                <>
                  <input
                    ref={draftFileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleUploadTaxDraft}
                    accept=".pdf,.xml,.json,.xlsx,.csv,.bak"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploadingDraft}
                    onClick={() => draftFileInputRef.current?.click()}
                    className="h-7 text-xs font-medium cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Replace</span>
                  </Button>
                  <button
                    type="button"
                    onClick={handleDeleteTaxDraft}
                    className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                    title="Delete draft"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2 text-xs">
            <span className="text-slate-500">
              {isStaff
                ? 'No tax return draft uploaded yet. Click upload to attach the prepared Form 1040/1120 or Drake file.'
                : 'Your tax return draft is currently being finalized by your preparer.'}
            </span>
            {isStaff && (
              <div>
                <input
                  ref={draftFileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleUploadTaxDraft}
                  accept=".pdf,.xml,.json,.xlsx,.csv,.bak"
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={isUploadingDraft}
                  onClick={() => draftFileInputRef.current?.click()}
                  className="h-8 px-4 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingDraft ? 'Uploading...' : 'Upload Tax Return Draft'}</span>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. SECTION 2: Client Deliverable Documents & E-Sign Requirements */}
      <div className="space-y-3 pt-3 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            2. Client Deliverables &amp; E-Sign Requirements ({deliverables.length})
          </h4>
        </div>

        {/* Staff Upload Bar: PROMINENT & UNCONDITIONALLY VISIBLE */}
        {isStaff && (
          <div className="flex flex-wrap items-center gap-3 py-1 text-xs">
            <input
              ref={deliverableFileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => setDeliverableFile(e.target.files?.[0] || null)}
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => deliverableFileInputRef.current?.click()}
              className="h-8 px-3 text-xs font-semibold border-slate-300 text-slate-800 hover:bg-slate-50 flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>{deliverableFile ? 'Change File' : 'Select Document'}</span>
            </Button>

            {deliverableFile ? (
              <span className="font-semibold text-slate-900 truncate max-w-xs" title={deliverableFile.name}>
                {deliverableFile.name} ({formatFileSize(deliverableFile.size)})
              </span>
            ) : (
              <span className="text-slate-400">Attach Form 8879, state authorization, or informational documents</span>
            )}

            <div className="flex items-center gap-4 ml-auto">
              <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-800 font-semibold text-xs">
                <input
                  type="checkbox"
                  checked={deliverableRequiresEsign}
                  onChange={(e) => setDeliverableRequiresEsign(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                />
                <span>Requires Client E-Sign</span>
              </label>

              <Button
                type="button"
                size="sm"
                disabled={!deliverableFile || isUploadingDeliverable}
                onClick={handleUploadDeliverable}
                className="h-8 px-4 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40 shadow-sm"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>{isUploadingDeliverable ? 'Adding...' : 'Add Document'}</span>
              </Button>
            </div>
          </div>
        )}

        {/* Deliverables List (Flat list with border-b) */}
        {deliverables.length === 0 ? (
          <div className="py-2 text-xs text-slate-400">
            No deliverable documents attached yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {deliverables.map((doc, idx) => {
              const isSigningRequired = Boolean(doc.requiresEsign);
              const isSigned = Boolean(doc.signedDocument);

              return (
                <div
                  key={doc.id || idx}
                  className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="font-semibold text-slate-900 truncate" title={doc.fileName}>
                      {doc.fileName}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ({formatFileSize(doc.fileSize)})
                    </span>
                    {isSigningRequired ? (
                      isSigned ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          ✓ Signed
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                          ✍️ E-Sign Required
                        </span>
                      )
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                        Reference Only
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadFile(doc)}
                      className="h-7 text-xs font-medium cursor-pointer flex items-center gap-1.5"
                      title="Download deliverable document"
                    >
                      <Download className="w-3 h-3 text-slate-500" />
                      <span>Download</span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewFile(doc)}
                      className="h-7 text-xs font-medium cursor-pointer flex items-center gap-1.5"
                      title="Preview file"
                    >
                      <Eye className="w-3 h-3 text-slate-500" />
                      <span>View</span>
                    </Button>

                    {doc.signedDocument && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadFile(doc.signedDocument)}
                        className="h-7 text-xs font-medium cursor-pointer flex items-center gap-1.5 text-emerald-700 border-emerald-300 bg-emerald-50 hover:bg-emerald-100"
                        title="Download signed copy"
                      >
                        <Download className="w-3 h-3 text-emerald-600" />
                        <span>Signed Copy</span>
                      </Button>
                    )}

                    {isStaff && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleToggleDeliverableEsign(doc.id, isSigningRequired)}
                          className={`h-7 px-2.5 rounded text-[11px] font-semibold flex items-center gap-1 border transition-colors cursor-pointer ${
                            isSigningRequired
                              ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                              : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                          }`}
                          title="Toggle client signature requirement"
                        >
                          {isSigningRequired ? (
                            <CheckSquare className="w-3 h-3 text-amber-600" />
                          ) : (
                            <Square className="w-3 h-3 text-slate-400" />
                          )}
                          <span>{isSigningRequired ? 'E-Sign Required' : 'Make E-Sign'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteDeliverable(doc.id)}
                          className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                          title="Delete deliverable"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    {isSigningRequired && (isClient || isSalesTeam) && (
                      <label
                        className={`h-7 px-2.5 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                          isSigned
                            ? 'border border-slate-300 text-slate-700 hover:bg-slate-50 bg-white'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                        }`}
                        title={isSalesTeam ? 'Upload signed copy on behalf of client' : 'Upload your signed document'}
                      >
                        <Upload className="w-3 h-3" />
                        <span>
                          {uploadingDocId === doc.id
                            ? 'Uploading...'
                            : isSigned
                            ? 'Replace Signed'
                            : isSalesTeam
                            ? 'Upload Signed Copy'
                            : 'Sign & Upload'}
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleUploadSignedFile(doc.id, e.target.files[0]);
                            }
                          }}
                          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                        />
                      </label>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Client Review & Approval Footer */}
      {clientReviewStatus === 'SENT_TO_CLIENT' && (isClient || isSalesTeam) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200">
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              {isSalesTeam ? 'Client Approval & Return Sign-Off' : 'Ready to Approve Your Return?'}
            </h4>
            <p className="text-[11px] text-slate-500">
              {missingSignatures.length > 0
                ? isSalesTeam
                  ? `Client has ${missingSignatures.length} document(s) pending signature. Upload signed copies above on behalf of client to enable approval.`
                  : `Please sign and upload all ${missingSignatures.length} required documents above to enable final sign-off.`
                : isSalesTeam
                ? 'All required documents signed. You may record client approval if received verbally or in writing.'
                : 'All documents verified. Click Approve to authorize filing with the IRS.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isClient && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsRejectModalOpen(true)}
                className="text-xs font-semibold border-amber-300 text-amber-900 hover:bg-amber-50 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Request Revisions</span>
              </Button>
            )}

            <Button
              type="button"
              size="sm"
              disabled={!canApprove || isApproving}
              onClick={handleApproveDraft}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {isApproving 
                  ? 'Submitting...' 
                  : isSalesTeam 
                  ? 'Record Client Approval' 
                  : 'Approve & Certify Return'}
              </span>
            </Button>
          </div>
        </div>
      )}

      {/* Client Revision Request Modal */}
      <AppModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Request Return Revision"
        subtitle="Specify what numbers, forms, or deductions need review by your specialist"
      >
        <div className="space-y-4 pt-2">
          <AppTextarea
            label="What changes are needed on this draft?"
            placeholder="e.g. My W-2 state withholding was $1,500 instead of $1,200, please verify Box 17..."
            value={rejectReason}
            onChange={setRejectReason}
            rows={4}
          />
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsRejectModalOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!rejectReason.trim() || isRejecting}
              onClick={handleRejectDraft}
              className="bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
            >
              {isRejecting ? 'Sending...' : 'Submit Revision Request'}
            </Button>
          </div>
        </div>
      </AppModal>
    </div>
  );
};
