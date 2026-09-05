import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { prepReviewService } from '../services/prep-review-service';
import toast from 'react-hot-toast';

export interface WorkspaceDocument {
  id: string;
  fileName: string;
  fileUrl?: string;
  fileType?: string;
  category: string;
  verificationStatus: string;
  uploadedAt?: string;
}

export interface WorkspaceTaxpayer {
  id: string;
  name: string;
  email: string;
  phone: string;
  maritalStatus: string;
  visaType: string;
  state: string;
  city: string;
  ssnMasked: string;
}

export interface WorkspaceAssignedReviewer {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function useTaxPreparerWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Application & Profile data
  const [applicationId, setApplicationId] = useState<string>('');
  const [taxYear, setTaxYear] = useState<number>(2025);
  const [currentStage, setCurrentStage] = useState<string>('PREP_IN_PROGRESS');
  const [taxpayer, setTaxpayer] = useState<WorkspaceTaxpayer | null>(null);
  const [assignedReviewer, setAssignedReviewer] = useState<WorkspaceAssignedReviewer | null>(null);
  const [documents, setDocuments] = useState<WorkspaceDocument[]>([]);
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<WorkspaceDocument | null>(null);

  // Form 1040 Calculation Inputs (Default to 0 / Clean DB State)
  const [w2Wages, setW2Wages] = useState<number>(0);
  const [taxableInterest, setTaxableInterest] = useState<number>(0);
  const [capitalGains, setCapitalGains] = useState<number>(0);
  const [otherIncome, setOtherIncome] = useState<number>(0);
  const [deductionType, setDeductionType] = useState<'STANDARD' | 'ITEMIZED'>('STANDARD');
  const [itemizedDeduction, setItemizedDeduction] = useState<number>(0);
  const [taxCredits, setTaxCredits] = useState<number>(0);
  const [fedWithheld, setFedWithheld] = useState<number>(0);
  const [stateWithheld, setStateWithheld] = useState<number>(0);
  const [preparerNotes, setPreparerNotes] = useState<string>('');
  const [revisionCategory, setRevisionCategory] = useState<string>('');
  const [revisionInstructions, setRevisionInstructions] = useState<string>('');
  const [lastRevertInfo, setLastRevertInfo] = useState<any | null>(null);
  const [documenterNotes, setDocumenterNotes] = useState<string | null>(null);
  const [documenterNotesBy, setDocumenterNotesBy] = useState<string | null>(null);
  const [documenterNotesAt, setDocumenterNotesAt] = useState<string | null>(null);

  const [stageHistories, setStageHistories] = useState<any[]>([]);
  const [callLogs, setCallLogs] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Standard deduction for 2025: MFJ = 29200, Single = 14600
  const standardDeductionAmount = useMemo(() => {
    if (taxpayer?.maritalStatus?.toLowerCase().includes('joint')) return 29200;
    if (taxpayer?.maritalStatus?.toLowerCase().includes('head')) return 21900;
    return 14600;
  }, [taxpayer?.maritalStatus]);

  // Fetch real workspace details from backend
  const fetchWorkspaceData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await prepReviewService.getWorkspaceDetails(id);
      setApplicationId(data.applicationId || id);
      setTaxYear(data.taxYear || 2025);
      setCurrentStage(data.currentStage || 'PREP_IN_PROGRESS');
      setTaxpayer(data.taxpayer || null);
      setAssignedReviewer(data.assignedReviewer || null);
      setDocuments(data.documents || []);
      if (data.stageHistories) setStageHistories(data.stageHistories);
      if (data.callLogs) setCallLogs(data.callLogs);
      if (data.auditLogs) setAuditLogs(data.auditLogs);
      if (data.documenterNotes) setDocumenterNotes(data.documenterNotes);
      if (data.documenterNotesBy) setDocumenterNotesBy(data.documenterNotesBy);
      if (data.documenterNotesAt) setDocumenterNotesAt(data.documenterNotesAt);

