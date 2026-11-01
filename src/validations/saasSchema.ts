import { z } from "zod";
import { BILLING_CYCLES, FEATURE_KEYS, INSTITUTION_TYPES, PAYMENT_BRANDS, SAAS_COUNTRIES, SAAS_ROOT_DOMAIN } from "@/types/saas";

/**
 * Zod schemas for the SaaS layer (Owner Console + institution billing/signup).
 *
 * - `planFormSchema`          plan editor (Console › Plans & pricing). Limits use `null` for unlimited. The yearly
 *                             discount is DERIVED from priceMonthly / priceYearly (`yearlyDiscountPct()` in saasStats) —
 *                             priceYearly is the single source of truth, so there is no separate discount field.
 * - `institutionFormSchema`   create / edit institution (Console › Institutions). Slug rules below.
 * - `customDomainSchema`      add a custom domain (Console › Domains, institution Settings › Domain).
 * - `signupSchema`            public self-signup (/signup) — starts a free trial.
 * - `paymentMethodSchema`     update card / wallet (trial conversion, billing page).
 * - `slugSchema`, `isReservedSlug`, `normalizeSlug`, `RESERVED_SLUGS`, `SLUG_REGEX`, `HOSTNAME_REGEX` helpers.
 *
 * Slug availability (uniqueness) is async — check with `isSlugAvailable()` from src/lib/saasStorage.ts;
 * storage mutations re-check and throw a friendly Error when a slug is taken.
 */

export const SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])$/;
export const RESERVED_SLUGS = ["www", "console", "app", "api", "admin", "mail", "support", "help", "status"] as const;
export const HOSTNAME_REGEX = /^(?=.{4,253}$)(?!-)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const NAME_MAX = 80;
export const NOTES_MAX = 1000;
export const TAGLINE_MAX = 120;

export const isReservedSlug = (slug: string) => (RESERVED_SLUGS as readonly string[]).includes(slug.trim().toLowerCase());

/** "Dhaka Coding Academy!" → "dhaka-coding-academy" (max 32 chars, no edge hyphens). */
export function normalizeSlug(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 32)
    .replace(/^-+|-+$/g, "");
}

export const slugSchema = z
  .string()
  .trim()
  .min(3, "Subdomain must be at least 3 characters")
  .max(32, "Subdomain must be 32 characters or less")
  .regex(SLUG_REGEX, "Use lowercase letters, numbers and hyphens (not at the start or end)")
  .refine((s) => !isReservedSlug(s), "This subdomain is reserved — choose another");

const emailSchema = z.string().trim().min(1, "Email is required").max(254, "Email is too long").regex(EMAIL_RE, "Enter a valid email address");
const nameSchema = (label: string) =>
  z.string().trim().min(2, `${label} must be at least 2 characters`).max(NAME_MAX, `${label} must be ${NAME_MAX} characters or less`);

// ---------------------------------------------------------------- plan editor

/** A limit is a whole number ≥ 1, or null (unlimited). */
const limitSchema = (label: string) =>
  z
    .number({ error: `${label} limit must be a number` })
    .int(`${label} limit must be a whole number`)
    .min(1, `${label} limit must be at least 1`)
    .max(10_000_000, `${label} limit is too large`)
    .nullable();

export const planFormSchema = z
  .object({
    name: z.string().trim().min(2, "Plan name must be at least 2 characters").max(30, "Plan name must be 30 characters or less"),
    tagline: z.string().trim().min(4, "Add a short tagline").max(TAGLINE_MAX, `${TAGLINE_MAX} characters or less`),
    priceMonthly: z.number({ error: "Monthly price must be a number" }).min(0, "Price can't be negative").max(100_000, "Price is too high"),
    priceYearly: z.number({ error: "Yearly price must be a number" }).min(0, "Price can't be negative").max(1_200_000, "Price is too high"),
    limits: z.object({
      students: limitSchema("Students"),
      courses: limitSchema("Courses"),
      teamMembers: limitSchema("Team members"),
      storageGb: limitSchema("Storage"),
    }),
    features: z.array(z.enum(FEATURE_KEYS)).refine((f) => new Set(f).size === f.length, "Duplicate features"),
    highlighted: z.boolean(),
    isPublic: z.boolean(),
    trialDays: z.number({ error: "Trial days must be a number" }).int("Whole days only").min(0, "Can't be negative").max(60, "Trials are limited to 60 days"),
  })
  .superRefine((v, ctx) => {
    if (v.priceMonthly > 0 && v.priceYearly <= 0)
      ctx.addIssue({ code: "custom", path: ["priceYearly"], message: "Set a yearly price (or 0 for both to mark the plan custom-priced)" });
    if (v.priceMonthly === 0 && v.priceYearly > 0)
      ctx.addIssue({ code: "custom", path: ["priceMonthly"], message: "Set a monthly price too" });
    if (v.priceMonthly > 0 && v.priceYearly > v.priceMonthly * 12)
      ctx.addIssue({ code: "custom", path: ["priceYearly"], message: "Yearly price should not exceed 12 × the monthly price" });
  });

