import { useState, useMemo, useCallback } from 'react';
import type { ParsedLeadRow, BulkImportStatsData } from '../types/bulk-import.types';
import { useCSVFileUpload } from './useCSVFileUpload';
import { useLeadTableFilters, type StatusFilterType } from './useLeadTableFilters';
import { adminService } from '../services/admin-service';
import { useNotificationStore } from '@/features/notifications/store/notification-store';
import toast from 'react-hot-toast';

export type { StatusFilterType };

/**
 * Main Orchestration Hook for Bulk Lead Import
 * Coordinates file upload, dataset state, filtering, and server ingestion workflow.
 */
export const useBulkImport = () => {
  // ---------------------------------------------------------------------------
  // 1. DATASET & TAX YEAR STATE
  // ---------------------------------------------------------------------------
  const [taxYear, setTaxYear] = useState<number>(new Date().getFullYear());
  const [rows, setRows] = useState<ParsedLeadRow[]>([]);
  const [isIngesting, setIsIngesting] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  // ---------------------------------------------------------------------------
  // 2. SUB-HOOK: TABLE FILTERS & SEARCH
  // ---------------------------------------------------------------------------
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    selectedRows,
    setSelectedRows,
    filterRows,
    resetFilters,
  } = useLeadTableFilters();

  // ---------------------------------------------------------------------------
  // 3. SUB-HOOK: CSV FILE DRAG-AND-DROP & PARSING
  // ---------------------------------------------------------------------------
  const {
    file,
    fileName,
    fileSize,
    isDragOver,
    isParsing,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInputChange,
    handleLoadDemoData,
    handleDownloadTemplate,
    handleClearFile,
  } = useCSVFileUpload({
    taxYear,
    onParsedSuccess: (newRows) => {
      setRows(newRows);
      resetFilters();
    },
    onClear: () => {
      setRows([]);
      resetFilters();
    },
  });

  // ---------------------------------------------------------------------------
  // 4. COMPUTED VALUES (STATS & FILTERED ROWS)
  // ---------------------------------------------------------------------------
  // Calculate summary metrics
  const stats: BulkImportStatsData = useMemo(() => {
    let valid = 0;
    let invalid = 0;

    rows.forEach((r) => {
      if (r.validationStatus === 'VALID') valid++;
      else invalid++;
    });

    return {
      total: rows.length,
      valid,
      invalid,
    };
  }, [rows]);

  // Derived filtered rows based on search and status filter
  const filteredRows = useMemo(() => filterRows(rows), [filterRows, rows]);

  // ---------------------------------------------------------------------------
  // 5. ACTIONS & EVENT HANDLERS
  // ---------------------------------------------------------------------------
  // Switch tax year and update all rows
  const handleTaxYearChange = useCallback((year: number) => {
    setTaxYear(year);
    if (rows.length > 0) {
      setRows((prev) => prev.map((r) => ({ ...r, taxYear: year })));
    }
  }, [rows.length]);

  // Delete selected rows
  const handleDeleteSelected = useCallback(() => {
    if (selectedRows.length === 0) return;
    const selectedIds = new Set(selectedRows.map((r) => r.id));
    setRows((prev) => prev.filter((r) => !selectedIds.has(r.id)));
    setSelectedRows([]);
    toast.success(`Removed ${selectedRows.length} rows`);
  }, [selectedRows, setSelectedRows]);

  // Trigger ingestion confirmation modal
  const handleProceedIngestion = useCallback(() => {
    if (rows.length === 0) {
      toast.error('No lead records available to ingest');
      return;
    }
    const validCount = rows.filter((r) => r.validationStatus === 'VALID').length;
    if (validCount === 0) {
      toast.error('No valid leads found in the dataset. Please fix validation errors.');
      return;
    }
    setShowConfirmModal(true);
  }, [rows]);

  // Confirm and execute ingestion pipeline
  const handleConfirmIngestion = useCallback(async () => {
    setShowConfirmModal(false);
    setIsIngesting(true);

    try {
      const validRows = rows.filter((r) => r.validationStatus === 'VALID');
      const payloadLeads = validRows.map((r) => ({
        firstName: r.firstName,
        middleName: r.middleName || null,
        lastName: r.lastName,
        email: r.email || null,
        phone: r.phone,
        ssnTin: r.ssnTin || null,
        dob: r.dob || null,
        occupation: r.occupation || null,
        visaType: r.visaType || null,
        maritalStatus: r.maritalStatus || null,
        filingType: r.filingType,
        addressLine1: r.addressLine1 || null,
        city: r.city || null,
        state: r.state || null,
        zipCode: r.zipCode || null,
      }));

      const res = await adminService.bulkImportLeads({
        taxYear,
        leads: payloadLeads,
      });

      const metrics = res?.data;
      const validCount = metrics?.validProcessed ?? validRows.length;
      const newProfiles = metrics?.newProfilesCreated ?? 0;
      const linkedProfiles = metrics?.existingProfilesLinked ?? 0;
      const skippedCount = metrics?.duplicatesSkipped ?? 0;

      // Dispatch real notification for Document Manager & Documenter Dept
      useNotificationStore.getState().addNotification({
        title: `New Batch of ${validCount} Leads Uploaded by Admin`,
        message: `Admin successfully ingested ${validCount} new tax leads for TY${taxYear} (${newProfiles} new profiles, ${linkedProfiles} multi-year linked). Intake queue ready.`,
        category: 'DOCUMENTER',
        priority: 'HIGH',
        actionUrl: '/documenter/manager/queue',
        actionLabel: 'View Documenter Queue',
      });

      toast.success(
        res?.message ||
          `Successfully imported ${validCount} leads for Tax Year ${taxYear}! (${newProfiles} new, ${linkedProfiles} multi-year linked, ${skippedCount} duplicates skipped)`,
        { duration: 6000 }
      );

      // Clean up after successful import
      handleClearFile();
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message || error?.message || 'Failed to ingest leads to server';
      toast.error(errorMsg, { duration: 5000 });
    } finally {
      setIsIngesting(false);
    }
  }, [rows, taxYear, handleClearFile]);

  // ---------------------------------------------------------------------------
  // 6. CLEARLY DOCUMENTED RETURN OBJECT
  // ---------------------------------------------------------------------------
  return {
    // 📁 [File & Upload State]
    file,                      // Active File object
    fileName,                  // Display name of uploaded CSV file
    fileSize,                  // Formatted file size string (e.g. "18.4 KB")
    isDragOver,                // Boolean flag when user is dragging a file over dropzone
    isParsing,                 // Boolean flag while CSV text is being parsed into rows

    // 🔍 [Search & Filter State]
    searchQuery,               // Active search text string
    setSearchQuery,            // Callback to update search text
    statusFilter,              // Active tab filter: 'ALL' | 'VALID' | 'INVALID'
    setStatusFilter,           // Callback to update tab filter
    selectedRows,              // Array of rows currently selected by user
    setSelectedRows,           // Callback to update selected rows

    // 📊 [Dataset & Stats]
    taxYear,                   // Target Filing Tax Year (e.g. 2024, 2025, 2026)
    rows,                      // All parsed lead rows in current sheet
    filteredRows,              // Displayed rows matching search & status filter
    stats,                     // Summary counts: { total, valid, invalid }

    // ⚙️ [Modal & Ingestion State]
    isIngesting,               // Boolean flag while submitting leads to server
    showConfirmModal,          // Boolean flag controlling confirmation modal visibility
    setShowConfirmModal,       // Callback to toggle confirmation modal

    // 🚀 [Action Handlers]
    handleDragOver,            // Event handler for onDragOver
    handleDragLeave,           // Event handler for onDragLeave
    handleDrop,                // Event handler for onDrop
    handleFileInputChange,     // Event handler for file picker onChange
    handleLoadDemoData,        // 1-Click loader for 12 sample preview leads
    handleDownloadTemplate,    // Triggers download of sample CSV template
    handleClearFile,           // Resets all file and table data
    handleTaxYearChange,       // Updates target filing tax year
    handleDeleteSelected,      // Removes selected rows from dataset
    handleProceedIngestion,    // Opens confirmation dialog
    handleConfirmIngestion,    // Executes ingestion process
  };
};
