import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Sparkles, Calendar } from 'lucide-react';
import { AppModal } from '@/shared/components/AppModal';
import { useTaxReviewerAudit } from '../hooks/useTaxReviewerAudit';
import { ReviewerAuditHeader } from '../components/reviewer/audit/ReviewerAuditHeader';
import { ClientProfilePanel } from '../components/workspace/ClientProfilePanel';
import { ReviewerDrakeTaxCard } from '../components/reviewer/audit/ReviewerDrakeTaxCard';
import { ReviewerAuditCalculationsPanel } from '../components/reviewer/audit/ReviewerAuditCalculationsPanel';
import { ReviewerComplianceChecklist } from '../components/reviewer/audit/ReviewerComplianceChecklist';
import { DocumentPreviewModal } from '../components/workspace/DocumentPreviewModal';
import { ReviewerSignOffModals } from '../components/reviewer/audit/ReviewerSignOffModals';
import { LeadAuditTrailSection } from '@/features/documenter/components/LeadAuditTrailSection';
import { TaxPrepOrganizerReview } from '@/features/documenter/components/prep/TaxPrepOrganizerReview';

export const TaxReviewerAuditScreen: React.FC = () => {
  const navigate = useNavigate();
  const [isOrganizerModalOpen, setIsOrganizerModalOpen] = useState(false);
  const {
    isLoading,
    isSubmitting,
    applicationId,
    taxYear,
    currentStage,
    taxpayer,
    assignedPreparer,
    assignedReviewer,
    documents,
    selectedDocForPreview,
    setSelectedDocForPreview,
    drakeTaxFile,
    prepNotes,
    taxDraftSummary,
    clientPaymentStatus,
    availableApplications,
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

  const standardDeductionAmount = (() => {
    const status = (taxpayer?.maritalStatus || taxDraftSummary?.filingStatus || 'SINGLE').toUpperCase();
    if (status.includes('MARRIED') || status.includes('JOINT')) return 29200;
    if (status.includes('HEAD')) return 21900;
    return 14600;
  })();

  return (
    <div className="w-full space-y-6 pb-16 font-sans animate-in fade-in duration-200">
      {/* 1. Header with Actions */}
      <ReviewerAuditHeader
        taxpayer={taxpayer}
        taxYear={taxYear}
        assignedPreparer={assignedPreparer}
        currentStage={currentStage}
        taxDraftSummary={taxDraftSummary}
        clientPaymentStatus={clientPaymentStatus}
        onBack={() => navigate('/prep-review/reviewer')}
        onOpenApproveModal={() => setIsApproveModalOpen(true)}
        onOpenRevisionModal={() => setIsRevisionModalOpen(true)}
        allChecksPassed={allChecksPassed}
      />

      {/* 1.2 Multi-Year Return Switcher Tabs */}
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

      {/* 2. Split Audit Layout (Client Profile 9-Module Intake + Drake Tax + Computations + Checklist) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Client Profile & Complete 9-Module Intake Dossier with Drake Tax under Documents (1 col) */}
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

        {/* Right Column: Live Computations + Checklist (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* 2.1 Live Computations drafted by Preparer */}
          <ReviewerAuditCalculationsPanel
            taxDraftSummary={taxDraftSummary}
            preparerNotes={prepNotes}
            assignedPreparer={assignedPreparer}
          />

          {/* 2.3 4-Eyes Compliance Checklist & Verified Vault */}
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

      {/* 3. Full-Width Senior Auditor Compliance Remarks Card */}
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

      {/* 3.5 Full Lead Audit Trail & Lifecycle Activity Stream */}
      <LeadAuditTrailSection
        leadId={applicationId}
        taxpayerName={taxpayerName}
        taxpayerEmail={taxpayer?.email}
        currentStage={currentStage}
        stageHistories={stageHistories}
        callLogs={callLogs}
        auditLogs={auditLogs}
      />

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
              Complete Tax Organizer Audit Dossier (QA 4-Eyes Verification) — {taxpayerName}
            </span>
          </div>
        }
      >
        <div className="py-2">
          <TaxPrepOrganizerReview
            leadId={applicationId}
            customerName={taxpayerName}
            taxDraftSummary={taxDraftSummary}
            allowEdit={false}
            readOnly={true}
          />
        </div>
      </AppModal>
    </div>
  );
};
