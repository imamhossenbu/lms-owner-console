"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Archive, ArchiveRestore, Pencil } from "lucide-react";
import { formatMoney } from "@/lib/saasStats";

interface PlanCardFooterProps {
  planId: string;
  subscribers: number;
  trialing: number;
  mrr: number;
  archived: boolean;
  onArchive: () => void;
  onRestore: () => void;
}

/** Owner-only strip under a pricing card: subscribers, MRR contribution and Edit / Archive. */
export function PlanCardFooter({ planId, subscribers, trialing, mrr, archived, onArchive, onRestore }: PlanCardFooterProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="min-w-0">
          <p className="body-2xsm-regular text-primary-300">Subscribers</p>
          <p className="truncate body-sm-medium text-primary-500">
            {subscribers.toLocaleString()}
            {trialing > 0 && <span className="body-xsm-regular text-primary-300"> · {trialing} trialing</span>}
          </p>
        </div>
        <div className="min-w-0">
          <p className="body-2xsm-regular text-primary-300">MRR contribution</p>
          <p className="truncate body-sm-medium text-primary-500">{formatMoney(mrr)}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href={`/plans/${planId}/edit`}
          className="inline-flex h-8.5 flex-1 items-center justify-center gap-1.5 rounded-lg border border-dash bg-white px-3 body-xsm-medium text-primary-500 shadow-2xs transition-colors hover:bg-slate-50"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit plan
        </Link>
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={archived ? onRestore : onArchive}
          aria-label={archived ? "Restore plan" : "Archive plan"}
          title={archived ? "Restore plan" : "Archive plan"}
          className="flex h-8.5 w-8.5 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-dash bg-white text-primary-400 shadow-2xs transition-colors hover:bg-slate-50 hover:text-primary-500"
        >
          {archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
        </motion.button>
      </div>
    </div>
  );
}

export default PlanCardFooter;
