import React, { useState, useMemo } from 'react';
import { 
  FolderArchive, 
  FileText, 
  Building2,
  CheckCircle2, 
  Clock, 
  CreditCard,
  SendHorizontal,
  Eye
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppTable, type ColumnDef } from '@/shared/components/AppTable';
import { AppTabs, type TabItem } from '@/shared/components/AppTabs';
import { useNavigate } from 'react-router-dom';
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
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'COMPLETED'>('ACTIVE');

  // Filter filings based on tab
  const filteredData = useMemo(() => {
    if (activeTab === 'COMPLETED') {
      return filings.filter((f) => f.isCompleted);
    }
    const active = filings.filter((f) => f.isActive);
    // If none active, fallback to showing all so table is not empty
    return active.length > 0 ? active : filings;
  }, [filings, activeTab]);

  const activeCount = filings.filter((f) => f.isActive).length;
  const completedCount = filings.filter((f) => f.isCompleted).length;

  const tabs: TabItem[] = [
    {
      id: 'ACTIVE',
      label: 'Active Filings',
      count: activeCount,
    },
    {
      id: 'COMPLETED',
      label: 'Completed Returns',
      count: completedCount,
    },
  ];

  const getStageBadge = (stage: string, isCompleted: boolean) => {
    if (isCompleted || stage === 'FILING_SUCCESS') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
          IRS Accepted & Filed
        </span>
      );
    }
    if (stage === 'FILING_QUEUE' || stage === 'FILING_IN_PROGRESS') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-300">
          <SendHorizontal className="w-3.5 h-3.5 text-teal-700 animate-pulse" />
          Transmitting to IRS
        </span>
      );
    }
    if (
      stage === 'QA_APPROVED' ||
      stage === 'SALES_PITCH_QUEUE' ||
      stage === 'SALES_PITCHING' ||
      stage === 'PAYMENT_PENDING'
    ) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-300">
          <CreditCard className="w-3.5 h-3.5 text-purple-700" />
          Quotation & Fee Approval
        </span>
      );
    }
    if (stage === 'QA_IN_REVIEW' || stage === 'QA_REVISION') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-300">
          <Clock className="w-3.5 h-3.5 text-indigo-700 animate-pulse" />
          QA Compliance Audit
        </span>
      );
    }
    if (stage === 'DOC_PREP') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300">
          <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
          Tax Preparation
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-900 border border-blue-300">
        <Clock className="w-3.5 h-3.5 text-blue-700" />
        Document Intake
      </span>
    );
  };

  const columns: ColumnDef<CustomerFilingItem>[] = [
    {
      header: 'Tax Year & Filing',
      render: (item) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-300 text-black flex items-center justify-center font-bold text-xs shrink-0">
            {item.filingType === 'BUSINESS' ? (
              <Building2 className="w-4 h-4 text-black" />
            ) : (
              <FileText className="w-4 h-4 text-black" />
            )}
          </div>
          <div>
            <div className="font-bold text-black text-sm flex items-center gap-1.5">
              <span>TY {item.taxYear}</span>
              {item.isActive && (
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" title="Active Season" />
              )}
            </div>
            <div className="mt-0.5">
              <span className="inline-block px-1.5 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-black border border-slate-300 leading-none">
                {item.filingType === 'BUSINESS' ? 'Business' : 'Individual'}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Current Status',
      render: (item) => getStageBadge(item.currentStage, item.isCompleted),
    },
    {
      header: 'Estimated Refund',
      render: (item) => {
        const hasRefund = (item.totalRefund || 0) > 0;
        return (
          <div>
            <div className={`font-bold text-sm ${hasRefund ? 'text-[#16A34A]' : 'text-slate-700'}`}>
              {hasRefund ? `$${item.totalRefund.toLocaleString()}` : '$0'}
            </div>
            <span className="text-[11px] text-black font-medium block">
              {hasRefund
                ? `Fed: $${(item.fedRefund || 0).toLocaleString()} | State: $${(item.stateRefund || 0).toLocaleString()}`
                : 'Intake calculation in progress'}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Due Amount',
      render: (item) => {
        const hasDue = (item.totalBalanceDue || 0) > 0;
        return (
          <div>
            <div className={`font-bold text-sm ${hasDue ? 'text-amber-700' : 'text-slate-700'}`}>
              {hasDue ? `$${item.totalBalanceDue.toLocaleString()}` : '$0'}
            </div>
            <span className="text-[11px] text-black font-medium block">
              {hasDue
                ? `Fed: $${(item.fedDue || 0).toLocaleString()} | State: $${(item.stateDue || 0).toLocaleString()}`
                : 'No balance due'}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Documents',
      render: (item) => (
        <button
          type="button" 
          onClick={() => {
            if (onSelectTaxYear) onSelectTaxYear(item.taxYear.toString());
            navigate(`/customer/organizer?year=${item.taxYear}&tab=m_vault`);
          }}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-300 text-xs font-bold text-black hover:bg-slate-100 hover:border-slate-400 cursor-pointer transition-colors"
        >
          <FolderArchive className="w-3.5 h-3.5 text-black" />
          <span>{item.documentsCount} Files</span>
        </button>
      ),
    },
    {
      header: 'Action',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
      render: (item) => {
        const handleView = () => {
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

        return (
          <Button
            size="sm"
            onClick={handleView}
            className="rounded-md bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs cursor-pointer border border-emerald-700 px-3.5 py-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View</span>
          </Button>
        );
      },
    },
  ];

  return (
    <div className="bg-white rounded-md border border-slate-300 shadow-2xs overflow-hidden">
      {/* Table Header Controls */}
      <div className="px-4 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-black leading-tight">
            My Tax Filings & Status
          </h3>
          <p className="text-xs text-black/80 mt-0.5 font-medium">
            Track active IRS tax returns, review computed refunds, and upload supporting documents.
          </p>
        </div>
      </div>

      {/* Integrated Tabs Filter */}
      <div className="px-4 pt-1.5 border-b border-slate-200 bg-slate-50/60">
        <AppTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as 'ACTIVE' | 'COMPLETED')}
          size="sm"
          className="border-b-0"
        />
      </div>

      {/* Flush AppTable Render (No Nested Inner Box or Double Border) */}
      <AppTable<CustomerFilingItem>
        columns={columns}
        data={filteredData}
        isLoading={loading}
        density="comfortable"
        emptyText="No tax return filings found in this section."
        className="border-0 shadow-none rounded-none"
      />
    </div>
  );
};
