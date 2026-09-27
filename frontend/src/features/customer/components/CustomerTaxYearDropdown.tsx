import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Plus, Check, Loader2 } from 'lucide-react';
import { customerApi } from '../services/customer-api';
import { useAuthStore } from '@/features/auth/store/auth-store';
import toast from 'react-hot-toast';

interface CustomerTaxYearDropdownProps {
  selectedTaxYear: string;
  onSelectTaxYear: (year: string) => void;
  applications: Array<{
    id?: string;
    taxYear: number;
    currentStage?: string;
    filingType?: string;
  }>;
}

export const CustomerTaxYearDropdown: React.FC<CustomerTaxYearDropdownProps> = ({
  selectedTaxYear,
  onSelectTaxYear,
  applications,
}) => {
  const { refreshUser } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [newYearInput, setNewYearInput] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const existingYears = useMemo(() => {
    return applications.map((a) => a.taxYear);
  }, [applications]);

  const currentYear = useMemo(() => new Date().getFullYear(), []);

  // Quick suggestion chips: unfiled years among [currentYear + 1, currentYear, currentYear - 1]
  const quickSuggestions = useMemo(() => {
    const candidates = [currentYear + 1, currentYear, currentYear - 1, currentYear - 2];
    return candidates.filter((y) => !existingYears.includes(y)).slice(0, 3);
  }, [currentYear, existingYears]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const handleStartReturn = async (yearNumber: number) => {
    if (isNaN(yearNumber) || yearNumber < 2000 || yearNumber > 2100) {
      toast.error('Please enter a valid 4-digit Tax Year (e.g. 2026)');
      return;
    }

    if (existingYears.includes(yearNumber)) {
      toast.error(`Tax Year ${yearNumber} is already in your account.`);
      return;
    }

    try {
      setIsAdding(true);
      const res = await customerApi.startTaxYearReturn(yearNumber);

      // Refresh auth store to update user's applications
      await refreshUser();

      toast.success(res?.message || `Tax Year ${yearNumber} return started!`);
      onSelectTaxYear(yearNumber.toString());
      setNewYearInput('');
      setIsOpen(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to start tax year return';
      toast.error(msg);
    } finally {
      setIsAdding(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(newYearInput.trim(), 10);
    handleStartReturn(parsed);
  };

  // Find active label
  const selectedApp = applications.find((a) => a.taxYear.toString() === selectedTaxYear);
  const currentLabel = selectedApp
    ? `TY ${selectedApp.taxYear} (${selectedApp.currentStage === 'FILING_SUCCESS' ? 'Filed Form 1040' : 'Active Filing'})`
    : `TY ${selectedTaxYear} (Active Filing)`;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center justify-between w-52 sm:w-60 px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 hover:border-slate-400 rounded-md shadow-2xs transition-all text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
      >
        <span className="truncate">{currentLabel}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-500 shrink-0 ml-1.5 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-emerald-700' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-64 bg-white border border-slate-300 rounded-md shadow-lg z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100">
          {/* Top Section: Quick Add Year Field */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-200">
            <div className="text-[11px] font-bold text-slate-800 mb-1.5 flex items-center justify-between">
              <span>Start New Tax Year</span>
              <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-300">
                Direct
              </span>
            </div>
            <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
              <input
                type="number"
                min="2000"
                max="2100"
                placeholder="Enter Year (e.g. 2026)"
                value={newYearInput}
                onChange={(e) => setNewYearInput(e.target.value)}
                disabled={isAdding}
                className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-600"
                autoFocus
              />
              <button
                type="submit"
                disabled={isAdding || !newYearInput}
                className="px-2.5 py-1.5 text-xs font-bold text-white bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-50 rounded-md shrink-0 cursor-pointer flex items-center gap-1 transition-colors border border-emerald-700"
                title="Start return for this year"
              >
                {isAdding ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick unfiled suggestion buttons */}
            {quickSuggestions.length > 0 && (
              <div className="flex items-center gap-1 mt-2 flex-wrap">
                <span className="text-[10px] text-slate-600 font-bold">Quick:</span>
                {quickSuggestions.map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => handleStartReturn(yr)}
                    disabled={isAdding}
                    className="px-1.5 py-0.5 text-[10px] font-bold bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 border border-slate-300 hover:border-emerald-400 rounded-md cursor-pointer transition-colors"
                  >
                    + TY {yr}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Section: Existing Tax Years */}
          <div className="p-1 max-h-56 overflow-y-auto">
            <div className="px-2.5 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Your Filings
            </div>
            {applications.length > 0 ? (
              applications.map((app) => {
                const isSelected = app.taxYear.toString() === selectedTaxYear;
                const isCompleted = app.currentStage === 'FILING_SUCCESS';
                return (
                  <button
                    key={app.taxYear}
                    type="button"
                    onClick={() => {
                      onSelectTaxYear(app.taxYear.toString());
                      toast.success(`Active Workspace: Tax Year ${app.taxYear}`);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md transition-colors cursor-pointer text-left ${
                      isSelected
                        ? 'bg-emerald-100/80 text-emerald-900 font-bold border border-emerald-300'
                        : 'text-slate-800 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isCompleted ? 'bg-teal-600' : 'bg-emerald-600'
                        }`}
                      />
                      <span>TY {app.taxYear}</span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        ({isCompleted ? 'Filed Form 1040' : 'Active Filing'})
                      </span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />}
                  </button>
                );
              })
            ) : (
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs bg-emerald-100 text-emerald-900 font-bold rounded-md border border-emerald-300"
              >
                <span>TY {selectedTaxYear} (Active Filing)</span>
                <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
