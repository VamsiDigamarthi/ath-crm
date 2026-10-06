import React, { useState } from 'react';
import { AppModal } from '@/shared/components/AppModal';
import { AppCopyButton } from '@/shared/components/AppCopyButton';
import { AppTabs } from '@/shared/components/AppTabs';
import { 
  User, 
  Globe, 
  PhoneOutgoing
} from 'lucide-react';
import type { DocumenterLeadItem } from '../../types/documenter.types';
import { TaxPrepDraftCalculator } from './TaxPrepDraftCalculator';
import type { TaxDraftComputation } from './TaxPrepDraftCalculator';
import { TaxPrepDocumentVault } from './TaxPrepDocumentVault';
import { TaxPrepOrganizerReview } from './TaxPrepOrganizerReview';
import { documenterService } from '../../services/documenter-service';
import toast from 'react-hot-toast';

interface TaxPrepDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: DocumenterLeadItem | null;
  onSuccessHandoff: () => void;
}

export const TaxPrepDetailModal: React.FC<TaxPrepDetailModalProps> = ({
  isOpen,
  onClose,
  lead,
  onSuccessHandoff,
}) => {
  const [activeTab, setActiveTab] = useState<'CALCULATOR' | 'DOCUMENTS' | 'ORGANIZER'>('CALCULATOR');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  if (!lead) return null;

  const customer = lead.customer;
  const initialDraft = lead.taxDraftSummary as any;

  const handleSaveDraft = async (draft: TaxDraftComputation) => {
    setIsSaving(true);
    try {
      await documenterService.saveTaxDraft({
        applicationId: lead.id,
        taxDraftSummary: draft,
      });
      toast.success('Draft tax computation saved to database!');
    } catch (err: any) {
      toast.error('Failed to save draft computation');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendToSales = async (draft: TaxDraftComputation) => {
    setIsSaving(true);
    try {
      await documenterService.sendToSales({
        applicationId: lead.id,
        taxDraftSummary: draft,
        remarks: `Tax draft prepared. Estimated Federal Refund: +$${draft.estimatedFedRefund.toLocaleString()}. Sent to Sales Pitch Queue.`,
      });
      toast.success('Successfully sent lead to Sales Pitch Queue! 🚀');
      onSuccessHandoff();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit to sales');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-4xl"
      title={
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Tax Preparation & Client Intake Workspace</span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#16A34A] text-white">
              Stage: DOC_PREP
            </span>
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Review {customer.firstName} {customer.lastName}'s intake files, calculate draft computation, and transfer to Sales.
          </p>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Taxpayer Header Card */}
        <div className="p-4 rounded-md bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-white text-slate-800 border border-slate-200 flex items-center justify-center font-bold text-sm shadow-2xs">
              <User className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <span>{customer.fullName || `${customer.firstName} ${customer.lastName}`}</span>
                {customer.visaType && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    <Globe className="w-2.5 h-2.5" /> {customer.visaType}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  TY {lead.taxYear}
                </span>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span>Phone: <strong className="text-slate-800">{customer.phone}</strong></span>
                <AppCopyButton text={customer.phone} size="sm" />
                <span>•</span>
                <span>Email: <strong className="text-slate-800">{customer.email}</strong></span>
                {customer.email && <AppCopyButton text={customer.email} size="sm" />}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${customer.phone}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold text-xs transition-colors shadow-2xs"
            >
              <PhoneOutgoing className="w-3.5 h-3.5" />
              <span>Call Client</span>
            </a>
          </div>
        </div>

        {/* Tab Navigation */}
        <AppTabs
          tabs={[
            { id: 'CALCULATOR', label: 'Tax Draft Estimator' },
            { id: 'DOCUMENTS', label: 'Client Documents Vault' },
            { id: 'ORGANIZER', label: 'Tax Info and Files' },
          ]}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as any)}
          size="sm"
        />

        {/* Tab Content */}
        {activeTab === 'CALCULATOR' && (
          <TaxPrepDraftCalculator
            initialDraft={initialDraft}
            organizer={(lead.taxDraftSummary as any)?.organizer}
            customerMaritalStatus={customer.maritalStatus || undefined}
            taxYear={lead.taxYear || 2025}
            onSaveDraft={handleSaveDraft}
            onSendToSales={handleSendToSales}
            isSaving={isSaving}
          />
        )}

        {activeTab === 'DOCUMENTS' && (
          <TaxPrepDocumentVault
            leadId={lead.id}
            applicationId={lead.id}
            customerName={customer.fullName || `${customer.firstName} ${customer.lastName}`}
            customerEmail={customer.email || (lead as any).taxpayerEmail}
            documents={(lead as any).documents || []}
          />
        )}

        {activeTab === 'ORGANIZER' && (
          <TaxPrepOrganizerReview
            leadId={lead.id}
            customerName={customer.fullName || `${customer.firstName} ${customer.lastName}`}
            taxDraftSummary={lead.taxDraftSummary}
            taxYear={lead.taxYear}
            filingType={lead.filingType || (lead.taxDraftSummary as any)?.filingType}
          />
        )}
      </div>
    </AppModal>
  );
};
