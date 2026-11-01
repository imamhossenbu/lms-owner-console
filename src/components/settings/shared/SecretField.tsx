"use client";

import React, { useId, useState } from "react";
import { useFormContext, useWatch, type FieldValues, type Path } from "react-hook-form";
import { motion } from "framer-motion";
import { Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";
import { InputField } from "@/components/ui/InputField";
import { FieldLabel } from "@/components/ui/FieldLabel";

export interface SecretFieldProps {
  /** Form path of the secret, e.g. "stripe.secretKey". */
  name: string;
  label: string;
  /** Masked stored value from store.secretHints[...] (e.g. "••••8f2a"); empty when nothing is saved. */
  hint?: string;
  placeholder?: string;
  /** Hide the label above the input (e.g. when used inside a SettingsRow). */
  hideLabel?: boolean;
  disabled?: boolean;
  id?: string;
}

/** Nested error lookup ("stripe.secretKey" → errors.stripe.secretKey.message). */
const errorAt = (errors: unknown, path: string): string | undefined => {
  const node = path.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), errors);
  const msg = node && typeof node === "object" ? (node as { message?: unknown }).message : undefined;
  return typeof msg === "string" ? msg : undefined;
};

/**
 * Write-only secret input bound to the surrounding FormProvider. Secrets are never shown —
 * the saved one appears only as a masked hint, and leaving the field empty keeps it unchanged.
 */
export function SecretField({ name, label, hint, placeholder, hideLabel, disabled, id }: SecretFieldProps) {
  const autoId = useId();
  const inputId = id ?? `secret-${autoId}`;
  const [visible, setVisible] = useState(false);
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<FieldValues>();
  const value = (useWatch({ control, name: name as Path<FieldValues> }) as string | undefined) ?? "";
  const error = errorAt(errors, name);

  return (
    <div className="w-full">
      {!hideLabel && <FieldLabel htmlFor={inputId} label={label} />}
      <InputField
        id={inputId}
        type={visible ? "text" : "password"}
        autoComplete="new-password"
        spellCheck={false}
        disabled={disabled}
        aria-label={hideLabel ? label : undefined}
        aria-invalid={!!error}
        error={error}
        placeholder={placeholder ?? (hint ? "Enter a new value to replace it" : "Paste your key")}
        className="font-mono"
        leftElement={<KeyRound className="h-4 w-4" />}
        rightElement={
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => setVisible((v) => !v)}
            disabled={disabled}
            aria-label={visible ? `Hide ${label}` : `Show ${label}`}
            className="flex h-7 w-7 items-center justify-center rounded-md text-primary-300 transition-colors hover:bg-slate-100 hover:text-primary-500 disabled:opacity-50"
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </motion.button>
        }
        {...register(name as Path<FieldValues>)}
      />
      {!error && (
        <p className="mt-1.5 flex items-center gap-1.5 body-xsm-regular text-primary-300">
          {hint ? (
            value ? (
              <>The saved key will be replaced when you save.</>
            ) : (
              <>
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-green" />
                <span>
                  Saved: <span className="font-mono text-primary-500">{hint}</span> — leave empty to keep
                </span>
              </>
            )
          ) : (
            <>Not set yet. Stored encrypted and never shown again after saving.</>
          )}
        </p>
      )}
    </div>
  );
}

export default SecretField;
