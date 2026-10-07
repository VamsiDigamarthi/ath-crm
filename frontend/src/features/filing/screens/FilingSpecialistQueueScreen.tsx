import React, { useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { UnifiedTable } from '@/shared/components/table/UnifiedTable';
import { exportTableToExcel } from '@/shared/utils/export-excel';
import { Button } from '@/shared/components/Button';
import { FilingManagerMetrics } from '../components/manager/FilingManagerMetrics';
import { getFilingColumns } from '../columns/filing-columns';
import { useFilingQueue, type FilingSpecialistTab } from '../hooks/useFilingQueue';
import type { FilingLeadItem } from '../types/filing.types';

export interface FilingSpecialistQueueScreenProps {
  initialTab?: FilingSpecialistTab;
}

export const FilingSpecialistQueueScreen: React.FC<FilingSpecialistQueueScreenProps> = ({ initialTab }) => {
  const location = useLocation();

  // Deduce tab from current path
  const routeTab = useMemo<FilingSpecialistTab>(() => {
    const path = location.pathname;
    if (path.includes('/filing/agent/pending')) return 'PENDING';
    if (path.includes('/filing/agent/on-hold')) return 'ON_HOLD';
    if (path.includes('/filing/agent/rejected')) return 'REJECTED';
    if (path.includes('/filing/agent/filed')) return 'FILED';
    if (initialTab) return initialTab;
    return 'READY';
  }, [location.pathname, initialTab]);

  const {
    isLoading,
    counts,
    categorizedLeads,
    activeTab,
    setActiveTab,
    fetchQueue,
    handleOpenWorkspace,
  } = useFilingQueue(true, routeTab);

  useEffect(() => {
    if (routeTab !== activeTab) {
      setActiveTab(routeTab);
    }
  }, [routeTab, activeTab, setActiveTab]);

  const columns = useMemo(
    () =>
      getFilingColumns({
        onOpenWorkspace: (lead) => handleOpenWorkspace(lead.id),
        isSpecialist: true,
      }),
    [handleOpenWorkspace]
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

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      {/* 1. Header & Live Queue Statistics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
            {viewConfig.title}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1 font-normal max-w-3xl">
            {viewConfig.subtitle}
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

      {/* 2. Live Transmission KPI Cards */}
      <FilingManagerMetrics
        readyCount={counts.ready}
        inProgressCount={counts.pending}
        acceptedCount={counts.filed}
        failedCount={counts.rejected}
        totalCount={counts.all}
      />

      {/* 3. Unified Table for the Selected Queue */}
      <UnifiedTable<FilingLeadItem>
        title={viewConfig.title.toUpperCase()}
        subtitle={viewConfig.subtitle}
        data={categorizedLeads}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Search taxpayer, state, stage, payment..."
        onExportExcel={() => {
          exportTableToExcel(
            categorizedLeads,
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
        onRowClick={(item) => handleOpenWorkspace(item.id)}
        emptyText={viewConfig.emptyText}
      />
    </div>
  );
};
