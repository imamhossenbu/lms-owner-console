import type {
  BillingCycle,
  Institution,
  InstitutionSource,
  LimitKey,
  PaymentMethod,
  Plan,
  PlanId,
  SaasActor,
  SaasEvent,
  SaasEventType,
  SaasInvoice,
  SaasStore,
  SubscriptionStatus,
} from "@/types/saas";
import { SAAS_CNAME_TARGET, SAAS_ROOT_DOMAIN } from "@/types/saas";
import type { InstitutionFormValues, PlanFormValues, SignupFormValues } from "@/validations/saasSchema";
import { customDomainSchema, isReservedSlug, normalizeSlug, paymentMethodSchema, SLUG_REGEX } from "@/validations/saasSchema";
import { addMonthsUtc, buildSaasSeed, SAAS_TRIAL_DAYS, taxFor } from "@/data/mockSaasData";
import { findPlan, planChangePreview, priceFor, sortPlans, subscriptionPrice } from "@/lib/saasStats";

/**
 * Mock-first persistence for the SaaS layer (localStorage `edupro_saas_v1` + simulated latency).
 *
 * Reads
 *  - `getSaasSnapshot()` (sync, cached until SAAS_UPDATED_EVENT), `fetchSaas()` (async, latency),
 *    `getCurrentInstitution()`, `getPlan(id)`, `getInstitution(id)`, `isSlugAvailable(slug, exceptId?)`,
 *    `checkSlugAvailability(slug, exceptId?)` (async, with reason), `subscribeSaas(cb)`.
 * Invariant: no mutation changes `currentInstitutionId` except `setCurrentInstitution()` (owner impersonation)
 * and an explicit `signupInstitution(values, { switchTo: true })`. A cancelled / suspended current institution
 * stays current so the panel can show its state.
 * Mutations (all async, all throw friendly `Error`s, all append a SaasEvent and dispatch SAAS_UPDATED_EVENT;
 * toasts are the caller's job — loading → success / error):
 *  - institutions: `createInstitution(values, source)`, `updateInstitution(id, patch)`, `addNote(id, note)`,
 *    `setCurrentInstitution(id)` (owner "Open as owner (impersonate)"), `signupInstitution(values)`.
 *  - subscription: `changePlan(id, planId, cycle)` (immediate; upgrades/cycle switches create a prorated
 *    invoice; rejected when usage exceeds the target plan limits), `cancelSubscription(id, atPeriodEnd)`,
 *    `reactivateSubscription(id)`, `suspendInstitution(id, reason)`, `unsuspendInstitution(id)`,
 *    `extendTrial(id, days)`, `convertTrial(id, planId, cycle, paymentMethod)`, `updatePaymentMethod(id, pm)`.
 *  - invoices: `retryInvoice(id)` (mock: declines when no payment method or card •••• 0002),
 *    `refundInvoice(id)`, `markInvoicePaid(id)`, `voidInvoice(id)`.
 *  - domains: `addCustomDomain(id, domain)` (needs the customDomain feature), `verifyCustomDomain(id)`
 *    (mock: succeeds unless the domain contains "fail"), `removeCustomDomain(id)`.
 *  - plans: `savePlan(id, values)`, `createPlan(values)` (custom plan, id `plan-<slug>`), `customPlanId(name)`,
 *    `archivePlan(id, archived = true)`.
 *  - `resetSaasStore()` re-seeds (dev / demo).
 */

const STORAGE_KEY = "edupro_saas_v1";
export const SAAS_UPDATED_EVENT = "edupro_saas_updated";
const wait = (ms = 450) => new Promise((r) => setTimeout(r, ms));
const uid = (p: string) => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
const DAY = 86_400_000;
const nowIso = () => new Date().toISOString();
const money = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
const round2 = (n: number) => Math.round(n * 100) / 100;
const LIMIT_LABEL: Record<LimitKey, string> = { students: "Students", courses: "Courses", teamMembers: "Team members", storageGb: "Storage" };
const fmtLimitValue = (n: number, key: LimitKey) => (key === "storageGb" ? `${n.toLocaleString("en-US")} GB` : n.toLocaleString("en-US"));

// ---------------------------------------------------------------- read / write

let cache: { raw: string | null; store: SaasStore } | null = null;

function isValidStore(p: unknown): p is SaasStore {
  const s = p as SaasStore;
  return !!s && Array.isArray(s.plans) && Array.isArray(s.institutions) && Array.isArray(s.invoices) && Array.isArray(s.events) && typeof s.currentInstitutionId === "string";
}

function read(): SaasStore {
  if (typeof window === "undefined") {
    if (!cache) cache = { raw: null, store: buildSaasSeed() };
    return cache.store;
  }
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }
  if (cache && cache.raw === raw && raw !== null) return cache.store;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (isValidStore(parsed)) {
        cache = { raw, store: parsed };
        return parsed;
      }
    } catch {
      /* re-seed */
    }
  }
  const seed = buildSaasSeed();
  write(seed, false);
  return seed;
}

function write(store: SaasStore, notify = true) {
  if (typeof window === "undefined") {
    cache = { raw: null, store };
    return;
  }
  const raw = JSON.stringify(store);
  try {
    localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    throw new Error("Your browser storage is full. Clear some site data and try again.");
  }
  cache = { raw, store };
  if (notify) window.dispatchEvent(new Event(SAAS_UPDATED_EVENT));
}

