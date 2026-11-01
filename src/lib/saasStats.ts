import type { BillingCycle, Institution, LimitKey, Plan, PlanId, SaasInvoice, SaasStore } from "@/types/saas";
import { LIMIT_KEYS, PLAN_IDS } from "@/types/saas";

const TIER_INDEX: Record<string, number> = Object.fromEntries(PLAN_IDS.map((id, i) => [id, i]));

/**
 * Pure SaaS metrics (no storage, no React) — every function takes the store (or pieces of it) and an
 * optional `now` (ms) so tests / the sanity script are deterministic.
 *
 * Revenue
 *  - `priceFor(plan, cycle)`, `subscriptionPrice(plans, inst)` (per cycle, honours Enterprise `customPrice`),
 *    `monthlyValue(plans, inst)` (yearly / 12).
 *  - `mrr(store)` — ACTIVE + PAST_DUE only; `arr` = mrr × 12; `mrrAt(store, at)` historical (from invoices);
 *    `mrrSeries(store, months)` month-end points, the last point = live `mrr(store)`.
 *  - `arpa` (MRR ÷ paying institutions), `revenueByPlan`, `planDistribution`.
 * Customers
 *  - `isPaying`, `activeCount`, `trialCount`, `trialsEndingSoon(days)`, `trialConversionRate(days)`,
 *    `churnRate(days)` (paid cancellations in the window ÷ paying at window start), `newSignupsSeries(months)`.
 * Billing
 *  - `failedPaymentsAmount`, `failedInvoices`, `upcomingRenewals(days)`.
 * Usage
 *  - `usagePct(inst, key, plan)` (null = unlimited), `nearLimit(inst, plan, threshold)`, `trialDaysLeft(inst)`.
 * Console helpers
 *  - `overviewKpis(store)` (value + previous-period value for every Overview tile), `attentionItems(store)`.
 *  - formatting: `formatMoney`, `formatCompactMoney`, `formatPct`, `monthKey`, `monthLabel`.
 */

const DAY = 86_400_000;
const t = (iso: string) => new Date(iso).getTime();

// ---------------------------------------------------------------- formatting

export const formatMoney = (n: number, opts: { cents?: boolean } = {}) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: opts.cents ? 2 : 0, maximumFractionDigits: opts.cents ? 2 : n % 1 ? 2 : 0 })}`;

export const formatCompactMoney = (n: number) => {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (Math.abs(n) >= 10_000) return `$${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return formatMoney(Math.round(n));
};

export const formatPct = (n: number, digits = 1) => `${n.toFixed(digits).replace(/\.0+$/, "")}%`;

export const monthKey = (ms: number) => {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
};
export const monthLabel = (ms: number, withYear = false) =>
  new Date(ms).toLocaleDateString("en-US", { month: "short", year: withYear ? "numeric" : undefined, timeZone: "UTC" });

/** End of the UTC month `offset` months before the month containing `now` (offset 0 = this month's end). */
const monthEnd = (now: number, offset: number) => {
  const d = new Date(now);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - offset + 1, 1) - 1;
};
const monthStart = (now: number, offset: number) => {
  const d = new Date(now);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - offset, 1);
};

// ---------------------------------------------------------------- pricing

export const priceFor = (plan: Plan, cycle: BillingCycle) => (cycle === "YEARLY" ? plan.priceYearly : plan.priceMonthly);

export const findPlan = (plans: Plan[], id: PlanId) => plans.find((p) => p.id === id);

/**
 * Canonical plan order (pickers, comparisons, upgrade / downgrade direction): by monthly price ascending;
 * custom-priced plans (priceMonthly 0, e.g. Enterprise) last; ties → built-in tier order, then name.
 * Custom plans therefore slot between the tiers by price.
 */
export function sortPlans(plans: Plan[]): Plan[] {
  const key = (p: Plan) => (p.priceMonthly > 0 ? p.priceMonthly : Number.POSITIVE_INFINITY);
  return [...plans].sort((a, b) => key(a) - key(b) || (TIER_INDEX[a.id] ?? 99) - (TIER_INDEX[b.id] ?? 99) || a.name.localeCompare(b.name));
}

