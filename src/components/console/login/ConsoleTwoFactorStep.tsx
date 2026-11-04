"use client";

import React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { OtpInput } from "@/components/auth/OtpInput";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import { AuthAlertBanner } from "@/components/auth/AuthAlertBanner";
import { twoFactorCodeSchema, type TwoFactorCodeFormData } from "@/validations/authSchema";

export interface ConsoleTwoFactorStepProps {
  email: string;
  isSubmitting: boolean;
  serverError: string | null;
  onClearError: () => void;
  onSubmit: (code: string) => void;
  onBack: () => void;
}

/** Second Owner Console sign-in step for owner accounts with two-factor authentication. */
export function ConsoleTwoFactorStep({ email, isSubmitting, serverError, onClearError, onSubmit, onBack }: ConsoleTwoFactorStepProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TwoFactorCodeFormData>({ resolver: zodResolver(twoFactorCodeSchema), defaultValues: { digits: ["", "", "", "", "", ""] } });

  return (
    <motion.form
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      onSubmit={handleSubmit((v) => onSubmit(v.digits.join("")))}
      className="space-y-5 text-left"
    >
      <AuthAlertBanner message={serverError} title="Verification failed" onClose={onClearError} />

      <div className="flex items-start gap-3 rounded-xl border border-dash bg-brand-orange-light p-4">
        <ShieldCheck className="h-5 w-5 shrink-0 text-brand-orange" />
        <div>
          <p className="body-sm-medium text-primary-500">Two-factor authentication</p>
          <p className="body-xsm-regular text-primary-300">
            Open your authenticator app and enter the 6-digit code for <span className="body-xsm-medium text-primary-400">{email}</span>.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Controller
          name="digits"
          control={control}
          render={({ field }) => <OtpInput value={field.value} onChange={field.onChange} error={!!errors.digits} disabled={isSubmitting} autoFocus />}
        />
        {errors.digits && <p className="body-xsm-regular text-red">{errors.digits.message ?? "Enter the 6-digit code from your authenticator app"}</p>}
      </div>

      <AuthSubmitButton isSubmitting={isSubmitting} submittingText="Verifying...">
        Verify and sign in
      </AuthSubmitButton>

      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={onBack}
        disabled={isSubmitting}
        className="mx-auto flex items-center gap-1.5 body-sm-medium text-primary-300 hover:text-primary-500 disabled:opacity-50"
      >
        <ArrowLeft className="h-4 w-4" />
        Use a different account
      </motion.button>
    </motion.form>
  );
}

export default ConsoleTwoFactorStep;
