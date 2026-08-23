import React from 'react';
import { 
  User, 
  Users, 
  Globe, 
  FileSpreadsheet, 
  Landmark, 
  TrendingUp, 
  ShieldCheck, 
  Receipt, 
  Building2, 
  CheckCircle2, 
  Clock, 
  Sparkles
} from 'lucide-react';

interface TaxPrepOrganizerReviewProps {
  customerName: string;
  taxDraftSummary?: any;
}

export const TaxPrepOrganizerReview: React.FC<TaxPrepOrganizerReviewProps> = ({
  customerName,
  taxDraftSummary,
}) => {
  const organizer = taxDraftSummary?.organizer || {};

  const m1 = organizer.m1_demographics;
  const m2 = organizer.m2_dependents;
  const m3 = organizer.m3_presence;
  const m4 = organizer.m4_wages;
  const m5 = organizer.m5_interest;
  const m6 = organizer.m6_stocks;
  const m7 = organizer.m7_foreign;
  const m8 = organizer.m8_deductions;
  const m9 = organizer.m9_directDeposit;

  // Helper to format values strictly from user data without faking placeholders
  const valOrNone = (val: string | number | null | undefined, prefix = '', suffix = '') => {
    if (val === null || val === undefined || val === '' || Number.isNaN(val)) {
      return { text: 'Not Provided', isFilled: false };
    }
    if (typeof val === 'number') {
      return { text: `${prefix}${val.toLocaleString()}${suffix}`, isFilled: true };
    }
    const trimmed = val.trim();
    if (!trimmed) return { text: 'Not Provided', isFilled: false };
    return { text: `${prefix}${trimmed}${suffix}`, isFilled: true };
  };

  // 1. Module 1: Personal Demographics (4 inputs on customer side)
  const m1Filled = Boolean(m1?.fullName || m1?.filingStatus);
  const m1Location = [m1?.city, m1?.state].filter(Boolean).join(', ');

  // 2. Module 2: Spouse & Daycare (2 inputs on customer side)
  const m2ChildCount = m2?.childCount !== undefined && m2?.childCount !== null ? Number(m2.childCount) : null;
  const m2Daycare = m2?.daycareAmount !== undefined && m2?.daycareAmount !== null && m2?.daycareAmount !== '' ? Number(m2.daycareAmount) : null;
  const m2Filled = Boolean(m2ChildCount !== null || m2Daycare !== null);

  // 3. Module 3: Substantial Presence & States (3 inputs on customer side)
  const m3Days2025 = m3?.days2025 !== undefined && m3?.days2025 !== null && m3?.days2025 !== '' ? Number(m3.days2025) : null;
  const m3Days2024 = m3?.days2024 !== undefined && m3?.days2024 !== null && m3?.days2024 !== '' ? Number(m3.days2024) : null;
  const m3Days2023 = m3?.days2023 !== undefined && m3?.days2023 !== null && m3?.days2023 !== '' ? Number(m3.days2023) : null;
  const m3Filled = Boolean(m3Days2025 !== null || m3Days2024 !== null || m3Days2023 !== null);

  // 4. Module 4: Wages (2 inputs on customer side)
  const m4Employer = m4?.employerName?.trim() || null;
  const m4Wages = m4?.estimatedWages !== undefined && m4?.estimatedWages !== null && m4?.estimatedWages !== '' ? Number(m4.estimatedWages) : null;
  const m4Filled = Boolean(m4Employer || m4Wages !== null);

  // 5. Module 5: 1099 Interest & Dividends (2 inputs on customer side)
  const m5Bank = m5?.bankName?.trim() || null;
  const m5Interest = m5?.interestAmount !== undefined && m5?.interestAmount !== null && m5?.interestAmount !== '' ? Number(m5.interestAmount) : null;
  const m5Filled = Boolean(m5Bank || m5Interest !== null);

  // 6. Module 6: 1099-B Stocks & RSUs (1 checkbox + 2 inputs on customer side)
  const m6Traded = Boolean(m6?.tradedStocks);
  const m6Broker = m6?.brokerName?.trim() || null;
  const m6Gains = m6?.totalCapitalGain !== undefined && m6?.totalCapitalGain !== null && m6?.totalCapitalGain !== '' ? Number(m6.totalCapitalGain) : null;
  const m6Filled = Boolean(m6Traded || m6Broker || m6Gains !== null);

  // 7. Module 7: Foreign & FBAR (1 checkbox + 2 inputs on customer side)
  const m7Fbar = Boolean(m7?.hasFbar);
  const m7Bank = m7?.indianBankName?.trim() || null;
  const m7Peak = m7?.peakBalanceInr !== undefined && m7?.peakBalanceInr !== null && m7?.peakBalanceInr !== '' ? Number(m7.peakBalanceInr) : null;
  const m7Filled = Boolean(m7Fbar || m7Bank || m7Peak !== null);

  // 8. Module 8: Deductions & Credits (2 inputs on customer side)
  const m8Hsa = m8?.hsaContribution !== undefined && m8?.hsaContribution !== null && m8?.hsaContribution !== '' ? Number(m8.hsaContribution) : null;
  const m8Loan = m8?.studentLoanInterest !== undefined && m8?.studentLoanInterest !== null && m8?.studentLoanInterest !== '' ? Number(m8.studentLoanInterest) : null;
  const m8Filled = Boolean(m8Hsa !== null || m8Loan !== null);

  // 9. Module 9: Bank Direct Deposit (4 inputs on customer side)
  const m9Bank = m9?.bankName?.trim() || null;
  const m9Type = m9?.accountType?.trim() || null;
  const m9Routing = m9?.routingNumber?.trim() || null;
  const m9Account = m9?.accountNumber?.trim() || null;
  const m9Filled = Boolean(m9Bank || m9Routing || m9Account);

  const modules = [
    {
      id: 'm1',
      number: 1,
      title: '1. Personal Info, Visa & Marriage',
      icon: User,
      isCompleted: m1Filled,
      statusBadge: m1Filled ? (m1?.filingStatus || 'Demographics Saved') : 'Pending Intake',
      badgeColor: m1Filled ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-500 border-slate-200',
      fields: [
        { label: 'Primary Taxpayer Legal Name', ...valOrNone(m1?.fullName || customerName) },
        { label: 'Social Security Number (SSN)', ...valOrNone(m1?.ssnMasked) },
        { label: 'Filing / Marital Status', ...valOrNone(m1?.maritalStatus || m1?.filingStatus) },
        { label: 'Date of Marriage', ...valOrNone(m1?.dateOfMarriage) },
        { label: 'VISA Type as of 12/31/2025', ...valOrNone(m1?.visaType) },
        { label: 'VISA Status Changed in 2025', ...valOrNone(m1?.visaStatusChanged2025) },
        { label: 'First Port of Entry in U.S.', ...valOrNone(m1?.firstPortOfEntryDate) },
        { label: 'Residential City & State', ...valOrNone(m1Location) },
      ],
    },
    {
      id: 'm2',
      number: 2,
      title: '2. Spouse, Dependents & Daycare',
      icon: Users,
      isCompleted: m2Filled,
      statusBadge: m2Filled ? `${m2ChildCount ?? 0} Dependent(s)` : 'Pending Intake',
      badgeColor: m2Filled ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200',
      fields: [
        { label: 'Spouse Legal Name', ...valOrNone(m2?.spouseName) },
        { label: 'Number of Qualifying Dependents', ...valOrNone(m2ChildCount) },
        { label: 'Daycare Annual Paid', ...valOrNone(m2Daycare, '$') },
        { label: 'Daycare Provider Name / EIN', ...valOrNone(m2?.daycareProviderName || m2?.daycareProviderEin) },
      ],
    },
    {
      id: 'm3',
      number: 3,
      title: '3. Substantial Presence & Multi-State',
      icon: Globe,
      isCompleted: m3Filled,
      statusBadge: m3Filled ? `${m3Days2025 ?? 365} Days in US` : 'Pending Intake',
      badgeColor: m3Filled ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-slate-100 text-slate-500 border-slate-200',
      fields: [
        { label: 'TY 2025 Days in U.S.', ...valOrNone(m3Days2025, '', ' Days') },
        { label: 'TY 2024 Days in U.S.', ...valOrNone(m3Days2024, '', ' Days') },
        { label: 'TY 2023 Days in U.S.', ...valOrNone(m3Days2023, '', ' Days') },
        { label: 'City / County Tax Required', text: m3?.cityCountyTaxesRequired ? 'Yes (Local Return)' : 'No', isFilled: true },
      ],
    },
    {
      id: 'm4',
      number: 4,
      title: '4. W-2 Wages & Rental Properties',
      icon: FileSpreadsheet,
      isCompleted: m4Filled,
      statusBadge: m4Filled ? (m4Employer || 'Wages Reported') : 'Pending Intake',
      badgeColor: m4Filled ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-slate-100 text-slate-500 border-slate-200',
      fields: [
        { label: 'Primary Employer Name', ...valOrNone(m4Employer) },
        { label: 'Estimated Total Annual Wages', ...valOrNone(m4Wages, '$') },
        { label: 'Rental Properties Count', ...valOrNone(m4?.rentalProperties?.length || 0, '', ' Property(s)') },
      ],
    },
    {
      id: 'm5',
      number: 5,
      title: '5. 1099-INT / 1099-DIV Interest',
      icon: Landmark,
      isCompleted: m5Filled,
      statusBadge: m5Filled ? (m5Bank || `$${m5Interest?.toLocaleString()}`) : 'Pending Intake',
      badgeColor: m5Filled ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-slate-100 text-slate-500 border-slate-200',
      fields: [
        { label: '1099-INT High-Yield Bank Name', ...valOrNone(m5Bank) },
        { label: '1099-INT Interest Amount', ...valOrNone(m5Interest, '$') },
        { label: '1099-DIV Dividend Amount', ...valOrNone(m5?.dividendAmount, '$') },
      ],
    },
    {
      id: 'm6',
      number: 6,
      title: '6. 1099-B Stocks, ESPP, RSU & Losses',
      icon: TrendingUp,
      isCompleted: m6Filled,
      statusBadge: m6Filled ? (m6Traded ? (m6Broker || 'Traded Stocks') : 'No Stocks Traded') : 'Pending Intake',
      badgeColor: m6Filled ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-100 text-slate-500 border-slate-200',
      fields: [
        { label: 'Traded US Stocks / Crypto', text: m6Traded ? 'Yes (Traded)' : (m6Filled ? 'No' : 'Not Provided'), isFilled: m6Filled },
        ...(m6Traded ? [
          { label: 'Brokerage Platform Name', ...valOrNone(m6Broker) },
          { label: 'Capital Gain in 2025', ...valOrNone(m6Gains, '$') },
          { label: 'Loss Carryforward 2023/24', ...valOrNone(m6?.capitalLossCarryforward2023_2024 || m6?.lossCarryforward, '$') },
        ] : []),
      ],
    },
    {
      id: 'm7',
      number: 7,
      title: '7. FBAR / FATCA & Indian Income (INR)',
      icon: ShieldCheck,
      isCompleted: m7Filled,
      statusBadge: m7Filled ? (m7Fbar ? 'FBAR Applicable' : 'No Foreign Accounts >$10k') : 'Pending Intake',
      badgeColor: m7Filled ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-100 text-slate-500 border-slate-200',
      fields: [
        { label: 'Indian Bank Balances > $10,000', text: m7Fbar ? 'Yes (FBAR FinCEN 114)' : (m7Filled ? 'No' : 'Not Provided'), isFilled: m7Filled },
        { label: 'Indian Interest Income (INR)', ...valOrNone(m7?.foreignInterestInr, '₹') },
        { label: 'Indian Rental / Dividend (INR)', ...valOrNone(m7?.foreignRentalInr || m7?.foreignDividendInr, '₹') },
        { label: 'Foreign Tax Paid / TDS (INR)', ...valOrNone(m7?.foreignTaxesPaidInr, '₹') },
      ],
    },
    {
      id: 'm8',
      number: 8,
      title: '8. Itemized Deductions & Solar Energy',
      icon: Receipt,
      isCompleted: m8Filled,
      statusBadge: m8Filled ? (m8Hsa ? `HSA $${m8Hsa.toLocaleString()}` : 'Deductions Logged') : 'Pending Intake',
      badgeColor: m8Filled ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200',
      fields: [
        { label: 'Form 1098 Mortgage Interest', ...valOrNone(m8?.mortgageInterest1098, '$') },
        { label: 'US Property Taxes Paid', ...valOrNone(m8?.propertyTaxesUs, '$') },
        { label: 'India Property Taxes Paid', ...valOrNone(m8?.propertyTaxesIndia, '$') },
        { label: 'HSA Annual Contribution (8889)', ...valOrNone(m8Hsa, '$') },
        { label: 'Clean Energy Equipment Cost', ...valOrNone(m8?.cleanEnergyCost, '$') },
      ],
    },
    {
      id: 'm9',
      number: 9,
      title: '9. Direct Deposit & $10 Referrals',
      icon: Building2,
      isCompleted: m9Filled,
      statusBadge: m9Filled ? (m9Bank || 'Direct Deposit Set') : 'Pending Intake',
      badgeColor: m9Filled ? 'bg-cyan-50 text-cyan-700 border-cyan-200' : 'bg-slate-100 text-slate-500 border-slate-200',
      fields: [
        { label: 'Bank Name', ...valOrNone(m9Bank) },
        { label: 'Account Type', ...valOrNone(m9Type) },
        { label: '9-Digit Routing Number', ...valOrNone(m9Routing) },
        { label: 'Account Number', text: m9Account ? `•••• ${m9Account.slice(-4)}` : 'Not Provided', isFilled: Boolean(m9Account) },
        { label: 'Notes to Tax Preparer', ...valOrNone(m9?.notesToPreparer) },
        { label: 'Paid Referrals Provided', ...valOrNone(m9?.referrals?.length || 0, '', ' Contact(s)') },
      ],
    },
  ];

  const completedCount = modules.filter((m) => m.isCompleted).length;

  return (
    <div className="space-y-4 font-sans">
      {/* Top Notice Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="font-medium">
            <strong>9-Module Intake Live Checklist</strong> — Live taxpayer organizer response synced directly from {customerName}'s portal.
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
          {completedCount} of 9 Modules Completed by Taxpayer
        </span>
      </div>

      {/* Uniform Clean 3x3 Grid with 1:1 Matching Customer Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {modules.map((mod) => {
          const Icon = mod.icon;

          return (
            <div
              key={mod.id}
              className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between gap-3 min-h-[160px]"
            >
              {/* Header: Icon + Exact Title + Real Verification Indicator */}
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      mod.isCompleted ? 'bg-emerald-50 text-[#16A34A] border border-emerald-100' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 truncate">
                      {mod.title}
                    </h5>
                  </div>

                  <div className="shrink-0">
                    {mod.isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                <div className="pt-2">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${mod.badgeColor}`}>
                    {mod.statusBadge}
                  </span>
                </div>
              </div>

              {/* Exact Matching Fields: Real Value in Bold or 'Not Provided' in Muted Grey */}
              <div className="space-y-1 text-[11px] pt-2 border-t border-slate-100">
                {mod.fields.map((f, i) => (
                  <div key={i} className="flex justify-between items-center gap-2">
                    <span className="text-slate-500 text-[10px] font-medium truncate max-w-[140px]" title={f.label}>
                      {f.label}:
                    </span>
                    <span className={`text-[11px] text-right truncate max-w-[130px] ${
                      f.isFilled ? 'text-slate-900 font-bold' : 'text-slate-400 font-normal italic'
                    }`} title={f.text}>
                      {f.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
