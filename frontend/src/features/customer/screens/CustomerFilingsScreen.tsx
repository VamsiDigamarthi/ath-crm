import React, { useState, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useCustomerDashboard } from '../hooks/useCustomerDashboard';
import { UnifiedTable } from '@/shared/components/table/UnifiedTable';
import { exportTableToExcel } from '@/shared/utils/export-excel';
import { createCustomerFilingColumns } from '../columns/customer-filing-columns';
import { Button } from '@/shared/components/Button';
import { CreateNewFilingModal } from '../components/CreateNewFilingModal';
import { type CustomerFilingItem } from '../services/customer-api';
import { Plus } from 'lucide-react';

export const CustomerFilingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { selectedTaxYear, customerProfile } = useOutletContext<{
    selectedTaxYear?: string;
    isConvertedCustomer?: boolean;
    customerProfile?: any;
    user?: any;
  }>() || {};

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { dashboardData, loading } = useCustomerDashboard(selectedTaxYear);

  const applications = useMemo(() => customerProfile?.applications || [], [customerProfile?.applications]);

  // Derive filings list from dashboard response or user applications
  const filings: CustomerFilingItem[] = useMemo(() => {
    if (dashboardData?.filings && dashboardData.filings.length > 0) {
      return dashboardData.filings;
    }

    if (applications.length > 0) {
      return applications.map((app: any) => {
        const appDraft = (app.taxDraftSummary as any) || {};
        const aFedRefund = Number(appDraft.fedRefund ?? appDraft.federalRefund ?? appDraft.federalTaxRefund ?? 0);
        const aFedDue = Number(appDraft.balanceDue ?? appDraft.federalBalanceDue ?? 0);
        const aStateRefund = Number(appDraft.stateRefund ?? appDraft.stateTaxRefund ?? 0);
        const aStateDue = Number(appDraft.stateBalanceDue ?? 0);
        const aTotalRefund = aFedRefund + aStateRefund;
        const aTotalBalanceDue = aFedDue + aStateDue;
        return {
          id: app.id,
          taxYear: Number(app.taxYear),
          filingType: app.filingType || 'INDIVIDUAL',
          currentStage: app.currentStage || 'RAW_PROSPECT',
          isCompleted: app.currentStage === 'FILING_SUCCESS',
          isActive: app.currentStage !== 'FILING_SUCCESS' && app.currentStage !== 'DROPPED_CANCELLED',
          totalRefund: aTotalRefund,
          totalBalanceDue: aTotalBalanceDue,
          fedRefund: aFedRefund,
          fedDue: aFedDue,
          stateRefund: aStateRefund,
          stateDue: aStateDue,
          documentsCount: app.documents?.length || 0,
          organizerPercent: 0,
          assignedSpecialist: 'Assigned Specialist',
          updatedAt: app.updatedAt || new Date().toISOString(),
          createdAt: app.createdAt || new Date().toISOString(),
        };
      });
    }

    return [];
  }, [dashboardData?.filings, applications]);

  const handleView = (item: CustomerFilingItem) => {
    const fType = item.filingType || 'INDIVIDUAL';
    if (item.isCompleted || item.currentStage === 'FILING_SUCCESS') {
      navigate(`/customer/organizer?year=${item.taxYear}&type=${fType}&tab=m_vault`);
    } else if (
      item.currentStage === 'QA_APPROVED' ||
      item.currentStage === 'SALES_PITCH_QUEUE' ||
      item.currentStage === 'SALES_PITCHING' ||
      item.currentStage === 'PAYMENT_PENDING'
    ) {
      navigate('/customer/billing');
    } else {
      navigate(`/customer/organizer?year=${item.taxYear}&type=${fType}`);
    }
  };

  const columns = useMemo(
    () => createCustomerFilingColumns(handleView),
    []
  );

  const handleExport = () => {
    exportTableToExcel(
      filings,
      [
        { header: 'Tax Year', key: 'taxYear', format: (r) => `TY${r.taxYear}` },
        { header: 'Type', key: 'filingType' },
        { header: 'Stage', key: 'currentStage' },
        { header: 'Estimated Refund', key: 'totalRefund' },
        { header: 'Due Amount', key: 'totalBalanceDue' },
        { header: 'Documents', key: 'documentsCount' },
      ],
      'customer_tax_filings'
    );
  };

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
            MY TAX RETURNS & FILINGS
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1 font-normal">
            Manage your personal and business tax returns, track status, and view your tax info and files.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-medium inline-flex items-center gap-1.5 shadow-2xs cursor-pointer px-4 h-9"
        >
          <Plus className="w-4 h-4" />
          <span>New Filing</span>
        </Button>
      </div>

      <UnifiedTable<CustomerFilingItem>
        title="ALL ACTIVE & HISTORICAL RETURNS"
        subtitle="Full registry of your tax return filings and status."
        data={filings}
        columns={columns}
        isLoading={loading}
        searchPlaceholder="Search filings by tax year, type, stage..."
        onExportExcel={handleExport}
        onRowClick={handleView}
        emptyText="No filings found. Click '+ New Filing' to start your return."
      />

      <CreateNewFilingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        existingApplications={applications.length > 0 ? applications : dashboardData?.filings || []}
      />
    </div>
  );
};
