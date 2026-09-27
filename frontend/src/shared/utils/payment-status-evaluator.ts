import type { ClientPaymentStatus } from '../types/payment-status.types';

/**
 * Universal evaluator for taxpayer client lifetime payment status across all CRM departments (used in Pipeline Queue Tables & Customer Profile)
 * Returns:
 * - 'PAID': Retained/Converted client who has completed or paid for filings
 * - 'NEW': Fresh first-time prospect in initial intake
 * - 'UNPAID': Client with active draft/prep/pitch but pending payment
 */
export const evaluateClientPaymentStatus = (leadOrCustomer: any): ClientPaymentStatus => {
  if (!leadOrCustomer) return 'NEW';

  // 1. If backend already computed clientPaymentStatus, use it
  if (
    leadOrCustomer.clientPaymentStatus === 'PAID' ||
    leadOrCustomer.clientPaymentStatus === 'NEW' ||
    leadOrCustomer.clientPaymentStatus === 'UNPAID'
  ) {
    return leadOrCustomer.clientPaymentStatus;
  }

  const customer = leadOrCustomer.customer || leadOrCustomer;
  const isConverted = Boolean(
    customer.isConvertedCustomer || 
    leadOrCustomer.isConvertedCustomer
  );

  const draftSummary = leadOrCustomer.taxDraftSummary || {};
  const isPaidDirectly = 
    leadOrCustomer.paymentStatus === 'PAID' ||
    draftSummary.paymentStatus === 'PAID' ||
    (typeof draftSummary.paidAmount === 'number' && draftSummary.paidAmount > 0) ||
    leadOrCustomer.quotes?.some?.((q: any) => q.status === 'PAID');

  const allApps: any[] = leadOrCustomer.allApplications || customer.applications || leadOrCustomer.availableApplications || [];
  const hasPaidOrCompletedFiling = allApps.some(
    (a) =>
      a.currentStage === 'FILING_SUCCESS' ||
      a.currentStage === 'FILING_QUEUE' ||
      a.currentStage === 'FILING_IN_PROGRESS' ||
      a.irsStatus === 'ACCEPTED' ||
      a.paymentStatus === 'PAID' ||
      a.quotes?.some?.((q: any) => q.status === 'PAID') ||
      a.taxDraftSummary?.paymentStatus === 'PAID' ||
      (typeof a.taxDraftSummary?.paidAmount === 'number' && a.taxDraftSummary.paidAmount > 0)
  );

  // If client has any paid history or is converted customer
  if (isConverted || isPaidDirectly || hasPaidOrCompletedFiling) {
    return 'PAID';
  }

  // If single application in initial prospect / intake stage with no payments
  const currentStage = leadOrCustomer.currentStage || leadOrCustomer.stage || 'DOC_OUTREACH';
  const totalAppsCount = allApps.length || (leadOrCustomer.totalTaxYears ?? 1);

  if (
    totalAppsCount <= 1 &&
    (currentStage === 'RAW_PROSPECT' || currentStage === 'DOC_OUTREACH' || currentStage === 'UNASSIGNED')
  ) {
    return 'NEW';
  }

  return 'UNPAID';
};

/**
 * Return-specific evaluator for the active selected tax year return in workspace detail screens
 * Returns:
 * - 'PAID': This specific return has paid fee, paid draft, accepted IRS filing, or is in filing stages
 * - 'NEW': Fresh unworked return in initial outreach/intake with no draft or quotes
 * - 'UNPAID': Return in active prep/review/pitch with unpaid service fee
 */
export const evaluateReturnPaymentStatus = (leadOrApp: any): ClientPaymentStatus => {
  if (!leadOrApp) return 'NEW';

  const draftSummary = leadOrApp.taxDraftSummary || {};
  const quotes: any[] = leadOrApp.quotes || [];

  const isPaidDirectly =
    leadOrApp.paymentStatus === 'PAID' ||
    draftSummary.paymentStatus === 'PAID' ||
    (typeof draftSummary.paidAmount === 'number' && draftSummary.paidAmount > 0) ||
    (typeof leadOrApp.paidAmount === 'number' && leadOrApp.paidAmount > 0) ||
    quotes.some?.((q: any) => q.status === 'PAID') ||
    ['FILING_QUEUE', 'FILING_IN_PROGRESS', 'FILING_SUCCESS', 'PAID_AND_AUTHORIZED'].includes(
      leadOrApp.currentStage || leadOrApp.stage
    ) ||
    leadOrApp.irsStatus === 'ACCEPTED' ||
    leadOrApp.irsStatus === 'TRANSMITTED';

  if (isPaidDirectly) {
    return 'PAID';
  }

  const currentStage = leadOrApp.currentStage || leadOrApp.stage || 'DOC_OUTREACH';
  const allApps: any[] = leadOrApp.allApplications || leadOrApp.availableApplications || [];
  const totalAppsCount = allApps.length || (leadOrApp.totalTaxYears ?? 1);

  if (
    (currentStage === 'RAW_PROSPECT' || currentStage === 'UNASSIGNED') ||
    (currentStage === 'DOC_OUTREACH' && totalAppsCount <= 1 && (!draftSummary || Object.keys(draftSummary).length === 0))
  ) {
    return 'NEW';
  }

  return 'UNPAID';
};
