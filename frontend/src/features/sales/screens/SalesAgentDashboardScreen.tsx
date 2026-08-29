import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhoneCall, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { SalesAgentStatsCards } from '../components/agent/SalesAgentStatsCards';
import { SalesAgentQueueTable } from '../components/agent/SalesAgentQueueTable';
import { INITIAL_AGENT_STATS, INITIAL_SALES_LEADS } from '../constants/sales-mock-data';

export const SalesAgentDashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const [stats] = useState(INITIAL_AGENT_STATS);
  const [leads] = useState(INITIAL_SALES_LEADS);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* 1. Welcome & Quick CTA Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Sales Closer Daily Operations Hub
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Call taxpayers, pitch eligible tax refund deductions, collect service payments, and authorize Form 8879.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => navigate('/sales/agent/queue')}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Go to My Pitch Queue</span>
          <ArrowRight className="w-3 h-3" />
        </Button>
      </div>

      {/* 2. Top KPI Cards */}
      <SalesAgentStatsCards stats={stats} />

      {/* 3. My Active Leads Table */}
      <SalesAgentQueueTable leads={leads} />
    </div>
  );
};
