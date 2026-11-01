import type { Institution, Plan, PlanId, SubscriptionStatus, InstitutionType } from "@/types/saas";
import { INSTITUTION_TYPES, SUBSCRIPTION_STATUSES } from "@/types/saas";
import { isPaying, monthlyValue, sortPlans } from "@/lib/saasStats";
import { STATUS_META, TYPE_LABEL } from "../../shared/consoleMeta";

export interface InstitutionFilters {
  q: string;
  status: SubscriptionStatus | "All";
  plan: PlanId | "All";
  type: InstitutionType | "All";
}

export type SortKey = "mrr" | "created" | "active" | "name";
export type SortDir = "asc" | "desc";
export interface InstitutionSort {
  key: SortKey;
  dir: SortDir;
}

export const PAGE_SIZES = [10, 20, 50];
export const DEFAULT_SORT: InstitutionSort = { key: "created", dir: "desc" };

/** URL params cleared by Reset. */
export const RESET_PARAMS = { q: null, status: null, plan: null, type: null, page: null };

export const parseStatus = (v: string): InstitutionFilters["status"] => ((SUBSCRIPTION_STATUSES as readonly string[]).includes(v) ? (v as SubscriptionStatus) : "All");
export const parsePlan = (v: string, plans: Plan[]): InstitutionFilters["plan"] => (plans.some((p) => p.id === v) ? v : "All");
export const parseType = (v: string): InstitutionFilters["type"] => ((INSTITUTION_TYPES as readonly string[]).includes(v) ? (v as InstitutionType) : "All");
export function parseSort(v: string): InstitutionSort {
  const [key, dir] = v.split("-");
  if (["mrr", "created", "active", "name"].includes(key) && (dir === "asc" || dir === "desc")) return { key: key as SortKey, dir };
  return DEFAULT_SORT;
}
export const sortParam = (s: InstitutionSort) => (s.key === DEFAULT_SORT.key && s.dir === DEFAULT_SORT.dir ? null : `${s.key}-${s.dir}`);

export const STATUS_OPTIONS = [{ value: "All", label: "All statuses" }, ...SUBSCRIPTION_STATUSES.map((s) => ({ value: s, label: STATUS_META[s].label }))];
export const TYPE_OPTIONS = [{ value: "All", label: "All types" }, ...INSTITUTION_TYPES.map((t) => ({ value: t, label: TYPE_LABEL[t] }))];
export const planOptions = (plans: Plan[]) => [{ value: "All", label: "All plans" }, ...sortPlans(plans).map((p) => ({ value: p.id, label: p.name }))];

export const isFiltered = (f: InstitutionFilters) => !!f.q || f.status !== "All" || f.plan !== "All" || f.type !== "All";

/** Live MRR contribution (0 unless paying). */
export const institutionMrr = (plans: Plan[], i: Institution) => (isPaying(i) ? monthlyValue(plans, i) : 0);

export function applyFilters(list: Institution[], plans: Plan[], f: InstitutionFilters, sort: InstitutionSort) {
  const q = f.q.trim().toLowerCase();
  const rows = list.filter(
    (i) =>
      (f.status === "All" || i.subscription.status === f.status) &&
      (f.plan === "All" || i.subscription.planId === f.plan) &&
      (f.type === "All" || i.type === f.type) &&
      (!q || [i.name, i.slug, i.ownerName, i.ownerEmail, i.country, i.customDomain?.domain ?? ""].some((v) => v.toLowerCase().includes(q)))
  );
  const val = (i: Institution): number | string =>
    sort.key === "mrr" ? institutionMrr(plans, i) : sort.key === "created" ? i.createdAt : sort.key === "active" ? i.lastActiveAt : i.name.toLowerCase();
  return rows.sort((a, b) => {
    const x = val(a);
    const y = val(b);
    const cmp = x < y ? -1 : x > y ? 1 : 0;
    return sort.dir === "asc" ? cmp : -cmp;
  });
}