/** Position of a plan in `sortPlans(plans)` (-1 when unknown). Higher = bigger plan. */
export const planRank = (plans: Plan[], id: PlanId) => sortPlans(plans).findIndex((p) => p.id === id);

/** Yearly discount vs 12 × monthly, in % (derived — priceYearly is the source of truth). 0 for custom pricing. */
export const yearlyDiscountPct = (plan: Pick<Plan, "priceMonthly" | "priceYearly">) =>
  plan.priceMonthly > 0 && plan.priceYearly > 0 ? Math.max(0, Math.round((1 - plan.priceYearly / (plan.priceMonthly * 12)) * 100)) : 0;

/** Price per billing cycle for this institution (Enterprise / custom deals use `subscription.customPrice`). */
export function subscriptionPrice(plans: Plan[], inst: Institution) {
  const custom = inst.subscription.customPrice;
  if (custom !== undefined && custom !== null && custom > 0) return custom;
  const plan = findPlan(plans, inst.subscription.planId);
  return plan ? priceFor(plan, inst.subscription.cycle) : 0;
}

/** Normalised monthly value of the subscription (yearly ÷ 12). Not filtered by status. */
export const monthlyValue = (plans: Plan[], inst: Institution) =>
  inst.subscription.cycle === "YEARLY" ? subscriptionPrice(plans, inst) / 12 : subscriptionPrice(plans, inst);

/** Paying = counts toward MRR (ACTIVE or PAST_DUE). */
export const isPaying = (inst: Institution) => inst.subscription.status === "ACTIVE" || inst.subscription.status === "PAST_DUE";

const round2 = (n: number) => Math.round(n * 100) / 100;

export const mrr = (store: Pick<SaasStore, "plans" | "institutions">) =>
  round2(store.institutions.filter(isPaying).reduce((sum, i) => sum + monthlyValue(store.plans, i), 0));

export const arr = (store: Pick<SaasStore, "plans" | "institutions">) => round2(mrr(store) * 12);

/** Monthly value an invoice represents (plan price for its cycle, or the institution's custom price). */
function invoiceMonthlyValue(store: SaasStore, inv: SaasInvoice) {
  const inst = store.institutions.find((i) => i.id === inv.institutionId);
  const custom = inst?.subscription.customPrice;
  let perCycle: number;
  if (inv.planId === "enterprise" || (custom && inst?.subscription.planId === inv.planId)) perCycle = custom ?? 0;
  else {
    const plan = findPlan(store.plans, inv.planId);
    perCycle = plan ? priceFor(plan, inv.cycle) : 0;
  }
  return inv.cycle === "YEARLY" ? perCycle / 12 : perCycle;
}

/**
 * Historical MRR at a moment: for each institution, the latest-issued (not refunded / void) invoice whose period
 * covers `at`. Upgrades are reflected from their (prorated) invoice; cancellations drop off after the paid period.
 */
export function mrrAt(store: SaasStore, at: number) {
  const latest = new Map<string, SaasInvoice>();
  const stoppedAt = new Map<string, number>();
  store.institutions.forEach((i) => {
    const s = i.subscription;
    const stop = s.status === "SUSPENDED" ? s.suspendedAt : s.status === "CANCELLED" ? s.cancelledAt : null;
    if (stop) stoppedAt.set(i.id, t(stop));
  });
  for (const inv of store.invoices) {
    if (inv.status === "VOID" || inv.status === "REFUNDED") continue;
    const stop = stoppedAt.get(inv.institutionId);
    if (stop !== undefined && at >= stop) continue;
    if (t(inv.periodStart) > at || t(inv.periodEnd) <= at) continue;
    const prev = latest.get(inv.institutionId);
    if (!prev || inv.issuedAt > prev.issuedAt) latest.set(inv.institutionId, inv);
  }
  let sum = 0;
  latest.forEach((inv) => (sum += invoiceMonthlyValue(store, inv)));
  return round2(sum);
}

export interface SeriesPoint {
  key: string;
  label: string;
  fullLabel: string;
  value: number;
}

