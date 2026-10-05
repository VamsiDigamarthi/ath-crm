import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSalesManagerQueue, type SalesManagerTab } from '../hooks/useSalesManagerQueue';
// import { SalesManagerMetrics } from '../components/manager/SalesManagerMetrics';
import { SalesFloatingActionBar } from '../components/manager/SalesFloatingActionBar';
import { SalesLeadAssignmentModal } from '../components/manager/SalesLeadAssignmentModal';
import { getSalesColumns } from '../columns/sales-columns';
// import { PriorityFilterSelect } from '@/shared/components/PriorityFilterSelect';
import { UnifiedTable } from '@/shared/components/table/UnifiedTable';
import { AppTabs } from '@/shared/components/AppTabs';
import { Button } from '@/shared/components/Button';
import { Users, Zap, RefreshCw } from 'lucide-react';
import type { SalesLeadItem } from '../types/sales.types';

/* Filter row is hidden for now; uncomment with the filter block in the screen
interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

// Neutral inline filter, matching the plain controls used on Team & Staff
const FilterSelect: React.FC<FilterSelectProps> = ({ label, value, onChange, options }) => (
  <label className="h-8 inline-flex items-center gap-1.5 bg-white pl-3 pr-2 rounded-lg border border-slate-200 shadow-2xs text-xs text-slate-500 cursor-pointer hover:border-slate-300 transition-colors">
    <span>{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-transparent text-slate-800 font-medium focus:outline-none cursor-pointer"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </label>
);
*/

export const SalesManagerQueueScreen: React.FC = () => {
  const navigate = useNavigate();

  const {
    leads,
    salesReps,
    counts,
    isLoading,
    isActionLoading,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    // Filter controls are hidden for now; uncomment together with the filter row below
    // paymentFilter,
    // setPaymentFilter,
    // liabilityFilter,
    // setLiabilityFilter,
    // visaFilter,
    // setVisaFilter,
    // priorityFilter,
    // setPriorityFilter,
    // complexityFilter,
    // setComplexityFilter,
    selectedRows,
    setSelectedRows,
    isAssignModalOpen,
    activeLeadForAssign,
    handleOpenAssignModal,
    handleCloseAssignModal,
    handleDirectAssign,
    handleAutoRoundRobin,
    refreshData,
  } = useSalesManagerQueue();

  const columns = useMemo(
    () =>
      getSalesColumns({
        onOpenPitch: (lead) => navigate(`/sales/manager/client/${lead.taxpayerId || lead.id || lead.applicationId}`),
        onOpenAssignModal: (lead) => handleOpenAssignModal(lead),
      }),
    [navigate, handleOpenAssignModal]
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

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Sales Queue</h2>
          <p className="text-sm text-slate-500 mt-1">
            {counts.all} returns · {counts.unassigned} unassigned
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
            className="h-8 px-3 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          {counts.unassigned > 0 && (
            <Button
              size="sm"
              onClick={handleAutoRoundRobin}
              disabled={isActionLoading}
              className="h-8 px-3 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-medium flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Auto-assign ({counts.unassigned})</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Top Metric Cards: hidden to match the Team & Staff layout; tab counts carry the same numbers */}
      {/*
      <SalesManagerMetrics
        awaitingPitchCount={counts.awaitingPitch}
        pitchingCount={counts.inPitch}
        quotedCount={counts.quoted}
        paidSignedCount={counts.paidSigned}
        filingReadyCount={counts.filingReady}
        unassignedCount={counts.unassigned}
        onQuickAutoDistribute={handleAutoRoundRobin}
        isDistributing={isActionLoading}
      />
      */}

      <div className="space-y-4">
        {/* 3. Stage Tabs */}
        <AppTabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as SalesManagerTab)} />

        {/* 4. Filters: hidden for now; filter state and hook logic are unchanged */}
        {/*
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            label="Payment"
            value={paymentFilter}
            onChange={(v) => setPaymentFilter(v as any)}
            options={[
              { value: 'ALL', label: 'All' },
              { value: 'UNPAID', label: 'Unpaid' },
              { value: 'PAYMENT_LINK_SENT', label: 'Link sent' },
              { value: 'PAID', label: 'Paid' },
            ]}
          />
          <FilterSelect
            label="1040 balance"
            value={liabilityFilter}
            onChange={(v) => setLiabilityFilter(v as any)}
            options={[
              { value: 'ALL', label: 'All' },
              { value: 'REFUND', label: 'Refund' },
              { value: 'TAX_DUE', label: 'Tax due' },
            ]}
          />
          <FilterSelect
            label="Visa"
            value={visaFilter}
            onChange={setVisaFilter}
            options={[
              { value: 'ALL', label: 'All' },
              { value: 'H-1B', label: 'H-1B' },
              { value: 'L-1', label: 'L-1' },
              { value: 'F-1 OPT', label: 'F-1 OPT' },
              { value: 'H-4', label: 'H-4' },
              { value: 'GREEN_CARD', label: 'Green Card' },
              { value: 'US_CITIZEN', label: 'US Citizen' },
            ]}
          />
          <FilterSelect
            label="Complexity"
            value={complexityFilter}
            onChange={(v) => setComplexityFilter(v as any)}
            options={[
              { value: 'ALL', label: 'All' },
              { value: 'BASIC', label: 'Basic' },
              { value: 'MODERATE', label: 'Moderate' },
              { value: 'COMPLEX', label: 'Complex' },
              { value: 'SPECIALIZED_REVIEW', label: 'Specialized' },
            ]}
          />
          <PriorityFilterSelect value={priorityFilter} onChange={setPriorityFilter} />
        </div>
        */}

        {/* 5. Table */}
        <UnifiedTable<SalesLeadItem>
          data={leads}
          columns={columns}
          enableSelection={true}
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          isLoading={isLoading}
          searchPlaceholder="Search taxpayer, email, phone, closer..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          onRowClick={(item) => navigate(`/sales/manager/client/${item.taxpayerId || item.id || item.applicationId}`)}
          extraHeaderActions={
            selectedRows.length > 0 ? (
              <Button
                size="sm"
                onClick={() => handleOpenAssignModal()}
                className="h-8 px-3 text-xs font-medium bg-[#16A34A] hover:bg-[#15803D] text-white flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Assign selected ({selectedRows.length})</span>
              </Button>
            ) : undefined
          }
          emptyText={
            activeTab === 'AWAITING_PITCH'
              ? 'All QA-approved returns have been pitched, or no returns are awaiting pitch.'
              : 'No sales returns match the selected filter criteria.'
          }
        />
      </div>

      {/* 6. Floating Action Bar when rows are checked */}
      <SalesFloatingActionBar
        selectedCount={selectedRows.length}
        onAutoRoundRobin={handleAutoRoundRobin}
        onOpenAssignModal={() => handleOpenAssignModal()}
        onClearSelection={() => setSelectedRows([])}
        isLoading={isActionLoading}
      />

      {/* 7. Lead Assignment Modal (Bulk or Single) */}
      <SalesLeadAssignmentModal
        isOpen={isAssignModalOpen}
        onClose={handleCloseAssignModal}
        selectedLeads={activeLeadForAssign ? [activeLeadForAssign] : selectedRows}
        salesReps={salesReps}
        onConfirmDirectAssign={handleDirectAssign}
        onConfirmRoundRobin={handleAutoRoundRobin}
        isLoading={isActionLoading}
      />
    </div>
  );
};
