import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  customerApi,
  type CustomerDocumentsResponse,
  type CustomerDocumentItem,
} from '../services/customer-api';
import toast from 'react-hot-toast';
import {
  type DocumentTypeId,
  getDocumentTypeForCategory,
  detectCategoryForType,
  getDefaultCategoryForType,
} from '@/shared/constants/document-taxonomy';

export interface StagedFileItem {
  id: string;
  file: File;
  category: string;
}

export const isDriveLinkDoc = (doc: CustomerDocumentItem): boolean => {
  return Boolean(
    doc.isDriveLink ||
    doc.filePath?.startsWith('http://') ||
    doc.filePath?.startsWith('https://') ||
    doc.documentCategory === 'GOOGLE_DRIVE_LINK' ||
    doc.documentCategory === 'DRIVE_LINK' ||
    doc.documentCategory === 'INDIVIDUAL_DRIVE_LINK' ||
    doc.documentCategory === 'BUSINESS_DRIVE_LINK' ||
    doc.documentCategory === 'FBAR_FATCA_DRIVE_LINK' ||
    doc.documentCategory === 'AUDIT_DRIVE_LINK' ||
    doc.fileName?.toLowerCase().includes('drive.google.com') ||
    doc.fileName?.toLowerCase().includes('docs.google.com')
  );
};

