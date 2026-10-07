import React, { useState, useMemo } from 'react';
import { AppModal } from '@/shared/components/AppModal';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
import { Button } from '@/shared/components/Button';
import { Zap, UserCheck, Check } from 'lucide-react';
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
  const [assignmentMode, setAssignmentMode] = useState<'ROUND_ROBIN' | 'DIRECT'>('ROUND_ROBIN');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [searchAgent, setSearchAgent] = useState<string>('');

  const leadCount = selectedLeads.length;

  // Frontline Sales Closers (SALES_AGENT) based on orgRoles / systemRoles
  const closers = useMemo(() => {
    return salesReps.filter((r: any) => {
      const sysRoles: string[] = Array.isArray(r.systemRoles) ? r.systemRoles : [];
      return r.role === 'SALES_AGENT' || sysRoles.includes('SALES_AGENT');
    });
  }, [salesReps]);

  // Search filtered frontline closers
  const filteredClosers = useMemo(() => {
    const q = searchAgent.toLowerCase().trim();
    if (!q) return closers;
    return closers.filter((rep: any) => {
      const name = (rep.name || rep.fullName || `${rep.firstName || ''} ${rep.lastName || ''}`).toLowerCase();
      const email = (rep.email || '').toLowerCase();
      const mobile = (rep.mobile || rep.phone || '').toLowerCase();
      return name.includes(q) || email.includes(q) || mobile.includes(q);
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
              Leads are split evenly across {closers.length} sales{' '}
              {closers.length === 1 ? 'closer' : 'closers'} (~{Math.ceil(leadCount / (closers.length || 1))} each).
              Managers and team leads are excluded.
            </p>
            <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200 divide-y divide-slate-100">
              {closers.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-400">No active sales closers</div>
              ) : (
                closers.map((rep: any) => {
                  const displayName = rep.name || rep.fullName || `${rep.firstName || ''} ${rep.lastName || ''}`.trim() || rep.email;
                  return (
                    <div key={rep.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">{displayName}</div>
                        <div className="text-xs text-slate-500 truncate">
                          {rep.email}
                          {rep.mobile || rep.phone ? ` · ${rep.mobile || rep.phone}` : ''}
                          {' · Sales closer'}
                        </div>
                      </div>
                      <span className="text-xs text-slate-500 shrink-0">{rep.activeLeads || 0} active</span>
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
              placeholder="Search closer by name, email, or phone..."
              debounceMs={200}
            />

            <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200 divide-y divide-slate-100">
              {filteredClosers.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-400">No sales closers match your search</div>
              ) : (
                filteredClosers.map((rep: any) => {
                  const isSelected = selectedAgentId === rep.id;
                  const displayName = rep.name || rep.fullName || `${rep.firstName || ''} ${rep.lastName || ''}`.trim() || rep.email;
                  return (
                    <div
                      key={rep.id}
                      onClick={() => setSelectedAgentId(rep.id)}
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
                            {rep.email}
                            {rep.mobile || rep.phone ? ` · ${rep.mobile || rep.phone}` : ''}
                            {' · Sales closer'}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-slate-500 shrink-0">{rep.activeLeads || 0} active</span>
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
