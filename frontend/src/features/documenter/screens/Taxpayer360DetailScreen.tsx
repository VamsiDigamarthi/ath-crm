import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileCheck2,
  CheckCircle2,
  RotateCcw,
  Paperclip,
  Download,
  FileText,
} from 'lucide-react';
import apiClient from '@/lib/api-client';
import { PriorityBadge } from '@/shared/components/PriorityBadge';
import { ClientPaymentStatusChip } from '@/shared/components/ClientPaymentStatusChip';
import { AppModal } from '@/shared/components/AppModal';
import { AppSelect } from '@/shared/components/AppSelect';
import { Pencil } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppCopyButton } from '@/shared/components/AppCopyButton';
import { renderStageBadge } from '../columns/documenter-columns';
import { TaxpayerCallHistoryTimeline } from '../components/TaxpayerCallHistoryTimeline';
import { TaxPrepOrganizerReview } from '../components/prep/TaxPrepOrganizerReview';
import { DualRoleSalesPitchTab } from '../components/prep/DualRoleSalesPitchTab';
import { CallOutreachModal } from '../components/CallOutreachModal';
import { SendEmailModal } from '@/shared/components/SendEmailModal';
import { useDocumenterWorkspace } from '../hooks/useDocumenterWorkspace';
import { documenterService } from '../services/documenter-service';
import type { DocumenterLeadItem, CallLogItem } from '../types/documenter.types';
import toast from 'react-hot-toast';
import { useChangeTaxYear } from '../hooks/useChangeTaxYear';
import { TaxApplicationNotesAndAuditTab } from '@/shared/components/workflow/TaxApplicationNotesAndAuditTab';
import { StaffTaxApplicationStageStepper } from '@/shared/components/workflow/StaffTaxApplicationStageStepper';
import { useMyEditAccess } from '@/features/edit-access/hooks/useMyEditAccess';
import { RequestEditAccessButton } from '@/features/edit-access/components/RequestEditAccessButton';

