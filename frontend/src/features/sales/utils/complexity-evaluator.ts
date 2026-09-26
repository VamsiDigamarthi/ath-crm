import type { 
  ReturnComplexityInfo, 
  ComplexityTierDefinition,
  ReturnComplexityTier 
} from '../types/complexity.types';

export const RETURN_COMPLEXITY_TIERS: Record<ReturnComplexityTier, ComplexityTierDefinition> = {
  BASIC: {
    tier: 'BASIC',
    score: 1,
    label: 'Basic',
    dotEmoji: '🟢',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    recommendation: 'Assign to Fresher / Junior Closer',
    assignmentTarget: 'Fresher / Junior Staff',
    criteria: [
      'W-2 Wage Income',
      'Standard Deduction',
      'Single State Return',
    ],
  },
  MODERATE: {
    tier: 'MODERATE',
    score: 2,
    label: 'Moderate',
    dotEmoji: '🟡',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
    recommendation: 'Assign to Mid-Level Closer / Preparer',
    assignmentTarget: 'Mid-Level Staff',
    criteria: [
      'W-2 + 1099 (Interest / Dividends / Misc)',
      'Stocks & Capital Gains (1099-B / Crypto)',
      'Itemized Deductions (Schedule A / Mortgage / Taxes)',
    ],
  },
  COMPLEX: {
    tier: 'COMPLEX',
    score: 3,
    label: 'Complex',
    dotEmoji: '🟠',
    badgeClass: 'bg-orange-50 text-orange-900 border-orange-300',
    recommendation: 'Assign to Senior Closer / Senior Preparer',
    assignmentTarget: 'Senior Staff',
    criteria: [
      'Schedule C (Sole Prop / 1099-NEC Self-Employed)',
      'Rental Properties (Schedule E)',
      'Multi-State Tax Returns (≥ 2 States)',
      'Schedule K-1 (Partnership / S-Corp)',
    ],
  },
  SPECIALIZED: {
    tier: 'SPECIALIZED',
    score: 4,
    label: 'Specialized Review',
    dotEmoji: '🔴',
    badgeClass: 'bg-rose-50 text-rose-900 border-rose-300',
    recommendation: 'Assign to Team Lead / Manager / Senior CPA',
    assignmentTarget: 'Team Lead / Senior CPA / Manager',
    criteria: [
      'Foreign Reporting (FBAR FinCEN 114 / FATCA Form 8938)',
      'PFIC (Form 8621 / Foreign Mutual Funds)',
      'Complex K-1 & Multiple Entity Structures',
      'Multiple Business Entities',
      'IRS Audit Issues / Notice / Back Taxes / 1040-X',
    ],
  },
};

/**
 * Dynamically evaluate tax lead data and determine Return Complexity score, factors, and TL assignment recommendation
 */
