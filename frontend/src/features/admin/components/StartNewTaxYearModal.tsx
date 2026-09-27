import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Sparkles, 
  ShieldCheck, 
  UserCheck, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ArrowRight, 
  History, 
  AlertCircle,
  Building2,
  User,
  Plus,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import { AppModal } from '@/shared/components/AppModal';
import { Button } from '@/shared/components/Button';
import { AppCopyButton } from '@/shared/components/AppCopyButton';
import { adminService } from '../services/admin-service';
import type { AdminCustomerItem, CustomerApplicationSummary } from '../types/customer-directory.types';
import toast from 'react-hot-toast';

interface StartNewTaxYearModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: AdminCustomerItem | null;
  onSuccess: (newApp: any) => void;
}

export const StartNewTaxYearModal: React.FC<StartNewTaxYearModalProps> = ({
  isOpen,
  onClose,
  customer,
  onSuccess,
}) => {
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  // Map of tax years already filed by this customer
  const filedYearMap = useMemo(() => {
    const map = new Map<number, CustomerApplicationSummary>();
    if (customer?.applications && customer.applications.length > 0) {
      for (const app of customer.applications) {
        map.set(app.taxYear, app);
      }
    } else if (customer?.activeApplication) {
      map.set(customer.activeApplication.taxYear, {
        id: customer.activeApplication.id,
        taxYear: customer.activeApplication.taxYear,
        currentStage: customer.activeApplication.currentStage,
        filingType: customer.activeApplication.filingType,
        irsStatus: customer.activeApplication.irsStatus,
        irsStatusLabel: customer.activeApplication.irsStatusLabel,
      });
    }
    return map;
  }, [customer]);

  // Dynamically compute list of tax years relative to the current system year
  const dynamicYears = useMemo(() => {
    const standard = [
      currentYear + 2,
      currentYear + 1,
      currentYear,
      currentYear - 1,
      currentYear - 2,
      currentYear - 3,
      currentYear - 4,
      currentYear - 5,
    ];
    const existingYears = (customer?.applications || []).map((a) => a.taxYear);
    const merged = Array.from(new Set([...standard, ...existingYears])).sort((a, b) => b - a);
    return merged;
  }, [currentYear, customer?.applications]);

  // Determine the smartest default unfiled year
  const defaultYear = useMemo(() => {
    if (!filedYearMap.has(currentYear)) return currentYear;
    if (!filedYearMap.has(currentYear + 1)) return currentYear + 1;
    const unfiled = dynamicYears.find((y) => !filedYearMap.has(y));
    return unfiled || currentYear + 2;
  }, [currentYear, filedYearMap, dynamicYears]);

  // Form State
  const [selectedTaxYear, setSelectedTaxYear] = useState<number>(defaultYear);
  const [isCustomYear, setIsCustomYear] = useState<boolean>(false);
  const [customYearInput, setCustomYearInput] = useState<string>('');
  const [filingType, setFilingType] = useState<'INDIVIDUAL' | 'CORPORATE'>('INDIVIDUAL');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Reset/sync when customer changes or modal opens
  useEffect(() => {
    if (isOpen && customer) {
      setSelectedTaxYear(defaultYear);
      setIsCustomYear(false);
      setCustomYearInput('');
      setFilingType('INDIVIDUAL');
    }
  }, [isOpen, customer, defaultYear]);

  if (!customer) return null;

  const activeYearToSubmit = isCustomYear ? Number(customYearInput) : selectedTaxYear;
  const isYearAlreadyFiled = Boolean(activeYearToSubmit && filedYearMap.has(activeYearToSubmit));
  const existingAppForSelectedYear = activeYearToSubmit ? filedYearMap.get(activeYearToSubmit) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeYearToSubmit || isNaN(activeYearToSubmit) || activeYearToSubmit < 2000 || activeYearToSubmit > 2100) {
      toast.error('Please select or enter a valid 4-digit Tax Year');
      return;
    }

    if (isYearAlreadyFiled) {
      toast.error(`Tax Year ${activeYearToSubmit} is already filed or in pipeline for this client.`);
      return;
    }

    try {
      setSubmitting(true);
      const res = await adminService.startNextYearApplication(customer.id, {
        taxYear: activeYearToSubmit,
        filingType,
        currentStage: 'DOC_OUTREACH',
        assignedDocAgentId: null,
        carryForwardDemographics: true,
      });

      toast.success(
        res?.message || `Tax Year ${activeYearToSubmit} return initialized and dispatched to Documenter Outreach!`
      );
      onSuccess(res?.data);
      onClose();
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to start tax year return';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      className="max-w-4xl w-full"
      title={
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold text-sm shadow-sm border border-emerald-400/30 shrink-0">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Start Next Tax Year Return
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Retained Client</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Initialize a new Form 1040/1120 filing linked to existing customer profile (0 profile duplication). Routes directly to Documenter Department.
            </p>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Customer ID: <code className="font-mono text-slate-700 font-bold bg-slate-100 px-1.5 py-0.5 rounded">{customer.id.slice(0, 8)}</code>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={submitting}
              className="border-slate-200 text-xs font-bold rounded-xl cursor-pointer hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSubmit}
              disabled={submitting || isYearAlreadyFiled || !activeYearToSubmit}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Creating Return...</span>
                </>
              ) : (
                <>
                  <span>Start TY{activeYearToSubmit || ''} Return</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="p-1 sm:p-2 space-y-6 text-xs font-sans">
        {/* 1. Taxpayer Profile Snapshot Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/90 border border-slate-200 shadow-2xs space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
                {customer.firstName[0]}{customer.lastName?.[0] || ''}
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <span>{customer.fullName}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {customer.visaType}
                  </span>
                  <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                  <span>
                    SSN: <strong className="text-slate-800 font-mono">{customer.ssnMasked}</strong>
                  </span>
                  <span>•</span>
                  <span>{customer.filingStatus}</span>
                  {customer.city && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-600">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {customer.city}, {customer.state}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="sm:text-right space-y-1 bg-white sm:bg-transparent p-2.5 sm:p-0 rounded-xl border sm:border-none border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Contact Details</span>
              <div className="flex items-center sm:justify-end gap-1.5 text-xs text-slate-800 font-semibold">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{customer.email}</span>
                {customer.email && <AppCopyButton text={customer.email} size="sm" />}
              </div>
              <div className="flex items-center sm:justify-end gap-1.5 text-xs text-slate-600 font-medium">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{customer.phone}</span>
                {customer.phone && <AppCopyButton text={customer.phone} size="sm" />}
              </div>
            </div>
          </div>

          {/* Historical Filed Tax Years */}
          <div className="pt-3 border-t border-slate-200/80 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5 mr-1">
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span>Filing History:</span>
            </span>
            {customer.applications && customer.applications.length > 0 ? (
              customer.applications.map((app) => (
                <span
                  key={app.id}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${
                    app.irsStatus === 'ACCEPTED'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : app.irsStatus === 'REJECTED'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {app.irsStatus === 'ACCEPTED' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : app.irsStatus === 'REJECTED' ? (
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span>TY {app.taxYear}: {app.irsStatusLabel || app.currentStage.replace(/_/g, ' ')}</span>
                </span>
              ))
            ) : customer.activeApplication ? (
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                TY {customer.activeApplication.taxYear}: {customer.activeApplication.irsStatusLabel}
              </span>
            ) : (
              <span className="text-xs text-slate-400 italic">No prior returns recorded</span>
            )}
          </div>
        </div>

        {/* 2. Dynamic Tax Year Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Select Tax Year (Dynamic System Calendar)</span>
              <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => {
                setIsCustomYear(!isCustomYear);
                if (!isCustomYear) setCustomYearInput('');
              }}
              className="text-xs font-bold text-[#16A34A] hover:text-[#15803D] underline cursor-pointer"
            >
              {isCustomYear ? 'Back to Quick Grid' : '+ Enter Custom Year'}
            </button>
          </div>

          {!isCustomYear ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {dynamicYears.map((yr) => {
                const isFiled = filedYearMap.has(yr);
                const existingApp = filedYearMap.get(yr);
                const isSelected = selectedTaxYear === yr;
                const isCurrent = yr === currentYear;
                const isUpcoming = yr > currentYear;

                let yearBadge = 'Prior Year';
                if (isCurrent) yearBadge = 'Current Season';
                if (isUpcoming) yearBadge = 'Upcoming TY';

                return (
                  <button
                    key={yr}
                    type="button"
                    disabled={isFiled}
                    onClick={() => setSelectedTaxYear(yr)}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer min-h-[90px] ${
                      isFiled
                        ? 'bg-slate-100/70 border-slate-200 text-slate-400 cursor-not-allowed opacity-70'
                        : isSelected
                        ? 'bg-emerald-50/90 border-[#16A34A] text-slate-900 shadow-sm ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                        TY {yr}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          isFiled
                            ? 'bg-slate-200 text-slate-600'
                            : isSelected
                            ? 'bg-[#16A34A] text-white'
                            : isCurrent
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : isUpcoming
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isFiled ? 'Already Filed' : yearBadge}
                      </span>
                    </div>

                    <div className="text-[11px] mt-3 font-medium">
                      {isFiled ? (
                        <span className="text-slate-500 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{existingApp?.irsStatusLabel || 'In Pipeline'}</span>
                        </span>
                      ) : isSelected ? (
                        <span className="text-[#16A34A] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                          <span>Selected Return</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">Available to File</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Enter Custom Tax Year (e.g. 2028, 2029, 2021)
              </label>
              <input
                type="number"
                min={2000}
                max={2100}
                value={customYearInput}
                onChange={(e) => setCustomYearInput(e.target.value)}
                placeholder="e.g. 2028"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#16A34A]"
              />
            </div>
          )}

          {/* Validation Warning if Duplicate Year */}
          {isYearAlreadyFiled && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Duplicate Filing Prevented:</strong> A tax application for Tax Year {activeYearToSubmit} already exists for this client ({existingAppForSelectedYear?.irsStatusLabel || existingAppForSelectedYear?.currentStage.replace(/_/g, ' ')}). Please pick a different tax year.
              </div>
            </div>
          )}
        </div>

        {/* 3. Filing Classification */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-900 block">
            Filing Classification
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <button
              type="button"
              onClick={() => setFilingType('INDIVIDUAL')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3.5 ${
                filingType === 'INDIVIDUAL'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/10'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                filingType === 'INDIVIDUAL' ? 'bg-slate-800 text-emerald-400' : 'bg-slate-100 text-slate-600'
              }`}>
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-xs sm:text-sm">Individual Return</div>
                <div className={`text-[11px] mt-0.5 ${filingType === 'INDIVIDUAL' ? 'text-slate-300' : 'text-slate-400'}`}>
                  Form 1040 / 1040-NR (Resident &amp; Non-Resident)
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFilingType('CORPORATE')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3.5 ${
                filingType === 'CORPORATE'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/10'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                filingType === 'CORPORATE' ? 'bg-slate-800 text-emerald-400' : 'bg-slate-100 text-slate-600'
              }`}>
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-xs sm:text-sm">Corporate / Business Return</div>
                <div className={`text-[11px] mt-0.5 ${filingType === 'CORPORATE' ? 'text-slate-300' : 'text-slate-400'}`}>
                  Form 1120 / 1120-S / 1065 (LLC &amp; Corporation)
                </div>
              </div>
            </button>
          </div>
        </div>
      </form>
    </AppModal>
  );
};
