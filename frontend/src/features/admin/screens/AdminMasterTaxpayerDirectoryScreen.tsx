import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMasterTaxpayers } from '../hooks/useMasterTaxpayers';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
import { AppSelect } from '@/shared/components/AppSelect';
import { AppCopyButton } from '@/shared/components/AppCopyButton';
import { AppPagination } from '@/shared/components/AppPagination';
import { AppEmptyState } from '@/shared/components/AppEmptyState';
import { Button } from '@/shared/components/Button';
import { PriorityBadge } from '@/shared/components/PriorityBadge';
import { PriorityFilterSelect } from '@/shared/components/PriorityFilterSelect';
import { ClientPaymentStatusChip } from '@/shared/components/ClientPaymentStatusChip';
import { generateTaxYears } from '@/features/auth/components/TaxpayerSignupForm';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  Globe,
  RefreshCw,
  Download,
  Filter,
  Eye,
  Sparkles,
  TrendingUp,
  Layers,
  FileText,
  DollarSign,
  ShieldCheck,
  User,
  XCircle,
} from 'lucide-react';

const SOURCE_OPTIONS = [
  { value: 'ALL', label: 'All Ingest Sources' },
  { value: 'DIRECT_SIGNUP', label: 'Direct Online Sign-ups' },
  { value: 'BULK_IMPORT', label: 'Bulk CSV Batch Imports' },
  { value: 'REFERRAL', label: 'Client Referrals' },
  { value: 'MANUAL_ENTRY', label: 'Manual Admin Entry' },
];

const LIFECYCLE_OPTIONS = [
  { value: 'ALL', label: 'All Lifecycle Statuses' },
  { value: 'CONVERTED', label: 'Converted Clients (Paid/Filed)' },
  { value: 'IN_PIPELINE', label: 'Active Pipeline (In Progress)' },
  { value: 'STALLED', label: 'Stalled / Under Review' },
  { value: 'DROPPED', label: 'Dropped / Unresponsive' },
  { value: 'RETURNED', label: 'Returned to Pool' },
];

const STAGE_OPTIONS = [
  { value: 'ALL', label: 'All Operational Stages' },
  { value: 'RAW_PROSPECT', label: 'Raw Lead (New Ingest)' },
  { value: 'DOC_OUTREACH', label: 'Documenter Outreach' },
  { value: 'DOC_COLLECTION', label: 'Document Gathering' },
  { value: 'PREP_IN_PROGRESS', label: 'Tax Prep Calculation' },
  { value: 'QA_REVIEW', label: 'QA Review & Audit' },
  { value: 'SALES_PITCH', label: 'Sales Quote / Pricing' },
  { value: 'PAYMENT_PENDING', label: 'Payment / 8879 Pending' },
  { value: 'FILING_READY', label: 'Filing Ready / CPA Queue' },
  { value: 'E_FILED', label: 'Transmitted to IRS' },
  { value: 'IRS_ACCEPTED', label: 'IRS Accepted (Converted)' },
  { value: 'DROPPED_PRICING', label: 'Dropped (Price Dispute)' },
  { value: 'DROPPED_UNRESPONSIVE', label: 'Dropped (Unresponsive)' },
  { value: 'DROPPED_SELF_FILED', label: 'Dropped (Self Filed)' },
];

const VISA_OPTIONS = [
  { value: 'ALL', label: 'All Visa Types' },
  { value: 'H1B', label: 'H-1B (Work Visa)' },
  { value: 'F1_OPT', label: 'F-1 Student (OPT / STEM)' },
  { value: 'L1', label: 'L-1 (Intracompany)' },
  { value: 'GREEN_CARD', label: 'Permanent Resident (Green Card)' },
  { value: 'US_CITIZEN', label: 'U.S. Citizen' },
  { value: 'B1_B2', label: 'B-1 / B-2 (Visitor)' },
  { value: 'OTHER', label: 'Other Visa' },
];

export const AdminMasterTaxpayerDirectoryScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    records = [],
    totalItems = 0,
    totalPages = 1,
    overallStats,
    isRefreshing,

    searchQuery,
    setSearchQuery,
    selectedStage,
    setSelectedStage,
    selectedSource,
    setSelectedSource,
    selectedLifecycle,
    setSelectedLifecycle,
    selectedTaxYear,
    setSelectedTaxYear,
    selectedVisa,
    setSelectedVisa,
    selectedPriority,
    setSelectedPriority,
    quickStageTab,
    setQuickStageTab,

    page,
    setPage,

    handleResetFilters,
    handleRefresh,
    handleExportCsv,
  } = useMasterTaxpayers();

  const dynamicTaxYears = useMemo(() => {
    const years = generateTaxYears(2, 6);
    return [
      { value: 'ALL', label: 'All Tax Years' },
      ...years.map((y) => ({ value: String(y), label: `Tax Year ${y}` })),
    ];
  }, []);

  const hasActiveFilters = 
    searchQuery.trim() !== '' ||
    selectedStage !== 'ALL' ||
    selectedSource !== 'ALL' ||
    selectedLifecycle !== 'ALL' ||
    selectedTaxYear !== 'ALL' ||
    selectedVisa !== 'ALL' ||
    selectedPriority !== 'ALL' ||
    quickStageTab !== 'ALL';

  const renderStageBadge = (stage: string) => {
    switch (stage) {
      case 'RAW_PROSPECT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
            <Clock className="w-3 h-3 text-amber-500" />
            <span>Raw Ingest</span>
          </span>
        );
      case 'DOC_OUTREACH':
      case 'DOC_COLLECTION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
            <FileText className="w-3 h-3 text-blue-500" />
            <span>Documenter Dept</span>
          </span>
        );
      case 'PREP_IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200 whitespace-nowrap">
            <Clock className="w-3 h-3 text-purple-500" />
            <span>Tax Prep In Progress</span>
          </span>
        );
      case 'QA_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap">
            <ShieldCheck className="w-3 h-3 text-indigo-500" />
            <span>QA Review Audit</span>
          </span>
        );
      case 'SALES_PITCH':
      case 'PAYMENT_PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
            <DollarSign className="w-3 h-3 text-amber-500" />
            <span>Sales & Fee Quote</span>
          </span>
        );
      case 'FILING_READY':
      case 'E_FILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200 whitespace-nowrap">
            <Clock className="w-3 h-3 text-teal-500" />
            <span>E-File Queue</span>
          </span>
        );
      case 'IRS_ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 whitespace-nowrap">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>IRS Accepted</span>
          </span>
        );
      case 'DROPPED_PRICING':
      case 'DROPPED_UNRESPONSIVE':
      case 'DROPPED_SELF_FILED':
      case 'RETURNED_TO_POOL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap">
            <XCircle className="w-3 h-3 text-rose-500" />
            <span>Dropped / Inactive</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
            <span>{stage}</span>
          </span>
        );
    }
  };

  const renderSourceBadge = (source: string, batchRef?: string) => {
    switch (source) {
      case 'DIRECT_SIGNUP':
        return (
          <div className="flex flex-col gap-0.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 w-fit">
              <Globe className="w-3 h-3 text-indigo-600" />
              <span>Direct Sign-up</span>
            </span>
            <span className="text-[10px] text-slate-400 truncate max-w-[140px]">Web Self-Registration</span>
          </div>
        );
      case 'BULK_IMPORT':
        return (
          <div className="flex flex-col gap-0.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200 w-fit">
              <FileSpreadsheet className="w-3 h-3 text-sky-600" />
              <span>Bulk CSV Batch</span>
            </span>
            {batchRef && (
              <span className="text-[10px] text-slate-500 font-mono truncate max-w-[140px]" title={batchRef}>
                {batchRef}
              </span>
            )}
          </div>
        );
      case 'REFERRAL':
        return (
          <div className="flex flex-col gap-0.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200 w-fit">
              <Sparkles className="w-3 h-3 text-purple-600" />
              <span>Client Referral</span>
            </span>
            <span className="text-[10px] text-slate-400">Word of Mouth</span>
          </div>
        );
      default:
        return (
          <div className="flex flex-col gap-0.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 w-fit">
              <User className="w-3 h-3 text-slate-500" />
              <span>Manual Entry</span>
            </span>
            <span className="text-[10px] text-slate-400">Desk Walk-in</span>
          </div>
        );
    }
  };

  const renderLifecycleBadge = (status: string) => {
    switch (status) {
      case 'CONVERTED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
            Converted Client
          </span>
        );
      case 'IN_PIPELINE':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-sky-100 text-sky-800 border border-sky-200">
            In Pipeline
          </span>
        );
      case 'STALLED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-200">
            Stalled Lead
          </span>
        );
      case 'DROPPED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800 border border-rose-200">
            Dropped Lead
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Master Taxpayer Registry & Lifecycle Hub
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>All Ingested Records</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Unified directory of every taxpayer in the platform — whether uploaded via Bulk CSV, Direct Online Sign-up, or Manual Entry — across all filing stages and conversion outcomes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="border-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs rounded-xl"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="border-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs rounded-xl"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* 2. Top Metric KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Ingested Records */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between hover:border-slate-300 transition-colors">
          <div>
            <span className="text-xs font-bold text-slate-500">Total Ingested Taxpayers</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {overallStats?.totalRecords || totalItems || 0}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5 flex items-center gap-1">
              <span>{overallStats?.totalDirectSignups || 0} Direct</span>
              <span>•</span>
              <span>{overallStats?.totalBulkIngested || 0} Bulk CSV</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Successfully Converted Clients */}
        <div className="p-5 rounded-xl bg-white border border-emerald-100 shadow-xs flex items-center justify-between hover:border-emerald-200 transition-colors">
          <div>
            <span className="text-xs font-bold text-emerald-600">Converted Clients</span>
            <div className="text-2xl font-bold text-emerald-700 mt-1">
              {overallStats?.totalConverted || 0}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>{overallStats?.conversionRate || 0}% Overall Conversion</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Active In-Pipeline Stages */}
        <div className="p-5 rounded-xl bg-white border border-sky-100 shadow-xs flex items-center justify-between hover:border-sky-200 transition-colors">
          <div>
            <span className="text-xs font-bold text-sky-600">Active Pipeline</span>
            <div className="text-2xl font-bold text-sky-700 mt-1">
              {overallStats?.totalInPipeline || 0}
            </div>
            <div className="text-[11px] text-sky-500 font-medium mt-0.5">
              In Doc, Prep, Review, Sales & Filing
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Dropped / Stalled Leads */}
        <div className="p-5 rounded-xl bg-white border border-rose-100 shadow-xs flex items-center justify-between hover:border-rose-200 transition-colors">
          <div>
            <span className="text-xs font-bold text-rose-600">Dropped / Inactive</span>
            <div className="text-2xl font-bold text-rose-700 mt-1">
              {overallStats?.totalDroppedOrStalled || 0}
            </div>
            <div className="text-[11px] text-rose-500 font-medium mt-0.5">
              Unresponsive / Pricing Dispute
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Interactive Quick Stage Pills Funnel */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Quick Stage & Funnel Filter</span>
          </span>
          <span className="text-[11px] text-slate-400">Click a stage to isolate records</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => { setQuickStageTab('ALL'); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              quickStageTab === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Taxpayers ({overallStats?.totalRecords || totalItems || 0})
          </button>

          <button
            onClick={() => { setQuickStageTab('INGEST'); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              quickStageTab === 'INGEST'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            1. Raw Ingest ({overallStats?.stageCounts?.['RAW_PROSPECT'] || 0})
          </button>

          <button
            onClick={() => { setQuickStageTab('DOC'); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              quickStageTab === 'DOC'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            2. Documenter Dept ({((overallStats?.stageCounts?.['DOC_OUTREACH'] || 0) + (overallStats?.stageCounts?.['DOC_COLLECTION'] || 0))})
          </button>

          <button
            onClick={() => { setQuickStageTab('PREP'); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              quickStageTab === 'PREP'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
            }`}
          >
            3. Tax Prep ({overallStats?.stageCounts?.['PREP_IN_PROGRESS'] || 0})
          </button>

          <button
            onClick={() => { setQuickStageTab('REVIEW'); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              quickStageTab === 'REVIEW'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
            }`}
          >
            4. QA Review ({overallStats?.stageCounts?.['QA_REVIEW'] || 0})
          </button>

          <button
            onClick={() => { setQuickStageTab('SALES'); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              quickStageTab === 'SALES'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            5. Sales & Quote ({overallStats?.stageCounts?.['SALES_PITCH'] || 0})
          </button>

          <button
            onClick={() => { setQuickStageTab('FILING'); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              quickStageTab === 'FILING'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200'
            }`}
          >
            6. CPA E-Filing ({((overallStats?.stageCounts?.['FILING_READY'] || 0) + (overallStats?.stageCounts?.['E_FILED'] || 0))})
          </button>

          <button
            onClick={() => { setQuickStageTab('CONVERTED'); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              quickStageTab === 'CONVERTED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            7. Converted / Accepted ({overallStats?.totalConverted || 0})
          </button>

          <button
            onClick={() => { setQuickStageTab('DROPPED'); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              quickStageTab === 'DROPPED'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            Dropped / Inactive ({overallStats?.totalDroppedOrStalled || 0})
          </button>
        </div>
      </div>

      {/* 4. Multi-Facet Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-2">
            <AppSearchInput
              value={searchQuery}
              onChange={(val) => { setSearchQuery(val); setPage(1); }}
              placeholder="Search by name, email, phone, SSN last 4, ID, notes..."
              className="w-full h-10 text-xs rounded-xl"
            />
          </div>

          {/* Ingest Source Filter */}
          <AppSelect
            value={selectedSource}
            onChange={(val) => { setSelectedSource(val); setPage(1); }}
            options={SOURCE_OPTIONS}
            className="w-full h-10 text-xs rounded-xl"
          />

          {/* Lifecycle Status Filter */}
          <AppSelect
            value={selectedLifecycle}
            onChange={(val) => { setSelectedLifecycle(val); setPage(1); }}
            options={LIFECYCLE_OPTIONS}
            className="w-full h-10 text-xs rounded-xl"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          {/* Specific Stage Filter */}
          <AppSelect
            value={selectedStage}
            onChange={(val) => { setSelectedStage(val); setPage(1); }}
            options={STAGE_OPTIONS}
            className="w-full h-10 text-xs rounded-xl"
          />

          {/* Tax Year Filter */}
          <AppSelect
            value={selectedTaxYear}
            onChange={(val) => { setSelectedTaxYear(val); setPage(1); }}
            options={dynamicTaxYears}
            className="w-full h-10 text-xs rounded-xl"
          />

          {/* Visa Type Filter */}
          <AppSelect
            value={selectedVisa}
            onChange={(val) => { setSelectedVisa(val); setPage(1); }}
            options={VISA_OPTIONS}
            className="w-full h-10 text-xs rounded-xl"
          />

          {/* Priority & Reset Button */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <PriorityFilterSelect
                value={selectedPriority}
                onChange={(val) => { setSelectedPriority(val); setPage(1); }}
                className="w-full h-10 text-xs rounded-xl"
              />
            </div>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="h-10 px-3 text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Filter feedback badge */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Showing <strong>{records?.length || 0}</strong> of <strong>{totalItems}</strong> matching records (from {overallStats?.totalRecords || totalItems || 0} total platform taxpayers)
          </span>
          {hasActiveFilters && (
            <span className="text-indigo-600 font-semibold text-[11px] bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
              Active Filters Applied
            </span>
          )}
        </div>
      </div>

      {/* 5. Master Taxpayers Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {records.length === 0 ? (
          <div className="py-12">
            <AppEmptyState
              icon={Users}
              title="No Taxpayer Records Found"
              description="No records match your active search and filter criteria. Try resetting filters."
              action={{
                label: 'Clear All Filters',
                onClick: handleResetFilters,
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Taxpayer Profile & SSN</th>
                  <th className="py-3 px-4">Ingest Origin & Channel</th>
                  <th className="py-3 px-4">Operational Stage</th>
                  <th className="py-3 px-4">Lifecycle Status</th>
                  <th className="py-3 px-4">Assigned Dept / Staff</th>
                  <th className="py-3 px-4">Tax Year(s)</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((taxpayer) => (
                  <tr
                    key={taxpayer.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/admin/all-taxpayers/${taxpayer.customerId || taxpayer.id}`)}
                  >
                    {/* Taxpayer Identity */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 font-bold flex items-center justify-center text-xs border border-slate-200 shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                          {taxpayer.firstName[0]}
                          {taxpayer.lastName[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 text-xs">
                              {taxpayer.firstName} {taxpayer.lastName}
                            </span>
                            <ClientPaymentStatusChip lead={taxpayer} size="xs" />
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {taxpayer.visaType}
                            </span>
                            <PriorityBadge priority={taxpayer.priority} size="sm" />
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500 font-mono" onClick={(e) => e.stopPropagation()}>
                            <span>SSN: {taxpayer.ssnMasked}</span>
                            <AppCopyButton text={taxpayer.fullSsn} />
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400" onClick={(e) => e.stopPropagation()}>
                            <span className="truncate max-w-[150px]">{taxpayer.email}</span>
                            <AppCopyButton text={taxpayer.email} />
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Acquisition Source */}
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      {renderSourceBadge(taxpayer.acquisitionSource, taxpayer.batchRef)}
                    </td>

                    {/* Operational Stage */}
                    <td className="py-3 px-4">
                      {renderStageBadge(taxpayer.currentStage)}
                      <div className="text-[10px] text-slate-400 mt-1">
                        Active in <strong className="text-slate-600">{taxpayer.currentDepartment}</strong>
                      </div>
                    </td>

                    {/* Lifecycle Status */}
                    <td className="py-3 px-4">
                      {renderLifecycleBadge(taxpayer.lifecycleStatus)}
                      {taxpayer.dropReason && (
                        <div className="text-[10px] text-rose-600 font-medium truncate max-w-[160px] mt-1" title={taxpayer.dropReason}>
                          {taxpayer.dropReason}
                        </div>
                      )}
                    </td>

                    {/* Assigned Staff */}
                    <td className="py-3 px-4">
                      {taxpayer.assignedAgent ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {taxpayer.assignedAgent.name[0]}
                          </div>
                          <div className="truncate max-w-[130px]">
                            <div className="text-xs font-medium text-slate-900 truncate">
                              {taxpayer.assignedAgent.name}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {taxpayer.assignedAgent.role}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Unassigned Pool</span>
                      )}
                    </td>

                    {/* Tax Years */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {taxpayer.taxYears.map((ty) => (
                          <span
                            key={ty.year}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                              ty.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : ty.status === 'IN_PROGRESS'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            TY{ty.year}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/all-taxpayers/${taxpayer.customerId || taxpayer.id}`)}
                          className="h-8 text-xs font-bold border-slate-200 hover:bg-slate-900 hover:text-white transition-colors cursor-pointer rounded-lg flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect 360</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 6. Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalItems} total records)
            </div>
            <AppPagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};
