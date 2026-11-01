"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { History } from "lucide-react";
import { ToneBadge } from "@/components/ui/ToneBadge";
import { cn } from "@/lib/cn";
import { settingsFullDate, settingsTimeAgo } from "./settingsTime";

export interface SettingsSectionLayoutProps {
  title: string;
  description: string;
  /** Sized lucide icon, e.g. <Building2 className="h-5 w-5" />. */
  icon: React.ReactNode;
  /** Main column: SettingsCard stack (+ SettingsSaveBar at the end). */
  children: React.ReactNode;
  /** Right column (previews, summaries, tips) — sticky on wide screens. */
  aside?: React.ReactNode;
  /** ISO time of the last save of this section (store.updatedAt[section]). */
  updatedAt?: string;
  className?: string;
}

/** Re-renders every minute so "Last updated 5m ago" stays honest. */
function useMinuteTick() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 60000);
    return () => window.clearInterval(id);
  }, []);
}

/**
 * Shell of every settings section: icon tile + title + description + "Last updated" badge,
 * then a two-column body (cards ~8/12, sticky aside ~4/12) that stacks below xl.
 */
export function SettingsSectionLayout({ title, description, icon, children, aside, updatedAt, className }: SettingsSectionLayoutProps) {
  useMinuteTick();

  return (
    <div className={cn("space-y-5", className)}>
      <motion.header
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex min-w-0 items-center gap-3.5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-brand-orange/20 bg-brand-orange-light text-brand-orange">
            {icon}
          </span>
          <div className="min-w-0">
            <h2 className="heading-h5 font-semibold! text-primary-500">{title}</h2>
            <p className="mt-0.5 body-sm-regular text-primary-300">{description}</p>
          </div>
        </div>
        {updatedAt && (
          <span title={settingsFullDate(updatedAt)} className="self-start sm:self-center">
            <ToneBadge tone="gray" variant="pill" icon={<History className="h-3.5 w-3.5" />}>
              Last updated {settingsTimeAgo(updatedAt)}
            </ToneBadge>
          </span>
        )}
      </motion.header>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
        <div className={cn("min-w-0 space-y-5", aside ? "xl:col-span-8" : "xl:col-span-12")}>{children}</div>
        {aside && (
          <aside className="min-w-0 xl:col-span-4 xl:sticky xl:top-6">
            <div className="space-y-5">{aside}</div>
          </aside>
        )}
      </div>
    </div>
  );
}

export default SettingsSectionLayout;
