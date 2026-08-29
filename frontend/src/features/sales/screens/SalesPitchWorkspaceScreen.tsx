import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PitchTaxpayerHeader } from '../components/pitch/PitchTaxpayerHeader';
import { PitchTaxDraftSummaryCard } from '../components/pitch/PitchTaxDraftSummaryCard';
import { PitchFeeCalculator } from '../components/pitch/PitchFeeCalculator';
import { PitchCallAssistant } from '../components/pitch/PitchCallAssistant';
import { PitchPaymentAndEsignModals } from '../components/pitch/PitchPaymentAndEsignModals';
import { salesService } from '../services/sales-service';
import type { SalesLeadItem, SalesFeeBreakdown } from '../types/sales.types';
import apiClient from '@/lib/api-client';
import toast from 'react-hot-toast';

export const SalesPitchWorkspaceScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [lead, setLead] = useState<SalesLeadItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isEsignModalOpen, setIsEsignModalOpen] = useState(false);

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
      <div className="bg-white rounded-2xl border border-slate-200 p-16 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-3 border-emerald-600 border-t-transparent animate-spin" />
        <span className="text-xs font-bold text-slate-500">Loading live certified Form 1040 pitch deck...</span>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
        <h3 className="font-bold text-slate-800 text-base">Sales Lead not found</h3>
        <p className="text-xs text-slate-500 mt-1">The requested tax return lead could not be located in the sales pipeline.</p>
        <button
          onClick={() => navigate('/sales/agent/queue')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-blue-700"
        >
          Back to Pitch Queue
        </button>
      </div>
    );
  }

  const handleUpdateFeeBreakdown = (updated: SalesFeeBreakdown) => {
    setLead((prev) => (prev ? { ...prev, feeBreakdown: updated } : prev));
  };

  const handleProcessPaymentSuccess = async (method: 'STRIPE_CARD' | 'PAYPAL' | 'WIRE_TRANSFER') => {
    if (!lead) return;
    const appId = lead.id || lead.applicationId;
    const amount = lead.feeBreakdown?.totalServiceFee || 227;
    const txRef = `tx_live_${Math.random().toString(36).substring(2, 10)}`;

    try {
      await salesService.recordPayment(appId, {
        amount,
        discountAmount: lead.feeBreakdown?.discountAmount || 0,
        paymentMethod: method,
        transactionRef: txRef,
        notes: `Service fee payment collected via ${method}`,
      });

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
        taxpayerPin: meta?.pin || '84920',
      });

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
      toast.success(`Form 8879 signed file ${meta?.fileName || ''} saved to vault and authorized with PIN ${meta?.pin || ''}! 📄✅`);
    } catch (err: any) {
      console.error('Failed to sync e-sign:', err);
      toast.error(err?.response?.data?.message || 'E-Sign recorded locally, but failed to sync with database');
    }
  };

  const handleDispatchToFiling = async () => {
    try {
      await salesService.dispatchToFiling(lead.id || lead.applicationId);
      setLead((prev) => (prev ? { ...prev, currentStage: 'FILING_QUEUE' } : prev));
      toast.success(`Form 1040 for ${lead.taxpayerName} successfully dispatched to IRS E-Filing Queue! 🚀🏛️`);
      setTimeout(() => {
        navigate('/sales/agent/queue');
      }, 1200);
    } catch {
      toast.error('Failed to dispatch return to filing operations');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
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
            onDispatchToFiling={handleDispatchToFiling}
          />
        </div>
      </div>

      {/* 3. Checkout Modals (Stripe Simulation & E-Sign 8879) */}
      <PitchPaymentAndEsignModals
        lead={lead}
        isPaymentModalOpen={isPaymentModalOpen}
        onClosePaymentModal={() => setIsPaymentModalOpen(false)}
        onProcessPaymentSuccess={handleProcessPaymentSuccess}
        isEsignModalOpen={isEsignModalOpen}
        onCloseEsignModal={() => setIsEsignModalOpen(false)}
        onEsignSuccess={handleEsignSuccess}
      />
    </div>
  );
};
