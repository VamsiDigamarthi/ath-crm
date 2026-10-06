import React, { useState } from 'react';
import { AppModal } from '@/shared/components/AppModal';
import { Button } from '@/shared/components/Button';
import { RotateCcw, CheckCircle2 } from 'lucide-react';
import { salesService } from '../../services/sales-service';
import toast from 'react-hot-toast';

export interface SalesReturnToAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId?: string;
  applicationIds?: string[];
  taxpayerName?: string;
  taxYear?: number;
  onReturnSuccess?: () => void;
}

const PRESET_REASONS = [
  'Client not converting / rejected fee quote after discussion',
  'Client price negotiation stalled (requested fee below minimum)',
  'Client decided to file with previous preparer / elsewhere',
  'Client requested a different sales representative / language',
  'Client unresponsive across multiple call attempts / follow-ups',
  'Client tax situation changed / wants CPA re-assessment',
];

export const SalesReturnToAdminModal: React.FC<SalesReturnToAdminModalProps> = ({
  isOpen,
  onClose,
  applicationId,
  applicationIds,
  taxpayerName = 'Selected Taxpayers',
  taxYear = 2025,
  onReturnSuccess,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>(PRESET_REASONS[0]);
  const [customReason, setCustomReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const finalReason = customReason.trim() ? customReason.trim() : selectedPreset;
  const isBulk = Boolean(applicationIds && applicationIds.length > 0);
  const count = isBulk ? applicationIds!.length : 1;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (isBulk && applicationIds && applicationIds.length > 0) {
        await salesService.returnLeadsBulkToAdmin(applicationIds, finalReason);
        toast.success(`Successfully returned ${applicationIds.length} lead(s) back to Admin Pool! ↺`);
      } else if (applicationId) {
        await salesService.returnLeadToAdmin(applicationId, finalReason);
        toast.success(`Lead for ${taxpayerName} successfully released back to Admin Pool! ↺`);
      }
      onClose();
      if (onReturnSuccess) {
        onReturnSuccess();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to return lead(s) to Admin');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-lg"
      title={isBulk ? `Return ${count} Leads to Admin Pool` : 'Return Lead to Admin Pool'}
      description={
        isBulk
          ? `Release ${count} selected lead(s) for Admin re-assignment.`
          : `Release ${taxpayerName} (TY ${taxYear}) for Admin re-assignment.`
      }
    >
      <div className="space-y-4 pt-1 font-sans">
        {/* Reason Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">
            Select Return Reason <span className="text-rose-500">*</span>
          </label>
          <div className="space-y-1.5">
            {PRESET_REASONS.map((reason) => {
              const isChecked = selectedPreset === reason && !customReason;
              return (
                <button
                  key={reason}
                  type="button"
                  onClick={() => {
                    setSelectedPreset(reason);
                    setCustomReason('');
                  }}
                  className={`w-full text-left p-2.5 rounded-md border text-xs transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                    isChecked
                      ? 'border-slate-900 bg-slate-50 font-semibold text-slate-900'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <span>{reason}</span>
                  {isChecked && <CheckCircle2 className="w-4 h-4 text-slate-900 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Notes / Feedback */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Additional Closer Remarks / Custom Reason (Optional)
          </label>
          <textarea
            rows={3}
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            placeholder="e.g. Spoke for 15 mins, client insisted on $50 fee, suggested assigning to Telugu/Hindi closer..."
            className="w-full text-sm p-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A] bg-white transition-colors text-slate-800 placeholder:text-slate-400 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer px-4"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
            <span>{isSubmitting ? 'Returning...' : 'Confirm Return to Admin Pool'}</span>
          </Button>
        </div>
      </div>
    </AppModal>
  );
};
