import React, { useRef, useEffect } from 'react';

interface OtpSixDigitInputProps {
  value: string;
  onChange: (otp: string) => void;
  error?: string;
  disabled?: boolean;
  onComplete?: (otp: string) => void;
  autoFocus?: boolean;
}

export const OtpSixDigitInput: React.FC<OtpSixDigitInputProps> = ({
  value = '',
  onChange,
  error,
  disabled = false,
  onComplete,
  autoFocus = true,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Array of 6 characters derived from value
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || '');

  // Auto-focus first empty input on mount
  useEffect(() => {
    if (autoFocus && !disabled) {
      const firstEmptyIdx = digits.findIndex((d) => !d);
      const targetIdx = firstEmptyIdx === -1 ? 5 : firstEmptyIdx;
      inputRefs.current[targetIdx]?.focus();
    }
  }, []);

  // Handle single digit input
  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    // Extract only digits
    const cleanedDigits = rawVal.replace(/\D/g, '');

    if (!cleanedDigits) {
      // If cleared
      const newDigits = [...digits];
      newDigits[index] = '';
      const newOtp = newDigits.join('');
      onChange(newOtp);
      return;
    }

    if (cleanedDigits.length > 1) {
      // User pasted or typed multiple digits directly in this input
      handleMultiDigitInput(cleanedDigits, index);
      return;
    }

    // Single digit entry
    const newDigits = [...digits];
    newDigits[index] = cleanedDigits;
    const newOtp = newDigits.join('');
    onChange(newOtp);

    // Auto-advance focus to next input
    if (index < 5 && cleanedDigits) {
      inputRefs.current[index + 1]?.focus();
      inputRefs.current[index + 1]?.select();
    }

    // Trigger onComplete callback if all 6 digits entered
    if (newOtp.length === 6 && onComplete) {
      onComplete(newOtp);
    }
  };

  // Handle multi-digit pasted into an input
  const handleMultiDigitInput = (pastedText: string, startIndex: number = 0) => {
    const numbersOnly = pastedText.replace(/\D/g, '').slice(0, 6);
    if (!numbersOnly) return;

    let newOtp = '';
    if (numbersOnly.length === 6) {
      newOtp = numbersOnly;
    } else {
      const newDigits = [...digits];
      for (let i = 0; i < numbersOnly.length && startIndex + i < 6; i++) {
        newDigits[startIndex + i] = numbersOnly[i];
      }
      newOtp = newDigits.join('');
    }

    onChange(newOtp);

    // Focus the next empty or last filled input
    const nextEmptyIdx = Math.min(newOtp.length, 5);
    inputRefs.current[nextEmptyIdx]?.focus();
    inputRefs.current[nextEmptyIdx]?.select();

    if (newOtp.length === 6 && onComplete) {
      onComplete(newOtp);
    }
  };

  // Handle keyboard events (Backspace, Arrows)
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // If current box is empty, delete previous and move focus back
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        const newOtp = newDigits.join('');
        onChange(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current box
        const newDigits = [...digits];
        newDigits[index] = '';
        onChange(newDigits.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
      inputRefs.current[index - 1]?.select();
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
      inputRefs.current[index + 1]?.select();
    }
  };

  // Handle global paste event on input container
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    handleMultiDigitInput(pastedData, 0);
  };

  return (
    <div className="space-y-2.5 font-sans">
      {/* 6-Digit Box Layout */}
      <div 
        className="flex items-center justify-between gap-1.5 sm:gap-2.5 max-w-sm mx-auto"
        onPaste={handlePaste}
      >
        {digits.map((digit, idx) => {
          const isFilled = Boolean(digit);
          const hasError = Boolean(error);

          return (
            <React.Fragment key={idx}>
              {/* Center Divider Dot/Dash between 3rd and 4th box */}
              {idx === 3 && (
                <div className="w-2 sm:w-3 h-0.5 bg-slate-300 rounded-full shrink-0" />
              )}

              <div className="relative flex-1 aspect-[4/5] max-w-[54px]">
                <input
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="one-time-code"
                  maxLength={1}
                  disabled={disabled}
                  value={digit}
                  onChange={(e) => handleChange(idx, e)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onFocus={(e) => e.target.select()}
                  className={`w-full h-full text-center text-xl sm:text-2xl font-black font-mono rounded-xl sm:rounded-2xl transition-all duration-200 outline-none select-none ${
                    disabled ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : ''
                  } ${
                    hasError
                      ? 'border-2 border-rose-500 bg-rose-50/40 text-rose-900 ring-4 ring-rose-500/15 animate-shake'
                      : isFilled
                      ? 'border-2 border-[#16A34A] bg-emerald-50/40 text-slate-900 shadow-xs shadow-emerald-600/10'
                      : 'border-2 border-slate-200 bg-slate-50/70 text-slate-800 hover:border-slate-300 focus:border-[#16A34A] focus:bg-white focus:ring-4 focus:ring-emerald-500/15 focus:scale-105 shadow-2xs'
                  }`}
                  placeholder="•"
                />

                {/* Subtle active indicator dot inside empty active box */}
                {!isFilled && !hasError && (
                  <span className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300/80" />
                  </span>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-xs font-bold text-rose-600 text-center flex items-center justify-center gap-1.5 animate-fadeIn">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
