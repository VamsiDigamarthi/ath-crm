export type InvoiceStatus = 'PAID' | 'UNPAID' | 'VOID';

export interface InvoiceLine {
  name: string;
  description?: string | null;
  unit: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  tax: number;
  total: number;
}

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  applicationId: string;
  taxYear: number;
  filingType: string;
  items: InvoiceLine[];
  subtotal: number;
  tax: number;
  total: number;
  emailedTo: string | null;
  status: InvoiceStatus;
  createdAt: string;
}
