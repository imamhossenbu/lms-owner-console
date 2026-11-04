import type { BillingCycle, Institution, PaymentMethod, Plan, PlanId, SaasEvent, SaasInvoice, SaasStore } from "@/types/saas";
import type { InstitutionFormValues, PlanFormValues } from "@/validations/saasSchema";
import { normalizeSlug } from "@/validations/saasSchema";
import { toast } from "sonner";
import { api } from "@/lib/api/client";

/**
 * Owner Console data layer, backed by the EduPro API (`/saas/owner/*`).
 *
 * Reads
 *  - The whole SaaS state comes from `GET /saas/owner/snapshot` and is cached in memory.
 *    `getSaasSnapshot()` is sync and returns the same object until the next refresh, so it's safe for
 *    useSyncExternalStore. `fetchSaas()` loads or refreshes it; `subscribeSaas(cb)` fires after every refresh.
 *  - `getPlan(id)`, `getInstitution(id)`, `checkSlugAvailability(slug, exceptId?)`.
 * Mutations call the matching endpoint, then refresh the snapshot, even when the call fails (a declined
 * retry still marks the invoice FAILED). They throw `ApiError`s with friendly messages; showing the toast
 * (loading → success / error) is the caller's job.
 */

export const SAAS_UPDATED_EVENT = "edupro_saas_updated";

const EMPTY_STORE: SaasStore = { plans: [], institutions: [], invoices: [], events: [], currentInstitutionId: "" };
let store: SaasStore = EMPTY_STORE;
let inflight: Promise<SaasStore> | null = null;
/** True once the first snapshot request finished (even if it failed — pages then show their empty state). */
let settled = false;

const notify = () => typeof window !== "undefined" && window.dispatchEvent(new Event(SAAS_UPDATED_EVENT));

/** Subscribe to snapshot refreshes. Returns unsubscribe. */
export function subscribeSaas(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => queueMicrotask(onChange);
  window.addEventListener(SAAS_UPDATED_EVENT, handler);
  return () => window.removeEventListener(SAAS_UPDATED_EVENT, handler);
}

/** Sync snapshot: empty until the first `fetchSaas()` resolves. */
export const getSaasSnapshot = (): SaasStore => store;

/** Loads the snapshot from the API. Concurrent calls share one request. */
export function fetchSaas(): Promise<SaasStore> {
  inflight ??= api
    .get<Omit<SaasStore, "currentInstitutionId">>("/saas/owner/snapshot")
    .then((s) => {
      store = { ...s, currentInstitutionId: "" };
      return store;
    })
    .finally(() => {
      inflight = null;
      settled = true;
      notify();
    });
  return inflight;
}

export const isSaasSettled = () => settled;

/** Background refresh for page mounts: a failure shows one toast instead of throwing. */
export function refreshSaasQuietly() {
  fetchSaas().catch((err: unknown) =>
    toast.error("Couldn't load platform data", { id: "saas-load", description: err instanceof Error ? err.message : "Please refresh the page." }),
  );
}

export const getInstitution = (id: string, s: SaasStore = store) => s.institutions.find((i) => i.id === id) ?? null;
export const getPlan = (id: PlanId, s: SaasStore = store) => s.plans.find((p) => p.id === id) ?? null;

/** Runs an API call, then refreshes the snapshot (also after a failure, which may have changed state). */
async function mutate<T>(call: () => Promise<T>): Promise<T> {
  try {
    return await call();
  } finally {
    await fetchSaas().catch(() => undefined);
  }
}

const enc = encodeURIComponent;
const inst = (id: string, action = "") => `/saas/owner/institutions/${enc(id)}${action}`;

// ---------------------------------------------------------------- slugs

export type SlugCheck = { available: true } | { available: false; reason: string };

/** Availability with a reason (format, reserved, taken). Debounce in the UI. */
export const checkSlugAvailability = (slug: string, exceptId?: string) =>
  api.get<SlugCheck>("/saas/owner/institutions/slug-availability", { slug: slug.trim().toLowerCase(), exceptId });

// ---------------------------------------------------------------- institutions

/** Owner creates an institution (trial, or active with an open first invoice). */
export const createInstitution = (values: InstitutionFormValues) => mutate(() => api.post<Institution>("/saas/owner/institutions", values));

export type InstitutionPatch = Partial<Pick<Institution, "name" | "type" | "country" | "ownerName" | "ownerEmail" | "phone" | "slug" | "notes" | "tone">>;

export const updateInstitution = (id: string, patch: InstitutionPatch) => mutate(() => api.patch<Institution>(inst(id), patch));

