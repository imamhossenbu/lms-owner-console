"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleSidebar } from "@/store/slices/uiSlice";
import { EduProCapIcon } from "@/components/ui/EduProLogo";
import { useSaasStore } from "@/lib/planAccess";
import { cn } from "@/lib/cn";
import { CONSOLE_NAV, isNavActive } from "./consoleNav";

/** Owner Console sidebar — a 1:1 twin of the institution panel's white AdminSidebar (same geometry, colours, active state). */
export function ConsoleSidebar() {
  const pathname = usePathname() ?? "/";
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector((state) => state.ui.sidebarCollapsed);
  const store = useSaasStore();

  // Live "needs you" counts, rendered exactly like the panel's Notifications count pill.
  const counts = useMemo<Record<string, { value: number; label: string } | undefined>>(() => {
    const pastDue = store.institutions.filter((i) => i.subscription.status === "PAST_DUE").length;
    const unpaid = store.invoices.filter((i) => i.status === "FAILED" || i.status === "OPEN").length;
    const pendingDomains = store.institutions.filter((i) => i.customDomain && i.customDomain.status !== "VERIFIED").length;
    return {
      "/subscriptions": pastDue ? { value: pastDue, label: `${pastDue} past due` } : undefined,
      "/invoices": unpaid ? { value: unpaid, label: `${unpaid} unpaid` } : undefined,
      "/domains": pendingDomains ? { value: pendingDomains, label: `${pendingDomains} pending` } : undefined,
    };
  }, [store]);

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 bg-white text-primary-500 flex flex-col justify-between transition-all duration-300 z-30 select-none border-r border-dash shrink-0",
        collapsed ? "w-18" : "w-60"
      )}
    >
      <div className="flex-1 flex flex-col min-h-0">
        {/* Brand header */}
        <div className={cn("h-16 flex items-center border-b border-dash shrink-0 transition-all", collapsed ? "px-3 justify-center" : "px-4 justify-between")}>
          {collapsed ? (
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => dispatch(toggleSidebar())}
              className="w-10 h-10 rounded-xl bg-brand-orange-light flex items-center justify-center cursor-pointer hover:scale-105 transition-all shadow-2xs relative"
              title="Click to expand sidebar"
              aria-label="Expand sidebar"
            >
              <EduProCapIcon className="w-6 h-6 text-brand-orange" />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-brand-orange text-white flex items-center justify-center shadow-xs">
                <ChevronRight className="w-3 h-3" />
              </span>
            </motion.button>
          ) : (
            <>
              <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
                <span className="w-9 h-9 rounded-xl bg-brand-orange-light flex items-center justify-center shrink-0">
                  <EduProCapIcon className="w-6 h-6 text-brand-orange" />
                </span>
                <span className="flex flex-col text-left">
                  <span className="body-medium text-primary-500 tracking-tight">EduPro</span>
                  <span className="body-2xsm-regular text-primary-300 mt-0.5">Owner Console</span>
                </span>
              </Link>
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={() => dispatch(toggleSidebar())}
                className="p-1.5 rounded-lg text-primary-300 hover:text-brand-orange hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </motion.button>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav aria-label="Owner Console" className="flex-1 overflow-y-auto px-2.5 py-3 space-y-3.5 text-left custom-scrollbar">
          {CONSOLE_NAV.map((section) => (
            <div key={section.category} className="space-y-1">
              {!collapsed && (
                <div className="px-3 pt-1 pb-0.5 body-xs-medium font-bold! text-primary-400 tracking-wider uppercase select-none">{section.category}</div>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = isNavActive(pathname, item.href);
                  const count = counts[item.href];
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      title={collapsed ? (count ? `${item.label} (${count.label})` : item.label) : undefined}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-xl transition-all group",
                        isActive
                          ? "bg-brand-orange-light text-brand-orange border-l-4 border-brand-orange rounded-l-none"
                          : "text-primary-400 hover:bg-slate-50 hover:text-primary-500",
                        collapsed && "justify-center px-0 w-11 h-10 mx-auto"
                      )}
                    >
                      <Icon className={cn("w-4.5 h-4.5 shrink-0 transition-colors", isActive ? "text-brand-orange" : "text-primary-300 group-hover:text-primary-400")} />
                      {!collapsed && (
                        <>
                          <span className="body-sm-medium truncate">{item.label}</span>
                          {count && (
                            <span
                              aria-label={count.label}
                              className="ml-auto min-w-5 h-5 px-1 rounded-md bg-brand-orange text-white body-2xsm-regular font-bold! flex items-center justify-center shadow-2xs whitespace-nowrap shrink-0"
                            >
                              {count.value > 99 ? "99+" : count.value}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Expand toggle (collapsed only) — same as the panel */}
      {collapsed && (
        <div className="p-2.5 border-t border-dash">
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => dispatch(toggleSidebar())}
            className="w-full flex items-center justify-center p-2 rounded-xl bg-brand-orange-light text-brand-orange hover:bg-brand-orange hover:text-white transition-all cursor-pointer shadow-2xs"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      )}
    </aside>
  );
}

export default ConsoleSidebar;
