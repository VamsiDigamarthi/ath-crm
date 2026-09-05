import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { salesService } from '../services/sales-service';
import type { SalesLeadItem, SalesAgentStats } from '../types/sales.types';
import toast from 'react-hot-toast';

export type SalesAgentTab = 'ALL' | 'AWAITING' | 'QUOTED' | 'PAID';

export function useSalesAgentQueue() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<SalesAgentTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [allLeads, setAllLeads] = useState<SalesLeadItem[]>([]);

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

  // Helper stage checks
  const isAwaitingPitch = (lead: SalesLeadItem) => {
    return (
      lead.paymentStatus !== 'PAID' &&
      lead.currentStage !== 'FILING_QUEUE' &&
      lead.currentStage !== 'PAID_AND_AUTHORIZED' &&
      lead.currentStage !== 'QUOTATION_SENT' &&
      lead.currentStage !== 'PAYMENT_PENDING' &&
      lead.paymentStatus !== 'PAYMENT_LINK_SENT'
    );
  };

  const isQuotedOrPaymentPending = (lead: SalesLeadItem) => {
    return (
      lead.paymentStatus !== 'PAID' &&
      lead.currentStage !== 'FILING_QUEUE' &&
      lead.currentStage !== 'PAID_AND_AUTHORIZED' &&
      (lead.currentStage === 'QUOTATION_SENT' ||
        lead.currentStage === 'PAYMENT_PENDING' ||
        lead.paymentStatus === 'PAYMENT_LINK_SENT' ||
        Boolean(lead.feeBreakdown?.isQuoted))
    );
  };

  const isPaidOrClosed = (lead: SalesLeadItem) => {
    return (
      lead.paymentStatus === 'PAID' ||
      lead.currentStage === 'PAID_AND_AUTHORIZED' ||
      lead.currentStage === 'FILING_QUEUE' ||
      lead.currentStage === 'FILING_IN_PROGRESS' ||
      lead.currentStage === 'FILING_SUCCESS'
    );
  };

  // Compute live tab counts
  const counts = useMemo(() => {
    let awaiting = 0;
    let quoted = 0;
    let paid = 0;

    allLeads.forEach((lead) => {
      if (isPaidOrClosed(lead)) paid++;
      else if (isQuotedOrPaymentPending(lead)) quoted++;
      else awaiting++;
    });

    return {
      all: allLeads.length,
      awaiting,
      quoted,
      paid,
    };
  }, [allLeads]);

  // Compute live dynamic KPI stats
  const stats: SalesAgentStats = useMemo(() => {
    let revenueToday = 0;

    allLeads.forEach((lead) => {
      if (isPaidOrClosed(lead)) {
        const fee = Number(lead.feeBreakdown?.totalServiceFee) || 0;
        revenueToday += fee;
      }
    });

    const total = allLeads.length;
    const conversionRate = total > 0 ? Math.round((counts.paid / total) * 100) : 0;

    return {
      assignedLeads: total,
      pitchInProgress: counts.awaiting,
      paymentsPending: counts.quoted,
      dealsClosedToday: counts.paid,
      myRevenueToday: revenueToday,
      myConversionRate: conversionRate,
    };
  }, [allLeads, counts]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return allLeads.filter((lead) => {
      if (activeTab === 'AWAITING' && !isAwaitingPitch(lead)) return false;
      if (activeTab === 'QUOTED' && !isQuotedOrPaymentPending(lead)) return false;
      if (activeTab === 'PAID' && !isPaidOrClosed(lead)) return false;

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
  }, [allLeads, activeTab, searchQuery]);

  const handleOpenPitch = (leadId: string) => {
    navigate(`/sales/agent/pitch/${leadId}`);
  };

  const handleOpenNextPriority = () => {
    if (filteredLeads.length > 0) {
      navigate(`/sales/agent/pitch/${filteredLeads[0].id || filteredLeads[0].applicationId}`);
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
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    handleRefresh,
    handleOpenPitch,
    handleOpenNextPriority,
  };
}
