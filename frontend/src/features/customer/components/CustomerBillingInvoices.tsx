import React from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Download, 
  Receipt, 
  ShieldCheck, 
  ArrowRight
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import toast from 'react-hot-toast';

import { useOutletContext } from 'react-router-dom';

interface CustomerBillingInvoicesProps {
  isConvertedCustomer?: boolean;
}

export const CustomerBillingInvoices: React.FC<CustomerBillingInvoicesProps> = ({
  isConvertedCustomer: propConverted,
}) => {
  const context = useOutletContext<{ isConvertedCustomer?: boolean }>() || {};
  const isConvertedCustomer = propConverted !== undefined ? propConverted : Boolean(context.isConvertedCustomer);

  const invoices = isConvertedCustomer
    ? [
        {
          id: 'inv-1',
          invoiceNumber: 'INV-2025-0981',
          taxYear: 2025,
          description: 'TY 2025 Form 1040 CPA Preparation & E-Filing Fee',
          baseAmount: 249,
          discount: 50,
          totalAmount: 199,
          status: 'PAID',
          paymentMethod: 'Visa ending in •••• 4819',
          date: 'Today 11:50 AM',
        },
        {
          id: 'inv-2',
          invoiceNumber: 'INV-2024-0412',
          taxYear: 2024,
          description: 'TY 2024 Form 1040 Standard Filing & FBAR Reporting',
          baseAmount: 179,
          discount: 0,
          totalAmount: 179,
          status: 'PAID',
          paymentMethod: 'Visa ending in •••• 4819',
          date: 'Apr 12, 2025',
        },
      ]
    : [
        {
          id: 'inv-1',
          invoiceNumber: 'INV-2025-0981',
          taxYear: 2025,
          description: 'TY 2025 Form 1040 CPA Preparation & E-Filing Fee',
          baseAmount: 249,
          discount: 50,
          totalAmount: 199,
          status: 'PENDING_PAYMENT',
          paymentMethod: 'Awaiting Payment Approval',
          date: 'Current Draft Quotation',
        },
        {
          id: 'inv-2',
          invoiceNumber: 'INV-2024-0412',
          taxYear: 2024,
          description: 'TY 2024 Form 1040 Standard Filing & FBAR Reporting',
          baseAmount: 179,
          discount: 0,
          totalAmount: 179,
          status: 'PAID',
          paymentMethod: 'Visa ending in •••• 4819',
          date: 'Apr 12, 2025',
        },
      ];

  const handlePayNow = () => {
    toast.success('Simulated Stripe Payment: $199 paid successfully! 🎉');
  };

  const handleDownloadInvoice = (invNum: string) => {
    toast.success(`Downloading official tax receipt for ${invNum}...`);
  };

  return (
    <div className="space-y-6">
      {/* 1. Active Quotation Hero Banner */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border border-slate-700 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                {isConvertedCustomer ? 'TY 2025 Certified Service Plan' : 'TY 2025 Active Quotation'}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                {isConvertedCustomer ? 'Paid & Certified' : 'Special Early Filer Pricing'}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
              {isConvertedCustomer ? 'CPA Tax Preparation & IRS E-Filing Plan' : 'Professional CPA Tax Preparation Fee'}
            </h3>
          </div>

          <div className="text-right sm:text-right">
            <span className="text-xs text-slate-400 block line-through">$249.00 Standard</span>
            <div className="text-3xl font-extrabold text-emerald-400">
              $199.00 <span className="text-xs text-slate-300 font-medium">{isConvertedCustomer ? 'Paid via Visa •••• 4819' : 'All-Inclusive'}</span>
            </div>
          </div>
        </div>

        {/* Itemized Inclusions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Form 1040 Federal Return</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>1099 Interest & Dividends</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Direct Deposit E-filing</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Year-Round Audit Defense</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{isConvertedCustomer ? 'CPA Certified & IRS Circular 230 Protected' : 'Secure 256-Bit Encrypted Payment via Stripe'}</span>
          </div>

          {isConvertedCustomer ? (
            <Button
              size="md"
              onClick={() => handleDownloadInvoice('INV-2025-0981')}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer px-5"
            >
              <Download className="w-4 h-4" />
              <span>Download Tax Receipt (PDF)</span>
            </Button>
          ) : (
            <Button
              size="md"
              onClick={handlePayNow}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer px-5"
            >
              <CreditCard className="w-4 h-4" />
              <span>Approve Quotation & Pay $199</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* 2. Multi-Year Invoices & Receipts History */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-indigo-600" />
              Multi-Year Invoices & Payment Receipts
            </h4>
            <p className="text-xs text-slate-500 font-medium">
              Official payment receipts for your company tax reimbursements.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{inv.invoiceNumber}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                    TY {inv.taxYear}
                  </span>
                  {inv.status === 'PAID' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                      Paid
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-500" />
                      Pending Approval
                    </span>
                  )}
                </div>

                <div className="text-xs font-semibold text-slate-700">{inv.description}</div>
                <div className="text-[11px] text-slate-500 font-medium flex items-center gap-2">
                  <span>Method: <strong>{inv.paymentMethod}</strong></span>
                  <span>•</span>
                  <span>Date: <strong>{inv.date}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <div className="text-right">
                  <span className="text-sm font-extrabold text-slate-900">${inv.totalAmount}.00</span>
                </div>

                {inv.status === 'PAID' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadInvoice(inv.invoiceNumber)}
                    className="h-8 px-3 rounded-lg text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Receipt PDF</span>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handlePayNow}
                    className="h-8 px-3 rounded-lg text-xs font-bold bg-[#16A34A] hover:bg-[#15803D] text-white flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Pay $199</span>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
