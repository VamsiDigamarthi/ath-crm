import React, { useState, useMemo } from 'react';
import { AppModal } from '@/shared/components/AppModal';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
import { Button } from '@/shared/components/Button';
import { 
  Zap, 
  UserCheck, 
  Sparkles,
  Headphones,
  Users
} from 'lucide-react';
import type { DocumenterAgentItem, DocumenterLeadItem } from '../types/documenter.types';

export interface LeadAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLeads: DocumenterLeadItem[];
  agents: DocumenterAgentItem[];
  onConfirmDirectAssign: (agentId: string) => void;
  onConfirmRoundRobin: () => void;
  isLoading?: boolean;
}

export const LeadAssignmentModal: React.FC<LeadAssignmentModalProps> = ({
  isOpen,
  onClose,
  selectedLeads,
  agents,
  onConfirmDirectAssign,
  onConfirmRoundRobin,
  isLoading = false,
}) => {
  const [assignmentMode, setAssignmentMode] = useState<'ROUND_ROBIN' | 'DIRECT'>('ROUND_ROBIN');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [searchAgent, setSearchAgent] = useState<string>('');

  const leadCount = selectedLeads.length;

  // Find agent IDs that already own any of the selected leads
  const currentlyAssignedAgentIds = useMemo(() => {
    if (!selectedLeads || selectedLeads.length === 0) return new Set<string>();
    const ids = new Set<string>();
    selectedLeads.forEach((lead) => {
      const agentId = lead.assignedDocAgentId || (lead.assignedDocAgent && typeof lead.assignedDocAgent === 'object' ? lead.assignedDocAgent.id : undefined);
      if (agentId && typeof agentId === 'string') {
        ids.add(agentId);
      }
    });
    return ids;
  }, [selectedLeads]);

  // Exclusively filter for frontline Documenter Calling Agents (DOC_AGENT)
  // Managers (DOC_MANAGER) and Team Leads (DOC_TEAM_LEAD) are strictly excluded from lead intake queues
  const callingAgents = useMemo(() => {
    return agents.filter((a) => a.role === 'DOC_AGENT');
  }, [agents]);

  // Filter calling agents for search queries in Direct Selection mode
  const filteredAgents = useMemo(() => {
    const query = searchAgent.toLowerCase().trim();
    if (!query) return callingAgents;
    return callingAgents.filter((a) => {
      return (
        a.email.toLowerCase().includes(query) ||
        (a.mobile && a.mobile.includes(query))
      );
    });
  }, [callingAgents, searchAgent]);

  const handleConfirm = () => {
    if (assignmentMode === 'ROUND_ROBIN') {
      onConfirmRoundRobin();
    } else {
      if (!selectedAgentId || currentlyAssignedAgentIds.has(selectedAgentId)) return;
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
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Distribute &amp; Assign Tax Leads</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-[#16A34A] border border-emerald-200">
              Calling Agents Only
            </span>
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Assign {leadCount} selected {leadCount === 1 ? 'lead' : 'leads'} to Documenter Calling Agents
          </p>
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-slate-500 font-medium">
            {assignmentMode === 'ROUND_ROBIN' ? (
              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
                Auto-balanced across {callingAgents.length} Calling Agents
              </span>
            ) : (
              <span>Select a calling agent to assign</span>
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
              disabled={isLoading || (assignmentMode === 'DIRECT' && (!selectedAgentId || currentlyAssignedAgentIds.has(selectedAgentId)))}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs px-4 shadow-sm cursor-pointer"
            >
              {isLoading ? 'Processing...' : 'Confirm Assignment'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5 font-sans">
        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setAssignmentMode('ROUND_ROBIN')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              assignmentMode === 'ROUND_ROBIN'
                ? 'bg-white text-[#16A34A] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500 fill-current" />
            Auto Round-Robin ({callingAgents.length} Agents)
          </button>
          <button
            type="button"
            onClick={() => setAssignmentMode('DIRECT')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              assignmentMode === 'DIRECT'
                ? 'bg-white text-[#16A34A] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4 text-blue-500" />
            Direct Agent Selection ({callingAgents.length})
          </button>
        </div>

        {/* Mode 1: Auto Round-Robin Preview (Strictly Calling Agents) */}
        {assignmentMode === 'ROUND_ROBIN' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 leading-relaxed">
              <div className="font-bold flex items-center gap-1.5 mb-1 text-emerald-900">
                <Sparkles className="w-4 h-4 text-[#16A34A]" />
                Fair Workload Balancing for Calling Agents
              </div>
              The system will sequentially distribute <strong>{leadCount} leads</strong> equally across all <strong>{callingAgents.length} active Documenter Calling Agents</strong> (~{Math.ceil(leadCount / (callingAgents.length || 1))} leads each). Managers and Team Leads are excluded from lead queues.
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-700 tracking-wide flex items-center gap-1.5">
                <Headphones className="w-3.5 h-3.5 text-[#16A34A]" />
                Active Calling Agents in Round-Robin Pool ({callingAgents.length})
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Managers &amp; TLs excluded</span>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
              {callingAgents.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No active calling agents found
                </div>
              ) : (
                callingAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 text-[#16A34A] font-bold text-xs flex items-center justify-center">
                        {agent.email[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                          <span>{agent.email}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
                            Calling Agent
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {agent.mobile || 'No phone'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {agent.activeLoad} active leads
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Mode 2: Direct Calling Agent Selection (DOC_AGENT Only) */}
        {assignmentMode === 'DIRECT' && (
          <div className="space-y-3">
            {/* Search Input using shared AppSearchInput */}
            <AppSearchInput
              value={searchAgent}
              onChange={setSearchAgent}
              placeholder="Search calling agents by email or mobile..."
              debounceMs={200}
            />

            {/* Calling Agent Header Indicator */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Users className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>Select from {callingAgents.length} Calling Agents</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                DOC_AGENT Only
              </span>
            </div>

            {/* Calling Agents List */}
            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
              {filteredAgents.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No calling agents match your search
                </div>
              ) : (
                filteredAgents.map((agent) => {
                  const isCurrentlyAssigned = currentlyAssignedAgentIds.has(agent.id);
                  const isSelected = selectedAgentId === agent.id;
                  return (
                    <div
                      key={agent.id}
                      onClick={() => {
                        if (isCurrentlyAssigned) return;
                        setSelectedAgentId(agent.id);
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        isCurrentlyAssigned
                          ? 'opacity-40 bg-slate-100/80 border-slate-200 cursor-not-allowed select-none'
                          : isSelected
                          ? 'bg-emerald-50/80 border-[#16A34A] shadow-xs cursor-pointer'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isCurrentlyAssigned
                              ? 'border-slate-300 bg-slate-200'
                              : isSelected
                              ? 'border-[#16A34A] bg-[#16A34A]'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && !isCurrentlyAssigned && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-emerald-100/60 border border-emerald-200 text-[#16A34A] font-bold text-xs flex items-center justify-center">
                          {agent.email[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                            <span>{agent.email}</span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
                              Calling Agent
                            </span>
                            {isCurrentlyAssigned && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-200 text-slate-600 border border-slate-300">
                                Current Owner
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {agent.mobile || 'No mobile'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="inline-block text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {agent.activeLoad} leads
                        </span>
                        <div className="text-[9px] text-slate-400 font-medium mt-0.5">
                          Current load
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
