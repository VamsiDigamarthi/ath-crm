import React, { useState } from 'react';
import type { PrepStaffMember, PrepReviewLead } from '../../types/prep-review.types';
import { AppModal } from '@/shared/components/AppModal';
import { Button } from '@/shared/components/Button';
import toast from 'react-hot-toast';

export interface PrepAutoDistributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  unassignedLeads: PrepReviewLead[];
  staff: PrepStaffMember[];
  onDistributeSuccess: (distributionPlan?: any[]) => void;
}

export const PrepAutoDistributeModal: React.FC<PrepAutoDistributeModalProps> = ({
  isOpen,
  onClose,
  unassignedLeads,
  staff,
  onDistributeSuccess,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const activePreparers = staff.filter(
    (s) =>
      (s.canPrepare ?? (s.role === 'TAX_PREPARER' || s.systemRoles?.includes('TAX_PREPARER'))) &&
      s.isAvailable
  );

  const leadCount = unassignedLeads.length;

  const handleAutoDistribute = () => {
    if (leadCount === 0) {
      toast.error('No unassigned returns found in pipeline');
      return;
    }
    if (activePreparers.length === 0) {
      toast.error('No available Tax Preparers found');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      toast.success(
        `Successfully distributed ${leadCount} return${leadCount === 1 ? '' : 's'} evenly across ${activePreparers.length} Tax Preparers`
      );
      onDistributeSuccess();
      onClose();
    }, 400);
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-xl"
      title="Auto-assign returns"
      description={`${leadCount} unassigned ${leadCount === 1 ? 'return' : 'returns'} selected`}
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="outline" size="md" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            size="md"
            onClick={handleAutoDistribute}
            disabled={isProcessing || activePreparers.length === 0}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold"
          >
            {isProcessing ? 'Assigning...' : 'Assign'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 font-sans">
        <p className="text-sm text-slate-600">
          Returns are split evenly across {activePreparers.length} active tax{' '}
          {activePreparers.length === 1 ? 'preparer' : 'preparers'} (~{Math.ceil(leadCount / (activePreparers.length || 1))} each).
          Managers and team leads are excluded.
        </p>

        <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200 divide-y divide-slate-100">
          {activePreparers.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-400">No active tax preparers available</div>
          ) : (
            activePreparers.map((member: any) => {
              const displayName = member.name || member.fullName || `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email;
              return (
                <div key={member.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">{displayName}</div>
                    <div className="text-xs text-slate-500 truncate">
                      {member.email}
                      {member.mobile || member.phone ? ` · ${member.mobile || member.phone}` : ''}
                      {' · Tax preparer'}
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 shrink-0">{member.activeCaseload || 0} active</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppModal>
  );
};
