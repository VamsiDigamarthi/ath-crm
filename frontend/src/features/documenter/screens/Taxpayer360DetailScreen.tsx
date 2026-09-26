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
  PhoneCall, 
  RefreshCw,
  FileCheck2,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Paperclip,
  Download,
  FileText,
  Calendar,
} from 'lucide-react';
import apiClient from '@/lib/api-client';
import { PriorityBadge } from '@/shared/components/PriorityBadge';
import { ClientPaymentStatusChip } from '@/shared/components/ClientPaymentStatusChip';
import { AppModal } from '@/shared/components/AppModal';
import { Button } from '@/shared/components/Button';
import { AppCopyButton } from '@/shared/components/AppCopyButton';
import { AppTabs } from '@/shared/components/AppTabs';
import { renderVisaBadge, renderStageBadge } from '../columns/documenter-columns';
import { TaxpayerCallHistoryTimeline } from '../components/TaxpayerCallHistoryTimeline';
import { TaxPrepDraftCalculator } from '../components/prep/TaxPrepDraftCalculator';
import type { TaxDraftComputation } from '../components/prep/TaxPrepDraftCalculator';
import { TaxPrepDocumentVault } from '../components/prep/TaxPrepDocumentVault';
import { TaxPrepOrganizerReview } from '../components/prep/TaxPrepOrganizerReview';
import { DualRoleSalesPitchTab } from '../components/prep/DualRoleSalesPitchTab';
import { LeadAuditTrailSection } from '../components/LeadAuditTrailSection';
import { CallOutreachModal } from '../components/CallOutreachModal';
import { SendEmailModal } from '@/shared/components/SendEmailModal';
import { useDocumenterWorkspace } from '../hooks/useDocumenterWorkspace';
import { documenterService } from '../services/documenter-service';
import type { DocumenterLeadItem, CallLogItem } from '../types/documenter.types';
import toast from 'react-hot-toast';

