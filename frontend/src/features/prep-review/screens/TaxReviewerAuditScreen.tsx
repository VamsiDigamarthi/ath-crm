import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Sparkles, ArrowLeft, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { AppModal } from '@/shared/components/AppModal';
import { useTaxReviewerAudit } from '../hooks/useTaxReviewerAudit';
// import { ReviewerAuditHeader } from '../components/reviewer/audit/ReviewerAuditHeader';
// import { ClientProfilePanel } from '../components/workspace/ClientProfilePanel';
import { ReviewerDrakeTaxCard } from '../components/reviewer/audit/ReviewerDrakeTaxCard';
// import { ReviewerAuditCalculationsPanel } from '../components/reviewer/audit/ReviewerAuditCalculationsPanel';
import { ReviewerComplianceChecklist } from '../components/reviewer/audit/ReviewerComplianceChecklist';
import { DocumentPreviewModal } from '../components/workspace/DocumentPreviewModal';
import { ReviewerSignOffModals } from '../components/reviewer/audit/ReviewerSignOffModals';
import { LeadAuditTrailSection } from '@/features/documenter/components/LeadAuditTrailSection';
import { TaxPrepOrganizerReview } from '@/features/documenter/components/prep/TaxPrepOrganizerReview';
import { Button } from '@/shared/components/Button';
import { AppTextarea } from '@/shared/components/AppTextarea';
import { AppCopyButton } from '@/shared/components/AppCopyButton';
import { ClientPaymentStatusChip } from '@/shared/components/ClientPaymentStatusChip';
import { PriorityBadge } from '@/shared/components/PriorityBadge';
import { ReturnItemsPanel } from '../components/workspace/ReturnItemsPanel';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { ApplicationNotesPanel } from '@/features/application-notes/components/ApplicationNotesPanel';

