import { useState } from 'react';
import toast from 'react-hot-toast';
import { filingService } from '../services/filing-service';

/** Record that the IRS rejected a transmitted return (reason required) */
export const useIrsReject = (applicationId: string | undefined, onChanged?: () => void) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const save = async () => {
    if (!applicationId) return;
    if (reason.trim().length < 3) {
      setError('Enter the IRS rejection reason');
      return;
    }
    setIsSaving(true);
    try {
      await filingService.markIrsRejected(applicationId, reason.trim());
      toast.success('Marked as rejected by the IRS. It is now under Returned Status → Rejected returns.');
      setIsModalOpen(false);
      onChanged?.();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to mark as rejected');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isModalOpen,
    openModal: () => {
      setReason('');
      setError(null);
      setIsModalOpen(true);
    },
    closeModal: () => setIsModalOpen(false),
    reason,
    setReason: (v: string) => {
      setReason(v);
      setError(null);
    },
    error,
    isSaving,
    save,
  };
};
