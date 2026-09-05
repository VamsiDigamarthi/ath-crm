import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhoneCall, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
import { SalesStageBadge } from '../common/SalesStageBadge';
import type { SalesLeadItem } from '../../types/sales.types';

interface SalesAgentQueueTableProps {
  leads: SalesLeadItem[];
  isLoading?: boolean;
}

export const SalesAgentQueueTable: React.FC<SalesAgentQueueTableProps> = ({ leads, isLoading = false }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'ALL' | 'AWAITING' | 'QUOTED' | 'PAID'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const isAwaitingPitch = (lead: SalesLeadItem) => {
    return (
      lead.paymentStatus !== 'PAID' &&
      lead.currentStage !== 'FILING_QUEUE' &&
      lead.currentStage !== 'PAID_AND_AUTHORIZED' &&
      lead.currentStage !== 'QUOTATION_SENT' &&
      lead.currentStage !== 'PAYMENT_PENDING' &&
      lead.paymentStatus !== 'PAYMENT_LINK_SENT'
    );
  };

  const isQuotedOrPaymentPending = (lead: SalesLeadItem) => {
    return (
      lead.paymentStatus !== 'PAID' &&
      lead.currentStage !== 'FILING_QUEUE' &&
      lead.currentStage !== 'PAID_AND_AUTHORIZED' &&
      (lead.currentStage === 'QUOTATION_SENT' ||
        lead.currentStage === 'PAYMENT_PENDING' ||
        lead.paymentStatus === 'PAYMENT_LINK_SENT' ||
        Boolean(lead.feeBreakdown?.isQuoted))
    );
  };

  const isPaidOrClosed = (lead: SalesLeadItem) => {
    return (
      lead.paymentStatus === 'PAID' ||
      lead.currentStage === 'PAID_AND_AUTHORIZED' ||
      lead.currentStage === 'FILING_QUEUE' ||
      lead.currentStage === 'FILING_IN_PROGRESS' ||
      lead.currentStage === 'FILING_SUCCESS'
    );
  };

  const counts = useMemo(() => {
    let awaiting = 0;
    let quoted = 0;
    let paid = 0;

    leads.forEach((lead) => {
      if (isPaidOrClosed(lead)) paid++;
      else if (isQuotedOrPaymentPending(lead)) quoted++;
      else awaiting++;
    });

    return {
      all: leads.length,
      awaiting,
      quoted,
      paid,
    };
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (activeTab === 'AWAITING' && !isAwaitingPitch(lead)) return false;
      if (activeTab === 'QUOTED' && !isQuotedOrPaymentPending(lead)) return false;
      if (activeTab === 'PAID' && !isPaidOrClosed(lead)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          (lead.taxpayerName || '').toLowerCase().includes(q) ||
          (lead.taxpayerEmail || '').toLowerCase().includes(q) ||
          (lead.taxpayerPhone || '').toLowerCase().includes(q) ||
          (lead.stateOfResidence || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [leads, activeTab, searchQuery]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* 1. Header Bar: Title on Left, Search Input & Next Priority Action on Right */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 sm:p-5 border-b border-slate-100 bg-white">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-[#16A34A]" />
            <span>My Assigned Tax Returns &amp; Client Pitch Deck</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Review certified 1040 refund amounts, call taxpayers, quote custom filing fees, and process payment links.
          </p>
        </div>

        {/* Search Input & Action Button on Right */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="w-64 sm:w-72">
            <AppSearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search taxpayer, phone, email..."
            />
          </div>

          {filteredLeads.length > 0 && (
            <Button
              size="sm"
              onClick={() => navigate(`/sales/agent/pitch/${filteredLeads[0].id || filteredLeads[0].applicationId}`)}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 h-8.5 px-3.5 cursor-pointer shadow-2xs"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Open Next Priority Pitch</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Filter Tabs Ribbon (Below Header) */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-100 bg-white overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-50'
          }`}
        >
          All Assigned ({counts.all})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('AWAITING')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'AWAITING'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/60'
          }`}
        >
          <span>Awaiting Pitch</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-bold">
            {counts.awaiting}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('QUOTED')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'QUOTED'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200/60'
          }`}
        >
          <span>Quoted</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-bold">
            {counts.quoted}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('PAID')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'PAID'
              ? 'bg-[#16A34A] text-white shadow-xs'
              : 'text-[#16A34A] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60'
          }`}
        >
          <span>Paid &amp; E-Signed</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-bold">
            {counts.paid}
          </span>
        </button>
      </div>

      {/* 3. Table: Full Width Edge-to-Edge Flush with Outer Card */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
            <tr>
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
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    <span>Loading live sales pitch queue...</span>
                  </div>
                </td>
              </tr>
            ) : filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                  No assigned returns in your pitch queue right now.
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <tr key={lead.id || lead.applicationId} className="hover:bg-slate-50/70 transition-colors">
                  {/* Taxpayer Client */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                      <span>{lead.taxpayerName}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                        TY {lead.taxYear || 2025}
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
                    {Number(lead.federalRefund) > 0 ? (
                      <span className="font-bold text-[#16A34A] text-xs bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-block">
                        +${Number(lead.federalRefund).toLocaleString()} Fed Refund
                      </span>
                    ) : Number(lead.balanceDue) > 0 ? (
                      <span className="font-bold text-rose-600 text-xs bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 inline-block">
                        -${Number(lead.balanceDue).toLocaleString()} Tax Due
                      </span>
                    ) : (
                      <span className="font-bold text-slate-600 text-xs bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200 inline-block">
                        $0 Fed Balance
                      </span>
                    )}
                    <div className="text-[10px] text-slate-400 mt-0.5">QA by {lead.qaAuditorName || 'Senior Reviewer'}</div>
                  </td>

                  {/* Quoted Fee */}
                  <td className="py-3.5 px-4">
                    {lead.feeBreakdown?.isQuoted ? (
                      <>
                        <div className="font-bold text-slate-900 text-xs">
                          ${lead.feeBreakdown.totalServiceFee}
                        </div>
                        <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Quoted &amp; Sent</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <span>{lead.feeBreakdown?.totalServiceFee > 0 ? `$${lead.feeBreakdown.totalServiceFee}` : '$0'}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                            Unquoted
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                          {lead.feeBreakdown?.selectedStates?.length > 0
                            ? `Fed + ${lead.feeBreakdown.selectedStates.length} State`
                            : 'Federal Only'}
                        </div>
                      </>
                    )}
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
                        Payment: {lead.paymentStatus || 'UNPAID'}
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
                        8879: {lead.esignStatus || 'NOT_SENT'}
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
                      onClick={() => navigate(`/sales/agent/pitch/${lead.id || lead.applicationId}`)}
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
