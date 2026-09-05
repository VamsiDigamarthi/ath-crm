import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  FileCheck2,
  ListFilter,
  CreditCard,
  Scale,
  Globe,
  RotateCcw
} from 'lucide-react';
import { AppTable } from '@/shared/components/AppTable';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
import { Button } from '@/shared/components/Button';
import { FilingManagerMetrics } from '../components/manager/FilingManagerMetrics';
import { getFilingColumns } from '../columns/filing-columns';
import { useFilingQueue } from '../hooks/useFilingQueue';
import type { FilingLeadItem } from '../types/filing.types';

export type FilingTabType = 'ALL' | 'FILING_QUEUE' | 'FILING_IN_PROGRESS' | 'FILING_SUCCESS' | 'REVERTED';

export const FilingSpecialistQueueScreen: React.FC = () => {
  const navigate = useNavigate();

  const {
    isLoading,
    leads,
    searchQuery,
    setSearchQuery,
    stageFilter,
    setStageFilter,
    fetchQueue,
    handleOpenWorkspace,
  } = useFilingQueue(true);

  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');
  const [liabilityFilter, setLiabilityFilter] = useState<'ALL' | 'REFUND' | 'TAX_DUE'>('ALL');
  const [visaFilter, setVisaFilter] = useState<string>('ALL');

  const counts = useMemo(() => {
    const ready = leads.filter((l) => l.currentStage === 'FILING_QUEUE').length;
    const inProg = leads.filter((l) => l.currentStage === 'FILING_IN_PROGRESS').length;
    const accepted = leads.filter((l) => l.currentStage === 'FILING_SUCCESS').length;
    const failed = leads.filter((l) => l.currentStage === 'FILING_FAILED').length;
    const reverted = leads.filter((l) =>
      ['CORRECTION_NEEDED', 'DOC_OUTREACH', 'DOC_PREP', 'SALES_PITCH_QUEUE', 'SALES_PITCHING'].includes(l.currentStage)
    ).length;

    return {
      ready,
      inProg,
      accepted,
      failed,
      reverted,
      all: leads.length,
    };
  }, [leads]);

  const columns = useMemo(
    () =>
      getFilingColumns({
        onOpenWorkspace: (lead) => handleOpenWorkspace(lead.id),
        isSpecialist: true,
      }),
    [handleOpenWorkspace]
  );

  const tabs = [
    { id: 'FILING_QUEUE' as FilingTabType, label: 'Ready for Transmission', count: counts.ready, icon: Send },
    { id: 'FILING_IN_PROGRESS' as FilingTabType, label: 'In Transmission', count: counts.inProg, icon: Clock },
    { id: 'FILING_SUCCESS' as FilingTabType, label: 'Accepted by IRS', count: counts.accepted, icon: CheckCircle2 },
    { id: 'REVERTED' as FilingTabType, label: 'Reverted / In Revision', count: counts.reverted, icon: RotateCcw },
    { id: 'ALL' as FilingTabType, label: 'All My Returns', count: counts.all, icon: ListFilter },
  ];

  // Filtered dataset based on extra dropdowns
  const filteredLeads = useMemo(() => {
    return leads.filter((item) => {
      if (stageFilter === 'FILING_QUEUE' && item.currentStage !== 'FILING_QUEUE') return false;
      if (stageFilter === 'FILING_IN_PROGRESS' && item.currentStage !== 'FILING_IN_PROGRESS') return false;
      if (stageFilter === 'FILING_SUCCESS' && item.currentStage !== 'FILING_SUCCESS') return false;
      if (
        stageFilter === 'REVERTED' &&
        !['CORRECTION_NEEDED', 'DOC_OUTREACH', 'DOC_PREP', 'SALES_PITCH_QUEUE', 'SALES_PITCHING'].includes(item.currentStage)
      )
        return false;

      if (paymentFilter === 'PAID' && item.paymentStatus !== 'PAID') return false;
      if (paymentFilter === 'UNPAID' && item.paymentStatus === 'PAID') return false;
      const balVal = item.balanceDue || item.federalBalanceDue || 0;
      if (liabilityFilter === 'REFUND' && item.federalRefund <= 0) return false;
      if (liabilityFilter === 'TAX_DUE' && balVal <= 0) return false;
      if (visaFilter !== 'ALL' && item.visaType !== visaFilter) return false;
      return true;
    });
  }, [leads, stageFilter, paymentFilter, liabilityFilter, visaFilter]);

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              My IRS Transmission Queue
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
              <FileCheck2 className="w-3.5 h-3.5" />
              Specialist Transmission Desk
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Returns assigned to you ready for MeF XML schema inspection, EFIN validation, and direct IRS Gateway dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchQueue}
            disabled={isLoading}
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={() => navigate('/filing/agent')}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Filing Hub</span>
          </Button>
        </div>
      </div>

      {/* 2. Top Metric Cards (5 Specialist KPI Cards) */}
      <FilingManagerMetrics
        readyCount={counts.ready}
        inProgressCount={counts.inProg}
        acceptedCount={counts.accepted}
        failedCount={counts.failed}
        totalCount={counts.all}
      />

      {/* 3. Dedicated Tabs & Multi-Filter Card */}
      <div className="rounded-xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Navigation Tabs Header */}
        <div className="border-b border-slate-200 px-6 pt-3 flex items-center justify-between overflow-x-auto">
          <div className="flex items-center gap-1 sm:gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = stageFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStageFilter(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-3 border-b-2 font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'border-[#16A34A] text-[#16A34A] bg-emerald-50/40 rounded-t-lg'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#16A34A]' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-[#16A34A] text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Multi-Filter & Search Bar */}
        <div className="p-4 sm:p-5 bg-slate-50/50 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="w-full lg:w-72">
            <AppSearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search taxpayer, phone, email..."
              debounceMs={300}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Payment Status Filter */}
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs text-xs font-medium text-slate-600">
              <CreditCard className="w-3.5 h-3.5 text-purple-500" />
              <span>Payment:</span>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value as any)}
                className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Payments</option>
                <option value="PAID">Paid ($227)</option>
                <option value="UNPAID">Pending Payment</option>
              </select>
            </div>

            {/* Refund / Due Liability Filter */}
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs text-xs font-medium text-slate-600">
              <Scale className="w-3.5 h-3.5 text-emerald-500" />
              <span>1040 Balance:</span>
              <select
                value={liabilityFilter}
                onChange={(e) => setLiabilityFilter(e.target.value as any)}
                className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Balances</option>
                <option value="REFUND">Refund (+$)</option>
                <option value="TAX_DUE">Tax Due (-$)</option>
              </select>
            </div>

            {/* Visa Filter */}
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs text-xs font-medium text-slate-600">
              <Globe className="w-3.5 h-3.5 text-indigo-500" />
              <span>Visa:</span>
              <select
                value={visaFilter}
                onChange={(e) => setVisaFilter(e.target.value)}
                className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Visas</option>
                <option value="H-1B">H-1B</option>
                <option value="L-1">L-1</option>
                <option value="F-1 OPT">F-1 OPT</option>
                <option value="H-4">H-4</option>
                <option value="GREEN_CARD">Green Card</option>
                <option value="US_CITIZEN">US Citizen</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Dedicated AppTable Section */}
      <AppTable<FilingLeadItem>
        title="My Assigned Modernized e-File Pipeline"
        description="Review compliance status, inspect IRS XML schema packages, and transmit Form 1040 returns to the IRS MeF Gateway."
        data={filteredLeads}
        columns={columns}
        rowKey="id"
        isLoading={isLoading}
        emptyText={
          stageFilter === 'FILING_QUEUE'
            ? 'All your assigned returns have been transmitted, or no returns are awaiting transmission.'
            : 'No returns found matching the selected filter criteria.'
        }
      />
    </div>
  );
};
