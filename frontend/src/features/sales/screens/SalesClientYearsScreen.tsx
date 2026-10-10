import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import toast from 'react-hot-toast';
import { ArrowLeft, PhoneCall, RotateCcw } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppCopyButton } from '@/shared/components/AppCopyButton';
import { UnifiedTable } from '@/shared/components/table/UnifiedTable';
import { SalesStageBadge } from '../components/common/SalesStageBadge';
import { ClientTypeBadge } from '../components/common/ClientTypeBadge';
import { SYSTEM_PAYMENT_STATUSES } from '@/shared/constants/system-enums';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { salesService } from '../services/sales-service';
import type { SalesLeadItem } from '../types/sales.types';

const useSalesClientYears = (taxpayerId?: string) => {
  const [years, setYears] = useState<SalesLeadItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!taxpayerId) return;
    try {
      const res = await salesService.getPipelineLeads({ limit: 100 });
      const leads = res.leads || [];
      const baseLead = leads.find(
        (l: SalesLeadItem) =>
          l.taxpayerId === taxpayerId || l.id === taxpayerId || l.applicationId === taxpayerId
      );

      if (baseLead?.allApplications && baseLead.allApplications.length > 0) {
        const fullList: SalesLeadItem[] = baseLead.allApplications.map((appItem: any) => {
          const existing = leads.find((l: SalesLeadItem) => l.id === appItem.id || l.applicationId === appItem.id);
          return (
            existing || {
              ...baseLead,
              id: appItem.id,
              applicationId: appItem.id,
              taxYear: appItem.taxYear,
              filingType: appItem.filingType || 'INDIVIDUAL',
              currentStage: appItem.currentStage || baseLead.currentStage,
              clientType: appItem.clientType,
              assignedSalesAgent: appItem.assignedSalesAgent || baseLead.assignedSalesAgent,
            }
          );
        });
        setYears(fullList.sort((a, b) => (b.taxYear || 0) - (a.taxYear || 0)));
      } else {
        const matched = leads.filter(
          (l: SalesLeadItem) =>
            l.taxpayerId === taxpayerId || l.id === taxpayerId || l.applicationId === taxpayerId
        );
        setYears(matched.sort((a, b) => (b.taxYear || 0) - (a.taxYear || 0)));
      }
    } catch (err) {
      toast.error((err as Error).message || 'Failed to load tax years');
    } finally {
      setIsLoading(false);
    }
  }, [taxpayerId]);

  useEffect(() => {
    load();
  }, [load]);

  return { years, client: years[0] || null, isLoading };
};

