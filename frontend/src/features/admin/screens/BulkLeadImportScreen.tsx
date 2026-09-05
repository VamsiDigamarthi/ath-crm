import React from 'react';
import { useBulkImport } from '../hooks/useBulkImport';
import { BulkImportHero } from '../components/BulkImportHero';
import { BulkImportDropzone } from '../components/BulkImportDropzone';
import { BulkImportStats } from '../components/BulkImportStats';
import { BulkImportTable } from '../components/BulkImportTable';
import { BulkImportResultModal } from '../components/BulkImportResultModal';
import { 
  Sparkles, 
  ShieldCheck, 
  Headphones, 
  DollarSign, 
  FileCheck 
} from 'lucide-react';

export const BulkLeadImportScreen: React.FC = () => {
  const {
    fileName,
    fileSize,
    taxYear,
    rows,
    filteredRows,
    selectedRows,
    setSelectedRows,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    stats,
    isDragOver,
    isParsing,
    isIngesting,
    showConfirmModal,
    setShowConfirmModal,
    showResultModal,
    setShowResultModal,
    importResult,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInputChange,
    handleLoadDemoData,
    handleDownloadTemplate,
    handleClearFile,
    handleTaxYearChange,
    handleDeleteSelected,
    handleProceedIngestion,
    handleConfirmIngestion,
  } = useBulkImport();

  const hasData = rows.length > 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Header */}
      <BulkImportHero
        taxYear={taxYear}
        onTaxYearChange={handleTaxYearChange}
        totalLeadsCount={rows.length}
      />

      {/* Upload Dropzone */}
      <BulkImportDropzone
        fileName={fileName}
        fileSize={fileSize}
        rowsCount={rows.length}
        isDragOver={isDragOver}
        isParsing={isParsing}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onFileInputChange={handleFileInputChange}
        onDownloadTemplate={handleDownloadTemplate}
        onLoadDemoData={handleLoadDemoData}
        onClearFile={handleClearFile}
      />

      {/* Main Content Area */}
      {hasData ? (
        <>
          {/* KPI Stats Overview */}
          <BulkImportStats stats={stats} />

          {/* Interactive Parsed Data Table */}
          <BulkImportTable
            rows={filteredRows}
            totalRawRows={rows.length}
            stats={stats}
            selectedRows={selectedRows}
            onSelectionChange={setSelectedRows}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onDeleteSelected={handleDeleteSelected}
            onProceedIngestion={handleProceedIngestion}
            onConfirmIngestion={handleConfirmIngestion}
            showConfirmModal={showConfirmModal}
            onCloseConfirmModal={() => setShowConfirmModal(false)}
            isIngesting={isIngesting}
            taxYear={taxYear}
          />
        </>
      ) : (
        /* Empty State & Lifecycle Pipeline Guide */
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-xs">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5" />
              Tax Operations Ingestion Engine
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              How Bulk Lead Ingestion Works
            </h3>

            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl mx-auto">
              Uploading lead sheets starts the automated lifecycle. Records are deduplicated against existing master customer profiles and routed seamlessly through departments:
            </p>

            {/* 4 Steps Lifecycle visual cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-4 text-left">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#16A34A] flex items-center justify-center font-bold text-xs mb-2">
                    1
                  </div>
                  <div className="font-bold text-xs text-slate-900">CSV Parsing</div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                    Format validation & automatic SSN/email deduplication check.
                  </p>
                </div>
                <div className="text-[10px] font-semibold text-emerald-700 mt-3 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Step 1: Admin
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs mb-2">
                    2
                  </div>
                  <div className="font-bold text-xs text-slate-900">Doc Outreach</div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                    Assigned to Documenters to call prospects & prepare tax drafts.
                  </p>
                </div>
                <div className="text-[10px] font-semibold text-blue-700 mt-3 flex items-center gap-1">
                  <Headphones className="w-3 h-3" /> Step 2: Documenter
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs mb-2">
                    3
                  </div>
                  <div className="font-bold text-xs text-slate-900">Sales Pitch</div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                    Sales agents negotiate fee quotes & collect client approvals.
                  </p>
                </div>
                <div className="text-[10px] font-semibold text-purple-700 mt-3 flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> Step 3: Sales
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#16A34A] flex items-center justify-center font-bold text-xs mb-2">
                    4
                  </div>
                  <div className="font-bold text-xs text-slate-900">IRS / CPA E-File</div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                    File operator executes e-filing and converts to permanent client.
                  </p>
                </div>
                <div className="text-[10px] font-semibold text-[#16A34A] mt-3 flex items-center gap-1">
                  <FileCheck className="w-3 h-3" /> Step 4: CPA / Operator
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Server Ingestion & Skipped Leads Breakdown Modal */}
      <BulkImportResultModal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        result={importResult}
      />
    </div>
  );
};
