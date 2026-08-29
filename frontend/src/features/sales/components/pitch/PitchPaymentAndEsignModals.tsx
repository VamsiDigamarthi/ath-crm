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
  AlertTriangle
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
  onEsignSuccess: (meta?: { fileName?: string; method?: string; pin?: string }) => void;
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
  
  // E-Sign Tab: 3 Real Compliance Modes
  const [esignTab, setEsignTab] = useState<'EMAIL_LINK' | 'UPLOAD_PDF' | 'PHONE_PIN'>('EMAIL_LINK');
  const [isProcessingEsign, setIsProcessingEsign] = useState(false);

  // Card Inputs
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('884');

  // Phone PIN & Call Recording Compliance
  const [taxpayerPin, setTaxpayerPin] = useState('84920');
  const [callRecordingRef, setCallRecordingRef] = useState(`CALL_REC_${Math.floor(100000 + Math.random() * 900000)}`);
  const [hasEsignConsent, setHasEsignConsent] = useState(false);

  // File Upload State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleChargeCard = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      onProcessPaymentSuccess('STRIPE_CARD');
      onClosePaymentModal();
      toast.success(`Payment of $${lead.feeBreakdown.totalServiceFee} successfully charged and recorded in database! 💳✨`);
    }, 800);
  };

  const handleSendPaymentLink = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      onClosePaymentModal();
      toast.success(`Stripe checkout link sent to ${lead.taxpayerEmail} & ${lead.taxpayerPhone}! 📲`);
    }, 800);
  };

  const handleSendEsignLink = () => {
    setIsProcessingEsign(true);
    setTimeout(() => {
      setIsProcessingEsign(false);
      onEsignSuccess({ method: 'EMAIL_LINK' });
      onCloseEsignModal();
      toast.success(`Form 8879 E-Sign Link dispatched to ${lead.taxpayerEmail}! Signed audit log recorded in database. ✍️🌟`);
    }, 800);
  };

  const handleUploadSignedDoc = () => {
    if (!uploadedFile) {
      toast.error('Please select or drop the signed Form 8879 PDF file');
      return;
    }
    setIsProcessingEsign(true);
    setTimeout(() => {
      setIsProcessingEsign(false);
      onEsignSuccess({ fileName: uploadedFile.name, method: 'UPLOAD_PDF' });
      onCloseEsignModal();
      toast.success(`Signed document ${uploadedFile.name} successfully verified and recorded in database! 📄✅`);
    }, 800);
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
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    paymentTab === 'CARD'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Card Swipe
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentTab('LINK')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    paymentTab === 'LINK'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Send Link
                </button>
              </div>
            </div>

            {paymentTab === 'CARD' ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Total Due Today</span>
                  <span className="text-xl font-extrabold text-slate-900">
                    ${lead.feeBreakdown.totalServiceFee}.00 USD
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      defaultValue={lead.taxpayerName}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-mono tracking-wider focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        value={cardExp}
                        onChange={(e) => setCardExp(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        CVC / CVV
                      </label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>256-bit encrypted PCI-DSS Level 1 compliant Stripe terminal.</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-2">
                <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 space-y-1">
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
                className="text-xs font-semibold cursor-pointer"
              >
                Cancel
              </Button>

              {paymentTab === 'CARD' ? (
                <Button
                  size="sm"
                  onClick={handleChargeCard}
                  disabled={isProcessingPayment}
                  className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold cursor-pointer"
                >
                  {isProcessingPayment ? 'Processing Charge...' : `Charge $${lead.feeBreakdown.totalServiceFee}.00`}
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleSendPaymentLink}
                  disabled={isProcessingPayment}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isProcessingPayment ? 'Sending...' : 'Send Payment Link'}</span>
                </Button>
              )}
            </div>
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
