import { useMemo, useState } from 'react';
import type { FilingLeadItem } from '../types/filing.types';

/**
 * Filing specialist sidebar pages (ALL keeps the old queue with its tabs):
 * - READY: in the filing queue, not on hold
 * - PENDING: transmitted, waiting for the IRS answer, not on hold
 * - ON_HOLD: paused by the specialist (flag only, stage unchanged)
 * - RETURNED: tabs "Pending returns" (sent back to another team) and "Rejected returns" (IRS rejected)
 * - FILED: accepted by the IRS
 */
export type FilingView = 'ALL' | 'READY' | 'PENDING' | 'ON_HOLD' | 'RETURNED' | 'FILED';
export type ReturnedTab = 'PENDING_RETURNS' | 'REJECTED';

const SENT_BACK_STAGES = ['CORRECTION_NEEDED', 'DOC_OUTREACH', 'DOC_PREP', 'SALES_PITCH_QUEUE', 'SALES_PITCHING'];

const isOnHold = (l: FilingLeadItem) => Boolean(l.filingHold?.onHold) && l.currentStage !== 'FILING_SUCCESS';
const isSentBack = (l: FilingLeadItem) => SENT_BACK_STAGES.includes(l.currentStage);
const isRejected = (l: FilingLeadItem) => l.currentStage === 'FILING_FAILED';

const inView = (l: FilingLeadItem, view: FilingView): boolean => {
  switch (view) {
    case 'READY':
      return l.currentStage === 'FILING_QUEUE' && !isOnHold(l);
    case 'PENDING':
      return l.currentStage === 'FILING_IN_PROGRESS' && !isOnHold(l);
    case 'ON_HOLD':
      return isOnHold(l);
    case 'RETURNED':
      return isSentBack(l) || isRejected(l);
    case 'FILED':
      return l.currentStage === 'FILING_SUCCESS';
    default:
      return true;
  }
};

export const useFilingViews = (leads: FilingLeadItem[], view: FilingView) => {
  const [returnedTab, setReturnedTab] = useState<ReturnedTab>('PENDING_RETURNS');

  const viewLeads = useMemo(() => leads.filter((l) => inView(l, view)), [leads, view]);

  const returnedTabs = useMemo(
    () => [
      { id: 'PENDING_RETURNS', label: 'Pending returns', count: viewLeads.filter(isSentBack).length },
      { id: 'REJECTED', label: 'Rejected returns', count: viewLeads.filter(isRejected).length },
    ],
    [viewLeads]
  );

  const pageLeads = useMemo(() => {
    if (view !== 'RETURNED') return viewLeads;
    return viewLeads.filter(returnedTab === 'REJECTED' ? isRejected : isSentBack);
  }, [viewLeads, view, returnedTab]);

  return { pageLeads, returnedTab, setReturnedTab, returnedTabs };
};
