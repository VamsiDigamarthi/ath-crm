import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerDirectory } from '../hooks/useCustomerDirectory';
import { createAdminCustomerColumns } from '../columns/customer-columns';
import { UnifiedTable } from '@/shared/components/table/UnifiedTable';
import { exportTableToExcel } from '@/shared/utils/export-excel';
import { StartNewTaxYearModal } from '../components/StartNewTaxYearModal';
import type { AdminCustomerItem } from '../types/customer-directory.types';

export const AdminCustomerDirectoryScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    loading,
    data,
    searchQuery,
    handleSearchChange,
    page,
    handlePageChange,
    fetchCustomers,
  } = useCustomerDirectory();

  const [customerForNewTaxYear, setCustomerForNewTaxYear] = useState<AdminCustomerItem | null>(null);

  const customersList = data?.customers || [];

  const handleInspect = (customer: AdminCustomerItem) => {
    navigate(`/admin/all-taxpayers/${customer.customerId || customer.id}`);
  };

  const columns = useMemo(
    () => createAdminCustomerColumns(handleInspect),
    []
  );

  const handleExport = () => {
    exportTableToExcel(
      customersList,
      [
        { header: 'Full Name', key: 'fullName' },
        { header: 'Email', key: 'email' },
        { header: 'Phone', key: 'phone' },
        { header: 'Tax Year', key: 'taxYear', format: (r) => r.activeApplication?.taxYear ? `TY${r.activeApplication.taxYear}` : '—' },
        { header: 'Stage', key: 'stage', format: (r) => r.activeApplication?.currentStage || 'RAW_PROSPECT' },
        { header: 'Payment Status', key: 'payment', format: (r) => r.activeApplication?.paymentStatus || 'UNPAID' },
        { header: 'IRS Status', key: 'irsStatus', format: (r) => r.activeApplication?.irsStatus || 'PENDING' },
        { header: 'Assigned Specialist', key: 'agent', format: (r) => r.activeApplication?.assignedTeam?.docAgent || 'Unassigned' },
      ],
      'client_directory'
    );
  };

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      <UnifiedTable<AdminCustomerItem>
        title="CLIENT FILES & TAX RETURNS"
        subtitle="Manage active customer profiles, monitor multi-year filing records, and inspect return statuses."
        data={customersList}
        columns={columns}
        isLoading={loading}
        searchPlaceholder="Search by taxpayer name, email, phone..."
        searchValue={searchQuery}
        onSearchChange={handleSearchChange}
        serverPagination={{
          currentPage: page,
          totalPages: data?.pagination?.totalPages || 1,
          totalEntries: data?.pagination?.total || customersList.length,
          pageSize: data?.pagination?.limit || 10,
          onPageChange: handlePageChange,
        }}
        onExportExcel={handleExport}
        onRowClick={handleInspect}
        emptyText="No customer files match your search criteria."
      />

      {customerForNewTaxYear && (
        <StartNewTaxYearModal
          isOpen={Boolean(customerForNewTaxYear)}
          onClose={() => setCustomerForNewTaxYear(null)}
          customer={customerForNewTaxYear}
          onSuccess={() => {
            setCustomerForNewTaxYear(null);
            fetchCustomers();
          }}
        />
      )}
    </div>
  );
};