export type PlanFormValues = z.infer<typeof planFormSchema>;

// ---------------------------------------------------------------- institution (owner create / edit)

export const institutionFormSchema = z
  .object({
    name: nameSchema("Institution name"),
    type: z.enum(INSTITUTION_TYPES, { error: "Choose an institution type" }),
    country: z.enum(SAAS_COUNTRIES, { error: "Choose a country" }),
    ownerName: nameSchema("Owner name"),
    ownerEmail: emailSchema,
    phone: z
      .string()
      .trim()
      .max(20, "Phone number is too long")
      .refine((v) => v === "" || /^\+?[0-9 ()-]{7,20}$/.test(v), "Enter a valid phone number"),
    slug: slugSchema,
    planId: z.string({ error: "Choose a plan" }).trim().min(1, "Choose a plan"),
    cycle: z.enum(BILLING_CYCLES),
    startWithTrial: z.boolean(),
    trialDays: z.number({ error: "Trial days must be a number" }).int("Whole days only").min(1, "At least 1 day").max(60, "Trials are limited to 60 days"),
    notes: z.string().trim().max(NOTES_MAX, `${NOTES_MAX} characters or less`),
  });

export type InstitutionFormValues = z.infer<typeof institutionFormSchema>;

export const institutionFormDefaults: InstitutionFormValues = {
  name: "",
  type: "SCHOOL",
  country: "Bangladesh",
  ownerName: "",
  ownerEmail: "",
  phone: "",
  slug: "",
  planId: "growth",
  cycle: "MONTHLY",
  startWithTrial: true,
  trialDays: 14,
  notes: "",
};

// ---------------------------------------------------------------- custom domain

export const customDomainSchema = z.object({
  domain: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Enter a domain")
    .transform((d) => d.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/\.$/, ""))
    .pipe(
      z
        .string()
        .regex(HOSTNAME_REGEX, "Enter a valid domain, e.g. learn.yourschool.com")
        .refine((d) => d !== SAAS_ROOT_DOMAIN && !d.endsWith(`.${SAAS_ROOT_DOMAIN}`), `Use your own domain — ${SAAS_ROOT_DOMAIN} addresses are assigned automatically`)
    ),
});

export type CustomDomainFormInput = z.input<typeof customDomainSchema>;
export type CustomDomainFormValues = z.output<typeof customDomainSchema>;

// ---------------------------------------------------------------- payment method

export const paymentMethodSchema = z.object({
  brand: z.enum(PAYMENT_BRANDS, { error: "Choose a payment method" }),
  last4: z.string().trim().regex(/^\d{4}$/, "Enter the last 4 digits"),
});

export type PaymentMethodFormValues = z.infer<typeof paymentMethodSchema>;

// ---------------------------------------------------------------- public signup

/** Default self-signup tiers (kept for compatibility — signup should list the store's public, non-archived plans). */
export const SIGNUP_PLAN_IDS = ["starter", "growth", "pro"] as const;

export const signupSchema = z.object({
  name: nameSchema("Your name"),
  email: emailSchema,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long")
    .regex(/[A-Za-z]/, "Include at least one letter")
    .regex(/[0-9]/, "Include at least one number"),
  institutionName: nameSchema("Institution name"),
  type: z.enum(INSTITUTION_TYPES, { error: "Choose an institution type" }),
  country: z.enum(SAAS_COUNTRIES, { error: "Choose a country" }),
  slug: slugSchema,
  /** Any public, non-archived plan id (checked by `signupInstitution`). */
  planId: z.string({ error: "Choose a plan" }).trim().min(1, "Choose a plan"),
  cycle: z.enum(BILLING_CYCLES),
  agreeTerms: z.literal(true, { error: "You must accept the Terms of Service and Privacy Policy" }),
});

export type SignupFormValues = z.infer<typeof signupSchema>;
