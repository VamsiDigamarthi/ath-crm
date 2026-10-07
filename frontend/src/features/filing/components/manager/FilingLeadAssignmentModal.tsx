import React, { useState, useMemo } from 'react';
import { AppModal } from '@/shared/components/AppModal';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
import { Button } from '@/shared/components/Button';
import { Zap, UserCheck, Check } from 'lucide-react';
import type { FilingStaffMember, FilingLeadItem } from '../../types/filing.types';

export interface FilingLeadAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLeads: FilingLeadItem[];
  staffList: FilingStaffMember[];
  onConfirmDirectAssign: (agentId: string) => void;
  onConfirmRoundRobin: () => void;
  isLoading?: boolean;
}

export const FilingLeadAssignmentModal: React.FC<FilingLeadAssignmentModalProps> = ({
  isOpen,
  onClose,
  selectedLeads,
  staffList,
  onConfirmDirectAssign,
  onConfirmRoundRobin,
  isLoading = false,
}) => {
  const [assignmentMode, setAssignmentMode] = useState<'ROUND_ROBIN' | 'DIRECT'>('ROUND_ROBIN');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [searchAgent, setSearchAgent] = useState<string>('');

  const leadCount = selectedLeads.length;

  // Filing Specialists (FILE_OP_AGENT) based on orgRoles / systemRoles
  const specialists = useMemo(() => {
    return staffList.filter((s: any) => {
      const sysRoles: string[] = Array.isArray(s.systemRoles) ? s.systemRoles : [];
      return s.role === 'FILE_OP_AGENT' || sysRoles.includes('FILE_OP_AGENT');
    });
  }, [staffList]);

  const filteredSpecialists = useMemo(() => {
    const q = searchAgent.toLowerCase().trim();
    if (!q) return specialists;
    return specialists.filter((member: any) => {
      const name = (member.name || member.fullName || `${member.firstName || ''} ${member.lastName || ''}`).toLowerCase();
      const email = (member.email || '').toLowerCase();
      const mobile = (member.mobile || member.phone || '').toLowerCase();
      return name.includes(q) || email.includes(q) || mobile.includes(q);
    });
  }, [specialists, searchAgent]);

  const handleConfirm = () => {
    if (assignmentMode === 'ROUND_ROBIN') {
      onConfirmRoundRobin();
    } else {
      if (!selectedAgentId) return;
      onConfirmDirectAssign(selectedAgentId);
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
          <Button variant="outline" size="md" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            size="md"
            onClick={handleConfirm}
            disabled={isLoading || (assignmentMode === 'DIRECT' && !selectedAgentId)}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold"
          >
            {isLoading ? 'Assigning...' : 'Assign'}
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
              Returns are split evenly across {specialists.length} filing{' '}
              {specialists.length === 1 ? 'specialist' : 'specialists'} (~{Math.ceil(leadCount / (specialists.length || 1))} each).
              Managers and team leads are excluded.
            </p>
            <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200 divide-y divide-slate-100">
              {specialists.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-400">No active filing specialists</div>
              ) : (
                specialists.map((member: any) => {
                  const displayName = member.name || member.fullName || `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email;
                  return (
                    <div key={member.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">{displayName}</div>
                        <div className="text-xs text-slate-500 truncate">
                          {member.email}
                          {member.mobile || member.phone ? ` · ${member.mobile || member.phone}` : ''}
                          {' · Filing specialist'}
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
              placeholder="Search specialist by name, email, or phone..."
              debounceMs={200}
            />

            <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200 divide-y divide-slate-100">
              {filteredSpecialists.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-400">No filing specialists match your search</div>
              ) : (
                filteredSpecialists.map((member: any) => {
                  const isSelected = selectedAgentId === member.id;
                  const displayName = member.name || member.fullName || `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email;
                  return (
                    <div
                      key={member.id}
                      onClick={() => setSelectedAgentId(member.id)}
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
                            {' · Filing specialist'}
                          </div>
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
      </div>
    </AppModal>
  );
};