export function calculateReturnComplexity(lead: any): ReturnComplexityInfo {
  if (!lead) {
    return createComplexityResponse('BASIC', ['Standard W-2', 'Standard Deduction']);
  }

  const factors: string[] = [];
  const draft = lead.taxDraftSummary || {};
  const feeBreakdown = lead.feeBreakdown || draft.feeBreakdown || {};
  const documents: any[] = Array.isArray(lead.documents) 
    ? lead.documents 
    : Array.isArray(draft.documents) 
    ? draft.documents 
    : [];

  // Gather text content from all document names and categories
  const docText = [
    ...documents.map((d) => `${d.documentCategory || ''} ${d.fileName || ''} ${d.documentType || ''}`),
    draft.notes || '',
    draft.remarks || '',
    lead.notes || '',
    lead.closerCallNotes || '',
  ].join(' ').toUpperCase();

  const selectedStates: string[] = Array.isArray(feeBreakdown.selectedStates) 
    ? feeBreakdown.selectedStates 
    : Array.isArray(draft.selectedStates)
    ? draft.selectedStates
    : [];

  const fbarFee = Number(feeBreakdown.fbarFee || draft.fbarFee || 0);
  const fatcaFee = Number(feeBreakdown.fatcaFee || draft.fatcaFee || 0);
  const hasFatca = Boolean(feeBreakdown.hasFatca || draft.hasFatca || fatcaFee > 0);

  // -------------------------------------------------------------
  // 1. TIER 4: SPECIALIZED REVIEW (Score: 4)
  // Foreign reporting, PFIC, Complex K-1, Multiple businesses, IRS issues
  // -------------------------------------------------------------
  let isSpecialized = false;

  if (fbarFee > 0 || docText.includes('FBAR') || docText.includes('FINCEN') || docText.includes('NRE') || docText.includes('NRO') || docText.includes('FOREIGN BANK')) {
    factors.push('Foreign Bank FBAR (FinCEN 114)');
    isSpecialized = true;
  }

  if (hasFatca || fatcaFee > 0 || docText.includes('FATCA') || docText.includes('8938') || docText.includes('FOREIGN ASSET')) {
    factors.push('Foreign Assets FATCA (Form 8938)');
    isSpecialized = true;
  }

  if (docText.includes('PFIC') || docText.includes('8621') || docText.includes('FOREIGN MUTUAL')) {
    factors.push('PFIC Foreign Investment (Form 8621)');
    isSpecialized = true;
  }

  if (docText.includes('COMPLEX K-1') || docText.includes('MULTIPLE ENTIT') || (docText.includes('K-1') && (docText.includes('1065') && docText.includes('1120S')))) {
    factors.push('Complex Multi-Entity K-1');
    isSpecialized = true;
  }

  if (docText.includes('MULTIPLE BUSINESS') || docText.includes('CORP') && docText.includes('LLC')) {
    factors.push('Multiple Business Entities');
    isSpecialized = true;
  }

  if (docText.includes('IRS NOTICE') || docText.includes('CP2000') || docText.includes('CP504') || docText.includes('AUDIT') || docText.includes('BACK TAX') || docText.includes('1040-X') || docText.includes('AMENDED')) {
    factors.push('IRS Audit / Notice / Prior Year Issue');
    isSpecialized = true;
  }

  if (isSpecialized) {
    return createComplexityResponse('SPECIALIZED', factors);
  }

  // -------------------------------------------------------------
  // 2. TIER 3: COMPLEX (Score: 3)
  // Schedule C, Rental, Multi-state, K-1
  // -------------------------------------------------------------
  let isComplex = false;

  if (docText.includes('SCHEDULE C') || docText.includes('1099-NEC') || docText.includes('SELF-EMPLOYED') || docText.includes('SOLE PROP') || docText.includes('BUSINESS EXPENSE') || lead.complexity === 'SCHEDULE_C' || lead.complexity === 'BUSINESS_SCH_C') {
    factors.push('Schedule C (Self-Employed / 1099-NEC)');
    isComplex = true;
  }

  if (docText.includes('SCHEDULE E') || docText.includes('RENTAL') || docText.includes('REAL ESTATE') || docText.includes('PROPERTY MANAGEMENT')) {
    factors.push('Rental Property (Schedule E)');
    isComplex = true;
  }

  if (selectedStates.length >= 2 || docText.includes('MULTI-STATE') || docText.includes('MULTI STATE') || lead.complexity === 'MULTI_STATE') {
    const statesLabel = selectedStates.length > 0 ? ` (${selectedStates.length} States: ${selectedStates.join(', ')})` : ' (Multi-State)';
    factors.push(`Multi-State Tax Filing${statesLabel}`);
    isComplex = true;
  }

  if (docText.includes('K-1') || docText.includes('K1') || docText.includes('PARTNERSHIP')) {
    factors.push('Schedule K-1 (Partnership / S-Corp)');
    isComplex = true;
  }

  if (isComplex) {
    return createComplexityResponse('COMPLEX', factors);
  }

  // -------------------------------------------------------------
  // 3. TIER 2: MODERATE (Score: 2)
  // W-2 + 1099, Stocks, Itemized deductions
  // -------------------------------------------------------------
  let isModerate = false;

  if (docText.includes('1099-B') || docText.includes('STOCK') || docText.includes('INVESTMENT') || docText.includes('BROKERAGE') || docText.includes('CRYPTO') || docText.includes('CAPITAL GAIN') || lead.complexity === 'INVESTMENTS_1099B') {
    factors.push('Stocks & Capital Gains (1099-B / Crypto)');
    isModerate = true;
  }

  if (docText.includes('1099-INT') || docText.includes('1099-DIV') || docText.includes('1099-MISC') || docText.includes('1099-G') || docText.includes('1099-R') || docText.includes('1099-K')) {
    factors.push('1099 Non-Wage Income (Int / Div / Misc)');
    isModerate = true;
  }

  if (docText.includes('SCHEDULE A') || docText.includes('ITEMIZED') || docText.includes('1098') || docText.includes('MORTGAGE') || docText.includes('PROPERTY TAX') || docText.includes('CHARIT')) {
    factors.push('Itemized Deductions (Schedule A)');
    isModerate = true;
  }

  if (isModerate) {
    return createComplexityResponse('MODERATE', factors);
  }

  // -------------------------------------------------------------
  // 4. TIER 1: BASIC (Score: 1)
  // Default fallback
  // -------------------------------------------------------------
  factors.push('Standard Form 1040 (W-2)');
  factors.push('Standard Deduction');
  if (selectedStates.length === 1) {
    factors.push(`Single State Return (${selectedStates[0]})`);
  }

  return createComplexityResponse('BASIC', factors);
}

function createComplexityResponse(tier: ReturnComplexityTier, factors: string[]): ReturnComplexityInfo {
  const def = RETURN_COMPLEXITY_TIERS[tier];
  
  let dotColor = 'bg-emerald-500';
  let badgeBg = 'bg-emerald-50';
  let badgeBorder = 'border-emerald-200';
  let badgeText = 'text-emerald-800';

  if (tier === 'MODERATE') {
    dotColor = 'bg-amber-500';
    badgeBg = 'bg-amber-50';
    badgeBorder = 'border-amber-300';
    badgeText = 'text-amber-800';
  } else if (tier === 'COMPLEX') {
    dotColor = 'bg-orange-500';
    badgeBg = 'bg-orange-50';
    badgeBorder = 'border-orange-300';
    badgeText = 'text-orange-900';
  } else if (tier === 'SPECIALIZED') {
    dotColor = 'bg-rose-500';
    badgeBg = 'bg-rose-50';
    badgeBorder = 'border-rose-300';
    badgeText = 'text-rose-900';
  }

  const targetMapping: Record<ReturnComplexityTier, 'FRESHER' | 'MID_LEVEL' | 'SENIOR' | 'SPECIALIST_MANAGER'> = {
    BASIC: 'FRESHER',
    MODERATE: 'MID_LEVEL',
    COMPLEX: 'SENIOR',
    SPECIALIZED: 'SPECIALIST_MANAGER',
  };

  return {
    score: def.score,
    tier: def.tier,
    label: def.label,
    dotColor,
    badgeBg,
    badgeBorder,
    badgeText,
    recommendation: def.recommendation,
    assignmentTarget: targetMapping[tier],
    factors,
    summary: `${def.dotEmoji} ${def.label} (${def.score}/4) - ${def.recommendation}`,
  };
}
