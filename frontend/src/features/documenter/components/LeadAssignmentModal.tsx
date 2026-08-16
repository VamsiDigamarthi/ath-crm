import React, { useState } from 'react';
import { AppModal } from '@/shared/components/AppModal';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
import { Button } from '@/shared/components/Button';
import { 
  Zap, 
  UserCheck, 
  Sparkles,
  Headphones
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
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'DOC_AGENT' | 'DOC_TEAM_LEAD' | 'DOC_MANAGER'>('ALL');

  const leadCount = selectedLeads.length;

  // Auto Round-Robin strictly applies to frontline Calling Agents (DOC_AGENT)
  const callingAgents = agents.filter((a) => a.role === 'DOC_AGENT');

  // Direct selection can target any staff member (Agents, TLs, Managers)
  const filteredStaff = agents.filter((a) => {
    const matchesSearch =
      a.email.toLowerCase().includes(searchAgent.toLowerCase()) ||
      a.role.toLowerCase().includes(searchAgent.toLowerCase()) ||
      (a.mobile && a.mobile.includes(searchAgent));
    const matchesRole = roleFilter === 'ALL' || a.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleConfirm = () => {
    if (assignmentMode === 'ROUND_ROBIN') {
      onConfirmRoundRobin();
    } else {
      if (!selectedAgentId) return;
      onConfirmDirectAssign(selectedAgentId);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'DOC_MANAGER':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            Manager
          </span>
        );
      case 'DOC_TEAM_LEAD':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Team Lead
          </span>
        );
      case 'DOC_AGENT':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
            Calling Agent
          </span>
        );
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
            Distribute & Assign Tax Leads
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Assign {leadCount} selected {leadCount === 1 ? 'lead' : 'leads'} to Documenter team members
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
              <span>Select a staff member to assign</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
              className="border-slate-200 text-slate-700 text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirm}
              disabled={isLoading || (assignmentMode === 'DIRECT' && !selectedAgentId)}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs px-4 shadow-sm"
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
            Auto Round-Robin (Agents Only)
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
            Direct Staff Selection (Any Role)
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
              The system will sequentially distribute <strong>{leadCount} leads</strong> equally across all <strong>{callingAgents.length} active Documenter Calling Agents</strong> (~{Math.ceil(leadCount / (callingAgents.length || 1))} leads each). Managers and Team Leads are excluded from cold-calling queues.
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-700 tracking-wide flex items-center gap-1.5">
                <Headphones className="w-3.5 h-3.5 text-[#16A34A]" />
                Active Calling Agents in Round-Robin Pool ({callingAgents.length})
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Managers & TLs excluded</span>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
              {callingAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 text-[#16A34A] font-bold text-xs flex items-center justify-center">
                      {agent.email[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">
                        {agent.email}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {agent.mobile || 'No phone'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getRoleBadge(agent.role)}
                    <span className="text-[11px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {agent.activeLoad} active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mode 2: Direct Staff Selection (Can choose TL, Manager, or Agent) */}
        {assignmentMode === 'DIRECT' && (
          <div className="space-y-3">
            {/* Search Input using shared AppSearchInput */}
            <AppSearchInput
              value={searchAgent}
              onChange={setSearchAgent}
              placeholder="Search staff by email, mobile, or role..."
              debounceMs={200}
            />

            {/* Role Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { id: 'ALL', label: `All Staff (${agents.length})` },
                { id: 'DOC_AGENT', label: `Agents (${callingAgents.length})` },
                { id: 'DOC_TEAM_LEAD', label: `Team Leads (${agents.filter((a) => a.role === 'DOC_TEAM_LEAD').length})` },
                { id: 'DOC_MANAGER', label: `Managers (${agents.filter((a) => a.role === 'DOC_MANAGER').length})` },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setRoleFilter(pill.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    roleFilter === pill.id
                      ? 'bg-[#16A34A] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Staff List */}
            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
              {filteredStaff.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No staff members match your search
                </div>
              ) : (
                filteredStaff.map((agent) => {
                  const isSelected = selectedAgentId === agent.id;
                  return (
                    <div
                      key={agent.id}
                      onClick={() => setSelectedAgentId(agent.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-emerald-50/80 border-[#16A34A] shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-[#16A34A] bg-[#16A34A]'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                          {agent.email[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                            <span>{agent.email}</span>
                            {getRoleBadge(agent.role)}
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
