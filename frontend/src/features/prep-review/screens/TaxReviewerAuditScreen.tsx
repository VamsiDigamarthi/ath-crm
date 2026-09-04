import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useTaxReviewerAudit } from '../hooks/useTaxReviewerAudit';
import { ReviewerAuditHeader } from '../components/reviewer/audit/ReviewerAuditHeader';
import { ReviewerAuditCalculationsPanel } from '../components/reviewer/audit/ReviewerAuditCalculationsPanel';
import { ReviewerComplianceChecklist } from '../components/reviewer/audit/ReviewerComplianceChecklist';
import { DocumentPreviewModal } from '../components/workspace/DocumentPreviewModal';
import { ReviewerSignOffModals } from '../components/reviewer/audit/ReviewerSignOffModals';
import { LeadAuditTrailSection } from '@/features/documenter/components/LeadAuditTrailSection';

export const TaxReviewerAuditScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    isLoading,
    isSubmitting,
    applicationId,
    taxYear,
    currentStage,
    taxpayer,
    assignedPreparer,
    documents,
    selectedDocForPreview,
    setSelectedDocForPreview,
    prepNotes,
    taxDraftSummary,
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

  return (
    <div className="w-full space-y-6 pb-16 font-sans animate-in fade-in duration-200">
      {/* 1. Header with Actions */}
      <ReviewerAuditHeader
        taxpayer={taxpayer}
        taxYear={taxYear}
        assignedPreparer={assignedPreparer}
        currentStage={currentStage}
        taxDraftSummary={taxDraftSummary}
        onBack={() => navigate('/prep-review/reviewer')}
        onOpenApproveModal={() => setIsApproveModalOpen(true)}
        onOpenRevisionModal={() => setIsRevisionModalOpen(true)}
        allChecksPassed={allChecksPassed}
      />

      {/* 2. Split Audit Layout (Calculations & Checklist) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Computations drafted by Preparer (7 cols) */}
        <div className="lg:col-span-7">
          <ReviewerAuditCalculationsPanel
            taxDraftSummary={taxDraftSummary}
            preparerNotes={prepNotes}
            assignedPreparer={assignedPreparer}
          />
        </div>

        {/* Right Column: 4-Eyes Compliance Checklist & Verified Vault (5 cols) */}
        <div className="lg:col-span-5">
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
    </div>
  );
};
