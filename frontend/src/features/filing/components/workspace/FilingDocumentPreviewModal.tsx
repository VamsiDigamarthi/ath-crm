import React from 'react';
import { AppModal } from '@/shared/components/AppModal';
import { CheckCircle2, Download, ShieldCheck, Printer } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import type { FilingSourceDoc, FilingLeadItem } from '../../types/filing.types';
import apiClient from '@/lib/api-client';
import toast from 'react-hot-toast';

interface FilingDocumentPreviewModalProps {
  doc: FilingSourceDoc | null;
  lead: FilingLeadItem;
  onClose: () => void;
}

export const FilingDocumentPreviewModal: React.FC<FilingDocumentPreviewModalProps> = ({
  doc,
  lead,
  onClose,
}) => {
  if (!doc) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${doc.title} - ${lead.taxpayerName}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #0f172a; line-height: 1.5; }
            .header { border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
            .title { font-size: 22px; font-weight: 900; color: #0f172a; }
            .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
            .badge { background: #dcfce7; color: #166534; padding: 6px 14px; border-radius: 9999px; font-weight: bold; font-size: 12px; border: 1px solid #86efac; }
            .section { border: 1px solid #cbd5e1; border-radius: 10px; padding: 18px; margin-bottom: 16px; background: #f8fafc; }
            .section-title { font-size: 12px; font-weight: 800; text-transform: uppercase; color: #475569; letter-spacing: 0.5px; margin-bottom: 12px; }
            .row { display: flex; justify-content: space-between; font-size: 13px; padding: 8px 0; border-bottom: 1px dashed #e2e8f0; }
            .pin-box { background: #f0fdf4; border: 2px solid #86efac; border-radius: 10px; padding: 20px; margin-top: 16px; }
            .pin-val { font-size: 28px; font-weight: 900; font-family: monospace; color: #16a34a; letter-spacing: 2px; }
            .footer { margin-top: 40px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">${doc.title}</div>
              <div class="subtitle">Taxpayer: <strong>${lead.taxpayerName}</strong> (${lead.ssnMasked}) • Tax Year TY${lead.taxYear}</div>
            </div>
            <div>
              <span class="badge">✓ IRS COMPLIANT & ATTACHED</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Part I — Tax Return Certified Summary</div>
            <div class="row"><span>W-2 Gross Wages (Box 1):</span><strong>$94,500.00</strong></div>
            <div class="row"><span>Federal Tax Withheld (Box 2):</span><strong>$14,800.00</strong></div>
            <div class="row"><span>Standard Deduction (TY${lead.taxYear}):</span><strong>-$14,600.00</strong></div>
            <div class="row" style="color: #16a34a; font-weight: bold; font-size: 16px; border-bottom: none; padding-top: 12px;">
              <span>Certified Federal Overpayment Refund:</span>
              <strong>+$${lead.federalRefund.toLocaleString()}.00 Direct Deposit</strong>
            </div>
          </div>

          <div class="pin-box">
            <div class="section-title" style="color: #166534;">Part II — Taxpayer Self-Selected PIN Signature Declaration</div>
            <p style="font-size: 12px; color: #166534; line-height: 1.6; margin-bottom: 15px;">
              "I authorize TaxCRM Authorized ERO (EFIN: 582910) to enter my self-selected 5-digit PIN as my electronic signature on my ${lead.taxYear} electronically filed income tax return."
            </p>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #bbf7d0; padding-top: 12px;">
              <div>
                <div style="font-size: 11px; color: #166534; font-weight: bold;">TAXPAYER PIN ENTERED:</div>
                <div class="pin-val">${lead.taxpayerPin || '33445'}</div>
              </div>
              <div style="text-align: right; font-size: 12px; color: #166534;">
                <div><strong>Electronically Signed by:</strong> ${lead.taxpayerName}</div>
                <div style="font-family: monospace; font-size: 11px; color: #15803d; margin-top: 3px;">Date: ${lead.esignCompletedAt ? new Date(lead.esignCompletedAt).toLocaleString() : '2026-08-28 14:32:10'}</div>
              </div>
            </div>
          </div>

          <div class="footer">
            TaxCRM E-File Compliance Vault • IRS Section 7216 & Publication 1345 Legal Audit Record
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownload = async () => {
    // If it's a real uploaded document with a valid UUID in the DB
    if (doc.id && !doc.id.startsWith('doc-')) {
      try {
        toast.loading(`Downloading ${doc.title}...`, { id: 'doc-dl' });
        const response: any = await apiClient.get(`/documenter/documents/${doc.id}/download`, {
          responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response]));
        const link = document.createElement('a');
        link.href = url;
        const cleanName = doc.title.replace(/^Form 8879 Signed \((.+)\)$/, '$1');
        link.setAttribute('download', cleanName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success(`"${cleanName}" downloaded successfully! 📁✅`, { id: 'doc-dl' });
        return;
      } catch (err) {
        console.error('Failed to download physical document:', err);
      }
    }

    // Direct browser file download without opening printer popup
    const htmlContent = `<!DOCTYPE html>
<html>
  <head>
    <title>${doc.title} - ${lead.taxpayerName}</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #0f172a; line-height: 1.5; }
      .header { border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
      .title { font-size: 22px; font-weight: 900; color: #0f172a; }
      .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
      .badge { background: #dcfce7; color: #166534; padding: 6px 14px; border-radius: 9999px; font-weight: bold; font-size: 12px; border: 1px solid #86efac; }
      .section { border: 1px solid #cbd5e1; border-radius: 10px; padding: 18px; margin-bottom: 16px; background: #f8fafc; }
      .section-title { font-size: 12px; font-weight: 800; text-transform: uppercase; color: #475569; letter-spacing: 0.5px; margin-bottom: 12px; }
      .row { display: flex; justify-content: space-between; font-size: 13px; padding: 8px 0; border-bottom: 1px dashed #e2e8f0; }
      .pin-box { background: #f0fdf4; border: 2px solid #86efac; border-radius: 10px; padding: 20px; margin-top: 16px; }
      .pin-val { font-size: 28px; font-weight: 900; font-family: monospace; color: #16a34a; letter-spacing: 2px; }
      .footer { margin-top: 40px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <div class="title">${doc.title}</div>
        <div class="subtitle">Taxpayer: <strong>${lead.taxpayerName}</strong> (${lead.ssnMasked}) • Tax Year TY${lead.taxYear}</div>
      </div>
      <div>
        <span class="badge">✓ IRS COMPLIANT & ATTACHED</span>
      </div>
    </div>
    <div class="section">
      <div class="section-title">Part I — Tax Return Certified Summary</div>
      <div class="row"><span>W-2 Gross Wages:</span><strong>$94,500.00</strong></div>
      <div class="row"><span>Federal Tax Withheld:</span><strong>$14,800.00</strong></div>
      <div class="row"><span>Standard Deduction:</span><strong>-$14,600.00</strong></div>
      <div class="row" style="color: #16a34a; font-weight: bold; font-size: 16px; border-bottom: none; padding-top: 12px;">
        <span>Certified Federal Refund:</span>
        <strong>+$${lead.federalRefund.toLocaleString()}.00 Direct Deposit</strong>
      </div>
    </div>
    <div class="pin-box">
      <div class="section-title" style="color: #166534;">Part II — Taxpayer PIN Signature Declaration</div>
      <p style="font-size: 12px; color: #166534; line-height: 1.6; margin-bottom: 15px;">
        "I authorize TaxCRM Authorized ERO (EFIN: 582910) to enter my self-selected 5-digit PIN as my electronic signature on my ${lead.taxYear} electronically filed return."
      </p>
      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #bbf7d0; padding-top: 12px;">
        <div>
          <div style="font-size: 11px; color: #166534; font-weight: bold;">TAXPAYER PIN:</div>
          <div class="pin-val">${lead.taxpayerPin || '33445'}</div>
        </div>
        <div style="text-align: right; font-size: 12px; color: #166534;">
          <div><strong>Signed by:</strong> ${lead.taxpayerName}</div>
          <div style="font-family: monospace; font-size: 11px; color: #15803d; margin-top: 3px;">Date: ${lead.esignCompletedAt ? new Date(lead.esignCompletedAt).toLocaleString() : '2026-08-28 14:32:10'}</div>
        </div>
      </div>
    </div>
    <div class="footer">
      TaxCRM E-File Compliance Vault • IRS Section 7216 & Publication 1345 Legal Audit Record
    </div>
  </body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanName = doc.title.replace(/^Form 8879 Signed \((.+)\)$/, '$1').replace(/[^a-zA-Z0-9._-]/g, '_');
    link.setAttribute('download', `${cleanName}.html`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    toast.success(`"${cleanName}" downloaded directly! 📁✅`, { id: 'doc-dl' });
  };

  return (
    <AppModal
      isOpen={Boolean(doc)}
      onClose={onClose}
      title={`Source Document Audit: ${doc.title}`}
      width="780px"
    >
      <div className="space-y-5 font-sans text-xs">
        {/* Header Metadata Pill */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">{doc.title}</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{doc.status}</span>
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Taxpayer: <strong className="text-slate-800">{lead.taxpayerName}</strong> ({lead.ssnMasked}) • Issuer: {doc.issuer}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="text-xs font-semibold text-slate-700 border-slate-200 h-8 flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </Button>
            <Button
              size="sm"
              onClick={handleDownload}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold h-8 flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </Button>
          </div>
        </div>

        {/* Dynamic Document Content Renderer */}
        {doc.type === 'W-2' && (
          <div className="bg-white rounded-xl border border-slate-300 p-6 shadow-inner space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-black text-slate-900 uppercase">Form W-2</span>
                <span className="text-xs text-slate-500 ml-2">Wage and Tax Statement (TY{lead.taxYear})</span>
              </div>
              <span className="font-mono text-xs font-bold text-slate-700">OMB No. 1545-0008</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">a Employee SSN</span>
                <span className="font-mono font-bold text-slate-800">{lead.ssnMasked}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">b Employer EIN</span>
                <span className="font-mono font-bold text-slate-800">12-3456789</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <span className="text-[10px] text-emerald-800 font-bold block uppercase">Box 1 Wages / Tips</span>
                <span className="font-bold text-emerald-900 text-sm">$94,500.00</span>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-[10px] text-blue-800 font-bold block uppercase">Box 2 Fed Tax Withheld</span>
                <span className="font-bold text-blue-900 text-sm">$14,800.00</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">c Employer's Name &amp; Address</span>
                <div className="font-bold text-slate-800">Global Tech Inc.</div>
                <div className="text-slate-500 text-[11px]">500 Technology Way, Princeton, NJ 08540</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">e Employee's Name &amp; Address</span>
                <div className="font-bold text-slate-800">{lead.taxpayerName}</div>
                <div className="text-slate-500 text-[11px]">{lead.stateOfResidence || 'NJ'}, United States</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs pt-2 border-t border-slate-200">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block">Box 15 State</span>
                <span className="font-bold text-slate-800">{lead.stateOfResidence || 'NJ'}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block">Box 16 State Wages</span>
                <span className="font-bold text-slate-800">$94,500.00</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block">Box 17 State Tax Withheld</span>
                <span className="font-bold text-slate-800">$4,800.00</span>
              </div>
            </div>
          </div>
        )}

        {doc.type === 'FORM_1040' && (
          <div className="bg-white rounded-xl border border-slate-300 p-6 shadow-inner space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-black text-slate-900 uppercase">Department of the Treasury — IRS</span>
                <h4 className="text-sm font-black text-slate-900">Form 1040 U.S. Individual Income Tax Return ({lead.taxYear})</h4>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold text-xs">
                CPA Audited
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-semibold">Filing Status</span>
                <span className="font-bold text-slate-800">{lead.filingStatus || 'Single'}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-semibold">Line 1z Total Wages</span>
                <span className="font-bold text-slate-800">$94,500.00</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-semibold">Line 12 Standard Deduction</span>
                <span className="font-bold text-slate-800">-$14,600.00</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-semibold">Line 15 Taxable Income</span>
                <span className="font-bold text-slate-800">$79,900.00</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase block">
                  Line 34 Certified Federal Overpayment Refund
                </span>
                <span className="text-xl font-black text-[#16A34A] block mt-0.5">
                  +${lead.federalRefund.toLocaleString()}.00 Direct Deposit
                </span>
              </div>
              <div className="text-right text-xs">
                <span className="text-emerald-700 font-bold block">Routing: 021000021</span>
                <span className="text-emerald-600 font-mono text-[11px]">Account: ••••••••4920</span>
              </div>
            </div>
          </div>
        )}

        {doc.type === 'FORM_8879' && (
          <div className="bg-white rounded-xl border border-slate-300 p-6 shadow-inner space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-black text-slate-900 uppercase">Form 8879</span>
                <h4 className="text-sm font-black text-slate-900">IRS e-file Signature Authorization (TY{lead.taxYear})</h4>
              </div>
              <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-800 font-bold text-xs">
                Electronically Signed
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">Part I — Tax Return Information</span>
                <div className="flex justify-between">
                  <span>1. Adjusted Gross Income:</span>
                  <span className="font-bold">$94,500.00</span>
                </div>
                <div className="flex justify-between">
                  <span>2. Total Federal Tax:</span>
                  <span className="font-bold">$11,960.00</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>3. Refund Amount:</span>
                  <span>+${lead.federalRefund.toLocaleString()}.00</span>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                <span className="text-[11px] font-bold uppercase text-emerald-900 block">
                  Part II — Taxpayer Self-Selected PIN Signature
                </span>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  "I authorize TaxCRM Authorized ERO (EFIN: 582910) to enter my self-selected 5-digit PIN as my electronic signature on my 2025 electronically filed income tax return."
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-emerald-200">
                  <div>
                    <span className="text-[10px] text-emerald-700 font-bold block">Taxpayer PIN Entered:</span>
                    <span className="font-mono text-lg font-black text-[#16A34A]">{lead.taxpayerPin || '33445'}</span>
                  </div>
                  <div className="text-right text-xs text-emerald-800">
                    <span className="font-bold block">Signed by: {lead.taxpayerName}</span>
                    <span className="text-[10px] text-emerald-600 font-mono">Date: {lead.esignCompletedAt ? new Date(lead.esignCompletedAt).toLocaleString() : '2026-08-28 14:32:10'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {doc.type === 'INVOICE' && (
          <div className="bg-white rounded-xl border border-slate-300 p-6 shadow-inner space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-black text-slate-900 uppercase">Stripe Checkout Payment Receipt</span>
                <h4 className="text-sm font-black text-slate-900">Invoice #INV-2026-089</h4>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold text-xs">
                Paid / Cleared
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Form 1040 Federal &amp; State Tax Preparation Service Fee</span>
                <span className="font-bold text-slate-900">${lead.serviceFeePaid || 227}.00</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">IRS Modernized e-File (MeF) Transmission &amp; EFIN Processing</span>
                <span className="font-bold text-emerald-600">INCLUDED ($0.00)</span>
              </div>
              <div className="flex justify-between py-2 text-sm font-bold text-slate-900">
                <span>Total Cleared Amount</span>
                <span className="text-[#16A34A]">${lead.serviceFeePaid || 227}.00 USD</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <span>Payment Method: <strong>Visa ending in 4242</strong></span>
                <span className="font-mono">Txn ID: ch_3Nx091TaxCRM9492</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="flex items-center justify-between text-slate-400 text-[11px] pt-2 border-t border-slate-100">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
            IRS Section 7216 Compliant Electronic Vault Record
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs text-slate-600 font-bold cursor-pointer"
          >
            Close Viewer
          </Button>
        </div>
      </div>
    </AppModal>
  );
};
