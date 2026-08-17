import React from 'react';
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
  RefreshCw 
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppSelect } from '@/shared/components/AppSelect';
import { type CustomerDocumentItem } from '../../services/customer-api';

export const CATEGORY_FILTER_OPTIONS = [
  { label: 'All Document Categories', value: 'ALL' },
  { label: 'W-2 Wage Statements (Employer)', value: 'W2_WAGES' },
  { label: '1099-B Stock & RSUs (Robinhood/Fidelity)', value: '1099_BROKERAGE' },
  { label: '1099-INT / 1099-DIV (Bank Interest)', value: '1099_INT_DIV' },
  { label: 'FBAR / Foreign Accounts (SBI NRE/NRO)', value: 'FBAR_FOREIGN' },
  { label: 'Form 1098 Mortgage & Property Taxes', value: 'MORTGAGE_1098' },
  { label: 'Visa, I-797 & Identity Proofs', value: 'VISA_IDENTITY' },
  { label: 'Other Tax Receipts & Deduction Slips', value: 'OTHER' },
];

interface VaultDocumentsTableProps {
  selectedYear: string;
  filteredDocs: CustomerDocumentItem[];
  filterCategory: string;
  setFilterCategory: (cat: string) => void;
  loading: boolean;
  onOpenUpload: () => void;
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
  onDownload,
  onDelete,
}) => {
  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'W2_WAGES':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">W-2 Wages</span>;
      case '1099_BROKERAGE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">1099-B Stocks</span>;
      case '1099_INT_DIV':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">1099-INT / DIV</span>;
      case 'FBAR_FOREIGN':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">FBAR Indian</span>;
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

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Filter Bar */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-[#16A34A]" />
          <span className="text-xs font-bold text-slate-900">
            Uploaded Statements for TY {selectedYear} ({filteredDocs.length})
          </span>
        </div>

        <div className="w-60">
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
            <h4 className="text-xs font-bold text-slate-800">No Tax Documents Uploaded Yet</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Use the upload box above to select and upload your TY {selectedYear} W-2, 1099, or FBAR statements.
            </p>
          </div>
          <Button
            size="sm"
            onClick={onOpenUpload}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold gap-1 cursor-pointer mx-auto shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Choose First Document</span>
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/60 text-slate-600 font-bold">
                <th className="py-3 px-4">Document File Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Upload Timestamp</th>
                <th className="py-3 px-4">Agent Verification</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#16A34A] flex items-center justify-center shrink-0 border border-emerald-100">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block truncate max-w-xs sm:max-w-md">
                          {doc.fileName}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    {getCategoryBadge(doc.documentCategory)}
                  </td>

                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                    {new Date(doc.createdAt).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    {getStatusBadge(doc.verificationStatus)}
                  </td>

                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDownload(doc.id, doc.fileName)}
                        className="border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold p-1.5 cursor-pointer h-7"
                        title="Download Document"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </Button>

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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
