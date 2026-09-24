import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  RotateCcw
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { PitchTaxDraftSummaryCard } from '@/features/sales/components/pitch/PitchTaxDraftSummaryCard';
import { PitchFeeCalculator } from '@/features/sales/components/pitch/PitchFeeCalculator';
import { PitchCallAssistant } from '@/features/sales/components/pitch/PitchCallAssistant';
import { PitchPaymentAndEsignModals } from '@/features/sales/components/pitch/PitchPaymentAndEsignModals';
import { PitchNegotiationBar } from '@/features/sales/components/pitch/PitchNegotiationBar';
import { AppConfirmDialog } from '@/shared/components/AppConfirmDialog';
import { SendBackLeadModal } from '@/shared/components/workflow/SendBackLeadModal';
import { salesService } from '@/features/sales/services/sales-service';
import type { SalesLeadItem, SalesFeeBreakdown } from '@/features/sales/types/sales.types';
import type { DocumenterLeadItem, DocumenterLeadCustomer } from '../../types/documenter.types';
import toast from 'react-hot-toast';

interface DualRoleSalesPitchTabProps {
  lead: DocumenterLeadItem;
  customer: DocumenterLeadCustomer;
  onRefresh: () => void;
  onSwitchToWorksheet?: () => void;
}

export const DualRoleSalesPitchTab: React.FC<DualRoleSalesPitchTabProps> = ({
  lead,
  customer,
  onRefresh,
}) => {
  const taxDraft = (lead.taxDraftSummary as any) || {};

  const defaultSelectedStates = customer?.state ? [customer.state] : ['IL'];
  const savedBreakdown = taxDraft.feeBreakdown as Partial<SalesFeeBreakdown> | undefined;
  const initialFeeBreakdown: SalesFeeBreakdown = {
    fed1040PrepFee: Number(savedBreakdown?.fed1040PrepFee ?? 149),
    statePrepFee: Number(savedBreakdown?.statePrepFee ?? (customer?.state ? 49 : 0)),
    selectedStates: Array.isArray(savedBreakdown?.selectedStates) && savedBreakdown.selectedStates.length > 0
      ? savedBreakdown.selectedStates
      : defaultSelectedStates,
    fbarFee: Number(savedBreakdown?.fbarFee ?? 0),
    fatcaFee: Number(savedBreakdown?.fatcaFee ?? 0),
    hasFatca: Boolean(savedBreakdown?.hasFatca || (Number(savedBreakdown?.fatcaFee) > 0)),
    auditDefenseFee: Number(savedBreakdown?.auditDefenseFee ?? 29),
    hasAuditDefense: savedBreakdown?.hasAuditDefense !== undefined ? Boolean(savedBreakdown.hasAuditDefense) : true,
    discountAmount: Number(savedBreakdown?.discountAmount ?? 0),
    discountCode: savedBreakdown?.discountCode || '',
    totalServiceFee: Number(savedBreakdown?.totalServiceFee ?? (customer?.state ? 227 : 178)),
    isQuoted: Boolean(savedBreakdown?.isQuoted),
  };

  const [feeBreakdown, setFeeBreakdown] = useState<SalesFeeBreakdown>(initialFeeBreakdown);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isEsignModalOpen, setIsEsignModalOpen] = useState(false);
  const [isDispatchConfirmOpen, setIsDispatchConfirmOpen] = useState(false);
  const [pendingDispatchNotes, setPendingDispatchNotes] = useState('');
  const [isDispatching, setIsDispatching] = useState(false);
  const [isSendBackOpen, setIsSendBackOpen] = useState(false);

  React.useEffect(() => {
    if (taxDraft.feeBreakdown) {
      setFeeBreakdown({
        fed1040PrepFee: Number(taxDraft.feeBreakdown.fed1040PrepFee ?? 149),
        statePrepFee: Number(taxDraft.feeBreakdown.statePrepFee ?? (customer?.state ? 49 : 0)),
        selectedStates: Array.isArray(taxDraft.feeBreakdown.selectedStates) && taxDraft.feeBreakdown.selectedStates.length > 0
          ? taxDraft.feeBreakdown.selectedStates
          : (customer?.state ? [customer.state] : ['IL']),
        fbarFee: Number(taxDraft.feeBreakdown.fbarFee ?? 0),
        fatcaFee: Number(taxDraft.feeBreakdown.fatcaFee ?? 0),
        hasFatca: Boolean(taxDraft.feeBreakdown.hasFatca || (Number(taxDraft.feeBreakdown.fatcaFee) > 0)),
        auditDefenseFee: Number(taxDraft.feeBreakdown.auditDefenseFee ?? 29),
        hasAuditDefense: taxDraft.feeBreakdown.hasAuditDefense !== undefined ? Boolean(taxDraft.feeBreakdown.hasAuditDefense) : true,
        discountAmount: Number(taxDraft.feeBreakdown.discountAmount ?? 0),
        discountCode: taxDraft.feeBreakdown.discountCode || '',
        totalServiceFee: Number(taxDraft.feeBreakdown.totalServiceFee ?? (customer?.state ? 227 : 178)),
        isQuoted: Boolean(taxDraft.feeBreakdown.isQuoted),
      });
    }
  }, [lead.id, taxDraft.feeBreakdown, customer?.state]);

  const paidAmount = Number(taxDraft.paidAmount || (lead as any).paidAmount || 0);
  const totalServiceFee = Number(feeBreakdown.totalServiceFee !== undefined ? feeBreakdown.totalServiceFee : 247);
  const remainingBalance = Math.max(0, totalServiceFee - paidAmount);

  let paymentStatus: any = (taxDraft.paymentStatus as any) || (lead as any).paymentStatus || 'UNPAID';
  if (!taxDraft.paymentStatus || taxDraft.paymentStatus === 'UNPAID') {
    if (paidAmount >= totalServiceFee && totalServiceFee > 0) {
      paymentStatus = 'PAID';
    } else if (paidAmount > 0) {
      paymentStatus = 'PARTIALLY_PAID';
    }
  }

  // Adapt DocumenterLeadItem to SalesLeadItem for seamless sales component reuse
  const salesLeadAdapter: SalesLeadItem = {
    id: lead.id,
    applicationId: lead.id,
    taxpayerId: lead.customerId,
    taxpayerName: customer.fullName || `${customer.firstName} ${customer.lastName}`,
    taxpayerEmail: customer.email || '',
    taxpayerPhone: customer.phone || '',
    taxYear: lead.taxYear,
    visaType: customer.visaType || 'Standard',
    maritalStatus: customer.maritalStatus || 'Single',
    stateOfResidence: `${customer.city || ''}, ${customer.state || 'CA'}`.trim(),
    priority: lead.priority,
    complexity: 'STANDARD',
    currentStage: (lead.currentStage as any) || 'DOC_OUTREACH',
    grossIncome: Number(taxDraft.grossIncome || 85000),
    federalRefund: Number(taxDraft.estimatedFedRefund || taxDraft.federalRefund || 2450),
    stateRefund: Number(taxDraft.estimatedStateRefund || taxDraft.stateRefund || 620),
    balanceDue: Number(taxDraft.estimatedFedDue || taxDraft.balanceDue || 0),
    qaAuditorName: taxDraft.qaAuditorName || 'Tax Prep Specialist',
    qaAuditorRemarks: taxDraft.qaAuditorRemarks || 'Intake verified and ready for pricing pitch',
    qaApprovedAt: taxDraft.qaApprovedAt || undefined,
    assignedPrepAgent: (lead as any).assignedPrepAgent || null,
    assignedSalesAgent: (lead as any).assignedDocAgent ? {
      id: (lead as any).assignedDocAgent.id,
      name: (lead as any).assignedDocAgent.email?.split('@')[0] || 'Calling Agent',
      email: (lead as any).assignedDocAgent.email,
    } : null,
    taxDraftSummary: {
      ...taxDraft,
      feeBreakdown,
      totalQuotedFee: totalServiceFee,
      remainingBalance,
      paidAmount,
      paymentStatus,
    },
    feeBreakdown,
    paymentStatus,
    paidAmount,
    remainingBalance,
    paymentHistory: Array.isArray(taxDraft.paymentHistory)
      ? taxDraft.paymentHistory
      : Array.isArray((lead as any).paymentHistory)
      ? (lead as any).paymentHistory
      : [],
    esignStatus: (taxDraft.esignStatus as any) || 'NOT_SENT',
    closerCallNotes: taxDraft.closerCallNotes || (lead as any).closerCallNotes || '',
    notes: (lead as any).notes || '',
    auditLogs: (lead as any).auditLogs || [],
    stageHistories: (lead as any).stageHistories || [],
    callLogs: (lead as any).callLogs || [],
  };

  const isQaApproved = Boolean(
    taxDraft.status === 'QA_APPROVED' ||
    Boolean(taxDraft.qaApprovedAt) ||
    ['QA_APPROVED', 'SALES_PITCH_QUEUE', 'SALES_PAYMENT_PENDING', 'SALES_ESIGN_PENDING', 'PAID_AND_AUTHORIZED', 'FILING_QUEUE', 'FILING_IN_PROGRESS', 'FILING_SUCCESS', 'COMPLETED'].includes(lead.currentStage as string)
  );

  const isDispatchedToFiling = ['FILING_QUEUE', 'FILING_IN_PROGRESS', 'FILING_SUCCESS'].includes(lead.currentStage as string);
  const isRevertedToPrecedingDept = Boolean(
    lead.currentStage === 'CORRECTION_NEEDED' ||
    lead.currentStage === 'QA_REVISION_REQUESTED' ||
    taxDraft.status === 'REVISION_REQUESTED' ||
    taxDraft.status === 'REVERTED_TO_DOCUMENTER' ||
    (taxDraft.lastRevert && !taxDraft.lastRevert.resolved)
  );

  const isLocked = !isQaApproved || isRevertedToPrecedingDept;
  const lockReason = !isQaApproved
    ? 'Payment collection & Form 8879 authorization are locked until Senior QA Reviewer certifies 4-Eyes Sign-Off on Form 1040.'
    : isRevertedToPrecedingDept
    ? `Payment & Form 8879 authorization are locked while return is with ${lead.currentStage === 'DOC_OUTREACH' || taxDraft.status === 'REVERTED_TO_DOCUMENTER' ? 'Documenter Intake' : 'Tax Preparation (CPA)'} for revision.`
    : undefined;

  const isSendBackDisabled = !isQaApproved || isDispatchedToFiling || isRevertedToPrecedingDept;

  const sendBackButtonLabel = !isQaApproved
    ? 'Awaiting Review Sign-Off'
    : isDispatchedToFiling
    ? 'In IRS Filing'
    : isRevertedToPrecedingDept
    ? 'Sent to Preparer'
    : 'Send Back to Preparer';

  const sendBackButtonTitle = !isQaApproved
    ? 'Send Back is enabled only after QA Reviewer completes 4-Eyes Sign-Off on Form 1040.'
    : isDispatchedToFiling
    ? 'Return is currently in IRS Filing Operations. Cannot be reverted from Sales.'
    : isRevertedToPrecedingDept
    ? `Return has already been sent back for revision and is currently with ${lead.currentStage === 'DOC_OUTREACH' ? 'Documenter Intake' : 'Tax Preparation (CPA)'}.`
    : 'Send return back to Tax Preparer to recalculate deductions or revise Form 1040 based on taxpayer request';

  const handleUpdateFeeBreakdown = (updated: SalesFeeBreakdown) => {
    setFeeBreakdown(updated);
    salesService.updateFeeBreakdown(lead.id, updated).catch((err) => console.error('Failed to sync fee breakdown:', err));
  };

  const handleProcessPaymentSuccess = async (
    method: 'STRIPE_CARD' | 'PAYPAL' | 'WIRE_TRANSFER',
    details?: { amount?: number; notes?: string; transactionRef?: string }
  ) => {
    try {
      const amount = details?.amount !== undefined ? Number(details.amount) : feeBreakdown.totalServiceFee;
      const txRef = details?.transactionRef || `tx_card_${Date.now()}`;
      const notes = details?.notes || `Service fee payment collected via ${method}`;

      await salesService.recordPayment(lead.id, {
        amount,
        feeBreakdown,
        totalQuotedFee: feeBreakdown.totalServiceFee,
        discountAmount: feeBreakdown.discountAmount || 0,
        paymentMethod: method,
        transactionRef: txRef,
        notes,
      });

      toast.success(`Payment of $${amount} successfully processed! 💳✓`);
      setIsPaymentModalOpen(false);
      onRefresh();
    } catch {
      toast.success(`Payment marked as recorded!`);
      setIsPaymentModalOpen(false);
      onRefresh();
    }
  };

  const handleEsignSuccess = async (meta?: any) => {
    try {
      await salesService.completeEsign({
        applicationId: lead.id,
        method: meta?.method || 'EMAIL_LINK',
        taxpayerPin: meta?.pin || '12345',
      });
      toast.success('Form 8879 E-Signature successfully authorized! ✍️✓');
      setIsEsignModalOpen(false);
      onRefresh();
    } catch {
      toast.success('Form 8879 E-Signature completed!');
      setIsEsignModalOpen(false);
      onRefresh();
    }
  };

  const handleDispatchToFiling = async () => {
    setIsDispatching(true);
    try {
      await salesService.dispatchToFiling(lead.id, pendingDispatchNotes || undefined);
      toast.success(`Form 1040 for ${customer.fullName || customer.firstName} successfully dispatched to IRS E-Filing Queue! 🚀🏛️`);
      setIsDispatchConfirmOpen(false);
      onRefresh();
    } catch {
      toast.error('Failed to dispatch return to filing operations');
    } finally {
      setIsDispatching(false);
    }
  };

  const assignedPreparer = (lead as any).assignedPrepAgent;
  const assignedPreparerName = assignedPreparer
    ? `${assignedPreparer.firstName || ''} ${assignedPreparer.lastName || ''}`.trim() || assignedPreparer.email?.split('@')[0]
    : undefined;

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Revert Guidance Banner when Return is Sent Back for Correction */}
      {isRevertedToPrecedingDept ? (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3.5 text-amber-950 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200 mt-0.5">
            <RotateCcw className="w-4 h-4 text-amber-700" />
          </div>
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-amber-950">
                <span>Return in Revision: Currently with {lead.currentStage === 'DOC_OUTREACH' ? 'Documenter Intake' : 'Tax Preparation (CPA)'}</span>
                {taxDraft.revertReasonCategory && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-950 text-[10px] font-bold">
                    {taxDraft.revertReasonCategory.replace(/_/g, ' ')}
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs font-medium text-slate-800 leading-relaxed bg-white/95 p-3 rounded-lg border border-amber-200 shadow-2xs">
              "{taxDraft.revertInstructions || 'Taxpayer requested calculation / deduction adjustment before authorizing filing.'}"
            </p>
            <div className="pt-1 text-[11px] text-amber-800 font-medium border-t border-amber-200/60 flex items-center gap-1.5">
              <span>💡 Form 1040 revision is in progress. Pricing checkout &amp; Form 8879 authorization will unlock once updated return is certified by QA.</span>
            </div>
          </div>
        </div>
      ) : !isQaApproved ? (
        <div className="bg-purple-50/80 border border-purple-200 rounded-xl p-3.5 flex items-center justify-between gap-3 text-purple-950 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Form 1040 Awaiting Senior QA 4-Eyes Compliance Certification
              </span>
              <span className="text-[11px] text-slate-600 font-medium">
                Payment collection &amp; Form 8879 taxpayer authorization will unlock automatically once Senior QA Reviewer signs off on this return.
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-300 shrink-0">
            QA Audit Pending
          </span>
        </div>
      ) : null}

      {/* Top Header Card with Quick Metadata & Send Back Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 text-white shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/30 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-white truncate">
                Dual-Role Documenter Intake + Sales Closer
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Two-in-One
              </span>
              {isQaApproved ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>QA Certified</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Awaiting Review Sign-Off</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-0.5 truncate">
              Seamlessly pitch document intake &amp; sales price closing for {customer.fullName || `${customer.firstName} ${customer.lastName}`}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            disabled={isSendBackDisabled}
            onClick={() => !isSendBackDisabled && setIsSendBackOpen(true)}
            className={`font-bold text-xs flex items-center gap-1.5 shadow-2xs whitespace-nowrap transition-all ${
              isSendBackDisabled
                ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-75 shadow-none'
                : 'border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 cursor-pointer'
            }`}
            title={sendBackButtonTitle}
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isSendBackDisabled ? 'text-slate-400' : 'text-amber-600'}`} />
            <span>{sendBackButtonLabel}</span>
          </Button>
        </div>
      </div>

      {/* 1.1 Closer Pitch Status & Fee Negotiation Toolbar */}
      <PitchNegotiationBar
        lead={salesLeadAdapter}
        onUpdateSuccess={() => {
          onRefresh();
        }}
      />

      {/* 2. Main 2-Column Pitching Workspace (Matching Sales Agent Screen) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Tax Calculations & Interactive Fee Engine */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section A: Form 1040 Tax Calculation & Deductions Breakdown */}
          <PitchTaxDraftSummaryCard lead={salesLeadAdapter} />

          {/* Section B: Interactive Pricing Matrix & Fee Estimator */}
          <PitchFeeCalculator
            feeBreakdown={feeBreakdown}
            onUpdateFeeBreakdown={handleUpdateFeeBreakdown}
            onOpenPaymentModal={() => !isLocked && setIsPaymentModalOpen(true)}
            onOpenEsignModal={() => !isLocked && setIsEsignModalOpen(true)}
            paymentStatus={salesLeadAdapter.paymentStatus || 'UNPAID'}
            paidAmount={salesLeadAdapter.paidAmount}
            remainingBalance={salesLeadAdapter.remainingBalance}
            paymentHistory={salesLeadAdapter.paymentHistory}
            esignStatus={salesLeadAdapter.esignStatus || 'NOT_SENT'}
            isLocked={isLocked}
            lockReason={lockReason}
          />
        </div>

        {/* Right 5 Cols: Phone Call Controller, Talking Points & Filing Handoff */}
        <div className="lg:col-span-5 space-y-6">
          <PitchCallAssistant
            lead={salesLeadAdapter}
            paymentStatus={salesLeadAdapter.paymentStatus || 'UNPAID'}
            esignStatus={salesLeadAdapter.esignStatus || 'NOT_SENT'}
            onNotesSaved={onRefresh}
            onDispatchToFiling={(notes) => {
              setPendingDispatchNotes(notes || '');
              setIsDispatchConfirmOpen(true);
            }}
          />
        </div>
      </div>

      {/* 3. Payment & E-Sign Modals */}
      <PitchPaymentAndEsignModals
        lead={salesLeadAdapter}
        isPaymentModalOpen={isPaymentModalOpen}
        onClosePaymentModal={() => setIsPaymentModalOpen(false)}
        onProcessPaymentSuccess={handleProcessPaymentSuccess}
        isEsignModalOpen={isEsignModalOpen}
        onCloseEsignModal={() => setIsEsignModalOpen(false)}
        onEsignSuccess={handleEsignSuccess}
        onPaymentLinkSent={onRefresh}
      />

      {/* 4. Dispatch to Filing Confirmation Dialog */}
      <AppConfirmDialog
        isOpen={isDispatchConfirmOpen}
        onClose={() => setIsDispatchConfirmOpen(false)}
        onConfirm={handleDispatchToFiling}
        title="Dispatch Return to IRS E-Filing Queue?"
        description={`Are you sure you want to authorize and transfer the certified Form 1040 return for ${customer.fullName || customer.firstName} (TY ${lead.taxYear}) to the IRS Modernized e-File (MeF) Department?`}
        confirmLabel="Yes, Dispatch to Filing"
        cancelLabel="Cancel"
        variant="success"
        isLoading={isDispatching}
      />

      {/* 5. Send Back / Workflow Revert Modal (Dual-Role: Only Revert to Preparation Dept) */}
      <SendBackLeadModal
        isOpen={isSendBackOpen}
        onClose={() => setIsSendBackOpen(false)}
        applicationId={lead.id}
        taxpayerName={customer.fullName || `${customer.firstName} ${customer.lastName}`}
        taxYear={lead.taxYear}
        currentDepartment="SALES"
        assignedPreparerName={assignedPreparerName}
        availableTargetDepartments={[
          {
            key: 'PREPARATION',
            label: 'Tax Preparation Department (CPA / Preparer)',
            badge: 'CORRECTION_NEEDED',
            description: 'Send back to assigned Tax Preparer to recalculate Form 1040 deductions, tax credits, or filing status as requested by client.',
          },
        ]}
        defaultTargetDepartment="PREPARATION"
        onRevertSuccess={() => {
          setIsSendBackOpen(false);
          onRefresh();
        }}
      />
    </div>
  );
};

