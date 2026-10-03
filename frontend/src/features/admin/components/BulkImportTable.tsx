import React, { useMemo } from 'react';
import { UnifiedTable } from '@/shared/components/table/UnifiedTable';
import { exportTableToExcel } from '@/shared/utils/export-excel';
import { AppConfirmDialog } from '@/shared/components/AppConfirmDialog';
import { Button } from '@/shared/components/Button';
import { Send, Trash2 } from 'lucide-react';
import type { ParsedLeadRow, BulkImportStatsData, ApplicationPriority } from '../types/bulk-import.types';
import type { StatusFilterType } from '../hooks/useLeadTableFilters';
import { getBulkImportColumns } from '../columns/bulk-import-columns';

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
  stats,
  selectedRows,
  onSelectionChange,
  onDeleteSelected,
  onProceedIngestion,
  onConfirmIngestion,
  showConfirmModal,
  onCloseConfirmModal,
  isIngesting,
  taxYear,
}) => {
  const columns = useMemo(() => getBulkImportColumns(), []);

  const handleExport = () => {
    exportTableToExcel(
      rows,
      [
        { header: 'Taxpayer', key: 'fullName', format: (r) => r.fullName || `${r.firstName || ''} ${r.lastName || ''}` },
        { header: 'Email', key: 'email' },
        { header: 'Phone', key: 'phone' },
        { header: 'Row Number', key: 'rowNumber' },
        { header: 'Validation Status', key: 'validationStatus' },
        { header: 'Validation Message', key: 'validationMessage' },
      ],
      'bulk_leads_preview'
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-xl border border-zinc-200">
        <div className="text-xs text-zinc-600 font-medium">
          Tax Year: <strong className="text-zinc-900 font-semibold">TY{taxYear}</strong> &bull; Total: <strong className="text-zinc-900">{rows.length}</strong> &bull; Valid: <strong className="text-emerald-700">{stats.valid}</strong> &bull; Invalid: <strong className="text-rose-600">{stats.invalid}</strong>
        </div>

        <div className="flex items-center gap-2">
          {selectedRows.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onDeleteSelected}
              className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Remove Selected ({selectedRows.length})
            </Button>
          )}

          <Button
            type="button"
            size="sm"
            disabled={stats.valid === 0 || isIngesting}
            onClick={onProceedIngestion}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-medium px-4 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            Import {stats.valid} Leads
          </Button>
        </div>
      </div>

      <UnifiedTable<ParsedLeadRow>
        title="PARSED LEAD DATASET PREVIEW"
        subtitle={`Records parsed from CSV file for Tax Year ${taxYear}. Records will be deduplicated upon ingestion.`}
        data={rows}
        columns={columns}
        isLoading={false}
        enableSelection={true}
        selectedRows={selectedRows}
        onSelectionChange={onSelectionChange}
        searchPlaceholder="Search parsed leads by name, email, phone..."
        onExportExcel={handleExport}
        emptyText="No matching parsed records found."
      />

      <AppConfirmDialog
        isOpen={showConfirmModal}
        onClose={onCloseConfirmModal}
        onConfirm={onConfirmIngestion}
        title="Confirm Lead Import Pipeline"
        description={`You are about to submit ${stats.valid} lead records to the server for Tax Year ${taxYear}.`}
        confirmLabel={`Import ${stats.valid} Leads`}
        variant="success"
        isLoading={isIngesting}
      />
    </div>
  );
};
