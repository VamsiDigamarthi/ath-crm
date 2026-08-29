import React, { useState, useMemo } from 'react';
import { AppModal } from '@/shared/components/AppModal';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
import { Button } from '@/shared/components/Button';
import { 
  Zap, 
  UserCheck, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
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
  const [assignmentMode, setAssignmentMode] = useState<'DIRECT' | 'ROUND_ROBIN'>('DIRECT');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [searchAgent, setSearchAgent] = useState<string>('');

  const leadCount = selectedLeads.length;

  const specialists = useMemo(() => {
    return staffList.filter((s) => s.role === 'FILE_OP_AGENT' || !s.role);
  }, [staffList]);

  const filteredSpecialists = useMemo(() => {
    return specialists.filter((member) => {
      const q = searchAgent.toLowerCase();
      return (
        member.name.toLowerCase().includes(q) ||
        member.email.toLowerCase().includes(q)
      );
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
      className="max-w-2xl"
      title={
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Distribute &amp; Assign Filing Returns
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Assign {leadCount} selected {leadCount === 1 ? 'return' : 'returns'} to Filing Specialists (CPAs)
          </p>
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-slate-500 font-medium">
            {assignmentMode === 'ROUND_ROBIN' ? (
              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
                Auto-balanced across {specialists.length} Filing Specialists
              </span>
            ) : (
              <span>Select a filing specialist to assign</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
              className="border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirm}
              disabled={isLoading || (assignmentMode === 'DIRECT' && !selectedAgentId)}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold shadow-xs cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Assigning...' : assignmentMode === 'ROUND_ROBIN' ? 'Execute Round-Robin' : 'Assign Return(s)'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 py-1">
        {/* Mode Selector Tabs */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => setAssignmentMode('DIRECT')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              assignmentMode === 'DIRECT'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Direct Specialist Assignment</span>
          </button>
          <button
            type="button"
            onClick={() => setAssignmentMode('ROUND_ROBIN')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              assignmentMode === 'ROUND_ROBIN'
                ? 'bg-white text-[#16A34A] shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>1-Click Auto Round-Robin</span>
          </button>
        </div>

        {assignmentMode === 'ROUND_ROBIN' ? (
          <div className="p-5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#16A34A] flex items-center justify-center mx-auto">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-emerald-950">
              Balanced Caseload Distribution
            </h4>
            <p className="text-xs text-emerald-800/80 max-w-md mx-auto leading-relaxed">
              The algorithm will evenly allocate {leadCount} return(s) to active filing specialists with the lowest active caseload.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AppSearchInput
              value={searchAgent}
              onChange={setSearchAgent}
              placeholder="Search specialist by name or email..."
            />

            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 rounded-xl border border-slate-200">
              {filteredSpecialists.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No specialists found matching your search.
                </div>
              ) : (
                filteredSpecialists.map((rep) => {
                  const isSelected = selectedAgentId === rep.id;
                  return (
                    <div
                      key={rep.id}
                      onClick={() => setSelectedAgentId(rep.id)}
                      className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected ? 'bg-emerald-50/80' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#16A34A] font-bold text-xs flex items-center justify-center">
                          {rep.name[0] || 'F'}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                            <span>{rep.name}</span>
                            {rep.acceptedCount > 0 && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                                {rep.acceptedCount} Accepted
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">{rep.email}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[11px] font-bold text-slate-700">
                            {rep.activeCaseload} Active
                          </span>
                          <div className="text-[10px] text-slate-400">Caseload</div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-[#16A34A] bg-[#16A34A] text-white' : 'border-slate-300'
                        }`}>
                          {isSelected && <CheckCircle2 className="w-3 h-3" />}
                        </div>
                      </div>
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
