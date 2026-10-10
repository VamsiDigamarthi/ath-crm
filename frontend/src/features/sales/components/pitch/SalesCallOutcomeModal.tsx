import React from 'react';
import { AppModal } from '@/shared/components/AppModal';
import { AppTextarea } from '@/shared/components/AppTextarea';
import { AppDatePicker } from '@/shared/components/AppDatePicker';
import { Button } from '@/shared/components/Button';
import type { SalesCallDisposition } from '../../types/sales.types';
import { SALES_CALL_OUTCOME_OPTIONS } from '../../constants/sales-call-outcomes';

interface SalesCallOutcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  durationLabel?: string;
  outcome: SalesCallDisposition | '';
  onOutcomeChange: (value: SalesCallDisposition) => void;
  callbackDate: Date | null;
  onCallbackDateChange: (date: Date | null) => void;
  callbackTime: string;
  onCallbackTimeChange: (time: string) => void;
  note: string;
  onNoteChange: (note: string) => void;
  error: string | null;
  isSaving: boolean;
  onSave: () => void;
}

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const SalesCallOutcomeModal: React.FC<SalesCallOutcomeModalProps> = ({
  isOpen,
  onClose,
  durationLabel,
  outcome,
  onOutcomeChange,
  callbackDate,
  onCallbackDateChange,
  callbackTime,
  onCallbackTimeChange,
  note,
  onNoteChange,
  error,
  isSaving,
  onSave,
}) => (
  <AppModal
    isOpen={isOpen}
    onClose={onClose}
    title="Log call result"
    subtitle={durationLabel ? `Call length ${durationLabel}` : 'Record how the conversation went'}
    size="md"
    footerError={error}
    footer={
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onClose} className="cursor-pointer">
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={onSave}
          disabled={isSaving}
          className="bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold cursor-pointer"
        >
          {isSaving ? 'Saving...' : 'Save result'}
        </Button>
      </div>
    }
  >
    <div className="space-y-4">
      <div className="space-y-2">
        {SALES_CALL_OUTCOME_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              outcome === opt.value ? 'border-emerald-500 bg-emerald-50/40' : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <input
              type="radio"
              name="sales-call-outcome"
              checked={outcome === opt.value}
              onChange={() => onOutcomeChange(opt.value)}
              className="mt-0.5 cursor-pointer"
            />
            <span>
              <span className="block text-sm font-medium text-slate-900">{opt.label}</span>
              <span className="block text-xs text-slate-500">{opt.hint}</span>
            </span>
          </label>
        ))}
      </div>

      {outcome === 'SALES_CALLBACK' && (
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-3">
          <AppDatePicker
            label="Callback date"
            value={callbackDate}
            onChange={onCallbackDateChange}
            minDate={startOfToday()}
            format="MM/dd/yyyy"
            placeholder="Select date"
          />
          <label className="block">
            <span className="block text-xs font-medium text-slate-700 mb-1.5">Time</span>
            <input
              type="time"
              value={callbackTime}
              onChange={(e) => onCallbackTimeChange(e.target.value)}
              className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </label>
        </div>
      )}

      <AppTextarea
        label="Note (optional)"
        value={note}
        onChange={onNoteChange}
        rows={3}
        maxLength={1000}
        placeholder="e.g. Client wants to discuss the fee with spouse first."
      />
    </div>
  </AppModal>
);
