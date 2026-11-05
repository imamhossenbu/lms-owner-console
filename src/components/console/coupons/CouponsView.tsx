"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, SearchX, TicketPercent } from "lucide-react";
import type { CouponStatus } from "@/types/coupon";
import { COUPON_STATUSES } from "@/types/coupon";
import { useCouponPage } from "@/lib/couponStorage";
import { useSaasReady, useSaasStore } from "@/lib/planAccess";
import { useUrlParams } from "@/lib/useUrlParams";
import { ListFilters } from "@/components/ui/ListFilters";
import { TablePagination } from "@/components/ui/TablePagination";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ConsoleHeader } from "../subscriptions/shared/ConsoleHeader";
import { ConsoleEmptyState } from "../shared/ConsoleEmptyState";
import { useNow } from "../shared/useNow";
import { COUPON_STATUS_OPTIONS, COUPON_TYPE_OPTIONS } from "./couponMeta";
import { CouponKpis } from "./CouponKpis";
import { CouponsTable } from "./CouponsTable";
import { CouponsSkeleton } from "./CouponsSkeleton";
import { useCouponActions } from "./useCouponActions";

const PAGE_SIZES = [10, 20, 50];

/** /coupons — discount codes with status, redemptions and expiry. `?q`, `?status`, `?type`, `?page`, `?size` survive reloads. */
export function CouponsView() {
  const router = useRouter();
  const ready = useSaasReady();
  const store = useSaasStore();
  const now = useNow();
  const { get, getPage, set } = useUrlParams();
  const actions = useCouponActions();

  const query = get("q");
  const status = COUPON_STATUSES.includes(get("status") as CouponStatus) ? (get("status") as CouponStatus) : "All";
  const type = get("type") === "PERCENT" || get("type") === "FIXED" ? get("type") : "All";
  const sizeParam = Number(get("size"));
  const pageSize = PAGE_SIZES.includes(sizeParam) ? sizeParam : 10;
  const q = query.trim();
  // The server searches, filters and pages; KPIs come from /coupons/stats.
  const { rows, total, stats, isLoading } = useCouponPage(
    { q: q || undefined, status: status === "All" ? undefined : status, type: type === "All" ? undefined : type },
    getPage(),
    pageSize
  );

  if (isLoading || !stats || !ready || !now) return <CouponsSkeleton />;

  const page = Math.min(getPage(), Math.max(1, Math.ceil(total / pageSize)));
  const isFiltered = !!q || status !== "All" || type !== "All";
  const reset = () => set({ q: null, status: null, type: null, page: null });

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="space-y-5 pb-8 text-left">
      <ConsoleHeader
        crumbs={[{ label: "Coupons" }]}
        title="Coupons"
        subtitle="Discount codes institutions can redeem on their subscription."
        actions={
          <PrimaryButton size="lg" leftIcon={<Plus className="h-4 w-4" />} onClick={() => router.push("/coupons/new")}>
            Create coupon
          </PrimaryButton>
        }
      />

      <CouponKpis stats={stats} />

      <div className="bg-white rounded-xl border border-dash shadow-2xs p-5 space-y-4">
        <ListFilters
          query={query}
          searchPlaceholder="Search by code or description..."
          onQueryChange={(v) => set({ q: v || null, page: null })}
          selects={[
            { key: "status", value: status, options: COUPON_STATUS_OPTIONS, onChange: (v) => set({ status: v, page: null }), className: "xl:w-44" },
            { key: "type", value: type, options: COUPON_TYPE_OPTIONS, onChange: (v) => set({ type: v, page: null }), className: "xl:w-44" },
          ]}
          onReset={reset}
          isFiltered={isFiltered}
        />
        <CouponsTable
          rows={rows}
          plans={store.plans}
          now={now}
          onRowClick={(c) => router.push(`/coupons/${c.id}/edit`)}
          getMenuItems={actions.getMenuItems}
          emptyMessage={
            isFiltered ? (
              <ConsoleEmptyState icon={<SearchX className="h-6 w-6" />} title="No coupons match your filters" message="Try another code, status or type." onReset={reset} />
            ) : (
              <ConsoleEmptyState
                icon={<TicketPercent className="h-6 w-6" />}
                title="No coupons yet"
                message="Create a discount code for a campaign, partner or launch offer."
                actionLabel="Create coupon"
                actionIcon={<Plus className="h-4 w-4" />}
                onAction={() => router.push("/coupons/new")}
              />
            )
          }
          footer={
            total > 0 ? (
              <TablePagination
                currentPage={page}
                pageSize={pageSize}
                totalCount={total}
                itemLabel={total === 1 ? "coupon" : "coupons"}
                onPageChange={(next) => set({ page: next })}
                onPageSizeChange={(size) => set({ size: size === 10 ? null : size, page: null })}
                pageSizeOptions={PAGE_SIZES}
              />
            ) : undefined
          }
        />
      </div>
      {actions.modals}
    </motion.div>
  );
}

export default CouponsView;
