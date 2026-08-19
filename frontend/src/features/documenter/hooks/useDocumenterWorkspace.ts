import { useState, useEffect, useCallback } from 'react';
import type { 
  DocumenterLeadItem, 
  DocumenterStats, 
  DocumenterAgentItem, 
  DocumenterTab,
  CallDisposition 
} from '../types/documenter.types';
import { documenterService } from '../services/documenter-service';
import { useAuthStore } from '@/features/auth/store/auth-store';
import toast from 'react-hot-toast';

export const useDocumenterWorkspace = (defaultTab?: DocumenterTab) => {
  const { user } = useAuthStore();
  const isAgent = user?.role === 'DOC_AGENT';

  // 1. Filter & Pagination State
  const [timeRange, setTimeRange] = useState<'TODAY' | 'WEEK' | 'SEASON'>('TODAY');
  const [activeTab, setActiveTab] = useState<DocumenterTab>(
    defaultTab || (isAgent ? 'ALL' : 'UNASSIGNED')
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [visaFilter, setVisaFilter] = useState<string>('ALL');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // 2. Data State
  const [leads, setLeads] = useState<DocumenterLeadItem[]>([]);
  const [agents, setAgents] = useState<DocumenterAgentItem[]>([]);
  const [stats, setStats] = useState<DocumenterStats>({
    unassigned: 0,
    activeOutreach: 0,
    inPrep: 0,
    myLeads: 0,
    callbacks: 0,
    total: 0,
  });
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 3. Selection & Modal State
  const [selectedRows, setSelectedRows] = useState<DocumenterLeadItem[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState<boolean>(false);
  const [activeLeadForCall, setActiveLeadForCall] = useState<DocumenterLeadItem | null>(null);
  const [activeLeadForAssign, setActiveLeadForAssign] = useState<DocumenterLeadItem | null>(null);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch leads
  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await documenterService.getLeads({
        page,
        limit,
        tab: activeTab,
        search: debouncedSearch || undefined,
        visaType: visaFilter !== 'ALL' ? visaFilter : undefined,
        timeRange,
      });

      if (res?.data) {
        setLeads(res.data.leads || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setTotalItems(res.data.pagination?.totalItems || 0);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch documenter leads:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, activeTab, debouncedSearch, visaFilter, timeRange]);

  // Fetch agents list for assignment
  const fetchAgents = useCallback(async () => {
    try {
      const res = await documenterService.getAgents({ timeRange });
      if (res?.data) {
        setAgents(res.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch documenter agents:', err);
    }
  }, [timeRange]);

  // Initial load & when dependencies change
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  // Handlers
  const handleTabChange = useCallback((tab: DocumenterTab) => {
    setActiveTab(tab);
    setPage(1);
    setSelectedRows([]);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  // 1-Click Auto Round-Robin
  const handleAutoRoundRobin = useCallback(async () => {
    setIsActionLoading(true);
    try {
      const targetIds = selectedRows.length > 0
        ? selectedRows.map((r) => r.id)
        : (activeLeadForAssign ? [activeLeadForAssign.id] : undefined);

      const res = await documenterService.autoRoundRobin({
        applicationIds: targetIds,
      });

      toast.success(
        res?.message ||
          `Distributed ${res?.data?.totalDistributed || targetIds?.length || 'all'} leads equally across agents!`
      );

      setIsAssignModalOpen(false);
      setActiveLeadForAssign(null);
      setSelectedRows([]);
      fetchLeads();
      fetchAgents();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to execute round-robin');
    } finally {
      setIsActionLoading(false);
    }
  }, [selectedRows, activeLeadForAssign, fetchLeads, fetchAgents]);

  // Direct Staff Assignment
  const handleDirectAssign = useCallback(async (agentId: string) => {
    setIsActionLoading(true);
    try {
      const targetIds = selectedRows.length > 0
        ? selectedRows.map((r) => r.id)
        : (activeLeadForAssign ? [activeLeadForAssign.id] : []);

      if (targetIds.length === 0) {
        toast.error('No leads selected');
        return;
      }

      const res = await documenterService.assignBulk({
        applicationIds: targetIds,
        targetAgentId: agentId,
      });

      toast.success(
        res?.message ||
          `Assigned ${targetIds.length} leads to ${res?.data?.targetAgent?.email || 'staff member'}!`
      );

      setIsAssignModalOpen(false);
      setActiveLeadForAssign(null);
      setSelectedRows([]);
      fetchLeads();
      fetchAgents();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to assign leads');
    } finally {
      setIsActionLoading(false);
    }
  }, [selectedRows, activeLeadForAssign, fetchLeads, fetchAgents]);

  // Call Outreach & Disposition Logger
  const handleSaveCallDisposition = useCallback(async (payload: {
    applicationId: string;
    disposition: CallDisposition;
    callSummary?: string;
    callbackDate?: string;
  }) => {
    setIsActionLoading(true);
    try {
      const res = await documenterService.logCallDisposition({
        applicationIds: [payload.applicationId],
        disposition: payload.disposition,
        callSummary: payload.callSummary,
        callbackDate: payload.callbackDate,
      });

      toast.success(res?.message || 'Call outcome logged successfully!');
      setIsCallModalOpen(false);
      setActiveLeadForCall(null);
      fetchLeads();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to log disposition');
    } finally {
      setIsActionLoading(false);
    }
  }, [fetchLeads]);

  const handleOpenCallModal = useCallback((lead: DocumenterLeadItem) => {
    setActiveLeadForCall(lead);
    setIsCallModalOpen(true);
  }, []);

  const handleOpenAssignModal = useCallback((lead?: DocumenterLeadItem) => {
    if (lead) {
      setActiveLeadForAssign(lead);
    } else {
      setActiveLeadForAssign(null);
    }
    setIsAssignModalOpen(true);
  }, []);

  const handleCloseModals = useCallback(() => {
    setIsAssignModalOpen(false);
    setIsCallModalOpen(false);
    setActiveLeadForCall(null);
    setActiveLeadForAssign(null);
  }, []);

  return {
    user,
    isAgent,
    activeTab,
    handleTabChange,
    searchQuery,
    setSearchQuery,
    visaFilter,
    setVisaFilter,
    leads,
    agents,
    stats,
    isLoading,
    isActionLoading,
    page,
    limit,
    totalPages,
    totalItems,
    handlePageChange,
    handleLimitChange,
    selectedRows,
    setSelectedRows,
    handleAutoRoundRobin,
    handleDirectAssign,
    isAssignModalOpen,
    isCallModalOpen,
    activeLeadForCall,
    activeLeadForAssign,
    handleOpenCallModal,
    handleOpenAssignModal,
    handleCloseModals,
    timeRange,
    setTimeRange,
    handleSaveCallDisposition,
    refreshData: fetchLeads,
  };
};
