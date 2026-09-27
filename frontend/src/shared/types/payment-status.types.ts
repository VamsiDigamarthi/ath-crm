export type ClientPaymentStatus = 'PAID' | 'NEW' | 'UNPAID';

export interface ClientPaymentStatusConfig {
  status: ClientPaymentStatus;
  label: string;
  subLabel: string;
  badgeClasses: string;
  dotColor: string;
  iconColor: string;
  tooltip: string;
}
