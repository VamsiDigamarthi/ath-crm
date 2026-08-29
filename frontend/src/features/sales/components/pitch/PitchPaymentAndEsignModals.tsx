import React, { useState } from 'react';
import { 
  CreditCard, 
  Send, 
  Lock, 
  FileText, 
  Smartphone
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import type { SalesLeadItem } from '../../types/sales.types';
import toast from 'react-hot-toast';

interface PitchPaymentAndEsignModalsProps {
  lead: SalesLeadItem;
  isPaymentModalOpen: boolean;
  onClosePaymentModal: () => void;
  onProcessPaymentSuccess: (method: 'STRIPE_CARD' | 'PAYPAL' | 'WIRE_TRANSFER') => void;
  isEsignModalOpen: boolean;
  onCloseEsignModal: () => void;
  onEsignSuccess: () => void;
  onDispatchToFiling?: () => void;
}

export const PitchPaymentAndEsignModals: React.FC<PitchPaymentAndEsignModalsProps> = ({
  lead,
  isPaymentModalOpen,
  onClosePaymentModal,
  onProcessPaymentSuccess,
  isEsignModalOpen,
  onCloseEsignModal,
  onEsignSuccess,
}) => {
  const [paymentTab, setPaymentTab] = useState<'CARD' | 'LINK'>('CARD');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isProcessingEsign, setIsProcessingEsign] = useState(false);

  // Card Inputs
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('884');

  // E-Sign Checkbox
  const [hasEsignConsent, setHasEsignConsent] = useState(false);

  const handleChargeCard = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      onProcessPaymentSuccess('STRIPE_CARD');
      onClosePaymentModal();
      toast.success(`Payment of $${lead.feeBreakdown.totalServiceFee} successfully charged via Stripe! 💳✨`);
    }, 1000);
  };

  const handleSendPaymentLink = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      onClosePaymentModal();
      toast.success(`Stripe checkout link sent to ${lead.taxpayerEmail} & ${lead.taxpayerPhone}! 📲`);
    }, 800);
  };

  const handleConfirmEsign = () => {
    if (!hasEsignConsent) {
      toast.error('Please check the IRS e-file authorization consent');
      return;
    }
    setIsProcessingEsign(true);
    setTimeout(() => {
      setIsProcessingEsign(false);
      onEsignSuccess();
      onCloseEsignModal();
      toast.success('Form 8879 successfully e-signed & verified! ✍️🌟');
    }, 900);
  };

  return (
    <>
      {/* 1. Payment Gateway & Virtual Terminal Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#16A34A] flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Collect Service Fee (${lead.feeBreakdown.totalServiceFee})
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Secure Stripe Virtual Terminal for {lead.taxpayerName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPaymentTab('CARD')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    paymentTab === 'CARD' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Card Swipe
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentTab('LINK')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    paymentTab === 'LINK' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Send Link
                </button>
              </div>
            </div>

            {paymentTab === 'CARD' ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">Total Due Today</span>
                  <span className="text-xl font-black text-slate-900">
                    ${lead.feeBreakdown.totalServiceFee}.00 USD
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      defaultValue={lead.taxpayerName}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        value={cardExp}
                        onChange={(e) => setCardExp(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">CVC / CVV</label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>256-bit encrypted PCI-DSS Level 1 compliant Stripe terminal.</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-2">
                  <div className="font-bold text-blue-900 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-blue-600" />
                    <span>Instant Client Self-Checkout Link</span>
                  </div>
                  <p className="text-blue-800 text-[11px]">
                    The client will receive an SMS and email with a 1-click Apple Pay, Google Pay, and Credit Card payment checkout for ${lead.feeBreakdown.totalServiceFee}.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                    <span className="text-slate-600 font-medium">Recipient Email:</span>
                    <span className="font-bold text-slate-900">{lead.taxpayerEmail}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                    <span className="text-slate-600 font-medium">Recipient SMS:</span>
                    <span className="font-bold text-slate-900">{lead.taxpayerPhone}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={onClosePaymentModal}
                disabled={isProcessingPayment}
                className="text-xs font-semibold"
              >
                Cancel
              </Button>

              {paymentTab === 'CARD' ? (
                <Button
                  size="sm"
                  onClick={handleChargeCard}
                  disabled={isProcessingPayment}
                  className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold"
                >
                  {isProcessingPayment ? 'Processing Charge...' : `Charge $${lead.feeBreakdown.totalServiceFee}.00`}
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleSendPaymentLink}
                  disabled={isProcessingPayment}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isProcessingPayment ? 'Sending...' : 'Send Payment Link'}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Form 8879 Digital E-Sign Authorization Modal */}
      {isEsignModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  IRS Form 8879 E-File Authorization
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  Taxpayer PIN &amp; Signature Consent for TY {lead.taxYear}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-[11px] leading-relaxed text-slate-600">
                <p className="font-bold text-slate-800">
                  Part II: Taxpayer Declaration &amp; Electronic Signature Consent
                </p>
                <p>
                  "Under penalties of perjury, I declare that I have examined a copy of my 2025 electronic individual income tax return (Form 1040) with Federal Refund of <strong className="text-emerald-700">+${lead.federalRefund.toLocaleString()}</strong> and authorize TaxCRM to transmit this return to the Internal Revenue Service."
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-dashed border-blue-300 bg-blue-50/40 text-center space-y-1">
                <div className="font-mono text-base font-bold text-blue-900 tracking-wider">
                  /s/ {lead.taxpayerName}
                </div>
                <div className="text-[10px] text-slate-400">
                  Digital Timestamp: {new Date().toLocaleString()} • IP: Verified
                </div>
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={hasEsignConsent}
                  onChange={(e) => setHasEsignConsent(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mt-0.5"
                />
                <span className="text-[11px] font-semibold text-slate-700">
                  Client has verbally verified and authorized the electronic PIN signature on this phone call.
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={onCloseEsignModal}
                disabled={isProcessingEsign}
                className="text-xs font-semibold"
              >
                Cancel
              </Button>

              <Button
                size="sm"
                onClick={handleConfirmEsign}
                disabled={!hasEsignConsent || isProcessingEsign}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
              >
                {isProcessingEsign ? 'Signing...' : 'Authorize & Sign Form 8879'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
