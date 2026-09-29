import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMasterTaxpayers } from '../hooks/useMasterTaxpayers';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
import { AppPagination } from '@/shared/components/AppPagination';
import { AppEmptyState } from '@/shared/components/AppEmptyState';
import { AppFilterFlyout, type FilterCategory } from '@/shared/components/AppFilterFlyout';
import { AppColumnConfigDropdown, type ColumnConfigItem } from '@/shared/components/AppColumnConfigDropdown';
import { Button } from '@/shared/components/Button';
import { PriorityBadge } from '@/shared/components/PriorityBadge';
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
  Eye,
  Sparkles,
  TrendingUp,
  Layers,
  FileText,
  DollarSign,
  ShieldCheck,
  User,
  XCircle,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

const AVAILABLE_COLUMNS: ColumnConfigItem[] = [
  { id: 'profile', label: 'Taxpayer Profile & SSN', defaultVisible: true, locked: true },
  { id: 'source', label: 'Ingest Origin & Channel', defaultVisible: true },
  { id: 'stage', label: 'Operational Stage', defaultVisible: true },
  { id: 'lifecycle', label: 'Lifecycle Status', defaultVisible: true },
  { id: 'team', label: 'Assigned Dept / Staff', defaultVisible: true },
  { id: 'tax_years', label: 'Tax Year(s)', defaultVisible: true },
  { id: 'actions', label: 'Actions', defaultVisible: true, locked: true },
];

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

  // 1. Collapsible Top Metric Summary Cards State (Persisted, Default Collapsed)
  const [isStatsCollapsed, setIsStatsCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('ath_admin_data_stats_collapsed');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const toggleStats = () => {
    setIsStatsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('ath_admin_data_stats_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // 2. Column Visibility Config (Persisted)
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(() => {
    const lockedIds = AVAILABLE_COLUMNS.filter((c) => c.locked).map((c) => c.id);
    try {
      const saved = localStorage.getItem('ath_admin_data_visible_columns');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return Array.from(new Set([...lockedIds, ...parsed]));
        }
      }
    } catch {}
    return AVAILABLE_COLUMNS.map((c) => c.id);
  });

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

  // 3. Consolidated Filter Categories for 2-Column Flyout
  const filterCategories = useMemo<FilterCategory[]>(() => {
    return [
      {
        id: 'quickStage',
        label: 'Funnel Stage',
        options: [
          { label: `All Taxpayers (${overallStats?.totalRecords || totalItems || 0})`, value: 'ALL' },
          { label: `1. Raw Ingest (${overallStats?.stageCounts?.['RAW_PROSPECT'] || 0})`, value: 'INGEST' },
          { label: `2. Documenter Dept (${(overallStats?.stageCounts?.['DOC_OUTREACH'] || 0) + (overallStats?.stageCounts?.['DOC_COLLECTION'] || 0)})`, value: 'DOC' },
          { label: `3. Tax Prep (${overallStats?.stageCounts?.['PREP_IN_PROGRESS'] || 0})`, value: 'PREP' },
          { label: `4. QA Review (${overallStats?.stageCounts?.['QA_REVIEW'] || 0})`, value: 'REVIEW' },
          { label: `5. Sales & Quote (${overallStats?.stageCounts?.['SALES_PITCH'] || 0})`, value: 'SALES' },
          { label: `6. CPA E-Filing (${(overallStats?.stageCounts?.['FILING_READY'] || 0) + (overallStats?.stageCounts?.['E_FILED'] || 0)})`, value: 'FILING' },
          { label: `7. Converted / Accepted (${overallStats?.totalConverted || 0})`, value: 'CONVERTED' },
          { label: `Dropped / Inactive (${overallStats?.totalDroppedOrStalled || 0})`, value: 'DROPPED' },
        ],
      },
      {
        id: 'source',
        label: 'Ingest Source',
        options: SOURCE_OPTIONS,
      },
      {
        id: 'lifecycle',
        label: 'Lifecycle Status',
        options: LIFECYCLE_OPTIONS,
      },
      {
        id: 'stage',
        label: 'Operational Stage',
        options: STAGE_OPTIONS,
      },
      {
        id: 'taxYear',
        label: 'Tax Year',
        options: dynamicTaxYears,
      },
      {
        id: 'visa',
        label: 'Visa Classification',
        options: VISA_OPTIONS,
      },
      {
        id: 'priority',
        label: 'Priority Level',
        options: [
          { value: 'ALL', label: 'All Priorities' },
          { value: 'HIGH', label: 'High Priority (P1)' },
          { value: 'MEDIUM', label: 'Medium Priority (P2)' },
          { value: 'LOW', label: 'Low Priority (P3)' },
        ],
      },
    ];
  }, [overallStats, totalItems, dynamicTaxYears]);

  // Active filters mapping for flyout
  const activeFilters = useMemo<Record<string, string[]>>(() => ({
    quickStage: [quickStageTab],
    source: [selectedSource],
    lifecycle: [selectedLifecycle],
    stage: [selectedStage],
    taxYear: [selectedTaxYear],
    visa: [selectedVisa],
    priority: selectedPriority === 'ALL' ? ['ALL'] : selectedPriority.split(','),
  }), [quickStageTab, selectedSource, selectedLifecycle, selectedStage, selectedTaxYear, selectedVisa, selectedPriority]);

  const handleApplyFilters = (newFilters: Record<string, string[]>) => {
    // Sync Funnel stage
    const newQuick = newFilters.quickStage?.[0] || 'ALL';
    if (newQuick !== quickStageTab) {
      setQuickStageTab(newQuick as any);
      setPage(1);
    }

    // Sync Source
    const newSource = newFilters.source?.[0] || 'ALL';
    if (newSource !== selectedSource) {
      setSelectedSource(newSource);
      setPage(1);
    }

    // Sync Lifecycle
    const newLifecycle = newFilters.lifecycle?.[0] || 'ALL';
    if (newLifecycle !== selectedLifecycle) {
      setSelectedLifecycle(newLifecycle);
      setPage(1);
    }

    // Sync Stage
    const newStage = newFilters.stage?.[0] || 'ALL';
    if (newStage !== selectedStage) {
      setSelectedStage(newStage);
      setPage(1);
    }

    // Sync Tax Year
    const newYear = newFilters.taxYear?.[0] || 'ALL';
    if (newYear !== selectedTaxYear) {
      setSelectedTaxYear(newYear);
      setPage(1);
    }

    // Sync Visa
    const newVisa = newFilters.visa?.[0] || 'ALL';
    if (newVisa !== selectedVisa) {
      setSelectedVisa(newVisa);
      setPage(1);
    }

    // Sync Priority
    const validPriorities = (newFilters.priority || []).filter((v) => v !== 'ALL' && v !== '');
    const priorityVal = validPriorities.length === 0 ? 'ALL' : validPriorities.join(',');
    if (priorityVal !== selectedPriority) {
      setSelectedPriority(priorityVal);
      setPage(1);
    }
  };

  const renderStageBadge = (stage: string) => {
    let label = stage.replace(/_/g, ' ');
    let Icon = Clock;

    switch (stage) {
      case 'RAW_PROSPECT':
        label = 'Raw Ingest';
        Icon = Clock;
        break;
      case 'DOC_OUTREACH':
      case 'DOC_COLLECTION':
        label = 'Documenter Dept';
        Icon = FileText;
        break;
      case 'PREP_IN_PROGRESS':
        label = 'Tax Prep';
        Icon = Clock;
        break;
      case 'QA_REVIEW':
        label = 'QA Review';
        Icon = ShieldCheck;
        break;
      case 'SALES_PITCH':
      case 'PAYMENT_PENDING':
        label = 'Sales & Quote';
        Icon = DollarSign;
        break;
      case 'FILING_READY':
      case 'E_FILED':
        label = 'E-File Queue';
        Icon = Clock;
        break;
      case 'IRS_ACCEPTED':
        label = 'IRS Accepted';
        Icon = CheckCircle2;
        break;
      case 'DROPPED_PRICING':
      case 'DROPPED_UNRESPONSIVE':
      case 'DROPPED_SELF_FILED':
      case 'RETURNED_TO_POOL':
        label = 'Dropped / Inactive';
        Icon = XCircle;
        break;
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap shadow-2xs">
        <Icon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <span>{label}</span>
      </span>
    );
  };

  const renderSourceBadge = (source: string, batchRef?: string) => {
    let label = 'Manual Entry';
    let sublabel = 'Desk Walk-in';
    let Icon = User;

    switch (source) {
      case 'DIRECT_SIGNUP':
        label = 'Direct Sign-up';
        sublabel = 'Web Self-Registration';
        Icon = Globe;
        break;
      case 'BULK_IMPORT':
        label = 'Bulk CSV Batch';
        sublabel = batchRef || 'Bulk Ingest Batch';
        Icon = FileSpreadsheet;
        break;
      case 'REFERRAL':
        label = 'Client Referral';
        sublabel = 'Word of Mouth';
        Icon = Sparkles;
        break;
    }

    return (
      <div className="flex flex-col gap-0.5">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 w-fit shadow-2xs">
          <Icon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>{label}</span>
        </span>
        <span className="text-[10px] text-slate-400 font-medium truncate max-w-[140px]" title={sublabel}>
          {sublabel}
        </span>
      </div>
    );
  };

  const renderLifecycleBadge = (status: string) => {
    let label = status.replace(/_/g, ' ');
    if (status === 'CONVERTED') label = 'Converted Client';
    else if (status === 'IN_PIPELINE') label = 'In Pipeline';
    else if (status === 'STALLED') label = 'Stalled Lead';
    else if (status === 'DROPPED') label = 'Dropped Lead';

    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap shadow-2xs">
        {label}
      </span>
    );
  };

  return (
    <div className="space-y-4 font-sans pb-12 animate-in fade-in duration-150">
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
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Unified directory of every taxpayer in the platform — whether uploaded via Bulk CSV, Direct Online Sign-up, or Manual Entry — across all filing stages and conversion outcomes.
          </p>
        </div>
      </div>

      {/* 2. Top Metric KPI Summary Cards (Collapsible with Persistence) */}
      {!isStatsCollapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Card 1: Total Ingested Taxpayers */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between hover:border-indigo-300 transition-all">
            <div>
              <span className="text-xs font-semibold text-slate-500">Total Ingested Taxpayers</span>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
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

          {/* Card 2: Successfully Converted Clients */}
          <div className="p-5 rounded-xl bg-white border border-emerald-100 shadow-xs flex items-center justify-between hover:border-emerald-300 transition-all">
            <div>
              <span className="text-xs font-semibold text-emerald-600">Converted Clients</span>
              <div className="text-2xl sm:text-3xl font-bold text-emerald-700 tracking-tight mt-1">
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

          {/* Card 3: Active Pipeline */}
          <div className="p-5 rounded-xl bg-white border border-sky-100 shadow-xs flex items-center justify-between hover:border-sky-300 transition-all">
            <div>
              <span className="text-xs font-semibold text-sky-600">Active Pipeline</span>
              <div className="text-2xl sm:text-3xl font-bold text-sky-700 tracking-tight mt-1">
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

          {/* Card 4: Dropped / Inactive */}
          <div className="p-5 rounded-xl bg-white border border-rose-100 shadow-xs flex items-center justify-between hover:border-rose-300 transition-all">
            <div>
              <span className="text-xs font-semibold text-rose-600">Dropped / Inactive</span>
              <div className="text-2xl sm:text-3xl font-bold text-rose-700 tracking-tight mt-1">
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
      )}

      {/* 3. Sleek Enterprise Toolbar (Clean Flat Layout matching Files screen) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Left: Search Input */}
        <div className="w-full sm:w-80 md:w-96">
          <AppSearchInput
            value={searchQuery}
            onChange={(val) => { setSearchQuery(val); setPage(1); }}
            placeholder="Search by name, email, phone, SSN last 4, ID, notes..."
            debounceMs={300}
            className="w-full"
          />
        </div>

        {/* Right: Filters Flyout + Columns Config + Collapse Toggle + Export CSV + Refresh */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          {/* Advanced 2-Column Filter Flyout */}
          <AppFilterFlyout
            categories={filterCategories}
            selectedFilters={activeFilters}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
          />

          {/* Dynamic Column Visibility Configuration */}
          <AppColumnConfigDropdown
            columns={AVAILABLE_COLUMNS}
            visibleColumnIds={visibleColumnIds}
            onChange={setVisibleColumnIds}
            storageKey="ath_admin_data_visible_columns"
          />

          {/* Expand/Collapse KPI Cards Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleStats}
            className="h-9 border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer rounded-xl bg-white hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs"
            title={isStatsCollapsed ? 'Expand Summary Cards' : 'Collapse Summary Cards'}
          >
            {isStatsCollapsed ? (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Expand Cards</span>
              </>
            ) : (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Collapse</span>
              </>
            )}
          </Button>

          {/* Export CSV Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="h-9 border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer rounded-xl bg-white hover:bg-slate-50 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-9 border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer rounded-xl bg-white hover:bg-slate-50 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* 4. Master Taxpayers Table */}
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
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500">
                  {visibleColumnIds.includes('profile') && (
                    <th className="py-3.5 px-4">Taxpayer Profile & SSN</th>
                  )}
                  {visibleColumnIds.includes('source') && (
                    <th className="py-3.5 px-4">Ingest Origin & Channel</th>
                  )}
                  {visibleColumnIds.includes('stage') && (
                    <th className="py-3.5 px-4">Operational Stage</th>
                  )}
                  {visibleColumnIds.includes('lifecycle') && (
                    <th className="py-3.5 px-4">Lifecycle Status</th>
                  )}
                  {visibleColumnIds.includes('team') && (
                    <th className="py-3.5 px-4">Assigned Dept / Staff</th>
                  )}
                  {visibleColumnIds.includes('tax_years') && (
                    <th className="py-3.5 px-4">Tax Year(s)</th>
                  )}
                  {visibleColumnIds.includes('actions') && (
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {records.map((taxpayer) => (
                  <tr
                    key={taxpayer.id}
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/admin/all-taxpayers/${taxpayer.customerId || taxpayer.id}`)}
                  >
                    {/* 1. Taxpayer Identity (No Avatar box) */}
                    {visibleColumnIds.includes('profile') && (
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors flex items-center gap-1.5 flex-wrap">
                            <span>{taxpayer.firstName} {taxpayer.lastName}</span>
                            <ClientPaymentStatusChip lead={taxpayer} size="xs" />
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {taxpayer.visaType}
                            </span>
                            <PriorityBadge priority={taxpayer.priority} size="sm" />
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <span>SSN: {taxpayer.ssnMasked}</span>
                            <span>•</span>
                            <span className="text-slate-400 truncate max-w-[180px]">{taxpayer.email}</span>
                          </div>
                        </div>
                      </td>
                    )}

                    {/* 2. Acquisition Source */}
                    {visibleColumnIds.includes('source') && (
                      <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                        {renderSourceBadge(taxpayer.acquisitionSource, taxpayer.batchRef)}
                      </td>
                    )}

                    {/* 3. Operational Stage */}
                    {visibleColumnIds.includes('stage') && (
                      <td className="py-4 px-4">
                        {renderStageBadge(taxpayer.currentStage)}
                        <div className="text-[10px] text-slate-400 mt-1">
                          Active in <strong className="text-slate-600">{taxpayer.currentDepartment}</strong>
                        </div>
                      </td>
                    )}

                    {/* 4. Lifecycle Status */}
                    {visibleColumnIds.includes('lifecycle') && (
                      <td className="py-4 px-4">
                        {renderLifecycleBadge(taxpayer.lifecycleStatus)}
                        {taxpayer.dropReason && (
                          <div className="text-[10px] text-rose-600 font-medium truncate max-w-[160px] mt-1" title={taxpayer.dropReason}>
                            {taxpayer.dropReason}
                          </div>
                        )}
                      </td>
                    )}

                    {/* 5. Assigned Staff */}
                    {visibleColumnIds.includes('team') && (
                      <td className="py-4 px-4">
                        {taxpayer.assignedAgent ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0 border border-slate-200">
                              {taxpayer.assignedAgent.name[0]}
                            </div>
                            <div className="truncate max-w-[130px]">
                              <div className="text-xs font-semibold text-slate-900 truncate">
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
                    )}

                    {/* 6. Tax Years */}
                    {visibleColumnIds.includes('tax_years') && (
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {taxpayer.taxYears.map((ty) => (
                            <span
                              key={ty.year}
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200"
                            >
                              TY{ty.year}
                            </span>
                          ))}
                        </div>
                      </td>
                    )}

                    {/* 7. Actions */}
                    {visibleColumnIds.includes('actions') && (
                      <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/all-taxpayers/${taxpayer.customerId || taxpayer.id}`)}
                            className="w-8 h-8 p-0 border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 cursor-pointer rounded-lg bg-white shadow-2xs flex items-center justify-center transition-all"
                            title="Inspect 360 Taxpayer Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100">
            <AppPagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={10}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};
