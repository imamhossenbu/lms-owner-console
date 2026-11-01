"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useUrlParams } from "@/lib/useUrlParams";
import { ListFilters } from "@/components/ui/ListFilters";
import { DOMAIN_STATUS_META } from "@/components/console/shared/consoleMeta";
import { ConsoleHeader } from "@/components/console/subscriptions/shared/ConsoleHeader";
import { useConsoleSaas } from "@/components/console/subscriptions/shared/useConsoleSaas";
import { DomainKpis } from "./DomainKpis";
import { DomainsTable } from "./DomainsTable";
import { DomainHelpCard } from "./DomainHelpCard";
import { SubdomainsCard } from "./SubdomainsCard";
import { DomainsSkeleton } from "./DomainsSkeleton";
import { useDomainActions } from "./useDomainActions";
import { buildDomainRows, DOMAIN_STATUS_FILTERS } from "./domainUtils";

/** /console/domains — every custom domain (failing first), default subdomains and DNS help. */
export function DomainsView() {
  const { get, set } = useUrlParams();
  const { store, ready } = useConsoleSaas();
  const actions = useDomainActions();
  const query = get("q");
  const status = get("status", "All");

  const allRows = useMemo(() => buildDomainRows(store.institutions), [store.institutions]);
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allRows.filter((r) => (status === "All" || r.domain.status === status) && (!q || r.domain.domain.includes(q) || r.institution.name.toLowerCase().includes(q)));
  }, [allRows, query, status]);

  if (!ready) return <DomainsSkeleton />;

  const failing = allRows.filter((r) => r.domain.status === "FAILED");
  const subdomains = store.institutions.filter((i) => i.subscription.status !== "CANCELLED").length;

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="space-y-5 pb-8 text-left">
      <ConsoleHeader crumbs={[{ label: "Domains" }]} title="Domains" subtitle="Custom domains connected by Pro and Enterprise institutions, plus every default subdomain." />
      <DomainKpis rows={allRows} subdomains={subdomains} />

      {failing.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3 rounded-xl border border-red bg-red-14 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red" />
          <div className="min-w-0">
            <p className="body-sm-medium text-red-dark">
              {failing.length} domain{failing.length === 1 ? " is" : "s are"} failing verification
            </p>
            <p className="body-xsm-regular text-red-dark">
              {failing.map((r) => r.domain.domain).join(", ")} — the DNS records weren&apos;t found. Copy the records and send them to the institution, then verify again.
            </p>
          </div>
        </motion.div>
      )}

      <div className="space-y-4 rounded-xl border border-dash bg-white p-5 shadow-2xs">
        <ListFilters
          query={query}
          searchPlaceholder="Search by domain or institution..."
          onQueryChange={(q) => set({ q })}
          selects={[
            {
              key: "status",
              value: status,
              options: [{ value: "All", label: "All statuses" }, ...DOMAIN_STATUS_FILTERS.map((s) => ({ value: s, label: DOMAIN_STATUS_META[s].label }))],
              onChange: (value) => set({ status: value }),
            },
          ]}
          onReset={() => set({ q: null, status: null })}
          isFiltered={!!query || status !== "All"}
        />
        <DomainsTable rows={rows} verifying={actions.verifying} onVerify={(row) => void actions.verify(row)} getMenuItems={actions.getMenuItems} />
      </div>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-2">
        <DomainHelpCard />
        <SubdomainsCard institutions={store.institutions} />
      </div>
      {actions.modals}
    </motion.div>
  );
}

export default DomainsView;
