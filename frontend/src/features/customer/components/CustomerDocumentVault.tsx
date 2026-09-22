import React from 'react';
import { RefreshCw, Plus, Link2 } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppSelect } from '@/shared/components/AppSelect';
import { AppTabs, type TabItem } from '@/shared/components/AppTabs';
import toast from 'react-hot-toast';
import { useOutletContext } from 'react-router-dom';
import { useCustomerDocuments } from '../hooks/useCustomerDocuments';
import { VaultUploadDropzone } from './vault/VaultUploadDropzone';
import { VaultDocumentsTable } from './vault/VaultDocumentsTable';
import { CustomerDriveLinkModal } from './vault/CustomerDriveLinkModal';
import { CustomerMultiUploadModal } from './vault/CustomerMultiUploadModal';
import { DOCUMENT_TYPES } from '@/shared/constants/document-taxonomy';

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
    allDocuments,
    documents,
    filteredDocs,
    physicalFiles,
    driveLinks,
    docTypeCounts,
    activeDocType,
    setActiveDocType,
    selectedYear,
    setSelectedYear,
    activeVaultTab,
    setActiveVaultTab,
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
    // Multi-Upload Modal & Staging
    isUploadModalOpen,
    setIsUploadModalOpen,
    stagedFiles,
    setStagedFiles,
    bulkCategory,
    stageFiles,
    handleUpdateStagedCategory,
    handleRemoveStagedFile,
    handleApplyBulkCategory,
    handleUploadAllStaged,
    // Drive Link Modal
    isDriveLinkModalOpen,
    setIsDriveLinkModalOpen,
    isSubmittingLink,
    handleUploadDriveLink,
  } = useCustomerDocuments(context.selectedTaxYear);

  // Tabs for All Items, Files, and Drive Links within active document type
  const vaultTabs: TabItem[] = [
    {
      id: 'ALL',
      label: 'All Items in Section',
      count: documents.length,
    },
    {
      id: 'FILES',
      label: 'Uploaded Documents',
      count: physicalFiles.length,
    },
    {
      id: 'LINKS',
      label: 'Drive & Cloud Links',
      count: driveLinks.length,
    },
  ];

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      {/* 1. Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {isConvertedCustomer ? 'Multi-Year Tax Document Vault' : 'TY 2025 Intake Document Vault'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
              {allDocuments.length} Total Items
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Upload your official W-2, 1099, FBAR, and tax statements or attach a Google Drive / OneDrive folder link for CPA review.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
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

          {/* Quick Upload Action Buttons */}
          <Button
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload Documents</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsDriveLinkModalOpen(true)}
            className="border-indigo-200 bg-indigo-50/60 hover:bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Upload Drive Link</span>
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

      {/* 2. 4 DOCUMENT TYPE TABS */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {DOCUMENT_TYPES.map((dt) => {
            const Icon = dt.icon;
            const count = docTypeCounts[dt.id] || 0;
            const isActive = activeDocType === dt.id;

            return (
              <button
                key={dt.id}
                type="button"
                onClick={() => setActiveDocType(dt.id)}
                className={`flex items-start gap-3 p-3.5 rounded-xl text-left transition-all cursor-pointer relative ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900 ring-offset-1'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-bold ${
                    isActive
                      ? 'bg-white/15 text-white'
                      : dt.colorClass
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold truncate">
                      {dt.number}) {dt.label}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : count > 0
                          ? 'bg-emerald-100 text-[#16A34A] border border-emerald-200'
                          : 'bg-slate-200/80 text-slate-500'
                      }`}
                    >
                      {count}
                    </span>
                  </div>
                  <p
                    className={`text-[11px] line-clamp-1 mt-0.5 ${
                      isActive ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {dt.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Drag & Drop Upload Sub-Component */}
      <VaultUploadDropzone
        uploadCategory={uploadCategory}
        setUploadCategory={setUploadCategory}
        activeDocType={activeDocType}
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
        onOpenDriveLinkModal={() => setIsDriveLinkModalOpen(true)}
      />

      {/* 4. Tab Switcher: All Items vs Uploaded Files vs Drive Links (for active doc type) */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-1">
        <AppTabs
          tabs={vaultTabs}
          activeTab={activeVaultTab}
          onChange={(tabId) => setActiveVaultTab(tabId as 'ALL' | 'FILES' | 'LINKS')}
          size="sm"
        />
      </div>

      {/* 5. Uploaded Documents Table Sub-Component */}
      <VaultDocumentsTable
        selectedYear={selectedYear}
        filteredDocs={filteredDocs}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        activeDocType={activeDocType}
        loading={loading}
        onOpenUpload={() => fileInputRef.current?.click()}
        onOpenDriveLinkModal={() => setIsDriveLinkModalOpen(true)}
        onDownload={downloadDocument}
        onDelete={deleteDocument}
      />

      {/* 6. Drive Link Upload Modal */}
      <CustomerDriveLinkModal
        isOpen={isDriveLinkModalOpen}
        onClose={() => setIsDriveLinkModalOpen(false)}
        onSubmit={handleUploadDriveLink}
        isSubmitting={isSubmittingLink}
        selectedTaxYear={selectedYear}
        activeDocType={activeDocType}
      />

      {/* 7. Multi-Document Staging & Upload Modal */}
      <CustomerMultiUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setStagedFiles([]);
        }}
        stagedFiles={stagedFiles}
        bulkCategory={bulkCategory}
        onBulkCategoryChange={handleApplyBulkCategory}
        onUpdateCategory={handleUpdateStagedCategory}
        onRemoveFile={handleRemoveStagedFile}
        onAddMoreFiles={stageFiles}
        onUploadAll={handleUploadAllStaged}
        uploading={uploading}
        uploadProgress={uploadProgress}
        formatFileSize={formatFileSize}
        selectedTaxYear={selectedYear}
        activeDocType={activeDocType}
      />
    </div>
  );
};
