import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { editAccessService } from '../services/edit-access-service';
import { approveEditAccessSchema } from '../validations/edit-access-schema';
import type { EditAccessRequestItem } from '../types/edit-access.types';

export type RequestFilter = 'PENDING' | 'HISTORY';

export type DurationPreset = '1H' | '4H' | 'TODAY' | '1D' | '3D' | '1W' | 'CUSTOM';

export const DURATION_OPTIONS: { value: DurationPreset; label: string }[] = [
  { value: '1H', label: '1 hour' },
  { value: '4H', label: '4 hours' },
  { value: 'TODAY', label: 'End of today' },
  { value: '1D', label: '24 hours' },
  { value: '3D', label: '3 days' },
  { value: '1W', label: '1 week' },
  { value: 'CUSTOM', label: 'Pick date & time' },
];

const HOUR = 60 * 60 * 1000;

const resolveUntil = (preset: DurationPreset, customDate: Date | null, customTime: string): Date | null => {
  const now = Date.now();
  switch (preset) {
    case '1H':
      return new Date(now + HOUR);
    case '4H':
      return new Date(now + 4 * HOUR);
    case 'TODAY': {
      const d = new Date();
      d.setHours(23, 59, 0, 0);
      return d;
    }
    case '1D':
      return new Date(now + 24 * HOUR);
    case '3D':
      return new Date(now + 72 * HOUR);
    case '1W':
      return new Date(now + 168 * HOUR);
    case 'CUSTOM': {
      if (!customDate) return null;
      const [h, m] = (customTime || '18:00').split(':').map(Number);
      const d = new Date(customDate);
      d.setHours(h || 0, m || 0, 0, 0);
      return d;
    }
  }
};

export const useEditAccessRequests = (enabled: boolean) => {
  const [requests, setRequests] = useState<EditAccessRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<RequestFilter>('PENDING');
  const [busyId, setBusyId] = useState<string | null>(null);

  // Approve modal
  const [approving, setApproving] = useState<EditAccessRequestItem | null>(null);
  const [preset, setPreset] = useState<DurationPreset>('TODAY');
  const [customDate, setCustomDate] = useState<Date | null>(null);
  const [customTime, setCustomTime] = useState('18:00');
  const [approveNote, setApproveNote] = useState('');
  const [approveError, setApproveError] = useState<string | null>(null);

  // Decline modal
  const [rejecting, setRejecting] = useState<EditAccessRequestItem | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await editAccessService.list();
      setRequests(res.data);
    } catch (err) {
      toast.error((err as Error).message || 'Failed to load edit access requests');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Loads on mount (for the tab badge) and again when the admin opens the tab
  useEffect(() => {
    load();
  }, [enabled, load]);

  const pendingCount = useMemo(() => requests.filter((r) => r.status === 'PENDING').length, [requests]);

  const visibleRequests = useMemo(
    () => requests.filter((r) => (filter === 'PENDING' ? r.status === 'PENDING' : r.status !== 'PENDING')),
    [requests, filter]
  );

  const accessUntilPreview = resolveUntil(preset, customDate, customTime);

  const openApprove = (req: EditAccessRequestItem) => {
    setApproving(req);
    setPreset('TODAY');
    setCustomDate(null);
    setCustomTime('18:00');
    setApproveNote('');
    setApproveError(null);
  };

  const closeApprove = () => setApproving(null);

  const confirmApprove = async () => {
    if (!approving) return;
    const parsed = approveEditAccessSchema.safeParse({ accessUntil: accessUntilPreview, reviewNote: approveNote });
    if (!parsed.success) {
      setApproveError(parsed.error.issues[0]?.message || 'Check the access end time');
      return;
    }
    setBusyId(approving.id);
    try {
      await editAccessService.approve(approving.id, parsed.data.accessUntil, parsed.data.reviewNote || undefined);
      toast.success(`Edit access given to ${approving.requester.name}`);
      setApproving(null);
      await load();
    } catch (err) {
      setApproveError((err as Error).message || 'Failed to approve');
    } finally {
      setBusyId(null);
    }
  };

  const openReject = (req: EditAccessRequestItem) => {
    setRejecting(req);
    setRejectNote('');
  };

  const closeReject = () => setRejecting(null);

  const confirmReject = async () => {
    if (!rejecting) return;
    setBusyId(rejecting.id);
    try {
      await editAccessService.reject(rejecting.id, rejectNote.trim() || undefined);
      toast.success('Request declined');
      setRejecting(null);
      await load();
    } catch (err) {
      toast.error((err as Error).message || 'Failed to decline');
    } finally {
      setBusyId(null);
    }
  };

  const revoke = async (req: EditAccessRequestItem) => {
    setBusyId(req.id);
    try {
      await editAccessService.revoke(req.id);
      toast.success(`Edit access removed for ${req.requester.name}`);
      await load();
    } catch (err) {
      toast.error((err as Error).message || 'Failed to remove access');
    } finally {
      setBusyId(null);
    }
  };

  return {
    isLoading,
    filter,
    setFilter,
    pendingCount,
    visibleRequests,
    busyId,
    // approve
    approving,
    openApprove,
    closeApprove,
    preset,
    setPreset: (p: DurationPreset) => {
      setPreset(p);
      setApproveError(null);
    },
    customDate,
    setCustomDate: (d: Date | null) => {
      setCustomDate(d);
      setApproveError(null);
    },
    customTime,
    setCustomTime: (t: string) => {
      setCustomTime(t);
      setApproveError(null);
    },
    approveNote,
    setApproveNote,
    approveError,
    accessUntilPreview,
    confirmApprove,
    // reject
    rejecting,
    openReject,
    closeReject,
    rejectNote,
    setRejectNote,
    confirmReject,
    // revoke
    revoke,
  };
};