/** Month-end MRR for the last `months` months; the current month's point is the live `mrr(store)`. */
export function mrrSeries(store: SaasStore, months = 14, now = Date.now()): SeriesPoint[] {
  return Array.from({ length: months }, (_, idx) => {
    const offset = months - 1 - idx;
    const end = monthEnd(now, offset);
    return {
      key: monthKey(end),
      label: monthLabel(end),
      fullLabel: monthLabel(end, true),
      value: offset === 0 ? mrr(store) : mrrAt(store, end),
    };
  });
}

/** New institutions created per month (all sources) for the last `months` months. */
export function newSignupsSeries(store: SaasStore, months = 14, now = Date.now()) {
  return Array.from({ length: months }, (_, idx) => {
    const offset = months - 1 - idx;
    const start = monthStart(now, offset);
    const end = monthEnd(now, offset);
    const inMonth = store.institutions.filter((i) => t(i.createdAt) >= start && t(i.createdAt) <= end);
    return {
      key: monthKey(start),
      label: monthLabel(start),
      fullLabel: monthLabel(start, true),
      signups: inMonth.length,
      selfSignup: inMonth.filter((i) => i.source === "SELF_SIGNUP").length,
      ownerCreated: inMonth.filter((i) => i.source === "OWNER_CREATED").length,
    };
  });
}

// ---------------------------------------------------------------- customers

export const activeCount = (store: Pick<SaasStore, "institutions">) => store.institutions.filter((i) => i.subscription.status === "ACTIVE").length;
export const payingCount = (store: Pick<SaasStore, "institutions">) => store.institutions.filter(isPaying).length;
export const trialCount = (store: Pick<SaasStore, "institutions">) => store.institutions.filter((i) => i.subscription.status === "TRIALING").length;

/** Whole days until the trial ends (0 = ends today, negative = overdue); null when not trialing. */
export function trialDaysLeft(inst: Institution, now = Date.now()) {
  if (inst.subscription.status !== "TRIALING" || !inst.subscription.trialEndsAt) return null;
  return Math.ceil((t(inst.subscription.trialEndsAt) - now) / DAY);
}

export const trialsEndingSoon = (store: Pick<SaasStore, "institutions">, days = 3, now = Date.now()) =>
  store.institutions
    .filter((i) => {
      const left = trialDaysLeft(i, now);
      return left !== null && left <= days;
    })
    .sort((a, b) => (a.subscription.trialEndsAt ?? "").localeCompare(b.subscription.trialEndsAt ?? ""));

/**
 * Share of trials that ended in the window and converted to paid (TRIAL_CONVERTED vs TRIAL_EXPIRED events).
 * `days` = null → all time. Returns a percentage (0–100); 0 when no trial has ended.
 */
export function trialConversionRate(store: Pick<SaasStore, "events">, days: number | null = null, now = Date.now()) {
  const from = days === null ? -Infinity : now - days * DAY;
  const inWindow = store.events.filter((e) => t(e.at) >= from && t(e.at) <= now);
  const converted = inWindow.filter((e) => e.type === "TRIAL_CONVERTED").length;
  const expired = inWindow.filter((e) => e.type === "TRIAL_EXPIRED").length;
  return converted + expired ? (converted / (converted + expired)) * 100 : 0;
}

/** Was the institution paying at `at`? (started before, not yet cancelled / suspended) — approximation from dates. */
function wasPayingAt(inst: Institution, at: number) {
  const s = inst.subscription;
  if (s.status === "TRIALING") return false;
  if (s.status === "CANCELLED" && !s.cancelledAt) return false;
  if (t(s.startedAt) > at) return false;
  if (s.trialEndsAt && s.status === "CANCELLED" && t(s.trialEndsAt) >= t(s.cancelledAt ?? s.trialEndsAt)) return false; // expired trial
  if (s.cancelledAt && t(s.cancelledAt) <= at) return false;
  if (s.status === "SUSPENDED" && s.suspendedAt && t(s.suspendedAt) <= at) return false;
  return true;
}

