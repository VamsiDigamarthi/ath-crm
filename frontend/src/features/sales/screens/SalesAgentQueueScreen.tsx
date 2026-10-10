import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PhoneCall, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { SalesAgentQueueTable } from '../components/agent/SalesAgentQueueTable';
import { CompactStatCards } from '@/shared/components/CompactStatCards';
import { AppFilterFlyout, withoutAllValues, type FilterCategory } from '@/shared/components/AppFilterFlyout';
import { StatsToggleButton } from '@/shared/components/StatsToggleButton';
import { useStatsVisibility } from '@/shared/hooks/useStatsVisibility';
import { SYSTEM_PRIORITIES } from '@/shared/constants/system-enums';
import { CLIENT_TYPE_FILTER_OPTIONS } from '../components/common/ClientTypeBadge';
import {
  useSalesAgentQueue,
  type SalesAgentTab,
  type SalesAgentView,
} from '../hooks/useSalesAgentQueue';

export interface SalesAgentQueueScreenProps {
  initialTab?: SalesAgentTab;
  view?: SalesAgentView;
}

export const SalesAgentQueueScreen: React.FC<SalesAgentQueueScreenProps> = ({
  initialTab,
  view: propView,
}) => {
  const location = useLocation();

  const effectiveView = useMemo<SalesAgentView>(() => {
    if (propView) return propView;
    const path = location.pathname;
    if (path.includes('/sales/agent/pending')) return 'PENDING';
    if (path.includes('/sales/agent/callbacks')) return 'CALLBACKS';
    if (path.includes('/sales/agent/follow-ups')) return 'FOLLOW_UPS';
    if (path.includes('/sales/agent/converted')) return 'CONVERTED';
    return 'MY';
  }, [propView, location.pathname]);

  const {
    isLoading,
    isRefreshing,
    allLeads,
    counts,
    clientRows,
    handleRefresh,
    handleUpdatePriority,
    handleOpenNextPriority,
    fromQuery,
  } = useSalesAgentQueue(effectiveView, initialTab);

  const getHeaderInfo = () => {
    switch (effectiveView) {
      case 'PENDING':
        return {
          title: 'Pending Prospects (pending Leads)',
          subtitle: `${clientRows.length} QA-approved prospects awaiting initial outreach and fee pitch`,
          emptyText: 'No pending prospects awaiting outreach.',
        };
      case 'CALLBACKS':
        return {
          title: 'Scheduled Callbacks',
          subtitle: `${clientRows.length} scheduled callbacks and consultation appointments`,
          emptyText: 'No scheduled callbacks pending at this time.',
        };
      case 'FOLLOW_UPS':
        return {
          title: 'Follow-Ups',
          subtitle: `${clientRows.length} active fee quotations and payment checkouts awaiting client completion`,
          emptyText: 'No active follow-ups required.',
        };
      case 'CONVERTED':
        return {
          title: 'Converted Clients',
          subtitle: `${clientRows.length} closed deals with payment collected and authorization complete`,
          emptyText: 'No converted clients recorded in this view.',
        };
      default:
        return {
          title: 'My Prospects (My leads)',
          subtitle: `${counts.all || 0} total assigned prospects (${counts.pending || 0} pending · ${counts.callbacks || 0} callbacks · ${counts.followUps || 0} follow-ups · ${counts.converted || 0} converted)`,
          emptyText: 'No prospects assigned to your queue.',
        };
    }
  };

  const headerInfo = getHeaderInfo();

  // Stat cards (same on every sales agent page) — shown by default, "Hide stats" next to Filters
  const { showStats, toggleStats } = useStatsVisibility('sales_agent');
  const statCards = [
    { name: 'Pending prospects', value: counts.pending || 0, hint: 'Not called yet', tone: 'text-amber-700' },
    { name: 'Callbacks', value: counts.callbacks || 0, hint: 'Call at a set time', tone: 'text-blue-700' },
    { name: 'Follow-ups', value: counts.followUps || 0, hint: 'Need another touch', tone: 'text-purple-700' },
    { name: 'Converted', value: counts.converted || 0, hint: 'Paid & signed', tone: 'text-emerald-700' },
    { name: 'Sent back', value: counts.reverted || 0, hint: 'Reverted for revision', tone: 'text-rose-600' },
  ];

  // Filters: Payment, 8879 sign, 1040 balance, Client type, Priority, Tax year
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const filterCategories = useMemo<FilterCategory[]>(() => {
    const years = Array.from(new Set(clientRows.map((r) => r.taxYear).filter(Boolean))).sort((a, b) => b - a);
    return [
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
        id: 'esign',
        label: '8879 sign',
        options: [
          { label: 'Signed', value: 'SIGNED' },
          { label: 'Sent, not signed', value: 'SENT' },
          { label: 'Not sent', value: 'NOT_SENT' },
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
      { id: 'taxYear', label: 'Tax year', options: years.map((y) => ({ label: `TY ${y}`, value: String(y) })) },
    ];
  }, [clientRows]);
  const filteredRows = useMemo(() => {
    const match = (key: string, values: string[]) => !filters[key]?.length || values.some((v) => filters[key].includes(v));
    return clientRows.filter((l) => {
      const payment = l.paymentStatus === 'PAID' ? 'PAID' : l.paymentStatus === 'PAYMENT_LINK_SENT' ? 'PAYMENT_LINK_SENT' : 'UNPAID';
      const esign = l.esignStatus === 'SIGNED' ? 'SIGNED' : l.esignStatus === 'SENT' || l.esignStatus === 'VIEWED' ? 'SENT' : 'NOT_SENT';
      const balance = [...(l.federalRefund > 0 ? ['REFUND'] : []), ...(l.balanceDue > 0 ? ['TAX_DUE'] : [])];
      return (
        match('payment', [payment]) &&
        match('esign', [esign]) &&
        match('balance', balance) &&
        match('clientType', [l.clientType || '']) &&
        match('priority', [l.priority || 'NO_PRIORITY']) &&
        match('taxYear', [String(l.taxYear)])
      );
    });
  }, [clientRows, filters]);

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      {/* 1. Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {headerInfo.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            {headerInfo.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Queue</span>
          </Button>

          <Button
            size="sm"
            onClick={handleOpenNextPriority}
            disabled={allLeads.length === 0}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Open Next Priority Pitch</span>
          </Button>
        </div>
      </div>

      {showStats && <CompactStatCards cards={statCards} />}

      {/* 2. My Active Queue Table (Grouped by Client) */}
      <SalesAgentQueueTable
        leads={filteredRows}
        extraHeaderActions={
          <div className="flex items-center gap-2">
            <StatsToggleButton visible={showStats} onToggle={toggleStats} />
            <AppFilterFlyout categories={filterCategories} selectedFilters={filters} onApply={(f) => setFilters(withoutAllValues(f))} onReset={() => setFilters({})} />
          </div>
        }
        isLoading={isLoading}
        onRefresh={handleRefresh}
        onUpdatePriority={handleUpdatePriority}
        emptyText={headerInfo.emptyText}
        fromQuery={fromQuery}
        showCallback={effectiveView === 'CALLBACKS'}
      />
    </div>
  );
};
