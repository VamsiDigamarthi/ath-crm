import { useState, useEffect, useCallback, useMemo } from 'react';
import { salesService } from '../services/sales-service';
import type { SalesLeadItem, SalesRepItem, SalesManagerStats } from '../types/sales.types';
import toast from 'react-hot-toast';

export type SalesManagerTab = 
  | 'AWAITING_PITCH' 
  | 'IN_PITCH' 
  | 'QUOTED' 
  | 'PAID_SIGNED' 
  | 'FILING_READY' 
  | 'ALL';

export function useSalesManagerQueue() {
  const [leads, setLeads] = useState<SalesLeadItem[]>([]);
  const [salesReps, setSalesReps] = useState<SalesRepItem[]>([]);
  const [stats, setStats] = useState<SalesManagerStats>({
    pipelineLeads: 0,
    activePitching: 0,
    pendingPayment: 0,
    closedPaidDeals: 0,
    totalRevenueMTD: 0,
    avgDealSize: 0,
    conversionRatePct: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Filters & State
  const [activeTab, setActiveTab] = useState<SalesManagerTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'UNPAID' | 'PAYMENT_LINK_SENT' | 'PAID'>('ALL');
  const [liabilityFilter, setLiabilityFilter] = useState<'ALL' | 'REFUND' | 'TAX_DUE'>('ALL');
  const [visaFilter, setVisaFilter] = useState('ALL');
  const [selectedRows, setSelectedRows] = useState<SalesLeadItem[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [activeLeadForAssign, setActiveLeadForAssign] = useState<SalesLeadItem | null>(null);

  // Fetch all real database data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [leadsRes, staffRes, statsRes] = await Promise.all([
        salesService.getPipelineLeads({ limit: 100 }),
        salesService.getSalesStaff(),
        salesService.getManagerStats(),
      ]);

      setLeads(leadsRes.leads || []);
      setSalesReps(staffRes || []);
      setStats(statsRes);
    } catch {
      toast.error('Failed to load sales department queue');
      setLeads([]);
      setSalesReps([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Tab counts
  const counts = useMemo(() => {
    let awaitingPitch = 0;
    let inPitch = 0;
    let quoted = 0;
    let paidSigned = 0;
    let filingReady = 0;
    let unassigned = 0;

    leads.forEach((l) => {
      if (!l.assignedSalesAgent) unassigned++;

      if (l.currentStage === 'SALES_PITCH_QUEUE') awaitingPitch++;
      else if (l.currentStage === 'SALES_PITCHING') inPitch++;
      else if (l.currentStage === 'QUOTATION_SENT' || l.currentStage === 'PAYMENT_PENDING') quoted++;
      else if (l.currentStage === 'PAID_AND_AUTHORIZED') paidSigned++;
      else if (l.currentStage === 'FILING_QUEUE') filingReady++;
    });

    return {
      all: leads.length,
      unassigned,
      awaitingPitch,
      inPitch,
      quoted,
      paidSigned,
      filingReady,
    };
  }, [leads]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Tab Filtering
      if (activeTab === 'AWAITING_PITCH' && lead.currentStage !== 'SALES_PITCH_QUEUE') return false;
      if (activeTab === 'IN_PITCH' && lead.currentStage !== 'SALES_PITCHING') return false;
      if (activeTab === 'QUOTED' && lead.currentStage !== 'QUOTATION_SENT' && lead.currentStage !== 'PAYMENT_PENDING') return false;
      if (activeTab === 'PAID_SIGNED' && lead.currentStage !== 'PAID_AND_AUTHORIZED') return false;
      if (activeTab === 'FILING_READY' && lead.currentStage !== 'FILING_QUEUE') return false;

      // Payment Filter
      if (paymentFilter !== 'ALL' && lead.paymentStatus !== paymentFilter) return false;

      // Liability Filter (Refund vs Tax Due)
      if (liabilityFilter === 'REFUND' && lead.federalRefund <= 0) return false;
      if (liabilityFilter === 'TAX_DUE' && lead.balanceDue <= 0) return false;

      // Visa Filtering
      if (visaFilter !== 'ALL' && lead.visaType !== visaFilter) return false;

      // Search Filtering
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          lead.taxpayerName.toLowerCase().includes(q) ||
          lead.taxpayerEmail.toLowerCase().includes(q) ||
          lead.taxpayerPhone.toLowerCase().includes(q) ||
          lead.stateOfResidence.toLowerCase().includes(q) ||
          (lead.assignedSalesAgent?.name || '').toLowerCase().includes(q) ||
          (lead.assignedSalesAgent?.email || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [leads, activeTab, paymentFilter, liabilityFilter, visaFilter, searchQuery]);

  // Assign lead(s) to closer via real backend API
  const handleDirectAssign = async (agentId: string) => {
    setIsActionLoading(true);
    try {
      const targetIds = activeLeadForAssign
        ? [activeLeadForAssign.id]
        : selectedRows.map((r) => r.id);

      if (targetIds.length === 0) {
        toast.error('Please select at least one lead to assign');
        return;
      }

      await salesService.assignLead({
        applicationId: targetIds.join(','),
        salesAgentId: agentId,
      });

      toast.success(`Assigned ${targetIds.length} lead${targetIds.length > 1 ? 's' : ''} to closer!`);
      setIsAssignModalOpen(false);
      setActiveLeadForAssign(null);
      setSelectedRows([]);
      fetchData();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to assign sales lead');
    } finally {
      setIsActionLoading(false);
    }
  };

  // 1-Click Auto Round-Robin via real backend API
  const handleAutoRoundRobin = async () => {
    setIsActionLoading(true);
    try {
      const res: any = await salesService.autoRoundRobin();
      toast.success(res?.message || 'Auto Round-Robin completed! 🎯');
      setIsAssignModalOpen(false);
      setActiveLeadForAssign(null);
      setSelectedRows([]);
      fetchData();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to execute auto round robin');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleOpenAssignModal = (lead?: SalesLeadItem) => {
    if (lead) {
      setActiveLeadForAssign(lead);
    } else {
      setActiveLeadForAssign(null);
    }
    setIsAssignModalOpen(true);
  };

  const handleCloseAssignModal = () => {
    setIsAssignModalOpen(false);
    setActiveLeadForAssign(null);
  };

  return {
    leads: filteredLeads,
    rawLeads: leads,
    salesReps,
    stats,
    counts,
    isLoading,
    isActionLoading,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    paymentFilter,
    setPaymentFilter,
    liabilityFilter,
    setLiabilityFilter,
    visaFilter,
    setVisaFilter,
    selectedRows,
    setSelectedRows,
    isAssignModalOpen,
    activeLeadForAssign,
    handleOpenAssignModal,
    handleCloseAssignModal,
    handleDirectAssign,
    handleAutoRoundRobin,
    refreshData: fetchData,
  };
}
