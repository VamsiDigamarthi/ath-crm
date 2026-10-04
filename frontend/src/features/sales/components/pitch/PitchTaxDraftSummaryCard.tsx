import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Edit3,
  Save,
  X,
  Send,
  RotateCcw,
  Sparkles,
  Calculator,
  Loader2,
  Clock
} from 'lucide-react';
import { ReturnComplexityBadge } from '../common/ReturnComplexityBadge';
import { Button } from '@/shared/components/Button';
import { DeliverablesUploadCard } from '@/features/prep-review/components/workspace/DeliverablesUploadCard';
import { salesService } from '../../services/sales-service';
import type { SalesLeadItem } from '../../types/sales.types';
import toast from 'react-hot-toast';

interface PitchTaxDraftSummaryCardProps {
  lead: SalesLeadItem;
  onViewOrganizer?: () => void;
  onLeadUpdated?: (updated: SalesLeadItem) => void;
}

export const PitchTaxDraftSummaryCard: React.FC<PitchTaxDraftSummaryCardProps> = ({ 
  lead, 
  onViewOrganizer,
  onLeadUpdated 
}) => {
  const draft = (lead.taxDraftSummary as any) || {};
  const appId = lead.id || lead.applicationId || '';

  const rawStage = String(lead.currentStage || draft.status || '');
  let qaStatus: 'Approved' | 'Changes Required' | 'Pending Review' = 'Approved';
  if (rawStage.includes('CORRECTION') || rawStage.includes('REVISION')) {
    qaStatus = 'Changes Required';
  } else if (rawStage.includes('DOC') || rawStage.includes('PROSPECT') || rawStage.includes('PREP')) {
    qaStatus = 'Pending Review';
  } else {
    qaStatus = 'Approved';
  }

  const preparerName = String(lead.assignedPrepAgent?.name || draft.preparerName || 'Tax Preparer');
  const preparerEmail = String(lead.assignedPrepAgent?.email || '');
  const reviewerName = String(lead.qaAuditorName || draft.reviewerName || 'Senior QA Auditor');
  const reviewDate = lead.qaApprovedAt 
    ? new Date(lead.qaApprovedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recent';
  const taxYearDisplay = `TY ${lead.taxYear || draft.taxYear || 2025}`;
  const isBusiness = lead.filingType === 'BUSINESS';
  const filingTypeStr = isBusiness ? 'Form 1120' : 'Form 1040';

  // Versioning and client review status
  const draftVersion = draft.draftVersion || 1;
  const clientReviewStatus = draft.clientReviewStatus || 'NOT_SENT';
  const clientRevisionNotes = draft.clientRevisionNotes || '';
  const clientReviewSentAt = draft.clientReviewSentAt || '';
  const clientApprovedAt = draft.clientApprovedAt || '';

  // Deliverables state
  const [deliverables, setDeliverables] = useState<any[]>(
    Array.isArray(draft.deliverableDocuments) ? draft.deliverableDocuments : []
  );
  const [isUploadingDeliverable, setIsUploadingDeliverable] = useState(false);

  useEffect(() => {
    if (Array.isArray(draft.deliverableDocuments)) {
      setDeliverables(draft.deliverableDocuments);
    }
  }, [draft.deliverableDocuments]);

  // Calculation editing state
  const [isEditingCalcs, setIsEditingCalcs] = useState(false);
  const [isSavingCalcs, setIsSavingCalcs] = useState(false);
  const [isSendingToClient, setIsSendingToClient] = useState(false);
  const [isReopeningVersion, setIsReopeningVersion] = useState(false);

  // Form values
  const [w2Wages, setW2Wages] = useState<number>(Number(draft.w2Wages) || 0);
  const [taxableInterest, setTaxableInterest] = useState<number>(Number(draft.taxableInterest) || 0);
  const [capitalGains, setCapitalGains] = useState<number>(Number(draft.capitalGains) || 0);
  const [otherIncome, setOtherIncome] = useState<number>(Number(draft.otherIncome) || 0);
  const [deductionType, setDeductionType] = useState<'STANDARD' | 'ITEMIZED'>(draft.deductionType || 'STANDARD');
  const [itemizedDeduction, setItemizedDeduction] = useState<number>(Number(draft.itemizedDeduction) || 0);
  const [taxCredits, setTaxCredits] = useState<number>(Number(draft.taxCredits) || 0);
  const [fedWithheld, setFedWithheld] = useState<number>(Number(draft.fedWithheld) || 0);
  const [stateWithheld, setStateWithheld] = useState<number>(Number(draft.stateWithheld) || 0);

  // Sync state if draft prop changes
  useEffect(() => {
    if (!isEditingCalcs) {
      setW2Wages(Number(draft.w2Wages) || 0);
      setTaxableInterest(Number(draft.taxableInterest) || 0);
      setCapitalGains(Number(draft.capitalGains) || 0);
      setOtherIncome(Number(draft.otherIncome) || 0);
      setDeductionType(draft.deductionType || 'STANDARD');
      setItemizedDeduction(Number(draft.itemizedDeduction) || 0);
      setTaxCredits(Number(draft.taxCredits) || 0);
      setFedWithheld(Number(draft.fedWithheld) || 0);
      setStateWithheld(Number(draft.stateWithheld) || 0);
    }
  }, [draft, isEditingCalcs]);

  // Standard deduction calculation
  const standardDeductionAmount = useMemo(() => {
    const status = (draft.filingStatus || lead.taxpayerStatus || '').toLowerCase();
    if (status.includes('joint') || status === 'married' || (status.includes('married') && !status.includes('separately'))) return 29200;
    if (status.includes('head')) return 21900;
    return 14600;
  }, [draft.filingStatus, lead.taxpayerStatus]);

  // Real-time calculation engine
  const liveCalcs = useMemo(() => {
    const totalGrossIncome = (Number(w2Wages) || 0) + (Number(taxableInterest) || 0) + (Number(capitalGains) || 0) + (Number(otherIncome) || 0);
    const effectiveDeduction = deductionType === 'STANDARD' ? standardDeductionAmount : (Number(itemizedDeduction) || 0);
    const taxableIncome = Math.max(0, totalGrossIncome - effectiveDeduction);

    let taxLiability = 0;
    if (taxableIncome <= 23200) {
      taxLiability = taxableIncome * 0.10;
    } else if (taxableIncome <= 94300) {
      taxLiability = 2320 + (taxableIncome - 23200) * 0.12;
    } else if (taxableIncome <= 201050) {
      taxLiability = 10852 + (taxableIncome - 94300) * 0.22;
    } else {
      taxLiability = 34337 + (taxableIncome - 201050) * 0.24;
    }
    taxLiability = Math.round(taxLiability);

    const totalPaymentsAndCredits = (Number(fedWithheld) || 0) + (Number(taxCredits) || 0);
    const federalRefund = Math.max(0, totalPaymentsAndCredits - taxLiability);
    const balanceDue = Math.max(0, taxLiability - totalPaymentsAndCredits);

    const stateTaxLiability = Math.round(taxableIncome * 0.0495);
    const stateRefund = Math.max(0, (Number(stateWithheld) || 0) - stateTaxLiability);
    const stateBalanceDue = Math.max(0, stateTaxLiability - (Number(stateWithheld) || 0));

    return {
      totalGrossIncome,
      effectiveDeduction,
      taxableIncome,
      taxLiability,
      federalRefund,
      balanceDue,
      stateTaxLiability,
      stateRefund,
      stateBalanceDue,
      totalRefund: federalRefund + stateRefund,
      totalDue: balanceDue + stateBalanceDue,
    };
  }, [w2Wages, taxableInterest, capitalGains, otherIncome, deductionType, itemizedDeduction, standardDeductionAmount, fedWithheld, taxCredits, stateWithheld]);

  // Save calculation updates
  const handleSaveCalculations = async () => {
    setIsSavingCalcs(true);
    const toastId = toast.loading('Saving modified calculation values...');
    try {
      const payload = {
        w2Wages,
        taxableInterest,
        capitalGains,
        otherIncome,
        deductionType,
        itemizedDeduction,
        taxCredits,
        fedWithheld,
        stateWithheld,
        totalGrossIncome: liveCalcs.totalGrossIncome,
        taxableIncome: liveCalcs.taxableIncome,
        taxLiability: liveCalcs.taxLiability,
        federalRefund: liveCalcs.federalRefund,
        balanceDue: liveCalcs.balanceDue,
        stateRefund: liveCalcs.stateRefund,
        stateBalanceDue: liveCalcs.stateBalanceDue,
      };

      const res = await salesService.updateDraftValues(appId, payload);
      toast.success('Form 1040 calculations updated & synced! 📝✅', { id: toastId });
      setIsEditingCalcs(false);

      if (onLeadUpdated && res?.lead) {
        onLeadUpdated(res.lead);
      } else {
        const refreshed = await salesService.getLeadById(appId);
        if (refreshed && onLeadUpdated) onLeadUpdated(refreshed);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save calculation changes', { id: toastId });
    } finally {
      setIsSavingCalcs(false);
    }
  };

  // Deliverables handlers
  const handleUploadDeliverable = async (file: File, reqEsign: boolean) => {
    setIsUploadingDeliverable(true);
    const toastId = toast.loading(`Uploading deliverable "${file.name}"...`);
    try {
      const res = await salesService.uploadDeliverableDocument(appId, file, reqEsign);
      const docs = res?.deliverableDocuments || res?.taxDraftSummary?.deliverableDocuments;
      if (Array.isArray(docs)) {
        setDeliverables(docs);
      }
      toast.success(`Deliverable "${file.name}" uploaded successfully!`, { id: toastId });
      if (onLeadUpdated) {
        const refreshed = await salesService.getLeadById(appId);
        if (refreshed) onLeadUpdated(refreshed);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to upload deliverable', { id: toastId });
    } finally {
      setIsUploadingDeliverable(false);
    }
  };

  const handleDeleteDeliverable = async (docId: string) => {
    const toastId = toast.loading('Removing deliverable document...');
    try {
      const res = await salesService.deleteDeliverableDocument(appId, docId);
      const docs = res?.deliverableDocuments || res?.taxDraftSummary?.deliverableDocuments;
      if (Array.isArray(docs)) {
        setDeliverables(docs);
      } else {
        setDeliverables((prev) => prev.filter((d) => d.id !== docId));
      }
      toast.success('Deliverable removed', { id: toastId });
      if (onLeadUpdated) {
        const refreshed = await salesService.getLeadById(appId);
        if (refreshed) onLeadUpdated(refreshed);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete deliverable', { id: toastId });
    }
  };

  const handleToggleDeliverableEsign = async (docId: string, reqEsign: boolean) => {
    try {
      const res = await salesService.toggleDeliverableEsign(appId, docId, reqEsign);
      const docs = res?.deliverableDocuments || res?.taxDraftSummary?.deliverableDocuments;
      if (Array.isArray(docs)) {
        setDeliverables(docs);
      } else {
        setDeliverables((prev) =>
          prev.map((d) => (d.id === docId ? { ...d, requiresEsign: reqEsign } : d))
        );
      }
      toast.success(reqEsign ? 'E-Sign / Re-upload required for this document' : 'Marked as reference only');
      if (onLeadUpdated) {
        const refreshed = await salesService.getLeadById(appId);
        if (refreshed) onLeadUpdated(refreshed);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update signature requirement');
    }
  };

  // Dispatch Draft to Client
  const handleSendDraftToClient = async () => {
    setIsSendingToClient(true);
    const toastId = toast.loading(`Dispatching return draft v${draftVersion} to taxpayer...`);
    try {
      await salesService.sendDraftToClient(appId);
      toast.success(`Draft package sent to client! Taxpayer notified via email & portal. 🚀`, { id: toastId });
      if (onLeadUpdated) {
        const refreshed = await salesService.getLeadById(appId);
        if (refreshed) onLeadUpdated(refreshed);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to send draft to client', { id: toastId });
    } finally {
      setIsSendingToClient(false);
    }
  };

  // Reopen New Version on Demand
  const handleReopenDraftVersion = async () => {
    setIsReopeningVersion(true);
    const toastId = toast.loading('Reopening new draft version...');
    try {
      const res = await salesService.reopenDraftVersion(appId);
      toast.success(`New draft version v${res?.draftVersion || draftVersion + 1} opened for modifications! 🔄`, { id: toastId });
      if (onLeadUpdated) {
        const refreshed = await salesService.getLeadById(appId);
        if (refreshed) onLeadUpdated(refreshed);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to reopen new version', { id: toastId });
    } finally {
      setIsReopeningVersion(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden space-y-0">
      {/* 1. Header */}
      <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm truncate">
              Tax Return Drafting, Deliverables &amp; Client Dispatch
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white shadow-2xs">
              Draft v{draftVersion}
            </span>
            <ReturnComplexityBadge lead={lead} size="sm" />
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
            QA-Certified return figures, sales value modifications, client deliverables &amp; revision versioning.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {onViewOrganizer && (
            <Button
              size="sm"
              variant="outline"
              onClick={onViewOrganizer}
              className="h-7 px-2.5 text-xs font-semibold border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg shadow-2xs flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors"
              title="Inspect Taxpayer Info & Files"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
              <span>Tax Info &amp; Files</span>
            </Button>
          )}

          <Button
            size="sm"
            onClick={handleSendDraftToClient}
            disabled={isSendingToClient}
            className="h-7 px-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Send return draft package & deliverable signature requirements to client"
          >
            {isSendingToClient ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Dispatching...</span>
              </>
            ) : (
              <>
                <Send className="w-3 h-3" />
                <span>Send Draft to Client (v{draftVersion})</span>
              </>
            )}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleReopenDraftVersion}
            disabled={isReopeningVersion}
            className="h-7 px-2.5 text-xs font-semibold border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg shadow-2xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
            title="Reopen a new draft revision version (e.g. client requested adjustments on phone)"
          >
            {isReopeningVersion ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <RotateCcw className="w-3 h-3 text-amber-700" />
            )}
            <span>Reopen New Version</span>
          </Button>
        </div>
      </div>

      {/* 2. Client Review & Revision Lifecycle Banner */}
      <div className="px-4 py-3 border-b border-slate-100 bg-white">
        {clientReviewStatus === 'CLIENT_REVISION_REQUESTED' ? (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 flex items-start gap-3 shadow-2xs animate-in fade-in">
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200 mt-0.5">
              <RotateCcw className="w-3.5 h-3.5 text-rose-700" />
            </div>
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-rose-900">
                  ⚠️ Taxpayer Requested Revisions on Draft (v{draftVersion}):
                </span>
                <span className="text-[10px] font-bold text-rose-700 uppercase">
                  Action Required by Sales Closer
                </span>
              </div>
              <p className="text-xs font-medium text-slate-800 bg-white/90 p-2.5 rounded-lg border border-rose-200 shadow-2xs">
                "{clientRevisionNotes || 'Client requested modifications before signing deliverables.'}"
              </p>
              <div className="text-[11px] text-rose-800 font-medium pt-0.5">
                💡 You can modify line item calculations below, update deliverables, and click <strong>"Send Draft to Client"</strong> to dispatch the updated version. Alternatively, use <strong>"Send Back"</strong> in the top header if preparer assistance is needed.
              </div>
            </div>
          </div>
        ) : clientReviewStatus === 'CLIENT_APPROVED' ? (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-950">
                  ✓ Taxpayer Approved Return Draft &amp; Uploaded Signed Deliverables!
                </p>
                <p className="text-[11px] text-emerald-800">
                  Approved on {clientApprovedAt ? new Date(clientApprovedAt).toLocaleString() : 'Recently'}. Ready for fee payment collection &amp; IRS filing dispatch.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-emerald-200 text-emerald-900 text-xs font-bold border border-emerald-300">
              Client Certified
            </span>
          </div>
        ) : clientReviewStatus === 'SENT_TO_CLIENT' ? (
          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-950 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
                <Clock className="w-4 h-4 text-blue-700" />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-950">
                  Draft v{draftVersion} Sent to Client for Review &amp; E-Sign
                </p>
                <p className="text-[11px] text-blue-700">
                  Dispatched {clientReviewSentAt ? new Date(clientReviewSentAt).toLocaleString() : 'Recently'}. Awaiting taxpayer e-signature and approval in Client Portal.
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold border border-blue-200">
              Awaiting Client
            </span>
          </div>
        ) : (
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-between text-xs font-medium">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>Draft package v{draftVersion} prepared. Not yet dispatched to taxpayer.</span>
            </span>
            <span className="text-[11px] text-slate-500">Ready to dispatch</span>
          </div>
        )}
      </div>

      {/* 3. Preparer & QA Sign-Off Metadata Strip */}
      <div className="p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-50/80 p-3 rounded-lg border border-slate-200/80 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Preparer */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center border border-blue-200">
                {preparerName[0]}
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block -mb-0.5">Preparer</span>
                <span className="font-semibold text-slate-800" title={preparerEmail}>{preparerName}</span>
              </div>
            </div>

            <div className="h-5 w-[1px] bg-slate-200 hidden sm:block" />

            {/* Auditor */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-bold text-[10px] flex items-center justify-center border border-purple-200">
                {reviewerName[0]}
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block -mb-0.5">Senior QA Auditor</span>
                <span className="font-semibold text-slate-800">{reviewerName}</span>
              </div>
            </div>

            <div className="h-5 w-[1px] bg-slate-200 hidden sm:block" />

            {/* Tax Year & Filing Type */}
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-700">{taxYearDisplay}</span>
              <span className="text-slate-400">({filingTypeStr})</span>
            </div>
          </div>

          {/* QA Status Badge */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-medium hidden md:inline">
              Audited: <strong>{reviewDate}</strong>
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                qaStatus === 'Approved'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : qaStatus === 'Changes Required'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-blue-50 text-blue-800 border-blue-200'
              }`}
            >
              {qaStatus === 'Approved' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              )}
              <span>{qaStatus === 'Approved' ? 'QA Certified' : qaStatus}</span>
            </span>
          </div>
        </div>

        {/* 4. Form 1040 / 1120 Calculation Amounts Engine */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
          <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Form 1040 Return Calculation Line Items
              </h4>
            </div>

            <div className="flex items-center gap-2">
              {!isEditingCalcs ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingCalcs(true)}
                  className="h-7 px-2.5 text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Modify Values</span>
                </Button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingCalcs(false)}
                    disabled={isSavingCalcs}
                    className="h-7 px-2 text-xs font-semibold border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                    <span>Cancel</span>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSaveCalculations}
                    disabled={isSavingCalcs}
                    className="h-7 px-3 text-xs font-bold bg-[#16A34A] hover:bg-[#15803D] text-white rounded-lg flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    {isSavingCalcs ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Save className="w-3 h-3" />
                    )}
                    <span>Save Changes</span>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Calculations View Mode */}
          {!isEditingCalcs ? (
            <div className="p-4 space-y-4">
              {/* Row 1: Key Refund/Due Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Federal Refund</span>
                  <span className="text-base font-black text-emerald-700 mt-0.5 block">
                    ${liveCalcs.federalRefund.toLocaleString()}
                  </span>
                  {liveCalcs.balanceDue > 0 && (
                    <span className="text-[10px] font-bold text-amber-800">
                      Balance Due: ${liveCalcs.balanceDue.toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">State Refund</span>
                  <span className="text-base font-black text-blue-700 mt-0.5 block">
                    ${liveCalcs.stateRefund.toLocaleString()}
                  </span>
                  {liveCalcs.stateBalanceDue > 0 && (
                    <span className="text-[10px] font-bold text-amber-800">
                      Balance Due: ${liveCalcs.stateBalanceDue.toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Total Gross Income</span>
                  <span className="text-base font-black text-slate-800 mt-0.5 block">
                    ${liveCalcs.totalGrossIncome.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Taxable Income</span>
                  <span className="text-base font-black text-slate-800 mt-0.5 block">
                    ${liveCalcs.taxableIncome.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Row 2: Detailed Line Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/40">
                  <span className="text-[10px] text-slate-400 block">W-2 Wages</span>
                  <span className="font-bold text-slate-800">${Number(w2Wages || 0).toLocaleString()}</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/40">
                  <span className="text-[10px] text-slate-400 block">Taxable Interest</span>
                  <span className="font-bold text-slate-800">${Number(taxableInterest || 0).toLocaleString()}</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/40">
                  <span className="text-[10px] text-slate-400 block">Capital Gains / (Loss)</span>
                  <span className="font-bold text-slate-800">${Number(capitalGains || 0).toLocaleString()}</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/40">
                  <span className="text-[10px] text-slate-400 block">Other Income</span>
                  <span className="font-bold text-slate-800">${Number(otherIncome || 0).toLocaleString()}</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/40">
                  <span className="text-[10px] text-slate-400 block">Deduction ({deductionType})</span>
                  <span className="font-bold text-slate-800">${liveCalcs.effectiveDeduction.toLocaleString()}</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/40">
                  <span className="text-[10px] text-slate-400 block">Federal Withheld</span>
                  <span className="font-bold text-slate-800">${Number(fedWithheld || 0).toLocaleString()}</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/40">
                  <span className="text-[10px] text-slate-400 block">Tax Credits</span>
                  <span className="font-bold text-slate-800">${Number(taxCredits || 0).toLocaleString()}</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/40">
                  <span className="text-[10px] text-slate-400 block">State Withheld</span>
                  <span className="font-bold text-slate-800">${Number(stateWithheld || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ) : (
            /* Calculations Edit Mode */
            <div className="p-4 space-y-4 bg-amber-50/30 border-b border-amber-200">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>Editing Mode: Modify Form 1040 amounts directly. Calculations update live.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">W-2 Wages ($)</label>
                  <input
                    type="number"
                    value={w2Wages}
                    onChange={(e) => setW2Wages(Number(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold bg-white text-slate-900 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Taxable Interest ($)</label>
                  <input
                    type="number"
                    value={taxableInterest}
                    onChange={(e) => setTaxableInterest(Number(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold bg-white text-slate-900 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Capital Gains / Loss ($)</label>
                  <input
                    type="number"
                    value={capitalGains}
                    onChange={(e) => setCapitalGains(Number(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold bg-white text-slate-900 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Other Income ($)</label>
                  <input
                    type="number"
                    value={otherIncome}
                    onChange={(e) => setOtherIncome(Number(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold bg-white text-slate-900 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Federal Withheld ($)</label>
                  <input
                    type="number"
                    value={fedWithheld}
                    onChange={(e) => setFedWithheld(Number(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold bg-white text-slate-900 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Tax Credits ($)</label>
                  <input
                    type="number"
                    value={taxCredits}
                    onChange={(e) => setTaxCredits(Number(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold bg-white text-slate-900 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">State Withheld ($)</label>
                  <input
                    type="number"
                    value={stateWithheld}
                    onChange={(e) => setStateWithheld(Number(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold bg-white text-slate-900 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Deduction Method</label>
                  <select
                    value={deductionType}
                    onChange={(e) => setDeductionType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold bg-white text-slate-900 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="STANDARD">Standard (${standardDeductionAmount.toLocaleString()})</option>
                    <option value="ITEMIZED">Itemized</option>
                  </select>
                </div>

                {deductionType === 'ITEMIZED' && (
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Itemized Amount ($)</label>
                    <input
                      type="number"
                      value={itemizedDeduction}
                      onChange={(e) => setItemizedDeduction(Number(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold bg-white text-slate-900 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>

              {/* Live Preview Strip */}
              <div className="p-3 bg-white rounded-lg border border-amber-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-slate-600 font-medium">
                  Live Preview: Federal Refund: <strong className="text-emerald-700">${liveCalcs.federalRefund.toLocaleString()}</strong> · State Refund: <strong className="text-blue-700">${liveCalcs.stateRefund.toLocaleString()}</strong> · Combined: <strong className="text-emerald-800">${liveCalcs.totalRefund.toLocaleString()}</strong>
                </span>

                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveCalculations}
                  disabled={isSavingCalcs}
                  className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold px-4 h-8 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  {isSavingCalcs ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Calculation Changes</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* 5. Scalable Deliverables & E-Sign Documents Management */}
        <DeliverablesUploadCard
          documents={deliverables}
          isUploading={isUploadingDeliverable}
          isReadOnly={false}
          onUpload={handleUploadDeliverable}
          onDelete={handleDeleteDeliverable}
          onToggleEsign={handleToggleDeliverableEsign}
          title="Client Deliverables &amp; E-Sign Required Documents"
          subtitle="Form 8879 and state declarations attached for the client. Toggle whether client must re-upload/e-sign."
        />
      </div>
    </div>
  );
};
