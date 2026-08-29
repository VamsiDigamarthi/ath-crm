import React from 'react';
import { ShieldCheck, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppEmptyState } from '@/shared/components/AppEmptyState';
import type { PrepReviewLead } from '../../types/prep-review.types';

interface ReviewerQueueTableProps {
  returns: PrepReviewLead[];
  isLoading: boolean;
  onOpenAudit: (id: string) => void;
}

export const ReviewerQueueTable: React.FC<ReviewerQueueTableProps> = ({
  returns,
  isLoading,
  onOpenAudit,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-12 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-3 border-purple-600 border-t-transparent animate-spin" />
        <span className="text-xs font-semibold text-slate-500">Loading Senior QA Review queue...</span>
      </div>
    );
  }

  if (returns.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-12">
        <AppEmptyState
          icon={ShieldCheck}
          title="No Tax Returns in this Audit Filter"
          description="There are currently no returns awaiting your QA compliance review in this stage."
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3.5 px-4">Taxpayer Client</th>
              <th className="py-3.5 px-4">Drafted by Preparer</th>
              <th className="py-3.5 px-4">Computed 1040 Refund</th>
              <th className="py-3.5 px-4">Documents Vault</th>
              <th className="py-3.5 px-4">Target SLA Time</th>
              <th className="py-3.5 px-4 text-center">Audit Stage</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {returns.map((item) => {
              const taxpayerName = item.taxpayerName?.trim() || '-';
              const taxpayerInitial = taxpayerName !== '-' ? taxpayerName[0].toUpperCase() : 'T';
              const taxpayerEmail = item.taxpayerEmail || '-';
              const location = item.stateOfResidence || '-';
              const filingStatus = item.maritalStatus || '-';
              const preparerName = item.assignedPreparer?.name || '-';
              const preparerInitial = preparerName !== '-' ? preparerName[0].toUpperCase() : 'P';
              const verifiedDocs = item.verifiedDocumentsCount || 0;
              const totalDocs = item.documentsCount || 0;

              // Parse Financial Calculations from Draft
              const draft: any = (item as any).taxDraftSummary || {};
              const fedRefund = draft.federalRefund !== undefined ? Number(draft.federalRefund) : item.estimatedRefund || 0;
              const fedDue = draft.balanceDue !== undefined ? Number(draft.balanceDue) : item.estimatedBalanceDue || 0;
              const stateRefund = draft.stateRefund !== undefined ? Number(draft.stateRefund) : 0;
              const grossIncome = draft.totalGrossIncome !== undefined ? Number(draft.totalGrossIncome) : item.estimatedWages || 0;

              // Target SLA Time
              const slaTime = (item as any).targetDueDate 
                ? new Date((item as any).targetDueDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                : item.dueByDate || 'Standard 24h SLA';

              // Stage Badge Mapping
              let stageBadge = {
                label: 'Pending QA Audit',
                color: 'bg-purple-50 text-purple-700 border-purple-200',
                dot: 'bg-purple-600',
              };

              if (item.currentStage === 'QA_REVISION_REQUESTED') {
                stageBadge = {
                  label: 'Revision Requested',
                  color: 'bg-rose-50 text-rose-700 border-rose-200',
                  dot: 'bg-rose-600',
                };
              } else if (item.currentStage === 'QA_APPROVED' || item.currentStage === 'SALES_PITCH_QUEUE') {
                stageBadge = {
                  label: 'QA Approved',
                  color: 'bg-emerald-50 text-[#16A34A] border-emerald-200',
                  dot: 'bg-[#16A34A]',
                };
              }

              return (
                <tr key={item.id || item.applicationId} className="hover:bg-slate-50/70 transition-colors">
                  {/* 1. Taxpayer Client */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs bg-purple-100 border border-purple-200 text-purple-800">
                        {taxpayerInitial}
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                          <span>{taxpayerName}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            TY {item.taxYear || 2025}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {taxpayerEmail} {location !== '-' ? `• ${filingStatus}` : ''}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* 2. Drafted by Preparer */}
                  <td className="py-3.5 px-4">
                    {preparerName !== '-' ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-bold flex items-center justify-center border border-blue-200">
                          {preparerInitial}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900">{preparerName}</div>
                          <div className="text-[10px] text-slate-400 font-medium">Submitted for 4-Eyes Audit</div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 font-medium text-xs">-</span>
                    )}
                  </td>

                  {/* 3. Computed 1040 Refund */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-xs text-[#16A34A]">
                      {fedRefund > 0 ? `+$${fedRefund.toLocaleString()} Fed Refund` : fedDue > 0 ? `-$${fedDue.toLocaleString()} Fed Due` : '$0 Fed Balance'}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      State: {stateRefund > 0 ? `+$${stateRefund.toLocaleString()}` : '$0'} • Gross: ${grossIncome.toLocaleString()}
                    </div>
                  </td>

                  {/* 4. Documents Vault */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{verifiedDocs} Docs Verified</span>
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                      {totalDocs} total vault files
                    </div>
                  </td>

                  {/* 5. Target SLA Time */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>{slaTime}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">Standard 24h SLA</div>
                  </td>

                  {/* 6. Audit Stage */}
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${stageBadge.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${stageBadge.dot} animate-pulse`} />
                      <span>{stageBadge.label}</span>
                    </span>
                  </td>

                  {/* 7. Action */}
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      size="sm"
                      onClick={() => onOpenAudit(item.id || item.applicationId)}
                      className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold px-3.5 h-8 flex items-center gap-1.5 shadow-2xs cursor-pointer ml-auto"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Start Audit</span>
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
