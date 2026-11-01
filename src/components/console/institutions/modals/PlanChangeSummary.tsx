import React from "react";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Info, RefreshCcw } from "lucide-react";
import type { PlanChangePreview } from "@/lib/saasStats";
import { formatMoney } from "@/lib/saasStats";
import { formatLimit, LIMIT_META } from "@/lib/planAccess";
import { cn } from "@/lib/cn";

/** Proration / impact note under the plan cards. Blockers (usage over the target limits) render as a red alert. */
export function PlanChangeSummary({ preview, targetName, periodEnd }: { preview: PlanChangePreview; targetName: string; periodEnd: string }) {
  if (preview.kind === "SAME") {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-dash bg-gray-bg p-3.5">
        <Info className="mt-0.5 h-4.5 w-4.5 shrink-0 text-primary-300" />
        <p className="body-sm-regular text-primary-400">Pick a different plan or billing cycle to see the change.</p>
      </div>
    );
  }

  if (preview.blockers.length) {
    return (
      <div className="rounded-xl border border-red/30 bg-red-14 p-3.5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-red" />
          <div className="min-w-0 body-sm-regular text-red-dark">
            <p className="body-sm-medium">Downgrade blocked — current usage exceeds {targetName} limits</p>
            <ul className="mt-1.5 list-disc space-y-0.5 pl-4">
              {preview.blockers.map((b) => (
                <li key={b.key}>
                  {LIMIT_META[b.key].label}: {formatLimit(b.usage, b.key)} used, {targetName} allows {formatLimit(b.limit, b.key)}
                </li>
              ))}
            </ul>
            <p className="mt-1.5">Ask the institution to reduce usage first, or pick a bigger plan.</p>
          </div>
        </div>
      </div>
    );
  }

  const mrrDelta = preview.nextMonthly - preview.currentMonthly;
  const ends = new Date(periodEnd).toLocaleDateString("en-US", { dateStyle: "medium" });
  const Icon = preview.kind === "UPGRADE" ? ArrowUpRight : preview.kind === "DOWNGRADE" ? ArrowDownRight : RefreshCcw;

  let line: string;
  if (preview.trialing) line = `The trial continues on ${targetName}. Nothing is charged until the trial converts.`;
  else if (preview.resetsPeriod)
    line = `A new billing period starts today. ${formatMoney(preview.nextPrice)} less ${formatMoney(preview.credit)} unused credit — ${formatMoney(preview.dueNow)} charged now.`;
  else if (preview.kind === "UPGRADE") line = `Prorated for the rest of the period (until ${ends}): ${formatMoney(preview.dueNow)} charged now, then ${formatMoney(preview.nextPrice)} per cycle.`;
  else line = `Applies immediately. No refund for the current period; renews at ${formatMoney(preview.nextPrice)} on ${ends}.`;

  return (
    <div className={cn("flex items-start gap-3 rounded-xl border p-3.5", preview.kind === "DOWNGRADE" ? "border-yellow/30 bg-yellow-bg" : "border-blue/30 bg-blue-14")}>
      <Icon className={cn("mt-0.5 h-4.5 w-4.5 shrink-0", preview.kind === "DOWNGRADE" ? "text-yellow" : "text-blue")} />
      <div className="min-w-0 body-sm-regular text-primary-400">
        <p className="body-sm-medium text-primary-500">
          {preview.kind === "UPGRADE" ? "Upgrade" : preview.kind === "DOWNGRADE" ? "Downgrade" : "Billing cycle change"} · MRR {mrrDelta >= 0 ? "+" : "−"}
          {formatMoney(Math.abs(Math.round(mrrDelta * 100) / 100))}
        </p>
        <p className="mt-0.5">{line}</p>
      </div>
    </div>
  );
}

export default PlanChangeSummary;
