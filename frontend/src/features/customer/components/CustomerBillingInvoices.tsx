import React from 'react';
import { Receipt, Eye } from 'lucide-react';
import { AppEmptyState } from '@/shared/components/AppEmptyState';
import { useMyInvoices } from '@/features/invoices/hooks/useInvoices';
import { InvoiceDocumentModal } from '@/features/invoices/components/InvoiceDocumentModal';
import { useAuthStore } from '@/features/auth/store/auth-store';

const money = (v: number) => `$${Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Customer portal: real invoices raised by sales (replaces the old sample data) */
export const CustomerBillingInvoices: React.FC = () => {
  const { invoices, isLoading, viewing, openView, closeView } = useMyInvoices();
  const { user } = useAuthStore();
  const customerName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || undefined;

  const unpaidTotal = invoices.filter((i) => i.status === 'UNPAID').reduce((sum, i) => sum + i.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Billing &amp; Invoices</h2>
          <p className="text-sm text-slate-500 mt-1">Invoices for your tax returns with ATH Tax Services.</p>
        </div>
        {unpaidTotal > 0 && (
          <div className="bg-white border border-slate-200 rounded-lg px-4 py-2">
            <p className="text-[11px] text-slate-500">Amount due</p>
            <p className="text-lg font-bold text-slate-900">{money(unpaidTotal)}</p>
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-5 space-y-3 animate-pulse">
            <div className="h-12 bg-slate-100 rounded-lg" />
            <div className="h-12 bg-slate-100 rounded-lg" />
          </div>
        ) : invoices.length === 0 ? (
          <AppEmptyState icon={Receipt} title="No invoices yet" description="Your invoice will appear here once our team raises it." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Invoice</th>
                  <th className="text-left font-medium px-4 py-3">Tax year</th>
                  <th className="text-left font-medium px-4 py-3">Date</th>
                  <th className="text-right font-medium px-4 py-3">Total</th>
                  <th className="text-left font-medium px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3 text-slate-700">TY {inv.taxYear}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {new Date(inv.createdAt).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">{money(inv.total)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md border text-[11px] font-medium ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {inv.status === 'PAID' ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openView(inv)}
                        className="inline-flex items-center gap-1 text-xs text-slate-700 border border-slate-200 rounded-lg px-2.5 py-1 hover:bg-slate-50 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <InvoiceDocumentModal invoice={viewing} customerName={customerName} onClose={closeView} />
    </div>
  );
};
