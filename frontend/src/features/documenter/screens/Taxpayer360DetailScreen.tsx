import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase, 
  ShieldCheck, 
  FileText, 
  Calculator, 
  PhoneCall, 
  CheckSquare, 
  RefreshCw
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppCopyButton } from '@/shared/components/AppCopyButton';
import { renderVisaBadge, renderStageBadge } from '../columns/documenter-columns';
import { TaxpayerCallHistoryTimeline } from '../components/TaxpayerCallHistoryTimeline';
import { TaxPrepDraftCalculator } from '../components/prep/TaxPrepDraftCalculator';
import type { TaxDraftComputation } from '../components/prep/TaxPrepDraftCalculator';
import { TaxPrepDocumentVault } from '../components/prep/TaxPrepDocumentVault';
import { TaxPrepOrganizerReview } from '../components/prep/TaxPrepOrganizerReview';
import { CallOutreachModal } from '../components/CallOutreachModal';
import { useDocumenterWorkspace } from '../hooks/useDocumenterWorkspace';
import { documenterService } from '../services/documenter-service';
import type { DocumenterLeadItem, CallLogItem } from '../types/documenter.types';
import toast from 'react-hot-toast';

export const Taxpayer360DetailScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    isLoading: isWorkspaceLoading,
    refreshData,
    handleSaveCallDisposition,
  } = useDocumenterWorkspace();

  const [activeTab, setActiveTab] = useState<'TIMELINE' | 'DOCUMENTS' | 'CALCULATOR' | 'ORGANIZER'>('TIMELINE');
  const [lead, setLead] = useState<DocumenterLeadItem | null>(null);
  const [isLoadingLead, setIsLoadingLead] = useState<boolean>(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Fetch full 360 lead details including all historical call logs
  const fetchLeadDetails = async () => {
    if (!id) return;
    try {
      const res = await documenterService.getLeadDetails(id);
      if (res && res.data) {
        setLead(res.data);
      }
    } catch (err) {
      console.error('Failed to load full lead details:', err);
    } finally {
      setIsLoadingLead(false);
    }
  };

  useEffect(() => {
    fetchLeadDetails();
  }, [id]);

  // Fallback if not loaded
  const currentLead: DocumenterLeadItem = lead || {
    id: id || 'lead-1',
    customerId: 'cust-1',
    taxYear: 2025,
    filingType: 'INDIVIDUAL',
    currentStage: 'DOC_OUTREACH',
    customer: {
      id: 'cust-1',
      firstName: 'Rahul',
      lastName: 'Choudhury',
      fullName: 'Rahul Choudhury',
      email: 'rahul.choudhury@finanalytics.com',
      phone: '+1 (732) 555-0155',
      ssnTin: '345-67-8901',
      dob: '04/05/1984',
      occupation: 'Director of Technology',
      visaType: 'H-1B',
      maritalStatus: 'Single',
      addressLine1: '120 Wood Ave S',
      city: 'Iselin',
      state: 'NJ',
      zipCode: '08830',
    },
    assignedDocAgent: {
      id: 'agent-1',
      email: 'kavya.r@taxcrm.com',
      mobile: '+1 (415) 555-0199',
      role: 'DOC_AGENT',
    },
    lastCallLog: null,
    callLogs: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const customer = currentLead.customer;
  const callLogs: CallLogItem[] = currentLead.callLogs || [];

  const handleSaveDraft = async (draft: TaxDraftComputation) => {
    setIsSaving(true);
    try {
      await documenterService.saveTaxDraft({
        applicationId: currentLead.id,
        taxDraftSummary: draft,
      });
      toast.success('Draft tax computation saved to database!');
      refreshData();
    } catch {
      toast.error('Failed to save draft computation');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendToSales = async (draft: TaxDraftComputation) => {
    setIsSaving(true);
    try {
      await documenterService.sendToSales({
        applicationId: currentLead.id,
        taxDraftSummary: draft,
        remarks: `Tax draft prepared by Documenter. Estimated Federal Refund: +$${draft.estimatedFedRefund.toLocaleString()}. Sent to Sales Pitch Queue.`,
      });
      toast.success('Successfully transferred lead to Sales Pitch Queue! 🚀');
      refreshData();
      navigate('/documenter/agent/queue');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit to sales');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 font-sans animate-in fade-in duration-150">
      {/* 1. Back Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span>Tax Operations</span>
              <span>/</span>
              <span>Calling Workspace</span>
              <span>/</span>
              <span className="text-slate-900 font-bold">Taxpayer Profile</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
              {customer.fullName || `${customer.firstName} ${customer.lastName}`}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCallModalOpen(true)}
            className="border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-[#16A34A] text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Log Outreach Call</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refreshData();
              fetchLeadDetails();
            }}
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLead || isWorkspaceLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* 2. Top Hero Profile Summary Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Avatar & Primary Details */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/10">
              {customer.firstName?.[0] || 'T'}
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  {customer.fullName || `${customer.firstName} ${customer.lastName}`}
                </h3>
                {renderVisaBadge(customer.visaType)}
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  TY {currentLead.taxYear}
                </span>
                {renderStageBadge(currentLead.currentStage)}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                <span>{customer.occupation || 'Taxpayer Client'}</span>
                {customer.dob && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span>DOB: {customer.dob}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Right: Quick Action Pill */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-right">
              <span className="text-[11px] font-semibold text-slate-400 block">
                Assigned Calling Agent
              </span>
              <span className="text-xs font-bold text-slate-800 flex items-center justify-end gap-1.5 mt-0.5">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                {currentLead.assignedDocAgent?.email?.split('@')[0] || 'Kavya Reddy'}
              </span>
            </div>
          </div>
        </div>

        {/* Contact Info Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100 text-xs">
          {/* Phone */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-md bg-emerald-50 text-[#16A34A] flex items-center justify-center shrink-0">
                <Phone className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <span className="text-[10px] text-slate-400 font-medium block">Phone Number</span>
                <span className="font-bold text-slate-800">{customer.phone}</span>
              </div>
            </div>
            <AppCopyButton text={customer.phone} size="sm" />
          </div>

          {/* Email */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <span className="text-[10px] text-slate-400 font-medium block">Email Address</span>
                <span className="font-bold text-slate-800 truncate block max-w-[130px]">{customer.email || 'N/A'}</span>
              </div>
            </div>
            {customer.email && <AppCopyButton text={customer.email} size="sm" />}
          </div>

          {/* Location */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div className="truncate">
              <span className="text-[10px] text-slate-400 font-medium block">Tax Location</span>
              <span className="font-bold text-slate-800 truncate block">
                {customer.city ? `${customer.city}, ${customer.state} ${customer.zipCode || ''}` : 'United States'}
              </span>
            </div>
          </div>

          {/* SSN / TIN */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <span className="text-[10px] text-slate-400 font-medium block">SSN / ITIN Status</span>
                <span className="font-bold text-slate-800">{customer.ssnTin || 'Verified on file'}</span>
              </div>
            </div>
            {customer.ssnTin && <AppCopyButton text={customer.ssnTin} size="sm" />}
          </div>
        </div>
      </div>

      {/* 3. Main Workspace Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px">
        <button
          onClick={() => setActiveTab('TIMELINE')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'TIMELINE'
              ? 'border-[#16A34A] text-[#16A34A] bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>Call History & Outreach Timeline</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            activeTab === 'TIMELINE' ? 'bg-[#16A34A] text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {callLogs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('DOCUMENTS')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'DOCUMENTS'
              ? 'border-[#16A34A] text-[#16A34A] bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Client Documents Vault</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            activeTab === 'DOCUMENTS' ? 'bg-[#16A34A] text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            3 files
          </span>
        </button>

        <button
          onClick={() => setActiveTab('CALCULATOR')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'CALCULATOR'
              ? 'border-[#16A34A] text-[#16A34A] bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Tax Draft Worksheet</span>
        </button>

        <button
          onClick={() => setActiveTab('ORGANIZER')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'ORGANIZER'
              ? 'border-[#16A34A] text-[#16A34A] bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>9-Module Organizer</span>
        </button>
      </div>

      {/* 4. Tab Content Panels */}
      <div>
        {activeTab === 'TIMELINE' && (
          <TaxpayerCallHistoryTimeline
            callLogs={callLogs}
            taxpayerName={customer.fullName || `${customer.firstName} ${customer.lastName}`}
            onOpenCallModal={() => setIsCallModalOpen(true)}
          />
        )}

        {activeTab === 'DOCUMENTS' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6">
            <TaxPrepDocumentVault
              customerName={customer.fullName || `${customer.firstName} ${customer.lastName}`}
            />
          </div>
        )}

        {activeTab === 'CALCULATOR' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6">
            <TaxPrepDraftCalculator
              initialDraft={currentLead.taxDraftSummary as any}
              customerMaritalStatus={customer.maritalStatus || 'Single'}
              taxYear={currentLead.taxYear}
              onSaveDraft={handleSaveDraft}
              onSendToSales={handleSendToSales}
              isSaving={isSaving}
            />
          </div>
        )}

        {activeTab === 'ORGANIZER' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6">
            <TaxPrepOrganizerReview
              customerName={customer.fullName || `${customer.firstName} ${customer.lastName}`}
              taxDraftSummary={currentLead.taxDraftSummary}
            />
          </div>
        )}
      </div>

      {/* 5. Call Outreach Modal for Logging Conversations */}
      <CallOutreachModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        lead={currentLead}
        onSaveDisposition={async (data) => {
          await handleSaveCallDisposition(data);
          await fetchLeadDetails();
          refreshData();
          setIsCallModalOpen(false);
        }}
      />
    </div>
  );
};
