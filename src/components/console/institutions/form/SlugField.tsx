"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Globe, Loader2, XCircle } from "lucide-react";
import { InputField } from "@/components/ui/InputField";
import { checkSlugAvailability, type SlugCheck } from "@/lib/saasStorage";
import { SAAS_ROOT_DOMAIN } from "@/types/saas";
import { SLUG_REGEX } from "@/validations/saasSchema";
import { cn } from "@/lib/cn";

export type SlugStatus = { state: "idle" | "checking" } | { state: "done"; slug: string; result: SlugCheck };

export interface SlugFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value"> {
  value: string;
  error?: string;
  /** Institution being edited (its own slug counts as available). */
  exceptId?: string;
  onStatusChange: (status: SlugStatus) => void;
  status: SlugStatus;
}

/** Subdomain input with live (debounced) availability check and the resulting URL preview. */
export const SlugField = React.forwardRef<HTMLInputElement, SlugFieldProps>(function SlugField({ value, error, exceptId, onStatusChange, status, ...inputProps }, ref) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value.trim().toLowerCase()), 350);
    return () => clearTimeout(t);
  }, [value]);

  useEffect(() => {
    let cancelled = false;
    if (!debounced || !SLUG_REGEX.test(debounced)) {
      onStatusChange({ state: "idle" });
      return;
    }
    onStatusChange({ state: "checking" });
    void checkSlugAvailability(debounced, exceptId).then((result) => {
      if (!cancelled) onStatusChange({ state: "done", slug: debounced, result });
    });
    return () => {
      cancelled = true;
    };
  }, [debounced, exceptId, onStatusChange]);

  const current = status.state === "done" && status.slug === value.trim().toLowerCase() ? status.result : null;
  const icon =
    status.state === "checking" ? (
      <Loader2 className="h-4 w-4 animate-spin text-primary-300" />
    ) : current?.available ? (
      <CheckCircle2 className="h-4 w-4 text-green" />
    ) : current ? (
      <XCircle className="h-4 w-4 text-red" />
    ) : null;

  return (
    <div className="space-y-2">
      <InputField
        ref={ref}
        value={value}
        label="Subdomain"
        required
        placeholder="dhaka-coding"
        autoComplete="off"
        spellCheck={false}
        leftElement={<Globe className="h-4 w-4" />}
        rightElement={icon}
        error={error ?? (current && !current.available ? current.reason : undefined)}
        {...inputProps}
      />
      <div className={cn("flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border px-3.5 py-2.5", current?.available ? "border-green/40 bg-green-bg" : "border-dash bg-gray-bg")}>
        <span className="body-xsm-regular text-primary-300">Panel URL</span>
        <span className="truncate body-sm-medium text-primary-500">
          https://{value.trim().toLowerCase() || "your-subdomain"}.{SAAS_ROOT_DOMAIN}
        </span>
        {current?.available && <span className="body-xsm-medium text-green">Available</span>}
        {status.state === "checking" && <span className="body-xsm-regular text-primary-300">Checking…</span>}
      </div>
    </div>
  );
});

export default SlugField;
