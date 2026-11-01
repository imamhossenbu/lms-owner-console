import React from "react";
import { cn } from "@/lib/cn";

interface FieldLabelProps {
  htmlFor?: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  /** Shows a "count/max" counter on the right (turns red past the limit). */
  count?: number;
  max?: number;
  className?: string;
}

export function FieldLabel({ htmlFor, label, required, optional, count, max, className }: FieldLabelProps) {
  return (
    <div className={cn("flex items-center justify-between gap-3 mb-2", className)}>
      <label htmlFor={htmlFor} className="body-sm-medium text-primary-500 select-none">
        {label}
        {required && <span className="text-red ml-0.5">*</span>}
        {optional && <span className="body-xsm-regular text-primary-300 ml-1">(Optional)</span>}
      </label>
      {typeof count === "number" && typeof max === "number" && (
        <span className={cn("body-xsm-regular tabular-nums", count > max ? "text-red" : "text-primary-300")}>
          {count}/{max}
        </span>
      )}
    </div>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="body-xsm-regular text-red mt-1">
      {message}
    </p>
  );
}

export default FieldLabel;
