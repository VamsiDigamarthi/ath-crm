export type ReturnComplexityTier = 'BASIC' | 'MODERATE' | 'COMPLEX' | 'SPECIALIZED';
export type ReturnComplexityScore = 1 | 2 | 3 | 4;

export interface ReturnComplexityFactor {
  category: string;
  label: string;
  description?: string;
}

export interface ReturnComplexityInfo {
  score: ReturnComplexityScore;
  tier: ReturnComplexityTier;
  label: string;
  dotColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  recommendation: string;
  assignmentTarget: 'FRESHER' | 'MID_LEVEL' | 'SENIOR' | 'SPECIALIST_MANAGER';
  factors: string[];
  summary: string;
}

export interface ComplexityTierDefinition {
  tier: ReturnComplexityTier;
  score: ReturnComplexityScore;
  label: string;
  dotEmoji: string;
  badgeClass: string;
  recommendation: string;
  assignmentTarget: string;
  criteria: string[];
}
