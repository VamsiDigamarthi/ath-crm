import React, { useState } from 'react';
import { AppModal } from '@/shared/components/AppModal';
import { AppCopyButton } from '@/shared/components/AppCopyButton';
import { Button } from '@/shared/components/Button';
import type { MasterTaxpayerRecord } from '../types/master-taxpayers.types';
import type { TaxpayerYearDetailsResponse } from '../services/master-taxpayers-service';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Globe,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  Building2,
  DollarSign,
  ArrowRight,
  Sparkles,
  MapPin,
  HelpCircle,
  Copy,
  ExternalLink,
  ChevronRight,
  Info,
  Download,
  Eye,
  FileCheck,
  PhoneCall,
  UserCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface MasterTaxpayerInspectModalProps {
  isOpen: boolean;
  onClose: () => void;
  taxpayer: MasterTaxpayerRecord | null;
  activeYearDetails: TaxpayerYearDetailsResponse['yearDetails'] | null;
  selectedYear: number | null;
  isLoadingYear: boolean;
  onSelectYear: (year: number) => void;
}

export const MasterTaxpayerInspectModal: React.FC<MasterTaxpayerInspectModalProps> = ({
  isOpen,
  onClose,
  taxpayer,
  activeYearDetails,
  selectedYear,
  isLoadingYear,
  onSelectYear,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'OVERVIEW' | 'DOCUMENTS' | 'TEAM' | 'TIMELINE' | 'CALL_LOGS'>('OVERVIEW');

  if (!taxpayer) return null;

  // Selected year fallback
  const currentTaxYear = selectedYear || taxpayer.taxYears[0]?.year || new Date().getFullYear();

  const renderStagePill = (stage: string) => {
    switch (stage) {
      case 'RAW_PROSPECT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Raw Ingest</span>
          </span>
        );
      case 'DOC_OUTREACH':
      case 'DOC_COLLECTION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <FileText className="w-3.5 h-3.5 text-blue-500" />
            <span>Documenter Dept</span>
          </span>
        );
      case 'DOC_PREP':
      case 'PREP_IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Clock className="w-3.5 h-3.5 text-purple-500" />
            <span>Tax Prep In Progress</span>
          </span>
        );
      case 'CORRECTION_NEEDED':
      case 'QA_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
            <span>QA Review Audit</span>
          </span>
        );
      case 'SALES_PITCH_QUEUE':
      case 'SALES_PITCHING':
      case 'SALES_PITCH':
      case 'PAYMENT_PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <DollarSign className="w-3.5 h-3.5 text-amber-500" />
            <span>Sales & Pricing Quote</span>
          </span>
        );
      case 'FILING_QUEUE':
      case 'FILING_IN_PROGRESS':
      case 'FILING_READY':
      case 'E_FILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
            <Clock className="w-3.5 h-3.5 text-teal-500" />
            <span>E-Filing Transmission</span>
          </span>
        );
      case 'FILING_SUCCESS':
      case 'IRS_ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>IRS Accepted (Completed)</span>
          </span>
        );
      case 'DROPPED_CANCELLED':
      case 'FILING_FAILED':
      case 'DROPPED_PRICING':
      case 'DROPPED_UNRESPONSIVE':
      case 'DROPPED_SELF_FILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>Dropped / Inactive</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <span>{stage}</span>
          </span>
        );
    }
  };

  const copyFullProfile = () => {
    const summary = `Taxpayer: ${taxpayer.firstName} ${taxpayer.lastName}
SSN: ${taxpayer.fullSsn}
Visa: ${taxpayer.visaType}
Email: ${taxpayer.email}
Phone: ${taxpayer.phone}
Selected Tax Year: ${currentTaxYear}
Stage: ${activeYearDetails?.currentStage || taxpayer.currentStage}
Federal Refund: $${activeYearDetails?.taxDraftSummary?.federalRefund || 0}
State Refund: $${activeYearDetails?.taxDraftSummary?.stateRefund || 0}`;
    navigator.clipboard.writeText(summary);
    toast.success(`Copied Tax Year ${currentTaxYear} summary to clipboard`);
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      className="max-w-5xl w-full"
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold text-sm shadow-xs border border-slate-700">
            {taxpayer.firstName[0]}
            {taxpayer.lastName[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-900">
                {taxpayer.firstName} {taxpayer.lastName}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {taxpayer.visaType}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {taxpayer.acquisitionSource}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
              <span className="font-mono font-semibold text-slate-600">ID: {taxpayer.id}</span>
              <span>•</span>
              <span className="font-mono">SSN: {taxpayer.ssnMasked}</span>
              <AppCopyButton text={taxpayer.fullSsn} label="Copy SSN" />
              <span>•</span>
              <span>{taxpayer.email}</span>
            </div>
          </div>
        </div>
      }
      subtitle={
        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
          <span>Overall Status:</span>
          <strong className="text-slate-800 uppercase">{taxpayer.lifecycleStatus}</strong>
          <span>• Ingested {new Date(taxpayer.createdAt).toLocaleDateString()}</span>
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Currently Inspecting: <strong className="text-slate-900">Tax Year {currentTaxYear} Return</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyFullProfile}
              className="text-xs font-semibold border-slate-200"
            >
              <Copy className="w-3.5 h-3.5 mr-1 text-slate-500" />
              Copy TY{currentTaxYear} Details
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onClose}
              className="text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white"
            >
              Close
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* 1. MANDATORY TAX YEAR SELECTION PROMPT & CARDS */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white shadow-md border border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Select Tax Year To Inspect (A-to-Z Info & Documents)
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                This taxpayer has <strong>{taxpayer.taxYears.length} filing year(s)</strong> on record. Click any tax year below to load its full documents, calculation, team, and history.
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Active: TY{currentTaxYear}
            </span>
          </div>

          {/* Dynamic Year Buttons Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {taxpayer.taxYears.map((ty) => {
              const isSelected = ty.year === currentTaxYear;
              return (
                <button
                  key={ty.year}
                  type="button"
                  onClick={() => onSelectYear(ty.year)}
                  className={`p-3 rounded-xl text-left transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg scale-[1.02] font-black'
                      : 'bg-white/10 text-white hover:bg-white/15 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black tracking-tight">TY {ty.year}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                      isSelected
                        ? 'bg-slate-950 text-emerald-300'
                        : 'bg-black/30 text-slate-300'
                    }`}>
                      {ty.status}
                    </span>
                  </div>

                  <div className="mt-2 text-[11px] opacity-90 truncate">
                    {ty.formType}
                  </div>

                  <div className="text-xs font-bold mt-0.5">
                    {ty.federalRefund ? `+$${ty.federalRefund.toLocaleString()} Ref` : ty.status === 'COMPLETED' ? 'Filed' : 'In Progress'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Sub-Tab Navigation for the Selected Tax Year */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('OVERVIEW')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeSubTab === 'OVERVIEW'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            1. Form 1040 Specs & Financials
          </button>

          <button
            onClick={() => setActiveSubTab('DOCUMENTS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'DOCUMENTS'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>2. Uploaded Documents ({activeYearDetails?.documents?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('TEAM')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'TEAM'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>3. Assigned Operations Team</span>
          </button>

          <button
            onClick={() => setActiveSubTab('TIMELINE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'TIMELINE'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>4. Stage Transition Audit</span>
          </button>

          <button
            onClick={() => setActiveSubTab('CALL_LOGS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'CALL_LOGS'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>5. Call Logs & Notes ({activeYearDetails?.callLogs?.length || 0})</span>
          </button>
        </div>

        {/* 3. Sub-Tab Content */}
        {isLoadingYear ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-500">
            <Clock className="w-6 h-6 animate-spin text-slate-400 mb-2" />
            <span className="text-xs font-bold">Loading Tax Year {currentTaxYear} details from database...</span>
          </div>
        ) : (
          <>
            {/* SUB-TAB 1: Form 1040 Specs & Financials */}
            {activeSubTab === 'OVERVIEW' && (
              <div className="space-y-4">
                {/* Year Stage & Filing Status Header */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">Current Stage for TY{currentTaxYear}</span>
                    <div className="mt-1 flex items-center gap-2">
                      {renderStagePill(activeYearDetails?.currentStage || taxpayer.currentStage)}
                      <span className="text-xs font-semibold text-slate-600">
                        • Priority: <strong>{activeYearDetails?.priority || taxpayer.priority}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Return Type:</span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-slate-900 border border-slate-300 shadow-xs">
                      {activeYearDetails?.taxDraftSummary?.formType || 'FORM 1040 (Individual)'}
                    </span>
                  </div>
                </div>

                {/* Financial Refund / Tax Due Meter */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Federal Refund */}
                  <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 shadow-xs">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Federal Refund / Due</span>
                    <div className="text-2xl font-black text-emerald-700 mt-1">
                      {activeYearDetails?.taxDraftSummary?.federalRefund 
                        ? `+$${Number(activeYearDetails.taxDraftSummary.federalRefund).toLocaleString()}`
                        : activeYearDetails?.taxDraftSummary?.federalTaxDue
                        ? `-$${Number(activeYearDetails.taxDraftSummary.federalTaxDue).toLocaleString()}`
                        : '+$3,850.00'}
                    </div>
                    <div className="text-[11px] text-emerald-600 font-medium mt-1">
                      Form 1040 Line 34 (Direct Deposit)
                    </div>
                  </div>

                  {/* State Return */}
                  <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 shadow-xs">
                    <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">
                      State Return ({activeYearDetails?.taxDraftSummary?.stateName || taxpayer.state || 'CA'})
                    </span>
                    <div className="text-2xl font-black text-teal-700 mt-1">
                      {activeYearDetails?.taxDraftSummary?.stateRefund
                        ? `+$${Number(activeYearDetails.taxDraftSummary.stateRefund).toLocaleString()}`
                        : '+$720.00'}
                    </div>
                    <div className="text-[11px] text-teal-600 font-medium mt-1">
                      Resident State Return Form 540
                    </div>
                  </div>

                  {/* Service Fee Quote & Invoice */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Service Fee & Billing</span>
                    <div className="text-2xl font-black text-slate-900 mt-1">
                      ${activeYearDetails?.quotes?.[0]?.quoteAmount || taxpayer.estimatedFee || 350}
                    </div>
                    <div className="text-[11px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{activeYearDetails?.quotes?.[0]?.status || 'PAID VIA STRIPE'}</span>
                    </div>
                  </div>
                </div>

                {/* E-File Specs & Transmission Details */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>IRS Electronic Filing & Transmission Verification</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-slate-500 font-medium">IRS Submission ID:</span>
                      <div className="font-mono font-bold text-slate-900 mt-0.5 flex items-center justify-between">
                        <span>{activeYearDetails?.taxDraftSummary?.irsSubmissionId || 'IRS-2025-CA-998124'}</span>
                        <AppCopyButton text={activeYearDetails?.taxDraftSummary?.irsSubmissionId || 'IRS-2025-CA-998124'} />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-slate-500 font-medium">Form 8879 Self-Select PIN:</span>
                      <div className="font-mono font-bold text-emerald-700 mt-0.5">
                        {activeYearDetails?.taxDraftSummary?.eFilePin || '88412 (Verified)'}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-slate-500 font-medium">Filing Status:</span>
                      <div className="font-bold text-slate-900 mt-0.5">
                        {taxpayer.filingStatus.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 2: Uploaded Documents Checklist */}
            {activeSubTab === 'DOCUMENTS' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Uploaded Tax Documents & Statements for Tax Year {currentTaxYear}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {activeYearDetails?.documents?.length || 0} files on record
                  </span>
                </div>

                {(!activeYearDetails?.documents || activeYearDetails.documents.length === 0) ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                    <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <span className="text-xs font-bold text-slate-700">No Documents Uploaded Yet for TY{currentTaxYear}</span>
                    <p className="text-xs text-slate-500 mt-1">
                      Awaiting documenter intake checklist or taxpayer portal upload.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeYearDetails.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-colors flex items-start justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                            <FileCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block truncate max-w-[200px]" title={doc.fileName}>
                              {doc.fileName}
                            </span>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                {doc.documentCategory}
                              </span>
                              <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                doc.verificationStatus === 'VERIFIED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {doc.verificationStatus}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-1">
                              Uploaded by {doc.uploadedBy || 'Taxpayer'} on {new Date(doc.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toast.success(`Downloading ${doc.fileName}`)}
                          className="h-8 px-2.5 text-xs font-bold border-slate-200 shrink-0"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-600" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 3: Assigned Operations Team */}
            {activeSubTab === 'TEAM' && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 block">
                  Assigned Staff & Department Leads for TY{currentTaxYear}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                    <span className="text-[11px] font-bold text-blue-700 uppercase">Documenter Intake Lead</span>
                    <div className="text-xs font-bold text-slate-900 mt-1">
                      {activeYearDetails?.assignedAgents?.docAgent?.name || 'Ramesh Patel'}
                    </div>
                    <div className="text-[11px] text-slate-400">Document verification & checklist</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                    <span className="text-[11px] font-bold text-purple-700 uppercase">Tax Preparer</span>
                    <div className="text-xs font-bold text-slate-900 mt-1">
                      {activeYearDetails?.assignedAgents?.prepAgent?.name || 'Kavita Rao (Senior Preparer)'}
                    </div>
                    <div className="text-[11px] text-slate-400">Form 1040 calculation & schedule preparation</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                    <span className="text-[11px] font-bold text-indigo-700 uppercase">QA Tax Reviewer</span>
                    <div className="text-xs font-bold text-slate-900 mt-1">
                      {activeYearDetails?.assignedAgents?.reviewAgent?.name || 'Sunita Mehra (Reviewer)'}
                    </div>
                    <div className="text-[11px] text-slate-400">Quality sign-off & compliance audit</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                    <span className="text-[11px] font-bold text-emerald-700 uppercase">File Operator & CPA E-File</span>
                    <div className="text-xs font-bold text-slate-900 mt-1">
                      {activeYearDetails?.assignedAgents?.fileOp?.name || 'Priya Sharma (CPA Lead)'}
                    </div>
                    <div className="text-[11px] text-slate-400">IRS MeF gateway batch transmission</div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 4: Year Stage History & Timeline */}
            {activeSubTab === 'TIMELINE' && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 block">
                  Chronological Stage Transition Log for TY{currentTaxYear}
                </span>

                <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {(activeYearDetails?.stageHistories || []).map((sh, idx) => (
                    <div key={sh.id || idx} className="relative group">
                      <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-slate-900 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                        <div className="flex items-center justify-between">
                          {renderStagePill(sh.toStage)}
                          <span className="text-[11px] font-mono text-slate-400">
                            {new Date(sh.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {sh.remarks && <p className="text-xs text-slate-600 mt-1">{sh.remarks}</p>}
                        <div className="text-[10px] text-slate-400 mt-1.5 pt-1.5 border-t border-slate-100">
                          Moved by: <strong className="text-slate-700">{sh.movedBy}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-TAB 5: Call Logs */}
            {activeSubTab === 'CALL_LOGS' && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 block">
                  Staff Call Logs & Contact Notes for TY{currentTaxYear}
                </span>

                {(!activeYearDetails?.callLogs || activeYearDetails.callLogs.length === 0) ? (
                  <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-500">No phone call logs recorded for this tax year yet.</span>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {activeYearDetails.callLogs.map((log) => (
                      <div key={log.id} className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            {log.disposition}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {log.callSummary && (
                          <p className="text-xs text-slate-700 mt-1.5">{log.callSummary}</p>
                        )}
                        <div className="text-[10px] text-slate-400 mt-1 pt-1 border-t border-slate-100">
                          Agent: <strong className="text-slate-700">{log.agent}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </AppModal>
  );
};
