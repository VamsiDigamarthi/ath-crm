import React, { useState } from 'react';
import { AppModal } from '@/shared/components/AppModal';
import { Button } from '@/shared/components/Button';
import { 
  Zap, 
  UserCheck, 
  Search, 
  Sparkles 
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
  const [assignmentMode, setAssignmentMode] = useState<'DIRECT' | 'ROUND_ROBIN'>('ROUND_ROBIN');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [searchAgent, setSearchAgent] = useState<string>('');

  const leadCount = selectedLeads.length;
  const filteredAgents = agents.filter((a) =>
    a.email.toLowerCase().includes(searchAgent.toLowerCase()) ||
    a.role.toLowerCase().includes(searchAgent.toLowerCase())
  );

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
            Agent
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
            Assign {leadCount} selected {leadCount === 1 ? 'lead' : 'leads'} to Documenter staff members
          </p>
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-slate-500 font-medium">
            {assignmentMode === 'ROUND_ROBIN' ? (
              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
                Auto-balanced across {agents.length} staff
              </span>
            ) : (
              <span>Select an agent to complete assignment</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
              className="border-slate-200 text-slate-700"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirm}
              disabled={isLoading || (assignmentMode === 'DIRECT' && !selectedAgentId)}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white font-bold px-4"
            >
              {isLoading ? 'Processing...' : 'Confirm Assignment'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Assignment Mode Tabs */}
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
            Auto Round-Robin (Equal Split)
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
            Direct Staff Selection
          </button>
        </div>

        {/* Mode 1: Auto Round-Robin Preview */}
        {assignmentMode === 'ROUND_ROBIN' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 leading-relaxed">
              <div className="font-bold flex items-center gap-1.5 mb-1 text-emerald-900">
                <Sparkles className="w-4 h-4 text-[#16A34A]" />
                Automated Fair Load Balancing
              </div>
              The system will sequentially distribute <strong>{leadCount} leads</strong> evenly across all <strong>{agents.length} active Documenter staff members</strong>. Each staff member will receive approximately <strong>{Math.ceil(leadCount / (agents.length || 1))} leads</strong>.
            </div>

            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Participating Staff in Pool ({agents.length})
            </div>

            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
              {agents.map((agent) => (
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
                        {agent.mobile}
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

        {/* Mode 2: Direct Staff Selection */}
        {assignmentMode === 'DIRECT' && (
          <div className="space-y-3">
            {/* Search staff */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search staff by email or role..."
                value={searchAgent}
                onChange={(e) => setSearchAgent(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#16A34A] bg-white font-medium"
              />
            </div>

            {/* Staff list */}
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {filteredAgents.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No staff members match your search
                </div>
              ) : (
                filteredAgents.map((agent) => {
                  const isSelected = selectedAgentId === agent.id;
                  return (
                    <div
                      key={agent.id}
                      onClick={() => setSelectedAgentId(agent.id)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
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
                            {agent.mobile}
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
