"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleSidebar } from "@/store/slices/uiSlice";
import { EduProCapIcon } from "@/components/ui/EduProLogo";
import { ToneBadge } from "@/components/ui/ToneBadge";
import { useSaasStore } from "@/lib/planAccess";
import { cn } from "@/lib/cn";
import { CONSOLE_NAV, isNavActive } from "./consoleNav";
import { ADMIN_PANEL_URL } from "@/lib/adminPanel";

/** Navy Owner Console sidebar — visually distinct from the white institution AdminSidebar. */
export function ConsoleSidebar() {
  const pathname = usePathname() ?? "/";
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector((state) => state.ui.sidebarCollapsed);
  const store = useSaasStore();

  const counts = useMemo<Record<string, { value: number; tone: "red" | "yellow" | "blue" } | undefined>>(() => {
    const pastDue = store.institutions.filter((i) => i.subscription.status === "PAST_DUE").length;
    const unpaid = store.invoices.filter((i) => i.status === "FAILED" || i.status === "OPEN").length;
    const pendingDomains = store.institutions.filter((i) => i.customDomain && i.customDomain.status !== "VERIFIED").length;
    return {
      "/subscriptions": pastDue ? { value: pastDue, tone: "yellow" } : undefined,
      "/invoices": unpaid ? { value: unpaid, tone: "red" } : undefined,
      "/domains": pendingDomains ? { value: pendingDomains, tone: "blue" } : undefined,
    };
  }, [store]);

  return (
    <aside
      className={cn(
        "sticky top-0 z-30 flex h-screen shrink-0 select-none flex-col justify-between bg-brand-navy text-white transition-all duration-300",
        collapsed ? "w-18" : "w-60"
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <div className={cn("flex h-16 shrink-0 items-center border-b border-white/10", collapsed ? "justify-center px-3" : "justify-between px-4")}>
          {collapsed ? (
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => dispatch(toggleSidebar())}
              className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-brand-card"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <EduProCapIcon className="h-6 w-6" />
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-orange text-white">
                <ChevronRight className="h-3 w-3" />
              </span>
            </motion.button>
          ) : (
            <>
              <Link href="/" className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-card">
                  <EduProCapIcon className="h-6 w-6" />
                </span>
                <span className="flex min-w-0 flex-col text-left">
                  <span className="flex items-center gap-1.5">
                    <span className="body-medium tracking-tight text-white">EduPro</span>
                    <ToneBadge tone="orange" size="sm" variant="pill">
                      Console
                    </ToneBadge>
                  </span>
                  <span className="mt-0.5 body-2xsm-regular text-white/60">Owner Console</span>
                </span>
              </Link>
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={() => dispatch(toggleSidebar())}
                className="shrink-0 cursor-pointer rounded-lg p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </motion.button>
            </>
          )}
        </div>

        <nav aria-label="Owner Console" className="custom-scrollbar flex-1 space-y-3.5 overflow-y-auto px-2.5 py-3 text-left">
          {CONSOLE_NAV.map((section) => (
            <div key={section.category} className="space-y-1">
              {!collapsed && <div className="select-none px-3 pb-0.5 pt-1 body-xs-medium font-bold! uppercase tracking-wider text-white/40">{section.category}</div>}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isNavActive(pathname, item.href);
                  const count = counts[item.href];
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-xl px-3 py-2 transition-colors",
                        active ? "text-white" : "text-white/65 hover:bg-white/5 hover:text-white",
                        collapsed && "mx-auto h-10 w-11 justify-center px-0"
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="console-nav-active"
                          className="absolute inset-0 rounded-xl border border-white/10 bg-brand-card"
                          transition={{ type: "spring", stiffness: 450, damping: 36 }}
                        />
                      )}
                      {active && <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-brand-orange" />}
                      <Icon className={cn("relative h-4.5 w-4.5 shrink-0", active ? "text-brand-orange" : "text-white/50 group-hover:text-white/80")} />
                      {!collapsed && (
                        <>
                          <span className="relative truncate body-sm-medium">{item.label}</span>
                          {count && (
                            <ToneBadge tone={count.tone} size="sm" variant="pill" className="relative ml-auto">
                              {count.value}
                            </ToneBadge>
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

      <div className="border-t border-white/10 p-2.5">
        <a
          href={ADMIN_PANEL_URL}
          target="_blank"
          rel="noreferrer"
          title="Open institution panel"
          className={cn(
            "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-white/70 transition-colors hover:bg-white/5 hover:text-white",
            collapsed && "justify-center px-0"
          )}
        >
          <ExternalLink className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="truncate body-sm-medium">Institution panel</span>}
        </a>
      </div>
    </aside>
  );
}

export default ConsoleSidebar;
