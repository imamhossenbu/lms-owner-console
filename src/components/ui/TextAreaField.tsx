import React, { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

/** Multi-line text input matching InputField (border, focus ring, error state). */
export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  ({ error, className, rows = 3, ...props }, ref) => (
    <div className="w-full">
      <textarea
        ref={ref}
        rows={rows}
        aria-invalid={!!error}
        className={cn(
          "w-full rounded-lg border px-3.5 py-2.5 body-sm-regular text-primary-500 outline-none resize-none shadow-2xs transition-colors placeholder:text-primary-300 focus:border-brand-orange focus:bg-white",
          error ? "border-red bg-red-14" : "border-dash bg-white",
          className
        )}
        {...props}
      />
      {error && <p className="body-xsm-regular text-red mt-1">{error}</p>}
    </div>
  )
);

TextAreaField.displayName = "TextAreaField";
export default TextAreaField;
