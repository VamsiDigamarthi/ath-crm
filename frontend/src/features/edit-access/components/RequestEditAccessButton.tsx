import React from 'react';
import { Lock, Clock, LockOpen } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppModal } from '@/shared/components/AppModal';
import { AppTextarea } from '@/shared/components/AppTextarea';

interface RequestEditAccessButtonProps {
  hasAccess: boolean;
  accessUntil: string | null;
  isPending: boolean;
  isModalOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  reason: string;
  onReasonChange: (value: string) => void;
  reasonError?: string;
  isSubmitting: boolean;
  onSubmit: () => void;
}

const formatUntil = (iso: string) =>
  new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

export const RequestEditAccessButton: React.FC<RequestEditAccessButtonProps> = ({
  hasAccess,
  accessUntil,
  isPending,
  isModalOpen,
  onOpen,
  onClose,
  reason,
  onReasonChange,
  reasonError,
  isSubmitting,
  onSubmit,
}) => {
  if (hasAccess && accessUntil) {
    return (
      <span
        className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700"
        title="An admin gave you temporary edit access to this return"
      >
        <LockOpen className="w-3.5 h-3.5 text-slate-500" />
        Editing allowed until {formatUntil(accessUntil)}
      </span>
    );
  }

  if (isPending) {
    return (
      <span
        className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-500"
        title="Waiting for an admin to review your request"
      >
        <Clock className="w-3.5 h-3.5" />
        Edit access requested
      </span>
    );
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={onOpen}
        className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
        title="Ask an admin for temporary edit access to this submitted return"
      >
        <Lock className="w-3.5 h-3.5 text-slate-500" />
        Request edit access
      </Button>

      <AppModal
        isOpen={isModalOpen}
        onClose={onClose}
        title="Request edit access"
        subtitle="This return has been submitted, so it is read-only. An admin can unlock it for you for a limited time."
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="cursor-pointer">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold cursor-pointer"
            >
              {isSubmitting ? 'Sending...' : 'Send request'}
            </Button>
          </div>
        }
      >
        <AppTextarea
          label="What do you need to change?"
          value={reason}
          onChange={onReasonChange}
          rows={4}
          maxLength={1000}
          showCount
          error={reasonError}
          placeholder="e.g. Client sent a corrected W-2, need to replace the uploaded one."
        />
      </AppModal>
    </>
  );
};
