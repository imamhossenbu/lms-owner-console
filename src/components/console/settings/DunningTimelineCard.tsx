"use client";

import React from "react";
import { motion } from "framer-motion";
import { CircleAlert, CreditCard, Ban, RefreshCw, Route } from "lucide-react";
import { SettingsCard } from "@/components/settings/shared/SettingsCard";
import { cn } from "@/lib/cn";

interface DunningTimelineCardProps {
  retryDays: number[];
  graceDays: number;
  suspend: boolean;
}

interface Step {
  day: number;
  title: string;
  hint: string;
  icon: React.ReactNode;
  tone: string;
}

/** Live timeline of what happens after a renewal payment fails. */
export function DunningTimelineCard({ retryDays, graceDays, suspend }: DunningTimelineCardProps) {
  const steps: Step[] = [
    { day: 0, title: "Payment fails", hint: "Status → Past due · email sent", icon: <CreditCard className="h-3.5 w-3.5" />, tone: "bg-red-14 text-red" },
    ...retryDays.map((day, i) => ({
      day,
      title: `Retry ${i + 1}`,
      hint: "Charge the saved method again",
      icon: <RefreshCw className="h-3.5 w-3.5" />,
      tone: "bg-blue-14 text-blue",
    })),
    suspend
      ? { day: graceDays, title: "Suspend institution", hint: "Admin panel locked until paid", icon: <Ban className="h-3.5 w-3.5" />, tone: "bg-gray-bg text-primary-500" }
      : { day: graceDays, title: "Grace period ends", hint: "Stays past due — review manually", icon: <CircleAlert className="h-3.5 w-3.5" />, tone: "bg-yellow-bg text-yellow" },
  ].sort((a, b) => a.day - b.day);

  return (
    <SettingsCard title="Dunning timeline" description="What happens after a failed renewal." icon={<Route className="h-5 w-5" />} tone="red" divided={false}>
      <ol className="relative space-y-4 border-l border-dash pl-5">
        {steps.map((step, i) => (
          <motion.li
            key={`${step.title}-${step.day}`}
            layout
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: i * 0.03 }}
            className="relative"
          >
            <span className={cn("absolute -left-8 top-0 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white", step.tone)}>{step.icon}</span>
            <p className="body-sm-medium text-primary-500">
              <span className="text-primary-300">Day {step.day} · </span>
              {step.title}
            </p>
            <p className="body-xsm-regular text-primary-300">{step.hint}</p>
          </motion.li>
        ))}
      </ol>
    </SettingsCard>
  );
}

export default DunningTimelineCard;
