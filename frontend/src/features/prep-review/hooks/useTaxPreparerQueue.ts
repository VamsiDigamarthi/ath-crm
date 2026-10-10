import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { prepReviewService } from '../services/prep-review-service';
import type { PrepReviewLead } from '../types/prep-review.types';
import toast from 'react-hot-toast';
import { VIEW_TO_ORIGIN } from '../utils/preparer-origin';

export type PreparerQueueTab = 
  | 'WORKING' 
  | 'PENDING' 
  | 'UNDER_REVIEW' 
  | 'COMPLETED' 
  | 'ALL' 
  | 'ASSIGNED'
  | 'DRAFTING' 
  | 'QA_SUBMITTED' 
  | 'QA_APPROVED' 
  | 'REVISIONS' 
  | 'REVERTED';

/**
 * Preparer sidebar pages. Each return lands in exactly one page:
 * - PENDING: assigned more than 1 day ago and preparer has not saved any work yet
 * - PREPARATION: work in hand (assigned < 1 day, in progress, revisions requested by QA, reverted to documenter) shown as tabs
 * - UNDER_REVIEW: submitted to QA, waiting for the reviewer
 * - COMPLETED: QA approved and moved on (sales / filing)
 * - ALL: legacy workbench view with every return and all tabs
 */
export type PreparerQueueView = 'ALL' | 'PREPARATION' | 'PENDING' | 'UNDER_REVIEW' | 'COMPLETED';

type PreparerBucket = 'ASSIGNED' | 'PENDING' | 'IN_PROGRESS' | 'REVISIONS' | 'REVERTED' | 'UNDER_REVIEW' | 'COMPLETED';

const DAY_MS = 24 * 60 * 60 * 1000;

export function useTaxPreparerQueue(
  viewOrTab: PreparerQueueView | PreparerQueueTab = 'ALL',
  defaultTabProp?: PreparerQueueTab
) {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const view: PreparerQueueView = 
    viewOrTab === 'PREPARATION' || viewOrTab === 'PENDING' || viewOrTab === 'UNDER_REVIEW' || viewOrTab === 'COMPLETED'
      ? viewOrTab
      : 'ALL';

  const defaultTab: PreparerQueueTab = 
    defaultTabProp 
      ? defaultTabProp 
      : viewOrTab === 'PREPARATION'
      ? 'ALL'
      : (viewOrTab as PreparerQueueTab);

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

  // One bucket per return; a saved workspace draft marks the preparer as started
  const bucketOf = (lead: PrepReviewLead): PreparerBucket => {
    if (isReturnReverted(lead)) return 'REVERTED';
    if (isReturnRevision(lead)) return 'REVISIONS';
    if (isReturnApproved(lead)) return 'COMPLETED';
    if (isReturnSubmittedToQA(lead)) return 'UNDER_REVIEW';
    if (lead.taxDraftSummary?.status === 'DRAFT_SAVED') return 'IN_PROGRESS';
    // Not started: stays in "Assigned leads" for 1 day, then moves to Pending Returns
    const assignedAt = lead.prepAssignedAt ? new Date(lead.prepAssignedAt).getTime() : 0;
    return assignedAt && Date.now() - assignedAt < DAY_MS ? 'ASSIGNED' : 'PENDING';
  };

  // Counts per bucket across all my returns (stat cards on every preparer page)
  const bucketCounts = useMemo(() => {
    const c: Record<PreparerBucket, number> = { ASSIGNED: 0, PENDING: 0, IN_PROGRESS: 0, REVISIONS: 0, REVERTED: 0, UNDER_REVIEW: 0, COMPLETED: 0 };
    allLeads.forEach((l) => {
      c[bucketOf(l)]++;
    });
    return c;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allLeads]);

  const VIEW_BUCKETS: Record<PreparerQueueView, PreparerBucket[] | null> = {
    ALL: null,
    PREPARATION: ['ASSIGNED', 'IN_PROGRESS', 'REVISIONS', 'REVERTED'],
    PENDING: ['PENDING'],
    UNDER_REVIEW: ['UNDER_REVIEW'],
    COMPLETED: ['COMPLETED'],
  };

  // Returns that belong to the current sidebar page
  const viewLeads = useMemo(() => {
    const buckets = VIEW_BUCKETS[view];
    return buckets ? allLeads.filter((l) => buckets.includes(bucketOf(l))) : allLeads;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allLeads, view]);

  // Tab counts for the Return Preparation page
  const preparationCounts = useMemo(() => {
    const c = { all: 0, assigned: 0, inProgress: 0, revisions: 0, reverted: 0 };
    viewLeads.forEach((l) => {
      const b = bucketOf(l);
      c.all++;
      if (b === 'ASSIGNED') c.assigned++;
      if (b === 'IN_PROGRESS') c.inProgress++;
      if (b === 'REVISIONS') c.revisions++;
      if (b === 'REVERTED') c.reverted++;
    });
    return c;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewLeads]);

  // Filtered Leads
  const filteredReturns = useMemo(() => {
    return viewLeads.filter((item) => {
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
      if (activeTab === 'ASSIGNED' && bucketOf(item) !== 'ASSIGNED') return false;
      // Return Preparation page: "In preparation" = draft saved (new ones sit under Assigned leads)
      if (activeTab === 'DRAFTING' && (!drafting || (view === 'PREPARATION' && bucketOf(item) !== 'IN_PROGRESS'))) return false;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewLeads, activeTab, complexityFilter, priorityFilter, searchQuery, view]);

  const clientRows = useMemo(() => {
    const seen = new Set<string>();
    return filteredReturns.filter((l) => {
      const key = l.taxpayerId || l.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [filteredReturns]);

  // ?from= keeps the right sidebar item highlighted on the client / workspace screens
  const fromQuery = `?from=${VIEW_TO_ORIGIN[view]}`;

  const handleOpenClient = (lead: PrepReviewLead) => {
    navigate(`/prep-review/preparer/client/${lead.taxpayerId || lead.id}${fromQuery}`);
  };

  const handleOpenNextReturn = () => {
    if (filteredReturns.length > 0) {
      navigate(`/prep-review/preparer/workspace/${filteredReturns[0].id || filteredReturns[0].applicationId}${fromQuery}`);
    } else {
      toast('No active tax returns in queue', { icon: 'ℹ️' });
    }
  };

  return {
    isLoading,
    allLeads,
    counts,
    preparationCounts,
    bucketCounts,
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
