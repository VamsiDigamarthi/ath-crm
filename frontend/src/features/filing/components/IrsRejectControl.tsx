import React from 'react';
import { XCircle } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppModal } from '@/shared/components/AppModal';
import { AppTextarea } from '@/shared/components/AppTextarea';
import { useIrsReject } from '../hooks/useIrsReject';

interface IrsRejectControlProps {
  applicationId: string;
  onChanged?: () => void;
}

/** Workspace header button shown after transmission: record an IRS rejection */
export const IrsRejectControl: React.FC<IrsRejectControlProps> = ({ applicationId, onChanged }) => {
  const reject = useIrsReject(applicationId, onChanged);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={reject.openModal}
        className="border-rose-200 bg-white hover:bg-rose-50 text-rose-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs h-8 px-3 cursor-pointer"
        title="The IRS rejected this return: move it to Rejected returns for reprocessing"
      >
        <XCircle className="w-3.5 h-3.5" />
        <span>Mark IRS rejected</span>
      </Button>

      <AppModal
        isOpen={reject.isModalOpen}
        onClose={reject.closeModal}
        title="Mark as rejected by the IRS"
        subtitle="The return moves to Returned Status → Rejected returns. Fix it and transmit again to reprocess."
        size="md"
        footerError={reject.error}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={reject.closeModal} className="cursor-pointer">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={reject.save}
              disabled={reject.isSaving}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold cursor-pointer"
            >
              {reject.isSaving ? 'Saving...' : 'Mark rejected'}
            </Button>
          </div>
        }
      >
        <AppTextarea
          label="IRS rejection reason"
          value={reject.reason}
          onChange={reject.setReason}
          rows={3}
          maxLength={500}
          placeholder="e.g. IND-031-04: Prior-year AGI does not match IRS records."
        />
      </AppModal>
    </>
  );
};
