"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Building2, Plus } from "lucide-react";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { useSaasReady, useSaasStore } from "@/lib/planAccess";
import { attentionItems, mrrSeries, newSignupsSeries, overviewKpis, planDistribution, revenueByPlan } from "@/lib/saasStats";
import { ConsolePageHeader } from "../shared/ConsolePageHeader";
import { useNow } from "../shared/useNow";
import { useInstitutionActions } from "../institutions/actions/useInstitutionActions";
import { useInstitutionDialogs } from "../institutions/actions/useInstitutionDialogs";
import { OverviewSkeleton } from "./OverviewSkeleton";
import { KpiGrid } from "./KpiGrid";
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
    if (!now || !store.institutions.length) return null;
    return {
      kpis: overviewKpis(store, now),
      mrr: mrrSeries(store, MONTHS, now),
      signups: newSignupsSeries(store, MONTHS, now),
      distribution: planDistribution(store),
      revenue: revenueByPlan(store),
      attention: attentionItems(store, now),
    };
  }, [store, now]);

  if (!ready || !data) return <OverviewSkeleton />;

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="space-y-5 pb-8 text-left">
      <ConsolePageHeader
        trail={[]}
        title="Platform overview"
        subtitle={`${store.institutions.length} institutions on EduPro · revenue, growth and accounts that need you`}
        actions={
          <>
            <SecondaryButton leftIcon={<Building2 className="h-4 w-4" />} onClick={() => router.push("/institutions")}>
              All institutions
            </SecondaryButton>
            <PrimaryButton leftIcon={<Plus className="h-4 w-4" />} onClick={() => router.push("/institutions/new")}>
              Add institution
            </PrimaryButton>
          </>
        }
      />
      <KpiGrid kpis={data.kpis} />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <MrrChartCard series={data.mrr} />
        </div>
        <PlanDonutCard distribution={data.distribution} revenue={data.revenue} />
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <SignupsChartCard series={data.signups} />
        <AttentionCard items={data.attention} invoices={store.invoices} open={open} actions={actions} />
      </div>
      <RecentEventsCard events={store.events} institutions={store.institutions} now={now} />
      {dialogs}
    </motion.div>
  );
}

export default OverviewView;
