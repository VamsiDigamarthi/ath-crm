import React, { useState } from 'react';
import { AppModal } from '@/shared/components/AppModal';
import { Button } from '@/shared/components/Button';
import { RotateCcw, CheckCircle2, ShieldAlert } from 'lucide-react';
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
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-300">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Return Lead{count > 1 ? 's' : ''} to Super Admin Pool
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {isBulk
                ? `Release ${count} selected lead(s) for Admin re-assignment`
                : `Release ${taxpayerName} (TY ${taxYear}) for Admin re-assignment`}
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-4 pt-1">
        {/* Info Banner */}
        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Returning from Sales Closer Pitch:</span> This return will unassign from your queue and move to the <strong>Super Admin Returned Pool</strong>. Admin can then reassign it to another sales closer or calling agent.
          </div>
        </div>

        {/* Reason Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">
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
                  className={`w-full text-left p-2.5 rounded-lg border text-xs font-medium transition-all flex items-center justify-between gap-2 cursor-pointer ${
                    isChecked
                      ? 'border-amber-500 bg-amber-50/70 text-amber-950 font-bold shadow-2xs ring-1 ring-amber-400'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>{reason}</span>
                  {isChecked && <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Notes / Feedback */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Additional Closer Remarks / Custom Reason (Optional)
          </label>
          <textarea
            rows={2}
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            placeholder="e.g. Spoke for 15 mins, client insisted on $50 fee, suggested assigning to Telugu/Hindi closer..."
            className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs font-semibold cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs px-4"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
            <span>{isSubmitting ? 'Returning to Admin...' : 'Confirm Return to Admin Pool'}</span>
          </Button>
        </div>
      </div>
    </AppModal>
  );
};
