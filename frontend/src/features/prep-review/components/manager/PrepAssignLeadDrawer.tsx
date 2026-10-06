import React, { useState, useMemo } from 'react';
import type { PrepReviewLead, PrepStaffMember } from '../../types/prep-review.types';
import { AppModal } from '@/shared/components/AppModal';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
import { Button } from '@/shared/components/Button';
import { prepReviewService } from '../../services/prep-review-service';
import { Zap, UserCheck, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export interface PrepAssignLeadDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  targetLeads: PrepReviewLead[];
  staff: PrepStaffMember[];
  onAssignSuccess: (assignedLeadIds: string[], preparerId: string, reviewerId: string) => void;
}

export const PrepAssignLeadDrawer: React.FC<PrepAssignLeadDrawerProps> = ({
  isOpen,
  onClose,
  targetLeads,
  staff,
  onAssignSuccess,
}) => {
  const [assignmentMode, setAssignmentMode] = useState<'ROUND_ROBIN' | 'DIRECT'>('ROUND_ROBIN');
  const [selectedPreparerId, setSelectedPreparerId] = useState<string>('');
  const [selectedReviewerId, setSelectedReviewerId] = useState<string>('');
  const [searchAgent, setSearchAgent] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const leadCount = targetLeads.length;

  // Separate staff strictly by role capability
  const preparerStaff = useMemo(() => {
    return staff.filter((s) => {
      if (s.canPrepare !== undefined) return s.canPrepare;
      return s.role === 'TAX_PREPARER' || s.systemRoles?.includes('TAX_PREPARER');
    });
  }, [staff]);

  const reviewerStaff = useMemo(() => {
    return staff.filter((s) => {
      if (s.canReview !== undefined) return s.canReview;
      return s.role === 'TAX_REVIEWER' || s.systemRoles?.includes('TAX_REVIEWER');
    });
  }, [staff]);

  const filteredPreparers = useMemo(() => {
    const q = searchAgent.toLowerCase().trim();
    if (!q) return preparerStaff;
    return preparerStaff.filter((member: any) => {
      const name = (member.name || member.fullName || `${member.firstName || ''} ${member.lastName || ''}`).toLowerCase();
      const email = (member.email || '').toLowerCase();
      const mobile = (member.mobile || member.phone || '').toLowerCase();
      return name.includes(q) || email.includes(q) || mobile.includes(q);
    });
  }, [preparerStaff, searchAgent]);

  const handleConfirm = async () => {
    let prepId = selectedPreparerId;
    let revId = selectedReviewerId;

    if (assignmentMode === 'ROUND_ROBIN') {
      if (preparerStaff.length === 0) {
        toast.error('No active Tax Preparers available');
        return;
      }
      const sortedPreps = [...preparerStaff].sort((a, b) => (Number(a.activeCaseload) || 0) - (Number(b.activeCaseload) || 0));
      prepId = sortedPreps[0].id;

      if (reviewerStaff.length > 0) {
        const sortedRevs = [...reviewerStaff].sort((a, b) => (Number(a.activeCaseload) || 0) - (Number(b.activeCaseload) || 0));
        const diffRev = sortedRevs.find((r) => r.id !== prepId);
        revId = (diffRev || sortedRevs[0]).id;
      }
    } else {
      if (!prepId) {
        toast.error('Please select a Tax Preparer');
        return;
      }
      if (!revId && reviewerStaff.length > 0) {
        const sortedRevs = [...reviewerStaff].sort((a, b) => (Number(a.activeCaseload) || 0) - (Number(b.activeCaseload) || 0));
        const diffRev = sortedRevs.find((r) => r.id !== prepId);
        revId = (diffRev || sortedRevs[0]).id;
      }
    }

    try {
      setIsSubmitting(true);
      const leadIds = targetLeads.map((l) => l.id);
      await prepReviewService.assignLeadPair({
        applicationIds: leadIds,
        preparerId: prepId,
        reviewerId: revId || prepId,
      });

      toast.success(`Assigned ${leadCount} return${leadCount === 1 ? '' : 's'} successfully`);
      onAssignSuccess(leadIds, prepId, revId || prepId);
      onClose();
    } catch (err: any) {
      console.error('Failed to assign returns:', err);
      toast.error(err?.response?.data?.message || 'Failed to assign tax returns');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-xl"
      title="Assign returns"
      description={`${leadCount} ${leadCount === 1 ? 'return' : 'returns'} selected`}
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="outline" size="md" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            size="md"
            onClick={handleConfirm}
            disabled={isSubmitting || (assignmentMode === 'DIRECT' && !selectedPreparerId)}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold"
          >
            {isSubmitting ? 'Assigning...' : 'Assign'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 font-sans">
        {/* Mode switch */}
        <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-slate-100">
          {(['ROUND_ROBIN', 'DIRECT'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setAssignmentMode(mode)}
              className={`flex items-center justify-center gap-2 h-9 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                assignmentMode === mode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {mode === 'ROUND_ROBIN' ? <Zap className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
              {mode === 'ROUND_ROBIN' ? 'Auto-assign' : 'Pick an agent'}
            </button>
          ))}
        </div>

        {/* Auto round-robin */}
        {assignmentMode === 'ROUND_ROBIN' && (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Returns are split evenly across {preparerStaff.length} tax{' '}
              {preparerStaff.length === 1 ? 'preparer' : 'preparers'} (~{Math.ceil(leadCount / (preparerStaff.length || 1))} each).
              Managers and team leads are excluded.
            </p>
            <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200 divide-y divide-slate-100">
              {preparerStaff.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-400">No active tax preparers</div>
              ) : (
                preparerStaff.map((member: any) => {
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
        )}

        {/* Direct selection */}
        {assignmentMode === 'DIRECT' && (
          <div className="space-y-3">
            <AppSearchInput
              value={searchAgent}
              onChange={setSearchAgent}
              placeholder="Search preparer by name, email, or phone..."
              debounceMs={200}
            />

            <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200 divide-y divide-slate-100">
              {filteredPreparers.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-400">No tax preparers match your search</div>
              ) : (
                filteredPreparers.map((member: any) => {
                  const isSelected = selectedPreparerId === member.id;
                  const displayName = member.name || member.fullName || `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email;
                  return (
                    <div
                      key={member.id}
                      onClick={() => setSelectedPreparerId(member.id)}
                      className={`flex items-center justify-between gap-3 px-3.5 py-2.5 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50/60'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-[#16A34A] bg-[#16A34A]' : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                        </span>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900 truncate">{displayName}</div>
                          <div className="text-xs text-slate-500 truncate">
                            {member.email}
                            {member.mobile || member.phone ? ` · ${member.mobile || member.phone}` : ''}
                            {' · Tax preparer'}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-slate-500 shrink-0">{member.activeCaseload || 0} active</span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Optional QA Reviewer selection */}
            {selectedPreparerId && reviewerStaff.length > 0 && (
              <div className="pt-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  QA Reviewer (Optional)
                </label>
                <select
                  value={selectedReviewerId}
                  onChange={(e) => setSelectedReviewerId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#16A34A] cursor-pointer"
                >
                  <option value="">Auto-assign optimal reviewer</option>
                  {reviewerStaff.map((r: any) => (
                    <option key={r.id} value={r.id}>
                      {r.name || r.email} ({r.activeCaseload || 0} active)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>
    </AppModal>
  );
};
