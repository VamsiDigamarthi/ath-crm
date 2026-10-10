import type { PreparerQueueView } from '../hooks/useTaxPreparerQueue';

/** Preparer sidebar pages, keyed by the ?from= value carried into client / workspace screens */
export const PREPARER_PAGES = {
  preparation: { path: '/prep-review/preparer', navId: 'preparer' },
  pending: { path: '/prep-review/preparer/pending', navId: 'preparer_pending' },
  'under-review': { path: '/prep-review/preparer/under-review', navId: 'preparer_review' },
  completed: { path: '/prep-review/preparer/completed', navId: 'preparer_completed' },
} as const;

export type PreparerOrigin = keyof typeof PREPARER_PAGES;

export const VIEW_TO_ORIGIN: Record<PreparerQueueView, PreparerOrigin> = {
  ALL: 'preparation',
  PREPARATION: 'preparation',
  PENDING: 'pending',
  UNDER_REVIEW: 'under-review',
  COMPLETED: 'completed',
};

/** Reads ?from= from a location search string; null when it is not a preparer page */
export const getPreparerOrigin = (search: string): PreparerOrigin | null => {
  const from = new URLSearchParams(search).get('from');
  return from && from in PREPARER_PAGES ? (from as PreparerOrigin) : null;
};

/** Sidebar page to return to, defaulting to Return Preparation */
export const preparerOriginPath = (search: string): string =>
  PREPARER_PAGES[getPreparerOrigin(search) ?? 'preparation'].path;

/** Reviewer sidebar pages, same ?from= idea as the preparer pages */
export const REVIEWER_PAGES = {
  assigned: { path: '/prep-review/reviewer', navId: 'reviewer' },
  'reviewer-pending': { path: '/prep-review/reviewer/pending', navId: 'reviewer_pending' },
  revisions: { path: '/prep-review/reviewer/revisions', navId: 'reviewer_revisions' },
  approved: { path: '/prep-review/reviewer/approved', navId: 'reviewer_approved' },
} as const;

export type ReviewerOrigin = keyof typeof REVIEWER_PAGES;

export const getReviewerOrigin = (search: string): ReviewerOrigin | null => {
  const from = new URLSearchParams(search).get('from');
  return from && from in REVIEWER_PAGES ? (from as ReviewerOrigin) : null;
};

/** Reviewer sidebar page to return to, defaulting to Assigned Returns */
export const reviewerOriginPath = (search: string): string =>
  REVIEWER_PAGES[getReviewerOrigin(search) ?? 'assigned'].path;
