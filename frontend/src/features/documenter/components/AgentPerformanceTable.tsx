import React, { useMemo } from 'react';
import { UnifiedTable } from '@/shared/components/table/UnifiedTable';
import { TaxpayerCell } from '@/shared/components/table/TaxpayerCell';
import { exportTableToExcel } from '@/shared/utils/export-excel';
import { Button } from '@/shared/components/Button';
import type { ColumnDef } from '@tanstack/react-table';
import type { DocumenterAgentItem } from '../types/documenter.types';
import { ArrowRight } from 'lucide-react';

export interface AgentPerformanceRow extends DocumenterAgentItem {
  [key: string]: unknown;
  fullName: string;
  avatar: string;
  callsToday: number;
  connectedCallsToday: number;
  conversionsToday: number;
  avgDuration: string;
  teamLeadName?: string;
}

export interface AgentPerformanceTableProps {
  agents: AgentPerformanceRow[];
  totalDepartmentLeads?: number;
  onFilterByAgent: (agentId: string) => void;
  isLoading?: boolean;
}

export const AgentPerformanceTable: React.FC<AgentPerformanceTableProps> = ({
  agents,
  onFilterByAgent,
  isLoading = false,
}) => {
  const columns = useMemo<ColumnDef<AgentPerformanceRow, any>[]>(
    () => [
      {
        id: 'agent',
        header: 'STAFF MEMBER',
        accessorFn: (row) => `${row.fullName} ${row.email}`,
        cell: ({ row }) => (
          <TaxpayerCell
            name={row.original.fullName}
            email={row.original.email}
          />
        ),
      },
      {
        id: 'role',
        header: 'ROLE',
        accessorKey: 'role',
        cell: ({ row }) => (
          <span className="text-xs text-zinc-700">
            {row.original.role.replace(/_/g, ' ')}
          </span>
        ),
      },
      {
        id: 'load',
        header: 'ACTIVE CASELOAD',
        accessorKey: 'activeLoad',
        cell: ({ row }) => (
          <span className="text-xs font-semibold text-zinc-900">
            {row.original.activeLoad || 0} Leads
          </span>
        ),
      },
      {
        id: 'dials',
        header: 'TODAY DIALS',
        accessorKey: 'callsToday',
        cell: ({ row }) => (
          <span className="text-xs text-zinc-700">
            {row.original.callsToday || 0} ({row.original.connectedCallsToday || 0} conn)
          </span>
        ),
      },
      {
        id: 'conversions',
        header: 'CONVERSIONS',
        accessorKey: 'conversionsToday',
        cell: ({ row }) => (
          <span className="text-xs font-semibold text-emerald-700">
            {row.original.conversionsToday || 0}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'ACTION',
        enableSorting: false,
        enableHiding: false,
        meta: {
          disableMenu: true,
          disableFilter: true,
        },
        cell: ({ row }) => (
          <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onFilterByAgent(row.original.id)}
              className="h-7 px-2.5 text-[11px] font-normal border-zinc-200 text-zinc-700 hover:bg-zinc-50 cursor-pointer flex items-center gap-1"
            >
              <span>View Queue</span>
              <ArrowRight className="w-3 h-3 text-zinc-400" />
            </Button>
          </div>
        ),
      },
    ],
    [onFilterByAgent]
  );

  const handleExport = () => {
    exportTableToExcel(
      agents,
      [
        { header: 'Staff Member', key: 'fullName' },
        { header: 'Email', key: 'email' },
        { header: 'Role', key: 'role' },
        { header: 'Active Caseload', key: 'activeLoad' },
        { header: 'Calls Today', key: 'callsToday' },
        { header: 'Conversions', key: 'conversionsToday' },
      ],
      'documenter_staff_scorecards'
    );
  };

  return (
    <div className="space-y-4 font-sans">
      <UnifiedTable<AgentPerformanceRow>
        title="CALLING AGENT SCORECARDS & WORKLOAD HEALTH"
        subtitle="Monitor live caseload capacity, daily outreach activity, call connectivity, and conversion rates."
        data={agents}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Search staff by name, email, or role..."
        onExportExcel={handleExport}
        emptyText="No documenter agents found."
      />
    </div>
  );
};
