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
    <div className="space-y-1.5 font-sans">
      <div className="grid grid-cols-6 gap-2" onPaste={handlePaste}>
        {digits.map((digit, idx) => {
          const isFilled = Boolean(digit);
          const hasError = Boolean(error);

          return (
            <input
              key={idx}
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
              className={`w-full h-10 text-center text-sm font-semibold text-black rounded-lg border bg-white outline-none transition-colors focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/15 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed ${
                hasError ? 'border-rose-500' : isFilled ? 'border-[#16A34A]' : 'border-gray-300'
              }`}
            />
          );
        })}
      </div>

      {error && <p className="text-[11px] text-rose-500 font-medium">{error}</p>}
    </div>
  );
};
