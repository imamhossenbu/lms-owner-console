"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { BellOff, Building2, CheckCheck, Eye, EyeOff, SearchX } from "lucide-react";
import type { AttentionItem, AttentionKind } from "@/lib/saasStats";
import { attentionItems } from "@/lib/saasStats";
import { useSaasReady, useSaasStore } from "@/lib/planAccess";
import { useUrlParams } from "@/lib/useUrlParams";
import { PillTabs } from "@/components/ui/PillTabs";
import { ListFilters } from "@/components/ui/ListFilters";
import { TablePagination } from "@/components/ui/TablePagination";
import { SecondaryButton } from "@/components/ui/secondary-button";
import type { DropdownActionItem } from "@/components/ui/AppDropdownMenu";
import { ConsoleHeader } from "../subscriptions/shared/ConsoleHeader";
import { ConsoleEmptyState } from "../shared/ConsoleEmptyState";
import { useNow } from "../shared/useNow";
import { ATTENTION_KIND, ATTENTION_KINDS } from "../shared/attentionMeta";
import { useInstitutionActions } from "../institutions/actions/useInstitutionActions";
import { useInstitutionDialogs } from "../institutions/actions/useInstitutionDialogs";
import { markAlertsSeen, markAlertsUnseen, useSeenAlerts } from "../shell/consoleAlertsSeen";
import { AlertsKpis } from "./AlertsKpis";
import { AlertsTable } from "./AlertsTable";
import { AlertsSkeleton } from "./AlertsSkeleton";

type Tab = "all" | AttentionKind;
const PAGE_SIZES = [10, 20, 50];
const STATUS_OPTIONS = [
  { value: "All", label: "All alerts" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
];
const parseTab = (v: string): Tab => (ATTENTION_KINDS.includes(v as AttentionKind) ? (v as AttentionKind) : "all");

/** /alerts — every "needs attention" item with read state and its one-click fix. `?tab`, `?status`, `?q`, `?page`, `?size` survive reloads. */
export function AlertsView() {
  const router = useRouter();
  const ready = useSaasReady();
  const store = useSaasStore();
  const now = useNow();
  const seen = useSeenAlerts();
  const { get, getPage, set } = useUrlParams();
  const actions = useInstitutionActions();
  const { open, dialogs } = useInstitutionDialogs(store.plans, actions);

  const tab = parseTab(get("tab"));
  const status = ["unread", "read"].includes(get("status")) ? get("status") : "All";
  const query = get("q");
  const sizeParam = Number(get("size"));
  const pageSize = PAGE_SIZES.includes(sizeParam) ? sizeParam : 10;

  const items = useMemo(() => (now && store.institutions.length ? attentionItems(store, now) : []), [store, now]);

  if (!ready || !now || !store.institutions.length) return <AlertsSkeleton />;

  const q = query.trim().toLowerCase();
  const searched = items.filter(
    (i) =>
      (status === "All" || (status === "unread") === !seen.includes(i.id)) &&
      (!q || i.institution.name.toLowerCase().includes(q) || i.institution.slug.includes(q) || i.title.toLowerCase().includes(q) || i.detail.toLowerCase().includes(q))
  );
  const filtered = tab === "all" ? searched : searched.filter((i) => i.kind === tab);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(getPage(), totalPages);
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const unread = items.filter((i) => !seen.includes(i.id));
  const isFiltered = !!q || status !== "All";

  const tabs = [
    { id: "all" as Tab, label: "All", count: searched.length },
    ...ATTENTION_KINDS.map((k) => ({ id: k as Tab, label: ATTENTION_KIND[k].plural, count: searched.filter((i) => i.kind === k).length })),
  ];

  const markAll = () => {
    try {
      markAlertsSeen(items.map((i) => i.id));
      toast.success("All caught up", { description: `${unread.length} alert${unread.length === 1 ? "" : "s"} marked as read.` });
    } catch {
      toast.error("Couldn't update alerts", { description: "Please try again." });
    }
  };

  const getMenuItems = (item: AttentionItem): DropdownActionItem[] => {
    const isRead = seen.includes(item.id);
    return [
      {
        key: "view",
        label: "View institution",
        icon: <Building2 className="h-4 w-4" />,
        onClick: () => {
          markAlertsSeen([item.id]);
          router.push(ATTENTION_KIND[item.kind].href(item));
        },
      },
      isRead
        ? { key: "unread", label: "Mark as unread", icon: <EyeOff className="h-4 w-4" />, onClick: () => markAlertsUnseen([item.id]) }
        : { key: "read", label: "Mark as read", icon: <Eye className="h-4 w-4" />, onClick: () => markAlertsSeen([item.id]) },
    ];
  };

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="space-y-5 pb-8 text-left">
      <ConsoleHeader
        crumbs={[{ label: "Alerts" }]}
        title="Alerts"
        subtitle="Past-due payments, ending trials, full plans and broken domains — fix them from here."
        actions={
          <SecondaryButton size="lg" type="button" leftIcon={<CheckCheck className="h-4 w-4" />} onClick={markAll} disabled={!unread.length}>
            Mark all as read
          </SecondaryButton>
        }
      />

      <AlertsKpis items={items} seen={seen} />

      <PillTabs<Tab> tabs={tabs} activeId={tab} onChange={(next) => set({ tab: next === "all" ? null : next, page: null })} ariaLabel="Alert type" idPrefix="alerts" />

      <div className="bg-white rounded-xl border border-dash shadow-2xs p-5 space-y-4">
        <ListFilters
          query={query}
          searchPlaceholder="Search by institution, subdomain or alert..."
          onQueryChange={(v) => set({ q: v || null, page: null })}
          selects={[{ key: "status", value: status, options: STATUS_OPTIONS, onChange: (v) => set({ status: v, page: null }), className: "xl:w-44" }]}
          onReset={() => set({ q: null, status: null, page: null })}
          isFiltered={isFiltered}
        />
        <AlertsTable
          rows={rows}
          seen={seen}
          invoices={store.invoices}
          open={open}
          actions={actions}
          onRead={(item) => markAlertsSeen([item.id])}
          getMenuItems={getMenuItems}
          emptyMessage={
            items.length === 0 ? (
              <ConsoleEmptyState icon={<BellOff className="h-6 w-6" />} title="You're all caught up" message="No past-due accounts, ending trials, full plans or failing domains." />
            ) : (
              <ConsoleEmptyState icon={<SearchX className="h-6 w-6" />} title="No alerts match" message="Try another tab, status or search." onReset={() => set({ q: null, status: null, tab: null, page: null })} />
            )
          }
          footer={
            filtered.length > 0 ? (
              <TablePagination
                currentPage={page}
                pageSize={pageSize}
                totalCount={filtered.length}
                itemLabel={filtered.length === 1 ? "alert" : "alerts"}
                onPageChange={(next) => set({ page: next })}
                onPageSizeChange={(size) => set({ size: size === 10 ? null : size, page: null })}
                pageSizeOptions={PAGE_SIZES}
              />
            ) : undefined
          }
        />
      </div>
      {dialogs}
    </motion.div>
  );
}

export default AlertsView;
