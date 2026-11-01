"use client";

import React, { useMemo } from "react";
import { Activity } from "lucide-react";
import type { Institution, SaasEvent } from "@/types/saas";
import { IconSectionCard } from "@/components/ui/IconSectionCard";
import { EventTimeline } from "../shared/EventTimeline";

/** Latest platform-wide events (signups, payments, plan changes …) linking to each institution. */
export function RecentEventsCard({ events, institutions, now, limit = 10 }: { events: SaasEvent[]; institutions: Institution[]; now: number; limit?: number }) {
  const byId = useMemo(() => new Map(institutions.map((i) => [i.id, i])), [institutions]);
  const recent = useMemo(() => [...events].sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit), [events, limit]);
  return (
    <IconSectionCard icon={<Activity className="h-5 w-5" />} tone="green" title="Recent activity" description="Latest events across all institutions">
      {recent.length === 0 ? (
        <p className="py-8 text-center body-sm-regular text-primary-300">No activity yet.</p>
      ) : (
        <EventTimeline events={recent} institutions={byId} now={now} />
      )}
    </IconSectionCard>
  );
}

export default RecentEventsCard;
