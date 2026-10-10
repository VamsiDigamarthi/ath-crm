import React from 'react';
import { PauseCircle, PlayCircle } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppModal } from '@/shared/components/AppModal';
import { AppTextarea } from '@/shared/components/AppTextarea';
import { useFilingHold } from '../hooks/useFilingHold';

interface FilingHoldControlProps {
  applicationId: string;
  isOnHold: boolean;
  disabled?: boolean;
  onChanged?: () => void;
}

/** Workspace header button: Put on hold (with reason) / Release hold */
export const FilingHoldControl: React.FC<FilingHoldControlProps> = ({ applicationId, isOnHold, disabled, onChanged }) => {
  const hold = useFilingHold(applicationId, onChanged);

  if (isOnHold) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={hold.release}
        disabled={hold.isSaving}
        className="border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs h-8 px-3 cursor-pointer"
        title="Release the hold so this return can be transmitted"
      >
        <PlayCircle className="w-3.5 h-3.5" />
        <span>{hold.isSaving ? 'Releasing...' : 'Release hold'}</span>
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={hold.openModal}
        disabled={disabled}
        className={`text-xs font-bold flex items-center gap-1.5 shadow-2xs h-8 px-3 ${
          disabled ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed' : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-800 cursor-pointer'
        }`}
        title={disabled ? 'Filed returns cannot be put on hold' : 'Pause filing for this return'}
      >
        <PauseCircle className="w-3.5 h-3.5" />
        <span>Put on hold</span>
      </Button>

      <AppModal
        isOpen={hold.isModalOpen}
        onClose={hold.closeModal}
        title="Put filing on hold"
        subtitle="The return stays where it is and cannot be transmitted until the hold is released."
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={hold.closeModal} className="cursor-pointer">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={hold.putOnHold}
              disabled={hold.isSaving}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
            >
              {hold.isSaving ? 'Saving...' : 'Put on hold'}
            </Button>
          </div>
        }
      >
        <AppTextarea
          label="Reason (optional)"
          value={hold.reason}
          onChange={hold.setReason}
          rows={3}
          maxLength={500}
          placeholder="e.g. Waiting for the client to confirm bank details."
        />
      </AppModal>
    </>
  );
};
