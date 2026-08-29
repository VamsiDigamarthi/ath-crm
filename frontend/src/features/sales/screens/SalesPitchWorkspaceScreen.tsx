import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PitchTaxpayerHeader } from '../components/pitch/PitchTaxpayerHeader';
import { PitchFeeCalculator } from '../components/pitch/PitchFeeCalculator';
import { PitchCallAssistant } from '../components/pitch/PitchCallAssistant';
import { PitchPaymentAndEsignModals } from '../components/pitch/PitchPaymentAndEsignModals';
import { INITIAL_SALES_LEADS } from '../constants/sales-mock-data';
import type { SalesLeadItem, SalesFeeBreakdown } from '../types/sales.types';
import toast from 'react-hot-toast';

export const SalesPitchWorkspaceScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Find lead by ID from mock/state
  const [lead, setLead] = useState<SalesLeadItem | null>(() => {
    const found = INITIAL_SALES_LEADS.find((l) => l.id === id || l.applicationId === id);
    return found || INITIAL_SALES_LEADS[0];
  });

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isEsignModalOpen, setIsEsignModalOpen] = useState(false);

  if (!lead) {
    return (
      <div className="p-12 text-center text-slate-500">
        Sales Lead not found.
      </div>
    );
  }

  const handleUpdateFeeBreakdown = (updated: SalesFeeBreakdown) => {
    setLead((prev) => (prev ? { ...prev, feeBreakdown: updated } : prev));
  };

  const handleProcessPaymentSuccess = (method: 'STRIPE_CARD' | 'PAYPAL' | 'WIRE_TRANSFER') => {
    setLead((prev) =>
      prev
        ? {
            ...prev,
            paymentStatus: 'PAID',
            paymentMethod: method,
            paidAt: new Date().toISOString(),
            transactionRef: `tx_live_${Math.random().toString(36).substring(2, 10)}`,
            currentStage: prev.esignStatus === 'SIGNED' ? 'PAID_AND_AUTHORIZED' : 'PAYMENT_PENDING',
          }
        : prev
    );
  };

  const handleEsignSuccess = () => {
    setLead((prev) =>
      prev
        ? {
            ...prev,
            esignStatus: 'SIGNED',
            esignCompletedAt: new Date().toISOString(),
            currentStage: prev.paymentStatus === 'PAID' ? 'PAID_AND_AUTHORIZED' : 'QUOTATION_SENT',
          }
        : prev
    );
  };

  const handleDispatchToFiling = () => {
    setLead((prev) => (prev ? { ...prev, currentStage: 'FILING_QUEUE' } : prev));
    toast.success(`Form 1040 for ${lead.taxpayerName} successfully dispatched to IRS E-Filing Queue! 🚀🏛️`);
    setTimeout(() => {
      navigate('/sales/agent/queue');
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* 1. Taxpayer Header & Certified 1040 Refund Banner */}
      <PitchTaxpayerHeader lead={lead} />

      {/* 2. Main Two-Column Pitching Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Interactive Fee Calculator & Pricing Engine */}
        <div className="lg:col-span-7 space-y-6">
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

      {/* 3. Modals: Stripe Payment Virtual Terminal & Form 8879 E-Sign */}
      <PitchPaymentAndEsignModals
        lead={lead}
        isPaymentModalOpen={isPaymentModalOpen}
        onClosePaymentModal={() => setIsPaymentModalOpen(false)}
        onProcessPaymentSuccess={handleProcessPaymentSuccess}
        isEsignModalOpen={isEsignModalOpen}
        onCloseEsignModal={() => setIsEsignModalOpen(false)}
        onEsignSuccess={handleEsignSuccess}
        onDispatchToFiling={handleDispatchToFiling}
      />
    </div>
  );
};
