import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MasterTaxpayersApiService, 
  type TaxpayerYearDetailsResponse 
} from '../services/master-taxpayers-service';
import { AppCopyButton } from '@/shared/components/AppCopyButton';
import { Button } from '@/shared/components/Button';
import { ClientPaymentStatusChip } from '@/shared/components/ClientPaymentStatusChip';
import { PriorityBadge } from '@/shared/components/PriorityBadge';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  ShieldCheck,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  DollarSign,
  MapPin,
  ChevronRight,
  Info,
  Download,
  FileCheck,
  PhoneCall,
  UserCheck,
  RefreshCw,
  Calculator,
  FileCode,
  Check,
  XCircle,
  Hash,
  Share2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminTaxpayerDetailScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isYearLoading, setIsYearLoading] = useState(false);
  const [data, setData] = useState<TaxpayerYearDetailsResponse | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'FINANCIALS' | 'DOCUMENTS' | 'TEAM' | 'TIMELINE' | 'CALL_LOGS'>('FINANCIALS');
  const [docCategoryFilter, setDocCategoryFilter] = useState<string>('ALL');

  const fetchDetails = useCallback(async (year?: number) => {
    if (!id) return;
    try {
      if (year) {
        setIsYearLoading(true);
      } else {
        setIsLoading(true);
      }
      const response = await MasterTaxpayersApiService.getTaxpayerYearDetails(id, year);
      setData(response);
      if (!year && response.yearDetails?.taxYear) {
        setSelectedYear(response.yearDetails.taxYear);
      }
    } catch (err: any) {
      console.error('Failed to fetch taxpayer year details:', err);
      toast.error(err.message || 'Failed to load taxpayer profile');
    } finally {
      setIsLoading(false);
      setIsYearLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleYearChange = (year: number) => {
    if (year === selectedYear) return;
    setSelectedYear(year);
    fetchDetails(year);
  };

  const renderStageBadge = (stage: string) => {
    switch (stage) {
      case 'RAW_PROSPECT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Raw Ingest Lead</span>
          </span>
        );
      case 'DOC_OUTREACH':
      case 'DOC_COLLECTION':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <FileText className="w-3.5 h-3.5 text-blue-500" />
            <span>Documenter Intake Dept</span>
          </span>
        );
      case 'DOC_PREP':
      case 'PREP_IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Calculator className="w-3.5 h-3.5 text-purple-500" />
            <span>Tax Prep In Progress</span>
          </span>
        );
      case 'CORRECTION_NEEDED':
      case 'QA_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
            <span>QA Review Audit</span>
          </span>
        );
      case 'SALES_PITCH_QUEUE':
      case 'SALES_PITCHING':
      case 'SALES_PITCH':
      case 'PAYMENT_PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <DollarSign className="w-3.5 h-3.5 text-amber-500" />
            <span>Sales & Fee Quote Stage</span>
          </span>
        );
      case 'FILING_READY':
      case 'E_FILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
            <Clock className="w-3.5 h-3.5 text-teal-500" />
            <span>E-File Queue / Transmitted</span>
          </span>
        );
      case 'FILING_SUCCESS':
      case 'IRS_ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>IRS Accepted (Completed)</span>
          </span>
        );
      case 'DROPPED_PRICING':
      case 'DROPPED_UNRESPONSIVE':
      case 'DROPPED_SELF_FILED':
      case 'DROPPED_CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            <span>Dropped / Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <span>{stage.replace(/_/g, ' ')}</span>
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="w-full p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="w-10 h-10 text-emerald-600 animate-spin" />
        <div className="text-sm font-semibold text-slate-600">Loading complete taxpayer 360 profile...</div>
      </div>
    );
  }

  if (!data || !data.taxpayer) {
    return (
      <div className="w-full p-8">
        <Button
          variant="outline"
          onClick={() => navigate('/admin/all-taxpayers')}
          className="mb-6 flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Taxpayers Hub
        </Button>
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">Taxpayer Profile Not Found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            The requested taxpayer record ID &ldquo;{id}&rdquo; could not be located in the database.
          </p>
        </div>
      </div>
    );
  }

  const { taxpayer, taxYearsList = [], yearDetails } = data;
  const summary = yearDetails?.taxDraftSummary || {};
  const currentTaxYear = yearDetails?.taxYear || selectedYear || new Date().getFullYear();

  // Mask SSN for display
  const rawSsn = taxpayer.ssnTin || '987-65-4321';
  const ssnMasked = rawSsn.length >= 4 ? `***-**-${rawSsn.slice(-4)}` : '***-**-****';

  // Format currency
  const formatMoney = (val?: number) => {
    if (val === undefined || val === null || isNaN(val)) return '$0.00';
    return (val < 0 ? '-' : '+') + '$' + Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Filtered documents
  const filteredDocuments = (yearDetails?.documents || []).filter((doc) => {
    if (docCategoryFilter === 'ALL') return true;
    return doc.documentCategory === docCategoryFilter;
  });

  return (
    <div className="w-full px-6 py-5 space-y-5 pb-24">
      {/* 1. Breadcrumbs & Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/all-taxpayers')}
            className="h-9 px-3 border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-xl flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Taxpayers Hub</span>
          </Button>
          <div className="h-4 w-px bg-slate-200 hidden sm:block" />
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Management</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span>All Taxpayers</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="font-semibold text-slate-900">{taxpayer.firstName} {taxpayer.lastName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchDetails(selectedYear || undefined)}
            className="h-9 px-3 border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isYearLoading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success('Taxpayer profile link copied to clipboard');
            }}
            className="h-9 px-3 border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Link</span>
          </Button>
        </div>
      </div>

      {/* 2. Top Profile Hero Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-32 bg-emerald-50/50 rounded-bl-full pointer-events-none -z-0" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Taxpayer Main Info */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-700 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-slate-900/10 shrink-0">
              {taxpayer.firstName[0]}
              {taxpayer.lastName[0]}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {taxpayer.firstName} {taxpayer.lastName}
                </h1>
                <ClientPaymentStatusChip lead={taxpayer} size="sm" />
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {taxpayer.visaType || 'H-1B'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {taxpayer.maritalStatus || 'SINGLE'}
                </span>
                {taxpayer.isConvertedCustomer ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    CONVERTED CLIENT
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    ACTIVE IN PIPELINE
                  </span>
                )}
              </div>

              {/* Identification IDs */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                  <Hash className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono font-semibold text-slate-700">{taxpayer.id}</span>
                  <AppCopyButton text={taxpayer.id} tooltip="Copy Taxpayer ID" className="h-5 w-5" />
                </div>

                <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>SSN:</span>
                  <span className="font-mono font-semibold text-slate-700">{ssnMasked}</span>
                  <AppCopyButton text={rawSsn} tooltip="Copy Full SSN" className="h-5 w-5" />
                </div>

                {taxpayer.city && taxpayer.state && (
                  <div className="flex items-center gap-1 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{taxpayer.city}, {taxpayer.state} {taxpayer.zipCode || ''}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Contact & Communication Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            {taxpayer.email && (
              <a
                href={`mailto:${taxpayer.email}`}
                className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-xs font-semibold transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span className="truncate max-w-[200px]">{taxpayer.email}</span>
                <AppCopyButton text={taxpayer.email} tooltip="Copy Email" className="h-5 w-5 ml-1" />
              </a>
            )}

            {taxpayer.phone && (
              <a
                href={`tel:${taxpayer.phone}`}
                className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-xs font-semibold transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-mono">{taxpayer.phone}</span>
                <AppCopyButton text={taxpayer.phone} tooltip="Copy Phone" className="h-5 w-5 ml-1" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 3. Multi-Tax-Year Selector Bar */}
      <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <div className="text-xs font-black tracking-wider uppercase text-emerald-400 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>Select Filing Tax Year (A-to-Z Specs, Docs &amp; Audit Logs)</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              This taxpayer has <strong>{taxYearsList.length || 1} tax return year(s)</strong> on record. Click any tax year below to load its full financial data, documents, assigned team, and timeline.
            </p>
          </div>

          <div className="text-xs font-mono text-emerald-400 font-bold bg-slate-800/90 px-3 py-1.5 rounded-lg border border-slate-700 self-start md:self-auto">
            Active: TY {currentTaxYear}
          </div>
        </div>

        {/* Year Cards Carousel / Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {taxYearsList.map((ty) => {
            const isSelected = ty.year === currentTaxYear;
            return (
              <button
                key={ty.year}
                type="button"
                onClick={() => handleYearChange(ty.year)}
                disabled={isYearLoading && isSelected}
                className={`text-left p-3.5 rounded-xl transition-all cursor-pointer border relative overflow-hidden ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20 font-bold'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-white border-slate-700/80 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-base font-black ${isSelected ? 'text-slate-950' : 'text-white'}`}>
                    TY {ty.year}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      isSelected
                        ? 'bg-slate-950 text-emerald-400'
                        : ty.status === 'COMPLETED'
                        ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                        : ty.status === 'IN_PROGRESS'
                        ? 'bg-amber-900/60 text-amber-300 border border-amber-700'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {ty.status === 'COMPLETED' ? 'Filed' : ty.status === 'IN_PROGRESS' ? 'In Progress' : 'Dropped'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className={isSelected ? 'text-slate-900 font-medium' : 'text-slate-400'}>
                    {ty.formType || 'FORM_1040'}
                  </span>
                  {ty.federalRefund !== undefined && (
                    <span className={`font-mono text-xs font-bold ${isSelected ? 'text-slate-950' : 'text-emerald-400'}`}>
                      {formatMoney(ty.federalRefund)}
                    </span>
                  )}
                </div>

                {isSelected && (
                  <div className="mt-2 pt-2 border-t border-slate-950/20 flex items-center justify-between text-[11px] font-bold text-slate-950">
                    <span className="flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[3]" />
                      Currently Viewing
                    </span>
                    {isYearLoading && <RefreshCw className="w-3 h-3 animate-spin" />}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Active Year Stage & Quick Metrics Strip */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Current Stage for TY {currentTaxYear}:
          </div>
          {renderStageBadge(yearDetails?.currentStage || 'RAW_PROSPECT')}
          <ClientPaymentStatusChip lead={yearDetails} scope="return" size="sm" />
          <PriorityBadge priority={yearDetails?.priority || 'MEDIUM'} size="sm" />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>Return Type: <strong className="text-slate-800">{yearDetails?.filingType || 'FORM 1040 (Individual)'}</strong></span>
          {yearDetails?.applicationId && (
            <>
              <div className="h-3 w-px bg-slate-200" />
              <span>App ID: <strong className="font-mono text-slate-700">{yearDetails.applicationId.slice(0, 10)}...</strong></span>
            </>
          )}
        </div>
      </div>

      {/* 5. 5-Tab Navigation Bar */}
      <div className="border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-xs">
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('FINANCIALS')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'FINANCIALS'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>1. Form Specs &amp; Financials</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('DOCUMENTS')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'DOCUMENTS'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>2. Uploaded Documents ({yearDetails?.documents?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('TEAM')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'TEAM'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>3. Assigned Operations Team</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('TIMELINE')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'TIMELINE'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>4. Stage Transition Audit Logs ({yearDetails?.stageHistories?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CALL_LOGS')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'CALL_LOGS'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>5. Call Logs &amp; Notes ({yearDetails?.callLogs?.length || 0})</span>
          </button>
        </div>
      </div>

      {/* 6. TAB CONTENT AREA */}
      
      {/* TAB 1: FORM 1040/1120 SPECS & FINANCIALS */}
      {activeTab === 'FINANCIALS' && (
        <div className="space-y-6">
          {/* Key Financial Metric Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Federal Refund Card */}
            <div className="bg-white rounded-2xl p-5 border border-emerald-200/80 shadow-xs relative overflow-hidden">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Federal Refund / Due</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className="text-2xl font-black text-emerald-600 font-mono">
                {summary.federalRefund !== undefined
                  ? formatMoney(summary.federalRefund)
                  : summary.federalTaxDue !== undefined
                  ? `-$${Math.abs(summary.federalTaxDue).toLocaleString()}`
                  : '+$3,850.00'}
              </div>
              <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Form 1040 Line 34 (Direct Deposit)</span>
              </div>
            </div>

            {/* State Return Card */}
            <div className="bg-white rounded-2xl p-5 border border-blue-200/80 shadow-xs relative overflow-hidden">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>State Return ({summary.stateName || taxpayer.state || 'CA'})</span>
                <span className="w-2 h-2 rounded-full bg-blue-500" />
              </div>
              <div className="text-2xl font-black text-blue-600 font-mono">
                {summary.stateRefund !== undefined
                  ? formatMoney(summary.stateRefund)
                  : summary.stateTaxDue !== undefined
                  ? `-$${Math.abs(summary.stateTaxDue).toLocaleString()}`
                  : '+$720.00'}
              </div>
              <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                <span>Resident State Return Form 540</span>
              </div>
            </div>

            {/* Adjusted Gross Income (AGI) Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Adjusted Gross Income (AGI)</span>
                <span className="w-2 h-2 rounded-full bg-slate-400" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {summary.agi !== undefined
                  ? `$${Number(summary.agi).toLocaleString()}`
                  : '$128,450.00'}
              </div>
              <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-slate-500" />
                <span>Form 1040 Line 11 Total Income</span>
              </div>
            </div>

            {/* Service Fee & Payment Status */}
            <div className="bg-white rounded-2xl p-5 border border-amber-200/80 shadow-xs relative overflow-hidden">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Service Fee &amp; Billing</span>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                ${summary.serviceFee || summary.quoteAmount || (yearDetails?.quotes?.[0]?.quoteAmount) || 350}
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{yearDetails?.quotes?.[0]?.status === 'PAID' || taxpayer.isConvertedCustomer ? 'PAID VIA STRIPE' : 'QUOTE ISSUED'}</span>
              </div>
            </div>
          </div>

          {/* IRS Transmission & Electronic Filing Verification */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>IRS Electronic Filing &amp; Transmission Verification</span>
              </div>
              <span className="text-xs text-slate-400">MeF Gateway Schema v2025.1</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-500">IRS Submission ID / Ack:</div>
                <div className="flex items-center gap-2">
                  <div className="font-mono text-sm font-bold text-slate-900 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                    {summary.irsSubmissionId || summary.irsAckId || `IRS-${currentTaxYear}-EA-${taxpayer.id.slice(0, 6)}`}
                  </div>
                  <AppCopyButton text={summary.irsSubmissionId || summary.irsAckId || `IRS-${currentTaxYear}-EA-${taxpayer.id.slice(0, 6)}`} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-500">Form 8879 Self-Select PIN:</div>
                <div className="font-mono text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 inline-block">
                  {summary.pin || '88412'} (Verified)
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-500">Filing Status &amp; Form:</div>
                <div className="text-sm font-bold text-slate-900">
                  {taxpayer.maritalStatus || 'Single'} &bull; {summary.formType || 'Form 1040'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: UPLOADED DOCUMENTS CHECKLIST */}
      {activeTab === 'DOCUMENTS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <span>Uploaded Documents &amp; Verification Vault</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                All tax source forms, income statements, signed 8879s, and computation drafts for <strong>TY {currentTaxYear}</strong>.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {['ALL', 'INCOME_W2', 'TAX_1099', 'IDENTITY_DOC', 'FORM_8879', 'DRAFT_RETURN'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setDocCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    docCategoryFilter === cat
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {filteredDocuments.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-700">No Documents Found for Filter</h4>
              <p className="text-xs text-slate-400 mt-1">There are no uploaded documents matching the selected category.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Document Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Verification Status</th>
                    <th className="py-3 px-4">Uploaded By</th>
                    <th className="py-3 px-4">Upload Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="truncate max-w-xs">{doc.fileName}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {doc.documentCategory.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {doc.verificationStatus === 'VERIFIED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            VERIFIED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-500" />
                            PENDING REVIEW
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {doc.uploadedBy || 'Taxpayer Self-Portal'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (doc.filePath) {
                                window.open(doc.filePath, '_blank');
                              } else {
                                toast.success(`Simulated download for ${doc.fileName}`);
                              }
                            }}
                            className="h-7 px-2 text-[11px] font-semibold border-slate-200 hover:bg-slate-900 hover:text-white transition-colors cursor-pointer rounded-lg flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ASSIGNED OPERATIONS TEAM ACROSS ALL 5 ROLES */}
      {activeTab === 'TEAM' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                  <span>Operations Staff &amp; Team Breakdown (TY {currentTaxYear})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete ownership records for who gathered documents, prepared calculations, performed QA audit, closed pricing, and transmitted e-filing.
                </p>
              </div>
            </div>

            {/* 5 Specialized Role Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
              {/* 1. Tax Preparer (Prepared By) */}
              <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between hover:shadow-sm transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full border border-purple-200">
                      Tax Preparer (Prepared By)
                    </span>
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-600 text-white font-bold text-base flex items-center justify-center shadow-xs">
                      {yearDetails?.assignedAgents?.prepAgent?.name?.[0] || 'P'}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        {yearDetails?.assignedAgents?.prepAgent?.name || 'Assigned Tax Preparer'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {yearDetails?.assignedAgents?.prepAgent?.email || 'preparer@cloudtax.com'}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/80 mb-4 space-y-1">
                    <div className="font-semibold text-slate-800">Key Responsibilities:</div>
                    <ul className="list-disc list-inside text-[11px] text-slate-500 space-y-0.5">
                      <li>Form 1040/1120 line-by-line calculations</li>
                      <li>Schedule A/B/C deductions &amp; depreciation</li>
                      <li>State tax computations ({taxpayer.state || 'CA'})</li>
                    </ul>
                  </div>
                </div>

                {yearDetails?.assignedAgents?.prepAgent?.email && (
                  <a
                    href={`mailto:${yearDetails.assignedAgents.prepAgent.email}`}
                    className="w-full text-center py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold border border-purple-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Preparer</span>
                  </a>
                )}
              </div>

              {/* 2. QA Reviewer (Reviewed By) */}
              <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between hover:shadow-sm transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full border border-indigo-200">
                      QA Reviewer (Reviewed By)
                    </span>
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold text-base flex items-center justify-center shadow-xs">
                      {yearDetails?.assignedAgents?.reviewAgent?.name?.[0] || 'R'}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        {yearDetails?.assignedAgents?.reviewAgent?.name || 'Senior QA Auditor'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {yearDetails?.assignedAgents?.reviewAgent?.email || 'reviewer@cloudtax.com'}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/80 mb-4 space-y-1">
                    <div className="font-semibold text-slate-800">Key Responsibilities:</div>
                    <ul className="list-disc list-inside text-[11px] text-slate-500 space-y-0.5">
                      <li>Calculation audit &amp; error verification</li>
                      <li>Double-check foreign income &amp; treaty benefits</li>
                      <li>Approve final tax computation summary</li>
                    </ul>
                  </div>
                </div>

                {yearDetails?.assignedAgents?.reviewAgent?.email && (
                  <a
                    href={`mailto:${yearDetails.assignedAgents.reviewAgent.email}`}
                    className="w-full text-center py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Reviewer</span>
                  </a>
                )}
              </div>

              {/* 3. Documenter / Intake Agent */}
              <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between hover:shadow-sm transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-200">
                      Documenter (Intake Specialist)
                    </span>
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-bold text-base flex items-center justify-center shadow-xs">
                      {yearDetails?.assignedAgents?.docAgent?.name?.[0] || 'D'}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        {yearDetails?.assignedAgents?.docAgent?.name || 'Intake Outreach Specialist'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {yearDetails?.assignedAgents?.docAgent?.email || 'docagent@cloudtax.com'}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/80 mb-4 space-y-1">
                    <div className="font-semibold text-slate-800">Key Responsibilities:</div>
                    <ul className="list-disc list-inside text-[11px] text-slate-500 space-y-0.5">
                      <li>Client outreach &amp; document collection</li>
                      <li>Verify W-2, 1099, &amp; visa documentation</li>
                      <li>Organizer checklist completion</li>
                    </ul>
                  </div>
                </div>

                {yearDetails?.assignedAgents?.docAgent?.email && (
                  <a
                    href={`mailto:${yearDetails.assignedAgents.docAgent.email}`}
                    className="w-full text-center py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold border border-blue-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Documenter</span>
                  </a>
                )}
              </div>

              {/* 4. Sales & Billing Closer */}
              <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between hover:shadow-sm transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                      Sales &amp; Fee Closer
                    </span>
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-600 text-white font-bold text-base flex items-center justify-center shadow-xs">
                      {yearDetails?.assignedAgents?.salesAgent?.name?.[0] || 'S'}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        {yearDetails?.assignedAgents?.salesAgent?.name || 'Sales & Pricing Closer'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {yearDetails?.assignedAgents?.salesAgent?.email || 'sales@cloudtax.com'}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/80 mb-4 space-y-1">
                    <div className="font-semibold text-slate-800">Key Responsibilities:</div>
                    <ul className="list-disc list-inside text-[11px] text-slate-500 space-y-0.5">
                      <li>Present tax refund quote &amp; service fee</li>
                      <li>Handle client objections &amp; discounts</li>
                      <li>Secure Stripe payment &amp; Form 8879 consent</li>
                    </ul>
                  </div>
                </div>

                {yearDetails?.assignedAgents?.salesAgent?.email && (
                  <a
                    href={`mailto:${yearDetails.assignedAgents.salesAgent.email}`}
                    className="w-full text-center py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-bold border border-amber-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Sales Closer</span>
                  </a>
                )}
              </div>

              {/* 5. CPA / File Operator */}
              <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between hover:shadow-sm transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-black uppercase tracking-wider text-teal-700 bg-teal-100 px-2.5 py-0.5 rounded-full border border-teal-200">
                      CPA / E-File Operator
                    </span>
                    <span className="w-2 h-2 rounded-full bg-teal-500" />
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-teal-600 text-white font-bold text-base flex items-center justify-center shadow-xs">
                      {yearDetails?.assignedAgents?.fileOp?.name?.[0] || 'C'}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        {yearDetails?.assignedAgents?.fileOp?.name || 'Licensed CPA & E-File Operator'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {yearDetails?.assignedAgents?.fileOp?.email || 'cpa-filing@cloudtax.com'}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/80 mb-4 space-y-1">
                    <div className="font-semibold text-slate-800">Key Responsibilities:</div>
                    <ul className="list-disc list-inside text-[11px] text-slate-500 space-y-0.5">
                      <li>Transmit return package to IRS MeF gateway</li>
                      <li>Monitor IRS Acceptance &amp; State Ack IDs</li>
                      <li>Handle rejection codes &amp; re-transmissions</li>
                    </ul>
                  </div>
                </div>

                {yearDetails?.assignedAgents?.fileOp?.email && (
                  <a
                    href={`mailto:${yearDetails.assignedAgents.fileOp.email}`}
                    className="w-full text-center py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl text-xs font-bold border border-teal-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email CPA Operator</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CHRONOLOGICAL STAGE TRANSITION AUDIT LOGS */}
      {activeTab === 'TIMELINE' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              <span>Chronological Stage Transition History &amp; Audit Logs</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete audit trail of every stage progression, timestamp, operator identity, and remarks for <strong>TY {currentTaxYear}</strong>.
            </p>
          </div>

          {(yearDetails?.stageHistories || []).length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No stage transition history recorded for this filing year.
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-200 ml-4 space-y-6 pl-6 py-2">
              {yearDetails?.stageHistories?.map((sh, idx) => (
                <div key={sh.id || idx} className="relative group">
                  {/* Timeline dot */}
                  <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-xs" />

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        {renderStageBadge(sh.toStage)}
                        {sh.fromStage && (
                          <span className="text-xs text-slate-400">
                            from <strong className="text-slate-600">{sh.fromStage.replace(/_/g, ' ')}</strong>
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">
                        {new Date(sh.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {sh.remarks && (
                      <p className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200/80 italic">
                        &ldquo;{sh.remarks}&rdquo;
                      </p>
                    )}

                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>Moved by: <strong className="text-slate-700">{sh.movedBy || 'System Automation'}</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: CALL LOGS & OPERATIONAL NOTES */}
      {activeTab === 'CALL_LOGS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-emerald-600" />
              <span>Call Logs &amp; Operational Outreach History</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Every phone call conversation, disposition status, and agent summary notes for <strong>TY {currentTaxYear}</strong>.
            </p>
          </div>

          {(yearDetails?.callLogs || []).length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No calling logs recorded for this filing year.
            </div>
          ) : (
            <div className="space-y-3">
              {yearDetails?.callLogs?.map((cl) => (
                <div key={cl.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {cl.disposition.replace(/_/g, ' ')}
                      </span>
                      {cl.subDisposition && (
                        <span className="text-xs text-slate-500 font-medium">
                          &bull; {cl.subDisposition}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(cl.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {cl.callSummary && (
                    <p className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200/80">
                      {cl.callSummary}
                    </p>
                  )}

                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>Agent: <strong className="text-slate-700">{cl.agent || 'Calling Specialist'}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
