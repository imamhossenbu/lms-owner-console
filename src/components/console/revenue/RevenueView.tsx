"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { CalendarRange, FileDown } from "lucide-react";
import { useSaasReady, useSaasStore } from "@/lib/planAccess";
import { useUrlParams } from "@/lib/useUrlParams";
import { collectionsSeries, mrrMovement } from "@/lib/saasStats";
import { downloadFile, toCsv, todayStamp } from "@/components/commerce/exportFile";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { ConsoleHeader } from "../subscriptions/shared/ConsoleHeader";
import { useNow } from "../shared/useNow";
import { RevenueKpis } from "./RevenueKpis";
import { MrrMovementChart } from "./MrrMovementChart";
import { CollectionsChart } from "./CollectionsChart";
import { MovementTable } from "./MovementTable";
import { RevenueSkeleton } from "./RevenueSkeleton";
import { DEFAULT_RANGE, parseRange, REVENUE_RANGES, type RevenueRange } from "./revenueRange";

/** /revenue — MRR movement (new / expansion / contraction / churn), collections and the monthly bridge. `?range` survives reloads. */
export function RevenueView() {
  const ready = useSaasReady();
  const store = useSaasStore();
  const now = useNow();
  const { get, set } = useUrlParams();
  const range = parseRange(get("range"));
  const months = Number(range);

  const data = useMemo(() => {
    if (!now) return null;
    return { movement: mrrMovement(store, months, now), collections: collectionsSeries(store, months, now) };
  }, [store, now, months]);

  if (!ready || !data) return <RevenueSkeleton />;

  const exportCsv = () => {
    const csv = toCsv(
      ["Month", "Starting MRR", "New MRR", "New accounts", "Expansion", "Contraction", "Churn", "Churned accounts", "Net change", "Ending MRR", "Collected", "Unpaid", "Refunded"],
      data.movement.map((r, i) => {
        const c = data.collections[i]!;
        return [r.fullLabel, r.starting, r.newMrr, r.newCount, r.expansion, r.contraction, r.churned, r.churnedCount, r.net, r.ending, c.collected, c.outstanding, c.refunded].map((v) =>
          typeof v === "number" ? Number(v.toFixed(2)) : v
        );
      })
    );
    downloadFile(csv, `edupro_revenue_${range}m_${todayStamp()}.csv`, "text/csv");
    toast.success("Export downloaded", { description: `${data.movement.length} months of revenue exported to CSV.` });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="space-y-5 pb-8 text-left">
      <ConsoleHeader
        crumbs={[{ label: "Revenue" }]}
        title="Revenue"
        subtitle="Where recurring revenue comes from and where it goes — month by month."
        actions={
          <>
            <SegmentedControl<RevenueRange>
              options={REVENUE_RANGES.map((r) => ({ value: r, label: `${r} months`, icon: r === DEFAULT_RANGE ? <CalendarRange /> : undefined }))}
              value={range}
              onChange={(next) => set({ range: next === DEFAULT_RANGE ? null : next })}
            />
            <SecondaryButton size="lg" type="button" leftIcon={<FileDown className="h-4 w-4" />} onClick={exportCsv}>
              Export CSV
            </SecondaryButton>
          </>
        }
      />

      <RevenueKpis movement={data.movement} collections={data.collections} />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <MrrMovementChart rows={data.movement} />
        <CollectionsChart rows={data.collections} />
      </div>

      <div className="bg-white rounded-xl border border-dash shadow-2xs p-5 space-y-4">
        <div>
          <h3 className="heading-h5 text-primary-500">Monthly MRR bridge</h3>
          <p className="body-sm-regular text-primary-300 mt-0.5">Starting MRR + new + expansion − contraction − churn = ending MRR.</p>
        </div>
        <MovementTable rows={[...data.movement].reverse()} />
      </div>
    </motion.div>
  );
}

export default RevenueView;
