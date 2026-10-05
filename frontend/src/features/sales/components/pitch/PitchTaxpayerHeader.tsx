import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Mail, Phone, MapPin, ChevronDown, ChevronUp, RotateCcw, UserCheck, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { Button } from '@/shared/components/Button';
import { SalesStageBadge } from '../common/SalesStageBadge';
import { ReturnComplexityBadge } from '../common/ReturnComplexityBadge';
import { ClientPaymentStatusChip } from '@/shared/components/ClientPaymentStatusChip';
import { PriorityBadge } from '@/shared/components/PriorityBadge';
import type { SalesLeadItem } from '../../types/sales.types';

interface PitchTaxpayerHeaderProps {
  lead: SalesLeadItem;
  onOpenSendBack?: () => void;
  onOpenReturnToAdmin?: () => void;
  extraActions?: React.ReactNode;
}

export const PitchTaxpayerHeader: React.FC<PitchTaxpayerHeaderProps> = ({ lead, onOpenSendBack, onOpenReturnToAdmin, extraActions }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isManager = user?.role === 'SALES_MANAGER' || user?.role === 'ADMIN';

  // Navigate back to client filings screen if taxpayerId is present, else back to queue
  const backPath = lead.taxpayerId
    ? isManager
      ? `/sales/manager/client/${lead.taxpayerId}`
      : `/sales/agent/client/${lead.taxpayerId}`
    : isManager
    ? '/sales/manager/queue'
    : '/sales/agent/queue';

  const [isExpandedRemarks, setIsExpandedRemarks] = useState(false);

  const rawRemarks = lead.qaAuditorRemarks || 'Form 1040 certified and approved for Sales pitch.';
  const isLongRemarks = rawRemarks.length > 160;
  const displayedRemarks = isLongRemarks && !isExpandedRemarks 
    ? `${rawRemarks.slice(0, 160)}...` 
    : rawRemarks;

  const isBusiness = lead.filingType === 'BUSINESS';
  const formLabel = isBusiness ? 'Form 1120' : 'Form 1040';

  return (
    <div className="space-y-4">
      {/* 1. Navigation & Taxpayer Profile Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => navigate(backPath)}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{lead.taxpayerId ? 'Back to Taxpayer Filings' : isManager ? 'Back to Caseload Queue' : 'Back to Closer Queue'}</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight break-words min-w-0">
              {lead.taxpayerName}
            </h2>
            <ClientPaymentStatusChip lead={lead} scope="return" size="sm" />
            <PriorityBadge priority={lead.priority || 'NO_PRIORITY'} size="sm" />
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              TY {lead.taxYear} {formLabel}
            </span>
            <SalesStageBadge stage={lead.currentStage} />
            <ReturnComplexityBadge lead={lead} size="md" />

            {(() => {
              const lastRevert =
                (lead.taxDraftSummary as any)?.revertsByTarget?.SALES ||
                (lead.taxDraftSummary as any)?.revertsByTarget?.['FILING_TO_SALES'] ||
                ((lead.taxDraftSummary as any)?.lastRevert?.targetDepartment === 'SALES' ? (lead.taxDraftSummary as any)?.lastRevert : null);
              const isDispatched = ['FILING_QUEUE', 'FILING_IN_PROGRESS', 'FILING_SUCCESS'].includes(lead.currentStage as string);
              if (lastRevert && !lastRevert.resolved && !isDispatched) {
                return (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                    <RotateCcw className="w-3 h-3 text-amber-600" />
                    <span>Reverted from {lastRevert.sourceDepartment === 'FILING' ? 'IRS Filing Ops' : lastRevert.sourceDepartment}</span>
                  </span>
                );
              }
              return null;
            })()}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium mt-1.5">
            <span className="flex items-center gap-1 min-w-0 break-all">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {lead.taxpayerEmail}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              {lead.taxpayerPhone}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {lead.stateOfResidence}{lead.visaType && lead.visaType !== '-' ? ` • ${lead.visaType}` : ''}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap 2xl:justify-end 2xl:shrink-0 pt-3 border-t border-slate-100 2xl:pt-0 2xl:border-t-0">
          {extraActions}

          {/* Return to Admin Pool Button */}
          {onOpenReturnToAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenReturnToAdmin}
              className="text-xs font-semibold flex items-center gap-1.5 shadow-2xs h-8 px-3 border-rose-200 bg-white hover:bg-rose-50 text-rose-700 cursor-pointer transition-colors"
              title="Release this lead back to Super Admin Pool if client does not convert"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
              <span>Return to Admin</span>
            </Button>
          )}

          {/* Send Back Lead Button */}
          {onOpenSendBack && (() => {
            const isDispatchedToFiling =
              lead.currentStage === 'FILING_QUEUE' ||
              lead.currentStage === 'FILING_IN_PROGRESS' ||
              lead.currentStage === 'FILING_SUCCESS';

            const currentStageStr = (lead.currentStage as string);
            const isRevertedToPrecedingDept =
              ['CORRECTION_NEEDED', 'DOC_OUTREACH', 'DOC_PREP', 'QA_REVISION_REQUESTED'].includes(currentStageStr) ||
              (lead.taxDraftSummary as any)?.status === 'REVISION_REQUESTED' ||
              (lead.taxDraftSummary as any)?.status === 'REVERTED_TO_DOCUMENTER';

            const isDisabled = isDispatchedToFiling || isRevertedToPrecedingDept;

            const buttonLabel = isDispatchedToFiling
              ? 'In IRS Filing'
              : lead.currentStage === 'DOC_OUTREACH' || (lead.taxDraftSummary as any)?.status === 'REVERTED_TO_DOCUMENTER'
              ? 'Sent to Documenter'
              : isRevertedToPrecedingDept
              ? 'Sent to Preparer'
              : 'Send Back Lead';

            return (
              <Button
                variant="outline"
                size="sm"
                onClick={() => !isDisabled && onOpenSendBack()}
                disabled={isDisabled}
                className={`text-xs font-semibold flex items-center gap-1.5 shadow-2xs h-8 px-3 transition-colors ${
                  isDisabled
                    ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-75 shadow-none'
                    : 'border-amber-200 bg-white hover:bg-amber-50 text-amber-800 cursor-pointer'
                }`}
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isDisabled ? 'text-slate-400' : 'text-amber-600'}`} />
                <span>{buttonLabel}</span>
              </Button>
            );
          })()}

          {/* Assigned Closer Badge */}
          <div className="h-8 flex items-center gap-2 bg-slate-50 px-3 rounded-lg border border-slate-200">
            <UserCheck className="w-3.5 h-3.5 text-slate-500" />
            <div className="text-xs">
              <span className="text-slate-400 mr-1">Closer:</span>
              <span className="font-semibold text-slate-800">
                {lead.assignedSalesAgent?.name || 'Unassigned'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sleek QA Certified Calculation Summary Card (Clean, modern, uncluttered) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>4-Eyes QA Certified Calculation Result</span>
            </div>
            <div className="flex items-baseline gap-2.5">
              <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${lead.federalRefund > 0 ? 'text-emerald-600' : lead.balanceDue > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                {lead.federalRefund > 0
                  ? `+$${lead.federalRefund.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
                  : lead.balanceDue > 0
                  ? `-$${lead.balanceDue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
                  : '$0'}
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${lead.federalRefund > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : lead.balanceDue > 0 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-600'}`}>
                {lead.federalRefund > 0 ? 'Federal Refund' : lead.balanceDue > 0 ? 'Balance Due' : 'Zero Balance'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-100 min-w-[120px]">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">State Refund</div>
              <div className="text-sm font-bold text-slate-800">
                {lead.stateRefund > 0 ? `+$${lead.stateRefund.toLocaleString()}` : '$0'}
              </div>
            </div>
            <div className="bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-100 min-w-[140px]">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gross Income (Line 9)</div>
              <div className="text-sm font-bold text-slate-800">
                ${lead.grossIncome.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Auditor Remarks Strip */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs text-slate-600">
          <div className="flex-1 min-w-0 flex items-start gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800 mr-1.5">Audited by {lead.qaAuditorName}:</span>
              <span className="italic text-slate-600">
                &ldquo;{displayedRemarks}&rdquo;
              </span>
              {isLongRemarks && (
                <button
                  type="button"
                  onClick={() => setIsExpandedRemarks(!isExpandedRemarks)}
                  className="ml-2 inline-flex items-center gap-0.5 text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  <span>{isExpandedRemarks ? 'Read Less' : 'Read More'}</span>
                  {isExpandedRemarks ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              )}
            </div>
          </div>
          <span className="text-[11px] text-slate-400 shrink-0">
            Sign-Off: {new Date(lead.qaApprovedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};
