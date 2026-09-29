import React from 'react';
import {
  Clock,
  Globe,
  Landmark,
  ShieldCheck,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import { AppAccordion, AppAccordionItem } from '@/shared/components/AppAccordion';

interface ReviewModule7ForeignProps {
  m7: any;
  selectedTaxYear?: number;
  m1?: any;
  m2?: any;
  b1?: any;
  isSubmitted?: boolean;
}

export const ReviewModule7Foreign: React.FC<ReviewModule7ForeignProps> = ({
  m7,
  selectedTaxYear = 2025,
  m1 = {},
  m2 = {},
  b1,
  isSubmitted = false,
}) => {
  const accountsList = m7.foreignAccountsList || [];

  const val = (v: any) => {
    if (v === null || v === undefined || v === '') return '-';
    return String(v).trim() || '-';
  };

  const valInr = (num: any) => {
    if (num === null || num === undefined || num === '' || isNaN(Number(num))) return '₹ 0';
    return `₹ ${Number(num).toLocaleString('en-IN')}`;
  };

  const valUsd = (inrNum: any) => {
    if (inrNum === null || inrNum === undefined || inrNum === '' || isNaN(Number(inrNum))) return '$0.00';
    const usd = Number(inrNum) / 84;
    return `$${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const isFbarTaxpayer = m7.hasFbar || m7.hasFbarOver10k === 'YES';
  const isFbarSpouse = m7.spouseFbarOver10k === 'YES';
  const isFatcaRequired = m7.needsFatcaFiling === 'YES' || m7.hasFatcaOver50k === 'YES' || m7.spouseFatcaOver50k === 'YES';

  const totalIndianIncomeInr =
    Number(m7.foreignSalaryInr || 0) +
    Number(m7.foreignInterestInr || 0) +
    Number(m7.foreignDividendInr || 0) +
    Number(m7.foreignRentalInr || 0) +
    Number(m7.otherForeignIncomeInr || 0);

  // Filer Information for reviewer
  const taxpayerFirstName = m1.firstName || (m1.fullName ? m1.fullName.split(' ')[0] : '');
  const taxpayerMiddleName = m1.middleName || '';
  const taxpayerLastName = m1.lastName || (m1.fullName ? m1.fullName.split(' ').slice(1).join(' ') : '');
  const taxpayerDob = m1.dob || '-';
  const taxpayerSsn = m1.ssnMasked || '***-**-****';
  const taxpayerEmail = m1.email || '-';
  const taxpayerPhone = m1.phone || '-';
  const taxpayerAddress = [m1.residentialAddress, m1.city, m1.state, m1.zipCode].filter(Boolean).join(', ') || '-';
  const maritalStatus = m1.maritalStatus || 'Single';

  const isMarried = maritalStatus.toLowerCase().includes('married') || m2.hasSpouse || Boolean(m2.spouseName || m2.spouseFirstName);
  const spouseFirstName = m2.spouseFirstName || (m2.spouseName ? m2.spouseName.split(' ')[0] : '');
  const spouseMiddleName = m2.spouseMiddleName || '';
  const spouseLastName = m2.spouseLastName || (m2.spouseName ? m2.spouseName.split(' ').slice(1).join(' ') : '');
  const spouseDob = m2.spouseDob || (isMarried ? 'On file' : 'N/A - Unmarried');
  const spouseSsn = m2.spouseSsn || (isMarried ? '***-**-****' : 'N/A - Unmarried');
  const spouseEmail = m2.spouseEmail || (isMarried ? taxpayerEmail : 'N/A - Unmarried');
  const spousePhone = m2.spouseWorkPhone || (isMarried ? taxpayerPhone : 'N/A - Unmarried');
  const spouseAddress = isMarried ? taxpayerAddress : 'N/A - Unmarried';

  return (
    <div className="space-y-4 font-sans">
      {/* Draft Status Banner if not submitted */}
      {!isSubmitted && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Draft Stage:</strong> Taxpayer has not finalized Module 07 (FBAR &amp; FATCA Compliance) yet.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-200/70 text-amber-800 border border-amber-300 whitespace-nowrap">
            Intake Pending
          </span>
        </div>
      )}

      {/* 1. TOP CLOSABLE ACCORDION: Filer Information (Self & Spouse) */}
      <AppAccordion defaultOpenIndex={0} allowMultiple={true}>
        <AppAccordionItem
          index={0}
          title="Filer Information (Self & Spouse)"
          subtitle="Taxpayer & Spouse identity, SSN/ITIN & address details on file"
          icon={<UserCheck className="w-4 h-4 text-[#16A34A]" />}
          defaultOpen={true}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden bg-white">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5 w-1/3">Particulars</th>
                  <th className="p-2.5 w-1/3 bg-emerald-50/80 text-emerald-950 border-l border-slate-200">
                    Primary Taxpayer (Self)
                  </th>
                  <th className="p-2.5 w-1/3 bg-indigo-50/80 text-indigo-950 border-l border-slate-200">
                    Spouse {isMarried ? '' : '(N/A)'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-2 font-medium text-slate-600">Full Name</td>
                  <td className="p-2 border-l border-slate-100 font-bold text-slate-900">
                    {[taxpayerFirstName, taxpayerMiddleName, taxpayerLastName].filter(Boolean).join(' ') || '-'}
                  </td>
                  <td className="p-2 border-l border-slate-100 font-bold text-slate-800">
                    {isMarried ? [spouseFirstName, spouseMiddleName, spouseLastName].filter(Boolean).join(' ') || '-' : 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium text-slate-600">Date of Birth (MM/DD/YYYY)</td>
                  <td className="p-2 border-l border-slate-100 font-mono text-slate-800">{taxpayerDob}</td>
                  <td className="p-2 border-l border-slate-100 font-mono text-slate-700">{spouseDob}</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium text-slate-600">SSN / ITIN</td>
                  <td className="p-2 border-l border-slate-100 font-mono text-slate-800">{taxpayerSsn}</td>
                  <td className="p-2 border-l border-slate-100 font-mono text-slate-700">{spouseSsn}</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium text-slate-600">Email &amp; Mobile</td>
                  <td className="p-2 border-l border-slate-100 text-slate-800">{taxpayerEmail} • {taxpayerPhone}</td>
                  <td className="p-2 border-l border-slate-100 text-slate-700">{spouseEmail} • {spousePhone}</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium text-slate-600">Residential Address with ZIP</td>
                  <td className="p-2 border-l border-slate-100 text-slate-800">{taxpayerAddress}</td>
                  <td className="p-2 border-l border-slate-100 text-slate-700">{spouseAddress}</td>
                </tr>
              </tbody>
            </table>

            {/* If Business return, show company reference info */}
            {b1 && b1.businessName && (
              <div className="mt-3 p-3 bg-slate-50 rounded-md border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">Business Entity: </span>
                  <span className="text-slate-700">{b1.businessName || 'Registered Business'}</span>
                  {b1.ein && <span className="ml-2 font-mono text-slate-500">(EIN: {b1.ein})</span>}
                </div>
                <span className="text-[11px] text-slate-500">{b1.state || ''} • Form {b1.entityType || '1120-S'}</span>
              </div>
            )}
          </div>
        </AppAccordionItem>
      </AppAccordion>

      {/* 2. 3 Status Badges: Taxpayer FBAR, Spouse FBAR, FATCA Form 8938 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          className={`p-3.5 rounded-xl border space-y-1.5 text-xs shadow-2xs ${
            isFbarTaxpayer ? 'bg-rose-50/60 border-rose-200' : 'bg-emerald-50/60 border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">Taxpayer FBAR 114 ({selectedTaxYear})</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                isFbarTaxpayer ? 'bg-rose-200 text-rose-800 border border-rose-300' : 'bg-emerald-200 text-emerald-800 border border-emerald-300'
              }`}
            >
              {isFbarTaxpayer ? 'FBAR &gt; $10k' : 'Under $10k'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
            {isFbarTaxpayer ? <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" /> : <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />}
            <span>{isFbarTaxpayer ? 'Filing Required (Part II)' : 'Exempt / No Filing'}</span>
          </div>
        </div>

        <div
          className={`p-3.5 rounded-xl border space-y-1.5 text-xs shadow-2xs ${
            isFbarSpouse ? 'bg-rose-50/60 border-rose-200' : 'bg-emerald-50/60 border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">Spouse FBAR 114 ({selectedTaxYear})</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                isFbarSpouse ? 'bg-rose-200 text-rose-800 border border-rose-300' : 'bg-emerald-200 text-emerald-800 border border-emerald-300'
              }`}
            >
              {isFbarSpouse ? 'FBAR &gt; $10k' : 'Under $10k'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
            {isFbarSpouse ? <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" /> : <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />}
            <span>{isFbarSpouse ? 'Spouse Filing Required' : 'Spouse Exempt / No Filing'}</span>
          </div>
        </div>

        <div
          className={`p-3.5 rounded-xl border space-y-1.5 text-xs shadow-2xs ${
            isFatcaRequired ? 'bg-amber-50/70 border-amber-300' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">FATCA Form 8938 ({selectedTaxYear})</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                isFatcaRequired ? 'bg-amber-200 text-amber-900 border border-amber-300' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {isFatcaRequired ? 'FATCA Required' : 'Below Threshold'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
            {isFatcaRequired ? <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" /> : <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0" />}
            <span>{isFatcaRequired ? 'Attach Form 8938 to 1040' : 'Below $50k / $100k Threshold'}</span>
          </div>
        </div>
      </div>

      {/* 3. Foreign Bank Accounts Audit Table */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Landmark className="w-4 h-4 text-emerald-600" />
            <span>Reported Foreign Bank &amp; Demat Accounts ({accountsList.length} Itemized)</span>
          </h5>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            BSA E-Filing Form 114
          </span>
        </div>

        {accountsList.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-400 italic">
            No specific foreign accounts reported by taxpayer.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden bg-white">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">#</th>
                  <th className="p-2.5">Ownership</th>
                  <th className="p-2.5">Institution &amp; Account #</th>
                  <th className="p-2.5">Account Type</th>
                  <th className="p-2.5">Branch &amp; City</th>
                  <th className="p-2.5">Max Value</th>
                  <th className="p-2.5">Est. Peak USD ($)</th>
                  <th className="p-2.5">Interest (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accountsList.map((acc: any, idx: number) => {
                  const curr = acc.currencyType || 'INR';
                  const peakVal = acc.maxValue !== undefined ? acc.maxValue : (acc.maxBalanceInr || 0);
                  const usdVal = acc.maxValueUsd !== undefined ? acc.maxValueUsd : (curr === 'INR' ? Math.round(peakVal / 84) : peakVal);

                  return (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-500">{idx + 1}</td>
                      <td className="p-2.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                          {val(acc.ownerType)}
                        </span>
                        {acc.jointOwnerName && (
                          <span className="block text-[10px] text-indigo-600 font-semibold mt-0.5">
                            Joint: {acc.jointOwnerName} {acc.jointOwnerRelationship ? `(${acc.jointOwnerRelationship})` : ''}
                            {acc.jointOwnerTin ? ` • ${acc.jointOwnerTin}` : ''}
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 font-bold text-indigo-700">
                        {val(acc.institutionName || acc.bankName)}
                        {acc.accountNumber && (
                          <span className="block font-mono font-normal text-[11px] text-slate-500">
                            ••••{acc.accountNumber.slice(-4)}
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 font-medium text-slate-700">
                        {val(acc.accountType).replace(/_/g, ' ')}
                        {acc.otherAccountTypeDesc && <span className="block text-[10px] text-slate-400">({acc.otherAccountTypeDesc})</span>}
                      </td>
                      <td className="p-2.5 text-slate-600 text-[11px]">
                        <div>{val(acc.city || acc.accountCity || '-')} {acc.state ? `, ${acc.state}` : ''}</div>
                        {acc.branchAddress && (
                          <span className="block text-[10px] text-slate-400 truncate max-w-[150px]" title={acc.branchAddress}>
                            {acc.branchAddress}
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 font-extrabold text-emerald-700">
                        {curr === 'INR' ? valInr(peakVal) : `${curr} ${Number(peakVal).toLocaleString()}`}
                      </td>
                      <td className="p-2.5 font-semibold text-slate-800">
                        ${Number(usdVal).toLocaleString()}
                      </td>
                      <td className="p-2.5 text-slate-700 font-mono">
                        {valInr(acc.interestEarned || acc.interestEarnedInr)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Global Foreign Indian Income Breakdown */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-indigo-600" />
            <span>Global Foreign Indian Income Breakdown</span>
          </h5>
          <span className="text-xs font-extrabold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
            Total Indian Income: <span className="text-indigo-700 font-bold">{valInr(totalIndianIncomeInr)}</span> ({valUsd(totalIndianIncomeInr)})
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Indian Salary</span>
            <div className="text-sm font-extrabold text-slate-900">{valInr(m7.foreignSalaryInr)}</div>
            <span className="text-[10px] text-slate-400">{valUsd(m7.foreignSalaryInr)}</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Interest (NRE/NRO)</span>
            <div className="text-sm font-extrabold text-slate-900">{valInr(m7.foreignInterestInr)}</div>
            <span className="text-[10px] text-slate-400">{valUsd(m7.foreignInterestInr)}</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Dividends</span>
            <div className="text-sm font-extrabold text-slate-900">{valInr(m7.foreignDividendInr)}</div>
            <span className="text-[10px] text-slate-400">{valUsd(m7.foreignDividendInr)}</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Rental Income</span>
            <div className="text-sm font-extrabold text-slate-900">{valInr(m7.foreignRentalInr)}</div>
            <span className="text-[10px] text-slate-400">{valUsd(m7.foreignRentalInr)}</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Other Foreign</span>
            <div className="text-sm font-extrabold text-slate-900">{valInr(m7.otherForeignIncomeInr)}</div>
            <span className="text-[10px] text-slate-500 truncate block">{val(m7.otherForeignIncomeSource)}</span>
          </div>

          <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 space-y-1">
            <span className="text-[10px] font-bold text-purple-800 uppercase block">Indian TDS (FTC)</span>
            <div className="text-sm font-extrabold text-purple-800">{valInr(m7.foreignTaxesPaidInr)}</div>
            <span className="text-[10px] text-purple-600 font-semibold">Form 1116 Credit</span>
          </div>
        </div>
      </div>

      {/* 5. Notes to Tax Preparer */}
      {m7.notesToPreparer && (
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
          <span className="font-bold text-slate-800 uppercase tracking-wider block">Notes from Taxpayer:</span>
          <p className="text-slate-700 whitespace-pre-wrap">{m7.notesToPreparer}</p>
        </div>
      )}
    </div>
  );
};
