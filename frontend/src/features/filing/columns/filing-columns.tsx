import type { ColumnDef } from '@/shared/components/AppTable';
import { AppCopyButton } from '@/shared/components/AppCopyButton';
import { Button } from '@/shared/components/Button';
import { Send, CheckCircle2, Clock, UserCheck, ArrowRight, RotateCcw } from 'lucide-react';
import type { FilingLeadItem } from '../types/filing.types';

export interface FilingColumnsOptions {
  onOpenWorkspace: (lead: FilingLeadItem) => void;
  onOpenAssignModal?: (lead: FilingLeadItem) => void;
  isSpecialist?: boolean;
  isAdmin?: boolean;
}

export function getFilingColumns({
  onOpenWorkspace,
  onOpenAssignModal,
  isSpecialist = false,
  isAdmin = false,
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
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                TY {item.taxYear} Form 1040
              </span>
              {item.lastRevert?.resolved && item.currentStage === 'FILING_QUEUE' && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-teal-50 text-teal-800 border border-teal-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                  <span>Resubmitted (Corrected)</span>
                </span>
              )}
            </div>

            {/* Line 2: Email */}
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <span className="truncate max-w-[170px]">{item.taxpayerEmail}</span>
              <AppCopyButton text={item.taxpayerEmail} size="sm" />
            </div>

            {/* Line 3: Phone */}
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <span>{item.taxpayerPhone}</span>
              <AppCopyButton text={item.taxpayerPhone} size="sm" />
            </div>
          </div>
        );
      },
    },
    {
      header: 'Location & SSN',
      accessorKey: 'stateOfResidence',
      render: (item) => {
        return (
          <div className="space-y-1 text-xs">
            <div className="font-bold text-slate-800">{item.stateOfResidence}</div>
            <div className="font-mono text-[11px] text-slate-500 tracking-wider">
              {item.ssnMasked}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Certified 1040 Refund',
      accessorKey: 'totalRefundOrDue',
      sortable: true,
      render: (item) => {
        const isRefund = item.federalRefund > 0;
        const balVal = item.balanceDue || item.federalBalanceDue || 0;

        return (
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span
                className={`text-xs sm:text-sm font-bold ${
                  isRefund ? 'text-[#16A34A]' : 'text-rose-600'
                }`}
              >
                {isRefund ? `+$${item.federalRefund.toLocaleString()}` : `-$${balVal.toLocaleString()}`}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">
                {isRefund ? 'Fed Refund' : 'Tax Due'}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
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
                {!isAdmin && onOpenAssignModal && (
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

        if (isAdmin) {
          return (
            <span className="text-amber-700 font-bold text-[11px] bg-amber-50 px-2 py-1 rounded-md border border-amber-200 whitespace-nowrap">
              Unassigned
            </span>
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

  columns.push({
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
      if (item.currentStage === 'SALES_PITCH_QUEUE' || item.currentStage === 'SALES_PITCHING') {
        return (
          <span className="whitespace-nowrap px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center gap-1">
            <RotateCcw className="w-3 h-3 text-amber-600" />
            <span>Reverted to Sales</span>
          </span>
        );
      }
      if (item.currentStage === 'CORRECTION_NEEDED') {
        return (
          <span className="whitespace-nowrap px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center gap-1">
            <RotateCcw className="w-3 h-3 text-amber-600" />
            <span>Reverted to Preparer</span>
          </span>
        );
      }
      if (item.currentStage === 'DOC_OUTREACH' || item.currentStage === 'DOC_PREP') {
        return (
          <span className="whitespace-nowrap px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center gap-1">
            <RotateCcw className="w-3 h-3 text-amber-600" />
            <span>Reverted to Documenter</span>
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
  });

  if (!isAdmin) {
    columns.push({
      header: 'Actions',
      accessorKey: 'id',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
      render: (item) => {
        const isAssigned = Boolean(item.assignedFilingAgent);
        const isReverted = ['CORRECTION_NEEDED', 'DOC_OUTREACH', 'DOC_PREP', 'SALES_PITCH_QUEUE', 'SALES_PITCHING'].includes(item.currentStage);

        return (
          <div className="flex items-center gap-1.5 justify-end whitespace-nowrap">
            {!isSpecialist && onOpenAssignModal && (
              <span
                title={
                  isAssigned
                    ? `Already assigned to ${item.assignedFilingAgent?.name}. Reassignment can be done via 'Change' in Assigned Staff column.`
                    : 'Assign return to filing specialist'
                }
                className={isAssigned ? 'inline-block cursor-not-allowed' : 'inline-block'}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => !isAssigned && onOpenAssignModal(item)}
                  disabled={isAssigned}
                  className={`text-xs font-semibold h-7 px-2.5 flex items-center gap-1 transition-all ${
                    isAssigned
                      ? 'border-slate-200 bg-slate-100 text-slate-400 opacity-50 cursor-not-allowed shadow-none'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer'
                  }`}
                >
                  <UserCheck className={`w-3 h-3 ${isAssigned ? 'text-slate-400' : 'text-slate-500'}`} />
                  <span>Assign</span>
                </Button>
              </span>
            )}

            <Button
              size="sm"
              onClick={() => onOpenWorkspace(item)}
              className={`text-xs font-bold h-7 px-3 flex items-center gap-1 cursor-pointer shadow-2xs whitespace-nowrap ${
                item.currentStage === 'FILING_SUCCESS'
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  : isReverted
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-[#16A34A] hover:bg-[#15803D] text-white'
              }`}
            >
              <span>{item.currentStage === 'FILING_SUCCESS' ? 'Certificate' : isReverted ? 'View in Revision' : 'Transmit E-File'}</span>
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        );
      },
    });
  }

  return columns;
}