export const Taxpayer360DetailScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    isAdmin,
    isLoading: isWorkspaceLoading,
    refreshData,
    handleSaveCallDisposition,
  } = useDocumenterWorkspace();

  const [activeTab, setActiveTab] = useState<'TIMELINE' | 'DOCUMENTS' | 'CALCULATOR' | 'ORGANIZER' | 'SALES_PITCH'>('TIMELINE');
  const [lead, setLead] = useState<DocumenterLeadItem | null>(null);
  const [isLoadingLead, setIsLoadingLead] = useState<boolean>(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState<boolean>(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);
  const [isMoveToPrepModalOpen, setIsMoveToPrepModalOpen] = useState<boolean>(false);

  const [isMovingToPrep, setIsMovingToPrep] = useState<boolean>(false);
  const [prepTransferNotes, setPrepTransferNotes] = useState<string>('');
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

  const handleConfirmMoveToPrep = async () => {
    if (!id && !lead?.id) return;
    const targetAppId = lead?.id || id || '';
    if (!targetAppId) return;
    try {
      setIsMovingToPrep(true);
      await documenterService.moveToTaxPrep(targetAppId, prepTransferNotes.trim() || undefined);
      toast.success(`Taxpayer return successfully transferred to Tax Prep Manager Queue! 🧮✨`);
      setIsMoveToPrepModalOpen(false);
      setPrepTransferNotes('');
      await fetchLeadDetails();
      refreshData();
    } catch (err: any) {
      console.error('Failed to move lead to prep:', err);
      toast.error(err?.response?.data?.message || 'Failed to transfer to Tax Prep');
    } finally {
      setIsMovingToPrep(false);
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

  const handleOpenRevertDoc = async (doc: { id?: string; fileName: string; filePath?: string; fileUrl?: string }) => {
    if (doc.fileUrl && (doc.fileUrl.startsWith('http://') || doc.fileUrl.startsWith('https://'))) {
      window.open(doc.fileUrl, '_blank');
      return;
    }
    if (!doc.id) {
      toast.error('Document ID not available');
      return;
    }
    try {
      toast.loading(`Opening ${doc.fileName}...`, { id: 'doc-open' });
      const response: any = await apiClient.get(`/documenter/documents/${doc.id}/download`, {
        responseType: 'blob',
      });
      const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(doc.fileName);
      const isPdf = /\.pdf$/i.test(doc.fileName);
      const mimeType = isImage ? 'image/jpeg' : isPdf ? 'application/pdf' : 'application/octet-stream';
      const blob = new Blob([response], { type: mimeType });
      const fileUrl = URL.createObjectURL(blob);
      window.open(fileUrl, '_blank');
      toast.success('Document opened in new tab', { id: 'doc-open' });
    } catch {
      toast.error('Failed to open document', { id: 'doc-open' });
    }
  };

  const currentStage = (lead?.currentStage || currentLead.currentStage || 'DOC_OUTREACH') as string;
  const assignedPrepAgent = (lead as any)?.assignedPrepAgent || (currentLead as any)?.assignedPrepAgent;
  const lastRevert =
    (lead?.taxDraftSummary as any)?.revertsByTarget?.DOCUMENTER ||
    (currentLead?.taxDraftSummary as any)?.revertsByTarget?.DOCUMENTER ||
    ((lead?.taxDraftSummary as any)?.lastRevert?.targetDepartment === 'DOCUMENTER' ? (lead?.taxDraftSummary as any)?.lastRevert : null) ||
    ((currentLead?.taxDraftSummary as any)?.lastRevert?.targetDepartment === 'DOCUMENTER' ? (currentLead?.taxDraftSummary as any)?.lastRevert : null);
  const isRevertedToDocumenter = currentStage === 'DOC_OUTREACH' && Boolean(lastRevert && !lastRevert.resolved);
  const canMoveToPrep = currentStage === 'RAW_PROSPECT' || currentStage === 'DOC_OUTREACH';

  const hasAssignedPreparer = Boolean(assignedPrepAgent?.id || (lead as any)?.assignedPrepAgentId);
  const isRevertedFromPrep = lastRevert?.sourceDepartment === 'PREPARATION' || hasAssignedPreparer;
  const preparerDisplayName = assignedPrepAgent 
    ? `${assignedPrepAgent.firstName || ''} ${assignedPrepAgent.lastName || ''}`.trim() || assignedPrepAgent.email?.split('@')[0]
    : lastRevert?.revertedByName || 'Assigned Tax Preparer';

  const isDualRole = Boolean(
    lead?.isDualDocSalesRole ||
    currentLead.isDualDocSalesRole ||
    (lead?.taxDraftSummary as any)?.isDualDocSalesRole ||
    (currentLead.taxDraftSummary as any)?.isDualDocSalesRole
  );

  const availableApplications = (lead as any)?.availableApplications || (currentLead as any)?.availableApplications || [];

  const handleSwitchTaxYear = (targetAppId: string) => {
    if (targetAppId === (lead?.id || id)) return;
    navigate(`/documenter/agent/lead/${targetAppId}`);
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
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
                {customer.fullName || `${customer.firstName} ${customer.lastName}`}
              </h2>
              <ClientPaymentStatusChip lead={lead || currentLead} scope="return" size="sm" />
              <PriorityBadge priority={lead?.priority || currentLead.priority || 'NO_PRIORITY'} size="sm" />
              {isDualRole && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1 shadow-2xs">
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  Dual-Role (Doc + Sales)
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isAdmin && (
            <Button
              size="sm"
              disabled={!canMoveToPrep}
              onClick={() => {
                if (canMoveToPrep) {
                  setIsMoveToPrepModalOpen(true);
                }
              }}
              className={
                canMoveToPrep
                  ? "bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  : "bg-slate-100 text-slate-400 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-not-allowed opacity-75 shadow-none"
              }
              title={
                !canMoveToPrep
                  ? currentStage === 'DOC_PREP' || currentStage === 'CORRECTION_NEEDED'
                    ? hasAssignedPreparer ? `Return is actively with Tax Preparer ${preparerDisplayName}` : 'Return transferred to Tax Preparation department'
                    : currentStage === 'SALES_PITCH_QUEUE' || currentStage === 'SALES_PITCHING'
                    ? 'Return transferred to Sales department'
                    : currentStage.startsWith('FILING')
                    ? 'Return transferred to IRS Filing department'
                    : 'Not available in current stage'
                  : hasAssignedPreparer || isRevertedFromPrep
                  ? `Re-submit return directly to assigned Tax Preparer (${preparerDisplayName})`
                  : 'Transfer return to Tax Preparation Department'
              }
            >
              {canMoveToPrep ? (
                <FileCheck2 className="w-3.5 h-3.5 text-white" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
              )}
              <span>
                {canMoveToPrep
                  ? hasAssignedPreparer || isRevertedFromPrep
                    ? 'Resume Tax Preparation'
                    : 'Move to Tax Preparation'
                  : currentStage === 'DOC_PREP' || currentStage === 'CORRECTION_NEEDED'
                  ? hasAssignedPreparer ? 'Active with Preparer' : 'Transferred to Tax Prep'
                  : currentStage === 'SALES_PITCH_QUEUE' || currentStage === 'SALES_PITCHING'
                  ? 'In Sales Pitch Queue'
                  : currentStage.startsWith('FILING')
                  ? 'In IRS Filing'
                  : 'Moved to Preparation'}
              </span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEmailModalOpen(true)}
            className="border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="Compose and send official email to client"
          >
            <Mail className="w-3.5 h-3.5 text-blue-600" />
            <span>Email Client</span>
          </Button>

          {!isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCallModalOpen(true)}
              className="border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-[#16A34A] text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Log Outreach Call</span>
            </Button>
          )}

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

      {/* 1.2 Multi-Year Return Switcher Tabs */}
      {availableApplications && availableApplications.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-slate-100/90 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-slate-600">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Tax Year Filings:</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {availableApplications.map((appItem: any) => {
                const isSelected = appItem.id === (lead?.id || id);
                return (
                  <button
                    key={appItem.id}
                    type="button"
                    onClick={() => handleSwitchTaxYear(appItem.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs ${
                      isSelected
                        ? 'bg-slate-900 text-white ring-2 ring-slate-900/10 shadow-sm'
                        : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span>TY {appItem.taxYear}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                      isSelected ? 'bg-slate-800 text-emerald-400' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {appItem.filingType || 'INDIVIDUAL'}
                    </span>
                    <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : appItem.currentStage === 'DOC_OUTREACH'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : appItem.currentStage === 'DOC_PREP'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : appItem.currentStage?.startsWith('SALES')
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : appItem.currentStage?.startsWith('FILING')
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {appItem.currentStage?.replace(/_/g, ' ') || 'Outreach'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-medium px-2">
            Viewing: <strong className="text-slate-800 font-bold">TY {currentLead.taxYear} ({currentLead.filingType})</strong>
          </div>
        </div>
      )}

      {/* 1.5 Revert from Preparation / Sales Alert Banner */}
      {isRevertedToDocumenter && Boolean(lastRevert) && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-50/60 to-orange-50/40 border border-amber-300/90 text-amber-950 flex items-start gap-3 shadow-xs animate-in fade-in duration-200">
          <RotateCcw className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-xs sm:text-sm text-amber-950">
                Return Reverted from {lastRevert?.sourceDepartment || 'Tax Preparation'}:
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-200/90 text-amber-900 border border-amber-300">
                {lastRevert?.reasonCategory?.replace(/_/g, ' ') || 'Action Required'}
              </span>
              <span className="text-[11px] text-amber-700/80 font-medium">
                by {lastRevert?.revertedByName || 'Tax Preparer'}
              </span>
            </div>
            <p className="text-xs text-amber-900 font-semibold leading-relaxed">
              "{lastRevert?.revertNotes}"
            </p>
            {lastRevert?.missingDocumentTypes?.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800">
                  Missing Paperwork Requested:
                </span>
                {lastRevert?.missingDocumentTypes.map((docType: string) => (
                  <span
                    key={docType}
                    className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-white text-amber-900 border border-amber-300 shadow-2xs"
                  >
                    {docType}
                  </span>
                ))}
              </div>
            )}

            {/* Attached Documents from Reverting Department (Sales / Preparer) */}
            {(() => {
              const attachedDocs =
                lastRevert?.attachedDocuments ||
                (lead?.taxDraftSummary as any)?.revertsByTarget?.DOCUMENTER?.attachedDocuments ||
                (lead?.taxDraftSummary as any)?.revertsByTarget?.['SALES_TO_DOCUMENTER']?.attachedDocuments ||
                (lead?.taxDraftSummary as any)?.lastRevert?.attachedDocuments ||
                [];

              if (Array.isArray(attachedDocs) && attachedDocs.length > 0) {
                return (
                  <div className="p-3 bg-white/90 rounded-xl border border-amber-300/80 space-y-2 mt-2">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-950">
                      <span className="flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5 text-amber-700" />
                        <span>Attached Client Documents from {lastRevert?.sourceDepartment || 'Sales Closer'} ({attachedDocs.length}):</span>
                      </span>
                      <span className="text-[10px] font-semibold text-amber-800">
                        Uploaded for Documenter Intake
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {attachedDocs.map((doc: any, idx: number) => (
                        <div
                          key={doc.id || idx}
                          className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 shadow-2xs flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate text-[11px]" title={doc.fileName}>
                                {doc.fileName}
                              </p>
                              <span className="text-[9px] text-slate-500">
                                {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB • ` : ''}Attachment
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleOpenRevertDoc(doc)}
                            className="px-2.5 py-1 rounded bg-amber-200/80 hover:bg-amber-300 text-amber-950 font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors shrink-0 shadow-2xs"
                            title="View / Download Attached Document"
                          >
                            <Download className="w-3 h-3" />
                            <span>View</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        </div>
      )}

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
                <ClientPaymentStatusChip lead={lead || currentLead} scope="return" size="sm" />
                <PriorityBadge priority={lead?.priority || currentLead.priority || 'NO_PRIORITY'} size="sm" />
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  TY {currentLead.taxYear}
                </span>
                {renderStageBadge(currentLead.currentStage)}
                {isDualRole && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-indigo-600" />
                    Dual Doc + Sales
                  </span>
                )}
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
                {isDualRole ? 'Assigned Intake & Sales Agent' : 'Assigned Calling Agent'}
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
      <AppTabs
        tabs={[
          { id: 'TIMELINE', label: 'Call History & Outreach Timeline', count: callLogs.length },
          { id: 'DOCUMENTS', label: 'Client Documents Vault', count: (lead?.documents || currentLead.documents || []).length },
          { id: 'CALCULATOR', label: 'Tax Draft Worksheet' },
          { id: 'ORGANIZER', label: 'Tax Organizer' },
          ...(isDualRole ? [{ id: 'SALES_PITCH', label: 'Sales Pitch & Pricing' }] : []),
        ]}
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId as any)}
      />

      {/* 4. Tab Content Panels */}
      <div>
        {activeTab === 'TIMELINE' && (
          <TaxpayerCallHistoryTimeline
            callLogs={callLogs}
            taxpayerName={customer.fullName || `${customer.firstName} ${customer.lastName}`}
            onOpenCallModal={() => setIsCallModalOpen(true)}
            onOpenEmailModal={() => setIsEmailModalOpen(true)}
          />
        )}

        {activeTab === 'DOCUMENTS' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6">
            <TaxPrepDocumentVault
              leadId={currentLead.id}
              applicationId={currentLead.id}
              customerName={customer.fullName || `${customer.firstName} ${customer.lastName}`}
              customerEmail={customer.email || (currentLead.taxpayerEmail as string) || undefined}
              documents={(lead?.documents || currentLead.documents || []) as any}
              onDocumentVerified={fetchLeadDetails}
              onDocumentUploaded={fetchLeadDetails}
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
              leadId={currentLead.id}
              customerName={customer.fullName || `${customer.firstName} ${customer.lastName}`}
              taxDraftSummary={currentLead.taxDraftSummary}
              onOrganizerSaved={fetchLeadDetails}
            />
          </div>
        )}

        {activeTab === 'SALES_PITCH' && isDualRole && (
          <DualRoleSalesPitchTab
            lead={lead || currentLead}
            customer={customer}
            onRefresh={() => {
              refreshData();
              fetchLeadDetails();
            }}
            onSwitchToWorksheet={() => setActiveTab('CALCULATOR')}
          />
        )}
      </div>

      {/* 5. Persistent Bottom Lead Audit & Lifecycle Activity Section (Always Visible) */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <LeadAuditTrailSection
          stageHistories={lead?.stageHistories || lead?.stageHistory || []}
          auditLogs={lead?.auditLogs || []}
          callLogs={callLogs}
          leadId={currentLead.id}
          taxpayerName={customer.fullName || `${customer.firstName} ${customer.lastName}`}
          taxpayerEmail={(customer.email || currentLead.customer?.email) ?? undefined}
          currentStage={currentLead.currentStage}
        />
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

      {/* 6. Move / Resume Tax Preparation Confirmation Modal */}
      {isMoveToPrepModalOpen && (
        <AppModal
          isOpen={isMoveToPrepModalOpen}
          onClose={() => setIsMoveToPrepModalOpen(false)}
          title={
            hasAssignedPreparer || isRevertedFromPrep
              ? `Resume Tax Preparation: ${customer.fullName || `${customer.firstName} ${customer.lastName}`}`
              : `Move to Tax Preparation: ${customer.fullName || `${customer.firstName} ${customer.lastName}`}`
          }
          width="520px"
        >
          <div className="space-y-4 font-sans py-1">
            {hasAssignedPreparer || isRevertedFromPrep ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
                <div className="font-bold text-sm text-emerald-950 flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-[#16A34A]" />
                  <span>Re-submit Return to Assigned Preparer: {preparerDisplayName}</span>
                </div>
                <p className="leading-relaxed text-emerald-800">
                  You are re-submitting <strong>{customer.fullName || `${customer.firstName} ${customer.lastName}`} (TY {currentLead.taxYear})</strong> directly to <strong>{preparerDisplayName}</strong>. This return will immediately reactivate in their 1040 Drafting Workbench without needing Preparation Manager re-allocation.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
                <div className="font-bold text-sm text-emerald-950 flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-[#16A34A]" />
                  <span>Ready for Tax Preparation &amp; 1040 Drafting?</span>
                </div>
                <p className="leading-relaxed text-emerald-800">
                  You are transferring <strong>{customer.fullName || `${customer.firstName} ${customer.lastName}`} (TY {currentLead.taxYear})</strong> to the <strong>Tax Preparation Department</strong>.
                </p>
              </div>
            )}

            {/* Checklist items */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2.5">
              <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                Intake Readiness Checklist:
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span>Client Documents in Vault:</span>
                <span className="font-bold text-[#16A34A]">{(lead?.documents || currentLead.documents || []).length} Document(s) Uploaded ✓</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span>Taxpayer Visa &amp; Residency:</span>
                <span className="font-bold text-[#16A34A]">{customer.visaType || 'Verified'} ✓</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span>Organizer Verified Status:</span>
                <span className="font-bold text-[#16A34A]">{(currentLead.taxDraftSummary as any)?.organizerVerifiedCount || 1} / 9 Modules Verified ✓</span>
              </div>
            </div>

            {/* Handover remarks */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {hasAssignedPreparer || isRevertedFromPrep
                  ? `Handover / Verification Notes for ${preparerDisplayName} (Optional)`
                  : `Handover Notes for Preparation Manager (Optional)`}
              </label>
              <textarea
                rows={2}
                placeholder={
                  hasAssignedPreparer || isRevertedFromPrep
                    ? 'e.g. Uploaded missing W-2 and confirmed spouse residency status with client...'
                    : 'e.g. Taxpayer has W-2 and 1099-B stock trades, please check state deductions...'
                }
                value={prepTransferNotes}
                onChange={(e) => setPrepTransferNotes(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A] outline-none transition-all resize-none text-slate-800 placeholder-slate-400 bg-white"
              />
            </div>

            {/* Notification notice */}
            {hasAssignedPreparer || isRevertedFromPrep ? (
              <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200/80 text-[11px] text-emerald-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
                <span>Tax Preparer <strong>{preparerDisplayName}</strong> will be directly notified to resume drafting Form 1040.</span>
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-200/80 text-[11px] text-indigo-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>All active Preparation Managers will be notified instantly to allocate a Tax Preparer.</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsMoveToPrepModalOpen(false)}
                className="border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isMovingToPrep}
                onClick={handleConfirmMoveToPrep}
                className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold px-4 cursor-pointer shadow-2xs flex items-center gap-1.5"
              >
                <FileCheck2 className={`w-3.5 h-3.5 ${isMovingToPrep ? 'animate-spin' : ''}`} />
                <span>
                  {isMovingToPrep
                    ? 'Submitting...'
                    : hasAssignedPreparer || isRevertedFromPrep
                    ? 'Confirm & Resume Preparation'
                    : 'Confirm & Send to Prep Queue'}
                </span>
              </Button>
            </div>
          </div>
        </AppModal>
      )}

      {/* 6. Send Email to Client Modal */}
      <SendEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        applicationId={currentLead.id}
        recipientEmail={customer.email || undefined}
        recipientName={customer.fullName || `${customer.firstName} ${customer.lastName}`}
        taxYear={currentLead.taxYear}
        visaType={customer.visaType || undefined}
        filingStatus={currentLead.currentStage}
        onSuccess={() => {
          fetchLeadDetails();
          refreshData();
        }}
      />
    </div>
  );
};

