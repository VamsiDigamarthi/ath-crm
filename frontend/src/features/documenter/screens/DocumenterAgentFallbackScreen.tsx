import React, { useMemo } from 'react';
import { useStatsVisibility } from '@/shared/hooks/useStatsVisibility';
import { StatsToggleButton } from '@/shared/components/StatsToggleButton';
// import { useNavigate } from 'react-router-dom';
import { useDocumenterWorkspace } from '../hooks/useDocumenterWorkspace';
import { CallOutreachModal } from '../components/CallOutreachModal';
import { StartFilingModal } from '../components/StartFilingModal';
import { getDocumenterColumns } from '../columns/documenter-columns';
import { UnifiedTable } from '@/shared/components/table/UnifiedTable';
import { exportTableToExcel } from '@/shared/utils/export-excel';
import type { DocumenterLeadItem } from '../types/documenter.types';
import { useScheduleStats } from '../hooks/useScheduleStats';
import { ScheduleStatCards } from '../components/ScheduleStatCards';
import { useLeadFilters } from '../hooks/useLeadFilters';
import { AppFilterFlyout, withoutAllValues } from '@/shared/components/AppFilterFlyout';

export const DocumenterAgentFallbackScreen: React.FC = () => {
  // Stat cards: shown by default, "Hide stats" button next to Filters
  const { showStats, toggleStats } = useStatsVisibility('doc_follow_ups');
  // const navigate = useNavigate(); // row click disabled
  const {
    agents,
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
  } = useDocumenterWorkspace('FALLBACK');

  // Cards count every follow-up; the table lists only the ones still waiting (+ Priority / Visa filter)
  const { stats: scheduleStats, refresh: refreshStats, pendingLeads, isLoading } = useScheduleStats('FOLLOW_UPS');
  const { filters, setFilters, filterCategories, filteredLeads } = useLeadFilters(pendingLeads);
  const handleSaveDispositionAndRefresh: typeof handleSaveCallDisposition = async (...args) => {
    const result = await handleSaveCallDisposition(...args);
    refreshStats();
    return result;
  };

  const columns = useMemo(
    () =>
      getDocumenterColumns({
        onOpenCallModal: handleOpenCallModal,
        onOpenAssignModal: handleOpenAssignModal,
        onOpenStartFilingModal: handleOpenStartFilingModal,
        hideAssignedStaff: true,
        isManagerView: false,
        isAdmin: false,
        viewOnlyWhenInterested: true,
      }),
    [handleOpenCallModal, handleOpenAssignModal, handleOpenStartFilingModal]
  );

  const handleExport = () => {
    exportTableToExcel(
      filteredLeads,
      [
        { header: 'Taxpayer', key: 'fullName', format: (r) => r.customer?.fullName || `${r.customer?.firstName || ''} ${r.customer?.lastName || ''}` },
        { header: 'Email', key: 'email', format: (r) => r.customer?.email || '—' },
        { header: 'Phone', key: 'phone', format: (r) => r.customer?.phone || '—' },
        { header: 'Priority', key: 'priority' },
        { header: 'Stage', key: 'stage', format: (r) => r.currentStage },
        { header: 'Last Call Status', key: 'callStatus', format: (r) => r.lastCallLog?.disposition || 'No calls' },
        { header: 'Comment', key: 'comment', format: (r) => r.lastCallLog?.callSummary || '' },
      ],
      'documenter_fallback_pool'
    );
  };

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      {showStats && (
        <ScheduleStatCards label="follow-ups" stats={scheduleStats} />
      )}

      <UnifiedTable<DocumenterLeadItem>
        title="Follow-up Leads"
        subtitle="Leads marked for follow-up after earlier call attempts."
        data={filteredLeads}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Search follow-up leads by name, email, phone..."
        onExportExcel={handleExport}
        extraHeaderActions={
          <div className="flex items-center gap-2">
            <StatsToggleButton visible={showStats} onToggle={toggleStats} />
            <AppFilterFlyout categories={filterCategories} selectedFilters={filters} onApply={(f) => setFilters(withoutAllValues(f))} onReset={() => setFilters({})} />
          </div>
        }
        // No row click: a lead opens only through "View" (shown for interested calls), same as My Leads
        // onRowClick={(item) => navigate(`/documenter/agent/documents/${item.id}?from=fallback`, { state: { from: 'agent_fallback' } })}
        emptyText="No leads waiting for follow-up. Great job!"
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
        onConfirmStartFiling={handleStartFiling}
        isLoading={isActionLoading}
      />
    </div>
  );
};
