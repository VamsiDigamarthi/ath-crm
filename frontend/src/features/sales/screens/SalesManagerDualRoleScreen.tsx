import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Search, 
  RefreshCw, 
  Phone, 
  Mail, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  FileText, 
  Layers,
  Rocket
} from 'lucide-react';
import { salesService } from '../services/sales-service';
import type { SalesLeadItem } from '../types/sales.types';
import { AppTable } from '@/shared/components/AppTable';
import { AppCopyButton } from '@/shared/components/AppCopyButton';
import { PriorityBadge } from '@/shared/components/PriorityBadge';
import { PriorityFilterSelect } from '@/shared/components/PriorityFilterSelect';
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
  const columns = useMemo(() => [
    {
      header: 'Taxpayer Client',
      accessorKey: 'taxpayerName' as keyof SalesLeadItem,
      render: (row: SalesLeadItem) => (
        <div className="flex items-center gap-3 py-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-emerald-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
            {row.taxpayerName?.charAt(0) || 'T'}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-slate-900 text-xs sm:text-sm hover:text-indigo-600 transition-colors">
                {row.taxpayerName}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                TY {row.taxYear}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-indigo-600" />
                Dual Doc + Sales
              </span>
              {row.visaType && row.visaType !== '-' && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {row.visaType}
                </span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Contact Info',
      render: (row: SalesLeadItem) => (
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700">
            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate max-w-[150px] font-medium">{row.taxpayerEmail || 'N/A'}</span>
            {row.taxpayerEmail && <AppCopyButton text={row.taxpayerEmail} size="sm" />}
          </div>
          <div className="flex items-center gap-1.5 text-slate-700">
            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="font-medium">{row.taxpayerPhone || 'N/A'}</span>
            {row.taxpayerPhone && <AppCopyButton text={row.taxpayerPhone} size="sm" />}
          </div>
        </div>
      ),
    },
    {
      header: 'Dual Calling Agent',
      render: (row: SalesLeadItem) => {
        const agent = row.assignedDocAgent || row.assignedSalesAgent;
        const agentName = agent?.name || agent?.email?.split('@')[0] || 'Unassigned';
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-200">
              {agentName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <span className="font-bold text-slate-900 text-xs block truncate">{agentName}</span>
              <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Intake &amp; Closer
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Current Workflow Phase',
      render: (row: SalesLeadItem) => {
        const phase = getPhaseCategory(row);
        switch (phase) {
          case 'FILING':
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-extrabold bg-purple-100 text-purple-900 border border-purple-300 shadow-2xs">
                <Rocket className="w-3.5 h-3.5 text-purple-700" />
                IRS E-Filing Queue
              </span>
            );
          case 'PAID_SIGNED':
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                Fee Paid &amp; E-Signed
              </span>
            );
          case 'READY_PITCH':
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-extrabold bg-blue-100 text-blue-900 border border-blue-300 shadow-2xs">
                <DollarSign className="w-3.5 h-3.5 text-blue-700" />
                QA Signed Off (Pitch Ready)
              </span>
            );
          case 'TAX_PREP':
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                With Tax Preparer (CPA)
              </span>
            );
          default:
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-extrabold bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs">
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                Document Intake &amp; Outreach
              </span>
            );
        }
      },
    },
    {
      header: '1040 Net & Fee',
      render: (row: SalesLeadItem) => {
        const fedRefund = Number(row.federalRefund) || 0;
        const balDue = Number(row.balanceDue) || 0;
        const fee = row.feeBreakdown?.totalServiceFee || 227;
        const isPaid = row.paymentStatus === 'PAID';

        return (
          <div className="space-y-0.5 text-xs">
            <div className="font-bold text-slate-900">
              {fedRefund > 0 ? (
                <span className="text-emerald-700">+${fedRefund.toLocaleString()} Ref</span>
              ) : balDue > 0 ? (
                <span className="text-rose-700">-${balDue.toLocaleString()} Due</span>
              ) : (
                <span className="text-slate-500">$0 Net</span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-600">${fee} Fee</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold ${
                isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {isPaid ? 'PAID' : 'UNPAID'}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Priority',
      render: (row: SalesLeadItem) => (
        <PriorityBadge priority={row.priority} size="sm" />
      ),
    },
    {
      header: 'Actions',
      render: (row: SalesLeadItem) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => navigate(`/sales/agent/pitch/${row.id}`)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer h-8 px-3.5 whitespace-nowrap"
            title="Open Sales Pitch & Fee Closer Workspace"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Pitch View</span>
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
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-900 border border-indigo-200 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
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

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Dual Leads */}
        <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Dual Leads</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-indigo-900">{metrics.total}</span>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">All active</span>
          </div>
        </div>

        {/* Document Intake */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Intake Active</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-800">{metrics.intakeCount}</span>
            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">Collecting docs</span>
          </div>
        </div>

        {/* Under Tax Prep */}
        <div className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">With Preparer</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-amber-950">{metrics.prepCount}</span>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">CPA prep</span>
          </div>
        </div>

        {/* Ready for Sales Pitch */}
        <div className="bg-white p-4 rounded-xl border border-blue-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block">Pitch Ready</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-blue-950">{metrics.readyPitchCount}</span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">QA Approved</span>
          </div>
        </div>

        {/* Paid & E-Signed */}
        <div className="bg-white p-4 rounded-xl border border-emerald-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">Paid &amp; E-Signed</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-950">{metrics.paidSignedCount}</span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Closed</span>
          </div>
        </div>

        {/* In IRS Filing */}
        <div className="bg-white p-4 rounded-xl border border-purple-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider block">In IRS Filing</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-purple-950">{metrics.filingCount}</span>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">MeF Queue</span>
          </div>
        </div>
      </div>

      {/* 3. Workflow Phase Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-1.5 shadow-xs flex items-center gap-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('ALL')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'ALL'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Dual Leads</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'ALL' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
            {metrics.total}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('INTAKE')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'INTAKE'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Intake Active</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'INTAKE' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
            {metrics.intakeCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('TAX_PREP')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'TAX_PREP'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>With CPA Preparer</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'TAX_PREP' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
            {metrics.prepCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('READY_PITCH')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'READY_PITCH'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Ready for Pitch (QA Approved)</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'READY_PITCH' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
            {metrics.readyPitchCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('PAID_SIGNED')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'PAID_SIGNED'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Paid &amp; E-Signed</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'PAID_SIGNED' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
            {metrics.paidSignedCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('FILING')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'FILING'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Rocket className="w-3.5 h-3.5" />
          <span>IRS Filing Queue</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'FILING' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
            {metrics.filingCount}
          </span>
        </button>
      </div>

      {/* 4. Search & Multi-Dimensional Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="w-full sm:w-80">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search dual leads by taxpayer, phone, agent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium"
            />
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Calling Agent Filter */}
          {availableAgents.length > 0 && (
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 cursor-pointer shadow-2xs"
            >
              <option value="ALL">All Calling Agents</option>
              {availableAgents.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  Agent: {ag.name}
                </option>
              ))}
            </select>
          )}

          {/* Payment Status Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as any)}
            className="px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 cursor-pointer shadow-2xs"
          >
            <option value="ALL">All Payments</option>
            <option value="PAID">Fee Paid</option>
            <option value="UNPAID">Fee Unpaid</option>
          </select>

          {/* Visa Filter */}
          <select
            value={visaFilter}
            onChange={(e) => setVisaFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 cursor-pointer shadow-2xs"
          >
            <option value="ALL">All Visas</option>
            <option value="H-1B">H-1B Speciality</option>
            <option value="L-1">L-1 Intra-Company</option>
            <option value="F-1_OPT">F-1 Student (OPT)</option>
            <option value="O-1">O-1 Extraordinary</option>
            <option value="B1_B2">B1/B2 Visitor</option>
          </select>

          {/* Priority Filter */}
          <PriorityFilterSelect
            value={priorityFilter}
            onChange={(val) => setPriorityFilter(val)}
          />

          {(searchQuery || priorityFilter !== 'ALL' || paymentFilter !== 'ALL' || visaFilter !== 'ALL' || selectedAgent !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setPriorityFilter('ALL');
                setPaymentFilter('ALL');
                setVisaFilter('ALL');
                setSelectedAgent('ALL');
              }}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 px-2 py-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 5. Dual-Role Leads Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <AppTable
          columns={columns as any}
          data={filteredLeads}
          isLoading={isLoading}
          emptyMessage={
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">No Dual-Role Leads Found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {activeTab === 'ALL'
                  ? 'When the Documenter Manager assigns leads with "Also Assign as Sales Closer", they will automatically appear in this dedicated caseload.'
                  : `No dual-role leads currently matching the "${activeTab}" filter tab.`}
              </p>
            </div>
          }
        />
      </div>
    </div>
  );
};
