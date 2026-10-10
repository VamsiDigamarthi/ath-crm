import React from 'react';
import { Receipt } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { InvoiceDocumentModal } from './InvoiceDocumentModal';
import { useApplicationInvoices } from '../hooks/useInvoices';

interface RaiseInvoiceControlProps {
  applicationId?: string;
  customerName?: string;
  customerEmail?: string | null;
  taxYear?: number;
  disabled?: boolean;
  disabledReason?: string;
}

/** Raise Invoice button for the sales fee card (dark background) */
export const RaiseInvoiceControl: React.FC<RaiseInvoiceControlProps> = ({
  applicationId,
  customerName,
  customerEmail,
  taxYear,
  disabled,
  disabledReason,
}) => {
  const inv = useApplicationInvoices(applicationId, { taxYear, customerEmail });

  return (
    <>
      {inv.current ? (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => inv.current && inv.openView(inv.current)}
            className="text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer"
            title="View invoice"
          >
            <Receipt className="w-4 h-4" />
            <span>{inv.current.invoiceNumber}</span>
            <span className="text-[10px] font-medium text-slate-300">
              · {inv.current.status === 'PAID' ? 'Paid' : 'Unpaid'}
            </span>
          </button>
          {inv.current.status !== 'PAID' && !disabled && (
            <button
              type="button"
              onClick={inv.openPreview}
              className="text-[11px] font-medium text-slate-300 hover:text-white underline-offset-2 hover:underline cursor-pointer"
              title="Create a new invoice from the latest Services & Pricing (the old one is replaced)"
            >
              Re-raise
            </button>
          )}
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          title={disabled ? disabledReason : 'Create an invoice from Services & Pricing and email it to the client'}
          onClick={inv.openPreview}
          className={`border-white/20 text-xs font-bold flex items-center gap-1.5 ${
            disabled ? 'bg-white/5 text-slate-400 cursor-not-allowed opacity-60' : 'bg-white/10 hover:bg-white/20 text-white cursor-pointer'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Raise Invoice</span>
        </Button>
      )}

      {/* Preview first; the invoice number is created only on confirm */}
      <InvoiceDocumentModal
        invoice={inv.preview}
        customerName={customerName}
        onClose={inv.closePreview}
        isPreview
        onConfirm={inv.raise}
        isConfirming={inv.isRaising}
      />

      <InvoiceDocumentModal invoice={inv.viewing} customerName={customerName} onClose={inv.closeView} />
    </>
  );
};