export const TaxReviewerAuditScreen: React.FC = () => {
  const navigate = useNavigate();
  const [isOrganizerModalOpen, setIsOrganizerModalOpen] = useState(false);
  const [isAuditCollapsed, setIsAuditCollapsed] = useState(true);
  const { user: currentUser } = useAuthStore();
  const {
    isLoading,
    isSubmitting,
    applicationId,
    taxYear,
    currentStage,
    priority,
    taxpayer,
    assignedPreparer,
    // assignedReviewer,
    documents,
    selectedDocForPreview,
    setSelectedDocForPreview,
    drakeTaxFile,
    prepNotes,
    taxDraftSummary,
    availableApplications,
    filingType,
    checks,
    toggleCheck,
    handleSelectAllChecks,
    allChecksPassed,
    auditorRemarks,
    setAuditorRemarks,
    isApproveModalOpen,
    setIsApproveModalOpen,
    isRevisionModalOpen,
    setIsRevisionModalOpen,
    revisionReason,
    setRevisionReason,
    revisionNotes,
    setRevisionNotes,
    stageHistories,
    callLogs,
    auditLogs,
    handleConfirmApprove,
    handleConfirmRevision,
  } = useTaxReviewerAudit();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Loading Form 1040 4-Eyes Compliance audit deck...</p>
        </div>
      </div>
    );
  }

  const taxpayerName = taxpayer?.name || 'Taxpayer Client';
  const draftStatus = (taxDraftSummary as any)?.status;
  const isQAReviewActive = currentStage === 'QA_IN_REVIEW' || draftStatus === 'SUBMITTED_FOR_QA';
  const isAlreadyApproved = currentStage === 'QA_APPROVED' || draftStatus === 'QA_APPROVED' || currentStage === 'SALES_PITCH_QUEUE';
  const isRevisionRequested =
    currentStage === 'QA_REVISION_REQUESTED' || currentStage === 'CORRECTION_NEEDED' || draftStatus === 'REVISION_REQUESTED';
  const isApproveDisabled = !isQAReviewActive || !allChecksPassed || isAlreadyApproved;

  /* Used by the previous audit layout
  const standardDeductionAmount = (() => {
    const status = (taxpayer?.maritalStatus || taxDraftSummary?.filingStatus || 'SINGLE').toUpperCase();
    if (status.includes('MARRIED') || status.includes('JOINT')) return 29200;
    if (status.includes('HEAD')) return 21900;
    return 14600;
  })();
  */

  return (
    <div className="w-full space-y-6 pb-16 font-sans animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/prep-review/reviewer')}
            className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
            title="Back to queue"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <span>QA Audit Queue</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-medium">Taxpayer Profile</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (!revisionNotes.trim() && auditorRemarks.trim()) setRevisionNotes(auditorRemarks);
              setIsRevisionModalOpen(true);
            }}
            disabled={!isQAReviewActive}
            className={`text-xs font-medium flex items-center gap-1.5 ${!isQAReviewActive ? 'text-slate-400 cursor-not-allowed' : 'cursor-pointer'}`}
            title={!isQAReviewActive ? 'Available once the preparer submits for QA' : 'Send back to preparer for corrections'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Request revision
          </Button>
          <Button
            size="sm"
            onClick={() => setIsApproveModalOpen(true)}
            disabled={isApproveDisabled}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title={
              isAlreadyApproved
                ? 'Already signed off'
                : !isQAReviewActive
                ? 'Available once the preparer submits for QA'
                : !allChecksPassed
                ? 'Complete the compliance checklist first'
                : 'Sign off and pass QA'
            }
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {isAlreadyApproved ? 'Signed off' : 'Sign-off & pass QA'}
          </Button>
        </div>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-5 flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{taxpayerName}</h2>
              <ClientPaymentStatusChip lead={{ ...taxDraftSummary, currentStage, taxDraftSummary, taxYear }} scope="return" size="sm" />
              <PriorityBadge priority={priority || 'NO_PRIORITY'} size="sm" />
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isAlreadyApproved ? 'bg-[#16A34A]' : isQAReviewActive ? 'bg-purple-500' : isRevisionRequested ? 'bg-rose-500' : 'bg-blue-500'
                  }`}
                />
                {isAlreadyApproved
                  ? 'QA approved'
                  : isQAReviewActive
                  ? 'Waiting for your audit'
                  : isRevisionRequested
                  ? 'Revision requested'
                  : 'In tax preparation'}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1.5">
              {[filingType === 'BUSINESS' ? 'Form 1120 / Business Return' : 'Form 1040', filingType !== 'BUSINESS' && taxpayer?.maritalStatus, filingType !== 'BUSINESS' && taxpayer?.visaType].filter(Boolean).join(' · ')}
            </p>
          </div>
          <div className="text-sm lg:text-right shrink-0">
            <div className="text-xs text-slate-500">Preparer</div>
            <div className="font-medium text-slate-900 mt-0.5">
              {assignedPreparer?.name || 'Unassigned'}
              {assignedPreparer?.id && assignedPreparer.id === currentUser?.id && <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-[#15803D]">Self-review</span>}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-slate-100 divide-y sm:divide-y-0 lg:divide-x divide-slate-100">
          {[
            { label: 'Phone', value: taxpayer?.phone || '—', copy: taxpayer?.phone },
            { label: 'Email', value: taxpayer?.email || '—', copy: taxpayer?.email },
            {
              label: 'Location',
              value: taxpayer?.state ? `${taxpayer?.city ? `${taxpayer.city}, ` : ''}${taxpayer.state}` : '—',
              copy: null,
            },
            { label: 'SSN / ITIN', value: taxpayer?.ssnMasked || '—', copy: null },
          ].map((item) => (
            <div key={item.label} className="px-5 py-3 flex items-center justify-between gap-2 min-w-0">
              <div className="min-w-0">
                <div className="text-xs text-slate-500">{item.label}</div>
                <div className="text-sm font-medium text-slate-900 truncate">{item.value}</div>
              </div>
              {item.copy && <AppCopyButton text={item.copy} size="sm" />}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs: view-only organizer + Services & Pricing + QA Review */}
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
                <ReturnItemsPanel applicationId={applicationId} readOnly />
                <ReviewerDrakeTaxCard
                  drakeTaxFile={drakeTaxFile}
                  assignedPreparer={assignedPreparer}
                  onPreview={setSelectedDocForPreview}
                />
              </div>
            ),
          },
          {
            id: 'QA_REVIEW',
            label: 'QA Review & Notes',
            content: (
              <div className="space-y-4">
                <ReviewerComplianceChecklist
                  documents={documents}
                  checks={checks}
                  toggleCheck={toggleCheck}
                  onSelectAllChecks={handleSelectAllChecks}
                  allChecksPassed={allChecksPassed}
                  onPreviewDoc={setSelectedDocForPreview}
                />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="text-sm font-semibold text-slate-900">Preparer notes</div>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{prepNotes || 'No notes from the preparer.'}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">QA notes</div>
                      <div className="text-xs text-slate-500">Shared with the preparer when you sign off or request a revision.</div>
                    </div>
                    <AppTextarea
                      value={auditorRemarks}
                      onChange={setAuditorRemarks}
                      rows={5}
                      maxLength={5000}
                      showCount
                      placeholder="e.g. All W-2 and 1099 records verified against source documents..."
                    />
                  </div>
                </div>
              </div>
            ),
          },
          {
            id: 'NOTES',
            label: 'Notes',
            content: <ApplicationNotesPanel applicationId={applicationId} />,
          },
        ]}
      />

      {/* Collapsible audit trail */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <button
          type="button"
          onClick={() => setIsAuditCollapsed((prev) => !prev)}
          className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-slate-900">Audit trail</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Stage handoffs, calls and updates for TY {taxYear} · {(stageHistories?.length || 0) + (callLogs?.length || 0) + (auditLogs?.length || 0)} events
            </p>
          </div>
          {isAuditCollapsed ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronUp className="w-4 h-4 text-slate-500" />}
        </button>
        {!isAuditCollapsed && (
          <div className="p-4 sm:p-5 border-t border-slate-100">
            <LeadAuditTrailSection
              leadId={applicationId}
              taxpayerName={taxpayerName}
              taxpayerEmail={taxpayer?.email}
              currentStage={currentStage}
              stageHistories={stageHistories}
              callLogs={callLogs}
              auditLogs={auditLogs}
            />
          </div>
        )}
      </div>

      {/* Previous audit layout (kept for reference)
      
      <ReviewerAuditHeader
        taxpayer={taxpayer}
        taxYear={taxYear}
        priority={priority}
        lead={{ ...taxDraftSummary, currentStage, taxDraftSummary, taxYear }}
        assignedPreparer={assignedPreparer}
        currentStage={currentStage}
        taxDraftSummary={taxDraftSummary}
        onBack={() => navigate('/prep-review/reviewer')}
        onOpenApproveModal={() => setIsApproveModalOpen(true)}
        onOpenRevisionModal={() => setIsRevisionModalOpen(true)}
        allChecksPassed={allChecksPassed}
      />

      
      {availableApplications && availableApplications.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-slate-100/90 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-slate-600">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span>Tax Year Filings:</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {availableApplications.map((appItem: any) => {
                const isSelected = appItem.id === applicationId;
                return (
                  <button
                    key={appItem.id}
                    type="button"
                    onClick={() => {
                      if (appItem.id !== applicationId) {
                        navigate(`/prep-review/reviewer/audit/${appItem.id}`);
                      }
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs ${
                      isSelected
                        ? 'bg-slate-900 text-white ring-2 ring-slate-900/10 shadow-sm'
                        : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span>TY {appItem.taxYear}</span>
                    <span className="text-[10px] font-medium opacity-80">
                      ({appItem.filingType || 'INDIVIDUAL'})
                    </span>
                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-purple-400' : 'bg-slate-300'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-1">
          <ClientProfilePanel
            taxpayer={taxpayer}
            assignedReviewer={assignedReviewer}
            documents={documents}
            standardDeductionAmount={standardDeductionAmount}
            taxDraftSummary={taxDraftSummary}
            onPreviewDoc={setSelectedDocForPreview}
            onOpenOrganizerModal={() => setIsOrganizerModalOpen(true)}
            drakeTaxComponent={
              <ReviewerDrakeTaxCard
                drakeTaxFile={drakeTaxFile}
                assignedPreparer={assignedPreparer}
                onPreview={setSelectedDocForPreview}
              />
            }
          />
        </div>

        
        <div className="lg:col-span-2 space-y-6">
          
          <ReviewerAuditCalculationsPanel
            taxDraftSummary={taxDraftSummary}
            preparerNotes={prepNotes}
            assignedPreparer={assignedPreparer}
          />

          
          <ReviewerComplianceChecklist
            documents={documents}
            checks={checks}
            toggleCheck={toggleCheck}
            onSelectAllChecks={handleSelectAllChecks}
            allChecksPassed={allChecksPassed}
            onPreviewDoc={setSelectedDocForPreview}
          />
        </div>
      </div>

      
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-900">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Senior Auditor Compliance Remarks &amp; Sign-Off Certification</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            Transferred to Sales Pitch Team
          </span>
        </div>

        <textarea
          rows={3}
          value={auditorRemarks}
          onChange={(e) => setAuditorRemarks(e.target.value)}
          placeholder="Add auditor compliance remarks (e.g. All source W-2, 1099-B and 1099-INT records verified. Form 1040 draft is approved for Sales pitch)..."
          className="w-full rounded-xl border border-slate-200 p-3.5 text-xs text-slate-800 focus:border-purple-500 focus:outline-none placeholder:text-slate-400 font-medium"
        />
      </div>

      
      <LeadAuditTrailSection
        leadId={applicationId}
        taxpayerName={taxpayerName}
        taxpayerEmail={taxpayer?.email}
        currentStage={currentStage}
        stageHistories={stageHistories}
        callLogs={callLogs}
        auditLogs={auditLogs}
      />
      */}

      {/* 4. Document Preview Modal */}
      <DocumentPreviewModal
        document={selectedDocForPreview}
        onClose={() => setSelectedDocForPreview(null)}
      />

      {/* 5. Sign-Off & Revision Modals */}
      <ReviewerSignOffModals
        taxpayer={taxpayer}
        taxDraftSummary={taxDraftSummary}
        assignedPreparer={assignedPreparer}
        auditorRemarks={auditorRemarks}
        isApproveModalOpen={isApproveModalOpen}
        onCloseApproveModal={() => setIsApproveModalOpen(false)}
        onConfirmApprove={handleConfirmApprove}
        isRevisionModalOpen={isRevisionModalOpen}
        onCloseRevisionModal={() => setIsRevisionModalOpen(false)}
        revisionReason={revisionReason}
        setRevisionReason={setRevisionReason}
        revisionNotes={revisionNotes}
        setRevisionNotes={setRevisionNotes}
        onConfirmRevision={handleConfirmRevision}
        isSubmitting={isSubmitting}
      />

      {/* 6. Full 9-Module Intake Audit Dossier Modal for QA Reviewer */}
      <AppModal
        isOpen={isOrganizerModalOpen}
        onClose={() => setIsOrganizerModalOpen(false)}
        width="1100px"
        title={
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="font-bold text-slate-900 text-sm">
              Complete Tax Info and Files Audit Dossier (QA 4-Eyes Verification) — {taxpayerName}
            </span>
          </div>
        }
      >
        <div className="py-2">
          <TaxPrepOrganizerReview
            leadId={applicationId}
            customerName={taxpayerName}
            taxDraftSummary={taxDraftSummary}
            taxYear={availableApplications?.find((a: { id: string }) => a.id === applicationId)?.taxYear}
            filingType={filingType}
            allowEdit={false}
            readOnly={true}
          />
        </div>
      </AppModal>
    </div>
  );
};
