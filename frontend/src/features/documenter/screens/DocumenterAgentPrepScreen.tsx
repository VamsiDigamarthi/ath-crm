import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocumenterWorkspace } from '../hooks/useDocumenterWorkspace';
import { TaxPrepDetailModal } from '../components/prep/TaxPrepDetailModal';
import { Button } from '@/shared/components/Button';
import { AppCopyButton } from '@/shared/components/AppCopyButton';
import { 
  FileCheck2, 
  Send, 
  RefreshCw, 
  ArrowRight,
  Calculator,
  FileText,
  Sparkles,
  DollarSign,
  User
} from 'lucide-react';
import { renderVisaBadge } from '../columns/documenter-columns';
import type { DocumenterLeadItem } from '../types/documenter.types';

export const DocumenterAgentPrepScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    leads,
    stats,
    isLoading,
    refreshData,
  } = useDocumenterWorkspace('PREP');

  const [selectedLeadForPrep, setSelectedLeadForPrep] = useState<DocumenterLeadItem | null>(null);
  const [isPrepModalOpen, setIsPrepModalOpen] = useState<boolean>(false);

  const prepLeads = leads.filter((l) => l.currentStage === 'DOC_PREP');

  // Real count of leads with prepared draft calculations
  const readyForSalesCount = React.useMemo(() => {
    return prepLeads.filter((l) => Boolean((l.taxDraftSummary as any)?.estimatedFedRefund)).length;
  }, [prepLeads]);

  // Real average calculated ONLY from saved draft summaries
  const avgEstimatedRefund = React.useMemo(() => {
    const calculatedLeads = prepLeads.filter((l) => typeof (l.taxDraftSummary as any)?.estimatedFedRefund === 'number');
    if (calculatedLeads.length === 0) return 0;
    const total = calculatedLeads.reduce((acc, lead) => {
      return acc + Number((lead.taxDraftSummary as any).estimatedFedRefund);
    }, 0);
    return Math.round(total / calculatedLeads.length);
  }, [prepLeads]);

  const handleOpenPrep = (lead: DocumenterLeadItem) => {
    setSelectedLeadForPrep(lead);
    setIsPrepModalOpen(true);
  };

  const handleClosePrep = () => {
    setSelectedLeadForPrep(null);
    setIsPrepModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Active W-2 Tax Preparation & Client Intakes
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Review taxpayer wage forms, compute preliminary tax refunds, and transfer qualified files to the Sales Pitch Queue.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Active Intakes */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Active Tax Prep Intakes
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 font-bold">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {stats.inPrep || prepLeads.length}
            </div>
            <div className="text-xs text-purple-600 font-medium mt-1">
              Qualified taxpayers ready for computation
            </div>
          </div>
        </div>

        {/* Card 2: Ready for Sales */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Ready for Sales Pitch
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center border border-emerald-100 font-bold">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {readyForSalesCount}
            </div>
            <div className="text-xs text-[#16A34A] font-medium mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#16A34A]" />
              <span>{readyForSalesCount > 0 ? `${readyForSalesCount} draft computations ready` : 'Awaiting computation'}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Avg Estimated Refund */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Avg Estimated Federal Refund
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {avgEstimatedRefund > 0 ? `+$${avgEstimatedRefund.toLocaleString()}` : '$0'}
            </div>
            <div className="text-xs text-blue-600 font-medium mt-1">
              {avgEstimatedRefund > 0 ? 'Computed from saved drafts' : 'Pending agent calculation'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Real Active Preps List */}
      {prepLeads.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3 border border-purple-100 font-bold">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Active Tax Preps</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            When you call an outreach prospect and mark them as <strong>Connected - Interested</strong>, their file will automatically move here for tax calculation.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {prepLeads.map((lead) => {
            const customer = lead.customer;
            const draft = lead.taxDraftSummary as any;
            const hasDraft = typeof draft?.estimatedFedRefund === 'number';
            const locationStr = customer?.city && customer?.state 
              ? `${customer.city}, ${customer.state}` 
              : (customer?.state || customer?.city || 'US');

            return (
              <div
                key={lead.id}
                className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-[#16A34A]/60 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-base font-bold text-slate-900">
                      {customer?.fullName || `${customer?.firstName} ${customer?.lastName}`}
                    </span>
                    {renderVisaBadge(customer?.visaType)}
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#16A34A] text-white">
                      Stage: DOC_PREP
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      TY {lead.taxYear}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium">
                    <span>Phone: <strong className="text-slate-900">{customer?.phone}</strong></span>
                    {customer?.phone && <AppCopyButton text={customer.phone} size="sm" />}
                    <span className="text-slate-300">•</span>
                    <span>Email: <strong className="text-slate-900">{customer?.email || 'No email'}</strong></span>
                    {customer?.email && <AppCopyButton text={customer.email} size="sm" />}
                    <span className="text-slate-300">•</span>
                    <span>Location: <strong className="text-slate-900">{locationStr}</strong></span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    {hasDraft ? (
                      <div className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold flex items-center gap-1.5">
                        <Calculator className="w-3.5 h-3.5 text-[#16A34A]" />
                        <span>Est. Fed Refund: <strong className="text-emerald-700 font-bold">+${draft.estimatedFedRefund.toLocaleString()}</strong></span>
                      </div>
                    ) : (
                      <div className="px-3 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-semibold flex items-center gap-1.5">
                        <Calculator className="w-3.5 h-3.5 text-amber-600" />
                        <span>Draft Refund: <strong>Pending Calculation</strong></span>
                      </div>
                    )}
                    <div className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-semibold flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Documents: <strong>Awaiting Client Upload</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="md"
                    variant="outline"
                    onClick={() => navigate(`/documenter/agent/lead/${lead.id}`)}
                    className="border-slate-200 hover:border-emerald-300 bg-white hover:bg-emerald-50 text-slate-700 hover:text-[#16A34A] text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer px-3"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>View</span>
                  </Button>

                  <Button
                    size="md"
                    onClick={() => handleOpenPrep(lead)}
                    className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-2 shadow-2xs cursor-pointer px-4"
                  >
                    <Calculator className="w-4 h-4" />
                    <span>Open Tax Prep Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tax Prep Workspace Modal */}
      <TaxPrepDetailModal
        isOpen={isPrepModalOpen}
        onClose={handleClosePrep}
        lead={selectedLeadForPrep}
        onSuccessHandoff={() => {
          refreshData();
        }}
      />
    </div>
  );
};
