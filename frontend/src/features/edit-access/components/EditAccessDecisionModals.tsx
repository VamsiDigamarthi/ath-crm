import React from 'react';
import { AppModal } from '@/shared/components/AppModal';
import { AppTextarea } from '@/shared/components/AppTextarea';
import { AppDatePicker } from '@/shared/components/AppDatePicker';
import { Button } from '@/shared/components/Button';
import { DURATION_OPTIONS, type DurationPreset } from '../hooks/useEditAccessRequests';
import type { EditAccessRequestItem } from '../types/edit-access.types';

interface ApproveModalProps {
  request: EditAccessRequestItem | null;
  onClose: () => void;
  preset: DurationPreset;
  onPresetChange: (preset: DurationPreset) => void;
  customDate: Date | null;
  onCustomDateChange: (date: Date | null) => void;
  customTime: string;
  onCustomTimeChange: (time: string) => void;
  note: string;
  onNoteChange: (note: string) => void;
  error: string | null;
  accessUntilPreview: Date | null;
  isSaving: boolean;
  onConfirm: () => void;
}

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const ApproveEditAccessModal: React.FC<ApproveModalProps> = ({
  request,
  onClose,
  preset,
  onPresetChange,
  customDate,
  onCustomDateChange,
  customTime,
  onCustomTimeChange,
  note,
  onNoteChange,
  error,
  accessUntilPreview,
  isSaving,
  onConfirm,
}) => (
  <AppModal
    isOpen={Boolean(request)}
    onClose={onClose}
    title="Approve edit access"
    subtitle={
      request
        ? `${request.requester.name} will be able to edit ${request.taxpayerName} (TY ${request.taxYear}) until the time below.`
        : undefined
    }
    size="md"
    footerError={error}
    footer={
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onClose} className="cursor-pointer">
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={onConfirm}
          disabled={isSaving}
          className="bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold cursor-pointer"
        >
          {isSaving ? 'Approving...' : 'Approve access'}
        </Button>
      </div>
    }
  >
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium text-slate-700 mb-2">Access for</p>
        <div className="flex flex-wrap gap-2">
          {DURATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onPresetChange(opt.value)}
              className={`px-3 py-1.5 text-xs rounded-lg border cursor-pointer transition-colors ${
                preset === opt.value
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {preset === 'CUSTOM' && (
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-3">
          <AppDatePicker
            label="Date"
            value={customDate}
            onChange={onCustomDateChange}
            minDate={startOfToday()}
            format="MM/dd/yyyy"
            placeholder="Select date"
          />
          <label className="block">
            <span className="block text-xs font-medium text-slate-700 mb-1.5">Time</span>
            <input
              type="time"
              value={customTime}
              onChange={(e) => onCustomTimeChange(e.target.value)}
              className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </label>
        </div>
      )}

      <div className="text-sm text-slate-600 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
        Access ends{' '}
        <span className="font-medium text-slate-900">
          {accessUntilPreview
            ? accessUntilPreview.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
            : '—'}
        </span>
      </div>

      <AppTextarea
        label="Note for the requester (optional)"
        value={note}
        onChange={onNoteChange}
        rows={2}
        maxLength={500}
        placeholder="e.g. Only update the W-2 section."
      />
    </div>
  </AppModal>
);

interface RejectModalProps {
  request: EditAccessRequestItem | null;
  onClose: () => void;
  note: string;
  onNoteChange: (note: string) => void;
  isSaving: boolean;
  onConfirm: () => void;
}

export const RejectEditAccessModal: React.FC<RejectModalProps> = ({ request, onClose, note, onNoteChange, isSaving, onConfirm }) => (
  <AppModal
    isOpen={Boolean(request)}
    onClose={onClose}
    title="Decline request"
    subtitle={request ? `${request.requester.name} will be told the request was declined.` : undefined}
    size="md"
    footer={
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onClose} className="cursor-pointer">
          Cancel
        </Button>
        <Button size="sm" onClick={onConfirm} disabled={isSaving} className="bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer">
          {isSaving ? 'Declining...' : 'Decline'}
        </Button>
      </div>
    }
  >
    <AppTextarea
      label="Reason (optional)"
      value={note}
      onChange={onNoteChange}
      rows={3}
      maxLength={500}
      placeholder="e.g. Ask the preparer to make this change instead."
    />
  </AppModal>
);
