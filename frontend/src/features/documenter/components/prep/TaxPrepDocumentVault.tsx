import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/shared/components/Button';
import { AppModal } from '@/shared/components/AppModal';
import { AppConfirmDialog } from '@/shared/components/AppConfirmDialog';
import { AppTabs } from '@/shared/components/AppTabs';
import { 
  FileText, 
  CheckCircle2, 
  Download, 
  FileCheck, 
  Eye, 
  FileSpreadsheet, 
  Image as ImageIcon, 
  UploadCloud, 
  Trash2, 
  Plus, 
  ShieldCheck, 
  FileCode,
  Archive,
  Link2,
  ExternalLink,
  Copy,
  Globe,
  Bell
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '@/lib/api-client';
import { RequestMissingDocumentsModal } from './RequestMissingDocumentsModal';

export interface DocumentItem {
  id: string;
  fileName: string;
  filePath?: string;
  documentCategory: string;
  verificationStatus: string;
  createdAt: string;
}

interface TaxPrepDocumentVaultProps {
  leadId?: string;
  applicationId?: string;
  customerName: string;
  customerEmail?: string;
  documents?: DocumentItem[];
  onDocumentVerified?: (docId: string) => void;
  onDocumentUploaded?: () => void;
}

interface StagedFileItem {
  id: string;
  file: File;
  category: string;
}

export const isDriveLinkDoc = (doc: DocumentItem): boolean => {
  return Boolean(
    doc.filePath?.startsWith('http://') ||
    doc.filePath?.startsWith('https://') ||
    doc.documentCategory === 'GOOGLE_DRIVE_LINK' ||
    doc.documentCategory === 'DRIVE_LINK' ||
    doc.fileName?.toLowerCase().includes('drive.google.com') ||
    doc.fileName?.toLowerCase().includes('docs.google.com')
  );
};

const DRIVE_LINK_CATEGORIES = [
  { label: 'Google Drive / Cloud Folder (All Documents)', value: 'GOOGLE_DRIVE_LINK' },
  { label: 'W-2 Wage Statement (Employer)', value: 'W2_WAGES' },
  { label: '1099-INT Bank Interest Statement', value: '1099_INT' },
  { label: '1099-DIV Dividend & Distribution', value: '1099_DIV' },
  { label: '1099-B Brokerage & Stock Sales', value: '1099_B' },
  { label: '1098 Mortgage Interest Statement', value: '1098_MORTGAGE' },
  { label: 'FBAR / Foreign Indian Bank Summary', value: 'FBAR_FOREIGN' },
  { label: 'Taxpayer ID / Passport / Visa Copy', value: 'ID_PASSPORT_VISA' },
  { label: 'Prior Year 1040 Tax Return', value: 'PREVIOUS_1040' },
  { label: 'Form 8879 E-Sign Signature Form', value: 'FORM_8879' },
  { label: 'Other Tax Form / Drive Link', value: 'OTHER_DOCUMENT' },
];

const DOCUMENT_CATEGORIES = [
  { label: 'W-2 Wage Statement (Employer)', value: 'W2_WAGES' },
  { label: '1099-INT Bank Interest Statement', value: '1099_INT' },
  { label: '1099-DIV Dividend & Distribution', value: '1099_DIV' },
  { label: '1099-B Brokerage & Stock Sales', value: '1099_B' },
  { label: '1098 Mortgage Interest Statement', value: '1098_MORTGAGE' },
  { label: 'FBAR / Foreign Indian Bank Summary', value: 'FBAR_FOREIGN' },
  { label: 'Taxpayer ID / Passport / Visa Copy', value: 'ID_PASSPORT_VISA' },
  { label: 'Prior Year 1040 Tax Return', value: 'PREVIOUS_1040' },
  { label: 'Form 8879 E-Sign Signature Form', value: 'FORM_8879' },
  { label: 'Other Tax Form / Expense Receipt', value: 'OTHER_DOCUMENT' },
];

const detectCategoryFromFileName = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes('w-2') || lower.includes('w2') || lower.includes('wage')) return 'W2_WAGES';
  if (lower.includes('1099-int') || lower.includes('1099int') || lower.includes('interest')) return '1099_INT';
  if (lower.includes('1099-div') || lower.includes('1099div') || lower.includes('dividend')) return '1099_DIV';
  if (lower.includes('1099-b') || lower.includes('1099b') || lower.includes('stock') || lower.includes('trade')) return '1099_B';
  if (lower.includes('1098') || lower.includes('mortgage')) return '1098_MORTGAGE';
  if (lower.includes('fbar') || lower.includes('foreign') || lower.includes('nre') || lower.includes('nro')) return 'FBAR_FOREIGN';
  if (lower.includes('passport') || lower.includes('visa') || lower.includes('i797') || lower.includes('i-797') || lower.includes('id_') || lower.includes('dl_')) return 'ID_PASSPORT_VISA';
  if (lower.includes('1040') || lower.includes('prior') || lower.includes('previous')) return 'PREVIOUS_1040';
  if (lower.includes('8879') || lower.includes('esign') || lower.includes('sign')) return 'FORM_8879';
  return 'W2_WAGES';
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const TaxPrepDocumentVault: React.FC<TaxPrepDocumentVaultProps> = ({
  leadId,
  applicationId,
  customerName,
  customerEmail,
  documents: initialDocuments = [],
  onDocumentVerified,
  onDocumentUploaded,
}) => {
  const [docList, setDocList] = useState<DocumentItem[]>(initialDocuments);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  
  // Vault Tab Switcher State: 'ALL' | 'FILES' | 'LINKS'
  const [activeVaultTab, setActiveVaultTab] = useState<'ALL' | 'FILES' | 'LINKS'>('ALL');

  // Request Missing Documents Modal State
  const [isRequestDocsModalOpen, setIsRequestDocsModalOpen] = useState(false);

  // Agent Multi-Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<StagedFileItem[]>([]);
  const [bulkCategory, setBulkCategory] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Agent Drive Link Modal State
  const [isDriveLinkModalOpen, setIsDriveLinkModalOpen] = useState(false);
  const [driveLinkUrl, setDriveLinkUrl] = useState('');
  const [driveLinkTitle, setDriveLinkTitle] = useState('');
  const [driveLinkCategory, setDriveLinkCategory] = useState('GOOGLE_DRIVE_LINK');
  const [driveLinkRemarks, setDriveLinkRemarks] = useState('');
  const [isSubmittingLink, setIsSubmittingLink] = useState(false);

  // AppConfirmDialog States
  const [docToVerify, setDocToVerify] = useState<DocumentItem | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [docToDelete, setDocToDelete] = useState<DocumentItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDocList(initialDocuments || []);
  }, [initialDocuments]);

  // Separate physical files from Drive / Cloud links
  const fileDocs = useMemo(() => docList.filter((d) => !isDriveLinkDoc(d)), [docList]);
  const linkDocs = useMemo(() => docList.filter((d) => isDriveLinkDoc(d)), [docList]);

  const filteredDocs = useMemo(() => {
    if (activeVaultTab === 'FILES') return fileDocs;
    if (activeVaultTab === 'LINKS') return linkDocs;
    return docList;
  }, [activeVaultTab, fileDocs, linkDocs, docList]);

  const handleConfirmVerify = async () => {
    if (!docToVerify) return;
    try {
      setIsVerifying(true);
      await apiClient.patch(`/documenter/documents/${docToVerify.id}/verify`, { status: 'VERIFIED' });
      setDocList((prev) =>
        prev.map((d) => (d.id === docToVerify.id ? { ...d, verificationStatus: 'VERIFIED' } : d))
      );
      toast.success(`"${docToVerify.fileName}" marked as Verified & Approved! 📁✅`);
      if (onDocumentVerified) onDocumentVerified(docToVerify.id);
      setDocToVerify(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update verification status');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDownload = async (docId: string, fileName: string, filePath?: string) => {
    if (filePath && (filePath.startsWith('http://') || filePath.startsWith('https://'))) {
      window.open(filePath, '_blank');
      return;
    }
    try {
      toast.loading(`Downloading ${fileName}...`, { id: 'doc-dl' });
      const response: any = await apiClient.get(`/documenter/documents/${docId}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Download complete!', { id: 'doc-dl' });
    } catch {
      toast.error('Failed to download document', { id: 'doc-dl' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!docToDelete) return;
    try {
      setIsDeleting(true);
      await apiClient.delete(`/documenter/documents/${docToDelete.id}`);
      setDocList((prev) => prev.filter((d) => d.id !== docToDelete.id));
      toast.success(`"${docToDelete.fileName}" deleted from vault successfully`);
      if (onDocumentUploaded) onDocumentUploaded();
      setDocToDelete(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete document');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDriveLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveLinkUrl || !driveLinkUrl.trim()) {
      toast.error('Please enter a valid Google Drive or Cloud document URL');
      return;
    }
    const trimmedUrl = driveLinkUrl.trim();
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      toast.error('URL must begin with http:// or https://');
      return;
    }
    if (!leadId) {
      toast.error('Application ID is missing');
      return;
    }

    try {
      setIsSubmittingLink(true);
      const rawTitle = driveLinkTitle.trim();
      let title = rawTitle;
      if (!title) {
        const selectedCatObj = DRIVE_LINK_CATEGORIES.find((c) => c.value === driveLinkCategory);
        if (driveLinkCategory === 'GOOGLE_DRIVE_LINK') {
          if (trimmedUrl.includes('onedrive') || trimmedUrl.includes('1drv.ms') || trimmedUrl.includes('sharepoint')) {
            title = 'OneDrive Cloud Folder';
          } else if (trimmedUrl.includes('dropbox')) {
            title = 'Dropbox Cloud Folder';
          } else if (trimmedUrl.includes('box.com')) {
            title = 'Box Cloud Folder';
          } else {
            title = 'Google Drive Folder';
          }
        } else {
          title = selectedCatObj ? `${selectedCatObj.label} Link` : 'Cloud Document Link';
        }
      }

      const res: any = await apiClient.post(`/documenter/leads/${leadId}/drive-links`, {
        linkUrl: trimmedUrl,
        title,
        documentCategory: driveLinkCategory,
        remarks: driveLinkRemarks.trim() || undefined,
      });

      const newDoc = res?.data || res;
      if (newDoc?.id) {
        setDocList((prev) => [newDoc, ...prev]);
        toast.success(`Google Drive link "${title}" added to vault! 🔗✨`);
        setIsDriveLinkModalOpen(false);
        setDriveLinkUrl('');
        setDriveLinkTitle('');
        setDriveLinkCategory('GOOGLE_DRIVE_LINK');
        setDriveLinkRemarks('');
        if (onDocumentUploaded) onDocumentUploaded();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to attach Drive link');
    } finally {
      setIsSubmittingLink(false);
    }
  };

  const addFilesToStaging = (incomingFiles: FileList | File[]) => {
    const newItems: StagedFileItem[] = Array.from(incomingFiles).map((file) => ({
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      file,
      category: detectCategoryFromFileName(file.name),
    }));
    setStagedFiles((prev) => [...prev, ...newItems]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFilesToStaging(e.target.files);
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFilesToStaging(e.dataTransfer.files);
    }
  };

  const updateStagedCategory = (id: string, category: string) => {
    setStagedFiles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, category } : item))
    );
  };

  const removeStagedFile = (id: string) => {
    setStagedFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const handleApplyBulkCategory = (category: string) => {
    setBulkCategory(category);
    if (category) {
      setStagedFiles((prev) => prev.map((item) => ({ ...item, category })));
      toast.success(`All ${stagedFiles.length} documents set to ${DOCUMENT_CATEGORIES.find(c => c.value === category)?.label || category}`);
    }
  };

  const handleAgentUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stagedFiles.length === 0) {
      toast.error('Please select at least one document file to upload');
      return;
    }
    if (!leadId) {
      toast.error('Application ID is missing');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      
      // Append each physical file
      stagedFiles.forEach((item) => {
        formData.append('files', item.file);
      });

      // Append individual category mappings
      const categoryMapping = stagedFiles.map((item) => ({
        fileName: item.file.name,
        category: item.category,
      }));
      formData.append('fileCategories', JSON.stringify(categoryMapping));
      formData.append('documentCategory', stagedFiles[0]?.category || 'W2_WAGES');

      const res: any = await apiClient.post(`/documenter/leads/${leadId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newDocs: DocumentItem[] = Array.isArray(res?.data) 
        ? res.data 
        : res?.documents 
          ? res.documents 
          : res?.data ? [res.data] : [];

      if (newDocs.length > 0) {
        setDocList((prev) => [...newDocs, ...prev]);
        toast.success(`Successfully uploaded ${newDocs.length} document${newDocs.length > 1 ? 's' : ''} to ${customerName}'s vault! 📁✨`);
        setIsUploadModalOpen(false);
        setStagedFiles([]);
        if (onDocumentUploaded) onDocumentUploaded();
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to upload documents';
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const getCategoryBadge = (cat: string) => {
    const upper = (cat || '').toUpperCase();
    if (upper.includes('DRIVE') || upper.includes('GOOGLE') || upper.includes('CLOUD')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Google Drive</span>;
    }
    if (upper.includes('W2') || upper.includes('W-2')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">W-2 Wages</span>;
    }
    if (upper.includes('DIV') || upper.includes('DIVIDEND')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">1099-DIV Dividends</span>;
    }
    if (upper.includes('INT') || upper.includes('INTEREST')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">1099-INT Interest</span>;
    }
    if (upper.includes('BROKERAGE') || upper.includes('1099_B') || upper.includes('1099-B') || upper.includes('STOCK')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">1099-B Stocks</span>;
    }
    if (upper.includes('FBAR') || upper.includes('INDIAN') || upper.includes('FOREIGN')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">FBAR Indian</span>;
    }
    if (upper.includes('1098') || upper.includes('MORTGAGE')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">1098 Mortgage</span>;
    }
    if (upper.includes('PASSPORT') || upper.includes('VISA') || upper.includes('ID')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">ID / Visa Copy</span>;
    }
    if (upper.includes('1040') || upper.includes('PRIOR')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Prior 1040 Return</span>;
    }
    if (upper.includes('8879') || upper.includes('ESIGN')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-200">Form 8879 E-Sign</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">{cat || 'Tax Slip'}</span>;
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
      return <ImageIcon className="w-4 h-4 text-emerald-600" />;
    }
    if (['xlsx', 'xls', 'csv'].includes(ext)) {
      return <FileSpreadsheet className="w-4 h-4 text-teal-600" />;
    }
    if (['doc', 'docx'].includes(ext)) {
      return <FileText className="w-4 h-4 text-blue-600" />;
    }
    if (['txt', 'rtf', 'text', 'md'].includes(ext)) {
      return <FileCode className="w-4 h-4 text-amber-600" />;
    }
    if (['zip', '7z', 'rar', 'tar', 'gz'].includes(ext)) {
      return <Archive className="w-4 h-4 text-purple-600" />;
    }
    return <FileText className="w-4 h-4 text-rose-600" />;
  };

  const getStagedFileBadge = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (['doc', 'docx'].includes(ext)) {
      return <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-blue-100 text-blue-800 uppercase">Word</span>;
    }
    if (['txt', 'rtf', 'text', 'md'].includes(ext)) {
      return <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-100 text-amber-800 uppercase">Text</span>;
    }
    if (['xlsx', 'xls', 'csv'].includes(ext)) {
      return <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-teal-100 text-teal-800 uppercase">Excel</span>;
    }
    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      return <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-800 uppercase">Image</span>;
    }
    if (['zip', '7z', 'rar', 'tar', 'gz'].includes(ext)) {
      return <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-purple-100 text-purple-800 uppercase">ZIP</span>;
    }
    return <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-100 text-rose-800 uppercase">PDF</span>;
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Notice Banner with Upload Buttons */}
      <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-purple-600 shrink-0" />
          <span className="font-medium">
            <strong>Client Tax Vault</strong> — Review and manage taxpayer statements for {customerName}.
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
            {fileDocs.length} Files • {linkDocs.length} Drive Links
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsRequestDocsModalOpen(true)}
            className="bg-white hover:bg-purple-50 text-purple-700 border-purple-300 text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer h-7.5 px-3 rounded-lg"
            title="Send in-app notification and email requesting missing documents from client"
          >
            <Bell className="w-3.5 h-3.5 text-purple-600" />
            <span>Send Notification / Request Docs</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsDriveLinkModalOpen(true)}
            className="bg-white hover:bg-blue-50 text-blue-700 border-blue-300 text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer h-7.5 px-3 rounded-lg"
          >
            <Link2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Upload Drive Link</span>
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setStagedFiles([]);
              setIsUploadModalOpen(true);
            }}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer h-7.5 px-3 rounded-lg"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload Documents</span>
          </Button>
        </div>
      </div>

      {/* Tab Switcher: All Items, Uploaded Documents, Drive & Cloud Links */}
      <div className="border-b border-slate-200 pb-1">
        <AppTabs
          tabs={[
            { id: 'ALL', label: 'All Items', count: docList.length },
            { id: 'FILES', label: 'Uploaded Documents', count: fileDocs.length },
            { id: 'LINKS', label: 'Drive & Cloud Links', count: linkDocs.length },
          ]}
          activeTab={activeVaultTab}
          onChange={(tabId) => setActiveVaultTab(tabId as 'ALL' | 'FILES' | 'LINKS')}
          size="sm"
        />
      </div>

      {/* Documents & Links List */}
      {filteredDocs.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto border border-purple-100 font-bold">
            {activeVaultTab === 'LINKS' ? <Globe className="w-6 h-6 text-blue-600" /> : <FileText className="w-6 h-6" />}
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">
              {activeVaultTab === 'LINKS'
                ? 'No Drive Links Added Yet'
                : activeVaultTab === 'FILES'
                ? 'No Uploaded Documents Yet'
                : 'No Documents or Drive Links Yet'}
            </h4>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-0.5">
              {activeVaultTab === 'LINKS'
                ? `No external Google Drive or Cloud links have been added for ${customerName}. You can paste and save drive links shared by the client using the button below.`
                : activeVaultTab === 'FILES'
                ? `No files are uploaded yet for ${customerName}. You can upload W-2s, 1099s, Word/Text documents, or ID proofs directly on behalf of the client.`
                : `No files or drive links are recorded yet for ${customerName}. You can upload physical files, save shared Google Drive links, or send a missing documents request to the client.`}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsRequestDocsModalOpen(true)}
              className="bg-white hover:bg-purple-50 text-purple-700 border-purple-300 text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer px-4 h-8"
            >
              <Bell className="w-3.5 h-3.5 text-purple-600" />
              <span>Send Notification / Request Missing Docs</span>
            </Button>
            {(activeVaultTab === 'LINKS' || activeVaultTab === 'ALL') && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsDriveLinkModalOpen(true)}
                className="bg-white hover:bg-blue-50 text-blue-700 border-blue-300 text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer px-4 h-8"
              >
                <Link2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Upload Drive Link</span>
              </Button>
            )}
            {(activeVaultTab === 'FILES' || activeVaultTab === 'ALL') && (
              <Button
                size="sm"
                onClick={() => {
                  setStagedFiles([]);
                  setIsUploadModalOpen(true);
                }}
                className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer px-4 h-8"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload Documents on Behalf of Client</span>
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredDocs.map((doc) => {
            const isLink = isDriveLinkDoc(doc);
            return (
              <div
                key={doc.id}
                className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-all"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold shrink-0 ${
                    isLink 
                      ? 'bg-blue-50 text-blue-600 border border-blue-100'
                      : 'bg-emerald-50 text-[#16A34A] border border-emerald-100'
                  }`}>
                    {isLink ? <Globe className="w-4 h-4" /> : getFileIcon(doc.fileName)}
                  </div>

                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate" title={doc.fileName}>
                        {doc.fileName}
                      </span>
                      {isLink && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                          <Link2 className="w-2.5 h-2.5" /> Drive Link
                        </span>
                      )}
                      {getCategoryBadge(doc.documentCategory)}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-medium">
                      <span>
                        Uploaded: <strong>{new Date(doc.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong>
                      </span>
                      {isLink && doc.filePath && (
                        <>
                          <span>•</span>
                          <a
                            href={doc.filePath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 truncate max-w-xs sm:max-w-md"
                            title={doc.filePath}
                          >
                            <span className="truncate">{doc.filePath}</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status & Actions: Preview / Open, Download / Copy, Delete, Verify */}
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  {isLink ? (
                    <>
                      {/* Open Link Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(doc.filePath, '_blank')}
                        className="border-slate-200 text-blue-700 hover:bg-blue-50 text-xs font-bold h-7 px-2.5 flex items-center gap-1 cursor-pointer"
                        title="Open Google Drive Link in new tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                        <span>Open Link</span>
                      </Button>

                      {/* Copy Link Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (doc.filePath) {
                            navigator.clipboard.writeText(doc.filePath);
                            toast.success('Drive link copied to clipboard! 📋');
                          }
                        }}
                        className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold h-7 px-2 flex items-center gap-1 cursor-pointer"
                        title="Copy Link URL"
                      >
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                      </Button>
                    </>
                  ) : (
                    <>
                      {/* 1. Preview Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPreviewDoc(doc)}
                        className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold h-7 px-2.5 flex items-center gap-1 cursor-pointer"
                        title="Preview Document"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>Preview</span>
                      </Button>

                      {/* 2. Download Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(doc.id, doc.fileName, doc.filePath)}
                        className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold h-7 px-2.5 flex items-center gap-1 cursor-pointer"
                        title="Download File"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-600" />
                        <span>Download</span>
                      </Button>
                    </>
                  )}

                  {/* Delete Button */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDocToDelete(doc)}
                    className="border-slate-200 text-rose-600 hover:bg-rose-50 text-xs font-bold h-7 px-2 flex items-center gap-1 cursor-pointer"
                    title={isLink ? 'Delete Drive Link' : 'Delete File'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>

                  {/* Verify Status */}
                  {doc.verificationStatus === 'VERIFIED' ? (
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                      Verified
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => setDocToVerify(doc)}
                      className="h-7 px-2.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verify &amp; Approve</span>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Agent Multi-Upload Document Modal */}
      <AppModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setStagedFiles([]);
        }}
        title={`Upload Tax Documents for ${customerName}`}
        width="680px"
      >
        <form onSubmit={handleAgentUploadSubmit} className="space-y-4 font-sans py-1 w-full max-w-full overflow-hidden">
          {/* Agent Assistance Banner */}
          <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Multi-Document Vault Upload:</strong> Select multiple tax slips, Word (.doc/.docx), text files (.txt/.rtf), ZIP archives (.zip), PDFs, and spreadsheets. Choose a category for each document below before securing to vault.
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg,.docx,.doc,.xlsx,.xls,.csv,.txt,.rtf,.zip,.7z,.rar"
            onChange={handleFileChange}
          />

          {/* Drag & Drop Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`p-4 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all duration-200 ${
              isDragOver
                ? 'border-[#16A34A] bg-emerald-50/60 scale-[0.99]'
                : stagedFiles.length > 0
                ? 'border-emerald-300 bg-emerald-50/20 hover:bg-emerald-50/40'
                : 'border-slate-300 hover:border-emerald-500 bg-slate-50/60 hover:bg-white'
            }`}
          >
            <UploadCloud className={`w-7 h-7 mx-auto mb-1 ${stagedFiles.length > 0 ? 'text-[#16A34A]' : 'text-slate-400'}`} />
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-800">
                {stagedFiles.length > 0 ? '+ Click or drag & drop to add MORE files' : 'Click or drag & drop documents from your computer'}
              </div>
              <div className="text-[11px] text-slate-500">
                Supports: <strong>PDF, Word (.docx, .doc), Text (.txt, .rtf), ZIP (.zip), Excel/CSV, Images</strong> (Max 25MB each)
              </div>
            </div>
          </div>

          {/* Staged Documents Queue with Category Selectors */}
          {stagedFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs font-bold text-slate-800 shrink-0">
                    Selected Documents ({stagedFiles.length})
                  </span>
                </div>

                {/* Bulk Quick Apply (Convenience Feature) */}
                {stagedFiles.length > 1 && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] font-medium text-slate-500 shrink-0">Set all to:</span>
                    <select
                      value={bulkCategory}
                      onChange={(e) => handleApplyBulkCategory(e.target.value)}
                      className="text-xs border border-slate-300 rounded-lg px-2 py-1 bg-white text-slate-700 hover:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer max-w-[200px]"
                    >
                      <option value="">-- Apply to all --</option>
                      {DOCUMENT_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Scrollable File List with explicit overflow-x-hidden */}
              <div className="max-h-60 overflow-y-auto overflow-x-hidden space-y-2 pr-1 custom-scrollbar">
                {stagedFiles.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-slate-50/90 border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-between gap-3 min-w-0"
                  >
                    {/* Left: Icon, File Name, Size & Ext badge */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-white shadow-2xs border border-slate-200 flex items-center justify-center shrink-0">
                        {getFileIcon(item.file.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-xs font-bold text-slate-900 truncate" title={item.file.name}>
                            {item.file.name}
                          </span>
                          {getStagedFileBadge(item.file.name)}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          Size: {formatFileSize(item.file.size)} • Doc #{index + 1}
                        </div>
                      </div>
                    </div>

                    {/* Right: Individual Category Dropdown & Remove Button */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="w-48 sm:w-52">
                        <select
                          value={item.category}
                          onChange={(e) => updateStagedCategory(item.id, e.target.value)}
                          className="w-full text-xs font-medium border border-slate-300 rounded-lg px-2 py-1.5 bg-white text-slate-800 hover:border-emerald-500 focus:outline-none focus:ring-1.5 focus:ring-emerald-500 transition-all cursor-pointer shadow-2xs"
                        >
                          {DOCUMENT_CATEGORIES.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeStagedFile(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Remove file from queue"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 min-w-0">
            <div className="text-[11px] text-slate-500 font-medium truncate">
              {stagedFiles.length > 0 ? (
                <span>
                  <strong>{stagedFiles.length}</strong> {stagedFiles.length === 1 ? 'file' : 'files'} queued for upload
                </span>
              ) : (
                <span>No files selected yet</span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setStagedFiles([]);
                }}
                className="border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={isUploading}
                disabled={stagedFiles.length === 0 || isUploading}
                className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold px-4 cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>
                  {isUploading
                    ? 'Uploading...'
                    : stagedFiles.length > 1
                    ? `Upload All ${stagedFiles.length} Documents`
                    : 'Upload & Secure in Vault'}
                </span>
              </Button>
            </div>
          </div>
        </form>
      </AppModal>

      {/* Agent Drive Link Modal */}
      <AppModal
        isOpen={isDriveLinkModalOpen}
        onClose={() => {
          setIsDriveLinkModalOpen(false);
          setDriveLinkUrl('');
          setDriveLinkTitle('');
          setDriveLinkCategory('GOOGLE_DRIVE_LINK');
          setDriveLinkRemarks('');
        }}
        title={`Upload Google Drive / Cloud Link for ${customerName}`}
        width="620px"
      >
        <form onSubmit={handleDriveLinkSubmit} className="space-y-4 font-sans py-1">
          {/* Banner */}
          <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
            <Globe className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Attach Cloud Document / Drive Link:</strong> Paste a Google Drive, OneDrive, Dropbox, or Box link shared by the client. The URL will be saved to the taxpayer's vault and accessible to the preparation &amp; audit teams.
            </div>
          </div>

          {/* URL Input */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-800">
              Drive / Cloud Storage URL <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="url"
                required
                value={driveLinkUrl}
                onChange={(e) => setDriveLinkUrl(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/... or https://docs.google.com/..."
                className="w-full text-xs font-medium border border-slate-300 rounded-lg pl-8 pr-3 py-2 bg-white text-slate-800 hover:border-blue-500 focus:outline-none focus:ring-1.5 focus:ring-blue-500 transition-all placeholder:text-slate-400"
              />
              <Link2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
            <p className="text-[10px] text-slate-500">
              Must begin with <strong>http://</strong> or <strong>https://</strong>
            </p>
          </div>

          {/* Title / Name Input */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-800">
              Document / Folder Title <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={driveLinkTitle}
              onChange={(e) => setDriveLinkTitle(e.target.value)}
              placeholder="Optional, e.g. 2024 W-2s & 1099s Google Drive Folder"
              className="w-full text-xs font-medium border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 hover:border-blue-500 focus:outline-none focus:ring-1.5 focus:ring-blue-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Category Dropdown */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-800">
              Document Category
            </label>
            <select
              value={driveLinkCategory}
              onChange={(e) => setDriveLinkCategory(e.target.value)}
              className="w-full text-xs font-medium border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 hover:border-blue-500 focus:outline-none focus:ring-1.5 focus:ring-blue-500 transition-all cursor-pointer shadow-2xs"
            >
              {DRIVE_LINK_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Optional Remarks */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-800">
              Notes / Instructions <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={driveLinkRemarks}
              onChange={(e) => setDriveLinkRemarks(e.target.value)}
              placeholder="e.g. Client shared full Google Drive containing all 2024 W-2s and 1099-B statements..."
              className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 hover:border-blue-500 focus:outline-none focus:ring-1.5 focus:ring-blue-500 transition-all placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsDriveLinkModalOpen(false);
                setDriveLinkUrl('');
                setDriveLinkTitle('');
                setDriveLinkCategory('GOOGLE_DRIVE_LINK');
                setDriveLinkRemarks('');
              }}
              className="border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isSubmittingLink}
              disabled={!driveLinkUrl.trim() || isSubmittingLink}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>{isSubmittingLink ? 'Saving Link...' : 'Save Drive Link'}</span>
            </Button>
          </div>
        </form>
      </AppModal>

      {/* Document Preview Modal */}
      {previewDoc && (
        <AppModal
          isOpen={Boolean(previewDoc)}
          onClose={() => setPreviewDoc(null)}
          title={isDriveLinkDoc(previewDoc) ? `Drive Link: ${previewDoc.fileName}` : `Document Preview: ${previewDoc.fileName}`}
          width="600px"
        >
          <div className="space-y-4 font-sans">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                {isDriveLinkDoc(previewDoc) ? (
                  <Globe className="w-4 h-4 text-blue-600" />
                ) : (
                  <FileText className="w-4 h-4 text-emerald-600" />
                )}
                <span className="font-bold">{previewDoc.fileName}</span>
                {isDriveLinkDoc(previewDoc) && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                    <Link2 className="w-2.5 h-2.5" /> Drive Link
                  </span>
                )}
                {getCategoryBadge(previewDoc.documentCategory)}
              </div>

              <div className="flex items-center gap-2">
                {isDriveLinkDoc(previewDoc) ? (
                  <Button
                    size="sm"
                    onClick={() => window.open(previewDoc.filePath, '_blank')}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer h-7"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Drive Link</span>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleDownload(previewDoc.id, previewDoc.fileName, previewDoc.filePath)}
                    className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer h-7"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download File</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Preview Box */}
            <div className="p-8 rounded-xl bg-slate-100 border border-slate-200 text-center space-y-3 min-h-[260px] flex flex-col items-center justify-center">
              <div className={`w-16 h-16 rounded-2xl bg-white shadow-xs flex items-center justify-center mx-auto border border-slate-200 ${
                isDriveLinkDoc(previewDoc) ? 'text-blue-600' : 'text-emerald-600'
              }`}>
                {isDriveLinkDoc(previewDoc) ? <Globe className="w-8 h-8" /> : getFileIcon(previewDoc.fileName)}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">{previewDoc.fileName}</h4>
                <p className="text-xs text-slate-500 mt-1">
                  {isDriveLinkDoc(previewDoc) ? 'Client Shared Google Drive / Cloud Link' : 'Taxpayer Uploaded Document'} • Category: <strong>{previewDoc.documentCategory}</strong>
                </p>
              </div>

              {isDriveLinkDoc(previewDoc) && previewDoc.filePath && (
                <div className="w-full max-w-md bg-white p-3 rounded-lg border border-slate-200 text-left space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Direct Destination URL:</div>
                  <div className="flex items-center gap-2">
                    <a
                      href={previewDoc.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline font-mono truncate flex-1 block"
                    >
                      {previewDoc.filePath}
                    </a>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (previewDoc.filePath) {
                          navigator.clipboard.writeText(previewDoc.filePath);
                          toast.success('Drive link copied to clipboard! 📋');
                        }
                      }}
                      className="h-6 px-2 text-[10px] shrink-0"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </Button>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-slate-400 max-w-sm">
                {isDriveLinkDoc(previewDoc)
                  ? 'Click "Open Drive Link" above to access the shared Google Drive folder in a new browser tab.'
                  : 'Document is stored securely in the ATH CRM encrypted storage engine. Click download above to open the raw physical copy.'}
              </p>
            </div>
          </div>
        </AppModal>
      )}

      {/* Confirmation Dialog for Verify & Approve */}
      {docToVerify && (
        <AppConfirmDialog
          isOpen={Boolean(docToVerify)}
          onClose={() => setDocToVerify(null)}
          onConfirm={handleConfirmVerify}
          title="Verify & Approve Tax Document"
          description={`Are you sure you want to verify and approve "${docToVerify.fileName}"? This will mark the client's tax statement as authenticated and ready for 1040 preparation.`}
          confirmLabel="Yes, Verify & Approve"
          cancelLabel="Cancel"
          variant="success"
          isLoading={isVerifying}
        />
      )}

      {/* Confirmation Dialog for Delete Document */}
      {docToDelete && (
        <AppConfirmDialog
          isOpen={Boolean(docToDelete)}
          onClose={() => setDocToDelete(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Document from Vault"
          description={`Are you sure you want to permanently remove "${docToDelete.fileName}" from this taxpayer's vault? This action cannot be undone.`}
          confirmLabel="Yes, Delete Document"
          cancelLabel="Cancel"
          variant="danger"
          isLoading={isDeleting}
        />
      )}

      {/* Request Missing Documents Modal */}
      <RequestMissingDocumentsModal
        isOpen={isRequestDocsModalOpen}
        onClose={() => setIsRequestDocsModalOpen(false)}
        leadId={leadId}
        applicationId={applicationId}
        customerName={customerName}
        customerEmail={customerEmail}
        onRequestSent={() => {
          if (onDocumentUploaded) onDocumentUploaded();
        }}
      />
    </div>
  );
};
