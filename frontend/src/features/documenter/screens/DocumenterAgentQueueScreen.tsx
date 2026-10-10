import React, { useMemo } from 'react';
import { useDocumenterWorkspace } from '../hooks/useDocumenterWorkspace';
import { CallOutreachModal } from '../components/CallOutreachModal';
import { StartFilingModal } from '../components/StartFilingModal';
import { getDocumenterColumns } from '../columns/documenter-columns';
import { UnifiedTable } from '@/shared/components/table/UnifiedTable';
import { exportTableToExcel } from '@/shared/utils/export-excel';
import type { DocumenterLeadItem } from '../types/documenter.types';

export const DocumenterAgentQueueScreen: React.FC = () => {
  const {
    leads,
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

  const columns = useMemo(
    () =>
      getDocumenterColumns({
        onOpenCallModal: handleOpenCallModal,
        onOpenAssignModal: handleOpenAssignModal,
        onOpenStartFilingModal: handleOpenStartFilingModal,
        onUpdatePriority: handleUpdatePriority,
        hideAssignedStaff: true,
        isManagerView: false,
        isAdmin: false,
        viewOnlyWhenInterested: true,
      }),
    [handleOpenCallModal, handleOpenAssignModal, handleOpenStartFilingModal, handleUpdatePriority]
  );

  const handleExport = () => {
    exportTableToExcel(
      leads,
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
      <UnifiedTable<DocumenterLeadItem>
        title="DOCUMENTER OUTREACH & CALLING QUEUE"
        subtitle="Active pipeline of prospective taxpayers assigned to you for intake outreach and qualification."
        data={leads}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Search leads by name, email, phone..."
        onExportExcel={handleExport}
        // No row click here: a lead opens only through the "View" button (shown for interested calls)
        emptyText="No assigned leads in your outreach queue."
      />

      {/* Call Outreach & Disposition Modal */}
      <CallOutreachModal
        isOpen={isCallModalOpen}
        onClose={handleCloseModals}
        lead={activeLeadForCall}
        isManager={false}
        onSaveDisposition={handleSaveCallDisposition}
        isLoading={isActionLoading}
      />

      {/* Start / Configure Tax Filing Modal */}
      <StartFilingModal
        isOpen={isStartFilingModalOpen}
        onClose={handleCloseModals}
        lead={activeLeadForStartFiling}
        agents={agents}
        onConfirmStartFiling={handleStartFiling}
        isLoading={isActionLoading}
      />
    </div>
  );
};
