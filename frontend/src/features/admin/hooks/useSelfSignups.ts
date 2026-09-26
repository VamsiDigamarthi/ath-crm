import { useState, useEffect, useCallback } from 'react';
import { selfSignupsService, type SelfSignupLeadItem } from '../services/self-signups-service';
import toast from 'react-hot-toast';

export interface SelfSignupsStats {
  totalSelfSignups: number;
  rawProspectsCount: number;
  docOutreachCount: number;
  inProgressCount: number;
  completedFilingsCount: number;
}

export const useSelfSignups = () => {
  const [leads, setLeads] = useState<SelfSignupLeadItem[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [stats, setStats] = useState<SelfSignupsStats>({
    totalSelfSignups: 0,
    rawProspectsCount: 0,
    docOutreachCount: 0,
    inProgressCount: 0,
    completedFilingsCount: 0,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visaFilter, setVisaFilter] = useState<string>('ALL');
  const [taxYearFilter, setTaxYearFilter] = useState<number | undefined>(undefined);
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  // Row selection for bulk assignment
  const [selectedRows, setSelectedRows] = useState<SelfSignupLeadItem[]>([]);

  // Modals & Drawers
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState<boolean>(false);
  const [activeLeadForAudit, setActiveLeadForAudit] = useState<SelfSignupLeadItem | null>(null);

  // Fetch self signups
  const fetchSelfSignups = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await selfSignupsService.getSelfSignups({
        page,
        limit,
        search: searchQuery.trim() || undefined,
        visaType: visaFilter !== 'ALL' ? visaFilter : undefined,
        taxYear: taxYearFilter,
        stage: stageFilter !== 'ALL' ? stageFilter : undefined,
        priority: priorityFilter !== 'ALL' ? priorityFilter : undefined,
      });

      if (res) {
        setLeads(res.leads || []);
        setStats(
          res.stats || {
            totalSelfSignups: 0,
            rawProspectsCount: 0,
            docOutreachCount: 0,
            inProgressCount: 0,
            completedFilingsCount: 0,
          }
        );
        setAgents(res.availableDocAgents || []);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalItems(res.pagination?.totalItems || 0);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to fetch self-signups');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, searchQuery, visaFilter, taxYearFilter, stageFilter, priorityFilter]);

  useEffect(() => {
    fetchSelfSignups();
  }, [fetchSelfSignups]);

  // Search & Filter Handlers
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleVisaChange = (visa: string) => {
    setVisaFilter(visa);
    setPage(1);
  };

  const handleTaxYearChange = (year: number | undefined) => {
    setTaxYearFilter(year);
    setPage(1);
  };

  const handleStageChange = (stage: string) => {
    setStageFilter(stage);
    setPage(1);
  };

  const handlePriorityChange = (priority: string) => {
    setPriorityFilter(priority);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  // Modals & Drawers Controls
  const handleOpenAssignModal = () => {
    if (selectedRows.length === 0) {
      toast.error('Please select at least one lead to assign');
      return;
    }
    setIsAssignModalOpen(true);
  };

  const handleCloseAssignModal = () => {
    setIsAssignModalOpen(false);
  };

  const handleOpenAuditDrawer = (lead: SelfSignupLeadItem) => {
    setActiveLeadForAudit(lead);
    setIsAuditDrawerOpen(true);
  };

  const handleCloseAuditDrawer = () => {
    setActiveLeadForAudit(null);
    setIsAuditDrawerOpen(false);
  };

  // Direct Bulk Assignment
  const handleDirectAssign = async (agentId: string) => {
    if (selectedRows.length === 0) return;
    setIsActionLoading(true);
    try {
      const appIds = selectedRows.map((r) => r.id);
      const res = await selfSignupsService.assignSelfSignupsBulk(appIds, agentId);
      toast.success(res?.message || `Successfully assigned ${selectedRows.length} lead(s) to agent!`);
      setSelectedRows([]);
      setIsAssignModalOpen(false);
      fetchSelfSignups();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to assign leads');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Auto Round Robin Distribution
  const handleAutoRoundRobin = async () => {
    const targetRows = selectedRows.length > 0 ? selectedRows : leads;
    if (targetRows.length === 0) {
      toast.error('No leads available to distribute');
      return;
    }

    setIsActionLoading(true);
    try {
      const appIds = targetRows.map((r) => r.id);
      const res = await selfSignupsService.autoRoundRobinSelfSignups(appIds);
      toast.success(
        res?.message || `Successfully distributed ${targetRows.length} lead(s) evenly across agents!`
      );
      setSelectedRows([]);
      fetchSelfSignups();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to distribute leads');
    } finally {
      setIsActionLoading(false);
    }
  };

  return {
    leads,
    agents,
    stats,
    isLoading,
    isActionLoading,
    searchQuery,
    visaFilter,
    taxYearFilter,
    stageFilter,
    priorityFilter,
    page,
    limit,
    totalPages,
    totalItems,
    selectedRows,
    setSelectedRows,
    isAssignModalOpen,
    setIsAssignModalOpen,
    isAuditDrawerOpen,
    setIsAuditDrawerOpen,
    activeLeadForAudit,
    setActiveLeadForAudit,
    handleSearchChange,
    handleVisaChange,
    handleTaxYearChange,
    handleStageChange,
    handlePriorityChange,
    handlePageChange,
    handleLimitChange,
    handleOpenAssignModal,
    handleCloseAssignModal,
    handleOpenAuditDrawer,
    handleCloseAuditDrawer,
    handleDirectAssign,
    handleAutoRoundRobin,
    refreshData: fetchSelfSignups,
  };
};
