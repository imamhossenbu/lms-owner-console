"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { loginSchema, type LoginFormData } from "@/validations/authSchema";
import { InputField } from "@/components/ui/InputField";
import { AuthAlertBanner } from "@/components/auth/AuthAlertBanner";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import { authApi } from "@/lib/api/auth";
import { startConsoleSession } from "../shell/consoleSession";
import { ConsoleTwoFactorStep } from "./ConsoleTwoFactorStep";

const PLATFORM_OWNER_ROLE = "SUPER_ADMIN";
const errorText = (err: unknown) => (err instanceof Error ? err.message : "Sign-in failed. Please try again.");

/** Owner Console sign-in (react-hook-form + zod): password → optional 2FA code → platform-owner check. */
export function ConsoleLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<{ token: string; email: string } | null>(null);
  const [verifying, setVerifying] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "", rememberMe: true },
  });

  /** Only platform owners may use the console; anyone else is turned away before a session is stored. */
  const finishSignIn = async (token: string, toastId: string | number) => {
    const profile = await authApi.profile(token);
    if (profile.role !== PLATFORM_OWNER_ROLE) throw new Error("These credentials don't belong to a platform owner account.");
    startConsoleSession(token, profile);
    toast.success(`Welcome back, ${profile.name.split(" ")[0] || "owner"}!`, { id: toastId, description: "Opening the Owner Console..." });
    const next = params.get("next");
    router.push(next && next.startsWith("/") && !next.startsWith("//") && next !== "/login" ? next : "/");
  };

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    const toastId = toast.loading("Signing in to the Owner Console...", { description: "Verifying platform owner credentials" });
    try {
      const email = data.email.trim().toLowerCase();
      const res = await authApi.login(email, data.password);
      if (res.twoFactorRequired) {
        setChallenge({ token: res.challengeToken, email });
        toast.info("Enter your authentication code", { id: toastId, description: "Open your authenticator app to finish signing in." });
        return;
      }
      await finishSignIn(res.token, toastId);
    } catch (err) {
      setServerError(errorText(err));
      toast.error("Sign-in failed", { id: toastId, description: errorText(err) });
    }
  };

  const onSubmitCode = async (code: string) => {
    if (!challenge) return;
    setServerError(null);
    setVerifying(true);
    const toastId = toast.loading("Verifying code...", { description: challenge.email });
    try {
      const res = await authApi.twoFactorLogin(challenge.token, code);
      await finishSignIn(res.token, toastId);
    } catch (err) {
      setServerError(errorText(err));
      toast.error("Verification failed", { id: toastId, description: errorText(err) });
      setVerifying(false);
    }
  };

  if (challenge)
    return (
      <ConsoleTwoFactorStep
        email={challenge.email}
        isSubmitting={verifying}
        serverError={serverError}
        onClearError={() => setServerError(null)}
        onSubmit={onSubmitCode}
        onBack={() => {
          setChallenge(null);
          setServerError(null);
        }}
      />
    );

  return (
    <>
      <AuthAlertBanner message={serverError} title="Sign-in notice" onClose={() => setServerError(null)} />
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5 text-left">
        <InputField
          id="console-email"
          type="email"
          label="Owner email"
          autoComplete="email"
          placeholder="you@edupro.com"
          leftElement={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register("email")}
        />
        <InputField
          id="console-password"
          type={showPassword ? "text" : "password"}
          label="Password"
          autoComplete="current-password"
          placeholder="Enter your password"
          leftElement={<Lock className="h-4 w-4" />}
          rightElement={
            <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"} className="cursor-pointer p-1 transition-colors hover:text-brand-orange">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          error={errors.password?.message}
          {...register("password")}
        />
        <label className="flex cursor-pointer select-none items-center gap-2">
          <input type="checkbox" {...register("rememberMe")} className="h-4 w-4 cursor-pointer rounded border-dash accent-brand-orange" />
          <span className="body-sm-regular text-primary-400">Keep me signed in on this device</span>
        </label>
        <AuthSubmitButton isSubmitting={isSubmitting} submittingText="Signing in...">
          Sign in to Console
        </AuthSubmitButton>
      </form>
    </>
  );
}

export default ConsoleLoginForm;
