import { ApplicationStage } from "@prisma/client";

export type ClientHistoryStatus = "PAID" | "NEW" | "UNPAID";

/** A return counts as paid once it reached filing or has any recorded payment */
export const isApplicationPaid = (a: any): boolean =>
  a?.currentStage === ApplicationStage.FILING_SUCCESS ||
  a?.currentStage === ApplicationStage.FILING_QUEUE ||
  a?.currentStage === ApplicationStage.FILING_IN_PROGRESS ||
  Boolean(a?.quotes?.some((q: any) => q.status === "PAID")) ||
  a?.taxDraftSummary?.paymentStatus === "PAID" ||
  Number(a?.taxDraftSummary?.paidAmount) > 0;

/**
 * Client history badge (New / Paid / Unpaid) shown app-wide under the taxpayer name.
 * Based only on tax years before the one being worked on:
 * - NEW: no earlier filing with us
 * - PAID: paid for at least one earlier filing
 * - UNPAID: had an earlier filing but dropped out before paying
 */
export const computeClientHistoryStatus = (
  taxYear: number,
  allCustomerApps: any[],
  isConvertedCustomer?: boolean | null
): ClientHistoryStatus => {
  const earlier = (allCustomerApps || []).filter((a) => Number(a.taxYear) < Number(taxYear));
  if (earlier.some(isApplicationPaid)) return "PAID";
  if (earlier.length > 0) return "UNPAID";
  // History only: the "converted" flag is set when THIS year's return gets filed,
  // and this year's payment already shows in the Payment column, so it is not used here.
  void isConvertedCustomer;
  return "NEW";
};