/** Appends an owner note to the activity timeline. */
export const addNote = (id: string, note: string) => mutate(() => api.post<SaasEvent>(inst(id, "/notes"), { note: note.trim() }));

/** "Open as owner": a 1-hour admin token for the institution's panel. */
export const impersonateInstitution = (id: string) => mutate(() => api.post<{ token: string; expiresIn: number; institution: Institution }>(inst(id, "/impersonate")));

// ---------------------------------------------------------------- subscription

export interface ChangePlanResult {
  institution: Institution;
  invoice: SaasInvoice | null;
  kind: "UPGRADE" | "DOWNGRADE" | "CYCLE";
}

/** Immediate plan / cycle change (prorated invoice on upgrades; rejected when usage exceeds the target limits). */
export const changePlan = (institutionId: string, planId: PlanId, cycle: BillingCycle) =>
  mutate(() => api.post<ChangePlanResult>(inst(institutionId, "/change-plan"), { planId, cycle }));

/** `atPeriodEnd` keeps access until the period ends; otherwise cancels now and voids unpaid invoices. */
export const cancelSubscription = (institutionId: string, atPeriodEnd: boolean) => mutate(() => api.post<Institution>(inst(institutionId, "/cancel"), { atPeriodEnd }));

/** Undoes a scheduled cancellation, or restarts a cancelled subscription with a fresh period + invoice. */
export const reactivateSubscription = (institutionId: string) => mutate(() => api.post<Institution>(inst(institutionId, "/reactivate")));

export const suspendInstitution = (institutionId: string, reason: string) => mutate(() => api.post<Institution>(inst(institutionId, "/suspend"), { reason: reason.trim() }));

export const unsuspendInstitution = (institutionId: string) => mutate(() => api.post<Institution>(inst(institutionId, "/unsuspend")));

export const extendTrial = (institutionId: string, days: number) => mutate(() => api.post<Institution>(inst(institutionId, "/extend-trial"), { days }));

export const updatePaymentMethod = (institutionId: string, paymentMethod: PaymentMethod) =>
  mutate(() => api.patch<Institution>(inst(institutionId, "/payment-method"), paymentMethod));

// ---------------------------------------------------------------- invoices

const invoice = (id: string, action: string) => `/saas/owner/invoices/${enc(id)}/${action}`;

/** Charges the payment method on file again (declines leave the invoice FAILED). */
export const retryInvoice = (invoiceId: string) => mutate(() => api.post<SaasInvoice>(invoice(invoiceId, "retry")));
export const refundInvoice = (invoiceId: string) => mutate(() => api.post<SaasInvoice>(invoice(invoiceId, "refund")));
/** Records an offline payment (bank transfer, cash, manual bKash). */
export const markInvoicePaid = (invoiceId: string) => mutate(() => api.post<SaasInvoice>(invoice(invoiceId, "mark-paid")));
export const voidInvoice = (invoiceId: string) => mutate(() => api.post<SaasInvoice>(invoice(invoiceId, "void")));

// ---------------------------------------------------------------- custom domains

export const addCustomDomain = (institutionId: string, domain: string) => mutate(() => api.post<Institution>(inst(institutionId, "/domain"), { domain }));
/** Checks the CNAME / TXT records; throws with a friendly message when they aren't found yet. */
export const verifyCustomDomain = (institutionId: string) => mutate(() => api.post<Institution>(inst(institutionId, "/domain/verify")));
export const removeCustomDomain = (institutionId: string) => mutate(() => api.delete<Institution>(inst(institutionId, "/domain")));

// ---------------------------------------------------------------- plans

/** Updates a plan. Only one plan can be highlighted — highlighting this one clears the others. */
export const savePlan = (id: PlanId, values: PlanFormValues) => mutate(() => api.put<Plan>(`/saas/owner/plans/${enc(id)}`, values));

/** Preview of the id a new custom plan gets: `plan-<slug>` (then `plan-<slug>-2`, …). */
export function customPlanId(name: string, plans: Plan[] = store.plans) {
  const base = `plan-${normalizeSlug(name) || "custom"}`;
  let id = base;
  for (let n = 2; plans.some((p) => p.id === id); n++) id = `${base}-${n}`;
  return id;
}

export const createPlan = (values: PlanFormValues) => mutate(() => api.post<Plan>("/saas/owner/plans", values));

/** Archived plans disappear from signup / plan pickers; existing subscribers keep them. */
export const archivePlan = (id: PlanId, archived = true) => mutate(() => api.patch<Plan>(`/saas/owner/plans/${enc(id)}/archive`, { archived }));
