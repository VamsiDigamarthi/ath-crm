import { useState } from 'react';
import toast from 'react-hot-toast';
import { filingService } from '../services/filing-service';

/** Put a return on hold / release it. Hold is a flag only; the stage never changes. */
export const useFilingHold = (applicationId: string | undefined, onChanged?: () => void) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const save = async (onHold: boolean) => {
    if (!applicationId) return;
    setIsSaving(true);
    try {
      await filingService.setHold(applicationId, onHold, onHold ? reason.trim() || undefined : undefined);
      toast.success(onHold ? 'Filing put on hold' : 'Hold released');
      setIsModalOpen(false);
      setReason('');
      onChanged?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to update hold');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isModalOpen,
    openModal: () => {
      setReason('');
      setIsModalOpen(true);
    },
    closeModal: () => setIsModalOpen(false),
    reason,
    setReason,
    isSaving,
    putOnHold: () => save(true),
    release: () => save(false),
  };
};
