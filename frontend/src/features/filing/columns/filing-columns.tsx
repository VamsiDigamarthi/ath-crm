import type { ColumnDef } from '@/shared/components/AppTable';
import { AppCopyButton } from '@/shared/components/AppCopyButton';
import { Button } from '@/shared/components/Button';
import { Send, CheckCircle2, Clock, UserCheck, ArrowRight } from 'lucide-react';
import type { FilingLeadItem } from '../types/filing.types';

export interface FilingColumnsOptions {
  onOpenWorkspace: (lead: FilingLeadItem) => void;
  onOpenAssignModal?: (lead: FilingLeadItem) => void;
  isSpecialist?: boolean;
}

export function getFilingColumns({
  onOpenWorkspace,
  onOpenAssignModal,
  isSpecialist = false,
}: FilingColumnsOptions): ColumnDef<FilingLeadItem>[] {
  const columns: ColumnDef<FilingLeadItem>[] = [
    {
      header: 'Taxpayer & Contact Details',
      accessorKey: 'taxpayerName',
      sortable: true,
      render: (item) => {
        return (
          <div className="space-y-1 py-0.5">
            {/* Line 1: Name, Visa Badge, Tax Year */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                {item.taxpayerName}
              </span>
              {item.visaType && item.visaType !== '-' && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {item.visaType}
                </span>
              )}
              <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                TY {item.taxYear || 2025} Form 1040
              </span>
            </div>

            {/* Line 2: Email and Phone stacked cleanly with tight space */}
            <div className="space-y-0.5 pt-0.5">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-700 font-medium">
                <span>{item.taxpayerEmail}</span>
                {item.taxpayerEmail && item.taxpayerEmail !== '-' && (
                  <AppCopyButton text={item.taxpayerEmail} size="sm" />
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                <span>{item.taxpayerPhone}</span>
                {item.taxpayerPhone && item.taxpayerPhone !== '-' && (
                  <AppCopyButton text={item.taxpayerPhone} size="sm" />
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Location & SSN',
      accessorKey: 'stateOfResidence',
      render: (item) => (
        <div className="space-y-0.5 whitespace-nowrap">
          <div className="text-xs font-bold text-slate-800">
            {item.stateOfResidence || 'United States'}
          </div>
          <div className="text-[10px] text-slate-400 font-mono font-medium">
            {item.ssnMasked || '***-**-****'}
          </div>
        </div>
      ),
    },
    {
      header: 'Certified 1040 Refund',
      accessorKey: 'federalRefund',
      render: (item) => {
        const hasRefund = item.federalRefund > 0;
        const balanceDueVal = item.balanceDue || item.federalBalanceDue || 0;
        const hasDue = balanceDueVal > 0;

        return (
          <div className="space-y-0.5 whitespace-nowrap">
            {hasRefund ? (
              <span className="font-bold text-[#16A34A] text-xs bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-block">
                +${item.federalRefund.toLocaleString()} Fed Refund
              </span>
            ) : hasDue ? (
              <span className="font-bold text-rose-600 text-xs bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 inline-block">
                -${balanceDueVal.toLocaleString()} Tax Due
              </span>
            ) : (
              <span className="font-semibold text-slate-500 text-xs bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200 inline-block">
                $0 Liability
              </span>
            )}
            <div className="text-[10px] text-slate-500">
              +${item.stateRefund.toLocaleString()} {item.stateOfResidence} State
            </div>
          </div>
        );
      },
    },
    {
      header: 'Compliance Gate',
      accessorKey: 'paymentStatus',
      render: (item) => (
        <div className="flex flex-col items-start gap-1 whitespace-nowrap">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
            ${item.serviceFeePaid} PAID
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-mono">
            PIN {item.taxpayerPin || '84920'}
          </span>
        </div>
      ),
    },
  ];

  if (!isSpecialist) {
    columns.push({
      header: 'Assigned Staff',
      accessorKey: 'assignedFilingAgent',
      render: (item) => {
        if (item.assignedFilingAgent) {
          return (
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#16A34A] font-bold text-[9px] flex items-center justify-center shrink-0">
                {(item.assignedFilingAgent.name?.[0] || 'F').toUpperCase()}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-xs text-slate-800">{item.assignedFilingAgent.name}</span>
                {onOpenAssignModal && (
                  <button
                    type="button"
                    onClick={() => onOpenAssignModal(item)}
                    className="text-[10px] text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
                  >
                    Change
                  </button>
                )}
              </div>
            </div>
          );
        }

        return (
          <button
            type="button"
            onClick={() => onOpenAssignModal && onOpenAssignModal(item)}
            className="text-amber-700 font-bold text-[11px] bg-amber-50 px-2 py-1 rounded-md border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer whitespace-nowrap"
          >
            Unassigned (Click)
          </button>
        );
      },
    });
  }

  columns.push(
    {
      header: 'Transmission Status',
      accessorKey: 'currentStage',
      render: (item) => {
        if (item.currentStage === 'FILING_SUCCESS') {
          return (
            <span className="whitespace-nowrap px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200 inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
              <span>IRS Accepted (0000)</span>
            </span>
          );
        }
        if (item.currentStage === 'FILING_IN_PROGRESS') {
          return (
            <span className="whitespace-nowrap px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-600" />
              <span>Transmitting MeF</span>
            </span>
          );
        }
        return (
          <span className="whitespace-nowrap px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1">
            <Send className="w-3 h-3 text-blue-600" />
            <span>Ready for Transmission</span>
          </span>
        );
      },
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
      render: (item) => (
        <div className="flex items-center gap-1.5 justify-end whitespace-nowrap">
          {!isSpecialist && onOpenAssignModal && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenAssignModal(item)}
              className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold h-7 px-2.5 cursor-pointer flex items-center gap-1"
            >
              <UserCheck className="w-3 h-3 text-slate-500" />
              <span>Assign</span>
            </Button>
          )}

          <Button
            size="sm"
            onClick={() => onOpenWorkspace(item)}
            className={`text-xs font-bold h-7 px-3 flex items-center gap-1 cursor-pointer shadow-2xs whitespace-nowrap ${
              item.currentStage === 'FILING_SUCCESS'
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                : 'bg-[#16A34A] hover:bg-[#15803D] text-white'
            }`}
          >
            <span>{item.currentStage === 'FILING_SUCCESS' ? 'Certificate' : 'Transmit E-File'}</span>
            <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      ),
    }
  );

  return columns;
}
