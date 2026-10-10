import React, { useMemo, useState } from 'react';
import { 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  ListFilter, 
  RotateCcw 
} from 'lucide-react';
import { UnifiedTable } from '@/shared/components/table/UnifiedTable';
import { exportTableToExcel } from '@/shared/utils/export-excel';
import { AppTabs } from '@/shared/components/AppTabs';
import { Button } from '@/shared/components/Button';
import { FilingManagerMetrics } from '../components/manager/FilingManagerMetrics';
import { getFilingColumns } from '../columns/filing-columns';
import { useFilingQueue } from '../hooks/useFilingQueue';
import type { FilingLeadItem } from '../types/filing.types';
import { useFilingViews, type FilingView, type ReturnedTab } from '../hooks/useFilingViews';

// Title and subtitle for each filing sidebar page
const VIEW_COPY: Record<Exclude<FilingView, 'ALL'>, { title: string; subtitle: string }> = {
  READY: { title: 'Ready for Filing', subtitle: 'Paid and signed, waiting to be transmitted to the IRS' },
  PENDING: { title: 'Filing Pending', subtitle: 'Transmitted, waiting for the IRS answer' },
  ON_HOLD: { title: 'Filing on Hold', subtitle: 'Paused by the filing team; release the hold to transmit' },
  RETURNED: { title: 'Returned Status', subtitle: 'Sent back to another team, or rejected by the IRS' },
  FILED: { title: 'Filed Returns', subtitle: 'Accepted by the IRS' },
};

export type FilingTabType = 'ALL' | 'FILING_QUEUE' | 'FILING_IN_PROGRESS' | 'FILING_SUCCESS' | 'REVERTED';

export const FilingSpecialistQueueScreen: React.FC<{ view?: FilingView }> = ({ view = 'ALL' }) => {
  const {
    isLoading,
    leads,
    stageFilter,
    setStageFilter,
    fetchQueue,
    handleOpenClient,
  } = useFilingQueue(true);

  const { pageLeads, returnedTab, setReturnedTab, returnedTabs } = useFilingViews(leads, view);
  const copy = view === 'ALL' ? null : VIEW_COPY[view];
  const VIEW_FROM: Record<FilingView, string | undefined> = { ALL: undefined, READY: undefined, PENDING: 'pending', ON_HOLD: 'on-hold', RETURNED: 'returned', FILED: 'filed' };
  const fromKey = VIEW_FROM[view];

  const [paymentFilter] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');
  const [liabilityFilter] = useState<'ALL' | 'REFUND' | 'TAX_DUE'>('ALL');
  const [visaFilter] = useState<string>('ALL');

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
        onOpenWorkspace: (lead) => handleOpenClient(lead, fromKey),
        isSpecialist: true,
      }),
    [handleOpenClient, fromKey]
  );

  const tabs = [
    { id: 'FILING_QUEUE' as FilingTabType, label: 'Ready for Transmission', count: counts.ready, icon: Send },
    { id: 'FILING_IN_PROGRESS' as FilingTabType, label: 'In Transmission', count: counts.inProg, icon: Clock },
    { id: 'FILING_SUCCESS' as FilingTabType, label: 'Accepted by IRS', count: counts.accepted, icon: CheckCircle2 },
    { id: 'REVERTED' as FilingTabType, label: 'Reverted / In Revision', count: counts.reverted, icon: RotateCcw },
    { id: 'ALL' as FilingTabType, label: 'All My Returns', count: counts.all, icon: ListFilter },
  ];

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
      {/* 1. Header & Live Queue Statistics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
            {copy ? copy.title : 'My CPA Filing Queue & Transmissions'}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1 font-normal">
            {copy
              ? `${pageLeads.length} returns · ${copy.subtitle}`
              : 'Transmit Form 1040 XML packages to IRS Modernized e-File (MeF), monitor acknowledgments, and handle CPA audit reviews.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
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

      {/* 2. Live Transmission KPI Cards (legacy queue only) */}
      {view === 'ALL' && (
      <FilingManagerMetrics
        readyCount={counts.ready}
        inProgressCount={counts.inProg}
        acceptedCount={counts.accepted}
        failedCount={counts.failed}
        totalCount={counts.all}
      />
      )}

      {/* 3. Navigation Tabs */}
      {view === 'ALL' && (
        <AppTabs tabs={tabs} activeTab={stageFilter} onChange={(id) => setStageFilter(id as any)} />
      )}
      {view === 'RETURNED' && (
        <AppTabs tabs={returnedTabs} activeTab={returnedTab} onChange={(id) => setReturnedTab(id as ReturnedTab)} size="sm" />
      )}

      {/* 4. Unified Table */}
      <UnifiedTable<FilingLeadItem>
        title="IRS MODERNIZED E-FILE PIPELINE"
        subtitle="Review compliance status, inspect IRS XML schema packages, and transmit Form 1040 returns to the IRS MeF Gateway."
        data={view === 'ALL' ? filteredLeads : pageLeads}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Search taxpayer, state, stage, payment..."
        onExportExcel={() => {
          exportTableToExcel(
            view === 'ALL' ? filteredLeads : pageLeads,
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
            'filing_specialist_queue'
          );
        }}
        onRowClick={(item) => handleOpenClient(item, fromKey)}
        emptyText={
          stageFilter === 'FILING_QUEUE'
            ? 'All your assigned returns have been transmitted, or no returns are awaiting transmission.'
            : 'No returns found matching the selected filter criteria.'
        }
      />
    </div>
  );
};
