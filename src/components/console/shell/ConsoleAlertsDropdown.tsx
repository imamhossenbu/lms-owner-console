"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, BellOff, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import type { AttentionItem } from "@/lib/saasStats";
import { attentionItems } from "@/lib/saasStats";
import { useSaasStore } from "@/lib/planAccess";
import { ToneBadge } from "@/components/ui/ToneBadge";
import { cn } from "@/lib/cn";
import { useNow } from "../shared/useNow";
import { ATTENTION_KIND } from "../shared/attentionMeta";
import { markAlertsSeen, useSeenAlerts } from "./consoleAlertsSeen";

const LATEST_COUNT = 6;


/** Navbar bell — same card as the panel's NotificationDropdown, fed by the "needs attention" list (full page: /alerts). */
export function ConsoleAlertsDropdown() {
  const router = useRouter();
  const store = useSaasStore();
  const now = useNow();
  const seen = useSeenAlerts();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const items = useMemo(() => (now && store.institutions.length ? attentionItems(store, now) : []), [store, now]);
  const unread = items.filter((i) => !seen.includes(i.id));
  const latest = items.slice(0, LATEST_COUNT);

  useEffect(() => {
    if (!isOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  const markAll = () => {
    try {
      markAlertsSeen(items.map((i) => i.id));
      toast.success("All caught up", { description: "All alerts marked as read." });
    } catch {
      toast.error("Couldn't update alerts", { description: "Please try again." });
    }
  };

  const openItem = (item: AttentionItem) => {
    markAlertsSeen([item.id]);
    setIsOpen(false);
    router.push(ATTENTION_KIND[item.kind].href(item));
  };

  return (
    <div className="relative" ref={ref}>
      <motion.button
        type="button"
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={unread.length ? `Alerts (${unread.length} unread)` : "Alerts"}
        className="w-10 h-10 flex items-center justify-center rounded-xl border border-dash bg-white text-primary-400 hover:text-primary-500 hover:bg-slate-50 transition-colors relative cursor-pointer shadow-2xs"
        title="Alerts"
      >
        <Bell className="w-4 h-4" />
        <AnimatePresence>
          {unread.length > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="min-w-4 h-4 px-1 rounded-full bg-brand-orange text-white body-2xsm-regular font-bold! flex items-center justify-center absolute -top-1 -right-1 ring-2 ring-white whitespace-nowrap"
            >
              {unread.length > 9 ? "9+" : unread.length}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -6 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{ transformOrigin: "top right" }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-dash overflow-hidden z-50"
          >
            <div className="px-5 py-4 border-b border-dash flex items-center justify-between gap-3 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <h3 className="heading-h6 font-bold! text-primary-500">Alerts</h3>
                {unread.length > 0 && (
                  <ToneBadge tone="orange" size="sm">
                    {unread.length} new
                  </ToneBadge>
                )}
              </div>
              {unread.length > 0 && (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={markAll}
                  className="body-xsm-medium font-semibold! text-brand-orange hover:text-brand-orange-hover flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all as read</span>
                </motion.button>
              )}
            </div>

            {latest.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-bg text-primary-300">
                  <BellOff className="h-5 w-5" />
                </span>
                <p className="body-sm-medium font-semibold! text-primary-500">You&apos;re all caught up</p>
                <p className="body-xsm-regular text-primary-300">Past-due accounts, ending trials and limits show up here.</p>
              </div>
            ) : (
              <ul className="max-h-96 overflow-y-auto divide-y divide-dash custom-scrollbar">
                {latest.map((item, i) => {
                  const meta = ATTENTION_KIND[item.kind];
                  const Icon = meta.icon;
                  const isUnread = !seen.includes(item.id);
                  return (
                    <motion.li key={item.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18, ease: "easeOut", delay: i * 0.025 }}>
                      <button
                        type="button"
                        onClick={() => openItem(item)}
                        className={cn("w-full p-4 flex items-start gap-3 transition-colors cursor-pointer hover:bg-slate-50 text-left", isUnread ? "bg-brand-orange-soft" : "bg-white")}
                      >
                        <span className={cn("mt-0.5 w-9 h-9 rounded-lg flex items-center justify-center shrink-0", meta.tile)}>
                          <Icon className="w-4 h-4" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={cn("body-sm-medium truncate", isUnread ? "text-primary-500 font-bold!" : "text-primary-400")}>{item.institution.name}</p>
                          <p className="body-sm-regular text-primary-400 mt-0.5 truncate">{item.title}</p>
                          <p className="body-xsm-regular text-primary-300 truncate">{item.detail}</p>
                        </div>
                        {isUnread && <span className="w-2 h-2 rounded-full bg-brand-orange shrink-0 mt-2" aria-label="Unread" />}
                      </button>
                    </motion.li>
                  );
                })}
              </ul>
            )}

            <div className="p-3 bg-slate-50 border-t border-dash text-center">
              <Link
                href="/alerts"
                onClick={() => setIsOpen(false)}
                className="body-sm-medium font-semibold! text-brand-orange hover:text-brand-orange-hover hover:underline transition-colors block py-1"
              >
                {items.length ? `View all ${items.length} alerts` : "Open alerts"}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ConsoleAlertsDropdown;
