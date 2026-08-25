import React, { useState, useEffect, useMemo } from 'react';
import type { PrepReviewLead, PrepStaffMember } from '../../types/prep-review.types';
import { AppModal } from '@/shared/components/AppModal';
import { AppDatePicker } from '@/shared/components/AppDatePicker';
import { AppSelect } from '@/shared/components/AppSelect';
import { Button } from '@/shared/components/Button';
import { prepReviewService } from '../../services/prep-review-service';
import { 
  Calculator, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
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
  // Exclude Department Manager from operational preparation/review pool
  const operationalStaff = useMemo(() => {
    const list = staff.filter((s) => s.role !== 'PREP_MANAGER');
    return list.length >= 2 ? list : staff;
  }, [staff]);

  const [selectedPreparerId, setSelectedPreparerId] = useState<string>('');
  const [selectedReviewerId, setSelectedReviewerId] = useState<string>('');
  const [targetSla, setTargetSla] = useState<string>('24h');
  
  // Interactive Target Date & Time States
  const [targetDueDate, setTargetDueDate] = useState<Date>(new Date(Date.now() + 86400000));
  const [targetDueTime, setTargetDueTime] = useState<string>('05:00 PM');

  const [prepNotes, setPrepNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-select initial pair (pick 2 different operational staff with lowest caseload)
  useEffect(() => {
    if (isOpen && operationalStaff.length >= 2) {
      const sorted = [...operationalStaff].sort((a, b) => (Number(a.activeCaseload) || 0) - (Number(b.activeCaseload) || 0));
      setSelectedPreparerId(sorted[0].id);
      setSelectedReviewerId(sorted[1].id);
    }
  }, [isOpen, operationalStaff]);

  // Quick 1-Click Auto-Pair
  const handleAutoPair = () => {
    if (operationalStaff.length < 2) {
      toast.error('At least 2 staff members are required to form a pair');
      return;
    }
    const sorted = [...operationalStaff].sort((a, b) => (Number(a.activeCaseload) || 0) - (Number(b.activeCaseload) || 0));
    setSelectedPreparerId(sorted[0].id);
    setSelectedReviewerId(sorted[1].id);
    toast.success('Auto-paired least loaded Preparer & Reviewer! ⚡');
  };

  const isFourEyesViolation = selectedPreparerId && selectedReviewerId && selectedPreparerId === selectedReviewerId;

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
    if (isFourEyesViolation) {
      toast.error('4-Eyes Principle: The same staff member cannot prepare and review the same return.');
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
      width="860px"
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
              <span className="text-[10px] text-slate-400 font-medium">{operationalStaff.length} Staff Available</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {operationalStaff.map((member) => {
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
                      <div>
                        <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <span>{member.name}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 inline" />}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {member.roleLabel} • <span className="font-bold text-slate-700">{load} Active Returns</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      {isAlsoReviewer ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                          Reviewer
                        </span>
                      ) : (
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {isSelected ? 'Selected' : 'Assign'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
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
              <span className="text-[10px] text-slate-400 font-medium">{operationalStaff.length} Staff Available</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {operationalStaff.map((member) => {
                const isSelected = selectedReviewerId === member.id;
                const isPreparer = selectedPreparerId === member.id;
                const load = Number(member.activeCaseload) || 0;

                return (
                  <div
                    key={`rev-${member.id}`}
                    onClick={() => {
                      if (!isPreparer) {
                        setSelectedReviewerId(member.id);
                      }
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50/50 shadow-xs'
                        : isPreparer
                        ? 'border-slate-100 bg-slate-50/40 opacity-60 cursor-not-allowed'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {(member.name || member.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <span>{member.name}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 inline" />}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {member.roleLabel} • <span className="font-bold text-slate-700">{load} Active Returns</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      {isPreparer ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200" title="Cannot review own prepared file">
                          Preparer (Disabled)
                        </span>
                      ) : (
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${
                          isSelected
                            ? 'bg-purple-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {isSelected ? 'Selected' : 'Assign'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4-Eyes Compliance Indicator */}
        {isFourEyesViolation ? (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span><strong>4-Eyes Principle:</strong> The same staff member cannot prepare and review the same return. Please select a different Reviewer.</span>
          </div>
        ) : selectedPreparerId && selectedReviewerId ? (
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
              <span>
                <strong>Pair Confirmed:</strong> {staff.find((s) => s.id === selectedPreparerId)?.name} (Drafts) &rarr; {staff.find((s) => s.id === selectedReviewerId)?.name} (QA Audit)
              </span>
            </div>
            <span className="text-[10px] font-bold text-[#16A34A] bg-white px-2 py-0.5 rounded border border-emerald-200">
              4-Eyes Validated ✓
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

            {/* Fast Presets */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-medium mr-1">Presets:</span>
              <button
                type="button"
                onClick={() => {
                  setTargetSla('24h');
                  setTargetDueDate(new Date(Date.now() + 86400000));
                  setTargetDueTime('05:00 PM');
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  targetSla === '24h' ? 'bg-[#16A34A] text-white shadow-2xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                24 Hours (Standard)
              </button>
              <button
                type="button"
                onClick={() => {
                  setTargetSla('48h');
                  setTargetDueDate(new Date(Date.now() + 172800000));
                  setTargetDueTime('05:00 PM');
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  targetSla === '48h' ? 'bg-[#16A34A] text-white shadow-2xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                48 Hours
              </button>
              <button
                type="button"
                onClick={() => {
                  setTargetSla('urgent');
                  setTargetDueDate(new Date());
                  setTargetDueTime('09:00 PM');
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  targetSla === 'urgent' ? 'bg-rose-600 text-white shadow-2xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Same-Day Urgent
              </button>
            </div>
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
            disabled={isFourEyesViolation || !selectedPreparerId || !selectedReviewerId || isSubmitting}
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
