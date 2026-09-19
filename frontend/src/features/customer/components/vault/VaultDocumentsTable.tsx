import React, { useState } from 'react';
import { 
  FileCheck, 
  FileText, 
  Download, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FolderArchive, 
  Plus, 
  RefreshCw,
  Globe,
  ExternalLink,
  Copy,
  Eye,
  Link2
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppSelect } from '@/shared/components/AppSelect';
import { type CustomerDocumentItem } from '../../services/customer-api';
import { isDriveLinkDoc } from '../../hooks/useCustomerDocuments';
import { CustomerDocumentPreviewModal } from './CustomerDocumentPreviewModal';
import { CATEGORY_FILTER_OPTIONS } from '../../constants/upload-categories';
import toast from 'react-hot-toast';

interface VaultDocumentsTableProps {
  selectedYear: string;
  filteredDocs: CustomerDocumentItem[];
  filterCategory: string;
  setFilterCategory: (cat: string) => void;
  loading: boolean;
  onOpenUpload: () => void;
  onOpenDriveLinkModal?: () => void;
  onDownload: (id: string, fileName: string) => void;
  onDelete: (id: string, fileName: string) => void;
}

export const VaultDocumentsTable: React.FC<VaultDocumentsTableProps> = ({
  selectedYear,
  filteredDocs,
  filterCategory,
  setFilterCategory,
  loading,
  onOpenUpload,
  onOpenDriveLinkModal,
  onDownload,
  onDelete,
}) => {
  const [previewDoc, setPreviewDoc] = useState<CustomerDocumentItem | null>(null);

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'GOOGLE_DRIVE_LINK':
      case 'DRIVE_LINK':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1 w-fit">
            <Globe className="w-3 h-3 text-indigo-500" />
            <span>Drive Folder</span>
          </span>
        );
      case 'W2_WAGES':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">W-2 Wages</span>;
      case '1099_BROKERAGE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">1099-B Stocks</span>;
      case '1099_INT':
      case '1099_INT_DIV':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">1099-INT Interest</span>;
      case '1099_DIV':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">1099-DIV Dividends</span>;
      case '1098_T_TUITION':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-200">1098-T Tuition</span>;
      case '1098_E_STUDENT_LOAN':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-200">1098-E Loan</span>;
      case '1099_MISC':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200">1099-MISC</span>;
      case '1099_G_STATE_REFUND':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">1099-G State</span>;
      case '1099_R_RETIREMENT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">1099-R Pension</span>;
      case '1099_SA_HSA':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">1099-SA HSA</span>;
      case '1099_HC_MA_HEALTH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-50 text-pink-700 border border-pink-200">1099-HC Health</span>;
      case '1095_A_MARKETPLACE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-50 text-pink-700 border border-pink-200">1095-A ACA</span>;
      case 'W2_G_GAMBLING':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-50 text-yellow-800 border border-yellow-200">W-2G Gaming</span>;
      case 'STOCK_3921_3922':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">3921/3922 ESPP</span>;
      case 'FBAR_FOREIGN':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">FBAR Indian</span>;
      case 'PRIOR_YEAR_RETURN':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300">Prior Tax Return</span>;
      case 'MORTGAGE_1098':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">1098 Mortgage</span>;
      case 'VISA_IDENTITY':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">Visa / I-797</span>;
      case 'FINAL_1040_RETURN':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">Form 1040 Certified</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">Tax Document</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#16A34A] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-[#16A34A]" /> Verified
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
            <AlertCircle className="w-3 h-3 text-red-500" /> Resubmit Needed
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            <Clock className="w-3 h-3 text-amber-500" /> Under Review
          </span>
        );
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Drive link copied to clipboard! 📋');
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-[#16A34A]" />
            <span className="text-xs font-bold text-slate-900">
              Tax Statements for TY {selectedYear} ({filteredDocs.length})
            </span>
          </div>

          <div className="w-64">
            <AppSelect
              options={CATEGORY_FILTER_OPTIONS}
              value={filterCategory}
              onChange={(val) => setFilterCategory(val || 'ALL')}
              placeholder="Filter by Category"
            />
          </div>
        </div>

        {/* Documents Table */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 font-medium">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-emerald-500 mb-2" />
            Loading uploaded tax vault files...
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FolderArchive className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">No Tax Documents Found</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Upload your TY {selectedYear} tax documents or attach a Google Drive / OneDrive folder link.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <Button
                size="sm"
                onClick={onOpenUpload}
                className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold gap-1 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload Documents</span>
              </Button>
              {onOpenDriveLinkModal && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onOpenDriveLinkModal}
                  className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-bold gap-1 cursor-pointer"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Attach Drive Link</span>
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/60 text-slate-600 font-bold">
                  <th className="py-3 px-4">Document / Link Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Upload Timestamp</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredDocs.map((doc) => {
                  const isLink = isDriveLinkDoc(doc);
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & URL */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                            isLink
                              ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                              : 'bg-emerald-50 text-[#16A34A] border-emerald-100'
                          }`}>
                            {isLink ? <Globe className="w-4 h-4 text-indigo-600" /> : <FileText className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0">
                            <span
                              onClick={() => setPreviewDoc(doc)}
                              className="font-bold text-slate-900 block truncate max-w-xs sm:max-w-md hover:text-[#16A34A] cursor-pointer"
                              title={doc.fileName}
                            >
                              {doc.fileName}
                            </span>
                            {isLink && doc.filePath && (
                              <a
                                href={doc.filePath}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-indigo-600 hover:text-indigo-800 truncate block max-w-xs flex items-center gap-1 mt-0.5"
                                title={doc.filePath}
                              >
                                <span className="truncate">{doc.filePath}</span>
                                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Type Badge (File vs Link) */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isLink ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <Link2 className="w-3 h-3 text-indigo-500" /> Drive Link
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            <FileText className="w-3 h-3 text-slate-500" /> File
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getCategoryBadge(doc.documentCategory)}
                      </td>

                      {/* Timestamp */}
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(doc.createdAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      {/* Verification Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getStatusBadge(doc.verificationStatus)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Preview Details */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPreviewDoc(doc)}
                            className="border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold p-1.5 cursor-pointer h-7"
                            title="Preview / Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>

                          {/* Link Actions */}
                          {isLink ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCopyLink(doc.filePath || '')}
                                className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-bold p-1.5 cursor-pointer h-7"
                                title="Copy Drive Link"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </Button>
                              <a
                                href={doc.filePath}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center border border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-lg text-xs font-bold p-1.5 h-7 transition-colors"
                                title="Open Drive Link in new tab"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </>
                          ) : (
                            /* File Download */
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onDownload(doc.id, doc.fileName)}
                              className="border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold p-1.5 cursor-pointer h-7"
                              title="Download Document"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </Button>
                          )}

                          {/* Delete (if pending) */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onDelete(doc.id, doc.fileName)}
                            className="border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 text-xs font-bold p-1.5 cursor-pointer h-7 transition-colors"
                            title="Delete Document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <CustomerDocumentPreviewModal
        document={previewDoc}
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        onDownload={onDownload}
      />
    </>
  );
};
