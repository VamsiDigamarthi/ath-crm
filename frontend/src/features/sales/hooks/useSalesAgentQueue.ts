import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { salesService } from '../services/sales-service';
import type { SalesLeadItem, SalesAgentStats } from '../types/sales.types';
import toast from 'react-hot-toast';

export type SalesAgentTab = 'ALL' | 'PENDING' | 'CALLBACKS' | 'FOLLOW_UPS' | 'CONVERTED';

export function useSalesAgentQueue(defaultTab: SalesAgentTab = 'ALL') {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<SalesAgentTab>(defaultTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [allLeads, setAllLeads] = useState<SalesLeadItem[]>([]);

  // Keep activeTab in sync if defaultTab changes on route change
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // Fetch real leads strictly assigned to current Sales Closer
  const fetchAgentLeads = useCallback(async () => {
    try {
      const response = await salesService.getPipelineLeads({ limit: 100 });
      const rawLeads = response.leads || [];

      const currentUserId = user?.id;
      const currentUserEmail = user?.email?.toLowerCase().trim();
      const isManager = user?.role === 'SALES_MANAGER' || user?.role === 'ADMIN';

      // If user is manager/admin, show all pipeline leads. Otherwise, show leads assigned to current Closer
      const assignedToMe = isManager
        ? rawLeads
        : rawLeads.filter((lead) => {
            if (!lead.assignedSalesAgent) return false;
            if (currentUserId && lead.assignedSalesAgent.id === currentUserId) return true;
            if (currentUserEmail && lead.assignedSalesAgent.email?.toLowerCase().trim() === currentUserEmail) return true;
            return false;
          });

      setAllLeads(assignedToMe);
    } catch {
      toast.error('Failed to sync live sales pitch queue');
      setAllLeads([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.id, user?.email, user?.role]);

  useEffect(() => {
    fetchAgentLeads();
  }, [fetchAgentLeads]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAgentLeads();
    toast.success('Live pitch queue refreshed');
  };

  const handleUpdatePriority = useCallback(async (applicationId: string, priority: string) => {
    try {
      await salesService.updatePriority(applicationId, priority);
      toast.success('Priority updated');
      fetchAgentLeads();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to update priority');
    }
  }, [fetchAgentLeads]);

  // Helper stage checks
  const isReturnReverted = (lead: SalesLeadItem) => {
    const draftStatus = (lead.taxDraftSummary as any)?.status;
    const lastRevert = (lead.taxDraftSummary as any)?.lastRevert;
    return (
      lead.currentStage === 'CORRECTION_NEEDED' ||
      lead.currentStage === 'DOC_OUTREACH' ||
      lead.currentStage === 'DOC_PREP' ||
      draftStatus === 'REVISION_REQUESTED' ||
      draftStatus === 'REVERTED_TO_DOCUMENTER' ||
      Boolean(lastRevert && !lastRevert.resolved)
    );
  };

  // 1. Converted Clients: Paid, authorized, or transferred to filing
  const isLeadConverted = (lead: SalesLeadItem) => {
    if (isReturnReverted(lead)) return false;
    return (
      lead.paymentStatus === 'PAID' ||
      lead.currentStage === 'PAID_AND_AUTHORIZED' ||
      lead.currentStage === 'FILING_QUEUE' ||
      lead.currentStage === 'FILING_IN_PROGRESS' ||
      lead.currentStage === 'FILING_SUCCESS' ||
      lead.clientPaymentStatus === 'PAID'
    );
  };

  // 2. Scheduled Callbacks: Explicit callback scheduled, callback disposition, or appointment notes
  const isLeadCallback = (lead: SalesLeadItem) => {
    if (isReturnReverted(lead) || isLeadConverted(lead)) return false;
    const hasCallbackDate = Boolean(lead.callbackScheduledAt || (lead.taxDraftSummary as any)?.callbackScheduledAt);
    const hasCallbackDisposition = ['CALLBACK', 'SCHEDULED_CALLBACK', 'PITCH_CALLBACK'].includes(lead.callDisposition || '');
    const hasCallbackPitchStatus = lead.pitchStatus === 'NEED_CALL_WITH_CPA' || (lead.salesPitch?.pitchStatus === 'NEED_CALL_WITH_CPA');
    const notes = `${lead.closerCallNotes || ''} ${lead.notes || ''} ${lead.salesPitch?.comment || ''}`.toLowerCase();
    const hasCallbackNote = notes.includes('callback') || notes.includes('call back') || notes.includes('call at') || notes.includes('call tomorrow') || notes.includes('call scheduled');
    return hasCallbackDate || hasCallbackDisposition || hasCallbackPitchStatus || hasCallbackNote;
  };

  // 3. Follow-Ups: Active quotation sent, payment pending, discount negotiation, or in-discussion review
  const isLeadFollowUp = (lead: SalesLeadItem) => {
    if (isReturnReverted(lead) || isLeadConverted(lead) || isLeadCallback(lead)) return false;
    const hasQuoteSent = lead.currentStage === 'QUOTATION_SENT' || Boolean(lead.feeBreakdown?.isQuoted);
    const isPaymentPending = (
      lead.currentStage === 'PAYMENT_PENDING' ||
      lead.currentStage === 'SALES_PAYMENT_PENDING' ||
      lead.currentStage === 'SALES_ESIGN_PENDING' ||
      lead.paymentStatus === 'PAYMENT_LINK_SENT' ||
      lead.paymentStatus === 'PARTIALLY_PAID'
    );
    const hasNegotiation = (
      lead.pitchStatus === 'NEED_TIME' ||
      lead.pitchStatus === 'PRICING_ISSUE' ||
      lead.salesPitch?.pitchStatus === 'NEED_TIME' ||
      lead.salesPitch?.pitchStatus === 'PRICING_ISSUE' ||
      Boolean(lead.negotiatedAmount) ||
      (lead.feeBreakdown?.discountAmount || 0) > 0
    );
    const hasContactHistory = Boolean(lead.lastContactedAt || lead.closerCallNotes || (lead.closerNotesHistory && lead.closerNotesHistory.length > 0));
    return hasQuoteSent || isPaymentPending || hasNegotiation || (lead.currentStage === 'SALES_PITCHING' && hasContactHistory);
  };

  // 4. Pending Prospects: Untouched, fresh from QA, awaiting initial outreach call
  const isLeadPending = (lead: SalesLeadItem) => {
    if (isReturnReverted(lead) || isLeadConverted(lead) || isLeadCallback(lead) || isLeadFollowUp(lead)) return false;
    return true;
  };

  // Compute live tab counts
  const counts = useMemo(() => {
    let pending = 0;
    let callbacks = 0;
    let followUps = 0;
    let converted = 0;
    let reverted = 0;

    allLeads.forEach((lead) => {
      if (isReturnReverted(lead)) reverted++;
      else if (isLeadConverted(lead)) converted++;
      else if (isLeadCallback(lead)) callbacks++;
      else if (isLeadFollowUp(lead)) followUps++;
      else pending++;
    });

    return {
      all: allLeads.length,
      pending,
      callbacks,
      followUps,
      converted,
      reverted,
    };
  }, [allLeads]);

  // Compute live dynamic KPI stats
  const stats: SalesAgentStats = useMemo(() => {
    let revenueToday = 0;

    allLeads.forEach((lead) => {
      if (isLeadConverted(lead)) {
        const fee = Number(lead.feeBreakdown?.totalServiceFee) || 0;
        revenueToday += fee;
      }
    });

    const total = allLeads.length;
    const conversionRate = total > 0 ? Math.round((counts.converted / total) * 100) : 0;

    return {
      assignedLeads: counts.pending,
      pitchInProgress: counts.pending,
      paymentsPending: counts.followUps,
      dealsClosedToday: counts.converted,
      myRevenueToday: revenueToday,
      myConversionRate: conversionRate,
      revertedLeads: counts.reverted,
    };
  }, [allLeads, counts]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return allLeads.filter((lead) => {
      if (activeTab === 'PENDING' && !isLeadPending(lead)) return false;
      if (activeTab === 'CALLBACKS' && !isLeadCallback(lead)) return false;
      if (activeTab === 'FOLLOW_UPS' && !isLeadFollowUp(lead)) return false;
      if (activeTab === 'CONVERTED' && !isLeadConverted(lead)) return false;

      // Priority Filter
      if (priorityFilter !== 'ALL' && (lead.priority || 'NO_PRIORITY') !== priorityFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          (lead.taxpayerName || '').toLowerCase().includes(q) ||
          (lead.taxpayerEmail || '').toLowerCase().includes(q) ||
          (lead.taxpayerPhone || '').toLowerCase().includes(q) ||
          (lead.stateOfResidence || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allLeads, activeTab, priorityFilter, searchQuery]);

  const clientRows = useMemo(() => {
    const seen = new Set<string>();
    return filteredLeads.filter((l) => {
      const key = l.taxpayerId || l.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [filteredLeads]);

  const handleOpenPitch = (leadId: string) => {
    navigate(`/sales/agent/pitch/${leadId}`);
  };

  const handleOpenNextPriority = () => {
    if (filteredLeads.length > 0) {
      const next = filteredLeads[0];
      navigate(`/sales/agent/client/${next.taxpayerId || next.id || next.applicationId}`);
    } else {
      toast('No pending returns in pitch queue', { icon: 'ℹ️' });
    }
  };

  return {
    isLoading,
    isRefreshing,
    allLeads,
    counts,
    stats,
    filteredLeads,
    clientRows,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    priorityFilter,
    setPriorityFilter,
    handleRefresh,
    handleUpdatePriority,
    handleOpenPitch,
    handleOpenNextPriority,
  };
}
