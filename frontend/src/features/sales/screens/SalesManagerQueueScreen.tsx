import React, { useState } from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { SalesManagerStatsCards } from '../components/manager/SalesManagerStatsCards';
import { SalesManagerPipelineTable } from '../components/manager/SalesManagerPipelineTable';
import { 
  INITIAL_MANAGER_STATS,
  INITIAL_SALES_REPS, 
  INITIAL_SALES_LEADS 
} from '../constants/sales-mock-data';
import type { SalesLeadItem, SalesRepItem } from '../types/sales.types';
import toast from 'react-hot-toast';

export const SalesManagerQueueScreen: React.FC = () => {
  const [stats] = useState(INITIAL_MANAGER_STATS);
  const [salesReps] = useState<SalesRepItem[]>(INITIAL_SALES_REPS);
  const [leads, setLeads] = useState<SalesLeadItem[]>(INITIAL_SALES_LEADS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Department queue refreshed');
    }, 400);
  };

  const handleAssignLead = (leadId: string, agentId: string) => {
    const rep = salesReps.find((r: SalesRepItem) => r.id === agentId);
    if (!rep) return;

    setLeads((prev: SalesLeadItem[]) =>
      prev.map((item: SalesLeadItem) =>
        item.id === leadId
          ? {
              ...item,
              assignedSalesAgent: {
                id: rep.id,
                name: rep.name,
                email: rep.email,
              },
              currentStage: item.currentStage === 'SALES_PITCH_QUEUE' ? 'SALES_PITCHING' : item.currentStage,
            }
          : item
      )
    );
  };

  const handleAutoRoundRobin = () => {
    let repIndex = 0;
    const unassigned = leads.filter((l: SalesLeadItem) => !l.assignedSalesAgent);
    if (unassigned.length === 0) {
      toast('All pipeline leads are already assigned!', { icon: 'ℹ️' });
      return;
    }

    setLeads((prev: SalesLeadItem[]) =>
      prev.map((item: SalesLeadItem) => {
        if (!item.assignedSalesAgent) {
          const assignedRep = salesReps[repIndex % salesReps.length];
          repIndex++;
          return {
            ...item,
            assignedSalesAgent: {
              id: assignedRep.id,
              name: assignedRep.name,
              email: assignedRep.email,
            },
            currentStage: 'SALES_PITCHING',
          };
        }
        return item;
      })
    );

    toast.success(`Auto Round-Robin successfully distributed ${unassigned.length} leads across closers! 🎯`);
  };

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Sales &amp; Fee Quotation Department Caseload
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Monitor QA-approved tax returns, distribute pipeline to closers, track payment checkouts and e-sign authorizations.
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
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={handleAutoRoundRobin}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1-Click Auto Round-Robin</span>
          </Button>
        </div>
      </div>

      {/* 2. Manager Top KPI Cards */}
      <SalesManagerStatsCards stats={stats} />

      {/* 3. Pipeline Table */}
      <SalesManagerPipelineTable
        leads={leads}
        salesReps={salesReps}
        onAssignLead={handleAssignLead}
        onAutoRoundRobin={handleAutoRoundRobin}
      />
    </div>
  );
};
