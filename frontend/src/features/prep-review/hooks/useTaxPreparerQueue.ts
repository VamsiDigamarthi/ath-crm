import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { prepReviewService } from '../services/prep-review-service';
import type { PrepReviewLead } from '../types/prep-review.types';
import toast from 'react-hot-toast';

export type PreparerQueueTab = 'ALL' | 'DRAFTING' | 'QA_SUBMITTED' | 'QA_APPROVED' | 'REVISIONS';

export function useTaxPreparerQueue() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<PreparerQueueTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [complexityFilter, setComplexityFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [allLeads, setAllLeads] = useState<PrepReviewLead[]>([]);

  // Fetch real leads strictly assigned to current Preparer from backend
  const fetchPreparerLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await prepReviewService.getPipelineLeads({ limit: 100 });
      const rawLeads = response.leads || [];

      const currentUserId = user?.id;
      const currentUserEmail = user?.email?.toLowerCase().trim();

      // STRICT RELATIONAL FILTER: Only returns where current user is the assignedPreparer
      const assignedToMe = rawLeads.filter((lead) => {
        if (!lead.assignedPreparer) return false;
        if (currentUserId && lead.assignedPreparer.id === currentUserId) return true;
        if (currentUserEmail && lead.assignedPreparer.email?.toLowerCase().trim() === currentUserEmail) return true;
        return false;
      });

      setAllLeads(assignedToMe);
    } catch {
      toast.error('Failed to load preparer queue');
      setAllLeads([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.email]);

  useEffect(() => {
    fetchPreparerLeads();
  }, [fetchPreparerLeads]);

  // Compute live tab counts based on actual database stage
  const counts = useMemo(() => {
    let drafting = 0;
    let qaSubmitted = 0;
    let qaApproved = 0;
    let revisions = 0;

    allLeads.forEach((lead) => {
      if (lead.currentStage === 'PREP_IN_PROGRESS') drafting++;
      else if (lead.currentStage === 'QA_IN_REVIEW') qaSubmitted++;
      else if (lead.currentStage === 'QA_APPROVED' || lead.currentStage === 'SALES_PITCH_QUEUE') qaApproved++;
      else if (lead.currentStage === 'QA_REVISION_REQUESTED') revisions++;
    });

    return {
      all: allLeads.length,
      drafting,
      qaSubmitted,
      qaApproved,
      revisions,
    };
  }, [allLeads]);

  // Top KPI Stats
  const stats = useMemo(() => {
    return {
      totalAssigned: allLeads.length,
      inQA: counts.qaSubmitted,
      qaApproved: counts.qaApproved,
      revisions: counts.revisions,
      accuracyRate: counts.revisions === 0 ? 100 : Math.round(((allLeads.length - counts.revisions) / (allLeads.length || 1)) * 100),
    };
  }, [allLeads.length, counts]);

  // Filtered Leads
  const filteredReturns = useMemo(() => {
    return allLeads.filter((item) => {
      if (activeTab === 'DRAFTING' && item.currentStage !== 'PREP_IN_PROGRESS') return false;
      if (activeTab === 'QA_SUBMITTED' && item.currentStage !== 'QA_IN_REVIEW') return false;
      if (activeTab === 'QA_APPROVED' && item.currentStage !== 'QA_APPROVED' && item.currentStage !== 'SALES_PITCH_QUEUE') return false;
      if (activeTab === 'REVISIONS' && item.currentStage !== 'QA_REVISION_REQUESTED') return false;
      if (complexityFilter !== 'ALL' && item.complexity !== complexityFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          (item.taxpayerName || '').toLowerCase().includes(q) ||
          (item.taxpayerEmail || '').toLowerCase().includes(q) ||
          (item.taxpayerPhone || '').toLowerCase().includes(q) ||
          (item.stateOfResidence || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allLeads, activeTab, complexityFilter, searchQuery]);

  const handleOpenNextReturn = () => {
    if (filteredReturns.length > 0) {
      navigate(`/prep-review/preparer/workspace/${filteredReturns[0].id || filteredReturns[0].applicationId}`);
    } else {
      toast('No active tax returns in queue', { icon: 'ℹ️' });
    }
  };

  return {
    isLoading,
    allLeads,
    counts,
    stats,
    filteredReturns,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    complexityFilter,
    setComplexityFilter,
    fetchPreparerLeads,
    refreshData: fetchPreparerLeads,
    handleOpenNextReturn,
  };
}