/** Paid cancellations in the last `days` ÷ institutions paying at the window start (percentage). */
export function churnRate(store: Pick<SaasStore, "institutions">, days = 30, now = Date.now()) {
  const from = now - days * DAY;
  const base = store.institutions.filter((i) => wasPayingAt(i, from)).length;
  const churned = store.institutions.filter(
    (i) => i.subscription.status === "CANCELLED" && i.subscription.cancelledAt && t(i.subscription.cancelledAt) > from && t(i.subscription.cancelledAt) <= now && wasPayingAt(i, from)
  ).length;
  return base ? (churned / base) * 100 : 0;
}

/** Average revenue per paying account (monthly). */
export const arpa = (store: Pick<SaasStore, "plans" | "institutions">) => {
  const paying = store.institutions.filter((i) => isPaying(i) && monthlyValue(store.plans, i) > 0).length;
  return paying ? round2(mrr(store) / paying) : 0;
};

export function revenueByPlan(store: Pick<SaasStore, "plans" | "institutions">) {
  return sortPlans(store.plans).map(({ id: planId }) => {
    const insts = store.institutions.filter((i) => isPaying(i) && i.subscription.planId === planId);
    return {
      planId,
      name: findPlan(store.plans, planId)?.name ?? planId,
      count: insts.length,
      mrr: round2(insts.reduce((s, i) => s + monthlyValue(store.plans, i), 0)),
    };
  });
}

/** Live institutions (trialing + paying + suspended, i.e. not cancelled) per plan. */
export function planDistribution(store: Pick<SaasStore, "plans" | "institutions">) {
  return sortPlans(store.plans).map(({ id: planId }) => {
    const insts = store.institutions.filter((i) => i.subscription.status !== "CANCELLED" && i.subscription.planId === planId);
    return {
      planId,
      name: findPlan(store.plans, planId)?.name ?? planId,
      count: insts.length,
      trialing: insts.filter((i) => i.subscription.status === "TRIALING").length,
    };
  });
}

// ---------------------------------------------------------------- billing

export const failedInvoices = (store: Pick<SaasStore, "invoices">) => store.invoices.filter((i) => i.status === "FAILED" || i.status === "OPEN");

/** Outstanding FAILED + OPEN invoice totals. */
export const failedPaymentsAmount = (store: Pick<SaasStore, "invoices">) => round2(failedInvoices(store).reduce((s, i) => s + i.total, 0));

/** ACTIVE subscriptions renewing within `days` (excludes ones cancelling at period end). */
export function upcomingRenewals(store: Pick<SaasStore, "plans" | "institutions">, days = 30, now = Date.now()) {
  return store.institutions
    .filter((i) => i.subscription.status === "ACTIVE" && !i.subscription.cancelAtPeriodEnd)
    .filter((i) => t(i.subscription.currentPeriodEnd) > now && t(i.subscription.currentPeriodEnd) <= now + days * DAY)
    .map((i) => ({ institution: i, renewsAt: i.subscription.currentPeriodEnd, amount: subscriptionPrice(store.plans, i) }))
    .sort((a, b) => a.renewsAt.localeCompare(b.renewsAt));
}

// ---------------------------------------------------------------- usage

/** Percentage of the plan limit used; null when the limit is unlimited. Can exceed 100. */
export function usagePct(inst: Institution, key: LimitKey, plan: Plan | undefined) {
  const limit = plan?.limits[key];
  if (limit === null || limit === undefined) return null;
  return limit > 0 ? (inst.usage[key] / limit) * 100 : 100;
}

/** Limits at or above `threshold` % (default 90), most-used first. */
export function nearLimit(inst: Institution, plan: Plan | undefined, threshold = 90) {
  return LIMIT_KEYS.map((key) => ({ key, pct: usagePct(inst, key, plan) }))
    .filter((x): x is { key: LimitKey; pct: number } => x.pct !== null && x.pct >= threshold)
    .sort((a, b) => b.pct - a.pct);
}

// ---------------------------------------------------------------- console overview helpers

export interface KpiValue {
  value: number;
  previous: number;
}

