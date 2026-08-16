import React, { useState } from 'react';
import { AppModal } from '@/shared/components/AppModal';
import { AppCopyButton } from '@/shared/components/AppCopyButton';
import { 
  Calculator, 
  FileText, 
  CheckSquare, 
  User, 
  Globe, 
  PhoneOutgoing
} from 'lucide-react';
import type { DocumenterLeadItem } from '../../types/documenter.types';
import { TaxPrepDraftCalculator } from './TaxPrepDraftCalculator';
import type { TaxDraftComputation } from './TaxPrepDraftCalculator';
import { TaxPrepDocumentVault } from './TaxPrepDocumentVault';
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
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#16A34A] text-white">
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
        <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-[#16A34A] border border-emerald-500/30 flex items-center justify-center font-bold text-sm">
              <User className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="font-bold text-sm text-white flex items-center gap-2">
                <span>{customer.fullName || `${customer.firstName} ${customer.lastName}`}</span>
                {customer.visaType && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    <Globe className="w-2.5 h-2.5" /> {customer.visaType}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                  TY {lead.taxYear}
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>Phone: <strong className="text-white">{customer.phone}</strong></span>
                <AppCopyButton text={customer.phone} size="sm" />
                <span>•</span>
                <span>Email: <strong className="text-white">{customer.email}</strong></span>
                {customer.email && <AppCopyButton text={customer.email} size="sm" />}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-xl border border-slate-700">
            <a
              href={`tel:${customer.phone}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs transition-colors shadow-2xs"
            >
              <PhoneOutgoing className="w-3.5 h-3.5" />
              <span>Call Client</span>
            </a>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('CALCULATOR')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 flex-1 justify-center ${
              activeTab === 'CALCULATOR'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calculator className="w-4 h-4 text-emerald-600" />
            <span>Tax Draft Estimator</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('DOCUMENTS')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 flex-1 justify-center ${
              activeTab === 'DOCUMENTS'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-purple-600" />
            <span>Client Documents Vault</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ORGANIZER')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 flex-1 justify-center ${
              activeTab === 'ORGANIZER'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-blue-600" />
            <span>9-Module Organizer Checklist</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'CALCULATOR' && (
          <TaxPrepDraftCalculator
            initialDraft={initialDraft}
            onSaveDraft={handleSaveDraft}
            onSendToSales={handleSendToSales}
            isSaving={isSaving}
          />
        )}

        {activeTab === 'DOCUMENTS' && (
          <TaxPrepDocumentVault
            customerName={customer.fullName || `${customer.firstName} ${customer.lastName}`}
          />
        )}

        {activeTab === 'ORGANIZER' && (
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  9-Module Taxpayer Intake Checklist
                </h4>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Tick and review items while discussing with {customer.firstName} on the call.
                </p>
              </div>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
                Interactive Intake
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'm1', name: '1. Personal Info & SSN/ITIN', defaultStatus: 'Verified' },
                { id: 'm2', name: '2. Spouse & Dependents', defaultStatus: 'Applicable' },
                { id: 'm3', name: '3. Visa & Residency (1040 vs 1040-NR)', defaultStatus: 'Verified' },
                { id: 'm4', name: '4. W-2 Wages & Withholding', defaultStatus: 'Verified' },
                { id: 'm5', name: '5. 1099-INT/DIV Bank Interest', defaultStatus: 'Applicable' },
                { id: 'm6', name: '6. 1099-B Stocks / Crypto Gains', defaultStatus: 'Pending Review' },
                { id: 'm7', name: '7. Foreign Income & FBAR Status', defaultStatus: 'Not Applicable' },
                { id: 'm8', name: '8. Itemized / Standard Deductions', defaultStatus: 'Standard' },
                { id: 'm9', name: '9. Direct Deposit Bank Routing', defaultStatus: 'Pending Upload' },
              ].map((mod) => (
                <div 
                  key={mod.id} 
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between gap-2"
                >
                  <span className="font-bold text-xs text-slate-800">{mod.name}</span>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-[10px] text-slate-500 font-medium">Status:</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
                      {mod.defaultStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppModal>
  );
};