/** Subscribe to store changes (same tab via SAAS_UPDATED_EVENT, other tabs via `storage`). Returns unsubscribe. */
export function subscribeSaas(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => queueMicrotask(onChange);
  const storageHandler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) handler();
  };
  window.addEventListener(SAAS_UPDATED_EVENT, handler);
  window.addEventListener("storage", storageHandler);
  return () => {
    window.removeEventListener(SAAS_UPDATED_EVENT, handler);
    window.removeEventListener("storage", storageHandler);
  };
}

/** Sync snapshot — the same object reference until the store changes (safe for useSyncExternalStore). */
export const getSaasSnapshot = (): SaasStore => read();

export async function fetchSaas(): Promise<SaasStore> {
  await wait(300);
  return read();
}

export const getInstitution = (id: string, store: SaasStore = read()) => store.institutions.find((i) => i.id === id) ?? null;
export const getCurrentInstitution = (store: SaasStore = read()) => getInstitution(store.currentInstitutionId, store) ?? store.institutions[0]!;
export const getPlan = (id: PlanId, store: SaasStore = read()) => findPlan(store.plans, id) ?? null;

export function resetSaasStore() {
  write(buildSaasSeed());
}

// ---------------------------------------------------------------- internals

function event(institutionId: string, type: SaasEventType, message: string, actor: SaasActor = "Owner", at = nowIso()): SaasEvent {
  return { id: uid("ev"), institutionId, type, message, at, actor };
}

function mustInstitution(store: SaasStore, id: string) {
  const inst = store.institutions.find((i) => i.id === id);
  if (!inst) throw new Error("This institution no longer exists.");
  return inst;
}
function mustPlan(store: SaasStore, id: PlanId) {
  const plan = findPlan(store.plans, id);
  if (!plan) throw new Error("This plan no longer exists.");
  return plan;
}
function mustInvoice(store: SaasStore, id: string) {
  const inv = store.invoices.find((i) => i.id === id);
  if (!inv) throw new Error("This invoice no longer exists.");
  return inv;
}

/** Applies `fn` to a deep copy and persists. `fn` returns the value handed back to the caller. */
function mutate<T>(fn: (draft: SaasStore) => T): T {
  const draft = structuredClone(read()) as SaasStore;
  const result = fn(draft);
  draft.events = draft.events.slice(0, 2000);
  write(draft);
  return result;
}

const patchInstitution = (draft: SaasStore, id: string, patch: (i: Institution) => Institution) => {
  draft.institutions = draft.institutions.map((i) => (i.id === id ? patch(i) : i));
  return mustInstitution(draft, id);
};

function nextInvoiceNumber(store: SaasStore, at: string) {
  const year = at.slice(0, 4);
  const max = store.invoices
    .filter((i) => i.number.startsWith(`EDP-${year}-`))
    .reduce((m, i) => Math.max(m, Number(i.number.split("-")[2]) || 0), 0);
  return `EDP-${year}-${String(max + 1).padStart(5, "0")}`;
}

function addInvoice(
  draft: SaasStore,
  inst: Institution,
  opts: { planId: PlanId; cycle: BillingCycle; amount: number; periodStart: string; periodEnd: string; paid: boolean; description: string }
): SaasInvoice {
  const issuedAt = nowIso();
  const amount = round2(opts.amount);
  const tax = taxFor(inst.country, amount);
  const invoice: SaasInvoice = {
    id: uid("inv"),
    number: nextInvoiceNumber(draft, issuedAt),
    institutionId: inst.id,
    planId: opts.planId,
    cycle: opts.cycle,
    amount,
    tax,
    total: round2(amount + tax),
    status: opts.paid ? "PAID" : "OPEN",
    issuedAt,
    dueAt: new Date(Date.now() + (opts.paid ? 0 : 7 * DAY)).toISOString(),
    paidAt: opts.paid ? issuedAt : null,
    periodStart: opts.periodStart,
    periodEnd: opts.periodEnd,
    description: opts.description,
  };
  draft.invoices = [invoice, ...draft.invoices];
  draft.events.unshift(
    opts.paid
      ? event(inst.id, "PAYMENT_SUCCEEDED", `Payment of ${money(invoice.total)} received (${invoice.number})`, "System")
      : event(inst.id, "NOTE", `Invoice ${invoice.number} for ${money(invoice.total)} issued — awaiting payment`, "System")
  );
  return invoice;
}

const periodEndFrom = (startIso: string, cycle: BillingCycle) => addMonthsUtc(startIso, cycle === "YEARLY" ? 12 : 1);

const planLabel = (store: SaasStore, id: PlanId) => findPlan(store.plans, id)?.name ?? id;
const cycleLabel = (c: BillingCycle) => (c === "YEARLY" ? "yearly" : "monthly");

/** Restores PAST_DUE → ACTIVE once no FAILED / OPEN invoice remains. */
function settleStatus(draft: SaasStore, institutionId: string) {
  const unpaid = draft.invoices.some((i) => i.institutionId === institutionId && (i.status === "FAILED" || i.status === "OPEN"));
  patchInstitution(draft, institutionId, (i) =>
    i.subscription.status === "PAST_DUE" && !unpaid ? { ...i, subscription: { ...i.subscription, status: "ACTIVE" } } : i
  );
}

const slugTaken = (store: SaasStore, slug: string, exceptId?: string) => store.institutions.some((i) => i.slug === slug && i.id !== exceptId);

