import React, { useMemo, useState } from 'react';
import { useSalesManagerQueue, type SalesManagerTab } from '../hooks/useSalesManagerQueue';
// import { SalesManagerMetrics } from '../components/manager/SalesManagerMetrics';
import { getSalesColumns } from '../columns/sales-columns';
import { UnifiedTable } from '@/shared/components/table/UnifiedTable';
import { AppTabs } from '@/shared/components/AppTabs';
import { Button } from '@/shared/components/Button';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import type { SalesLeadItem } from '../types/sales.types';
import { CompactStatCards } from '@/shared/components/CompactStatCards';
import { AppFilterFlyout, withoutAllValues, type FilterCategory } from '@/shared/components/AppFilterFlyout';
import { StatsToggleButton } from '@/shared/components/StatsToggleButton';
import { useStatsVisibility } from '@/shared/hooks/useStatsVisibility';
import { SYSTEM_PRIORITIES, SYSTEM_VISA_TYPES } from '@/shared/constants/system-enums';
import { CLIENT_TYPE_FILTER_OPTIONS } from '../components/common/ClientTypeBadge';

export const SalesDepartmentScreen: React.FC = () => {
  const {
    leads,
    counts,
    isLoading,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
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
    { id: 'AWAITING_PITCH' as SalesManagerTab, label: 'Awaiting Pitch', count: counts.awaitingPitch },
    { id: 'IN_PITCH' as SalesManagerTab, label: 'In Active Pitch', count: counts.inPitch },
    { id: 'QUOTED' as SalesManagerTab, label: 'Pending Payment', count: counts.quoted },
    { id: 'PAID_SIGNED' as SalesManagerTab, label: 'Paid & E-Signed', count: counts.paidSigned },
    { id: 'FILING_READY' as SalesManagerTab, label: 'In Filing Queue', count: counts.filingReady },
    { id: 'ALL' as SalesManagerTab, label: 'All Returns', count: counts.all },
  ];

  // Stat cards (shown by default, "Hide stats" next to Filters)
  const { showStats, toggleStats } = useStatsVisibility('admin_sales_dept');

  // Filters: closer, payment, 1040 balance, client type, priority, visa (replaces the old dropdown row)
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const filterCategories = useMemo<FilterCategory[]>(() => {
    const closers = new Map<string, string>();
    leads.forEach((l) => l.assignedSalesAgent && closers.set(l.assignedSalesAgent.id, l.assignedSalesAgent.name || l.assignedSalesAgent.email || ''));
    return [
      { id: 'closer', label: 'Assigned closer', options: [{ label: 'Unassigned', value: 'UNASSIGNED' }, ...Array.from(closers, ([value, label]) => ({ label, value }))] },
      {
        id: 'payment',
        label: 'Payment',
        options: [
          { label: 'Paid', value: 'PAID' },
          { label: 'Unpaid', value: 'UNPAID' },
          { label: 'Payment link sent', value: 'PAYMENT_LINK_SENT' },
        ],
      },
      {
        id: 'balance',
        label: '1040 balance',
        options: [
          { label: 'Refund', value: 'REFUND' },
          { label: 'Tax due', value: 'TAX_DUE' },
        ],
      },
      { id: 'clientType', label: 'Client type', options: CLIENT_TYPE_FILTER_OPTIONS },
      { id: 'priority', label: 'Priority', options: SYSTEM_PRIORITIES.map((p) => ({ label: p.label, value: p.value })) },
      { id: 'visa', label: 'Visa Type', options: SYSTEM_VISA_TYPES.map((v) => ({ label: v.label, value: v.value })) },
    ];
  }, [leads]);
  const filteredLeads = useMemo(() => {
    const match = (key: string, values: string[]) => !filters[key]?.length || values.some((v) => filters[key].includes(v));
    return leads.filter((l) => {
      const payment = l.paymentStatus === 'PAID' ? 'PAID' : l.paymentStatus === 'PAYMENT_LINK_SENT' ? 'PAYMENT_LINK_SENT' : 'UNPAID';
      const balance = [...(l.federalRefund > 0 ? ['REFUND'] : []), ...(l.balanceDue > 0 ? ['TAX_DUE'] : [])];
      return (
        match('closer', [l.assignedSalesAgent?.id || 'UNASSIGNED']) &&
        match('payment', [payment]) &&
        match('balance', balance) &&
        match('clientType', [l.clientType || '']) &&
        match('priority', [l.priority || 'NO_PRIORITY']) &&
        match('visa', [l.visaType || ''])
      );
    });
  }, [leads, filters]);

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

      {/* Stat cards hidden on table pages (client: keep tables compact) */}
      {/*
      <SalesManagerMetrics
        awaitingPitchCount={counts.awaitingPitch}
        pitchingCount={counts.inPitch}
        quotedCount={counts.quoted}
        paidSignedCount={counts.paidSigned}
        filingReadyCount={counts.filingReady}
        unassignedCount={counts.unassigned}
      />
      */}

      {/* Summary cards (compact) */}
      {showStats && (
        <CompactStatCards
          cards={[
            { name: 'Unassigned', value: counts.unassigned, hint: 'Waiting for a closer', tone: 'text-amber-700' },
            { name: 'Awaiting pitch', value: counts.awaitingPitch, hint: 'QA approved, not called' },
            { name: 'In active pitch', value: counts.inPitch, hint: 'Closer talking to client', tone: 'text-blue-700' },
            { name: 'Pending payment', value: counts.quoted, hint: 'Quote / invoice sent', tone: 'text-purple-700' },
            { name: 'Paid & e-signed', value: counts.paidSigned, hint: `${counts.filingReady} in filing queue`, tone: 'text-emerald-700' },
          ]}
        />
      )}

      {/* 3. Stage tabs (plain, same as the other queue screens) */}
      <AppTabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as any)} />

      {/* 4. Separate Dedicated Table Section (View-Only, No Checkboxes, No Action Buttons) */}
      <UnifiedTable<SalesLeadItem>
        data={filteredLeads}
        extraHeaderActions={
          <div className="flex items-center gap-2">
            <StatsToggleButton visible={showStats} onToggle={toggleStats} />
            <AppFilterFlyout categories={filterCategories} selectedFilters={filters} onApply={(f) => setFilters(withoutAllValues(f))} onReset={() => setFilters({})} />
          </div>
        }
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Search taxpayer, email, phone, state..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        emptyText={
          activeTab === 'AWAITING_PITCH'
            ? 'All QA-approved returns have been pitched, or no returns are awaiting pitch.'
            : 'No sales returns match the selected filter criteria.'
        }
      />
    </div>
  );
};
