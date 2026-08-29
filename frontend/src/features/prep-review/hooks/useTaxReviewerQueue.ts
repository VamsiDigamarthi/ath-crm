import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { prepReviewService } from '../services/prep-review-service';
import type { PrepReviewLead } from '../types/prep-review.types';
import toast from 'react-hot-toast';

export type ReviewerQueueTab = 'ALL' | 'PENDING' | 'REVISIONS' | 'APPROVED';

export function useTaxReviewerQueue() {
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

  // Compute live tab counts based on actual database stage
  const counts = useMemo(() => {
    let pending = 0;
    let revisions = 0;
    let signedOff = 0;

    allLeads.forEach((lead) => {
      if (lead.currentStage === 'QA_IN_REVIEW' || lead.currentStage === 'QA_REVIEW_QUEUE') pending++;
      else if (lead.currentStage === 'QA_REVISION_REQUESTED') revisions++;
      else if (lead.currentStage === 'QA_APPROVED' || lead.currentStage === 'SALES_PITCH_QUEUE') signedOff++;
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

  // Filtered QA returns based on tab and search
  const filteredReturns = useMemo(() => {
    return allLeads.filter((item) => {
      if (activeTab === 'PENDING' && item.currentStage !== 'QA_IN_REVIEW' && item.currentStage !== 'QA_REVIEW_QUEUE') return false;
      if (activeTab === 'REVISIONS' && item.currentStage !== 'QA_REVISION_REQUESTED') return false;
      if (activeTab === 'APPROVED' && item.currentStage !== 'QA_APPROVED' && item.currentStage !== 'SALES_PITCH_QUEUE') return false;

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
  }, [allLeads, activeTab, searchQuery]);

  const handleOpenAudit = (leadId: string) => {
    navigate(`/prep-review/reviewer/audit/${leadId}`);
  };

  const handleStartPriorityAudit = () => {
    if (filteredReturns.length > 0) {
      navigate(`/prep-review/reviewer/audit/${filteredReturns[0].id || filteredReturns[0].applicationId}`);
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