export const Taxpayer360DetailScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    isAdmin,
    isAgent,
    agents,
    refreshData,
    handleSaveCallDisposition,
  } = useDocumenterWorkspace();

  const queryParams = new URLSearchParams(location.search);
  const initialTabParam = queryParams.get('tab')?.toUpperCase();
  const initialTab = (initialTabParam === 'ORGANIZER' || initialTabParam === 'SALES_PITCH' || initialTabParam === 'TIMELINE')
    ? (initialTabParam as 'TIMELINE' | 'ORGANIZER' | 'SALES_PITCH')
    : 'ORGANIZER';

  const [activeTab, setActiveTab] = useState<'TIMELINE' | 'CALCULATOR' | 'ORGANIZER' | 'SALES_PITCH'>(initialTab);
  const [lead, setLead] = useState<DocumenterLeadItem | null>(null);
  const [isLoadingLead, setIsLoadingLead] = useState<boolean>(true);
  const [isCallModalOpen, setIsCallModalOpen] = useState<boolean>(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);
  const [isMoveToPrepModalOpen, setIsMoveToPrepModalOpen] = useState<boolean>(false);

  const [isMovingToPrep, setIsMovingToPrep] = useState<boolean>(false);
  const [prepTransferNotes, setPrepTransferNotes] = useState<string>('');

  // Fetch full 360 lead details including all historical call logs
  const fetchLeadDetails = async () => {
    if (!id) return;
    try {
      setIsLoadingLead(true);
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

  useEffect(() => {
    const tabParam = new URLSearchParams(location.search).get('tab')?.toUpperCase();
    if (tabParam === 'ORGANIZER' || tabParam === 'SALES_PITCH' || tabParam === 'TIMELINE') {
      setActiveTab(tabParam as any);
    }
  }, [location.search]);

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
  const isTransferredToPrep = currentStage !== 'RAW_PROSPECT' && currentStage !== 'DOC_OUTREACH';
  const isSubmittedLock = isTransferredToPrep && !isRevertedToDocumenter;
  const editAccess = useMyEditAccess(lead?.id, isSubmittedLock && !isAdmin);
  const isReadOnly = isSubmittedLock && !editAccess.hasAccess;

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
  const callingYears = availableApplications.filter(
    (a: any) => ['RAW_PROSPECT', 'DOC_OUTREACH'].includes(a.currentStage) || a.id === (lead?.id || id)
  );

  const canEditTaxYear =
    !isReadOnly && ['RAW_PROSPECT', 'DOC_OUTREACH'].includes(currentLead.currentStage) && Boolean(lead?.id);
  const taxYearEditor = useChangeTaxYear(lead?.id, currentLead.taxYear, availableApplications, async () => {
    await fetchLeadDetails();
    refreshData();
  });

  const handleSwitchTaxYear = (targetAppId: string) => {
    if (targetAppId === (lead?.id || id)) return;
    navigate(`/documenter/agent/lead/${targetAppId}${location.search || ''}`, { state: location.state });
  };

  if (isLoadingLead && !lead) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[360px] text-slate-500 font-sans">
        <div className="w-7 h-7 border-2 border-[#16A34A] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-medium text-slate-600">Loading taxpayer profile and filing data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12 font-sans animate-in fade-in duration-150">
      {/* 1. Back Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              const fromQuery = new URLSearchParams(location.search).get('from') || (location.state as any)?.from;
              if (fromQuery === 'documents' || fromQuery === 'agent_documents') {
                navigate(`/documenter/agent/documents/${currentLead.id}?from=documents`);
              } else if (fromQuery === 'queue' || fromQuery === 'agent_queue') {
                navigate(`/documenter/agent/documents/${currentLead.id}?from=queue`);
              } else if (fromQuery === 'callbacks' || fromQuery === 'agent_callbacks') {
                navigate(`/documenter/agent/documents/${currentLead.id}?from=callbacks`);
              } else if (fromQuery === 'fallback' || fromQuery === 'agent_fallback') {
                navigate(`/documenter/agent/documents/${currentLead.id}?from=fallback`);
              } else if (fromQuery === 'caseload') {
                navigate(`/documenter/agent/documents/${currentLead.id}?from=caseload`);
              } else {
                navigate(-1);
              }
            }}
            className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>{new URLSearchParams(location.search).get('from') === 'queue' || (location.state as any)?.from === 'agent_queue' ? 'Calling Workspace' : 'My Documents'}</span>
            <span className="text-slate-300">/</span>
            <button
              onClick={() => {
                const fromQuery = new URLSearchParams(location.search).get('from') || (location.state as any)?.from;
                navigate(`/documenter/agent/documents/${currentLead.id}?from=${fromQuery || 'documents'}`);
              }}
              className="hover:text-slate-800 transition-colors cursor-pointer"
            >
              Tax years
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-medium">Taxpayer Profile</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isAdmin && isSubmittedLock && Boolean(lead?.id) && (
            <RequestEditAccessButton
              hasAccess={editAccess.hasAccess}
              accessUntil={editAccess.accessUntil}
              isPending={editAccess.isPending}
              isModalOpen={editAccess.isModalOpen}
              onOpen={editAccess.openModal}
              onClose={editAccess.closeModal}
              reason={editAccess.reason}
              onReasonChange={editAccess.setReason}
              reasonError={editAccess.reasonError}
              isSubmitting={editAccess.isSubmitting}
              onSubmit={editAccess.submitRequest}
            />
          )}
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
                  ? "bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  : "bg-slate-100 text-slate-500 border border-slate-200 text-xs font-medium flex items-center gap-1.5 cursor-not-allowed shadow-none"
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
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
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

        </div>
      </div>

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

      {/* 1.8 Staff 5-Department Workflow Stage Stepper */}
      <StaffTaxApplicationStageStepper
        currentStage={currentLead.currentStage}
        taxDraftSummary={lead?.taxDraftSummary || (currentLead as any)?.taxDraftSummary}
        assignedDocAgent={(lead as any)?.assignedDocAgent || (currentLead as any)?.assignedDocAgent}
        assignedPrepAgent={(lead as any)?.assignedPrepAgent || (currentLead as any)?.assignedPrepAgent}
        assignedReviewAgent={(lead as any)?.assignedReviewAgent}
        assignedSalesAgent={(lead as any)?.assignedSalesAgent || (currentLead as any)?.assignedSalesAgent}
        assignedFileOp={(lead as any)?.assignedFileOp}
      />

      {/* 2. Profile Card */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {customer.fullName || `${customer.firstName} ${customer.lastName}`}
              </h2>
              <ClientPaymentStatusChip lead={lead || currentLead} scope="return" size="sm" />
              <PriorityBadge priority={lead?.priority || currentLead.priority || 'NO_PRIORITY'} size="sm" />
              {renderStageBadge(currentLead.currentStage)}
              {isDualRole && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                  Doc + Sales
                </span>
              )}

              {/* Tax Year Badge / Switcher at top */}
              <div className="flex items-center gap-1.5 ml-1">
                <span className="text-xs text-slate-500 font-medium">Tax year</span>
                {callingYears.length > 0 ? (
                  callingYears.map((appItem: any) => {
                    const isSelected = appItem.id === (lead?.id || id);
                    return (
                      <button
                        key={appItem.id}
                        type="button"
                        onClick={() => handleSwitchTaxYear(appItem.id)}
                        className={`px-2.5 py-0.5 rounded-full text-xs border transition-colors cursor-pointer ${
                          isSelected
                            ? 'border-[#16A34A] bg-emerald-50 text-[#15803D] font-semibold'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                        title={appItem.currentStage?.replace(/_/g, ' ')}
                      >
                        TY {appItem.taxYear}
                        <span className="text-slate-400 font-normal"> · {(appItem.filingType || 'INDIVIDUAL').toLowerCase()}</span>
                      </button>
                    );
                  })
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs border border-[#16A34A] bg-emerald-50 text-[#15803D] font-semibold">
                    TY {currentLead.taxYear}
                    <span className="text-slate-400 font-normal"> · {(currentLead.filingType || 'INDIVIDUAL').toLowerCase()}</span>
                  </span>
                )}
                {canEditTaxYear && (
                  <button
                    type="button"
                    onClick={taxYearEditor.open}
                    className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                    title="Change tax year"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            {Boolean([customer.occupation, customer.dob ? `DOB ${customer.dob}` : null, customer.visaType].filter(Boolean).length) && (
              <p className="text-xs text-slate-500 mt-1">
                {[customer.occupation, customer.dob ? `DOB ${customer.dob}` : null, customer.visaType]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            )}
          </div>

          <div className="text-sm lg:text-right shrink-0">
            <div className="text-xs text-slate-500">{isDualRole ? 'Intake & sales agent' : 'Calling agent'}</div>
            <div className="font-medium text-slate-900 mt-0.5">
              {currentLead.assignedDocAgent?.email?.split('@')[0] || 'Unassigned'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-slate-100 divide-y sm:divide-y-0 lg:divide-x divide-slate-100">
          {[
            { label: 'Phone', value: customer.phone, copy: customer.phone },
            { label: 'Email', value: customer.email || '—', copy: customer.email },
            {
              label: 'Location',
              value: [customer.city, customer.state, customer.zipCode].filter(Boolean).join(', ') || '—',
              copy: null,
            },
            { label: 'SSN / ITIN', value: customer.ssnTin || '—', copy: customer.ssnTin },
          ].map((item) => (
            <div key={item.label} className="px-4 py-2.5 sm:px-5 flex items-center justify-between gap-2 min-w-0">
              <div className="min-w-0">
                <div className="text-xs text-slate-500">{item.label}</div>
                <div className="text-sm font-medium text-slate-900 truncate" title={item.value || undefined}>
                  {item.value}
                </div>
              </div>
              {item.copy && <AppCopyButton text={item.copy} size="sm" />}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Tax Info, Call History & Sales Pitch */}
      <TaxPrepOrganizerReview
        key={currentLead.id}
        leadId={currentLead.id}
        customerName={customer.fullName || `${customer.firstName} ${customer.lastName}`}
        taxDraftSummary={currentLead.taxDraftSummary}
        taxYear={currentLead.taxYear}
        filingType={currentLead.filingType || (currentLead.taxDraftSummary as any)?.filingType}
        onOrganizerSaved={fetchLeadDetails}
        allowEdit={!isReadOnly}
        readOnly={isReadOnly}
        requestedTabId={activeTab === 'TIMELINE' ? 'CALL_HISTORY' : activeTab === 'SALES_PITCH' ? 'SALES_PITCH' : 'MODULES'}
        onTabChange={(tabId) => {
          if (tabId === 'NOTES') return;
          setActiveTab(tabId === 'CALL_HISTORY' ? 'TIMELINE' : tabId === 'SALES_PITCH' ? 'SALES_PITCH' : 'ORGANIZER');
        }}
        extraTabs={[
          {
            id: 'NOTES',
            label: 'Notes & Audit',
            content: (
              <TaxApplicationNotesAndAuditTab
                applicationId={currentLead.id}
                taxYear={currentLead.taxYear}
                customerName={customer.fullName || `${customer.firstName} ${customer.lastName}`}
                customerEmail={customer.email || undefined}
                currentStage={currentLead.currentStage}
              />
            ),
          },
          {
            id: 'CALL_HISTORY',
            label: 'Call History',
            count: callLogs.length,
            content: (
              <TaxpayerCallHistoryTimeline
                callLogs={callLogs}
                taxpayerName={customer.fullName || `${customer.firstName} ${customer.lastName}`}
                onOpenCallModal={() => setIsCallModalOpen(true)}
                onOpenEmailModal={() => setIsEmailModalOpen(true)}
                readOnly={isReadOnly}
              />
            ),
          },
          ...(isDualRole
            ? [
                {
                  id: 'SALES_PITCH',
                  label: 'Sales Pitch & Pricing',
                  content: (
                    <DualRoleSalesPitchTab
                      lead={lead || currentLead}
                      customer={customer}
                      onRefresh={() => {
                        refreshData();
                        fetchLeadDetails();
                      }}
                      onSwitchToWorksheet={() => setActiveTab('ORGANIZER')}
                    />
                  ),
                },
              ]
            : []),
        ]}
      />

      {/* Change Tax Year */}
      <AppModal
        isOpen={taxYearEditor.isOpen}
        onClose={taxYearEditor.close}
        title="Change tax year"
        description={`Currently TY ${currentLead.taxYear}. Years that already have a return can't be selected.`}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={taxYearEditor.close} disabled={taxYearEditor.isSaving}>
              Cancel
            </Button>
            <Button
              onClick={taxYearEditor.save}
              disabled={taxYearEditor.isSaving || !taxYearEditor.selectedYear}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold"
            >
              {taxYearEditor.isSaving ? 'Saving...' : 'Save'}
            </Button>
          </>
        }
      >
        <AppSelect
          label="Tax year"
          options={taxYearEditor.yearOptions}
          value={taxYearEditor.selectedYear}
          onChange={taxYearEditor.setSelectedYear}
          placeholder="Select tax year"
        />
      </AppModal>

      {/* 6. Call Outreach Modal for Logging Conversations */}
      <CallOutreachModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        lead={currentLead}
        agents={agents}
        isManager={isAdmin || !isAgent}
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
              ? `Resume Tax Preparation`
              : `Move to Tax Preparation`
          }
          description={
            hasAssignedPreparer || isRevertedFromPrep
              ? `Re-submitting ${customer.fullName || `${customer.firstName} ${customer.lastName}`} (TY ${currentLead.taxYear}) directly to ${preparerDisplayName}.`
              : `Transferring ${customer.fullName || `${customer.firstName} ${customer.lastName}`} (TY ${currentLead.taxYear}) to the Tax Preparation Department.`
          }
          width="500px"
        >
          <div className="space-y-4 font-sans py-1">
            {/* Checklist items */}
            <div className="p-3 rounded-md bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="font-semibold text-slate-800 text-xs">
                Intake Readiness Checklist
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Client Documents in Vault:</span>
                <span className="font-semibold text-[#16A34A]">{(lead?.documents || currentLead.documents || []).length} Document(s) Uploaded</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Taxpayer Visa &amp; Residency:</span>
                <span className="font-semibold text-[#16A34A]">{customer.visaType || 'Verified'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Organizer Verified Status:</span>
                <span className="font-semibold text-[#16A34A]">{(currentLead.taxDraftSummary as any)?.organizerVerifiedCount || 1} / 9 Modules Verified</span>
              </div>
            </div>

            {/* Handover remarks */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {hasAssignedPreparer || isRevertedFromPrep
                  ? `Hand-off note for ${preparerDisplayName}`
                  : `Hand-off note for the preparer`}{' '}
                <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder={
                  hasAssignedPreparer || isRevertedFromPrep
                    ? 'e.g. Uploaded missing W-2 and confirmed spouse residency status with client...'
                    : 'e.g. Taxpayer has W-2 and 1099-B stock trades, please check state deductions...'
                }
                value={prepTransferNotes}
                onChange={(e) => setPrepTransferNotes(e.target.value)}
                className="w-full text-sm p-2.5 rounded-md border border-slate-300 focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A] outline-none transition-colors resize-none text-slate-800 placeholder:text-slate-400 bg-white"
              />
            </div>

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
                disabled={isMovingToPrep || !prepTransferNotes.trim()}
                onClick={handleConfirmMoveToPrep}
                className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold px-4 cursor-pointer flex items-center gap-1.5"
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

