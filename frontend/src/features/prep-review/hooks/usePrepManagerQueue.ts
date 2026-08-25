import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { PrepReviewLead, PrepStaffMember } from '../types/prep-review.types';
import { prepReviewService } from '../services/prep-review-service';
import toast from 'react-hot-toast';

export const usePrepManagerQueue = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const staffIdFromUrl = searchParams.get('staffId') || undefined;

  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  const [leads, setLeads] = useState<PrepReviewLead[]>([]);
  const [staff, setStaff] = useState<PrepStaffMember[]>([]);
  const [tabStats, setTabStats] = useState<{
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
  const [assignModalLeads, setAssignModalLeads] = useState<PrepReviewLead[] | null>(null);
  const [isAutoDistributeOpen, setIsAutoDistributeOpen] = useState<boolean>(false);

  // Search Debounce Handler
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Live Queue Data
  const fetchQueueData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [leadsRes, dynamicStaff] = await Promise.all([
        prepReviewService.getPipelineLeads({
          tab: activeTab,
          search: debouncedSearch || undefined,
          staffId: staffIdFromUrl,
        }),
        prepReviewService.getStaffMembers(),
      ]);

      setLeads(leadsRes.leads);
      if (leadsRes.stats) {
        setTabStats(leadsRes.stats);
      }
      setStaff(dynamicStaff);
    } catch (err) {
      console.error('Failed to load prep review queue:', err);
      toast.error('Failed to sync live pipeline queue');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, debouncedSearch, staffIdFromUrl]);

  useEffect(() => {
    fetchQueueData();
  }, [fetchQueueData]);

  // Clear staff filter
  const clearStaffFilter = () => {
    searchParams.delete('staffId');
    setSearchParams(searchParams);
  };

  return {
    leads,
    staff,
    tabStats,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    isLoading,
    fetchQueueData,
    assignModalLeads,
    setAssignModalLeads,
    isAutoDistributeOpen,
    setIsAutoDistributeOpen,
    staffIdFromUrl,
    clearStaffFilter,
  };
};
