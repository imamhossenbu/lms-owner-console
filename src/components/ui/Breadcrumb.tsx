"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/cn";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbProps {
  /** Trail AFTER the home icon, e.g. [{ label: "Courses", href: "/courses" }, { label: "Create Course" }]. */
  items: BreadcrumbItem[];
  /** Prepends the home icon linking to the dashboard (default true). */
  showHome?: boolean;
  className?: string;
}

const HOME_ITEM: BreadcrumbItem = { label: "Dashboard", href: "/", icon: <Home className="h-4 w-4" /> };

/** Normalises legacy callers that still pass their own "Home"/"Dashboard" first item. */
const isHomeItem = (item: BreadcrumbItem) => item.href === "/" && /^(home|dashboard|)$/i.test(item.label.trim());

/**
 * App-wide breadcrumb: 🏠 › Section › Page. The last item is the current page (not a link).
 * Use it at the top of every page header — don't build ad-hoc breadcrumbs.
 */
export function Breadcrumb({ items, showHome = true, className }: BreadcrumbProps) {
  const trail = showHome ? [HOME_ITEM, ...items.filter((item, i) => !(i === 0 && isHomeItem(item)))] : items;

  return (
    <motion.nav
      aria-label="Breadcrumb"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn("min-w-0", className)}
    >
      <ol className="flex min-w-0 flex-wrap items-center gap-1.5">
        {trail.map((item, index) => {
          const isLast = index === trail.length - 1;
          const isHome = showHome && index === 0;

          return (
            <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  aria-label={isHome ? item.label : undefined}
                  className="group flex min-w-0 items-center gap-1.5 rounded-md body-sm-regular text-primary-300 transition-colors hover:text-brand-orange"
                >
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  {!isHome && <span className="truncate max-w-48">{item.label}</span>}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined} className="flex min-w-0 items-center gap-1.5 body-sm-medium text-primary-500">
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  {!isHome && <span className="truncate max-w-64">{item.label}</span>}
                </span>
              )}
              {!isLast && <ChevronRight aria-hidden className="h-3.5 w-3.5 shrink-0 text-primary-300" />}
            </li>
          );
        })}
      </ol>
    </motion.nav>
  );
}

export default Breadcrumb;
