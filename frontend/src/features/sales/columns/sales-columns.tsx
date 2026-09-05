import type { ColumnDef } from '@/shared/components/AppTable';
import { AppCopyButton } from '@/shared/components/AppCopyButton';
import { Button } from '@/shared/components/Button';
import { SalesStageBadge } from '../components/common/SalesStageBadge';
import { PhoneCall, UserCheck } from 'lucide-react';
import type { SalesLeadItem } from '../types/sales.types';

export interface SalesColumnsOptions {
  onOpenPitch: (lead: SalesLeadItem) => void;
  onOpenAssignModal: (lead: SalesLeadItem) => void;
  isAdmin?: boolean;
}

export function getSalesColumns({
  onOpenPitch,
  onOpenAssignModal,
  isAdmin = false,
}: SalesColumnsOptions): ColumnDef<SalesLeadItem>[] {
  const columns: ColumnDef<SalesLeadItem>[] = [
    {
      header: 'Taxpayer Client',
      accessorKey: 'taxpayerName',
      sortable: true,
      render: (item) => {
        const initial = (item.taxpayerName?.[0] || 'T').toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs bg-gradient-to-br from-purple-100 to-purple-200 border border-purple-300 text-purple-800">
              {initial}
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                <span>{item.taxpayerName}</span>
                {item.visaType && item.visaType !== '-' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {item.visaType}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                <span className="text-[11px] text-slate-500 font-medium">
                  TY {item.taxYear || 2025} • INDIVIDUAL
                </span>
                {(() => {
                  const lastRevert =
                    (item.taxDraftSummary as any)?.revertsByTarget?.SALES ||
                    (item.taxDraftSummary as any)?.revertsByTarget?.['FILING_TO_SALES'] ||
                    ((item.taxDraftSummary as any)?.lastRevert?.targetDepartment === 'SALES' ? (item.taxDraftSummary as any)?.lastRevert : null);
                  if (lastRevert && !lastRevert.resolved) {
                    return (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-950 border border-amber-300">
                        Reverted from {lastRevert.sourceDepartment === 'FILING' ? 'Filing' : lastRevert.sourceDepartment}
                      </span>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Contact Information',
      accessorKey: 'taxpayerEmail',
      render: (item) => (
        <div className="space-y-0.5">
          <div className="text-[11px] text-slate-700 font-medium flex items-center gap-1.5">
            <span>{item.taxpayerEmail}</span>
            {item.taxpayerEmail && item.taxpayerEmail !== '-' && (
              <AppCopyButton text={item.taxpayerEmail} size="sm" />
            )}
          </div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
            <span>{item.taxpayerPhone}</span>
            {item.taxpayerPhone && item.taxpayerPhone !== '-' && (
              <AppCopyButton text={item.taxpayerPhone} size="sm" />
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Location & Year',
      accessorKey: 'stateOfResidence',
      render: (item) => (
        <div className="space-y-0.5">
          <div className="text-xs font-semibold text-slate-800">
            {item.stateOfResidence || 'United States'}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            TY {item.taxYear || 2025}
          </div>
        </div>
      ),
    },
    {
      header: 'Certified 1040 Refund',
      accessorKey: 'federalRefund',
      render: (item) => {
        const hasRefund = item.federalRefund > 0;
        const hasDue = item.balanceDue > 0;

        return (
          <div className="space-y-0.5">
            {hasRefund ? (
              <span className="font-bold text-[#16A34A] text-xs bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-block">
                +${item.federalRefund.toLocaleString()} Fed Refund
              </span>
            ) : hasDue ? (
              <span className="font-bold text-rose-600 text-xs bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 inline-block">
                -${item.balanceDue.toLocaleString()} Tax Due
              </span>
            ) : (
              <span className="font-semibold text-slate-500 text-xs bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200 inline-block">
                $0 Liability
              </span>
            )}
            <div className="text-[10px] text-slate-400">
              QA by {item.qaAuditorName || 'Auditor'}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Quoted Fee',
      accessorKey: 'paymentStatus',
      render: (item) => {
        const isQuoted = item.feeBreakdown?.totalServiceFee > 0;

        return (
          <div className="space-y-0.5">
            {isQuoted ? (
              <>
                <div className="font-bold text-slate-900 text-xs">
                  ${item.feeBreakdown.totalServiceFee}
                </div>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded inline-block ${
                    item.paymentStatus === 'PAID'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {item.paymentStatus}
                </span>
              </>
            ) : (
              <>
                <div className="font-semibold text-slate-400 text-xs">
                  Pending Pitch
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 inline-block">
                  UNPAID
                </span>
              </>
            )}
          </div>
        );
      },
    },
    {
      header: 'Assigned Staff',
      accessorKey: 'assignedSalesAgent',
      render: (item) => {
        const isCompletedOrLocked =
          (item.paymentStatus === 'PAID' && item.esignStatus === 'SIGNED') ||
          item.currentStage === 'PAID_AND_AUTHORIZED' ||
          item.currentStage === 'FILING_QUEUE' ||
          item.currentStage === 'FILING_IN_PROGRESS' ||
          item.currentStage === 'FILING_SUCCESS';

        if (!item.assignedSalesAgent) {
          if (isCompletedOrLocked || isAdmin) {
            return (
              <span className="text-slate-400 font-medium text-[11px] bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                {isCompletedOrLocked ? 'Completed' : 'Unassigned'}
              </span>
            );
          }

          return (
            <button
              type="button"
              onClick={() => onOpenAssignModal(item)}
              className="text-amber-700 font-bold text-[11px] bg-amber-50 px-2 py-1 rounded-md border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
            >
              Unassigned (Click)
            </button>
          );
        }

        const initial = (item.assignedSalesAgent.name?.[0] || item.assignedSalesAgent.email?.[0] || 'C').toUpperCase();

        return (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
              {initial}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">
                {item.assignedSalesAgent.name}
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                CLOSER
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Sales Stage',
      accessorKey: 'currentStage',
      render: (item) => <SalesStageBadge stage={item.currentStage} />,
    },
  ];

  if (!isAdmin) {
    columns.push({
      header: 'Actions',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
      render: (item) => {
        const isCompletedOrLocked =
          (item.paymentStatus === 'PAID' && item.esignStatus === 'SIGNED') ||
          item.currentStage === 'PAID_AND_AUTHORIZED' ||
          item.currentStage === 'FILING_QUEUE' ||
          item.currentStage === 'FILING_IN_PROGRESS' ||
          item.currentStage === 'FILING_SUCCESS';

        return (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={isCompletedOrLocked}
              title={isCompletedOrLocked ? "Lead is already Paid & E-Signed / Completed" : "Assign to closer"}
              onClick={() => !isCompletedOrLocked && onOpenAssignModal(item)}
              className={`border-slate-200 text-[11px] font-semibold flex items-center gap-1 h-7 px-2 ${
                isCompletedOrLocked
                  ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 pointer-events-none'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer'
              }`}
            >
              <UserCheck className="w-3 h-3" />
              <span>Assign</span>
            </Button>

            <Button
              size="sm"
              onClick={() => onOpenPitch(item)}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer h-7 px-2.5 shadow-2xs"
            >
              <PhoneCall className="w-3 h-3" />
              <span>Pitch</span>
            </Button>
          </div>
        );
      },
    });
  }

  return columns;
}
