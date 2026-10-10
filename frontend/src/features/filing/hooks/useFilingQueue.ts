import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { filingService } from '../services/filing-service';
import type { FilingLeadItem, FilingStaffMember } from '../types/filing.types';
import toast from 'react-hot-toast';

export type FilingSpecialistTab =
  | 'READY'         // Ready for Filing
  | 'PENDING'       // Filing Pending
  | 'ON_HOLD'       // Filing on Hold
  | 'REJECTED'      // Rejected Returns
  | 'FILED'         // Filed Returns
  | 'ALL';          // All Returns

export const isReturnOnHold = (l: FilingLeadItem): boolean => {
  if (Boolean(l.lastRevert && !l.lastRevert.resolved)) return true;
  if (
    ['CORRECTION_NEEDED', 'DOC_OUTREACH', 'DOC_PREP', 'SALES_PITCH_QUEUE', 'SALES_PITCHING', 'QA_REVISION_REQUESTED'].includes(
      l.currentStage
    )
  ) {
    return true;
  }
  if ((l.taxDraftSummary as any)?.status === 'ON_HOLD') return true;
  return false;
};

export const isReturnRejected = (l: FilingLeadItem): boolean => {
  if (isReturnOnHold(l)) return false;
  if (l.currentStage === 'FILING_FAILED') return true;
  if (l.transmissionInfo?.status === 'REJECTED' || l.transmissionInfo?.status === 'FAILED') return true;
  if (
    Boolean(l.transmissionInfo?.irsAckCode) &&
    l.transmissionInfo?.irsAckCode !== '0000_ACCEPTED' &&
    l.currentStage !== 'FILING_SUCCESS'
  ) {
    return true;
  }
  return false;
};

export const isReturnFiled = (l: FilingLeadItem): boolean => {
  if (isReturnOnHold(l) || isReturnRejected(l)) return false;
  if (l.currentStage === 'FILING_SUCCESS') return true;
  if (l.transmissionInfo?.status === 'ACCEPTED') return true;
  if (Boolean(l.transmissionInfo?.acceptanceCertificateId || l.transmissionInfo?.acceptedAt)) return true;
  return false;
};

export const isReturnPending = (l: FilingLeadItem): boolean => {
  if (isReturnOnHold(l) || isReturnRejected(l) || isReturnFiled(l)) return false;
  if (l.currentStage === 'FILING_IN_PROGRESS') return true;
  if (l.transmissionInfo?.status === 'TRANSMITTING' || l.transmissionInfo?.status === 'VALIDATING') return true;
  return false;
};

export const isReturnReady = (l: FilingLeadItem): boolean => {
  if (isReturnOnHold(l) || isReturnRejected(l) || isReturnFiled(l) || isReturnPending(l)) return false;
  return true;
};

export function useFilingQueue(filterAssignedOnly = false, initialTab: FilingSpecialistTab = 'READY') {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [leads, setLeads] = useState<FilingLeadItem[]>([]);
  const [total, setTotal] = useState(0);

  const [activeTab, setActiveTab] = useState<FilingSpecialistTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<'ALL' | 'FILING_QUEUE' | 'FILING_IN_PROGRESS' | 'FILING_SUCCESS' | 'REVERTED'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
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
        search: searchQuery.trim() || undefined,
        priority: priorityFilter !== 'ALL' ? priorityFilter : undefined,
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
  }, [searchQuery, priorityFilter, filterAssignedOnly, user?.id, user?.email]);

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

  const counts = useMemo(() => {
    let ready = 0;
    let pending = 0;
    let onHold = 0;
    let rejected = 0;
    let filed = 0;

    leads.forEach((l) => {
      if (isReturnOnHold(l)) {
        onHold++;
      } else if (isReturnRejected(l)) {
        rejected++;
      } else if (isReturnFiled(l)) {
        filed++;
      } else if (isReturnPending(l)) {
        pending++;
      } else {
        ready++;
      }
    });

    return {
      ready,
      pending,
      onHold,
      rejected,
      filed,
      all: leads.length,
    };
  }, [leads]);

  const categorizedLeads = useMemo(() => {
    return leads.filter((item) => {
      if (activeTab === 'READY' && !isReturnReady(item)) return false;
      if (activeTab === 'PENDING' && !isReturnPending(item)) return false;
      if (activeTab === 'ON_HOLD' && !isReturnOnHold(item)) return false;
      if (activeTab === 'REJECTED' && !isReturnRejected(item)) return false;
      if (activeTab === 'FILED' && !isReturnFiled(item)) return false;
      return true;
    });
  }, [leads, activeTab]);

  // from = sidebar page (e.g. "on-hold") so the workspace keeps it highlighted
  const handleOpenWorkspace = (leadId: string, from?: string) => {
    navigate(`/filing/workspace/${leadId}${from ? `?from=${from}` : ''}`);
  };

  // Customer first: open the client's tax years; View there opens the workspace
  const handleOpenClient = (lead: FilingLeadItem, from?: string) => {
    const base = filterAssignedOnly ? '/filing/agent/client' : '/filing/manager/client';
    navigate(`${base}/${lead.customerId}${from ? `?from=${from}` : ''}`);
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
    activeTab,
    setActiveTab,
    counts,
    categorizedLeads,
    searchQuery,
    setSearchQuery,
    stageFilter,
    setStageFilter,
    priorityFilter,
    setPriorityFilter,
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
    handleOpenClient,
    handleOpenAssignModal,
    handleCloseAssignModal,
    handleDirectAssign,
    handleRoundRobinAssign,
  };
}