      // If draft was previously saved in DB, load its values
      const draft = data.taxDraftSummary;
      if (draft) {
        if (draft.w2Wages !== undefined) setW2Wages(Number(draft.w2Wages) || 0);
        if (draft.taxableInterest !== undefined) setTaxableInterest(Number(draft.taxableInterest) || 0);
        if (draft.capitalGains !== undefined) setCapitalGains(Number(draft.capitalGains) || 0);
        if (draft.otherIncome !== undefined) setOtherIncome(Number(draft.otherIncome) || 0);
        if (draft.deductionType) setDeductionType(draft.deductionType);
        if (draft.itemizedDeduction !== undefined) setItemizedDeduction(Number(draft.itemizedDeduction) || 0);
        if (draft.taxCredits !== undefined) setTaxCredits(Number(draft.taxCredits) || 0);
        if (draft.fedWithheld !== undefined) setFedWithheld(Number(draft.fedWithheld) || 0);
        if (draft.stateWithheld !== undefined) setStateWithheld(Number(draft.stateWithheld) || 0);
        if (draft.discrepancyCategory) setRevisionCategory(draft.discrepancyCategory);
        if (draft.discrepancyInstructions) setRevisionInstructions(draft.discrepancyInstructions);

        const prepRevert =
          draft.revertsByTarget?.PREPARATION ||
          draft.revertsByTarget?.['SALES_TO_PREPARATION'] ||
          draft.revertsByTarget?.['FILING_TO_PREPARATION'] ||
          draft.revertsByTarget?.['QA_REVIEW_TO_PREPARATION'] ||
          (draft.lastRevert?.targetDepartment === 'PREPARATION' ? draft.lastRevert : null);

        if (prepRevert && !prepRevert.resolved) {
          setLastRevertInfo(prepRevert);
          if (prepRevert.reasonCategory) setRevisionCategory(prepRevert.reasonCategory);
          if (prepRevert.revertNotes) setRevisionInstructions(prepRevert.revertNotes);
        } else if (draft.status === 'REVERTED_TO_DOCUMENTER' || data.currentStage === 'REVERTED_TO_DOC' || data.currentStage === 'DOC_OUTREACH') {
          setLastRevertInfo(draft.revertsByTarget?.DOCUMENTER || draft.lastRevert || { reasonCategory: 'MISSING_DOCUMENTS', revertNotes: 'Reverted to Documenter for missing paperwork', targetDepartment: 'DOCUMENTER' });
        } else {
          setLastRevertInfo(null);
        }
      } else {
        // Default initial values for new intake
        setW2Wages(0);
        setTaxableInterest(0);
        setCapitalGains(0);
        setOtherIncome(0);
        setFedWithheld(0);
        setStateWithheld(0);
        setItemizedDeduction(0);
        setTaxCredits(0);
      }

