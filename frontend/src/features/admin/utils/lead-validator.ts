import type { LeadValidationStatus } from '../types/bulk-import.types';

export const ALLOWED_VISA_TYPES = [
  'H-1B',
  'H-4',
  'L-1',
  'L-2',
  'F-1 OPT',
  'F-1 CPT',
  'F-1',
  'B-1/B-2',
  'J-1',
  'O-1',
  'TN',
  'E-3',
  'GREEN_CARD',
  'US_CITIZEN',
  'OTHER',
] as const;

export const US_STATES = new Set([
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC',
]);

/**
 * Normalizes input visa type string into standard canonical key, or returns null if invalid
 */
export function normalizeVisaType(input?: string | null): { normalized: string | null; isValid: boolean } {
  if (!input || !input.trim()) return { normalized: null, isValid: true };
  const clean = input.trim().toUpperCase().replace(/[\s_-]+/g, '');
  
  if (['H1B', 'H1', 'H1BVISA'].includes(clean)) return { normalized: 'H-1B', isValid: true };
  if (['H4', 'H4VISA'].includes(clean)) return { normalized: 'H-4', isValid: true };
  if (['L1', 'L1A', 'L1B', 'L1VISA'].includes(clean)) return { normalized: 'L-1', isValid: true };
  if (['L2', 'L2VISA'].includes(clean)) return { normalized: 'L-2', isValid: true };
  if (['F1OPT', 'OPT', 'STEMOPT', 'F1STEMOPT'].includes(clean)) return { normalized: 'F-1 OPT', isValid: true };
  if (['F1CPT', 'CPT'].includes(clean)) return { normalized: 'F-1 CPT', isValid: true };
  if (['F1', 'F1STUDENT', 'STUDENT'].includes(clean)) return { normalized: 'F-1', isValid: true };
  if (['B1B2', 'B1', 'B2', 'VISITOR', 'TOURIST'].includes(clean)) return { normalized: 'B-1/B-2', isValid: true };
  if (['J1', 'J1VISA', 'EXCHANGE'].includes(clean)) return { normalized: 'J-1', isValid: true };
  if (['O1', 'O1A', 'O1B', 'O1VISA'].includes(clean)) return { normalized: 'O-1', isValid: true };
  if (['TN', 'TN1', 'TN2', 'TNVISA'].includes(clean)) return { normalized: 'TN', isValid: true };
  if (['E3', 'E3VISA'].includes(clean)) return { normalized: 'E-3', isValid: true };
  if (['GREENCARD', 'GC', 'PERMANENTRESIDENT', 'PR'].includes(clean)) return { normalized: 'GREEN_CARD', isValid: true };
  if (['USCITIZEN', 'CITIZEN', 'USC', 'PASSPORT'].includes(clean)) return { normalized: 'US_CITIZEN', isValid: true };
  if (['OTHER', 'NA', 'UNKNOWN'].includes(clean)) return { normalized: 'OTHER', isValid: true };

  // Check if matches allowed list exactly
  const exact = ALLOWED_VISA_TYPES.find((v) => v.toUpperCase() === input.trim().toUpperCase());
  if (exact) return { normalized: exact, isValid: true };

  return { normalized: input.trim(), isValid: false };
}

/**
 * Validate a lead row against strict business rules
 */
export function validateLeadRow(lead: {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  visaType?: string;
  state?: string;
}): { status: LeadValidationStatus; message: string; normalizedVisa?: string | null } {
  const firstName = (lead.firstName || '').trim();
  const lastName = (lead.lastName || '').trim();
  const email = (lead.email || '').trim().toLowerCase();
  const phone = (lead.phone || '').trim();
  const visa = (lead.visaType || '').trim();
  const state = (lead.state || '').trim().toUpperCase();

  // 1. Name checks (min 2 chars, max 50 chars)
  if (!firstName || firstName.length < 2) {
    return {
      status: 'INVALID_NAME',
      message: 'First name must be at least 2 characters',
    };
  }
  if (firstName.length > 50) {
    return {
      status: 'INVALID_NAME',
      message: 'First name must not exceed 50 characters',
    };
  }
  if (!lastName || lastName.length < 2) {
    return {
      status: 'INVALID_NAME',
      message: 'Last name must be at least 2 characters',
    };
  }
  if (lastName.length > 50) {
    return {
      status: 'INVALID_NAME',
      message: 'Last name must not exceed 50 characters',
    };
  }

  // 2. Phone checks (min 7 digits)
  const phoneDigits = phone.replace(/\D/g, '');
  if (!phone || phoneDigits.length < 7) {
    return {
      status: 'INVALID_PHONE',
      message: 'Invalid contact phone number (min 7 digits required)',
    };
  }

  // 3. Email check (valid syntax if provided)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return {
      status: 'INVALID_EMAIL',
      message: 'Invalid or missing email format',
    };
  }

  // 4. Visa check (Strict allowed list)
  if (visa) {
    const { normalized, isValid } = normalizeVisaType(visa);
    if (!isValid) {
      return {
        status: 'INVALID_VISA',
        message: `Unknown Visa Type: '${visa}'. Allowed: H-1B, H-4, L-1, L-2, F-1 OPT, Green Card, US Citizen, etc.`,
        normalizedVisa: visa,
      };
    }
    return {
      status: 'VALID',
      message: 'Valid & ready for server ingest',
      normalizedVisa: normalized,
    };
  }

  // 5. State check (Optional: if 2-letter state code is given, verify against US states)
  if (state && state.length === 2 && !US_STATES.has(state)) {
    return {
      status: 'INVALID_STATE',
      message: `Invalid 2-letter US State code: '${state}'`,
    };
  }

  return {
    status: 'VALID',
    message: 'Valid & ready for server ingest',
    normalizedVisa: null,
  };
}
