import { useMemo } from 'react';
import { calculateReturnComplexity, RETURN_COMPLEXITY_TIERS } from '../utils/complexity-evaluator';
import type { ReturnComplexityInfo, ReturnComplexityTier } from '../types/complexity.types';

export interface WorkloadComplexityStats {
  basic: number;
  moderate: number;
  complex: number;
  specialized: number;
  total: number;
  seniorRequiredCount: number;
  fresherEligibleCount: number;
}

/**
 * Custom hook to dynamically evaluate Return Complexity score, factors, and staff assignment recommendations
 */
export function useReturnComplexity(lead: any): ReturnComplexityInfo {
  return useMemo(() => {
    return calculateReturnComplexity(lead);
  }, [
    lead?.id, 
    lead?.applicationId, 
    lead?.complexity,
    lead?.taxDraftSummary,
    lead?.feeBreakdown,
    lead?.documents,
  ]);
}

/**
 * Custom hook to evaluate queue-wide workload complexity distribution
 */
export function useQueueComplexityStats(leads: any[]): WorkloadComplexityStats {
  return useMemo(() => {
    let basic = 0;
    let moderate = 0;
    let complex = 0;
    let specialized = 0;

    leads.forEach((l) => {
      const info = calculateReturnComplexity(l);
      if (info.tier === 'BASIC') basic++;
      else if (info.tier === 'MODERATE') moderate++;
      else if (info.tier === 'COMPLEX') complex++;
      else if (info.tier === 'SPECIALIZED') specialized++;
    });

    return {
      basic,
      moderate,
      complex,
      specialized,
      total: leads.length,
      seniorRequiredCount: complex + specialized,
      fresherEligibleCount: basic,
    };
  }, [leads]);
}

export { RETURN_COMPLEXITY_TIERS };
