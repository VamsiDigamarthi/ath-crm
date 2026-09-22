import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  ChevronDown, 
  ChevronUp, 
  Sparkles
} from 'lucide-react';
import apiClient from '@/lib/api-client';
import toast from 'react-hot-toast';
import { AppCopyButton } from '@/shared/components/AppCopyButton';
import { Button } from '@/shared/components/Button';
import type { WorkspaceTaxpayer, WorkspaceAssignedReviewer, WorkspaceDocument } from '../../hooks/useTaxPreparerWorkspace';

interface ClientProfilePanelProps {
  taxpayer: WorkspaceTaxpayer | null;
  assignedReviewer: WorkspaceAssignedReviewer | null;
  documents: WorkspaceDocument[];
  standardDeductionAmount: number;
  taxDraftSummary?: any;
  onPreviewDoc: (doc: WorkspaceDocument) => void;
  onOpenOrganizerModal?: () => void;
  onApplyValue?: (field: string, value: number) => void;
  drakeTaxComponent?: React.ReactNode;
}

export const ClientProfilePanel: React.FC<ClientProfilePanelProps> = ({
  taxpayer,
  assignedReviewer,
  documents,
  standardDeductionAmount,
  taxDraftSummary,
  onPreviewDoc,
  onOpenOrganizerModal,
  onApplyValue,
  drakeTaxComponent,
}) => {
  const reviewerName = assignedReviewer?.name || '-';
  const reviewerEmail = assignedReviewer?.email || '-';

  // Extract organizer data from taxDraftSummary or defaults
  const organizer = taxDraftSummary?.organizer || taxDraftSummary?.organizerData || {};
  const submittedModules: string[] = Array.isArray(organizer.submittedModules) ? organizer.submittedModules : [];

  const m1 = organizer.m1_demographics || {};
  const m2 = organizer.m2_dependents || {};
  const m3 = organizer.m3_presence || {};
  const m4 = organizer.m4_wages || {};
  const m5 = organizer.m5_interest || {};
  const m6 = organizer.m6_stocks || {};
  const m7 = organizer.m7_foreign || {};
  const m8 = organizer.m8_deductions || {};
  const m9 = organizer.m9_directDeposit || {};

  // Track sensitive information visibility
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({});
  const toggleSensitive = (key: string) => {
    setShowSensitive((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Track accordion open modules (Default open M1, M4)
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({
    m1: true,
    m4: true,
    m2: false,
    m3: false,
    m5: false,
    m6: false,
    m7: false,
    m8: false,
    m9: false,
  });

  const toggleModule = (id: string) => {
    setOpenModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExpandAll = (expand: boolean) => {
    setOpenModules({
      m1: expand,
      m2: expand,
      m3: expand,
      m4: expand,
      m5: expand,
      m6: expand,
      m7: expand,
      m8: expand,
      m9: expand,
    });
  };

  const handleDirectOpenNewTab = async (e: React.MouseEvent, doc: WorkspaceDocument) => {
    e.stopPropagation();
    const url = doc.fileUrl || (doc as any).filePath;
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      window.open(url, '_blank');
      return;
    }
    try {
      toast.loading(`Opening ${doc.fileName}...`, { id: 'direct-open' });
      const response: any = await apiClient.get(`/prep-review/documents/${doc.id}/download`, {
        responseType: 'blob',
      });
      const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(doc.fileName);
      const isPdf = /\.pdf$/i.test(doc.fileName);
      const mimeType = isImage ? 'image/jpeg' : isPdf ? 'application/pdf' : 'application/octet-stream';
      const blob = new Blob([response], { type: mimeType });
      const fileUrl = URL.createObjectURL(blob);
      window.open(fileUrl, '_blank');
      toast.success('Opened in new tab', { id: 'direct-open' });
    } catch {
      toast.error('Failed to open document in new tab', { id: 'direct-open' });
    }
  };

  // Helper formatting functions
  const val = (v: any) => {
    if (v === null || v === undefined || String(v).trim() === '') return '-';
    return String(v).trim();
  };

  const parseNum = (v: any): number | null => {
    if (v === null || v === undefined || v === '' || isNaN(Number(v))) return null;
    return Number(v);
  };

  const formatCurrency = (num: number | null | undefined): string => {
    if (num === null || num === undefined) return '-';
    return `$${num.toLocaleString('en-US')}`;
  };

  // Real Data Extraction - Module 1
  const taxpayerFullName = m1.fullName || [m1.firstName, m1.middleName, m1.lastName].filter(Boolean).join(' ') || taxpayer?.name || '-';
  const taxpayerSSN = m1.ssn || m1.ssnMasked || taxpayer?.ssnMasked || '';
  const taxpayerDOB = m1.dob || '-';
  const taxpayerOccupation = m1.occupation || '-';
  const taxpayerVisa = m1.visaType || taxpayer?.visaType || '-';
  const taxpayerFilingStatus = m1.maritalStatus || taxpayer?.maritalStatus || '-';
  const taxpayerAddress = m1.streetAddress 
    ? `${m1.streetAddress}${m1.aptSuite ? ', ' + m1.aptSuite : ''}, ${m1.city || ''}, ${m1.state || ''} ${m1.zipCode || ''}`.trim()
    : (taxpayer?.city ? `${taxpayer.city}, ${taxpayer.state || ''}` : '-');

  const isM1Provided = Boolean(m1.firstName || m1.lastName || m1.fullName || m1.ssn || m1.dob || m1.streetAddress || taxpayer?.name);

  // Real Data Extraction - Module 2
  const hasSpouse = Boolean(m2.spouseName || m2.spouseFirstName || m2.spouseLastName || m2.spouseSsn || taxpayerFilingStatus.toLowerCase().includes('joint'));
  const spouseFullName = m2.spouseName || [m2.spouseFirstName, m2.spouseLastName].filter(Boolean).join(' ') || (hasSpouse ? '-' : 'N/A (Single/Individual)');
  const spouseSSN = m2.spouseSsn || m2.spouseSsnMasked || '-';
  const spouseVisa = m2.spouseVisaType || '-';
  const dependentsList: any[] = Array.isArray(m2.dependents) ? m2.dependents : (Array.isArray(m2.dependentsList) ? m2.dependentsList : []);
  const isM2Provided = Boolean(m2.spouseFirstName || m2.spouseName || dependentsList.length > 0 || submittedModules.includes('m2'));

  // Real Data Extraction - Module 3
  const days2025 = parseNum(m3.daysInUs2025);
  const days2024 = parseNum(m3.daysInUs2024);
  const days2023 = parseNum(m3.daysInUs2023);
  const hasSptDays = days2025 !== null;
  const weightedDays = hasSptDays ? ((days2025 || 0) + ((days2024 || 0) / 3) + ((days2023 || 0) / 6)).toFixed(2) : null;
  const sptStatus = m3.residencyStatus || (weightedDays && Number(weightedDays) >= 183 ? 'Form 1040 Resident Alien' : (hasSptDays ? 'Form 1040-NR Non-Resident Alien' : 'Not Calculated / Pending Intake'));
  const isM3Provided = Boolean(hasSptDays || m3.residencyStatus || submittedModules.includes('m3'));

  // Real Data Extraction - Module 4
  const employerName = m4.employerName || m4.w2Entries?.[0]?.employerName || null;
  const employerEin = m4.employerEin || m4.w2Entries?.[0]?.ein || null;
  const w2Wages = parseNum(m4.estimatedWages ?? m4.w2Wages ?? m4.w2Entries?.[0]?.wages ?? taxDraftSummary?.w2Wages);
  const fedWithheld = parseNum(m4.fedWithholding ?? m4.w2Entries?.[0]?.fedWithholding ?? taxDraftSummary?.fedWithheld);
  const stateWithheld = parseNum(m4.stateWithholding ?? m4.w2Entries?.[0]?.stateWithholding ?? taxDraftSummary?.stateWithheld);
  const stateWages = parseNum(m4.stateWages ?? m4.w2Entries?.[0]?.stateWages ?? w2Wages);
  const rentalList = Array.isArray(m4.rentalProperties) ? m4.rentalProperties : [];
  const isM4Provided = Boolean(employerName || (w2Wages !== null && w2Wages > 0) || rentalList.length > 0 || submittedModules.includes('m4'));

  // Real Data Extraction - Module 5
  const interestBank = m5.bankName || m5.payerName || m5.institutionName || null;
  const taxableInterest = parseNum(m5.interestAmount ?? m5.totalInterest ?? taxDraftSummary?.taxableInterest);
  const dividendAmount = parseNum(m5.dividendAmount ?? m5.ordinaryDividends ?? taxDraftSummary?.dividends);
  const isM5Provided = Boolean(interestBank || (taxableInterest !== null && taxableInterest > 0) || (dividendAmount !== null && dividendAmount > 0) || submittedModules.includes('m5'));

  // Real Data Extraction - Module 6
  const brokerageName = (Array.isArray(m6.stocksList) && m6.stocksList.length > 0)
    ? m6.stocksList.map((s: any) => s.brokerageName || s.broker).filter(Boolean).join(', ')
    : (m6.brokerageName || m6.brokerName || null);
  const capitalGains = parseNum(m6.capitalGainTaxpayer ?? m6.totalCapitalGain ?? m6.netGains ?? taxDraftSummary?.capitalGains);
  const capitalLosses = parseNum(m6.capitalLossTaxpayer ?? m6.capitalLoss2025 ?? m6.totalCapitalLoss);
  const netGains = (capitalGains !== null || capitalLosses !== null) ? ((capitalGains || 0) - (capitalLosses || 0)) : null;
  const isM6Provided = Boolean(brokerageName || (capitalGains !== null && capitalGains > 0) || (capitalLosses !== null && capitalLosses > 0) || submittedModules.includes('m6'));

  // Real Data Extraction - Module 7
  const foreignAccountsList = Array.isArray(m7.foreignAccountsList) ? m7.foreignAccountsList : (Array.isArray(m7.accounts) ? m7.accounts : []);
  const maxForeignValueInr = parseNum(m7.maxAggregateValueInr ?? m7.maxAggregateValue);
  const maxForeignValueUsd = maxForeignValueInr !== null ? Math.round(maxForeignValueInr / 84) : parseNum(m7.maxAggregateValueUsd);
  const isFbarRequired = m7.hasFbarOver10k === 'YES' || (maxForeignValueUsd !== null && maxForeignValueUsd > 10000) || m7.hasFbar === true;
  const isM7Provided = Boolean(foreignAccountsList.length > 0 || maxForeignValueInr !== null || m7.hasForeignAccounts !== undefined || submittedModules.includes('m7'));

  // Real Data Extraction - Module 8
  const mortgageInterest = parseNum(m8.mortgageInterestTaxpayer ?? m8.mortgageInterest1098 ?? m8.mortgageInterest);
  const propertyTaxes = parseNum(m8.propertyTaxesUsTaxpayer ?? m8.propertyTaxesUs ?? m8.stateLocalTaxes ?? m8.realEstateTaxes);
  const medicalExpenses = parseNum(m8.medicalExpensesTaxpayer ?? m8.medicalExpenses);
  const charityAmount = Array.isArray(m8.charitableList) && m8.charitableList.length > 0
    ? m8.charitableList.reduce((sum: number, c: any) => sum + Number(c.amountDonated || 0), 0)
    : parseNum(m8.charitableDonations ?? m8.charitableCash);
  const totalItemizedSum = (mortgageInterest || 0) + (propertyTaxes || 0) + (medicalExpenses || 0) + (charityAmount || 0);
  const isM8Provided = Boolean(totalItemizedSum > 0 || Array.isArray(m8.rentDeductionsList) || submittedModules.includes('m8'));

  // Real Data Extraction - Module 9
  const bankName = m9.bankName || null;
  const accountType = m9.accountType || null;
  const routingNumber = m9.routingNumber || null;
  const accountNumber = m9.accountNumber || null;
  const isM9Provided = Boolean(bankName || routingNumber || accountNumber || submittedModules.includes('m9'));

  return (
    <div className="space-y-4 font-sans">
      {/* 1. Designated 4-Eyes Compliance Auditor */}
      <div className="bg-gradient-to-br from-purple-50 via-white to-slate-50 p-4 sm:p-5 rounded-xl border border-purple-200 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-4 h-4 text-purple-600" />
          <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">
            Designated 4-Eyes QA Auditor
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
            {reviewerName !== '-' ? reviewerName.charAt(0).toUpperCase() : 'Q'}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-slate-900 truncate">{reviewerName}</div>
            <div className="text-xs text-slate-500 font-medium truncate">{reviewerEmail}</div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-purple-100 flex items-center justify-between text-[11px] text-purple-700 font-medium">
          <span>Compliance Reviewer</span>
          <span className="font-bold">4-Eyes Sign-Off Authority</span>
        </div>
      </div>

      {/* 2. Source Documents Vault */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
            <FileText className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Verified Source Documents</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#16A34A] border border-emerald-200">
            {documents.filter((d) => d.verificationStatus === 'VERIFIED').length}/{documents.length} Verified
          </span>
        </div>

        {documents.length === 0 ? (
          <div className="p-3 text-center text-xs text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
            No source documents uploaded for this tax application.
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                onClick={() => onPreviewDoc(doc)}
                className="group p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-2xs transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 group-hover:scale-105 transition-transform">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                      {doc.fileName || doc.category || '-'}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      Category: <strong className="text-slate-600">{doc.category || '-'}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    title="Open document in new browser tab"
                    onClick={(e) => handleDirectOpenNewTab(e, doc)}
                    className="p-1 rounded-md hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      doc.verificationStatus === 'VERIFIED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {doc.verificationStatus || 'PENDING'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2.5 Drake Tax Software Calculation & Return File */}
      {drakeTaxComponent}

      {/* 3. FULL 9-MODULE INTAKE & ORGANIZER EXPLORER */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Header with Quick Actions */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h4 className="font-bold text-xs sm:text-sm text-white tracking-tight">
                Tax Organizer Dossier
              </h4>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Live organizer responses submitted by client &amp; verified on call.
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => handleExpandAll(true)}
              className="text-[10px] font-bold px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              Expand All
            </button>
            <button
              type="button"
              onClick={() => handleExpandAll(false)}
              className="text-[10px] font-bold px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              Collapse All
            </button>
            {onOpenOrganizerModal && (
              <Button
                size="sm"
                onClick={onOpenOrganizerModal}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold h-7 px-2.5 flex items-center gap-1 shadow-xs cursor-pointer ml-1"
                title="Open full-screen tax organizer audit form"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Full Modal</span>
              </Button>
            )}
          </div>
        </div>

        {/* Accordion Modules List */}
        <div className="divide-y divide-slate-100 text-xs">
          {/* Module 1: Personal Info, Visa & Demographics */}
          <div className="bg-white">
            <button
              type="button"
              onClick={() => toggleModule('m1')}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-6 h-6 rounded-md font-bold flex items-center justify-center shrink-0 text-xs border ${
                  isM1Provided ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  1
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-slate-900 block truncate">
                    Personal Info, Visa &amp; Address
                  </span>
                  <span className="text-[10px] text-slate-500 truncate block">
                    {taxpayerFullName} • {taxpayerVisa} • {taxpayerFilingStatus}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  isM1Provided ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {isM1Provided ? 'Provided' : 'Pending'}
                </span>
                {openModules.m1 ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </button>

            {openModules.m1 && (
              <div className="p-3.5 bg-slate-50/60 border-t border-slate-100 space-y-2.5 text-xs animate-in fade-in duration-150">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">Legal Full Name</span>
                    <span className="font-bold text-slate-900">{taxpayerFullName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">SSN / ITIN</span>
                    <div className="flex items-center gap-1 font-bold text-slate-900">
                      <span>
                        {showSensitive.m1_ssn 
                          ? (taxpayerSSN || '-') 
                          : (taxpayerSSN ? (taxpayerSSN.includes('••') || taxpayerSSN.includes('**') ? taxpayerSSN : `••••••-${taxpayerSSN.slice(-4)}`) : '-')}
                      </span>
                      {taxpayerSSN && (
                        <>
                          <button
                            type="button"
                            onClick={() => toggleSensitive('m1_ssn')}
                            className="text-slate-400 hover:text-slate-600 p-0.5"
                          >
                            {showSensitive.m1_ssn ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                          <AppCopyButton text={taxpayerSSN} size="sm" />
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">Date of Birth</span>
                    <span className="font-bold text-slate-900">{val(taxpayerDOB)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">Occupation</span>
                    <span className="font-bold text-slate-900">{val(taxpayerOccupation)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">VISA Status (12/31/2025)</span>
                    <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 inline-block">
                      {val(taxpayerVisa)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">First US Entry / Stay</span>
                    <span className="font-bold text-slate-900">
                      {m1.firstEntryDate ? `${m1.firstEntryDate} (${m1.monthsInUs2025 || '12'} Mo in US)` : (m1.monthsInUs2025 ? `${m1.monthsInUs2025} Months in US` : '-')}
                    </span>
                  </div>
                </div>

                <div className="pt-1 border-t border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-medium block">Residential Address</span>
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{val(taxpayerAddress)}</span>
                    {taxpayerAddress !== '-' && <AppCopyButton text={taxpayerAddress} size="sm" />}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Module 2: Spouse & Dependents */}
          <div className="bg-white">
            <button
              type="button"
              onClick={() => toggleModule('m2')}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-6 h-6 rounded-md font-bold flex items-center justify-center shrink-0 text-xs border ${
                  isM2Provided ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  2
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-slate-900 block truncate">
                    Spouse &amp; Dependents
                  </span>
                  <span className="text-[10px] text-slate-500 truncate block">
                    {hasSpouse ? `Spouse: ${spouseFullName}` : 'Single / Individual'} • {dependentsList.length} Dependent{dependentsList.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  hasSpouse ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {hasSpouse ? 'MFJ' : 'Single'}
                </span>
                {openModules.m2 ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </button>

            {openModules.m2 && (
              <div className="p-3.5 bg-slate-50/60 border-t border-slate-100 space-y-2.5 text-xs animate-in fade-in duration-150">
                {hasSpouse ? (
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1.5">
                    <span className="text-[10px] font-bold text-indigo-800 uppercase block tracking-wider">
                      Spouse Information (MFJ)
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium block">Spouse Full Name</span>
                        <span className="font-bold text-slate-900">{spouseFullName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium block">Spouse SSN / Visa</span>
                        <span className="font-bold text-slate-900">
                          {spouseSSN !== '-' ? (showSensitive.spouse_ssn ? spouseSSN : `••••••-${spouseSSN.slice(-4)}`) : '-'} {spouseVisa !== '-' ? `(${spouseVisa})` : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-500 italic text-[11px]">
                    No spouse claimed on tax return (Filing Single / Individual).
                  </div>
                )}

                {dependentsList.length > 0 ? (
                  <div className="space-y-2">
                    {dependentsList.map((dep: any, idx: number) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">
                            Dependent #{idx + 1}: {dep.firstName || dep.name || 'Child'} {dep.lastName || ''}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-800">
                            {dep.relationship || 'Child'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                          <div>DOB: <strong>{val(dep.dob)}</strong></div>
                          <div>Months in US: <strong>{val(dep.monthsInUs || dep.monthsLived || '12')}</strong></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-white border border-dashed border-slate-200 text-slate-400 text-center text-[11px]">
                    No dependents claimed by taxpayer.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Module 3: Substantial Presence Test (SPT) */}
          <div className="bg-white">
            <button
              type="button"
              onClick={() => toggleModule('m3')}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-6 h-6 rounded-md font-bold flex items-center justify-center shrink-0 text-xs border ${
                  isM3Provided ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  3
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-slate-900 block truncate">
                    Substantial Presence Test (SPT)
                  </span>
                  <span className="text-[10px] text-slate-500 truncate block">
                    {hasSptDays ? `${sptStatus} • ${weightedDays} Weighted Days` : 'Residency calculation pending'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  hasSptDays ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {hasSptDays ? (Number(weightedDays) >= 183 ? 'Resident' : 'Non-Resident') : 'Pending'}
                </span>
                {openModules.m3 ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </button>

            {openModules.m3 && (
              <div className="p-3.5 bg-slate-50/60 border-t border-slate-100 space-y-2 text-xs animate-in fade-in duration-150">
                {hasSptDays ? (
                  <>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-semibold">2025 Days</span>
                        <span className="font-black text-slate-900 text-sm">{days2025 ?? '-'}</span>
                      </div>
                      <div className="p-2 rounded bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-semibold">2024 Days (1/3)</span>
                        <span className="font-black text-slate-900 text-sm">{days2024 !== null ? (days2024 / 3).toFixed(1) : '-'}</span>
                      </div>
                      <div className="p-2 rounded bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-semibold">2023 Days (1/6)</span>
                        <span className="font-black text-slate-900 text-sm">{days2023 !== null ? (days2023 / 6).toFixed(1) : '-'}</span>
                      </div>
                    </div>
                    <div className={`p-2 rounded-lg border font-semibold text-[11px] flex items-center justify-between ${
                      Number(weightedDays) >= 183 
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
                        : 'bg-amber-50 text-amber-900 border-amber-200'
                    }`}>
                      <span>SPT Total: <strong>{weightedDays} Days</strong> ({Number(weightedDays) >= 183 ? '≥ 183 Days' : '< 183 Days'})</span>
                      <span className="font-bold">{sptStatus}</span>
                    </div>
                  </>
                ) : (
                  <div className="p-3 rounded-lg bg-white border border-dashed border-slate-200 text-slate-400 text-center text-[11px]">
                    Taxpayer has not entered physical presence day counts for 2023-2025.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Module 4: Form W-2 Wages & Income */}
          <div className="bg-white">
            <button
              type="button"
              onClick={() => toggleModule('m4')}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-6 h-6 rounded-md font-bold flex items-center justify-center shrink-0 text-xs border ${
                  isM4Provided ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  4
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-slate-900 block truncate">
                    Form W-2 Wages &amp; Withholdings
                  </span>
                  <span className="text-[10px] text-slate-500 truncate block">
                    {w2Wages !== null && w2Wages > 0 
                      ? `Wages: ${formatCurrency(w2Wages)} • Fed Tax: ${formatCurrency(fedWithheld)}`
                      : 'No W-2 wages entered by client'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
                  w2Wages !== null && w2Wages > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {w2Wages !== null && w2Wages > 0 ? formatCurrency(w2Wages) : 'None'}
                </span>
                {openModules.m4 ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </button>

            {openModules.m4 && (
              <div className="p-3.5 bg-slate-50/60 border-t border-slate-100 space-y-2.5 text-xs animate-in fade-in duration-150">
                {employerName || (w2Wages !== null && w2Wages > 0) ? (
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium block">Primary Employer (Box c)</span>
                        <span className="font-bold text-slate-900">{employerName || '-'}</span>
                      </div>
                      {employerEin && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          EIN: {employerEin}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-100">
                      <div className="flex items-center justify-between p-2 rounded bg-emerald-50/60 border border-emerald-100">
                        <div>
                          <span className="text-[9px] font-bold text-emerald-800 uppercase block">Box 1 Wages</span>
                          <span className="text-xs font-extrabold text-slate-900">{formatCurrency(w2Wages)}</span>
                        </div>
                        {onApplyValue && w2Wages !== null && w2Wages > 0 && (
                          <button
                            type="button"
                            onClick={() => onApplyValue('w2Wages', w2Wages)}
                            className="px-1.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold cursor-pointer transition-colors"
                            title="Apply Box 1 wages to Form 1040 Line 1a"
                          >
                            Apply Line 1a
                          </button>
                        )}
                      </div>

                      <div className="flex items-center justify-between p-2 rounded bg-emerald-50/60 border border-emerald-100">
                        <div>
                          <span className="text-[9px] font-bold text-emerald-800 uppercase block">Box 2 Fed Tax</span>
                          <span className="text-xs font-extrabold text-slate-900">{formatCurrency(fedWithheld)}</span>
                        </div>
                        {onApplyValue && fedWithheld !== null && fedWithheld > 0 && (
                          <button
                            type="button"
                            onClick={() => onApplyValue('fedWithheld', fedWithheld)}
                            className="px-1.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold cursor-pointer transition-colors"
                            title="Apply Box 2 withholding to Form 1040 Line 25a"
                          >
                            Apply Line 25a
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-600">
                      <div>
                        <span>Box 16 State Wages: <strong>{formatCurrency(stateWages)}</strong></span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Box 17 State Tax: <strong>{formatCurrency(stateWithheld)}</strong></span>
                        {onApplyValue && stateWithheld !== null && stateWithheld > 0 && (
                          <button
                            type="button"
                            onClick={() => onApplyValue('stateWithheld', stateWithheld)}
                            className="text-[9px] font-bold text-blue-600 hover:underline cursor-pointer"
                          >
                            Apply
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-white border border-dashed border-slate-200 text-slate-400 text-center text-[11px]">
                    No Form W-2 wage information entered by taxpayer yet.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Module 5: 1099 Interest & Dividends */}
          <div className="bg-white">
            <button
              type="button"
              onClick={() => toggleModule('m5')}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-6 h-6 rounded-md font-bold flex items-center justify-center shrink-0 text-xs border ${
                  isM5Provided ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  5
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-slate-900 block truncate">
                    1099 Interest &amp; Dividends
                  </span>
                  <span className="text-[10px] text-slate-500 truncate block">
                    {isM5Provided 
                      ? `Interest: ${formatCurrency(taxableInterest)} • Dividends: ${formatCurrency(dividendAmount)}`
                      : 'No 1099 interest or dividends reported'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  taxableInterest !== null && taxableInterest > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {taxableInterest !== null && taxableInterest > 0 ? formatCurrency(taxableInterest) : 'None'}
                </span>
                {openModules.m5 ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </button>

            {openModules.m5 && (
              <div className="p-3.5 bg-slate-50/60 border-t border-slate-100 space-y-2 text-xs animate-in fade-in duration-150">
                {isM5Provided ? (
                  <>
                    <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200">
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium block">
                          1099-INT Taxable Interest {interestBank ? `(${interestBank})` : ''}
                        </span>
                        <span className="font-extrabold text-slate-900">{formatCurrency(taxableInterest)}</span>
                      </div>
                      {onApplyValue && taxableInterest !== null && taxableInterest > 0 && (
                        <button
                          type="button"
                          onClick={() => onApplyValue('taxableInterest', taxableInterest)}
                          className="px-1.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white text-[9px] font-bold cursor-pointer transition-colors"
                        >
                          Apply Line 2b
                        </button>
                      )}
                    </div>
                    {dividendAmount !== null && dividendAmount > 0 && (
                      <div className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 font-medium block">1099-DIV Dividends</span>
                          <span className="font-bold text-slate-900">{formatCurrency(dividendAmount)}</span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-3 rounded-lg bg-white border border-dashed border-slate-200 text-slate-400 text-center text-[11px]">
                    No Form 1099-INT or 1099-DIV income reported by taxpayer.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Module 6: 1099-B Stocks, Crypto & Capital Gains */}
          <div className="bg-white">
            <button
              type="button"
              onClick={() => toggleModule('m6')}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-6 h-6 rounded-md font-bold flex items-center justify-center shrink-0 text-xs border ${
                  isM6Provided ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  6
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-slate-900 block truncate">
                    1099-B Brokerage &amp; Capital Gains
                  </span>
                  <span className="text-[10px] text-slate-500 truncate block">
                    {netGains !== null 
                      ? `Net Gains: ${formatCurrency(netGains)} ${brokerageName ? '• ' + brokerageName : ''}`
                      : 'No 1099-B stock sales reported'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  netGains !== null && netGains > 0 ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {netGains !== null && netGains > 0 ? formatCurrency(netGains) : 'None'}
                </span>
                {openModules.m6 ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </button>

            {openModules.m6 && (
              <div className="p-3.5 bg-slate-50/60 border-t border-slate-100 space-y-2 text-xs animate-in fade-in duration-150">
                {isM6Provided && netGains !== null ? (
                  <>
                    <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200">
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium block">
                          Net Short-Term &amp; Long-Term Capital Gains {brokerageName ? `(${brokerageName})` : ''}
                        </span>
                        <span className="font-extrabold text-slate-900">{formatCurrency(netGains)}</span>
                      </div>
                      {onApplyValue && netGains > 0 && (
                        <button
                          type="button"
                          onClick={() => onApplyValue('capitalGains', netGains)}
                          className="px-1.5 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-bold cursor-pointer transition-colors"
                        >
                          Apply Line 7
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="p-3 rounded-lg bg-white border border-dashed border-slate-200 text-slate-400 text-center text-[11px]">
                    No 1099-B stock sales or capital gains reported by taxpayer.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Module 7: FBAR & FATCA Foreign Assets */}
          <div className="bg-white">
            <button
              type="button"
              onClick={() => toggleModule('m7')}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-6 h-6 rounded-md font-bold flex items-center justify-center shrink-0 text-xs border ${
                  isM7Provided ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  7
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-slate-900 block truncate">
                    Foreign Accounts &amp; FBAR (FinCEN 114)
                  </span>
                  <span className="text-[10px] text-slate-500 truncate block">
                    {isFbarRequired ? 'Foreign Bank Accounts Held • FBAR Required' : 'No foreign accounts / No FBAR'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
                  isFbarRequired ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {isFbarRequired ? 'FBAR Yes' : 'FBAR No'}
                </span>
                {openModules.m7 ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </button>

            {openModules.m7 && (
              <div className="p-3.5 bg-slate-50/60 border-t border-slate-100 space-y-2 text-xs animate-in fade-in duration-150">
                {isM7Provided ? (
                  <div className="p-2 rounded bg-white border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-400 font-medium block">Max Foreign Aggregate Value</span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      {maxForeignValueUsd !== null ? `${formatCurrency(maxForeignValueUsd)} USD` : (maxForeignValueInr !== null ? `₹ ${maxForeignValueInr.toLocaleString('en-IN')}` : '-')}
                    </span>
                    {isFbarRequired && (
                      <p className="text-[10px] text-rose-700 font-semibold mt-0.5">
                        ⚠️ FinCEN Form 114 (FBAR) required to be e-filed.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-white border border-dashed border-slate-200 text-slate-400 text-center text-[11px]">
                    No foreign bank accounts or FBAR reported by taxpayer.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Module 8: Itemized Deductions (Schedule A) */}
          <div className="bg-white">
            <button
              type="button"
              onClick={() => toggleModule('m8')}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-6 h-6 rounded-md font-bold flex items-center justify-center shrink-0 text-xs border ${
                  isM8Provided ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  8
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-slate-900 block truncate">
                    Itemized Deductions (Schedule A)
                  </span>
                  <span className="text-[10px] text-slate-500 truncate block">
                    Standard Deduction (${standardDeductionAmount.toLocaleString()}) Recommended
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
                  Standard
                </span>
                {openModules.m8 ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </button>

            {openModules.m8 && (
              <div className="p-3.5 bg-slate-50/60 border-t border-slate-100 space-y-2 text-xs animate-in fade-in duration-150">
                {isM8Provided && totalItemizedSum > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-medium">1098 Mortgage Interest</span>
                      <span className="font-bold text-slate-900">{formatCurrency(mortgageInterest)}</span>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-medium">Property / SALT Taxes</span>
                      <span className="font-bold text-slate-900">{formatCurrency(propertyTaxes)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-white border border-dashed border-slate-200 text-slate-400 text-center text-[11px]">
                    No itemized deductions entered. Standard deduction of ${standardDeductionAmount.toLocaleString()} applies.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Module 9: Direct Deposit & Banking Information */}
          <div className="bg-white">
            <button
              type="button"
              onClick={() => toggleModule('m9')}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-6 h-6 rounded-md font-bold flex items-center justify-center shrink-0 text-xs border ${
                  isM9Provided ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  9
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-slate-900 block truncate">
                    Direct Deposit &amp; Banking Specs
                  </span>
                  <span className="text-[10px] text-slate-500 truncate block">
                    {bankName ? `${bankName} • ${accountType || 'Account'}` : 'No direct deposit bank provided'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  isM9Provided ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {isM9Provided ? 'Provided' : 'Pending'}
                </span>
                {openModules.m9 ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </button>

            {openModules.m9 && (
              <div className="p-3.5 bg-slate-50/60 border-t border-slate-100 space-y-2 text-xs animate-in fade-in duration-150">
                {isM9Provided && (bankName || routingNumber || accountNumber) ? (
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-2">
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">Bank Name / Institution</span>
                      <span className="font-bold text-slate-900">{val(bankName)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium block">Routing Transit (9-Digit)</span>
                        <div className="flex items-center gap-1 font-bold text-slate-900">
                          <span>{val(routingNumber)}</span>
                          {routingNumber && <AppCopyButton text={routingNumber} size="sm" />}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium block">Account Number</span>
                        <div className="flex items-center gap-1 font-bold text-slate-900">
                          <span>
                            {showSensitive.bank_acct 
                              ? (accountNumber || '-') 
                              : (accountNumber ? `••••••${accountNumber.slice(-4)}` : '-')}
                          </span>
                          {accountNumber && (
                            <>
                              <button
                                type="button"
                                onClick={() => toggleSensitive('bank_acct')}
                                className="text-slate-400 hover:text-slate-600 p-0.5"
                              >
                                {showSensitive.bank_acct ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              </button>
                              <AppCopyButton text={accountNumber} size="sm" />
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {accountType && (
                      <div className="pt-1 text-[10px] text-slate-500 font-semibold">
                        Account Type: <strong className="text-slate-800">{accountType}</strong>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-white border border-dashed border-slate-200 text-slate-400 text-center text-[11px]">
                    No IRS direct deposit banking details entered by taxpayer yet.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
