import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  RefreshCw,
  FileText,
  Code2,
  Layers
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { FilingComplianceGate } from '../components/workspace/FilingComplianceGate';
import { FilingTaxpayerInspectionCard } from '../components/workspace/FilingTaxpayerInspectionCard';
import { MeFXMLViewer } from '../components/workspace/MeFXMLViewer';
import { FilingTransmissionStatusCard } from '../components/workspace/FilingTransmissionStatusCard';
import { LeadAuditTrailSection } from '@/features/documenter/components/LeadAuditTrailSection';
import { useFilingWorkspace } from '../hooks/useFilingWorkspace';

export type WorkspaceViewMode = 'AUDIT_FILE' | 'XML_SCHEMA' | 'FULL_INSPECTION';

export const FilingTransmissionWorkspaceScreen: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<WorkspaceViewMode>('FULL_INSPECTION');

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
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {lead.taxpayerName}
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isAccepted
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {isAccepted ? '✓ IRS E-File Accepted' : 'Ready for Transmission'}
              </span>
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
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'FULL_INSPECTION'
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
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'AUDIT_FILE'
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
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'XML_SCHEMA'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>IRS XML Schema</span>
            </button>
          </div>

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
    </div>
  );
};
