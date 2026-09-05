import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  PhoneCall, 
  UserCheck 
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
import { SalesStageBadge } from '../common/SalesStageBadge';
import { SalesLeadAssignmentModal } from './SalesLeadAssignmentModal';
import type { SalesLeadItem, SalesRepItem } from '../../types/sales.types';

interface SalesManagerPipelineTableProps {
  leads: SalesLeadItem[];
  salesReps: SalesRepItem[];
  onAssignLead: (leadId: string, agentId: string) => void;
  onAutoRoundRobin: () => void;
}

export const SalesManagerPipelineTable: React.FC<SalesManagerPipelineTableProps> = ({
  leads,
  salesReps,
  onAssignLead,
  onAutoRoundRobin,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNASSIGNED' | 'PITCHING' | 'QUOTED' | 'PAID'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedLeadForAssign, setSelectedLeadForAssign] = useState<SalesLeadItem | null>(null);

  const counts = useMemo(() => {
    return {
      all: leads.length,
      unassigned: leads.filter((l) => !l.assignedSalesAgent).length,
      pitching: leads.filter((l) => l.currentStage === 'SALES_PITCH_QUEUE' || l.currentStage === 'SALES_PITCHING').length,
      quoted: leads.filter((l) => l.currentStage === 'QUOTATION_SENT' || l.currentStage === 'PAYMENT_PENDING').length,
      paid: leads.filter((l) => l.currentStage === 'PAID_AND_AUTHORIZED' || l.currentStage === 'FILING_QUEUE').length,
    };
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (activeTab === 'UNASSIGNED' && Boolean(lead.assignedSalesAgent)) return false;
      if (activeTab === 'PITCHING' && lead.currentStage !== 'SALES_PITCH_QUEUE' && lead.currentStage !== 'SALES_PITCHING') return false;
      if (activeTab === 'QUOTED' && lead.currentStage !== 'QUOTATION_SENT' && lead.currentStage !== 'PAYMENT_PENDING') return false;
      if (activeTab === 'PAID' && lead.currentStage !== 'PAID_AND_AUTHORIZED' && lead.currentStage !== 'FILING_QUEUE') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          lead.taxpayerName.toLowerCase().includes(q) ||
          lead.taxpayerEmail.toLowerCase().includes(q) ||
          lead.taxpayerPhone.toLowerCase().includes(q) ||
          lead.stateOfResidence.toLowerCase().includes(q) ||
          (lead.assignedSalesAgent?.name || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [leads, activeTab, searchQuery]);

  const handleOpenAssignModal = (lead?: SalesLeadItem) => {
    setSelectedLeadForAssign(lead || null);
    setIsAssignModalOpen(true);
  };

  const handleConfirmDirectAssign = (agentId: string) => {
    if (selectedLeadForAssign) {
      onAssignLead(selectedLeadForAssign.id, agentId);
    }
    setIsAssignModalOpen(false);
    setSelectedLeadForAssign(null);
  };

  const handleConfirmRoundRobin = () => {
    onAutoRoundRobin();
    setIsAssignModalOpen(false);
    setSelectedLeadForAssign(null);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs space-y-4 p-5 font-sans">
      {/* 1. Header with Title, Search & 1-Click Round Robin */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-slate-900">
            Sales &amp; Fee Quotation Caseload Pipeline
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Monitor QA-approved tax returns, assign closers, track payment checkouts &amp; e-sign authorizations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => handleOpenAssignModal()}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1-Click Auto Round-Robin</span>
          </Button>
        </div>
      </div>

      {/* 2. Filter Bar & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <AppSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by taxpayer, phone, closer..."
            debounceMs={300}
          />
        </div>

        {/* Dynamic Status Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Leads ({counts.all})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PITCHING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'PITCHING' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            In Pitch ({counts.pitching})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('QUOTED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'QUOTED' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Quoted ({counts.quoted})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PAID')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'PAID' ? 'bg-white text-[#16A34A] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Paid &amp; E-Signed ({counts.paid})
          </button>
        </div>
      </div>

      {/* 3. Pipeline Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3.5 px-4">Taxpayer Client</th>
              <th className="py-3.5 px-4">Location &amp; Visa</th>
              <th className="py-3.5 px-4">Certified 1040 Refund</th>
              <th className="py-3.5 px-4">Quoted Fee</th>
              <th className="py-3.5 px-4">Assigned Closer</th>
              <th className="py-3.5 px-4">Sales Stage</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                  No sales leads found matching criteria.
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/60 transition-colors">
                  {/* Taxpayer Client */}
                  <td className="py-3.5 px-4 font-sans">
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <span>{lead.taxpayerName}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-bold">
                        TY {lead.taxYear}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">{lead.taxpayerEmail}</div>
                    <div className="text-[10px] text-slate-400">{lead.taxpayerPhone}</div>
                  </td>

                  {/* Location & Visa */}
                  <td className="py-3.5 px-4">
                    <div className="text-slate-800 font-semibold text-xs">{lead.stateOfResidence}</div>
                    <div className="text-[10px] text-slate-500 font-medium">{lead.visaType}</div>
                  </td>

                  {/* Certified 1040 Refund */}
                  <td className="py-3.5 px-4">
                    {lead.federalRefund > 0 ? (
                      <span className="font-bold text-[#16A34A] text-xs bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-block">
                        +${lead.federalRefund.toLocaleString()} Fed Refund
                      </span>
                    ) : lead.balanceDue > 0 ? (
                      <span className="font-bold text-rose-600 text-xs bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 inline-block">
                        -${lead.balanceDue.toLocaleString()} Tax Due
                      </span>
                    ) : (
                      <span className="font-bold text-slate-500 text-xs bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200 inline-block">
                        $0 Liability
                      </span>
                    )}
                    <div className="text-[10px] text-slate-400 mt-0.5">QA by {lead.qaAuditorName}</div>
                  </td>

                  {/* Quoted Fee */}
                  <td className="py-3.5 px-4">
                    {lead.feeBreakdown?.totalServiceFee > 0 ? (
                      <>
                        <div className="font-bold text-slate-900 text-xs">
                          ${lead.feeBreakdown.totalServiceFee}
                        </div>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            lead.paymentStatus === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {lead.paymentStatus}
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="font-semibold text-slate-400 text-xs">
                          Pending Pitch
                        </div>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-500">
                          UNPAID
                        </span>
                      </>
                    )}
                  </td>

                  {/* Assigned Closer */}
                  <td className="py-3.5 px-4">
                    {(() => {
                      const isCompletedOrLocked =
                        (lead.paymentStatus === 'PAID' && lead.esignStatus === 'SIGNED') ||
                        lead.currentStage === 'PAID_AND_AUTHORIZED' ||
                        lead.currentStage === 'FILING_QUEUE' ||
                        lead.currentStage === 'FILING_IN_PROGRESS' ||
                        lead.currentStage === 'FILING_SUCCESS';

                      if (lead.assignedSalesAgent) {
                        return (
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center">
                              {lead.assignedSalesAgent.name.charAt(0)}
                            </div>
                            <span className="text-slate-800 font-medium text-xs">
                              {lead.assignedSalesAgent.name}
                            </span>
                          </div>
                        );
                      }

                      if (isCompletedOrLocked) {
                        return (
                          <span className="text-slate-400 font-medium text-[11px] bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            Completed
                          </span>
                        );
                      }

                      return (
                        <button
                          type="button"
                          onClick={() => handleOpenAssignModal(lead)}
                          className="text-amber-700 font-bold text-[11px] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                        >
                          Unassigned (Click)
                        </button>
                      );
                    })()}
                  </td>

                  {/* Stage Badge */}
                  <td className="py-3.5 px-4">
                    <SalesStageBadge stage={lead.currentStage} />
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    {(() => {
                      const isCompletedOrLocked =
                        (lead.paymentStatus === 'PAID' && lead.esignStatus === 'SIGNED') ||
                        lead.currentStage === 'PAID_AND_AUTHORIZED' ||
                        lead.currentStage === 'FILING_QUEUE' ||
                        lead.currentStage === 'FILING_IN_PROGRESS' ||
                        lead.currentStage === 'FILING_SUCCESS';

                      return (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isCompletedOrLocked}
                            title={isCompletedOrLocked ? "Lead is already Paid & E-Signed / Completed" : "Assign to closer"}
                            onClick={() => !isCompletedOrLocked && handleOpenAssignModal(lead)}
                            className={`border-slate-200 text-[11px] font-semibold flex items-center gap-1 cursor-pointer ${
                              isCompletedOrLocked
                                ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 pointer-events-none'
                                : 'bg-white hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <UserCheck className="w-3 h-3" />
                            <span>Assign</span>
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => navigate(`/sales/agent/pitch/${lead.id}`)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <PhoneCall className="w-3 h-3" />
                            <span>Pitch</span>
                          </Button>
                        </div>
                      );
                    })()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Rich Documenter-Standard Lead Assignment Modal */}
      <SalesLeadAssignmentModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedLeadForAssign(null);
        }}
        selectedLeads={
          selectedLeadForAssign
            ? [selectedLeadForAssign]
            : leads.filter(
                (l) =>
                  !l.assignedSalesAgent &&
                  l.currentStage !== 'PAID_AND_AUTHORIZED' &&
                  l.currentStage !== 'FILING_QUEUE' &&
                  l.currentStage !== 'FILING_IN_PROGRESS' &&
                  l.currentStage !== 'FILING_SUCCESS' &&
                  !(l.paymentStatus === 'PAID' && l.esignStatus === 'SIGNED')
              )
        }
        salesReps={salesReps}
        onConfirmDirectAssign={handleConfirmDirectAssign}
        onConfirmRoundRobin={handleConfirmRoundRobin}
      />
    </div>
  );
};
