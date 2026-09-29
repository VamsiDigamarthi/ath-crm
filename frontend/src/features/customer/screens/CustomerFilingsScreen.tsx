import React, { useState, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useCustomerDashboard } from '../hooks/useCustomerDashboard';
import { AppTable, type ColumnDef } from '@/shared/components/AppTable';
import { Button } from '@/shared/components/Button';
import { CreateNewFilingModal } from '../components/CreateNewFilingModal';
import { type CustomerFilingItem } from '../services/customer-api';
import {
  FileText,
  Building2,
  Plus,
  CheckCircle2,
  Clock,
  SendHorizontal,
  CreditCard,
  Calendar,
  Eye,
} from 'lucide-react';

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

  const getStageBadge = (stage: string, isCompleted: boolean) => {
    if (isCompleted || stage === 'FILING_SUCCESS') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
          IRS Accepted & Filed
        </span>
      );
    }
    if (stage === 'FILING_QUEUE' || stage === 'FILING_IN_PROGRESS') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-300">
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
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-300">
          <CreditCard className="w-3.5 h-3.5 text-purple-700" />
          Quotation & Fee Approval
        </span>
      );
    }
    if (stage === 'QA_IN_REVIEW' || stage === 'QA_REVISION') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-300">
          <Clock className="w-3.5 h-3.5 text-indigo-700 animate-pulse" />
          QA Compliance Audit
        </span>
      );
    }
    if (stage === 'DOC_PREP') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300">
          <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
          Tax Preparation
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-900 border border-blue-300">
        <Clock className="w-3.5 h-3.5 text-blue-700" />
        Document Intake
      </span>
    );
  };

  const columns: ColumnDef<CustomerFilingItem>[] = [
    {
      header: 'Tax Year & Filing',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-slate-100 border border-slate-300 text-black flex items-center justify-center font-bold text-xs shrink-0">
            {item.filingType === 'BUSINESS' ? (
              <Building2 className="w-4 h-4 text-black" />
            ) : (
              <FileText className="w-4 h-4 text-black" />
            )}
          </div>
          <div>
            <div className="font-bold text-black text-sm flex items-center gap-2">
              <span>TY {item.taxYear}</span>
              {item.isActive && (
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" title="Active Filing" />
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
      header: 'Status',
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
      header: 'Date',
      render: (item) => {
        const rawDate = item.createdAt || item.updatedAt;
        const formatted = rawDate
          ? new Date(rawDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : 'Recent';
        return (
          <div className="flex items-center gap-1.5 text-xs text-black font-semibold">
            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>{formatted}</span>
          </div>
        );
      },
    },
    {
      header: 'Action',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
      render: (item) => (
        <Button
          size="sm"
          onClick={() => navigate(`/customer/organizer?year=${item.taxYear}&type=${item.filingType || 'INDIVIDUAL'}`)}
          className="rounded-md bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs cursor-pointer border border-emerald-700 px-3.5 py-1.5"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View</span>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-8 font-sans animate-in fade-in duration-150">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight">
            My Filings
          </h2>
          <p className="text-xs sm:text-sm text-black/80 mt-1 font-medium">
            Manage your personal and business tax returns, track status, and complete your tax organizers.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs cursor-pointer border border-emerald-700 px-3.5 py-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Filing</span>
        </Button>
      </div>

      {/* 2. Minimal Clean Table Card */}
      <div className="bg-white rounded-md border border-slate-300 shadow-2xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-black">
              All Active & Historical Returns ({filings.length})
            </h3>
          </div>
        </div>

        <AppTable<CustomerFilingItem>
          columns={columns}
          data={filings}
          isLoading={loading}
          density="comfortable"
          emptyText="No filings found. Click '+ New Filing' to start your first return."
          className="border-0 shadow-none rounded-none"
        />
      </div>

      {/* 3. New Filing Modal */}
      <CreateNewFilingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        existingApplications={applications.length > 0 ? applications : dashboardData?.filings || []}
      />
    </div>
  );
};
