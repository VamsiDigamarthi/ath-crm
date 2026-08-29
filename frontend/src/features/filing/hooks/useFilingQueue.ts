import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { filingService } from '../services/filing-service';
import type { FilingLeadItem, FilingStaffMember } from '../types/filing.types';
import toast from 'react-hot-toast';

export function useFilingQueue(filterAssignedOnly = false) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [leads, setLeads] = useState<FilingLeadItem[]>([]);
  const [total, setTotal] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<'ALL' | 'FILING_QUEUE' | 'FILING_IN_PROGRESS' | 'FILING_SUCCESS'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Selected rows & Assignment Modal States
  const [selectedRows, setSelectedRows] = useState<FilingLeadItem[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [activeLeadForAssign, setActiveLeadForAssign] = useState<FilingLeadItem | null>(null);
  const [staffList, setStaffList] = useState<FilingStaffMember[]>([]);

  const fetchQueue = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await filingService.getQueue({
        stage: stageFilter === 'ALL' ? undefined : stageFilter,
        search: searchQuery.trim() || undefined,
        limit: 100,
      });

      let rawLeads = response.leads || [];
      if (filterAssignedOnly && user?.id) {
        const myId = user.id;
        const myEmail = user.email?.toLowerCase().trim();
        rawLeads = rawLeads.filter((l) => {
          if (!l.assignedFilingAgent) return false;
          return l.assignedFilingAgent.id === myId || l.assignedFilingAgent.email?.toLowerCase().trim() === myEmail;
        });
      }

      setLeads(rawLeads);
      setTotal(rawLeads.length);
    } catch {
      toast.error('Failed to sync filing queue');
      setLeads([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [stageFilter, searchQuery, filterAssignedOnly, user?.id, user?.email]);

  const fetchStaff = useCallback(async () => {
    try {
      const staff = await filingService.getStaff();
      setStaffList(staff || []);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchQueue();
    fetchStaff();
  }, [fetchQueue, fetchStaff]);

  const handleOpenWorkspace = (leadId: string) => {
    navigate(`/filing/workspace/${leadId}`);
  };

  const handleOpenAssignModal = (lead?: FilingLeadItem) => {
    if (lead) {
      setActiveLeadForAssign(lead);
    } else {
      setActiveLeadForAssign(null);
    }
    setIsAssignModalOpen(true);
  };

  const handleCloseAssignModal = () => {
    setIsAssignModalOpen(false);
    setActiveLeadForAssign(null);
  };

  const handleDirectAssign = async (agentId: string) => {
    try {
      const targetIds = activeLeadForAssign
        ? [activeLeadForAssign.id]
        : selectedRows.map((r) => r.id);

      if (targetIds.length === 0) {
        toast.error('Please select at least one return to assign');
        return;
      }

      await filingService.assignFilingAgent(targetIds, agentId);

      toast.success(`Assigned ${targetIds.length} return${targetIds.length > 1 ? 's' : ''} to specialist! 👤✅`);
      setIsAssignModalOpen(false);
      setActiveLeadForAssign(null);
      setSelectedRows([]);
      await fetchQueue();
      await fetchStaff();
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign return');
    }
  };

  const handleRoundRobinAssign = async () => {
    try {
      await filingService.autoRoundRobin();
      toast.success('Auto round-robin allocation completed! ⚖️⚡');
      setIsAssignModalOpen(false);
      setActiveLeadForAssign(null);
      setSelectedRows([]);
      await fetchQueue();
      await fetchStaff();
    } catch (err: any) {
      toast.error(err.message || 'Failed to auto-assign returns');
    }
  };

  return {
    isLoading,
    leads,
    total,
    searchQuery,
    setSearchQuery,
    stageFilter,
    setStageFilter,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    selectedRows,
    setSelectedRows,
    isAssignModalOpen,
    activeLeadForAssign,
    staffList,
    fetchQueue,
    handleOpenWorkspace,
    handleOpenAssignModal,
    handleCloseAssignModal,
    handleDirectAssign,
    handleRoundRobinAssign,
  };
}
