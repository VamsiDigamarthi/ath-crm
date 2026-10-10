import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  FileText, 
  Layers,
  Rocket
} from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { salesService } from '../services/sales-service';
import type { SalesLeadItem } from '../types/sales.types';
import { UnifiedTable } from '@/shared/components/table/UnifiedTable';
import { ClientNameCell, ClientEmailCell, ClientPhoneCell } from '@/shared/components/table';
import { AppTabs } from '@/shared/components/AppTabs';
import { PriorityBadge } from '@/shared/components/PriorityBadge';
import { CompactStatCards } from '@/shared/components/CompactStatCards';
import { AppFilterFlyout, type FilterCategory } from '@/shared/components/AppFilterFlyout';
import { StatsToggleButton } from '@/shared/components/StatsToggleButton';
import { useStatsVisibility } from '@/shared/hooks/useStatsVisibility';
import { SYSTEM_PRIORITIES } from '@/shared/constants/system-enums';
import { Button } from '@/shared/components/Button';
import toast from 'react-hot-toast';

export type DualRoleFilterTab = 'ALL' | 'INTAKE' | 'TAX_PREP' | 'READY_PITCH' | 'PAID_SIGNED' | 'FILING';

export const SalesManagerDualRoleScreen: React.FC = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<SalesLeadItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [activeTab, setActiveTab] = useState<DualRoleFilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'UNPAID' | 'PAID'>('ALL');
  const [visaFilter, setVisaFilter] = useState('ALL');
  const [selectedAgent, setSelectedAgent] = useState('ALL');

  const fetchDualLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      // Query dual-role leads
      const res = await salesService.getPipelineLeads({ limit: 150, isDualRole: true });
      const rawLeads = res.leads || [];
      // Defensive client-side check to ensure only dual role leads are shown
      const dualLeads = rawLeads.filter((l) => Boolean(l.isDualDocSalesRole || (l.taxDraftSummary as any)?.isDualDocSalesRole));
      setLeads(dualLeads);
    } catch {
      toast.error('Failed to load dual-role pipeline leads');
      setLeads([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDualLeads();
  }, [fetchDualLeads]);

  // Unique list of assigned calling agents
  const availableAgents = useMemo(() => {
    const map = new Map<string, string>();
    leads.forEach((l) => {
      const agent = l.assignedDocAgent || l.assignedSalesAgent;
      if (agent?.id && agent?.name) {
        map.set(agent.id, agent.name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [leads]);

  // Compute Lifecycle Stage Categorization
  const getPhaseCategory = (lead: SalesLeadItem): 'INTAKE' | 'TAX_PREP' | 'READY_PITCH' | 'PAID_SIGNED' | 'FILING' => {
    const stage = lead.currentStage as string;
    const draft = lead.taxDraftSummary || {};

    if (['FILING_QUEUE', 'FILING_IN_PROGRESS', 'FILING_SUCCESS'].includes(stage)) {
      return 'FILING';
    }
    if (lead.paymentStatus === 'PAID' && (lead.esignStatus === 'SIGNED' || lead.currentStage === 'PAID_AND_AUTHORIZED')) {
      return 'PAID_SIGNED';
    }
    if (
      stage === 'SALES_PITCH_QUEUE' || 
      stage === 'SALES_PITCHING' || 
      stage === 'QUOTATION_SENT' || 
      stage === 'PAYMENT_PENDING' ||
      draft.status === 'QA_APPROVED'
    ) {
      return 'READY_PITCH';
    }
    if (stage === 'DOC_PREP' || stage === 'CORRECTION_NEEDED' || draft.status === 'SUBMITTED_FOR_QA' || draft.status === 'REVISION_REQUESTED') {
      return 'TAX_PREP';
    }
    return 'INTAKE';
  };

  // KPI Metrics
  const metrics = useMemo(() => {
    let intakeCount = 0;
    let prepCount = 0;
    let readyPitchCount = 0;
    let paidSignedCount = 0;
    let filingCount = 0;
    let totalRevenue = 0;

    leads.forEach((l) => {
      const cat = getPhaseCategory(l);
      if (cat === 'INTAKE') intakeCount++;
      else if (cat === 'TAX_PREP') prepCount++;
      else if (cat === 'READY_PITCH') readyPitchCount++;
      else if (cat === 'PAID_SIGNED') {
        paidSignedCount++;
        totalRevenue += l.feeBreakdown?.totalServiceFee || 0;
      } else if (cat === 'FILING') {
        filingCount++;
        totalRevenue += l.feeBreakdown?.totalServiceFee || 0;
      }
    });

    return {
      total: leads.length,
      intakeCount,
      prepCount,
      readyPitchCount,
      paidSignedCount,
      filingCount,
      totalRevenue,
    };
  }, [leads]);

  // Stat cards toggle + Filters flyout. The flyout drives the same single-value
  // filter states as before (last picked value per category), so filtering logic is unchanged.
  const { showStats, toggleStats } = useStatsVisibility('sales_mgr_dual');
  const filterCategories = useMemo<FilterCategory[]>(
    () => [
      { id: 'agent', label: 'Calling agent', options: availableAgents.map((ag) => ({ label: ag.name, value: ag.id })) },
      {
        id: 'payment',
        label: 'Payment',
        options: [
          { label: 'Fee paid', value: 'PAID' },
          { label: 'Fee unpaid', value: 'UNPAID' },
        ],
      },
      {
        id: 'visa',
        label: 'Visa Type',
        options: [
          { label: 'H-1B Speciality', value: 'H-1B' },
          { label: 'L-1 Intra-Company', value: 'L-1' },
          { label: 'F-1 Student (OPT)', value: 'F-1_OPT' },
          { label: 'O-1 Extraordinary', value: 'O-1' },
          { label: 'B1/B2 Visitor', value: 'B1_B2' },
        ],
      },
      { id: 'priority', label: 'Priority', options: SYSTEM_PRIORITIES.map((p) => ({ label: p.label, value: p.value })) },
    ],
    [availableAgents]
  );
  const selectedFilters = useMemo(
    () => ({
      agent: selectedAgent !== 'ALL' ? [selectedAgent] : [],
      payment: paymentFilter !== 'ALL' ? [paymentFilter] : [],
      visa: visaFilter !== 'ALL' ? [visaFilter] : [],
      priority: priorityFilter !== 'ALL' ? [priorityFilter] : [],
    }),
    [selectedAgent, paymentFilter, visaFilter, priorityFilter]
  );
  const applyFilters = (f: Record<string, string[]>) => {
    const last = (v?: string[]) => (v && v.length > 0 ? v[v.length - 1] : 'ALL');
    setSelectedAgent(last(f.agent));
    setPaymentFilter(last(f.payment) as 'ALL' | 'UNPAID' | 'PAID');
    setVisaFilter(last(f.visa));
    setPriorityFilter(last(f.priority));
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const category = getPhaseCategory(lead);

      // Tab filter
      if (activeTab === 'INTAKE' && category !== 'INTAKE') return false;
      if (activeTab === 'TAX_PREP' && category !== 'TAX_PREP') return false;
      if (activeTab === 'READY_PITCH' && category !== 'READY_PITCH') return false;
      if (activeTab === 'PAID_SIGNED' && category !== 'PAID_SIGNED') return false;
      if (activeTab === 'FILING' && category !== 'FILING') return false;

      // Agent filter
      if (selectedAgent !== 'ALL') {
        const agentId = lead.assignedDocAgent?.id || lead.assignedSalesAgent?.id;
        if (agentId !== selectedAgent) return false;
      }

      // Priority filter
      if (priorityFilter !== 'ALL' && (lead.priority || 'NO_PRIORITY') !== priorityFilter) return false;

      // Payment filter
      if (paymentFilter === 'PAID' && lead.paymentStatus !== 'PAID') return false;
      if (paymentFilter === 'UNPAID' && lead.paymentStatus === 'PAID') return false;

      // Visa filter
      if (visaFilter !== 'ALL' && lead.visaType !== visaFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const name = (lead.taxpayerName || '').toLowerCase();
        const email = (lead.taxpayerEmail || '').toLowerCase();
        const phone = (lead.taxpayerPhone || '').toLowerCase();
        const state = (lead.stateOfResidence || '').toLowerCase();
        const agentName = (lead.assignedDocAgent?.name || lead.assignedSalesAgent?.name || '').toLowerCase();
        if (!name.includes(q) && !email.includes(q) && !phone.includes(q) && !state.includes(q) && !agentName.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [leads, activeTab, selectedAgent, priorityFilter, paymentFilter, visaFilter, searchQuery]);

  // Table Columns
  const columns = useMemo<ColumnDef<SalesLeadItem, any>[]>(() => [
    {
      id: 'name',
      header: 'NAME',
      accessorFn: (row) => row.taxpayerName || '—',
      cell: ({ row }) => (
        <ClientNameCell
          name={row.original.taxpayerName || '—'}
          badge={
            <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Dual
            </span>
          }
          status={(row.original as any).clientPaymentStatus}
        />
      ),
    },
    {
      id: 'email',
      header: 'EMAIL',
      accessorFn: (row) => row.taxpayerEmail || '—',
      cell: ({ row }) => (
        <ClientEmailCell email={row.original.taxpayerEmail} />
      ),
    },
    {
      id: 'phone',
      header: 'MOBILE',
      accessorFn: (row) => row.taxpayerPhone || '—',
      cell: ({ row }) => (
        <ClientPhoneCell phone={row.original.taxpayerPhone} />
      ),
    },
    {
      id: 'taxYear',
      header: 'TY',
      accessorFn: (row) => `TY ${row.taxYear || 2025}`,
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-slate-800">
          {row.original.taxYear || 2025}
        </span>
      ),
    },
    {
      id: 'callingAgent',
      header: 'CALLING AGENT',
      accessorFn: (row) => {
        const agent = row.assignedDocAgent || row.assignedSalesAgent;
        return agent?.name || agent?.email?.split('@')[0] || 'Unassigned';
      },
      cell: ({ row }) => {
        const agent = row.original.assignedDocAgent || row.original.assignedSalesAgent;
        const agentName = agent?.name || agent?.email?.split('@')[0] || 'Unassigned';
        return (
          <span className="text-xs font-medium text-slate-800">
            {agentName}
          </span>
        );
      },
    },
    {
      id: 'workflowPhase',
      header: 'WORKFLOW PHASE',
      accessorFn: (row) => getPhaseCategory(row),
      cell: ({ row }) => {
        const phase = getPhaseCategory(row.original);
        switch (phase) {
          case 'FILING':
            return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                <Rocket className="w-3 h-3 text-purple-600" />
                IRS E-Filing Queue
              </span>
            );
          case 'PAID_SIGNED':
            return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Paid &amp; E-Signed
              </span>
            );
          case 'READY_PITCH':
            return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                <DollarSign className="w-3 h-3 text-blue-600" />
                Pitch Ready
              </span>
            );
          case 'TAX_PREP':
            return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                <Clock className="w-3 h-3 text-amber-600" />
                With Preparer
              </span>
            );
          default:
            return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                <FileText className="w-3 h-3 text-slate-500" />
                Doc Intake
              </span>
            );
        }
      },
    },
    {
      id: 'netFee',
      header: '1040 NET & FEE',
      cell: ({ row }) => {
        const item = row.original;
        const fedRefund = Number(item.federalRefund) || 0;
        const balDue = Number(item.balanceDue) || 0;
        const fee = item.feeBreakdown?.totalServiceFee || 0;

        return (
          <div className="space-y-0.5 text-xs">
            <div>
              {fedRefund > 0 ? (
                <span className="text-emerald-700 font-medium">+${fedRefund.toLocaleString()}</span>
              ) : balDue > 0 ? (
                <span className="text-rose-700 font-medium">-${balDue.toLocaleString()}</span>
              ) : (
                <span className="text-slate-500">$0</span>
              )}
              {fee > 0 && <span className="text-slate-400 ml-1.5">• Fee ${fee}</span>}
            </div>
          </div>
        );
      },
    },
    {
      id: 'priority',
      header: 'PRIORITY',
      accessorKey: 'priority',
      cell: ({ row }) => <PriorityBadge priority={row.original.priority} size="sm" />,
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
            onClick={() => navigate(`/sales/agent/pitch/${row.original.id}`)}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-[11px] font-medium flex items-center gap-1 shadow-2xs cursor-pointer h-7 px-2.5"
            title="Open Sales Pitch & Fee Closer Workspace"
          >
            <DollarSign className="w-3 h-3" />
            <span>Pitch</span>
          </Button>
        </div>
      ),
    },
  ], [navigate]);

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      {/* 1. Header & Live Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Dual Doc + Sales Closer Operations
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-slate-500" />
              Unified Intake + Closing Caseload
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Supervise leads assigned for end-to-end management where the Calling Agent conducts Document Intake &amp; closes the Sales Pitch.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDualLeads}
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Queue</span>
          </Button>
        </div>
      </div>

      {/* 2. Summary cards (compact) */}
      {showStats && (
        <CompactStatCards
          cards={[
            { name: 'Total dual leads', value: metrics.total, hint: 'All active' },
            { name: 'Intake active', value: metrics.intakeCount, hint: 'Collecting docs', tone: 'text-slate-700' },
            { name: 'With preparer', value: metrics.prepCount, hint: 'CPA prep', tone: 'text-amber-700' },
            { name: 'Pitch ready', value: metrics.readyPitchCount, hint: 'QA approved', tone: 'text-blue-700' },
            { name: 'Paid & e-signed', value: metrics.paidSignedCount, hint: `${metrics.filingCount} in IRS filing`, tone: 'text-emerald-700' },
          ]}
        />
      )}

      {/* 3. Workflow Phase Tabs */}
      <div>
        <AppTabs
          tabs={[
            { id: 'ALL', label: 'All Dual Leads', count: metrics.total, icon: Layers },
            { id: 'INTAKE', label: 'Intake Active', count: metrics.intakeCount, icon: FileText },
            { id: 'TAX_PREP', label: 'With CPA Preparer', count: metrics.prepCount, icon: Clock },
            { id: 'READY_PITCH', label: 'Ready for Pitch (QA Approved)', count: metrics.readyPitchCount, icon: DollarSign },
            { id: 'PAID_SIGNED', label: 'Paid & E-Signed', count: metrics.paidSignedCount, icon: CheckCircle2 },
            { id: 'FILING', label: 'IRS Filing Queue', count: metrics.filingCount, icon: Rocket },
          ]}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as any)}
        />
      </div>

      {/* 5. Dual-Role Leads Data Table */}
      <UnifiedTable<SalesLeadItem>
        columns={columns}
        data={filteredLeads}
        isLoading={isLoading}
        searchPlaceholder="Search taxpayer, email, phone, agent..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        extraHeaderActions={
          <div className="flex items-center gap-2">
            <StatsToggleButton visible={showStats} onToggle={toggleStats} />
            <AppFilterFlyout categories={filterCategories} selectedFilters={selectedFilters} onApply={applyFilters} onReset={() => applyFilters({})} />
          </div>
        }
        emptyText={
          activeTab === 'ALL'
            ? 'When the Documenter Manager assigns leads with "Also Assign as Sales Closer", they will automatically appear in this dedicated caseload.'
            : `No dual-role leads currently matching the "${activeTab}" filter tab.`
        }
      />
    </div>
  );
};
