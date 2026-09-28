import React, { useMemo } from 'react';
import { AppTabs, type TabItem } from '@/shared/components/AppTabs';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { useCustomerDocuments } from '../hooks/useCustomerDocuments';
import { VaultUploadDropzone } from './vault/VaultUploadDropzone';
import { VaultDocumentsTable } from './vault/VaultDocumentsTable';
import { CustomerDriveLinkModal } from './vault/CustomerDriveLinkModal';
import { CustomerMultiUploadModal } from './vault/CustomerMultiUploadModal';
import { DOCUMENT_TYPES } from '@/shared/constants/document-taxonomy';

interface CustomerDocumentVaultProps {
  isConvertedCustomer?: boolean;
  selectedTaxYear?: string | number;
  lockTaxYear?: boolean;
  isOrganizerMode?: boolean;
  filingType?: string;
}

export const CustomerDocumentVault: React.FC<CustomerDocumentVaultProps> = ({
  selectedTaxYear: propTaxYear,
  filingType: propFilingType,
}) => {
  const [searchParams] = useSearchParams();
  const context = useOutletContext<{
    selectedTaxYear?: string;
    customerProfile?: any;
  }>() || {};

  const effectiveTaxYear = propTaxYear !== undefined ? propTaxYear.toString() : context.selectedTaxYear;

  const urlType = searchParams.get('type') || searchParams.get('filingType');
  const matchedApp = context.customerProfile?.applications?.find(
    (a: any) => a.taxYear?.toString() === effectiveTaxYear
  );
  const effectiveFilingType = (propFilingType || urlType || matchedApp?.filingType || 'INDIVIDUAL').toUpperCase();
  const isBusiness = effectiveFilingType === 'BUSINESS';

  // Filter Document Types:
  // BUSINESS: only 'BUSINESS' and 'TAX_AUDIT'
  // INDIVIDUAL: 'INDIVIDUAL', 'TAX_COMPLIANCE', and 'TAX_AUDIT'
  const visibleDocTypes = useMemo(() => {
    if (isBusiness) {
      return DOCUMENT_TYPES.filter((dt) => dt.id === 'BUSINESS' || dt.id === 'TAX_AUDIT');
    }
    return DOCUMENT_TYPES.filter((dt) => dt.id === 'INDIVIDUAL' || dt.id === 'TAX_COMPLIANCE' || dt.id === 'TAX_AUDIT');
  }, [isBusiness]);

  // All Business Logic and State encapsulated in Hook
  const {
    documents,
    filteredDocs,
    physicalFiles,
    driveLinks,
    docTypeCounts,
    activeDocType,
    setActiveDocType,
    selectedYear,
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
  } = useCustomerDocuments(effectiveTaxYear, effectiveFilingType);

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
    <div className="space-y-4 font-sans">

      {/* 2. Small, Neat Document Type Switch Tabs */}
      <div className="border-b border-slate-200 pb-1">
        <AppTabs
          tabs={visibleDocTypes.map((dt) => ({
            id: dt.id,
            label: dt.label,
            count: docTypeCounts[dt.id] || 0,
          }))}
          activeTab={activeDocType}
          onChange={(tabId) => setActiveDocType(tabId as any)}
          size="sm"
        />
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
        loading={loading}
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
