import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { PhoneCall, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { SalesAgentQueueTable } from '../components/agent/SalesAgentQueueTable';
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

      {/* 2. My Active Queue Table (Grouped by Client) */}
      <SalesAgentQueueTable
        leads={clientRows}
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
