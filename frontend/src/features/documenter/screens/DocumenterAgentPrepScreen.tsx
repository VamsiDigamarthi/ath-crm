import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDocumenterWorkspace } from '../hooks/useDocumenterWorkspace';
import { Button } from '@/shared/components/Button';
import { AppCopyButton } from '@/shared/components/AppCopyButton';
import { AppTable, type ColumnDef } from '@/shared/components/AppTable';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
import { AppFilterFlyout, type FilterCategory } from '@/shared/components/AppFilterFlyout';
import { AppColumnConfigDropdown, type ColumnConfigItem } from '@/shared/components/AppColumnConfigDropdown';
import { 
  FileCheck2, 
  Send, 
  RefreshCw, 
  Clock, 
  Eye, 
  Sparkles, 
  FileText,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { renderVisaBadge } from '../columns/documenter-columns';
import { ClientPaymentStatusChip } from '@/shared/components/ClientPaymentStatusChip';
import type { DocumenterLeadItem } from '../types/documenter.types';

const AVAILABLE_COLUMNS: ColumnConfigItem[] = [
  { id: 'taxpayer', label: 'Taxpayer Client', defaultVisible: true, locked: true },
  { id: 'email', label: 'Email', defaultVisible: true },
  { id: 'phone', label: 'Phone', defaultVisible: true },
  { id: 'doc_status', label: 'Document Status', defaultVisible: true },
  { id: 'actions', label: 'Actions', defaultVisible: true, locked: true },
];

export const DocumenterAgentPrepScreen: React.FC = () => {
  // 1. Collapsible Top Summary Cards State (Persisted)
  const [isStatsCollapsed, setIsStatsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ath_docs_queue_stats_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleStats = () => {
    setIsStatsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('ath_docs_queue_stats_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // 2. Visible Columns State (Persisted)
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(() => {
    const lockedIds = AVAILABLE_COLUMNS.filter((c) => c.locked).map((c) => c.id);
    try {
      const saved = localStorage.getItem('ath_docs_queue_visible_columns');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return Array.from(new Set([...lockedIds, ...parsed]));
        }
      }
    } catch {}
    return AVAILABLE_COLUMNS.map((c) => c.id);
  });

  const navigate = useNavigate();
  const {
    leads,
    stats,
    isLoading,
    searchQuery,
    setSearchQuery,
    visaFilter,
    handleVisaChange,
    priorityFilter,
    handlePriorityChange,
    page,
    limit,
    totalPages,
    totalItems,
    handlePageChange,
    handleLimitChange,
    selectedRows,
    setSelectedRows,
    refreshData,
  } = useDocumenterWorkspace('PREP');

  const prepLeads = leads;

  // Real count of leads with prepared draft calculations
  const readyForSalesCount = useMemo(() => {
    return prepLeads.filter((l) => Boolean((l.taxDraftSummary as any)?.estimatedFedRefund)).length;
  }, [prepLeads]);

  // Real count of files with at least one uploaded document
  const uploadedDocsCount = useMemo(() => {
    return prepLeads.filter((l) => (l.documents && l.documents.length > 0)).length;
  }, [prepLeads]);

  // 3. Filter Categories for 2-Column Flyout
  const filterCategories = useMemo<FilterCategory[]>(() => [
    {
      id: 'priority',
      label: 'Priority',
      options: [
        { label: 'All Priorities', value: 'ALL' },
        { label: 'High Priority (P1)', value: 'HIGH' },
        { label: 'Medium Priority (P2)', value: 'MEDIUM' },
        { label: 'Low Priority (P3)', value: 'LOW' },
      ],
    },
    {
      id: 'visa',
      label: 'Visa Type',
      options: [
        { label: 'All Visas', value: 'ALL' },
        { label: 'H-1B Specialty Occupation', value: 'H-1B' },
        { label: 'L-1 Intracompany Transferee', value: 'L-1' },
        { label: 'F-1 OPT Student', value: 'F-1 OPT' },
        { label: 'H-4 Dependent', value: 'H-4' },
        { label: 'Green Card (Permanent Resident)', value: 'GREEN_CARD' },
        { label: 'US Citizen', value: 'US_CITIZEN' },
      ],
    },
  ], []);

  // 4. Selected Filters Mapping
  const activeFilters = useMemo<Record<string, string[]>>(() => ({
    priority: priorityFilter === 'ALL' ? ['ALL'] : priorityFilter.split(','),
    visa: visaFilter === 'ALL' ? ['ALL'] : visaFilter.split(','),
  }), [priorityFilter, visaFilter]);

  const handleApplyFilters = (newFilters: Record<string, string[]>) => {
    const validPriorities = (newFilters.priority || []).filter((v) => v !== 'ALL' && v !== '');
    const priorityVal = validPriorities.length === 0 ? 'ALL' : validPriorities.join(',');
    if (priorityVal !== priorityFilter) {
      handlePriorityChange(priorityVal);
    }
    
    const validVisas = (newFilters.visa || []).filter((v) => v !== 'ALL' && v !== '');
    const visaVal = validVisas.length === 0 ? 'ALL' : validVisas.join(',');
    if (visaVal !== visaFilter) {
      handleVisaChange(visaVal);
    }
  };

  // 5. Generate and Filter Columns Dynamically
  const allColumns: ColumnDef<DocumenterLeadItem>[] = useMemo(
    () => [
      {
        header: 'Taxpayer Client',
        accessorKey: 'customer.fullName',
        width: '280px',
        headerClassName: 'min-w-[280px]',
        cellClassName: 'min-w-[280px]',
        render: (item) => {
          const c = item.customer;
          const displayName = c.fullName || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Taxpayer';
          const initial = c.firstName?.[0]?.toUpperCase() || c.lastName?.[0]?.toUpperCase() || 'T';

          return (
            <Link
              to={`/documenter/agent/lead/${item.id}?from=documents`}
              state={{ from: 'agent_documents' }}
              className="flex items-center gap-3 group text-left cursor-pointer min-w-0"
              title="View Client Documents & 360 File"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 group-hover:from-emerald-100 group-hover:to-teal-200 border border-slate-200 group-hover:border-emerald-300 text-slate-700 group-hover:text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs transition-all">
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#16A34A] transition-colors truncate">
                    {displayName}
                  </span>
                  {renderVisaBadge(c.visaType)}
                  <ClientPaymentStatusChip lead={item} size="xs" />
                </div>
                <div className="text-[11px] text-slate-500 font-normal mt-0.5 truncate flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    TY {item.taxYear}
                  </span>
                  <span>•</span>
                  <span>{item.filingType || 'INDIVIDUAL'}</span>
                </div>
              </div>
            </Link>
          );
        },
      },
      {
        header: 'Email',
        accessorKey: 'customer.email',
        width: '220px',
        headerClassName: 'min-w-[220px]',
        cellClassName: 'min-w-[220px]',
        render: (item) => (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-800 truncate max-w-[180px]">
              {item.customer.email || 'No email provided'}
            </span>
            {item.customer.email && <AppCopyButton text={item.customer.email} size="sm" />}
          </div>
        ),
      },
      {
        header: 'Phone',
        accessorKey: 'customer.phone',
        width: '180px',
        headerClassName: 'min-w-[180px]',
        cellClassName: 'min-w-[180px]',
        render: (item) => (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
            <span>{item.customer.phone || 'No phone'}</span>
            {item.customer.phone && <AppCopyButton text={item.customer.phone} size="sm" />}
          </div>
        ),
      },
      {
        header: 'Document Status',
        accessorKey: 'documents',
        width: '240px',
        headerClassName: 'min-w-[240px]',
        cellClassName: 'min-w-[240px]',
        render: (item) => {
          const docsCount = item.documents?.length || 0;
          const verifiedCount = item.documents?.filter((d: any) => d.verificationStatus === 'VERIFIED').length || 0;
          const draft = item.taxDraftSummary as any;
          const hasDraft = typeof draft?.estimatedFedRefund === 'number';

          if (docsCount > 0) {
            return (
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <FileCheck2 className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>{docsCount} Document{docsCount > 1 ? 's' : ''} Uploaded</span>
                </span>
                {verifiedCount > 0 ? (
                  <div className="text-[10px] text-emerald-700 font-semibold pl-1">
                    ✓ {verifiedCount} of {docsCount} Verified
                  </div>
                ) : (
                  <div className="text-[10px] text-amber-700 font-semibold pl-1">
                    ⏳ Pending Review
                  </div>
                )}
              </div>
            );
          }

          return (
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Awaiting Client Upload</span>
              </span>
              {hasDraft && (
                <div className="text-[10px] text-purple-700 font-bold pl-1">
                  Draft: +${draft.estimatedFedRefund.toLocaleString()}
                </div>
              )}
            </div>
          );
        },
      },
      {
        header: 'Actions',
        accessorKey: 'id',
        width: '120px',
        headerClassName: 'min-w-[120px] text-right',
        cellClassName: 'min-w-[120px] text-right',
        render: (item) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/documenter/agent/lead/${item.id}?from=documents`, { state: { from: 'agent_documents' } })}
            className="border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-[#16A34A] text-xs font-bold flex items-center gap-1.5 cursor-pointer ml-auto shadow-2xs h-8 px-3 rounded-lg transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View</span>
          </Button>
        ),
      },
    ],
    [navigate]
  );

  const columns = useMemo(() => {
    return allColumns.filter((col) => {
      if (col.header === 'Taxpayer Client') return visibleColumnIds.includes('taxpayer');
      if (col.header === 'Email') return visibleColumnIds.includes('email');
      if (col.header === 'Phone') return visibleColumnIds.includes('phone');
      if (col.header === 'Document Status') return visibleColumnIds.includes('doc_status');
      if (col.header === 'Actions') return visibleColumnIds.includes('actions');
      return true;
    });
  }, [allColumns, visibleColumnIds]);

  return (
    <div className="space-y-4 pb-12 font-sans animate-in fade-in duration-150">
      {/* 1. Header & Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              My Documents &amp; Intake Files
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
              <FileCheck2 className="w-3 h-3 text-purple-600" />
              <span>Doc Intake</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Qualified taxpayers transitioned from calling outreach into document collection and tax preparation.
          </p>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards (Collapsible) */}
      {!isStatsCollapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Card 1: Active Intakes */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Active Intakes in Pipeline
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 font-bold">
                <FileCheck2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {stats.inPrep || totalItems || prepLeads.length}
              </div>
              <div className="text-xs text-purple-600 font-medium mt-1">
                Qualified taxpayers ready for document prep
              </div>
            </div>
          </div>

          {/* Card 2: Uploaded Documents */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Files with Documents
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center border border-emerald-100 font-bold">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {uploadedDocsCount}
              </div>
              <div className="text-xs text-[#16A34A] font-medium mt-1 flex items-center gap-1">
                <span>{uploadedDocsCount > 0 ? `${uploadedDocsCount} clients uploaded tax files` : 'Awaiting uploads'}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Ready for Sales */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Ready for Calculation / Sales
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 font-bold">
                <Send className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {readyForSalesCount}
              </div>
              <div className="text-xs text-blue-600 font-medium mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-500" />
                <span>{readyForSalesCount > 0 ? `${readyForSalesCount} files ready for sales pitch` : 'Drafts in progress'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Sleek Enterprise Toolbar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pt-1">
        {/* Left: Search Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 min-w-0">
          <div className="w-full sm:w-72 lg:w-80 shrink-0">
            <AppSearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search documents by name, email, phone..."
              debounceMs={300}
            />
          </div>
        </div>

        {/* Right: Filters Flyout + Columns Config + Collapse Toggle + Refresh */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          <AppFilterFlyout
            categories={filterCategories}
            selectedFilters={activeFilters}
            onApply={handleApplyFilters}
            onReset={() => {
              handlePriorityChange('ALL');
              handleVisaChange('ALL');
            }}
          />

          <AppColumnConfigDropdown
            columns={AVAILABLE_COLUMNS}
            visibleColumnIds={visibleColumnIds}
            onChange={setVisibleColumnIds}
            storageKey="ath_docs_queue_visible_columns"
          />

          <Button
            variant="outline"
            size="sm"
            onClick={toggleStats}
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
            title={isStatsCollapsed ? 'Expand summary cards' : 'Collapse summary cards to see more rows'}
          >
            {isStatsCollapsed ? (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                <span>Expand Cards</span>
              </>
            ) : (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                <span>Collapse Cards</span>
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* 4. Documents AppTable */}
      <AppTable<DocumenterLeadItem>
        data={prepLeads}
        columns={columns}
        selectedRows={selectedRows}
        onSelectionChange={(selected) => setSelectedRows(selected)}
        isLoading={isLoading}
        rowKey="id"
        emptyText="No document files in prep right now."
        emptyContent={
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3 border border-purple-100 font-bold">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Document Files Yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              When you qualify a lead with <strong>Connected - Interested</strong> or start a tax return, the file will automatically move here for document collection.
            </p>
          </div>
        }
        pagination={{
          currentPage: page,
          totalPages,
          totalItems: totalItems || prepLeads.length,
          itemsPerPage: limit,
          perPageOptions: [5, 10, 20, 50],
          onPageChange: handlePageChange,
          onPerPageChange: handleLimitChange,
        }}
      />
    </div>
  );
};
