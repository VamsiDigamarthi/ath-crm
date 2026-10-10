import type { SalesCallDisposition } from '../types/sales.types';

/** Sales call results shown in the "Log call result" popup (same set as the documenter's call options) */
export const SALES_CALL_OUTCOME_OPTIONS: { value: SalesCallDisposition; label: string; hint: string }[] = [
  { value: 'SALES_CONNECTED', label: 'Connected', hint: 'Spoke with the client' },
  { value: 'SALES_NO_ANSWER', label: 'No answer / Voicemail', hint: 'Client did not pick up, or left a voicemail' },
  { value: 'SALES_CALLBACK', label: 'Callback', hint: 'Client asked to be called at a set date & time' },
  { value: 'SALES_FOLLOW_UP', label: 'Follow-up', hint: 'Needs another touch later, pick the follow-up date' },
  { value: 'SALES_NOT_INTERESTED', label: 'Walkout – Not interested', hint: 'Client is not going ahead, pick the reason' },
];

/** Outcomes that need a date & time picked */
export const SALES_OUTCOMES_WITH_DATE: SalesCallDisposition[] = ['SALES_CALLBACK', 'SALES_FOLLOW_UP'];

/** Reasons for a "Not interested" call ("Other" needs a comment) */
export const SALES_NOT_INTERESTED_REASONS = [
  'Price Too High',
  'Already Using Another Provider',
  'Chose Another CPA / Service',
  'Not Ready to File',
  'No Longer Needs Service',
  'Just Exploring',
  'Client Walked Away',
  'Other',
] as const;
