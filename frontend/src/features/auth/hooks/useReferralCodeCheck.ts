import { useEffect, useState } from 'react';
import { authService } from '../services/auth-service';

export type ReferralCodeStatus = 'idle' | 'checking' | 'valid' | 'invalid';

/**
 * Debounced live validation of a lead referral code. Returns the referrer's display name when valid.
 */
export const useReferralCodeCheck = (code: string | null | undefined) => {
  const [status, setStatus] = useState<ReferralCodeStatus>('idle');
  const [referrerName, setReferrerName] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = (code || '').trim().toUpperCase();
    if (trimmed.length < 3) {
      setStatus('idle');
      setReferrerName(null);
      return;
    }

    let cancelled = false;
    setStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const res = await authService.checkReferralCode(trimmed);
        if (cancelled) return;
        setReferrerName(res?.data?.referrerName || null);
        setStatus('valid');
      } catch {
        if (cancelled) return;
        setReferrerName(null);
        setStatus('invalid');
      }
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [code]);

  return { status, referrerName };
};
