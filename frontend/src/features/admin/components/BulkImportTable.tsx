import React, { useMemo } from 'react';
import { AppTable } from '@/shared/components/AppTable';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
import { AppTabs } from '@/shared/components/AppTabs';
import { AppConfirmDialog } from '@/shared/components/AppConfirmDialog';
import { Button } from '@/shared/components/Button';
import { Send, Trash2 } from 'lucide-react';
import type { ParsedLeadRow, BulkImportStatsData, ApplicationPriority } from '../types/bulk-import.types';
import type { StatusFilterType } from '../hooks/useLeadTableFilters';
import { getBulkImportColumns } from '../columns/bulk-import-columns';
import { PriorityFilterSelect } from '@/shared/components/PriorityFilterSelect';

interface BulkImportTableProps {
  rows: ParsedLeadRow[];
  totalRawRows: number;
  stats: BulkImportStatsData;
  selectedRows: ParsedLeadRow[];
  onSelectionChange: (selected: ParsedLeadRow[]) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: StatusFilterType;
  onStatusFilterChange: (status: StatusFilterType) => void;
  priorityFilter: ApplicationPriority | 'ALL';
  onPriorityFilterChange: (priority: ApplicationPriority | 'ALL') => void;
  onDeleteSelected: () => void;
  onProceedIngestion: () => void;
  onConfirmIngestion: () => void;
  showConfirmModal: boolean;
  onCloseConfirmModal: () => void;
  isIngesting: boolean;
  taxYear: number;
}

export const BulkImportTable: React.FC<BulkImportTableProps> = ({
  rows,
  totalRawRows,
  stats,
  selectedRows,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  onDeleteSelected,
  onProceedIngestion,
  onConfirmIngestion,
  showConfirmModal,
  onCloseConfirmModal,
  isIngesting,
  taxYear,
}) => {
  // Memoized column definitions extracted to modular TableColumns file
  const columns = useMemo(() => getBulkImportColumns(), []);

  return (
    <div className="space-y-4">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        {/* Left Side: Search & Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 flex-wrap">
          <div className="w-full sm:w-72">
            <AppSearchInput
              value={searchQuery}
              onChange={onSearchChange}
              placeholder="Search by name, email, phone, city..."
            />
          </div>

          <PriorityFilterSelect
            value={priorityFilter}
            onChange={onPriorityFilterChange}
          />

          {/* Status Filter AppTabs */}
          <AppTabs
            tabs={[
              { id: 'ALL', label: 'All Records', count: totalRawRows },
              { id: 'VALID', label: 'Ready', count: stats.valid },
              ...(stats.invalid > 0 ? [{ id: 'INVALID', label: 'Needs Review', count: stats.invalid }] : []),
            ]}
            activeTab={statusFilter}
            onChange={(status) => onStatusFilterChange(status as StatusFilterType)}
            size="sm"
          />
        </div>

        {/* Right Side: Primary Import Button & Batch Operations */}
        <div className="flex items-center gap-3 justify-end">
          {selectedRows.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onDeleteSelected}
              className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Remove Selected ({selectedRows.length})
            </Button>
          )}

          <Button
            type="button"
            variant="primary"
            size="md"
            loading={isIngesting}
            disabled={stats.valid === 0}
            onClick={onProceedIngestion}
            className="px-5 shadow-sm"
          >
            <Send className="w-4 h-4 mr-2" />
            Import {stats.valid} Leads
          </Button>
        </div>
      </div>

      {/* Reusable AppTable with Pagination, Status Indicators, and Sorting (No Checkboxes) */}
      <AppTable<ParsedLeadRow>
        title="Parsed Lead Dataset Preview"
        description={`Displaying records from CSV upload for Tax Year ${taxYear}. Records will be deduplicated against master customer profiles upon server ingestion.`}
        columns={columns}
        data={rows}
        selectable={false}
        searchable={false} /* Handled above by dedicated AppSearchInput */
        density="comfortable"
        striped
        emptyText="No matching lead records found for current filters."
      />

      {/* Confirmation Dialog */}
      <AppConfirmDialog
        isOpen={showConfirmModal}
        onClose={onCloseConfirmModal}
        onConfirm={onConfirmIngestion}
        title="Confirm Lead Import Pipeline"
        description={`You are about to submit ${stats.valid} lead records to the server for Tax Year ${taxYear}. The server deduplication engine will check existing SSN/email profiles and route new records to the Documenter Outreach queue.`}
        confirmLabel={`Import ${stats.valid} Leads`}
        variant="success"
        isLoading={isIngesting}
      />
    </div>
  );
};
