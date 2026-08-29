import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhoneCall, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
import { SalesStageBadge } from '../common/SalesStageBadge';
import type { SalesLeadItem } from '../../types/sales.types';

interface SalesAgentQueueTableProps {
  leads: SalesLeadItem[];
}

export const SalesAgentQueueTable: React.FC<SalesAgentQueueTableProps> = ({ leads }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'ALL' | 'AWAITING' | 'QUOTED' | 'PAID'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const counts = useMemo(() => {
    return {
      all: leads.length,
      awaiting: leads.filter((l) => l.currentStage === 'SALES_PITCH_QUEUE' || l.currentStage === 'SALES_PITCHING').length,
      quoted: leads.filter((l) => l.currentStage === 'QUOTATION_SENT' || l.currentStage === 'PAYMENT_PENDING').length,
      paid: leads.filter((l) => l.currentStage === 'PAID_AND_AUTHORIZED' || l.currentStage === 'FILING_QUEUE').length,
    };
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (activeTab === 'AWAITING' && lead.currentStage !== 'SALES_PITCH_QUEUE' && lead.currentStage !== 'SALES_PITCHING') return false;
      if (activeTab === 'QUOTED' && lead.currentStage !== 'QUOTATION_SENT' && lead.currentStage !== 'PAYMENT_PENDING') return false;
      if (activeTab === 'PAID' && lead.currentStage !== 'PAID_AND_AUTHORIZED' && lead.currentStage !== 'FILING_QUEUE') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          lead.taxpayerName.toLowerCase().includes(q) ||
          lead.taxpayerEmail.toLowerCase().includes(q) ||
          lead.taxpayerPhone.toLowerCase().includes(q) ||
          lead.stateOfResidence.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [leads, activeTab, searchQuery]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs space-y-4 p-5">
      {/* 1. Header with Title & Next Priority Pitch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-slate-900">
            My Assigned Tax Returns &amp; Client Pitch Deck
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Review certified 1040 refund amounts, call taxpayers, quote custom filing fees, and process payment links.
          </p>
        </div>

        {filteredLeads.length > 0 && (
          <Button
            size="sm"
            onClick={() => navigate(`/sales/agent/pitch/${filteredLeads[0].id}`)}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Open Next Priority Pitch</span>
          </Button>
        )}
      </div>

      {/* 2. Filter Bar & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <AppSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by taxpayer, phone, email..."
            debounceMs={300}
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Assigned ({counts.all})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('AWAITING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'AWAITING' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Awaiting Pitch ({counts.awaiting})
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

      {/* 3. Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3.5 px-4">Taxpayer Client</th>
              <th className="py-3.5 px-4">State &amp; Visa</th>
              <th className="py-3.5 px-4">Certified 1040 Refund</th>
              <th className="py-3.5 px-4">Quoted Service Fee</th>
              <th className="py-3.5 px-4">E-Sign &amp; Payment</th>
              <th className="py-3.5 px-4">Sales Stage</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                  No assigned returns in your pitch queue right now.
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/60 transition-colors">
                  {/* Taxpayer Client */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <span>{lead.taxpayerName}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-bold">
                        TY {lead.taxYear}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">{lead.taxpayerEmail}</div>
                    <div className="text-[10px] text-slate-400">{lead.taxpayerPhone}</div>
                  </td>

                  {/* State & Visa */}
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
                    ) : (
                      <span className="font-bold text-rose-600 text-xs bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 inline-block">
                        -${lead.balanceDue.toLocaleString()} Tax Due
                      </span>
                    )}
                    <div className="text-[10px] text-slate-400 mt-0.5">QA by {lead.qaAuditorName}</div>
                  </td>

                  {/* Quoted Fee */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 text-xs">
                      ${lead.feeBreakdown.totalServiceFee}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      {lead.feeBreakdown.selectedStates.length > 0
                        ? `Fed + ${lead.feeBreakdown.selectedStates.length} State`
                        : 'Federal Only'}
                    </div>
                  </td>

                  {/* E-Sign & Payment Status */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-1 items-start">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          lead.paymentStatus === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : lead.paymentStatus === 'PAYMENT_LINK_SENT'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        Payment: {lead.paymentStatus}
                      </span>

                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          lead.esignStatus === 'SIGNED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : lead.esignStatus === 'SENT'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        8879: {lead.esignStatus}
                      </span>
                    </div>
                  </td>

                  {/* Sales Stage */}
                  <td className="py-3.5 px-4">
                    <SalesStageBadge stage={lead.currentStage} />
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      size="sm"
                      onClick={() => navigate(`/sales/agent/pitch/${lead.id}`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer ml-auto"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Open Pitch Deck</span>
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
