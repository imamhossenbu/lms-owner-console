import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please provide a valid administrative email"),
  password: z
    .string()
    .min(1, "Security password is required")
    .min(6, "Password must contain at least 6 characters"),
  rememberMe: z.boolean(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/** 6-digit authenticator code (second sign-in step), one input per digit. */
export const twoFactorCodeSchema = z.object({
  digits: z
    .array(z.string())
    .length(6)
    .refine((d) => d.every((x) => /^\d$/.test(x)), "Enter the 6-digit code from your authenticator app"),
});
export type TwoFactorCodeFormData = z.infer<typeof twoFactorCodeSchema>;
