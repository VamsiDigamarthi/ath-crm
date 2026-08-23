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

// Comprehensive Unicode regex to detect any emojis or pictorial symbols
const EMOJI_REGEX = /[\p{Extended_Pictographic}\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/u;

// Helper to check for '[object Object]' or invalid stringified object references
const isObjectGarbage = (val: string): boolean => {
  if (!val) return false;
  return (
    /\[object\s+object\]/i.test(val) ||
    val.includes('{') ||
    val.includes('}') ||
    val.trim().toLowerCase() === 'undefined' ||
    val.trim().toLowerCase() === 'null' ||
    val.trim().toLowerCase() === 'nan'
  );
};

/**
 * Normalizes input visa type string into standard canonical key, or returns null if invalid
 */
export function normalizeVisaType(input?: string | null): { normalized: string | null; isValid: boolean } {
  if (!input || !input.trim()) return { normalized: null, isValid: false };
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
  if (['OTHER'].includes(clean)) return { normalized: 'OTHER', isValid: true };

  // Check if matches allowed list exactly
  const exact = ALLOWED_VISA_TYPES.find((v) => v.toUpperCase() === input.trim().toUpperCase());
  if (exact) return { normalized: exact, isValid: true };

  return { normalized: input.trim(), isValid: false };
}

/**
 * Validate a lead row against strict business and data integrity rules
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

  // 1. Check for '[object Object]' or invalid object serialization
  if (isObjectGarbage(firstName) || isObjectGarbage(lastName)) {
    return {
      status: 'INVALID_NAME',
      message: "Invalid client name (contains '[object Object]' or invalid reference)",
    };
  }
  if (isObjectGarbage(email)) {
    return {
      status: 'INVALID_EMAIL',
      message: "Invalid email format (contains '[object Object]')",
    };
  }
  if (isObjectGarbage(phone)) {
    return {
      status: 'INVALID_PHONE',
      message: "Invalid phone number (contains '[object Object]')",
    };
  }
  if (isObjectGarbage(visa)) {
    return {
      status: 'INVALID_VISA',
      message: "Invalid visa reference (contains '[object Object]')",
    };
  }

  // 2. Check for Emojis in any field (Strictly forbidden in tax records)
  if (EMOJI_REGEX.test(firstName) || EMOJI_REGEX.test(lastName)) {
    return {
      status: 'INVALID_NAME',
      message: 'Emojis and special icons are not permitted in client name',
    };
  }
  if (EMOJI_REGEX.test(email)) {
    return {
      status: 'INVALID_EMAIL',
      message: 'Emojis are not permitted in email address',
    };
  }
  if (EMOJI_REGEX.test(phone)) {
    return {
      status: 'INVALID_PHONE',
      message: 'Emojis are not permitted in phone number',
    };
  }
  if (EMOJI_REGEX.test(visa)) {
    return {
      status: 'INVALID_VISA',
      message: 'Emojis are not permitted in visa type',
    };
  }

  // 3. Name checks (min 2 chars, max 50 chars, must contain alphabetic characters)
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
  if (!/[a-zA-Z]/.test(firstName)) {
    return {
      status: 'INVALID_NAME',
      message: 'First name must contain valid alphabetic letters',
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
  if (!/[a-zA-Z]/.test(lastName)) {
    return {
      status: 'INVALID_NAME',
      message: 'Last name must contain valid alphabetic letters',
    };
  }

  // 4. Phone checks (min 7 digits)
  const phoneDigits = phone.replace(/\D/g, '');
  if (!phone || phoneDigits.length < 7) {
    return {
      status: 'INVALID_PHONE',
      message: 'Invalid contact phone number (min 7 digits required)',
    };
  }

  // 5. Email check (valid standard syntax)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return {
      status: 'INVALID_EMAIL',
      message: 'Invalid or missing email format',
    };
  }

  // 6. Visa check (Strictly Mandatory for all tax leads)
  if (!visa || visa.toUpperCase() === 'N/A' || visa.toUpperCase() === 'NA' || visa.toUpperCase() === 'NONE' || visa.toUpperCase() === 'UNKNOWN') {
    return {
      status: 'INVALID_VISA',
      message: 'Visa Type is required (e.g. H-1B, F-1 OPT, L-1, Green Card, US Citizen, etc.)',
      normalizedVisa: null,
    };
  }

  const { normalized, isValid } = normalizeVisaType(visa);
  if (!isValid || !normalized) {
    return {
      status: 'INVALID_VISA',
      message: `Unknown Visa Type: '${visa}'. Allowed: H-1B, H-4, L-1, L-2, F-1 OPT, F-1 CPT, F-1, Green Card, US Citizen, etc.`,
      normalizedVisa: visa,
    };
  }

  // 7. State check (Optional: if 2-letter state code is given, verify against US states)
  if (state && state.length === 2 && !US_STATES.has(state)) {
    return {
      status: 'INVALID_STATE',
      message: `Invalid 2-letter US State code: '${state}'`,
      normalizedVisa: normalized,
    };
  }

  return {
    status: 'VALID',
    message: 'Valid & ready for server ingest',
    normalizedVisa: normalized,
  };
}
