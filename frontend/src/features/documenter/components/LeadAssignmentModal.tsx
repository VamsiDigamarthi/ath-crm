import React, { useState, useMemo } from 'react';
import { AppModal } from '@/shared/components/AppModal';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
import { Button } from '@/shared/components/Button';
import { Zap, UserCheck, Check } from 'lucide-react';
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

  // Frontline Calling Agents (DOC_AGENT) and Sales Closers (SALES_AGENT) based on orgRoles / systemRoles
  const callingAgents = useMemo(() => {
    if (!agents || agents.length === 0) return [];
    return agents.filter((a: any) => {
      const sysRoles: string[] = Array.isArray(a.systemRoles) ? a.systemRoles : [];
      return (
        a.role === 'DOC_AGENT' ||
        a.role === 'SALES_AGENT' ||
        sysRoles.includes('DOC_AGENT') ||
        sysRoles.includes('SALES_AGENT')
      );
    });
  }, [agents]);

  const selectedAgent = useMemo(() => {
    return callingAgents.find((a) => a.id === selectedAgentId);
  }, [callingAgents, selectedAgentId]);

  // Filter calling agents for search queries in Direct Selection mode
  const filteredAgents = useMemo(() => {
    const query = searchAgent.toLowerCase().trim();
    if (!query) return callingAgents;
    return callingAgents.filter((a: any) => {
      const name = (a.name || a.fullName || `${a.firstName || ''} ${a.lastName || ''}`).trim().toLowerCase();
      const email = (a.email || '').toLowerCase();
      const mobile = (a.mobile || a.phone || '').toLowerCase();
      return name.includes(query) || email.includes(query) || mobile.includes(query);
    });
  }, [callingAgents, searchAgent]);

  const handleConfirm = () => {
    if (assignmentMode === 'ROUND_ROBIN') {
      onConfirmRoundRobin();
    } else {
      if (!selectedAgentId) return;
      onConfirmDirectAssign(selectedAgentId, { alsoAssignAsSales });
    }
  };

  const roleLabel = (agent: any) => {
    const sysRoles: string[] = Array.isArray(agent?.systemRoles) ? agent.systemRoles : [];
    if (sysRoles.includes('DOC_AGENT') || agent?.role === 'DOC_AGENT') return 'Calling agent';
    if (sysRoles.includes('SALES_AGENT') || agent?.role === 'SALES_AGENT') return 'Sales closer';
    return 'Calling agent';
  };
  const previousAgent = selectedLeads.length === 1 ? selectedLeads[0].previousDocAgent : null;
  const previousAgentName = previousAgent
    ? previousAgent.name ||
      (previousAgent.firstName ? `${previousAgent.firstName} ${previousAgent.lastName || ''}`.trim() : previousAgent.email)
    : '';
  const isDualAssign = alsoAssignAsSales && assignmentMode === 'DIRECT';

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-xl"
      title="Assign leads"
      description={`${leadCount} ${leadCount === 1 ? 'lead' : 'leads'} selected`}
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="outline" size="md" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            size="md"
            onClick={handleConfirm}
            disabled={isLoading || (assignmentMode === 'DIRECT' && (!selectedAgentId || currentlyAssignedAgentIds.has(selectedAgentId)))}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold"
          >
            {isLoading ? 'Assigning...' : isDualAssign ? 'Assign (Doc + Sales)' : 'Assign'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 font-sans">
        {/* Previous year agent suggestion */}
        {previousAgent && (
          <div className="flex items-center justify-between gap-3 px-3.5 py-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-sm text-slate-600 min-w-0">
              TY{previousAgent.taxYear} handled by{' '}
              <span className="font-semibold text-slate-900">{previousAgentName}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedAgentId(previousAgent.id);
                setAssignmentMode('DIRECT');
              }}
              className="text-sm font-semibold text-[#16A34A] hover:text-[#15803D] shrink-0 cursor-pointer"
            >
              Assign to them
            </button>
          </div>
        )}

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
              Leads are split evenly across {callingAgents.length} calling{' '}
              {callingAgents.length === 1 ? 'agent' : 'agents'} (~{Math.ceil(leadCount / (callingAgents.length || 1))} each).
              Managers and team leads are excluded.
            </p>
            <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200 divide-y divide-slate-100">
              {callingAgents.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-400">No active calling agents</div>
              ) : (
                callingAgents.map((agent: any) => {
                  const displayName = agent.name || agent.fullName || `${agent.firstName || ''} ${agent.lastName || ''}`.trim() || agent.email;
                  return (
                    <div key={agent.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">{displayName}</div>
                        <div className="text-xs text-slate-500 truncate">
                          {agent.email}
                          {agent.mobile ? ` · ${agent.mobile}` : ''}
                          {` · ${roleLabel(agent)}`}
                        </div>
                      </div>
                      <span className="text-xs text-slate-500 shrink-0">{agent.activeLoad || 0} active</span>
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
              placeholder="Search agent by name, email, or phone..."
              debounceMs={200}
            />

            <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200 divide-y divide-slate-100">
              {filteredAgents.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-400">No agents match your search</div>
              ) : (
                filteredAgents.map((agent: any) => {
                  const isCurrentlyAssigned = currentlyAssignedAgentIds.has(agent.id);
                  const isSelected = selectedAgentId === agent.id;
                  const displayName = agent.name || agent.fullName || `${agent.firstName || ''} ${agent.lastName || ''}`.trim() || agent.email;
                  return (
                    <div
                      key={agent.id}
                      onClick={() => {
                        setSelectedAgentId(agent.id);
                      }}
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
                            {agent.email}
                            {agent.mobile ? ` · ${agent.mobile}` : ''}
                            {` · ${roleLabel(agent)}`}
                            {isCurrentlyAssigned ? ' · Current owner' : ''}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-slate-500 shrink-0">{agent.activeLoad || 0} active</span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Dual role option */}
            {selectedAgentId && (
              <label className="flex items-start gap-3 px-3.5 py-3 rounded-lg border border-slate-200 cursor-pointer select-none hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={alsoAssignAsSales}
                  onChange={(e) => setAlsoAssignAsSales(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 accent-[#16A34A] cursor-pointer"
                />
                <div>
                  <div className="text-sm font-medium text-slate-900">Also make them the sales closer</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {selectedAgent?.email || 'This agent'} keeps {leadCount === 1 ? 'this lead' : 'these leads'} through the sales pitch stage.
                  </div>
                </div>
              </label>
            )}
          </div>
        )}
      </div>
    </AppModal>
  );
};
