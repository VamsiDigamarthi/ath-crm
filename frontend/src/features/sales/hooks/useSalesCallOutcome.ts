import { useState } from 'react';
import toast from 'react-hot-toast';
import { salesService } from '../services/sales-service';
import type { SalesCallDisposition } from '../types/sales.types';

/**
 * State for the "Log call result" popup. Saving only writes a call log entry;
 * the return's stage is never changed by a sales call result.
 */
export const useSalesCallOutcome = (applicationId: string | undefined, onSaved?: () => void) => {
  const [isOpen, setIsOpen] = useState(false);
  const [outcome, setOutcome] = useState<SalesCallDisposition | ''>('');
  const [callbackDate, setCallbackDate] = useState<Date | null>(null);
  const [callbackTime, setCallbackTime] = useState('10:00');
  const [note, setNote] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const open = (opts?: { duration?: number; note?: string }) => {
    setOutcome('');
    setCallbackDate(null);
    setCallbackTime('10:00');
    setNote(opts?.note || '');
    setCallDuration(opts?.duration || 0);
    setError(null);
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  const save = async () => {
    if (!applicationId) return;
    if (!outcome) {
      setError('Choose a call result');
      return;
    }

    let callbackScheduledAt: string | null = null;
    if (outcome === 'SALES_CALLBACK') {
      if (!callbackDate) {
        setError('Pick the callback date');
        return;
      }
      const [h, m] = (callbackTime || '10:00').split(':').map(Number);
      const at = new Date(callbackDate);
      at.setHours(h || 0, m || 0, 0, 0);
      if (at.getTime() <= Date.now()) {
        setError('Callback time must be in the future');
        return;
      }
      callbackScheduledAt = at.toISOString();
    }

    setIsSaving(true);
    try {
      await salesService.saveCloserNotes(applicationId, {
        notes: note.trim(),
        disposition: outcome,
        callDuration,
        callbackScheduledAt,
      });
      toast.success('Call result saved');
      setIsOpen(false);
      onSaved?.();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to save call result');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isOpen,
    open,
    close,
    outcome,
    setOutcome: (v: SalesCallDisposition) => {
      setOutcome(v);
      setError(null);
    },
    callbackDate,
    setCallbackDate: (d: Date | null) => {
      setCallbackDate(d);
      setError(null);
    },
    callbackTime,
    setCallbackTime: (t: string) => {
      setCallbackTime(t);
      setError(null);
    },
    note,
    setNote,
    error,
    isSaving,
    save,
  };
};
