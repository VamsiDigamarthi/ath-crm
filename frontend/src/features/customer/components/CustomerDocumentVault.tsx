import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppSelect } from '@/shared/components/AppSelect';
import toast from 'react-hot-toast';
import { useOutletContext } from 'react-router-dom';
import { useCustomerDocuments } from '../hooks/useCustomerDocuments';
import { VaultUploadDropzone } from './vault/VaultUploadDropzone';
import { VaultDocumentsTable } from './vault/VaultDocumentsTable';

interface CustomerDocumentVaultProps {
  isConvertedCustomer?: boolean;
}

export const CustomerDocumentVault: React.FC<CustomerDocumentVaultProps> = ({
  isConvertedCustomer: propConverted,
}) => {
  const context = useOutletContext<{
    selectedTaxYear?: string;
    isConvertedCustomer?: boolean;
  }>() || {};

  const isConvertedCustomer = propConverted !== undefined ? propConverted : Boolean(context.isConvertedCustomer);

  // All Business Logic and State encapsulated in Hook
  const {
    documents,
    filteredDocs,
    selectedYear,
    setSelectedYear,
    filterCategory,
    setFilterCategory,
    uploadCategory,
    setUploadCategory,
    stagedFile,
    isDragOver,
    setIsDragOver,
    fileInputRef,
    loading,
    uploading,
    uploadProgress,
    handleFileSelect,
    handleDrop,
    handleConfirmUpload,
    handleCancelStagedFile,
    deleteDocument,
    downloadDocument,
    formatFileSize,
    refetch,
  } = useCustomerDocuments(context.selectedTaxYear);

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      {/* 1. Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {isConvertedCustomer ? 'Multi-Year Tax Document Vault' : 'TY 2025 Intake Document Vault'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
              {documents.length} Files Uploaded
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Upload your official W-2, 1099, and FBAR statements for accurate CPA calculation.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            disabled={loading}
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          {isConvertedCustomer ? (
            <div className="w-48">
              <AppSelect
                options={[
                  { label: 'TY 2025 (Active Filing)', value: '2025' },
                  { label: 'TY 2024 (Filed Returns)', value: '2024' },
                  { label: 'TY 2023 (Historical Archive)', value: '2023' },
                ]}
                value={selectedYear}
                onChange={(val) => {
                  if (val) {
                    setSelectedYear(val);
                    toast.success(`Vault switched to Tax Year ${val}`);
                  }
                }}
                placeholder="Select Tax Year"
              />
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>TY 2025 (Active Intake)</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Drag & Drop Upload Sub-Component */}
      <VaultUploadDropzone
        uploadCategory={uploadCategory}
        setUploadCategory={setUploadCategory}
        stagedFile={stagedFile}
        uploading={uploading}
        uploadProgress={uploadProgress}
        isDragOver={isDragOver}
        setIsDragOver={setIsDragOver}
        fileInputRef={fileInputRef}
        handleFileSelect={handleFileSelect}
        handleDrop={handleDrop}
        handleConfirmUpload={handleConfirmUpload}
        handleCancelStagedFile={handleCancelStagedFile}
        formatFileSize={formatFileSize}
      />

      {/* 3. Uploaded Documents Table Sub-Component */}
      <VaultDocumentsTable
        selectedYear={selectedYear}
        filteredDocs={filteredDocs}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        loading={loading}
        onOpenUpload={() => fileInputRef.current?.click()}
        onDownload={downloadDocument}
        onDelete={deleteDocument}
      />
    </div>
  );
};
