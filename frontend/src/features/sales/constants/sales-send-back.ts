import type { TargetDepartmentOption } from '@/shared/components/workflow/SendBackLeadModal';
import type { SalesLeadItem } from '../types/sales.types';

/** Where a sales closer can send a return back for revision */
export const SALES_SEND_BACK_TARGETS: TargetDepartmentOption[] = [
  {
    key: 'PREPARATION',
    label: 'Tax Preparation Department (CPA / Preparer)',
    badge: 'CORRECTION_NEEDED',
    description: 'Send back to assigned Tax Preparer to recalculate Form 1040 deductions, tax credits, or filing status as requested by client.',
  },
  {
    key: 'DOCUMENTER',
    label: 'Documenter Department (Intake & Verification)',
    badge: 'DOC_OUTREACH',
    description: 'Send back to Documenter agent to collect missing paperwork, additional W-2/1099s, or clarify client intake.',
  },
];

/** Why "Need revision" can't be used right now (null = allowed). Same rule as the workspace button. */
export const getSendBackBlockedReason = (lead: SalesLeadItem): string | null => {
  const stage = lead.currentStage as string;
  const status = (lead.taxDraftSummary as any)?.status;
  if (['FILING_QUEUE', 'FILING_IN_PROGRESS', 'FILING_SUCCESS'].includes(stage)) return 'In IRS Filing';
  if (stage === 'DOC_OUTREACH' || status === 'REVERTED_TO_DOCUMENTER') return 'Sent to Documenter';
  if (['CORRECTION_NEEDED', 'DOC_PREP', 'QA_REVISION_REQUESTED'].includes(stage) || status === 'REVISION_REQUESTED') {
    return 'Sent to Preparer';
  }
  return null;
};
