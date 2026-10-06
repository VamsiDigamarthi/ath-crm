import React, { useState, useEffect, useMemo } from 'react';
import type { PrepReviewLead, PrepStaffMember } from '../../types/prep-review.types';
import { AppModal } from '@/shared/components/AppModal';
import { AppDatePicker } from '@/shared/components/AppDatePicker';
import { AppSelect } from '@/shared/components/AppSelect';
import { AppTabs } from '@/shared/components/AppTabs';
import { Button } from '@/shared/components/Button';
import { prepReviewService } from '../../services/prep-review-service';
import { 
  Calculator, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

const TIME_OPTIONS = [
  { label: '09:00 AM (Morning)', value: '09:00 AM' },
  { label: '11:00 AM', value: '11:00 AM' },
  { label: '01:00 PM (Afternoon)', value: '01:00 PM' },
  { label: '03:00 PM', value: '03:00 PM' },
  { label: '05:00 PM (End of Day)', value: '05:00 PM' },
  { label: '07:00 PM (Evening)', value: '07:00 PM' },
  { label: '09:00 PM (Night)', value: '09:00 PM' },
  { label: '11:59 PM (Midnight)', value: '11:59 PM' },
];

interface PrepAssignLeadDrawerProps {
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

  const [selectedPreparerId, setSelectedPreparerId] = useState<string>('');
  const [selectedReviewerId, setSelectedReviewerId] = useState<string>('');
  const [targetSla, setTargetSla] = useState<string>('24h');
  
  // Interactive Target Date & Time States
  const [targetDueDate, setTargetDueDate] = useState<Date>(new Date(Date.now() + 86400000));
  const [targetDueTime, setTargetDueTime] = useState<string>('05:00 PM');

  const [prepNotes, setPrepNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-select initial pair based on roles & lowest caseload
  useEffect(() => {
    if (isOpen) {
      if (preparerStaff.length > 0 && !selectedPreparerId) {
        const sortedPreps = [...preparerStaff].sort((a, b) => (Number(a.activeCaseload) || 0) - (Number(b.activeCaseload) || 0));
        setSelectedPreparerId(sortedPreps[0].id);
      }
      if (reviewerStaff.length > 0 && !selectedReviewerId) {
        const sortedRevs = [...reviewerStaff].sort((a, b) => (Number(a.activeCaseload) || 0) - (Number(b.activeCaseload) || 0));
        const diffRev = sortedRevs.find((r) => r.id !== selectedPreparerId);
        setSelectedReviewerId(diffRev ? diffRev.id : sortedRevs[0].id);
      }
    }
  }, [isOpen, preparerStaff, reviewerStaff]);

  // Quick 1-Click Auto-Pair
  const handleAutoPair = () => {
    if (preparerStaff.length === 0 || reviewerStaff.length === 0) {
      toast.error('Both an eligible Tax Preparer and QA Reviewer are required');
      return;
    }
    const sortedPreps = [...preparerStaff].sort((a, b) => (Number(a.activeCaseload) || 0) - (Number(b.activeCaseload) || 0));
    const sortedRevs = [...reviewerStaff].sort((a, b) => (Number(a.activeCaseload) || 0) - (Number(b.activeCaseload) || 0));

    const chosenPrep = sortedPreps[0];
    const otherRev = sortedRevs.find((r) => r.id !== chosenPrep.id);
    const chosenRev = otherRev || sortedRevs[0];

    setSelectedPreparerId(chosenPrep.id);
    setSelectedReviewerId(chosenRev.id);
    toast.success('Auto-paired optimal Preparer & Reviewer! ⚡');
  };

  const isSelfAssignment = Boolean(selectedPreparerId && selectedReviewerId && selectedPreparerId === selectedReviewerId);

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPreparerId) {
      toast.error('Please select a staff member for Tax Preparation');
      return;
    }
    if (!selectedReviewerId) {
      toast.error('Please select a staff member for QA Review');
      return;
    }

    try {
      setIsSubmitting(true);
      const leadIds = targetLeads.map((l) => l.id);
      await prepReviewService.assignLeadPair({
        applicationIds: leadIds,
        preparerId: selectedPreparerId,
        reviewerId: selectedReviewerId,
        targetDueDate: `${targetDueDate.toLocaleDateString()} ${targetDueTime}`,
        prepNotes,
      });

      toast.success(`Assigned ${targetLeads.length} return(s) to Preparer & QA Reviewer successfully! 🎯✅`);
      onAssignSuccess(leadIds, selectedPreparerId, selectedReviewerId);
      onClose();
    } catch (err: any) {
      console.error('Failed to assign returns:', err);
      toast.error(err?.response?.data?.message || 'Failed to assign tax returns in database');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Assign Tax Return: ${targetLeads.length === 1 ? targetLeads[0].taxpayerName : `${targetLeads.length} Selected Returns`}`}
      size="xl"
      width="940px"
    >
      <form onSubmit={handleAssignSubmit} className="space-y-4 font-sans py-1">
        {/* Selected Leads Banner with Quick Auto-Pair Action */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Target Returns:</span>
              <span className="text-[#16A34A] font-bold">{targetLeads.length} File(s)</span>
            </div>
            <div className="text-[11px] text-slate-500 truncate max-w-md">
              {targetLeads.map((l) => `${l.taxpayerName} (TY ${l.taxYear})`).join(' • ')}
            </div>
          </div>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleAutoPair}
            className="border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-[#16A34A] text-xs font-bold flex items-center gap-1.5 h-8 shrink-0 cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Auto-Pair Optimal Staff</span>
          </Button>
        </div>

        {/* 2-Column Interactive Staff Role Assignment Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Column 1: Tax Preparer Role Selector */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                  <Calculator className="w-3.5 h-3.5" />
                </div>
                <span>1. Tax Preparer (1040 Drafting) *</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">{preparerStaff.length} Staff Available</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {preparerStaff.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 font-medium">
                  No personnel with Tax Preparer role available
                </div>
              ) : (
                preparerStaff.map((member) => {
                  const isSelected = selectedPreparerId === member.id;
                  const isAlsoReviewer = selectedReviewerId === member.id;
                  const load = Number(member.activeCaseload) || 0;

                  return (
                    <div
                      key={`prep-${member.id}`}
                      onClick={() => setSelectedPreparerId(member.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {(member.name || member.email)[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                            <span className="truncate">{member.name}</span>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 inline shrink-0" />}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium truncate">
                            <span>{member.email}</span> • <span className="font-bold text-slate-700">{load} active</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        {isSelected ? (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-blue-600 text-white shadow-2xs">
                            Selected
                          </span>
                        ) : isAlsoReviewer ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                            Reviewer
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">
                            Assign
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Column 2: QA Reviewer Role Selector */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <div className="w-6 h-6 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span>2. QA Reviewer (Compliance Audit) *</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">{reviewerStaff.length} Staff Available</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {reviewerStaff.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 font-medium">
                  No personnel with QA Reviewer role available
                </div>
              ) : (
                reviewerStaff.map((member) => {
                  const isSelected = selectedReviewerId === member.id;
                  const isAlsoPreparer = selectedPreparerId === member.id;
                  const load = Number(member.activeCaseload) || 0;

                  return (
                    <div
                      key={`rev-${member.id}`}
                      onClick={() => setSelectedReviewerId(member.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {(member.name || member.email)[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                            <span className="truncate">{member.name}</span>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 inline shrink-0" />}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium truncate">
                            <span>{member.email}</span> • <span className="font-bold text-slate-700">{load} active</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        {isSelected ? (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-purple-600 text-white shadow-2xs">
                            Selected
                          </span>
                        ) : isAlsoPreparer ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            Preparer
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">
                            Assign
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Selected Pair Confirmation Indicator */}
        {selectedPreparerId && selectedReviewerId ? (
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
              <span>
                {isSelfAssignment ? (
                  <><strong>Dual Role Assignment:</strong> {staff.find((s) => s.id === selectedPreparerId)?.name} (Tax Preparation &amp; QA Review)</>
                ) : (
                  <><strong>Pair Confirmed:</strong> {staff.find((s) => s.id === selectedPreparerId)?.name} (Drafts) &rarr; {staff.find((s) => s.id === selectedReviewerId)?.name} (QA Audit)</>
                )}
              </span>
            </div>
            <span className="text-[10px] font-bold text-[#16A34A] bg-white px-2 py-0.5 rounded border border-emerald-200">
              {isSelfAssignment ? 'Dual Role Selected ✓' : 'Pair Validated ✓'}
            </span>
          </div>
        ) : null}

        {/* Interactive Target Due Date & Time Section with Fast SLA Presets */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Preparation &amp; QA SLA Target Completion *</span>
            </label>

            {/* Fast Presets Tabs */}
            <AppTabs
              tabs={[
                {
                  id: '24h',
                  label: '24 Hours (Standard)',
                },
                {
                  id: '48h',
                  label: '48 Hours',
                },
                {
                  id: 'urgent',
                  label: 'Same-Day Urgent',
                },
              ]}
              activeTab={targetSla}
              onChange={(sla) => {
                setTargetSla(sla);
                if (sla === '24h') {
                  setTargetDueDate(new Date(Date.now() + 86400000));
                  setTargetDueTime('05:00 PM');
                } else if (sla === '48h') {
                  setTargetDueDate(new Date(Date.now() + 172800000));
                  setTargetDueTime('05:00 PM');
                } else if (sla === 'urgent') {
                  setTargetDueDate(new Date());
                  setTargetDueTime('09:00 PM');
                }
              }}
              className="border-b-0"
            />
          </div>

          {/* Interactive Date & Time Pickers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
            <div>
              <AppDatePicker
                mode="single"
                value={targetDueDate}
                onChange={(d) => {
                  if (d) {
                    setTargetDueDate(d);
                    setTargetSla('custom');
                  }
                }}
                minDate={new Date()}
                label="Target Due Date *"
                accentColor="#16A34A"
                placeholder="Select Due Date"
              />
            </div>

            <div>
              <AppSelect
                label="Target Due Time *"
                value={targetDueTime}
                onChange={(val) => {
                  setTargetDueTime(val);
                  setTargetSla('custom');
                }}
                options={TIME_OPTIONS}
              />
            </div>
          </div>
        </div>

        {/* Manager Instructions */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Special Instructions / Tax Considerations for the Pair
          </label>
          <textarea
            value={prepNotes}
            onChange={(e) => setPrepNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A]"
            placeholder="e.g. Dual-state residency calculation required. Check foreign interest on schedule B."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            loading={isSubmitting}
            disabled={!selectedPreparerId || !selectedReviewerId || isSubmitting}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold px-4 cursor-pointer shadow-2xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirm &amp; Dispatch Return</span>
          </Button>
        </div>
      </form>
    </AppModal>
  );
};
