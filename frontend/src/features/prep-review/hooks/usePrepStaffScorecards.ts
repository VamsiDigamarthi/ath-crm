import { useState, useEffect, useCallback } from 'react';
import type { PrepStaffMember, PrepReviewLead } from '../types/prep-review.types';
import { prepReviewService } from '../services/prep-review-service';
import toast from 'react-hot-toast';

export const usePrepStaffScorecards = () => {
  const [staff, setStaff] = useState<PrepStaffMember[]>([]);
  const [unassignedLeads, setUnassignedLeads] = useState<PrepReviewLead[]>([]);
  const [stats, setStats] = useState<{
    all: number;
    unassigned: number;
    underPrep: number;
    qaReview: number;
    revisions: number;
    qaApproved: number;
  }>({
    all: 0,
    unassigned: 0,
    underPrep: 0,
    qaReview: 0,
    revisions: 0,
    qaApproved: 0,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAutoDistributeOpen, setIsAutoDistributeOpen] = useState<boolean>(false);

  // Dynamic API Fetch specifically for Staff Scorecards from dedicated backend
  const fetchStaffData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [dynamicStaff, leadsRes] = await Promise.all([
        prepReviewService.getStaffMembers(),
        prepReviewService.getPipelineLeads(),
      ]);
      setStaff(dynamicStaff);
      if (leadsRes.stats) {
        setStats(leadsRes.stats);
      }
      setUnassignedLeads(leadsRes.leads.filter((l) => !l.assignedPreparer || l.currentStage === 'DOC_PREP_COMPLETE'));
    } catch (err) {
      console.error('Failed to load staff scorecards:', err);
      toast.error('Failed to load live staff data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaffData();
  }, [fetchStaffData]);

  return {
    staff,
    stats,
    unassignedLeads,
    isLoading,
    fetchStaffData,
    isAutoDistributeOpen,
    setIsAutoDistributeOpen,
  };
};