/** Every Overview tile with its previous-period (30 days earlier) value for the change chip. */
export function overviewKpis(store: SaasStore, now = Date.now()) {
  const prev = now - 30 * DAY;
  const currentMrr = mrr(store);
  const prevMrr = mrrAt(store, prev);
  const payingPrev = store.institutions.filter((i) => wasPayingAt(i, prev)).length;
  const trialsPrev = store.institutions.filter((i) => i.subscription.trialEndsAt && t(i.createdAt) <= prev && t(i.subscription.trialEndsAt) > prev).length;
  const failedPrev = store.invoices
    .filter((i) => (i.status === "FAILED" || i.status === "OPEN" || (i.paidAt && t(i.paidAt) > prev && t(i.dueAt) < t(i.paidAt))) && t(i.issuedAt) <= prev && t(i.issuedAt) > prev - 30 * DAY)
    .reduce((s, i) => s + i.total, 0);
  return {
    mrr: { value: currentMrr, previous: prevMrr },
    arr: { value: currentMrr * 12, previous: prevMrr * 12 },
    /** Paying institutions (ACTIVE + PAST_DUE). */
    active: { value: payingCount(store), previous: payingPrev },
    pastDue: store.institutions.filter((i) => i.subscription.status === "PAST_DUE").length,
    trials: { value: trialCount(store), previous: trialsPrev },
    trialsEndingSoon: trialsEndingSoon(store, 3, now).length,
    conversion: { value: trialConversionRate(store, 180, now), previous: trialConversionRate(store, 180, prev) },
    churn: { value: churnRate(store, 30, now), previous: churnRate(store, 30, prev) },
    arpa: { value: arpa(store), previous: payingPrev ? round2(prevMrr / payingPrev) : 0 },
    failed: { value: failedPaymentsAmount(store), previous: round2(failedPrev) },
    failedCount: failedInvoices(store).length,
  };
}

/** Percentage change between two values (null when the previous value is 0). */
export const pctChange = (value: number, previous: number) => (previous ? ((value - previous) / Math.abs(previous)) * 100 : null);

export type AttentionKind = "TRIAL_ENDING" | "PAST_DUE" | "NEAR_LIMIT" | "DOMAIN_FAILED";

export interface AttentionItem {
  id: string;
  kind: AttentionKind;
  institution: Institution;
  title: string;
  detail: string;
  /** Sort weight — lower is more urgent. */
  priority: number;
}

/** "Needs attention" list for the Overview: trials ending ≤ 3 days, past due, near limits, failed domains. */
export function attentionItems(store: SaasStore, now = Date.now()): AttentionItem[] {
  const items: AttentionItem[] = [];
  store.institutions.forEach((inst) => {
    const s = inst.subscription;
    const plan = findPlan(store.plans, s.planId);
    const left = trialDaysLeft(inst, now);
    if (left !== null && left <= 3)
      items.push({
        id: `${inst.id}-trial`,
        kind: "TRIAL_ENDING",
        institution: inst,
        title: left <= 0 ? "Trial ends today" : `Trial ends in ${left} day${left === 1 ? "" : "s"}`,
        detail: s.paymentMethod ? `${plan?.name ?? ""} trial · payment method on file` : `${plan?.name ?? ""} trial · no payment method yet`,
        priority: 1 + Math.max(left, 0) / 10,
      });
    if (s.status === "PAST_DUE") {
      const open = store.invoices.filter((i) => i.institutionId === inst.id && (i.status === "FAILED" || i.status === "OPEN"));
      const total = open.reduce((sum, i) => sum + i.total, 0);
      items.push({
        id: `${inst.id}-pastdue`,
        kind: "PAST_DUE",
        institution: inst,
        title: `Past due · ${formatMoney(total)}`,
        detail: `${open.length} unpaid invoice${open.length === 1 ? "" : "s"} · ${s.paymentMethod ? `${s.paymentMethod.brand} •••• ${s.paymentMethod.last4}` : "no payment method"}`,
        priority: 0,
      });
    }
    if (s.status !== "CANCELLED" && s.status !== "SUSPENDED") {
      const near = nearLimit(inst, plan, 90);
      if (near.length)
        items.push({
          id: `${inst.id}-limit`,
          kind: "NEAR_LIMIT",
          institution: inst,
          title: near[0]!.pct >= 100 ? "Over plan limit" : "Near plan limit",
          detail: near.map((n) => `${LIMIT_SHORT[n.key]} ${Math.round(n.pct)}%`).join(" · "),
          priority: near[0]!.pct >= 100 ? 0.5 : 2,
        });
    }
    if (inst.customDomain?.status === "FAILED")
      items.push({
        id: `${inst.id}-domain`,
        kind: "DOMAIN_FAILED",
        institution: inst,
        title: "Domain verification failed",
        detail: `${inst.customDomain.domain} · DNS not pointing to cname.edupro.com`,
        priority: 3,
      });
  });
  return items.sort((a, b) => a.priority - b.priority);
}

