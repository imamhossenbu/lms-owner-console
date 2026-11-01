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
import { CONSOLE_OWNER, startConsoleSession } from "../shell/consoleSession";

/** Mock owner credentials (MOCK-DATA phase — replaced by the real auth API later). */
const DEMO_PASSWORD = "owner123";
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Owner Console sign-in form (react-hook-form + zod, loading → success / error toasts). */
export function ConsoleLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: CONSOLE_OWNER.email, password: DEMO_PASSWORD, rememberMe: true },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    const toastId = toast.loading("Signing in to the Owner Console...", { description: "Verifying platform owner credentials" });
    await wait(700);
    if (data.email.trim().toLowerCase() !== CONSOLE_OWNER.email || data.password !== DEMO_PASSWORD) {
      const message = "These credentials don't belong to a platform owner account.";
      setServerError(message);
      toast.error("Sign-in failed", { id: toastId, description: message });
      return;
    }
    startConsoleSession(data.email);
    toast.success(`Welcome back, ${CONSOLE_OWNER.name.split(" ")[0]}!`, { id: toastId, description: "Opening the Owner Console..." });
    const next = params.get("next");
    router.push(next && next.startsWith("/") && next !== "/login" ? next : "/");
  };

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
        <p className="rounded-xl border border-dash bg-gray-bg px-4 py-3 body-xsm-regular text-primary-400">
          Demo owner: <span className="body-xsm-medium text-primary-500">{CONSOLE_OWNER.email}</span> / <span className="body-xsm-medium text-primary-500">{DEMO_PASSWORD}</span>
        </p>
      </form>
    </>
  );
}

export default ConsoleLoginForm;