      if (data.prepNotes) {
        setPreparerNotes(data.prepNotes);
      }
    } catch {
      toast.error('Failed to load workspace data');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchWorkspaceData();
  }, [fetchWorkspaceData]);

  // LIVE 1040 PROGRESSIVE COMPUTATION ENGINE
  const calculations = useMemo(() => {
    const totalGrossIncome = (Number(w2Wages) || 0) + (Number(taxableInterest) || 0) + (Number(capitalGains) || 0) + (Number(otherIncome) || 0);
    const effectiveDeduction = deductionType === 'STANDARD' ? standardDeductionAmount : (Number(itemizedDeduction) || 0);
    const taxableIncome = Math.max(0, totalGrossIncome - effectiveDeduction);

    // 2025 Progressive Federal Tax Estimation (MFJ brackets)
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

    // State Tax Estimation (Illinois flat 4.95%)
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
      combinedRefund: federalRefund + stateRefund,
    };
  }, [w2Wages, taxableInterest, capitalGains, otherIncome, deductionType, itemizedDeduction, standardDeductionAmount, fedWithheld, taxCredits, stateWithheld]);

  // Payload generator
  const getDraftPayload = useCallback(() => {
    return {
      w2Wages,
      taxableInterest,
      capitalGains,
      otherIncome,
      deductionType,
      itemizedDeduction,
      taxCredits,
      fedWithheld,
      stateWithheld,
      totalGrossIncome: calculations.totalGrossIncome,
      taxableIncome: calculations.taxableIncome,
      taxLiability: calculations.taxLiability,
      federalRefund: calculations.federalRefund,
      balanceDue: calculations.balanceDue,
      stateRefund: calculations.stateRefund,
      stateBalanceDue: calculations.stateBalanceDue,
      preparerNotes,
    };
  }, [w2Wages, taxableInterest, capitalGains, otherIncome, deductionType, itemizedDeduction, taxCredits, fedWithheld, stateWithheld, calculations, preparerNotes]);

  // 1. Action: Save Draft
  const handleSaveDraft = async () => {
    if (!id) return;
    setIsSaving(true);
    try {
      await prepReviewService.saveWorkspaceDraft(id, getDraftPayload());
      toast.success('Form 1040 calculation draft saved successfully');
    } catch {
      toast.error('Failed to save draft calculation');
    } finally {
      setIsSaving(false);
    }
  };

  // 2. Action: Submit to QA
  const handleSubmitForQA = async () => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await prepReviewService.submitWorkspaceToQA(id, getDraftPayload());
      toast.success('Form 1040 submitted for Senior QA Review!');
      setIsConfirmOpen(false);
      navigate('/prep-review/preparer');
    } catch {
      toast.error('Failed to submit return for QA review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    id,
    isLoading,
    isSaving,
    isSubmitting,
    isConfirmOpen,
    setIsConfirmOpen,
    applicationId,
    taxYear,
    currentStage,
    taxpayer,
    assignedReviewer,
    documents,
    selectedDocForPreview,
    setSelectedDocForPreview,
    w2Wages,
    setW2Wages,
    taxableInterest,
    setTaxableInterest,
    capitalGains,
    setCapitalGains,
    otherIncome,
    setOtherIncome,
    deductionType,
    setDeductionType,
    itemizedDeduction,
    setItemizedDeduction,
    taxCredits,
    setTaxCredits,
    fedWithheld,
    setFedWithheld,
    stateWithheld,
    setStateWithheld,
    preparerNotes,
    setPreparerNotes,
    standardDeductionAmount,
    isSubmittedToQA: currentStage === 'QA_IN_REVIEW' || (currentStage === 'QA_APPROVED' && !lastRevertInfo),
    isRevertedToDocs:
      currentStage === 'DOC_OUTREACH' ||
      currentStage === 'REVERTED_TO_DOC' ||
      (Boolean(lastRevertInfo && !lastRevertInfo?.resolved) && lastRevertInfo?.targetDepartment === 'DOCUMENTER'),
    isRevertedToSales:
      currentStage === 'SALES_PITCH_QUEUE' ||
      currentStage === 'SALES_PITCHING' ||
      (Boolean(lastRevertInfo && !lastRevertInfo?.resolved) && lastRevertInfo?.targetDepartment === 'SALES'),
    isRevisionRequested:
      (currentStage === 'QA_REVISION_REQUESTED' ||
        currentStage === 'CORRECTION_NEEDED' ||
        (Boolean(lastRevertInfo && !lastRevertInfo?.resolved) && lastRevertInfo?.targetDepartment === 'PREPARATION')) &&
      currentStage !== 'DOC_OUTREACH' &&
      currentStage !== 'REVERTED_TO_DOC' &&
      currentStage !== 'SALES_PITCH_QUEUE' &&
      currentStage !== 'SALES_PITCHING' &&
      lastRevertInfo?.targetDepartment !== 'SALES' &&
      lastRevertInfo?.targetDepartment !== 'DOCUMENTER',
    lastRevertInfo,
    documenterNotes,
    documenterNotesBy,
    documenterNotesAt,
    revisionCategory,
    revisionInstructions,
    calculations,
    stageHistories,
    callLogs,
    auditLogs,
    handleSaveDraft,
    handleSubmitForQA,
  };
}
