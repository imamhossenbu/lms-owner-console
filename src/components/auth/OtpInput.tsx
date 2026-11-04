"use client";

import React, { useRef, useEffect } from "react";

export interface OtpInputProps {
  length?: number;
  value: string[];
  onChange: (digits: string[]) => void;
  error?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  error = false,
  disabled = false,
  autoFocus = true,
  className = "",
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleDigitChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, "");
    if (!cleanVal) {
      const newDigits = [...value];
      newDigits[index] = "";
      onChange(newDigits);
      return;
    }

    const char = cleanVal.slice(-1);
    const newDigits = [...value];
    newDigits[index] = char;
    onChange(newDigits);

    if (index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!value[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();
    const cleanNumbers = pastedData.replace(/\D/g, "").slice(0, length);

    if (cleanNumbers.length > 0) {
      const newDigits = Array.from({ length }, (_, i) => cleanNumbers[i] || "");
      onChange(newDigits);

      const focusIdx = Math.min(cleanNumbers.length, length - 1);
      inputRefs.current[focusIdx]?.focus();
    }
  };

  return (
    <div
      className={`flex items-center justify-between gap-2 sm:gap-3 ${className}`}
      onPaste={handlePaste}
    >
      {Array.from({ length }).map((_, idx) => {
        const digit = value[idx] || "";
        return (
          <input
            key={idx}
            ref={(el) => {
              inputRefs.current[idx] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            disabled={disabled}
            onChange={(e) => handleDigitChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            className={`w-11 h-13 sm:w-13 sm:h-15 sm:w-14 sm:h-16 rounded-xl sm:rounded-2xl border title-bold text-center text-primary-500 bg-white placeholder:text-primary-300 transition-all focus:outline-none ${
              error
                ? "border-red/100 bg-red-14 text-red"
                : digit
                ? "border-brand-orange/60 bg-brand-orange-light/30 shadow-2xs"
                : "border-dash hover:border-slate-300"
            } focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/10 disabled:opacity-50 disabled:cursor-not-allowed`}
          />
        );
      })}
    </div>
  );
}
