import React, { useMemo, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { UnifiedTable } from '@/shared/components/table/UnifiedTable';
import { exportTableToExcel } from '@/shared/utils/export-excel';
import { Button } from '@/shared/components/Button';
import { getFilingColumns } from '../columns/filing-columns';
import { useFilingQueue, type FilingSpecialistTab } from '../hooks/useFilingQueue';
import type { FilingLeadItem } from '../types/filing.types';
import { CompactStatCards } from '@/shared/components/CompactStatCards';
import { AppFilterFlyout, withoutAllValues, type FilterCategory } from '@/shared/components/AppFilterFlyout';
import { StatsToggleButton } from '@/shared/components/StatsToggleButton';
import { useStatsVisibility } from '@/shared/hooks/useStatsVisibility';
import { SYSTEM_PRIORITIES, SYSTEM_VISA_TYPES } from '@/shared/constants/system-enums';

export interface FilingSpecialistQueueScreenProps {
  initialTab?: FilingSpecialistTab;
  view?: string;
}

export const FilingSpecialistQueueScreen: React.FC<FilingSpecialistQueueScreenProps> = ({ initialTab, view }) => {
  const location = useLocation();

  // Deduce tab from current path or props
  const routeTab = useMemo<FilingSpecialistTab>(() => {
    const path = location.pathname;
    if (path.includes('/filing/agent/pending') || view === 'PENDING') return 'PENDING';
    if (path.includes('/filing/agent/on-hold') || view === 'ON_HOLD') return 'ON_HOLD';
    if (path.includes('/filing/agent/rejected') || view === 'RETURNED') return 'REJECTED';
    if (path.includes('/filing/agent/filed') || view === 'FILED') return 'FILED';
    if (initialTab) return initialTab;
    return 'READY';
  }, [location.pathname, initialTab, view]);

  const {
    isLoading,
    categorizedLeads,
    counts,
    activeTab,
    setActiveTab,
    fetchQueue,
    handleOpenWorkspace,
    handleOpenClient,
  } = useFilingQueue(true, routeTab);

  useEffect(() => {
    if (routeTab !== activeTab) {
      setActiveTab(routeTab);
    }
  }, [routeTab, activeTab, setActiveTab]);

  const fromKey = useMemo(() => {
    switch (activeTab) {
      case 'PENDING':
        return 'pending';
      case 'ON_HOLD':
        return 'on-hold';
      case 'REJECTED':
        return 'rejected';
      case 'FILED':
        return 'filed';
      default:
        return 'queue';
    }
  }, [activeTab]);

  const columns = useMemo(
    () =>
      getFilingColumns({
        onOpenWorkspace: (lead) => {
          if (handleOpenClient) {
            handleOpenClient(lead, fromKey);
          } else {
            handleOpenWorkspace(lead.id, fromKey);
          }
        },
        isSpecialist: true,
      }),
    [handleOpenClient, handleOpenWorkspace, fromKey]
  );

  const viewConfig = useMemo(() => {
    switch (activeTab) {
      case 'PENDING':
        return {
          title: 'Filing Pending',
          subtitle: 'Returns currently validating schemas or transmitting across the IRS Modernized e-File (MeF) Gateway awaiting IRS electronic acknowledgment (ACK).',
          emptyText: 'No returns currently pending gateway transmission or awaiting IRS acknowledgments.',
        };
      case 'ON_HOLD':
        return {
          title: 'Filing on Hold',
          subtitle: 'Returns temporarily paused or reverted to Preparers, Documenters, or Sales due to schema errors, bank discrepancies, or missing disclosures.',
          emptyText: 'No returns currently on hold or reverted for corrections.',
        };
      case 'REJECTED':
        return {
          title: 'Rejected Returns',
          subtitle: 'Returns rejected by the IRS or State electronic gateway with reject error codes. Inspect diagnostics, rectify schemas, and prepare for re-transmission.',
          emptyText: 'Clean record! No electronic return rejections logged.',
        };
      case 'FILED':
        return {
          title: 'Filed Returns',
          subtitle: 'Returns successfully accepted by the IRS and State agencies with verified electronic postmarks and official Acceptance Certificate IDs.',
          emptyText: 'No completed filings recorded yet for this session.',
        };
      case 'READY':
      default:
        return {
          title: 'Ready for Filing',
          subtitle: 'Verified and paid Form 1040 returns approved by QA, e-signed by taxpayers, and queued for IRS MeF batch transmission.',
          emptyText: 'All your assigned returns have been transmitted, or no returns are currently awaiting transmission.',
        };
    }
  }, [activeTab]);

  // Stat cards (same on every filing page) — shown by default, "Hide stats" next to Filters
  const { showStats, toggleStats } = useStatsVisibility('filing_agent');
  const statCards = [
    { name: 'Ready for filing', value: counts.ready, hint: 'Paid, signed, QA approved', tone: 'text-blue-700' },
    { name: 'Filing pending', value: counts.pending, hint: 'Sent, waiting for IRS', tone: 'text-amber-700' },
    { name: 'On hold', value: counts.onHold, hint: 'Paused by filing', tone: 'text-slate-700' },
    { name: 'Rejected', value: counts.rejected, hint: 'IRS rejected, fix & resend', tone: 'text-rose-600' },
    { name: 'Filed', value: counts.filed, hint: 'Accepted by the IRS', tone: 'text-emerald-700' },
  ];

  // Filters: Priority, Payment, 8879 sign, 1040 balance, Tax year, Visa type
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const filterCategories = useMemo<FilterCategory[]>(() => {
    const years = Array.from(new Set(categorizedLeads.map((r) => r.taxYear).filter(Boolean))).sort((a, b) => b - a);
    return [
      { id: 'priority', label: 'Priority', options: SYSTEM_PRIORITIES.map((p) => ({ label: p.label, value: p.value })) },
      {
        id: 'payment',
        label: 'Payment',
        options: [
          { label: 'Paid', value: 'PAID' },
          { label: 'Unpaid', value: 'UNPAID' },
        ],
      },
      {
        id: 'esign',
        label: '8879 sign',
        options: [
          { label: 'Signed', value: 'SIGNED' },
          { label: 'Not signed', value: 'PENDING' },
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
      { id: 'taxYear', label: 'Tax year', options: years.map((y) => ({ label: `TY ${y}`, value: String(y) })) },
      { id: 'visa', label: 'Visa Type', options: SYSTEM_VISA_TYPES.map((v) => ({ label: v.label, value: v.value })) },
    ];
  }, [categorizedLeads]);
  const filteredLeads = useMemo(() => {
    const match = (key: string, values: string[]) => !filters[key]?.length || values.some((v) => filters[key].includes(v));
    return categorizedLeads.filter((l) => {
      const balance = [...(l.federalRefund > 0 ? ['REFUND'] : []), ...((l as any).federalBalanceDue > 0 ? ['TAX_DUE'] : [])];
      return (
        match('priority', [l.priority || 'NO_PRIORITY']) &&
        match('payment', [l.paymentStatus === 'PAID' ? 'PAID' : 'UNPAID']) &&
        match('esign', [l.esignStatus === 'SIGNED' ? 'SIGNED' : 'PENDING']) &&
        match('balance', balance) &&
        match('taxYear', [String(l.taxYear)]) &&
        match('visa', [l.visaType || ''])
      );
    });
  }, [categorizedLeads, filters]);

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      {/* 1. Header & Live Queue Statistics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
            {viewConfig.title}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1 font-normal max-w-3xl">
            {filteredLeads.length} returns · {viewConfig.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchQueue}
            disabled={isLoading}
            className="border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-normal flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            Refresh Queue
          </Button>
        </div>
      </div>

      {showStats && <CompactStatCards cards={statCards} />}

      {/* 2. Unified Table for the Selected Queue */}
      <UnifiedTable<FilingLeadItem>
        title={viewConfig.title.toUpperCase()}
        subtitle={viewConfig.subtitle}
        data={filteredLeads}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Search taxpayer, state, stage, payment..."
        extraHeaderActions={
          <div className="flex items-center gap-2">
            <StatsToggleButton visible={showStats} onToggle={toggleStats} />
            <AppFilterFlyout categories={filterCategories} selectedFilters={filters} onApply={(f) => setFilters(withoutAllValues(f))} onReset={() => setFilters({})} />
          </div>
        }
        onExportExcel={() => {
          exportTableToExcel(
            filteredLeads,
            [
              { header: 'Taxpayer Name', key: 'taxpayerName' },
              { header: 'Email', key: 'taxpayerEmail' },
              { header: 'Tax Year', key: 'taxYear' },
              { header: 'State', key: 'stateOfResidence' },
              { header: 'Refund', key: 'federalRefund' },
              { header: 'Payment', key: 'paymentStatus' },
              { header: 'E-Sign', key: 'esignStatus' },
              { header: 'Stage', key: 'currentStage' },
            ],
            `filing_${activeTab.toLowerCase()}_returns`
          );
        }}
        onRowClick={(item) => {
          if (handleOpenClient) {
            handleOpenClient(item, fromKey);
          } else {
            handleOpenWorkspace(item.id, fromKey);
          }
        }}
        emptyText={viewConfig.emptyText}
      />
    </div>
  );
};
