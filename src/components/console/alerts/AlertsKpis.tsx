import React from "react";
import type { AttentionItem } from "@/lib/saasStats";
import { TrendStatCard } from "@/components/ui/TrendStatCard";
import { ATTENTION_KIND, ATTENTION_KINDS } from "../shared/attentionMeta";

/** One card per alert type with its open count and how many are still unread. */
export function AlertsKpis({ items, seen }: { items: AttentionItem[]; seen: string[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {ATTENTION_KINDS.map((kind) => {
        const meta = ATTENTION_KIND[kind];
        const Icon = meta.icon;
        const ofKind = items.filter((i) => i.kind === kind);
        const unread = ofKind.filter((i) => !seen.includes(i.id)).length;
        return (
          <TrendStatCard
            key={kind}
            icon={<Icon />}
            iconClassName={meta.tile}
            label={meta.plural}
            value={ofKind.length.toLocaleString()}
            trend={unread ? { direction: "up", value: `${unread}`, caption: "unread" } : undefined}
          />
        );
      })}
    </div>
  );
}

export default AlertsKpis;
