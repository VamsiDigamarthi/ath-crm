import React, { useMemo } from 'react';
import { AppTable, type ColumnDef } from '@/shared/components/AppTable';
import { AppCopyButton } from '@/shared/components/AppCopyButton';
import { Button } from '@/shared/components/Button';
import { 
  UserCheck, 
  ArrowRight,
  Headphones
} from 'lucide-react';
import type { DocumenterAgentItem } from '../types/documenter.types';

export interface AgentPerformanceRow extends DocumenterAgentItem {
  [key: string]: unknown;
  fullName: string;
  avatar: string;
  callsToday: number;
  connectedCallsToday: number;
  conversionsToday: number;
  avgDuration: string;
  maxCapacity: number;
  teamLeadName: string;
}

export interface AgentPerformanceTableProps {
  agents: AgentPerformanceRow[];
  onAssignToAgent: (agentId: string) => void;
  onFilterByAgent: (agentId: string) => void;
  isLoading?: boolean;
}

export const AgentPerformanceTable: React.FC<AgentPerformanceTableProps> = ({
  agents,
  onAssignToAgent,
  onFilterByAgent,
  isLoading = false,
}) => {
  const columns: ColumnDef<AgentPerformanceRow>[] = useMemo(
    () => [
      {
        header: 'Calling Staff Member',
        accessorKey: 'fullName',
        render: (row) => (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
              {row.email[0].toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                <span>{row.fullName}</span>
                {row.role === 'DOC_TEAM_LEAD' ? (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Team Lead
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200 flex items-center gap-1">
                    <Headphones className="w-2.5 h-2.5 text-[#16A34A]" />
                    Calling Agent
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                <span>{row.email}</span>
                <AppCopyButton text={row.email} size="sm" />
                <span className="text-slate-300">•</span>
                <span className="text-slate-400">Team: {row.teamLeadName}</span>
              </div>
            </div>
          </div>
        ),
      },
      {
        header: 'Active Caseload Capacity',
        accessorKey: 'activeLoad',
        render: (row) => {
          const percentage = Math.min(Math.round((row.activeLoad / (row.maxCapacity || 10)) * 100), 100);
          return (
            <div className="space-y-1.5 w-44">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-900">{row.activeLoad} leads</span>
                <span className="text-slate-400 text-[11px]">{percentage}% of max ({row.maxCapacity})</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    percentage >= 80
                      ? 'bg-amber-500'
                      : percentage >= 40
                      ? 'bg-[#16A34A]'
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.max(percentage, 8)}%` }}
                />
              </div>
            </div>
          );
        },
      },
      {
        header: 'Today\'s Outreach Activity',
        accessorKey: 'callsToday',
        render: (row) => (
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-slate-900">
              {row.callsToday} Dials • {row.connectedCallsToday} Connected
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Avg. Duration: <strong className="text-slate-700">{row.avgDuration}</strong>
            </div>
          </div>
        ),
      },
      {
        header: 'Tax Prep Conversions',
        accessorKey: 'conversionsToday',
        render: (row) => {
          const convRate = row.callsToday > 0 ? Math.round((row.conversionsToday / row.callsToday) * 100) : 0;
          return (
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                {row.conversionsToday} Transferred to Prep
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                {convRate}% Conversion Rate
              </div>
            </div>
          );
        },
      },
      {
        header: 'Workload Status',
        accessorKey: 'activeLoad',
        render: (row) => {
          if (row.activeLoad >= 8) {
            return (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Near Capacity
              </span>
            );
          }
          if (row.activeLoad >= 3) {
            return (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                Optimal Load
              </span>
            );
          }
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Available for Leads
            </span>
          );
        },
      },
      {
        header: 'Manager Actions',
        accessorKey: 'id',
        cellClassName: 'text-right',
        render: (row) => (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onFilterByAgent(row.id)}
              className="h-8 px-2.5 rounded-lg text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1"
              title="View this agent's active lead caseload"
            >
              <span>View Queue</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </Button>
            <Button
              size="sm"
              onClick={() => onAssignToAgent(row.id)}
              className="h-8 px-3 rounded-lg text-xs font-bold bg-[#16A34A] hover:bg-[#15803D] text-white flex items-center gap-1 shadow-2xs"
              title="Assign unassigned leads to this agent"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Assign</span>
            </Button>
          </div>
        ),
      },
    ],
    [onAssignToAgent, onFilterByAgent]
  );

  return (
    <AppTable<AgentPerformanceRow>
      title="Calling Agent Scorecards & Workload Health"
      description="Monitor live caseload capacity, daily outreach activity, call connectivity, and conversion rates across all Documenter staff."
      data={agents}
      columns={columns}
      isLoading={isLoading}
      selectable={false}
      density="comfortable"
      striped
      emptyText="No documenter agents found."
    />
  );
};