const TONES: Institution["tone"][] = ["orange", "blue", "green", "purple", "yellow", "indigo"];
const initialsOf = (name: string) =>
  name
    .replace(/[^A-Za-z ]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("") || "IN";

// ---------------------------------------------------------------- slugs

/** Sync availability check (format + reserved + uniqueness). `exceptId` ignores that institution's own slug. */
export function isSlugAvailable(slug: string, exceptId?: string) {
  const s = slug.trim().toLowerCase();
  if (!SLUG_REGEX.test(s) || isReservedSlug(s)) return false;
  return !slugTaken(read(), s, exceptId);
}

export type SlugCheck = { available: true } | { available: false; reason: string };

/** Async availability check with a reason (debounce in the UI). */
export async function checkSlugAvailability(slug: string, exceptId?: string): Promise<SlugCheck> {
  await wait(250);
  const s = slug.trim().toLowerCase();
  if (!SLUG_REGEX.test(s)) return { available: false, reason: "Use 3–32 lowercase letters, numbers or hyphens" };
  if (isReservedSlug(s)) return { available: false, reason: "This subdomain is reserved" };
  if (slugTaken(read(), s, exceptId)) return { available: false, reason: `${s}.${SAAS_ROOT_DOMAIN} is already taken` };
  return { available: true };
}

// ---------------------------------------------------------------- institutions

function buildInstitution(
  draft: SaasStore,
  v: { name: string; type: Institution["type"]; country: string; ownerName: string; ownerEmail: string; phone: string; slug: string; planId: PlanId; cycle: BillingCycle; notes: string },
  trialDays: number | null,
  source: InstitutionSource
): Institution {
  const slug = v.slug.trim().toLowerCase();
  if (isReservedSlug(slug)) throw new Error("This subdomain is reserved — choose another.");
  if (slugTaken(draft, slug)) throw new Error(`${slug}.${SAAS_ROOT_DOMAIN} is already taken — choose another subdomain.`);
  if (draft.institutions.some((i) => i.ownerEmail.toLowerCase() === v.ownerEmail.trim().toLowerCase() && i.subscription.status !== "CANCELLED"))
    throw new Error("An active institution already uses this owner email.");
  mustPlan(draft, v.planId);
  const now = nowIso();
  const status: SubscriptionStatus = trialDays ? "TRIALING" : "ACTIVE";
  const trialEndsAt = trialDays ? new Date(Date.now() + trialDays * DAY).toISOString() : null;
  return {
    id: `inst-${slug}`,
    name: v.name.trim(),
    slug,
    logoInitials: initialsOf(v.name),
    tone: TONES[draft.institutions.length % TONES.length]!,
    type: v.type,
    country: v.country,
    ownerName: v.ownerName.trim(),
    ownerEmail: v.ownerEmail.trim().toLowerCase(),
    phone: v.phone.trim(),
    createdAt: now,
    lastActiveAt: now,
    subscription: {
      planId: v.planId,
      cycle: v.cycle,
      status,
      startedAt: now,
      trialEndsAt,
      currentPeriodStart: now,
      currentPeriodEnd: trialEndsAt ?? periodEndFrom(now, v.cycle),
      cancelAtPeriodEnd: false,
      cancelledAt: null,
      suspendedAt: null,
      suspendedReason: null,
      statusBeforeSuspend: null,
      customPrice: null,
      paymentMethod: null,
    },
    customDomain: null,
    usage: { students: 0, courses: 0, teamMembers: 1, storageGb: 0 },
    notes: v.notes.trim(),
    source,
  };
}

/** Owner creates an institution (Console › Institutions › Add). Without a trial an OPEN first invoice is issued. */
export async function createInstitution(values: InstitutionFormValues, source: InstitutionSource = "OWNER_CREATED"): Promise<Institution> {
  await wait();
  return mutate((draft) => {
    const inst = buildInstitution(draft, values, values.startWithTrial ? values.trialDays : null, source);
    draft.institutions = [inst, ...draft.institutions];
    const plan = mustPlan(draft, values.planId);
    draft.events.unshift(event(inst.id, "SIGNED_UP", `Institution created by the platform owner (${inst.slug}.${SAAS_ROOT_DOMAIN})`, "Owner"));
    if (values.startWithTrial) draft.events.unshift(event(inst.id, "TRIAL_STARTED", `${values.trialDays}-day free trial started on ${plan.name}`, "System"));
    else {
      const amount = priceFor(plan, values.cycle);
      if (amount > 0)
        addInvoice(draft, inst, {
          planId: plan.id,
          cycle: values.cycle,
          amount,
          periodStart: inst.subscription.currentPeriodStart,
          periodEnd: inst.subscription.currentPeriodEnd,
          paid: false,
          description: `${plan.name} plan — ${cycleLabel(values.cycle)} subscription`,
        });
    }
    if (inst.notes) draft.events.unshift(event(inst.id, "NOTE", inst.notes, "Owner"));
    return inst;
  });
}

export type InstitutionPatch = Partial<Pick<Institution, "name" | "type" | "country" | "ownerName" | "ownerEmail" | "phone" | "slug" | "notes" | "tone" | "usage" | "lastActiveAt">>;

export async function updateInstitution(id: string, patch: InstitutionPatch): Promise<Institution> {
  await wait();
  return mutate((draft) => {
    const before = mustInstitution(draft, id);
    if (patch.slug !== undefined) {
      const slug = patch.slug.trim().toLowerCase();
      if (!SLUG_REGEX.test(slug) || isReservedSlug(slug)) throw new Error("Choose a valid, non-reserved subdomain.");
      if (slugTaken(draft, slug, id)) throw new Error(`${slug}.${SAAS_ROOT_DOMAIN} is already taken — choose another subdomain.`);
      patch = { ...patch, slug };
    }
    const after = patchInstitution(draft, id, (i) => ({
      ...i,
      ...patch,
      name: patch.name?.trim() ?? i.name,
      logoInitials: patch.name ? initialsOf(patch.name) : i.logoInitials,
      ownerEmail: patch.ownerEmail?.trim().toLowerCase() ?? i.ownerEmail,
    }));
    const changed = (Object.keys(patch) as (keyof InstitutionPatch)[]).filter((k) => k !== "lastActiveAt" && k !== "usage" && JSON.stringify(before[k]) !== JSON.stringify(after[k]));
    if (patch.slug && patch.slug !== before.slug)
      draft.events.unshift(event(id, "NOTE", `Subdomain changed ${before.slug}.${SAAS_ROOT_DOMAIN} → ${after.slug}.${SAAS_ROOT_DOMAIN}`, "Owner"));
    else if (changed.length === 1 && changed[0] === "notes") draft.events.unshift(event(id, "NOTE", "Internal notes updated", "Owner"));
    else if (changed.length) draft.events.unshift(event(id, "NOTE", `Details updated (${changed.join(", ")})`, "Owner"));
    return after;
  });
}

/** Appends a timestamped owner note to the activity timeline. */
export async function addNote(id: string, note: string): Promise<SaasEvent> {
  await wait(300);
  const text = note.trim();
  if (text.length < 2) throw new Error("Write a note first.");
  if (text.length > 1000) throw new Error("Notes are limited to 1,000 characters.");
  return mutate((draft) => {
    mustInstitution(draft, id);
    const ev = event(id, "NOTE", text, "Owner");
    draft.events.unshift(ev);
    return ev;
  });
}

/** Switches which institution the admin panel shows (owner impersonation / after signup). */
export async function setCurrentInstitution(id: string): Promise<Institution> {
  await wait(250);
  return mutate((draft) => {
    const inst = mustInstitution(draft, id);
    if (inst.subscription.status === "CANCELLED") throw new Error("This institution's workspace is closed.");
    draft.currentInstitutionId = id;
    draft.events.unshift(event(id, "NOTE", "Platform owner opened the institution panel (impersonation)", "Owner"));
    return inst;
  });
}

/**
 * Public self-signup: creates a TRIALING institution (plan trial length) and logs SIGNED_UP + TRIAL_STARTED.
 * Does NOT change `currentInstitutionId` unless the caller explicitly passes `{ switchTo: true }`.
 */
export async function signupInstitution(values: SignupFormValues, opts: { switchTo?: boolean } = {}): Promise<Institution> {
  await wait(700);
  return mutate((draft) => {
    const plan = mustPlan(draft, values.planId);
    if (plan.archived || !plan.isPublic) throw new Error("This plan isn't available for self-signup.");
    const trialDays = plan.trialDays || SAAS_TRIAL_DAYS;
    const inst = buildInstitution(
      draft,
      { name: values.institutionName, type: values.type, country: values.country, ownerName: values.name, ownerEmail: values.email, phone: "", slug: values.slug, planId: values.planId, cycle: values.cycle, notes: "" },
      trialDays,
      "SELF_SIGNUP"
    );
    draft.institutions = [inst, ...draft.institutions];
    draft.events.unshift(event(inst.id, "SIGNED_UP", `${inst.name} signed up at ${inst.slug}.${SAAS_ROOT_DOMAIN}`, "Institution"));
    draft.events.unshift(event(inst.id, "TRIAL_STARTED", `${trialDays}-day free trial started on ${plan.name}`, "System"));
    if (opts.switchTo === true) draft.currentInstitutionId = inst.id;
    return inst;
  });
}

// ---------------------------------------------------------------- subscription

export interface ChangePlanResult {
  institution: Institution;
  invoice: SaasInvoice | null;
  kind: "UPGRADE" | "DOWNGRADE" | "CYCLE";
}

/**
 * Immediate plan / cycle change. Upgrades charge the prorated difference for the rest of the period; a cycle
 * switch starts a new period now (new price minus unused credit). Downgrades apply immediately with no charge and
 * are rejected when current usage exceeds the target plan's limits (the Error lists them).
 */
export async function changePlan(institutionId: string, planId: PlanId, cycle: BillingCycle): Promise<ChangePlanResult> {
  await wait(600);
  return mutate((draft) => {
    const inst = mustInstitution(draft, institutionId);
    const target = mustPlan(draft, planId);
    const s = inst.subscription;
    if (s.status === "CANCELLED") throw new Error("Reactivate the subscription before changing plans.");
    if (s.status === "SUSPENDED") throw new Error("Lift the suspension before changing plans.");
    if (target.archived && target.id !== s.planId) throw new Error(`${target.name} is archived and can't be assigned.`);
    const preview = planChangePreview(draft.plans, inst, planId, cycle);
    if (preview.kind === "SAME") throw new Error(`Already on ${target.name} (${cycleLabel(cycle)}).`);
    if (preview.blockers.length)
      throw new Error(
        `Can't move to ${target.name}: usage exceeds its limits — ${preview.blockers
          .map((b) => `${LIMIT_LABEL[b.key]} ${fmtLimitValue(b.usage, b.key)} / ${fmtLimitValue(b.limit, b.key)}`)
          .join(", ")}.`
      );
    if (target.priceMonthly === 0 && !(planId === s.planId && s.customPrice) && s.status !== "TRIALING")
      throw new Error(`${target.name} is custom-priced — agree a contract price before switching.`);

    const from = planLabel(draft, s.planId);
    const kind = preview.kind as ChangePlanResult["kind"];
    const now = nowIso();
    const keepsCustom = planId === s.planId;
    const updated = patchInstitution(draft, institutionId, (i) => ({
      ...i,
      subscription: {
        ...i.subscription,
        planId,
        cycle,
        customPrice: keepsCustom ? i.subscription.customPrice ?? null : null,
        ...(preview.resetsPeriod ? { currentPeriodStart: now, currentPeriodEnd: periodEndFrom(now, cycle) } : {}),
      },
    }));

    const typeFor: Record<ChangePlanResult["kind"], SaasEventType> = { UPGRADE: "PLAN_UPGRADED", DOWNGRADE: "PLAN_DOWNGRADED", CYCLE: "CYCLE_CHANGED" };
    const msg =
      kind === "CYCLE"
        ? `Billing cycle changed ${cycleLabel(s.cycle)} → ${cycleLabel(cycle)}`
        : `${kind === "UPGRADE" ? "Upgraded" : "Downgraded"} ${from} → ${target.name}${cycle !== s.cycle ? ` (${cycleLabel(cycle)})` : ""}${s.status === "TRIALING" ? " during trial" : ""}`;
    draft.events.unshift(event(institutionId, typeFor[kind], msg, "Owner"));

    let invoice: SaasInvoice | null = null;
    if (!preview.trialing && preview.dueNow > 0)
      invoice = addInvoice(draft, updated, {
        planId,
        cycle,
        amount: preview.dueNow,
        periodStart: preview.resetsPeriod ? updated.subscription.currentPeriodStart : now,
        periodEnd: updated.subscription.currentPeriodEnd,
        paid: !!updated.subscription.paymentMethod,
        description: preview.resetsPeriod ? `${target.name} ${cycleLabel(cycle)} — new period less ${money(preview.credit)} unused credit` : `Prorated upgrade ${from} → ${target.name}`,
      });
    if (!preview.trialing && kind === "DOWNGRADE" && preview.credit > 0 && !preview.resetsPeriod)
      draft.events.unshift(event(institutionId, "NOTE", `Downgrade applied immediately — no refund for the current period`, "System"));
    return { institution: mustInstitution(draft, institutionId), invoice, kind };
  });
}

/** `atPeriodEnd` keeps access until the period ends; otherwise cancels now and voids unpaid invoices. */
export async function cancelSubscription(institutionId: string, atPeriodEnd: boolean): Promise<Institution> {
  await wait();
  return mutate((draft) => {
    const inst = mustInstitution(draft, institutionId);
    const s = inst.subscription;
    if (s.status === "CANCELLED") throw new Error("This subscription is already cancelled.");
    if (atPeriodEnd) {
      if (s.status !== "ACTIVE") throw new Error("Only active subscriptions can be cancelled at period end.");
      if (s.cancelAtPeriodEnd) throw new Error("Cancellation is already scheduled.");
      patchInstitution(draft, institutionId, (i) => ({ ...i, subscription: { ...i.subscription, cancelAtPeriodEnd: true } }));
      draft.events.unshift(event(institutionId, "CANCELLED", `Cancellation scheduled for ${new Date(s.currentPeriodEnd).toLocaleDateString("en-US", { dateStyle: "medium" })}`, "Owner"));
    } else {
      const now = nowIso();
      patchInstitution(draft, institutionId, (i) => ({
        ...i,
        subscription: { ...i.subscription, status: "CANCELLED", cancelAtPeriodEnd: false, cancelledAt: now, currentPeriodEnd: now, statusBeforeSuspend: null },
      }));
      draft.invoices = draft.invoices.map((i) => (i.institutionId === institutionId && (i.status === "OPEN" || i.status === "FAILED") ? { ...i, status: "VOID" } : i));
      draft.events.unshift(event(institutionId, "CANCELLED", s.status === "TRIALING" ? "Trial cancelled immediately" : "Subscription cancelled immediately — unpaid invoices voided", "Owner"));
    }
    return mustInstitution(draft, institutionId);
  });
}

/** Undoes a scheduled cancellation, or restarts a cancelled subscription with a fresh period + invoice. */
export async function reactivateSubscription(institutionId: string): Promise<Institution> {
  await wait();
  return mutate((draft) => {
    const inst = mustInstitution(draft, institutionId);
    const s = inst.subscription;
    if (s.status === "SUSPENDED") throw new Error("Lift the suspension instead.");
    if (s.cancelAtPeriodEnd) {
      patchInstitution(draft, institutionId, (i) => ({ ...i, subscription: { ...i.subscription, cancelAtPeriodEnd: false } }));
      draft.events.unshift(event(institutionId, "REACTIVATED", "Scheduled cancellation removed — subscription will renew", "Owner"));
      return mustInstitution(draft, institutionId);
    }
    if (s.status !== "CANCELLED") throw new Error("This subscription is already active.");
    const plan = mustPlan(draft, s.planId);
    const now = nowIso();
    const updated = patchInstitution(draft, institutionId, (i) => ({
      ...i,
      subscription: { ...i.subscription, status: "ACTIVE", cancelledAt: null, cancelAtPeriodEnd: false, currentPeriodStart: now, currentPeriodEnd: periodEndFrom(now, s.cycle) },
    }));
    draft.events.unshift(event(institutionId, "REACTIVATED", `Subscription reactivated on ${plan.name} (${cycleLabel(s.cycle)})`, "Owner"));
    const amount = subscriptionPrice(draft.plans, updated);
    if (amount > 0)
      addInvoice(draft, updated, {
        planId: plan.id,
        cycle: s.cycle,
        amount,
        periodStart: now,
        periodEnd: updated.subscription.currentPeriodEnd,
        paid: !!updated.subscription.paymentMethod,
        description: `${plan.name} plan — ${cycleLabel(s.cycle)} subscription (reactivation)`,
      });
    return mustInstitution(draft, institutionId);
  });
}

export async function suspendInstitution(institutionId: string, reason: string): Promise<Institution> {
  await wait();
  const why = reason.trim();
  if (why.length < 5) throw new Error("Add a short reason (at least 5 characters).");
  return mutate((draft) => {
    const inst = mustInstitution(draft, institutionId);
    const s = inst.subscription;
    if (s.status === "SUSPENDED") throw new Error("This institution is already suspended.");
    if (s.status === "CANCELLED") throw new Error("Cancelled institutions can't be suspended.");
    patchInstitution(draft, institutionId, (i) => ({
      ...i,
      subscription: { ...i.subscription, status: "SUSPENDED", suspendedAt: nowIso(), suspendedReason: why, statusBeforeSuspend: s.status as Exclude<SubscriptionStatus, "SUSPENDED"> },
    }));
    draft.events.unshift(event(institutionId, "SUSPENDED", `Suspended: ${why}`, "Owner"));
    return mustInstitution(draft, institutionId);
  });
}

export async function unsuspendInstitution(institutionId: string): Promise<Institution> {
  await wait();
  return mutate((draft) => {
    const inst = mustInstitution(draft, institutionId);
    const s = inst.subscription;
    if (s.status !== "SUSPENDED") throw new Error("This institution isn't suspended.");
    const unpaid = draft.invoices.some((i) => i.institutionId === institutionId && (i.status === "FAILED" || i.status === "OPEN"));
    let restored: SubscriptionStatus = s.statusBeforeSuspend ?? "ACTIVE";
    if (restored === "ACTIVE" && unpaid) restored = "PAST_DUE";
    if (restored === "PAST_DUE" && !unpaid) restored = "ACTIVE";
    if (restored === "TRIALING" && s.trialEndsAt && new Date(s.trialEndsAt).getTime() < Date.now()) restored = "ACTIVE";
    patchInstitution(draft, institutionId, (i) => ({ ...i, subscription: { ...i.subscription, status: restored, suspendedAt: null, suspendedReason: null, statusBeforeSuspend: null } }));
    draft.events.unshift(event(institutionId, "REACTIVATED", `Suspension lifted — status ${restored.replace("_", " ").toLowerCase()}`, "Owner"));
    return mustInstitution(draft, institutionId);
  });
}

export async function extendTrial(institutionId: string, days: number): Promise<Institution> {
  await wait();
  if (!Number.isInteger(days) || days < 1 || days > 60) throw new Error("Extend by 1 to 60 days.");
  return mutate((draft) => {
    const inst = mustInstitution(draft, institutionId);
    const s = inst.subscription;
    if (s.status !== "TRIALING" || !s.trialEndsAt) throw new Error("Only institutions on a trial can be extended.");
    const base = Math.max(new Date(s.trialEndsAt).getTime(), Date.now());
    const ends = new Date(base + days * DAY).toISOString();
    patchInstitution(draft, institutionId, (i) => ({ ...i, subscription: { ...i.subscription, trialEndsAt: ends, currentPeriodEnd: ends } }));
    draft.events.unshift(event(institutionId, "NOTE", `Trial extended by ${days} day${days === 1 ? "" : "s"} — now ends ${new Date(ends).toLocaleDateString("en-US", { dateStyle: "medium" })}`, "Owner"));
    return mustInstitution(draft, institutionId);
  });
}

/** Trial → paid: charges the first period now on the given payment method. */
export async function convertTrial(institutionId: string, planId: PlanId, cycle: BillingCycle, paymentMethod: PaymentMethod): Promise<Institution> {
  await wait(700);
  const pm = paymentMethodSchema.safeParse(paymentMethod);
  if (!pm.success) throw new Error(pm.error.issues[0]?.message ?? "Add a valid payment method.");
  return mutate((draft) => {
    const inst = mustInstitution(draft, institutionId);
    if (inst.subscription.status !== "TRIALING") throw new Error("This institution isn't on a trial.");
    const plan = mustPlan(draft, planId);
    const amount = priceFor(plan, cycle);
    if (amount <= 0) throw new Error(`${plan.name} is custom-priced — convert it with a contract price.`);
    const blockers = planChangePreview(draft.plans, inst, planId, cycle).blockers;
    if (blockers.length) throw new Error(`Usage exceeds ${plan.name} limits (${blockers.map((b) => LIMIT_LABEL[b.key]).join(", ")}). Choose a bigger plan.`);
    const now = nowIso();
    const updated = patchInstitution(draft, institutionId, (i) => ({
      ...i,
      subscription: { ...i.subscription, planId, cycle, status: "ACTIVE", startedAt: now, currentPeriodStart: now, currentPeriodEnd: periodEndFrom(now, cycle), paymentMethod: pm.data },
    }));
    draft.events.unshift(event(institutionId, "TRIAL_CONVERTED", `Trial converted to ${plan.name} (${cycleLabel(cycle)})`, "Institution"));
    addInvoice(draft, updated, { planId, cycle, amount, periodStart: now, periodEnd: updated.subscription.currentPeriodEnd, paid: true, description: `${plan.name} plan — ${cycleLabel(cycle)} subscription` });
    return mustInstitution(draft, institutionId);
  });
}

export async function updatePaymentMethod(institutionId: string, paymentMethod: PaymentMethod): Promise<Institution> {
  await wait();
  const pm = paymentMethodSchema.safeParse(paymentMethod);
  if (!pm.success) throw new Error(pm.error.issues[0]?.message ?? "Add a valid payment method.");
  return mutate((draft) => {
    mustInstitution(draft, institutionId);
    patchInstitution(draft, institutionId, (i) => ({ ...i, subscription: { ...i.subscription, paymentMethod: pm.data } }));
    draft.events.unshift(event(institutionId, "NOTE", `Payment method updated to ${pm.data.brand} •••• ${pm.data.last4}`, "Institution"));
    return mustInstitution(draft, institutionId);
  });
}

// ---------------------------------------------------------------- invoices

/** Mock charge: declines when there's no payment method or the card ends in 0002 (test decline card). */
export async function retryInvoice(invoiceId: string): Promise<SaasInvoice> {
  await wait(800);
  const store = read();
  const inv = mustInvoice(store, invoiceId);
  if (inv.status !== "FAILED" && inv.status !== "OPEN") throw new Error("Only failed or open invoices can be retried.");
  const inst = mustInstitution(store, inv.institutionId);
  const pm = inst.subscription.paymentMethod;
  if (!pm || pm.last4 === "0002") {
    mutate((draft) => {
      draft.invoices = draft.invoices.map((i) => (i.id === invoiceId ? { ...i, status: "FAILED" } : i));
      draft.events.unshift(event(inst.id, "PAYMENT_FAILED", `Retry of ${inv.number} (${money(inv.total)}) failed — ${pm ? "card declined" : "no payment method"}`, "System"));
    });
    throw new Error(pm ? `${pm.brand} •••• ${pm.last4} was declined. Ask the institution to update their payment method.` : "No payment method on file — ask the institution to add one.");
  }
  return mutate((draft) => {
    const paidAt = nowIso();
    draft.invoices = draft.invoices.map((i) => (i.id === invoiceId ? { ...i, status: "PAID", paidAt } : i));
    draft.events.unshift(event(inst.id, "PAYMENT_SUCCEEDED", `Retry succeeded — ${money(inv.total)} charged to ${pm.brand} •••• ${pm.last4} (${inv.number})`, "System"));
    settleStatus(draft, inst.id);
    return mustInvoice(draft, invoiceId);
  });
}

export async function refundInvoice(invoiceId: string): Promise<SaasInvoice> {
  await wait(700);
  return mutate((draft) => {
    const inv = mustInvoice(draft, invoiceId);
    if (inv.status !== "PAID") throw new Error("Only paid invoices can be refunded.");
    draft.invoices = draft.invoices.map((i) => (i.id === invoiceId ? { ...i, status: "REFUNDED" } : i));
    draft.events.unshift(event(inv.institutionId, "NOTE", `Invoice ${inv.number} refunded (${money(inv.total)})`, "Owner"));
    return mustInvoice(draft, invoiceId);
  });
}

/** Records an offline payment (bank transfer, cash, manual bKash). */
export async function markInvoicePaid(invoiceId: string): Promise<SaasInvoice> {
  await wait();
  return mutate((draft) => {
    const inv = mustInvoice(draft, invoiceId);
    if (inv.status !== "FAILED" && inv.status !== "OPEN") throw new Error("Only failed or open invoices can be marked as paid.");
    const paidAt = nowIso();
    draft.invoices = draft.invoices.map((i) => (i.id === invoiceId ? { ...i, status: "PAID", paidAt } : i));
    draft.events.unshift(event(inv.institutionId, "PAYMENT_SUCCEEDED", `${inv.number} marked as paid manually (${money(inv.total)})`, "Owner"));
    settleStatus(draft, inv.institutionId);
    return mustInvoice(draft, invoiceId);
  });
}

export async function voidInvoice(invoiceId: string): Promise<SaasInvoice> {
  await wait();
  return mutate((draft) => {
    const inv = mustInvoice(draft, invoiceId);
    if (inv.status !== "FAILED" && inv.status !== "OPEN") throw new Error("Only unpaid invoices can be voided.");
    draft.invoices = draft.invoices.map((i) => (i.id === invoiceId ? { ...i, status: "VOID" } : i));
    draft.events.unshift(event(inv.institutionId, "NOTE", `Invoice ${inv.number} voided`, "Owner"));
    settleStatus(draft, inv.institutionId);
    return mustInvoice(draft, invoiceId);
  });
}

// ---------------------------------------------------------------- custom domains

export async function addCustomDomain(institutionId: string, domain: string): Promise<Institution> {
  await wait();
  const parsed = customDomainSchema.safeParse({ domain });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Enter a valid domain.");
  const host = parsed.data.domain;
  return mutate((draft) => {
    const inst = mustInstitution(draft, institutionId);
    const plan = mustPlan(draft, inst.subscription.planId);
    if (!plan.features.includes("customDomain")) throw new Error(`Custom domains need the Pro plan or higher (currently ${plan.name}).`);
    if (inst.customDomain) throw new Error("Remove the current custom domain before adding another.");
    if (draft.institutions.some((i) => i.customDomain?.domain === host)) throw new Error(`${host} is already connected to another institution.`);
    const token = `edupro-verify=${Math.random().toString(36).slice(2, 12)}${Math.random().toString(36).slice(2, 10)}`;
    patchInstitution(draft, institutionId, (i) => ({
      ...i,
      customDomain: { domain: host, status: "PENDING_DNS", addedAt: nowIso(), verifiedAt: null, dnsTarget: SAAS_CNAME_TARGET, txtToken: token, lastCheckedAt: null },
    }));
    draft.events.unshift(event(institutionId, "DOMAIN_ADDED", `Custom domain ${host} added — waiting for DNS`, "Owner"));
    return mustInstitution(draft, institutionId);
  });
}

/** Mock DNS check: succeeds unless the domain contains "fail" (then the status becomes FAILED and this throws). */
export async function verifyCustomDomain(institutionId: string): Promise<Institution> {
  await wait(1000);
  const inst = mustInstitution(read(), institutionId);
  const d = inst.customDomain;
  if (!d) throw new Error("No custom domain to verify.");
  const ok = !d.domain.includes("fail");
  const result = mutate((draft) => {
    const checked = nowIso();
    patchInstitution(draft, institutionId, (i) => ({
      ...i,
      customDomain: i.customDomain ? { ...i.customDomain, status: ok ? "VERIFIED" : "FAILED", verifiedAt: ok ? checked : null, lastCheckedAt: checked } : null,
    }));
    if (ok) draft.events.unshift(event(institutionId, "DOMAIN_VERIFIED", `${d.domain} verified — SSL certificate issued`, "System"));
    else draft.events.unshift(event(institutionId, "NOTE", `Verification of ${d.domain} failed — CNAME / TXT records not found`, "System"));
    return mustInstitution(draft, institutionId);
  });
  if (!ok) throw new Error(`We couldn't find the DNS records for ${d.domain}. Check the CNAME and TXT records — DNS changes can take up to 24 hours.`);
  return result;
}

export async function removeCustomDomain(institutionId: string): Promise<Institution> {
  await wait();
  return mutate((draft) => {
    const inst = mustInstitution(draft, institutionId);
    if (!inst.customDomain) throw new Error("No custom domain to remove.");
    const domain = inst.customDomain.domain;
    patchInstitution(draft, institutionId, (i) => ({ ...i, customDomain: null }));
    draft.events.unshift(event(institutionId, "NOTE", `Custom domain ${domain} removed — back to ${inst.slug}.${SAAS_ROOT_DOMAIN}`, "Owner"));
    return mustInstitution(draft, institutionId);
  });
}

// ---------------------------------------------------------------- plans

const planFromValues = (id: PlanId, v: PlanFormValues, prev?: Plan): Plan => ({
  id,
  name: v.name.trim(),
  tagline: v.tagline.trim(),
  priceMonthly: v.priceMonthly,
  priceYearly: v.priceYearly,
  limits: { ...v.limits },
  features: [...v.features],
  highlighted: v.highlighted,
  isPublic: v.isPublic,
  trialDays: v.trialDays,
  archived: prev?.archived ?? false,
  updatedAt: nowIso(),
});

/** Updates a plan. Only one plan can be highlighted — highlighting this one clears the others. */
export async function savePlan(id: PlanId, values: PlanFormValues): Promise<Plan> {
  await wait();
  return mutate((draft) => {
    const prev = mustPlan(draft, id);
    if (draft.plans.some((p) => p.id !== id && p.name.toLowerCase() === values.name.trim().toLowerCase())) throw new Error("Another plan already uses this name.");
    const next = planFromValues(id, values, prev);
    draft.plans = draft.plans.map((p) => (p.id === id ? next : values.highlighted ? { ...p, highlighted: false } : p));
    return next;
  });
}

/** Next free custom plan id: `plan-<slug>` (then `plan-<slug>-2`, …). */
export function customPlanId(name: string, plans: Plan[] = read().plans) {
  const base = `plan-${normalizeSlug(name) || "custom"}`;
  let id = base;
  for (let n = 2; plans.some((p) => p.id === id); n++) id = `${base}-${n}`;
  return id;
}

/** Creates a custom plan (id `plan-<slug>`). Plans are kept in `sortPlans` order (monthly price). */
export async function createPlan(values: PlanFormValues): Promise<Plan> {
  await wait();
  return mutate((draft) => {
    if (draft.plans.some((p) => p.name.toLowerCase() === values.name.trim().toLowerCase())) throw new Error("Another plan already uses this name.");
    const next = planFromValues(customPlanId(values.name, draft.plans), values);
    draft.plans = sortPlans([...draft.plans.map((p) => (values.highlighted ? { ...p, highlighted: false } : p)), next]);
    return next;
  });
}

/** Archived plans disappear from signup / plan pickers; existing subscribers keep them. */
export async function archivePlan(id: PlanId, archived = true): Promise<Plan> {
  await wait();
  return mutate((draft) => {
    const plan = mustPlan(draft, id);
    if (archived && draft.plans.filter((p) => !p.archived && p.isPublic && p.id !== id).length === 0 && plan.isPublic)
      throw new Error("Keep at least one public plan available for signups.");
    const next: Plan = { ...plan, archived, highlighted: archived ? false : plan.highlighted, updatedAt: nowIso() };
    draft.plans = draft.plans.map((p) => (p.id === id ? next : p));
    return next;
  });
}

/** Number of institutions (not cancelled) on each plan — e.g. for "N subscribers" on plan cards. */
export const subscribersOf = (planId: PlanId, store: SaasStore = read()) =>
  store.institutions.filter((i) => i.subscription.planId === planId && i.subscription.status !== "CANCELLED").length;

