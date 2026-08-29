import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { prepReviewService } from '../services/prep-review-service';
import type { WorkspaceTaxpayer, WorkspaceAssignedReviewer, WorkspaceDocument } from './useTaxPreparerWorkspace';
import toast from 'react-hot-toast';

export function useTaxReviewerAudit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Application & Profile data
  const [applicationId, setApplicationId] = useState<string>('');
  const [taxYear, setTaxYear] = useState<number>(2025);
  const [currentStage, setCurrentStage] = useState<string>('QA_IN_REVIEW');
  const [taxpayer, setTaxpayer] = useState<WorkspaceTaxpayer | null>(null);
  const [assignedPreparer, setAssignedPreparer] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
  const [assignedReviewer, setAssignedReviewer] = useState<WorkspaceAssignedReviewer | null>(null);
  const [documents, setDocuments] = useState<WorkspaceDocument[]>([]);
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<WorkspaceDocument | null>(null);
  const [prepNotes, setPrepNotes] = useState<string>('');
  const [taxDraftSummary, setTaxDraftSummary] = useState<any>(null);

  // 4-Eyes Compliance Checklist States (Default Unchecked - Auditor must manually verify)
  const [checks, setChecks] = useState<{ [key: string]: boolean }>({
    checkW2: false,
    checkWithheld: false,
    check1099B: false,
    checkDeduction: false,
    checkState: false,
    checkFBAR: false,
  });

  const toggleCheck = (key: string) => {
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectAllChecks = () => {
    setChecks({
      checkW2: true,
      checkWithheld: true,
      check1099B: true,
      checkDeduction: true,
      checkState: true,
      checkFBAR: true,
    });
  };

  const allChecksPassed = Object.values(checks).every(Boolean);

  // QA Auditor Remarks (Empty by default)
  const [auditorRemarks, setAuditorRemarks] = useState<string>('');

  // Modals States
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisionReason, setRevisionReason] = useState('Discrepancy in Box 2 Federal Withholding calculation');
  const [revisionNotes, setRevisionNotes] = useState('');

  // Fetch real return calculation data from backend
  const fetchAuditData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await prepReviewService.getWorkspaceDetails(id);
      setApplicationId(data.applicationId || id);
      setTaxYear(data.taxYear || 2025);
      setCurrentStage(data.currentStage || 'QA_IN_REVIEW');
      setTaxpayer(data.taxpayer || null);
      setAssignedPreparer(data.assignedPreparer || null);
      setAssignedReviewer(data.assignedReviewer || null);
      setDocuments(data.documents || []);
      setPrepNotes(data.prepNotes || '');
      setTaxDraftSummary(data.taxDraftSummary || {});

      // Load saved auditor remarks or saved compliance checks if available
      const draft = data.taxDraftSummary;
      if (draft?.qaAuditorRemarks) {
        setAuditorRemarks(draft.qaAuditorRemarks);
      }
      if (draft?.complianceChecks) {
        setChecks(draft.complianceChecks);
      }
    } catch {
      toast.error('Failed to load audit workspace data');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAuditData();
  }, [fetchAuditData]);

  // Action 1: Senior QA Sign-Off & Approve
  const handleConfirmApprove = async () => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await prepReviewService.signOffQAReturn(id, auditorRemarks);
      toast.success(`Form 1040 for ${taxpayer?.name || 'Taxpayer'} approved! Transferred to Sales Pitch Queue 🛡️🚀`);
      setIsApproveModalOpen(false);
      navigate('/prep-review/reviewer');
    } catch {
      toast.error('Failed to sign off return');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Action 2: Request Revision from Preparer
  const handleConfirmRevision = async () => {
    if (!id) return;
    if (!revisionNotes.trim()) {
      toast.error('Please specify revision instructions for the Preparer');
      return;
    }
    setIsSubmitting(true);
    try {
      await prepReviewService.requestRevisionQAReturn(id, {
        discrepancyCategory: revisionReason,
        revisionNotes,
      });
      toast.success(`Revision dispatched to Tax Preparer (${assignedPreparer?.name || 'Preparer'})! 🔄`);
      setIsRevisionModalOpen(false);
      navigate('/prep-review/reviewer');
    } catch {
      toast.error('Failed to request revision');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    id,
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
    handleConfirmApprove,
    handleConfirmRevision,
  };
}
