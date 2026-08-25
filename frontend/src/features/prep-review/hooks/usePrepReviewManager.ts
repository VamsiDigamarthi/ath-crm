import { useState, useEffect, useCallback } from 'react';
import type { PrepReviewLead, PrepStaffMember, PrepManagerStats } from '../types/prep-review.types';
import { prepReviewService } from '../services/prep-review-service';
import { INITIAL_PREP_MANAGER_STATS } from '../constants/prep-review-constants';
import toast from 'react-hot-toast';

export const usePrepReviewManager = () => {
  // 1. Time Range & Filters
  const [timeRange, setTimeRange] = useState<'TODAY' | 'WEEK' | 'SEASON'>('TODAY');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  // 2. Data State
  const [stats, setStats] = useState<PrepManagerStats>(INITIAL_PREP_MANAGER_STATS);
  const [staff, setStaff] = useState<PrepStaffMember[]>([]);
  const [leads, setLeads] = useState<PrepReviewLead[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 3. Modals & Drawers State
  const [assignModalLeads, setAssignModalLeads] = useState<PrepReviewLead[] | null>(null);
  const [isAutoDistributeOpen, setIsAutoDistributeOpen] = useState<boolean>(false);

  // Search Debounce Handler
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Live Data
  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [dynamicStaff, dynamicLeads, dynamicStats] = await Promise.all([
        prepReviewService.getStaffMembers(),
        prepReviewService.getPipelineLeads(),
        prepReviewService.getManagerStats(),
      ]);
      setStaff(dynamicStaff);
      setLeads(dynamicLeads.leads);
      setStats(dynamicStats);
    } catch (error) {
      console.error('Failed to load prep review data:', error);
      toast.error('Failed to sync live data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial Data Fetch
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Handle Manual / Bulk Lead Assignment to Preparer & Reviewer
  const handleAssignSuccess = (assignedLeadIds: string[], preparerId: string, reviewerId: string) => {
    const preparer = staff.find((s) => s.id === preparerId);
    const reviewer = staff.find((s) => s.id === reviewerId);

    setLeads((prev) =>
      prev.map((lead) => {
        if (assignedLeadIds.includes(lead.id)) {
          return {
            ...lead,
            assignedPreparer: preparer
              ? { id: preparer.id, name: preparer.name, email: preparer.email }
              : lead.assignedPreparer,
            assignedReviewer: reviewer
              ? { id: reviewer.id, name: reviewer.name, email: reviewer.email }
              : lead.assignedReviewer,
            currentStage: 'PREP_IN_PROGRESS',
            prepStartedAt: 'Just now',
          };
        }
        return lead;
      })
    );

    // Update workload counters
    setStaff((prev) =>
      prev.map((s) => {
        if (s.id === preparerId) {
          return { ...s, activeCaseload: s.activeCaseload + assignedLeadIds.length };
        }
        if (s.id === reviewerId) {
          return { ...s, activeCaseload: s.activeCaseload + assignedLeadIds.length };
        }
        return s;
      })
    );

    // Update top KPI counters
    setStats((prev) => ({
      ...prev,
      unassignedToPrep: Math.max(0, prev.unassignedToPrep - assignedLeadIds.length),
      underPreparation: prev.underPreparation + assignedLeadIds.length,
    }));
  };

  // Handle 1-Click Auto Round-Robin Lead Distribution
  const handleAutoDistributeSuccess = () => {
    const activePreparers = staff.filter((s) => s.role === 'TAX_PREPARER' && s.isAvailable);
    const activeReviewers = staff.filter((s) => s.role === 'TAX_REVIEWER' && s.isAvailable);

    if (activePreparers.length === 0) return;

    setLeads((prev) =>
      prev.map((lead, idx) => {
        if (!lead.assignedPreparer || lead.currentStage === 'DOC_PREP_COMPLETE') {
          const prep = activePreparers[idx % activePreparers.length];
          const rev = activeReviewers[idx % activeReviewers.length];
          return {
            ...lead,
            assignedPreparer: { id: prep.id, name: prep.name, email: prep.email },
            assignedReviewer: { id: rev.id, name: rev.name, email: rev.email },
            currentStage: 'PREP_IN_PROGRESS',
            prepStartedAt: 'Just now',
          };
        }
        return lead;
      })
    );

    setStats((prev) => ({
      ...prev,
      unassignedToPrep: 0,
      underPreparation: prev.underPreparation + prev.unassignedToPrep,
    }));
  };

  return {
    // State
    timeRange,
    setTimeRange,
    selectedStageFilter,
    setSelectedStageFilter,
    searchQuery,
    setSearchQuery,
    debouncedSearch,
    stats,
    staff,
    leads,
    isLoading,
    assignModalLeads,
    setAssignModalLeads,
    isAutoDistributeOpen,
    setIsAutoDistributeOpen,

    // Methods
    refreshData,
    handleAssignSuccess,
    handleAutoDistributeSuccess,
  };
};
