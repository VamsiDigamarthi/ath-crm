import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDocumenterWorkspace } from '../hooks/useDocumenterWorkspace';
import { Button } from '@/shared/components/Button';
import { AppCopyButton } from '@/shared/components/AppCopyButton';
import { AppTable, type ColumnDef } from '@/shared/components/AppTable';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
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
import type { DocumenterLeadItem } from '../types/documenter.types';

export const DocumenterAgentPrepScreen: React.FC = () => {
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

  const navigate = useNavigate();
  const {
    leads,
    stats,
    isLoading,
    searchQuery,
    setSearchQuery,
    visaFilter,
    setVisaFilter,
    page,
    limit,
    totalPages,
    totalItems,
    handlePageChange,
    handleLimitChange,
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

  // Table Columns Definition: Name, Email, Phone, Document Status, Actions
  const columns: ColumnDef<DocumenterLeadItem>[] = useMemo(
    () => [
      {
        header: 'Taxpayer Client',
        accessorKey: 'customer.fullName',
        width: '260px',
        headerClassName: 'min-w-[260px]',
        cellClassName: 'min-w-[260px]',
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
              <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-[#16A34A] group-hover:text-white transition-colors">
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-xs text-slate-900 group-hover:text-[#16A34A] transition-colors truncate">
                    {displayName}
                  </span>
                  {renderVisaBadge(c.visaType)}
                </div>
                <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5 flex items-center gap-1.5">
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
        width: '110px',
        headerClassName: 'min-w-[110px] text-right',
        cellClassName: 'min-w-[110px] text-right',
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

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      {/* 1. Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            My Documents &amp; Intake Files
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Qualified taxpayers transitioned from calling outreach into document collection and tax preparation.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
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
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
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

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="w-full sm:w-80">
          <AppSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, email, phone..."
            debounceMs={300}
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Visa Filter */}
          <div className="relative">
            <select
              value={visaFilter}
              onChange={(e) => setVisaFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs cursor-pointer"
            >
              <option value="ALL">All Visas</option>
              <option value="H-1B">H-1B Visa</option>
              <option value="F-1 OPT">F-1 OPT</option>
              <option value="L-1">L-1 Visa</option>
              <option value="GREEN_CARD">Green Card</option>
              <option value="US_CITIZEN">US Citizen</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Documents Table */}
      <AppTable<DocumenterLeadItem>
        data={prepLeads}
        columns={columns}
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
