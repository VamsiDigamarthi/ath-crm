import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RefreshCw,
  FileText,
  Code2,
  Layers,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { FilingComplianceGate } from '../components/workspace/FilingComplianceGate';
import { FilingTaxpayerInspectionCard } from '../components/workspace/FilingTaxpayerInspectionCard';
import { MeFXMLViewer } from '../components/workspace/MeFXMLViewer';
import { FilingTransmissionStatusCard } from '../components/workspace/FilingTransmissionStatusCard';
import { LeadAuditTrailSection } from '@/features/documenter/components/LeadAuditTrailSection';
import { SendBackLeadModal } from '@/shared/components/workflow/SendBackLeadModal';
import { useFilingWorkspace } from '../hooks/useFilingWorkspace';

export type WorkspaceViewMode = 'AUDIT_FILE' | 'XML_SCHEMA' | 'FULL_INSPECTION';

export const FilingTransmissionWorkspaceScreen: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<WorkspaceViewMode>('FULL_INSPECTION');
  const [isSendBackOpen, setIsSendBackOpen] = useState<boolean>(false);

  const {
    isLoading,
    isTransmitting,
    lead,
    xmlData,
    fetchWorkspaceData,
    handleTransmit,
  } = useFilingWorkspace();

  if (isLoading || !lead) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-16 flex flex-col items-center justify-center gap-3 font-sans">
        <div className="w-9 h-9 rounded-full border-3 border-[#16A34A] border-t-transparent animate-spin" />
        <span className="text-xs font-bold text-slate-700">Loading IRS MeF Transmission Engine...</span>
        <span className="text-[11px] text-slate-400 font-medium">Validating EFIN 582910 credentials and Form 1040 XML schema</span>
      </div>
    );
  }

  const isAccepted = lead.currentStage === 'FILING_SUCCESS';
  const isDispatchedToFiling =
    lead.currentStage === 'FILING_QUEUE' ||
    lead.currentStage === 'FILING_IN_PROGRESS' ||
    isAccepted;

  const lastRevert =
    (lead as any).taxDraftSummary?.revertsByTarget?.['FILING_TO_SALES'] ||
    (lead as any).taxDraftSummary?.revertsByTarget?.['FILING_TO_PREPARATION'] ||
    (lead as any).taxDraftSummary?.revertsByTarget?.['FILING_TO_DOCUMENTER'] ||
    (lead.lastRevert?.sourceDepartment === 'FILING' ? lead.lastRevert : null) ||
    ((lead as any).taxDraftSummary?.lastRevert?.sourceDepartment === 'FILING' ? (lead as any).taxDraftSummary?.lastRevert : null) ||
    lead.lastRevert ||
    (lead as any).taxDraftSummary?.lastRevert ||
    (lead.taxReturnSummary as any)?.lastRevert;

  // Return is in revision ONLY when it has actively been moved back to a preceding department
  const isReverted = !isDispatchedToFiling && Boolean(
    (lastRevert && !lastRevert.resolved) ||
    ['CORRECTION_NEEDED', 'DOC_OUTREACH', 'DOC_PREP', 'SALES_PITCH_QUEUE', 'SALES_PITCHING'].includes(lead.currentStage)
  );

  const targetDeptLabel = lastRevert?.targetDepartment === 'SALES'
    ? 'Sales Closer'
    : lastRevert?.targetDepartment === 'DOCUMENTER'
      ? 'Documenter'
      : 'Tax Preparer';

  return (
    <div className="w-full space-y-6 font-sans">
      {/* 1. Header with Breadcrumb & Return Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="border-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Queue</span>
          </Button>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {lead.taxpayerName}
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${isAccepted
                  ? 'bg-emerald-100 text-emerald-800'
                  : isReverted
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                {isAccepted
                  ? '✓ IRS E-File Accepted'
                  : isReverted
                    ? `🔄 In Revision with ${targetDeptLabel}`
                    : 'Ready for Transmission'}
              </span>
              {Boolean(lastRevert) && !isAccepted && !isReverted && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                  <span>Resubmitted after Correction (Priority Review)</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              TY{lead.taxYear} Form 1040 • {lead.stateOfResidence} State Return • SSN: {lead.ssnMasked}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Inspection View Mode Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('FULL_INSPECTION')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${viewMode === 'FULL_INSPECTION'
                  ? 'bg-white text-[#16A34A] shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
                }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Full Inspection</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('AUDIT_FILE')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${viewMode === 'AUDIT_FILE'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
                }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Taxpayer 1040 File</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('XML_SCHEMA')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${viewMode === 'XML_SCHEMA'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
                }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>IRS XML Schema</span>
            </button>
          </div>

          {/* Send Back Lead Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => !isAccepted && !isReverted && setIsSendBackOpen(true)}
            disabled={isAccepted || isReverted}
            className={`text-xs font-bold flex items-center gap-1.5 shadow-2xs h-8 px-3 transition-all ${isAccepted || isReverted
                ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-75 shadow-none'
                : 'border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 cursor-pointer'
              }`}
            title={
              isAccepted
                ? 'Return has already been transmitted and accepted by the IRS (0000_ACCEPTED). Cannot be reverted.'
                : isReverted
                  ? `Return is already reverted and currently in revision with ${targetDeptLabel}.`
                  : 'Send return back to Sales, Tax Preparation, or Documenter Department'
            }
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isAccepted || isReverted ? 'text-slate-400' : 'text-amber-600'}`} />
            <span>{isReverted ? 'Already Reverted' : 'Send Back Lead'}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchWorkspaceData}
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* 1.1 Revert from Filing Alert Banner */}
      {isReverted && lastRevert && (
        <div className="bg-amber-50/70 border border-amber-300/80 rounded-xl p-3.5 sm:p-4 text-amber-950 shadow-2xs animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200 mt-0.5">
              <RotateCcw className="w-4 h-4 text-amber-700" />
            </div>
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 font-bold text-xs sm:text-sm text-amber-950">
                  <span>Return Reverted to {lastRevert.targetDepartment === 'SALES' ? 'Sales Department' : lastRevert.targetDepartment === 'DOCUMENTER' ? 'Documenter Intake' : 'Tax Preparation (CPA)'}:</span>
                  {lastRevert.reasonCategory && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-200/90 text-amber-950 text-[10px] font-bold border border-amber-300">
                      {lastRevert.reasonCategory.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-amber-800 font-medium flex items-center gap-1.5">
                  {lastRevert.revertedByName && (
                    <span>By <strong>{lastRevert.revertedByName}</strong> ({lastRevert.revertedByRole || 'Filing Specialist'})</span>
                  )}
                  {lastRevert.revertedAt && (
                    <span>• {new Date(lastRevert.revertedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                  )}
                </div>
              </div>

              {/* Specialist's Note Box */}
              <div className="bg-white/95 p-3 rounded-lg border border-amber-200 shadow-2xs space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  Filing Specialist Revert Instructions &amp; Notes:
                </div>
                <p className="text-xs font-semibold text-slate-900 leading-relaxed">
                  "{lastRevert.revertNotes || 'Return transferred to preceding department for clarification or corrections.'}"
                </p>
                {lastRevert.missingDocumentTypes && lastRevert.missingDocumentTypes.length > 0 && (
                  <div className="pt-1.5 flex flex-wrap items-center gap-1.5 border-t border-amber-100">
                    <span className="text-[10px] font-bold text-amber-900">Requested Items:</span>
                    {lastRevert.missingDocumentTypes.map((doc: string, idx: number) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px] border border-rose-200">
                        {doc}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Information */}
              <div className="pt-0.5 text-[11px] text-amber-800 font-medium flex items-center gap-1.5">
                <span>🔒 <strong>Filing Locked:</strong> IRS Gateway transmission and further send-backs are disabled while this return is in revision with <strong>{targetDeptLabel}</strong>. Once addressed and re-dispatched, it will reappear ready for transmission.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Compliance Gate (Payment + Form 8879 PIN + Audit Certification) */}
      <FilingComplianceGate lead={lead} />

      {/* 3. Official Transmission Control & Live Status Card */}
      <FilingTransmissionStatusCard
        lead={lead}
        onTransmit={handleTransmit}
        isTransmitting={isTransmitting}
      />

      {/* 4. Taxpayer Profile, 1040 Figures, Bank Direct Deposit & Verified Documents Card */}
      {(viewMode === 'FULL_INSPECTION' || viewMode === 'AUDIT_FILE') && (
        <FilingTaxpayerInspectionCard lead={lead} />
      )}

      {/* 5. Generated IRS MeF XML Schema Inspector */}
      {(viewMode === 'FULL_INSPECTION' || viewMode === 'XML_SCHEMA') && xmlData && (
        <MeFXMLViewer
          xmlContent={xmlData.xml}
          submissionId={xmlData.submissionId}
          efin={xmlData.efin}
          etin={xmlData.etin}
          taxYear={lead.taxYear}
        />
      )}

      {/* 6. Comprehensive Lead Audit Trail & Lifecycle Activity Stream (Matching Reviewer & Sales Screen) */}
      <LeadAuditTrailSection
        leadId={lead.id}
        taxpayerName={lead.taxpayerName}
        currentStage={lead.currentStage}
        stageHistories={(lead.stageHistories as any) || []}
        callLogs={(lead.callLogs as any) || []}
        auditLogs={(lead.auditLogs as any) || []}
      />

      {/* 7. Send Back / Workflow Revert Modal (Filing Specialist -> Sales, Prep, or Documenter) */}
      <SendBackLeadModal
        isOpen={isSendBackOpen}
        onClose={() => setIsSendBackOpen(false)}
        applicationId={lead.id}
        taxpayerName={lead.taxpayerName}
        taxYear={lead.taxYear}
        currentDepartment="FILING"
        assignedPreparerName={lead.taxReturnSummary?.qaAuditorName ? 'Assigned Tax Preparer' : undefined}
        availableTargetDepartments={[
          {
            key: 'SALES',
            label: 'Sales Department (Pricing & Auth)',
            badge: 'SALES_PITCH_QUEUE',
            description: 'Send back to Sales closer for fee pricing dispute, Form 8879 PIN re-authentication, or taxpayer consultation.',
          },
          {
            key: 'PREPARATION',
            label: 'Tax Preparation Department (CPA / Preparer)',
            badge: 'CORRECTION_NEEDED',
            description: 'Send back to Tax Preparer to fix XML schema errors, Form 1040 line item deductions, or calculation discrepancies.',
          },
          {
            key: 'DOCUMENTER',
            label: 'Documenter Department (Intake & Verification)',
            badge: 'DOC_OUTREACH',
            description: 'Send back to Documenter agent to collect missing source documents, unreadable W-2/1099 attachments, or verify ID.',
          },
        ]}
        defaultTargetDepartment="PREPARATION"
        onRevertSuccess={() => {
          navigate(-1);
        }}
      />
    </div>
  );
};
