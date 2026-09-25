import type { ClientPaymentStatus } from '../types/payment-status.types';

/**
 * Universal evaluator for taxpayer client payment status across all CRM departments
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

  const allApps: any[] = leadOrCustomer.allApplications || customer.applications || [];
  const hasPaidOrCompletedFiling = allApps.some(
    (a) =>
      a.currentStage === 'FILING_SUCCESS' ||
      a.irsStatus === 'ACCEPTED' ||
      a.paymentStatus === 'PAID' ||
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
