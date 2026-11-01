"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUrlParams } from "@/lib/useUrlParams";
import { sortPlans } from "@/lib/saasStats";
import { PillTabs } from "@/components/ui/PillTabs";
import { ListFilters } from "@/components/ui/ListFilters";
import { TablePagination } from "@/components/ui/TablePagination";
import { ConsoleHeader } from "./shared/ConsoleHeader";
import { useConsoleSaas } from "./shared/useConsoleSaas";
import { SubscriptionKpis } from "./SubscriptionKpis";
import { SubscriptionsTable } from "./SubscriptionsTable";
import { SubscriptionsSkeleton } from "./SubscriptionsSkeleton";
import { RevenueByPlanCard } from "./RevenueByPlanCard";
import { useSubscriptionActions } from "./useSubscriptionActions";
import { buildSubscriptionRows, parseSubscriptionTab, rowsForTab, sortRows, SUBSCRIPTION_TABS, type SubscriptionSort, type SubscriptionTab } from "./subscriptionUtils";

const PAGE_SIZES = [10, 20, 50];
const TAB_LABEL: Record<SubscriptionTab, string> = { all: "All", trialing: "Trialing", past_due: "Past due", renewals: "Renewals (30d)", cancelled: "Cancelled" };
const EMPTY: Record<SubscriptionTab, string> = {
  all: "No subscriptions match your filters.",
  trialing: "No institutions are on a trial right now.",
  past_due: "No past-due subscriptions — every payment is up to date.",
  renewals: "No renewals in the next 30 days.",
  cancelled: "No cancelled subscriptions.",
};
const SORTS: SubscriptionSort[] = ["name", "mrr", "end"];

/** /console/subscriptions — KPIs, URL-synced tabs / search / plan / sort / page, table and revenue by plan. */
export function SubscriptionsView() {
  const router = useRouter();
  const { get, getPage, set } = useUrlParams();
  const { store, ready } = useConsoleSaas();
  const actions = useSubscriptionActions(store);

  const tab = parseSubscriptionTab(get("tab"));
  const query = get("q");
  const plan = get("plan", "All");
  const sortParam = get("sort") as SubscriptionSort;
  const sort: SubscriptionSort = SORTS.includes(sortParam) ? sortParam : "end";
  const dir = get("dir") === "desc" ? "desc" : "asc";
  const page = getPage();
  const sizeParam = Number(get("size"));
  const pageSize = PAGE_SIZES.includes(sizeParam) ? sizeParam : 10;

  const allRows = useMemo(() => buildSubscriptionRows(store), [store]);
  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allRows.filter(
      (r) =>
        (plan === "All" || r.institution.subscription.planId === plan) &&
        (!q || r.institution.name.toLowerCase().includes(q) || r.institution.slug.includes(q) || r.institution.ownerEmail.toLowerCase().includes(q))
    );
  }, [allRows, query, plan]);
  const filtered = useMemo(() => sortRows(rowsForTab(store, searched, tab), sort, dir), [store, searched, tab, sort, dir]);

  if (!ready) return <SubscriptionsSkeleton />;

  const tabs = SUBSCRIPTION_TABS.map((id) => ({ id, label: TAB_LABEL[id], count: rowsForTab(store, searched, id).length }));
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const isFiltered = !!query || plan !== "All";

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="space-y-5 pb-8 text-left">
      <ConsoleHeader crumbs={[{ label: "Subscriptions" }]} title="Subscriptions" subtitle="Every institution's plan, billing cycle, renewal date and payment health." />
      <SubscriptionKpis store={store} />

      <PillTabs tabs={tabs} activeId={tab} onChange={(next) => set({ tab: next === "all" ? null : next, page: null })} ariaLabel="Subscription status" />

      <div className="space-y-4 rounded-xl border border-dash bg-white p-5 shadow-2xs">
        <ListFilters
          query={query}
          searchPlaceholder="Search by institution, subdomain or owner email..."
          onQueryChange={(q) => set({ q, page: null })}
          selects={[
            {
              key: "plan",
              value: plan,
              options: [{ value: "All", label: "All plans" }, ...sortPlans(store.plans).map((p) => ({ value: p.id, label: p.name }))],
              onChange: (value) => set({ plan: value, page: null }),
            },
          ]}
          onReset={() => set({ q: null, plan: null, page: null })}
          isFiltered={isFiltered}
        />
        <SubscriptionsTable
          rows={rows}
          plans={store.plans}
          sort={sort}
          dir={dir}
          onSort={(key) => set({ sort: key === "end" ? null : key, dir: sort === key && dir === "asc" ? "desc" : null, page: null })}
          onRowClick={(row) => router.push(`/institutions/${row.id}`)}
          getMenuItems={(row) => actions.getMenuItems(row.institution)}
          emptyMessage={EMPTY[tab]}
          footer={
            <TablePagination
              currentPage={page}
              pageSize={pageSize}
              totalCount={filtered.length}
              itemLabel="subscriptions"
              onPageChange={(next) => set({ page: next })}
              onPageSizeChange={(size) => set({ size: size === 10 ? null : size, page: null })}
              pageSizeOptions={PAGE_SIZES}
            />
          }
        />
      </div>

      <RevenueByPlanCard store={store} />
      {actions.modals}
    </motion.div>
  );
}

export default SubscriptionsView;
