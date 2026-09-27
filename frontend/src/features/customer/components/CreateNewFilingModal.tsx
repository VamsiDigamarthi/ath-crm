import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppModal } from '@/shared/components/AppModal';
import { AppSelect, type SelectOption } from '@/shared/components/AppSelect';
import { Button } from '@/shared/components/Button';
import { customerApi } from '../services/customer-api';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { FileText, Building2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface CreateNewFilingModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingApplications?: any[];
  onCreated?: (year: string, type: 'INDIVIDUAL' | 'BUSINESS') => void;
}

export const CreateNewFilingModal: React.FC<CreateNewFilingModalProps> = ({
  isOpen,
  onClose,
  existingApplications = [],
  onCreated,
}) => {
  const navigate = useNavigate();
  const { refreshUser } = useAuthStore();

  const [filingType, setFilingType] = useState<'INDIVIDUAL' | 'BUSINESS'>('INDIVIDUAL');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Generate 10+ year options: future 3 years + current year + past 7 years
  const currentYear = new Date().getFullYear();
  const yearOptions: SelectOption[] = useMemo(() => {
    const list: SelectOption[] = [];
    const maxFuture = currentYear + 3;
    const minPast = currentYear - 7;

    for (let yr = maxFuture; yr >= minPast; yr--) {
      // Check if an active application for this year + filing type already exists
      const isExisting = existingApplications.some((app: any) => {
        const appYear = Number(app.taxYear);
        const appType = app.filingType || 'INDIVIDUAL';
        const isNotCancelled = app.currentStage !== 'DROPPED_CANCELLED' && app.currentStage !== 'REJECTED';
        return appYear === yr && appType === filingType && isNotCancelled;
      });

      list.push({
        value: yr.toString(),
        label: isExisting ? `${yr} (Active Filing)` : `${yr}`,
        disabled: isExisting,
      });
    }

    return list;
  }, [currentYear, existingApplications, filingType]);

  // Set default selected year: default to current year; if current year is filed (disabled), show next year (currentYear + 1)
  useEffect(() => {
    if (!isOpen) return;

    // 1. Try current year
    const currentOpt = yearOptions.find((opt) => opt.value === currentYear.toString());
    if (currentOpt && !currentOpt.disabled) {
      setSelectedYear(currentYear.toString());
      setError(null);
      return;
    }

    // 2. If current year is filed/disabled, try next year (currentYear + 1)
    const nextYearOpt = yearOptions.find((opt) => opt.value === (currentYear + 1).toString());
    if (nextYearOpt && !nextYearOpt.disabled) {
      setSelectedYear((currentYear + 1).toString());
      setError(null);
      return;
    }

    // 3. Fallback to first available year
    const firstAvailable = yearOptions.find((opt) => !opt.disabled);
    if (firstAvailable) {
      setSelectedYear(firstAvailable.value);
    } else {
      setSelectedYear('');
    }
    setError(null);
  }, [isOpen, filingType, yearOptions, currentYear]);

  const handleCreate = async () => {
    if (!selectedYear) {
      setError('Please select a valid Tax Year.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const yearNum = parseInt(selectedYear, 10);
      const res = await customerApi.startTaxYearReturn(yearNum, filingType);

      toast.success(res.message || `TY ${selectedYear} ${filingType === 'BUSINESS' ? 'Business' : 'Individual'} return started!`);

      // Refresh auth store user data
      await refreshUser();

      if (onCreated) {
        onCreated(selectedYear, filingType);
      }

      onClose();

      // Navigate immediately to the Tax Organizer for this new filing
      navigate(`/customer/organizer?year=${selectedYear}&type=${filingType}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to start tax year return. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Start New Tax Filing"
      subtitle="Select filing category and tax year to initiate your IRS tax return workflow."
      size="md"
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={loading}
            className="text-xs font-semibold text-black border-slate-300 hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleCreate}
            disabled={loading || !selectedYear}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs cursor-pointer border border-emerald-700 px-4"
          >
            {loading ? (
              <span>Creating Filing...</span>
            ) : (
              <>
                <span>Create & Open Organizer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-1">
        {/* Error Alert if any */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs font-medium text-rose-700">
            {error}
          </div>
        )}

        {/* 1. Filing Type Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-black block">
            Filing Type <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2.5 mb-2">
            <button
              type="button"
              onClick={() => setFilingType('INDIVIDUAL')}
              className={`flex items-center gap-2.5 p-3 rounded-md border text-left cursor-pointer transition-colors ${
                filingType === 'INDIVIDUAL'
                  ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 text-black'
                  : 'bg-white border-slate-300 text-black/80 hover:bg-slate-50'
              }`}
            >
              <div className={`p-1.5 rounded-md ${filingType === 'INDIVIDUAL' ? 'bg-[#16A34A] text-white' : 'bg-slate-100 text-black'}`}>
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-black">Individual</div>
                <div className="text-[11px] text-black/70">Form 1040 Return</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFilingType('BUSINESS')}
              className={`flex items-center gap-2.5 p-3 rounded-md border text-left cursor-pointer transition-colors ${
                filingType === 'BUSINESS'
                  ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 text-black'
                  : 'bg-white border-slate-300 text-black/80 hover:bg-slate-50'
              }`}
            >
              <div className={`p-1.5 rounded-md ${filingType === 'BUSINESS' ? 'bg-[#16A34A] text-white' : 'bg-slate-100 text-black'}`}>
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-black">Business</div>
                <div className="text-[11px] text-black/70">Form 1120 / 1065</div>
              </div>
            </button>
          </div>
        </div>

        {/* 2. Tax Year Dropdown (10 years, grayed out if active filing exists) */}
        <div className="space-y-1.5 pt-1">
          <label className="text-xs font-bold text-black block">
            Tax Year <span className="text-rose-500">*</span>
          </label>
          <AppSelect
            options={yearOptions}
            value={selectedYear}
            onChange={(val) => {
              setSelectedYear(val);
              setError(null);
            }}
            placeholder="Select a Tax Year..."
          />
          <p className="text-[11px] text-black/70 font-medium">
            Options include past 7 years and future 3 years. Years with an active filing are disabled.
          </p>
        </div>
      </div>
    </AppModal>
  );
};
