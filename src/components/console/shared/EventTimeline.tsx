"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  Ban,
  CheckCircle2,
  CircleDollarSign,
  CircleX,
  Clock,
  Globe,
  type LucideIcon,
  PlayCircle,
  RefreshCcw,
  ShieldCheck,
  StickyNote,
  UserPlus,
  XCircle,
} from "lucide-react";
import type { Institution, SaasEvent, SaasEventType } from "@/types/saas";
import { ToneBadge } from "@/components/ui/ToneBadge";
import { cn } from "@/lib/cn";
import { EVENT_LABEL, EVENT_TONE, formatDate, formatDateTime, relativeTime } from "./consoleMeta";

const ICON: Record<SaasEventType, LucideIcon> = {
  SIGNED_UP: UserPlus,
  TRIAL_STARTED: Clock,
  TRIAL_CONVERTED: CheckCircle2,
  TRIAL_EXPIRED: CircleX,
  PLAN_UPGRADED: ArrowUpRight,
  PLAN_DOWNGRADED: ArrowDownRight,
  CYCLE_CHANGED: RefreshCcw,
  PAYMENT_SUCCEEDED: CircleDollarSign,
  PAYMENT_FAILED: XCircle,
  CANCELLED: CircleX,
  REACTIVATED: PlayCircle,
  SUSPENDED: Ban,
  DOMAIN_ADDED: Globe,
  DOMAIN_VERIFIED: ShieldCheck,
  NOTE: StickyNote,
};

const ICON_TILE: Record<string, string> = {
  green: "bg-green-bg text-green",
  blue: "bg-blue-14 text-blue",
  indigo: "bg-blue-14 text-blue",
  red: "bg-red-14 text-red",
  yellow: "bg-yellow-bg text-yellow",
  purple: "bg-purple-14 text-purple",
  orange: "bg-brand-orange-light text-brand-orange",
  gray: "bg-gray-bg text-primary-400",
};

export interface EventTimelineProps {
  events: SaasEvent[];
  /** When given, each row links to its institution (overview feed). */
  institutions?: Map<string, Institution>;
  /** Group rows under day headings (activity tab). */
  groupByDay?: boolean;
  /** Pass `Date.now()` captured outside render for relative times. */
  now: number;
}

/** Vertical event feed: tone icon, type badge, message, actor and time. */
export function EventTimeline({ events, institutions, groupByDay = false, now }: EventTimelineProps) {
  const groups: { label: string; items: SaasEvent[] }[] = [];
  events.forEach((e) => {
    const label = groupByDay ? formatDate(e.at) : "";
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(e);
    else groups.push({ label, items: [e] });
  });

  return (
    <div className="space-y-5">
      {groups.map((g) => (
        <div key={g.label || "all"}>
          {groupByDay && <p className="mb-3 body-2xsm-regular font-semibold! uppercase tracking-wider text-primary-300">{g.label}</p>}
          <ol className="space-y-0">
            {g.items.map((e, i) => {
              const Icon = ICON[e.type];
              const tone = EVENT_TONE[e.type];
              const inst = institutions?.get(e.institutionId);
              return (
                <motion.li
                  key={e.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut", delay: Math.min(i, 10) * 0.03 }}
                  className="flex gap-3"
                >
                  <div className="flex flex-col items-center">
                    <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", ICON_TILE[tone] ?? ICON_TILE.gray)}>
                      <Icon className="h-4 w-4" />
                    </span>
                    {i < g.items.length - 1 && <span className="my-1 w-px flex-1 bg-slate-200" />}
                  </div>
                  <div className="min-w-0 flex-1 pb-4">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <ToneBadge tone={tone} size="sm" variant="pill">
                        {EVENT_LABEL[e.type]}
                      </ToneBadge>
                      {inst && (
                        <Link href={`/institutions/${inst.id}?tab=activity`} className="truncate body-sm-medium text-primary-500 hover:text-brand-orange">
                          {inst.name}
                        </Link>
                      )}
                      <span className="body-2xsm-regular text-primary-300" title={formatDateTime(e.at)}>
                        {relativeTime(e.at, now)} · {e.actor}
                      </span>
                    </div>
                    <p className="mt-1 break-words body-sm-regular text-primary-400">{e.message}</p>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>
      ))}
    </div>
  );
}

export default EventTimeline;
