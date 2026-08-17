import { useState, useEffect, useCallback, useRef } from 'react';
import {
  customerApi,
  type CustomerDocumentsResponse,
} from '../services/customer-api';
import toast from 'react-hot-toast';

export const useCustomerDocuments = (taxYearParam?: string) => {
  const [selectedYear, setSelectedYear] = useState<string>(taxYearParam || '2025');
  const [data, setData] = useState<CustomerDocumentsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Staging & Filtering state
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState<string>('W2_WAGES');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await customerApi.getDocuments(selectedYear);
      if (res.data) {
        setData(res.data);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to load documents';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Handle file select from input
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit. Please select a smaller file.');
      return;
    }

    setStagedFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit. Please select a smaller file.');
      return;
    }

    setStagedFile(file);
  };

  // Confirm and upload staged file
  const handleConfirmUpload = async () => {
    if (!stagedFile) return;

    try {
      setUploading(true);
      setUploadProgress(15);
      const res = await customerApi.uploadDocument(
        stagedFile,
        uploadCategory,
        selectedYear,
        (pct) => setUploadProgress(pct)
      );

      if (res.data) {
        toast.success(`"${stagedFile.name}" uploaded successfully! 📁✨`);
        setStagedFile(null);
        await fetchDocuments();
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to upload document';
      toast.error(msg);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCancelStagedFile = () => {
    setStagedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const deleteDocument = async (id: string, fileName: string) => {
    try {
      await customerApi.deleteDocument(id);
      toast.success(`"${fileName}" deleted successfully`);
      await fetchDocuments();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to delete document';
      toast.error(msg);
    }
  };

  const downloadDocument = async (id: string, fileName: string) => {
    try {
      toast.loading(`Downloading ${fileName}...`, { id: 'doc-download' });
      await customerApi.downloadDocument(id, fileName);
      toast.success('Download complete!', { id: 'doc-download' });
    } catch {
      toast.error('Failed to download document', { id: 'doc-download' });
    }
  };

  // Filtered documents list
  const documents = data?.documents || [];
  const filteredDocs = documents.filter((doc) => {
    if (filterCategory === 'ALL') return true;
    return doc.documentCategory === filterCategory;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return {
    documents,
    filteredDocs,
    taxYear: data?.taxYear || 2025,
    isConvertedCustomer: data?.isConvertedCustomer || false,
    selectedYear,
    setSelectedYear,
    filterCategory,
    setFilterCategory,
    uploadCategory,
    setUploadCategory,
    stagedFile,
    setStagedFile,
    isDragOver,
    setIsDragOver,
    fileInputRef,
    loading,
    uploading,
    uploadProgress,
    error,
    handleFileSelect,
    handleDrop,
    handleConfirmUpload,
    handleCancelStagedFile,
    deleteDocument,
    downloadDocument,
    formatFileSize,
    refetch: fetchDocuments,
  };
};
