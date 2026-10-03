import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { UnifiedTable } from '@/shared/components/table/UnifiedTable';
import { exportTableToExcel } from '@/shared/utils/export-excel';
import { createCustomerFilingColumns } from '../columns/customer-filing-columns';
import { type CustomerFilingItem } from '../services/customer-api';

interface CustomerFilingsTableProps {
  filings: CustomerFilingItem[];
  loading?: boolean;
  onSelectTaxYear?: (year: string) => void;
  selectedTaxYear?: string;
}

export const CustomerFilingsTable: React.FC<CustomerFilingsTableProps> = ({
  filings = [],
  loading = false,
  onSelectTaxYear,
}) => {
  const navigate = useNavigate();

  const handleView = (item: CustomerFilingItem) => {
    if (onSelectTaxYear) onSelectTaxYear(item.taxYear.toString());
    if (item.isCompleted || item.currentStage === 'FILING_SUCCESS') {
      navigate(`/customer/organizer?year=${item.taxYear}&tab=m_vault`);
    } else if (
      item.currentStage === 'QA_APPROVED' ||
      item.currentStage === 'SALES_PITCH_QUEUE' ||
      item.currentStage === 'SALES_PITCHING' ||
      item.currentStage === 'PAYMENT_PENDING'
    ) {
      navigate('/customer/billing');
    } else {
      navigate(`/customer/organizer?year=${item.taxYear}&type=${item.filingType || 'INDIVIDUAL'}`);
    }
  };

  const columns = useMemo(
    () => createCustomerFilingColumns(handleView),
    [onSelectTaxYear, navigate]
  );

  const handleExport = () => {
    exportTableToExcel(
      filings,
      [
        { header: 'Tax Year', key: 'taxYear', format: (r) => `TY${r.taxYear}` },
        { header: 'Filing Type', key: 'filingType' },
        { header: 'Stage', key: 'currentStage' },
        { header: 'Estimated Refund', key: 'totalRefund' },
        { header: 'Due Amount', key: 'totalBalanceDue' },
        { header: 'Documents Count', key: 'documentsCount' },
      ],
      'my_tax_filings'
    );
  };

  return (
    <div className="space-y-4 font-sans">
      <UnifiedTable<CustomerFilingItem>
        title="MY TAX FILINGS & STATUS"
        subtitle="Track active IRS tax returns, review computed refunds, and upload supporting documents."
        data={filings}
        columns={columns}
        isLoading={loading}
        searchPlaceholder="Search filings by tax year, type, stage..."
        onExportExcel={handleExport}
        onRowClick={handleView}
        emptyText="No tax return filings found in your profile."
      />
    </div>
  );
};
