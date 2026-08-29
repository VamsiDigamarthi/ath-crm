import React, { useState, useMemo } from 'react';
import { AppModal } from '@/shared/components/AppModal';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
import { Button } from '@/shared/components/Button';
import { 
  Zap, 
  UserCheck, 
  Sparkles,
  Headphones,
  CheckCircle2
} from 'lucide-react';
import type { SalesRepItem, SalesLeadItem } from '../../types/sales.types';

export interface SalesLeadAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLeads: SalesLeadItem[];
  salesReps: SalesRepItem[];
  onConfirmDirectAssign: (agentId: string) => void;
  onConfirmRoundRobin: () => void;
  isLoading?: boolean;
}

export const SalesLeadAssignmentModal: React.FC<SalesLeadAssignmentModalProps> = ({
  isOpen,
  onClose,
  selectedLeads,
  salesReps,
  onConfirmDirectAssign,
  onConfirmRoundRobin,
  isLoading = false,
}) => {
  const [assignmentMode, setAssignmentMode] = useState<'DIRECT' | 'ROUND_ROBIN'>('DIRECT');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [searchAgent, setSearchAgent] = useState<string>('');

  const leadCount = selectedLeads.length;

  // Strictly Frontline Sales Closers (SALES_AGENT only - Managers and Team Leads excluded)
  const closers = useMemo(() => {
    return salesReps.filter((r) => r.role === 'SALES_AGENT' || !r.role);
  }, [salesReps]);

  // Search filtered frontline closers
  const filteredClosers = useMemo(() => {
    return closers.filter((rep) => {
      const q = searchAgent.toLowerCase();
      return (
        rep.name.toLowerCase().includes(q) ||
        rep.email.toLowerCase().includes(q)
      );
    });
  }, [closers, searchAgent]);

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
            Distribute &amp; Assign Sales Leads
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Assign {leadCount} selected {leadCount === 1 ? 'lead' : 'leads'} to Frontline Sales Closers
          </p>
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-slate-500 font-medium">
            {assignmentMode === 'ROUND_ROBIN' ? (
              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
                Auto-balanced across {closers.length} Frontline Sales Closers
              </span>
            ) : (
              <span>Select a sales closer to assign</span>
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
              className="bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs px-4 shadow-sm cursor-pointer"
            >
              {isLoading ? 'Assigning...' : 'Confirm Assignment'}
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
            onClick={() => setAssignmentMode('DIRECT')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              assignmentMode === 'DIRECT'
                ? 'bg-white text-[#16A34A] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4 text-blue-500" />
            Direct Closer Selection ({closers.length})
          </button>
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
            Auto Round-Robin (Closers Pool)
          </button>
        </div>

        {/* Mode 1: Direct Closer Selection (Strictly Frontline Sales Agents) */}
        {assignmentMode === 'DIRECT' && (
          <div className="space-y-3">
            {/* Search Input */}
            <AppSearchInput
              value={searchAgent}
              onChange={setSearchAgent}
              placeholder="Search closer by name or email..."
              debounceMs={200}
            />

            {/* Subtitle / Counter */}
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                Available Sales Closers ({filteredClosers.length})
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Managers &amp; Team Leads excluded
              </span>
            </div>

            {/* Staff List */}
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {filteredClosers.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No sales closers match your search
                </div>
              ) : (
                filteredClosers.map((rep) => {
                  const isSelected = selectedAgentId === rep.id;
                  const initial = (rep.name?.[0] || rep.email?.[0] || 'C').toUpperCase();

                  return (
                    <div
                      key={rep.id}
                      onClick={() => setSelectedAgentId(rep.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs ${
                          isSelected
                            ? 'bg-[#16A34A] text-white'
                            : 'bg-gradient-to-br from-purple-100 to-purple-200 border border-purple-300 text-purple-800'
                        }`}>
                          {initial}
                        </div>
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                            <span>{rep.name}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
                              Sales Closer
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">{rep.email}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xs font-bold text-slate-800">{rep.activeLeads || 0} active</div>
                          <div className="text-[10px] text-slate-400 font-medium">{rep.dealsClosedToday || 0} closed</div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-[#16A34A] border-[#16A34A] text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Mode 2: Auto Round-Robin Preview (Strictly Frontline Sales Closers) */}
        {assignmentMode === 'ROUND_ROBIN' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 leading-relaxed">
              <div className="font-bold flex items-center gap-1.5 mb-1 text-emerald-900">
                <Sparkles className="w-4 h-4 text-[#16A34A]" />
                Fair Workload Balancing for Frontline Closers
              </div>
              The system will sequentially distribute <strong>{leadCount} leads</strong> equally across all <strong>{closers.length} active Sales Closers</strong> (~{Math.ceil(leadCount / (closers.length || 1))} leads each). Managers and Team Leads are excluded from calling queues.
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-700 tracking-wide flex items-center gap-1.5">
                <Headphones className="w-3.5 h-3.5 text-[#16A34A]" />
                Active Closers in Round-Robin Pool ({closers.length})
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Managers &amp; Team Leads excluded</span>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {closers.map((rep) => (
                <div
                  key={rep.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 text-[#16A34A] font-bold text-xs flex items-center justify-center">
                      {(rep.name?.[0] || rep.email?.[0] || 'C').toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">
                        {rep.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {rep.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
                      Sales Closer
                    </span>
                    <span className="text-[11px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {rep.activeLeads || 0} active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppModal>
  );
};
