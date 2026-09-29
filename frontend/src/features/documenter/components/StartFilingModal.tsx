import React, { useState } from 'react';
import { AppModal } from '@/shared/components/AppModal';
import { Button } from '@/shared/components/Button';
import { 
  FilePlus2, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Globe, 
  Mail, 
  Phone 
} from 'lucide-react';
import type { DocumenterAgentItem, DocumenterLeadItem } from '../types/documenter.types';

export interface StartFilingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: DocumenterLeadItem | null;
  agents?: DocumenterAgentItem[];
  onConfirmStartFiling: (payload: {
    customerId: string;
    taxYear: number;
    filingType?: string;
    assignedDocAgentId?: string | null;
    remarks?: string;
  }) => void;
  isLoading?: boolean;
}

export const StartFilingModal: React.FC<StartFilingModalProps> = ({
  isOpen,
  onClose,
  lead,
  agents: _agents,
  onConfirmStartFiling,
  isLoading = false,
}) => {
  const [taxYear, setTaxYear] = useState<number | ''>('');
  const [filingType, setFilingType] = useState<string>('INDIVIDUAL');
  const [remarks, setRemarks] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<{ taxYear?: string; filingType?: string } | null>(null);

  React.useEffect(() => {
    if (isOpen && lead) {
      setTaxYear(lead.taxYear || 2025);
      setFilingType(lead.filingType || 'INDIVIDUAL');
      setRemarks('');
      setValidationErrors(null);
    }
  }, [isOpen, lead]);

  if (!lead) return null;

  const customer = lead.customer;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { taxYear?: string; filingType?: string } = {};
    if (!taxYear) {
      errors.taxYear = 'Please select a Tax Filing Year';
    }
    if (!filingType) {
      errors.filingType = 'Please select a Filing Type';
    }
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors(null);
    onConfirmStartFiling({
      customerId: lead.customerId || customer.id,
      taxYear: Number(taxYear),
      filingType,
      assignedDocAgentId: lead.assignedDocAgentId || null,
      remarks: remarks.trim() || undefined,
    });
  };

  const yearOptions = [2026, 2025, 2024, 2023, 2022, 2021, 2020];

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Configure Tax Year & Filing Return"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5 font-sans">
        {/* Customer Header Preview Card */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50/80 to-teal-50/60 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#16A34A] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                {customer.firstName?.[0] || 'T'}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  {customer.fullName || `${customer.firstName} ${customer.lastName}`}
                </h4>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium mt-0.5">
                  {customer.visaType && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      <Globe className="w-2.5 h-2.5 text-indigo-500" />
                      {customer.visaType}
                    </span>
                  )}
                  <span>{customer.occupation || 'Individual Taxpayer'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-1 text-xs text-slate-600">
            {customer.email && (
              <div className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium text-slate-700">{customer.email}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium text-slate-700">{customer.phone}</span>
            </div>
          </div>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tax Year */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tax Filing Year <span className="text-rose-600">*</span></span>
            </label>
            <select
              value={taxYear}
              onChange={(e) => {
                setTaxYear(e.target.value ? Number(e.target.value) : '');
                if (validationErrors?.taxYear) {
                  setValidationErrors((prev) => (prev ? { ...prev, taxYear: undefined } : null));
                }
              }}
              className={`w-full px-3.5 py-2 rounded-xl border bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 shadow-2xs cursor-pointer transition-all ${
                validationErrors?.taxYear
                  ? 'border-rose-500 focus:ring-rose-400 bg-rose-50/40 text-rose-900 ring-1 ring-rose-500'
                  : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500'
              }`}
            >
              <option value="">-- Select Tax Year --</option>
              {yearOptions.map((yr) => (
                <option key={yr} value={yr}>
                  TY {yr} (Tax Year {yr})
                </option>
              ))}
            </select>
            {validationErrors?.taxYear ? (
              <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 animate-in fade-in duration-150">
                <span>⚠️</span> {validationErrors.taxYear}
              </p>
            ) : (
              <p className="text-[10px] text-slate-400">Select the tax year for this customer return.</p>
            )}
          </div>

          {/* Filing Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Filing Type <span className="text-rose-600">*</span></span>
            </label>
            <select
              value={filingType}
              onChange={(e) => {
                setFilingType(e.target.value);
                if (validationErrors?.filingType) {
                  setValidationErrors((prev) => (prev ? { ...prev, filingType: undefined } : null));
                }
              }}
              className={`w-full px-3.5 py-2 rounded-xl border bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 shadow-2xs cursor-pointer transition-all ${
                validationErrors?.filingType
                  ? 'border-rose-500 focus:ring-rose-400 bg-rose-50/40 text-rose-900 ring-1 ring-rose-500'
                  : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500'
              }`}
            >
              <option value="">-- Select Return Type --</option>
              <option value="INDIVIDUAL">Individual</option>
              <option value="BUSINESS">Business</option>
            </select>
            {validationErrors?.filingType ? (
              <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 animate-in fade-in duration-150">
                <span>⚠️</span> {validationErrors.filingType}
              </p>
            ) : (
              <p className="text-[10px] text-slate-400">Select Individual or Business return.</p>
            )}
          </div>
        </div>

        {/* Remarks / Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
            <span>Initial Intake Notes (Optional)</span>
          </label>
          <textarea
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. Ingested lead requested 2025 W-2 and stock sales review..."
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs resize-none"
          />
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="border-slate-200 text-slate-600 text-xs font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isLoading}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs"
          >
            <FilePlus2 className="w-4 h-4" />
            <span>{isLoading ? 'Creating Filing...' : `Create TY ${taxYear} Filing`}</span>
          </Button>
        </div>
      </form>
    </AppModal>
  );
};
