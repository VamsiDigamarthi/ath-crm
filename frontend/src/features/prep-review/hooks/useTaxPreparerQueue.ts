import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { prepReviewService } from '../services/prep-review-service';
import type { PrepReviewLead } from '../types/prep-review.types';
import toast from 'react-hot-toast';

export type PreparerQueueTab = 'ALL' | 'DRAFTING' | 'QA_SUBMITTED' | 'REVISIONS';

export function useTaxPreparerQueue() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<PreparerQueueTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [complexityFilter, setComplexityFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [allLeads, setAllLeads] = useState<PrepReviewLead[]>([]);

  // Fetch real leads assigned to current Preparer from backend
  const fetchPreparerLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      // If user is a TAX_PREPARER, query their assigned leads; for manager/admin testing, fetch assigned prep leads
      const isPreparer = user?.role === 'TAX_PREPARER';
      const params: any = {
        limit: 100,
      };

      if (isPreparer && user?.id) {
        params.preparerId = user.id;
      }

      const response = await prepReviewService.getPipelineLeads(params);
      
      // Filter to items that have an assigned preparer (or assigned to this user)
      let leads = response.leads || [];
      if (isPreparer && user?.id) {
        leads = leads.filter((l) => l.assignedPreparer?.id === user.id || !l.assignedPreparer);
      } else {
        // If viewing as general staff/manager, filter to leads assigned to any preparer
        leads = leads.filter((l) => Boolean(l.assignedPreparer));
      }

      setAllLeads(leads);
    } catch {
      toast.error('Failed to load preparer queue');
      setAllLeads([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.role]);

  useEffect(() => {
    fetchPreparerLeads();
  }, [fetchPreparerLeads]);

  // Compute live tab counts based on actual database stage
  const counts = useMemo(() => {
    let drafting = 0;
    let qaSubmitted = 0;
    let revisions = 0;

    allLeads.forEach((lead) => {
      if (lead.currentStage === 'PREP_IN_PROGRESS') drafting++;
      else if (lead.currentStage === 'QA_IN_REVIEW') qaSubmitted++;
      else if (lead.currentStage === 'QA_REVISION_REQUESTED') revisions++;
    });

    return {
      all: allLeads.length,
      drafting,
      qaSubmitted,
      revisions,
    };
  }, [allLeads]);

  // Top KPI Stats
  const stats = useMemo(() => {
    return {
      totalAssigned: allLeads.length,
      inQA: counts.qaSubmitted,
      revisions: counts.revisions,
      accuracyRate: counts.revisions === 0 ? 100 : Math.round(((allLeads.length - counts.revisions) / (allLeads.length || 1)) * 100),
    };
  }, [allLeads.length, counts]);

  // Filtered Leads
  const filteredReturns = useMemo(() => {
    return allLeads.filter((item) => {
      if (activeTab === 'DRAFTING' && item.currentStage !== 'PREP_IN_PROGRESS') return false;
      if (activeTab === 'QA_SUBMITTED' && item.currentStage !== 'QA_IN_REVIEW') return false;
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
    allLeads,
    filteredReturns,
    stats,
    counts,
    isLoading,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    complexityFilter,
    setComplexityFilter,
    refreshData: fetchPreparerLeads,
    handleOpenNextReturn,
  };
}
