import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  X, 
  Users, 
  ShieldAlert, 
  Search, 
  Sparkles, 
  FileSpreadsheet, 
  Download 
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import type { BulkImportServerResult } from '../types/bulk-import.types';

interface BulkImportResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: BulkImportServerResult | null;
}

export const BulkImportResultModal: React.FC<BulkImportResultModalProps> = ({
  isOpen,
  onClose,
  result,
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const totalReceived = result?.totalReceived ?? 0;
  const validProcessed = result?.validProcessed ?? 0;
  const newProfilesCreated = result?.newProfilesCreated ?? 0;
  const duplicatesSkipped = result?.duplicatesSkipped ?? 0;
  const skippedLeads = result?.skippedLeads ?? [];
  const taxYear = result?.taxYear ?? 2025;
  const processingTimeMs = result?.processingTimeMs ?? 0;
  const hasSkipped = skippedLeads.length > 0;

  // Filter skipped leads by search query and category (Hooks must run unconditionally!)
  const filteredSkippedLeads = useMemo(() => {
    if (!skippedLeads.length) return [];
    return skippedLeads.filter((item) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.taxpayerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.email && item.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.phone && item.phone.includes(searchQuery)) ||
        (item.ssnTin && item.ssnTin.includes(searchQuery)) ||
        item.reason.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        filterCategory === 'ALL' || item.reasonCategory === filterCategory;

      return matchesSearch && matchesCat;
    });
  }, [skippedLeads, searchQuery, filterCategory]);

  if (!isOpen || !result) return null;

  const getCategoryBadge = (category?: string) => {
    switch (category) {
      case 'EXISTING_CONVERTED_CUSTOMER':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <Sparkles className="w-3 h-3 text-rose-600" />
            <span>Already Converted Client</span>
          </span>
        );
      case 'EXISTING_CUSTOMER_PROFILE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
            <Users className="w-3 h-3 text-amber-700" />
            <span>Existing Customer Profile</span>
          </span>
        );
      case 'EXISTING_USER_ACCOUNT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <span>Existing Portal Account</span>
          </span>
        );
      case 'DUPLICATE_APPLICATION':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <span>Duplicate TY Filing</span>
          </span>
        );
      case 'IN_SHEET_DUPLICATE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <span>In-Sheet Duplicate</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
            <span>Validation Blocked</span>
          </span>
        );
    }
  };

  const handleExportSkippedCSV = () => {
    if (skippedLeads.length === 0) return;
    const headers = ['Row Number', 'Taxpayer Name', 'Email', 'Phone', 'SSN/TIN', 'Category', 'Rejection Reason'];
    const rows = skippedLeads.map((s) => [
      s.rowNumber,
      `"${s.taxpayerName.replace(/"/g, '""')}"`,
      `"${(s.email || '').replace(/"/g, '""')}"`,
      `"${s.phone.replace(/"/g, '""')}"`,
      `"${(s.ssnTin || '').replace(/"/g, '""')}"`,
      `"${(s.reasonCategory || '').replace(/"/g, '""')}"`,
      `"${s.reason.replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `skipped_leads_report_TY${taxYear}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-sans animate-in fade-in duration-200"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 bg-white rounded-md border border-slate-300 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* 1. Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-slate-100 text-[#16A34A] border border-slate-200 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Bulk Lead Ingestion Summary Report
                </h3>
                <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 font-mono border border-slate-200">
                  TY {taxYear}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Processed {totalReceived} records in {processingTimeMs}ms with master customer deduplication check.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-500 hover:text-black hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Top Summary KPI Cards */}
        <div className="p-6 pb-4 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white shrink-0">
          {/* Successfully Ingested */}
          <div className="p-4 rounded-md bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Ingested to Outreach
              </span>
              <div className="text-2xl font-bold text-[#16A34A] mt-0.5">
                {validProcessed}
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {newProfilesCreated} new profiles created
              </span>
            </div>
            <div className="w-9 h-9 rounded-md bg-emerald-50 text-[#16A34A] border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          {/* Existing Customer & Duplicates Blocked */}
          <div className="p-4 rounded-md bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Duplicates &amp; Existing Blocked
              </span>
              <div className="text-2xl font-bold mt-0.5 text-slate-900">
                {duplicatesSkipped}
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {hasSkipped ? 'Customer accounts protected' : '0 duplicates'}
              </span>
            </div>
            <div className="w-9 h-9 rounded-md bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>

          {/* Total Processed */}
          <div className="p-4 rounded-md bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Rows Processed
              </span>
              <div className="text-2xl font-bold text-slate-900 mt-0.5">
                {totalReceived}
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Target Tax Year {taxYear}
              </span>
            </div>
            <div className="w-9 h-9 rounded-md bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* 3. Detailed Skipped Leads Breakdown (If Any) */}
        {hasSkipped ? (
          <div className="flex-1 flex flex-col min-h-0 px-6 pb-4">
            {/* Filter & Export Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-3 shrink-0">
              <div className="flex items-center gap-2 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search blocked leads by name, email, phone..."
                    className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all"
                  />
                </div>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="text-xs bg-white border border-slate-300 rounded-md px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                >
                  <option value="ALL">All Rejection Reasons ({skippedLeads.length})</option>
                  <option value="EXISTING_CONVERTED_CUSTOMER">Already Converted Client</option>
                  <option value="EXISTING_CUSTOMER_PROFILE">Existing Customer Profile</option>
                  <option value="DUPLICATE_APPLICATION">Duplicate TY Filing</option>
                  <option value="IN_SHEET_DUPLICATE">In-Sheet Duplicate</option>
                </select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportSkippedCSV}
                className="text-xs font-semibold border-slate-300 text-slate-700 rounded-md flex items-center gap-1.5 shrink-0"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Export Skipped Report (.csv)</span>
              </Button>
            </div>

            {/* Scrollable Skipped Leads Table */}
            <div className="flex-1 overflow-y-auto border border-slate-200 rounded-md bg-slate-50/50 divide-y divide-slate-200">
              {filteredSkippedLeads.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No skipped leads match your search query.
                </div>
              ) : (
                filteredSkippedLeads.map((item, idx) => (
                  <div key={idx} className="p-3.5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-semibold font-mono px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-700">
                          Row #{item.rowNumber}
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          {item.taxpayerName}
                        </span>
                        {getCategoryBadge(item.reasonCategory)}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500 font-medium">
                        {item.email && <span>✉️ {item.email}</span>}
                        {item.phone && <span>📞 {item.phone}</span>}
                        {item.ssnTin && <span className="font-mono">🔒 SSN: {item.ssnTin}</span>}
                      </div>

                      <p className="text-xs text-amber-950 font-medium bg-amber-50/80 p-2 rounded-md border border-amber-200 mt-1">
                        ⚠️ {item.reason}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="px-6 py-8 text-center bg-emerald-50/40 border-y border-emerald-100">
            <div className="w-10 h-10 rounded-md bg-emerald-100 text-[#16A34A] flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              100% Clean Ingestion Batch!
            </h4>
            <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
              All {validProcessed} prospect records were net-new and successfully assigned to the Documenter Department Unassigned Pool.
            </p>
          </div>
        )}

        {/* 4. Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onClose();
              navigate('/admin/customers');
            }}
            className="border-slate-300 text-slate-700 text-xs font-semibold rounded-md w-full sm:w-auto"
          >
            <Users className="w-3.5 h-3.5 mr-1.5" />
            <span>Open Converted Clients Directory</span>
          </Button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs font-semibold border-slate-300 text-slate-700 rounded-md w-full sm:w-auto"
            >
              <span>Close Report</span>
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
