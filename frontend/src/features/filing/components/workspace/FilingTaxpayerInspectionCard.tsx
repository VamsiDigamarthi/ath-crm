import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Building2, 
  FileText, 
  CheckCircle2, 
  DollarSign, 
  ShieldCheck,
  Eye
} from 'lucide-react';
import { AppCopyButton } from '@/shared/components/AppCopyButton';
import { FilingDocumentPreviewModal } from './FilingDocumentPreviewModal';
import type { FilingLeadItem, FilingSourceDoc } from '../../types/filing.types';

export interface FilingTaxpayerInspectionCardProps {
  lead: FilingLeadItem;
}

export const FilingTaxpayerInspectionCard: React.FC<FilingTaxpayerInspectionCardProps> = ({ lead }) => {
  const [selectedDoc, setSelectedDoc] = useState<FilingSourceDoc | null>(null);

  const profile = lead.customerProfile || {
    fullName: lead.taxpayerName || '-',
    email: lead.taxpayerEmail || '-',
    phone: lead.taxpayerPhone || '-',
    ssnMasked: lead.ssnMasked || '-',
    dob: '-',
    visaType: lead.visaType || '-',
    filingStatus: lead.filingStatus || '-',
    address: '-',
    city: '-',
    state: lead.stateOfResidence || '-',
    zipCode: '-',
  };

  const returnSummary = lead.taxReturnSummary || {
    w2Wages: 0,
    federalWithheld: 0,
    standardDeduction: 0,
    taxableIncome: 0,
    totalFederalTax: 0,
    federalRefund: lead.federalRefund ?? 0,
    federalBalanceDue: lead.federalBalanceDue ?? 0,
    stateWages: 0,
    stateWithheld: 0,
    stateTaxLiability: 0,
    stateRefund: lead.stateRefund ?? 0,
    stateBalanceDue: lead.stateBalanceDue ?? 0,
    qaAuditorName: '-',
  };

  const bank = lead.bankDirectDeposit || {
    bankName: '-',
    accountType: '-',
    routingNumber: '-',
    accountNumberMasked: '-',
  };

  const docs: FilingSourceDoc[] = lead.sourceDocuments || [
    {
      id: 'doc-w2',
      title: 'W-2 Wage & Tax Statement (2025)',
      type: 'W-2',
      issuer: 'Global Tech Inc (EIN: 12-3456789)',
      status: 'VERIFIED',
      verifiedAt: '2026-08-15',
    },
    {
      id: 'doc-1040',
      title: 'Form 1040 Tax Return (Certified)',
      type: 'FORM_1040',
      issuer: 'TaxCRM CPA Prep Board',
      status: 'AUDITED',
      verifiedAt: '2026-08-20',
    },
    {
      id: 'doc-8879',
      title: 'Form 8879 E-File PIN Authorization',
      type: 'FORM_8879',
      issuer: `Taxpayer Self-Signed (PIN: ${lead.taxpayerPin || '84920'})`,
      status: 'SIGNED',
      verifiedAt: '2026-08-28',
    },
    {
      id: 'doc-fee',
      title: 'Service Fee Cleared Receipt #INV-2026-089',
      type: 'INVOICE',
      issuer: 'Stripe Gateway ($227.00 Paid)',
      status: 'CLEARED',
      verifiedAt: '2026-08-28',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-6 p-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center border border-emerald-200">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Taxpayer Pre-Transmission Audit File
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Verified identity, certified Form 1040 figures, bank direct deposit routing, and source documents.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ERO Certified (EFIN: 582910)</span>
          </span>
        </div>
      </div>

      {/* Grid: 3 Main Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Col 1: Personal & Residency Profile (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              Taxpayer Identity Profile
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {profile.visaType}
            </span>
          </div>

          <div className="space-y-2">
            <div>
              <div className="font-bold text-sm text-slate-900">{profile.fullName}</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                Filing Status: <span className="font-bold text-slate-700">{profile.filingStatus}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">SSN (Masked)</span>
                <span className="font-mono font-bold text-slate-800 text-xs">{profile.ssnMasked}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">Date of Birth</span>
                <span className="font-medium text-slate-700 text-xs">{profile.dob}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 space-y-1.5 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span className="leading-tight">
                  {profile.address}, {profile.city}, {profile.state} {profile.zipCode}
                </span>
              </div>
              <div className="flex items-center justify-between gap-1 pt-1">
                <div className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{profile.email}</span>
                </div>
                <AppCopyButton text={profile.email} size="sm" />
              </div>
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{profile.phone}</span>
                </div>
                <AppCopyButton text={profile.phone} size="sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Col 2: Certified 1040 Calculation & Refund Breakdown (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                Certified 1040 Figures (TY{lead.taxYear})
              </span>
              <span className="text-[10px] font-semibold text-slate-500">
                Audited by {returnSummary.qaAuditorName}
              </span>
            </div>

            {/* Income line items */}
            <div className="divide-y divide-slate-200/60 text-xs py-1 space-y-1">
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Gross W-2 Wages (Box 1):</span>
                <span className="font-bold text-slate-900">${returnSummary.w2Wages.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Federal Tax Withheld (Box 2):</span>
                <span className="font-bold text-blue-700">${returnSummary.federalWithheld.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Standard Deduction (TY{lead.taxYear}):</span>
                <span className="font-medium text-slate-700">-${returnSummary.standardDeduction.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Taxable Income &amp; Tax:</span>
                <span className="font-medium text-slate-700">${returnSummary.taxableIncome.toLocaleString()} (${returnSummary.totalFederalTax.toLocaleString()} tax)</span>
              </div>
            </div>
          </div>

          {/* Refund / Balance Due Callouts */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
            {returnSummary.federalBalanceDue > 0 ? (
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                <span className="text-[10px] text-amber-800 font-bold block uppercase tracking-wider">
                  Federal Balance Due
                </span>
                <span className="text-base font-black text-amber-700 block mt-0.5">
                  -${returnSummary.federalBalanceDue.toLocaleString()}.00
                </span>
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] text-emerald-800 font-bold block uppercase tracking-wider">
                  Federal 1040 Refund
                </span>
                <span className="text-base font-black text-[#16A34A] block mt-0.5">
                  +${returnSummary.federalRefund.toLocaleString()}.00
                </span>
              </div>
            )}

            {returnSummary.stateBalanceDue > 0 ? (
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                <span className="text-[10px] text-amber-800 font-bold block uppercase tracking-wider">
                  {lead.stateOfResidence} State Balance Due
                </span>
                <span className="text-base font-black text-amber-700 block mt-0.5">
                  -${returnSummary.stateBalanceDue.toLocaleString()}.00
                </span>
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] text-emerald-800 font-bold block uppercase tracking-wider">
                  {lead.stateOfResidence} State Refund
                </span>
                <span className="text-base font-black text-[#16A34A] block mt-0.5">
                  +${returnSummary.stateRefund.toLocaleString()}.00
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Col 3: Direct Deposit Bank Details & Form 8879 (3 Cols) */}
        <div className="lg:col-span-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                {returnSummary.federalBalanceDue > 0 ? 'Direct Debit / Bank Account' : 'Refund Direct Deposit'}
              </span>
              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                returnSummary.federalBalanceDue > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {returnSummary.federalBalanceDue > 0 ? 'IRS Direct Debit' : 'IRS Direct Pay'}
              </span>
            </div>

            <div className="space-y-2 pt-1 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">Bank Institution</span>
                <span className="font-bold text-slate-900 text-xs">{bank.bankName}</span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">Routing Number (ABA)</span>
                  <span className="font-mono font-bold text-slate-800 text-xs">{bank.routingNumber}</span>
                </div>
                <AppCopyButton text={bank.routingNumber} size="sm" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">Account ({bank.accountType})</span>
                  <span className="font-mono font-bold text-slate-800 text-xs">{bank.accountNumberMasked}</span>
                </div>
                <AppCopyButton text={bank.accountNumberMasked} size="sm" />
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-blue-50/80 border border-blue-200 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-900">Form 8879 Authorization</span>
              <span className="text-[10px] font-bold text-blue-700">✓ Signed</span>
            </div>
            <div className="text-[11px] text-blue-800 font-mono font-semibold">
              Taxpayer Self-PIN: {lead.taxpayerPin || '84920'}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Verified Source Documents Audit */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            Verified Source Documents Checklist (Audit Trail)
          </span>
          <span className="text-[11px] text-[#16A34A] font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            All {docs.length} Vault Documents Verified &amp; Cleared
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="p-3 rounded-xl bg-slate-50/60 border border-slate-200/80 flex items-center justify-between gap-2 hover:bg-slate-100/80 transition-all shadow-2xs"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-slate-900 truncate">
                    {doc.title}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    {doc.type}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">
                  {doc.issuer}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedDoc(doc)}
                  className="px-2.5 py-1.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 cursor-pointer text-[10px] font-bold flex items-center gap-1 shadow-2xs transition-all"
                  title="View Document Details & Download"
                >
                  <Eye className="w-3 h-3" />
                  <span>View</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Document Preview Modal */}
      <FilingDocumentPreviewModal
        doc={selectedDoc}
        lead={lead}
        onClose={() => setSelectedDoc(null)}
      />
    </div>
  );
};
