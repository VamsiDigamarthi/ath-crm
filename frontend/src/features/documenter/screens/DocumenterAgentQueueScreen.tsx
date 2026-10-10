import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { AppConfirmDialog } from '@/shared/components/AppConfirmDialog';
import { documenterService } from '../services/documenter-service';
import { useDocumenterWorkspace } from '../hooks/useDocumenterWorkspace';
import { CallOutreachModal } from '../components/CallOutreachModal';
import { StartFilingModal } from '../components/StartFilingModal';
import { getDocumenterColumns } from '../columns/documenter-columns';
import { UnifiedTable } from '@/shared/components/table/UnifiedTable';
import { exportTableToExcel } from '@/shared/utils/export-excel';
import type { DocumenterLeadItem } from '../types/documenter.types';
import { AppTabs } from '@/shared/components/AppTabs';
import { useMyLeadsTabs, type MyLeadsTab } from '../hooks/useMyLeadsTabs';

export const DocumenterAgentQueueScreen: React.FC = () => {
  const {
    agents,
    isLoading,
    isActionLoading,
    isCallModalOpen,
    isStartFilingModalOpen,
    activeLeadForCall,
    activeLeadForStartFiling,
    handleOpenCallModal,
    handleOpenAssignModal,
    handleOpenStartFilingModal,
    handleStartFiling,
    handleCloseModals,
    handleSaveCallDisposition,
    handleUpdatePriority,
  } = useDocumenterWorkspace('OUTREACH');

  // Client tabs: Assigned leads · Pending · Voicemail · Callbacks · Follow-ups · Not interested
  const { activeTab, setActiveTab, tabs, visibleLeads, isLoading: isTabsLoading, refresh: refreshTabs } = useMyLeadsTabs();

  // Not interested / Invalid tabs: agent sends the lead back to the admin pool (never automatic)
  const canReturnToAdmin = activeTab === 'NOT_INTERESTED' || activeTab === 'INVALID';
  const [leadToReturn, setLeadToReturn] = useState<DocumenterLeadItem | null>(null);
  const [isReturning, setIsReturning] = useState(false);

  const handleConfirmReturn = async () => {
    if (!leadToReturn) return;
    setIsReturning(true);
    try {
      await documenterService.returnLeadsToPool({
        applicationIds: [leadToReturn.id],
        reason:
          activeTab === 'INVALID'
            ? 'Invalid / disconnected number - Returned to Admin Pool'
            : 'Not Interested - Returned to Admin Pool for Redistribution',
      });
      toast.success('Lead returned to admin');
      setLeadToReturn(null);
      refreshTabs();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to return lead');
    } finally {
      setIsReturning(false);
    }
  };

  // Keep tab counts in sync after any change made from this page
  const handleUpdatePriorityAndRefresh = async (applicationId: string, priority: string) => {
    await handleUpdatePriority(applicationId, priority);
    refreshTabs();
  };
  const handleSaveDispositionAndRefresh: typeof handleSaveCallDisposition = async (...args) => {
    const result = await handleSaveCallDisposition(...args);
    refreshTabs();
    return result;
  };
  const handleStartFilingAndRefresh: typeof handleStartFiling = async (...args) => {
    const result = await handleStartFiling(...args);
    refreshTabs();
    return result;
  };

  const columns = useMemo(
    () =>
      getDocumenterColumns({
        onOpenCallModal: handleOpenCallModal,
        onOpenAssignModal: handleOpenAssignModal,
        onOpenStartFilingModal: handleOpenStartFilingModal,
        onUpdatePriority: handleUpdatePriorityAndRefresh,
        hideAssignedStaff: true,
        isManagerView: false,
        isAdmin: false,
        viewOnlyWhenInterested: true,
        onReturnToAdmin: canReturnToAdmin ? setLeadToReturn : undefined,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleOpenCallModal, handleOpenAssignModal, handleOpenStartFilingModal, handleUpdatePriority, canReturnToAdmin]
  );

  const handleExport = () => {
    exportTableToExcel(
      visibleLeads,
      [
        { header: 'Taxpayer', key: 'fullName', format: (r) => r.customer?.fullName || `${r.customer?.firstName || ''} ${r.customer?.lastName || ''}` },
        { header: 'Email', key: 'email', format: (r) => r.customer?.email || '—' },
        { header: 'Phone', key: 'phone', format: (r) => r.customer?.phone || '—' },
        { header: 'Priority', key: 'priority' },
        { header: 'Stage', key: 'stage', format: (r) => r.currentStage },
        { header: 'Last Call Status', key: 'callStatus', format: (r) => r.lastCallLog?.disposition || 'No calls' },
        { header: 'Comment', key: 'comment', format: (r) => r.lastCallLog?.callSummary || '' },
      ],
      'documenter_agent_queue'
    );
  };

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      <AppTabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as MyLeadsTab)} size="sm" />

      <UnifiedTable<DocumenterLeadItem>
        title="DOCUMENTER OUTREACH & CALLING QUEUE"
        subtitle="Active pipeline of prospective taxpayers assigned to you for intake outreach and qualification."
        data={visibleLeads}
        columns={columns}
        isLoading={isLoading || isTabsLoading}
        searchPlaceholder="Search leads by name, email, phone..."
        onExportExcel={handleExport}
        // No row click here: a lead opens only through the "View" button (shown for interested calls)
        emptyText="No assigned leads in your outreach queue."
      />

      <AppConfirmDialog
        isOpen={Boolean(leadToReturn)}
        onClose={() => setLeadToReturn(null)}
        onConfirm={handleConfirmReturn}
        title="Return lead to admin?"
        description={`${leadToReturn?.customer?.fullName || 'This lead'} will be removed from your list and go to the admin's Returned Leads for reassignment.`}
        confirmLabel="Return to admin"
        variant="warning"
        isLoading={isReturning}
      />

      {/* Call Outreach & Disposition Modal */}
      <CallOutreachModal
        isOpen={isCallModalOpen}
        onClose={handleCloseModals}
        lead={activeLeadForCall}
        isManager={false}
        onSaveDisposition={handleSaveDispositionAndRefresh}
        isLoading={isActionLoading}
      />

      {/* Start / Configure Tax Filing Modal */}
      <StartFilingModal
        isOpen={isStartFilingModalOpen}
        onClose={handleCloseModals}
        lead={activeLeadForStartFiling}
        agents={agents}
        onConfirmStartFiling={handleStartFilingAndRefresh}
        isLoading={isActionLoading}
      />
    </div>
  );
};
