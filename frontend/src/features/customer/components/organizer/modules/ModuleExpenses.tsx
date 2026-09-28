import React, { useState, useRef } from 'react';
import { Plus, X, UploadCloud, FileText, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import toast from 'react-hot-toast';
import { customerApi } from '../../../services/customer-api';
import { ModuleStateRentDeduction } from './ModuleStateRentDeduction';
import { ModuleCharityDonations } from './ModuleCharityDonations';
import { ModuleDaycareExpenses } from './ModuleDaycareExpenses';
import { ModuleItemizedExpenses } from './ModuleItemizedExpenses';
import { type OrganizerData } from '../../../services/customer-api';
import { type ValidationErrorMap } from '../utils/organizer-validation';

interface ModuleExpensesProps {
  organizerData: OrganizerData;
  updateModuleField: <K extends keyof OrganizerData>(moduleKey: K, field: keyof OrganizerData[K], value: any) => void;
  selectedTaxYear: number;
  errors?: ValidationErrorMap;
  clearError?: (field: string) => void;
}

export const ModuleExpenses: React.FC<ModuleExpensesProps> = ({
  organizerData,
  updateModuleField,
  selectedTaxYear,
  errors = {},
  clearError,
}) => {
  // Collapsed / Open states for each individual expense section
  const [isOpenStateRent, setIsOpenStateRent] = useState<boolean>(false);
  const [isOpenCharity, setIsOpenCharity] = useState<boolean>(false);
  const [isOpenDaycare, setIsOpenDaycare] = useState<boolean>(false);
  const [isOpenItemized, setIsOpenItemized] = useState<boolean>(false);
  const [isOpenOtherTaxes, setIsOpenOtherTaxes] = useState<boolean>(false);

  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 1. State Rent Deductions summary
  const dedData: Partial<OrganizerData['m8_deductions']> = organizerData?.m8_deductions || {};
  const rentList = dedData.rentDeductionsList || [];
  const hasRentData = rentList.length > 0;

  // 2. Charity summary
  const charityList = dedData.charitableList || [];
  const hasCharityData = charityList.length > 0;

  // 3. Daycare summary
  const m2Data: Partial<OrganizerData['m2_dependents']> = organizerData?.m2_dependents || {};
  const daycareList = m2Data.daycareList || [];
  const hasDaycareData = daycareList.length > 0;

  // 4. Itemized Expenses summary
  const hasItemizedData = Boolean(
    (dedData.medicalExpenses !== undefined && dedData.medicalExpenses !== null && dedData.medicalExpenses > 0) || 
    (dedData.mortgageInterest1098 !== undefined && dedData.mortgageInterest1098 !== null && dedData.mortgageInterest1098 > 0) || 
    (dedData.propertyTaxesUs !== undefined && dedData.propertyTaxesUs !== null && dedData.propertyTaxesUs > 0) || 
    (dedData.cleanEnergyCost !== undefined && dedData.cleanEnergyCost !== null && dedData.cleanEnergyCost > 0) ||
    (dedData.hsaContribution !== undefined && dedData.hsaContribution !== null && dedData.hsaContribution > 0) ||
    (dedData.iraContribution !== undefined && dedData.iraContribution !== null && dedData.iraContribution > 0)
  );

  // 5. Other Taxes Paid summary
  const otherDocs = dedData.otherTaxesPaidDocuments || [];

  const formatFileSize = (bytes?: number): string => {
    if (!bytes || isNaN(bytes)) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFilesUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    try {
      setIsUploading(true);
      const newDocs = [...otherDocs];

      for (const file of fileArray) {
        let docItem = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: file.name,
          size: file.size,
          fileUrl: '',
          uploadedAt: new Date().toISOString(),
        };

        try {
          const res = await customerApi.uploadDocument(file, 'OTHER_TAXES_PAID', String(selectedTaxYear));
          if (res?.data) {
            const uploaded = res.data;
            docItem = {
              id: uploaded.id || docItem.id,
              name: uploaded.fileName || file.name,
              size: uploaded.fileSize || file.size,
              fileUrl: uploaded.fileUrl || uploaded.filePath || '',
              uploadedAt: uploaded.uploadedAt || uploaded.createdAt || docItem.uploadedAt,
            };
          }
        } catch {
          // If server upload fails (e.g. offline/mock), save file metadata locally
        }
        newDocs.push(docItem);
      }

      updateModuleField('m8_deductions', 'otherTaxesPaidDocuments', newDocs as any);
      toast.success(`Attached ${fileArray.length} document(s) successfully!`);
    } catch {
      toast.error('Failed to attach documents');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFilesUpload(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      handleFilesUpload(e.dataTransfer.files);
    }
  };

  const handleRemoveDoc = (indexToRemove: number) => {
    const updated = otherDocs.filter((_, idx) => idx !== indexToRemove);
    updateModuleField('m8_deductions', 'otherTaxesPaidDocuments', updated as any);
    toast.success('Document removed');
  };

  return (
    <div className="space-y-4 font-sans">
      {/* 1. State Renter Tax Deduction / Credit */}
      {!isOpenStateRent ? (
        <div className="p-4 rounded-md border border-slate-200 bg-slate-50/50 hover:border-slate-300 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <span>1. State Renter Tax Deduction / Credit (Tenant Rent Paid)</span>
                {hasRentData && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-[#16A34A] font-medium border border-emerald-200">
                    {rentList.length} States Added
                  </span>
                )}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Claim state renter tax credits if you paid residential rent as a tenant during {selectedTaxYear}
              </p>
            </div>

            <Button
              size="sm"
              type="button"
              onClick={() => setIsOpenStateRent(true)}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{hasRentData ? 'View / Edit State Rent' : 'Add State Rent Row'}</span>
            </Button>
          </div>
        </div>
      ) : (
        <div id="section-state-rent" className="p-4 sm:p-5 rounded-md border border-slate-200 bg-white space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h4 className="text-xs font-semibold text-gray-700">
                <span>1. State Renter Tax Deduction / Credit (Tenant Rent Paid)</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Claim state renter tax credits if you paid residential rent as a tenant during {selectedTaxYear}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpenStateRent(false)}
              className="text-xs text-slate-600 hover:text-slate-800 font-medium px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Close</span>
            </button>
          </div>

          <ModuleStateRentDeduction
            rentList={rentList}
            onUpdateRentList={(newList) => {
              updateModuleField('m8_deductions', 'rentDeductionsList', newList as any);
              updateModuleField('m8_deductions', 'hasRentDeductions', newList.length > 0);
            }}
            selectedTaxYear={selectedTaxYear}
            errors={errors}
            clearError={clearError}
          />
        </div>
      )}

      {/* 2. Charitable Donations Worksheet */}
      {!isOpenCharity ? (
        <div className="p-4 rounded-md border border-slate-200 bg-slate-50/50 hover:border-slate-300 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <span>2. Charitable Donations Worksheet (501(c)(3) &amp; Religious)</span>
                {hasCharityData && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-[#16A34A] font-medium border border-emerald-200">
                    {charityList.length} Donations Added
                  </span>
                )}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                List qualifying religious, educational, or disaster relief donations in {selectedTaxYear}
              </p>
            </div>

            <Button
              size="sm"
              type="button"
              onClick={() => setIsOpenCharity(true)}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{hasCharityData ? 'View / Edit Donations' : 'Add Charitable Donation'}</span>
            </Button>
          </div>
        </div>
      ) : (
        <div id="section-charitable-donations" className="p-4 sm:p-5 rounded-md border border-slate-200 bg-white space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h4 className="text-xs font-semibold text-gray-700">
                <span>2. Charitable Donations Worksheet (501(c)(3) &amp; Religious)</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                List qualifying religious, educational, or disaster relief donations in {selectedTaxYear}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpenCharity(false)}
              className="text-xs text-slate-600 hover:text-slate-800 font-medium px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Close</span>
            </button>
          </div>

          <ModuleCharityDonations
            charityList={charityList}
            onUpdateCharityList={(newList) => {
              updateModuleField('m8_deductions', 'charitableList', newList as any);
              updateModuleField(
                'm8_deductions',
                'charitableDonations',
                newList.reduce((s, i) => s + (i.amountDonated || 0), 0)
              );
            }}
            selectedTaxYear={selectedTaxYear}
            errors={errors}
            clearError={clearError}
          />
        </div>
      )}

      {/* 3. Child & Daycare Care Expenses Worksheet */}
      {!isOpenDaycare ? (
        <div className="p-4 rounded-md border border-slate-200 bg-slate-50/50 hover:border-slate-300 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <span>3. Child &amp; Daycare Care Expenses Worksheet (Form 2441)</span>
                {hasDaycareData && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-[#16A34A] font-medium border border-emerald-200">
                    {daycareList.length} Providers Added
                  </span>
                )}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Daycare, preschool, or babysitter paid while parents worked in {selectedTaxYear}
              </p>
            </div>

            <Button
              size="sm"
              type="button"
              onClick={() => setIsOpenDaycare(true)}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{hasDaycareData ? 'View / Edit Daycare' : 'Add Daycare Provider'}</span>
            </Button>
          </div>
        </div>
      ) : (
        <div id="section-daycare-expenses" className="p-4 sm:p-5 rounded-md border border-slate-200 bg-white space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h4 className="text-xs font-semibold text-gray-700">
                <span>3. Child &amp; Daycare Care Expenses Worksheet (Form 2441)</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Daycare, preschool, or babysitter paid while parents worked in {selectedTaxYear}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpenDaycare(false)}
              className="text-xs text-slate-600 hover:text-slate-800 font-medium px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Close</span>
            </button>
          </div>

          <ModuleDaycareExpenses
            daycareList={daycareList}
            onUpdateDaycareList={(newList) => {
              updateModuleField('m2_dependents', 'daycareList', newList as any);
              updateModuleField('m2_dependents', 'daycareExpensesClaimed', newList.length > 0);
            }}
            selectedTaxYear={selectedTaxYear}
            errors={errors}
            clearError={clearError}
          />
        </div>
      )}

      {/* 4. Schedule A Itemized Deductions & Clean Energy */}
      {!isOpenItemized ? (
        <div className="p-4 rounded-md border border-slate-200 bg-slate-50/50 hover:border-slate-300 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <span>4. Schedule A Itemized Deductions, HSA &amp; Clean Energy</span>
                {hasItemizedData && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-[#16A34A] font-medium border border-emerald-200">
                    Deductions Added
                  </span>
                )}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Mortgage interest (Form 1098), Property taxes (US &amp; India), Solar/Clean energy, EV credit &amp; HSA
              </p>
            </div>

            <Button
              size="sm"
              type="button"
              onClick={() => setIsOpenItemized(true)}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{hasItemizedData ? 'View / Edit Deductions' : 'Add Deductions'}</span>
            </Button>
          </div>
        </div>
      ) : (
        <div id="section-itemized-deductions" className="p-4 sm:p-5 rounded-md border border-slate-200 bg-white space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h4 className="text-xs font-semibold text-gray-700">
                <span>4. Schedule A Itemized Deductions, HSA &amp; Clean Energy</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Mortgage interest (Form 1098), Property taxes (US &amp; India), Solar/Clean energy, EV credit &amp; HSA
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpenItemized(false)}
              className="text-xs text-slate-600 hover:text-slate-800 font-medium px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Close</span>
            </button>
          </div>

          <ModuleItemizedExpenses
            data={(organizerData?.m8_deductions || {}) as OrganizerData['m8_deductions']}
            updateField={(field, val) => updateModuleField('m8_deductions', field, val)}
            selectedTaxYear={selectedTaxYear}
            errors={errors}
            clearError={clearError}
          />
        </div>
      )}

      {/* 5. Other Taxes Paid */}
      {!isOpenOtherTaxes ? (
        <div className="p-4 rounded-md border border-slate-200 bg-slate-50/50 hover:border-slate-300 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <span>5. Other Taxes Paid</span>
                {otherDocs.length > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-[#16A34A] font-medium border border-emerald-200">
                    {otherDocs.length} Document{otherDocs.length > 1 ? 's' : ''} Attached
                  </span>
                )}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Upload receipts, vouchers, or statements for other taxes paid (state, local, county, estimated taxes)
              </p>
            </div>

            <Button
              size="sm"
              type="button"
              onClick={() => setIsOpenOtherTaxes(true)}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{otherDocs.length > 0 ? 'View / Upload Documents' : 'Upload Documents'}</span>
            </Button>
          </div>
        </div>
      ) : (
        <div id="section-other-taxes-paid" className="p-4 sm:p-5 rounded-md border border-slate-200 bg-white space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <span>5. Other Taxes Paid</span>
                {otherDocs.length > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-[#16A34A] font-medium border border-emerald-200">
                    {otherDocs.length} Document{otherDocs.length > 1 ? 's' : ''}
                  </span>
                )}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Attach receipts, proof of payments, or vouchers for other taxes paid. Only files accepted — no form inputs required.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-medium px-3 py-1.5 rounded-md flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Files</span>
              </Button>
              <button
                type="button"
                onClick={() => setIsOpenOtherTaxes(false)}
                className="text-xs text-slate-600 hover:text-slate-800 font-medium px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Close</span>
              </button>
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx"
            className="hidden"
            onChange={handleFileSelect}
          />

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
              isDragOver
                ? 'border-[#16A34A] bg-emerald-50/50 scale-[1.005]'
                : 'border-slate-300 hover:border-[#16A34A] hover:bg-slate-50/50'
            }`}
          >
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#16A34A] flex items-center justify-center">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-700">
                {isUploading ? 'Uploading files...' : 'Drag & drop multiple tax payment documents here, or click to browse'}
              </p>
              <p className="text-[11px] text-slate-400">
                Supports PDF, PNG, JPG, JPEG, Word &amp; Excel files. Only file attachments accepted — no forms required.
              </p>
            </div>
          </div>

          {/* Uploaded Documents List */}
          {otherDocs.length > 0 && (
            <div className="space-y-2 pt-1">
              <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Attached Documents ({otherDocs.length})
              </h5>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-white">
                {otherDocs.map((doc, idx) => (
                  <div key={doc.id || idx} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate" title={doc.name}>
                          {doc.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {formatFileSize(doc.size)} {doc.uploadedAt ? `• ${new Date(doc.uploadedAt).toLocaleDateString()}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {doc.fileUrl && (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                          title="Open document"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveDoc(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
