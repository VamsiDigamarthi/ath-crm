import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/admin-service';
import toast from 'react-hot-toast';

export interface ReturnedLeadItem extends Record<string, unknown> {
  id: string;
  customerId: string;
  taxYear: number;
  filingType: string;
  currentStage: string;
  priority?: string;
  department?: 'DOCUMENTER' | 'SALES';
  assignedDocAgentId?: string | null;
  assignedDocAgent?: any;
  assignedSalesAgentId?: string | null;
  assignedSalesAgent?: any;
  taxDraftSummary?: any;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    ssnTin?: string;
    occupation?: string;
    visaType?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    isConvertedCustomer?: boolean;
  };
  returnedBy: string;
  returnedReason: string;
  returnedAt: string;
  previousAgentName: string;
  totalCalls: number;
  lastCallLog?: {
    id: string;
    disposition: string;
    callSummary?: string;
    agentName?: string;
    createdAt: string;
  } | null;
  callLogs?: any[];
  stageHistories?: any[];
  auditLogs?: any[];
  documents?: any[];
}

export interface ReturnedLeadsStats {
  totalReturned: number;
  availableAgents: number;
  todayReassigned: number;
}

export const useReturnedLeads = () => {
  const [leads, setLeads] = useState<ReturnedLeadItem[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [stats, setStats] = useState<ReturnedLeadsStats>({
    totalReturned: 0,
    availableAgents: 0,
    todayReassigned: 0,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visaFilter, setVisaFilter] = useState<string>('ALL');
  const [taxYearFilter, setTaxYearFilter] = useState<number | undefined>(undefined);
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  // Row selection for assignment
  const [selectedRows, setSelectedRows] = useState<ReturnedLeadItem[]>([]);

  // Modals & Drawers
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState<boolean>(false);
  const [activeLeadForAudit, setActiveLeadForAudit] = useState<ReturnedLeadItem | null>(null);

  // Fetch returned leads
  const fetchReturnedLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getReturnedLeads({
        page,
        limit,
        search: searchQuery.trim() || undefined,
        visaType: visaFilter !== 'ALL' ? visaFilter : undefined,
        taxYear: taxYearFilter,
        priority: priorityFilter !== 'ALL' ? priorityFilter : undefined,
        department: departmentFilter !== 'ALL' ? departmentFilter : undefined,
      });

      if (res?.data) {
        setLeads(res.data.leads || []);
        setStats(res.data.stats || {
          totalReturned: 0,
          availableAgents: 0,
          todayReassigned: 0,
        });
        setAgents(res.data.agents || []);
        if (res.data.pagination) {
          setPage(res.data.pagination.currentPage);
          setTotalPages(res.data.pagination.totalPages);
          setTotalItems(res.data.pagination.totalItems);
        }
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to fetch returned leads');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, searchQuery, visaFilter, taxYearFilter, priorityFilter, departmentFilter]);

  // Initial and reactive load
  useEffect(() => {
    fetchReturnedLeads();
  }, [fetchReturnedLeads]);

  // Reset pagination on filter change
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setPage(1);
  }, []);

  const handleVisaChange = useCallback((visa: string) => {
    setVisaFilter(visa);
    setPage(1);
  }, []);

  const handleTaxYearChange = useCallback((year?: number) => {
    setTaxYearFilter(year);
    setPage(1);
  }, []);

  const handlePriorityChange = useCallback((priority: string) => {
    setPriorityFilter(priority);
    setPage(1);
  }, []);

  const handleDepartmentChange = useCallback((dept: string) => {
    setDepartmentFilter(dept);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  // Modal Openers
  const handleOpenAssignModal = useCallback((lead?: ReturnedLeadItem) => {
    if (lead) {
      setSelectedRows([lead]);
    }
    setIsAssignModalOpen(true);
  }, []);

  const handleCloseAssignModal = useCallback(() => {
    setIsAssignModalOpen(false);
  }, []);

  const handleOpenAuditDrawer = useCallback((lead: ReturnedLeadItem) => {
    setActiveLeadForAudit(lead);
    setIsAuditDrawerOpen(true);
  }, []);

  const handleCloseAuditDrawer = useCallback(() => {
    setIsAuditDrawerOpen(false);
    setActiveLeadForAudit(null);
  }, []);

  // Direct Assignment Action
  const handleDirectAssign = useCallback(
    async (targetAgentId: string) => {
      if (selectedRows.length === 0) {
        toast.error('No leads selected for assignment');
        return;
      }
      setIsActionLoading(true);
      try {
        const applicationIds = selectedRows.map((r) => r.id);
        const res = await adminService.assignReturnedLeadsBulk({
          applicationIds,
          targetAgentId,
        });

        toast.success(res?.message || `Successfully assigned ${applicationIds.length} lead(s) to staff!`);
        setIsAssignModalOpen(false);
        setSelectedRows([]);
        fetchReturnedLeads();
      } catch (err: any) {
        toast.error(err?.response?.data?.message || err?.message || 'Failed to assign leads');
      } finally {
        setIsActionLoading(false);
      }
    },
    [selectedRows, fetchReturnedLeads]
  );

  // Auto Round-Robin Action
  const handleAutoRoundRobin = useCallback(
    async (specificApplicationIds?: string[]) => {
      const ids = specificApplicationIds || (selectedRows.length > 0 ? selectedRows.map((r) => r.id) : undefined);
      setIsActionLoading(true);
      try {
        const res = await adminService.autoRoundRobinReturnedLeads({
          applicationIds: ids,
        });

        toast.success(res?.message || 'Round-Robin distribution completed successfully!');
        setIsAssignModalOpen(false);
        setSelectedRows([]);
        fetchReturnedLeads();
      } catch (err: any) {
        toast.error(err?.response?.data?.message || err?.message || 'Failed to auto-distribute leads');
      } finally {
        setIsActionLoading(false);
      }
    },
    [selectedRows, fetchReturnedLeads]
  );

  return {
    leads,
    agents,
    stats,
    isLoading,
    isActionLoading,
    searchQuery,
    visaFilter,
    taxYearFilter,
    priorityFilter,
    departmentFilter,
    page,
    limit,
    totalPages,
    totalItems,
    selectedRows,
    setSelectedRows,
    isAssignModalOpen,
    isAuditDrawerOpen,
    activeLeadForAudit,
    handleSearchChange,
    handleVisaChange,
    handleTaxYearChange,
    handlePriorityChange,
    handleDepartmentChange,
    handlePageChange,
    handleLimitChange,
    handleOpenAssignModal,
    handleCloseAssignModal,
    handleOpenAuditDrawer,
    handleCloseAuditDrawer,
    handleDirectAssign,
    handleAutoRoundRobin,
    refreshData: fetchReturnedLeads,
  };
};
