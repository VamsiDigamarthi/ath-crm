import React, { useMemo, useState } from 'react';
import { 
  RefreshCw, 
  Zap,
  ListFilter,
  Send,
  CheckCircle2,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { UnifiedTable } from '@/shared/components/table/UnifiedTable';
import { exportTableToExcel } from '@/shared/utils/export-excel';
import { AppTabs } from '@/shared/components/AppTabs';
import { Button } from '@/shared/components/Button';
import { FilingManagerMetrics } from '../components/manager/FilingManagerMetrics';
import { FilingFloatingActionBar } from '../components/manager/FilingFloatingActionBar';
import { FilingLeadAssignmentModal } from '../components/manager/FilingLeadAssignmentModal';
import { getFilingColumns } from '../columns/filing-columns';
import { useFilingQueue } from '../hooks/useFilingQueue';
import { useAuthStore } from '@/features/auth/store/auth-store';
import type { FilingLeadItem } from '../types/filing.types';

export type FilingTabType = 'ALL' | 'FILING_QUEUE' | 'FILING_IN_PROGRESS' | 'FILING_SUCCESS';

export const FilingDepartmentScreen: React.FC = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  const {
    isLoading,
    leads,
    stageFilter,
    setStageFilter,
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
  } = useFilingQueue(false);

  const [visaFilter] = useState('ALL');

  const stats = useMemo(() => {
    const readyForTransmission = leads.filter((l) => l.currentStage === 'FILING_QUEUE').length;
    const transmittingMeF = leads.filter((l) => l.currentStage === 'FILING_IN_PROGRESS').length;
    const acceptedToday = leads.filter((l) => l.currentStage === 'FILING_SUCCESS').length;
    const totalDepartmentLeads = leads.length;
    const acceptanceRatePct = totalDepartmentLeads > 0 ? Math.round((acceptedToday / totalDepartmentLeads) * 100) : 0;

    return {
      readyForTransmission,
      transmittingMeF,
      acceptedToday,
      rejectedToday: 0,
      totalDepartmentLeads,
      acceptanceRatePct,
    };
  }, [leads]);

  const columns = useMemo(
    () =>
      getFilingColumns({
        onOpenWorkspace: (lead) => handleOpenWorkspace(lead.id),
        onOpenAssignModal: handleOpenAssignModal,
        isSpecialist: false,
        isAdmin,
      }),
    [handleOpenWorkspace, handleOpenAssignModal, isAdmin]
  );

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (visaFilter !== 'ALL' && lead.visaType !== visaFilter) return false;
      return true;
    });
  }, [leads, visaFilter]);

  const tabs = [
    { id: 'FILING_QUEUE', label: '1. Awaiting Assignment / E-File', count: stats.readyForTransmission, icon: Send },
    { id: 'FILING_IN_PROGRESS', label: '2. Transmitting to IRS MeF', count: stats.transmittingMeF, icon: Clock },
    { id: 'FILING_SUCCESS', label: '3. IRS Accepted Filings', count: stats.acceptedToday, icon: CheckCircle2 },
    { id: 'ALL', label: 'All Department Returns', count: stats.totalDepartmentLeads, icon: ListFilter },
  ];

  const handleExport = () => {
    exportTableToExcel(
      filteredLeads,
      [
        { header: 'Taxpayer Name', key: 'name', format: (l) => l.taxpayerName },
        { header: 'Email', key: 'email', format: (l) => l.taxpayerEmail },
        { header: 'Tax Year', key: 'taxYear', format: (l) => `TY${l.taxYear}` },
        { header: 'Stage', key: 'stage', format: (l) => l.currentStage },
        { header: 'Payment Status', key: 'payment', format: (l) => l.clientPaymentStatus || l.paymentStatus },
        { header: 'Assigned Specialist', key: 'specialist', format: (l) => l.assignedFilingAgent?.name || 'Unassigned' },
      ],
      'filing_department_queue'
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* 1. Header & Live MeF Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
              IRS Modernized e-File (MeF) Transmission Supervision
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Direct IRS E-File Pipeline
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 font-normal">
            Supervise QA-approved and fee-paid tax returns, CPA specialist assignments, and IRS MeF acknowledgments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchQueue}
            disabled={isLoading}
            className="border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-normal flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            Refresh
          </Button>

          {!isAdmin && stats.readyForTransmission > 0 && (
            <Button
              size="sm"
              onClick={handleRoundRobinAssign}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-medium flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
              1-Click Auto Distribute ({stats.readyForTransmission})
            </Button>
          )}
        </div>
      </div>

      {/* 2. Metrics Cards */}
      <FilingManagerMetrics
        readyCount={stats.readyForTransmission}
        inProgressCount={stats.transmittingMeF}
        acceptedCount={stats.acceptedToday}
        failedCount={stats.rejectedToday}
        totalCount={stats.totalDepartmentLeads}
      />

      {/* 3. Navigation Tabs */}
      <AppTabs
        tabs={tabs}
        activeTab={stageFilter}
        onChange={(id) => setStageFilter(id as FilingTabType)}
      />

      {/* 4. Unified Table */}
      <UnifiedTable<FilingLeadItem>
        title="IRS MODERNIZED E-FILE CASELOAD PIPELINE"
        subtitle="Manage returns awaiting transmission, transmitting batches, and accepted returns."
        data={filteredLeads}
        columns={columns}
        enableSelection={!isAdmin}
        selectedRows={selectedRows}
        onSelectionChange={(selected) => setSelectedRows(selected)}
        isLoading={isLoading}
        searchPlaceholder="Search taxpayer, phone, stage, specialist..."
        onExportExcel={handleExport}
        emptyText={
          stageFilter === 'FILING_QUEUE'
            ? 'All returns have been transmitted, or no returns are awaiting transmission.'
            : 'No filing returns match the selected filter criteria.'
        }
      />

      {/* 5. Floating Bottom Action Bar */}
      {!isAdmin && (
        <FilingFloatingActionBar
          selectedCount={selectedRows.length}
          onAutoRoundRobin={handleRoundRobinAssign}
          onOpenAssignModal={() => handleOpenAssignModal()}
          onClearSelection={() => setSelectedRows([])}
        />
      )}

      {/* 6. Filing Lead Assignment Modal */}
      <FilingLeadAssignmentModal
        isOpen={isAssignModalOpen}
        onClose={handleCloseAssignModal}
        selectedLeads={activeLeadForAssign ? [activeLeadForAssign] : selectedRows}
        staffList={staffList}
        onConfirmDirectAssign={handleDirectAssign}
        onConfirmRoundRobin={handleRoundRobinAssign}
      />
    </div>
  );
};
