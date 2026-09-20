import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  customerApi,
  type CustomerDocumentsResponse,
  type CustomerDocumentItem,
} from '../services/customer-api';
import toast from 'react-hot-toast';

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
    doc.fileName?.toLowerCase().includes('drive.google.com') ||
    doc.fileName?.toLowerCase().includes('docs.google.com')
  );
};

export const detectCategoryFromFileName = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes('w-2') || lower.includes('w2') || lower.includes('wage')) return 'W2_WAGES';
  if (lower.includes('1099-int') || lower.includes('1099int') || lower.includes('interest')) return '1099_INT';
  if (lower.includes('1099-div') || lower.includes('1099div') || lower.includes('dividend')) return '1099_DIV';
  if (lower.includes('1099-b') || lower.includes('1099b') || lower.includes('stock') || lower.includes('brokerage') || lower.includes('trade')) return '1099_BROKERAGE';
  if (lower.includes('1098-t') || lower.includes('tuition')) return '1098_T_TUITION';
  if (lower.includes('1098-e') || lower.includes('student')) return '1098_E_STUDENT_LOAN';
  if (lower.includes('1098') || lower.includes('mortgage')) return 'MORTGAGE_1098';
  if (lower.includes('fbar') || lower.includes('foreign') || lower.includes('nre') || lower.includes('nro')) return 'FBAR_FOREIGN';
  if (lower.includes('passport') || lower.includes('visa') || lower.includes('i797') || lower.includes('i-797') || lower.includes('id_') || lower.includes('dl_')) return 'VISA_IDENTITY';
  if (lower.includes('1040') || lower.includes('prior') || lower.includes('previous')) return 'PRIOR_YEAR_RETURN';
  if (lower.includes('hsa') || lower.includes('1099-sa')) return '1099_SA_HSA';
  if (lower.includes('1095')) return '1095_A_MARKETPLACE';
  if (lower.includes('espp') || lower.includes('3921') || lower.includes('3922')) return 'STOCK_3921_3922';
  return 'W2_WAGES';
};

export const useCustomerDocuments = (taxYearParam?: string) => {
  const [selectedYear, setSelectedYear] = useState<string>(taxYearParam || '2025');
  const [data, setData] = useState<CustomerDocumentsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Tab & Filtering state: 'ALL' | 'FILES' | 'LINKS'
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

  // Stage multiple files from input or drop
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
        category: detectCategoryFromFileName(file.name),
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

  const { physicalFiles, driveLinks } = useMemo(() => {
    const files: CustomerDocumentItem[] = [];
    const links: CustomerDocumentItem[] = [];
    allDocuments.forEach((doc) => {
      if (isDriveLinkDoc(doc)) {
        links.push(doc);
      } else {
        files.push(doc);
      }
    });
    return { physicalFiles: files, driveLinks: links };
  }, [allDocuments]);

  // Tab-filtered documents
  const tabFilteredDocs = useMemo(() => {
    if (activeVaultTab === 'FILES') return physicalFiles;
    if (activeVaultTab === 'LINKS') return driveLinks;
    return allDocuments;
  }, [activeVaultTab, physicalFiles, driveLinks, allDocuments]);

  // Category-filtered documents
  const filteredDocs = useMemo(() => {
    if (filterCategory === 'ALL') return tabFilteredDocs;
    return tabFilteredDocs.filter((doc) => doc.documentCategory === filterCategory);
  }, [tabFilteredDocs, filterCategory]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return {
    documents: allDocuments,
    filteredDocs,
    physicalFiles,
    driveLinks,
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
