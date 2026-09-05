import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { PitchTaxpayerHeader } from '../components/pitch/PitchTaxpayerHeader';
import { PitchTaxDraftSummaryCard } from '../components/pitch/PitchTaxDraftSummaryCard';
import { PitchFeeCalculator } from '../components/pitch/PitchFeeCalculator';
import { PitchCallAssistant } from '../components/pitch/PitchCallAssistant';
import { PitchPaymentAndEsignModals } from '../components/pitch/PitchPaymentAndEsignModals';
import { LeadAuditTrailSection } from '@/features/documenter/components/LeadAuditTrailSection';
import { AppConfirmDialog } from '@/shared/components/AppConfirmDialog';
import { salesService } from '../services/sales-service';
import type { SalesLeadItem, SalesFeeBreakdown } from '../types/sales.types';
import apiClient from '@/lib/api-client';
import toast from 'react-hot-toast';

export const SalesPitchWorkspaceScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isManager = user?.role === 'SALES_MANAGER' || user?.role === 'ADMIN';
  const backQueuePath = isManager ? '/sales/manager/queue' : '/sales/agent/queue';

  const [lead, setLead] = useState<SalesLeadItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isEsignModalOpen, setIsEsignModalOpen] = useState(false);
  const [isDispatchConfirmOpen, setIsDispatchConfirmOpen] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);

  const fetchLeadDetail = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      // 1. Try to fetch single lead from backend
      const result = await salesService.getLeadById(id);
      if (result) {
        setLead(result);
        return;
      }

      // 2. Fallback to pipeline leads list if single fetch fails
      const pipelineRes = await salesService.getPipelineLeads({ limit: 100 });
      const found = (pipelineRes.leads || []).find(
        (l) => l.id === id || l.applicationId === id
      );
      if (found) {
        setLead(found);
      } else {
        toast.error('Sales lead return not found in database');
      }
    } catch {
      toast.error('Failed to load sales lead workspace');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLeadDetail();
  }, [fetchLeadDetail]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[420px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading pitch workspace &amp; calculations...</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <h3 className="font-bold text-slate-800 text-sm">Lead Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">This sales return could not be retrieved from active pipeline records.</p>
      </div>
    );
  }

  const handleUpdateFeeBreakdown = (updated: SalesFeeBreakdown) => {
    setLead((prev) => (prev ? { ...prev, feeBreakdown: updated } : prev));
  };

  const handleProcessPaymentSuccess = async (method: 'STRIPE_CARD' | 'PAYPAL' | 'WIRE_TRANSFER') => {
    if (!lead) return;
    const appId = lead.id || lead.applicationId;
    const amount = Number(lead.feeBreakdown?.totalServiceFee) || 0;
    const txRef = `tx_live_${Math.random().toString(36).substring(2, 10)}`;

    try {
      await salesService.recordPayment(appId, {
        amount,
        discountAmount: lead.feeBreakdown?.discountAmount || 0,
        paymentMethod: method,
        transactionRef: txRef,
        notes: `Service fee payment collected via ${method}`,
      });

      // Refetch live lead to get latest stageHistories & auditLogs from database
      const updated = await salesService.getLeadById(appId);
      if (updated) {
        setLead(updated);
      } else {
        setLead((prev) =>
          prev
            ? {
              ...prev,
              paymentStatus: 'PAID',
              paymentMethod: method,
              paidAt: new Date().toISOString(),
              transactionRef: txRef,
              currentStage: prev.esignStatus === 'SIGNED' ? 'PAID_AND_AUTHORIZED' : 'PAYMENT_PENDING',
            }
            : prev
        );
      }
      toast.success(`Service fee payment of $${amount.toLocaleString()} successfully recorded via ${method}! 💳✅`);
    } catch {
      toast.error('Payment recorded locally, but failed to sync with database');
    }
  };

  const handleEsignSuccess = async (meta?: { file?: File; fileName?: string; method?: string; pin?: string }) => {
    if (!lead) return;
    const appId = lead.id || lead.applicationId;

    try {
      // 1. Physically upload the file to server storage if provided
      if (meta?.file) {
        const formData = new FormData();
        formData.append('file', meta.file);
        formData.append('documentCategory', 'FORM_8879');
        await apiClient.post(`/documenter/leads/${appId}/documents`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      // 2. Record E-Sign and PIN in database
      await salesService.recordEsign(appId, {
        esignMethod: meta?.method || 'UPLOAD_PDF',
        fileName: meta?.fileName || `IRS_Form_8879_Signed_${lead.taxpayerName.replace(/\s+/g, '_')}.pdf`,
        taxpayerPin: meta?.pin || lead.taxpayerPin || '',
      });

      // Refetch live lead to get latest stageHistories & auditLogs from database
      const updated = await salesService.getLeadById(appId);
      if (updated) {
        setLead(updated);
      } else {
        setLead((prev) =>
          prev
            ? {
              ...prev,
              esignStatus: 'SIGNED',
              taxpayerPin: meta?.pin || prev.taxpayerPin,
              esignCompletedAt: new Date().toISOString(),
              currentStage: prev.paymentStatus === 'PAID' ? 'PAID_AND_AUTHORIZED' : 'QUOTATION_SENT',
            }
            : prev
        );
      }
      toast.success(`Form 8879 signed file ${meta?.fileName || ''} saved to vault and authorized with PIN ${meta?.pin || ''}! 📄✅`);
    } catch (err: any) {
      console.error('Failed to sync e-sign:', err);
      toast.error(err?.response?.data?.message || 'E-Sign recorded locally, but failed to sync with database');
    }
  };

  const handleDispatchToFiling = async () => {
    if (!lead) return;
    setIsDispatching(true);
    try {
      await salesService.dispatchToFiling(lead.id || lead.applicationId);
      setLead((prev) => (prev ? { ...prev, currentStage: 'FILING_QUEUE' } : prev));
      toast.success(`Form 1040 for ${lead.taxpayerName} successfully dispatched to IRS E-Filing Queue! 🚀🏛️`);
      setIsDispatchConfirmOpen(false);
      setTimeout(() => {
        navigate(backQueuePath);
      }, 1200);
    } catch {
      toast.error('Failed to dispatch return to filing operations');
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150 font-sans">
      {/* 1. Taxpayer Header & Certified 1040 Refund Banner */}
      <PitchTaxpayerHeader lead={lead} />

      {/* 2. Main Two-Column Pitching Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Tax Calculations & Interactive Fee Engine */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section A: Complete Tax Preparer Form 1040 Schedule & Deductions Breakdown */}
          <PitchTaxDraftSummaryCard lead={lead} />

          {/* Section B: Interactive Fee Quotation & Pricing Engine */}
          <PitchFeeCalculator
            feeBreakdown={lead.feeBreakdown}
            onUpdateFeeBreakdown={handleUpdateFeeBreakdown}
            onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
            onOpenEsignModal={() => setIsEsignModalOpen(true)}
            paymentStatus={lead.paymentStatus}
            esignStatus={lead.esignStatus}
          />
        </div>

        {/* Right 5 Cols: Phone Call Controller, Talking Points & Filing Handoff */}
        <div className="lg:col-span-5 space-y-6">
          <PitchCallAssistant
            lead={lead}
            paymentStatus={lead.paymentStatus}
            esignStatus={lead.esignStatus}
            onDispatchToFiling={() => setIsDispatchConfirmOpen(true)}
          />
        </div>
      </div>

      {/* 3. Full Lead Audit Trail & Lifecycle Activity Stream (Matching Reviewer Screen) */}
      <LeadAuditTrailSection
        leadId={lead.id || lead.applicationId}
        taxpayerName={lead.taxpayerName}
        currentStage={lead.currentStage}
        stageHistories={(lead.stageHistories as any) || []}
        callLogs={(lead.callLogs as any) || []}
        auditLogs={(lead.auditLogs as any) || []}
      />

      {/* 4. Checkout Modals (Stripe Simulation & E-Sign 8879) */}
      <PitchPaymentAndEsignModals
        lead={lead}
        isPaymentModalOpen={isPaymentModalOpen}
        onClosePaymentModal={() => setIsPaymentModalOpen(false)}
        onProcessPaymentSuccess={handleProcessPaymentSuccess}
        isEsignModalOpen={isEsignModalOpen}
        onCloseEsignModal={() => setIsEsignModalOpen(false)}
        onEsignSuccess={handleEsignSuccess}
      />

      {/* 5. Dispatch to Filing Confirmation Dialog */}
      <AppConfirmDialog
        isOpen={isDispatchConfirmOpen}
        onClose={() => setIsDispatchConfirmOpen(false)}
        onConfirm={handleDispatchToFiling}
        title="Dispatch Return to IRS E-Filing Queue?"
        description={`Are you sure you want to authorize and transfer the certified Form 1040 return for ${lead.taxpayerName} (TY ${lead.taxYear || 2025}) to the IRS Modernized e-File (MeF) Department? This will notify the Filing Operations Team and transfer the lead to the Filing Queue.`}
        confirmLabel="Yes, Dispatch to Filing"
        cancelLabel="Cancel"
        variant="success"
        isLoading={isDispatching}
      />
    </div>
  );
};
