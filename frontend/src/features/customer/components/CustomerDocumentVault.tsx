import React, { useState } from 'react';
import { 
  FolderArchive, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Download,
  Calendar
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppSelect } from '@/shared/components/AppSelect';
import toast from 'react-hot-toast';
import { useOutletContext } from 'react-router-dom';

interface VaultFile {
  id: string;
  taxYear: string;
  category: 'W2' | '1099' | 'VISA' | 'FILED_RETURN' | 'IRS_PROOF';
  categoryLabel: string;
  name: string;
  size: string;
  uploadedAt: string;
  status: 'VERIFIED' | 'UNDER_REVIEW' | 'AWAITING_UPLOAD' | 'LOCKED';
}

interface CustomerDocumentVaultProps {
  isConvertedCustomer?: boolean;
}

export const CustomerDocumentVault: React.FC<CustomerDocumentVaultProps> = ({
  isConvertedCustomer: propConverted,
}) => {
  const context = useOutletContext<{ isConvertedCustomer?: boolean }>() || {};
  const isConvertedCustomer = propConverted !== undefined ? propConverted : Boolean(context.isConvertedCustomer);
  
  const [selectedYear, setSelectedYear] = useState<string>('2025');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [uploadedFiles, setUploadedFiles] = useState<VaultFile[]>([]);

  const defaultFiles: VaultFile[] = isConvertedCustomer
    ? [
        // TY2025 Unlocked Filed Return & Proof
        {
          id: 'f-2025-1040',
          taxYear: '2025',
          category: 'FILED_RETURN',
          categoryLabel: 'Official Form 1040 Return',
          name: 'Form_1040_TY2025_Final_Certified.pdf',
          size: '4.2 MB',
          uploadedAt: 'Today 12:15 PM',
          status: 'VERIFIED',
        },
        {
          id: 'f-2025-irs',
          taxYear: '2025',
          category: 'IRS_PROOF',
          categoryLabel: 'IRS E-File Acceptance Proof',
          name: 'IRS_Submission_Acceptance_TY2025.pdf',
          size: '720 KB',
          uploadedAt: 'Today 12:20 PM',
          status: 'VERIFIED',
        },
        {
          id: 'f-1',
          taxYear: '2025',
          category: 'W2',
          categoryLabel: 'W-2 Wage Statement',
          name: 'W2_EnergyGrids_2025.pdf',
          size: '1.4 MB',
          uploadedAt: 'Today 11:20 AM',
          status: 'VERIFIED',
        },
        {
          id: 'f-2',
          taxYear: '2025',
          category: '1099',
          categoryLabel: '1099-INT Bank Statement',
          name: 'Chase_1099INT_TY2025.pdf',
          size: '420 KB',
          uploadedAt: 'Today 11:24 AM',
          status: 'VERIFIED',
        },
        {
          id: 'f-3',
          taxYear: '2025',
          category: 'VISA',
          categoryLabel: 'Visa & Passport Copy',
          name: 'I797_H1B_Approval_Notice.pdf',
          size: '2.1 MB',
          uploadedAt: 'Today 11:25 AM',
          status: 'VERIFIED',
        },
        // TY2024 Files
        {
          id: 'f-4',
          taxYear: '2024',
          category: 'FILED_RETURN',
          categoryLabel: 'Official Form 1040 Return',
          name: 'Form_1040_TY2024_Final_Filed.pdf',
          size: '3.8 MB',
          uploadedAt: 'Apr 12, 2025',
          status: 'VERIFIED',
        },
        {
          id: 'f-5',
          taxYear: '2024',
          category: 'IRS_PROOF',
          categoryLabel: 'IRS E-File Acceptance Proof',
          name: 'IRS_Submission_Acceptance_TY2024.pdf',
          size: '680 KB',
          uploadedAt: 'Apr 14, 2025',
          status: 'VERIFIED',
        },
      ]
    : [
        // TY2025 Intake Only (Form 1040 locked until payment)
        {
          id: 'f-1',
          taxYear: '2025',
          category: 'W2',
          categoryLabel: 'W-2 Wage Statement',
          name: 'W2_EnergyGrids_2025.pdf',
          size: '1.4 MB',
          uploadedAt: 'Today 11:20 AM',
          status: 'VERIFIED',
        },
        {
          id: 'f-2',
          taxYear: '2025',
          category: '1099',
          categoryLabel: '1099-INT Bank Statement',
          name: 'Chase_1099INT_TY2025.pdf',
          size: '420 KB',
          uploadedAt: 'Today 11:24 AM',
          status: 'UNDER_REVIEW',
        },
        {
          id: 'f-3',
          taxYear: '2025',
          category: 'VISA',
          categoryLabel: 'Visa & Passport Copy',
          name: 'I797_H1B_Approval_Notice.pdf',
          size: '2.1 MB',
          uploadedAt: 'Today 11:25 AM',
          status: 'VERIFIED',
        },
      ];

  const allFiles = [...uploadedFiles, ...defaultFiles];

  const filteredFiles = allFiles.filter((f) => {
    const matchesYear = f.taxYear === selectedYear;
    const matchesCategory = activeCategory === 'ALL' || f.category === activeCategory;
    return matchesYear && matchesCategory;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newFile: VaultFile = {
        id: `f-${Date.now()}`,
        taxYear: selectedYear,
        category: 'W2',
        categoryLabel: 'Tax Document Upload',
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadedAt: 'Just now',
        status: 'UNDER_REVIEW',
      };
      setUploadedFiles((prev) => [newFile, ...prev]);
      toast.success(`Successfully uploaded ${file.name} to TY ${selectedYear} vault! 🚀`);
    }
  };

  const handleDownload = (fileName: string) => {
    toast.success(`Downloading ${fileName}...`);
  };

  return (
    <div className="space-y-6">
      {/* 1. Year Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <FolderArchive className="w-5 h-5 text-[#16A34A]" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {isConvertedCustomer ? 'Multi-Year Tax Document Vault' : 'TY 2025 Intake Document Vault'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {isConvertedCustomer
                ? 'Access your current tax slips, filed Form 1040 returns, and multi-year IRS acknowledgment letters.'
                : 'Upload your TY 2025 W-2 wage slips and tax forms for documenter intake review.'}
            </p>
          </div>
        </div>

        {isConvertedCustomer ? (
          <div className="w-56">
            <AppSelect
              options={[
                { label: 'TY 2025 (Active Filing Archive)', value: '2025' },
                { label: 'TY 2024 (Filed Form 1040 & Proof)', value: '2024' },
                { label: 'TY 2023 (Filed Form 1040 & Proof)', value: '2023' },
                { label: 'TY 2022 (Historical Archive)', value: '2022' },
              ]}
              value={selectedYear}
              onChange={(val) => {
                if (val) setSelectedYear(val);
              }}
              placeholder="Select Tax Year"
            />
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>TY 2025 Intake Slips</span>
          </div>
        )}
      </div>

      {/* 2. Drag & Drop Upload Banner (Only for Active Tax Year 2025) */}
      {selectedYear === '2025' && (
        <div className="p-6 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50/70 transition-all text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#16A34A] text-white flex items-center justify-center mx-auto shadow-xs">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Upload Your TY 2025 W-2 & Tax Documents
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-0.5 font-medium">
              Upload PDF or image copies of your W-2s, 1099s, mortgage interest 1098s, or passport notices.
            </p>
          </div>
          <div>
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold cursor-pointer shadow-xs transition-colors">
              <UploadCloud className="w-4 h-4" />
              <span>Browse & Upload File</span>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.xlsx"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>
      )}

      {/* 3. Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'ALL', label: 'All Documents' },
          { id: 'W2', label: 'W-2 Wages' },
          { id: '1099', label: '1099 Statements' },
          { id: 'VISA', label: 'Visa & Passport' },
          { id: 'FILED_RETURN', label: 'Filed Form 1040' },
          { id: 'IRS_PROOF', label: 'IRS Acceptance Proof' },
        ].map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 4. Documents Grid */}
      <div className="space-y-3">
        {filteredFiles.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="text-xs font-bold text-slate-800">No Documents in this Category</h4>
            <p className="text-[11px] text-slate-400">
              Upload documents using the button above to store them in your vault.
            </p>
          </div>
        ) : (
          filteredFiles.map((file) => (
            <div
              key={file.id}
              className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                  file.category === 'FILED_RETURN'
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : file.category === 'IRS_PROOF'
                    ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  <FileText className="w-5 h-5" />
                </div>

                <div className="space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{file.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                      {file.categoryLabel}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
                      TY {file.taxYear}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 font-medium flex items-center gap-2">
                    <span>Size: <strong>{file.size}</strong></span>
                    <span>•</span>
                    <span>Uploaded: <strong>{file.uploadedAt}</strong></span>
                  </div>
                </div>
              </div>

              {/* Actions & Badges */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {file.status === 'VERIFIED' ? (
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                    Verified by CPA
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    In Review
                  </span>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(file.name)}
                  className="h-8 px-3 rounded-lg text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Download</span>
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
