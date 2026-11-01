import { z } from "zod";

/**
 * Owner Console settings (/console/settings): the platform owner's company details, how subscription
 * fees are billed and collected, trial & dunning rules and which lifecycle emails go to institutions.
 * Persisted by src/lib/consoleSettingsStorage.ts (localStorage `edupro_console_settings_v1`).
 */

export const CONSOLE_SETTINGS_SECTIONS = ["company", "billing", "trials", "email"] as const;
export type ConsoleSettingsSection = (typeof CONSOLE_SETTINGS_SECTIONS)[number];

const optionalUrl = z
  .string()
  .trim()
  .refine((v) => !v || /^https?:\/\/[^\s.]+\.[^\s]+$/i.test(v), "Enter a full URL starting with https://");

export const companySettingsSchema = z.object({
  legalName: z.string().trim().min(2, "Legal name must be at least 2 characters").max(120, "Keep it under 120 characters"),
  address: z.string().trim().min(5, "Enter the registered address").max(300, "Keep it under 300 characters"),
  supportEmail: z.string().trim().min(1, "Support email is required").email("Enter a valid email address"),
  website: optionalUrl,
  taxId: z.string().trim().max(40, "Keep it under 40 characters"),
  logoUrl: z.string(),
});

export const GATEWAY_KEYS = ["stripe", "sslcommerz", "bkash"] as const;
export type ConsoleGatewayKey = (typeof GATEWAY_KEYS)[number];

const gatewaySchema = z.object({
  enabled: z.boolean(),
  mode: z.enum(["LIVE", "TEST"]),
  publicKey: z.string().trim().max(200, "Key is too long"),
  /** Write-only: empty keeps the saved secret. */
  secretKey: z.string().trim().max(200, "Key is too long"),
});

export const billingSettingsSchema = z
  .object({
    currency: z.enum(["USD"]),
    taxRate: z.number({ error: "Enter a tax rate" }).min(0, "Tax can't be negative").max(30, "Tax can be at most 30%"),
    invoicePrefix: z
      .string()
      .trim()
      .regex(/^[A-Z]{2,6}$/, "Use 2–6 capital letters, e.g. EDP"),
    invoiceFooter: z.string().trim().max(200, "Keep it under 200 characters"),
    stripe: gatewaySchema,
    sslcommerz: gatewaySchema,
    bkash: gatewaySchema,
  })
  .superRefine((v, ctx) => {
    GATEWAY_KEYS.forEach((key) => {
      if (v[key].enabled && !v[key].publicKey)
        ctx.addIssue({ code: "custom", path: [key, "publicKey"], message: "Add the public key before enabling this gateway" });
    });
    if (!GATEWAY_KEYS.some((key) => v[key].enabled))
      ctx.addIssue({ code: "custom", path: ["stripe", "enabled"], message: "Enable at least one gateway to collect subscription fees" });
  });

export const trialsSettingsSchema = z
  .object({
    defaultTrialDays: z.number({ error: "Enter the trial length" }).int("Use whole days").min(0, "Can't be negative").max(90, "Trials can be at most 90 days"),
    requireCardForTrial: z.boolean(),
    gracePeriodDays: z.number({ error: "Enter the grace period" }).int("Use whole days").min(0, "Can't be negative").max(60, "At most 60 days"),
    retryScheduleDays: z
      .array(z.number().int().min(1).max(30))
      .min(1, "Add at least one retry")
      .max(6, "At most 6 retries"),
    suspendAfterGrace: z.boolean(),
  })
  .superRefine((v, ctx) => {
    const last = v.retryScheduleDays[v.retryScheduleDays.length - 1] ?? 0;
    if (v.suspendAfterGrace && last > v.gracePeriodDays)
      ctx.addIssue({
        code: "custom",
        path: ["retryScheduleDays"],
        message: `The last retry (day ${last}) is after the ${v.gracePeriodDays}-day grace period`,
      });
  });

export const emailSettingsSchema = z.object({
  senderName: z.string().trim().min(2, "Sender name is required").max(60, "Keep it under 60 characters"),
  replyTo: z.string().trim().min(1, "Reply-to email is required").email("Enter a valid email address"),
  trialEnding: z.boolean(),
  trialEndingDays: z.number({ error: "Enter the number of days" }).int("Use whole days").min(1, "At least 1 day").max(14, "At most 14 days"),
  paymentFailed: z.boolean(),
  receipt: z.boolean(),
  renewalReminder: z.boolean(),
  cancellation: z.boolean(),
  welcome: z.boolean(),
});

export const consoleSettingsSchema = z.object({
  company: companySettingsSchema,
  billing: billingSettingsSchema,
  trials: trialsSettingsSchema,
  email: emailSettingsSchema,
});

export type CompanySettings = z.infer<typeof companySettingsSchema>;
export type BillingSettings = z.infer<typeof billingSettingsSchema>;
export type TrialsSettings = z.infer<typeof trialsSettingsSchema>;
export type EmailSettings = z.infer<typeof emailSettingsSchema>;
export type ConsoleSettings = z.infer<typeof consoleSettingsSchema>;

export const CONSOLE_SETTINGS_SCHEMAS = {
  company: companySettingsSchema,
  billing: billingSettingsSchema,
  trials: trialsSettingsSchema,
  email: emailSettingsSchema,
} as const;
