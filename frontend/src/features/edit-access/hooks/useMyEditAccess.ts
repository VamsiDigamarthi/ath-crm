import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { editAccessService } from '../services/edit-access-service';
import { requestEditAccessSchema } from '../validations/edit-access-schema';
import type { MyEditAccess } from '../types/edit-access.types';

/**
 * Edit access for a submitted return. Only checks the server when `enabled`
 * (the return is locked for this user), so open returns cost no extra call.
 */
export const useMyEditAccess = (applicationId: string | undefined, enabled: boolean) => {
  const [status, setStatus] = useState<MyEditAccess | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!applicationId || !enabled) {
      setStatus(null);
      return;
    }
    try {
      const res = await editAccessService.getMine(applicationId);
      setStatus(res.data);
    } catch {
      setStatus(null);
    }
  }, [applicationId, enabled]);

  useEffect(() => {
    load();
  }, [load]);

  // Drop access in the UI the moment the granted window ends
  useEffect(() => {
    if (!status?.hasAccess || !status.accessUntil) return;
    const msLeft = new Date(status.accessUntil).getTime() - Date.now();
    if (msLeft <= 0) {
      load();
      return;
    }
    const timer = setTimeout(load, Math.min(msLeft + 1000, 2_147_000_000));
    return () => clearTimeout(timer);
  }, [status, load]);

  const openModal = () => {
    setReason('');
    setReasonError(undefined);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const submitRequest = async () => {
    if (!applicationId) return;
    const parsed = requestEditAccessSchema.safeParse({ reason });
    if (!parsed.success) {
      setReasonError(parsed.error.issues[0]?.message);
      return;
    }
    setIsSubmitting(true);
    try {
      await editAccessService.request(applicationId, parsed.data.reason);
      toast.success('Request sent to admin');
      setIsModalOpen(false);
      await load();
    } catch (err) {
      toast.error((err as Error).message || 'Failed to send request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    hasAccess: Boolean(enabled && status?.hasAccess),
    accessUntil: status?.accessUntil ?? null,
    isPending: Boolean(status?.pendingRequestId),
    isModalOpen,
    openModal,
    closeModal,
    reason,
    setReason: (v: string) => {
      setReason(v);
      setReasonError(undefined);
    },
    reasonError,
    isSubmitting,
    submitRequest,
  };
};
