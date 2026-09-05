import React, { useMemo } from 'react';
import { useSalesManagerQueue, type SalesManagerTab } from '../hooks/useSalesManagerQueue';
import { SalesManagerMetrics } from '../components/manager/SalesManagerMetrics';
import { getSalesColumns } from '../columns/sales-columns';
import { AppTable } from '@/shared/components/AppTable';
import { AppSearchInput } from '@/shared/components/AppSearchInput';
import { Button } from '@/shared/components/Button';
import { 
  PhoneCall, 
  ListFilter, 
  RefreshCw, 
  Globe, 
  ShieldCheck, 
  DollarSign, 
  CheckCircle2, 
  Rocket,
  CreditCard,
  Scale
} from 'lucide-react';
import type { SalesLeadItem } from '../types/sales.types';

export const SalesDepartmentScreen: React.FC = () => {
  const {
    leads,
    counts,
    isLoading,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    paymentFilter,
    setPaymentFilter,
    liabilityFilter,
    setLiabilityFilter,
    visaFilter,
    setVisaFilter,
    refreshData,
  } = useSalesManagerQueue();

  const columns = useMemo(
    () =>
      getSalesColumns({
        onOpenPitch: () => {},
        onOpenAssignModal: () => {},
        isAdmin: true,
      }),
    []
  );

  // 6 Domain-Accurate Sales Workflow Tabs
  const tabs = [
    { id: 'AWAITING_PITCH' as SalesManagerTab, label: 'Awaiting Pitch', count: counts.awaitingPitch, icon: ShieldCheck },
    { id: 'IN_PITCH' as SalesManagerTab, label: 'In Active Pitch', count: counts.inPitch, icon: PhoneCall },
    { id: 'QUOTED' as SalesManagerTab, label: 'Pending Payment', count: counts.quoted, icon: DollarSign },
    { id: 'PAID_SIGNED' as SalesManagerTab, label: 'Paid & E-Signed', count: counts.paidSigned, icon: CheckCircle2 },
    { id: 'FILING_READY' as SalesManagerTab, label: 'In Filing Queue', count: counts.filingReady, icon: Rocket },
    { id: 'ALL' as SalesManagerTab, label: 'All Pipeline Returns', count: counts.all, icon: ListFilter },
  ];

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      {/* 1. Header & Live Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Sales Department Supervision &amp; Fee Quotations
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Super Admin View
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Supervise QA-certified 1040 returns, pitch discussions, payment checkouts, and dispatch status across sales closers.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* 2. Top Metric Cards (5 Sales Domain KPI Cards) */}
      <SalesManagerMetrics
        awaitingPitchCount={counts.awaitingPitch}
        pitchingCount={counts.inPitch}
        quotedCount={counts.quoted}
        paidSignedCount={counts.paidSigned}
        filingReadyCount={counts.filingReady}
        unassignedCount={counts.unassigned}
        hideQuickAction={true}
      />

      {/* 3. Dedicated Tabs & Multi-Filter Card */}
      <div className="rounded-xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Navigation Tabs Header */}
        <div className="border-b border-slate-200 px-6 pt-3 flex items-center justify-between overflow-x-auto">
          <div className="flex items-center gap-1 sm:gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
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
              placeholder="Search by taxpayer, phone, email, closer..."
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
                <option value="UNPAID">Unpaid / Pitching</option>
                <option value="PAYMENT_LINK_SENT">Link Sent</option>
                <option value="PAID">Paid</option>
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

      {/* 4. Separate Dedicated Table Section (View-Only, No Checkboxes, No Action Buttons) */}
      <AppTable<SalesLeadItem>
        title="Sales & Fee Quotation Caseload Pipeline"
        description="Monitor QA-approved tax returns, assigned closers, payment checkouts and Form 8879 e-sign authorizations in real-time."
        data={leads}
        columns={columns}
        rowKey="id"
        isLoading={isLoading}
        emptyText={
          activeTab === 'AWAITING_PITCH'
            ? 'All QA-approved returns have been pitched, or no returns are awaiting pitch.'
            : 'No sales returns match the selected filter criteria.'
        }
      />
    </div>
  );
};
