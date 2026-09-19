import React from 'react';
import { AppModal } from '@/shared/components/AppModal';
import { Button } from '@/shared/components/Button';
import { 
  Globe, 
  ExternalLink, 
  Copy, 
  Download, 
  FileText, 
  CheckCircle2, 
  Clock
} from 'lucide-react';
import { type CustomerDocumentItem } from '../../services/customer-api';
import { isDriveLinkDoc } from '../../hooks/useCustomerDocuments';
import toast from 'react-hot-toast';

interface CustomerDocumentPreviewModalProps {
  document: CustomerDocumentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (id: string, fileName: string) => void;
}

export const CustomerDocumentPreviewModal: React.FC<CustomerDocumentPreviewModalProps> = ({
  document: doc,
  isOpen,
  onClose,
  onDownload,
}) => {
  if (!doc) return null;

  const isLink = isDriveLinkDoc(doc);
  const linkUrl = doc.filePath || '';

  const handleCopyLink = () => {
    if (linkUrl) {
      navigator.clipboard.writeText(linkUrl);
      toast.success('Drive link copied to clipboard! 📋');
    }
  };

  const handleOpenLink = () => {
    if (linkUrl) {
      window.open(linkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={isLink ? 'Google Drive / Cloud Link' : 'Tax Document Details'}
      subtitle={doc.fileName}
      size="lg"
    >
      <div className="space-y-5">
        {/* Cloud Link View */}
        {isLink ? (
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-blue-50/40 to-slate-50 border border-indigo-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 shadow-2xs border border-indigo-200">
                <Globe className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {doc.fileName}
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                    Drive Link
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono truncate mt-0.5">
                  {linkUrl}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-indigo-100 text-xs text-slate-600 leading-relaxed">
              This tax document is securely hosted on an external cloud storage provider (Google Drive / OneDrive / Dropbox). You and your assigned CPA team can access it via the link below.
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                size="sm"
                onClick={handleOpenLink}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Google Drive / Cloud</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyLink}
                className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy URL</span>
              </Button>
            </div>
          </div>
        ) : (
          /* Physical File View */
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#16A34A] flex items-center justify-center shrink-0 border border-emerald-200">
                <FileText className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-slate-900 truncate">
                  {doc.fileName}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Uploaded on {new Date(doc.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                size="sm"
                onClick={() => onDownload(doc.id, doc.fileName)}
                className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download File</span>
              </Button>
            </div>
          </div>
        )}

        {/* Verification Status & Details */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-medium text-slate-400 block">Category</span>
            <span className="font-bold text-slate-800 mt-0.5 block">{doc.documentCategory}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-medium text-slate-400 block">Verification Status</span>
            <span className="font-bold text-slate-800 mt-0.5 flex items-center gap-1">
              {doc.verificationStatus === 'VERIFIED' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span className="text-[#16A34A]">Verified</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-amber-600">Under Review</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end pt-2 border-t border-slate-100">
          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
            className="border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold"
          >
            Close
          </Button>
        </div>
      </div>
    </AppModal>
  );
};
