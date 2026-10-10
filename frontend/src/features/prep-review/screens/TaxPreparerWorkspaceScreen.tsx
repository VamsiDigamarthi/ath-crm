import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { preparerOriginPath } from '../utils/preparer-origin';
import { ArrowLeft, Save, Send, ShieldCheck, RotateCcw, FileSpreadsheet, Sparkles, Bell, Paperclip, Download, FileText } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { PriorityBadge } from '@/shared/components/PriorityBadge';
import { ClientPaymentStatusChip } from '@/shared/components/ClientPaymentStatusChip';
import { AppModal } from '@/shared/components/AppModal';
import { SendBackLeadModal } from '@/shared/components/workflow/SendBackLeadModal';
import { SendEmailModal } from '@/shared/components/SendEmailModal';
import { useTaxPreparerWorkspace } from '../hooks/useTaxPreparerWorkspace';
import { DocumentPreviewModal } from '../components/workspace/DocumentPreviewModal';
import { TaxPrepOrganizerReview } from '@/features/documenter/components/prep/TaxPrepOrganizerReview';
import { RequestMissingDocumentsModal } from '@/features/documenter/components/prep/RequestMissingDocumentsModal';
import apiClient from '@/lib/api-client';
import toast from 'react-hot-toast';
import { AppTextarea } from '@/shared/components/AppTextarea';
import { AppCopyButton } from '@/shared/components/AppCopyButton';
import { ReturnItemsPanel } from '../components/workspace/ReturnItemsPanel';
import { ReturnItemsSummary } from '../components/workspace/ReturnItemsSummary';
import { StaffTaxApplicationStageStepper } from '@/shared/components/workflow/StaffTaxApplicationStageStepper';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { TaxApplicationNotesAndAuditTab } from '@/shared/components/workflow/TaxApplicationNotesAndAuditTab';

export const TaxPreparerWorkspaceScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSendBackOpen, setIsSendBackOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isOrganizerModalOpen, setIsOrganizerModalOpen] = useState(false);
  const [isRequestDocsModalOpen, setIsRequestDocsModalOpen] = useState(false);
  const { user: currentUser } = useAuthStore();
  const {
    isLoading,
    isSaving,
    isSubmitting,
    isConfirmOpen,
    setIsConfirmOpen,
    applicationId,
    taxYear,
    currentStage,
    priority,
    taxpayer,
    assignedReviewer,
    assignedDocAgent,
    assignedPrepAgent,
    assignedSalesAgent,
    assignedFileOp,
    selectedDocForPreview,
    setSelectedDocForPreview,
    availableApplications,
    taxDraftSummary,
    preparerNotes,
    setPreparerNotes,
    calculations,
    isSubmittedToQA,
    isRevisionRequested,
    isRevertedToDocs,
    isRevertedToSales,
    lastRevertInfo,
    documenterNotes,
    documenterNotesBy,
    documenterNotesAt,
    revisionCategory,
    revisionInstructions,
    stageHistories,
    callLogs,
    auditLogs,
    filingType,
    handleSaveDraft,
    handleSubmitForQA,
  } = useTaxPreparerWorkspace();

  /* Used by the previous split workspace layout
  const handleApplyFieldValue = (field: string, value: number) => {
    if (field === 'w2Wages') setW2Wages(value);
    else if (field === 'taxableInterest') setTaxableInterest(value);
    else if (field === 'capitalGains') setCapitalGains(value);
    else if (field === 'otherIncome') setOtherIncome(value);
    else if (field === 'fedWithheld') setFedWithheld(value);
    else if (field === 'stateWithheld') setStateWithheld(value);
    else if (field === 'itemizedDeduction') {
      setItemizedDeduction(value);
      setDeductionType('ITEMIZED');
    }
    toast.success(`Applied $${value.toLocaleString()} directly to Form 1040! 📝✓`);
  };
  */

  const handleOpenRevertDoc = async (doc: { id?: string; fileName: string; filePath?: string; fileUrl?: string }) => {
    if (doc.fileUrl && (doc.fileUrl.startsWith('http://') || doc.fileUrl.startsWith('https://'))) {
      window.open(doc.fileUrl, '_blank');
      return;
    }
    if (!doc.id) {
      toast.error('Document ID not available');
      return;
    }
    try {
      toast.loading(`Opening ${doc.fileName}...`, { id: 'revert-open' });
      const response: any = await apiClient.get(`/prep-review/documents/${doc.id}/download`, {
        responseType: 'blob',
      });
      const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(doc.fileName);
      const isPdf = /\.pdf$/i.test(doc.fileName);
      const mimeType = isImage ? 'image/jpeg' : isPdf ? 'application/pdf' : 'application/octet-stream';
      const blob = new Blob([response], { type: mimeType });
      const fileUrl = URL.createObjectURL(blob);
      window.open(fileUrl, '_blank');
      toast.success('Document opened in new tab', { id: 'revert-open' });
    } catch {
      toast.error('Failed to open attached document', { id: 'revert-open' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#16A34A] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Loading Form 1040 drafting workspace...</p>
        </div>
      </div>
    );
  }

  const taxpayerName = taxpayer?.name || 'Taxpayer Client';
  const taxpayerSSN = taxpayer?.ssnMasked || '***-**-****';
  const taxpayerFilingStatus = taxpayer?.maritalStatus || 'Single';
  const taxpayerLocation = taxpayer?.state ? `${taxpayer?.city ? `${taxpayer.city}, ` : ''}${taxpayer.state}` : 'USA';
  const reviewerName = assignedReviewer?.name || 'Senior QA Reviewer';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate(preparerOriginPath(location.search));
              }
            }}
            className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <span>Preparer Queue</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-medium">Taxpayer Profile</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {/* Email client button (hidden)
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEmailModalOpen(true)}
            className="text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            title="Compose and send official email to client"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email client</span>
          </Button>
          */}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRequestDocsModalOpen(true)}
            className="text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            title="Request missing documents from client & notify assigned document agent"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Request docs</span>
          </Button>

          {(() => {
            const isFilingOrCompleted =
              currentStage.startsWith('FILING') || currentStage === 'QA_APPROVED' || currentStage === 'PAID_AND_AUTHORIZED';
            const isSendBackDisabled = isSaving || isSubmitting || isSubmittedToQA || isRevertedToDocs || isRevertedToSales || isFilingOrCompleted;

            const sendBackLabel = isRevertedToDocs
              ? 'Sent to Documenter'
              : isRevertedToSales
              ? 'With Sales'
              : isFilingOrCompleted
              ? 'In IRS Filing'
              : isSubmittedToQA
              ? 'In QA Review'
              : 'Send back';

            const sendBackTitle = isRevertedToDocs
              ? 'Return is currently with Documenter department awaiting intake documents'
              : isRevertedToSales
              ? 'Return is currently with Sales department awaiting pricing or client consultation'
              : isFilingOrCompleted
              ? 'Return has already been certified and dispatched to IRS Filing Operations'
              : isSubmittedToQA
              ? 'Return is currently undergoing Senior QA Review'
              : 'Send return back to Documenter for missing documents or customer clarification';

            return (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSendBackOpen(true)}
                disabled={isSendBackDisabled}
                className={`text-xs font-medium flex items-center gap-1.5 ${
                  isSendBackDisabled ? 'text-slate-400 cursor-not-allowed' : 'cursor-pointer'
                }`}
                title={sendBackTitle}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{sendBackLabel}</span>
              </Button>
            );
          })()}

          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            disabled={isSaving || isSubmittedToQA || isRevertedToDocs || isRevertedToSales || currentStage.startsWith('FILING') || currentStage === 'QA_APPROVED'}
            className={`text-xs font-semibold ${
              isRevertedToDocs || isRevertedToSales || isSubmittedToQA || currentStage.startsWith('FILING') || currentStage === 'QA_APPROVED'
                ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-75'
                : 'cursor-pointer'
            }`}
            title={
              isRevertedToDocs
                ? 'Drafting is locked while return is in Documenter outreach'
                : isRevertedToSales
                ? 'Drafting is locked while return is with Sales closer'
                : currentStage.startsWith('FILING')
                ? 'Drafting is locked while return is in IRS Filing'
                : 'Save Draft Form 1040'
            }
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </Button>

          {isSubmittedToQA ? (
            <Button size="sm" disabled className="bg-slate-100 text-slate-500 border border-slate-200 text-xs font-semibold cursor-not-allowed">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Submitted for QA</span>
            </Button>
          ) : isRevertedToDocs ? (
            <Button
              size="sm"
              disabled
              className="bg-slate-100 text-slate-400 border border-slate-200 text-xs font-semibold cursor-not-allowed flex items-center gap-1.5 opacity-75"
              title="Cannot submit for QA while awaiting missing documents from Documenter intake"
            >
              <Send className="w-3.5 h-3.5 opacity-40" />
              <span>Submit for QA (Awaiting Docs)</span>
            </Button>
          ) : isRevertedToSales ? (
            <Button
              size="sm"
              disabled
              className="bg-slate-100 text-slate-400 border border-slate-200 text-xs font-semibold cursor-not-allowed flex items-center gap-1.5 opacity-75"
              title="Cannot submit for QA while return is with Sales closer"
            >
              <Send className="w-3.5 h-3.5 opacity-40" />
              <span>With Sales Closer</span>
            </Button>
          ) : currentStage.startsWith('FILING') ? (
            <Button
              size="sm"
              disabled
              className="bg-slate-100 text-slate-400 border border-slate-200 text-xs font-semibold cursor-not-allowed flex items-center gap-1.5 opacity-75"
              title="Return is already authorized and in IRS Filing Operations"
            >
              <Send className="w-3.5 h-3.5 opacity-40" />
              <span>In IRS Filing Operations</span>
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => setIsConfirmOpen(true)}
              disabled={isSubmitting}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit for QA</span>
            </Button>
          )}
        </div>
      </div>

      {/* 1.1 Staff 5-Department Workflow Stage Stepper */}
      <StaffTaxApplicationStageStepper
        currentStage={currentStage}
        taxDraftSummary={taxDraftSummary}
        assignedDocAgent={assignedDocAgent}
        assignedPrepAgent={assignedPrepAgent}
        assignedReviewAgent={assignedReviewer}
        assignedSalesAgent={assignedSalesAgent}
        assignedFileOp={assignedFileOp}
      />

      {/* 1.2 Profile Card */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-5 flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{taxpayerName}</h2>
              <ClientPaymentStatusChip lead={{ ...taxDraftSummary, currentStage, taxDraftSummary, taxYear }} scope="return" size="sm" />
              <PriorityBadge priority={priority || 'NO_PRIORITY'} size="sm" />
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  isSubmittedToQA || isRevertedToSales || isRevertedToDocs
                    ? 'bg-slate-100 text-slate-700'
                    : isRevisionRequested
                    ? 'bg-rose-50 text-rose-700'
                    : 'bg-emerald-50 text-[#15803D]'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isSubmittedToQA || isRevertedToSales || isRevertedToDocs
                      ? 'bg-slate-400'
                      : isRevisionRequested
                      ? 'bg-rose-500'
                      : 'bg-[#16A34A]'
                  }`}
                />
                {isSubmittedToQA
                  ? 'In QA review'
                  : isRevertedToSales
                  ? 'With sales closer'
                  : isRevertedToDocs
                  ? 'Reverted to documenter'
                  : isRevisionRequested
                  ? 'Revision requested'
                  : 'Drafting'}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1.5">
              {[filingType === 'BUSINESS' ? 'Form 1120 / Business Return' : 'Form 1040', filingType !== 'BUSINESS' && taxpayerFilingStatus, filingType !== 'BUSINESS' && taxpayer?.visaType].filter(Boolean).join(' · ')}
            </p>
          </div>

          <div className="text-sm lg:text-right shrink-0">
            <div className="text-xs text-slate-500">QA reviewer</div>
            <div className="font-medium text-slate-900 mt-0.5">
              {assignedReviewer?.name || 'Unassigned'}
              {assignedReviewer?.id && assignedReviewer.id === currentUser?.id && <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-[#15803D]">Self-review</span>}
            </div>
          </div>
        </div>

        {availableApplications && availableApplications.length > 0 && (
          <div className="px-5 pb-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 mr-1">Tax year</span>
            {availableApplications.map((appItem: any) => {
              const isSelected = appItem.id === applicationId;
              return (
                <button
                  key={appItem.id}
                  type="button"
                  onClick={() => {
                    if (appItem.id !== applicationId) navigate(`/prep-review/preparer/workspace/${appItem.id}${location.search}`);
                  }}
                  className={`px-3 py-1 rounded-full text-xs border transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-[#16A34A] bg-emerald-50 text-[#15803D] font-semibold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  TY {appItem.taxYear}
                  <span className="text-slate-400 font-normal"> · {(appItem.filingType || 'INDIVIDUAL').toLowerCase()}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-slate-100 divide-y sm:divide-y-0 lg:divide-x divide-slate-100">
          {[
            { label: 'Phone', value: taxpayer?.phone || '—', copy: taxpayer?.phone },
            { label: 'Email', value: taxpayer?.email || '—', copy: taxpayer?.email },
            { label: 'Location', value: taxpayerLocation, copy: null },
            { label: 'SSN / ITIN', value: taxpayerSSN, copy: null },
          ].map((item) => (
            <div key={item.label} className="px-5 py-3 flex items-center justify-between gap-2 min-w-0">
              <div className="min-w-0">
                <div className="text-xs text-slate-500">{item.label}</div>
                <div className="text-sm font-medium text-slate-900 truncate" title={item.value}>
                  {item.value}
                </div>
              </div>
              {item.copy && <AppCopyButton text={item.copy} size="sm" />}
            </div>
          ))}
        </div>
      </div>

      {/* 1.3 Documenter Intake Handover Notes */}
      {documenterNotes && !isRevertedToDocs && (
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-semibold text-slate-900">
              Handover notes from documenter
              {documenterNotesBy && <span className="font-normal text-slate-500"> · {documenterNotesBy}</span>}
            </div>
            {documenterNotesAt && (
              <span className="text-xs text-slate-400">
                {new Date(documenterNotesAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-700 mt-1.5 leading-relaxed">{documenterNotes}</p>
        </div>
      )}

      {/* 1.5 Revision Request Alert Banner (from Sales, Filing, or Senior QA - strictly for PREPARATION target) */}
      {isRevisionRequested && (!lastRevertInfo || lastRevertInfo?.targetDepartment === 'PREPARATION') && (
        lastRevertInfo?.sourceDepartment === 'SALES' ? (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3.5 text-amber-950 shadow-2xs animate-in fade-in duration-200">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200 mt-0.5">
              <RotateCcw className="w-4 h-4 text-amber-700" />
            </div>
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-amber-950">
                  <span>Client Revision Requested by Sales Closer:</span>
                  {(revisionCategory || lastRevertInfo.reasonCategory) && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-950 text-[10px] font-bold">
                      {(revisionCategory || lastRevertInfo.reasonCategory).replace(/_/g, ' ')}
                    </span>
                  )}
                  {lastRevertInfo.revertedByName && (
                    <span className="text-xs text-amber-800 font-semibold">
                      by {lastRevertInfo.revertedByName} (Sales Closer)
                    </span>
                  )}
                </div>
                {lastRevertInfo.revertedAt && (
                  <span className="text-[11px] text-amber-700 font-medium">
                    {new Date(lastRevertInfo.revertedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-slate-800 leading-relaxed bg-white/95 p-3 rounded-lg border border-amber-200 shadow-2xs">
                "{revisionInstructions || lastRevertInfo.revertNotes || 'Client requested tax calculation / deduction adjustment.'}"
              </p>

              {/* Attached Client Documents from Sales Closer */}
              {(() => {
                const attachedDocs =
                  lastRevertInfo.attachedDocuments ||
                  (taxDraftSummary as any)?.revertsByTarget?.['SALES_TO_PREPARATION']?.attachedDocuments ||
                  (taxDraftSummary as any)?.revertsByTarget?.PREPARATION?.attachedDocuments ||
                  (taxDraftSummary as any)?.lastRevert?.attachedDocuments ||
                  [];

                if (Array.isArray(attachedDocs) && attachedDocs.length > 0) {
                  return (
                    <div className="p-3 bg-amber-100/60 rounded-xl border border-amber-200/90 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-amber-950">
                        <span className="flex items-center gap-1.5">
                          <Paperclip className="w-3.5 h-3.5 text-amber-700" />
                          <span>Attached Documents from Sales Closer ({attachedDocs.length}):</span>
                        </span>
                        <span className="text-[10px] font-semibold text-amber-800">
                          Uploaded for P-Team Review
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {attachedDocs.map((doc: any, idx: number) => (
                          <div
                            key={doc.id || idx}
                            className="p-2.5 rounded-lg bg-white border border-amber-200 shadow-2xs flex items-center justify-between gap-2 text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 truncate text-[11px]" title={doc.fileName}>
                                  {doc.fileName}
                                </p>
                                <span className="text-[9px] text-slate-400">
                                  {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB • ` : ''}Sales Attachment
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleOpenRevertDoc(doc)}
                              className="px-2.5 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors shrink-0 shadow-2xs"
                              title="View / Download Attached Document"
                            >
                              <Download className="w-3 h-3" />
                              <span>View</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="pt-1 text-[11px] text-amber-800 font-medium border-t border-amber-200/60 flex items-center gap-1.5">
                <span>💡 Please review taxpayer feedback and attached documents from Sales, adjust Form 1040 line items/deductions below, and click <strong>Submit for QA</strong> to resubmit for certification.</span>
              </div>
            </div>
          </div>
        ) : lastRevertInfo?.sourceDepartment === 'FILING' ? (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3.5 text-amber-950 shadow-2xs animate-in fade-in duration-200">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200 mt-0.5">
              <RotateCcw className="w-4 h-4 text-amber-700" />
            </div>
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-amber-950">
                  <span>Correction Requested by IRS Filing Specialist:</span>
                  {(revisionCategory || lastRevertInfo.reasonCategory) && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-950 text-[10px] font-bold">
                      {(revisionCategory || lastRevertInfo.reasonCategory).replace(/_/g, ' ')}
                    </span>
                  )}
                  {lastRevertInfo.revertedByName && (
                    <span className="text-xs text-amber-800 font-semibold">
                      by {lastRevertInfo.revertedByName} (Filing Specialist)
                    </span>
                  )}
                </div>
                {lastRevertInfo.revertedAt && (
                  <span className="text-[11px] text-amber-700 font-medium">
                    {new Date(lastRevertInfo.revertedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-slate-800 leading-relaxed bg-white/95 p-3 rounded-lg border border-amber-200 shadow-2xs">
                "{revisionInstructions || lastRevertInfo.revertNotes || 'IRS MeF XML / Calculation correction required.'}"
              </p>
              <div className="pt-1 text-[11px] text-amber-800 font-medium border-t border-amber-200/60 flex items-center gap-1.5">
                <span>💡 Please review feedback from Filing Operations, correct Form 1040 line items/deductions below, and click <strong>Submit for QA</strong> to resubmit for review.</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3.5 text-rose-950 shadow-2xs animate-in fade-in duration-200">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200 mt-0.5">
              <RotateCcw className="w-4 h-4 text-rose-700" />
            </div>
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-rose-950">
                  <span>Senior QA Auditor Requested Revision:</span>
                  {(revisionCategory || lastRevertInfo?.reasonCategory) && (
                    <span className="px-2 py-0.5 rounded-md bg-rose-200/80 text-rose-900 text-[10px] font-bold">
                      {(revisionCategory || lastRevertInfo?.reasonCategory).replace(/_/g, ' ')}
                    </span>
                  )}
                  {lastRevertInfo?.revertedByName && (
                    <span className="text-xs text-rose-800 font-semibold">
                      by {lastRevertInfo.revertedByName}
                    </span>
                  )}
                </div>
                {lastRevertInfo?.revertedAt && (
                  <span className="text-[11px] text-rose-700 font-medium">
                    {new Date(lastRevertInfo.revertedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-slate-800 leading-relaxed bg-white/95 p-3 rounded-lg border border-rose-200 shadow-2xs">
                "{revisionInstructions || lastRevertInfo?.revertNotes || 'Please review Form 1040 calculations against source documents and resubmit for 4-Eyes audit.'}"
              </p>
            </div>
          </div>
        )
      )}

      {/* 2. Tax Info (view only) + Review & Notes */}
      <TaxPrepOrganizerReview
        leadId={applicationId}
        customerName={taxpayerName}
        taxDraftSummary={taxDraftSummary}
        taxYear={taxYear}
        filingType={filingType}
        allowEdit={false}
        readOnly
        hideHeader
        extraTabs={[
          {
            id: 'SERVICES',
            label: 'Services & Pricing',
            content: (
              <div className="space-y-4">
                <ReturnItemsPanel
                  applicationId={applicationId}
                  readOnly={
                    isSubmittedToQA ||
                    isRevertedToDocs ||
                    isRevertedToSales ||
                    currentStage.startsWith('FILING') ||
                    currentStage === 'QA_APPROVED'
                  }
                />
              {(() => {
                  const draft = (taxDraftSummary as any) || {};
                  const qaNote = draft.status === 'REVISION_REQUESTED' ? draft.revisionNotes : draft.qaRemarks || draft.revisionNotes;
                  if (!qaNote) return null;
                  const isRevision = draft.status === 'REVISION_REQUESTED';
                  return (
                    <div className={`p-4 rounded-xl border ${isRevision ? 'border-rose-200 bg-rose-50/50' : 'border-slate-200 bg-white'}`}>
                      <div className="text-sm font-semibold text-slate-900">
                        Notes from QA reviewer
                        <span className={`ml-2 text-xs font-medium ${isRevision ? 'text-rose-700' : 'text-[#15803D]'}`}>
                          {isRevision ? `Revision requested${draft.discrepancyCategory ? ` · ${String(draft.discrepancyCategory).replace(/_/g, ' ').toLowerCase()}` : ''}` : draft.status === 'QA_APPROVED' ? 'Signed off' : ''}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 mt-1.5 whitespace-pre-wrap">{qaNote}</p>
                    </div>
                  );
                })()}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                <div className="bg-white px-4 py-3 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500">QA reviewer</div>
                  <div className="text-sm font-semibold text-slate-900 mt-0.5">{assignedReviewer?.name || 'Unassigned'}</div>
                  <div className="text-xs text-slate-500">{assignedReviewer?.email || '—'}</div>
                </div>
                <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Preparer notes for QA</div>
                    <div className="text-xs text-slate-500">Saved with Save Draft and shared with the QA reviewer.</div>
                  </div>
                  <AppTextarea
                    value={preparerNotes}
                    onChange={setPreparerNotes}
                    rows={6}
                    maxLength={5000}
                    showCount
                    disabled={isSubmittedToQA || isRevertedToDocs}
                    placeholder="e.g. Verified W-2 box 1 vs box 16, checked dual-state apportionment..."
                  />
                </div>
              </div>
              </div>
            ),
          },
          {
            id: 'NOTES',
            label: 'Notes & Audit',
            content: (
              <TaxApplicationNotesAndAuditTab
                applicationId={applicationId}
                taxpayerName={taxpayerName}
                taxpayerEmail={taxpayer?.email}
                currentStage={currentStage}
                taxYear={taxYear}
                stageHistories={stageHistories}
                callLogs={callLogs}
                auditLogs={auditLogs}
              />
            ),
          },
        ]}
      />

      <DocumentPreviewModal
        document={selectedDocForPreview}
        onClose={() => setSelectedDocForPreview(null)}
      />

      {/* 4. Rich Submit for QA Confirmation Modal */}
      <AppModal
        isOpen={isConfirmOpen}
        onClose={() => !isSubmitting && setIsConfirmOpen(false)}
        title="Submit Form 1040 for QA Review"
        description={`Transfer return for ${taxpayerName} (TY ${taxYear}) to QA Auditor (${reviewerName}).`}
        width="560px"
      >
        <div className="space-y-4 font-sans py-1">
          {/* Header Summary Card */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between text-xs">
            <div>
              <div className="font-semibold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#16A34A]" />
                <span>{taxpayerName}</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 text-[10px] font-semibold">TY {taxYear} Form 1040</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {taxpayerFilingStatus} • {taxpayerLocation}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Designated QA Auditor</span>
              <span className="text-xs font-semibold text-slate-900">{reviewerName}</span>
            </div>
          </div>

          {/* Services & pricing summary */}
          <ReturnItemsSummary applicationId={applicationId} />

          {/* Preparer Handover Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Hand-off note for the QA reviewer <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={preparerNotes}
              onChange={(e) => setPreparerNotes(e.target.value)}
              placeholder="e.g., Verified Box 1 W-2 against payroll stub, applied standard deduction for Married Filing Jointly..."
              rows={3}
              className="w-full text-sm p-2.5 rounded-md border border-slate-300 focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A] outline-none transition-colors resize-none text-slate-800 placeholder:text-slate-400 bg-white"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsConfirmOpen(false)}
              disabled={isSubmitting}
              className="border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmitForQA}
              disabled={isSubmitting || !preparerNotes.trim()}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold px-4 cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting...' : 'Confirm & Submit to QA Review'}</span>
            </Button>
          </div>
        </div>
      </AppModal>

      {/* 5. Reusable Send Back to Documenter Workflow Modal */}
      <SendBackLeadModal
        isOpen={isSendBackOpen}
        onClose={() => setIsSendBackOpen(false)}
        applicationId={applicationId || ''}
        taxpayerName={taxpayerName}
        taxYear={taxYear}
        currentDepartment="PREPARATION"
        availableTargetDepartments={[
          {
            key: 'DOCUMENTER',
            label: 'Documenter Department (Intake & Verification)',
            badge: 'DOC_OUTREACH',
            description: 'Revert to Documenter agent to collect missing documents or follow up directly with taxpayer.',
          },
        ]}
        defaultTargetDepartment="DOCUMENTER"
        onRevertSuccess={() => {
          navigate('/prep-review/preparer');
        }}
      />

      {/* 6. Send Email to Taxpayer Modal */}
      <SendEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        applicationId={applicationId || ''}
        recipientEmail={taxpayer?.email || undefined}
        recipientName={taxpayerName}
        taxYear={taxYear}
        visaType={taxpayer?.visaType || undefined}
        filingStatus={currentStage}
        fedRefund={calculations.federalRefund}
        stateRefund={calculations.stateRefund}
        totalRefund={calculations.combinedRefund}
      />

      {/* 7. Full 9-Module Intake Audit Dossier Modal */}
      <AppModal
        isOpen={isOrganizerModalOpen}
        onClose={() => setIsOrganizerModalOpen(false)}
        width="1100px"
        title={
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-slate-900 text-sm">
              Complete Tax Info and Files Audit Dossier — {taxpayerName}
            </span>
          </div>
        }
      >
        <div className="py-2">
          <TaxPrepOrganizerReview
            leadId={applicationId}
            customerName={taxpayerName}
            taxDraftSummary={taxDraftSummary}
            taxYear={taxYear}
            filingType={filingType}
            allowEdit={false}
            readOnly={true}
          />
        </div>
      </AppModal>

      {/* 8. Request Missing Documents Modal (Sends in-app notification and email to Client & Document Agent) */}
      <RequestMissingDocumentsModal
        isOpen={isRequestDocsModalOpen}
        onClose={() => setIsRequestDocsModalOpen(false)}
        applicationId={applicationId || ''}
        customerName={taxpayerName}
        customerEmail={taxpayer?.email}
      />
    </div>
  );
};
