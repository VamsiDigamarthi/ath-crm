import React from 'react';
import { PhoneCall, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { SalesAgentStatsCards } from '../components/agent/SalesAgentStatsCards';
import { SalesAgentQueueTable } from '../components/agent/SalesAgentQueueTable';
import { useSalesAgentQueue } from '../hooks/useSalesAgentQueue';

export const SalesAgentQueueScreen: React.FC = () => {
  const {
    isLoading,
    isRefreshing,
    allLeads,
    stats,
    handleRefresh,
    handleOpenNextPriority,
  } = useSalesAgentQueue();

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      {/* 1. Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            My Active Sales &amp; Fee Quotation Pitch Queue
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Call QA-approved taxpayers, pitch certified Form 1040 deductions, quote custom filing fees, and collect payment checkouts.
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

      {/* 2. Top KPI Cards */}
      <SalesAgentStatsCards stats={stats} />

      {/* 3. My Active Queue Table */}
      <SalesAgentQueueTable leads={allLeads} isLoading={isLoading} />
    </div>
  );
};
