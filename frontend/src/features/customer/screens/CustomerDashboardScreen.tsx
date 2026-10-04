import React, { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useCustomerDashboard } from '../hooks/useCustomerDashboard';
import { CustomerStatsCards } from '../components/CustomerStatsCards';
import { CustomerFilingsTable } from '../components/CustomerFilingsTable';
import { type CustomerFilingItem } from '../services/customer-api';

export const CustomerDashboardScreen: React.FC = () => {
  const { selectedTaxYear, isConvertedCustomer: contextConverted } = useOutletContext<{
    selectedTaxYear?: string;
    isConvertedCustomer?: boolean;
    customerProfile?: any;
    user?: any;
  }>() || {};

  // Real Backend Data from GET /api/v1/customer/dashboard
  const { dashboardData, loading } = useCustomerDashboard(selectedTaxYear);

  const isConverted = dashboardData?.taxpayer?.isConvertedCustomer ?? contextConverted ?? false;
  const taxpayerName = dashboardData?.taxpayer?.name || 'Taxpayer';
  const assignedAgentName = dashboardData?.assignedTeam?.docAgent?.name || 'Assigned Specialist';

  const fedRefund = dashboardData?.refund?.fedRefund ?? 0;
  const fedDue = dashboardData?.refund?.fedDue ?? 0;
  const stateRefund = dashboardData?.refund?.stateRefund ?? 0;
  const stateDue = dashboardData?.refund?.stateDue ?? 0;
  const totalRefund = dashboardData?.refund?.totalRefund ?? 0;
  const totalBalanceDue = dashboardData?.refund?.totalBalanceDue ?? 0;

  const currentStage = dashboardData?.application?.currentStage || (isConverted ? 'FILING_SUCCESS' : 'DOC_PREP');
  const docCount = dashboardData?.stats?.docCount ?? 0;
  const organizerPercent = dashboardData?.stats?.organizerPercent ?? (isConverted ? 100 : 75);

  // Derive filings list from backend response or synthesize fallback
  const filings: CustomerFilingItem[] = useMemo(() => {
    if (dashboardData?.filings && dashboardData.filings.length > 0) {
      return dashboardData.filings;
    }

    if (Array.isArray(dashboardData?.filings) && dashboardData.filings.length === 0) {
      return [];
    }

    if (!dashboardData?.application) {
      return [];
    }

    // Fallback: construct from current active application & history
    const activeTaxYearNum = selectedTaxYear ? parseInt(selectedTaxYear, 10) : dashboardData.application.taxYear;
    const isSuccess = isConverted || currentStage === 'FILING_SUCCESS';

    const currentFiling: CustomerFilingItem = {
      id: dashboardData.application.id,
      taxYear: activeTaxYearNum,
      filingType: dashboardData.application.filingType || 'INDIVIDUAL',
      currentStage: currentStage,
      isCompleted: isSuccess,
      isActive: !isSuccess,
      totalRefund: totalRefund || 0,
      totalBalanceDue: totalBalanceDue || 0,
      fedRefund: fedRefund || 0,
      fedDue: fedDue || 0,
      stateRefund: stateRefund || 0,
      stateDue: stateDue || 0,
      documentsCount: docCount || 0,
      organizerPercent: organizerPercent || 0,
      assignedSpecialist: assignedAgentName,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    return [currentFiling];
  }, [
    dashboardData,
    selectedTaxYear,
    isConverted,
    currentStage,
    totalRefund,
    totalBalanceDue,
    fedRefund,
    fedDue,
    stateRefund,
    stateDue,
    docCount,
    organizerPercent,
    assignedAgentName,
  ]);

  const activeFilingsCount = dashboardData?.stats?.activeFilingsCount ?? filings.filter((f) => f.isActive).length;
  const completedFilingsCount = dashboardData?.stats?.completedFilingsCount ?? filings.filter((f) => f.isCompleted).length;

  return (
    <div className="space-y-6 pb-8 font-sans animate-in fade-in duration-150">
      {/* 1. Clean Top Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight">
          Tax Filing Overview
        </h2>
        <p className="text-xs sm:text-sm text-black/80 mt-1 font-medium">
          Welcome back, {taxpayerName}. Track your active tax filings, refund calculations, and IRS submission progress.
        </p>
      </div>

      {/* 2. Top 4 Clean Stat Cards */}
      <CustomerStatsCards
        activeFilingsCount={activeFilingsCount}
        completedFilingsCount={completedFilingsCount}
        totalRefund={totalRefund}
        totalBalanceDue={totalBalanceDue}
        isConvertedCustomer={isConverted}
        activeTaxYear={selectedTaxYear || 2025}
        filings={filings}
        availableTaxYears={dashboardData?.availableTaxYears}
      />

      {/* 3. Below: Clean Active Filings Table */}
      <CustomerFilingsTable
        filings={filings}
        loading={loading}
        selectedTaxYear={selectedTaxYear}
      />
    </div>
  );
};
