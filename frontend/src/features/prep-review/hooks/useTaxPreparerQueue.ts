import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { prepReviewService } from '../services/prep-review-service';
import type { PrepReviewLead } from '../types/prep-review.types';
import toast from 'react-hot-toast';

export type PreparerQueueTab = 
  | 'WORKING' 
  | 'PENDING' 
  | 'UNDER_REVIEW' 
  | 'COMPLETED' 
  | 'ALL' 
  | 'DRAFTING' 
  | 'QA_SUBMITTED' 
  | 'QA_APPROVED' 
  | 'REVISIONS' 
  | 'REVERTED';

export function useTaxPreparerQueue(defaultTab: PreparerQueueTab = 'WORKING') {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<PreparerQueueTab>(defaultTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [complexityFilter, setComplexityFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [allLeads, setAllLeads] = useState<PrepReviewLead[]>([]);

  // Keep activeTab in sync if defaultTab changes (e.g. navigation across routes)
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

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

  // Helper checks
  const isReturnReverted = (lead: PrepReviewLead) => {
    return (
      (lead.prepStage as any) === 'REVERTED_TO_DOC' ||
      (lead.prepStage as any) === 'REVERTED_TO_DOCUMENTER' ||
      lead.currentStage === 'DOC_OUTREACH' ||
      lead.taxDraftSummary?.status === 'REVERTED_TO_DOCUMENTER' ||
      (Boolean(lead.taxDraftSummary?.lastRevert) && (lead.taxDraftSummary?.lastRevert as any)?.targetDepartment === 'DOCUMENTER')
    );
  };

  const isReturnRevision = (lead: PrepReviewLead) => {
    const lastRevert = lead.taxDraftSummary?.lastRevert as any;
    return (
      lead.prepStage === 'QA_REVISION_REQUESTED' ||
      lead.currentStage === 'QA_REVISION_REQUESTED' ||
      lead.currentStage === 'CORRECTION_NEEDED' ||
      lead.taxDraftSummary?.status === 'REVISION_REQUESTED' ||
      (Boolean(lastRevert && !lastRevert.resolved) && lastRevert.targetDepartment === 'PREPARATION')
    );
  };

  const isReturnApproved = (lead: PrepReviewLead) => {
    if (isReturnReverted(lead) || isReturnRevision(lead) || lead.currentStage === 'CORRECTION_NEEDED' || lead.currentStage === 'DOC_OUTREACH') {
      return false;
    }
    return (
      lead.prepStage === 'QA_APPROVED' ||
      lead.taxDraftSummary?.status === 'QA_APPROVED' ||
      [
        'QA_APPROVED',
        'SALES_PITCH_QUEUE',
        'SALES_PITCHING',
        'QUOTATION_SENT',
        'PAYMENT_PENDING',
        'PAID_AND_AUTHORIZED',
        'FILING_QUEUE',
        'FILING_IN_PROGRESS',
        'FILING_SUCCESS',
      ].includes(lead.currentStage)
    );
  };

  const isReturnSubmittedToQA = (lead: PrepReviewLead) => {
    return (
      lead.prepStage === 'QA_IN_REVIEW' ||
      lead.currentStage === 'QA_IN_REVIEW' ||
      lead.currentStage === 'QA_REVIEW_QUEUE' ||
      lead.taxDraftSummary?.status === 'SUBMITTED_FOR_QA'
    );
  };

  const isReturnPending = (lead: PrepReviewLead) => {
    if (isReturnReverted(lead) || isReturnRevision(lead) || isReturnApproved(lead) || isReturnSubmittedToQA(lead)) {
      return false;
    }
    if (lead.prepStage === 'PREP_ASSIGNED') return true;
    const hasStarted = Boolean((lead as any).prepStartedAt);
    const draftSummary = lead.taxDraftSummary as any;
    const hasDraftContent = Boolean(
      draftSummary?.status === 'DRAFTING' ||
      draftSummary?.w2Wages ||
      draftSummary?.grossIncome ||
      draftSummary?.updatedAt ||
      (draftSummary?.calculations && Object.keys(draftSummary.calculations).length > 0)
    );
    return !hasStarted && !hasDraftContent;
  };

  const isWorkingReturn = (lead: PrepReviewLead) => {
    if (isReturnReverted(lead) || isReturnApproved(lead) || isReturnSubmittedToQA(lead)) {
      return false;
    }
    if (isReturnRevision(lead)) return true;
    return !isReturnPending(lead);
  };

  // Compute live tab counts based on actual database stage
  const counts = useMemo(() => {
    let working = 0;
    let pending = 0;
    let underReview = 0;
    let completed = 0;
    let drafting = 0;
    let qaSubmitted = 0;
    let qaApproved = 0;
    let revisions = 0;
    let reverted = 0;

    allLeads.forEach((lead) => {
      const isRev = isReturnReverted(lead);
      const isApp = isReturnApproved(lead);
      const isSub = isReturnSubmittedToQA(lead);
      const isCorr = isReturnRevision(lead);
      const isPend = isReturnPending(lead);
      const isWork = isWorkingReturn(lead);

      if (isRev) reverted++;
      if (isCorr) revisions++;
      if (isApp) {
        qaApproved++;
        completed++;
      } else if (isSub) {
        qaSubmitted++;
        underReview++;
      } else if (isPend) {
        pending++;
      } else {
        drafting++;
      }

      if (isWork) {
        working++;
      }
    });

    return {
      all: allLeads.length,
      working,
      pending,
      underReview,
      completed,
      drafting,
      qaSubmitted,
      qaApproved,
      revisions,
      reverted,
    };
  }, [allLeads]);

  // Top KPI Stats
  const stats = useMemo(() => {
    return {
      totalAssigned: allLeads.length,
      working: counts.working,
      pending: counts.pending,
      underReview: counts.underReview,
      completed: counts.completed,
      inQA: counts.qaSubmitted,
      qaApproved: counts.qaApproved,
      revisions: counts.revisions,
      reverted: counts.reverted,
      accuracyRate: counts.revisions === 0 ? 100 : Math.round(((allLeads.length - counts.revisions) / (allLeads.length || 1)) * 100),
    };
  }, [allLeads.length, counts]);

  // Filtered Leads
  const filteredReturns = useMemo(() => {
    return allLeads.filter((item) => {
      const reverted = isReturnReverted(item);
      const approved = !reverted && isReturnApproved(item);
      const revision = !reverted && isReturnRevision(item);
      const submitted = !reverted && isReturnSubmittedToQA(item);
      const pending = !reverted && !approved && !submitted && !revision && isReturnPending(item);
      const drafting = !reverted && !approved && !revision && !submitted && !pending;
      const working = drafting || revision;

      if (activeTab === 'WORKING' && !working) return false;
      if (activeTab === 'PENDING' && !pending) return false;
      if ((activeTab === 'UNDER_REVIEW' || activeTab === 'QA_SUBMITTED') && !submitted) return false;
      if ((activeTab === 'COMPLETED' || activeTab === 'QA_APPROVED') && !approved) return false;
      if (activeTab === 'DRAFTING' && !drafting) return false;
      if (activeTab === 'REVISIONS' && !revision) return false;
      if (activeTab === 'REVERTED' && !reverted) return false;

      if (complexityFilter !== 'ALL' && item.complexity !== complexityFilter) return false;
      if (priorityFilter !== 'ALL' && (item.priority || 'NO_PRIORITY') !== priorityFilter) return false;

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
  }, [allLeads, activeTab, complexityFilter, priorityFilter, searchQuery]);

  const clientRows = useMemo(() => {
    const seen = new Set<string>();
    return filteredReturns.filter((l) => {
      const key = l.taxpayerId || l.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [filteredReturns]);

  const handleOpenClient = (lead: PrepReviewLead) => {
    navigate(`/prep-review/preparer/client/${lead.taxpayerId || lead.id}`);
  };

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
    clientRows,
    handleOpenClient,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    complexityFilter,
    setComplexityFilter,
    priorityFilter,
    setPriorityFilter,
    fetchPreparerLeads,
    refreshData: fetchPreparerLeads,
    handleOpenNextReturn,
  };
}
