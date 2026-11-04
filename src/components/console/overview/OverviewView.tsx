"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Building2, Plus } from "lucide-react";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { useSaasReady, useSaasStore } from "@/lib/planAccess";
import { attentionItems, kpiSparks, mrrSeries, newSignupsSeries, overviewKpis, planDistribution, revenueByPlan } from "@/lib/saasStats";
import { useNow } from "../shared/useNow";
import { useInstitutionActions } from "../institutions/actions/useInstitutionActions";
import { useInstitutionDialogs } from "../institutions/actions/useInstitutionDialogs";
import { OverviewSkeleton } from "./OverviewSkeleton";
import { OverviewStatsGrid } from "./OverviewStatsGrid";
import { MrrChartCard } from "./MrrChartCard";
import { PlanDonutCard } from "./PlanDonutCard";
import { SignupsChartCard } from "./SignupsChartCard";
import { AttentionCard } from "./AttentionCard";
import { RecentEventsCard } from "./RecentEventsCard";

const MONTHS = 14;

/** /console — platform KPIs, MRR growth, signups, plan mix, needs-attention list and recent activity. */
export function OverviewView() {
  const router = useRouter();
  const ready = useSaasReady();
  const store = useSaasStore();
  const now = useNow();
  const actions = useInstitutionActions();
  const { open, dialogs } = useInstitutionDialogs(store.plans, actions);

  const data = useMemo(() => {
    if (!now) return null;
    return {
      kpis: overviewKpis(store, now),
      sparks: kpiSparks(store, 8, now),
      mrr: mrrSeries(store, MONTHS, now),
      signups: newSignupsSeries(store, MONTHS, now),
      distribution: planDistribution(store),
      revenue: revenueByPlan(store),
      attention: attentionItems(store, now),
    };
  }, [store, now]);

  if (!ready || !data) return <OverviewSkeleton />;

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="space-y-3 text-left pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="text-left">
          <h1 className="h3-semibold font-bold! text-primary-500 tracking-tight leading-tight!">Overview</h1>
          <p className="body-sm-regular text-primary-300 mt-0.5">
            Here&apos;s what&apos;s happening across EduPro · {store.institutions.length} institutions.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <SecondaryButton leftIcon={<Building2 className="w-4 h-4" />} onClick={() => router.push("/institutions")}>
            All institutions
          </SecondaryButton>
          <PrimaryButton leftIcon={<Plus className="w-4 h-4" strokeWidth={2.5} />} onClick={() => router.push("/institutions/new")}>
            Add institution
          </PrimaryButton>
        </div>
      </div>
      <OverviewStatsGrid kpis={data.kpis} sparks={data.sparks} />
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <MrrChartCard series={data.mrr} className="xl:col-span-2" />
        <PlanDonutCard distribution={data.distribution} revenue={data.revenue} />
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <SignupsChartCard series={data.signups} />
        <AttentionCard items={data.attention} invoices={store.invoices} open={open} actions={actions} />
      </div>
      <RecentEventsCard events={store.events} institutions={store.institutions} now={now} />
      {dialogs}
    </motion.div>
  );
}

export default OverviewView;
