import React from 'react';
import { Printer } from 'lucide-react';
import { AppModal } from '@/shared/components/AppModal';
import { Button } from '@/shared/components/Button';
import type { InvoiceItem } from '../types/invoice.types';

const money = (v: number) => `$${Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const STATUS_STYLES: Record<string, string> = {
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  UNPAID: 'bg-amber-50 text-amber-700 border-amber-200',
  VOID: 'bg-slate-100 text-slate-500 border-slate-200',
};

interface InvoiceDocumentModalProps {
  invoice: InvoiceItem | null;
  customerName?: string;
  onClose: () => void;
  /** Preview before raising: no number yet, footer shows Confirm instead of Print */
  isPreview?: boolean;
  onConfirm?: () => void;
  isConfirming?: boolean;
}

/** Invoice as a document; "Print / Save PDF" uses the browser print dialog */
export const InvoiceDocumentModal: React.FC<InvoiceDocumentModalProps> = ({
  invoice,
  customerName,
  onClose,
  isPreview = false,
  onConfirm,
  isConfirming = false,
}) => (
  <AppModal
    isOpen={Boolean(invoice)}
    onClose={onClose}
    title={isPreview ? 'Invoice preview' : invoice ? `Invoice ${invoice.invoiceNumber}` : 'Invoice'}
    subtitle={isPreview ? 'Check the details. The invoice number is created when you confirm.' : undefined}
    size="lg"
    footer={
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onClose} className="cursor-pointer">
          {isPreview ? 'Cancel' : 'Close'}
        </Button>
        {isPreview ? (
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={isConfirming}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold cursor-pointer"
          >
            {isConfirming ? 'Raising...' : 'Confirm & send invoice'}
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => window.print()}
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save PDF
          </Button>
        )}
      </div>
    }
  >
    {invoice && (
      <div className="space-y-5 text-sm text-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <p className="text-base font-bold text-slate-900">ATH Tax Services</p>
            <p className="text-xs text-slate-500">Tax preparation & e-filing</p>
          </div>
          <div className="sm:text-right space-y-1">
            <p className="font-semibold text-slate-900">{isPreview ? 'Number on confirm' : invoice.invoiceNumber}</p>
            <p className="text-xs text-slate-500">{new Date(invoice.createdAt).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}</p>
            {isPreview ? (
              <span className="inline-block px-2 py-0.5 rounded-md border text-[11px] font-medium bg-slate-100 text-slate-600 border-slate-200">
                Draft
              </span>
            ) : (
              <span className={`inline-block px-2 py-0.5 rounded-md border text-[11px] font-medium ${STATUS_STYLES[invoice.status]}`}>
                {invoice.status === 'VOID' ? 'Replaced' : invoice.status === 'PAID' ? 'Paid' : 'Unpaid'}
              </span>
            )}
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Billed to <span className="font-medium text-slate-800">{customerName || 'Client'}</span>
          {invoice.emailedTo ? ` · ${invoice.emailedTo}` : ''} · Tax year {invoice.taxYear}
          {invoice.filingType && invoice.filingType !== 'INDIVIDUAL' ? ` · ${invoice.filingType.toLowerCase()}` : ''}
        </div>

        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="text-left font-medium px-3 py-2">Item</th>
                <th className="text-right font-medium px-3 py-2">Qty</th>
                <th className="text-right font-medium px-3 py-2">Unit price</th>
                <th className="text-right font-medium px-3 py-2">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items.map((line, idx) => (
                <tr key={idx}>
                  <td className="px-3 py-2 text-slate-900">{line.name}</td>
                  <td className="px-3 py-2 text-right">{line.quantity}</td>
                  <td className="px-3 py-2 text-right">{money(line.unitPrice)}</td>
                  <td className="px-3 py-2 text-right">{money(line.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ml-auto w-full sm:w-64 space-y-1.5">
          <div className="flex justify-between"><span>Subtotal</span><span>{money(invoice.subtotal)}</span></div>
          <div className="flex justify-between"><span>Tax</span><span>{money(invoice.tax)}</span></div>
          <div className="flex justify-between pt-1.5 border-t border-slate-200 font-bold text-slate-900">
            <span>Total</span><span>{money(invoice.total)}</span>
          </div>
        </div>
      </div>
    )}
  </AppModal>
);
