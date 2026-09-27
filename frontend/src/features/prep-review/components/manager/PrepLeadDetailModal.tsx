import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Calculator, 
  FileText, 
  History,
  UserCheck,
  Eye,
  RefreshCw,
  Calendar
} from 'lucide-react';
import type { PrepReviewLead } from '../../types/prep-review.types';
import { PrepStageBadge } from '../common/PrepStageBadge';
import { PrepComplexityBadge } from '../common/PrepComplexityBadge';
import { ClientPaymentStatusChip } from '@/shared/components/ClientPaymentStatusChip';
import { PriorityBadge } from '@/shared/components/PriorityBadge';
import { LeadAuditTrailSection } from '@/features/documenter/components/LeadAuditTrailSection';
import { Button } from '@/shared/components/Button';
import apiClient from '@/lib/api-client';

interface PrepLeadDetailModalProps {
  lead: PrepReviewLead | null;
  isOpen: boolean;
  onClose: () => void;
  onAssign?: (lead: PrepReviewLead) => void;
}

export const PrepLeadDetailModal: React.FC<PrepLeadDetailModalProps> = ({
  lead,
  isOpen,
  onClose,
  onAssign,
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DOCUMENTS' | 'COMPUTATION' | 'AUDIT_TRAIL'>('OVERVIEW');
  const [selectedAppId, setSelectedAppId] = useState<string>(lead?.id || '');
  const [fullDetails, setFullDetails] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !lead?.id) {
      setFullDetails(null);
      setSelectedAppId('');
      return;
    }
    setSelectedAppId(lead.id);
  }, [isOpen, lead?.id]);

  useEffect(() => {
    if (!isOpen || !selectedAppId) {
      return;
    }

    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        const response: any = await apiClient.get(`/prep-review/workspace/${selectedAppId}`);
        const data = response?.data || response;
        if (data) {
          setFullDetails(data);
        }
      } catch (err) {
        console.error('Failed to load full lead workspace details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [isOpen, selectedAppId]);

  if (!isOpen || !lead) return null;

  const currentAppId = selectedAppId || lead.id;
  const customer = fullDetails?.customer || {};
  const documents: any[] = fullDetails?.documents || [];
  const draftSummary = fullDetails?.taxDraftSummary || {};
  const stageHistories = fullDetails?.stageHistories || [];
  const auditLogs = fullDetails?.auditLogs || [];
  const callLogs = fullDetails?.callLogs || [];
  const availableApplications: any[] = fullDetails?.availableApplications || (lead as any)?.availableApplications || (lead as any)?.allApplications || [];

  const taxpayerName = fullDetails?.taxpayer?.name || lead.taxpayerName || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Taxpayer Client';
  const taxpayerEmail = lead.taxpayerEmail || customer.email || 'N/A';
  const taxpayerPhone = lead.taxpayerPhone || customer.phone || 'N/A';
  const visaType = lead.visaType || customer.visaType || 'Standard';
  const stateOfResidence = lead.stateOfResidence || customer.state || 'N/A';
  const filingYear = fullDetails?.taxYear || lead.taxYear || 2025;

  const assignedPrepName = (fullDetails?.assignedPrepAgent ? `${fullDetails.assignedPrepAgent.firstName || ''} ${fullDetails.assignedPrepAgent.lastName || ''}`.trim() : '') || lead.assignedPreparer?.name || 'Unassigned';
  const assignedPrepEmail = fullDetails?.assignedPrepAgent?.email || lead.assignedPreparer?.email || 'Awaiting Allocation';

  const assignedReviewerName = (fullDetails?.assignedReviewAgent ? `${fullDetails.assignedReviewAgent.firstName || ''} ${fullDetails.assignedReviewAgent.lastName || ''}`.trim() : '') || lead.assignedReviewer?.name || 'Not Designated';
  const assignedReviewerEmail = fullDetails?.assignedReviewAgent?.email || lead.assignedReviewer?.email || 'Designated by Manager';

  const assignedDocName = (fullDetails?.assignedDocAgent ? `${fullDetails.assignedDocAgent.firstName || ''} ${fullDetails.assignedDocAgent.lastName || ''}`.trim() : '') || (lead as any)?.assignedDocumenter?.name || (lead as any)?.assignedDocAgent?.name || 'Documenter Staff';

  const activeAppLead: PrepReviewLead = {
    ...lead,
    id: currentAppId,
    taxYear: filingYear,
    currentStage: fullDetails?.currentStage || lead.currentStage,
    prepStage: fullDetails?.currentStage || lead.prepStage,
    priority: fullDetails?.priority || lead.priority,
    complexity: fullDetails?.complexity || lead.complexity || 'STANDARD',
    assignedPreparer: fullDetails?.assignedPrepAgent
      ? {
          id: fullDetails.assignedPrepAgent.id,
          name: `${fullDetails.assignedPrepAgent.firstName || ''} ${fullDetails.assignedPrepAgent.lastName || ''}`.trim() || fullDetails.assignedPrepAgent.email,
          email: fullDetails.assignedPrepAgent.email,
        }
      : lead.assignedPreparer,
    assignedReviewer: fullDetails?.assignedReviewAgent
      ? {
          id: fullDetails.assignedReviewAgent.id,
          name: `${fullDetails.assignedReviewAgent.firstName || ''} ${fullDetails.assignedReviewAgent.lastName || ''}`.trim() || fullDetails.assignedReviewAgent.email,
          email: fullDetails.assignedReviewAgent.email,
        }
      : lead.assignedReviewer,
  };

  const isAssigned = Boolean(fullDetails?.assignedPrepAgent?.id || lead.assignedPreparer?.id || activeAppLead.assignedPreparer?.id);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 font-sans animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 via-white to-slate-50">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/10">
              {taxpayerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  {taxpayerName}
                </h3>
                <ClientPaymentStatusChip lead={fullDetails || lead} scope="return" size="sm" />
                <PriorityBadge priority={fullDetails?.priority || lead.priority || 'NO_PRIORITY'} size="sm" />
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  TY {filingYear}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {visaType}
                </span>
                <PrepComplexityBadge complexity={fullDetails?.complexity || lead.complexity || 'STANDARD'} />
                <PrepStageBadge 
                  stage={fullDetails?.currentStage || lead.prepStage || lead.currentStage} 
                  assignedPreparerName={activeAppLead.assignedPreparer?.name}
                />
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{taxpayerEmail}</span>
                <span className="text-slate-300">•</span>
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{taxpayerPhone}</span>
                <span className="text-slate-300">•</span>
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{stateOfResidence}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            {!isAssigned && onAssign && (
              <Button
                size="sm"
                onClick={() => {
                  onClose();
                  onAssign(activeAppLead);
                }}
                className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Assign Staff</span>
              </Button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              title="Close Dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 1.2 Multi-Year Return Switcher Tabs */}
        {availableApplications && availableApplications.length > 0 && (
          <div className="px-5 sm:px-6 py-2.5 bg-slate-100/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tax Year Filings:</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {availableApplications.map((appItem: any) => {
                  const isSelected = appItem.id === currentAppId;
                  return (
                    <button
                      key={appItem.id}
                      type="button"
                      onClick={() => setSelectedAppId(appItem.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
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
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : appItem.currentStage === 'DOC_OUTREACH'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : appItem.currentStage === 'DOC_PREP' || appItem.currentStage === 'CORRECTION_NEEDED'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : appItem.currentStage?.startsWith('SALES')
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : appItem.currentStage?.startsWith('FILING')
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {appItem.currentStage?.replace(/_/g, ' ') || 'Intake'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="text-[11px] text-slate-500 font-medium">
              Viewing: <strong className="text-slate-800 font-bold">TY {filingYear} ({fullDetails?.filingType || (lead as any).filingType || 'INDIVIDUAL'})</strong>
            </div>
          </div>
        )}

        {/* 2. Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 sm:px-6 border-b border-slate-100 bg-slate-50/50 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('OVERVIEW')}
            className={`py-3 px-3.5 font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'OVERVIEW'
                ? 'border-[#16A34A] text-[#16A34A] bg-emerald-50/30'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile &amp; Allocation</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('DOCUMENTS')}
            className={`py-3 px-3.5 font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'DOCUMENTS'
                ? 'border-[#16A34A] text-[#16A34A] bg-emerald-50/30'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Client Documents ({documents.length || lead.verifiedDocumentsCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('COMPUTATION')}
            className={`py-3 px-3.5 font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'COMPUTATION'
                ? 'border-[#16A34A] text-[#16A34A] bg-emerald-50/30'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>1040 Calculation Summary</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('AUDIT_TRAIL')}
            className={`py-3 px-3.5 font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'AUDIT_TRAIL'
                ? 'border-[#16A34A] text-[#16A34A] bg-emerald-50/30'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail &amp; History ({stageHistories.length + auditLogs.length + callLogs.length})</span>
          </button>
        </div>

        {/* 3. Tab Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
              <p className="text-xs font-semibold">Loading taxpayer return file...</p>
            </div>
          ) : activeTab === 'OVERVIEW' ? (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Demographics & Contact Grid */}
              <div className="bg-slate-50/60 rounded-xl border border-slate-200 p-4 sm:p-5">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Taxpayer Master Demographics
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">Full Legal Name</span>
                    <span className="font-bold text-slate-800">{taxpayerName}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">Tax Filing Year</span>
                    <span className="font-bold text-slate-800">TY {filingYear}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">Visa Classification</span>
                    <span className="font-bold text-slate-800">{visaType}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">Marital Filing Status</span>
                    <span className="font-bold text-slate-800">{lead.maritalStatus || customer.maritalStatus || 'Single'}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">Occupation / Title</span>
                    <span className="font-bold text-slate-800">{customer.occupation || 'Professional'}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">Date of Birth</span>
                    <span className="font-bold text-slate-800">{customer.dob || 'On File'}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">Primary Phone</span>
                    <span className="font-bold text-slate-800">{taxpayerPhone}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">Email Address</span>
                    <span className="font-bold text-slate-800">{taxpayerEmail}</span>
                  </div>
                </div>
              </div>

              {/* Staff Assignments Matrix Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Operational Staff Allocation Matrix
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* Tax Preparer */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#16A34A] flex items-center justify-center shrink-0">
                      <Calculator className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Tax Preparer</span>
                      <span className="font-bold text-slate-900 block truncate">
                        {assignedPrepName}
                      </span>
                      <span className="text-[10px] text-slate-500 truncate block">
                        {assignedPrepEmail}
                      </span>
                    </div>
                  </div>

                  {/* QA Reviewer */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">QA Compliance Auditor</span>
                      <span className="font-bold text-slate-900 block truncate">
                        {assignedReviewerName}
                      </span>
                      <span className="text-[10px] text-slate-500 truncate block">
                        {assignedReviewerEmail}
                      </span>
                    </div>
                  </div>

                  {/* Documenter Agent */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Documenter / Intake Agent</span>
                      <span className="font-bold text-slate-900 block truncate">
                        {assignedDocName}
                      </span>
                      <span className="text-[10px] text-slate-500 truncate block">
                        Intake Verification Complete
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'DOCUMENTS' ? (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Taxpayer Uploaded Document Vault</h4>
                  <p className="text-xs text-slate-500">Verified wage statements, 1099s, and identification forms.</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {documents.length} File(s) in Vault
                </span>
              </div>

              {documents.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-400 space-y-2">
                  <FileText className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-medium">No document attachments uploaded for this tax year.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {documents.map((doc: any) => (
                    <div key={doc.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-xs flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#16A34A] border border-emerald-100 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 truncate">
                          <span className="font-bold text-slate-900 text-xs truncate block">{doc.fileName}</span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {doc.documentCategory || 'Tax Form'} • {doc.isVerified ? 'Verified ✓' : 'Pending Verification'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {doc.fileUrl && (
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
                            title="View Document"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'COMPUTATION' ? (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Form 1040 Calculation Summary</h4>
                  <p className="text-xs text-slate-500">Preliminary computation prepared by CPA and certified for Sales.</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  draftSummary?.status === 'QA_APPROVED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {draftSummary?.status ? draftSummary.status.replace(/_/g, ' ') : 'Under Preparation'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-400 font-medium block">Line 1a: Total W-2 Wages</span>
                  <span className="text-base font-bold text-slate-900 mt-1 block">
                    ${Number(draftSummary?.w2Wages || draftSummary?.wages || 0).toLocaleString()}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-400 font-medium block">Line 9: Total Gross Income</span>
                  <span className="text-base font-bold text-slate-900 mt-1 block">
                    ${Number(draftSummary?.grossIncome || draftSummary?.agi || 0).toLocaleString()}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-400 font-medium block">Line 12: Standard Deduction</span>
                  <span className="text-base font-bold text-slate-900 mt-1 block">
                    ${Number(draftSummary?.standardDeduction || 29200).toLocaleString()}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[11px] text-emerald-700 font-bold block">Estimated Federal Refund</span>
                  <span className="text-base font-extrabold text-[#16A34A] mt-1 block">
                    +${Number(draftSummary?.estimatedFedRefund || draftSummary?.federalRefund || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {draftSummary?.reviewerNotes && (
                <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 text-xs space-y-1">
                  <span className="font-bold text-purple-900 block">QA Compliance Auditor Sign-off Remarks:</span>
                  <p className="text-purple-800 leading-relaxed">{draftSummary.reviewerNotes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="animate-in fade-in duration-150">
              <LeadAuditTrailSection
                stageHistories={stageHistories}
                auditLogs={auditLogs}
                callLogs={callLogs}
                taxpayerName={taxpayerName}
                taxpayerEmail={customer.email || (lead as any).email}
                currentStage={lead.prepStage || lead.currentStage}
              />
            </div>
          )}
        </div>

        {/* 4. Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">
            Case ID: <span className="font-mono text-slate-700 font-semibold">{currentAppId}</span>
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