const LIMIT_SHORT: Record<LimitKey, string> = { students: "Students", courses: "Courses", teamMembers: "Team", storageGb: "Storage" };

// ---------------------------------------------------------------- plan change preview (used by the modal + storage)

/** @deprecated tiers only — use `planRank(plans, id)` (custom plans ordered by monthly price). */
export const PLAN_RANK: Record<string, number> = { starter: 0, growth: 1, pro: 2, enterprise: 3 };

export interface PlanChangePreview {
  kind: "UPGRADE" | "DOWNGRADE" | "CYCLE" | "SAME";
  /** Price per cycle before / after. */
  currentPrice: number;
  nextPrice: number;
  /** Normalised monthly values before / after (MRR impact = next − current). */
  currentMonthly: number;
  nextMonthly: number;
  /** Amount charged now (prorated upgrade / cycle switch net of unused credit). 0 for downgrades / trials. */
  dueNow: number;
  /** Unused credit of the current period (informational). */
  credit: number;
  /** True when the change starts a fresh billing period now (cycle switch). */
  resetsPeriod: boolean;
  /** Limits the institution's usage exceeds on the target plan — downgrade is blocked when non-empty. */
  blockers: { key: LimitKey; usage: number; limit: number }[];
  /** Trialing subscriptions switch plan without charging. */
  trialing: boolean;
}

/** Pure preview of `changePlan(inst, planId, cycle)` — upgrades are prorated against the unused part of the period. */
export function planChangePreview(plans: Plan[], inst: Institution, planId: PlanId, cycle: BillingCycle, now = Date.now()): PlanChangePreview {
  const s = inst.subscription;
  const target = findPlan(plans, planId);
  const currentPrice = subscriptionPrice(plans, inst);
  const sameCustom = planId === s.planId && s.customPrice ? s.customPrice : null;
  const nextPrice = sameCustom ?? (target ? priceFor(target, cycle) : 0);
  const currentMonthly = s.cycle === "YEARLY" ? currentPrice / 12 : currentPrice;
  const nextMonthly = cycle === "YEARLY" ? nextPrice / 12 : nextPrice;
  const blockers = target
    ? LIMIT_KEYS.flatMap((key) => {
        const limit = target.limits[key];
        return limit !== null && inst.usage[key] > limit ? [{ key, usage: inst.usage[key], limit }] : [];
      })
    : [];
  const kind: PlanChangePreview["kind"] =
    planId === s.planId && cycle === s.cycle
      ? "SAME"
      : planRank(plans, planId) > planRank(plans, s.planId)
        ? "UPGRADE"
        : planRank(plans, planId) < planRank(plans, s.planId)
          ? "DOWNGRADE"
          : "CYCLE";
  const trialing = s.status === "TRIALING";
  const start = t(s.currentPeriodStart);
  const end = t(s.currentPeriodEnd);
  const remaining = end > start ? Math.min(1, Math.max(0, (end - now) / (end - start))) : 0;
  const credit = trialing ? 0 : round2(currentPrice * remaining);
  const resetsPeriod = !trialing && cycle !== s.cycle;
  let dueNow = 0;
  if (!trialing && kind !== "SAME") {
    if (resetsPeriod) dueNow = Math.max(0, round2(nextPrice - credit));
    else if (kind === "UPGRADE") dueNow = Math.max(0, round2((nextPrice - currentPrice) * remaining));
  }
  return { kind, currentPrice, nextPrice, currentMonthly, nextMonthly, dueNow, credit, resetsPeriod, blockers, trialing };
}
