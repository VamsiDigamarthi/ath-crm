import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { invoiceService } from '../services/invoice-service';
import type { InvoiceItem } from '../types/invoice.types';
import { returnItemsService } from '@/features/prep-review/services/return-items-service';

/** Sales side: invoices of one return, and raising a new one */
export const useApplicationInvoices = (
  applicationId: string | undefined,
  details?: { taxYear?: number; customerEmail?: string | null }
) => {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [isRaising, setIsRaising] = useState(false);
  const [viewing, setViewing] = useState<InvoiceItem | null>(null);
  // Draft built from Services & Pricing; the real number is only created on confirm
  const [preview, setPreview] = useState<InvoiceItem | null>(null);

  const load = useCallback(async () => {
    if (!applicationId) return;
    try {
      const res = await invoiceService.listForApplication(applicationId);
      setInvoices(res.data || []);
    } catch {
      setInvoices([]);
    }
  }, [applicationId]);

  useEffect(() => {
    load();
  }, [load]);

  // Raise Invoice: show what the invoice will contain before anything is created
  const openPreview = async () => {
    if (!applicationId) return;
    try {
      const res = await returnItemsService.list(applicationId);
      const { items, totals } = res.data;
      if (!items.length) {
        toast.error('Add services in Services & Pricing before raising an invoice.');
        return;
      }
      setPreview({
        id: 'draft',
        invoiceNumber: '',
        applicationId,
        taxYear: details?.taxYear ?? invoices[0]?.taxYear ?? new Date().getFullYear(),
        filingType: invoices[0]?.filingType ?? 'INDIVIDUAL',
        items: items.map((i) => ({
          name: i.name,
          description: i.description,
          unit: i.unit,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          amount: i.amount,
          tax: i.tax,
          total: i.total,
        })),
        subtotal: totals.subtotal,
        tax: totals.tax,
        total: totals.total,
        emailedTo: details?.customerEmail ?? null,
        status: 'UNPAID',
        createdAt: new Date().toISOString(),
      });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to load Services & Pricing');
    }
  };

  const raise = async () => {
    if (!applicationId) return;
    setIsRaising(true);
    try {
      const res = await invoiceService.raise(applicationId);
      toast.success(`Invoice ${res.data.invoiceNumber} raised and sent to the client`);
      setPreview(null);
      await load();
      setViewing(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to raise invoice');
    } finally {
      setIsRaising(false);
    }
  };

  return {
    // Latest invoice that is still active (re-raising voids the older one)
    current: invoices.find((i) => i.status !== 'VOID') || null,
    invoices,
    isRaising,
    preview,
    openPreview,
    closePreview: () => setPreview(null),
    raise,
    viewing,
    openView: (inv: InvoiceItem) => setViewing(inv),
    closeView: () => setViewing(null),
    refresh: load,
  };
};

/** Customer portal: own invoices */
export const useMyInvoices = () => {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewing, setViewing] = useState<InvoiceItem | null>(null);

  useEffect(() => {
    invoiceService
      .listMine()
      .then((res) => setInvoices(res.data || []))
      .catch(() => setInvoices([]))
      .finally(() => setIsLoading(false));
  }, []);

  return {
    invoices,
    isLoading,
    viewing,
    openView: (inv: InvoiceItem) => setViewing(inv),
    closeView: () => setViewing(null),
  };
};