export const SalesClientYearsScreen: React.FC = () => {
  const { taxpayerId } = useParams<{ taxpayerId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const isManager = user?.role === 'SALES_MANAGER' || user?.role === 'ADMIN' || location.pathname.includes('/manager');
  const { years, client, isLoading } = useSalesClientYears(taxpayerId);

  const parentQueuePath = isManager ? '/sales/manager/queue' : '/sales/agent/queue';

  const openYear = useCallback(
    (lead: SalesLeadItem) => {
      const targetId = lead.id || lead.applicationId;
      const pitchPath = isManager ? `/sales/manager/pitch/${targetId}` : `/sales/agent/pitch/${targetId}`;
      // Keep ?from= so the sidebar stays on the page this client came from
      navigate(`${pitchPath}${location.search}`);
    },
    [navigate, isManager, location.search]
  );

  const columns = useMemo<ColumnDef<SalesLeadItem, unknown>[]>(
    () => [
      {
        id: 'taxYear',
        header: 'Tax Year',
        accessorKey: 'taxYear',
        cell: ({ row }) => (
          <span className="text-sm font-bold text-slate-900">
            TY {row.original.taxYear || 2025}
          </span>
        ),
      },
      {
        id: 'filingType',
        header: 'Filing Type',
        accessorKey: 'filingType',
        cell: ({ row }) => (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
            {row.original.filingType === 'BUSINESS' ? 'Business' : 'Individual'}
          </span>
        ),
      },
      {
        id: 'stage',
        header: 'Sales Stage',
        accessorKey: 'currentStage',
        cell: ({ row }) => <SalesStageBadge stage={row.original.currentStage} />,
      },
      {
        id: 'refundLiability',
        header: '1040 Refund / Balance',
        accessorFn: (row) => row.federalRefund || row.balanceDue || 0,
        cell: ({ row }) => {
          const fed = Number(row.original.federalRefund) || 0;
          const due = Number(row.original.balanceDue) || 0;
          if (fed > 0) {
            return (
              <span className="text-xs font-semibold text-emerald-600">
                +${fed.toLocaleString()}
              </span>
            );
          }
          if (due > 0) {
            return (
              <span className="text-xs font-semibold text-rose-600">
                -${due.toLocaleString()}
              </span>
            );
          }
          return <span className="text-xs text-slate-400 font-medium">$0</span>;
        },
      },
      {
        id: 'quotedFee',
        header: 'Quoted Fee',
        accessorFn: (row) => row.feeBreakdown?.totalServiceFee || 0,
        cell: ({ row }) => {
          const fee = Number(row.original.feeBreakdown?.totalServiceFee) || 0;
          return (
            <span className={`text-xs ${fee > 0 ? 'font-bold text-slate-900' : 'text-slate-400 font-medium'}`}>
              {fee > 0 ? `$${fee}` : 'Unquoted'}
            </span>
          );
        },
      },
      {
        id: 'clientType',
        header: 'Client Type',
        accessorKey: 'clientType',
        cell: ({ row }) => <ClientTypeBadge type={row.original.clientType} />,
      },
      {
        id: 'payment',
        header: 'Payment Status',
        accessorKey: 'paymentStatus',
        meta: {
          filterType: 'enum',
          filterOptions: SYSTEM_PAYMENT_STATUSES,
        },
        cell: ({ row }) => {
          const status = row.original.paymentStatus || 'UNPAID';
          const isPaid = status === 'PAID';
          return (
            <span
              className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                isPaid
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : status === 'PAYMENT_LINK_SENT'
                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {status.replace(/_/g, ' ')}
            </span>
          );
        },
      },
      {
        id: 'esign',
        header: 'Form 8879 E-Sign',
        accessorKey: 'esignStatus',
        cell: ({ row }) => {
          const status = row.original.esignStatus || 'NOT_SENT';
          const isSigned = status === 'SIGNED';
          return (
            <span
              className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                isSigned
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : status === 'SENT'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {status.replace(/_/g, ' ')}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        enableHiding: false,
        meta: { disableMenu: true, disableFilter: true },
        cell: ({ row }) => {
          const isReverted =
            row.original.currentStage === 'CORRECTION_NEEDED' ||
            (row.original.taxDraftSummary as any)?.status === 'REVISION_REQUESTED';
          return (
            <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
              <Button
                size="sm"
                onClick={() => openYear(row.original)}
                className={`text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                  isReverted
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-[#16A34A] hover:bg-[#15803D] text-white'
                }`}
              >
                {isReverted ? <RotateCcw className="w-3.5 h-3.5" /> : <PhoneCall className="w-3.5 h-3.5" />}
                <span>{isReverted ? 'View Filing' : 'Open Pitch'}</span>
              </Button>
            </div>
          );
        },
      },
    ],
    [openYear]
  );

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      {/* 1. Header Toolbar */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(parentQueuePath)}
          className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
          title="Back to Sales Queue"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-1.5 text-sm text-slate-500">
          <span>{isManager ? 'Sales Caseload' : 'Closer Queue'}</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-medium">Tax Filings</span>
        </div>
      </div>

      {/* 2. Taxpayer Client Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {isLoading ? 'Loading taxpayer...' : client?.taxpayerName || 'Taxpayer Client'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {years.length} tax {years.length === 1 ? 'filing' : 'filings'} available · choose a return to open
          </p>
        </div>
        {client && (
          <div className="grid grid-cols-1 sm:grid-cols-3 border-t border-slate-100 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 bg-slate-50/50">
            {[
              { label: 'Phone', value: client.taxpayerPhone || '—', copy: client.taxpayerPhone },
              { label: 'Email', value: client.taxpayerEmail || '—', copy: client.taxpayerEmail },
              { label: 'Location & Visa', value: `${client.stateOfResidence || '—'}${client.visaType && client.visaType !== '-' ? ` • ${client.visaType}` : ''}`, copy: null },
            ].map((item) => (
              <div key={item.label} className="px-5 py-3 flex items-center justify-between gap-2 min-w-0">
                <div className="min-w-0">
                  <div className="text-xs text-slate-500">{item.label}</div>
                  <div className="text-sm font-medium text-slate-900 truncate">{item.value}</div>
                </div>
                {item.copy && item.copy !== '—' && <AppCopyButton text={item.copy} size="sm" />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Filings Table */}
      <UnifiedTable<SalesLeadItem>
        columns={columns}
        data={years}
        isLoading={isLoading}
        searchPlaceholder="Search tax filings..."
        onRowClick={(item) => openYear(item)}
        emptyText="No tax returns available for this taxpayer."
      />
    </div>
  );
};
