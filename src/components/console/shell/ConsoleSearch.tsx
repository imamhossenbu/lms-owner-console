"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeft, Search } from "lucide-react";
import { useSaasStore } from "@/lib/planAccess";
import { cn } from "@/lib/cn";
import { InstitutionAvatar } from "../shared/InstitutionAvatar";
import { SubscriptionStatusBadge } from "../shared/ConsoleBadges";
import { tenantHost } from "../shared/consoleMeta";
import { CONSOLE_NAV } from "./consoleNav";

type Result =
  | { kind: "page"; key: string; label: string; href: string; icon: React.ComponentType<{ className?: string }> }
  | { kind: "institution"; key: string; href: string; inst: ReturnType<typeof useSaasStore>["institutions"][number] };

/** Navbar search (command palette-lite): institutions by name / slug / domain / owner, plus console pages. ⌘K / Ctrl+K focuses. */
export function ConsoleSearch() {
  const router = useRouter();
  const store = useSaasStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();
    const pages = CONSOLE_NAV.flatMap((s) => s.items)
      .filter((p) => !q || p.label.toLowerCase().includes(q))
      .map<Result>((p) => ({ kind: "page", key: p.href, label: p.label, href: p.href, icon: p.icon }));
    const insts = store.institutions
      .filter((i) => !q || [i.name, i.slug, i.ownerName, i.ownerEmail, i.customDomain?.domain ?? ""].some((v) => v.toLowerCase().includes(q)))
      .slice(0, q ? 6 : 4)
      .map<Result>((i) => ({ kind: "institution", key: i.id, href: `/institutions/${i.id}`, inst: i }));
    return q ? [...insts, ...pages.slice(0, 3)] : [...insts, ...pages.slice(0, 4)];
  }, [query, store.institutions]);

  const go = (r: Result | undefined) => {
    if (!r) return;
    router.push(r.href);
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
  };

  return (
    <div ref={wrapRef} className="relative w-64 md:w-96">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-300" />
      <input
        ref={inputRef}
        type="search"
        role="combobox"
        aria-expanded={open}
        aria-controls="console-search-results"
        aria-label="Search institutions and console pages"
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(a + 1, results.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, 0));
          } else if (e.key === "Enter") {
            e.preventDefault();
            go(results[active]);
          } else if (e.key === "Escape") {
            setOpen(false);
            inputRef.current?.blur();
          }
        }}
        placeholder="Search institutions, domains, owners..."
        className="h-10 w-full rounded-xl border border-dash bg-gray-bg/60 pl-10 pr-12 body-sm-regular text-primary-500 transition-all placeholder:text-primary-300 focus:border-brand-orange focus:bg-white focus:outline-none"
      />
      <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-dash bg-white px-1.5 py-0.5 body-2xsm-regular text-primary-300 shadow-2xs">⌘ K</kbd>

      <AnimatePresence>
        {open && (
          <motion.div
            id="console-search-results"
            role="listbox"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-xl border border-dash bg-white py-1.5 shadow-xl"
          >
            {results.length === 0 ? (
              <p className="px-4 py-6 text-center body-sm-regular text-primary-300">No institutions or pages match “{query}”.</p>
            ) : (
              <>
                {results.some((r) => r.kind === "institution") && <p className="px-4 pb-1 pt-1.5 body-2xsm-regular uppercase tracking-wider text-primary-300">Institutions</p>}
                {results.map((r, idx) => {
                  const first = r.kind === "page" && results[idx - 1]?.kind !== "page";
                  return (
                    <React.Fragment key={r.key}>
                      {first && <p className="px-4 pb-1 pt-2 body-2xsm-regular uppercase tracking-wider text-primary-300">Pages</p>}
                      <button
                        type="button"
                        role="option"
                        aria-selected={idx === active}
                        onMouseEnter={() => setActive(idx)}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => go(r)}
                        className={cn("flex w-full cursor-pointer items-center gap-3 px-4 py-2 text-left transition-colors", idx === active ? "bg-slate-50" : "bg-white")}
                      >
                        {r.kind === "institution" ? (
                          <>
                            <InstitutionAvatar initials={r.inst.logoInitials} tone={r.inst.tone} size="sm" />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate body-sm-medium text-primary-500">{r.inst.name}</span>
                              <span className="block truncate body-2xsm-regular text-primary-300">{r.inst.customDomain?.domain ?? tenantHost(r.inst.slug)}</span>
                            </span>
                            <SubscriptionStatusBadge status={r.inst.subscription.status} />
                          </>
                        ) : (
                          <>
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-bg text-primary-400">
                              <r.icon className="h-4 w-4" />
                            </span>
                            <span className="flex-1 truncate body-sm-medium text-primary-500">{r.label}</span>
                          </>
                        )}
                        {idx === active && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-primary-300" />}
                      </button>
                    </React.Fragment>
                  );
                })}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ConsoleSearch;
