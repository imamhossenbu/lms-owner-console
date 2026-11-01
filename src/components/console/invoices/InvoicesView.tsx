"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { FileDown } from "lucide-react";
import { INVOICE_STATUSES } from "@/types/saas";
import { sortPlans } from "@/lib/saasStats";
import { useUrlParams } from "@/lib/useUrlParams";
import { ListFilters } from "@/components/ui/ListFilters";
import { TablePagination } from "@/components/ui/TablePagination";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { isInDateRange } from "@/components/ui/DateRangeFilter";
import { downloadFile, toCsv, todayStamp } from "@/components/commerce/exportFile";
import { INVOICE_STATUS_META } from "@/components/console/shared/consoleMeta";
import { ConsoleHeader } from "@/components/console/subscriptions/shared/ConsoleHeader";
import { useConsoleSaas } from "@/components/console/subscriptions/shared/useConsoleSaas";
import { InvoiceKpis } from "./InvoiceKpis";
import { InvoicesTable, type InvoiceSort } from "./InvoicesTable";
import { InvoicesSkeleton } from "./InvoicesSkeleton";
import { useInvoiceActions } from "./useInvoiceActions";
import { formatDate } from "./invoiceUtils";

const PAGE_SIZES = [10, 20, 50];

/** /console/invoices — KPIs + URL-synced search / status / plan / date range / sort / page. */
export function InvoicesView() {
  const router = useRouter();
  const { get, getPage, set } = useUrlParams();
  const { store, ready } = useConsoleSaas();
  const actions = useInvoiceActions(store);

  const query = get("q");
  const status = get("status", "All");
  const plan = get("plan", "All");
  const from = get("from") || undefined;
  const to = get("to") || undefined;
  const sort: InvoiceSort = get("sort") === "amount" ? "amount" : "issued";
  const dir = get("dir") === "asc" ? "asc" : "desc";
  const page = getPage();
  const sizeParam = Number(get("size"));
  const pageSize = PAGE_SIZES.includes(sizeParam) ? sizeParam : 10;

  const institutions = useMemo(() => new Map(store.institutions.map((i) => [i.id, i])), [store.institutions]);
  const planName = (id: string) => store.plans.find((p) => p.id === id)?.name ?? id;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = store.invoices.filter((inv) => {
      const inst = institutions.get(inv.institutionId);
      return (
        (status === "All" || inv.status === status) &&
        (plan === "All" || inv.planId === plan) &&
        isInDateRange(inv.issuedAt, { from, to }) &&
        (!q || inv.number.toLowerCase().includes(q) || !!inst?.name.toLowerCase().includes(q) || !!inst?.slug.includes(q))
      );
    });
    const m = dir === "asc" ? 1 : -1;
    return list.sort((a, b) => (sort === "amount" ? a.total - b.total : a.issuedAt.localeCompare(b.issuedAt)) * m);
  }, [store.invoices, institutions, query, status, plan, from, to, sort, dir]);

  if (!ready) return <InvoicesSkeleton />;

  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const isFiltered = !!query || status !== "All" || plan !== "All" || !!from || !!to;

  const exportCsv = () => {
    const csv = toCsv(
      ["Number", "Institution", "Plan", "Cycle", "Period start", "Period end", "Amount", "Tax", "Total", "Status", "Issued", "Paid"],
      filtered.map((i) => [
        i.number,
        institutions.get(i.institutionId)?.name ?? "",
        planName(i.planId),
        i.cycle,
        formatDate(i.periodStart),
        formatDate(i.periodEnd),
        i.amount.toFixed(2),
        i.tax.toFixed(2),
        i.total.toFixed(2),
        INVOICE_STATUS_META[i.status].label,
        formatDate(i.issuedAt),
        formatDate(i.paidAt),
      ])
    );
    downloadFile(csv, `edupro_invoices_${todayStamp()}.csv`, "text/csv");
    toast.success("Export downloaded", { description: `${filtered.length} invoice(s) exported to CSV.` });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="space-y-5 pb-8 text-left">
      <ConsoleHeader
        crumbs={[{ label: "Invoices" }]}
        title="Invoices"
        subtitle="Subscription invoices issued to institutions — collect, retry, refund and download."
        actions={
          <SecondaryButton type="button" leftIcon={<FileDown className="h-4 w-4" />} onClick={exportCsv} disabled={!filtered.length}>
            Export CSV
          </SecondaryButton>
        }
      />
      <InvoiceKpis invoices={store.invoices} />

      <div className="space-y-4 rounded-xl border border-dash bg-white p-5 shadow-2xs">
        <ListFilters
          query={query}
          searchPlaceholder="Search by invoice number or institution..."
          onQueryChange={(q) => set({ q, page: null })}
          selects={[
            {
              key: "status",
              value: status,
              options: [{ value: "All", label: "All statuses" }, ...INVOICE_STATUSES.map((s) => ({ value: s, label: INVOICE_STATUS_META[s].label }))],
              onChange: (value) => set({ status: value, page: null }),
              className: "xl:w-40",
            },
            {
              key: "plan",
              value: plan,
              options: [{ value: "All", label: "All plans" }, ...sortPlans(store.plans).map((p) => ({ value: p.id, label: p.name }))],
              onChange: (value) => set({ plan: value, page: null }),
              className: "xl:w-40",
            },
          ]}
          dateRange={{ from, to }}
          onDateRangeChange={(range) => set({ from: range.from ?? null, to: range.to ?? null, page: null })}
          onReset={() => set({ q: null, status: null, plan: null, from: null, to: null, page: null })}
          isFiltered={isFiltered}
        />
        <InvoicesTable
          invoices={rows}
          institutions={institutions}
          planName={planName}
          sort={sort}
          dir={dir}
          onSort={(key) => set({ sort: key === "issued" ? null : key, dir: sort === key && dir === "desc" ? "asc" : null, page: null })}
          onRowClick={(inv) => router.push(`/invoices/${inv.id}`)}
          getMenuItems={actions.getMenuItems}
          footer={
            <TablePagination
              currentPage={page}
              pageSize={pageSize}
              totalCount={filtered.length}
              itemLabel="invoices"
              onPageChange={(next) => set({ page: next })}
              onPageSizeChange={(size) => set({ size: size === 10 ? null : size, page: null })}
              pageSizeOptions={PAGE_SIZES}
            />
          }
        />
      </div>
      {actions.modals}
    </motion.div>
  );
}

export default InvoicesView;
