import React, { useRef } from 'react';
import { Printer, Copy, Check } from 'lucide-react';
import { AppModal } from '@/shared/components/AppModal';
import { Button } from '@/shared/components/Button';
import toast from 'react-hot-toast';

interface TaxOrganizerDocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizerData: any;
  taxYear: number;
  customerName: string;
  filingType?: string;
  leadId?: string;
}

export const TaxOrganizerDocumentPreviewModal: React.FC<TaxOrganizerDocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  organizerData,
  taxYear,
  customerName,
  filingType = 'INDIVIDUAL',
  leadId,
}) => {
  const [copied, setCopied] = React.useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const org = organizerData || {};
  const isBusiness = filingType?.toUpperCase() === 'BUSINESS';

  // Individual data slices
  const m1 = org.m1_demographics || {};
  const m2 = org.m2_dependents || {};
  const m3 = org.m3_presence || {};
  const m4 = org.m4_wages || {};
  const m5 = org.m5_interest || {};
  const m10 = org.m10_retirement || {};
  const m6 = org.m6_stocks || {};
  const m7 = org.m7_foreign || {};
  const m8 = org.m8_deductions || {};
  const m9 = org.m9_directDeposit || {};

  // Business data slices
  const b1 = org.b1_companyInfo || {};
  const b2 = org.b2_businessIncome || {};
  const b3 = org.b3_businessExpenses || {};

  const handleCopyText = () => {
    if (!printRef.current) return;
    const text = printRef.current.innerText;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Document text copied to clipboard! 📋');
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Tax Organizer Client Intake — Document Preview"
      subtitle={`Formatted intake worksheet for TY ${taxYear} (${filingType})`}
      size="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-slate-500 font-medium hidden sm:block">
            Staff Confidential Intake Record • ATH Tax Consulting Services LLC
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyText}
              className="text-xs flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print / Save PDF</span>
            </Button>
            <Button
              size="sm"
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-900 text-white text-xs cursor-pointer px-4"
            >
              Close Preview
            </Button>
          </div>
        </div>
      }
    >
      <div className="bg-slate-100/80 p-2 sm:p-6 rounded-lg overflow-y-auto">
        {/* Word Document Sheet Container */}
        <div
          ref={printRef}
          className="bg-white text-slate-900 shadow-md border border-slate-300 rounded-sm p-6 sm:p-12 max-w-4xl mx-auto space-y-8 font-sans leading-relaxed text-xs"
          style={{ minHeight: '800px' }}
        >
          {/* 1. Formal Letterhead & Header */}
          <div className="border-b-2 border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-950">
                ATH Tax Consulting Services LLC
              </h1>
              <p className="text-[11px] text-slate-600 font-medium">
                Cross-Border US Tax Advisory • IRS Authorized e-File Provider
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Client Intake Worksheet &amp; Dual-Review Preparation Summary
              </p>
            </div>
            <div className="sm:text-right font-sans text-[11px] space-y-0.5">
              <div>
                <span className="text-slate-500">Document Ref: </span>
                <span className="font-bold text-slate-900">INTAKE-TY{taxYear}-{leadId ? leadId.substring(0, 8) : 'RECORD'}</span>
              </div>
              <div>
                <span className="text-slate-500">Tax Year: </span>
                <span className="font-bold text-emerald-800">TY {taxYear}</span>
              </div>
              <div>
                <span className="text-slate-500">Filing Type: </span>
                <span className="font-bold text-slate-900">{filingType}</span>
              </div>
              <div>
                <span className="text-slate-500">Date Generated: </span>
                <span className="text-slate-700">{todayStr}</span>
              </div>
            </div>
          </div>

          {/* Business Document Content */}
          {isBusiness ? (
            <div className="space-y-6">
              {/* Section 1: Business Profile */}
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-wide border-b border-slate-300 pb-1 mb-3">
                  1.0 Company Profile &amp; Formation Details
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                  <div><span className="font-semibold text-slate-700">Legal Business Name:</span> {b1.businessName || customerName || '—'}</div>
                  <div><span className="font-semibold text-slate-700">Trade Name (DBA):</span> {b1.dbaName || '—'}</div>
                  <div><span className="font-semibold text-slate-700">EIN (Employer ID):</span> {b1.ein || '—'}</div>
                  <div><span className="font-semibold text-slate-700">Entity Structure:</span> {b1.entityType || '—'}</div>
                  <div><span className="font-semibold text-slate-700">Formation Date:</span> {b1.incorporationDate || '—'}</div>
                  <div><span className="font-semibold text-slate-700">Formation State:</span> {b1.stateOfIncorporation || b1.state || '—'}</div>
                  <div><span className="font-semibold text-slate-700">Accounting Method:</span> {b1.accountingMethod || 'Cash'}</div>
                  <div><span className="font-semibold text-slate-700">Filed Prior Year Return?</span> {b1.filedPriorYearReturn || 'No'}</div>
                  <div className="sm:col-span-2">
                    <span className="font-semibold text-slate-700">Business Address:</span> {[b1.address, b1.suite, b1.city, b1.state, b1.zipCode].filter(Boolean).join(', ') || '—'}
                  </div>
                  <div><span className="font-semibold text-slate-700">Authorized Contact:</span> {b1.contactName || '—'} ({b1.contactRole || 'Owner'})</div>
                  <div><span className="font-semibold text-slate-700">Contact Email / Phone:</span> {b1.contactEmail || '—'} / {b1.contactPhone || '—'}</div>
                </div>
              </div>

              {/* Section 2: Partners & Shareholders */}
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-wide border-b border-slate-300 pb-1 mb-3">
                  2.0 Partners, Members &amp; Shareholders (Schedule K-1)
                </h2>
                {Array.isArray(b1.partners) && b1.partners.length > 0 ? (
                  <table className="w-full border border-slate-300 text-left">
                    <thead className="bg-slate-100 font-bold border-b border-slate-300">
                      <tr>
                        <th className="p-2 border-r border-slate-300">#</th>
                        <th className="p-2 border-r border-slate-300">Partner Legal Name</th>
                        <th className="p-2 border-r border-slate-300">SSN / ITIN / EIN</th>
                        <th className="p-2 border-r border-slate-300">Ownership %</th>
                        <th className="p-2 border-r border-slate-300">Role / Title</th>
                        <th className="p-2">Address</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {b1.partners.map((p: any, idx: number) => (
                        <tr key={idx}>
                          <td className="p-2 border-r border-slate-300 font-semibold">{idx + 1}</td>
                          <td className="p-2 border-r border-slate-300 font-semibold">{p.name || '—'}</td>
                          <td className="p-2 border-r border-slate-300">{p.ssnTin || '—'}</td>
                          <td className="p-2 border-r border-slate-300">{p.ownershipPercentage ? `${p.ownershipPercentage}%` : '—'}</td>
                          <td className="p-2 border-r border-slate-300">{p.role || 'Member'}</td>
                          <td className="p-2">{p.address || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-slate-500 italic">No partners or additional members recorded.</p>
                )}
              </div>

              {/* Section 3: Revenue & Income */}
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-wide border-b border-slate-300 pb-1 mb-3">
                  3.0 Revenue &amp; Gross Receipts
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                  <div><span className="font-semibold text-slate-700">Gross Sales / Receipts:</span> ${Number(b2.grossSalesNot1099 || 0).toLocaleString()}</div>
                  <div><span className="font-semibold text-slate-700">Returns &amp; Allowances:</span> ${Number(b2.returnsAllowances || 0).toLocaleString()}</div>
                  <div><span className="font-semibold text-slate-700">Interest Income:</span> ${Number(b2.interestIncome || 0).toLocaleString()}</div>
                  <div><span className="font-semibold text-slate-700">Other Business Income:</span> ${Number(b2.otherIncomeAmount || 0).toLocaleString()}</div>
                </div>
              </div>

              {/* Section 4: Operating Expenses */}
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-wide border-b border-slate-300 pb-1 mb-3">
                  4.0 Operating Expenses &amp; Deductions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2">
                  <div><span className="font-semibold text-slate-700">Officer Compensation:</span> ${Number(b3.officerCompensation || 0).toLocaleString()}</div>
                  <div><span className="font-semibold text-slate-700">Employee Wages:</span> ${Number(b3.employeeWages || 0).toLocaleString()}</div>
                  <div><span className="font-semibold text-slate-700">Contractor Payments (1099):</span> ${Number(b3.contractorPayments || 0).toLocaleString()}</div>
                  <div><span className="font-semibold text-slate-700">Commercial Rent:</span> ${Number(b3.rentProperty || 0).toLocaleString()}</div>
                  <div><span className="font-semibold text-slate-700">Advertising &amp; Marketing:</span> ${Number(b3.advertisingMarketing || 0).toLocaleString()}</div>
                  <div><span className="font-semibold text-slate-700">Legal &amp; Professional Fees:</span> ${Number(b3.legalProfessionalFees || 0).toLocaleString()}</div>
                  <div><span className="font-semibold text-slate-700">Office Supplies:</span> ${Number(b3.officeSupplies || 0).toLocaleString()}</div>
                  <div><span className="font-semibold text-slate-700">Insurance &amp; Utilities:</span> ${Number(b3.insurance || 0).toLocaleString()}</div>
                  <div><span className="font-semibold text-slate-700">Cost of Goods Sold (COGS):</span> ${Number(b3.cogsAmount || 0).toLocaleString()}</div>
                </div>
              </div>
            </div>
          ) : (
            /* Individual Document Content */
            <div className="space-y-6">
              {/* Section 1: Demographics */}
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-wide border-b border-slate-300 pb-1 mb-3">
                  1.0 Primary Taxpayer Identification &amp; Demographics
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                  <div><span className="font-semibold text-slate-700">Full Legal Name:</span> {m1.fullName || [m1.firstName, m1.middleName, m1.lastName].filter(Boolean).join(' ') || customerName}</div>
                  <div><span className="font-semibold text-slate-700">SSN / ITIN:</span> {m1.ssnMasked || '***-**-****'}</div>
                  <div><span className="font-semibold text-slate-700">Date of Birth:</span> {m1.dob || '—'}</div>
                  <div><span className="font-semibold text-slate-700">Occupation:</span> {m1.occupation || '—'}</div>
                  <div><span className="font-semibold text-slate-700">Mobile Phone:</span> {m1.phone || '—'}</div>
                  <div><span className="font-semibold text-slate-700">Work Phone:</span> {m1.workPhone || '—'}</div>
                  <div><span className="font-semibold text-slate-700">Email Address:</span> {m1.email || '—'}</div>
                  <div><span className="font-semibold text-slate-700">Marital / Filing Status:</span> {m1.maritalStatus || 'Single'}</div>
                  {m1.maritalStatus?.includes('Married') && (
                    <div><span className="font-semibold text-slate-700">Date of Marriage:</span> {m1.dateOfMarriage || '—'}</div>
                  )}
                  {m1.maritalStatus === 'Widowed' && (
                    <div><span className="font-semibold text-slate-700">Spouse Date of Death:</span> {m1.spouseDateOfDeath || '—'}</div>
                  )}
                  <div><span className="font-semibold text-slate-700">VISA Type as of Dec 31:</span> {m1.visaType || '—'}</div>
                  <div><span className="font-semibold text-slate-700">First US Port of Entry:</span> {m1.firstPortOfEntryDate || '—'}</div>
                  <div><span className="font-semibold text-slate-700">Months in US (TY {taxYear}):</span> {m1.monthsStayedInUs2025 ?? '12'}</div>
                  <div className="sm:col-span-2">
                    <span className="font-semibold text-slate-700">Residential Address:</span> {[m1.residentialAddress, m1.city, m1.state, m1.zipCode].filter(Boolean).join(', ') || '—'}
                  </div>
                </div>
              </div>

              {/* Section 2: Spouse & Dependents */}
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-wide border-b border-slate-300 pb-1 mb-3">
                  2.0 Spouse, Dependents &amp; Childcare Expenses
                </h2>
                {m1.maritalStatus?.includes('Married') && (
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded mb-3 space-y-1">
                    <div className="font-bold text-slate-800">Spouse Information</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                      <div><span className="font-semibold text-slate-700">Name:</span> {m2.spouseFirstName || m2.spouseName ? `${m2.spouseFirstName || ''} ${m2.spouseLastName || ''}`.trim() : 'On File'}</div>
                      <div><span className="font-semibold text-slate-700">SSN / ITIN:</span> {m2.spouseSsn || '***-**-****'}</div>
                      <div><span className="font-semibold text-slate-700">Date of Birth:</span> {m2.spouseDob || '—'}</div>
                      <div><span className="font-semibold text-slate-700">Occupation:</span> {m2.spouseOccupation || '—'}</div>
                    </div>
                  </div>
                )}

                {Array.isArray(m2.dependentsList) && m2.dependentsList.length > 0 ? (
                  <table className="w-full border border-slate-300 text-left mb-3">
                    <thead className="bg-slate-100 font-bold border-b border-slate-300">
                      <tr>
                        <th className="p-2 border-r border-slate-300">Dependent Name</th>
                        <th className="p-2 border-r border-slate-300">SSN / ITIN</th>
                        <th className="p-2 border-r border-slate-300">DOB</th>
                        <th className="p-2 border-r border-slate-300">Relationship</th>
                        <th className="p-2">Months in Home</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {m2.dependentsList.map((dep: any, idx: number) => (
                        <tr key={idx}>
                          <td className="p-2 border-r border-slate-300 font-semibold">{dep.firstName} {dep.lastName}</td>
                          <td className="p-2 border-r border-slate-300">{dep.ssn || '—'}</td>
                          <td className="p-2 border-r border-slate-300">{dep.dob || '—'}</td>
                          <td className="p-2 border-r border-slate-300">{dep.relationship || 'Child'}</td>
                          <td className="p-2">{dep.monthsLivedInHome ?? 12}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-slate-500 italic mb-3">No qualifying dependents claimed.</p>
                )}

                {m2.daycareExpensesClaimed && (
                  <div className="bg-slate-50 border border-slate-200 p-2.5 rounded text-[11px]">
                    <span className="font-semibold text-slate-800">Daycare Expenses: </span>
                    Provider: {m2.daycareProviderName || '—'} (EIN: {m2.daycareProviderEin || '—'}) • Paid: ${Number(m2.daycareAmount || 0).toLocaleString()} • Reimbursed: ${Number(m2.employerReimbursedAmount || 0).toLocaleString()}
                  </div>
                )}
              </div>

              {/* Section 3: State Residency & Presence */}
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-wide border-b border-slate-300 pb-1 mb-3">
                  3.0 State Residency History &amp; Substantial Presence
                </h2>
                {Array.isArray(m3.statesResidedHistory) && m3.statesResidedHistory.length > 0 ? (
                  <table className="w-full border border-slate-300 text-left mb-3">
                    <thead className="bg-slate-100 font-bold border-b border-slate-300">
                      <tr>
                        <th className="p-2 border-r border-slate-300 text-center">Tax Year</th>
                        <th className="p-2 border-r border-slate-300">Taxpayer State</th>
                        <th className="p-2 border-r border-slate-300">From Date</th>
                        <th className="p-2 border-r border-slate-300">To Date</th>
                        <th className="p-2 border-r border-slate-300">Spouse State</th>
                        <th className="p-2">Spouse Dates</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {m3.statesResidedHistory.map((s: any, idx: number) => (
                        <tr key={idx}>
                          <td className="p-2 border-r border-slate-300 font-bold text-center">{s.taxYear}</td>
                          <td className="p-2 border-r border-slate-300 font-semibold">{s.state || '—'}</td>
                          <td className="p-2 border-r border-slate-300">{s.fromDate || '—'}</td>
                          <td className="p-2 border-r border-slate-300">{s.toDate || '—'}</td>
                          <td className="p-2 border-r border-slate-300">{s.spouseState || '—'}</td>
                          <td className="p-2">{s.spouseFromDate && s.spouseToDate ? `${s.spouseFromDate} - ${s.spouseToDate}` : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-slate-500 italic mb-3">No state residency rows recorded.</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-200 rounded text-[11px]">
                  <div><span className="font-semibold text-slate-700">TY {taxYear} Physical Days:</span> {m3.days2025 ?? '365'} days</div>
                  <div><span className="font-semibold text-slate-700">TY {taxYear - 1} Physical Days:</span> {m3.days2024 ?? '0'} days</div>
                  <div><span className="font-semibold text-slate-700">TY {taxYear - 2} Physical Days:</span> {m3.days2023 ?? '0'} days</div>
                </div>
              </div>

              {/* Section 4: Income Sources */}
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-wide border-b border-slate-300 pb-1 mb-3">
                  4.0 Gross Income &amp; Schedule Details
                </h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-slate-800 text-[11px] mb-1">W-2 Wage Statements</h3>
                    {Array.isArray(m4.w2List) && m4.w2List.length > 0 ? (
                      <table className="w-full border border-slate-300 text-left">
                        <thead className="bg-slate-100 font-bold border-b border-slate-300">
                          <tr>
                            <th className="p-2 border-r border-slate-300">Employer</th>
                            <th className="p-2 border-r border-slate-300">Box 1 Wages</th>
                            <th className="p-2 border-r border-slate-300">Box 2 Fed Tax</th>
                            <th className="p-2 border-r border-slate-300">State Tax</th>
                            <th className="p-2">Owner</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {m4.w2List.map((w: any, idx: number) => (
                            <tr key={idx}>
                              <td className="p-2 border-r border-slate-300 font-semibold">{w.employerName || '—'}</td>
                              <td className="p-2 border-r border-slate-300 font-semibold">${Number(w.wagesBox1 || 0).toLocaleString()}</td>
                              <td className="p-2 border-r border-slate-300">${Number(w.federalTaxWithheldBox2 || 0).toLocaleString()}</td>
                              <td className="p-2 border-r border-slate-300">${Number(w.stateTaxWithheld || 0).toLocaleString()}</td>
                              <td className="p-2">{w.ownerType || 'Taxpayer'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-slate-500 italic">Primary Employer: {m4.employerName || 'On File'} • Wages: ${Number(m4.estimatedWages || 0).toLocaleString()} • Fed Withheld: ${Number(m4.federalTaxWithheld || 0).toLocaleString()}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3 bg-slate-50 border border-slate-200 rounded">
                    <div>
                      <div className="font-bold text-slate-800 mb-1">1099 Interest &amp; Dividends</div>
                      <div>Interest: ${Number(m5.interestAmount || 0).toLocaleString()} (Fed Withheld: ${Number(m5.interestFedTaxWithheld || 0).toLocaleString()})</div>
                      <div>Dividends: ${Number(m5.dividendAmount || 0).toLocaleString()} (Fed Withheld: ${Number(m5.dividendFedTaxWithheld || 0).toLocaleString()})</div>
                      <div>OID / 1099-OID: ${Number(m5.form1099OidAmount || 0).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 mb-1">Stocks, Crypto &amp; Capital Gains</div>
                      <div>Broker / Platform: {m6.brokerName || '—'}</div>
                      <div>Net Capital Gain / Loss: ${Number(m6.totalCapitalGain || 0).toLocaleString()}</div>
                      <div>ESPP / RSU Reported: {m6.esppRsuReported ? 'Yes' : 'No'}</div>
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 mb-1">Retirement (1099-R / IRA / 401k)</div>
                      <div>Distribution: ${Number(m10.grossDistribution1099R || 0).toLocaleString()}</div>
                      <div>Taxable: ${Number(m10.taxableAmount || 0).toLocaleString()}</div>
                      <div>Fed Withheld: ${Number(m10.federalTaxWithheldBox4 || 0).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 5: Deductions */}
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-wide border-b border-slate-300 pb-1 mb-3">
                  5.0 Deductions &amp; Credits Claimed
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2">
                  <div><span className="font-semibold text-slate-700">Mortgage Interest (1098):</span> ${Number(m8.mortgageInterest1098 || 0).toLocaleString()}</div>
                  <div><span className="font-semibold text-slate-700">US Property Taxes:</span> ${Number(m8.propertyTaxesUs || 0).toLocaleString()}</div>
                  <div><span className="font-semibold text-slate-700">Student Loan Interest:</span> ${Number(m8.studentLoanInterest || 0).toLocaleString()}</div>
                  <div><span className="font-semibold text-slate-700">Charitable Donations:</span> ${Number(m8.charitableDonations || 0).toLocaleString()}</div>
                  <div><span className="font-semibold text-slate-700">HSA Contribution:</span> ${Number(m8.hsaContribution || 0).toLocaleString()}</div>
                  <div><span className="font-semibold text-slate-700">Clean Energy Equipment:</span> ${Number(m8.cleanEnergyCost || 0).toLocaleString()}</div>
                </div>
              </div>

              {/* Section 6: Foreign & FBAR / FATCA */}
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-wide border-b border-slate-300 pb-1 mb-3">
                  6.0 Foreign Accounts &amp; FBAR / FATCA Compliance
                </h2>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2 mb-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div><span className="font-semibold text-slate-700">FBAR Required (&gt;$10k Aggregate Peak):</span> {m7.hasFbarOver10k || 'No'}</div>
                    <div><span className="font-semibold text-slate-700">FATCA Form 8938 Required:</span> {m7.hasFatcaOver50k || 'No'}</div>
                    <div><span className="font-semibold text-slate-700">Indian Salary:</span> ₹{Number(m7.foreignSalaryInr || 0).toLocaleString()}</div>
                    <div><span className="font-semibold text-slate-700">Foreign Interest (NRE/NRO):</span> ₹{Number(m7.foreignInterestInr || 0).toLocaleString()}</div>
                    <div><span className="font-semibold text-slate-700">Foreign Dividends:</span> ₹{Number(m7.foreignDividendInr || 0).toLocaleString()}</div>
                    <div><span className="font-semibold text-slate-700">Foreign Taxes Paid (TDS):</span> ₹{Number(m7.foreignTaxesPaidInr || 0).toLocaleString()}</div>
                  </div>
                </div>

                {Array.isArray(m7.foreignAccountsList) && m7.foreignAccountsList.length > 0 ? (
                  <table className="w-full border border-slate-300 text-left">
                    <thead className="bg-slate-100 font-bold border-b border-slate-300">
                      <tr>
                        <th className="p-2 border-r border-slate-300">Financial Institution</th>
                        <th className="p-2 border-r border-slate-300">Account #</th>
                        <th className="p-2 border-r border-slate-300">Type</th>
                        <th className="p-2 border-r border-slate-300">Owner</th>
                        <th className="p-2 border-r border-slate-300">Peak (INR)</th>
                        <th className="p-2">Est. Peak (USD)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {m7.foreignAccountsList.map((acc: any, idx: number) => (
                        <tr key={idx}>
                          <td className="p-2 border-r border-slate-300 font-semibold">{acc.institutionName || acc.bankName || '—'}</td>
                          <td className="p-2 border-r border-slate-300">{acc.accountNumber || '—'}</td>
                          <td className="p-2 border-r border-slate-300">{acc.accountType || 'SAVINGS'}</td>
                          <td className="p-2 border-r border-slate-300">{acc.ownerType || 'TAXPAYER'}</td>
                          <td className="p-2 border-r border-slate-300 font-semibold">₹{Number(acc.maxValue || acc.maxBalanceInr || 0).toLocaleString()}</td>
                          <td className="p-2 font-semibold text-emerald-800">${Number(acc.maxValueUsd || (acc.maxValue ? Math.round(acc.maxValue / 84) : 0)).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-slate-500 italic">No foreign bank accounts declared.</p>
                )}
              </div>

              {/* Section 7: Bank & Direct Deposit */}
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-wide border-b border-slate-300 pb-1 mb-3">
                  7.0 Refund Direct Deposit &amp; Bank Account
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                  <div><span className="font-semibold text-slate-700">Bank Name:</span> {m9.bankName || '—'}</div>
                  <div><span className="font-semibold text-slate-700">Account Type:</span> {m9.accountType || 'CHECKING'}</div>
                  <div><span className="font-semibold text-slate-700">Routing Number (ABA):</span> {m9.routingNumber || '—'}</div>
                  <div><span className="font-semibold text-slate-700">Account Number:</span> {m9.accountNumber ? `••••${m9.accountNumber.slice(-4)}` : '—'}</div>
                  <div className="sm:col-span-2"><span className="font-semibold text-slate-700">Account Owner Name:</span> {m9.accountOwnerName || m1.fullName || customerName}</div>
                </div>
              </div>
            </div>
          )}

          {/* 3. Formal Sign-Off Footer */}
          <div className="border-t-2 border-slate-800 pt-6 mt-10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[10px] text-slate-500">
              <div>
                <span>Authorized Tax Preparer Sign-Off: __________________________</span>
              </div>
              <div>
                <span>Quality Reviewer Sign-Off: __________________________</span>
              </div>
              <div>
                <span>Date: _______________</span>
              </div>
            </div>
            <p className="text-[9px] text-slate-400 text-center leading-normal">
              Confidential &amp; Proprietary • For Internal Tax Operations &amp; Draft Preparation Only • ATH Tax Services LLC
            </p>
          </div>
        </div>
      </div>
    </AppModal>
  );
};
