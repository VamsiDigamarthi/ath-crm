import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { prepReviewService } from '../services/prep-review-service';
import type { PrepReviewLead } from '../types/prep-review.types';
import toast from 'react-hot-toast';
import type { ReviewerOrigin } from '../utils/preparer-origin';

export type ReviewerQueueTab = 'ALL' | 'PENDING' | 'REVISIONS' | 'APPROVED';

/**
 * Reviewer sidebar pages. Each return lands in exactly one page:
 * - ASSIGNED: submitted by the preparer and waiting for this reviewer's audit
 * - PENDING: reviewer is assigned but the preparer has not submitted it yet
 * - REVISIONS: reviewer sent it back for any revision, waiting on the preparer
 * - APPROVED: QA signed off
 * - ALL: legacy queue with every return and the old tabs
 */
export type ReviewerQueueView = 'ALL' | 'ASSIGNED' | 'PENDING' | 'REVISIONS' | 'APPROVED';

const VIEW_TO_REVIEWER_ORIGIN: Record<ReviewerQueueView, ReviewerOrigin> = {
  ALL: 'assigned',
  ASSIGNED: 'assigned',
  PENDING: 'reviewer-pending',
  REVISIONS: 'revisions',
  APPROVED: 'approved',
};

export function useTaxReviewerQueue(view: ReviewerQueueView = 'ALL') {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<ReviewerQueueTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [allLeads, setAllLeads] = useState<PrepReviewLead[]>([]);

  // Fetch real leads strictly assigned to QA Review for THIS user
  const fetchReviewerLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await prepReviewService.getPipelineLeads({ limit: 100 });
      const rawLeads = response.leads || [];

      const currentUserId = user?.id;
      const currentUserEmail = user?.email?.toLowerCase().trim();

      // STRICT RELATIONAL FILTER: Only returns where current user is the assignedReviewer
      const assignedToMe = rawLeads.filter((lead) => {
        if (!lead.assignedReviewer) return false;
        if (currentUserId && lead.assignedReviewer.id === currentUserId) return true;
        if (currentUserEmail && lead.assignedReviewer.email?.toLowerCase().trim() === currentUserEmail) return true;
        return false;
      });

      setAllLeads(assignedToMe);
    } catch {
      toast.error('Failed to load QA reviewer queue');
      setAllLeads([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.email]);

  useEffect(() => {
    fetchReviewerLeads();
  }, [fetchReviewerLeads]);

  // Helper to check if a return has passed QA / signed off
  const isReturnSignedOff = (lead: PrepReviewLead) => {
    return (
      lead.prepStage === 'QA_APPROVED' ||
      lead.taxDraftSummary?.status === 'QA_APPROVED' ||
      Boolean(lead.taxDraftSummary?.qaApprovedByUserId) ||
      Boolean(lead.taxDraftSummary?.qaApprovedAt) ||
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

  const isReturnRevision = (lead: PrepReviewLead) => {
    return (
      lead.prepStage === 'QA_REVISION_REQUESTED' ||
      lead.currentStage === 'QA_REVISION_REQUESTED' ||
      lead.currentStage === 'CORRECTION_NEEDED' ||
      lead.taxDraftSummary?.status === 'REVISION_REQUESTED'
    );
  };

  // Compute live tab counts based on actual database stage
  const counts = useMemo(() => {
    let pending = 0;
    let revisions = 0;
    let signedOff = 0;

    allLeads.forEach((lead) => {
      if (isReturnRevision(lead)) {
        revisions++;
      } else if (isReturnSignedOff(lead)) {
        signedOff++;
      } else {
        pending++;
      }
    });

    return {
      all: allLeads.length,
      pending,
      revisions,
      signedOff,
    };
  }, [allLeads]);

  // Top KPI Stats for Senior Reviewer
  const stats = useMemo(() => {
    const totalAudited = counts.signedOff + counts.revisions;
    const passRate = totalAudited > 0 ? Math.round((counts.signedOff / totalAudited) * 100) : 100;

    return {
      pendingAudit: counts.pending,
      signedOff: counts.signedOff,
      revisionsSent: counts.revisions,
      passRate,
    };
  }, [counts]);

  // Submitted by the preparer and waiting for the reviewer's decision
  const isReturnSubmitted = (lead: PrepReviewLead) =>
    lead.prepStage === 'QA_IN_REVIEW' ||
    lead.prepStage === 'QA_REVIEW_QUEUE' ||
    lead.currentStage === 'QA_IN_REVIEW' ||
    lead.currentStage === 'QA_REVIEW_QUEUE' ||
    lead.taxDraftSummary?.status === 'SUBMITTED_FOR_QA';

  const bucketOf = (lead: PrepReviewLead): Exclude<ReviewerQueueView, 'ALL'> => {
    if (isReturnRevision(lead)) return 'REVISIONS';
    if (isReturnSignedOff(lead)) return 'APPROVED';
    return isReturnSubmitted(lead) ? 'ASSIGNED' : 'PENDING';
  };

  // Returns that belong to the current sidebar page
  const viewLeads = useMemo(
    () => (view === 'ALL' ? allLeads : allLeads.filter((l) => bucketOf(l) === view)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allLeads, view]
  );

  // Filtered QA returns based on tab and search
  const filteredReturns = useMemo(() => {
    return viewLeads.filter((item) => {
      const signedOff = isReturnSignedOff(item);
      const revision = isReturnRevision(item);
      const pending = !signedOff && !revision;

      if (activeTab === 'PENDING' && !pending) return false;
      if (activeTab === 'REVISIONS' && !revision) return false;
      if (activeTab === 'APPROVED' && !signedOff) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          (item.taxpayerName || '').toLowerCase().includes(q) ||
          (item.taxpayerEmail || '').toLowerCase().includes(q) ||
          (item.assignedPreparer?.name || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [viewLeads, activeTab, searchQuery]);

  const clientRows = useMemo(() => {
    const seen = new Set<string>();
    return filteredReturns.filter((l) => {
      const key = l.taxpayerId || l.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [filteredReturns]);

  // ?from= keeps the right sidebar item highlighted on the client / audit screens
  const fromQuery = `?from=${VIEW_TO_REVIEWER_ORIGIN[view]}`;

  const handleOpenAudit = (lead: PrepReviewLead) => {
    navigate(`/prep-review/reviewer/client/${lead.taxpayerId || lead.id}${fromQuery}`);
  };

  const handleStartPriorityAudit = () => {
    if (filteredReturns.length > 0) {
      navigate(`/prep-review/reviewer/audit/${filteredReturns[0].id || filteredReturns[0].applicationId}${fromQuery}`);
    } else {
      toast('No pending returns in QA audit queue', { icon: 'ℹ️' });
    }
  };

  return {
    isLoading,
    allLeads,
    counts,
    stats,
    filteredReturns,
    clientRows,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    fetchReviewerLeads,
    refreshData: fetchReviewerLeads,
    handleOpenAudit,
    handleStartPriorityAudit,
  };
}
