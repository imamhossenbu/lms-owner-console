import type { Institution, SaasStore } from "@/types/saas";
import { isPaying, monthlyValue, trialDaysLeft, upcomingRenewals } from "@/lib/saasStats";

export const SUBSCRIPTION_TABS = ["all", "trialing", "past_due", "renewals", "cancelled"] as const;
export type SubscriptionTab = (typeof SUBSCRIPTION_TABS)[number];
export const parseSubscriptionTab = (v: string): SubscriptionTab => ((SUBSCRIPTION_TABS as readonly string[]).includes(v) ? (v as SubscriptionTab) : "all");

export type SubscriptionSort = "name" | "mrr" | "end";

export interface SubscriptionRow {
  id: string;
  institution: Institution;
  /** Normalised monthly value counted in MRR (0 when not paying). */
  mrr: number;
  /** Monthly value the subscription would bring (trials, cancelled) — shown muted. */
  potential: number;
  /** Trial end for trials, cancellation date for cancelled, else current period end. */
  endAt: string;
  daysLeft: number;
}

const DAY = 86_400_000;

export function buildSubscriptionRows(store: SaasStore, now = Date.now()): SubscriptionRow[] {
  return store.institutions.map((institution) => {
    const s = institution.subscription;
    const endAt = s.status === "TRIALING" && s.trialEndsAt ? s.trialEndsAt : s.status === "CANCELLED" ? s.cancelledAt ?? s.currentPeriodEnd : s.currentPeriodEnd;
    const potential = monthlyValue(store.plans, institution);
    return {
      id: institution.id,
      institution,
      mrr: isPaying(institution) ? potential : 0,
      potential,
      endAt,
      daysLeft: trialDaysLeft(institution, now) ?? Math.ceil((new Date(endAt).getTime() - now) / DAY),
    };
  });
}

export function rowsForTab(store: SaasStore, rows: SubscriptionRow[], tab: SubscriptionTab) {
  if (tab === "all") return rows;
  if (tab === "renewals") {
    const ids = new Set(upcomingRenewals(store, 30).map((r) => r.institution.id));
    return rows.filter((r) => ids.has(r.id));
  }
  const status = tab === "trialing" ? "TRIALING" : tab === "past_due" ? "PAST_DUE" : "CANCELLED";
  return rows.filter((r) => r.institution.subscription.status === status);
}

export function sortRows(rows: SubscriptionRow[], sort: SubscriptionSort, dir: "asc" | "desc") {
  const m = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    if (sort === "mrr") return (a.mrr - b.mrr || a.potential - b.potential) * m;
    if (sort === "end") return a.endAt.localeCompare(b.endAt) * m;
    return a.institution.name.localeCompare(b.institution.name) * m;
  });
}