export const useCustomerDocuments = (taxYearParam?: string) => {
  const [selectedYear, setSelectedYear] = useState<string>(taxYearParam || '2025');
  const [data, setData] = useState<CustomerDocumentsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // 4 Document Types Tab state: 'INDIVIDUAL' | 'BUSINESS' | 'TAX_COMPLIANCE' | 'TAX_AUDIT'
  const [activeDocType, setActiveDocType] = useState<DocumentTypeId>('INDIVIDUAL');

  // Vault Sub-Tab state: 'ALL' | 'FILES' | 'LINKS'
  const [activeVaultTab, setActiveVaultTab] = useState<'ALL' | 'FILES' | 'LINKS'>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Multi-upload Modal & Staging State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [stagedFiles, setStagedFiles] = useState<StagedFileItem[]>([]);
  const [bulkCategory, setBulkCategory] = useState<string>('');

  // Drive Link Modal State
  const [isDriveLinkModalOpen, setIsDriveLinkModalOpen] = useState<boolean>(false);
  const [isSubmittingLink, setIsSubmittingLink] = useState<boolean>(false);

  // Single file staging backward-compatibility
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState<string>('W2_WAGES');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);

  const [refreshKey, setRefreshKey] = useState<number>(0);

  const handleSelectYear = useCallback((year: string) => {
    setLoading(true);
    setSelectedYear(year);
  }, []);

  const refetch = useCallback(async () => {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadDocuments = async () => {
      try {
        const res = await customerApi.getDocuments(selectedYear);
        if (isMounted && res.data) {
          setData(res.data);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const errorObj = err as { response?: { data?: { message?: string } } };
          const msg = errorObj?.response?.data?.message || 'Failed to load documents';
          setError(msg);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDocuments();

    return () => {
      isMounted = false;
    };
  }, [selectedYear, refreshKey]);

  // Stage multiple files from input or drop, scoped to activeDocType
  const stageFiles = (files: FileList | File[]) => {
    const validFiles: StagedFileItem[] = [];
    const maxSizeBytes = 15 * 1024 * 1024; // 15MB per file

    Array.from(files).forEach((file) => {
      if (file.size > maxSizeBytes) {
        toast.error(`"${file.name}" exceeds 15MB limit and was skipped`);
        return;
      }
      validFiles.push({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        file,
        category: detectCategoryForType(file.name, activeDocType),
      });
    });

    if (validFiles.length > 0) {
      setStagedFiles((prev) => [...prev, ...validFiles]);
      setIsUploadModalOpen(true);
      toast.success(`Staged ${validFiles.length} file(s) for upload`);
    }
  };

  // Handle single/multi file select
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    stageFiles(files);
    if (e.target) e.target.value = '';
  };

  // Handle drop on dropzone
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    stageFiles(files);
  };

  // Update single staged file category
  const handleUpdateStagedCategory = (id: string, category: string) => {
    setStagedFiles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, category } : item))
    );
  };

  // Remove single staged file
  const handleRemoveStagedFile = (id: string) => {
    setStagedFiles((prev) => prev.filter((item) => item.id !== id));
  };

  // Apply category to all staged files
  const handleApplyBulkCategory = (cat: string) => {
    setBulkCategory(cat);
    if (!cat) return;
    setStagedFiles((prev) => prev.map((item) => ({ ...item, category: cat })));
    toast.success(`Applied category to all ${stagedFiles.length} files`);
  };

  // Upload all staged files simultaneously
  const handleUploadAllStaged = async () => {
    if (stagedFiles.length === 0) return;

    try {
      setUploading(true);
      setUploadProgress(10);

      const categoriesMap: Record<string, string> = {};
      const files: File[] = stagedFiles.map((item) => {
        categoriesMap[item.file.name] = item.category;
        return item.file;
      });

      await customerApi.uploadMultipleDocuments(
        files,
        categoriesMap,
        selectedYear,
        (pct) => setUploadProgress(pct)
      );

      toast.success(`Successfully uploaded ${stagedFiles.length} document(s)! 📁✨`);
      setStagedFiles([]);
      setIsUploadModalOpen(false);
      await refetch();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      const msg = errorObj?.response?.data?.message || 'Failed to upload documents';
      toast.error(msg);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Upload an external Google Drive / Cloud Link
  const handleUploadDriveLink = async (payload: {
    linkUrl: string;
    title?: string;
    documentCategory?: string;
    remarks?: string;
  }) => {
    try {
      setIsSubmittingLink(true);
      await customerApi.uploadDriveLink({
        ...payload,
        taxYear: selectedYear,
      });

      toast.success('Google Drive / Cloud Link attached successfully! 🔗✨');
      setIsDriveLinkModalOpen(false);
      await refetch();
      return true;
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      const msg = errorObj?.response?.data?.message || 'Failed to attach Drive link';
      toast.error(msg);
      return false;
    } finally {
      setIsSubmittingLink(false);
    }
  };

  // Delete a document or link
  const deleteDocument = async (id: string, fileName: string) => {
    try {
      await customerApi.deleteDocument(id);
      toast.success(`"${fileName}" deleted successfully`);
      await refetch();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      const msg = errorObj?.response?.data?.message || 'Failed to delete document';
      toast.error(msg);
    }
  };

  // Download a physical document
  const downloadDocument = async (id: string, fileName: string) => {
    try {
      toast.loading(`Downloading ${fileName}...`, { id: 'doc-download' });
      await customerApi.downloadDocument(id, fileName);
      toast.success('Download complete!', { id: 'doc-download' });
    } catch {
      toast.error('Failed to download document', { id: 'doc-download' });
    }
  };

  // Categorize documents: all, physical files, drive links
  const allDocuments = useMemo(() => data?.documents || [], [data?.documents]);

  // Document Counts per Document Type (1: Individual, 2: Business, 3: Tax Compliance, 4: Tax Audit)
  const docTypeCounts = useMemo<Record<DocumentTypeId, number>>(() => {
    const counts: Record<DocumentTypeId, number> = {
      INDIVIDUAL: 0,
      BUSINESS: 0,
      TAX_COMPLIANCE: 0,
      TAX_AUDIT: 0,
    };
    allDocuments.forEach((doc) => {
      const typeId = getDocumentTypeForCategory(doc.documentCategory);
      counts[typeId] = (counts[typeId] || 0) + 1;
    });
    return counts;
  }, [allDocuments]);

  // Documents belonging to the current active document type
  const activeTypeDocs = useMemo(() => {
    return allDocuments.filter((doc) => getDocumentTypeForCategory(doc.documentCategory) === activeDocType);
  }, [allDocuments, activeDocType]);

  // Split active type docs into physical files vs drive links
  const { physicalFiles, driveLinks } = useMemo(() => {
    const files: CustomerDocumentItem[] = [];
    const links: CustomerDocumentItem[] = [];
    activeTypeDocs.forEach((doc) => {
      if (isDriveLinkDoc(doc)) {
        links.push(doc);
      } else {
        files.push(doc);
      }
    });
    return { physicalFiles: files, driveLinks: links };
  }, [activeTypeDocs]);

  // Tab-filtered documents for the active document type
  const tabFilteredDocs = useMemo(() => {
    if (activeVaultTab === 'FILES') return physicalFiles;
    if (activeVaultTab === 'LINKS') return driveLinks;
    return activeTypeDocs;
  }, [activeVaultTab, physicalFiles, driveLinks, activeTypeDocs]);

  // Category-filtered documents
  const filteredDocs = useMemo(() => {
    if (filterCategory === 'ALL') return tabFilteredDocs;
    return tabFilteredDocs.filter((doc) => doc.documentCategory === filterCategory);
  }, [tabFilteredDocs, filterCategory]);

  const handleSelectDocType = useCallback((typeId: DocumentTypeId) => {
    setActiveDocType(typeId);
    setFilterCategory('ALL');
    setUploadCategory(getDefaultCategoryForType(typeId));
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return {
    allDocuments,
    documents: activeTypeDocs,
    filteredDocs,
    physicalFiles,
    driveLinks,
    docTypeCounts,
    activeDocType,
    setActiveDocType: handleSelectDocType,
    taxYear: data?.taxYear || 2025,
    isConvertedCustomer: data?.isConvertedCustomer || false,
    selectedYear,
    setSelectedYear: handleSelectYear,
    activeVaultTab,
    setActiveVaultTab,
    filterCategory,
    setFilterCategory,
    uploadCategory,
    setUploadCategory,
    isDragOver,
    setIsDragOver,
    fileInputRef,
    multiFileInputRef,
    loading,
    uploading,
    uploadProgress,
    error,
    // Multi-Upload Modal & Staging
    isUploadModalOpen,
    setIsUploadModalOpen,
    stagedFiles,
    setStagedFiles,
    bulkCategory,
    setBulkCategory,
    stageFiles,
    handleFileSelect,
    handleDrop,
    handleUpdateStagedCategory,
    handleRemoveStagedFile,
    handleApplyBulkCategory,
    handleUploadAllStaged,
    // Drive Link Modal
    isDriveLinkModalOpen,
    setIsDriveLinkModalOpen,
    isSubmittingLink,
    handleUploadDriveLink,
    // Operations
    deleteDocument,
    downloadDocument,
    formatFileSize,
    refetch,
    // Backward-compatible single file
    stagedFile,
    setStagedFile,
    handleConfirmUpload: handleUploadAllStaged,
    handleCancelStagedFile: () => setStagedFiles([]),
  };
};
