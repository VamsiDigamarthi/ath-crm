import type { SalesCallDisposition } from '../types/sales.types';

/** Sales call results shown in the "Log call result" popup (only what the client asked for) */
export const SALES_CALL_OUTCOME_OPTIONS: { value: SalesCallDisposition; label: string; hint: string }[] = [
  { value: 'SALES_CALLBACK', label: 'Schedule callback', hint: 'Client asked to be called at a set date & time' },
  { value: 'SALES_FOLLOW_UP', label: 'Follow-up', hint: 'Needs another touch later, no fixed time' },
];
