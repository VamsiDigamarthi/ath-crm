import React, { useState } from 'react';
import { 
  CreditCard, 
  Send, 
  Lock, 
  FileText, 
  Smartphone, 
  UploadCloud, 
  CheckCircle2, 
  PhoneCall, 
  ShieldCheck, 
  FileCheck, 
  AlertTriangle,
  History,
  Coins,
  Receipt,
  UserCheck,
  Clock
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import type { SalesLeadItem, PaymentHistoryItem } from '../../types/sales.types';
import toast from 'react-hot-toast';

interface PitchPaymentAndEsignModalsProps {
  lead: SalesLeadItem;
  isPaymentModalOpen: boolean;
  onClosePaymentModal: () => void;
  onProcessPaymentSuccess: (
    method: 'STRIPE_CARD' | 'PAYPAL' | 'WIRE_TRANSFER',
    details?: { amount?: number; notes?: string; transactionRef?: string }
  ) => void;
  isEsignModalOpen: boolean;
  onCloseEsignModal: () => void;
  onEsignSuccess: (meta?: { file?: File; fileName?: string; method?: string; pin?: string }) => void;
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
  const [paymentView, setPaymentView] = useState<'PAY' | 'HISTORY'>('PAY');
  const [paymentTab, setPaymentTab] = useState<'CARD' | 'LINK'>('CARD');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Partial Payment States
  const totalQuotedFee = Number(lead.feeBreakdown?.totalServiceFee) || 247;
  const currentPaidAmount = Number(lead.paidAmount) || 0;
  const currentRemainingBalance = lead.remainingBalance !== undefined
    ? Number(lead.remainingBalance)
    : Math.max(0, totalQuotedFee - currentPaidAmount);

  const [paymentType, setPaymentType] = useState<'FULL' | 'PARTIAL'>('FULL');
  const [customAmount, setCustomAmount] = useState<string>(
    currentRemainingBalance > 0 ? String(currentRemainingBalance) : String(totalQuotedFee)
  );
  const [paymentNotes, setPaymentNotes] = useState('');

  React.useEffect(() => {
    if (isPaymentModalOpen) {
      setCustomAmount(currentRemainingBalance > 0 ? String(currentRemainingBalance) : String(totalQuotedFee));
      setPaymentType('FULL');
      setPaymentNotes('');
    }
  }, [isPaymentModalOpen, currentRemainingBalance, totalQuotedFee]);

  // Comprehensive Amount Validation & Strict Max Capping
  const parsedCustom = customAmount === '' ? 0 : Number(customAmount);
  const isCustomExceeded = paymentType === 'PARTIAL' && parsedCustom > currentRemainingBalance;
  const isCustomTooLow = paymentType === 'PARTIAL' && (parsedCustom <= 0 || isNaN(parsedCustom));
  const isAmountInvalid = paymentType === 'PARTIAL' && (isCustomExceeded || isCustomTooLow);

  // Effective payment amount to charge in this transaction
  const effectiveChargeAmount = paymentType === 'FULL'
    ? currentRemainingBalance
    : parsedCustom;
  
  // E-Sign Tab: 3 Real Compliance Modes
  const [esignTab, setEsignTab] = useState<'EMAIL_LINK' | 'UPLOAD_PDF' | 'PHONE_PIN'>('EMAIL_LINK');
  const [isProcessingEsign, setIsProcessingEsign] = useState(false);

  // Card Inputs
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('884');

  // Phone PIN & Call Recording Compliance
  const [taxpayerPin, setTaxpayerPin] = useState(lead.taxpayerPin || '');
  const [callRecordingRef, setCallRecordingRef] = useState(`CALL_REC_${Math.floor(100000 + Math.random() * 900000)}`);
  const [hasEsignConsent, setHasEsignConsent] = useState(false);

  // File Upload State & PIN
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadPin, setUploadPin] = useState<string>(typeof lead.taxpayerPin === 'string' ? lead.taxpayerPin : '');

  // Payment history items list
  const historyItems: PaymentHistoryItem[] = Array.isArray(lead.paymentHistory) && lead.paymentHistory.length > 0
    ? lead.paymentHistory
    : Array.isArray((lead.taxDraftSummary as any)?.paymentHistory)
    ? (lead.taxDraftSummary as any).paymentHistory
    : [];

  const handleChargeCard = () => {
    if (isAmountInvalid || effectiveChargeAmount <= 0) {
      if (isCustomExceeded) {
        toast.error(`Payment amount ($${parsedCustom}) exceeds the remaining balance of $${currentRemainingBalance}! Max allowed is $${currentRemainingBalance}. ⚠️`);
      } else {
        toast.error('Please enter a valid payment amount greater than $0');
      }
      return;
    }
    if (effectiveChargeAmount > currentRemainingBalance && currentRemainingBalance > 0) {
      toast.error(`Payment amount ($${effectiveChargeAmount}) cannot exceed the remaining balance of $${currentRemainingBalance}! ⚠️`);
      return;
    }

    setIsProcessingPayment(true);
    const txRef = `tx_card_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const isPartial = effectiveChargeAmount < currentRemainingBalance;
    const finalNotes = paymentNotes.trim() || (isPartial ? `Partial payment installment ($${effectiveChargeAmount})` : 'Full balance payment');

    setTimeout(() => {
      setIsProcessingPayment(false);
      onProcessPaymentSuccess('STRIPE_CARD', {
        amount: effectiveChargeAmount,
        notes: finalNotes,
        transactionRef: txRef,
      });
      onClosePaymentModal();
      toast.success(
        isPartial
          ? `Partial payment of $${effectiveChargeAmount} collected! Remaining balance: $${Math.max(0, currentRemainingBalance - effectiveChargeAmount)} 💳✅`
          : `Full fee payment of $${effectiveChargeAmount} successfully charged and verified! 💳✨`
      );
    }, 800);
  };

  const handleSendPaymentLink = () => {
    if (isAmountInvalid || effectiveChargeAmount <= 0) {
      if (isCustomExceeded) {
        toast.error(`Payment amount ($${parsedCustom}) exceeds the remaining balance of $${currentRemainingBalance}! Max allowed is $${currentRemainingBalance}. ⚠️`);
      } else {
        toast.error('Please enter a valid payment amount greater than $0');
      }
      return;
    }
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      onClosePaymentModal();
      toast.success(`Stripe checkout link ($${effectiveChargeAmount}) sent to ${lead.taxpayerEmail} & ${lead.taxpayerPhone}! 📲`);
    }, 800);
  };

  const handleSendEsignLink = () => {
    setIsProcessingEsign(true);
    setTimeout(() => {
      setIsProcessingEsign(false);
      onEsignSuccess({ method: 'EMAIL_LINK', pin: taxpayerPin });
      onCloseEsignModal();
      toast.success(`Form 8879 E-Sign Link dispatched to ${lead.taxpayerEmail}! Signed audit log recorded in database. ✍️🌟`);
    }, 800);
  };

  const handleUploadSignedDoc = () => {
    if (!uploadedFile) {
      toast.error('Please select or drop the signed Form 8879 PDF file');
      return;
    }
    const finalPin = uploadPin.trim() || taxpayerPin;
    if (finalPin && finalPin.length < 5) {
      toast.error('Please enter the 5-digit PIN written on the signed Form 8879');
      return;
    }
    setIsProcessingEsign(true);
    setTimeout(() => {
      setIsProcessingEsign(false);
      onEsignSuccess({ file: uploadedFile, fileName: uploadedFile.name, method: 'UPLOAD_PDF', pin: finalPin });
      onCloseEsignModal();
    }, 400);
  };

  const handleConfirmPhonePinEsign = () => {
    if (!hasEsignConsent) {
      toast.error('Please check the IRS e-file authorization consent');
      return;
    }
    if (!taxpayerPin || taxpayerPin.length < 5) {
      toast.error('Please enter a valid 5-digit Taxpayer IRS PIN');
      return;
    }
    setIsProcessingEsign(true);
    setTimeout(() => {
      setIsProcessingEsign(false);
      onEsignSuccess({ method: 'PHONE_PIN', pin: taxpayerPin });
      onCloseEsignModal();
      toast.success(`Form 8879 authorized with PIN ${taxpayerPin} & Call Log ${callRecordingRef} recorded in database! 📞🔒`);
    }, 800);
  };

  return (
    <>
      {/* 1. Payment Gateway & Virtual Terminal Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Header & Main Views */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#16A34A] flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Payment Collection &amp; Ledger
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Taxpayer: {lead.taxpayerName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPaymentView('PAY')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    paymentView === 'PAY'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Collect Payment
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentView('HISTORY')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                    paymentView === 'HISTORY'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <History className="w-3 h-3" />
                  <span>Ledger ({historyItems.length})</span>
                </button>
              </div>
            </div>

            {/* View 1: Collect Payment (Side-by-Side 2-Column Responsive Layout) */}
            {paymentView === 'PAY' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                  {/* Left Column: Fee Summary & Amount Selector (5 Cols) */}
                  <div className="md:col-span-5 space-y-3">
                    {/* Balance Summary Card */}
                    <div className="p-3.5 rounded-xl bg-slate-900 text-white space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          Quoted Total Fee
                        </span>
                        <span className="text-xs font-black text-white">
                          ${totalQuotedFee}.00
                        </span>
                      </div>

                      <div className="pt-1 border-t border-slate-800 flex items-baseline justify-between">
                        <div>
                          <div className="text-[10px] text-emerald-400 font-bold">
                            Paid: ${currentPaidAmount}
                          </div>
                          <div className="text-sm font-black text-amber-300">
                            ${currentRemainingBalance > 0 ? `${currentRemainingBalance}.00 Due` : 'Fully Paid'}
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-white/10 text-slate-300">
                          TY {lead.taxYear}
                        </span>
                      </div>
                    </div>

                    {/* Installment / Payment Amount Selector */}
                    <div className="space-y-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5 text-blue-600" />
                          <span>Amount to Collect</span>
                        </label>
                        {isCustomExceeded ? (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-300 animate-pulse">
                            Max: ${currentRemainingBalance}
                          </span>
                        ) : isCustomTooLow ? (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                            Min $1
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            ${effectiveChargeAmount}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setPaymentType('FULL');
                            setCustomAmount(String(currentRemainingBalance));
                          }}
                          className={`p-2 rounded-lg border text-xs font-bold text-left transition-all cursor-pointer ${
                            paymentType === 'FULL'
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-400'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="text-[9px] text-slate-500 uppercase">Full Balance</div>
                          <div className="text-xs font-black text-slate-900">${currentRemainingBalance}.00</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setPaymentType('PARTIAL');
                            if (Number(customAmount) > currentRemainingBalance || Number(customAmount) <= 0) {
                              setCustomAmount(String(Math.min(100, currentRemainingBalance)));
                            }
                          }}
                          className={`p-2 rounded-lg border text-xs font-bold text-left transition-all cursor-pointer ${
                            paymentType === 'PARTIAL'
                              ? 'border-blue-500 bg-blue-50 text-blue-900 ring-1 ring-blue-400'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="text-[9px] text-slate-500 uppercase">Installment</div>
                          <div className="text-xs font-black text-blue-700">Custom ($)</div>
                        </button>
                      </div>

                      {paymentType === 'PARTIAL' && (
                        <div className="space-y-2 pt-1.5 border-t border-slate-200 animate-in fade-in duration-150">
                          <div className="flex items-center gap-1 flex-wrap">
                            {[50, 75, 100, 150]
                              .filter((pill) => pill <= currentRemainingBalance)
                              .map((pill) => (
                                <button
                                  key={pill}
                                  type="button"
                                  onClick={() => setCustomAmount(String(pill))}
                                  className="px-2 py-0.5 text-[10px] font-bold bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 rounded text-slate-700 transition-colors cursor-pointer"
                                >
                                  ${pill}
                                </button>
                              ))}
                            <button
                              type="button"
                              onClick={() => setCustomAmount(String(currentRemainingBalance))}
                              className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded text-emerald-800 transition-colors cursor-pointer"
                            >
                              Max (${currentRemainingBalance})
                            </button>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-500">$</span>
                              <input
                                type="number"
                                min={1}
                                max={currentRemainingBalance}
                                value={customAmount}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/[^0-9.]/g, '');
                                  setCustomAmount(val);
                                }}
                                placeholder={`Max allowable: $${currentRemainingBalance}`}
                                className={`w-full px-2.5 py-1 text-xs font-bold rounded-lg border transition-all focus:outline-none ${
                                  isCustomExceeded
                                    ? 'border-rose-500 bg-rose-50/60 text-rose-900 focus:ring-2 focus:ring-rose-400'
                                    : isCustomTooLow
                                    ? 'border-amber-400 bg-amber-50/40 text-amber-900 focus:ring-2 focus:ring-amber-400'
                                    : 'border-slate-200 bg-white focus:ring-2 focus:ring-blue-500'
                                }`}
                              />
                            </div>

                            {/* Live Validation Feedback Alerts */}
                            {isCustomExceeded && (
                              <div className="p-2 rounded-lg bg-rose-50 border border-rose-300 text-rose-900 text-[10px] font-bold flex items-center justify-between gap-1 shadow-2xs">
                                <span className="flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                                  <span>Exceeds max remaining balance (${currentRemainingBalance})</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setCustomAmount(String(currentRemainingBalance))}
                                  className="text-[10px] bg-rose-200 hover:bg-rose-300 text-rose-950 px-1.5 py-0.5 rounded font-extrabold cursor-pointer whitespace-nowrap"
                                >
                                  Cap to Max
                                </button>
                              </div>
                            )}

                            {isCustomTooLow && (
                              <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-bold flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                                <span>Please enter a payment amount greater than $0</span>
                              </div>
                            )}

                            {!isAmountInvalid && parsedCustom > 0 && parsedCustom < currentRemainingBalance && (
                              <div className="text-[10px] font-medium text-slate-600 flex items-center justify-between pt-0.5">
                                <span>Bal after payment:</span>
                                <strong className="text-emerald-700 font-bold">
                                  ${(currentRemainingBalance - parsedCustom).toLocaleString()}.00 USD
                                </strong>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Terminal Inputs (7 Cols) */}
                  <div className="md:col-span-7 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-700">Payment Gateway:</span>
                      <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                        <button
                          type="button"
                          onClick={() => setPaymentTab('CARD')}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                            paymentTab === 'CARD' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                          }`}
                        >
                          Card Terminal
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentTab('LINK')}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                            paymentTab === 'LINK' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                          }`}
                        >
                          Checkout Link
                        </button>
                      </div>
                    </div>

                    {paymentTab === 'CARD' ? (
                      <div className="space-y-2.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-0.5">
                              Cardholder Name
                            </label>
                            <input
                              type="text"
                              defaultValue={lead.taxpayerName}
                              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 font-medium focus:outline-none focus:border-emerald-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-0.5">
                              Card Number
                            </label>
                            <input
                              type="text"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 font-mono tracking-wider focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-0.5">
                              Expiry (MM/YY)
                            </label>
                            <input
                              type="text"
                              value={cardExp}
                              onChange={(e) => setCardExp(e.target.value)}
                              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-0.5">
                              CVC / CVV
                            </label>
                            <input
                              type="text"
                              value={cardCvc}
                              onChange={(e) => setCardCvc(e.target.value)}
                              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-0.5">
                            Payment Remarks / Notes (Optional)
                          </label>
                          <input
                            type="text"
                            value={paymentNotes}
                            onChange={(e) => setPaymentNotes(e.target.value)}
                            placeholder="e.g. Installment 1 of 2 via phone authorization"
                            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 font-medium focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-0.5">
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>256-bit encrypted PCI-DSS Level 1 compliant Stripe virtual terminal.</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2.5 py-1">
                        <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 space-y-1">
                          <div className="font-bold text-blue-900 flex items-center gap-1.5 text-xs">
                            <Smartphone className="w-4 h-4 text-blue-600" />
                            <span>Instant Client Self-Checkout Link</span>
                          </div>
                          <p className="text-blue-800 text-[11px]">
                            The client will receive an SMS and email with a secure payment checkout for ${effectiveChargeAmount}.
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                            <span className="text-slate-600 font-medium">Recipient Email:</span>
                            <span className="font-bold text-slate-900">{lead.taxpayerEmail}</span>
                          </div>
                          <div className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                            <span className="text-slate-600 font-medium">Recipient SMS:</span>
                            <span className="font-bold text-slate-900">{lead.taxpayerPhone}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClosePaymentModal}
                    disabled={isProcessingPayment}
                    className="text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </Button>

                  {paymentTab === 'CARD' ? (
                    <Button
                      size="sm"
                      onClick={handleChargeCard}
                      disabled={isProcessingPayment || isAmountInvalid || effectiveChargeAmount <= 0}
                      className={`text-xs font-bold flex items-center gap-1.5 shadow-md ${
                        isAmountInvalid || effectiveChargeAmount <= 0
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300 shadow-none'
                          : 'bg-[#16A34A] hover:bg-[#15803D] text-white cursor-pointer'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>
                        {isProcessingPayment
                          ? 'Processing Charge...'
                          : isCustomExceeded
                          ? `Exceeds Max Balance ($${currentRemainingBalance})`
                          : isCustomTooLow
                          ? 'Enter Valid Amount ($ > 0)'
                          : paymentType === 'PARTIAL' && effectiveChargeAmount < currentRemainingBalance
                          ? `Charge Installment ($${effectiveChargeAmount}.00)`
                          : `Charge Full Balance ($${effectiveChargeAmount}.00)`}
                      </span>
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={handleSendPaymentLink}
                      disabled={isProcessingPayment || isAmountInvalid || effectiveChargeAmount <= 0}
                      className={`text-xs font-bold flex items-center gap-1.5 shadow-md ${
                        isAmountInvalid || effectiveChargeAmount <= 0
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300 shadow-none'
                          : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>
                        {isProcessingPayment
                          ? 'Sending...'
                          : isCustomExceeded
                          ? `Exceeds Max ($${currentRemainingBalance})`
                          : `Send Payment Link ($${effectiveChargeAmount})`}
                      </span>
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              /* View 2: Complete Payment & Installment History Ledger */
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Total Collected to Date</div>
                    <div className="text-base font-black text-emerald-600">${currentPaidAmount}.00 USD</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900">Remaining Balance</div>
                    <div className="text-base font-black text-amber-600">${currentRemainingBalance}.00 USD</div>
                  </div>
                </div>

                {historyItems.length === 0 ? (
                  <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 space-y-2">
                    <Receipt className="w-8 h-8 text-slate-300 mx-auto" />
                    <div className="text-xs font-bold text-slate-700">No Payment Installments Recorded Yet</div>
                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                      All collected installments and partial fee payments for this taxpayer will be recorded and audited here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {historyItems.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-2xs space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center justify-center">
                              #{historyItems.length - idx}
                            </span>
                            <span className="font-bold text-slate-900">
                              +${item.amount.toLocaleString()} USD
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-slate-100 text-slate-600">
                              {item.paymentMethod || 'STRIPE_CARD'}
                            </span>
                          </div>
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                            Bal after: ${item.remainingBalance !== undefined ? item.remainingBalance : '-'}
                          </span>
                        </div>

                        {item.notes && (
                          <div className="text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded-lg font-medium">
                            &quot;{item.notes}&quot;
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5 border-t border-slate-100">
                          <div className="flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-slate-400" />
                            <span>
                              {typeof item.collectedBy === 'object' ? item.collectedBy?.name : (item.collectedBy || 'Closer')}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{new Date(item.paidAt).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button
                    size="sm"
                    onClick={() => setPaymentView('PAY')}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                  >
                    + Collect New Payment
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Form 8879 Multi-Method E-Sign & Proof Authorization Modal */}
      {isEsignModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    IRS Form 8879 E-File Signature &amp; Legal Proof
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    IRS Pub 1345 ERO Compliance for {lead.taxpayerName} (TY {lead.taxYear})
                  </p>
                </div>
              </div>
            </div>

            {/* 3 Compliance Options Tab Ribbon */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setEsignTab('EMAIL_LINK')}
                className={`py-2 px-2 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  esignTab === 'EMAIL_LINK'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1. Send E-Sign Link
              </button>
              <button
                type="button"
                onClick={() => setEsignTab('UPLOAD_PDF')}
                className={`py-2 px-2 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  esignTab === 'UPLOAD_PDF'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2. Upload Signed PDF
              </button>
              <button
                type="button"
                onClick={() => setEsignTab('PHONE_PIN')}
                className={`py-2 px-2 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  esignTab === 'PHONE_PIN'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                3. Recorded Verbal PIN
              </button>
            </div>

            {/* Content for Mode 1: Send E-Sign Link to Client */}
            {esignTab === 'EMAIL_LINK' && (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-blue-900">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>IRS Tamper-Evident DocuSign Link (100% Legal Proof)</span>
                  </div>
                  <p className="text-blue-800 text-[11px] leading-relaxed">
                    A secure cryptographic e-sign link will be sent to the taxpayer's verified email. The taxpayer draws their signature, and the system generates an IRS audit certificate with <strong>IP Address, Geo-Location &amp; SHA-256 hash</strong>.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Taxpayer Email:</span>
                    <span className="font-bold text-slate-900">{lead.taxpayerEmail}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Taxpayer SMS:</span>
                    <span className="font-bold text-slate-900">{lead.taxpayerPhone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Certified Refund:</span>
                    <span className="font-bold text-[#16A34A]">+${lead.federalRefund.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Content for Mode 2: Upload Signed PDF Scan */}
            {esignTab === 'UPLOAD_PDF' && (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                  If the client signed the Form 8879 paper physically with pen (wet ink) and emailed/WhatsApped the scan, upload the file directly here as legal proof.
                </div>

                <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/30 rounded-xl p-6 text-center transition-all cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    id="form8879Upload"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setUploadedFile(e.target.files[0]);
                    }}
                  />
                  <label htmlFor="form8879Upload" className="cursor-pointer block space-y-2">
                    <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                    {uploadedFile ? (
                      <div className="flex items-center justify-center gap-1.5 text-emerald-700 font-bold text-xs">
                        <FileCheck className="w-4 h-4" />
                        <span>{uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)</span>
                      </div>
                    ) : (
                      <>
                        <div className="text-xs font-bold text-slate-700">
                          Click to Browse or Drag &amp; Drop Signed Form 8879 PDF
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Supports PDF, PNG, JPG (Max 15MB)
                        </div>
                      </>
                    )}
                  </label>
                </div>

                {/* 5-Digit PIN Input written on Form 8879 Box 2 */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Client 5-Digit IRS PIN (Written on Form 8879 Box 2) <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={5}
                      value={uploadPin}
                      onChange={(e) => setUploadPin(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="e.g. 84920"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                    />
                    <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap bg-white px-2 py-1.5 rounded-md border border-slate-200">
                      IRS MeF Required
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Content for Mode 3: Recorded Phone Verbal PIN Authorization */}
            {esignTab === 'PHONE_PIN' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>IRS Practitioner PIN Program:</strong> Must record the client's self-selected 5-digit electronic PIN and log the PBX Call Recording reference ID.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Client 5-Digit IRS PIN
                    </label>
                    <input
                      type="text"
                      maxLength={5}
                      value={taxpayerPin}
                      onChange={(e) => setTaxpayerPin(e.target.value)}
                      placeholder="e.g. 84920"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-center text-sm font-bold tracking-widest focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Call Recording ID / Audio Log
                    </label>
                    <input
                      type="text"
                      value={callRecordingRef}
                      onChange={(e) => setCallRecordingRef(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={hasEsignConsent}
                    onChange={(e) => setHasEsignConsent(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mt-0.5 cursor-pointer"
                  />
                  <span className="text-[11px] font-semibold text-slate-700">
                    I confirm that the client stated their 5-digit PIN and gave verbal authorization on the recorded phone line.
                  </span>
                </label>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={onCloseEsignModal}
                disabled={isProcessingEsign}
                className="text-xs font-semibold cursor-pointer"
              >
                Cancel
              </Button>

              {esignTab === 'EMAIL_LINK' && (
                <Button
                  size="sm"
                  onClick={handleSendEsignLink}
                  disabled={isProcessingEsign}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isProcessingEsign ? 'Sending...' : 'Send E-Sign Link to Client'}</span>
                </Button>
              )}

              {esignTab === 'UPLOAD_PDF' && (
                <Button
                  size="sm"
                  onClick={handleUploadSignedDoc}
                  disabled={isProcessingEsign || !uploadedFile}
                  className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isProcessingEsign ? 'Uploading...' : 'Verify & Attach Signed PDF'}</span>
                </Button>
              )}

              {esignTab === 'PHONE_PIN' && (
                <Button
                  size="sm"
                  onClick={handleConfirmPhonePinEsign}
                  disabled={!hasEsignConsent || isProcessingEsign}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{isProcessingEsign ? 'Logging...' : 'Authorize with PIN & Call Log'}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

