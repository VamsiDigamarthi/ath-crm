import React, { useState, useMemo } from 'react';
import { AppModal } from '@/shared/components/AppModal';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
import { Button } from '@/shared/components/Button';
import { 
  Zap, 
  UserCheck, 
  Sparkles,
  Headphones,
  Users,
  DollarSign,
  Check
} from 'lucide-react';
import type { DocumenterAgentItem, DocumenterLeadItem } from '../types/documenter.types';

export interface LeadAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLeads: DocumenterLeadItem[];
  agents: DocumenterAgentItem[];
  onConfirmDirectAssign: (agentId: string, options?: { alsoAssignAsSales?: boolean }) => void;
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
  const [alsoAssignAsSales, setAlsoAssignAsSales] = useState<boolean>(false);
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

  // Filter for frontline Documenter Calling Agents (DOC_AGENT) and Sales Closers (SALES_AGENT)
  const hasSalesAgents = useMemo(() => agents.some((a) => a.role === 'SALES_AGENT'), [agents]);

  const callingAgents = useMemo(() => {
    return agents.filter((a) => a.role === 'DOC_AGENT' || a.role === 'SALES_AGENT');
  }, [agents]);

  const selectedAgent = useMemo(() => {
    return callingAgents.find((a) => a.id === selectedAgentId);
  }, [callingAgents, selectedAgentId]);

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
      onConfirmDirectAssign(selectedAgentId, { alsoAssignAsSales });
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
              {hasSalesAgents ? 'Calling Agents & Closers' : 'Calling Agents Only'}
            </span>
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Assign {leadCount} selected {leadCount === 1 ? 'lead' : 'leads'} to {hasSalesAgents ? 'Calling Agents or Sales Closers' : 'Documenter Calling Agents'}
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
            ) : selectedAgent ? (
              <span className="flex items-center gap-1.5 text-slate-700 font-bold flex-wrap">
                <span className="text-slate-500 font-medium">Assigning to:</span>
                <span className="text-emerald-700 font-bold">{selectedAgent.email}</span>
                {alsoAssignAsSales && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1 animate-in fade-in">
                    <Sparkles className="w-2.5 h-2.5 text-indigo-600" />
                    + Sales Closer
                  </span>
                )}
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
              className={`text-white font-bold text-xs px-4 shadow-sm cursor-pointer transition-all ${
                alsoAssignAsSales && assignmentMode === 'DIRECT'
                  ? 'bg-gradient-to-r from-[#16A34A] to-indigo-600 hover:from-[#15803D] hover:to-indigo-700'
                  : 'bg-[#16A34A] hover:bg-[#15803D]'
              }`}
            >
              {isLoading 
                ? 'Processing...' 
                : alsoAssignAsSales && assignmentMode === 'DIRECT'
                  ? 'Confirm Dual Assignment (Doc + Sales)'
                  : 'Confirm Assignment'
              }
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5 font-sans">
        {/* Previous Agent Recommendation Banner */}
        {selectedLeads.length === 1 && selectedLeads[0].previousDocAgent && (
          <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-slate-900 block truncate">
                  Previous Tax Year (TY{selectedLeads[0].previousDocAgent.taxYear}) Handled by:
                </span>
                <span className="text-emerald-700 font-bold truncate block">
                  {selectedLeads[0].previousDocAgent.name || (selectedLeads[0].previousDocAgent.firstName ? `${selectedLeads[0].previousDocAgent.firstName} ${selectedLeads[0].previousDocAgent.lastName || ''}`.trim() : selectedLeads[0].previousDocAgent.email)}
                </span>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setSelectedAgentId(selectedLeads[0].previousDocAgent!.id);
                setAssignmentMode('DIRECT');
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-2xs"
            >
              Assign to {(selectedLeads[0].previousDocAgent.name || selectedLeads[0].previousDocAgent.firstName)?.split(' ')[0] || 'Previous Agent'}
            </Button>
          </div>
        )}

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
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            agent.role === 'SALES_AGENT'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-emerald-50 text-[#16A34A] border border-emerald-200'
                          }`}>
                            {agent.role === 'SALES_AGENT' ? 'Sales Closer' : 'Calling Agent'}
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
          <div className="space-y-3.5">
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
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
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
                      className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all ${
                        isCurrentlyAssigned
                          ? 'opacity-40 bg-slate-100/80 border-slate-200 cursor-not-allowed select-none'
                          : isSelected
                          ? 'bg-emerald-50/90 border-[#16A34A] ring-2 ring-[#16A34A]/20 shadow-xs cursor-pointer'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                            isCurrentlyAssigned
                              ? 'border-slate-300 bg-slate-200'
                              : isSelected
                              ? 'border-[#16A34A] bg-[#16A34A]'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && !isCurrentlyAssigned && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-emerald-100/80 border border-emerald-200 text-[#16A34A] font-bold text-xs flex items-center justify-center shrink-0">
                          {agent.email[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5 flex-wrap">
                            <span className="truncate max-w-[150px] sm:max-w-[200px]">{agent.email}</span>
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border shrink-0 ${
                              agent.role === 'SALES_AGENT'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-emerald-50 text-[#16A34A] border border-emerald-200'
                            }`}>
                              {agent.role === 'SALES_AGENT' ? 'Sales Closer' : 'Calling Agent'}
                            </span>
                            {isCurrentlyAssigned && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-200 text-slate-600 border border-slate-300 shrink-0">
                                Current Owner
                              </span>
                            )}
                            {isSelected && alsoAssignAsSales && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-0.5 shrink-0 animate-in fade-in">
                                <DollarSign className="w-2.5 h-2.5" />
                                Dual Doc + Sales
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {agent.mobile || 'No mobile'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-2">
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

            {/* DUAL-ROLE OPTION (Documenter Agent + Sales Agent Option) */}
            {selectedAgentId && (
              <div 
                onClick={() => setAlsoAssignAsSales(!alsoAssignAsSales)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none animate-in fade-in slide-in-from-top-1 duration-200 ${
                  alsoAssignAsSales
                    ? 'bg-gradient-to-r from-indigo-50/90 via-emerald-50/40 to-indigo-50/60 border-indigo-300 ring-2 ring-indigo-200 shadow-xs'
                    : 'bg-slate-50/90 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="pt-0.5">
                      <input
                        type="checkbox"
                        checked={alsoAssignAsSales}
                        onChange={(e) => setAlsoAssignAsSales(e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900">
                          Also Assign as Sales Closer (Dual-Role)?
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border transition-colors ${
                          alsoAssignAsSales 
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' 
                            : 'bg-slate-200 text-slate-600 border-slate-300'
                        }`}>
                          Doc + Sales
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Assign <strong>{selectedAgent?.email || 'this agent'}</strong> as both the <strong>Documenter Intake Agent</strong> and <strong>Sales Closer</strong> for {leadCount === 1 ? 'this lead' : `these ${leadCount} leads`}.
                      </p>
                      {alsoAssignAsSales && (
                        <div className="mt-2 pt-2 border-t border-indigo-100/80 flex items-center gap-1.5 text-[11px] text-indigo-900 font-semibold">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>Lead will stay assigned to {selectedAgent?.email} when progressing to Sales Pitch Queue.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Visual Toggle Switch */}
                  <div className="shrink-0 pt-0.5">
                    <div 
                      className={`w-9 h-5 rounded-full transition-colors flex items-center p-0.5 cursor-pointer ${
                        alsoAssignAsSales ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-white shadow-sm transition-all" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppModal>
  );
};
